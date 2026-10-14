// Trang thời khoá biểu dạng lịch tháng / tuần.
// Dữ liệu lưu trong localStorage: thêm lịch ở form thì lịch hiển thị đúng như vậy.

var KEY = 'lichthang';
var viewMode = 'month';     // 'month' hoặc 'week'
var current = new Date();   // ngày đang xem

// ---------- Hàm tiện ích ----------
function pad(n) {
    return (n < 10 ? '0' : '') + n;
}

function toISO(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function addDays(d, n) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
}

// Lấy ngày thứ 2 của tuần chứa ngày d
function mondayOf(d) {
    return addDays(d, -((d.getDay() + 6) % 7));
}

function toMinutes(t) {
    var p = t.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}

// ---------- Đọc / ghi dữ liệu ----------
function saveEvents() {
    try {
        localStorage.setItem(KEY, JSON.stringify(events));
    } catch (e) {}
}

function loadEvents() {
    try {
        var data = JSON.parse(localStorage.getItem(KEY));
        if (data) {
            return data;
        }
    } catch (e) {}
    return null;
}

// Dữ liệu mẫu cho lần mở đầu tiên (nằm trong tháng hiện tại)
function seedEvents() {
    var y = new Date().getFullYear();
    var m = new Date().getMonth();
    function day(n) {
        return toISO(new Date(y, m, n));
    }
    return [
        { id: 's1', date: day(1),  room: 'A101', start: '08:00', end: '09:30', status: 'fixed',    note: '' },
        { id: 's2', date: day(10), room: 'B201', start: '10:00', end: '16:00', status: 'approved', note: '' },
        { id: 's3', date: day(11), room: 'A102', start: '07:00', end: '09:00', status: 'fixed',    note: '' },
        { id: 's4', date: day(15), room: 'C301', start: '15:00', end: '17:00', status: 'pending',  note: '' },
        { id: 's5', date: day(18), room: 'A103', start: '13:00', end: '15:00', status: 'rejected', note: '' },
        { id: 's6', date: day(25), room: 'B401', start: '16:00', end: '18:00', status: 'approved', note: '' }
    ];
}

var events = loadEvents();
if (!events) {
    events = seedEvents();
    saveEvents();
}

// ---------- Vẽ lịch ----------
function eventsOf(iso, query) {
    var list = events.filter(function (e) {
        var text = (e.room + ' ' + e.note).toLowerCase();
        return e.date === iso && (query === '' || text.indexOf(query) >= 0);
    });
    list.sort(function (a, b) {
        return toMinutes(a.start) - toMinutes(b.start);
    });
    var html = '';
    list.forEach(function (e) {
        var cls = e.status === 'fixed' ? 'event' : 'event ' + e.status;
        html += '<div class="' + cls + '" data-id="' + e.id + '" title="Bấm để xoá">';
        html += '<b>' + esc(e.room) + '</b><br>' + e.start + ' - ' + e.end;
        if (e.note) {
            html += '<small>' + esc(e.note) + '</small>';
        }
        html += '</div>';
    });
    return html;
}

function render() {
    var query = document.getElementById('search').value.trim().toLowerCase();
    var todayISO = toISO(new Date());
    var start, weeks, title;

    if (viewMode === 'month') {
        var first = new Date(current.getFullYear(), current.getMonth(), 1);
        var last = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        start = mondayOf(first);
        var days = Math.round((last - start) / 86400000) + 1;
        weeks = Math.ceil(days / 7);
        title = 'Tháng ' + (current.getMonth() + 1) + ', ' + current.getFullYear();
    } else {
        start = mondayOf(current);
        weeks = 1;
        var end = addDays(start, 6);
        title = 'Tuần ' + start.getDate() + '/' + (start.getMonth() + 1) + ' - ' +
                end.getDate() + '/' + (end.getMonth() + 1) + '/' + end.getFullYear();
    }

    var html = '';
    for (var w = 0; w < weeks; w++) {
        html += '<tr>';
        for (var i = 0; i < 7; i++) {
            var d = addDays(start, w * 7 + i);
            var iso = toISO(d);
            var cls = '';
            if (viewMode === 'month' && d.getMonth() !== current.getMonth()) {
                cls += ' other';
            }
            if (iso === todayISO) {
                cls += ' today';
            }
            html += '<td class="' + cls.trim() + '">';
            html += '<span class="day">' + d.getDate() + '</span>';
            html += eventsOf(iso, query);
            html += '</td>';
        }
        html += '</tr>';
    }

    document.getElementById('calendar-body').innerHTML = html;
    document.getElementById('month-title').textContent = title;
    document.getElementById('calendar').className = viewMode === 'week' ? 'week-view' : '';
    document.getElementById('btn-week').className = viewMode === 'week' ? 'active' : '';
    document.getElementById('btn-month').className = viewMode === 'month' ? 'active' : '';
}

