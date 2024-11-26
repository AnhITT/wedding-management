import axiosClient from "./axiosClient";

const END_POINT = {
    FEEDBACK: "api/feedback",
};

export const feedbackApi = {
    getByBranch: (branchId) => {
        return axiosClient.get(`${END_POINT.FEEDBACK}/${branchId}`);
    },

    create: (data) => {
        return axiosClient.post(END_POINT.FEEDBACK, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.FEEDBACK}/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.FEEDBACK}/${id}`);
    }
}; 