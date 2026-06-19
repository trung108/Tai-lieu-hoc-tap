// 1. Hàm lấy ID của trang hiện tại
function getPageId() {
    // Kiểm tra trên đường dẫn URL trước (ưu tiên subject.html?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    renderDropdowns();
    if (idFromUrl) return idFromUrl;

    // Nếu không có URL (như trang index), lấy từ dataset của body
    return document.body.dataset.pageId || 'general';
}

// ================= LOGIC LIÊN KẾT =================
// 2. Hàm ẩn/hiện Form nhập liệu (Tìm thẻ HTML ngay bên trong hàm)
function toggleAddForm() {
    const addLinkForm = document.getElementById('addLinkForm');
    const showFormBtn = document.getElementById('showFormBtn');
    const linkNameInput = document.getElementById('linkName');
    const linkUrlInput = document.getElementById('linkUrl');

    // Nếu trang web không có phần này thì dừng lại, tránh báo lỗi
    if (!addLinkForm || !showFormBtn) return; 

    if (addLinkForm.style.display === 'none' || addLinkForm.style.display === '') {
        addLinkForm.style.display = 'block'; 
        showFormBtn.style.display = 'none';   
        if (linkNameInput) linkNameInput.focus(); 
        attachAddLinkNavigation(); // Gắn sự kiện Enter cho form thêm link
    } else {
        addLinkForm.style.display = 'none';  
        showFormBtn.style.display = 'flex';   
        if (linkNameInput) linkNameInput.value = '';
        if (linkUrlInput) linkUrlInput.value = '';
        if (linkNameInput) linkNameInput.onkeydown = null;
        if (linkUrlInput) linkUrlInput.onkeydown = null; // Gỡ sự kiện Enter khi đóng form để tránh xung đột với các phần khác của trang
    }
}

function handleEnter(event, nextAction) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Ngăn chặn việc submit form mặc định

        if (nextAction === 'linkUrl') {
            document.getElementById('linkUrl').focus();
        } else if (nextAction === 'save') {
            addLink();
        }
    }
}

// 3. Hàm thêm link mới
function addLink() {
    const nameInput = document.getElementById('linkName');
    const urlInput = document.getElementById('linkUrl');
    if (!nameInput || !urlInput) return;
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    if (!name || !url) {
        alert("Vui lòng nhập đầy đủ tên và đường dẫn!");
        return;
    }
    createCard(name, url);
    saveLinkToStorage(name, url);
    toggleAddForm(); // Đóng form lại sau khi thêm
}

//=================================
// Hàm xử lý sự kiện Enter cho form thêm link
//=================================
function attachAddLinkNavigation() {
    const nameInput = document.getElementById('linkName');
    const urlInput = document.getElementById('linkUrl');

    if (!nameInput || !urlInput) return;

    // Sự kiện cho ô Tên tài liệu
    nameInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            urlInput.focus(); // Nhảy xuống ô URL
        }
    };

    // Sự kiện cho ô Link URL
    urlInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLink(); // Gọi hàm Lưu
        }
    };
}

// 4. Hàm tạo thẻ card trên giao diện
function createCard(name, url, isNew = true) {
    const linkContainer = document.getElementById('linkContainer');
    if (!linkContainer) return;

    const randomColors = ['#FF9F1C', '#2EC4B6', '#FF6B6B', '#06D6A0', '#FFD166'];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];

    // Tạo thẻ <a> (Card)
    const card = document.createElement('a');
    card.href = url;
    card.target = "_blank";
    card.className = "dynamic-card";
    card.style.backgroundColor = randomColor;
    card.style.position = "relative"; // Để đặt nút xóa tuyệt đối
    card.innerText = name;

    // Nút Xóa (Dấu x)
    const deleteBtn = document.createElement('span');
    deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    deleteBtn.style.cssText = "position: absolute; top: 5px; right: 8px; font-size: 15px; cursor: pointer; color: #000000;";
    
    // Sự kiện xóa
    deleteBtn.onclick = (e) => {
        e.preventDefault(); // Ngăn mở link khi bấm vào nút xóa
        card.remove();      // Xóa khỏi giao diện
        removeFromStorage(name, url); // Xóa khỏi bộ nhớ
    };

    card.appendChild(deleteBtn);

    // Dùng prepend để chèn lên trên cùng
    if (isNew) {
        linkContainer.prepend(card);
    } else {
        linkContainer.appendChild(card);
    }
}

// ================= DOMContentLoaded =================
// Tải danh sách link khi mở web (Cả Lý thuyết và Lab)
window.addEventListener("DOMContentLoaded", () => {
    const pageId = getPageId();
    
    // Tải link Lý thuyết
    const savedLinks = JSON.parse(localStorage.getItem('links_' + pageId)) || [];
    savedLinks.forEach(link => {
        // Đảm bảo hàm createCard cũ của bạn tồn tại
        if (typeof createCard === 'function') createCard(link.name, link.url, false);
    });

    // Tải link Lab
    const savedLabLinks = JSON.parse(localStorage.getItem('lab_links_' + pageId)) || [];
    savedLabLinks.forEach(link => createCardLab(link.name, link.url, false));
});

// 6. Hàm lưu vào LocalStorage lt
function saveLinkToStorage(name, url) {
    const pageId = getPageId();
    const links = JSON.parse(localStorage.getItem(`links_${pageId}`)) || [];
    links.push({ name, url });
    localStorage.setItem(`links_${pageId}`, JSON.stringify(links));
}

// 7. Hàm xóa khỏi LocalStorage
function removeFromStorage(name, url) {
    const pageId = getPageId();
    let links = JSON.parse(localStorage.getItem(`links_${pageId}`)) || [];
    links = links.filter(link => !(link.name === name && link.url === url));
    localStorage.setItem(`links_${pageId}`, JSON.stringify(links));
}

// ================= LOGIC LIÊN KẾT MỚI (LAB) =================

