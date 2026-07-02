import { apiRequest, buildQuery } from './http';

export const getStockistProducts = (token, filters = {}) =>
  apiRequest(`/api/stockist/products${buildQuery(filters)}`, {
    method: 'GET',
    token,
  });

export const placeStockistOrder = (token, payload) =>
  apiRequest('/api/stockist/orders', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });

export const getStockistOrders = (token) =>
  apiRequest('/api/stockist/orders', {
    method: 'GET',
    token,
  });

export const receiveStockistOrder = (token, orderId, payload = {}) =>
  apiRequest(`/api/stockist/orders/${orderId}/receive`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });

export const getStockistInventory = (token) =>
  apiRequest('/api/stockist/inventory', {
    method: 'GET',
    token,
  });