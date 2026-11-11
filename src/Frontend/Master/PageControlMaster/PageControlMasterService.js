//  api for save new cotrollers - 

import { axiosInstance } from "../../../utils/axiosInstance";

export const SavePageControlData = async (payload) => {
  const { data } = await axiosInstance.post(
    "CompanyMaster/SavePageControlData",
    payload
  );
  return data;
};


export const UpdatePageControlData = async (payload) => {
  const { data } = await axiosInstance.post(
    "CompanyMaster/UpdatePageControlData",
    payload
  );
  return data;
};

export const finalUpdatePageControlData = async (payload) => {
  const { data } = await axiosInstance.post(
    "CompanyMaster/SaveMappingPageControlData",
    payload
  );
  return data;
};