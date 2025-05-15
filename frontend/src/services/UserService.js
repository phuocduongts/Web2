import httpAxios from "./httpAxios";

/**
 * Handle API errors
 */
const handleError = (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "An error occurred while communicating with the API." };
};

const UserService = {
    adminLogin: async (username, password) => {
        try {
            // Send login request with username and password
            const response = await httpAxios.post("users/admin/login", {
                username,
                password
            });

            // Check if response contains the expected data structure
            if (response && response.success && response.data) {
                // Return the token and potentially other user data
                return {
                    token: response.data,
                    user: { username } // Add more user info if available from response
                };
            } else {
                throw new Error('Định dạng phản hồi không hợp lệ');
            }
        } catch (error) {
            console.error('Login error:', error);
            // If it's already an Error object with a message, rethrow it
            if (error.message) {
                throw error;
            }
            // Otherwise handle it through our helper
            throw handleError(error);
        }
    },

    getAll: async () => {
        try {
            const response = await httpAxios.get("users");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Get trashed users
     */
    getTrashedUsers: async () => {
        try {
            const response = await httpAxios.get("users/trash");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Get user by ID
     */
    getById: async (id) => {
        try {
            const response = await httpAxios.get(`users/${id}`);

            // Ensure the profileImage is accessible
            if (response.data && response.data.profileImageUrl) {
                response.data.profileImage = response.data.profileImageUrl;
            }

            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Create a new user
     */
    create: async (userData, image = null) => {
        try {
            // Create FormData object for multipart/form-data
            const formData = new FormData();

            // Add user data as JSON in a part called "user"
            formData.append('user', new Blob([JSON.stringify(userData)], {
                type: 'application/json'
            }));

            // Add image if provided
            if (image) {
                formData.append('image', image);
            }

            // Set headers for multipart/form-data
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const response = await httpAxios.post(`users`, formData, config);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    /**
     * Update user information
     */
    update: async (id, userData, imageFile) => {
        try {
            const formData = new FormData();

            // Add user data as JSON
            formData.append("user", new Blob([JSON.stringify(userData)], {
                type: 'application/json'
            }));

            // Add image if provided
            if (imageFile) {
                formData.append("image", imageFile);
            }

            // Set headers for multipart/form-data
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const response = await httpAxios.put(`users/${id}`, formData, config);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Delete user permanently
     */
    delete: async (id) => {
        try {
            const response = await httpAxios.delete(`users/delete/${id}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Soft delete (move user to trash)
     */
    moveToTrash: async (id) => {
        try {
            const response = await httpAxios.put(`users/trash/${id}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Restore user from trash
     */
    restoreFromTrash: async (id) => {
        try {
            const response = await httpAxios.put(`users/restore/${id}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Toggle user status
     */
    toggleStatus: async (id) => {
        try {
            const response = await httpAxios.put(`users/status/${id}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    forgotPassword: async (dto) => {
        try {
            const response = await httpAxios.post("auth/forgot-password", dto);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
 
    resetPassword: async (dto) => {
        try {
            const response = await httpAxios.post("auth/reset-password", dto);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
};

export default UserService;