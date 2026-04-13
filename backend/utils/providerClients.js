const crypto = require('crypto');

const parseJsonResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, status: response.status };
  }
};

const buildRequestHeaders = (config) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (config.apiKey) headers['X-API-KEY'] = config.apiKey;
  if (config.apiSecret) headers['X-API-SECRET'] = config.apiSecret;
  if (config.clientId) headers['X-CLIENT-ID'] = config.clientId;
  if (config.clientSecret) headers['X-CLIENT-SECRET'] = config.clientSecret;
  if (config.environment) headers['X-ENVIRONMENT'] = config.environment;
  return headers;
};

const normalizeUrl = (apiUrl) => {
  if (!apiUrl) return apiUrl;
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
};

const initiateMtnPayment = async ({ phone, amount, reference, config }) => {
  const url = `${normalizeUrl(config.apiUrl)}/collection/v1_0/requesttopay`;
  const payload = {
    amount: amount.toFixed(2),
    currency: config.currency || 'USD',
    externalId: reference,
    payer: {
      partyIdType: 'MSISDN',
      partyId: phone,
    },
    payerMessage: 'MoBooka purchase',
    payeeNote: 'MoBooka digital book purchase',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: buildRequestHeaders(config),
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  return {
    success: response.ok,
    provider: 'mtn',
    reference,
    data,
    statusCode: response.status,
  };
};

const verifyMtnPayment = async ({ reference, config }) => {
  const url = `${normalizeUrl(config.apiUrl)}/collection/v1_0/requesttopay/${reference}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: buildRequestHeaders(config),
  });

  const data = await parseJsonResponse(response);
  const statusKey = data.status?.toLowerCase();
  const status = statusKey === 'successful' ? 'success' : statusKey === 'failed' ? 'failed' : 'pending';
  return { reference, status, provider: 'mtn', data, statusCode: response.status };
};

const initiateAirtelPayment = async ({ phone, amount, reference, config }) => {
  const url = `${normalizeUrl(config.apiUrl)}/airtel/v1/payments`; 
  const payload = {
    amount: amount.toFixed(2),
    currency: config.currency || 'USD',
    phoneNumber: phone,
    externalId: reference,
    description: 'MoBooka digital book purchase',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: buildRequestHeaders(config),
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  return {
    success: response.ok,
    provider: 'airtel',
    reference,
    data,
    statusCode: response.status,
  };
};

const verifyAirtelPayment = async ({ reference, config }) => {
  const url = `${normalizeUrl(config.apiUrl)}/airtel/v1/payments/${reference}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: buildRequestHeaders(config),
  });

  const data = await parseJsonResponse(response);
  const statusKey = data.status?.toLowerCase();
  const status = statusKey === 'successful' ? 'success' : statusKey === 'failed' ? 'failed' : 'pending';
  return { reference, status, provider: 'airtel', data, statusCode: response.status };
};

const getProviderConfig = (provider) => {
  const key = provider?.toString().toLowerCase();
  return key === 'airtel' ? 'airtel' : 'mtn';
};

module.exports = {
  initiateMtnPayment,
  verifyMtnPayment,
  initiateAirtelPayment,
  verifyAirtelPayment,
  getProviderConfig,
};
