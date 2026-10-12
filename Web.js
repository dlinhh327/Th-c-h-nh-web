// 1. Khởi tạo dữ liệu mặc định (Giống hệt ảnh 3 của bạn)
const defaultClasses = [
    {
        id: "IT1.107.3-1-1-26(N05.TH1)",
        name: "Kiến trúc và tổ chức máy tính-1-1-26(N05.TH1)",
        type: "Thực hành",
        start: "10/08/2026",
        end: "22/11/2026",
        note: "",
        isActive: true // Dòng màu xanh
    },
    {
        id: "IT1.106.3-1-1-26(N05.TH1)",
        name: "Thiết kế Web-1-1-26(N05.TH1)",
        type: "Thực hành",
        start: "10/08/2026",
        end: "22/11/2026",
        note: "",
        isActive: false
    },
    {
        id: "IT1.108.3-1-1-26(N03.TH1)",
        name: "Lập trình hướng đối tượng-1-1-26(N03.TH1)",
        type: "Thực hành",
        start: "10/08/2026",
        end: "22/11/2026",
        note: "",
        isActive: false
    },
    {
        id: "IT1.109.3-1-1-26(N05.TH1)",
        name: "Cấu trúc dữ liệu và giải thuật-1-1-26(N05.TH1)",
        type: "Thực hành",
        start: "10/08/2026",
        end: "22/11/2026",
        note: "",
        isActive: false
    }
];

// 2. Hàm lấy dữ liệu từ LocalStorage (Giúp không bị mất khi F5)
function getClassesFromDB() {
    const data = localStorage.getItem("scheduleData");
    if (data) {
        return JSON.parse(data);
    } else {
        // Lần đầu vào web chưa có data, lưu mặc định
        localStorage.setItem("scheduleData", JSON.stringify(defaultClasses));
        return defaultClasses;
    }
}

// 3. Hàm Render Dữ liệu ra HTML
function renderTable() {
    const tableBody = document.getElementById("class-table-body");
    const classData = getClassesFromDB();
    
    // Xóa rỗng bảng trước khi render lại
    tableBody.innerHTML = "";

    // Duyệt qua mảng và tạo chuỗi HTML
    classData.forEach(item => {
        // Xác định class cho dòng (để bôi xanh nếu isActive = true)
        const rowClass = item.isActive ? 'class="active-row"' : '';
        
        const rowHTML = `
            <tr ${rowClass}>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.start}</td>
                <td>${item.end}</td>
                <td>${item.note}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHTML);
    });
}

// 4. Xử lý Logic "Admin thêm dữ liệu"
document.getElementById("admin-form").addEventListener("submit", function(e) {
    e.preventDefault(); // Chặn hành vi load lại trang mặc định của form
    
    // Lấy giá trị input và format ngày tháng
    const maLop = document.getElementById("maLop").value;
    const tenLop = document.getElementById("tenLop").value;
    const rawStart = document.getElementById("ngayBatDau").value; // Format yyyy-mm-dd
    const rawEnd = document.getElementById("ngayKetThuc").value;
    
    // Đảo ngược chuỗi ngày cho giống định dạng Việt Nam (dd/mm/yyyy)
    const start = rawStart.split('-').reverse().join('/');
    const end = rawEnd.split('-').reverse().join('/');

    // Tạo object mới
    const newClass = {
        id: maLop,
        name: tenLop,
        type: "Lý thuyết", // Mặc định giả định
        start: start,
        end: end,
        note: "",
        isActive: false
    };

    // Lấy data cũ, thêm mới, và lưu lại
    const currentData = getClassesFromDB();
    currentData.push(newClass);
    localStorage.setItem("scheduleData", JSON.stringify(currentData));

    // Render lại giao diện và reset form
    renderTable();
    this.reset();
    alert("Thêm lớp học thành công!");
});

// Chức năng reset dữ liệu về mặc định (dành cho mục đích test)
document.getElementById("reset-db").addEventListener("click", function() {
    localStorage.removeItem("scheduleData");
    renderTable();
});

// Chạy hàm render ngay khi tải trang
renderTable();
