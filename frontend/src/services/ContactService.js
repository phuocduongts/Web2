import httpAxios from './httpAxios';

const ContactService = {
    // Submit a new contact form
    // ContactService.js (ví dụ)
    submitContact: async (contactData) => {
        try {
            const response = await httpAxios.post('contacts', contactData);
            return response.data; // response.data chính là đối tượng Contact từ backend
        } catch (error) {
            throw error;
        }
    },

    // Get all contacts (for admin dashboard)
    getAllContacts: () => {
        return httpAxios.get('contacts');
    },

    // Get unread contacts
    getUnreadContacts: () => {
        return httpAxios.get('contacts/unread');
    },

    // Get a single contact by ID
    getContactById: (id) => {
        return httpAxios.get(`contacts/${id}`);
    },

    // Mark a contact as read
    markAsRead: (contactId) => {
        return httpAxios.put(`contacts/${contactId}/read`);
    },

    // Move contact to trash
    moveToTrash: (contactId) => {
        return httpAxios.put(`contacts/${contactId}/trash`);
    },

    // Restore contact from trash
    restoreFromTrash: (contactId) => {
        return httpAxios.put(`contacts/${contactId}/restore`);
    },

    // Delete contact permanently
    deleteContact: (contactId) => {
        return httpAxios.delete(`contacts/${contactId}`);
    }
};

export default ContactService;