require('dotenv').config();
const { sendWebhook } = require('../utils/webhookSimulator');

const parseArgs = (args) => {
  return args.reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (!key || !value) return acc;
    acc[key.replace(/^--/, '')] = value;
    return acc;
  }, {});
};

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const provider = args.provider || 'mtn';
  const reference = args.reference;
  const amount = Number(args.amount || 0);
  const status = args.status || 'success';
  const endpoint = args.endpoint || 'http://localhost:5000/api/payments/webhook';
  const secret = args.secret || (provider.toLowerCase() === 'mtn' ? process.env.MTN_MOMO_WEBHOOK_SECRET : process.env.AIRTEL_MONEY_WEBHOOK_SECRET);

  if (!reference) {
    console.error('Missing required parameter: --reference=<transaction_reference>');
    process.exit(1);
  }
  if (!secret) {
    console.error('Missing webhook secret. Either provide --secret or set the provider secret in environment variables.');
    process.exit(1);
  }

  try {
    const result = await sendWebhook({ provider, reference, amount, status, endpoint, secret });
    console.log('Webhook sent to', endpoint);
    console.log('Status:', result.status);
    console.log('Body:', result.body);
  } catch (err) {
    console.error('Webhook simulation failed:', err.message);
    process.exit(1);
  }
})();
