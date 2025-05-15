import httpAxios from './httpAxios';

const OrderDetailService = {
    // Get all details for a specific order
    getOrderDetailsByOrderId: (orderId) => {
        return httpAxios.get(`order-details/order/${orderId}`);
    },

    // Get an order detail by ID
     getOrderDetailById: async (id) => {
        try {
            const response = await httpAxios.get(`order-details/${id}`);
            return response;
        } catch (error) {
            console.error("Error fetching order detail:", error);
            throw error;
        }
    },

    // Update order detail quantity
    updateOrderDetailQuantity: (id, quantity) => {
        return httpAxios.put(`order-details/${id}/quantity`, null, {
            params: { quantity }
        });
    },

    // Remove an item from an order
    removeOrderDetail: (id) => {
        return httpAxios.delete(`order-details/${id}`);
    },

    // Add a new item to an existing order
    addItemToOrder: (orderId, productId, quantity) => {
        return httpAxios.post(`order-details/order/${orderId}`, null, {
            params: { productId, quantity }
        });
    },

    // Get best selling products
    getBestSellingProducts: (limit = 10) => {
        return httpAxios.get('order-details/best-selling', {
            params: { limit }
        });
    },

    // Get total quantity sold for a product
    getTotalQuantitySoldByProductId: (productId) => {
        return httpAxios.get(`order-details/product/${productId}/total-sold`);
    }
};

export default OrderDetailService;