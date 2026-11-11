import { setLoading } from "../store/reducers/loadingSlice/loadingSlice";
import store from "../store/store";
import { apiUrls } from "../utils/apiEndpoints";
// import makeApiRequest from "./axiosInstance";
// import { apiUrlsNew } from "./newApiEndpoints";

export const SearchList = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SearchList}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const createDiagnosisTreatmentApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.createDiagnosisTreatment}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetAllEyeFrameByPatinetId = async (patientId) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.GetAllEyeFrameByPatinetId}?patientId=${patientId}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetPatientOPDPrescriptions = async (
  patientId,
  fromDate,
  toDate,
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrlsNew.GetPatientOPDPrescriptions}?PatientID=${patientId}&FromDate=${fromDate}&ToDate=${toDate}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const getAllVitalMasterApi = async (type) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.getAllVitalMaster}?type=${type}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const GetAllEyeFramePrintReport = async (patientId, transactionID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.GetAllEyeFramePrintReport}?patientId=${patientId}&transactionID=${transactionID}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const UpdateCall = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.UpdateCall}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const UpdateUncall = async (App_ID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.UpdateUncall}?App_ID=${App_ID}`;
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
export const BindTemplateContent = async (TemplateId) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindTemplateContent}?TemplateId=${TemplateId}`;
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
export const DeleteMedicineTemplate = async (Set_Id) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.DeleteMedicineTemplate}?SetId=${Set_Id}`;
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

export const UpdateIn = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.UpdateIn}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const deleteDiagnosisTreatmentApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.deleteDiagnosisTreatment}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const LoadPrescriptionView = async (
  isIPDData,
  transactionID,
  PatientId,
) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.LoadPrescriptionView}?isIPDData=${(isIPDData = 0)}&transactionID=${transactionID}&PatientId=${PatientId}`;
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

export const SearchChiefComplaintTemplate = async (doctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchChiefComplaintTemplate}?doctorID=${doctorID}`;
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

export const SearchPastHistory = async (doctorID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchPastHistory}?doctorID=${doctorID}`;
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

export const getPatientAllergiesDiagnosisAllByApi = async (id) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getPatientAllergiesDiagnosisAllById}?id=${id}`;
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

export const SearchTreatmentHistory = async (doctorID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchTreatmentHistory}?doctorID=${doctorID}`;
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

export const SearchPersonalHistory = async (doctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchPersonalHistory}?doctorID=${doctorID}`;
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

export const SearchGeneralExamination = async (doctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchGeneralExamination}?doctorID=${doctorID}`;
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

export const SystematicExamination = async (doctorID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SystematicExamination}?doctorID=${doctorID}`;
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

export const SearchProvisionalDiagnosis = async (doctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchProvisionalDiagnosis}?doctorID=${doctorID}`;
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

