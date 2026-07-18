// ========================================================
// 설정값 모음 (여기 값들만 바꾸면 대부분 반영됩니다)
// ========================================================
const WEDDING_DATE = new Date('2026-09-19T11:00:00+09:00');
const GROOM_NAME = '재원';
const BRIDE_NAME = '지수';

// TODO: 실제 구글폼 링크로 교체하세요
const RSVP_FORM_URL = '';       // 예: 'https://forms.gle/xxxxxxxx'

const GUESTBOOK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyubuUD5S3O8BG4st5-kop2MM6d2VrmEQQe7WXfj5kK8dp7u9IUVWAuio2wi5ndWeiKSg/exec';

// ========================================================
// 초기 진입 (히어로 인트로)
// ========================================================
window.addEventListener('load', () => {
  initGallery();
  initReveal();
  initLeaves();

  setTimeout(() => {
    document.getElementById('heroImg').classList.add('sharp');
    document.getElementById('heroIntro').classList.add('hide');
  }, 2000);
});

// ========================================================
// 히어로 낙엽 애니메이션
// ========================================================
function initLeaves() {
  const container = document.getElementById('leaves');
  const colors = ['var(--leaf)', 'var(--leaf-soft)'];
  const count = 16;
  let html = '';
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const size = 8 + Math.random() * 6;
    const duration = 7 + Math.random() * 6;
    const delay = -(Math.random() * duration);
    const drift = Math.round(Math.random() * 60 - 30);
    const rotateDir = Math.random() > 0.5 ? 1 : -1;
    const color = colors[i % colors.length];
    html += `<div class="leaf" style="left:${left}%; width:${size}px; height:${size * 1.3}px; background:${color}; animation-duration:${duration}s; animation-delay:${delay}s; --drift:${drift}px; --rotate-dir:${rotateDir};"></div>`;
  }
  container.innerHTML = html;
}

// ========================================================
// 스크롤 리빌 애니메이션
// ========================================================
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in-view');
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
}

// ========================================================
// 모달
// ========================================================
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ========================================================
// 날짜 하이라이트 + 캘린더 렌더링
// ========================================================
const MONTH_ABBR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function buildDateHero() {
  document.getElementById('dateHeroDay').textContent = WEDDING_DATE.getDate();
  document.getElementById('dateHeroMonth').textContent = MONTH_ABBR[WEDDING_DATE.getMonth()];
}
buildDateHero();

function buildCalendar() {
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  document.getElementById('calendarMonth').textContent = `${year}년 ${month + 1}월`;

  let html = '<table><thead><tr>';
  ['일','월','화','수','목','금','토'].forEach(d => html += `<th>${d}</th>`);
  html += '</tr></thead><tbody><tr>';

  for (let i = 0; i < firstDay; i++) html += '<td></td>';

  for (let d = 1; d <= lastDate; d++) {
    const dow = (firstDay + d - 1) % 7;
    const classes = [];
    if (d === WEDDING_DATE.getDate()) classes.push('today');
    if (dow === 0) classes.push('sun');
    if (dow === 6) classes.push('sat');
    html += `<td class="${classes.join(' ')}"><span>${d}</span></td>`;
    if ((firstDay + d) % 7 === 0) html += '</tr><tr>';
  }
  html += '</tr></tbody></table>';

  document.getElementById('calendar').innerHTML = html;
}
buildCalendar();

