// ==========================================
// --- HIỆU ỨNG MATRIX & HỆ THỐNG ---
// ==========================================
function startSystem() {
    // 1. Hiện container và canvas
    const mainContent = document.getElementById('main-content');
    const canvas = document.getElementById('matrix-canvas');
    const editBtn = document.getElementById('edit-card-btn');
    
    if (mainContent) mainContent.style.display = 'block';
    if (canvas) canvas.style.display = 'block';
    if (editBtn) editBtn.style.display = 'inline-block';

    // 2. Thiết lập Matrix
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "0101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const matrixInterval = setInterval(() => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ff62";
        ctx.font = fontSize + "px monospace";
        
        drops.forEach((y, i) => {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, y * fontSize);
            if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }, 33);

    // 3. Hiệu ứng hiện card mượt mà
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
            card.classList.add('show');
        }, index * 150);
    });

    // 4. Tự động ẩn Matrix sau 8 giây để dễ nhìn bài học
    setTimeout(() => {
        canvas.style.transition = "opacity 2s";
        canvas.style.opacity = "0";
        setTimeout(() => {
            clearInterval(matrixInterval);
            canvas.style.display = 'none';
        }, 2000);
    }, 8000);
}

// ======================================================================
// HÀM NÉN ẢNH CHUYÊN DỤNG CHO TÀI LIỆU/CHỮ (Lịch thi, Bảng điểm, TKB)
// ======================================================================
function docFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 1. CHỈNH SỬA: Giảm kích thước tối đa xuống 1000px
                // Mức này vừa đủ để xem trên màn hình vi tính mà không làm mờ chữ
                const MAX_SIZE = 1000;

                if (width > MAX_SIZE || height > MAX_SIZE) {
                    if (width > height) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    } else {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // 2. MẸO QUAN TRỌNG: Đổ màu nền trắng trước khi vẽ
                // Ảnh chụp màn hình (PNG) đôi khi có viền trong suốt. Khi ép sang JPG, phần trong suốt sẽ bị đen hoặc làm file nặng hơn. 
                // Việc tô nền trắng giúp thuật toán JPG nén mảng màu tốt hơn rất nhiều.
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);

                // Vẽ ảnh lên canvas
                ctx.drawImage(img, 0, 0, width, height);

                // 3. CHỈNH SỬA: Ép chất lượng nén xuống 0.45 (45%)
                // Các mảng màu trắng/chữ đen chịu nén cực tốt, 45% vẫn hoàn toàn đọc được bình thường.
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.45);
                resolve(compressedBase64);
            };
        };
        reader.onerror = error => reject(error);
    });
}

// ==========================================
// --- LOGIC LỊCH THI (MODAL) ---
// ==========================================
function openExamModal() {
    let modal = document.getElementById('examModal');
    if (!modal) {
        const modalHTML = `
        <div id="examModal" class="modal-overlay">
            <div class="modal-content">
                <span class="close-btn" onclick="closeExamModal()">&times;</span>
                <h2 style="color: #00ff62; margin-bottom:15px;">LỊCH THI CỦA TÔI</h2>
                <div class="image-container">
                    <img id="exam-photo" src="" alt="Chưa có ảnh lịch thi" style="max-width: 100%; border-radius: 8px;">
                </div>
                <input type="file" id="upload-exam" accept="image/*" hidden onchange="saveExamPhoto(this)">
                <label for="upload-exam" class="custom-button" style="background: #e84614; padding: 10px 20px; cursor: pointer; display: inline-block; margin-top: 15px; color: white; border-radius: 5px;">
                    <i class="fa-solid fa-upload"></i>Thay đổi ảnh lịch thi
                </label>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('examModal');
    }

    const savedImg = localStorage.getItem('examSchedule');
    if (savedImg) document.getElementById('exam-photo').src = savedImg;
    
    modal.style.display = 'flex';
}

function closeExamModal() {
    document.getElementById('examModal').style.display = 'none';
}

// Đã cập nhật nén ảnh
async function saveExamPhoto(input) {
    if (input.files && input.files[0]) {
        try {
            const compressedData = await docFileToBase64(input.files[0]);
            document.getElementById('exam-photo').src = compressedData;
            localStorage.setItem('examSchedule', compressedData);
        } catch (error) {
            console.error("Lỗi nén ảnh:", error);
            alert("Có lỗi xảy ra khi lưu ảnh lịch thi!");
        }
    }
}

// ==========================================
// --- LOGIC XEM ĐIỂM (SCORE MODAL) ---
// ==========================================
function openScoreModal() {
    let modal = document.getElementById('scoreModal');
    
    if (!modal) {
        const modalHTML = `
        <div id="scoreModal" class="modal-overlay">
            <div class="modal-content" style="border-color: #007AFF;">
                <span class="close-btn" onclick="closeScoreModal()">&times;</span>
                <h2 style="color: #63aeff; margin-bottom:15px;">BẢNG ĐIỂM CỦA TÔI</h2>
                <div class="image-container">
                    <img id="score-photo" src="" alt="Chưa có ảnh bảng điểm" style="max-width: 100%; border-radius: 8px;">
                </div>
                <input type="file" id="upload-score" accept="image/*" hidden onchange="saveScorePhoto(this)">
                <label for="upload-score" class="custom-button" style="background: #007AFF; padding: 10px 20px; cursor: pointer; display: inline-block; margin-top: 15px; color: white; border-radius: 5px;">
                    <i class="fa-solid fa-upload"></i> Cập nhật bảng điểm
                </label>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('scoreModal');
    }

    const savedImg = localStorage.getItem('userScoreTable');
    if (savedImg) document.getElementById('score-photo').src = savedImg;
    
    modal.style.display = 'flex';
}

