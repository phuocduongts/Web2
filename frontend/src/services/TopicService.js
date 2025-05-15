import httpAxios from "./httpAxios";

const TopicService = {
        index: async () => await httpAxios.get("topics"),
        
        create: async (data) => {
            return await httpAxios.post(`topics`, data);
        },
        
        update: async (id, data) => {
            return await httpAxios.put(`topics/${id}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
        
        detail: async (id) => {
            return await httpAxios.get(`topics/${id}`);
        },
        
        status: async (id) => {
            return await httpAxios.put(`topics/status/${id}`);
        },
            
        delete: async (id) => {
            return await httpAxios.delete(`topics/delete/${id}`);
        },
        
        moveToTrash: async (id) => {
            return await httpAxios.put(`topics/trash/${id}`);
        },
        
        restoreFromTrash: async (id) => {
            return await httpAxios.put(`topics/restore/${id}`);
        },
        
        getTrash: async () => {
            return await httpAxios.get(`topics/trash`);
        },
        
        emptyTrash: async () => {
            return await httpAxios.delete(`topics/trash/empty`);
        }
};

export default TopicService;