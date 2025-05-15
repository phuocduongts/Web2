import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import UserService from '../../../services/UserService'; // Đã điều chỉnh để sử dụng UserService

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(''); // Thêm state cho thông báo đăng nhập thành công
    const navigate = useNavigate();

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            navigate('/admin');
        }
    }, [navigate]);

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!credentials.username) {
            tempErrors.username = 'Tên đăng nhập không được để trống';
            isValid = false;
        }

        if (!credentials.password) {
            tempErrors.password = 'Mật khẩu không được để trống';
            isValid = false;
        } else if (credentials.password.length < 6) {
            tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
        // Clear login error
        if (loginError) {
            setLoginError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);
            setLoginError('');

            try {
                // UserService.adminLogin trả về response.data do interceptor của httpAxios
                const response = await UserService.adminLogin(credentials.username, credentials.password);

                if (response && response.token) {
                    // Hiển thị thông báo đăng nhập thành công
                    setLoginSuccess('Đăng nhập thành công! Đang chuyển hướng...');

                    // Save token and user info
                    localStorage.setItem('admin_token', response.token);

                    // Lưu thông tin chi tiết của người dùng
                    const userData = {
                        id: response.user.id,
                        username: response.user.username,
                        email: response.user.email,
                        fullname: response.user.fullname || response.user.name || 'Admin User',
                        role: response.user.role || 'admin'
                    };

                    localStorage.setItem('user', JSON.stringify(userData));

                    // Chờ một chút để hiển thị thông báo trước khi chuyển hướng
                    setTimeout(() => {
                        // Redirect to admin dashboard
                        navigate('/admin');
                    }, 1500);
                } else {
                    setLoginError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
                }
            } catch (error) {
                console.error('Login error:', error);
                // Lấy thông báo lỗi từ response hoặc sử dụng thông báo mặc định
                const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng thử lại sau.';
                setLoginError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white font-mono">Đăng nhập Admin</h2>
                        <p className="mt-2 text-gray-300 font-mono">Vui lòng đăng nhập để tiếp tục</p>
                    </div>
                </div>

                <div className="px-8 py-8">
                    {loginError && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-mono">{loginError}</p>
                        </div>
                    )}

                    {loginSuccess && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
                            <User size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-mono">{loginSuccess}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2 font-mono">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    className={`pl-10 font-mono block w-full border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="admin"
                                />
                            </div>
                            {errors.username && <p className="mt-1 text-sm text-red-600 font-mono">{errors.username}</p>}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2 font-mono">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className={`pl-10 font-mono block w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600 font-mono">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <input
                                    id="remember_me"
                                    name="remember_me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 font-mono">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 font-mono">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || loginSuccess}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-mono disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : loginSuccess ? 'Đã đăng nhập' : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-gray-50 px-8 py-5 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600 font-mono">
                        © {new Date().getFullYear()} Admin Dashboard. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;