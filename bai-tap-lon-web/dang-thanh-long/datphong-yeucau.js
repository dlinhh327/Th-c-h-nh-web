/* ============================================================
   JS RIÊNG CHO 2 TRANG: ĐẶT PHÒNG (datphong.html)
                         và YÊU CẦU ĐẶT PHÒNG (yeucau.html)

   Mỗi trang nạp theo thứ tự:  chung.js  ->  datphong-yeucau.js
   File này có 3 phần:
     Phần 1: các hàm của trang ĐẶT PHÒNG
     Phần 2: các hàm của trang YÊU CẦU
     Phần 3: kiểm tra đang ở trang nào rồi chạy phần tương ứng
   ============================================================ */


// Người đang đăng nhập (dùng cho cả 2 trang)
const nguoi = layNguoiDangNhap();

// Tab đang chọn ở trang Yêu cầu
let tabHienTai = "Chờ duyệt";


/* ============================================================
   PHẦN 1: TRANG ĐẶT PHÒNG
   ============================================================ */

// Hiện thông tin phòng đang chọn và các lịch đã đặt của phòng trong ngày
function hienThongTin() {
  const phong = timPhong(document.getElementById("d-phong").value);
  const ngay = document.getElementById("d-ngay").value;
  if (phong == null) {
    return;
  }

  let html = '<div class="anh-phong">🏫 ' + anToan(phong.ten) + "</div>";
  html += '<div class="dong-tt">Tòa nhà: <b>' + anToan(phong.toa) + "</b></div>";
  html += '<div class="dong-tt">Sức chứa: <b>' + phong.sucChua + " người</b></div>";
  html += '<div class="dong-tt">Thiết bị: <b>' + anToan(phong.thietBi) + "</b></div>";
  html += '<div class="dong-tt">Trạng thái: ' + nhanPhong(trangThaiPhong(phong)) + "</div>";

  // Lịch của phòng trong ngày đã chọn
  if (ngay != "") {
    html += "<h4 style='margin-top:14px'>Lịch của phòng ngày " + dinhDangNgay(ngay) + "</h4>";
    const dsYeuCau = layYeuCau();
    let coLich = false;
    for (let i = 0; i < dsYeuCau.length; i++) {
      const y = dsYeuCau[i];
      if (y.phong == phong.ma && y.ngay == ngay && y.trangThai != "Từ chối") {
        html += '<div class="dong-tt"><b>' + y.tu + " - " + y.den + "</b> " + anToan(y.mucDich) + " " + nhanYeuCau(y.trangThai) + "</div>";
        coLich = true;
      }
    }
    if (coLich == false) {
      html += "<p>Chưa có lịch nào - phòng còn trống cả ngày.</p>";
    }
  }

  document.getElementById("thong-tin-phong").innerHTML = html;
}

// Bấm nút "Gửi yêu cầu"
function guiYeuCau() {
  const maPhong = document.getElementById("d-phong").value;
  const ngay = document.getElementById("d-ngay").value;
  const tu = document.getElementById("d-tu").value;
  const den = document.getElementById("d-den").value;
  const mucDich = document.getElementById("d-muc-dich").value.trim();

  // ----- Kiểm tra dữ liệu -----
  if (ngay == "" || mucDich == "") {
    hienThongBao("bao-loi", "Vui lòng chọn ngày và nhập mục đích sử dụng.", "loi");
    return;
  }
  if (ngay < homNay()) {
    hienThongBao("bao-loi", "Không thể đặt phòng cho ngày đã qua.", "loi");
    return;
  }
  if (tu >= den) {
    hienThongBao("bao-loi", "Giờ kết thúc phải sau giờ bắt đầu.", "loi");
    return;
  }
  if (ngay == homNay() && tu < gioHienTai()) {
    hienThongBao("bao-loi", "Giờ bắt đầu đã qua. Hãy chọn giờ khác hoặc ngày khác.", "loi");
    return;
  }

  const phong = timPhong(maPhong);
  if (phong.tinhTrang == "Bảo trì") {
    hienThongBao("bao-loi", "Phòng " + maPhong + " đang bảo trì, không thể đặt.", "loi");
    return;
  }

  const trung = timYeuCauTrung(maPhong, ngay, tu, den, 0);
  if (trung != null) {
    hienThongBao("bao-loi", "Phòng " + maPhong + " đã có lịch được duyệt từ " + trung.tu + " đến " + trung.den + ". Vui lòng chọn giờ khác.", "loi");
    return;
  }

  // ----- Lưu yêu cầu -----
  // Admin đặt thì được duyệt luôn, giảng viên đặt thì chờ Admin duyệt
  let trangThai = "Chờ duyệt";
  let tenNguoiDat = "GV. " + nguoi.ten;
  if (nguoi.vaiTro == "Admin") {
    trangThai = "Đã duyệt";
    tenNguoiDat = "Admin " + nguoi.ten;
  }

  const ds = layYeuCau();
  let idMoi = 1;
  if (ds.length > 0) {
    idMoi = ds[ds.length - 1].id + 1;   // id mới = id của yêu cầu cuối + 1
  }
  ds.push({
    id: idMoi,
    phong: maPhong,
    ngay: ngay,
    tu: tu,
    den: den,
    mucDich: mucDich,
    nguoiDat: nguoi.ma,
    tenNguoiDat: tenNguoiDat,
    trangThai: trangThai,
    lyDo: ""
  });
  luuDuLieu("ql_yeuCau", ds);

  if (trangThai == "Đã duyệt") {
    hienThongBao("bao-loi", "Đặt phòng thành công (đã được duyệt).", "ok");
  } else {
    hienThongBao("bao-loi", "Đã gửi yêu cầu! Vui lòng chờ Admin duyệt. Xem tại mục \"Yêu cầu của tôi\".", "ok");
  }
  document.getElementById("d-muc-dich").value = "";
  hienThongTin();
}