function closeScoreModal() {
    const modal = document.getElementById('scoreModal');
    if (modal) modal.style.display = 'none';
}

// Đã cập nhật nén ảnh
async function saveScorePhoto(input) {
    if (input.files && input.files[0]) {
        try {
            const compressedData = await docFileToBase64(input.files[0]);
            document.getElementById('score-photo').src = compressedData;
            localStorage.setItem('userScoreTable', compressedData);
        } catch (error) {
            console.error("Lỗi nén ảnh:", error);
            alert("Có lỗi xảy ra khi lưu bảng điểm!");
        }
    }
}

// Click ra ngoài để đóng modal
window.addEventListener('click', function(event) {
    const scoreModal = document.getElementById('scoreModal');
    const examModal = document.getElementById('examModal');
    if (event.target === scoreModal) closeScoreModal();
    if (event.target === examModal) closeExamModal();
});

// ==========================================
// --- LOGIC THỜI KHÓA BIỂU (TKB) ---
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const uploadTkb = document.getElementById('upload-tkb');
    if (uploadTkb) {
        // Đã cập nhật nén ảnh
        uploadTkb.addEventListener('change', async function() {
            const file = this.files[0];
            if (file) {
                try {
                    const compressedData = await docFileToBase64(file);
                    localStorage.setItem('savedTKB', compressedData);
                    localStorage.setItem('savedTKBName', file.name);
                    location.reload();
                } catch (error) {
                    console.error("Lỗi nén ảnh TKB:", error);
                    alert("Có lỗi xảy ra khi lưu thời khóa biểu!");
                }
            }
        });
    }

    const savedImage = localStorage.getItem('savedTKB');
    const savedName = localStorage.getItem('savedTKBName');
    const displayImg = document.getElementById('display-tkb');
    const dynamicTitle = document.getElementById('dynamic-title');

    if (savedImage && displayImg) displayImg.src = savedImage;
    if (savedName && dynamicTitle) dynamicTitle.textContent = savedName.split('.')[0];
});


