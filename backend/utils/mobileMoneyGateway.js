const { simulateMobileMoney } = require('./payment');
const { verifyPayment: simulateVerify } = require('./payment');
const {
  initiateMtnPayment,
  verifyMtnPayment,
  initiateAirtelPayment,
  verifyAirtelPayment,
} = require('./providerClients');

const providers = {
  mtn: {
    name: 'MTN Mobile Money',
    config: {
      apiUrl: process.env.MTN_MOMO_API_URL,
      apiKey: process.env.MTN_MOMO_API_KEY,
      apiSecret: process.env.MTN_MOMO_API_SECRET,
      partnerId: process.env.MTN_MOMO_PARTNER_ID,
      environment: process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
      webhookSecret: process.env.MTN_MOMO_WEBHOOK_SECRET,
      currency: process.env.MTN_MOMO_CURRENCY || 'USD',
    },
    async initiate({ phone, amount, reference }) {
      if (!this.config.apiUrl || !this.config.apiKey) {
        return simulateMobileMoney({ provider: 'mtn', phone, amount, reference });
      }
      return initiateMtnPayment({ phone, amount, reference, config: this.config });
    },
    async verify({ reference }) {
      if (!this.config.apiUrl || !this.config.apiKey) {
        return simulateVerify({ reference });
      }
      return verifyMtnPayment({ reference, config: this.config });
    },
  },
  airtel: {
    name: 'Airtel Money',
    config: {
      apiUrl: process.env.AIRTEL_MONEY_API_URL,
      apiKey: process.env.AIRTEL_MONEY_API_KEY,
      apiSecret: process.env.AIRTEL_MONEY_API_SECRET,
      environment: process.env.AIRTEL_MONEY_ENVIRONMENT || 'sandbox',
      webhookSecret: process.env.AIRTEL_MONEY_WEBHOOK_SECRET,
      currency: process.env.AIRTEL_MONEY_CURRENCY || 'USD',
    },
    async initiate({ phone, amount, reference }) {
      if (!this.config.apiUrl || !this.config.apiKey) {
        return simulateMobileMoney({ provider: 'airtel', phone, amount, reference });
      }
      return initiateAirtelPayment({ phone, amount, reference, config: this.config });
    },
    async verify({ reference }) {
      if (!this.config.apiUrl || !this.config.apiKey) {
        return simulateVerify({ reference });
      }
      return verifyAirtelPayment({ reference, config: this.config });
    },
  },
};

const getProvider = (provider) => {
  const key = provider ? provider.toString().toLowerCase() : '';
  return providers[key] || providers.mtn;
};

const initiatePayment = async ({ provider, phone, amount, reference }) => {
  return getProvider(provider).initiate({ phone, amount, reference });
};

const verifyPayment = async ({ provider, reference }) => {
  return getProvider(provider).verify({ reference });
};

module.exports = { initiatePayment, verifyPayment, providers };
