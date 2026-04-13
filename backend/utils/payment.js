const crypto = require('crypto');

const generateReference = () => {
  return `MM-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
};

const simulateMobileMoney = async ({ provider, phone, amount }) => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    success: true,
    provider,
    phone,
    amount,
    reference: generateReference(),
    message: `Payment request sent to ${provider.toUpperCase()} for ${phone}`,
  };
};

const verifyPayment = async ({ reference }) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const success = Math.random() > 0.15;
  return {
    reference,
    status: success ? 'success' : 'failed',
    verifiedAt: new Date(),
  };
};

module.exports = { generateReference, simulateMobileMoney, verifyPayment };
