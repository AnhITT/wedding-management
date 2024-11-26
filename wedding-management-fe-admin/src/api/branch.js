import axiosClient from "./axiosClient";

const END_POINT = {
    BRANCH: "api/ApiBranch",
};

export const branchApi = {
    getAll: () => {
        return axiosClient.get(END_POINT.BRANCH);
    },

    getById: (id) => {
        return axiosClient.get(`${END_POINT.BRANCH}/${id}`);
    },

    create: (data) => {
        return axiosClient.post(END_POINT.BRANCH, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.BRANCH}/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.BRANCH}/${id}`);
    },
};
