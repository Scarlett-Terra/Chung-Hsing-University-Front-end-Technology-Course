// 1. 商品來源資料 (老師預設)
const products = [
    { id: 1, name: "經典手沖拿鐵", price: 120, weight: "350ml", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&h=200&auto=format&fit=crop" },
    { id: 2, name: "靜岡厚抹茶", price: 150, weight: "300ml", img: "https://matcha.tw/wp-content/uploads/20251030131214_0_ace91c.jpg" },
    { id: 3, name: "蔓越莓手工餅乾", price: 80, weight: "150g", img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&h=200&auto=format&fit=crop" },
    { id: 4, name: "伯爵茶香蛋糕", price: 180, weight: "200g", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300&h=200&auto=format&fit=crop" },
    { id: 5, name: "香帥蛋糕", price: 490, weight: "380g", img: "https://i4.momoshop.com.tw/1693072446/goodsimg/0008/893/594/8893594_B.webp" },
    { id: 6, name: "芋泥捲", price: 300, weight: "500g", img: "https://lizzzstyle.tw/wp-content/uploads/2024/12/InCollage_20241213_143103228.jpg" },
    { id: 7, name: "冰濃萃義式厚那堤", price: 180, weight: "500ml", img: "https://www.starbucks.com.tw/common/objects/images/product/20251208120332442.jpg" },
    { id: 8, name: "霸氣楊梅", price: 100, weight: "700ml", img: "https://img.alicdn.com/i4/644216784/O1CN014cWrc51zz7W7I57ja_!!644216784.jpg" },
    { id: 9, name: "金佶檸檬", price: 180, weight: "300ml", img: "https://img.alicdn.com/bao/uploaded/O1CN01vNe8sB1YmIucvqNhF_!!6000000003101-0-yinhe.jpg" },
    { id: 10, name: "咖啡核桃司康脆脆", price: 80, weight: "50g", img: "https://img.pchome.com.tw/cs/items/DBAC2VA900JI1UG/l000002_1764311749.jpg" }
];

// 2. 深色模式切換
document.querySelector('#theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('#theme-toggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

// 2. 初始化資料
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let recentViews = JSON.parse(localStorage.getItem('recentViews')) || [];

// 3. 渲染商品 function (需求 6, 9, 10)
function renderProducts(targetList, containerId) {
    const container = document.querySelector(containerId);
    container.innerHTML = "";

    if (targetList.length === 0) {
        container.innerHTML = `<p class="empty-msg">目前尚無紀錄</p>`;
        return;
    }

    targetList.forEach(p => {
        const div = document.createElement('div');
        div.className = "product-card wood-box";
        div.innerHTML = `
            <div class="img-wrapper" style="position:relative">
                <img src="${p.img}" class="product-img" onclick="addToRecent(${p.id})">
                <div class="add-badge" onclick="addToCart(${p.id})"><i class="fa-solid fa-plus"></i></div>
            </div>
            <h5>${p.name}</h5>
            <small>${p.weight}</small>
            <p><strong>$${p.price}</strong></p>
        `;
        container.appendChild(div);
    });
}
// 4. 加入購物車邏輯 (需求 3, 11)
window.addToCart = (id) => {
    const item = products.find(p => p.id === id);
    const inCart = cart.find(c => c.id === id);

    if (inCart) {
        inCart.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    Swal.fire({ title: '已加入', text: `已將 ${item.name} 加入購物車`, icon: 'success', toast: true, position: 'top-end', timer: 2000 });
};

// 5. 更新購物車 UI (需求 11-2, 12)
function updateCartUI() {
    // 儲存到本地
    localStorage.setItem('cart', JSON.stringify(cart));

    // 定義總數量（重要：這是你原本代碼漏掉的）
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // 1. 更新導航欄數字 (右上角)
    const cartCountEl = document.querySelector('#cart-count');
    if (cartCountEl) cartCountEl.textContent = totalQty;

    // 2. 更新底部快速結帳條 (電腦版專用)
    const bottomBar = document.querySelector('#desktop-bottom-bar');
    const barQtyEl = document.querySelector('#bar-qty');

    if (bottomBar && barQtyEl) {
        barQtyEl.textContent = totalQty;

        // 如果購物車有東西，顯示底部條；沒東西則隱藏
        if (totalQty > 0) {
            bottomBar.style.display = 'flex';
            gsap.to(bottomBar, { y: 0, opacity: 1, duration: 0.3 });
        } else {
            gsap.to(bottomBar, {
                y: 50, opacity: 0, duration: 0.3, onComplete: () => {
                    bottomBar.style.display = 'none';
                }
            });
        }
    }
}

// 6. 加入最近瀏覽 (需求 9)
window.addToRecent = (id) => {
    const item = products.find(p => p.id === id);
    // 濾掉重複的，只留最新的前 5 筆
    recentViews = [item, ...recentViews.filter(rv => rv.id !== id)].slice(0, 5);
    localStorage.setItem('recentViews', JSON.stringify(recentViews));
    renderProducts(recentViews, '#recentList');
};

// 7. 搜尋篩選功能 (需求 6)
document.querySelector('#searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    renderProducts(filtered, '#promoList');
});

// 8. 頁面初始化
document.addEventListener('DOMContentLoaded', () => {
    // 渲染商品列表（根據你目前的 HTML ID）
    renderProducts(products, '#promoList');
    renderProducts(recentViews, '#recentList');

    // 底部條的結帳按鈕監聽 (新增部分)
    const barBtn = document.querySelector('#bar-checkout-btn');
    if (barBtn) {
        barBtn.addEventListener('click', () => {
            // 點擊底部條，直接觸發導航欄購物車圖示的開關
            const cartTrigger = document.querySelector('.cart-trigger');
            if (cartTrigger) cartTrigger.click();
        });
    }

    // 初始執行一次 UI 更新，確保從 LocalStorage 讀取的資料能顯示出來
    updateCartUI();
});

// 3. GSAP 換頁動畫 (翻頁感)
document.querySelector('#openMemberPage').addEventListener('click', () => {
    const overlay = document.querySelector('#member-overlay');
    overlay.style.display = 'block';
    gsap.fromTo(overlay, { x: '100%', opacity: 0 }, { x: '0%', opacity: 1, duration: 0.6, ease: "power2.out" });
});

// 4. 通知條顯示 (需求 13)
function showToast() {
    const toast = document.querySelector('#top-toast');
    toast.style.display = 'block';
    gsap.fromTo(toast, { y: -50 }, { y: 20, duration: 0.5 });
    setTimeout(() => {
        gsap.to(toast, { y: -50, duration: 0.5, onComplete: () => toast.style.display = 'none' });
    }, 3000);
}

// 5. 搜尋功能 (include)
document.querySelector('#searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    renderProducts(filtered); // 重新渲染畫面
});

document.querySelector('#submitMember').addEventListener('click', () => {
    const name = document.querySelector('#m-name');
    const phone = document.querySelector('#m-phone');
    let isValid = true;

    if (name.value.trim() === "") {
        document.querySelector('#name-err').style.display = "block";
        isValid = false;
    } else {
        document.querySelector('#name-err').style.display = "none";
    }

    // 檢查是否為純數字 (需求 8-2)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone.value)) {
        document.querySelector('#phone-err').style.display = "block";
        isValid = false;
    } else {
        document.querySelector('#phone-err').style.display = "none";
    }

    if (isValid) {
        Swal.fire("成功", "歡迎加入會員！", "success");
        // 執行 GSAP 翻回首頁動畫...
    }
});

// 2. 打開/關閉購物車頁面
document.querySelectorAll('.cart-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
        renderCartItems(); // 先畫出清單
        const overlay = document.querySelector('#cart-overlay');
        overlay.style.display = 'block';
        gsap.fromTo(overlay, { y: '100%' }, { y: '0%', duration: 0.5 });
    });
});

