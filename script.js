document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const machineContainer = document.getElementById('lotto-machine');
    const gameCountSelect = document.getElementById('game-count');
    const includeBonusCheckbox = document.getElementById('include-bonus');

    generateBtn.addEventListener('click', () => {
        const gameCount = parseInt(gameCountSelect.value, 10);
        const includeBonus = includeBonusCheckbox.checked;
        const totalNumbersNeeded = includeBonus ? 7 : 6;
        
        generateBtn.disabled = true;
        generateBtn.innerText = "추첨 중...";
        machineContainer.innerHTML = '';
        
        let gamesCompleted = 0;

        for (let g = 0; g < gameCount; g++) {
            const row = document.createElement('div');
            row.className = 'balls-container';
            row.id = `game-${g}`;
            machineContainer.appendChild(row);

            const lottoNumbers = generateLottoNumbers(totalNumbersNeeded);
            
            lottoNumbers.forEach((number, index) => {
                setTimeout(() => {
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
                                generateBtn.innerText = "다시 추첨하기";
                            }, 500);
                        }
                    }
                }, (g * 800) + (index * 150)); 
                // 게임 간 0.8초 딜레이, 공 간 0.15초 딜레이
            });
        }
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
});