// ========================================================
// 캘린더에 추가 (Google / iOS .ics)
// ========================================================
const WEDDING_VENUE = 'ku컨벤션 웨딩홀';
function toUTCStamp(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
function addToGoogleCalendar() {
  const start = WEDDING_DATE;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${GROOM_NAME} ♥ ${BRIDE_NAME} 결혼식`,
    dates: `${toUTCStamp(start)}/${toUTCStamp(end)}`,
    details: '저희 두 사람의 결혼식에 초대합니다.',
    location: WEDDING_VENUE
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
}
function downloadICS() {
  const start = WEDDING_DATE;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${toUTCStamp(start)}`,
    `DTEND:${toUTCStamp(end)}`,
    `SUMMARY:${GROOM_NAME} ♥ ${BRIDE_NAME} 결혼식`,
    `LOCATION:${WEDDING_VENUE}`,
    'DESCRIPTION:저희 두 사람의 결혼식에 초대합니다.',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wedding.ics';
  a.click();
  URL.revokeObjectURL(url);
}

// ========================================================
// 카운트다운 + D-day 메시지
// ========================================================
function updateCountdown() {
  const now = new Date();
  let diff = WEDDING_DATE - now;
  const past = diff < 0;
  diff = Math.abs(diff);

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-min').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-sec').textContent = String(secs).padStart(2, '0');

  const ddayEl = document.getElementById('ddayMessage');
  if (past) {
    ddayEl.innerHTML = `${GROOM_NAME} ♥ ${BRIDE_NAME} 님이 행복한 결혼식을 마치셨습니다.`;
  } else {
    document.getElementById('ddayNum').textContent = days;
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ========================================================
// 갤러리 + 라이트박스
// ========================================================
const GALLERY_IMAGES = ['gallery1.jpg', 'gallery2.jpg', 'gallery3.jpg', 'gallery4.jpg'];
let lightboxIndex = 0;
function initGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = GALLERY_IMAGES.map((f, i) =>
    `<img src="images/${f}" alt="갤러리 사진" onclick="openLightbox(${i})">`).join('');
}
function renderLightbox() {
  document.getElementById('lightboxContent').innerHTML =
    `<img src="images/${GALLERY_IMAGES[lightboxIndex]}" alt="갤러리 사진 확대">`;
  document.getElementById('lightboxCounter').textContent = `${lightboxIndex + 1} / ${GALLERY_IMAGES.length}`;
}
function openLightbox(i) {
  lightboxIndex = i;
  renderLightbox();
  openModal('lightbox');
}
function moveLightbox(delta) {
  lightboxIndex = (lightboxIndex + delta + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
  renderLightbox();
}

// 인앱 브라우저 등에서 뷰포트 확대 제한이 무시될 때를 대비한 방어용 블러 처리
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('open')) return;
    const zoomed = window.visualViewport.scale > 1.02;
    lightbox.classList.toggle('zoomed', zoomed);
  });
}

// PC에서 Ctrl+휠로 페이지 확대하는 것 방지
window.addEventListener('wheel', (e) => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// ========================================================
// 계좌번호 아코디언 + 복사
// ========================================================
function toggleAccordion(type) {
  const content = document.getElementById(`${type}-content`);
  const arrow = document.getElementById(`${type}-arrow`);
  const open = content.classList.toggle('open');
  arrow.textContent = open ? '▴' : '▾';
}
function copyAccount(text) {
  navigator.clipboard.writeText(text).then(() => alert('계좌번호가 복사되었습니다.'));
}

// ========================================================
// RSVP 링크 연결
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  const rsvp = document.getElementById('rsvpLink');
  if (RSVP_FORM_URL) rsvp.href = RSVP_FORM_URL;
});

// ========================================================
// 방명록 (Google Apps Script 연동)
// ========================================================
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadGuestbook() {
  if (!GUESTBOOK_SCRIPT_URL) return;
  try {
    const res = await fetch(GUESTBOOK_SCRIPT_URL);
    const data = (await res.json()).filter(item => item.name && item.message);
    if (!data.length) return;
    document.getElementById('guestbookList').innerHTML = data.slice().reverse().map(item =>
      `<li><h4>${escapeHTML(item.name)}</h4><p>${escapeHTML(item.message)}</p></li>`
    ).join('');
  } catch (err) {
    console.error('방명록을 불러오지 못했습니다.', err);
  }
}
loadGuestbook();

document.getElementById('guestbookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!GUESTBOOK_SCRIPT_URL) {
    alert('방명록 저장소가 아직 연결되지 않았습니다.');
    return;
  }
  const name = document.getElementById('gbName').value.trim();
  const message = document.getElementById('gbMessage').value.trim();
  if (!name || !message) return;

  await fetch(GUESTBOOK_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams({ name, message })
  });

  document.getElementById('gbName').value = '';
  document.getElementById('gbMessage').value = '';
  loadGuestbook();
});

// ========================================================
// 공유하기 / 링크 복사
// ========================================================
function shareInvitation() {
  const shareData = {
    title: `${GROOM_NAME} ♥ ${BRIDE_NAME} 결혼합니다.`,
    text: '2026년 9월 19일 토요일 오전 11시 · KU컨벤션 웨딩홀',
    url: window.location.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    copyLink();
  }
}
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => alert('링크가 복사되었습니다.'));
}

// 우클릭(이미지 저장) 방지 - 필요 없으면 이 블록 삭제하세요
document.addEventListener('contextmenu', (e) => e.preventDefault());