// ==========================================
// HÀM BẬT/TẮT CHẾ ĐỘ CHỈNH SỬA
// ==========================================
let isEditMode = false;
function toggleEditMode() {
    isEditMode = !isEditMode;
    const cards = document.querySelectorAll('.card');
    const btn = document.getElementById('edit-card-btn');

    cards.forEach(card => {
        let hrefValue = card.href || card.getAttribute('data-href');
        if (!hrefValue || !hrefValue.includes('?id=')) return; 

        const h3 = card.querySelector('h3');
        
        // --- SỬA LỖI: Đảm bảo luôn có đủ 2 thẻ <p> để không bị crash ---
        let pElements = card.querySelectorAll('p');
        if (pElements.length === 0) card.appendChild(document.createElement('p'));
        if (pElements.length <= 1) {
            const p2 = document.createElement('p');
            p2.className = 'lab-teacher';
            p2.style.display = 'none';
            p2.style.color = '#ffcc00';
            p2.style.fontSize = '14px';
            card.appendChild(p2);
        }
        pElements = card.querySelectorAll('p'); // Cập nhật lại danh sách p

        if (isEditMode) {
            // === VÀO CHẾ ĐỘ SỬA ===
            card.classList.add('editing-mode');
            card.style.border = "2px dashed #00ff62";
            
            if (card.href) {
                card.setAttribute('data-href', card.href);
                card.removeAttribute('href');
            }

            if (h3) { h3.contentEditable = "true"; h3.style.backgroundColor = "rgba(255, 255, 255, 0.1)"; }
            if (pElements[0]) { pElements[0].contentEditable = "true"; pElements[0].style.backgroundColor = "rgba(255, 255, 255, 0.1)"; }

            const labTeacherEl = pElements[1];
            const isLabActive = labTeacherEl.style.display !== 'none';

            const toggleWrapper = document.createElement('div');
            toggleWrapper.className = 'lab-toggle-wrapper';
            toggleWrapper.style.marginTop = '15px';
            toggleWrapper.innerHTML = `
                <label style="color: #ffcc00; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <input type="checkbox" class="lab-checkbox" ${isLabActive ? 'checked' : ''} style="cursor: pointer; transform: scale(1.2);">
                    Có thực hành (Lab)
                </label>
            `;

            const checkbox = toggleWrapper.querySelector('.lab-checkbox');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    labTeacherEl.style.display = 'block';
                    labTeacherEl.contentEditable = "true";
                    labTeacherEl.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    if (!labTeacherEl.innerText.trim() || labTeacherEl.innerText.includes("Chưa cập nhật") || labTeacherEl.innerText === "Giảng viên Lab") {
                        labTeacherEl.innerText = "Tên GV Lab";
                    }
                } else {
                    labTeacherEl.style.display = 'none';
                    labTeacherEl.contentEditable = "false";
                }
            });

            card.appendChild(toggleWrapper);

            if (isLabActive) {
                labTeacherEl.contentEditable = "true";
                labTeacherEl.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }

        } else {
            // === THOÁT CHẾ ĐỘ SỬA VÀ LƯU ===
            const wrapper = card.querySelector('.lab-toggle-wrapper');
            if (wrapper) wrapper.remove();

            if (h3) { h3.contentEditable = "false"; h3.style.backgroundColor = "transparent"; }
            if (pElements[0]) { pElements[0].contentEditable = "false"; pElements[0].style.backgroundColor = "transparent"; }
            if (pElements[1]) { pElements[1].contentEditable = "false"; pElements[1].style.backgroundColor = "transparent"; }

            card.classList.remove('editing-mode');
            card.style.border = "none";
            
            if (card.getAttribute('data-href')) {
                card.href = card.getAttribute('data-href');
                card.removeAttribute('data-href');
            }
            
            saveCardData(card);
        }
    });

    if (isEditMode) {
        if(btn) { btn.innerText = "Xác nhận & Lưu"; btn.style.background = "#27ae60"; }
    } else {
        if(btn) { btn.innerText = "Thay đổi môn học"; btn.style.background = "#9b59b6"; }
        alert("Đã lưu các thay đổi!");
    }
}

// ==========================================
// Lắng nghe sự kiện nhấn phím Enter để kích hoạt lưu (chỉ khi đang ở chế độ Edit)
// ==========================================
document.addEventListener('keydown', function(event) {
    // Chỉ hoạt động khi phím nhấn là Enter VÀ đang bật chế độ Edit
    if (event.key === 'Enter' && isEditMode) {
        
        // 1. NGĂN CHẶN XUỐNG DÒNG (Nếu người dùng đang sửa tiêu đề, nhấn Enter sẽ không làm hỏng layout)
        // Chúng ta chỉ cho phép xuống dòng nếu là <textarea>, còn <h3> hay <p> thì Enter = Lưu
        if (event.target.tagName.toLowerCase() !== 'textarea') {
            event.preventDefault();
            
            // 2. Kích hoạt nút Lưu (Xác nhận & Lưu)
            const btn = document.getElementById('edit-card-btn');
            if (btn) {
                // Blur khỏi ô đang sửa để dữ liệu kịp cập nhật vào DOM trước khi lưu
                document.activeElement.blur(); 
                
                // Gọi hàm toggleEditMode() để thực hiện quy trình lưu
                toggleEditMode();
            }
        }
    }
});

