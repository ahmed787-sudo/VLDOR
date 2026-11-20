const ALLOWED_HOSTS = new Set([
  'tiktok.com', 'www.tiktok.com', 'm.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'
]);

function normalizeTikTokUrl(value) {
  if (typeof value !== 'string') return null;
  let candidate = value.trim().replace(/^["']+|["']+$/g, '').trim();
  if (!candidate) return null;
  if (!/^https?:\/\//i.test(candidate)) candidate = 'https://' + candidate;
  let parsed;
  try { parsed = new URL(candidate); } catch { return null; }
  if (!['https:', 'http:'].includes(parsed.protocol)) return null;
  if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) return null;
  if (parsed.username || parsed.password || !parsed.pathname || parsed.pathname === '/') return null;
  parsed.hash = '';
  return parsed.toString();
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const rawUrl = body.url;
  if (typeof rawUrl !== 'string' || rawUrl.length > 2048) {
    return res.status(400).json({ ok: false, error: 'invalid_url', message: 'أرسل رابط TikTok صالحاً لا يتجاوز 2048 حرفاً.' });
  }
  const normalizedUrl = normalizeTikTokUrl(rawUrl);
  if (!normalizedUrl) {
    return res.status(400).json({ ok: false, error: 'unsupported_url', message: 'الرابط غير صالح أو ليس من نطاقات TikTok المدعومة.' });
  }
  try {
    const endpoint = 'https://www.tiktok.com/oembed?url=' + encodeURIComponent(normalizedUrl);
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      return res.status(422).json({
        ok: false, valid: true, normalizedUrl, previewAvailable: false, downloadEnabled: false,
        message: 'الرابط يبدو صحيحاً، لكن TikTok لم يُرجع معاينة لهذا الفيديو. تأكد أن الفيديو عام وأن الرابط كامل.'
      });
    }
    const data = await response.json();
    const videoId = String(data.embed_product_id || '').match(/^\d+$/)?.[0];
    if (data.type !== 'video' || !videoId) {
      return res.status(422).json({
        ok: false, valid: true, normalizedUrl, previewAvailable: false, downloadEnabled: false,
        message: 'لم يتمكن TikTok من توفير معاينة لهذا الرابط.'
      });
    }
    return res.status(200).json({
      ok: true, valid: true, normalizedUrl, previewAvailable: true, videoId,
      title: typeof data.title === 'string' ? data.title : '',
      downloadEnabled: false,
      message: 'تم التحقق من الرابط وجلب معاينة رسمية من TikTok. التنزيل غير متاح بعد.'
    });
  } catch (error) {
    return res.status(502).json({
      ok: false, error: 'tiktok_preview_unavailable',
      message: 'تعذر الاتصال بخدمة TikTok الآن. حاول مرة أخرى بعد قليل.'
    });
  }
};
