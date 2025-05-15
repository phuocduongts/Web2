import httpAxios from "./httpAxios";

const AuthService = {
    async login(username, password) {
        try {
            const response = await httpAxios.post(`auth/login`, {
                username: username,
                password: password
            });

            if (response.data) {
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                return response.data;
            }
            throw new Error(response.data?.message || 'Đăng nhập không thành công');
        } catch (error) {
            throw new Error(error.response?.data?.message ||
                error.message ||
                'Đăng nhập không thành công');
        }
    },

    async register(userData) {
        try {
            const response = await httpAxios.post('auth/register', userData);
            if (response.data) {
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                return response.data;
            }
            throw new Error(response.data?.message || 'Đăng ký không thành công');
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Đăng ký không thành công'
            );
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    setupAxiosInterceptors() {
        httpAxios.interceptors.request.use(
            config => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );
    },
    async getUserInfo() {
        try {
            const response = await httpAxios.get('auth/me');
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Không thể tải thông tin tài khoản'
            );
        }
    },

    /**
     * Update user account information
     * @param {Object} userData - User data to update
     * @param {File} imageFile - Optional image file to upload
     */
    async updateUserInfo(userData, imageFile = null) {
        try {
            // Create form data object
            const formData = new FormData();

            // Add user data as JSON
            const userBlob = new Blob([JSON.stringify(userData)], {
                type: 'application/json'
            });
            formData.append('user', userBlob);

            // Add image file if provided
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await httpAxios.put('auth/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update local storage
            if (response.data && response.data.success && response.data.data) {
                const currentUser = AuthService.getCurrentUser();
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...response.data.data };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }

            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Cập nhật thông tin không thành công'
            );
        }
    },

    /**
     * Change user password
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     */
    async changePassword(oldPassword, newPassword) {
        try {
            const response = await httpAxios.post('auth/change-password', {
                oldPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Thay đổi mật khẩu không thành công'
            );
        }
    }
};

export default AuthService;