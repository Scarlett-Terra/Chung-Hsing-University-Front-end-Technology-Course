// --- 1. 仙女棒星星特效 ---
const canvas = document.getElementById('sparkleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
window.addEventListener('mousemove', (e) => {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: e.clientX,
            y: e.clientY,
            size: Math.random() * 3 + 1,
            spX: (Math.random() - 0.5) * 3,
            spY: (Math.random() - 0.5) * 3,
            color: `hsl(${Math.random() * 50 + 40}, 100%, 70%)`, // 亮黃/金黃色
            alpha: 1
        });
    }
});

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.x += p.spX; p.y += p.spY; p.alpha -= 0.02;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.alpha <= 0) particles.splice(i, 1);
    });
    requestAnimationFrame(drawParticles);
}
drawParticles();

// --- 2. 兵役判斷邏輯 ---
const statusImg = document.getElementById('statusImg');
const statusResult = document.getElementById('statusResult');
const historyList = document.getElementById('historyList');
let records = [];

// 3.圖片路徑映射表 (請確保檔案名稱正確)
const imgMap = {
    "active": "./img/active.png",   // 服役中/待召
    "young": "./img/young.png",     // 未到服役年齡
    "retired": "./img/retired.png", // 役畢 / 免服役
    "female": "./img/female.png"    // 女性免服役
};

document.getElementById('addBtn').addEventListener('click', () => {
    const name = document.querySelector('#nameInput').value;
    const year = Number(document.querySelector('#yearInput').value);
    const gender = document.querySelector('#genderSelect').value;
    const currentYear = 2026; // 固定當前年份

    if (!name || !year) return alert("請輸入完整名字與生日年份");

    const age = currentYear - year;
    let status = "";
    let imgKey = "";

    // 4.邏輯判斷
    if (gender === "female") {
        status = "女性免服役";
        imgKey = "female";
    } else {
        if (age < 18) {
            status = "未到服役年齡";
            imgKey = "young";
        } else if (age >= 18 && age <= 26) {
            status = "服役中/待召";
            imgKey = "active";
        } else {
            status = "役畢 / 免服役";
            imgKey = "retired";
        }
    }

    // 5.更新介面與圖片
    statusResult.innerHTML = `<h3>${name} (${age}歲)</h3><p>${status}</p>`;
    statusImg.src = imgMap[imgKey];
    statusImg.style.display = "block";

    // 6.歷史紀錄
    const newRecord = { name, age, status };
    records.unshift(newRecord);
    if (records.length > 6) records.pop();
    updateHistory();
});

function updateHistory() {
    historyList.innerHTML = records.map(r =>
        `<li><strong>${r.name}</strong>: ${r.status}</li>`
    ).join('');
}