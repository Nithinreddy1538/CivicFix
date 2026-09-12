import axios from "axios";

const API = axios.create({
 baseURL: "https://civicfix-fs43.onrender.com/api"
});

// Request interceptor: Attach bearer token if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");

    // Don't send authorization for public stateless endpoints if token is suspect
    const isPublicStateless =
        config.url?.includes("/ai/classify") ||
        config.url?.includes("/complaints/reverse-geocode") ||
        config.url?.includes("/complaints/track/");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Response interceptor: Transparently refresh expired JWT access token
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized and not already retried
        if (
            error.response &&
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            // Never retry refresh or login endpoints to prevent loop
            if (
                originalRequest.url?.includes("/accounts/token/refresh/") ||
                originalRequest.url?.includes("/accounts/login/")
            ) {
                return Promise.reject(error);
            }

            const refreshToken = localStorage.getItem("refresh");

            if (refreshToken) {
                originalRequest._retry = true;

                try {
                    const refreshRes = await axios.post(
                        "https://civicfix-fs43.onrender.com/api/accounts/token/refresh/",
                        { refresh: refreshToken }
                    );

                    const newAccess = refreshRes.data.access;
                    localStorage.setItem("access", newAccess);

                    API.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
                    originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

                    return API(originalRequest);
                } catch (refreshErr) {
                    // Refresh token is expired or invalid as well: clear session
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                    localStorage.removeItem("username");
                    localStorage.removeItem("role");
                    localStorage.removeItem("is_admin");
                    localStorage.removeItem("is_officer");

                    if (!window.location.pathname.includes("/login")) {
                        window.location.href = "/login";
                    }

                    return Promise.reject(refreshErr);
                }
            } else {
                // No refresh token available, session is invalid
                localStorage.removeItem("access");
                localStorage.removeItem("username");
                localStorage.removeItem("role");

                if (!window.location.pathname.includes("/login")) {
                    window.location.href = "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);

export default API;
