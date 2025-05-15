// components/LoginModal.js
import React, { useState } from 'react';

const LoginModal = ({
    showModal,
    onClose,
    onLogin,
    onCreateAccount,
    onForgotPassword
}) => {
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: '',
    });
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (loginError) {
            setLoginError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            // Input validation
            if (!loginForm.username.trim()) {
                setLoginError('Vui lòng nhập tên đăng nhập');
                setIsLoading(false);
                return;
            }
            if (!loginForm.password) {
                setLoginError('Vui lòng nhập mật khẩu');
                setIsLoading(false);
                return;
            }

            await onLogin(loginForm.username, loginForm.password);

            // Reset form
            setLoginForm({ username: '', password: '' });
            onClose();
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(error.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md p-5 md:p-6 shadow-lg" id="login-modal">
                <h2 className="text-2xl font-mono text-center">ĐĂNG NHẬP TÀI KHOẢN</h2>
                <p className="text-center text-gray-600 mb-6 font-mono">Nhập tên đăng nhập và mật khẩu của bạn:</p>

                {loginError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 font-mono" role="alert">
                        <p>{loginError}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Tên đăng nhập"
                        value={loginForm.username}
                        onChange={handleLoginChange}
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 font-mono"
                    />
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mật khẩu"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                    <div className="mb-4 text-sm text-gray-500 mt-6 font-mono">
                        This site is protected by reCAPTCHA and the Google{" "}
                        <a href="#" className="text-blue-500 font-mono">Privacy Policy</a> and{" "}
                        <a href="#" className="text-blue-500 font-mono">Terms of Service</a> apply.
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-6 ${isLoading ? 'bg-gray-300' : 'bg-gray-400 hover:bg-gray-500'} text-white font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
                    >
                        {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>
                <div className="flex justify-between items-center mt-2">
                    <div className="text-sm font-mono">
                        Khách hàng mới?{" "}
                        <button
                            onClick={onCreateAccount}
                            className="text-blue-500 bg-transparent border-none p-0 cursor-pointer font-mono"
                        >
                            Tạo tài khoản
                        </button>
                    </div>
                    <div className="text-sm">
                        <button
                            onClick={onForgotPassword}
                            className="text-blue-500 bg-transparent border-none p-0 cursor-pointer font-mono"
                        >
                            Quên mật khẩu?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;