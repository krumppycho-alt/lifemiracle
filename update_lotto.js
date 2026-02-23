const https = require('https');
const fs = require('fs');
const path = require('path');

const START_DATE = new Date('2002-12-07T20:45:00+09:00');
const NOW = new Date();
const msPerWeek = 7 * 24 * 60 * 60 * 1000;
const currentDraw = Math.floor((NOW - START_DATE) / msPerWeek) + 1;

console.log(`Calculating up to draw no: ${currentDraw}`);

const frequencies = Array(46).fill(0); // 1-45
const weights = Array(46).fill(0);

const fetchDraw = async (drawNo) => {
    try {
        const response = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drawNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) return null;
        const json = await response.json();
        if (json.returnValue === 'success') {
            return json;
        }
        return null;
    } catch (e) {
        return null;
    }
};

async function main() {
    let recentDrawData = null;
    let actualLatestDraw = 0;
    
    // Test the calculated latest draw to see if it actually exists yet, if not go backward
    for (let draw = currentDraw; draw >= currentDraw - 5; draw--) {
        const data = await fetchDraw(draw);
        if (data && data.returnValue === 'success') {
            actualLatestDraw = draw;
            recentDrawData = data;
            break;
        }
    }
    
    if (actualLatestDraw === 0) {
        console.error("Failed to find latest draw.");
        actualLatestDraw = 1100; // fallback roughly
    }
    
    console.log(`Actual latest draw identified: ${actualLatestDraw}`);
    
    let activeRequests = 0;
    const maxConcurrency = 5; // 방화벽 차단 피하기 위해 낮춤
    let index = 1;
    let completed = 0;

    const processDraw = (json) => {
        if (!json) return;
        [json.drwtNo1, json.drwtNo2, json.drwtNo3, json.drwtNo4, json.drwtNo5, json.drwtNo6, json.bnusNo].forEach(no => {
            if (no >= 1 && no <= 45) {
                frequencies[no]++;
            }
        });
    };

    return new Promise((resolve) => {
        const next = () => {
            if (completed >= actualLatestDraw) {
                resolve();
                return;
            }
            while (activeRequests < maxConcurrency && index <= actualLatestDraw) {
                activeRequests++;
                let i = index++;
                fetchDraw(i).then(json => {
                    processDraw(json);
                    activeRequests--;
                    completed++;
                    if (completed % 50 === 0) {
                        console.log(`Fetched ${completed} draws...`);
                    }
                    setTimeout(next, 50); // 약간의 딜레이
                });
            }
        };
        next();
    }).then(() => {
        // Calculate weights based on frequencies
        let maxFreq = Math.max(...frequencies.slice(1));
        let minFreq = Math.min(...frequencies.slice(1));
        let totalFreq = 0;
        
        for (let i = 1; i <= 45; i++) {
            totalFreq += frequencies[i];
        }
        
        // Generate JS file
        const jsObj = {
            latestDraw: actualLatestDraw,
            latestDate: recentDrawData ? recentDrawData.drwNoDate : '',
            frequencies: frequencies.slice(1) // 1 to 45 array
        };
        
        const jsFileContent = `window.LOTTO_DATA = ${JSON.stringify(jsObj, null, 2)};`;
        fs.writeFileSync(path.join(__dirname, 'lotto_data.js'), jsFileContent, 'utf-8');
        console.log(`Successfully generated lotto_data.js for ${actualLatestDraw} draws.`);
    });
}

main().catch(console.error);