// 1. Hàm ẩn/hiện Form nhập liệu Lab
function toggleAddFormLab() {
    const addLinkForm = document.getElementById('addLinkFormLab');
    const showFormBtn = document.getElementById('showFormBtnLab');
    const linkNameInput = document.getElementById('linkNameLab');
    const linkUrlInput = document.getElementById('linkUrlLab');

    if (!addLinkForm || !showFormBtn) return;

    if (addLinkForm.style.display === 'none' || addLinkForm.style.display === '') {
        addLinkForm.style.display = "block";
        showFormBtn.style.display = 'none';
        if (linkNameInput) linkNameInput.focus();
    } else {
        addLinkForm.style.display = "none";
        showFormBtn.style.display = 'flex';
        if (linkNameInput) linkNameInput.value = "";
        if (linkUrlInput) linkUrlInput.value = "";
    }
}

// 2. Hàm thêm link mới Lab
function addLinkLab() {
    const nameInput = document.getElementById('linkNameLab');
    const urlInput = document.getElementById('linkUrlLab');
    if (!nameInput || !urlInput) return;

    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !url) {
        alert("Vui lòng nhập đầy đủ tên và đường dẫn!");
        return;
    }

    createCardLab(name, url, true);
    saveLinkToStorageLab(name, url);
    toggleAddFormLab(); // Đóng form lại sau khi thêm
}

// 3. Hàm tạo thẻ card trên giao diện Lab
function createCardLab(name, url, isNew) {
    const linkContainer = document.getElementById('linkContainerLab');
    if (!linkContainer) return;

    const randomColors = ['#FF9F1C', '#2EC4B6', '#FF6B6B', '#06D6A0', '#FFD166'];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];

    const card = document.createElement('a');
    card.href = url;
    card.target = "_blank";
    card.className = "dynamic-card";
    card.style.backgroundColor = randomColor;
    card.style.position = "relative"; 
    card.innerText = name;


    // Nút Xóa (Dấu x)
    const deleteBtn = document.createElement('span');
    deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    deleteBtn.style.cssText = "position: absolute; top: 5px; right: 8px; font-size: 15px; cursor: pointer; color: #fff;";

    deleteBtn.onclick = (e) => {
        e.preventDefault(); 
        card.remove(); 
        removeFromStorageLab(name, url); 
    };

    card.appendChild(deleteBtn);

    if (isNew) {
        linkContainer.prepend(card);
    } else {
        linkContainer.appendChild(card);
    }
}

// 4. Các hàm lưu trữ LocalStorage cho Lab (Dùng key riêng 'lab_links_')
function saveLinkToStorageLab(name, url) {
    const pageId = getPageId();
    const links = JSON.parse(localStorage.getItem('lab_links_' + pageId)) || [];
    links.push({ name, url });
    localStorage.setItem('lab_links_' + pageId, JSON.stringify(links));
}

function removeFromStorageLab(name, url) {
    const pageId = getPageId();
    let links = JSON.parse(localStorage.getItem('lab_links_' + pageId)) || [];
    links = links.filter(link => !(link.name === name && link.url === url));
    localStorage.setItem('lab_links_' + pageId, JSON.stringify(links));
}

//=================================
// Định nghĩa Class cho Header
//=================================
class HeaderComponent extends HTMLElement {
    connectedCallback() {
        // 1. Render giao diện
        this.innerHTML = `
        <header class="navbar">
            <div class="brand-container" onclick="window.location.href='index.html'" style="cursor: pointer;">
                <img src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png" class="logo" alt="Logo">
                <div class="logo-text">
                    <span class="line-1">VIETNAM NATIONAL UNIVERSITY HO CHI MINH CITY</span>
                    <span class="line-2">HO CHI MINH CITY UNIVERSITY OF TECHNOLOGY</span>
                </div>
            </div>
            
            <div class="search-container" style="position: relative;">
                <input type="text" id="searchInput" placeholder="Tìm kiếm môn học..." autocomplete="off">
                <div id="searchSuggestions" class="suggestions-box" style="display: none;"></div>
                <button class="btn-glow" type="button" id="searchBtn">Tìm</button>
            </div>
        </header>`;

        // 2. Kích hoạt logic tìm kiếm ngay lập tức
        this.initSearch();
    }

