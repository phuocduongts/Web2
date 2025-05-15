import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrashAlt, FaUndo } from 'react-icons/fa';
import ContactService from '../../../services/ContactService';

const ContactDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContactDetail();
    }, [id]);

    const fetchContactDetail = async () => {
        try {
            setLoading(true);
            console.log('Fetching contact detail với ID:', id);
            const response = await ContactService.getContactById(id);
            console.log('Dữ liệu nhận từ API:', response);

            const contactData = response.data ? response.data : response;
            if (contactData) {
                setContact(contactData);
                if (!contactData.status) {
                    console.log('Đánh dấu liên hệ là đã đọc');
                    await ContactService.markAsRead(id);
                }
            } else {
                console.error('Unexpected response format:', response);
                setError('Dữ liệu không đúng định dạng.');
            }
        } catch (err) {
            console.error('Error fetching contact detail:', err);
            setError('Không thể tải thông tin liên hệ.');
        } finally {
            setLoading(false);
        }
    };


    const handleMoveToTrash = async () => {
        if (window.confirm('Bạn có chắc chắn muốn chuyển liên hệ này vào thùng rác?')) {
            try {
                await ContactService.moveToTrash(id);
                alert('Chuyển liên hệ vào thùng rác thành công!');
                navigate('/admin/contact');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác.');
                console.error('Error moving to trash:', err);
            }
        }
    };

    const handleRestoreFromTrash = async () => {
        if (window.confirm('Bạn có chắc chắn muốn khôi phục liên hệ này?')) {
            try {
                await ContactService.restoreFromTrash(id);
                alert('Khôi phục liên hệ thành công!');
                fetchContactDetail(); // Refresh the contact details
            } catch (err) {
                alert('Có lỗi xảy ra khi khôi phục liên hệ.');
                console.error('Error restoring contact:', err);
            }
        }
    };

    const handleDeletePermanently = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn liên hệ này? Hành động này không thể hoàn tác.')) {
            try {
                await ContactService.deleteContact(id);
                alert('Xóa liên hệ thành công!');
                navigate('/admin/contact/trash');
            } catch (err) {
                alert('Có lỗi xảy ra khi xóa liên hệ.');
                console.error('Error deleting contact:', err);
            }
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

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate(contact?.trash ? '/admin/contact/trash' : '/admin/contact')}
                        className="mr-4 text-blue-500 hover:text-blue-700"
                    >
                        <FaArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-medium text-gray-700">Chi tiết liên hệ</h1>
                </div>
                <div className="space-x-3">
                    {contact?.trash ? (
                        <>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={handleRestoreFromTrash}
                            >
                                <FaUndo className="inline mr-2" /> Khôi phục
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded"
                                onClick={handleDeletePermanently}
                            >
                                <FaTrashAlt className="inline mr-2" /> Xóa vĩnh viễn
                            </button>
                        </>
                    ) : (
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={handleMoveToTrash}
                        >
                            <FaTrashAlt className="inline mr-2" /> Chuyển vào thùng rác
                        </button>
                    )}
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

            {loading ? (
                <div className="text-center py-12 bg-white shadow-md rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                        <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                    <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
                </div>
            ) : contact ? (
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-sm text-gray-500 uppercase">ID</h2>
                                    <p className="text-gray-800 font-medium">{contact.id}</p>
                                </div>
                                <div>
                                    <h2 className="text-sm text-gray-500 uppercase">Họ Tên</h2>
                                    <p className="text-gray-800 font-medium">{contact.name}</p>
                                </div>
                                <div>
                                    <h2 className="text-sm text-gray-500 uppercase">Email</h2>
                                    <p className="text-gray-800">{contact.email}</p>
                                </div>
                                <div>
                                    <h2 className="text-sm text-gray-500 uppercase">Số điện thoại</h2>
                                    <p className="text-gray-800">{contact.phone}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-sm text-gray-500 uppercase">Trạng thái</h2>
                                    <p>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contact.status ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                                        >
                                            {contact.status ? 'Đã đọc' : 'Chưa đọc'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <h2 className="text-sm text-gray-500 uppercase">Ngày tạo</h2>
                                    <p className="text-gray-800">{formatDateTime(contact.createdAt)}</p>
                                </div>
                                <div>
                                    <h2 className="text-sm text-gray-500 uppercase">Trạng thái xóa</h2>
                                    <p>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contact.trash ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                        >
                                            {contact.trash ? 'Đã xóa' : 'Đang hoạt động'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-sm text-gray-500 uppercase mb-2">Nội dung</h2>
                            <div className="bg-gray-50 p-4 rounded border border-gray-200 prose max-w-none">
                                <p className="whitespace-pre-wrap">{contact.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <p>Không tìm thấy thông tin liên hệ.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactDetail;