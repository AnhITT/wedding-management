import axiosClient from "./axiosClient";

const END_POINT = {
    SERVICE: "api/service",
};

export const serviceApi = {
    getAll: () => {
        return axiosClient.get(END_POINT.SERVICE);
    },

    getById: (id) => {
        return axiosClient.get(`${END_POINT.SERVICE}/${id}`);
    },

    create: (data) => {
        return axiosClient.post(END_POINT.SERVICE, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.SERVICE}/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.SERVICE}/${id}`);
    },

    getCategories: () => {
        return axiosClient.get(`${END_POINT.SERVICE}/getCateService`);
    },

    getByCategory: (categoryId) => {
        return axiosClient.get(`${END_POINT.SERVICE}/byCategoryService/${categoryId}`);
    }
}; 