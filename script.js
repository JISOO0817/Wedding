// ========================================================
// 설정값 모음 (여기 값들만 바꾸면 대부분 반영됩니다)
// ========================================================
const WEDDING_DATE = new Date('2026-09-19T11:00:00+09:00');
const GROOM_NAME = '재원';
const BRIDE_NAME = '지수';

// TODO: 실제 구글폼 링크로 교체하세요
const RSVP_FORM_URL = '';       // 예: 'https://forms.gle/xxxxxxxx'
const GUESTBOOK_FORM_URL = '';  // 예: 'https://forms.gle/yyyyyyyy'

// ========================================================
// 로딩 화면
// ========================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading').classList.add('fade-out');
    document.getElementById('invitation').classList.remove('hidden');
    initGallery();
    initReveal();
  }, 1800);
});

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
// 캘린더 렌더링
// ========================================================
function buildCalendar() {
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  let html = '<table><thead><tr>';
  ['일','월','화','수','목','금','토'].forEach(d => html += `<th>${d}</th>`);
  html += '</tr></thead><tbody><tr>';

  for (let i = 0; i < firstDay; i++) html += '<td></td>';

  for (let d = 1; d <= lastDate; d++) {
    const isToday = d === WEDDING_DATE.getDate();
    html += `<td class="${isToday ? 'today' : ''}"><span>${d}</span></td>`;
    if ((firstDay + d) % 7 === 0) html += '</tr><tr>';
  }
  html += '</tr></tbody></table>';

  document.getElementById('calendar').innerHTML = html;
}
buildCalendar();

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
// 인터뷰 더보기
// ========================================================
function toggleInterview() {
  const items = document.querySelectorAll('.interview-item.more');
  const btn = document.getElementById('interviewBtn');
  const opening = !items[0].classList.contains('show');
  items.forEach(el => el.classList.toggle('show', opening));
  btn.textContent = opening ? '인터뷰 접기' : '인터뷰 더 보기';
}

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
// 안내사항 탭
// ========================================================
function showTab(index) {
  document.querySelectorAll('.tab-btn').forEach((btn, i) => btn.classList.toggle('active', i === index));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', Number(p.dataset.tab) === index));
}

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
// RSVP / 방명록 링크 연결
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  const rsvp = document.getElementById('rsvpLink');
  const guestbook = document.getElementById('guestbookLink');
  if (RSVP_FORM_URL) rsvp.href = RSVP_FORM_URL;
  if (GUESTBOOK_FORM_URL) guestbook.href = GUESTBOOK_FORM_URL;
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
