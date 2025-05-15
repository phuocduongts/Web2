import React, { useState, useEffect } from "react";
import BannerService from "../services/BannerService";

const Banner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            // Using the BannerService to get banners
            const response = await BannerService.index();
            const bannersData = Array.isArray(response)
                ? response
                : response.data || [];
            
            // Filter active banners
            const activeBanners = bannersData
                .filter(banner => banner.status === true || banner.status === 1);
            
            setSlides(activeBanners);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách banner. Vui lòng thử lại sau.');
            console.error('Error fetching banners:', err);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Handle image loading with authentication
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-image.jpg';
        return `http://localhost:8080/uploads/banners/${imagePath}`;
    };

    useEffect(() => {
        const timer = slides.length > 0 ? setInterval(nextSlide, 5000) : null; // Automatically switch slide every 5 seconds
        return () => {
            if (timer) clearInterval(timer); // Clear timer when component unmounts
        };
    }, [slides.length]);

    if (loading) {
        return (
            <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Đang tải banner...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[300px] bg-red-100 flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (slides.length === 0) {
        return (
            <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    Không có banner nào để hiển thị.
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[500px] overflow-hidden">
            {/* Slide Container */}
            <div
                className="flex h-full transition-transform duration-[700ms] ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide, index) => (
                    <img
                        key={index}
                        src={getImageUrl(slide.image)}
                        alt={slide.name || `Banner ${index + 1}`}
                        className="w-full h-full object-cover flex-shrink-0"
                    />
                ))}
            </div>

            {/* Left Arrow */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-gray-800 hover:text-gray-600 transition duration-300 ease-in-out"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                </svg>
            </button>

            {/* Right Arrow */}
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-gray-800 hover:text-gray-600 transition duration-300 ease-in-out"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                </svg>
            </button>

            {/* Slide Counter */}
            <div className="absolute bottom-6 right-6 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                {currentSlide + 1}/{slides.length}
            </div>
        </div>
    );
};

export default Banner;