    initSearch() {
        const input = this.querySelector('#searchInput');
        const suggestionsBox = this.querySelector('#searchSuggestions');
        const searchBtn = this.querySelector('#searchBtn');
        
        if (!input || !suggestionsBox) return;

        const subjects = this.getSubjectList();

        // Cập nhật bảng gợi ý
        const renderSuggestions = (filterText = "") => {
            suggestionsBox.innerHTML = "";
            const filtered = subjects.filter(s => s.name.toLowerCase().includes(filterText.toLowerCase()));
            
            if (filtered.length === 0) {
                suggestionsBox.style.display = 'none';
                return;
            }

            filtered.forEach(s => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = s.name;
                div.onclick = () => {
                    input.value = s.name;
                    suggestionsBox.style.display = 'none';
                    this.executeSearch(input.value, subjects);
                };
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.style.display = 'block';
        };

        // Gắn các sự kiện (Events)
        input.addEventListener('focus', () => renderSuggestions(input.value));
        input.addEventListener('input', () => renderSuggestions(input.value));

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                suggestionsBox.style.display = 'none';
                this.executeSearch(input.value, subjects);
            }
        });

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                suggestionsBox.style.display = 'none';
                this.executeSearch(input.value, subjects);
            });
        }
    }

    getSubjectList() {
        let list = [];
        const cards = document.querySelectorAll('a.card, .card'); 
        
        // Khắc phục LỖI 1: Cờ đánh dấu xem trang này có thực sự chứa THẺ MÔN HỌC không
        let isValidHomePage = false; 

        cards.forEach(card => {
            const href = card.getAttribute('href') || card.getAttribute('data-href');
            // Nếu thẻ .card này không có link id= thì bỏ qua, không đếm xỉa tới
            if (!href || !href.includes('id=')) return; 
            
            isValidHomePage = true; 
            const idMatch = href.match(/id=([^&#]+)/);
            
            if (idMatch) {
                const id = idMatch[1];
                let subjectName = "";

                const savedCardData = localStorage.getItem(`card_data_${id}`);
                if (savedCardData) {
                    try {
                        const parsedData = JSON.parse(savedCardData);
                        if (parsedData.title && parsedData.title.trim() !== "") {
                            subjectName = parsedData.title.trim();
                        }
                    } catch (e) {}
                }

                if (!subjectName) {
                    const h3Tag = card.querySelector('h3');
                    subjectName = h3Tag ? h3Tag.textContent.trim() : "Môn học chưa tên";
                }
                
                list.push({ id: id, name: subjectName });
            }
        });
        
        // CHỈ cập nhật Cache nếu xác định được đây là Trang chủ và có danh sách
        if (isValidHomePage && list.length > 0) {
            localStorage.setItem('cached_subject_list', JSON.stringify(list));
        } else {
            // Còn nếu đang ở subject.html, yên tâm lấy lại từ Cache
            const savedList = localStorage.getItem('cached_subject_list');
            if (savedList) {
                list = JSON.parse(savedList);
            }
        }
        
        return list;
    }

    executeSearch(inputValue, subjects) {
        const input = inputValue.toLowerCase().trim();
        const matched = subjects.find(s => s.name.toLowerCase() === input);
        
        if (matched) {
            window.location.href = `subject.html?id=${matched.id}`;
        } else if (input === "home" || input === "trangchu" || input === "trang chủ") {
            window.location.href = `index.html`;
        } else {
            alert("Không tìm thấy trang! Hãy chọn đúng tên môn học từ danh sách gợi ý.");
        }
    }
}

// Đăng ký header an toàn
if (!customElements.get('header-component')) {
    customElements.define('header-component', HeaderComponent);
}

//=================================
// Định nghĩa Class cho Footer
//=================================
class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            <div class="footer-links">
                <a href="index.html">Trang Chủ</a>
                <a href="https://lms.hcmut.edu.vn/login/index.php?loginredirect=1" target="_blank">Cổng LMS</a>
                <a href="https://mybk.hcmut.edu.vn/app/login" target="_blank">Cổng MyBK/app</a>
                <a href="https://mail.google.com">Gmail</a>
            </div>
            <div class="social-icons">
                <a href="https://www.facebook.com" target="_blank" class="fb"><i class="fa-brands fa-facebook"></i></a>
                <a href="https://www.youtube.com" target="_blank" class="yt"><i class="fa-brands fa-youtube"></i></a>
                <a href="https://hcmut.edu.vn" target="_blank" class="web"><i class="fa-solid fa-globe"></i></a>
            </div>
            <p class="copyright">© 2026 HCMUT - Trường Đại học Bách khoa - ĐHQG-HCM - Nguyễn Quốc Trung - 2413706</p>
        </footer>`;
    }
}

// Đăng ký Footer an toàn
if (!customElements.get('footer-component')) {
    customElements.define('footer-component', FooterComponent);
}



//============================================================
// Khởi tạo logic khối thả xuống Slide (Cả Lý thuyết và Lab)
//============================================================
// 1. Hàm thêm hàng nhập liệu (Dùng chung cho cả 2 phần nhờ truyền ID)
function addSlideRow(containerId, name = '', link = '') {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'slide-row';
    div.style.display = 'flex';
    div.style.gap = '10px';
    
    div.innerHTML = `
        <input type="text" placeholder="VD: Chương 1..." value="${name}" class="s-name" style="flex: 1; padding: 10px; border-radius: 6px; border: none; background: #2a2a2a; color: white;">
        <input type="text" placeholder="Dán link tại đây..." value="${link}" class="s-link" style="flex: 2; padding: 10px; border-radius: 6px; border: none; background: #2a2a2a; color: white;">
        <button onclick="this.parentElement.remove()" style="background: #ff4a4a; color: white; border: none; border-radius: 6px; width: 40px; cursor: pointer; font-weight: bold;">-</button>
    `;
    container.appendChild(div);
}

// 2. Hàm mở Modal và nạp lại dữ liệu cũ đã lưu
function openSlideModal() {
    if (!currentSubjectId) return;

    // Xóa trắng khu vực nhập trước khi đổ dữ liệu vào
    document.getElementById('theory-slides-container').innerHTML = '';
    document.getElementById('lab-slides-container').innerHTML = '';

    // Lấy dữ liệu Lý thuyết
    const theoryData = JSON.parse(localStorage.getItem(`slides_theory_${currentSubjectId}`)) || [];
    theoryData.forEach(item => addSlideRow('theory-slides-container', item.name, item.link));

    // Lấy dữ liệu Thực hành
    const labData = JSON.parse(localStorage.getItem(`slides_lab_${currentSubjectId}`)) || [];
    labData.forEach(item => addSlideRow('lab-slides-container', item.name, item.link));

    document.getElementById('slideModal').style.display = 'block';
}

// 3. Hàm lưu dữ liệu riêng biệt
function saveSlides() {
    if (!currentSubjectId) return;

    // Quét và gom dữ liệu khu vực Lý thuyết
    const theoryRows = document.querySelectorAll('#theory-slides-container .slide-row');
    const theoryData = Array.from(theoryRows)
        .map(row => ({ name: row.querySelector('.s-name').value.trim(), link: row.querySelector('.s-link').value.trim() }))
        .filter(item => item.name !== "" && item.link !== ""); // Lọc bỏ các hàng trống

    // Quét và gom dữ liệu khu vực Thực hành
    const labRows = document.querySelectorAll('#lab-slides-container .slide-row');
    const labData = Array.from(labRows)
        .map(row => ({ name: row.querySelector('.s-name').value.trim(), link: row.querySelector('.s-link').value.trim() }))
        .filter(item => item.name !== "" && item.link !== ""); 

    // Lưu vào LocalStorage với 2 Key khác nhau
    localStorage.setItem(`slides_theory_${currentSubjectId}`, JSON.stringify(theoryData));
    localStorage.setItem(`slides_lab_${currentSubjectId}`, JSON.stringify(labData));

    // Cập nhật giao diện và đóng Modal
    renderDropdowns();
    document.getElementById('slideModal').style.display = 'none';
}

// 4. Hàm render dữ liệu ra các nút thả xuống (Gọi hàm này lúc load trang web)
function renderDropdowns() {
    if (!currentSubjectId) return;

    const theoryData = JSON.parse(localStorage.getItem(`slides_theory_${currentSubjectId}`)) || [];
    const labData = JSON.parse(localStorage.getItem(`slides_lab_${currentSubjectId}`)) || [];

    const theoryList = document.getElementById('slides-list-theory');
    const labList = document.getElementById('slides-list-lab');

    // Render HTML cho dropdown (nếu có id)
    if (theoryList) {
        theoryList.innerHTML = theoryData.length > 0 
            ? theoryData.map(item => `<a href="${item.link}" target="_blank" style="display:block; padding: 12px; color: white; text-decoration: none; border-bottom: 1px solid #333;">${item.name}</a>`).join('')
            : `<div style="padding: 12px; color: #888;">Chưa có tài liệu</div>`;
    }

    if (labList) {
        labList.innerHTML = labData.length > 0 
            ? labData.map(item => `<a href="${item.link}" target="_blank" style="display:block; padding: 12px; color: white; text-decoration: none; border-bottom: 1px solid #333;">${item.name}</a>`).join('')
            : `<div style="padding: 12px; color: #888;">Chưa có tài liệu</div>`;
    }
}

function toggleDropdown(btn, event) {
    // Chặn không cho sự kiện lan ra ngoài gây đóng menu lập tức
    if (event) event.stopPropagation();

    const dropdown = btn.nextElementSibling;

    // In ra cửa sổ console để kiểm tra
    console.log("Đã bấm nút Dropdown!");
    console.log("Khối menu nhận được là:", dropdown);
    
    // Đóng tất cả các dropdown khác đang mở trên trang
    document.querySelectorAll('.dropdown-content').forEach(menu => {
        if (menu !== dropdown) {
            menu.classList.remove('show-menu');
        }
    });

    // Bật/tắt menu hiện tại bằng cách thêm/xóa class 'show-menu'
    dropdown.classList.toggle('show-menu');
}

// Tự động chạy hàm nạp dữ liệu slide khi trang web vừa load xong
document.addEventListener('DOMContentLoaded', function() {
    // Đảm bảo currentSubjectId đã có giá trị trước khi gọi (nếu nó được lấy từ URL)
    if (typeof currentSubjectId !== 'undefined' && currentSubjectId) {
        renderDropdowns();
    }
});

//=========================================
// Xử lý đóng menu khi bấm bất kỳ đâu ngoài nút bấm
//=========================================
document.addEventListener('click', function(event) {
    // Kiểm tra xem vị trí bấm có nằm trong dropdown-container nào không
    const isClickInside = event.target.closest('.dropdown-container');
    
    if (!isClickInside) {
        document.querySelectorAll('.dropdown-content').forEach(menu => {
            menu.classList.remove('show-menu');
        });
    }
});

//=========================================
// Lắng nghe sự kiện Enter cho toàn bộ Modal Quản lý Slide
//=========================================
document.addEventListener('DOMContentLoaded', function() {
    const slideModal = document.getElementById('slideModal');
    
    // Đảm bảo tìm thấy modal rồi mới gắn sự kiện
    if (slideModal) {
        slideModal.addEventListener('keydown', function(e) {
            // Kiểm tra: Nếu người dùng đang gõ trong thẻ INPUT và phím bấm là Enter
            if (e.target.tagName === 'INPUT' && e.key === 'Enter') {
                e.preventDefault(); 
                e.stopPropagation();
                
                console.log("Bắt được phím Enter trong Modal Slide, đang tiến hành lưu...");
                saveSlides(); 
            }
        });
    } else {
        console.error("LỖI: Không tìm thấy id='slideModal' trong file HTML.");
    }
});
//============================================================
// Khởi tạo logic ghi chú (Cả Lý thuyết và Lab)
//============================================================
function initNotesLogic() {
    const pId = getPageId(); // ID môn học
    
    // Khởi tạo khung HTML mặc định có sẵn 1 dấu chấm (bullet point)
    const defaultListHTML = "<ul style='margin-left: 20px;'><li><br></li></ul>";

    // 1. Ghi chú Lý thuyết
    const noteElement = document.getElementById('study-notes');
    if (noteElement) {
        const savedNote = localStorage.getItem('notes_' + pId);
        // Nếu có dữ liệu cũ thì hiển thị, nếu trống thì chèn dấu chấm mặc định
        if (savedNote && savedNote.trim() !== "") {
            noteElement.innerHTML = savedNote;
        } else {
            noteElement.innerHTML = defaultListHTML;
        }
        
        noteElement.addEventListener('input', () => {
            // Nếu người dùng xóa sạch sành sanh, tự động tạo lại dấu chấm
            if (noteElement.innerHTML.trim() === "" || noteElement.innerHTML === "<br>") {
                noteElement.innerHTML = defaultListHTML;
            }
            localStorage.setItem('notes_' + pId, noteElement.innerHTML);
        });
    }

    // 2. Ghi chú Lab
    const noteElementLab = document.getElementById('study-notes-lab');
    if (noteElementLab) {
        const savedNoteLab = localStorage.getItem('lab_notes_' + pId);
        if (savedNoteLab && savedNoteLab.trim() !== "") {
            noteElementLab.innerHTML = savedNoteLab;
        } else {
            noteElementLab.innerHTML = defaultListHTML;
        }
        
        noteElementLab.addEventListener('input', () => {
            if (noteElementLab.innerHTML.trim() === "" || noteElementLab.innerHTML === "<br>") {
                noteElementLab.innerHTML = defaultListHTML;
            }
            localStorage.setItem('lab_notes_' + pId, noteElementLab.innerHTML);
        });
    }
}

// ==========================================
// Hàm mở/đóng Modal Chỉnh sửa
// ==========================================
function openEditModal() {
    // 1. Lấy dữ liệu cài đặt của trang (custom_data) và dữ liệu từ trang chủ (card_data)
    let customData = JSON.parse(localStorage.getItem(`custom_data_${currentSubjectId}`)) || {};
    let cardData = JSON.parse(localStorage.getItem(`card_data_${currentSubjectId}`)) || {};
    
    // 2. Tự động điền link ảnh cũ vào ô nhập nếu có
    const bgUrlInput = document.getElementById('edit-bg-url');
    if (bgUrlInput) {
        if (customData.bgImage && (customData.bgImage.startsWith('http://') || customData.bgImage.startsWith('https://'))) {
            bgUrlInput.value = customData.bgImage; // Điền link vào ô
        } else {
            bgUrlInput.value = ""; // Nếu là ảnh Base64 máy tính hoặc chưa có ảnh thì để trống
        }
    }

    // 3. Đổ dữ liệu tên nút Lý thuyết
    const btn1Input = document.getElementById('edit-btn1-name');
    if (btn1Input) btn1Input.value = customData.btn1Name || "Đề cương môn học";
    
    const btn2Input = document.getElementById('edit-btn2-name');
    if (btn2Input) btn2Input.value = customData.btn2Name || "Nội quy môn học";

    // 4. KIỂM TRA HIỂN THỊ VÀ ĐỔ DỮ LIỆU KHU VỰC LAB
    const editLabSection = document.getElementById('edit-lab-section');
    if (editLabSection) {
        // Chỉ hiện ra nếu ngoài trang chủ có tích nút "Có thực hành"
        if (cardData.hasLab === true) {
            editLabSection.style.display = 'block'; 
            
            // Đổ tên nút Lab cũ ra (nếu có)
            const labBtn1Input = document.getElementById('edit-lab-btn1-name');
            if (labBtn1Input) labBtn1Input.value = customData.labBtn1Name || "Báo cáo mẫu";
            
            const labBtn2Input = document.getElementById('edit-lab-btn2-name');
            if (labBtn2Input) labBtn2Input.value = customData.labBtn2Name || "Hướng dẫn thí nghiệm";
        } else {
            // Ẩn hoàn toàn nếu môn này không có Lab
            editLabSection.style.display = 'none'; 
        }
    }

    // 5. Hiển thị Modal
    const editModal = document.getElementById('editModal');
    if (editModal) editModal.style.display = 'block';
    attachEnterKeyHandler('editModal', handleSave);

    // 6. Gọi hàm hiển thị các file đã lưu (nếu có) ngay trong modal xem nhanh
    renderSavedFileUI(); 
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    detachEnterKeyHandler('editModal');
}

//=========================================
// Lắng nghe sự kiện gõ phím enter cho Modal Chỉnh sửa 
//=========================================
function attachEnterKeyHandler(modalId, actionFunction) {
    // Định nghĩa hàm xử lý
    const handleEnter = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Đang gọi trực tiếp hàm xử lý cho ${modalId}...`);
            await actionFunction();
        }
    };

    // Tìm tất cả các ô input bên trong cái Modal cụ thể đó
    const inputs = document.querySelectorAll(`#${modalId} input`);
    inputs.forEach(input => {
        input.addEventListener('keydown', handleEnter);
        input._enterHandler = handleEnter; // Lưu lại để tí gỡ
    });
}

