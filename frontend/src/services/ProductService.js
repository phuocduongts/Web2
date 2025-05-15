import httpAxios from "./httpAxios";

const ProductService = {
    getAll: async () => {
        return await httpAxios.get("products");
    },
    
    getOnSale: async () => {
        return await httpAxios.get(`products/on-sale`);
    },
    
    getMostViewed: async () => {
        return await httpAxios.get(`products/most-viewed`);
    },
    
    create: async (data) => {
        return await httpAxios.post(`products`, data);
    },
    
    update: async (id, data) => {
        return await httpAxios.put(`products/${id}`, data);
    },
    
    getById: async (id) => {
        return await httpAxios.get(`products/${id}`);
    },
    
    toggleStatus: async (id) => {
        return await httpAxios.put(`products/status/${id}`);
    },
    
    delete: async (id) => {
        return await httpAxios.delete(`products/${id}`);
    },
    
    moveToTrash: async (id) => {
        return await httpAxios.put(`products/trash/${id}`);
    },
    
    restoreFromTrash: async (id) => {
        return await httpAxios.put(`products/restore/${id}`);
    },

    getTrash: async () => {
        return await httpAxios.get(`products/trash`);
    },
    
    search: async (params) => {
        return await httpAxios.get(`products/search`, { params });
    },
    
    getByCategory: async (categoryId) => {
        return await httpAxios.get(`products/category/${categoryId}`);
    }
};

export default ProductService;