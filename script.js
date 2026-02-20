document.addEventListener('DOMContentLoaded', () => {
    // --- 가게 입장 수동 인트로 ---
    const introOverlay = document.getElementById('intro-overlay');
    const introBtn = document.getElementById('intro-btn');
    if (introOverlay && introBtn) {
        introBtn.addEventListener('click', () => {
            introOverlay.classList.add('fade-out');
            // CSS 트랜지션 완료 후 DOM에서 완전히 제거
            setTimeout(() => {
                introOverlay.remove();
            }, 1500);
        });
    }

    // --- 누적 방문자 수 플립클락 구현 ---
    const visitorCountEl = document.getElementById('visitor-flip-clock');
    if (visitorCountEl) {
        let currentVisits = parseInt(localStorage.getItem('miracle_visits') || '14235', 10);
        currentVisits += 1;
        localStorage.setItem('miracle_visits', currentVisits);
        
        function updateFlipClock(number) {
            const numStr = number.toLocaleString(); // e.g., "14,236"
            visitorCountEl.innerHTML = '';
            for (let char of numStr) {
                const el = document.createElement('div');
                if (char === ',') {
                    el.className = 'flip-comma';
                    el.innerText = ',';
                } else {
                    el.className = 'flip-digit';
                    el.innerText = char;
                }
                visitorCountEl.appendChild(el);
            }
        }
        
        updateFlipClock(currentVisits);
        
        // 머무는 동안 무작위로 실시간 증가하는 효과 연출 (명당 느낌)
        setInterval(() => {
            if (Math.random() > 0.6) {
                currentVisits += Math.floor(Math.random() * 3) + 1;
                localStorage.setItem('miracle_visits', currentVisits);
                updateFlipClock(currentVisits);
            }
        }, 4000);
    }

    const generateBtn = document.getElementById('generate-btn');
    const machineContainer = document.getElementById('lotto-machine');
    const gameCountSelect = document.getElementById('game-count');
    const includeBonusCheckbox = document.getElementById('include-bonus');

    generateBtn.addEventListener('click', () => {
        const gameCount = parseInt(gameCountSelect.value, 10);
        const includeBonus = includeBonusCheckbox.checked;
        const totalNumbersNeeded = includeBonus ? 7 : 6;
        
        generateBtn.disabled = true;
        generateBtn.innerText = "번호 섞는 중...";
        machineContainer.innerHTML = '';
        
        let gamesCompleted = 0;
        
        // 기계 애니메이션 토글 
        const machineGlass = document.getElementById('machine-glass');
        const machineHole = document.querySelector('.machine-hole');
        if (machineGlass) machineGlass.classList.add('mixing');

        // 흔들리는 애니메이션을 1.5초 정도 보여준 뒤 실제 추첨 시작
        setTimeout(() => {
            if (machineGlass) machineGlass.classList.remove('mixing');
            generateBtn.innerText = "추첨 중...";
            
            for (let g = 0; g < gameCount; g++) {
                const row = document.createElement('div');
                row.className = 'balls-container';
                row.id = `game-${g}`;
                machineContainer.appendChild(row);

                const lottoNumbers = generateLottoNumbers(totalNumbersNeeded);
                
                lottoNumbers.forEach((number, index) => {
                    const spawnDelay = (g * 1200) + (index * 300); // 딜레이를 약간 더 길게 주어 뽑히는 느낌 강화
                    
                    setTimeout(() => {
                        // 통에서 구슬 빠져나오기 애니메이션 트리거
                        if (machineHole) {
                            machineHole.classList.remove('spawning');
                            void machineHole.offsetWidth; // reflow
                            machineHole.classList.add('spawning');
                        }

                        const ball = document.createElement('div');
                        
                        // 마지막 공이면서 보너스 볼 설정이 켜져있을 경우 특별 색상+애니메이션 (보너스볼 표기)
                        if (includeBonus && index === 6) {
                            const plusSign = document.createElement('div');
                            plusSign.innerText = '+';
                            plusSign.style.fontSize = '2rem';
                            plusSign.style.fontWeight = 'bold';
                            plusSign.style.color = '#fbbf24'; // var(--accent)
                            plusSign.style.display = 'flex';
                            plusSign.style.alignItems = 'center';
                            plusSign.style.margin = '0 5px';
                            plusSign.style.opacity = '0';
                            plusSign.style.animation = 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                            row.appendChild(plusSign);

                            ball.className = `ball ${getColorClass(number)}`;
                            ball.style.border = '2px solid #fff'; // 보너스 표시
                            ball.innerText = number;
                        } else {
                            ball.className = `ball ${getColorClass(number)}`;
                            ball.innerText = number;
                        }

                        row.appendChild(ball);

                        // 모든 게임의 모든 공이 렌더링 된 후 버튼 복구
                        if (index === lottoNumbers.length - 1) {
                            gamesCompleted++;
                            if (gamesCompleted === gameCount) {
                                setTimeout(() => {
                                    generateBtn.disabled = false;
                                    generateBtn.innerText = "기적의 번호 다시 뽑기";
                                }, 800);
                            }
                        }
                    }, spawnDelay); 
                });
            }
        }, 1500); // 1.5초간 구슬 섞임
    });

    // 지정 갯수(6개 or 7개)만큼의 중복 없는 난수 추출 (1~1210회차 baseStats 가중치 랜덤 로직)
    function generateLottoNumbers(count) {
        const numbers = [];
        const chosenSet = new Set();
        
        // baseStats 데이터 확인
        let freqs = [];
        if (window.baseStats && window.baseStats.length === 45) {
            freqs = window.baseStats;
        } else {
            // fallback (모든 번호 동일 가중치)
            freqs = Array(45).fill(100);
        }

        // 각 번호의 확률 가중치 계산 (빈도수에 제곱을 적용해 고빈도 번호가 조금 더 유리하게 만듦)
        // Set을 사용하여 중복 방지
        while(numbers.length < count) {
            // 현재 뽑히지 않은 번호들의 가중치만 계산
            let validWeights = [];
            let validIndices = [];
            let totalWeight = 0;
            
            for (let i = 0; i < 45; i++) {
                if (!chosenSet.has(i + 1)) {
                    let w = Math.pow(freqs[i], 1.5); // 가중치 강화
                    validWeights.push(w);
                    validIndices.push(i + 1);
                    totalWeight += w;
                }
            }
            
            let random = Math.random() * totalWeight;
            let sum = 0;
            let selectedNum = validIndices[0];
            
            for (let j = 0; j < validWeights.length; j++) {
                sum += validWeights[j];
                if (random <= sum) {
                    selectedNum = validIndices[j];
                    break;
                }
            }
            numbers.push(selectedNum);
            chosenSet.add(selectedNum);
        }
        
        // 일반 6개 번호는 정렬, 7번째 보너스 번호가 있다면 정렬하지 않고 마지막에 둠
        if (count === 7) {
            const mainNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
            const bonusNumber = numbers[6];
            return [...mainNumbers, bonusNumber];
        } else {
            return numbers.sort((a, b) => a - b);
        }
    }

    function getColorClass(number) {
        if (number >= 1 && number <= 10) return 'color-yellow';
        if (number >= 11 && number <= 20) return 'color-blue';
        if (number >= 21 && number <= 30) return 'color-red';
        if (number >= 31 && number <= 40) return 'color-gray';
        if (number >= 41 && number <= 45) return 'color-green';
        return '';
    }

    // --- 기적의 기록들 (구글 시트 연동) ---
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVJIdMLuyo-7uKY_OwX-cONcLrHOp4HhW9nPGKjGCue2hgNRjA3ipM3TdUJB6TViGQy5pJ8VZBvWAg/pub?output=csv';
    const miracleListEl = document.getElementById('miracle-list');

    fetchMiracles();

    function fetchMiracles() {
        fetch(SHEET_CSV_URL)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text();
            })
            .then(csvText => {
                parseCSVAndRender(csvText);
            })
            .catch(error => {
                console.error("Fetch error:", error);
                miracleListEl.innerHTML = '<div class="empty-message">첫 번째 기적의 주인공을 기다립니다</div>';
            });
    }

    function parseCSVAndRender(csv) {
        // 줄바꿈으로 분리. 엑셀에서 생성된 CSV는 \r\n, \n 등이 섞여있을 수 있음
        const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
        
        // 데이터가 헤더(1줄)만 있거나 아예 없는 경우 Mock(예시) 노출
        if (lines.length <= 1) {
            miracleListEl.innerHTML = ''; // 비우고 가짜 데이터 삽입
            const mockData = [
                { round: "1105", rank: "1등", count: "1" },
                { round: "1104", rank: "3등", count: "12" },
                { round: "1098", rank: "1등", count: "1" },
                { round: "1091", rank: "2등", count: "3" },
                { round: "1085", rank: "1등", count: "2" }
            ];
            
            mockData.forEach(item => {
                const headerText = `${item.round}회차 ${item.rank}`;
                const content = `${item.count}명 당첨!`;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'miracle-item';
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'miracle-item-header';
                
                const dateSpan = document.createElement('span');
                dateSpan.className = 'miracle-date';
                dateSpan.innerText = headerText;
                
                headerDiv.appendChild(dateSpan);
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'miracle-content';
                contentDiv.innerText = content;

                itemDiv.appendChild(headerDiv);
                itemDiv.appendChild(contentDiv);
                
                miracleListEl.appendChild(itemDiv);
            });
            return;
        }

        // 헤더 제외하고 데이터 행 추출 후 최신순으로 뒤집기
        const dataRows = lines.slice(1).reverse().slice(0, 5); // 최근 5개만

        if (dataRows.length === 0) {
            miracleListEl.innerHTML = '<div class="empty-message">첫 번째 기적의 주인공을 기다립니다</div>';
            return;
        }

        miracleListEl.innerHTML = ''; // 로딩 메시지 삭제

        dataRows.forEach(rowStr => {
            // 단순 콤마 분리
            const cols = rowStr.split(',');
            
            // CSV 헤더: 당첨자(무시), 당첨 회차, 등 수, 배출자 수 등
            const round = cols[1] ? cols[1].trim() : '';
            const rank = cols[2] ? cols[2].trim() : '';
            const count = cols[3] ? cols[3].trim() : '1'; 
            
            const headerText = round && rank ? `${round}회차 ${rank}` : '기적의 순간';
            // 이름 삭제
            const content = `${count}명 당첨!`;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'miracle-item';
            
            const headerDiv = document.createElement('div');
            headerDiv.className = 'miracle-item-header';
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'miracle-date';
            dateSpan.innerText = headerText;
            
            headerDiv.appendChild(dateSpan);
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'miracle-content';
            contentDiv.innerText = content;

            itemDiv.appendChild(headerDiv);
            itemDiv.appendChild(contentDiv);
            
            miracleListEl.appendChild(itemDiv);
        });
    }
});
