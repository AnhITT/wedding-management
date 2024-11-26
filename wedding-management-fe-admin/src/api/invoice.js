import axiosClient from "./axiosClient";

const END_POINT = {
    INVOICE: "api/invoice",
};

export const invoiceApi = {
    getAll: () => {
        return axiosClient.get(END_POINT.INVOICE);
    },

    getById: (id) => {
        return axiosClient.get(`${END_POINT.INVOICE}/${id}`);
    },

    getByUserId: (userId) => {
        return axiosClient.get(`${END_POINT.INVOICE}/get-invoice/${userId}`);
    },

    create: (data) => {
        return axiosClient.post(END_POINT.INVOICE, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.INVOICE}/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.INVOICE}/${id}`);
    },

    cancelOrder: (id) => {
        return axiosClient.post(`${END_POINT.INVOICE}/cancel/${id}`);
    },

    repaymentComplete: (id) => {
        return axiosClient.post(`${END_POINT.INVOICE}/repayment-compelete/${id}`);
    },

    repaymentCompleteWallet: (id) => {
        return axiosClient.post(`${END_POINT.INVOICE}/repayment-compelete-wallet/${id}`);
    }
}; 