import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTrashAlt, FaEnvelopeOpen } from 'react-icons/fa';
import ContactService from '../../../services/ContactService';

const ContactList = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await ContactService.getAllContacts();
    
            // Handle both possible response formats
            const contactsData = Array.isArray(response) ? response : response.data;
    
            if (contactsData) {
                setContacts(contactsData);
                setError(null);
            } else {
                console.error('Unexpected response format:', response);
                setError('Dữ liệu không đúng định dạng. Vui lòng thử lại sau.');
            }
        } catch (err) {
            console.error('Error loading contacts:', err);
            setError('Không thể tải danh sách liên hệ. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    

    const handleMoveToTrash = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn chuyển liên hệ này vào thùng rác?')) {
            try {
                await ContactService.moveToTrash(id);
                fetchContacts(); // Refresh the list after moving to trash
                alert('Chuyển liên hệ vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác.');
                console.error('Error moving to trash:', err);
            }
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await ContactService.markAsRead(id);
            fetchContacts(); // Refresh the list after marking as read
        } catch (err) {
            alert('Có lỗi xảy ra khi đánh dấu đã đọc.');
            console.error('Error marking as read:', err);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        const date = new Date(dateTimeStr);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter out contacts that are in trash (this is now redundant as the backend should handle this)
    const displayContacts = contacts.filter(contact => !contact.trash);

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">Danh sách liên hệ</h1>
                <div className="space-x-3">
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate('/admin/contact/trash')}
                    >
                        <FaTrashAlt className="inline mr-2" /> Thùng rác
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse"></div>
                            <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                            <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                        </div>
                        <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">ID</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Họ Tên</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Email</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Số điện thoại</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Ngày tạo</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {displayContacts && displayContacts.length > 0 ? (
                                displayContacts.map((contact) => (
                                    <tr key={contact.id} className={`hover:bg-gray-50 transition duration-150 ${!contact.status ? 'bg-blue-50' : ''}`}>
                                        <td className="py-4 px-4 text-center text-gray-600">{contact.id}</td>
                                        <td className="py-4 px-4 text-center text-gray-800 font-medium">{contact.name}</td>
                                        <td className="py-4 px-4 text-center text-gray-600">{contact.email}</td>
                                        <td className="py-4 px-4 text-center text-gray-600">{contact.phone}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contact.status ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                                            >
                                                {contact.status ? 'Đã đọc' : 'Chưa đọc'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center text-gray-600">{formatDateTime(contact.createdAt)}</td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                {!contact.status && (
                                                    <button
                                                        className="bg-blue-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                        onClick={() => handleMarkAsRead(contact.id)}
                                                        title="Đánh dấu đã đọc"
                                                    >
                                                        <FaEnvelopeOpen />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/admin/contact/detail/${contact.id}`)}
                                                    className="bg-yellow-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveToTrash(contact.id)}
                                                    className="bg-red-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Chuyển vào thùng rác"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-gray-500">Không có liên hệ nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ContactList;