function detachEnterKeyHandler(modalId) {
    const inputs = document.querySelectorAll(`#${modalId} input`);
    inputs.forEach(input => {
        if (input._enterHandler) {
            input.removeEventListener('keydown', input._enterHandler);
            delete input._enterHandler;
        }
    });
}

// ==========================================
// Hàm chuyển đổi ảnh nền sang Base64, nén Giữ nét Full HD, giảm dung lượng xuống ~200KB
// ==========================================
function bgFileToBase64(file) {
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

            // Ảnh nền giữ chuẩn Full HD để nét căng khi làm background
            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1080;

            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }
            if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

        // Nén ở mức 0.8 (Chất lượng cao 80%) - Ảnh cực nét nhưng dung lượng giảm 90%
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                resolve(compressedBase64);
        };
    };
    reader.onerror = error => reject(error);
    });
}

// Hàm nén ảnh trả về đối tượng File (để lưu vào IndexedDB thay vì Base64 cồng kềnh)
function compressImageToFile(file, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                
                // Giới hạn max 1920px
                if (width > 1920) { height = Math.round((height * 1920) / width); width = 1920; }
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                
                // Nén và trả về đối tượng File
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', quality);
            };
        };
    });
}

// ==========================================
// Khởi tạo và kết nối nhà kho IndexedDB
// ==========================================
// Đổi hẳn tên Database mới để trình duyệt làm lại từ đầu, vứt bỏ bản bị lỗi
const DB_NAME = "StudyApp_Data_v1"; 
const DB_VERSION = 1;

