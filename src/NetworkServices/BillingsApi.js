
import { setLoading } from "../store/reducers/loadingSlice/loadingSlice";
import store from "../store/store";
import { apiUrlsNew } from "./newApiEndpoints";
import { apiUrls } from "../utils/apiEndpoints";
import makeApiRequest from "../utils/axiosInstance";

export const AdmissionType = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.AdmissionType}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const IPDNoByCeilingDetails = async (IPDNo) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.IPDNoByCeilingDetails}?IPDNo=${IPDNo}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getBloodVolumeOfRequisitionApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.getBloodVolumeOfRequisition}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getTriagingCodesApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.getTriagingCodes}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getProductOfRequisitionApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.getProductOfRequisition}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getBloodNatureOfRequisitionApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.getBloodNatureOfRequisition}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getWaitingTypeApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.getWaitingType}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getBloodRequisitionIndentReportApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.getBloodRequisitionIndentReport}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const updateEmergencyBillItemsApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.updateEmergencyBillItems}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const generateOrCloseBillOfEmergencyApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.generateOrCloseBillOfEmergency}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveWaitingTypeApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveWaitingType}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const saveRequestRoomDetailApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.saveRequestRoomDetail}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const IPDNoByApprovalDays = async (IPDNo) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.IPDNoByApprovalDays}?IPDNo=${IPDNo}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const saveTriagingApi = async (Triaging, TID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.saveTriaging}?Triaging=${Triaging}&TID=${TID}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getBloodRequisitionApi = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.getBloodRequisition}?TransactionID=${TransactionID}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

// export const RoomType = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.RoomType}`;
//     const data = await makeApiRequest(url, {
//       method: "GET",
//     });
//     store.dispatch(setLoading(false));
//     return data;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     throw error;
//   }
// };
export const RoomType = async () => {
  store.dispatch(setLoading(true));

  try {
    const url = `${apiUrls.RoomType}`;
    const data = await makeApiRequest(url, { method: "GET" });
    return data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const bindPanelRoleWisePanelGroupWise = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.bindPanelRoleWisePanelGroupWise}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getMedicResidanceCenterWiseApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getMedicResidanceCenterWise}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
