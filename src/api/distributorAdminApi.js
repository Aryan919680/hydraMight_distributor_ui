import { apiRequest, buildQuery } from './http';

export const getStockists = (token, filters = {}) =>
  apiRequest(`/api/admin/distributors/stockists${buildQuery(filters)}`, {
    method: 'GET',
    token,
  });

export const createStockist = (token, payload) =>
  apiRequest('/api/admin/distributors/stockists', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });

export const getAgencies = (token, filters = {}) =>
  apiRequest(`/api/admin/distributors/agencies${buildQuery(filters)}`, {
    method: 'GET',
    token,
  });

export const getAgenciesByStockist = (token, stockistId) =>
  apiRequest(`/api/admin/distributors/stockists/${stockistId}/agencies`, {
    method: 'GET',
    token,
  });

export const getAgencyRequests = (token, filters = {}) =>
  apiRequest(`/api/admin/distributors/agency-requests${buildQuery(filters)}`, {
    method: 'GET',
    token,
  });

export const approveAgencyRequest = (token, requestId, payload = {}) =>
  apiRequest(`/api/admin/distributors/agency-requests/${requestId}/approve`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });

export const rejectAgencyRequest = (token, requestId, payload = {}) =>
  apiRequest(`/api/admin/distributors/agency-requests/${requestId}/reject`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
