// --- 📡 PC ↔ 모바일 작업 현황 동기화 유틸 ---
const Sync = (() => {
    const POLL_INTERVAL = 10000;
    let pollTimer = null;
    let lastTimestamp = null;

    function isMobile() {
        return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    }

    function getDeviceId() {
        let id = localStorage.getItem('lifemiracle_device_id');
        if (!id) {
            id = 'dev_' + Math.random().toString(36).slice(2, 8);
            localStorage.setItem('lifemiracle_device_id', id);
        }
        return id;
    }

    function getColorClass(number) {
        if (number >= 1 && number <= 10) return 'color-yellow';
        if (number >= 11 && number <= 20) return 'color-blue';
        if (number >= 21 && number <= 30) return 'color-red';
        if (number >= 31 && number <= 40) return 'color-gray';
        if (number >= 41 && number <= 45) return 'color-green';
        return '';
    }

    function timeAgo(ts) {
        if (!ts) return '';
        const diff = Math.floor((Date.now() - ts) / 1000);
        if (diff < 5) return '방금 전';
        if (diff < 60) return `${diff}초 전`;
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        return `${Math.floor(diff / 3600)}시간 전`;
    }

    async function push(games) {
        try {
            await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    games,
                    deviceType: isMobile() ? 'mobile' : 'pc',
                    deviceId: getDeviceId(),
                })
            });
        } catch (_) { /* 서버 없으면 무시 */ }
    }

    async function poll() {
        try {
            const res = await fetch('/api/sync');
            if (!res.ok) return;
            const data = await res.json();
            render(data);
        } catch (_) {
            setStatus('서버에 연결할 수 없습니다');
        }
    }

    function setStatus(text) {
        const el = document.getElementById('sync-status-text');
        if (el) el.textContent = text;
    }

    function render(data) {
        const badgeEl = document.getElementById('sync-device-badge');
        const tsEl = document.getElementById('sync-timestamp');
        const container = document.getElementById('synced-games-container');
        if (!container) return;

        if (!data || !data.games) {
            setStatus('아직 동기화된 번호가 없습니다');
            container.innerHTML = '<div class="loading-message">번호를 추첨하면 자동 동기화됩니다</div>';
            return;
        }

        const myId = getDeviceId();
        const isSelf = data.deviceId === myId;
        const deviceLabel = data.deviceType === 'mobile' ? '📱 모바일' : '💻 PC';

        if (badgeEl) {
            badgeEl.textContent = deviceLabel;
            badgeEl.className = `sync-device-badge ${data.deviceType === 'mobile' ? 'badge-mobile' : 'badge-pc'}`;
        }
        if (tsEl) tsEl.textContent = timeAgo(data.timestamp);
        setStatus(isSelf ? '이 기기에서 생성한 번호' : `다른 기기(${deviceLabel})에서 생성한 번호`);

        if (data.timestamp === lastTimestamp) return;
        lastTimestamp = data.timestamp;

        container.innerHTML = '';
        data.games.forEach((game, idx) => {
            const row = document.createElement('div');
            row.className = 'synced-game-row';

            const label = document.createElement('span');
            label.className = 'synced-game-label';
            label.textContent = String.fromCharCode(65 + idx);
            row.appendChild(label);

            game.numbers.forEach((num, i) => {
                if (game.hasBonus && i === 6) {
                    const plus = document.createElement('span');
                    plus.className = 'synced-plus';
                    plus.textContent = '+';
                    row.appendChild(plus);
                }
                const ball = document.createElement('div');
                ball.className = `synced-ball ${getColorClass(num)}`;
                ball.textContent = num;
                row.appendChild(ball);
            });

            container.appendChild(row);
        });
    }

    function startPolling() {
        poll();
        if (!pollTimer) pollTimer = setInterval(poll, POLL_INTERVAL);
    }

    function stopPolling() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    function setNetworkUrl(url) {
        const el = document.getElementById('sync-network-url');
        if (el) {
            el.textContent = url;
            el.title = '클릭하여 복사';
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                navigator.clipboard.writeText(url).then(() => {
                    el.textContent = '복사됨!';
                    setTimeout(() => { el.textContent = url; }, 1500);
                });
            });
        }
    }

    // 서버에서 네트워크 IP 힌트 가져오기
    async function initNetworkUrl() {
        try {
            // hostname이 IP 또는 localhost이면 그대로 사용, 아니면 현재 origin
            const host = location.hostname;
            const url = `http://${host}:${location.port || 8000}/`;
            setNetworkUrl(url);
        } catch (_) {}
    }

    return { push, poll, startPolling, stopPolling, isMobile, getDeviceId, initNetworkUrl };
})();

