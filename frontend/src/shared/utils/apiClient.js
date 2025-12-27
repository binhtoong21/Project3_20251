const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const getAuthToken = () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData).token : null;
};

const request = async (method, endpoint, { body, ...customConfig } = {}) => {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        method,
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || "Something went wrong");
            error.status = response.status;
            throw error;
        }

        return data;
    } catch (error) {
        throw error;
    }
};

//  New function for multipart/form-data
const requestMultipart = async (method, endpoint, { body, ...customConfig } = {}) => {
    const token = getAuthToken();
    const headers = {}; // No 'Content-Type'

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        method,
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = body; // Body is FormData
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || "Something went wrong");
            error.status = response.status;
            throw error;
        }

        return data;
    } catch (error) {
        throw error;
    }
};


const apiClient = {
    get: (endpoint, config) => request("GET", endpoint, config),
    post: (endpoint, body, config) => request("POST", endpoint, { ...config, body }),
    put: (endpoint, body, config) => request("PUT", endpoint, { ...config, body }),
    delete: (endpoint, config) => request("DELETE", endpoint, config),
    postMultipart: (endpoint, body, config) => requestMultipart("POST", endpoint, { ...config, body }),
    putMultipart: (endpoint, body, config) => requestMultipart("PUT", endpoint, { ...config, body }),
};

export default apiClient;