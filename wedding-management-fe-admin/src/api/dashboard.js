import axiosClient from "./axiosClient";

const END_POINT = {
    DASHBOARD: "api/Dashboard",
};

export const dashboardApi = {
    getStatistics: () => {
        return axiosClient.get(`${END_POINT.DASHBOARD}/statistics`);
    },
}; 