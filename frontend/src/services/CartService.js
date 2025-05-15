import httpAxios from './httpAxios';

const CartService = {
    // Get cart by user ID
    getCartByUser: (userId) => {
        return httpAxios.get(`cart/user/${userId}`);
    },
    
    // Add product to cart
    addToCart: (userId, productId, quantity = 1) => {
        return httpAxios.post(`cart/add`, { userId, productId, quantity });
    },
    
    // Update product quantity in cart
    changeQuantity: (cartId, quantity) => {
        return httpAxios.put(`cart/update/${cartId}?quantity=${quantity}`)
            .then(response => {
                // Dispatch event to update cart count in UI
                window.dispatchEvent(new CustomEvent('cart-updated'));
                return response;
            });
    },
    
    // Remove product from cart
    delete: (cartId) => {
        return httpAxios.delete(`cart/delete/${cartId}`)
            .then(response => {
                // Dispatch event to update cart count in UI
                window.dispatchEvent(new CustomEvent('cart-updated'));
                return response;
            });
    },
    
    // Clear all products from user's cart
    clear: () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user ? user.id : null;
        if (!userId) return Promise.reject('User not authenticated');
        
        return httpAxios.delete(`cart/clear/${userId}`)
            .then(response => {
                // Dispatch event to update cart count in UI
                window.dispatchEvent(new CustomEvent('cart-updated'));
                return response;
            });
    },
    
    // Check if product exists in cart
    checkProductInCart: (userId, productId) => {
        return httpAxios.get(`cart/check-product`, {
            params: { userId, productId }
        });
    },
    
    // Get the count of items in the cart
    getCartItemCount: (userId) => {
        if (!userId) return Promise.resolve({ data: 0 });
        
        return httpAxios.get(`cart/count/${userId}`)
            .then(response => {
                // Handle different response formats
                if (response && response.data !== undefined) {
                    // If response.data is an object with count property
                    if (response.data && typeof response.data === 'object' && response.data.count !== undefined) {
                        return { data: response.data.count };
                    }
                    // If response.data is just a number
                    else if (typeof response.data === 'number') {
                        return { data: response.data };
                    }
                    // If response.data is an array of items
                    else if (Array.isArray(response.data)) {
                        return { data: response.data.length };
                    }
                }
                // Return the original response if none of the above conditions match
                return response;
            })
            .catch(error => {
                console.error('Error fetching cart count:', error);
                return { data: 0 };
            });
    },
    
    // Add this method to update the cart count in the header
    updateCartCountInHeader: () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
            CartService.getCartItemCount(user.id)
                .then(response => {
                    let count = 0;
                    if (response && response.data !== undefined) {
                        count = response.data;
                    }
                    window.dispatchEvent(new CustomEvent('cart-updated'));
                })
                .catch(error => {
                    console.error('Error updating cart count:', error);
                });
        }
    }
};

export default CartService;