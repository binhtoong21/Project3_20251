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

// ===============================================
// C2C User Book Service
// ===============================================

export async function listMyBooks() {
  return apiClient.get("/books/my-books");
}

export async function createUserBook(formData) {
  return apiClient.postMultipart("/books/user", formData);
}

export async function updateUserBook(id, formData) {
  return apiClient.putMultipart(`/books/user/${id}`, formData);
}

export async function deleteUserBook(id) {
  return apiClient.delete(`/books/user/${id}`);
}
