import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex justify-end items-center">
                <span className="text-gray-600 text-sm flex items-center font-mono">
                    © {currentYear} Admin Dashboard by Nguyễn Phước Dương
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600 text-sm flex items-center">
                    <Heart size={14} className="text-red-500 mr-1 font-mono" />
                    <span>v1.0.0</span>
                </span>
            </div>
        </footer>
    );
};

export default Footer;
