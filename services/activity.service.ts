import api from "./api.config";

export const createActivity = async (data: any) => {
  try {
    const res = await api.post("api/personal-activity/create", data);
    return res.data;
  } catch (error: any) {
    return error.response?.data || { success: false, message: "Lỗi kết nối" };
  }
};

export const getActivityByDatePeriod = async (date: string, period: number) => {
  try {
    const res = await api.get("api/personal-activity", {
      params: { date, period },
    });
    return res.data;
  } catch (error: any) {
    return error.response?.data || { success: false, message: "Lỗi kết nối" };
  }
};

export const updateActivity = async (id: string, data: any) => {
  try {
    const res = await api.patch(`api/personal-activity/${id}`, data);
    return res.data;
  } catch (error: any) {
    return error.response?.data || { success: false, message: "Lỗi kết nối" };
  }
};

export const deleteActivity = async (id: string) => {
  try {
    const res = await api.delete(`api/personal-activity/${id}`);
    return res.data;
  } catch (error: any) {
    return error.response?.data || { success: false, message: "Lỗi kết nối" };
  }
};
