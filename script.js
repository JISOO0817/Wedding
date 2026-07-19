// ========================================================
// 설정값 모음 (여기 값들만 바꾸면 대부분 반영됩니다)
// ========================================================
const WEDDING_DATE = new Date('2026-09-19T11:00:00+09:00');
const GROOM_NAME = '재원';
const BRIDE_NAME = '지수';
const HOLIDAYS = [24, 25, 26]; // 캘린더에 빨간색으로 표시할 이번 달 공휴일 날짜

// TODO: 실제 구글폼 링크로 교체하세요
const RSVP_FORM_URL = '';       // 예: 'https://forms.gle/xxxxxxxx'

const GUESTBOOK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwumRK6gwJUTrPHb2vPnfDdpVclbogigcoTLQ0DideLDLk6S8NOWLBCJ3d5erJcKIc_Jw/exec';

// ========================================================
// 초기 진입 (히어로 인트로)
// ========================================================
window.addEventListener('load', () => {
  initGallery();
  initReveal();
  initPetals();
  initIntroVideo();
});

// 인트로 영상 재생 후 청첩장 메인 노출 (배경음악도 이때 시작)
function initIntroVideo() {
  const introScreen = document.getElementById('introScreen');
  const introVideo = document.getElementById('introVideo');
  let introFinished = false;
  let fallbackTimer = setTimeout(finishIntro, 15000);

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    clearTimeout(fallbackTimer);
    introScreen.classList.add('hide');
    tryAutoplayBgm();
    startHeroReveal();
  }

  introVideo.addEventListener('ended', finishIntro, { once: true });
  introVideo.addEventListener('error', finishIntro, { once: true });
}

function startHeroReveal() {
  setTimeout(() => {
    document.querySelectorAll('.hero-img').forEach((img) => img.classList.add('sharp'));
  }, 400);
}

// ========================================================
// 배경음악 (자동재생 차단 시 첫 사용자 상호작용에서 재생)
// ========================================================
const bgm = document.getElementById('bgm');
let bgmPlaying = false;

function setBgmIcon(playing) {
  document.getElementById('bgmIconOn').style.display = playing ? 'block' : 'none';
  document.getElementById('bgmIconOff').style.display = playing ? 'none' : 'block';
}

function tryAutoplayBgm() {
  bgm.play().then(() => {
    bgmPlaying = true;
    setBgmIcon(true);
  }).catch(() => {
    const startOnInteract = () => {
      bgm.play().then(() => {
        bgmPlaying = true;
        setBgmIcon(true);
      }).catch(() => {});
    };
    ['click', 'touchstart', 'scroll', 'keydown'].forEach((evt) =>
      document.addEventListener(evt, startOnInteract, { once: true, passive: true }));
  });
}

function toggleBgm() {
  if (bgmPlaying) {
    bgm.pause();
    bgmPlaying = false;
    setBgmIcon(false);
  } else {
    bgm.play().then(() => {
      bgmPlaying = true;
      setBgmIcon(true);
    }).catch(() => {});
  }
}

