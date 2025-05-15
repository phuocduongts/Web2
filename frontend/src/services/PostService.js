import httpAxios from "./httpAxios";

const PostService = {
    index: async () => await httpAxios.get("posts"),
    
    create: async (data) => {
        return await httpAxios.post(`posts`, data);
    },
    
    update: async (id, data) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("content", data.content);
        formData.append("topicId", data.topic_id);
        formData.append("status", data.status);
        
        if (data.image) {
            formData.append("image", data.image); // phải là File hoặc Blob
        }
        
        return await httpAxios.put(`posts/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    
    detail: async (id) => {
        return await httpAxios.get(`posts/${id}`);
    },
    
    // Add new method to get posts by topic
    getByTopic: async (topicId) => {
        return await httpAxios.get(`posts/topic/${topicId}`);
    },
    
    status: async (id) => {
        return await httpAxios.put(`posts/status/${id}`);
    },
    
    delete: async (id) => {
        return await httpAxios.delete(`posts/delete/${id}`);
    },
    
    moveToTrash: async (id) => {
        return await httpAxios.put(`posts/trash/${id}`);
    },
    
    restoreFromTrash: async (id) => {
        return await httpAxios.put(`posts/restore/${id}`);
    },
    
    getTrash: async () => {
        return await httpAxios.get(`posts/trash`);
    },
    
    emptyTrash: async () => {
        return await httpAxios.delete(`posts/trash/empty`);
    }
};

export default PostService;