// ==========================================
// HÀM LƯU DỮ LIỆU THẺ MÔN HỌC VÀO MÁY
// ==========================================
function saveCardData(card) {
    let hrefToParse = card.href || card.getAttribute('data-href');
    if (!hrefToParse || !hrefToParse.includes("?id=")) return;
    
    // Tách ID an toàn hơn (Lọc luôn dấu # nếu vô tình có trên URL)
    const cardId = hrefToParse.split("?id=")[1].split("&")[0].split("#")[0];
    
    const h3 = card.querySelector('h3');
    const pElements = card.querySelectorAll('p');

    const titleText = h3 ? h3.innerText.trim() : "";
    const teacherText = pElements[0] ? pElements[0].innerText.trim() : "";
    
    let hasLab = false;
    let labTeacherText = "";

    if (pElements[1] && pElements[1].style.display !== 'none') {
        hasLab = true;
        labTeacherText = pElements[1].innerText.trim();
    }

    // LẤY THÊM CLASS CỦA ICON HIỆN TẠI ĐỂ LƯU VÀO STORAGE
    const iconEl = card.querySelector('.card-icon');
    // Nếu thẻ không có class 'card-icon', lấy mặc định là icon sóng gợn
    const iconClass = iconEl ? iconEl.className : "fa-solid fa-wave-square card-icon";

    const cardData = {
        title: titleText,
        teacher: teacherText,
        hasLab: hasLab,
        labTeacher: labTeacherText,
        icon: iconClass // <-- Thêm thuộc tính lưu chuỗi class icon ở đây
    };

    localStorage.setItem(`card_data_${cardId}`, JSON.stringify(cardData));
}

// ==========================================
// HÀM KÉO DỮ LIỆU HIỂN THỊ KHI F5 / VÀO TRANG CHỦ
// ==========================================
function loadSavedCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        let hrefValue = card.href || card.getAttribute('data-href');
        if (!hrefValue || !hrefValue.includes('?id=')) return;
        
        const cardId = hrefValue.split("?id=")[1].split("&")[0].split("#")[0];
        const rawData = localStorage.getItem(`card_data_${cardId}`);
        
        if (!rawData) return; // Nếu chưa lưu gì thì giữ nguyên HTML gốc

        try {
            const savedData = JSON.parse(rawData);
            
            // Tự động tạo thẻ p nếu bị thiếu, chống đứng code
            let pElements = card.querySelectorAll('p');
            if (pElements.length === 0) card.appendChild(document.createElement('p'));
            if (pElements.length <= 1) {
                const p2 = document.createElement('p');
                p2.className = 'lab-teacher';
                p2.style.color = '#ffcc00';
                p2.style.fontSize = '14px';
                card.appendChild(p2);
            }
            pElements = card.querySelectorAll('p');

            pElements[1].style.display = 'none'; // Mặc định ẩn Lab

            // Điền dữ liệu chữ
            if (card.querySelector('h3') && savedData.title) {
                card.querySelector('h3').innerText = savedData.title;
            }
            if (pElements[0] && savedData.teacher) {
                pElements[0].innerText = savedData.teacher;
            }
            
            // Nếu có bật Lab
            if (savedData.hasLab) {
                pElements[1].style.display = 'block';
                pElements[1].innerText = savedData.labTeacher || "Giảng viên Lab";
            }

            // KHÔI PHỤC LẠI ĐÚNG BIỂU TƯỢNG (ICON) ĐÃ LƯU
            const iconEl = card.querySelector('.card-icon');
            if (iconEl && savedData.icon) {
                iconEl.className = savedData.icon; // Đắp đè bộ class icon cũ vào
            }
            
        } catch(e) {
            console.error("Lỗi đọc dữ liệu thẻ môn học: ", e);
        }
    });
}

// --- SỬA LỖI KHÔNG CHẠY KHI RESET ---
// Kích hoạt hàm load ngay lập tức nếu trình duyệt đã load xong, 
// hoặc đợi nếu nó còn đang load. Cách này 100% tỷ lệ chạy thành công.
// ==========================================
// 4. NGƯỜI CANH CHỪNG (Khắc phục lỗi mất chữ khi F5)
// ==========================================
function watchAndLoadCards() {
    let checkCount = 0;
    
    // Tạo một vòng lặp kiểm tra liên tục mỗi 0.1 giây
    const interval = setInterval(() => {
        const cards = document.querySelectorAll('.card');
        
        // Nếu đã tìm thấy thẻ (card) trên màn hình
        if (cards.length > 0) {
            loadSavedCards(); // Ép dữ liệu từ LocalStorage hiển thị ra
        }
        
        checkCount++;
        // Chạy liên tục trong vòng 1.5 giây (15 lần) rồi tự tắt.
        // Việc này đảm bảo sẽ đè bẹp mọi dữ liệu mặc định dù hiệu ứng của bạn có chạy chậm đến đâu.
        if (checkCount > 15) {
            clearInterval(interval);
        }
    }, 100);
}

