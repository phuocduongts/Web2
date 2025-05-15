import React, { useState, useEffect } from 'react';
import AuthService from '../../services/AuthService';

export default function AccountInfo() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const userData = await AuthService.getUserInfo();
            setUser(userData);
            setFormData({
                fullName: userData.fullName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || ''
            });
            setLoading(false);
        } catch (err) {
            setError('Không thể tải thông tin tài khoản');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
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

            if (src) {
                fetchImage();
            }

            return () => {
                if (imageSrc && imageSrc.startsWith('blob:')) {
                    URL.revokeObjectURL(imageSrc);
                }
            };
        }, [src]);

        return <img src={imageSrc || '/loading-placeholder.jpg'} alt={alt} className={className} />;
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await AuthService.updateUserInfo(formData, imageFile);
            setSuccess('Cập nhật thông tin thành công');
            loadUserData(); // Reload user data
        } catch (err) {
            setError(err.message || 'Cập nhật thông tin không thành công');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Mật khẩu mới không khớp');
            return;
        }

        try {
            setLoading(true);
            await AuthService.changePassword(
                passwordData.oldPassword,
                passwordData.newPassword
            );
            setPasswordSuccess('Thay đổi mật khẩu thành công');
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setPasswordError(err.message || 'Thay đổi mật khẩu không thành công');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl font-mono">Đang tải thông tin...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-16 py-8">
            <h1 className="text-2xl font-bold mb-6 font-mono">Thông tin tài khoản</h1>

            {/* Tab navigation */}
            <div className="flex border-b mb-6">
                <button
                    className={`py-2 px-4 font-mono ${activeTab === 'info' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('info')}
                >
                    Thông tin cá nhân
                </button>
                <button
                    className={`py-2 px-4 font-mono ${activeTab === 'password' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('password')}
                >
                    Đổi mật khẩu
                </button>
            </div>

            {/* Personal Info Tab */}
            {activeTab === 'info' && (
                <div className="bg-white p-6  shadow-md">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3  mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3  mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Left column - avatar */}
                            <div className="w-full md:w-1/3">
                                <div className="flex flex-col items-center">
                                    <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                        ) : user?.image ? (
                                            <AuthenticatedImage
                                                src={`http://localhost:8080/uploads/users/${user.image}`}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-center cursor-pointer bg-gray-100 text-gray-700 font-mono py-2 px-4  hover:bg-gray-200">
                                            Thay đổi ảnh đại diện
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2 text-center font-mono">Cho phép JPG, GIF hoặc PNG. Kích thước tối đa 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right column - form fields */}
                            <div className="w-full md:w-2/3">
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-mono mb-2">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 -md font-mono bg-gray-100"
                                        value={user?.username || ''}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-mono mb-2">Họ và tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="w-full px-3 py-2 border border-gray-300 -md font-mono"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-mono mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full px-3 py-2 border border-gray-300 -md font-mono"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-mono mb-2">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        className="w-full px-3 py-2 border border-gray-300 -md font-mono"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-mono mb-2">Địa chỉ</label>
                                    <textarea
                                        name="address"
                                        className="w-full px-3 py-2 border border-gray-300 -md font-mono"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        className="bg-red-600 text-white px-6 py-2 -md font-mono hover:bg-red-700 disabled:bg-red-300"
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang xử lý...' : 'Lưu thông tin'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Password Change Tab */}
            {activeTab === 'password' && (
                <div className="bg-white p-6  shadow-md">
                    {passwordError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3  mb-4">
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3  mb-4">
                            {passwordSuccess}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-mono mb-2">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                name="oldPassword"
                                className="w-full px-3 py-2 border border-gray-300 -md font-mono"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-mono mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                name="newPassword"
                                className="w-full px-3 py-2 border border-gray-300 -md font-mono"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                            />
                            <p className="text-xs text-gray-500 mt-1 font-mono">Mật khẩu phải có ít nhất 6 ký tự</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-mono mb-2">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="w-full px-3 py-2 border border-gray-300 -md font-mono"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="bg-red-600 text-white px-6 py-2 -md font-mono hover:bg-red-700 disabled:bg-red-300"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}