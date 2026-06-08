import { apiRequest } from './http';

export const adminLogin = (payload) =>
  apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const distributorLogin = (payload) =>
  apiRequest('/api/distributor/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getDistributorMe = (token) =>
  apiRequest('/api/distributor/auth/me', {
    method: 'GET',
    token,
  });

export const createAgencySignupRequest = (payload) =>
  apiRequest('/api/distributor/agency-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
