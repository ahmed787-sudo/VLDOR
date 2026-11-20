const input = document.getElementById('videoUrl');
const button = document.getElementById('checkBtn');
const status = document.getElementById('status');
const preview = document.getElementById('videoPreview');
const year = document.getElementById('year');

if (year) year.textContent = new Date().getFullYear();

function showStatus(message, type = '') {
  if (!status) return;
  status.className = 'panel-status' + (type ? ' ' + type : '');
  const text = status.querySelector('span:last-child');
  if (text) text.textContent = message;
}

function normalizeTikTokUrl(value) {
  let trimmed = value.trim();
  if (!trimmed) return null;
  trimmed = trimmed.replace(/^["']+|["']+$/g, '').trim();
  trimmed = trimmed.replace(/^\\/+(?=https?:\\/\\/)/i, '');
  const candidate = /^https?:\\/\\//i.test(trimmed) ? trimmed : 'https://' + trimmed;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase().replace(/^www\\./, '');
    const allowedHosts = new Set(['tiktok.com', 'm.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com']);
    if (!['https:', 'http:'].includes(url.protocol) || !allowedHosts.has(host)) return null;
    if (!url.pathname || url.pathname === '/') return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function clearPreview() {
  if (preview) preview.replaceChildren();
}

async function checkTikTokLink() {
  const normalized = normalizeTikTokUrl(input.value);
  clearPreview();

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
  button.disabled = true;
  button.querySelector('span').textContent = 'جارٍ الفحص...';
  showStatus('جارٍ الاتصال بخدمة TikTok الرسمية للتحقق من الفيديو...', '');

  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ url: normalized })
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      showStatus(result.message || 'تعذر التحقق من الرابط.', 'error');
      return;
    }

    showStatus(result.message, 'success');

    if (result.previewAvailable && result.videoId && preview) {
      const frame = document.createElement('iframe');
      frame.src = 'https://www.tiktok.com/player/v1/' + encodeURIComponent(result.videoId) + '?music_info=1&description=1';
      frame.title = 'معاينة فيديو TikTok';
      frame.loading = 'lazy';
      frame.allow = 'fullscreen; autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      preview.appendChild(frame);
    }
  } catch (error) {
    showStatus('تعذر الاتصال بخادم VIDORA. تحقق من اتصال الإنترنت ثم حاول مجدداً.', 'error');
  } finally {
    button.disabled = false;
    button.querySelector('span').textContent = 'فحص الرابط';
  }
}

if (input && button) {
  button.addEventListener('click', checkTikTokLink);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') checkTikTokLink();
  });
  input.addEventListener('input', clearPreview);
}