// Chuẩn bị trang Đặt phòng khi vừa mở
function khoiTaoDatPhong() {
  // Đổ danh sách phòng vào ô chọn
  let htmlPhong = "";
  const dsPhong = layPhong();
  for (let i = 0; i < dsPhong.length; i++) {
    const p = dsPhong[i];
    let them = "";
    if (p.tinhTrang == "Bảo trì") {
      them = " - Đang bảo trì";
    }
    htmlPhong += '<option value="' + p.ma + '">' + anToan(p.ten) + " (" + p.sucChua + " người)" + them + "</option>";
  }
  document.getElementById("d-phong").innerHTML = htmlPhong;

  // Đổ danh sách giờ (07:00, 07:30, 08:00 ... 21:00) vào 2 ô chọn giờ
  let htmlGio = "";
  for (let gio = 7; gio <= 20; gio++) {
    htmlGio += "<option>" + soCo2Chu(gio) + ":00</option>";
    htmlGio += "<option>" + soCo2Chu(gio) + ":30</option>";
  }
  htmlGio += "<option>21:00</option>";
  document.getElementById("d-tu").innerHTML = htmlGio;
  document.getElementById("d-den").innerHTML = htmlGio;
  document.getElementById("d-tu").value = "08:00";
  document.getElementById("d-den").value = "10:00";

  // Ngày mặc định là hôm nay, không cho chọn ngày đã qua
  document.getElementById("d-ngay").value = homNay();
  document.getElementById("d-ngay").min = homNay();

  if (nguoi.vaiTro == "Admin") {
    document.getElementById("ghi-chu").textContent = "Admin đặt phòng sẽ được duyệt ngay.";
  } else {
    document.getElementById("ghi-chu").textContent = "Yêu cầu cần được Admin duyệt trước khi sử dụng phòng.";
  }

  hienThongTin();
}


/* ============================================================
   PHẦN 2: TRANG YÊU CẦU ĐẶT PHÒNG
   Admin: xem tất cả, duyệt hoặc từ chối
   Giảng viên: xem yêu cầu của mình, có thể hủy
   ============================================================ */

// Yêu cầu này người đang đăng nhập có được xem không?
// (Admin xem được tất cả, giảng viên chỉ xem của mình)
function duocXem(y) {
  if (nguoi.vaiTro == "Admin") {
    return true;
  }
  return y.nguoiDat == nguoi.ma;
}

// Vẽ lại bảng và số đếm trên các tab
function veBangYeuCau() {
  const ds = layYeuCau();
  let demCho = 0;
  let demDuyet = 0;
  let demTuChoi = 0;
  let html = "";

  // Duyệt từ cuối lên để yêu cầu mới nhất nằm trên cùng
  for (let i = ds.length - 1; i >= 0; i--) {
    const y = ds[i];
    if (duocXem(y) == false) {
      continue;   // bỏ qua, xem yêu cầu tiếp theo
    }

    // Đếm cho các tab
    if (y.trangThai == "Chờ duyệt") { demCho++; }
    if (y.trangThai == "Đã duyệt") { demDuyet++; }
    if (y.trangThai == "Từ chối") { demTuChoi++; }

    // Chỉ vẽ các yêu cầu thuộc tab đang chọn
    if (y.trangThai != tabHienTai) {
      continue;
    }

    // Nút thao tác (i là vị trí của yêu cầu trong danh sách)
    let nut = "";
    if (nguoi.vaiTro == "Admin") {
      if (y.trangThai == "Chờ duyệt") {
        nut = '<button class="nut-nho xanh" onclick="duyet(' + i + ')">Duyệt</button> ' +
              '<button class="nut-nho do" onclick="tuChoi(' + i + ')">Từ chối</button>';
      } else if (y.trangThai == "Đã duyệt") {
        nut = '<button class="nut-nho do" onclick="tuChoi(' + i + ')">Thu hồi</button>';
      }
    } else {
      nut = '<button class="nut-nho do" onclick="huy(' + i + ')">Hủy yêu cầu</button>';
    }

    // Nếu bị từ chối thì hiện lý do
    let trangThai = nhanYeuCau(y.trangThai);
    if (y.trangThai == "Từ chối") {
      trangThai += "<br><small>Lý do: " + anToan(y.lyDo) + "</small>";
    }

    html += "<tr>";
    html += "<td>" + dinhDangNgay(y.ngay) + "</td>";
    html += "<td>" + anToan(y.tenNguoiDat) + "</td>";
    html += "<td><b>" + y.phong + "</b></td>";
    html += "<td>" + y.tu + " - " + y.den + "</td>";
    html += "<td>" + anToan(y.mucDich) + "</td>";
    html += "<td>" + trangThai + "</td>";
    html += "<td>" + nut + "</td>";
    html += "</tr>";
  }

  if (html == "") {
    html = '<tr><td colspan="7">Không có yêu cầu nào.</td></tr>';
  }
  document.getElementById("bang-yeu-cau").innerHTML = html;
  document.getElementById("dem-cho").textContent = demCho;
  document.getElementById("dem-duyet").textContent = demDuyet;
  document.getElementById("dem-tuchoi").textContent = demTuChoi;
}