// ==========================================
// 1. HÀM CỐT LÕI: Mở DB và ĐẢM BẢO kho 'files' luôn tồn tại
// ==========================================
function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        // Dù là tải, lưu hay xóa, nếu chưa có kho 'files' thì đều phải tạo
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files');
            }
        };
        
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// ==========================================
// 2. HÀM LƯU FILE (Bất đồng bộ)
// ==========================================
async function saveFileToIndexedDB(key, file) {
    const db = await getDB(); // Gọi hàm cốt lõi ở trên
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        const putRequest = store.put(file, key);
        
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
    });
}

// ==========================================
// 3. HÀM LẤY FILE (Bất đồng bộ)
// ==========================================
async function getFileFromIndexedDB(key) {
    const db = await getDB(); // Gọi hàm cốt lõi ở trên
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
    });
}

// ==========================================
// 4. HÀM XÓA FILE (Bất đồng bộ)
// ==========================================
async function deleteFileFromIndexedDB(key) {
    const db = await getDB(); // Gọi hàm cốt lõi ở trên
    return new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains('files')) {
            return resolve(true);
        }
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        const deleteRequest = store.delete(key);
        
        deleteRequest.onsuccess = () => resolve(true);
        deleteRequest.onerror = () => reject(deleteRequest.error);
    });
}

