document.addEventListener('DOMContentLoaded', () => {
    // --- 가게 입장 수동 인트로 ---
    const introOverlay = document.getElementById('intro-overlay');
    const introBtn = document.getElementById('intro-btn');
    if (introOverlay && introBtn) {
        introBtn.addEventListener('click', () => {
            introOverlay.classList.add('fade-out');
            
            // 점주 인삿말 토글 애니메이션 강제 실행 (원하는 경우)
            // 입장 시 BGM 자동 재생 (사용자의 명시적 클릭에 의해 브라우저 정책 통과)
            // 입장 시 BGM 자동 재생 (사용자의 명시적 클릭에 의해 브라우저 정책 통과)
            if (bgmPlayer && bgmPlayer.paused) {
                bgmPlayer.play().then(() => {
                    const icon = document.getElementById('bgm-icon');
                    const bgmToggle = document.getElementById('bgm-toggle');
                    const radioStatus = document.querySelector('.radio-status');
                    if(icon) {
                        icon.classList.add('playing');
                    }
                    if(bgmToggle) bgmToggle.classList.add('active');
                    if(radioStatus) radioStatus.innerText = 'BGM ON';
                }).catch(err => console.error("BGM Autoplay prevented:", err));
            }
            
            // CSS 트랜지션 완료 후 DOM에서 완전히 제거
            setTimeout(() => {
                introOverlay.remove();
            }, 1500);
        });
    }

    // --- 📻 앰비언스 라디오 (BGM Player) ---
    const bgmToggle = document.getElementById('bgm-toggle');
    const bgmPlayer = document.getElementById('bgm-player');
    const radioStatus = document.querySelector('.radio-status');
    
    if (bgmToggle && bgmPlayer) {
        bgmPlayer.volume = 0.4; // 배경음악 볼륨 조정
        bgmToggle.addEventListener('click', function() {
           const isPlaying = !bgmPlayer.paused;
           const icon = document.getElementById('bgm-icon');
           if (isPlaying) {
               bgmPlayer.pause();
               if (icon) {
                   icon.classList.remove('playing');
               }
               this.classList.remove('active');
               if (radioStatus) radioStatus.innerText = 'BGM OFF';
           } else {
               bgmPlayer.play();
               if (icon) {
                   icon.classList.add('playing');
               }
               this.classList.add('active');
               if (radioStatus) radioStatus.innerText = 'BGM ON';
           }
        });
    }

    // --- ⬅️/➡️ 페이지 슬라이딩 화면 전환 로직 ---
    const goToTreeBtn = document.getElementById('go-to-tree-btn');
    const backToMainBtn = document.getElementById('back-to-main-btn');
    const appWrapper = document.getElementById('app-wrapper');
    const bodyEl = document.body;

    if (goToTreeBtn && backToMainBtn && appWrapper) {
        goToTreeBtn.addEventListener('click', () => {
            appWrapper.classList.add('slide-to-tree');
            bodyEl.classList.add('in-tree-view');
        });

        backToMainBtn.addEventListener('click', () => {
            appWrapper.classList.remove('slide-to-tree');
            bodyEl.classList.remove('in-tree-view');
        });
    }

    // --- 🌳 황금 소원 나무 (전용 화면 처리용) ---
    const wishSubmitBtn = document.getElementById('wish-submit-btn');
    const wishInput = document.getElementById('wish-input');
    const wishTreeBoard = document.getElementById('wish-tree-board');

    // 더미 데이터 초기화
    const dummyWishes = [
        "올해는 꼭 내 집 마련 성공하게 해주세요! 🏠",
        "가족들 모두 건강하고 아프지 않길 기원합니다 🙏",
        "1등 당첨되면 퇴사하고 카페 차릴 거예요 ☕",
        "로또 1등 기원!!! ✨",
        "남편 사업 대박나게 해주세요! 💸",
        "우리가족 코로나 걸리지 않게 해주세요 😷",
        "우리아들 대학 합격하게 해주세요 🎓",
        "올해는 꼭 취업하게 해주세요! 💼",
        "다이어트 성공하게 해주세요 🥗",
        "이번주 1등은 나야나 🥇",
        "강아지랑 평생 행복하게 해주세요 🐶",
        "세계일주 다녀오게 해주세요 ✈️",
        "빚 다 갚고 새출발 하게 해주세요 🌅",
        "딸기 농장 대박나게 해주세요 🍓",
        "우리가족 화목하게 해주세요 👨‍👩‍👧‍👦"
    ];

    if (wishSubmitBtn && wishInput && wishTreeBoard) {
        // 이전 세션이나 더미 데이터를 localStorage를 통해 관리
        const WISH_STORAGE_KEY = 'life_store_wishes';
        let storedWishes = JSON.parse(localStorage.getItem(WISH_STORAGE_KEY)) || dummyWishes;
        
        // 새로 저장했다치고 다시 덮어씀 (더미 보충)
        if(storedWishes.length < dummyWishes.length) {
            storedWishes = dummyWishes;
            localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(storedWishes));
        }

        // 초기 렌더링
        storedWishes.forEach(wish => {
            addWishNoteToBoard(wish, false); 
        });

        wishSubmitBtn.addEventListener('click', handleWishSubmit);
        wishInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleWishSubmit();
        });

        function handleWishSubmit() {
            const text = wishInput.value.trim();
            if (text === '') return;

            addWishNoteToBoard(text, true);
            
            // 로컬 스토리지 업데이트
            storedWishes.push(text);
            localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(storedWishes));

            wishInput.value = '';
        }

        function addWishNoteToBoard(text, animate) {
            const note = document.createElement('div');
            note.className = 'wish-note';
            note.innerText = text;

            // 보드 내 랜덤 위치/각도
            const maxW = wishTreeBoard.clientWidth || window.innerWidth;
            const maxH = wishTreeBoard.clientHeight || (window.innerHeight - 200);
            const randomX = Math.max(0, Math.min(Math.floor(Math.random() * maxW), maxW - 100)); // 100 is note width approx
            const randomY = Math.max(0, Math.min(Math.floor(Math.random() * maxH), maxH - 100));
            const randomRot = Math.floor(Math.random() * 30) - 15; // -15deg to +15deg

            // 위치 지정
            note.style.left = `${randomX}px`;
            note.style.top = `${randomY}px`;
            note.style.transform = `rotate(${randomRot}deg)`;

            if (!animate) {
                // 기존 데이터는 애니메이션 없이 바로 표시
                note.style.animation = 'none';
                note.style.opacity = '1';
            }

            wishTreeBoard.appendChild(note);
        }
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
                { round: "1105", rank: "1등", name: "익명", dream: "가족들과 세계 일주를 호화롭게 다녀왔습니다 ✈️" },
                { round: "1104", rank: "3등", name: "김땡땡", dream: "오래된 빚을 갚고 작은 빵집을 열었어요 🥐" },
                { round: "1098", rank: "1등", name: "행운아", dream: "따뜻한 보육원 기증으로 기적을 나눴습니다 💖" },
                { round: "1091", rank: "2등", name: "익명", dream: "부모님께 예쁜 전원주택을 사드렸어요 🏡" },
                { round: "1085", rank: "1등", name: "미라클", dream: "나만의 작은 갤러리를 오픈하는 꿈을 이룸 🎨" }
            ];
            
            mockData.forEach(item => {
                const headerText = `${item.round}회차 ${item.rank} 당첨 - ${item.name}`;
                const content = `"${item.dream}"`;
                
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
            
            // CSV 헤더 우선순위(추정값): 1:회차, 2:등수, 3:당첨수, 4:닉네임, 5:사연
            const round = cols[1] ? cols[1].trim() : '';
            const rank = cols[2] ? cols[2].trim() : '';
            const name = cols[4] ? cols[4].trim() : '익명';
            const dream = cols[5] ? cols[5].trim() : '당첨의 기쁨으로 인생 잡화점의 기적을 만끽합니다 ✨';
            
            const headerText = round && rank ? `${round}회차 ${rank} 당첨 - ${name}` : '기적의 순간 - 익명';
            const content = `"${dream}"`;

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
