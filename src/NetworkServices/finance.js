import { notify } from "../Frontend/utils/Utils";
import { setLoading } from "../store/reducers/loadingSlice/loadingSlice";
import store from "../store/store";
import { apiUrls } from "../utils/apiEndpoints";
import makeApiRequest, { axiosReport } from "../utils/axiosInstance";

export const BindVoucherBillingScreenControls = async (type) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.bindVoucerListURL}?filterType=${type}`,
      {
        method: "get",
      }
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

// export const SearchAccountBookReport = async (payload) => {
//   try {
//     const url = `${apiUrls.SearchAccountBookReport}`;
//     const data = await makeApiRequest(url, {
//       method: "post",
//       data: payload,
//     });
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

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

export const BankReconciliationURL = async () => {
  try {
    const url = `${apiUrls.BankReconciliationURL}`;
    const data = await makeApiRequest(url, {
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const BindReconciliationDetails = async (payload) => {
  try {
    store.dispatch(setLoading(true));
    const url = `${apiUrls.BindReconciliationDetails}`;
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

export const UpdateReconciliation = async (payload) => {
  try {
    store.dispatch(setLoading(true));
    const url = `${apiUrls.UpdateReconciliation}`;
    const data = await makeApiRequest(url, {
      method: "POST",
      data: payload,
    });
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetBankReconciliationExcel = async () => {
  try {
    const url = `${apiUrls.GetBankReconciliationExcel}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const GetBankChargesUploadExcel = async () => {
  try {
    const url = `${apiUrls.GetBankChargesUploadExcel}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const SearchAccountBookReport = async (payload) => {
  try {
    const url = `${apiUrls.SearchAccountBookReport}`;
    const data = await makeApiRequest(url, {
      method: "post",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const BalanceTransaferControls = async ({ CentreID }) => {
  try {
    const url = `${apiUrls.BalanceTransaferControls}?centreID=${CentreID}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const BinduploadOpeningBalanceControls = async (userValidateID) => {
  try {
    const url = `${apiUrls.BinduploadOpeningBalanceControls}`;
    const data = await makeApiRequest(url, {
      method: "get",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const GetOpeningBalanceExcell = async (payload) => {
  try {
    const url = `${apiUrls.GetOpeningBalanceExcell}`;
    const data = await makeApiRequest(url, {
      method: "post",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const GetOpeningBalanceToUpload = async (payload) => {
  try {
    const url = `${apiUrls.GetOpeningBalanceToUpload}`;
    const data = await makeApiRequest(url, {
      method: "post",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const GetBalanceToTransafer = async (payload) => {
  try {
    const url = `${apiUrls.GetBalanceToTransafer}`;
    const data = await makeApiRequest(url, {
      method: "post",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const UploadBalanceTransfer = async (payload) => {
  try {
    const url = `${apiUrls.UploadBalanceTransfer}`;
    const data = await makeApiRequest(url, {
      method: "post",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const SaveOpeningBalance = async (payload) => {
  try {
    const url = `${apiUrls.SaveOpeningBalance}`;
    const data = await makeApiRequest(url, {
      method: "post",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const BindCentreWorkOrder = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.BindCentreWorkOrder}`,
      {
        method: "post",
        data: payload,
      }
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};


export const CommonAPIGetDateTimeNow = async (type) => {
  // store.dispatch(setLoading(true));
  try {
    const data = await makeApiRequest(
      `${apiUrls.CommonAPIGetDateTimeNow}`,
      {
        method: "get",
      }
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const BindCOGBankDetails = async () => {
  store.dispatch(setLoading(true));
  const options = {
    method: "Post",
    data: {
      filterType: 1,
      coalID: 0,
      coName: "",
    },
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.bindCOGGroupsBackendData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const LoadCentreChartOfAccountAPI = async (payload) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "Post",
    data: payload,
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.LoadCentreChartOfAccountURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetCurrencyConversionFactorAPI = async (
  currencyCode,
  voucherDate
) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "get",
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.GetCurrencyConversionFactorURL}?currencyCode=${currencyCode}&voucherDate=${voucherDate}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const GetPeriodClosed = async (voucherDate) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "get",
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.GetPeriodClosedURL}?voucherDate=${voucherDate}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BindGroupTable = async () => {
  store.dispatch(setLoading(true));
  const options = {
    method: "get",
  };
  try {
    const data = await makeApiRequest(`${apiUrls.BindGroupTableURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const BindChartOfAccount = async (params) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "get",
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.BindChartOfAccountURL}?GroupCode=${params}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const bindMainGroupAPI = async () => {
  store.dispatch(setLoading(true));
  const options = {
    method: "get",
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.LoadGroupRecordsURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const SaveNewGroupAPI = async (payload) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "Post",
    data: payload,
  };
  try {
    const data = await makeApiRequest(`${apiUrls.SaveNewGroupAPI}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const searchGetParentsData = async (payload) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "get",
    // data: payload
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.GetParentsData}?parentsID=${payload?.ParentsID}&branchCentreID=${payload?.BranchCentreID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const CentreWiseGroup = async (payload) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "get",
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.SearchGroupTableURL}?CID=${payload}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ChartOfGroupUpdateStatus = async (payload) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "post",
    data: payload,
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.ChartOfGroupUpdateStatusURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ChartOfGroupExcel = async () => {
  store.dispatch(setLoading(true));
  const options = {
    method: "get",
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.ChartOfGroupExcelURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const UpdateGroupCodeDisplay = async (payload) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "post",
    data: payload,
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.UpdateGroupCodeDisplayURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};
export const ChartOfUpdateGroupName = async (payload) => {
  store.dispatch(setLoading(true));
  const options = {
    method: "post",
    data: payload,
  };
  try {
    const data = await makeApiRequest(`${apiUrls.UpdateGroupNameURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const bindCOGGroupsBackendData = async () => {
  store.dispatch(setLoading(true));
  const options = {
    method: "Post",
    data: {
      filterType: 2,
      coalID: 0,
      coaName: "",
    },
  };
  try {
    const data = await makeApiRequest(
      `${apiUrls.bindCOGGroupsBackendData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    throw error;
  }
};

export const handlbindCOGGroupsBackendData = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.bindCOGGroupsBackendData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// ActionChartOfAccount

export const ActionChartOfAccount = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.ActionChartOfAccount}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const BindMappingData = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(`${apiUrls.BindMappingData}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// SaveMapping

export const SaveMapping = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveMapping}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// ActionChartOfAccount

export const SaveNewAccountType = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveNewAccountType}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// SaveChartOfAccount

export const SaveChartOfAccount = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.SaveChartOfAccount}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const Bindglobalresources = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.Bindglobalresources}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// master start

export const BindBranchCentre = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceConsumptionBindBranchCentre}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindHisDerpatments = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(`${apiUrls.BindHisDerpatment}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindTransactionTypes = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindTransactionType}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindScreenControl = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindScreenControls}?filterType=1`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const ConSaveMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveVoucherTypeMaster}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceBindVoucherTypeMaster = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindVoucherTypeMaster}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindUsertypeApprovalMasterAPI = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindUsertypeApprovalMasterURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceGetCountry = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(`${apiUrls.GetCountry}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindCurrencyMaster = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(`${apiUrls.BindCurrencyMaster}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceCentreWise_Coa_Mapping = async (centreId) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.CentreWise_Coa_Mapping}?centreID=${centreId}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceSaveMappingData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.SaveMappingData}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceCostSaveMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.CostSaveMapping}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceDeActiveVoucherTypeMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.DeActiveVoucherTypeMaster}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceCostBindMapping = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(`${apiUrls.CostBindMapping}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceBindHREmployeeDepartment = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindHREmployeeDepartment}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceBindDoctorDepartment = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindDoctorDepartment}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveCurrencyMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.SaveCurrencyMaster}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceSaveVoucherTypeMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveVoucherTypeMaster}?`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveMasterCreation = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.SaveMasterCreation}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FInanceBindMainCenter = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(`${apiUrls.BindMainCenter}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinaceCopyMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.CopyMapping}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const deleteChangeStatus = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.ChangeStatus}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindMasterCreation = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceBindMasterCreation}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceLoadType = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(`${apiUrls.FinanceLoadType}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceCostLoadGroupRecords = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.CostLoadGroupRecords}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceFinanceAccount = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(`${apiUrls.FinanceAccount}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceCostChangeStatus = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.CostChangeStatus}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceConsumptionSaveMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.ConsumptionSaveMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// approval start

export const LimitBindMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.VoucherLimitBindMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const VoucherLimitSaveMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.VoucherLimitSaveMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
// approval End

export const FinanceSaveVoucher = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.FinanceSaveVoucher}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceBindAuditBackendData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceBindAuditBackendData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveVoucherAudit = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveVoucherAudit}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindReconciliationBank = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindReconciliationBank}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// approval End

// Voucher Audit Start here

export const BindAuditBackendData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindAuditBackendData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const BindReportControlsAPI = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindReportControlsURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindPayableGroup = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(`${apiUrls.BindPayableGroup}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// cost-center-access Controller Start
export const bindCCMappingBackendData = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.bindCCMappingBackendData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};


// GetBankReconciliationReport

export const GetBankReconciliationReport = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.GetBankReconciliationReport}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const SaveCostCentreemployeeMapping = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveCostCentreemployeeMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const SaveChequeDeposit = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = { method: "post", data: payload };
    const data = await makeApiRequest(`${apiUrls.SaveChequeDeposit}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveChequeBounce = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = { method: "post", data: payload };
    const data = await makeApiRequest(`${apiUrls.SaveChequeBounce}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const UpdateReconciliationVerifyAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = { method: "post", data: payload };
    const data = await makeApiRequest(
      `${apiUrls.UpdateReconciliationVerifyURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SupplierBindBackendData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = { method: "post", data: payload };
    const data = await makeApiRequest(
      `${apiUrls.SupplierBindBackendData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const SearchVoucher = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.SearchVoucher}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const UpdateVoucherStatusAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.UpdateVoucherStatusURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const GetPendingsettleInvoiceAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.GetPendingsettleInvoiceURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceUpdateStatusBulk = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = { method: "post", data: payload };
    const data = await makeApiRequest(
      `${apiUrls.FinanceUpdateStatusBulk}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const UpdateVoucherPostingReview = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = { method: "post", data: payload };
    const data = await makeApiRequest(
      `${apiUrls.UpdateVoucherPostingReview}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveMapAdvanceWithPurchase = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = { method: "post", data: payload };
    const data = await makeApiRequest(
      `${apiUrls.SaveMapAdvanceWithPurchase}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const getVoucherNoListAPI = async (AccountID, Type) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.LoadAccountDetailsURL}?AccountID=${AccountID}&Type=${Type}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const getReplicateVoucherHistoryAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.ReplicateVoucherHistoryURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetPendingCheque = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.GetPendingCheque}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetDepositCheque = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.GetDepositCheque}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindReconciliationVerifyDetails = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.BindReconciliationVerifyDetails}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SearchReconcileDetails = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: params,
    };
    const data = await makeApiRequest(
      `${apiUrls.SearchReconcileDetails}?entryDetailID=${params}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SearchForBoucherPostingBatch = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SearchForBoucherPostingBatch}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSearchVoucher = async (params) => {
  // console.log("params",params)
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSearchVoucher}?filterType=${"1"}&voucherNo=${params?.VoucherNo}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetBalanceSheetReport = async (payload) => {
  // console.log("params",params)
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.GetBSReportURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetBSDetailReportAPI = async (payload) => {
  // console.log("params",params)
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.GetBSDetailReportURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetISReportAPI = async (payload) => {
  // console.log("params",params)
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.GetISReportURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceBindBranchCentre = async (params) => {
  // console.log("params",params)
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceBindBranchCentre}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// voucher end

// Report start
export const GetTrialBalanceReport = async (payload, isInLoop, tableData, index) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.GetTrialBalanceReport}`,
      options
    );
    if (isInLoop && index < tableData?.length - 1) {

    } else {
      store.dispatch(setLoading(false));
    }
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetGLReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.GetGLReport}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const PurchaseBillDueReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.PurchaseBillDueReport}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaleBillDueReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaleBillDueReport}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const VoucherSummaryReportAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.VoucherSummaryReport}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetWithHoldingTaxReportAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.GetWithHoldingTaxReport}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetPayableBankWiseReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.GetPayableBankWiseReportURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const PaybleAgingSummary = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.PaybleAgingSummary}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetStatementReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.GetStatementReport}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindSettlementDetails = async (EntryDetailID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
      // data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.BindSettlementDetailsURL}?EntryDetailID=${EntryDetailID}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceReceibleAgingSummary = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceReceibleAgingSummary}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinancePrintSearchVoucher = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      // data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinancePrintSearchVoucher}?filterType=${"1"}&voucherNo=${payload.voucherNo}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GetConfigurationFinance = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.GetConfigurationURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindCollectionConfigurationData = async (centreID, filterType) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindCollectionConfigurationDataURL}?CentreID=${centreID}&FilterType=${filterType}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindAssetMappingScreenData = async (centerID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindAssetMappingScreenDataURL}?CentreID=${centerID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const UpdateConfiguration = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.UpdateConfigurationURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveConfiguration = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveConfigurationURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SearchAssetMappingAPI = async ({
  ItemID,
  SubcategoryID,
  CentreID,
}) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.SearchAssetMappingURL}?CentreID=${CentreID}&ItemID=${ItemID}&SubcategoryID=${SubcategoryID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const PrintAssetMappingAPI = async ({
  ItemID,
  SubcategoryID,
  CentreID,
}) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
    };
    const data = await makeApiRequest(
      `${apiUrls.PrintAssetMappingURL}?CentreID=${CentreID}&ItemID=${ItemID}&SubcategoryID=${SubcategoryID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveAssetMappingAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveAssetMappingURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const HISConsumeDeptMappingBindHISConsumeDeptMappingScreenData =
  async () => {
    store.dispatch(setLoading(true));
    try {
      const options = {
        method: "get",
      };
      const data = await makeApiRequest(
        `${apiUrls.HISConsumeDeptMappingBindHISConsumeDeptMappingScreenData}?filterType=${1}`,
        options
      );
      store.dispatch(setLoading(false));
      return data;
    } catch (error) {
      store.dispatch(setLoading(false));
      console.error("Error Found", error);
    }
  };
export const HISConsumeDeptMappingBindHISConsumeDeptMappedUnMappedData = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.HISConsumeDeptMappingBindHISConsumeDeptMappedUnMappedData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemRightHISConsumeDeptMapping = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemRightHISConsumeDeptMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemLeftHISConsumeDeptMapping = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemLeftHISConsumeDeptMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExportToExcelHISConsumeDeptMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      // data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExportToExcelHISConsumeDeptMapping}?centreID=${payload?.centreID}&finDeptCode=${payload?.finDeptCode}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExporttoExcelNotMappedDataHISConsumeDeptMapping = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      // data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExporttoExcelNotMappedDataHISConsumeDeptMapping}?centreID=${payload?.centreID}&hisDepartment=${payload?.hisDepartment}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceCopyCentreListHISConsumeDeptMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceCopyCentreListHISConsumeDeptMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceBindStockAdjProcessScreenControls = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceBindStockAdjProcessScreenControls}?filterType=${1}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveStockAdjProcessMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveStockAdjProcessMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceBindStockAdjProcessMappingData = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceBindStockAdjProcessMappingData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceChangeStockAdjProcessStatus = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceChangeStockAdjProcessStatus}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceCopyStockAdjProcessMapping = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceCopyStockAdjProcessMapping}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
// export const GetGLReport = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const options = {
//       method: "post",
//       data: payload,
//     };
//     const data = await makeApiRequest(`${apiUrls.GetGLReport}`, options);
//     store.dispatch(setLoading(false));
//     return data;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.error("Error Found", error);
//   }
// }
export const SaveCurrencyConverterFactor = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveCurrencyConverter}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const GetCurrencyConversionDetails = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.CurrencyConversionDetails}?CountryID=${payload?.countryId}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
    return { success: false, message: error.message };
  }
};

export const FinanceCopyMappingBindCostOfSale = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceCopyMappingBindCostOfSale}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

//

export const FinanceBindCostOfSaleMappingScreenData = async (CentreId) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceBindCostOfSaleMappingScreenData}?filterType=${1}&CenterID=${CentreId}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceBindCostOfSaleMappedUnMappedData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceBindCostOfSaleMappedUnMappedData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemLeftBindCostOfSale = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemLeftBindCostOfSale}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemRightBindCostOfSale = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemRightBindCostOfSale}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExportToExcelBindCostOfSale = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      // data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExportToExcelBindCostOfSale}?centreID=${payload?.centreID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExporttoExcelNotMappedDataBindCostOfSale = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExporttoExcelNotMappedDataBindCostOfSale}?centerID=${payload?.centreID}&hisDepartment=${payload?.hisDepartment}&PatientType=${payload?.PatientType}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// pRINCE-cost of sale

export const FinanceFinVHimsMappingScreenData = async (CenterID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceFinVHimsMappingScreenData}?filterType=${1}&CentreID=${CenterID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceFinVHimsMappedUnMappedData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceFinVHimsMappedUnMappedData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemLeftFinVHims = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemLeftFinVHims}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemRightFinVHims = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemRightFinVHims}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExportToExcelFinVHims = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
      // data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExportToExcelFinVHims}?centreID=${payload?.centreID}&finDeptCode=${payload?.finDeptCode}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExporttoExcelNotMappedDataFinVHims = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExporttoExcelNotMappedDataFinVHims}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceCopyMappingItem = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceCopyMappingItem}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const VoucherLimitCopyMappingAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.VoucherLimitCopyMappingURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceFinVHimsDeptMappingScreenData = async (CenterID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceFinVHimsDeptMappingScreenData}?filterType=${1}&CentreID=${CenterID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceFinVHimsDeptMappedUnMappedData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceFinVHimsDeptMappedUnMappedData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemLeftFinVHimsDept = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemLeftFinVHimsDept}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemRightFinVHimsDept = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemRightFinVHimsDept}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExportToExcelFinVHimsDept = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "GET",
      // data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExportToExcelFinVHimsDept}?centreID=${payload?.centreID}&finDeptCode=${payload?.finDeptCode}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExporttoExcelNotMappedDataFinVHimsDept = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExporttoExcelNotMappedDataFinVHimsDept}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceCopyMappingItemDept = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceCopyMappingItemDept}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
// Rupesh - SubMapping

export const FinanceSubCategoryMappingMasterScreenData = async (CenterID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSubCategoryMappingMasterScreenData}?filterType=${1}&CenterID=${CenterID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSubCategoryMappingMasterMappedUnMappedData = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSubCategoryMappingMasterMappedUnMappedData}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemRightSubCategoryMappingMaster = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemRightSubCategoryMappingMaster}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSaveSelectedItemLeftSubCategoryMappingMaster = async (
  payload
) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSaveSelectedItemLeftSubCategoryMappingMaster}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceExportToExcelSubCategoryMappingMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceExportToExcelSubCategoryMappingMaster}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
// export const FinanceExporttoExcelNotMappedDataFinVHimsDept = async (payload) => {
//   store.dispatch(setLoading(true));
//   try {
//     const options = {
//       method: "POST",
//       data: payload,
//     };
//     const data = await makeApiRequest(
//       `${apiUrls.FinanceExporttoExcelNotMappedDataFinVHimsDept}`,
//       options
//     );
//     store.dispatch(setLoading(false));
//     return data;
//   } catch (error) {
//     store.dispatch(setLoading(false));
//     console.error("Error Found", error);
//   }
// };

export const FinanceCopyMappingSubCategoryMappingMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceCopyMappingSubCategoryMappingMaster}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinanceVoucherPrint = async (payload) => {
  store.dispatch(setLoading(true));

  axiosReport
    .post(
      `${apiUrls.FinanceVoucherPrint}?voucherNo=${payload.voucherNo}`,
      {},
      { responseType: "blob" }
    )
    .then(async (response) => {
      store.dispatch(setLoading(false));
      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const result = JSON.parse(text);

        notify(result?.message || "Record Not Found", "error");
        return;
      }
      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    })
    .catch((error) => {
      store.dispatch(setLoading(false));
      notify("Something went wrong", "error");
      console.error("Error Found", error);
    });
};
export const bindFinancialYear = async (centreID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.bindFinancialYearURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const CloseBookAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(`${apiUrls.CloseBookURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const bindFinancialYearPeriodClosing = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(`${apiUrls.bindFinancialURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const GrdFinancialYearAPI = async (id, centreID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: { id: id, 
       // centreID: centreID 
      },
    };
    const data = await makeApiRequest(
      `${apiUrls.GrdFinancialYearURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveFinancialAPI = async (payloadData) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payloadData,
    };
    const data = await makeApiRequest(`${apiUrls.SaveFinancialURL}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const CloseFinancialYearApi = async (payloadData) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payloadData,
    };
    const data = await makeApiRequest(
      `${apiUrls.CloseFinancialYearURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const EmployeeListAPI = async (payloadData) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindFinanceEmployeeURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const BindSICTypeMasterAPI = async (EmployeeID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls.BindSICTypeMasterURL}?EmployeeID=${EmployeeID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const SaveSICAuthorizationAPI = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.SaveSICAuthorizationURL}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};
export const FinanceSupplierAdvanceMappingBindBackendData = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls.FinanceSearchForVoucherPrinting}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const FinancePaymentRemittanceAdvicePrint = async (voucherNo) => {
  store.dispatch(setLoading(true));

  axiosReport
    .post(
      `${apiUrls?.FinancePaymentRemittanceAdvicePrint}?voucherNo=${voucherNo}`,
      {},
      { responseType: "blob" }
    )
    .then(async (response) => {
      store.dispatch(setLoading(false));

      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const result = JSON.parse(text);

        notify(result?.message || "Something went wrong", "error");
        return;
      }
      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    })
    .catch((error) => {
      store.dispatch(setLoading(false));

      notify(
        error?.response?.data?.message || "Something went wrong",
        "error"
      );

      console.error("Error Found", error);
    });
};


export const ChequePrint = async (voucherNo) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceChequePrint}?VoucherNo=${voucherNo}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceBindSICEmployeeAuthorization = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceBindSICEmployeeAuthorization}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceMonthlyClosureCheck = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceMonthlyClosureCheck}?fromDate=${payload?.fromDate}&toDate=${payload?.toDate}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceGetSICReports = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceGetSICReports}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinancePushMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "GET",
      data: payload,
    };

    const data = await makeApiRequest(`${apiUrls?.FinancePushMaster}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceShowApprovalDetails = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceShowApprovalDetails}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceSaveApproved = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceSaveApproved}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceRunProcSICReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceRunProcSICReport}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceShowReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(`${apiUrls?.FinanceShowReport}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceSaveSICApproved = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceSaveSICApproved}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceApproveSICAllSubHead = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceApproveSICAllSubHead}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceLoadCentreChartOfAccount = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceLoadCentreChartOfAccount}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceGetPendingsettleInvoiceSupplierInstallment = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "POST",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceGetPendingsettleInvoiceSupplierInstallment}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const FinanceUpdateInstallmentSupplierInstallment = async (EntryDetailID) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.FinanceUpdateInstallmentSupplierInstallment}?EntryDetailID=${EntryDetailID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PrintDownloadVoucher = async (VoucherNo) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.DownloadVoucher}?VoucherNo=${VoucherNo}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

// Map Main Centre To Branch Start

export const FinanceBindCentre = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(`${apiUrls.FinanceBindCentre}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const BindMappingDetails = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(`${apiUrls.BindMappingDetails}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

export const RemoveMapping = async (params) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "POST",
      data: params,
    };
    const data = await makeApiRequest(`${apiUrls.RemoveMapping}`, options);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.error("Error Found", error);
  }
};

// Map Main Centre To Branch End
