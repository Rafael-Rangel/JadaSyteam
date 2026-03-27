import { jest } from '@jest/globals';

process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-jada-32-characters!!';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
process.env.ASAAS_ENV = process.env.ASAAS_ENV || 'sandbox';
process.env.ASAAS_API_KEY = process.env.ASAAS_API_KEY || 'test-asaas-key';
process.env.ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN || 'test-webhook-token';

afterEach(() => {
  jest.clearAllMocks();
});
