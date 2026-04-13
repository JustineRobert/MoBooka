const crypto = require('crypto');

const verifySignature = (payload, secret, signature) => {
  if (!secret || !signature) return false;
  const payloadValue = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const computed = crypto.createHmac('sha256', secret).update(payloadValue).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
};

module.exports = { verifySignature };