// Bấm vào một tab
function chonTab(ten) {
  tabHienTai = ten;
  document.getElementById("tab-cho").className = "";
  document.getElementById("tab-duyet").className = "";
  document.getElementById("tab-tuchoi").className = "";
  if (ten == "Chờ duyệt") {
    document.getElementById("tab-cho").className = "dang-chon";
  } else if (ten == "Đã duyệt") {
    document.getElementById("tab-duyet").className = "dang-chon";
  } else {
    document.getElementById("tab-tuchoi").className = "dang-chon";
  }
  veBangYeuCau();
}

// Admin DUYỆT (i là vị trí của yêu cầu trong danh sách)
function duyet(i) {
  const ds = layYeuCau();
  const y = ds[i];

  // Phòng đang bảo trì thì không duyệt
  const phong = timPhong(y.phong);
  if (phong != null && phong.tinhTrang == "Bảo trì") {
    hienThongBao("thong-bao", "Không thể duyệt: phòng " + y.phong + " đang bảo trì.", "loi");
    return;
  }

  // Trùng giờ với yêu cầu đã duyệt khác thì không duyệt
  const trung = timYeuCauTrung(y.phong, y.ngay, y.tu, y.den, y.id);
  if (trung != null) {
    hienThongBao("thong-bao", "Không thể duyệt: phòng " + y.phong + " đã có lịch được duyệt từ " + trung.tu + " đến " + trung.den + ".", "loi");
    return;
  }

  y.trangThai = "Đã duyệt";
  y.lyDo = "";
  luuDuLieu("ql_yeuCau", ds);
  hienThongBao("thong-bao", "Đã duyệt yêu cầu của " + y.tenNguoiDat + ".", "ok");
  veBangYeuCau();
}

// Admin TỪ CHỐI (hoặc thu hồi)
function tuChoi(i) {
  const lyDo = prompt("Nhập lý do từ chối:");
  if (lyDo == null) {
    return;   // người dùng bấm Cancel
  }
  const ds = layYeuCau();
  ds[i].trangThai = "Từ chối";
  ds[i].lyDo = lyDo.trim();
  if (ds[i].lyDo == "") {
    ds[i].lyDo = "Không có lý do";
  }
  luuDuLieu("ql_yeuCau", ds);
  hienThongBao("thong-bao", "Đã từ chối yêu cầu.", "ok");
  veBangYeuCau();
}

// Giảng viên HỦY yêu cầu của mình
function huy(i) {
  if (confirm("Bạn có chắc muốn hủy yêu cầu này không?") == false) {
    return;
  }
  const ds = layYeuCau();
  ds.splice(i, 1);
  luuDuLieu("ql_yeuCau", ds);
  hienThongBao("thong-bao", "Đã hủy yêu cầu.", "ok");
  veBangYeuCau();
}

// Chuẩn bị trang Yêu cầu khi vừa mở
function khoiTaoYeuCau() {
  if (nguoi.vaiTro != "Admin") {
    document.getElementById("tieu-de").textContent = "Yêu cầu của tôi";
  }
  veBangYeuCau();
}


/* ============================================================
   PHẦN 3: XEM ĐANG Ở TRANG NÀO RỒI CHẠY PHẦN TƯƠNG ỨNG
   (Trang Đặt phòng có ô id="form-dat-phong",
    trang Yêu cầu có ô id="bang-yeu-cau")
   ============================================================ */

const laTrangDatPhong = document.getElementById("form-dat-phong") != null;
const laTrangYeuCau = document.getElementById("bang-yeu-cau") != null;

// Vẽ menu trái (nếu chưa đăng nhập sẽ tự chuyển về trang đăng nhập)
if (laTrangDatPhong) {
  veMenu("datphong", false);
}
if (laTrangYeuCau) {
  veMenu("yeucau", false);
}

// Đã đăng nhập thì chạy phần chuẩn bị của trang đó
if (nguoi != null) {
  if (laTrangDatPhong) {
    khoiTaoDatPhong();
  }
  if (laTrangYeuCau) {
    khoiTaoYeuCau();
  }
}