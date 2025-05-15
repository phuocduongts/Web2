import httpAxios from "./httpAxios";

const CheckoutService = {
    checkout: async (userId, data) => {
        return await httpAxios.post(`/api/checkout/${userId}`, data);
    },
};

export default CheckoutService;
