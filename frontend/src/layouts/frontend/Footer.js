import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white py-8 border-t border-gray-200 mt-20">
            <div className="container mx-auto px-16">
                {/* Main Footer Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">

                    {/* Liên kết Section */}
                    <div>
                        <h1 className="text-2xl font-mono mb-8">Liên kết</h1>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Tìm kiếm</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Giới thiệu</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Chính sách thanh toán</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Chính sách khiếu nại</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Chính sách vận chuyển</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Chính sách đổi trả</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Chính sách bảo hành</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Chính sách kiểm hàng</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900 font-mono">Chính sách bảo mật</a></li>
                        </ul>
                    </div>

                    {/* Thông tin liên hệ Section */}
                    <div>
                        <h2 className="text-2xl font-mono mb-8">Thông tin liên hệ</h2>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="inline-block mt-1 mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </span>
                                <span className="text-gray-600 font-mono">22 Nguyễn Thái Học - Phường Tân Thành - Quận Tân Phú - TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center">
                                <span className="inline-block mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </span>
                                <span className="text-gray-600 font-mono">086 2642568</span>
                            </li>
                            <li className="flex items-center">
                                <span className="inline-block mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <span className="text-gray-600 font-mono">Coming soon</span>
                            </li>
                            <li className="flex items-center">
                                <span className="inline-block mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <span className="text-gray-600 font-mono">outerity.local@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Fanpage Section */}
                    <div>
                        <h2 className="text-2xl font-mono mb-8">Fanpage</h2>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center border-t border-gray-200 pt-4 text-sm text-gray-600 font-mono">
                    <p>Copyright © 2025 Outerity. Powered by Haravan</p>
                </div>
            </div>
        </footer>
    );
}