// ========================================================
// 히어로 꽃잎 애니메이션
// ========================================================
function initPetals() {
  const container = document.getElementById('petals');
  const colors = ['#fff', 'var(--rose-soft)'];
  const count = 16;
  let html = '';
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const size = 8 + Math.random() * 6;
    const duration = 16 + Math.random() * 12;
    const delay = -(Math.random() * duration);
    const drift = Math.round(Math.random() * 50 - 25);
    const rotateDir = Math.random() > 0.5 ? 1 : -1;
    const opacity = (0.6 + Math.random() * 0.3).toFixed(2);
    const color = colors[i % colors.length];
    html += `<div class="petal" style="left:${left}%; width:${size}px; height:${size * 1.3}px; background:${color}; animation-duration:${duration}s; animation-delay:${delay}s; --drift:${drift}px; --rotate-dir:${rotateDir}; --petal-opacity:${opacity};"></div>`;
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
    const isWeddingDay = d === WEDDING_DATE.getDate();
    const classes = [];
    if (isWeddingDay) classes.push('today');
    if (dow === 0) classes.push('sun');
    if (HOLIDAYS.includes(d)) classes.push('holiday');
    const label = isWeddingDay ? '♥' : d;
    html += `<td class="${classes.join(' ')}"><span>${label}</span></td>`;
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
// 카카오맵
// ========================================================
const WEDDING_LAT = 37.5383387532099;
const WEDDING_LNG = 127.074640682527;
function initKakaoMap() {
  if (typeof kakao === 'undefined' || !kakao.maps) return;
  kakao.maps.load(() => {
    const container = document.getElementById('kakaoMap');
    const coords = new kakao.maps.LatLng(WEDDING_LAT, WEDDING_LNG);
    const map = new kakao.maps.Map(container, { center: coords, level: 4 });
    new kakao.maps.Marker({ map, position: coords });
  });
}
initKakaoMap();

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
    ddayEl.innerHTML = `${GROOM_NAME} <span class="heart">♥</span> ${BRIDE_NAME} 님이 행복한 결혼식을 마치셨습니다.`;
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
let currentLightboxEl = null; // 현재 화면에 보이는 이미지 엘리먼트를 항상 정확히 가리킴
let lightboxAnimating = false;

function renderLightbox() {
  const content = document.getElementById('lightboxContent');
  content.innerHTML = '';
  const img = document.createElement('img');
  img.className = 'lb-slide';
  img.alt = '갤러리 사진 확대';
  img.src = `images/${GALLERY_IMAGES[lightboxIndex]}`;
  content.appendChild(img);
  currentLightboxEl = img;
  document.getElementById('lightboxCounter').textContent = `${lightboxIndex + 1} / ${GALLERY_IMAGES.length}`;
}
function openLightbox(i) {
  lightboxIndex = i;
  renderLightbox();
  openModal('lightbox');
}

function moveLightbox(delta) {
  if (lightboxAnimating) return;
  lightboxAnimating = true;

  const content = document.getElementById('lightboxContent');
  const oldImg = currentLightboxEl;
  const newIndex = (lightboxIndex + delta + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;

  const newImg = document.createElement('img');
  newImg.className = 'lb-slide';
  newImg.alt = '갤러리 사진 확대';
  newImg.style.transform = `translateX(${delta > 0 ? '100%' : '-100%'})`;
  newImg.src = `images/${GALLERY_IMAGES[newIndex]}`;
  content.appendChild(newImg);

  void newImg.offsetWidth; // 강제 리플로우로 transition이 적용되게 함

  if (oldImg) oldImg.style.transform = `translateX(${delta > 0 ? '-100%' : '100%'})`;
  newImg.style.transform = 'translateX(0)';

  lightboxIndex = newIndex;
  currentLightboxEl = newImg;
  document.getElementById('lightboxCounter').textContent = `${lightboxIndex + 1} / ${GALLERY_IMAGES.length}`;

  setTimeout(() => {
    if (oldImg && oldImg.parentNode) oldImg.remove();
    lightboxAnimating = false;
  }, 500);
}

// 라이트박스 드래그로 사진 넘기기 (터치, 마우스 공통) - 손가락/마우스 위치를 따라 실시간으로 넘어감
(function () {
  const content = document.getElementById('lightboxContent');
  let startX = 0, startY = 0, dragging = false, dragDeltaX = 0;
  let prevPreview = null, nextPreview = null;

  function clearPreviews() {
    if (prevPreview) { prevPreview.remove(); prevPreview = null; }
    if (nextPreview) { nextPreview.remove(); nextPreview = null; }
  }

  content.addEventListener('pointerdown', (e) => {
    if (lightboxAnimating) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dragDeltaX = 0;
    content.style.cursor = 'grabbing';
  });

  content.addEventListener('pointermove', (e) => {
    if (!dragging || !currentLightboxEl) return;
    dragDeltaX = e.clientX - startX;
    if (Math.abs(dragDeltaX) < 4) return;

    currentLightboxEl.style.transition = 'none';
    currentLightboxEl.style.transform = `translateX(${dragDeltaX}px)`;

    const w = content.offsetWidth;
    if (dragDeltaX < 0 && !nextPreview) {
      const nextIndex = (lightboxIndex + 1) % GALLERY_IMAGES.length;
      nextPreview = document.createElement('img');
      nextPreview.className = 'lb-slide';
      nextPreview.style.transition = 'none';
      nextPreview.alt = '갤러리 사진 확대';
      nextPreview.src = `images/${GALLERY_IMAGES[nextIndex]}`;
      content.appendChild(nextPreview);
    }
    if (dragDeltaX > 0 && !prevPreview) {
      const prevIndex = (lightboxIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
      prevPreview = document.createElement('img');
      prevPreview.className = 'lb-slide';
      prevPreview.style.transition = 'none';
      prevPreview.alt = '갤러리 사진 확대';
      prevPreview.src = `images/${GALLERY_IMAGES[prevIndex]}`;
      content.appendChild(prevPreview);
    }
    if (nextPreview) nextPreview.style.transform = `translateX(${w + dragDeltaX}px)`;
    if (prevPreview) prevPreview.style.transform = `translateX(${-w + dragDeltaX}px)`;
  });

  function commitDrag(delta) {
    lightboxAnimating = true;
    const oldImg = currentLightboxEl;
    const keepImg = delta > 0 ? nextPreview : prevPreview;
    const discardImg = delta > 0 ? prevPreview : nextPreview;

    if (oldImg) oldImg.style.transform = `translateX(${delta > 0 ? '-100%' : '100%'})`;
    if (keepImg) keepImg.style.transform = 'translateX(0)';
    if (discardImg && discardImg.parentNode) discardImg.remove();

    lightboxIndex = (lightboxIndex + delta + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    currentLightboxEl = keepImg;
    document.getElementById('lightboxCounter').textContent = `${lightboxIndex + 1} / ${GALLERY_IMAGES.length}`;

    prevPreview = null;
    nextPreview = null;

    setTimeout(() => {
      if (oldImg && oldImg.parentNode) oldImg.remove();
      lightboxAnimating = false;
    }, 500);
  }

  function releaseDrag(dy) {
    const w = content.offsetWidth;
    if (currentLightboxEl) currentLightboxEl.style.transition = '';
    if (nextPreview) nextPreview.style.transition = '';
    if (prevPreview) prevPreview.style.transition = '';

    if (Math.abs(dragDeltaX) > 60 && Math.abs(dragDeltaX) > Math.abs(dy)) {
      commitDrag(dragDeltaX < 0 ? 1 : -1);
    } else {
      if (currentLightboxEl) currentLightboxEl.style.transform = 'translateX(0)';
      if (nextPreview) nextPreview.style.transform = `translateX(${w}px)`;
      if (prevPreview) prevPreview.style.transform = `translateX(${-w}px)`;
      setTimeout(clearPreviews, 500);
    }
  }

  content.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    content.style.cursor = 'grab';
    releaseDrag(e.clientY - startY);
  });

  content.addEventListener('pointercancel', () => {
    if (!dragging) return;
    dragging = false;
    content.style.cursor = 'grab';
    releaseDrag(0);
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