export const SearchDoctorAdvoice = async (doctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchDoctorAdvoice}?doctorID=${doctorID}`;
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

export const LoadInvestigation = async (payload) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.LoadInvestigation}`;
    const data = await makeApiRequest(url, {
      method: "Post",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const SearchPrescribeMedicine = async (doctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchPrescribeMedicine}?doctorID=${doctorID}`;
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

export const SearchDietTemplate = async (doctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.SearchDietTemplate}?doctorID=${doctorID}`;
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

export const MedicineItemSearch = async (Prefix, IsPreload = 0) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.MedicineItemSearch}?Prefix=${Prefix}&IsPreload=${IsPreload}`;
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

export const GetMedicineDose = async (type) => {
  // store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.GetMedicineDose}?Type=${type}`;
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
export const getListBindMenu = async (TID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.BindCPOEMenu}?TransactionID=${TID ? TID : 1}`;
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
// export const updateFileClosed = async (AppID) => {
//   console.log(AppID);

//   try {
//     const url = `${apiUrls.FileClose}?AppID=${AppID}`;
//     const data = await makeApiRequest(url, {
//       method: "get",
//     });
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

export const updateFileClosed = async (AppID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };

    const data = await makeApiRequest(
      `${apiUrls.FileClose}?AppID=${AppID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const updateFileOpen = async (AppID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };

    const data = await makeApiRequest(
      `${apiUrls.FileOpen}?AppID=${AppID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

export const getTemplateContentApi = async (templateId) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };

    const data = await makeApiRequest(
      `${apiUrls.BindTemplateContent}?TemplateId=${templateId}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

export const saveTemplateAPI = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Post",
      data: params,
    };

    const data = await makeApiRequest(`${apiUrls.SaveTemplate}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const holdAPI = async (AppID) => {
  console.log(AppID);

  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };

    const data = await makeApiRequest(
      `${apiUrls.getHoldAPI}?AppID=${AppID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const setGetOutPatientAPI = async (AppID) => {
  console.log(AppID);

  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };

    const data = await makeApiRequest(
      `${apiUrls.OutPatient}?App_ID=${AppID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const getDoctorNotes = async (DoctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorNotes}?DoctorID=${DoctorID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const getProcedureItemSearch = async () => {
  // store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.ProcedureItemSearch}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const getGetSignAndSymptoms = async (DoctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.GetSignAndSymptoms}?DoctorID=${DoctorID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const getVaccinationStatus = async (DoctorID) => {
  // store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.VaccinationStatus}?DoctorID=${DoctorID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const getGetMolecular = async (DoctorID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(`${apiUrls.GetMolecular}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const getGetDoctor = async (transactionID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.GetDoctor}?transactionID=${transactionID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

export const BindConsentType = async (DoctorID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindConsentType}?DoctorID=${DoctorID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const BindTemplate = async (DoctorID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindTemplate}?DoctorID=${DoctorID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const BindPatientConsent = async (PatientID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindPatientConsent}?PatientID=${PatientID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SaveConsentType = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveConsentType}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const DeleteSelectedTemplate = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DeleteSelectedTemplate}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SavePatientConsent = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SavePatientConsent}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const ConsentFormPrint = async (params) => {
  store.dispatch(setLoading(true));
  try {
    store.dispatch(setLoading(true));
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.ConsentFormBindPatientConsentReport}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SearchPatient = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SearchPatient}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SearchByICDDesc = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SearchByICDDesc}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.error("Error Add Expense", error);
  }
};
export const SearchByICDCode = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SearchByICDCode}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const DiagnosisInformationSave = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DiagnosisInformationSave}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SaveMedicineTemplate = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveMedicineTemplate}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const ViewDischargeSummaryBind = async (PatientID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.ViewDischargeSummaryBind}?PatientID=${PatientID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SaveVitals = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveVitals}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const AddTriageBooking = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.AddTriageBooking}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const ExaminationRoomBindDoctorDept = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.ExaminationRoomBindDoctorDept}?Department=${params}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SavePrescriptionForm = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SavePrescription}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const BindDetails = async (transactionID) => {
  // store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindDetails}?TID=${transactionID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SaveSMS = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveSMS}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const sendEmail = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SendEmailToPatient}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const UpdateVitals = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.UpdateVitals}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const GetPatientDiagnosis = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.GetPatientDiagnosis}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const DeleteDiagnosis = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.DeleteDiagnosis}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const GetPrescription = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.GetPrescription}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SavePrescriptionDraft = async (params, loader) => {
  !loader && store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.SavePrescriptionDraft}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    !loader && store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    !loader && store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

export const GetOldAppointentData = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.GetOldAppointentData}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

export const SaveDoctorLeave = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveDoctorLeave}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

export const BindLeave = async (doctorID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindLeave}?doctorID=${doctorID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const UpdateDoctorLeave = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.UpdateDoctorLeave}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const BindPendingPages = async ({ DoctorId, RoleID, departmentId }) => {
  console.log(DoctorId, RoleID);

  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindPendingPages}?DoctorId=${DoctorId}&RoleID=${RoleID}&type=2&departmentId=${departmentId}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const BindAvailablePages = async ({
  DoctorId,
  RoleID,
  departmentId,
}) => {
  console.log(DoctorId, RoleID);

  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindAvailablePages}?DoctorId=${DoctorId}&RoleID=${RoleID}&departmentId=${departmentId}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const MenuInsert = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.MenuInsert}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

