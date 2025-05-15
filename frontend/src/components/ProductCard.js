import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, image, name, price, discountPrice }) => {
  const calculateDiscountPercentage = () => {
    if (!discountPrice || !price) return null;
    const discount = Math.round(((price - discountPrice) / price) * 100);
    return `-${discount}%`;
  };

  const discountPercentage = calculateDiscountPercentage();

  const formatPrice = (amount) => {
    if (!amount) return '';
    // Format price with comma as thousands separator and remove the last character if it's not a digit
    let formatted = amount.toString().replace(/\D/g, '');
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formatted;
  };

  return (
    <div className="product-card w-full max-w-[300px] mx-auto font-mono">
      <Link to={`/chi-tiet-san-pham/${id}`} className="block">
        {/* Image & badge */}
        <div className="relative mb-2">
          {/* Discount Badge */}
          {discountPercentage && (
            <div className="absolute top-2 left-2 bg-white border border-gray-200 text-[#EB1C24] text-[13px] font-mono px-2 py-[2px] z-10 rounded-sm">
              {discountPercentage}
            </div>
          )}

          {/* Product Image */}
          <img
            src={image || '/placeholder-product.jpg'}
            alt={name}
            className="w-full h-[300px] object-cover rounded-sm"
          />

        </div>

        {/* Product Info */}
        <div className="px-0">
          <h3 className="text-[15px] text-[#2B2B2B] font-mono line-clamp-2 leading-tight mb-1 h-[40px] overflow-hidden">
            {name}
          </h3>
          <div className="flex items-baseline gap-2 font-mono">
            {discountPrice ? (
              <>
                <span className="text-[#EB1C24] font-mono text-[16px]">{formatPrice(discountPrice)}₫</span>
                <span className="text-[#B0B0B0] text-[14px] line-through">{formatPrice(price)}₫</span>
              </>
            ) : (
              <span className="text-[16px] font-mono">{formatPrice(price)}₫</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;