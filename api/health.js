module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      ok: false,
      error: 'method_not_allowed'
    });
  }

  return res.status(200).json({
    ok: true,
    service: 'VIDORA API',
    stage: 'backend-foundation',
    providerConfigured: false,
    downloadEnabled: false
  });
};