// ===================================
// Hàm mở file PDF/Ảnh từ IndexedDB
// ===================================
// Hàm đọc file từ IndexedDB - PHIÊN BẢN CHỐNG CHẶN POP-UP
async function viewFile(subjectId, fileType, buttonName) {
    const key = `${subjectId}_${fileType}`; 
    try {
        // 1. Kiểm tra trong kho IndexedDB trước
        const file = await getFileFromIndexedDB(key);
        if (file) {
            viewDocument(buttonName, file); // Mở bằng file trong IndexedDB
            return;
        }
        
        // 2. Dự phòng: Nếu là dữ liệu cũ chưa chuyển đổi, lục lại LocalStorage
        const rawData = localStorage.getItem(`custom_data_${subjectId}`);
        if (rawData) {
            const customData = JSON.parse(rawData);
            if (customData[fileType]) {
                viewDocument(buttonName, customData[fileType]); // Mở bằng Base64 cũ
                return;
            }
        }
        
        // 3. Nếu cả 2 nơi đều không có
        viewDocument(buttonName, null);
        
    } catch (error) {
        console.error("Lỗi khi đọc file:", error);
        alert("Có lỗi xảy ra khi mở tài liệu: " + error.message);
    }
}

// ============================================
// Hàm kiểm tra file PDF có vượt quá 25MB không
// ============================================
function isValidFileSize(file, inputId) {
    if (!file) return false;
    
    const MAX_SIZE_MB = 25;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
        // Tính ra dung lượng thực tế của file để báo cho người dùng
        const actualSize = (file.size / (1024 * 1024)).toFixed(1);
        alert(`❌ File "${file.name}" quá lớn (${actualSize}MB)!\n\nVui lòng chọn file dưới ${MAX_SIZE_MB}MB để đảm bảo hệ thống hoạt động mượt mà.`);
        
        // Reset (Xóa) file khỏi ô input để không bị lưu nhầm
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = "";
        
        return false; // Trả về false để chặn lại
    }
    return true; // File hợp lệ
}

// ==========================================
// Hàm Lưu dữ liệu
// ==========================================
async function handleSave() {
    if (!currentSubjectId) return;

    // 1. VÔ HIỆU HÓA TẤT CẢ INTERVAL ĐỂ TRÁNH XUNG ĐỘT LUỒNG GHI
    if (typeof enforceDataInterval !== 'undefined') {
        clearInterval(enforceDataInterval);
    }
    for (let i = 1; i < 100; i++) {
        window.clearInterval(i);
    }

    // 2. Đổi chữ trên nút để báo hiệu đang xử lý
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "Đang xử lý dữ liệu, vui lòng đợi...";
    saveBtn.disabled = true; 

    await new Promise(resolve => setTimeout(resolve, 50));
    
    let customData = JSON.parse(localStorage.getItem(`custom_data_${currentSubjectId}`)) || {};
    let cardData = JSON.parse(localStorage.getItem(`card_data_${currentSubjectId}`)) || {};
    
    try {
        const bgFileInput = document.getElementById('edit-bg-file');
        const bgFile = bgFileInput ? bgFileInput.files[0] : undefined;
        const bgUrlInput = document.getElementById('edit-bg-url');
        const bgUrl = bgUrlInput ? bgUrlInput.value.trim() : "";

        // XỬ LÝ LƯU HOẶC XÓA HÌNH NỀN THÔNG MINH
        if (bgFileInput && bgFileInput.getAttribute('data-deleted') === 'true') {
            customData.bgImage = ""; 
            bgFileInput.removeAttribute('data-deleted');
            if (bgUrlInput) bgUrlInput.value = ""; 
        } 
        else if (bgUrl !== "") {
            customData.bgImage = bgUrl;
        } 
        else if (bgFile) {
            // Ảnh nền vẫn dùng bgFileToBase64 vì LocalStorage cần String
            customData.bgImage = await bgFileToBase64(bgFile);
        } 
        else {
            if (customData.bgImage && (customData.bgImage.startsWith('http://') || customData.bgImage.startsWith('https://'))) {
                customData.bgImage = ""; 
            }
        }

        // ==========================================
        // LƯU FILE TÀI LIỆU LÝ THUYẾT
        // ==========================================
        const btn1Input = document.getElementById('edit-btn1-file');
        const btn2Input = document.getElementById('edit-btn2-file');
        
        // ==========================================
        // LƯU FILE TÀI LIỆU LÝ THUYẾT
        // ==========================================
        customData.btn1Name = document.getElementById('edit-btn1-name').value || "Đề cương môn học";
        if (btn1Input.files[0] && isValidFileSize(btn1Input.files[0], 'edit-btn1-file')) {
            let fileToSave = btn1Input.files[0];
            
            // Nếu tải lên ảnh -> Nén trước khi đưa vào IndexedDB
            if (fileToSave.type.startsWith('image/')) {
                fileToSave = await compressImageToFile(fileToSave);
            } 
            // TRỊ LỖI ĐỨNG WEB: Băm nhỏ file PDF trước khi lưu
            else if (fileToSave.type === 'application/pdf') {
                const buffer = await fileToSave.arrayBuffer();
                fileToSave = new Blob([buffer], { type: 'application/pdf' });
            }
            
            await saveFileToIndexedDB(`${currentSubjectId}_btn1File`, fileToSave);
            customData.hasBtn1File = true;
            delete customData.btn1File;
        } else if (btn1Input.getAttribute('data-deleted') === 'true') {
            customData.hasBtn1File = false;
            delete customData.btn1File;
            btn1Input.removeAttribute('data-deleted');
            await deleteFileFromIndexedDB(`${currentSubjectId}_btn1File`);
        }

        customData.btn2Name = document.getElementById('edit-btn2-name').value || "Nội quy môn học";
        if (btn2Input.files[0] && isValidFileSize(btn2Input.files[0], 'edit-btn2-file')) {
            let fileToSave = btn2Input.files[0];
            
            if (fileToSave.type.startsWith('image/')) {
                fileToSave = await compressImageToFile(fileToSave);
            }
            // TRỊ LỖI ĐỨNG WEB: Băm nhỏ file PDF trước khi lưu
            else if (fileToSave.type === 'application/pdf') {
                const buffer = await fileToSave.arrayBuffer();
                fileToSave = new Blob([buffer], { type: 'application/pdf' });
            }

            await saveFileToIndexedDB(`${currentSubjectId}_btn2File`, fileToSave);
            customData.hasBtn2File = true;
            delete customData.btn2File;
        } else if (btn2Input.getAttribute('data-deleted') === 'true') {
            customData.hasBtn2File = false;
            delete customData.btn2File;
            btn2Input.removeAttribute('data-deleted');
            await deleteFileFromIndexedDB(`${currentSubjectId}_btn2File`);
        }

        // ==========================================
        // LƯU FILE TÀI LIỆU LAB (Chỉ thực hiện khi có Lab)
        // ==========================================
        if (cardData.hasLab === true) {
            const labBtn1Input = document.getElementById('edit-lab-btn1-file');
            const labBtn2Input = document.getElementById('edit-lab-btn2-file');

            customData.labBtn1Name = document.getElementById('edit-lab-btn1-name').value || "Báo cáo mẫu";
            if (labBtn1Input.files[0] && isValidFileSize(labBtn1Input.files[0], 'edit-lab-btn1-file')) {
                let fileToSave = labBtn1Input.files[0];
                
                if (fileToSave.type.startsWith('image/')) {
                    fileToSave = await compressImageToFile(fileToSave);
                }
                // TRỊ LỖI ĐỨNG WEB: Băm nhỏ file PDF trước khi lưu
                else if (fileToSave.type === 'application/pdf') {
                    const buffer = await fileToSave.arrayBuffer();
                    fileToSave = new Blob([buffer], { type: 'application/pdf' });
                }

                await saveFileToIndexedDB(`${currentSubjectId}_labBtn1File`, fileToSave);
                customData.hasLabBtn1File = true;
                delete customData.labBtn1File;
            } else if (labBtn1Input.getAttribute('data-deleted') === 'true') {
                customData.hasLabBtn1File = false;
                delete customData.labBtn1File;
                labBtn1Input.removeAttribute('data-deleted');
                await deleteFileFromIndexedDB(`${currentSubjectId}_labBtn1File`);
            }

            customData.labBtn2Name = document.getElementById('edit-lab-btn2-name').value || "Hướng dẫn thí nghiệm";
            if (labBtn2Input.files[0] && isValidFileSize(labBtn2Input.files[0], 'edit-lab-btn2-file')) {
                let fileToSave = labBtn2Input.files[0];
                
                if (fileToSave.type.startsWith('image/')) {
                    fileToSave = await compressImageToFile(fileToSave);
                }
                // TRỊ LỖI ĐỨNG WEB: Băm nhỏ file PDF trước khi lưu
                else if (fileToSave.type === 'application/pdf') {
                    const buffer = await fileToSave.arrayBuffer();
                    fileToSave = new Blob([buffer], { type: 'application/pdf' });
                }

                await saveFileToIndexedDB(`${currentSubjectId}_labBtn2File`, fileToSave);
                customData.hasLabBtn2File = true;
                delete customData.labBtn2File;
            } else if (labBtn2Input.getAttribute('data-deleted') === 'true') {
                customData.hasLabBtn2File = false;
                delete customData.labBtn2File;
                labBtn2Input.removeAttribute('data-deleted');
                await deleteFileFromIndexedDB(`${currentSubjectId}_labBtn2File`);
            }
        }
        
        // Lưu các thông tin text vào LocalStorage như cũ
        localStorage.setItem(`custom_data_${currentSubjectId}`, JSON.stringify(customData));
        
        // Cho trình duyệt nghỉ 100ms giải phóng luồng IO
        await new Promise(resolve => setTimeout(resolve, 100));

        // ÉP TẢI LẠI TRANG
        window.location.href = window.location.origin + window.location.pathname + window.location.search;

    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        alert("Lỗi hệ thống trong quá trình lưu: " + error.message);
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }
}
window.onload = renderComponents;

