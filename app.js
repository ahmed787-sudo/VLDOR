const input = document.getElementById('videoUrl');
const button = document.getElementById('checkBtn');
const status = document.getElementById('status');
const year = document.getElementById('year');

if (year) year.textContent = new Date().getFullYear();

function showStatus(message, type = '') {
  status.className = 'panel-status' + (type ? ' ' + type : '');
  const text = status.querySelector('span:last-child');
  if (text) text.textContent = message;
}

/*
 * TikTok links may be full URLs (www.tiktok.com/@.../video/...)
 * or short share URLs (vt.tiktok.com/... and vm.tiktok.com/...).
 * This only validates the URL shape. It does not fetch or download media.
 */
function normalizeTikTokUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Permit users to paste a bare domain, but never guess missing path data.
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const allowedHosts = new Set([
      'tiktok.com',
      'm.tiktok.com',
      'vm.tiktok.com',
      'vt.tiktok.com'
    ]);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!allowedHosts.has(host)) return null;
    if (!url.pathname || url.pathname === '/') return null;

    // Remove fragments and common tracking parameters, retaining share code/path.
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

button.addEventListener('click', () => {
  const normalized = normalizeTikTokUrl(input.value);

  if (!input.value.trim()) {
    showStatus('أدخل رابط فيديو TikTok أولاً.', 'error');
    input.focus();
    return;
  }

  if (!normalized) {
    showStatus('الرابط غير معروف. الصق رابط مشاركة TikTok أو الرابط الكامل للفيديو.', 'error');
    input.focus();
    return;
  }

  input.value = normalized;
  showStatus(
    'الرابط من TikTok وتم التعرف على صيغته. التنزيل المباشر غير متاح بعد؛ استخدم خيار الحفظ الرسمي داخل TikTok إذا كان متاحاً لك.',
    'success'
  );
});

input.addEventListener('keydown', event => {
  if (event.key === 'Enter') button.click();
});

input.addEventListener('input', () => {
  if (status.classList.contains('error')) {
    showStatus('الصق رابط مشاركة TikTok أو الرابط الكامل للفيديو.');
  }
});
