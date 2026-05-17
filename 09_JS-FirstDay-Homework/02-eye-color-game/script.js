// ==========================================
// A. 選取 DOM 元素 (這就像是設定遙控器按鈕)
// ==========================================
localStorage.clear();

const el = {
    level: document.querySelector('#levelText'),
    time: document.querySelector('#timeText'),
    score: document.querySelector('#scoreText'),
    grid: document.querySelector('#gameGrid'),
    gameP: document.querySelector('#gamePanel'),
    resultP: document.querySelector('#resultPanel'),
    finalS: document.querySelector('#finalScore'),
    finalL: document.querySelector('#finalLevel'),
    rankIm: document.querySelector('#rankImg'),
    restart: document.querySelector('#restartBtn'),
    historyList: document.querySelector('#historyList')
};

// ==========================================
// B. 遊戲狀態與等級設定
// ==========================================
let currentState = {
    currentLV: 1,
    currentScore: 0,
    timeLeft: 60,
    gameInterval: null
};

const rankImgs = [
    { min: 5, max: 15, url: './img/baby.jpg' },
    { min: 16, max: 25, url: './img/dog.jpg' },
    { min: 26, max: 35, url: './img/eago.jpg' },
    { min: 36, max: 45, url: './img/snack.jpg' },
];

// ==========================================
// C. 遊戲核心邏輯 (開始、下一關、點擊、結束)
// ==========================================

function initGame() {
    // 1. 重設資料
    clearInterval(currentState.gameInterval);
    currentState = { currentLV: 1, currentScore: 0, timeLeft: 60, gameInterval: null };

    // 2. 切換畫面
    el.gameP.classList.remove('hidden');
    el.resultP.classList.add('hidden');

    // 3. 初始渲染
    updateStatusBar();
    renderNextLevel();

    // 4. 啟動計時器
    currentState.gameInterval = setInterval(() => {
        currentState.timeLeft--;
        el.time.textContent = currentState.timeLeft;
        if (currentState.timeLeft <= 0) endGame();
    }, 1000);
}

function renderNextLevel() {
    el.grid.innerHTML = "";

    // 決定網格大小
    let gridSize = 10;
    if (currentState.currentLV === 1) gridSize = 4;
    else if (currentState.currentLV === 2) gridSize = 8;
    else if (currentState.currentLV === 3) gridSize = 12;

    el.grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    el.grid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    // 顏色計算
    const hue = Math.random() * 360;
    const sat = Math.random() * 20 + 70;
    const baseColor = `hsl(${hue}, ${sat}%, 50%)`;
    const diffL = Math.max(2, 20 - currentState.currentLV * 0.5);
    const diffColor = `hsl(${hue}, ${sat}%, ${50 + diffL}%)`;

    const totalBlocks = gridSize * gridSize;
    const specialIndex = Math.floor(Math.random() * totalBlocks);

    for (let i = 0; i < totalBlocks; i++) {
        const block = document.createElement('div');
        block.classList.add('color-block');
        block.style.background = (i === specialIndex) ? diffColor : baseColor;

        if (i === specialIndex) {
            block.addEventListener('click', handleCorrectClick);
        } else {
            block.addEventListener('click', () => { currentState.timeLeft -= 3; });
        }
        el.grid.appendChild(block);
    }
}

function handleCorrectClick() {
    currentState.currentLV++;
    currentState.currentScore += currentState.currentLV * 10;
    updateStatusBar();
    renderNextLevel();
}

function updateStatusBar() {
    el.level.textContent = currentState.currentLV;
    el.score.textContent = currentState.currentScore;
}

// 結束遊戲：這裡負責「關掉遊戲」並「叫存檔功能去工作」
function endGame() {
    clearInterval(currentState.gameInterval);
    el.gameP.classList.add('hidden');
    el.resultP.classList.remove('hidden');

    el.finalS.textContent = currentState.currentScore;
    el.finalL.textContent = currentState.currentLV;

    const rankInfo = rankImgs.find(r => currentState.currentLV >= r.min && currentState.currentLV <= r.max);
    el.rankIm.src = rankInfo ? rankInfo.url : "";

    // ⭐ 呼叫存檔功能
    saveToHistory(currentState.currentScore, currentState.currentLV, rankInfo);
}

// ==========================================
// D. 歷史紀錄系統 (這是獨立的保險箱區)
// ==========================================

function saveToHistory(score, lv, rankInfo) {
    // 1. 讀取資料 (只宣告一次 let)
    let history = JSON.parse(localStorage.getItem('colorGameHistory'));

    // 2. 檢查：如果拿出來的不是陣列，就給它空陣列
    if (!Array.isArray(history)) {
        history = [];
    }

    // 3. 準備新資料 (這要在 if 外面，確保每次都會執行)
    const newRecord = {
        date: new Date().toLocaleString(),
        score: score,
        lv: lv,
        rankName: getRankName(lv),
        rankUrl: rankInfo ? rankInfo.url : "https://via.placeholder.com/40"
    };

    // 4. 存入並限制 8 筆
    history.unshift(newRecord);
    if (history.length > 8) {
        history = history.slice(0, 8);
    }

    // 5. 寫回保險箱
    localStorage.setItem('colorGameHistory', JSON.stringify(history));

    // 6. 重新畫出清單
    renderHistory();
}

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('colorGameHistory')) || [];
        if (!el.historyList) return;

        el.historyList.innerHTML = history.map(item => `
        <li class="history-item">
            <img src="${item.rankUrl}" class="history-thumb">
            <div class="history-info">
                <p><strong>${item.rankName}</strong> (${item.date})</p>
                <span>Score: ${item.score} | LV: ${item.lv}</span>
            </div>
        </li>
    `).join('');
    }

    function getRankName(lv) {
        if (lv >= 5 && lv <= 15) return "嬰兒";
        if (lv >= 16 && lv <= 25) return "狗狗";
        if (lv >= 26 && lv <= 35) return "老鷹";
        if (lv >= 36 && lv <= 45) return "眼鏡蛇";
        return "挑戰者";
    }

    // ==========================================
    // E. 啟動區
    // ==========================================
    el.restart.addEventListener('click', initGame);
    initGame();      // 第一次進網頁自動開始
    renderHistory(); // 第一次進網頁顯示歷史紀錄