// Khởi động bộ canh chừng ngay khi chạy web
watchAndLoadCards();

// ==========================================
// ĐIỀU KHIỂN ĐÓNG BẬT MODAL
// ==========================================
function openGuideModal() {
    const modal = document.getElementById('guideModal');
    if (modal) modal.style.display = 'block';
}
function closeGuideModal() {
    const modal = document.getElementById('guideModal');
    if (modal) modal.style.display = 'none';
}

function openDataModal() {
    const modal = document.getElementById('dataModal');
    if (modal) modal.style.display = 'block';
}
function closeDataModal() {
    const modal = document.getElementById('dataModal');
    if (modal) modal.style.display = 'none';
}

//===============================================================
// Chuyển đổi File/Blob thành chuỗi Base64 để nhét vào file JSON
//===============================================================
function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ==========================================
// HÀM XUẤT DỮ LIỆU (BACKUP TOÀN DIỆN)
// ==========================================
async function exportMyData() {
    try {
        let backupData = {
            localStorage: {},
            indexedDB: {}
        };
        let hasData = false;
        
        // --- BƯỚC 1: Gom dữ liệu từ LocalStorage ---
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key.startsWith('card_data_') || key.startsWith('custom_data_')) {
                backupData.localStorage[key] = localStorage.getItem(key);
                hasData = true;
            }
        }
        
        // --- BƯỚC 2: Gom dữ liệu từ IndexedDB ---
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open("StudyMaterialsDB", 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (db.objectStoreNames.contains('files')) {
            const transaction = db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            
            // Lấy toàn bộ file trong kho ra
            const allFiles = await new Promise((resolve, reject) => {
                const req = store.getAll();
                const reqKeys = store.getAllKeys();
                
                req.onsuccess = () => {
                    reqKeys.onsuccess = () => {
                        resolve({ values: req.result, keys: reqKeys.result });
                    };
                };
                req.onerror = () => reject(req.error);
            });

            // Chuyển từng file thành Base64
            for (let i = 0; i < allFiles.keys.length; i++) {
                const key = allFiles.keys[i];
                const fileBlob = allFiles.values[i];
                
                if (fileBlob instanceof Blob) {
                    const base64Data = await convertBlobToBase64(fileBlob);
                    backupData.indexedDB[key] = {
                        data: base64Data,
                        type: fileBlob.type,
                        name: fileBlob.name || "tailieu"
                    };
                    hasData = true;
                }
            }
        }
        
        // --- BƯỚC 3: Tải xuống ---
        if (!hasData) {
            alert("Hiện tại hệ thống chưa có dữ liệu nào để xuất file!");
            return;
        }
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "backup_toan_dien_mon_hoc.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        alert("Đã xuất file dự phòng TOÀN DIỆN thành công (bao gồm cả tài liệu PDF/Ảnh)! Hãy cất kỹ file này nhé.");
        
    } catch (err) {
        console.error("Lỗi khi xuất dữ liệu:", err);
        alert("Đã xảy ra lỗi trong quá trình xuất dữ liệu!");
    }
}