document.querySelector('#closeCart').addEventListener('click', () => {
    gsap.to('#cart-overlay', {
        y: '100%', duration: 0.5, onComplete: () => {
            document.querySelector('#cart-overlay').style.display = 'none';
        }
    });
});

// 3. 渲染購物車內的清單 (forEach 計算)
function renderCartItems() {
    const list = document.querySelector('#cart-items-render-area'); // 修正這裡    
    list.innerHTML = "";
    let total = 0;
    let qty = 0;

    if (cart.length === 0) {
        list.innerHTML = `<p class="empty-msg">購物車空空的，快去選購吧！</p>`;
    }

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        qty += item.qty;

        const row = document.createElement('div');
        row.className = "cart-item-row";
        row.innerHTML = `
            <img src="${item.img}" class="item-thumb">
            <div style="flex:1">
                <h6>${item.name}</h6>
                <p style="font-size:0.8rem">$${item.price}</p>
            </div>
            <div class="qty-control">
                <button onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
            </div>
            <i class="fa-solid fa-trash" onclick="changeQty(${index}, -999)" style="margin-left:10px; color: #e17055; cursor:pointer"></i>
        `;
        list.appendChild(row);
    });

    document.querySelector('#summary-total').textContent = total;
    document.querySelector('#summary-qty').textContent = qty;
}

