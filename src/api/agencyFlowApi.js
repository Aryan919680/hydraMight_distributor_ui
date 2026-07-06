import { apiRequest, buildQuery } from "./http";

export const getStockistAgentInventory = (token) =>
  apiRequest(
    "/api/distributor/agency-flow/stockist/inventory",
    {
      method: "GET",
      token,
    }
  );

export const saveStockistAgencyListing = (token, payload) =>
  apiRequest(
    "/api/distributor/agency-flow/stockist/listings",
    {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }
  );

export const updateStockistAgencyListing = (
  token,
  listingId,
  payload
) =>
  apiRequest(
    `/api/distributor/agency-flow/stockist/listings/${listingId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }
  );

export const getStockistAgencyOrders = (token) =>
  apiRequest(
    "/api/distributor/agency-flow/stockist/agency-orders",
    {
      method: "GET",
      token,
    }
  );

export const approveStockistAgencyOrder = (token, orderId) =>
  apiRequest(
    `/api/distributor/agency-flow/stockist/agency-orders/${orderId}/approve`,
    {
      method: "POST",
      token,
      body: JSON.stringify({}),
    }
  );

export const rejectStockistAgencyOrder = (
  token,
  orderId,
  reason
) =>
  apiRequest(
    `/api/distributor/agency-flow/stockist/agency-orders/${orderId}/reject`,
    {
      method: "POST",
      token,
      body: JSON.stringify({ reason }),
    }
  );

export const getAgencyCatalog = (token, filters = {}) =>
  apiRequest(
    `/api/distributor/agency-flow/agency/catalog${buildQuery(
      filters
    )}`,
    {
      method: "GET",
      token,
    }
  );

export const placeAgencyOrder = (token, payload) =>
  apiRequest(
    "/api/distributor/agency-flow/agency/orders",
    {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }
  );

export const getAgencyOrders = (token) =>
  apiRequest(
    "/api/distributor/agency-flow/agency/orders",
    {
      method: "GET",
      token,
    }
  );

export const getAgencyBenefits = (token) =>
  apiRequest(
    "/api/distributor/agency-flow/agency/benefits",
    {
      method: "GET",
      token,
    }
  );