// ==========================================
// HÀM NHẬP DỮ LIỆU (PHỤC HỒI TOÀN DIỆN)
// ==========================================
async function importMyData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const parsedData = JSON.parse(e.target.result);
            let count = 0;

            // Kiểm tra xem đây là file backup kiểu cũ hay kiểu mới toàn diện
            const isNewFormat = (parsedData.localStorage !== undefined);
            
            // --- BƯỚC 1: Phục hồi LocalStorage ---
            const lsData = isNewFormat ? parsedData.localStorage : parsedData;
            for (let key in lsData) {
                localStorage.setItem(key, lsData[key]);
                count++;
            }
            
            // --- BƯỚC 2: Phục hồi IndexedDB (nếu có) ---
            if (isNewFormat && parsedData.indexedDB) {
                const db = await new Promise((resolve, reject) => {
                    const request = indexedDB.open("StudyMaterialsDB", 1);
                    request.onupgradeneeded = (e) => {
                        const database = e.target.result;
                        if (!database.objectStoreNames.contains('files')) {
                            database.createObjectStore('files');
                        }
                    };
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                const transaction = db.transaction(['files'], 'readwrite');
                const store = transaction.objectStore('files');

                for (let key in parsedData.indexedDB) {
                    const fileObj = parsedData.indexedDB[key];
                    
                    // Tuyệt chiêu dùng fetch để chuyển Base64 ngược về lại Blob gốc siêu nhanh
                    const res = await fetch(fileObj.data);
                    const blob = await res.blob();
                    
                    store.put(blob, key);
                    count++;
                }
                
                // Đợi cho tiến trình lưu file hoàn tất
                await new Promise((resolve, reject) => {
                    transaction.oncomplete = () => resolve();
                    transaction.onerror = () => reject();
                });
            }
            
            if (count > 0) {
                alert("Nhập dữ liệu TOÀN DIỆN thành công! Hệ thống sẽ tải lại trang để áp dụng cấu hình.");
                location.reload();
            } else {
                alert("File sao lưu trống hoặc không chứa dữ liệu hợp lệ.");
            }
            
        } catch (err) {
            console.error("Lỗi khi nhập dữ liệu:", err);
            alert("Đã xảy ra lỗi: File không hợp lệ hoặc bị sai cấu trúc định dạng!");
        }
    };
    reader.readAsText(file);
    
    // Reset lại ô input file để có thể chọn lại chính file đó nhiều lần
    event.target.value = "";
}
// ==========================================
// Lưu trữ icon thẻ môn học
// ==========================================
let activeCardForIcon = null;

// Hàm mở bảng chọn icon
function openIconPicker(event, cardElement) {
    // Chỉ cho phép kích hoạt khi trang web ĐANG TRONG CHẾ ĐỘ CHỈNH SỬA (isEditMode = true)
    if (typeof isEditMode !== 'undefined' && isEditMode === true) {
        event.preventDefault(); // Ngăn việc bấm vào thẻ tự động chuyển trang
        event.stopPropagation(); // Ngăn sự kiện click bị lan ra ngoài thẻ card
        
        activeCardForIcon = cardElement; // Ghi nhớ thẻ đang chọn
        const modal = document.getElementById('iconPickerModal');
        if (modal) {
            modal.style.display = 'block'; // Hiển thị bảng chọn icon
        } else {
            console.error("Không tìm thấy thẻ HTML có id='iconPickerModal'!");
        }
    }
}

// Hàm đóng bảng chọn icon
function closeIconPicker() {
    const modal = document.getElementById('iconPickerModal');
    if (modal) modal.style.display = 'none';
    activeCardForIcon = null;
}

// Thiết lập bộ lắng nghe sự kiện khi trang web tải xong
window.addEventListener("DOMContentLoaded", function() {
    // 1. Lắng nghe sự kiện khi click chọn 1 icon cụ thể trong bảng mẫu
    const selectableIcons = document.querySelectorAll('.selectable-icon');
    selectableIcons.forEach(iconBox => {
        iconBox.addEventListener('click', function() {
            if (!activeCardForIcon) return;
            
            const chosenIconClass = this.getAttribute('data-icon');
            const targetIconEl = activeCardForIcon.querySelector('.card-icon');
            
            if (targetIconEl) {
                // Thay đổi class hiển thị icon trên thẻ ngay lập tức
                // Cần giữ lại class 'card-icon' để định vị cho những lần sửa sau
                targetIconEl.className = chosenIconClass + " card-icon";
                
                // Kích hoạt hàm lưu dữ liệu tự động của thẻ đó vào localStorage
                saveCardData(activeCardForIcon);
            }
            
            closeIconPicker(); // Đóng bảng chọn
        });
    });
    
    // 2. GẮN SỰ KIỆN CLICK VÀO ICON CHO TẤT CẢ CÁC THẺ MÔN HỌC BẰNG EVENT DELEGATION
    // Cách này an toàn hơn, giúp bắt trọn sự kiện click kể cả khi đang ở chế độ chỉnh sửa
    document.addEventListener('click', function(e) {
        // Kiểm tra xem phần tử được click (hoặc thẻ cha gần nhất của nó) có phải là icon của thẻ card không
        const iconEl = e.target.closest('.card .card-icon');
        if (iconEl) {
            const card = iconEl.closest('.card');
            if (card) {
                openIconPicker(e, card);
            }
        }
    });
});