export const MenuUpdate = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.MenuUpdate}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SequenceUpdate = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SequenceUpdate}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const SaveDoctorNA = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveDoctorNA}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const BindDoctorNA = async (DoctorId) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindDoctorNA}?DoctorId=${DoctorId}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const GetOpdPrintOptionsApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(`${apiUrls.GetOpdPrintOptions}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};
export const UpdateDoctorNA = async (NAID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
    };
    const data = await makeApiRequest(
      `${apiUrls.UpdateDoctorNA}?NAID=${NAID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

export const BindProMaster = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(`${apiUrls.BindProMaster}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

// Get Top 5 Suggestions of Doctor Akhilesh

// export const DoctorPrescriptionGetTopSuggestion = async (payload) => {
//   store.dispatch(setLoading(true));

//   try {
//     const {doctorID,age,sex} = payload;
//     const options = {
//       method: "Get",
//     };
//     let url = `${apiUrls.DoctorPrescriptionPrintGetSuggestion}?doctorId=${doctorID}&age=${encodeURIComponent(age)}&sex=${sex}`
//     const data = await makeApiRequest(url, options);
//     if (data.status === true) {
//       notify(data.message, "success");
//     }
//     store.dispatch(setLoading(false));
//     return data;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.error("Error Add Expense", error);
//   }
// };

export const DoctorPrescriptionGetTopSuggestion = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    // const { doctorID, age, sex } = payload;
    // Remove space from age, e.g., "76 YRS" -> "76YRS"
    // const formattedAge = age.replace(/\s/g, '');

    const options = {
      method: "POST",
      data: payload,
    };

    let url = `${apiUrls.DoctorPrescriptionPrintGetSuggestion}`;

    const data = await makeApiRequest(url, options);

    if (data.status === true) {
      notify(data.message, "success");
    }

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error fetching prescription suggestion", error);
  }
};

export const DoctorPrescriptionPrintPDF = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorPrescriptionPrint}`,
      options,
    );
    if (data.status === true) {
      // notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    console.error("Error DoctorPrescriptionPrint", error);
  }
};

// Investigation Manual Entry

export const GetInvestigationManualEntries = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.GetInvestigationManualEntries}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Get Investigation Manual Entries", error);
  }
};

export const DoctorPrescriptionPrintCreateInvestigationManualEntries = async (
  params,
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorPrescriptionPrintCreateInvestigationManualEntries}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error(
      "Error DoctorPrescriptionPrintCreateInvestigationManualEntries",
      error,
    );
  }
};

export const DoctorPrescriptionPrintGetPatientManualEntry = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorPrescriptionPrintGetPatientManualEntry}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorPrescriptionPrintGetPatientManualEntry", error);
  }
};

//UltraSound
export const DoctorPrescriptionPrintGetUltraSoundTest = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorPrescriptionPrintGetUltraSoundTest}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorPrescriptionPrintGet UltraSoundTest", error);
  }
};

export const DoctorPrescriptionPrintSaveUltraSound = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorPrescriptionPrintSaveUltraSound}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorPrescriptionPrint SaveUltraSound ", error);
  }
};

// child vaccination chart
export const PrescriptionAdviceGetChildVaccineChart = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.PrescriptionAdviceGetChildVaccineChart}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Prescription Advice GetChildVaccineChart", error);
  }
};

export const PrescriptionAdviceGetNewChildVaccineChart = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.PrescriptionAdviceGetNewChildVaccineChart}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Prescription Advice New GetChildVaccineChart", error);
  }
};

export const PrescriptionAdviceGiveVaccineToChild = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.PrescriptionAdviceGiveVaccineToChild}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Add Expense", error);
  }
};

//Baby growth chart
export const DoctorAddBabyGrowth = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorAddBabyGrowth}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorAddBabyGrowth", error);
  }
};

export const DoctorUpdateBabyGrowth = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorUpdateBabyGrowth}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};

export const DoctorGetBabyGrowthRecords = async (PatientID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const url = `${apiUrls.DoctorGetBabyGrowthRecords}?&patientId=${PatientID}`;
    const data = await makeApiRequest(url, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Get Doctor Baby GrowthRecords", error);
  }
};

export const DoctorBindchartWeight = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const { transactionId, PatientID, Gender, Type } = payload;
    const url = `${apiUrls.DoctorBindchartWeight}?transactionId=${transactionId}&PatientID=${PatientID}&Gender=${Gender}&Type=${Type}`;
    const data = await makeApiRequest(url, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Get Doctor BindchartWeight", error);
  }
};

export const DoctorPrescriptionGetInvestigationManualEntriesbyDate = async (
  date,
) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.DoctorPrescriptionPrintGetInvestigationManualEntriesbyDate}?date=${date}`;
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

export const CommonAPIGetDoctorIDByEmployeeID = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.CommonAPIGetDoctorIDByEmployeeID}`;
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

