import httpAxios from "./httpAxios";

/**
 * Handle API errors
 */
const handleError = (error) => {
    console.error("Order API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "An error occurred while processing your order request." };
};

const OrderService = {
    /**
     * Create a new order
     */
    createOrder: (orderData) => {
        return httpAxios.post('orders', orderData);
    },
    /**
     * Get order by ID
     */
    getOrderById: async (id) => {
        try {
            const response = await httpAxios.get(`orders/${id}`);
            return response;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Get all orders for a user
     */
    getUserOrders: async (userId) => {
        try {
            const response = await httpAxios.get(`orders/user/${userId}`);
            return response.data || [];
        } catch (error) {
            console.error("Error fetching user orders:", error);
            return [];
        }
    },

    /**
     * Get all orders
     */
    getAllOrders: async () => {
        try {
            const response = await httpAxios.get("orders");
            console.log("Raw API response:", response);
            
            // Ensure we always return an array
            if (!response) {
                console.warn("API returned null or undefined data");
                return [];
            }
            
            // If data is not an array, try to handle common response formats
            if (!Array.isArray(response)) {
                console.warn("API did not return an array, checking for data property:", response);
                // Check if response.data has a common property like 'content', 'items', 'data', etc.
                if (response.data.content && Array.isArray(response.data.content)) {
                    return response.data.content;
                }
                if (response.data.items && Array.isArray(response.data.items)) {
                    return response.data.items;
                }
                if (response.data.data && Array.isArray(response.data.data)) {
                    return response.data.data;
                }
                // If we can't find a known array property, return an empty array
                console.error("Could not extract array data from response:", response);
                return [];
            }
            
            return response;
        } catch (error) {
            console.error("Error fetching all orders:", error);
            return [];
        }
    },

    /**
     * Search orders
     */
    searchOrders: async (searchTerm) => {
        try {
            const response = await httpAxios.get(`orders/search?term=${searchTerm}`);
            return response.data || [];
        } catch (error) {
            console.error("Error searching orders:", error);
            return [];
        }
    },

    /**
     * Update order status
     */
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await httpAxios.put(`orders/${orderId}/status?status=${status}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Update payment status
     */
    updatePaymentStatus: async (orderId, status) => {
        try {
            const response = await httpAxios.put(`orders/${orderId}/payment?status=${status}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Update tracking information
     */
    updateTrackingInfo: async (orderId, trackingNumber) => {
        try {
            const response = await httpAxios.put(`orders/${orderId}/tracking?trackingNumber=${trackingNumber}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Cancel an order
     */
    cancelOrder: async (orderId) => {
        try {
            const response = await httpAxios.put(`orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Move order to trash (soft delete)
     */
    moveToTrash: async (orderId) => {
        try {
            const response = await httpAxios.delete(`orders/${orderId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Restore order from trash
     */
    restoreFromTrash: async (orderId) => {
        try {
            const response = await httpAxios.put(`orders/${orderId}/restore`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Get recent orders
     */
    getRecentOrders: async (limit = 5) => {
        try {
            const response = await httpAxios.get(`orders/recent?limit=${limit}`);
            return response.data || [];
        } catch (error) {
            console.error("Error fetching recent orders:", error);
            return [];
        }
    },

    /**
     * Get order statistics
     */
    getOrderStats: async () => {
        try {
            const response = await httpAxios.get("orders/status");
            return response.data || {};
        } catch (error) {
            console.error("Error fetching order stats:", error);
            return {};
        }
    }
};

export default OrderService;