// 別忘了加上數量增減的 function，不然按鈕會沒反應
window.changeQty = (index, delta) => {
    if (delta === -999) {
        cart.splice(index, 1);
    } else {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) cart.splice(index, 1);
    }
    updateCartUI();
    renderCartItems(); // 重新渲染清單
};

// 4. 最後結帳：點擊「我準備好了」才顯示提示 (需求 13)
document.querySelector('#finalCheckout').addEventListener('click', () => {
    if (cart.length === 0) {
        Swal.fire("空空的", "購物車內還沒有餐點喔", "warning");
        return;
    }

    // 關閉清單並顯示大功告成
    document.querySelector('#closeCart').click();
    showToast(); // 顯示頂部灰色提示條
    cart = []; // 清空購物車
    updateCartUI();
});

document.querySelector('#editAddress').addEventListener('click', async () => {
    const { value: address } = await Swal.fire({
        title: '修改收貨地址',
        input: 'text',
        inputLabel: '請輸入新的配送地址',
        inputValue: document.querySelector('#display-address').textContent,
        showCancelButton: true
    });

    if (address) {
        document.querySelector('#display-address').textContent = address;
        Swal.fire('更新成功', `地址已更換為：${address}`, 'success');
    }
});


// ==========================================
// 墨香書咖 - 會員專區控制邏輯
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. 取得 DOM 元素
    const memberOverlay = document.querySelector("#member-overlay");
    const openMemberPromo = document.querySelector("#openMemberPage"); // 中間活動框
    const navMemberBtn = document.querySelector(".nav-icon .fa-user-plus").parentElement; // 導覽列按鈕
    const closeMemberBtn = document.querySelector("#closeMember");
    const submitMemberBtn = document.querySelector("#submitMember");

    // 欄位與錯誤訊息
    const inputName = document.querySelector("#m-name");
    const inputPhone = document.querySelector("#m-phone");
    const errName = document.querySelector("#name-err");
    const errPhone = document.querySelector("#phone-err");

    // 2. 開啟彈窗函式
    function openMemberModal() {
        // 使用 CSS 控制顯示，如果你想加動畫，未來可以用你引入的 GSAP：gsap.to(memberOverlay, { duration: 0.3, opacity: 1 });
        memberOverlay.style.display = "flex";
    }

    // 3. 關閉彈窗函式
    function closeMemberModal() {
        memberOverlay.style.display = "none";
        // 關閉時順便清空欄位與錯誤訊息
        inputName.value = "";
        inputPhone.value = "";
        errName.style.display = "none";
        errPhone.style.display = "none";
    }

    // 4. 綁定點擊監聽器
    if (navMemberBtn) navMemberBtn.addEventListener("click", openMemberModal);
    if (openMemberPromo) openMemberPromo.addEventListener("click", openMemberModal);
    if (closeMemberBtn) closeMemberBtn.addEventListener("click", closeMemberModal);

    // 5. 表單驗證與送出
    if (submitMemberBtn) {
        submitMemberBtn.addEventListener("click", () => {
            let isPass = true;

            // 驗證姓名
            if (inputName.value.trim() === "") {
                errName.style.display = "block";
                isPass = false;
            } else {
                errName.style.display = "none";
            }

            // 驗證手機 (簡單正規表達式：確認是不是 09 開頭的 10 位數字)
            const phoneRule = /^09\d{8}$/;
            if (!phoneRule.test(inputPhone.value.trim())) {
                errPhone.style.display = "block";
                isPass = false;
            } else {
                errPhone.style.display = "none";
            }

            // 若驗證成功，觸發 SweetAlert2 漂亮彈窗
            if (isPass) {
                Swal.fire({
                    title: '尊享書香登錄成功！',
                    text: `歡迎光臨，墨客 ${inputName.value}。專屬您的 0 元外送優惠已啟動。`,
                    icon: 'success',
                    confirmButtonText: '開始品嚐書香',
                    confirmButtonColor: '#8B5A2B' // 配合木質調的深咖啡色
                }).then(() => {
                    closeMemberModal(); // 按下確認後關閉視窗
                });
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    // DOM 元素取得
    const authOverlay = document.getElementById("auth-overlay");
    const authBox = document.getElementById("authBox");
    const loginTrigger = document.querySelector(".login-trigger"); // 導覽列「登入/註冊」
    const closeAuthBtn = document.getElementById("closeAuth");

    // 切換按鈕
    const goToRegister = document.getElementById("goToRegister");
    const goToLogin = document.getElementById("goToLogin");

    // 表單輸入與按鈕
    const inputEmail = document.getElementById("auth-email");
    const inputName = document.getElementById("auth-name");
    const inputPassword = document.getElementById("auth-password");
    const primaryBtn = document.getElementById("auth-primary-btn");

    // 標題文字
    const authTitle = document.querySelector(".auth-title");
    const authSubtitle = document.querySelector(".auth-subtitle");

    // 目前模式變數：'login' 或 'register'
    let currentMode = 'login';

    // 檢查目前是否已有登入狀態 (網頁重新整理時保持登入)
    checkLoginStatus();

    // 1. 開啟/關閉彈窗
    if (loginTrigger) {
        loginTrigger.addEventListener("click", () => {
            switchMode('login'); // 每次打開預設是登入
            authOverlay.style.display = "flex";
        });
    }
    if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", () => authOverlay.style.display = "none");
    }

    // 2. 表單模式切換 (登入 <-> 註冊)
    goToRegister.addEventListener("click", (e) => {
        e.preventDefault();
        switchMode('register');
    });
    goToLogin.addEventListener("click", (e) => {
        e.preventDefault();
        switchMode('login');
    });

    function switchMode(mode) {
        currentMode = mode;
        clearErrors();
        if (mode === 'login') {
            authBox.classList.remove("auth-mode-register");
            authBox.classList.add("auth-mode-login");
            authTitle.innerText = "墨香書咖 👑 閣下登錄";
            authSubtitle.innerText = "登錄以同步您的書香購物車與專屬禮遇";
            primaryBtn.innerText = "確認登錄";
            // 隱藏名字輸入框 (配合CSS)
            document.querySelector(".register-only").style.display = "none";
            document.querySelector(".login-text-group").style.display = "inline";
            document.querySelector(".register-text-group").style.display = "none";
        } else {
            authBox.classList.remove("auth-mode-login");
            authBox.classList.add("auth-mode-register");
            authTitle.innerText = "尊享書香 🎁 新友註冊";
            authSubtitle.innerText = "只需一分鐘，開啟您的沉浸式餐點體驗";
            primaryBtn.innerText = "確認註冊";
            // 顯示名字輸入框
            document.querySelector(".register-only").style.display = "block";
            document.querySelector(".login-text-group").style.display = "none";
            document.querySelector(".register-text-group").style.display = "inline";
        }
    }

    // 3. 主按鈕點擊事件（判斷是按了登入還是註冊）
    primaryBtn.addEventListener("click", () => {
        const email = inputEmail.value.trim();
        const password = inputPassword.value.trim();
        const name = inputName.value.trim();

        clearErrors();

        if (currentMode === 'register') {
            // ================= 註冊邏輯 =================
            if (!email || !password || !name) {
                Swal.fire('提示', '請填寫所有欄位資訊喔！', 'warning');
                return;
            }

            // 檢查是否註冊過
            const existingUser = localStorage.getItem(`user_${email}`);
            if (existingUser) {
                Swal.fire('註冊失敗', '此信箱已被其他墨客登錄過囉！請直接登入。', 'error');
                switchMode('login'); // 貼心跳轉到登入
                return;
            }

            // 儲存新用戶資料到 localStorage
            const userData = { email, password, name };
            localStorage.setItem(`user_${email}`, JSON.stringify(userData));

            Swal.fire({
                title: '註冊成功！',
                text: `歡迎新墨友 ${name}，已為您自動跳轉登錄畫面。`,
                icon: 'success',
                confirmButtonColor: '#8B5A2B'
            }).then(() => {
                // 4. 註冊成功，自動跳轉登入框，並預填剛剛註冊的 Email
                switchMode('login');
                inputEmail.value = email;
                inputPassword.value = ""; // 讓用戶填密碼確認
            });

        } else {
            // ================= 登入邏輯 =================
            if (!email || !password) {
                Swal.fire('提示', '請輸入信箱與通關密語。', 'warning');
                return;
            }

            // 從 localStorage 抓取資料驗證
            const rawData = localStorage.getItem(`user_${email}`);
            if (!rawData) {
                // 失敗提示原因 1：帳號不存在
                Swal.fire('登錄失敗', '找不到此墨客信箱，請確認是否拼錯，或先註冊新帳號。', 'error');
                return;
            }

            const user = JSON.parse(rawData);
            if (user.password !== password) {
                // 失敗提示原因 2：密碼錯誤
                Swal.fire('登錄失敗', '通關密語（密碼）不正確，請重新輸入。', 'error');
                return;
            }

            // 成功登入！
            localStorage.setItem("currentUser", JSON.stringify(user)); // 記錄目前登入的人

            Swal.fire({
                title: '登錄成功！',
                text: `歡迎回來，${user.name} 書友。`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // 成功回到原本的網頁畫面
            authOverlay.style.display = "none";
            checkLoginStatus(); // 更新導覽列畫面
        }
    });

    // 5. 檢查狀態並渲染導覽列
    function checkLoginStatus() {
        const currentUser = localStorage.getItem("currentUser");
        const loginTextSpan = document.querySelector(".login-trigger .touch");
        const loginIcon = document.querySelector(".login-trigger i");

        if (currentUser) {
            const user = JSON.parse(currentUser);
            // 登入成功後，把導覽列的「登入/註冊」改成使用者的雅稱
            if (loginTextSpan) loginTextSpan.innerText = `${user.name} 書友`;
            if (loginIcon) {
                loginIcon.className = "fa-solid fa-user-check"; // 改成打勾的會員圖標
                loginIcon.style.color = "#D2B48C"; // 給個尊榮的金色調
            }
        }
    }

    function clearErrors() {
        // 清空輸入框提示的小函式
        document.getElementById("auth-email-err").style.display = "none";
    }
});


// ==========================================
// 墨香書咖 - 最近瀏覽紀錄（Footprint）控制中心
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // DOM 元素取得
    const recentOverlay = document.querySelector("#recent-overlay");
    const closeRecentBtn = document.querySelector("#closeRecent");

    // 關鍵：精準抓取導覽列的「最近瀏覽」按鈕 (透過時鐘圖標抓取父元素)
    const navRecentBtn = document.querySelector(".nav-icon .fa-clock-rotate-left").parentElement;

    // 1. 綁定導覽列點擊事件：點擊後打開視窗，並重新渲染最新紀錄
    if (navRecentBtn) {
        navRecentBtn.addEventListener("click", () => {
            renderRecentViews(); // 先渲染
            recentOverlay.style.display = "flex"; // 再打開
        });
    }

    if (closeRecentBtn) {
        closeRecentBtn.addEventListener("click", () => {
            recentOverlay.style.display = "none";
        });
    }

    // 2. 模擬：當用戶點擊任何商品「查看詳情」或「加入購物車」時，觸發此函式
    // 同學之後可以把這個函式，綁定在你的商品卡片點擊事件上！
    window.addtoRecentViews = function (productName, productPrice, productImg) {
        // 先從 localStorage 抓出舊的紀錄，若沒有就建立空陣列
        let currentRecent = JSON.parse(localStorage.getItem("recent_products")) || [];

        const newView = {
            name: productName,
            price: productPrice,
            time: new Date().getTime()
        };

        // 【核心除錯關鍵】：檢查是否已經瀏覽過該商品
        // 如果有，先把它從陣列中刪除（後面再把它加到最前面，代表最新瀏覽）
        currentRecent = currentRecent.filter(item => item.name !== productName);

        // 將最新瀏覽的商品，塞入陣列的最前面 (Unshift)
        currentRecent.unshift(newView);

        // 【上限控制】：最多保留 5 個紀錄，過期的切掉
        if (currentRecent.length > 5) {
            currentRecent = currentRecent.slice(0, 5);
        }

        // 存回 localStorage
        localStorage.setItem("recent_products", JSON.stringify(currentRecent));

        // 立即更新首頁與彈窗的畫面
        renderRecentViews();
    };

    // 3. 核心渲染函式：為什麼之前只能顯示一個？因為需要用迴圈完整包裝
    function renderRecentViews() {
        const homepageRecentList = document.querySelector("#recentList"); // 首頁區塊
        const popupRecentList = document.querySelector("#popupRecentList");   // 彈窗區塊

        // 抓取本地端最新資料
        const recentData = JSON.parse(localStorage.getItem("recent_products")) || [];

        // 判斷如果空空如也
        if (recentData.length === 0) {
            const emptyHtml = `<p class="empty-msg" style="color:#999; text-align:center; width:100%;">目前尚無紀錄，四處品嚐看看吧 🍂</p>`;
            if (homepageRecentList) homepageRecentList.innerHTML = emptyHtml;
            if (popupRecentList) popupRecentList.innerHTML = emptyHtml;
            return;
        }

        // 【核心除錯關鍵】：用一個字串累積迴圈內容，再一起 render，才不會互相覆蓋！
        let htmlString = "";

        recentData.forEach(item => {
            htmlString += `
                <div class="recent-item-card" style="
                    background: #FAFAFA; 
                    border: 1px solid #E0E0E0; 
                    padding: 15px; 
                    border-radius: 8px; 
                    min-width: 160px; 
                    margin-right: 15px;
                    text-align: left;
                    display: inline-block;
                ">
                    <div style="font-size: 1.2rem; margin-bottom: 8px;">☕</div>
                    <div class="recent-name" style="font-weight:600; font-size:0.95rem; color:#333;">${item.name}</div>
                    <div class="recent-price" style="color:#8B5A2B; font-size:0.85rem; margin-top:5px;">$${item.price}</div>
                </div>
            `;
        });

        // 完美同步渲染到「首頁大版面」與「導覽列彈窗」
        if (homepageRecentList) homepageRecentList.innerHTML = htmlString;
        if (popupRecentList) popupRecentList.innerHTML = htmlString;
    }

    // 網頁初始化時，自動載入一次
    renderRecentViews();

    // 🧪 老師的測試小彩蛋：在主畫面上動態模擬點擊，看看是不是真的能累加！
    // 你可以在控制台執行這行，或者多點幾次： addtoRecentViews("曼特寧手工慢濾", 150);
});


// 假設這是點擊「我準備好了！(最終結帳)」按鈕的事件
const finalCheckoutBtn = document.querySelector("#finalCheckout");
const cartOverlay = document.querySelector("#cart-overlay");

if (finalCheckoutBtn) {
    finalCheckoutBtn.addEventListener("click", () => {
        // 1. 檢查購物車是不是根本沒東西
        if (mockCartData.length === 0) {
            Swal.fire('提示', '您的購物車還是空的，無法結帳喔 🍂', 'info');
            return;
        }

        // 2. 觸發下單成功的漂亮彈窗
        Swal.fire({
            title: '🎉 感謝訂購！餐點製作中',
            text: '墨香書咖已收到您的訂單，我們將儘速為您傳書外送。',
            icon: 'success',
            confirmButtonColor: '#8B5A2B'
        }).then(() => {
            // ==========================================
            // 關鍵：結帳後的資料狀態調整
            // ==========================================

            // 調整 A：清空購物車變數
            mockCartData = [];

            // 調整 B：同步清空本地端購物車的緩存 (如果有的話)
            localStorage.removeItem("cart_products");

            // 調整 C：重新渲染購物車（因為變空了，畫面會自動變回「空空如也」的優雅狀態）
            renderShoppingCart();

            // 調整 D：【最近瀏覽紀錄】完全不動它！
            // 這樣使用者關閉購物車後，右上角的足跡依然看得到他剛剛逛過的咖啡。

            // 關閉購物車視窗，讓用戶回到首頁
            cartOverlay.style.display = "none";

            // 頂部通知條（Top Toast）閃一下提示「下單完成」
            const topToast = document.querySelector("#top-toast");
            if (topToast) {
                topToast.style.display = "block";
                setTimeout(() => { topToast.style.display = "none"; }, 3000);
            }
        });
    });
}