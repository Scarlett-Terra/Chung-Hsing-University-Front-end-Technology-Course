// 初始化資料
let dormData = JSON.parse(localStorage.getItem('dormData')) || [];
const maxCap = 50;

// 選取器 (querySelector)
const loginPage = document.querySelector('#login-page');
const adminPage = document.querySelector('#admin-page');
const accInput = document.querySelector('#accInput');
const pwInput = document.querySelector('#pwInput');
const loginBtn = document.querySelector('#loginBtn');
const ul = document.querySelector('#dormitoryUl');

// 1. 即時驗證邏輯
accInput.addEventListener('input', () => {
    const hint = document.querySelector('#accHint');
    if (accInput.value.length < 4) {
        hint.textContent = "❌ 字數不足 4 位";
        accInput.style.borderColor = "red";
    } else {
        hint.textContent = "✅ 符合格式";
        accInput.style.borderColor = "#2ecc71";
    }
});

// 2. 登入邏輯
loginBtn.addEventListener('click', () => {
    if (accInput.value.length >= 4 && pwInput.value.length >= 6) {
        gsap.to(loginPage, {
            opacity: 0, x: -100, duration: 0.6, onComplete: () => {
                loginPage.style.display = 'none';
                adminPage.style.display = 'block';
                gsap.from(adminPage, { opacity: 0, x: 100, duration: 0.6 });
                saveAndRender();
            }
        });
    } else {
        Swal.fire('不可登入', '請確認帳號密碼字數是否正確', 'error');
    }
});

// 3. 狀態循環邏輯 (0:未到, 1:已到, 2:請假)
const statusConfig = [
    { label: '尚未回宿舍', color: 'dot-red' },
    { label: '已到宿舍', color: 'dot-green' },
    { label: '請假中', color: 'dot-blue' }
];

function toggleStatus(index) {
    dormData[index].status = (dormData[index].status + 1) % 3;
    saveAndRender();
}

// 4. 加入名單
document.querySelector('#addBtn').addEventListener('click', () => {
    const name = document.querySelector('#newName').value.trim();
    if (name === "") {
        Swal.fire('提示', '請輸入姓名', 'warning');
        return;
    }
    if (dormData.length >= maxCap) {
        Swal.fire('額滿', '宿舍位置已滿', 'error');
        return;
    }
    dormData.push({ name: name, status: 0 });
    document.querySelector('#newName').value = "";
    saveAndRender();
});

// 5. 渲染與統計
function saveAndRender() {
    localStorage.setItem('dormData', JSON.stringify(dormData));
    ul.innerHTML = "";

    dormData.forEach((staff, i) => {
        const config = statusConfig[staff.status];
        const li = document.createElement('li');
        li.className = "staff-li";
        li.innerHTML = `
            <div onclick="toggleStatus(${i})" style="cursor:pointer">
                <span class="status-dot ${config.color}"></span>
                <strong>${staff.name}</strong> 
                <small style="margin-left:10px; color:#666;">(${config.label})</small>
            </div>
            <button onclick="deleteStaff(${i})" class="wood-btn-sm" style="background:#e17055">刪除</button>
        `;
        ul.appendChild(li);
    });

    // 更新統計 (textContent)
    document.querySelector('#stat-reg').textContent = dormData.length;
    document.querySelector('#stat-in').textContent = dormData.filter(s => s.status === 1).length;
    document.querySelector('#stat-vac').textContent = maxCap - dormData.length;
}

window.deleteStaff = (i) => {
    dormData.splice(i, 1);
    saveAndRender();
};

// 密碼眼睛切換
document.querySelector('#togglePw').addEventListener('click', function () {
    const type = pwInput.getAttribute('type') === 'password' ? 'text' : 'password';
    pwInput.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});
