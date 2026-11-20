const ALLOWED_HOSTS = new Set([
  'tiktok.com',
  'www.tiktok.com',
  'm.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com'
]);

function normalizeTikTokUrl(value) {
  if (typeof value !== 'string') return null;

  let candidate = value.trim().replace(/^["']+|["']+$/g, '').trim();
  candidate = candidate.replace(/^\/+(?=https?:\/\/)/i, '');

  if (!candidate) return null;
  if (!/^https?:\/\//i.test(candidate)) candidate = 'https://' + candidate;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) return null;
  if (parsed.username || parsed.password) return null;
  if (!parsed.pathname || parsed.pathname === '/') return null;

  parsed.hash = '';
  return parsed.toString();
}

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      ok: false,
      error: 'method_not_allowed'
    });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const rawUrl = body.url;

  if (typeof rawUrl !== 'string' || rawUrl.length > 2048) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_url',
      message: 'أرسل رابط TikTok صالحاً لا يتجاوز 2048 حرفاً.'
    });
  }

  const normalizedUrl = normalizeTikTokUrl(rawUrl);
  if (!normalizedUrl) {
    return res.status(400).json({
      ok: false,
      error: 'unsupported_url',
      message: 'الرابط غير صالح أو ليس من نطاقات TikTok المدعومة.'
    });
  }

  return res.status(200).json({
    ok: true,
    valid: true,
    normalizedUrl,
    providerConfigured: false,
    downloadEnabled: false,
    message: 'تم التحقق من صيغة الرابط. لم يتم تنزيل الفيديو؛ مصدر المعالجة الرسمي أو المرخّص لم يُربط بعد.'
  });
};
