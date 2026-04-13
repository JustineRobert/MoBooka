const crypto = require('crypto');

const signPayload = (payload, secret) => {
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
};

const buildWebhookPayload = ({ provider, reference, amount, status = 'success' }) => ({
  provider,
  reference,
  amount,
  status,
  timestamp: new Date().toISOString(),
  metadata: {
    source: 'mobooka-simulator',
    environment: process.env.NODE_ENV || 'development',
  },
});

const sendWebhook = async ({ provider, reference, amount = 0, status = 'success', endpoint, secret }) => {
  if (!endpoint) {
    throw new Error('Webhook endpoint is required');
  }
  if (!secret) {
    throw new Error('Webhook secret is required');
  }
  const payload = buildWebhookPayload({ provider, reference, amount, status });
  const signature = signPayload(payload, secret);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: responseBody,
  };
};

module.exports = { signPayload, buildWebhookPayload, sendWebhook };