// export const BillingCategory = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.BillingCategory}`;
//     const data = await makeApiRequest(url, {
//       method: "GET",
//     });
//     store.dispatch(setLoading(false));
//     return data;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     throw error;
//   }
// };
export const BillingCategory = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BillingCategory}`;
    const data = await makeApiRequest(url, { method: "GET" });
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const BindFloor = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindFloor}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
// export const BindRoomBed = async (params) => {
//   store.dispatch(setLoading(true));
//   try {
//     const options = {
//       method: "POST",
//       data: params,
//     };
//     const data = await makeApiRequest(`${apiUrls.BindRoomBed}`, options);
//     store.dispatch(setLoading(false));
//     return data;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.error("Error Found", error);
//   }
// };
export const BindRoomBed = async (params) => {
  store.dispatch(setLoading(true));

  try {
    const options = { method: "POST", data: params };
    const data = await makeApiRequest(`${apiUrls.BindRoomBed}`, options);
    return data;
  } catch (error) {
    console.error("Error Found", error);
    return { success: false, message: "Something went wrong" };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const releaseEmergencyPatientApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.releaseEmergencyPatient}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const updatePatientBloodRequisitionStatusApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.updatePatientBloodRequisitionStatus}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const savePrimaryDoctorApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.savePrimaryDoctor}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const saveMedicResidenceDoctorApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.saveMedicResidenceDoctor}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const patientBloodRequisitionApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.patientBloodRequisition}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const markUnderMaintainanceSave = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.saveRoomMaintenance}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveCeilingAmount = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveCeilingAmount}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveApprovalDays = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveApprovalDays}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const PatientSearch = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.PatientSearch}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const SaveIPDAdmission = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.SaveIPDAdmission}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};
export const GetPatientAdmissionDetails = async (patientID, transactionID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.GetPatientAdmissionDetails}?patientID=${patientID}&transactionID=${transactionID}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const searchUnderMaintenanceApi = async (IPDCaseTypeID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.searchUnderMaintenance}?IPDCaseTypeID=${IPDCaseTypeID}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const searchRoomMaintenance = async (MaintenanceID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.searchRoomMaintenance}?MaintenanceID=${MaintenanceID}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const bindMaintenanceApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.bindMaintenance}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const IPDAdmissionReport = async (TID, ReportType) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.IPDAdmissionReport}?TID=${TID}&ReportType=${ReportType}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const UpdatePatientAdmissionDetails = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.UpdatePatientAdmissionDetails}`,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};
export const saveRoomCleaningMaintenanceApi = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.saveRoomCleaningMaintenance}`,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};
export const requestRoomDetailApi = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.requestRoomDetail}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const IsReceivedPatient = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.IsReceivedPatient}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const CurrentStockGeneralConsertForm = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.CurrentStockGeneralConsertForm}`,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const CurrentStockDischargeSlip = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.CurrentStockDischargeSlip}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const CurrentStockSelfDeclaration = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.CurrentStockSelfDeclaration}`,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const GetBillDetails = async (transID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.GetBillDetails}?transID=${transID}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const GetBindDepartment = async (transID, viewRate) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.GetBindDepartment}?transID=${transID}&viewRate=${viewRate}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const LoadDetails = async (TID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.LoadDetails}?TID=${TID}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const CheckDetails = async (TID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.CheckDetails}?TID=${TID}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const SaveClearance = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.SaveClearance}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const BindCurrencyDetails = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindCurrencyDetails}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetAllAuthorization = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetAllAuthorization}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const getBindItem = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.BindItem, {
      method: "post",
      data: payload,
    });

    return data;
  } catch (error) {
    console.log(error, "error");
  }
};

export const GetAuthorization = async (Type) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetAuthorization}?Type=${Type}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const LoadMedetail = async (TID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.LoadMedetail}?TID=${TID}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BindIPDPatientDetails = async (SearchKey) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.BindIPDPatientDetails}?SearchKey=${SearchKey}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getCTBRequestDetail = async (transactionID, RequestType) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.getCTBRequestDetail}?transactionID=${transactionID}&RequestType=${RequestType}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const SelectIPDDetail = async (PatientID, TID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.SelectIPDDetail}?PatientID=${PatientID}&TID=${TID}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetDiscReason = async (Type) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.GetDiscReason}?Type=${Type}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const SaveDiscReason = async (DiscReason, Type) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.SaveDiscReason}?DiscReason=${DiscReason}&Type=${Type}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const SaveIPDAdvance = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.SaveIPDAdvance}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};
export const CommonReceiptPdf = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.CommonReceiptPdf}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};
export const StickersReceiptPdf = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.GetStickersReceipt}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const CardPrintPrintCard = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.PrintCard}?pid=${payload?.pid}&LedgerTransactionNo=${payload?.LedgerTransactionNo}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const getIncludeBillApi = async (BillNo) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.getIncludeBill}?BillNo=${BillNo}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getBloodGroupApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.getBloodGroups}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const PostIncludeBillApi = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.getIncludeBill}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const SaveLabPackageDetailsApi = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.saveOPDSaveLabPackageDetails}`,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const SendPanelApprovalEmail = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.SendPanelApprovalEmail}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetPanelApprovalDetails = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.GetPanelApprovalDetails}?TransactionID=${params?.TID}&PatientId=${params?.PID}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindPanelDetail = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindPanelDetail}?TransactionID=${params}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindPanels = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindPanels}?TransactionID=${params}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindCategory = async (Type) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.BindCategory}?Type=${Type}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
  }
};

export const IPDAdvanceBindPatientDetails = async (PatientID, TranactionID) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls.IPDAdvanceBindPatientDetails}?PatientID=${PatientID}&TranactionID=${TranactionID}`,
      {
        method: "get",
      },
    );
    return response;
  } catch (error) {
    console.log(error, "SomeThing Went Wrong");
  }
};

export const BillingShowItemDetails = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls.BillingShowItemDetails, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};

export const BindItemSurgery = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.BindItemSurgery}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const Rate = async (TID, SurgeryID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.Rate}?TID=${TID}&SurgeryID=${SurgeryID}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const PatientBillingGetDiscount = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.PatientBillingGetDiscount}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "error");
  }
};

export const BillingGetRateFromFollowedPanel = async (
  ItemID,
  PanelID,
  IPDCaseTypeID,
  IsInternational,
) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.BillingGetRateFromFollowedPanel}?ItemID=${ItemID}&PanelID=${PanelID}&IPDCaseTypeID=${IPDCaseTypeID}&IsInternational=${IsInternational}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.log(error, "error");
  }
};

export const SaveSurgery = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.SaveSurgery}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const BillingSaveSaveServicesBilling = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.BillingSaveSaveServicesBilling, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindApprovalData = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.BindApprovalData}?TransactionID=${TransactionID} `,
      {
        method: "get",
      },
    );

    return data;
  } catch (error) {
    console.log(error, "error");
  }
};

