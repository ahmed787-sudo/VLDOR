const input = document.getElementById('videoUrl');
const button = document.getElementById('checkBtn');
const status = document.getElementById('status');
const year = document.getElementById('year');

if (year) year.textContent = new Date().getFullYear();

function showStatus(message, type = '') {
  if (!status) return;
  status.className = 'panel-status' + (type ? ' ' + type : '');
  const text = status.querySelector('span:last-child');
  if (text) text.textContent = message;
}

/*
 * Accept TikTok full video URLs and short share URLs.
 * Also tolerate a leading slash accidentally copied before https://.
 * Validation does not download the video.
 */
function normalizeTikTokUrl(value) {
  let trimmed = value.trim();
  if (!trimmed) return null;

  // Remove wrapping quotes and accidental leading slashes/spaces.
  trimmed = trimmed.replace(/^["']+|["']+$/g, '').trim();
  trimmed = trimmed.replace(/^\/+(?=https?:\/\/)/i, '');

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

    if (!['https:', 'http:'].includes(url.protocol)) return null;
    if (!allowedHosts.has(host)) return null;
    if (!url.pathname || url.pathname === '/') return null;

    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

if (input && button) {
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
      'تم التعرف على رابط TikTok بنجاح. هذه الخطوة تفحص الرابط فقط ولا تنزّل الفيديو؛ استخدم خيار الحفظ الرسمي داخل TikTok إذا كان متاحاً لك.',
      'success'
    );
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') button.click();
  });

  input.addEventListener('input', () => {
    if (status && status.classList.contains('error')) {
      showStatus('الصق رابط مشاركة TikTok أو الرابط الكامل للفيديو.');
    }
  });
}