export const PrescriptionAdviceDeleteTemplate = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.DeleteTemplate}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};

//Doctor Prescription preview

export const DoctorUpdatePrescriptionview = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.DoctorUpdatePrescriptionview}?IsPrescriptionView=${params}`;
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

export const DoctorGetPrescriptionview = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.DoctorGetPrescriptionview}`;
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

export const getDoctorDepartmentLitsApi = async (DoctorID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getDoctorDepartments}`;
    const data = await makeApiRequest(`${url}?DoctorID=${DoctorID}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ExaminationRoomBindAllergyList = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.ExaminationRoomBindAllergyList}`;
    const data = await makeApiRequest(`${url}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ExaminationRoomBindTypeList = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.ExaminationRoomBindTypeList}`;
    const data = await makeApiRequest(`${url}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ExaminationRoomSaveNewType = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.ExaminationRoomSaveNewType}`;
    const data = await makeApiRequest(`${url}`, {
      method: "post",
      data: params,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const getLabRadiologyCategoryApi = async () => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getLabRadiolozyCategory}`;
    const data = await makeApiRequest(`${url}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const getLabRadiologySubCategoryApi = async (categoryID) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getLabRadiolozySubCategory}`;
    const data = await makeApiRequest(`${url}?categoryId=${categoryID}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const DoctorSaveEyeForm = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.DoctorSaveEyeFrame}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const SaveDepartmentMapping = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.CreatDepartmentMapping}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};

export const getDepartmentMapping = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.GetDoctorDepartmentMapping}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const UpdateDepartmentMapping = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.UpdateIsdefaulDepartmentMapping}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const DoctorRealtedOpdReportsReport = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.DoctorRealtedOpdReportsRefundReport}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};

export const getAppointDetailsSearchApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.getAppointDetailsSearch}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};

export const getPrescriptionPrintApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.getPrescriptionPrint}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};

export const getInvestigationFavoriteTemplateApi = async (id) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getInvestigationFavrateTemplates}`;
    const data = await makeApiRequest(`${url}?AccordianId=${id}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const getInvestigationFavoriteTemplateDetailsApi = async (id) => {
  store.dispatch(setLoading(true));
  try {
    const url = `${apiUrls.getInvestigationFavrateTemplatesDetails}`;
    const data = await makeApiRequest(`${url}?ID=${id}`, {
      method: "get",
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const saveInvestigationFavoriteTemplateApi = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.saveInvestigationFavrateTemplates}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
// //Aftab

// export const BindDoctorShareCentreWiseDoctorWise = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(
//       apiUrls?.BindDoctorShareCentreWiseDoctorWise,
//       {
//         method: "post",
//         data: payload,
//       },
//     );
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// //3 Api
// export const SaveDoctorShare = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SaveDoctorShare, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// // package exclude details

// export const BindCreditControlBindPanelGroup = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.BindCreditControlBindPanelGroup}`;
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

// //insurance
// export const DRAccountBindPanelGroup = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.DRAccountBindPanelGroup}`;
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
// //scheme
// export const DRAccountBindScheme = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.DRAccountBindScheme}?InsuranceID=${payload}`;
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

// export const BindPanel = async (PanelGroupID) => {
//   store.dispatch(setLoading(true));

//   try {
//     const url = `${apiUrls.BindPanel}?PanelGroupID=${PanelGroupID}`;

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

// export const BindDetail = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.BindDetail, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const ReCalculateDoctorWiseShare = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.ReCalculateDoctorWiseShare, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// export const PostDoctorShareNew = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.PostDoctorShareNew, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// //Doctorignore

// export const IgnoreItemBindDetail = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.IgnoreItemBindDetail, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// export const SaveIgnoreItem = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SaveIgnoreItem, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// export const SaveRevertItem = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SaveRevertItem, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// //creditcontrol
// export const SavePanelAdvanceAmount = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SavePanelAdvanceAmount, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const BindPanelAdvanceDetails = async (PanelGroupId) => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.BindPanelAdvanceDetails}?PanelGroupId=${PanelGroupId.PanelGroupId}&SearchType=${PanelGroupId.SearchType}`;
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

// export const UpdatePanelAdvanceAmount = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.UpdatePanelAdvanceAmount, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const BindPanelAdvanceAprovalDetails = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(
//       apiUrls?.BindPanelAdvanceAprovalDetails,
//       {
//         method: "post",
//         data: payload,
//       },
//     );
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const SaveApproval = async (RecieptNo) => {
//   store.dispatch(setLoading(true));

//   try {
//     const url = `${apiUrls.SaveApproval}?RecieptNo=${RecieptNo}`;

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

// export const GenerateInvoiceDetail = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.GenerateInvoiceDetail, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// export const NotGenerateInvoiceDetail = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.NotGenerateInvoiceDetail, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const SaveInvoiceDispatch = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SaveInvoiceDispatch, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const GenerateAndNotGenerateInvoiceRemark = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(
//       apiUrls?.GenerateAndNotGenerateInvoiceRemark,
//       {
//         method: "post",
//         data: payload,
//       },
//     );
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const GenerateInvoiceReport = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.GenerateInvoiceReport, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// export const SearchInvoiceDataBulkBillWise = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(
//       apiUrls?.SearchInvoiceDataBulkBillWise,
//       {
//         method: "post",
//         data: payload,
//       },
//     );
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const DownLoadExcel = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.DownLoadExcel}`;
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

// export const WrongInvoiceBillsDeatils = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.WrongInvoiceBillsDeatils}`;
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
// export const UploadExcell = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.UploadExcell, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// export const BindInvoiceUploadedReport = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.BindInvoiceUploadedReport, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// //settleinvoicebuttondropdwon
// export const CreditControlBindBank = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.CreditControlBindBank}`;
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
// export const CreditControlBindSettlePanel = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.CreditControlBindSettlePanel}`;
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

// export const BindPaymentModeOnlyBulkSettlement = async (payload) => {
//   console.log("paykijhgf", payload);
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.BindPaymentModeOnlyBulkSettlement}?PanelID=${payload?.PanelID}`;
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

// export const   CreditControlBindPanelAdvanceDetails = async (payload) => {
//   debugger
//   console.log("paykf", payload);
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.CreditControlBindPanelAdvanceDetails}?PanelID=${payload?.PanelID}&InsuranceID=${payload?.insuranceID}  `;
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

// export const SaveMultipleSettlement = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SaveMultipleSettlement, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// //export excel
// export const ExportToExcel = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.ExportToExcel, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const BindAdvanceOnBehalf = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.BindAdvanceOnBehalf}`;
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

// export const BindInsuranceAndScheme = async (payload) => {
//   debugger;
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.BindInsuranceAndScheme}?AdvanceBehalfID=${payload}`;
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

// export const CreditLoadCurrencyDetail = async () => {
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.CreditLoadCurrencyDetail}`;
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
// export const CreditGetConversionFactor = async (payload) => {
//   console.log("paykf2", payload);
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.CreditGetConversionFactor}?CountryID=${payload?.CountryID} `;
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
// export const CreditgetConvertCurrecncy = async (payload) => {
//   console.log("paykf", payload);
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.CreditgetConvertCurrecncy}?CountryID=${payload?.CountryID}&Amount=${payload?.Amount}`;
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
// //crdr
// export const SearchPanelInvoiceCRDR = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SearchPanelInvoiceCRDR, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const GetPanelInvoiceDetails_CRDR = async (payload) => {
//   console.log("paykf3", payload);
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.GetPanelInvoiceDetails_CRDR}?PanelInvoiceNo=${payload?.PanelInvoiceNo} `;
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
// export const GetPanelInvoiceBillItemsDetailsCRDR = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(
//       apiUrls?.GetPanelInvoiceBillItemsDetailsCRDR,
//       {
//         method: "post",
//         data: payload,
//       },
//     );
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };
// export const SaveOnlyPanelInvoiceCRDR = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SaveOnlyPanelInvoiceCRDR, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const SavePanelInvoiceCRDR = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const response = await makeApiRequest(apiUrls?.SavePanelInvoiceCRDR, {
//       method: "post",
//       data: payload,
//     });
//     store.dispatch(setLoading(false));
//     return response;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.log(error);
//   }
// };

// export const CancelInvoiceData = async (payload) => {
//   console.log("paykf4", payload);
//   store.dispatch(setLoading(true));
//   try {
//     const url = `${apiUrls.CancelInvoiceData}?InvoiceNo=${payload?.InvoiceNo}`;
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

// export const SaveCancelInvoiceSettlement =async(payload)=>{
//    store.dispatch(setLoading(true));
//    try{
//       const response = await makeApiRequest(
//         apiUrls?.SaveCancelInvoiceSettlement,
//         {
//           method:'post',
//           data:payload,
//         }
//       );
//       store.dispatch(setLoading(false));
//       return response;
//    }
//     catch(error){
//       store.dispatch(setLoading(false));
//       console.log(error)
//     }
// }
// //advance reprint

// export const AdvanceReprintDetail =async(payload)=>{
//    store.dispatch(setLoading(true));
//    try{
//       const response = await makeApiRequest(
//         apiUrls?.AdvanceReprintDetail,
//         {
//           method:'post',
//           data:payload,
//         }
//       );
//       store.dispatch(setLoading(false));
//       return response;
//    }
//     catch(error){
//       store.dispatch(setLoading(false));
//       console.log(error)
//     }
// }

// export const AdvanceReceiptReprints =async(payload)=>{
//   debugger
//    store.dispatch(setLoading(true));
//    try{
//       const response = await makeApiRequest(
//         apiUrls?.AdvanceReceiptReprints,
//         {
//           method:'post',
//           data:payload,
//         }
//       );
//       store.dispatch(setLoading(false));
//       return response;
//    }
//     catch(error){
//       store.dispatch(setLoading(false));
//       console.log(error)
//     }
// }
// export const GetExcelDoccShareReorts =async(payload)=>{
//   debugger
//    store.dispatch(setLoading(true));
//    try{
//       const response = await makeApiRequest(
//         apiUrls?.GetExcelDoccShareReorts,
//         {
//           method:'post',
//           data:payload,
//         }
//       );
//       store.dispatch(setLoading(false));
//       return response;
//    }
//     catch(error){
//       store.dispatch(setLoading(false));
//       console.log(error)
//     }
// }

//aftab end

// priyam
export const GetBindDoctorPrescriptionSuggestion = async (params) => {
  try {
    const url = `${apiUrlsNew.GetDoctorPrescriptionSuggestion}`;
    const data = await makeApiRequest(url, {
      method: "POST",
      data: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const getDeleteActionTemplate = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrlsNew.DeleteActionTemplate}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const GetEditTemplate = async (id, templateFor) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    // const { id, templateFor } = payload;
    const url = `${apiUrlsNew.GetEditTemplate}?id=${id}&templateFor=${templateFor}`;
    const data = await makeApiRequest(url, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Get Doctor BindchartWeight", error);
  }
};
export const handleSaveBabyGrowthChart = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrlsNew.SaveBabyGrowthChart}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const GetBindBabyGrowthChart = async (PatientId) => {
  try {
    const url = `${apiUrlsNew.GetBabyGrowthChart}`;
    const data = await makeApiRequest(`${url}?PatientId=${PatientId}`, {
      method: "get",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const GetBindVaccineBrand = async () => {
  try {
    const url = `${apiUrlsNew.GetVaccineBrand}`;
    const data = await makeApiRequest(`${url}`, {
      method: "get",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const SaveUpdateVaccineBrandName = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveOrUpdateVaccineBrandName}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const GetBindNewChildVaccineChart = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrlsNew.GetNewChildVaccineChart}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const handleSaveOrUpdatePatientDOB = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveOrUpdatePatientDOB}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const GetBindPatentDOB = async (PatientID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    // const { id, templateFor } = payload;
    const url = `${apiUrls.GetPatentDOB}?PatientID=${PatientID}`;
    const data = await makeApiRequest(url, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Get Doctor BindchartWeight", error);
  }
};
export const handleBindMultipleLabReport = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindMultipleLabReport}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const handleSaveCounselingRequest = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveCounselingRequest}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};

export const GetBindCounselingDetails = async (TransactionID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    // const { id, templateFor } = payload;
    const url = `${apiUrls.BindCounselingDetails}?TransactionID=${TransactionID}`;
    const data = await makeApiRequest(url, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Get Doctor BindchartWeight", error);
  }
};

export const getBindFrameMenuByRoleID = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindFrameMenuByRoleID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error DoctorUpdateBabyGrowth", error);
  }
};
export const BindScheduleCharge = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindScheduleChargeURL}?PanelID=${params}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error BindScheduleCharge", error);
  }
};
export const BindPanelIPDURL = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(`${apiUrls.BindPanelIPDURL}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error BindPanelIPDURL", error);
  }
};
export const BindDocDepartmentSpecializationList = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.EDPDoctorSetUpBindDocDepartmentSpecializationList}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error BindPanelIPDURL", error);
  }
};
export const EDPDoctorSetUpBindDocFloor = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.EDPDoctorSetUpBindDocFloor}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpBindDocFloor", error);
  }
};
export const EDPDietMasterGetDeitCommonAPIControls = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.EDPDietMasterGetDeitCommonAPIControls}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDietMasterGetDeitCommonAPIControls", error);
  }
};
export const CommonAPIGetCommonAPIControls = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.CommonAPIGetCommonAPIControls}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDietMasterGetDeitCommonAPIControls", error);
  }
};
export const EDPDoctorSetUpBindDocTimingShift = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "Get",
    };
    const data = await makeApiRequest(
      `${apiUrls.EDPDoctorSetUpBindDocTimingShift}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDietMasterGetDeitCommonAPIControls", error);
  }
};
export const EDPDoctorSetUpSaveDoctor = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.EDPDoctorSetUpSaveDoctor}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpSaveDoctor", error);
  }
};
export const EDPDoctorSetUpBindDoctorDetailList = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.EDPDoctorSetUpBindDoctorDetailList}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpSaveDoctor", error);
  }
};
export const EDPDoctorSetUpBindDoctorOPDSchedule = async (DoctorID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.EDPDoctorSetUpBindDoctorOPDSchedule}?DoctorID=${DoctorID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpSaveDoctor", error);
  }
};
export const CommonAPIGetPatientInformation = async (payload) => {
  const silent = payload?.silent === true;
  if (!silent) store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    // Build the query string by hand so commas in DoctorIDs/CategoryID stay
    // literal (URLSearchParams URL-encodes them as %2C which the backend
    // sometimes refuses).
    const qs = [];
    if (payload?.CategoryID != null && payload?.CategoryID !== "")
      qs.push(`CategoryID=${payload.CategoryID}`);
    if (payload?.CenterID != null && payload?.CenterID !== "")
      qs.push(`CenterID=${payload.CenterID}`);
    if (payload?.IsTriage != null && payload?.IsTriage !== "")
      qs.push(`IsTriage=${payload.IsTriage}`);
    if (payload?.DoctorIDs != null && payload?.DoctorIDs !== "")
      qs.push(`DoctorIDs=${payload.DoctorIDs}`);
    if (payload?.PerDoctorLimit != null && payload?.PerDoctorLimit !== "")
      qs.push(`PerDoctorLimit=${payload.PerDoctorLimit}`);

    const finalUrl = `${apiUrls.CommonAPIGetPatientInformation}?${qs.join("&")}`;
    const data = await makeApiRequest(finalUrl, options);
    if (!silent && data?.status === true) {
      notify(data.message, "success");
    }
    if (!silent) store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    if (!silent) store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpSaveDoctor", error);
  }
};

export const GetPatientMedicalInfo = async (patID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrlsNew.GetPatientMedicalInfo}?PatientID=${patID}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpSaveDoctor", error);
  }
};
export const FlowshitBindVitals = async (paylaod) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: paylaod,
    };
    const data = await makeApiRequest(`${apiUrls.FlowshitBindVitals}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpSaveDoctor", error);
  }
};
export const FlowshitLabBindData = async (paylaod) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: paylaod,
    };
    const data = await makeApiRequest(`${apiUrls.FlowshitBindData}`, options);
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpSaveDoctor", error);
  }
};
export const FlowshitBindMedication = async (paylaod) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: paylaod,
    };
    const data = await makeApiRequest(
      `${apiUrls.FlowshitBindMedication}`,
      options,
    );
    if (data.status === true) {
      notify(data.message, "success");
    }
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error EDPDoctorSetUpSaveDoctor", error);
  }
};

// abhijeet code

export const SearchMedicalCertificateApi = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SearchMedicalCertificate}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const PrintMedicalCertificateApi = async (ID) => {
  store.dispatch(setLoading(true));

  try {
    const data = await makeApiRequest(
      `${apiUrls.PrintMedicalCertificate}?ID=${ID}`,
      {
        method: "GET",
      },
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const EditMedicalCertificateApi = async (ID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.EditMedicalCertificate}?ID=${ID}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const UpdateMedicalCertificateApi = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.UpdateMedicalCertificate}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const ForMedicalCertificatePatientSearch = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.ForMedicalCertificatePatientSearch}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const SaveMedicalCertificateApi = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveMedicalCertificate}`,
      options,
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
// end