export const DischargeLoadDetails = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.LoadDetailsTracker}`, {
      method: "get",
    });

    return data;
  } catch (error) {
    console.log(error, "error");
  }
};

export const DischargeExport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.DischargeTrackerReport}?FromDate=${payload?.FromDate}&ToDate=${payload?.ToDate}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.log(error, "error");
  }
};

export const BindStoreDepartment = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindStoreDepartment}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ToolBindDepartment = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.ToolBindDepartment}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const PanelApprovalReject = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.PanelApprovalReject, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BindSubcategory = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindSubcategory}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BindRoute = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindRoute}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetTimeDuration = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetTimeDuration}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getAlreadyPrescribeItem = async (PatientID, ItemID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getAlreadyPrescribeItem}?PatientID=${PatientID}&ItemID=${ItemID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const LoadIndentMedicine = async (TID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.LoadIndentMedicine}?TID=${TID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const LoadMedicineSet = async (DoctorID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.LoadMedicineSet}?DoctorID=${DoctorID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const LoadMedSetItems = async (SetID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.LoadMedSetItems}?SetID=${SetID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const LoadIndentItems = async (IndentNo) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.LoadIndentItems}?IndentNo=${IndentNo}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetMedicineStock = async (MedicineID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetMedicineStock}?MedicineID=${MedicineID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BindDocType = async (RateType, SurgeryID, panelID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindDocType}?RateType=${RateType}&SurgeryID=${SurgeryID}&PanelID=${panelID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BindRequisitionType = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindRequisitionType}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BindItem = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.PatientBillingBindItem, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const SaveIndent = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.SaveIndent, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const UpdateBilling = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.UpdateBilling, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const PatientBillingReject = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.PatientBillingReject, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const PatientBillingSaveEdit = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.PatientBillingSaveEdit, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const PatientBillingAllTabSave = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.PatientBillingAllTabSave, {
      method: "post",
      data: payload,
    });

    return response;
    store.dispatch(setLoading(false));
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const getApproveBy = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getApproveBy}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const PatientBillingGetPackage = async (TransID) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.PatientBillingGetPackage}?TransID=${TransID}`,
      {
        method: "get",
      },
    );

    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.log(error, "Something Went Wrong");
  }
};

export const PatientBillingItemPackageSave = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.PatientBillingItemPackageSave,
      {
        method: "post",
        data: payload,
      },
    );

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const BillingIPDPackageReject = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.BillingIPDPackageReject, {
      method: "post",
      data: payload,
    });

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const PatientBillingPayable = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.PatientBillingPayable, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const MISBedManagementSummary = async () => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.MISBedManagementSummary}`,
      {
        method: "get",
      },
    );

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};

export const MISBindBedStatus = async (Type) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.MISBindBedStatus}?Type=${Type}`,
      {
        method: "get",
      },
    );

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};
export const SaveRequisition = async (payload) => {
  debugger;
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.SaveRequisition, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const DoctorAndRoomShift = async (payload) => {
  store.dispatch(setLoading(true));

  try {
    const response = await makeApiRequest(apiUrls?.DoctorAndRoomShift, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const SaveInvestigationRequisition = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.SaveInvestigationRequisition,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindDocDetails = async (TransactionID) => {
  store.dispatch(setLoading(true));

  try {
    const response = await makeApiRequest(
      `${apiUrls?.BindDocDetails}?TransactionID=${TransactionID}`,
      { method: "get" },
    );
    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
    return {
      success: false,
      message: "Something went wrong",
    };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const IPDAdvanceGetCTBList = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.IPDAdvanceGetCTBList}?TranactionID=${TransactionID}`,
      {
        method: "get",
      },
    );

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};
export const IPDAdvanceGetCTBDetails = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.IPDAdvanceGetCTBDetails}?LedgerTransactionNo=${TransactionID}`,
      {
        method: "get",
      },
    );

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};
export const BillingIPDGetCTBDetails = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.BillingIPDGetCTBDetails}?LedgerTransactionNo=${TransactionID}`,
      {
        method: "get",
      },
    );

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};
export const BillingCTBDetail = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(`${apiUrls?.BillingCTBDetail}`, {
      method: "post",
      data: payload,
    });

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};
export const BillingIPDSaveBillSheetTiming = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.BillingIPDSaveBillSheetTiming}`,
      {
        method: "post",
        data: payload,
      },
    );

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};
export const SearchBillSheetTiming = async (id) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.SearchBillSheetTiming}?TransactionID=${id}`,
      {
        method: "get",
        // data: payload,
      },
    );

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};
export const BillingIPDSaveCTBDetail = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.BillingIPDSaveCTBDetail}`,
      {
        method: "post",
        data: payload,
      },
    );

    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};
export const IPDAdvanceGetCTBDetailsReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.IPDAdvanceGetCTBDetailsReport,
      {
        method: "post",
        data: payload,
      },
    );
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
// export const BindRoomDetails = async (TransactionID) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(
//       `${apiUrls?.BindRoomDetails}?TransactionID=${TransactionID}`,
//       {
//         method: "get",
//       }
//     );

//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error, "Something Went Wrong");
//   }
// };
export const BindRoomDetails = async (TransactionID) => {
  store.dispatch(setLoading(true));

  try {
    const response = await makeApiRequest(
      `${apiUrls?.BindRoomDetails}?TransactionID=${TransactionID}`,
      { method: "get" },
    );
    return response;
  } catch (error) {
    console.log(error, "Something Went Wrong");
    return { success: false, message: "Something went wrong" };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const LoadDiffPanelRates = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.LoadDiffPanelRates, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const SaveTariffic = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.SaveTariffic, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const PatientBillingEditPackage = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.PatientBillingEditPackage, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const SaveReturnReuisition = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.SaveReturnReuisition, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    // store.dispatch(setLoading(false));
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindOtIndent = async (id) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindOtIndent}?IsOtType=${id}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const MedBindDetails = async (FromRoleID, TID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindPatientReturnDetails}?FromRoleID=${FromRoleID}&TID=${TID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BindBloodGroup = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindBloodGroup}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const LoadItems = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.LoadItems}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BillingRemarkLoadRemarks = async (TID) => {
  debugger;
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls?.BillingRemarkLoadRemarks}?TID=${TID}`,
      {
        method: "get",
      },
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.log(error, "SomeThing Went Wrong");
  }
};

export const BillingRemarkSaveRemark = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls?.BillingRemarkSaveRemark}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

/* export const UpdateBloodgroup = async (BloodGroup, PatientID) => {
    store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.UpdateBloodgroup}?BloodGroup=${BloodGroup}&PatientID=${PatientID}`;
    const data = await makeApiRequest(url, {
      method: "post",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
   store.dispatch(setLoading(false));
    throw error;
  }
}; */

