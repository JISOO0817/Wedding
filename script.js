// ========================================================
// 설정값 모음 (여기 값들만 바꾸면 대부분 반영됩니다)
// ========================================================
const WEDDING_DATE = new Date('2026-09-19T11:00:00+09:00');
const GROOM_NAME = '재원';
const BRIDE_NAME = '지수';

// TODO: 실제 구글폼 링크로 교체하세요
const RSVP_FORM_URL = '';       // 예: 'https://forms.gle/xxxxxxxx'

const GUESTBOOK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwumRK6gwJUTrPHb2vPnfDdpVclbogigcoTLQ0DideLDLk6S8NOWLBCJ3d5erJcKIc_Jw/exec';

// ========================================================
// 초기 진입 (히어로 인트로)
// ========================================================
window.addEventListener('load', () => {
  initGallery();
  initReveal();
  initSparkles();

  setTimeout(() => {
    document.querySelectorAll('.hero-img').forEach((img) => img.classList.add('sharp'));
    document.getElementById('heroIntro').classList.add('hide');
  }, 2000);
});

// ========================================================
// 히어로 빛 파티클 애니메이션
// ========================================================
function initSparkles() {
  const container = document.getElementById('sparkles');
  const count = 22;
  let html = '';
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const size = 3 + Math.random() * 6;
    const duration = 8 + Math.random() * 8;
    const delay = -(Math.random() * duration);
    const drift = Math.round(Math.random() * 50 - 25);
    const opacity = (0.4 + Math.random() * 0.5).toFixed(2);
    const blur = Math.random() > 0.5 ? 'blur(0.5px)' : 'none';
    html += `<div class="spark" style="left:${left}%; width:${size}px; height:${size}px; filter:${blur}; box-shadow:0 0 ${size}px ${size / 2}px rgba(255,255,255,.85); animation-duration:${duration}s; animation-delay:${delay}s; --drift:${drift}px; --spark-opacity:${opacity};"></div>`;
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
let savedScrollY = 0;
let openModalCount = 0;
function openModal(id) {
  if (openModalCount === 0) {
    savedScrollY = window.scrollY;
    const html = document.documentElement;
    html.style.position = 'fixed';
    html.style.top = `-${savedScrollY}px`;
    html.style.width = '100%';
  }
  openModalCount++;
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount > 0) return;
  const html = document.documentElement;
  html.style.position = '';
  html.style.top = '';
  html.style.width = '';
  window.scrollTo(0, savedScrollY);
}

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
const GALLERY_IMAGES = [
  'gallery1.jpg', 'gallery2.jpg', 'gallery3.jpg', 'gallery4.jpg',
  'gallery6.jpg', 'gallery5.jpg', 'gallery7.jpg', 'gallery8.jpg', 'gallery9.jpg', 'gallery10.jpg'
];
let lightboxIndex = 0;
const GALLERY_PREVIEW_COUNT = 9;
let galleryExpanded = false;

function renderGallery() {
  const items = galleryExpanded ? GALLERY_IMAGES : GALLERY_IMAGES.slice(0, GALLERY_PREVIEW_COUNT);
  document.getElementById('gallery').innerHTML = items.map((f, i) =>
    `<img src="images/${f}" alt="갤러리 사진" onclick="openLightbox(${i})">`).join('');
  document.getElementById('galleryMoreBtn').style.display =
    (!galleryExpanded && GALLERY_IMAGES.length > GALLERY_PREVIEW_COUNT) ? 'inline-block' : 'none';
}

function initGallery() {
  renderGallery();
}

function expandGallery() {
  galleryExpanded = true;
  renderGallery();
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

// 라이트박스 스와이프/드래그로 사진 넘기기 (터치, 마우스 공통)
(function () {
  const content = document.getElementById('lightboxContent');
  let startX = 0;
  let startY = 0;
  let dragging = false;

  content.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    content.style.cursor = 'grabbing';
  });

  content.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    content.style.cursor = 'grab';
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      moveLightbox(dx < 0 ? 1 : -1);
    }
  });

  content.addEventListener('pointercancel', () => {
    dragging = false;
    content.style.cursor = 'grab';
  });
})();

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

