import httpAxios from "./httpAxios";

const CategoryService = {
        index: async () => await httpAxios.get("categories"),
        
        create: async (data) => {
            return await httpAxios.post(`categories`, data);
        },
        
        update: async (id, data) => {
            return await httpAxios.put(`categories/${id}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
        
        detail: async (id) => {
            return await httpAxios.get(`categories/${id}`);
        },
        
        status: async (id) => {
            return await httpAxios.put(`categories/status/${id}`, { status: true });
        },
        
        delete: async (id) => {
            return await httpAxios.delete(`categories/${id}`);
        },
        
        moveToTrash: async (id) => {
            return await httpAxios.put(`categories/trash/${id}`);
        },
        
        restoreFromTrash: async (id) => {
            return await httpAxios.put(`categories/restore/${id}`);
        },
        
        getTrash: async () => {
            return await httpAxios.get(`categories/trash`);
        },
        
        emptyTrash: async () => {
            return await httpAxios.delete(`categories/trash/empty`);
        }
};

export default CategoryService;