// ---------- Các nút điều khiển ----------
function move(step) {
    if (viewMode === 'month') {
        current = new Date(current.getFullYear(), current.getMonth() + step, 1);
    } else {
        current = addDays(current, step * 7);
    }
    render();
}

document.getElementById('prev').onclick = function (e) { e.preventDefault(); move(-1); };
document.getElementById('next').onclick = function (e) { e.preventDefault(); move(1); };

document.getElementById('go-today').onclick = function (e) {
    e.preventDefault();
    current = new Date();
    render();
};

document.getElementById('btn-week').onclick = function (e) {
    e.preventDefault();
    viewMode = 'week';
    render();
};

document.getElementById('btn-month').onclick = function (e) {
    e.preventDefault();
    viewMode = 'month';
    render();
};

document.getElementById('search').oninput = render;

// Bấm vào một buổi học để xoá
document.getElementById('calendar-body').onclick = function (e) {
    var el = e.target.closest('.event');
    if (!el) {
        return;
    }
    if (confirm('Xoá buổi học này?')) {
        events = events.filter(function (x) { return x.id !== el.dataset.id; });
        saveEvents();
        render();
    }
};

// ---------- Thêm lịch ----------
function showMsg(text, ok) {
    var m = document.getElementById('msg');
    m.textContent = text;
    m.className = ok ? 'ok' : '';
}

document.getElementById('date').value = toISO(new Date());

document.getElementById('add').onclick = function () {
    var ev = {
        id: String(Date.now()) + Math.floor(Math.random() * 1000),
        room: document.getElementById('room').value.trim().toUpperCase(),
        date: document.getElementById('date').value,
        start: document.getElementById('start').value,
        end: document.getElementById('end').value,
        status: document.getElementById('status').value,
        note: document.getElementById('note').value.trim()
    };

    if (ev.room === '') {
        return showMsg('Nhập mã phòng.');
    }
    if (!ev.date || !ev.start || !ev.end) {
        return showMsg('Chọn đủ ngày, giờ bắt đầu và giờ kết thúc.');
    }
    if (toMinutes(ev.start) >= toMinutes(ev.end)) {
        return showMsg('Giờ kết thúc phải sau giờ bắt đầu.');
    }

    // Kiểm tra trùng phòng cùng ngày, cùng khung giờ (bỏ qua lịch bị từ chối)
    if (ev.status !== 'rejected') {
        var trung = events.filter(function (x) {
            return x.date === ev.date && x.room === ev.room && x.status !== 'rejected' &&
                   toMinutes(ev.start) < toMinutes(x.end) && toMinutes(x.start) < toMinutes(ev.end);
        })[0];
        if (trung) {
            return showMsg('Trùng lịch: phòng ' + ev.room + ' đã có buổi ' + trung.start + ' - ' + trung.end + ' vào ngày này.');
        }
    }

    events.push(ev);
    saveEvents();
    current = new Date(ev.date + 'T00:00:00');   // chuyển tới ngày vừa thêm
    render();
    document.getElementById('note').value = '';
    showMsg('Đã thêm lịch phòng ' + ev.room + '.', true);
};

// Tab khác thêm lịch thì tab này tự cập nhật
window.addEventListener('storage', function (e) {
    if (e.key === KEY) {
        events = loadEvents() || [];
        render();
    }
});

render();