export const UpdateBloodgroup = async (payloadData) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls?.UpdateBloodgroup}`, {
      method: "post",
      data: payloadData,
    });

    return data;
  } catch (error) {
    console.log(error, "Something Went Wrong");
  }
};

export const SaveBloodBank = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.SaveBloodBank, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindRequestDetails = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindRequestDetails}?TransactionID=${TransactionID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const IPDAdvanceLoadSurgeryDetail = async (LedgerTnxNo) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.IPDAdvanceLoadSurgeryDetail}?LedgerTnxNo=${LedgerTnxNo}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const IPDAdvanceLoadSurgery = async (LedTnxID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.IPDAdvanceLoadSurgery}?LedTnxID=${LedTnxID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetPatientAdjustmentDetails = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetPatientAdjustmentDetails}?TransactionID=${TransactionID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetPatientReceipt = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetPatientReceipt}?TransactionID=${TransactionID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetApproval = async (TID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetApproval}?TID=${TID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const UpdateApproval = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.UpdateApproval, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindHospLedgerAccount = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindHospLedgerAccount}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const RevenueAnalysisDetail = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.RevenueAnalysisDetail, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const PatientAdmittedList = async (ReportType, EntityID, CentreID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.PatientAdmittedList}?ReportType=${ReportType}&EntityID=${EntityID}&CentreID=${CentreID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const DischargeIntimation = async (CentreID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.DischargeIntimation}?CentreID=${CentreID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BillFreezedButNotDischarged = async (CentreID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BillFreezedButNotDischarged}?CentreID=${CentreID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const PatientDischarged = async (fromDate, ToDate, CentreID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.PatientDischarged}?fromDate=${fromDate}&ToDate=${ToDate}&CentreID=${CentreID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const DischargedButBillNotGenerated = async (
  fromDate,
  ToDate,
  CentreID,
) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.DischargedButBillNotGenerated}?fromDate=${fromDate}&ToDate=${ToDate}&CentreID=${CentreID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BillGenerated = async (
  fromDate,
  ToDate,
  ReportCheck,
  CentreID,
) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BillGenerated}?fromDate=${fromDate}&ToDate=${ToDate}&ReportCheck=${ReportCheck}&CentreID=${CentreID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const IPDBillRegisterSummary = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.IPDBillRegisterSummary, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const getStoreBindDepartment = async (storetype) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getStoreBindDepartment}?storetype=${storetype}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetCategoryByStoreType = async (storeID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetCategoryByStoreType}?storeID=${storeID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetSubCategoryByCategory = async (categoryID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetSubCategoryByCategory}?categoryID=${categoryID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetSubCategoryByCategoryRequistion = async (categoryID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetSubCategoryByCategoryRequistion}?categoryID=${categoryID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetStore = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetStore}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BindSubGroup = async (storetype) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindSubGroup}?StorLedgerNo=${storetype}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetDepartment = async (storetype) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindDepartment}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BindStoreRequisitionDepartment = async (storetype) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindStoreRequisitionDepartment}?storetype=${storetype}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const GetItems = async (StoreID, Itemtype, DeptLedgerNo, Type) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetItems}?StoreID=${StoreID}&Itemtype=${Itemtype}&RoleIDTo=${DeptLedgerNo}&Type=${Type}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const GetItemStockDetailsRequisition = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.GetItemStockDetailsRequisition,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const getCreateRequisition = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.getCreateRequisition, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const IPDPrintSticker = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.IPDPrintSticker, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const PrintIndent = async (IndentNo) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.PrintIndent}?IndentNo=${IndentNo}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ItemAnalysisDetail = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.ItemAnalysisDetail, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const ReportMenu = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.ReportMenu}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ReportSubMenu = async (ID, Type) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.ReportSubMenu}?ID=${ID}&Type=${Type}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BindSupplier = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindSupplier}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const StockStatusReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.StockStatusReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const StockLedgerReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.StockLedgerReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const CurrentStockReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.CurrentStockReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const IssueDetailReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.IssueDetailReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const StockBinCardReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.StockBinCardReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const ABCAnalysis = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.ABCAnalysis, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const LowStockDetail = async (StoreLedgerNo, ReportType) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.LowStockDetail}?StoreLedgerNo=${StoreLedgerNo}&ReportType=${1}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const ItemExpiryReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.ItemExpiryReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const ItemMovementReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.ItemMovementReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const AdjustmentDetailReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.AdjustmentDetailReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const ConsumptionReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.ConsumptionReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const PurchaseSummaryReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.PurchaseSummaryReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindGroupIndentStatusReport = async (StoreNo) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindGroupIndentStatusReport}?StoreNo=${StoreNo}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ItemBindIndentStatusReport = async (SubCategoryID, StoreNo) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.ItemBindIndentStatusReport}?SubCategoryID=${SubCategoryID}&StoreNo=${StoreNo}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const GRNDetailReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.GRNDetailReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const SupplierReturnReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.SupplierReturnReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const IndentStatusReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.IndentStatusReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const getGSTReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.getGSTReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const DirectDepartmentReport = async (payload) => {
  const { UserValidateID, CentreIDTo, SalesNo } = payload;
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.DirectDepartmentIssue}?CentreIDTo=${CentreIDTo}&SalesNo=${SalesNo}`,
      {
        method: "GET",
      },
    );
    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const GetAutoPurchaseRequestItemsApi = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.GetAutoPurchaseRequestItemsApi,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindDepartments = async (transactionID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindDepartments}?transactionID=${transactionID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BillingIPDBindTPA = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = apiUrls.BillingIPDBindTPA;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const IPDAdmissionMultipleReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    store.dispatch(setLoading(true));
    const response = await makeApiRequest(apiUrls?.IPDAdmissionMultipleReport, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const BasicMasterSavePro = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.EDPBasicMasterSavePro, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BillingIPDSaveReferDoctor = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.BillingIPDSaveReferDoctor, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BasicMasterBindPro = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.EDPBasicMasterBindPro}?Status=1`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const PatientBillingGetPackageDetail = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.PatientBillingGetPackageDetail,
      {
        method: "post",
        data: payload,
      },
    );
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const BillingGetIPDPackageAudit = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.BillingGetIPDPackageAudit, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const OPDAddOrRemoveIPDPackage = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.OPDAddOrRemoveIPDPackage, {
      method: "post",
      data: payload,
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

// priyam

export const GetItemsSubCategorys = async (
  CategoryID,
  SubCategoryID,
  Itemtype,
) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetItemsSubCategory}?CategoryID=${CategoryID}&SubCategoryID=${SubCategoryID}&Itemtype=${Itemtype}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetDepartmetItemsToReturns = async (
  CategoryID,
  SubcategoryID,
  ToCentreID,
  ToRoleID,
) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetDepartmetItemsToReturn}?CategoryID=${CategoryID}&SubcategoryID=${SubcategoryID}&ToCentreID=${ToCentreID}&ToRoleID=${ToRoleID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const GetIndentReturnItemStockDetails = async (
  ToCentreID,
  ToRoleID,
  ItemID,
  StoreTypeID,
) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetIndentReturnItemStockDetail}?ToCentreID=${ToCentreID}&ToRoleID=${ToRoleID}&ItemID=${ItemID}&StoreTypeID=${StoreTypeID}`;
    const data = await makeApiRequest(url, {
      method: "post",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

// export const GetIndentReturnItemStockDetails = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.GetIndentReturnItemStockDetail {
//       method: "post",
//       data: payload,
//     });
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

export const bindApprovalLevels = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.bindApprovalLevel}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const QuotationApprovalCategory = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.QuotationApprovalCategorys}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const QuotationAndCompareSaveQuotationMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.QuotationAndCompareSaveQuotationMaster}`;
    const data = await makeApiRequest(url, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const QuotationAndCompareBindQuotationMaster = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.QuotationAndCompareBindQuotationMaster}`;
    const data = await makeApiRequest(url, {
      method: "GET",
      // data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const QuotationAndCompareDeleteQuotationMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.QuotationAndCompareDeleteQuotationMaster}?QID=${payload?.QID}`;
    const data = await makeApiRequest(url, {
      method: "POST",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getMasterPageBookingApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(apiUrls.getMasterPageBooking, {
      method: "GET",
      // data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

// anUJ api

////////Anuj Yadav
/////Reports
export const BindMasterData = async () => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.BindMasterData, {
      method: "get",
      // data: payload,
    });
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindMasterGetReportColumnList = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.BindMasterGetReportColumnList,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const BindMasterBindCategory = async () => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.BindMasterBindCategory, {
      method: "get",
    });
    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const BindMasterBindSubCategory = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.BindMasterBindSubCategory}?CategoryID=${payload?.CategoryID}`,
      {
        method: "GET",
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindMasterBindDoc = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.BindMasterBindDoc, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const BindRevenueAnalysisRevenueAnalysisReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.BindRevenueAnalysisRevenueAnalysisReport,
      {
        method: "POST",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    return error;
    console.log(error);
  }
};

export const BindMasterSubReportList = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.BindMasterSubReportList}?ReportID=${payload?.Reports}`,
      {
        method: "GET",
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindMasterBindPanel = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.BindMasterBindPanel}?PanelGroupID=${payload?.PanelGroup}`,
      {
        method: "GET",
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const BindMasterMasterData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.BindMasterMasterData, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindMasterBindGroupBy = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.BindMasterBindGroupBy}?SubReportID=${payload?.SubReport}`,
      {
        method: "GET",
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindMasterBindReportName = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.BindMasterBindReportName}?ReportID=1,2,3`,
      {
        method: "GET",
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const IPDDetailGetPatientAdmissionOrder = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.IPDDetailGetPatientAdmissionOrder}`,
      {
        method: "POST",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const PanelRequestRemovePanelRequest = async (ID) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.PanelRequestRemovePanelRequest}?ID=${ID}`,
      {
        method: "post",
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const PanelAmountAllocationBindPanelsAllocation = async (
  transactionID,
) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.PanelAmountAllocationBindPanelsAllocation}?transactionID=${transactionID}`,
      {
        method: "GET",
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const PanelAmountAllocationGetPatientPanelAmountAllocationDetail =
  async (payload) => {
    store.dispatch(setLoading(true));
    try {
      const response = await makeApiRequest(
        `${apiUrls?.PanelAmountAllocationGetPatientPanelAmountAllocationDetail}?transactionID=${payload?.transactionID}&PanelAllType=${""}`,
        {
          method: "GET",
        },
      );
      store.dispatch(setLoading(false));

      return response;
    } catch (error) {
      store.dispatch(setLoading(false));
      console.log(error);
    }
  };
export const PanelAmountAllocationSavePanelAmountAllocationDetails = async (
  payload,
) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.PanelAmountAllocationSavePanelAmountAllocationDetails,
      {
        method: "POST",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const AdmitdischargeAdmitDischargeCancelScreenPatient = async (
  transactionID,
) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      `${apiUrls?.AdmitdischargeAdmitDischargeCancelScreenPatient}?transactionID=${transactionID}`,
      {
        method: "get",
        // data: payload,
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const AdmitdischargeBilling_GetPatientForAdmitDiscCancel = async (
  payload,
) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.AdmitdischargeBilling_GetPatientForAdmitDiscCancel,
      {
        method: "post",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};
export const AdmitdischargeBilling_ForAdmitDiscCancel = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(
      apiUrls?.AdmitdischargeBilling_ForAdmitDiscCancel,
      {
        method: "POST",
        data: payload,
      },
    );
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const GetBindIPDVisit = async (
  transactionId,
  doctorId,
  roomTypeId,
  panelId,
) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.GetIPDVisit}?transactionId=${transactionId}&doctorId=${doctorId}&roomTypeId=${roomTypeId}&panelId=${panelId}`,
      {
        method: "get",
      },
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const handleSaveIPDVisit = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrlsNew.SaveIPDVisit}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const btnCentralLineapi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrlsNew.btnCentralLine}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const PatientBillingSaveModalData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const response = await makeApiRequest(apiUrls?.PatientBillingUpdateModal, {
      method: "POST",
      data: payload,
    });
    store.dispatch(setLoading(false));

    return response;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error);
  }
};

export const BindItemsInPanelData = async (transactionId) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.BindItemsInPanel}?transactionId=${transactionId}`,
      {
        method: "get",
      },
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BindEmployeeInPanelData = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.BindEmployeeInPanel}`, {
      method: "get",
    });

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BindTableSearchData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.BindSearchItems}`, {
      method: "post",
      data: payload,
    });

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetIVFPackages = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.BindIVFPackages}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const GetIVFRoomType = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.IVFRoomType}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const GetBindRoomBedIVF = async (params) => {
  store.dispatch(setLoading(true));

  try {
    const options = { method: "POST", data: params };
    const data = await makeApiRequest(`${apiUrls.BindRoomBedIVF}`, options);
    return data;
  } catch (error) {
    console.error("Error Found", error);
    return { success: false, message: "Something went wrong" };
  } finally {
    store.dispatch(setLoading(false));
  }
};
export const handleSaveIVFAdmission = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.SaveIVFAdmission}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};
export const handleIVFPatientSearch = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.IVFPatientSearch}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const handleSaveIVFCurrentStatus = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.SaveIVFCurrentStatus}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};
export const CommonAllSelectedReceipthtml = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.CommonReceipthtml}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};
export const handleValidateUserToBill = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(`${apiUrls.ValidateUserToBill}`, {
      method: "post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.log(error, "error");
    store.dispatch(setLoading(false));
  }
};

export const GetAdmitDischargeAuthorizationStatus = async () => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.GetAdmitDischargeAuthorizationStatus}`,
      {
        method: "get",
      },
    );
    store.dispatch(setLoading(false));
    return data;
  } catch {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const SaveIndentInvestigatinMedcine = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = { method: "POST", data: params };
    const data = await makeApiRequest(
      `${apiUrls.SaveIndentInvestigatinMedcine}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
    throw error;
  }
};

export const GetIndentListByEntryID = async (EntryIDs, IndentType) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrlsNew.GetIndentListByEntryID}?EntryIDs=${EntryIDs}&IndentType=${IndentType}`,
      {
        method: "get",
      },
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetAfterConfirmationCancellationRights = async (AppID) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.ConfirmationCancellationRights}?AppID=${AppID}`,
      {
        method: "get",
      },
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