document.addEventListener('DOMContentLoaded', () => {
    // --- 가게 입장 수동 인트로 ---
    const introOverlay = document.getElementById('intro-overlay');
    const introBtn = document.getElementById('intro-btn');
    if (introOverlay && introBtn) {
        if (sessionStorage.getItem('intro_seen') === 'true') {
            introOverlay.remove();
        } else {
            introBtn.addEventListener('click', () => {
                sessionStorage.setItem('intro_seen', 'true');
                introOverlay.classList.add('fade-out');
                
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

    // --- ⬅️/➡️ SPA 페이지 수직 슬라이드 전환 로직 (간판 클릭) ---
    const mainSignboard = document.getElementById('main-signboard-trigger');
    const fullSlider = document.getElementById('full-slider');

    const treeSignboard = document.getElementById('tree-signboard-trigger');

    if (mainSignboard && fullSlider) {
        mainSignboard.addEventListener('click', () => {
            document.body.classList.add('in-tree-view');
            fullSlider.classList.add('show-tree');
        });
    }
    
    if (treeSignboard && fullSlider) {
        treeSignboard.addEventListener('click', () => {
            document.body.classList.remove('in-tree-view');
            fullSlider.classList.remove('show-tree');
        });
    }

    // --- 🌳 황금 소원 나무 (전용 화면 처리용 지정 100개 좌표) ---
    const wishSubmitBtn = document.getElementById('wish-submit-btn');
    const wishInput = document.getElementById('wish-input');
    const treeHitbox = document.getElementById('tree-hitbox');

    // 100개의 지정 좌표 배열 (나무 카노피 모양 내부에 한정, % 기반)
    const WISH_COORDS = [];
    function generateWishCoords() {
        let pointsGenerated = 0;
        while(pointsGenerated < 100) {
            // -1 ~ 1 범위 난수
            const x = (Math.random() * 2 - 1);
            const y = (Math.random() * 2 - 1);
            
            // 타원 내부에 존재하면서 상단이 좁아지는 나무 형태 계수
            if ((x*x) + (y*y) <= 1) {
                const heightFactor = (y + 1) / 2; // 상단(0) ~ 하단(1)
                // x폭이 위로 갈수록(상단) 좁아지도록 제한
                if (Math.abs(x) > Math.pow(heightFactor, 0.7) + 0.1) continue;
                
                WISH_COORDS.push({
                    x: 50 + (x * 45), // 5% ~ 95%
                    y: 45 + (y * 45), // 0% ~ 90% (살짝 위쪽 중심)
                    rot: Math.floor(Math.random() * 60) - 30
                });
                pointsGenerated++;
            }
        }
    }
    generateWishCoords();

    // 더미 데이터 초기화
    const dummyWishes = [];

    if (wishSubmitBtn && wishInput && treeHitbox) {
        const WISH_STORAGE_KEY = 'life_store_wishes_v2'; // 기존 캐시 무효화를 위해 키값 변경
        let storedWishes = JSON.parse(localStorage.getItem(WISH_STORAGE_KEY)) || dummyWishes;
        
        // v2 키로 빈 배열부터 시작

        storedWishes.forEach((wish, index) => {
            // 초기 렌더링 시에는 애니메이션 없이 100개 좌표 중 하나에 부착
            addWishNoteToBoard(wish, false, index); 
        });

        wishSubmitBtn.addEventListener('click', handleWishSubmit);
        wishInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // textarea 엔터 전송 방지
                handleWishSubmit();
            }
        });

        function handleWishSubmit() {
            const text = wishInput.value.trim();
            if (text === '') return;

            addWishNoteToBoard(text, true, storedWishes.length);
            
            storedWishes.push(text);
            localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(storedWishes));

            wishInput.value = '';
        }

        function addWishNoteToBoard(text, animate, index) {
            const note = document.createElement('div');
            note.className = 'wish-note';
            
            const colors = ['#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#fef3c7', '#ffedd5', '#fed7aa', '#fdba74'];
            note.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            // 100개의 지정 좌표 중 하나를 선택 (index 순환 등)
            const targetCoord = WISH_COORDS[index % 100];

            note.style.left = `${targetCoord.x}%`;
            note.style.top = `${targetCoord.y}%`;
            const finalTransform = `translate(-50%, -50%) rotate(${targetCoord.rot}deg)`;
            note.style.transform = finalTransform;
            note.title = text;

            if (!animate) {
                note.style.opacity = '1';
                treeHitbox.appendChild(note);
            } else {
                note.style.opacity = '0'; // 시작 시 투명
                treeHitbox.appendChild(note);
                
                // 툭 걸리는 모션 (하단에서 튕겨올라와 나뭇가지에 맞고 흔들리며 안착)
                note.animate([
                    { transform: `translate(-50%, 400px) scale(0.2) rotate(-45deg)`, opacity: 0, offset: 0 },
                    { transform: `translate(-50%, -30px) scale(1.1) rotate(${targetCoord.rot + 20}deg)`, opacity: 1, offset: 0.6 },
                    { transform: `translate(-50%, 10px) scale(0.95) rotate(${targetCoord.rot - 15}deg)`, opacity: 1, offset: 0.8 },
                    { transform: finalTransform, opacity: 1, offset: 1 }
                ], {
                    duration: 900,
                    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                    fill: 'forwards'
                });
            }
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

            const generatedGamesData = []; // 동기화를 위해 생성된 번호 수집
            for (let g = 0; g < gameCount; g++) {
                const row = document.createElement('div');
                row.className = 'balls-container';
                row.id = `game-${g}`;
                machineContainer.appendChild(row);

                const lottoNumbers = generateLottoNumbers(totalNumbersNeeded);
                generatedGamesData.push({ numbers: [...lottoNumbers], hasBonus: includeBonus });
                
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

                        // 모든 게임의 모든 공이 렌더링 된 후 버튼 복구 + 동기화 push
                        if (index === lottoNumbers.length - 1) {
                            gamesCompleted++;
                            if (gamesCompleted === gameCount) {
                                setTimeout(() => {
                                    generateBtn.disabled = false;
                                    generateBtn.innerText = "기적의 번호 다시 뽑기";
                                    Sync.push(generatedGamesData);
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

    // --- 📡 작업 현황 동기화 패널 초기화 ---
    const syncDetails = document.getElementById('sync-details');
    const syncRefreshBtn = document.getElementById('sync-refresh-btn');

    // 패널 열릴 때 즉시 폴링 시작, 닫히면 중지
    if (syncDetails) {
        syncDetails.addEventListener('toggle', () => {
            if (syncDetails.open) {
                Sync.startPolling();
            } else {
                Sync.stopPolling();
            }
        });
    }

    if (syncRefreshBtn) {
        syncRefreshBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            Sync.poll();
        });
    }

    // 네트워크 URL 힌트 표시
    Sync.initNetworkUrl();

    // 페이지 로드 시 1회 상태 조회 (패널 닫혀있어도)
    Sync.poll();

});
