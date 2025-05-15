import httpAxios from "./httpAxios";

const BannerService = {
    // Lấy danh sách banner
    index: async () => await httpAxios.get("banners"),

    // Tạo banner mới
    create: async (data) => {
        return await httpAxios.post(`banners`, data);
    },

    // Cập nhật banner
    update: async (id, data) => {
        // Sử dụng FormData API để gửi dữ liệu multipart/form-data
        return await httpAxios.put(`banners/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Lấy chi tiết banner
    detail: async (id) => {
        return await httpAxios.get(`banners/${id}`);
    },

    // Thay đổi trạng thái banner (hiển thị/ẩn)
    status: async (id) => {
        return await httpAxios.put(`banners/status/${id}`);
    },

    // Xóa vĩnh viễn banner
    delete: async (id) => {
        return await httpAxios.delete(`banners/delete/${id}`);
    },

    // Chuyển banner vào thùng rác
    moveToTrash: async (id) => {
        return await httpAxios.put(`banners/trash/${id}`);
    },

    // Khôi phục banner từ thùng rác
    restoreFromTrash: async (id) => {
        return await httpAxios.put(`banners/restore/${id}`);
    },

    // Lấy danh sách banner trong thùng rác
    getTrash: async () => {
        return await httpAxios.get(`banners/trash`);
    },

    // Làm trống thùng rác (xóa vĩnh viễn tất cả banner trong thùng rác)
    emptyTrash: async () => {
        return await httpAxios.delete(`banners/trash/empty`);
    }
};

export default BannerService;