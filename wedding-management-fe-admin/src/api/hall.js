import axiosClient from "./axiosClient";

const END_POINT = {
    HALL: "api/hall",
};

export const hallApi = {
    getAll: () => {
        return axiosClient.get(END_POINT.HALL);
    },

    getById: (id) => {
        return axiosClient.get(`${END_POINT.HALL}/${id}`);
    },

    create: (data) => {
        return axiosClient.post(END_POINT.HALL, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.HALL}/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.HALL}/${id}`);
    },

    getByBranchId: (branchId) => {
        return axiosClient.get(`api/get-hall-by-branchid/${branchId}`);
    },

    getSuggestHall: (branchId, numberOfTables, cost) => {
        return axiosClient.get(`api/getsuggesthall/${branchId}/${numberOfTables}/${cost}`);
    }
}; 