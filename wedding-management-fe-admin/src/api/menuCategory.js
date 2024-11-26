import axiosClient from "./axiosClient";

const END_POINT = {
    MENU_CATEGORY: "api/menu",
};

export const menuCategoryApi = {
    getAll: () => {
        return axiosClient.get(`${END_POINT.MENU_CATEGORY}/getCate`);
    },

    getById: (id) => {
        return axiosClient.get(`${END_POINT.MENU_CATEGORY}/category/${id}`);
    },

    create: (data) => {
        return axiosClient.post(`${END_POINT.MENU_CATEGORY}/category`, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.MENU_CATEGORY}/category/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.MENU_CATEGORY}/category/${id}`);
    },

    getByCategory: (categoryId) => {
        return axiosClient.get(`${END_POINT.MENU_CATEGORY}/byCategory/${categoryId}`);
    }
};
