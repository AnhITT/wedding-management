import axiosClient from "./axiosClient";

const END_POINT = {
    MENU: "api/menu",
};

export const menuApi = {
    getAll: () => {
        return axiosClient.get(END_POINT.MENU);
    },

    getById: (id) => {
        return axiosClient.get(`${END_POINT.MENU}/${id}`);
    },

    create: (data) => {
        return axiosClient.post(END_POINT.MENU, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.MENU}/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.MENU}/${id}`);
    },

    getCategories: () => {
        return axiosClient.get(`${END_POINT.MENU}/getCate`);
    },

    getByCategory: (categoryId) => {
        return axiosClient.get(`${END_POINT.MENU}/byCategory/${categoryId}`);
    }
}; 