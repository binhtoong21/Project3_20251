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
        // console.error(error);
        throw error;
    }
};

const apiClient = {
    get: (endpoint, config) => request("GET", endpoint, config),
    post: (endpoint, body, config) => request("POST", endpoint, { ...config, body }),
    put: (endpoint, body, config) => request("PUT", endpoint, { ...config, body }),
    delete: (endpoint, config) => request("DELETE", endpoint, config),
};

export default apiClient;