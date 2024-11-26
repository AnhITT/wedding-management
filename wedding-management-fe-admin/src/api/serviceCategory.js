import axiosClient from "./axiosClient";

const END_POINT = {
    SERVICE_CATEGORY: "api/service",
};

export const serviceCategoryApi = {
    getAll: () => {
        return axiosClient.get(`${END_POINT.SERVICE_CATEGORY}/getCateService`);
    },

    getById: (id) => {
        return axiosClient.get(`${END_POINT.SERVICE_CATEGORY}/category/${id}`);
    },

    create: (data) => {
        return axiosClient.post(`${END_POINT.SERVICE_CATEGORY}/category`, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.SERVICE_CATEGORY}/category/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.SERVICE_CATEGORY}/category/${id}`);
    }
};
