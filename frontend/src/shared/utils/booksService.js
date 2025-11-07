import { apiGet } from './apiClient';

export async function listBooks(params) {
  return apiGet('/books', params);
}

export async function getBook(id) {
  return apiGet(`/books/${id}`);
}
