import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
export default function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        fullname: '',
        birthDate: '',
        gender: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear errors for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleGenderChange = (value) => {
        setFormData({
            ...formData,
            gender: value
        });

        // Clear error for gender field
        if (errors.gender) {
            setErrors({
                ...errors,
                gender: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Vui lòng nhập tên người dùng';
        } else {
            // Kiểm tra định dạng username (không chứa ký tự đặc biệt và khoảng trắng)
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(formData.username)) {
                newErrors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
            }
        }

        if (!formData.fullname.trim()) {
            newErrors.fullname = 'Vui lòng nhập họ và tên';
        }

        if (!formData.birthDate) {
            newErrors.birthDate = 'Vui lòng nhập ngày sinh';
        } else {
            // Validate date format (MM/DD/YYYY)
            const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
            if (!dateRegex.test(formData.birthDate)) {
                newErrors.birthDate = 'Ngày sinh không hợp lệ (định dạng MM/DD/YYYY)';
            } else {
                // Check if it's a valid date
                const parts = formData.birthDate.split('/');
                const date = new Date(parts[2], parts[0] - 1, parts[1]);
                const isValidDate = date.getMonth() === parseInt(parts[0]) - 1 &&
                    date.getDate() === parseInt(parts[1]) &&
                    date.getFullYear() === parseInt(parts[2]);

                if (!isValidDate) {
                    newErrors.birthDate = 'Ngày sinh không hợp lệ';
                }
            }
        }

        if (!formData.gender) {
            newErrors.gender = 'Vui lòng chọn giới tính';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset messages
        setServerError('');
        setSuccessMessage('');

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Format the data for the backend
        const userData = {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullname.trim(), // Lưu ý: fullname -> fullName để phù hợp với backend
            birthDate: formatDateForBackend(formData.birthDate),
            gender: formData.gender,
            role: 'user', // Default role for new registrations
            status: 1, // Active by default
        };

        try {
            setIsLoading(true);

            // Sử dụng AuthService để đăng ký
            const response = await AuthService.register(userData);

            setSuccessMessage('Đăng ký thành công! Bạn sẽ được chuyển đến trang chủ...');

            // Redirect after successful registration
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            setServerError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Format date from MM/DD/YYYY to YYYY-MM-DD for backend
    const formatDateForBackend = (dateString) => {
        if (!dateString) return null;

        const parts = dateString.split('/');
        if (parts.length !== 3) return null;

        // Convert MM/DD/YYYY to YYYY-MM-DD
        return `${parts[2]}-${parts[0]}-${parts[1]}`;
    };

    const handleBack = () => {
        navigate('/'); // Navigate to home page
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-5xl font-mono text-gray-900 mb-6">Tạo tài khoản</h2>
                    <p className="text-gray-600 font-mono mb-4">
                        Đăng ký để trải nghiệm tất cả các dịch vụ của chúng tôi.
                    </p>
                    {/* Success message */}
                    {successMessage && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                            <p>{successMessage}</p>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <form className="space-y-6 w-full" onSubmit={handleSubmit}>
                    {/* Server error message */}
                    {serverError && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>{serverError}</p>
                        </div>
                    )}

                    <div>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Tên người dùng"
                            value={formData.username}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-4 py-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono`}
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1 font-mono">{errors.username}</p>}
                    </div>

                    <div>
                        <input
                            id="fullname"
                            name="fullname"
                            type="text"
                            placeholder="Họ và tên"
                            value={formData.fullname}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-4 py-3 border ${errors.fullname ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono`}
                        />
                        {errors.fullname && <p className="text-red-500 text-xs mt-1 font-mono">{errors.fullname}</p>}
                    </div>

                    <div>
                        <input
                            id="birthDate"
                            name="birthDate"
                            type="text"
                            placeholder="Ngày sinh (mm/dd/yyyy)"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-4 py-3 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono`}
                        />
                        {errors.birthDate && <p className="text-red-500 text-xs mt-1 font-mono">{errors.birthDate}</p>}
                    </div>

                    <div>
                        <div className="flex items-center space-x-6 font-mono">
                            <label className="flex items-center">
                                <input
                                    id="gender-female"
                                    name="gender"
                                    type="radio"
                                    checked={formData.gender === "female"}
                                    onChange={() => handleGenderChange("female")}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-gray-900">Nữ</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    id="gender-male"
                                    name="gender"
                                    type="radio"
                                    checked={formData.gender === "male"}
                                    onChange={() => handleGenderChange("male")}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-gray-900">Nam</span>
                            </label>
                        </div>
                        {errors.gender && <p className="text-red-500 text-xs mt-1 font-mono">{errors.gender}</p>}
                    </div>

                    <div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-mono">{errors.email}</p>}
                    </div>

                    <div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono`}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOffIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                        {errors.password && <p className="text-red-500 text-xs mt-1 font-mono">{errors.password}</p>}
                    </div>

                    <div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} text-gray-900 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono`}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-mono">{errors.confirmPassword}</p>}
                    </div>

                    <div className="text-gray-500 text-sm font-mono">
                        This site is protected by reCAPTCHA and the Google <a href="#" className="text-blue-600">Privacy Policy</a> and <a href="#" className="text-blue-600">Terms of Service</a> apply.
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-6 ${isLoading ? 'bg-gray-300' : 'bg-gray-400 hover:bg-gray-500'} text-white font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
                    >
                        {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
                    </button>

                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center mt-4 text-gray-600 hover:text-gray-900 font-mono"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Quay lại trang chủ
                    </button>
                </form>
            </div>
        </div>
    );
}