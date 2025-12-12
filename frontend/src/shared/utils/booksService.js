import apiClient from "./apiClient";

function buildQueryString(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export async function listBooks(params) {
  const query = buildQueryString(params);
  return apiClient.get(`/books${query}`);
}

export async function getBook(id) {
  return apiClient.get(`/books/${id}`);
}