//===========================================================
// Hàm hiện file đã lưu + có nút X để xóa (Chờ lưu mới tác dụng)
//===========================================================
// Hàm 1: Gắn cờ xóa và ẩn giao diện
function deleteFileFromStorage(fileKey, inputId) {
    if (!confirm("Bạn có chắc chắn muốn xóa file này? (File sẽ được xóa hẳn khi bạn bấm Xác nhận & Lưu)")) return;

    // 1. Ẩn cái nhãn hiển thị trên giao diện
    const badge = document.getElementById(`saved-badge-${inputId}`);
    if (badge) badge.style.display = 'none';

    // 2. Reset ô chọn file và gắn CỜ BỊ XÓA (data-deleted)
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
        inputEl.value = "";
        inputEl.setAttribute('data-deleted', 'true');
    }
}

// Hàm 2: Quét và hiển thị các file đã lưu lên Modal
async function renderSavedFileUI() {
    if (!currentSubjectId) return;
    
    // 1. Vẫn lấy LocalStorage để kiểm tra Ảnh nền hoặc dữ liệu bản cũ
    let customData = JSON.parse(localStorage.getItem(`custom_data_${currentSubjectId}`)) || {};
    
    // 2. Thêm cờ 'store' để phân biệt cái nào tìm ở đâu
    const filesToCheck = [
        { id: 'edit-bg-file', key: 'bgImage', label: '🖼️ Ảnh nền đã lưu', store: 'local' }, 
        { id: 'edit-btn1-file', key: 'btn1File', label: '📄 Đã lưu tài liệu', store: 'idb' },
        { id: 'edit-btn2-file', key: 'btn2File', label: '📄 Đã lưu tài liệu', store: 'idb' },
        { id: 'edit-lab-btn1-file', key: 'labBtn1File', label: '📄 Đã lưu tài liệu', store: 'idb' },
        { id: 'edit-lab-btn2-file', key: 'labBtn2File', label: '📄 Đã lưu tài liệu', store: 'idb' }
    ];

    // 3. Đổi từ forEach sang for...of để có thể dùng await bên trong vòng lặp
    for (const item of filesToCheck) {
        const inputEl = document.getElementById(item.id);
        if (!inputEl) continue; // Dùng continue thay vì return để đi tiếp vòng lặp
        
        // Reset giao diện cũ
        inputEl.removeAttribute('data-deleted');
        const existing = document.getElementById(`saved-badge-${item.id}`);
        if (existing) existing.remove();

        let hasData = false;

        // 4. KIỂM TRA DỮ LIỆU DỰA VÀO NƠI LƯU TRỮ
        if (item.store === 'local') {
            // Nếu là ảnh nền, chỉ cần check LocalStorage
            if (customData[item.key]) {
                hasData = true;
            }
        } else if (item.store === 'idb') {
            // Nếu là tài liệu, check IndexedDB trước
            const idbKey = `${currentSubjectId}_${item.key}`; // Key giống format hàm viewFile của bạn
            try {
                const fileFromDB = await getFileFromIndexedDB(idbKey);
                if (fileFromDB) {
                    hasData = true; // Tìm thấy trong IndexedDB
                } else if (customData[item.key]) {
                    hasData = true; // Tìm thấy bản Base64 dự phòng trong LocalStorage
                }
            } catch (error) {
                console.error(`Lỗi khi quét IndexedDB cho ${idbKey}:`, error);
            }
        }

        // 5. Nếu có dữ liệu thì vẽ cái Badge (nhãn) ra
        if (hasData) {
            const badge = document.createElement('div');
            badge.id = `saved-badge-${item.id}`;
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.marginLeft = '15px';
            badge.style.padding = '4px 12px';
            badge.style.background = 'rgba(76, 175, 80, 0.15)'; 
            badge.style.border = '1px solid #4CAF50';
            badge.style.borderRadius = '8px';
            badge.style.fontSize = '13px';
            badge.style.color = '#4CAF50';

            badge.innerHTML = `
                <span style="margin-right: 10px;">${item.label}</span>
                <button type="button" onclick="deleteFileFromStorage('${item.key}', '${item.id}')" style="background: #ff4a4a; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer; display: flex; justify-content: center; align-items: center; font-weight: bold; transition: 0.2s;">X</button>
            `;
            
            inputEl.parentNode.insertBefore(badge, inputEl.nextSibling);
        }
    }
}
//================================================
// Hàm xử lý hiển thị tài liệu trực tiếp khi ấn vào nút xem tài liệu
//================================================
function viewDocument(buttonName, fileData) {
    if (!fileData || fileData === "#" || fileData === true) {
        alert(`Nút "${buttonName}" chưa được tải lên hình ảnh hoặc tài liệu nào hết! Hãy bấm Chỉnh sửa để cập nhật.`);
        return;
    }

    const modal = document.getElementById('previewModal');
    const titleEl = document.getElementById('preview-title');
    const contentContainer = document.getElementById('preview-content');

    if (!modal || !titleEl || !contentContainer) return;

    // Thiết lập tên tiêu đề hiển thị trên modal
    titleEl.innerHTML = `<i class="fa-solid fa-eye"></i> Đang xem: ${buttonName}`;
    contentContainer.innerHTML = ""; // Xóa dữ liệu cũ của lần xem trước

    let fileURL = "";
    let isImage = false;
    let isPDF = false;

    // GIẢI PHÁP MỚI: Nếu fileData là FILE NGUYÊN BẢN (Blob từ IndexedDB)
    if (fileData instanceof Blob) {
        fileURL = URL.createObjectURL(fileData); // Tạo link ảo cho Modal đọc
        if (fileData.type.startsWith('image/')) isImage = true;
        if (fileData.type === 'application/pdf') isPDF = true;
    } 
    // GIẢI PHÁP CŨ: Nếu fileData là CHUỖI CHỮ (Base64 hoặc Link Online từ LocalStorage)
    else if (typeof fileData === 'string') {
        fileURL = fileData;
        if (fileData.startsWith('data:image/') || fileData.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || (fileData.startsWith('http') && !fileData.includes('drive.google.com'))) {
            isImage = true;
        } else if (fileData.startsWith('data:application/pdf')) {
            isPDF = true;
        }
    }

    // TRƯỜNG HỢP 1: Nếu là FILE ẢNH
    if (isImage) {
        const img = document.createElement('img');
        img.src = fileURL;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.borderRadius = '8px';
        img.style.objectFit = 'contain';
        contentContainer.appendChild(img);
    } 
    // TRƯỜNG HỢP 2: Nếu là FILE PDF
    else if (isPDF) {
        const iframe = document.createElement('iframe');
        iframe.src = fileURL;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        contentContainer.appendChild(iframe);
    } 
    // TRƯỜNG HỢP 3: Không phải ảnh cũng không phải PDF (VD: Word, Excel, Zip...)
    else {
        contentContainer.innerHTML = `
            <div style="padding: 40px 20px; color: #ff4a4a; text-align: center; font-family: sans-serif; width: 100%;">
                <div style="font-size: 50px; margin-bottom: 15px;">⚠️</div>
                <h3 style="margin-bottom: 10px; font-size: 20px;">Định dạng file không được hỗ trợ xem trực tiếp!</h3>
                <p style="color: #aaa; line-height: 1.6; font-size: 16px;">
                    Trình duyệt hiện tại chỉ hỗ trợ xem trực tiếp các file <b>Ảnh (JPG, PNG)</b> và <b>PDF</b>.
                </p>
                <div style="margin-top: 25px;">
                    <button onclick="closePreviewModal()" style="padding: 12px 25px; background: #333; color: white; border: 1px solid #555; border-radius: 8px; font-weight: bold; cursor: pointer; margin-right: 10px;">
                        Đóng cửa sổ
                    </button>
                    <a href="${fileURL}" download="${buttonName}" style="display: inline-block; padding: 12px 25px; background: #007AFF; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Tải file xuống máy
                    </a>
                </div>
            </div>
        `;
    }

    // Hiển thị modal lên màn hình
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Khóa cuộn trang chính ở dưới
}

// Hàm đóng bảng xem nhanh
function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Mở lại cuộn trang chính
}

