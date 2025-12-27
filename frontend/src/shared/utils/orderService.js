import apiClient from './apiClient';

/**
 * Fetches the sales data for the currently logged-in user.
 * @returns {Promise<Array>} A promise that resolves to an array of sale items.
 */
export const getMySales = () => {
  return apiClient.get('/orders/my-sales');
};
