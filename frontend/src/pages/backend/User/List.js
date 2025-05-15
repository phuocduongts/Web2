import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../../services/UserService';
import { FaEye, FaEdit, FaTrashAlt, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersData = await UserService.getAll();
            setUsers(usersData);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const user = users.find(u => u.id === id);
            await UserService.update(id, { ...user, status: !user.status });
            fetchUsers();
            alert('Cập nhật trạng thái thành công!');
        } catch (err) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái.');
            console.error('Error updating user status:', err);
        }
    };

    const handleMoveToTrash = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn chuyển người dùng này vào thùng rác?')) {
            try {
                await UserService.moveToTrash(id);
                fetchUsers();
                alert('Chuyển người dùng vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác.');
                console.error('Error moving user to trash:', err);
            }
        }
    };

    const AuthenticatedImage = ({ src, alt, className }) => {
        const [imageSrc, setImageSrc] = useState(null);

        useEffect(() => {
            const fetchImage = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(src, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const blob = await response.blob();
                        setImageSrc(URL.createObjectURL(blob));
                    } else {
                        setImageSrc('/placeholder-image.jpg');
                    }
                } catch (error) {
                    console.error('Error loading image:', error);
                    setImageSrc('/placeholder-image.jpg');
                }
            };

            fetchImage();

            return () => {
                if (imageSrc && imageSrc.startsWith('blob:')) {
                    URL.revokeObjectURL(imageSrc);
                }
            };
        }, [src]);

        return <img src={imageSrc || '/loading-placeholder.jpg'} alt={alt} className={className} />;
    };

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">Danh sách người dùng</h1>
                <div className="space-x-3">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate('/admin/user/create')}
                    >
                        <FaPlus className="inline mr-2" /> Thêm
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate('/admin/user/trash')}
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
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Ảnh</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Tên</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Email</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Vai trò</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="py-4 px-4 text-center text-gray-600">{user.id}</td>
                                        <td className="py-4 px-4 text-center">
                                            {user.image ? (
                                                <AuthenticatedImage
                                                    src={`http://localhost:8080/uploads/users/${user.image}`}
                                                    alt={user.fullName}
                                                    className="h-10 w-10 rounded-full object-cover mx-auto"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                                                    <span className="text-gray-500 text-xs">No img</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center text-gray-800 font-medium">{user.fullName || 'N/A'}</td>
                                        <td className="py-4 px-4 text-center text-gray-600">{user.email}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.status ? 'Hoạt động' : 'Vô hiệu hóa'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    className={`p-2 rounded ${user.status ? 'bg-green-500' : 'bg-gray-400'} 
                                                        text-white hover:opacity-80 transition duration-150`}
                                                    onClick={() => handleToggleStatus(user.id)}
                                                    title={user.status ? "Vô hiệu hóa" : "Kích hoạt"}
                                                >
                                                    {user.status ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/user/detail/${user.id}`)}
                                                    className="bg-yellow-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/user/update/${user.id}`)}
                                                    className="bg-blue-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveToTrash(user.id)}
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
                                    <td colSpan="7" className="text-center py-12 text-gray-500">Không có người dùng nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserList;