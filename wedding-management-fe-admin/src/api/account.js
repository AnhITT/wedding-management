import axiosClient from "./axiosClient";

const END_POINT = {
    ACCOUNT: "api/account",
};

export const accountApi = {
    getAll: () => {
        return axiosClient.get(END_POINT.ACCOUNT);
    },

    getById: (id) => {
        return axiosClient.get(`${END_POINT.ACCOUNT}/${id}`);
    },

    create: (data) => {
        return axiosClient.post(`${END_POINT.ACCOUNT}/create`, data);
    },

    update: (id, data) => {
        return axiosClient.put(`${END_POINT.ACCOUNT}/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`${END_POINT.ACCOUNT}/${id}`);
    },

    changePassword: (data) => {
        return axiosClient.post(`${END_POINT.ACCOUNT}/change-password`, data);
    },

    signIn: (data) => {
        return axiosClient.post(`${END_POINT.ACCOUNT}/SignIn`, data);
    },

    signInAdmin: (data) => {
        return axiosClient.post(`${END_POINT.ACCOUNT}/SignInAdmin`, data);
    },

    signUp: (data) => {
        return axiosClient.post(`${END_POINT.ACCOUNT}/SignUp`, data);
    },

    updateProfile: (data) => {
        return axiosClient.post(`${END_POINT.ACCOUNT}/Update`, data);
    },

    getAvatar: (id) => {
        return axiosClient.get(`${END_POINT.ACCOUNT}/GetAvatar?id=${id}`);
    },

    getUserInfo: (email) => {
        return axiosClient.post(`${END_POINT.ACCOUNT}/GetUserInfo`, email);
    }
};