// 라이트박스가 열려있는 동안 마우스 휠 스크롤 차단
window.addEventListener('wheel', (e) => {
  if (document.getElementById('lightbox').classList.contains('open')) e.preventDefault();
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

const GUESTBOOK_PREVIEW_COUNT = 3;
let guestbookData = [];
let pendingDeleteId = null;

function formatGuestbookTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderGuestbookCard(item) {
  return `
    <div class="gb-card">
      <button class="gb-delete" onclick="openDeleteGuestbook('${item.id}')">✕</button>
      <p class="gb-message">${escapeHTML(item.message)}</p>
      <div class="gb-meta">
        <span class="gb-from">From ${escapeHTML(item.name)}</span>
        <span class="gb-time">${formatGuestbookTime(item.time)}</span>
      </div>
    </div>`;
}

function renderGuestbookLists() {
  document.getElementById('guestbookList').innerHTML =
    guestbookData.slice(0, GUESTBOOK_PREVIEW_COUNT).map(renderGuestbookCard).join('');

  document.getElementById('guestbookMoreBtn').style.display =
    guestbookData.length > GUESTBOOK_PREVIEW_COUNT ? 'inline-block' : 'none';

  if (document.getElementById('guestbookModal').classList.contains('open')) {
    document.getElementById('guestbookModalList').innerHTML = guestbookData.map(renderGuestbookCard).join('');
  }
}

async function loadGuestbook() {
  if (!GUESTBOOK_SCRIPT_URL) return;
  try {
    const res = await fetch(GUESTBOOK_SCRIPT_URL);
    const data = (await res.json()).filter(item => item.name && item.message);
    guestbookData = data.reverse();
    renderGuestbookLists();
  } catch (err) {
    console.error('방명록을 불러오지 못했습니다.', err);
  }
}
loadGuestbook();

function openGuestbookModal() {
  document.getElementById('guestbookModalList').innerHTML = guestbookData.map(renderGuestbookCard).join('');
  openModal('guestbookModal');
}

function openDeleteGuestbook(id) {
  pendingDeleteId = id;
  document.getElementById('gbDeletePassword').value = '';
  document.getElementById('gbDeleteError').textContent = '';
  openModal('guestbookDeleteModal');
}

async function submitDeleteGuestbook() {
  const password = document.getElementById('gbDeletePassword').value;
  const errorEl = document.getElementById('gbDeleteError');
  if (!password) return;
  errorEl.textContent = '';

  const btn = document.getElementById('gbDeleteBtn');
  btn.disabled = true;
  btn.textContent = '삭제 중...';

  try {
    const res = await fetch(GUESTBOOK_SCRIPT_URL, {
      method: 'POST',
      body: new URLSearchParams({ action: 'delete', id: pendingDeleteId, password })
    });
    const result = await res.json();
    if (result.result === 'success') {
      guestbookData = guestbookData.filter(item => item.id !== pendingDeleteId);
      renderGuestbookLists();
      closeModal('guestbookDeleteModal');
    } else {
      errorEl.textContent = result.message || '삭제에 실패했습니다.';
    }
  } catch (err) {
    errorEl.textContent = '삭제 중 오류가 발생했습니다.';
  } finally {
    btn.disabled = false;
    btn.textContent = '삭제하기';
  }
}

document.getElementById('guestbookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('gbFormError');
  errorEl.textContent = '';
  if (!GUESTBOOK_SCRIPT_URL) {
    errorEl.textContent = '방명록 저장소가 아직 연결되지 않았습니다.';
    return;
  }
  const name = document.getElementById('gbName').value.trim();
  const password = document.getElementById('gbPassword').value.trim();
  const message = document.getElementById('gbMessage').value.trim();
  if (!name || !password || !message) return;

  const btn = document.getElementById('gbSubmitBtn');
  btn.disabled = true;
  btn.textContent = '저장 중...';

  try {
    const res = await fetch(GUESTBOOK_SCRIPT_URL, {
      method: 'POST',
      body: new URLSearchParams({ action: 'add', name, message, password })
    });
    const result = await res.json();

    guestbookData.unshift({ id: result.id, time: new Date().toISOString(), name, message });
    renderGuestbookLists();

    document.getElementById('gbName').value = '';
    document.getElementById('gbPassword').value = '';
    document.getElementById('gbMessage').value = '';
  } catch (err) {
    errorEl.textContent = '방명록 등록에 실패했습니다. 다시 시도해주세요.';
  } finally {
    btn.disabled = false;
    btn.textContent = '방명록 남기기';
  }
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

// 개발자 도구 단축키 차단 (F12, Ctrl+Shift+I/J/C, Ctrl+U) - 완벽 차단은 아닌 가벼운 방어용입니다
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  const blocked =
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
    (e.ctrlKey && key === 'u');
  if (blocked) {
    e.preventDefault();
    alert('개발자 도구는 사용할 수 없습니다.');
  }
});
