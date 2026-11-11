import { setLoading } from "../store/reducers/loadingSlice/loadingSlice";
import store from "../store/store";
import { apiUrls } from "../utils/apiEndpoints";
// import { apiUrls } from "./apiEndpoints";
// import makeApiRequest from "./axiosInstance";

export const PurchaseBindCategory = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.QuotationGetCategories}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseBindSubCategory = async (id) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.QuotationGetSubCategories}?categoryid=${id}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseGetTaxAmount = async (id) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.QuotationGetTaxAmount}?itemID=${id}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseBindGetManufacturers = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.QuotationGetManufacturers}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const POApprovalMasterBindEmployee = async (centreID) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.POApprovalMasterBindEmployee}?CentreID=${centreID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseBindGetVendors = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.QuotationGetVendors}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PoMasterBindApprovalMaster = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.POApprovalMasterBindApprovalMaster}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PODeleteApprovalMaster = async (ID) => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls?.PODeleteApprovalMaster}?ID=${ID}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const POBindCategoryApprovalMaster = async () => {
  store.dispatch(setLoading(true));
  try {
    const options = {
      method: "get",
    };
    const data = await makeApiRequest(
      `${apiUrls?.POBindCategoryApprovalMaster}`,
      options
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseBindAddItems = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(`${apiUrls?.QuotationAddItems}`, option);
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const POApprovalMasterSave = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.POApprovalMasterSaveApprovalMaster}`,
      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseSearchQuotation = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(`${apiUrls?.SearchQuotation}`, option);
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const AddItems = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(`${apiUrls?.AddItems}`, option);

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseSaveQuotation = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(`${apiUrls?.SaveQuotation}`, option);
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseGetCurrencyFactor = async (id) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetCurrencyFactor}?currencyNotation=${id}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseGetTaxGroup = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(`${apiUrls?.GetTaxGroup}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseSetDefault = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.QuotationSetDefault}`,
      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const QuotationGetPurchaseMarkUpPercent = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetPurchaseMarkUpPercent}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

// CreatePurchaseRequest Start

export const PurchaGetBindAllCenter = async (storeID) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(`${apiUrls?.BindCentreWorkOrder}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaGetSubCategoryByCategory = async (categoryID) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetSubCategoryByCategory}?categoryID=${categoryID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaGetItemsByCategory = async (storeID) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetItemsByCategory}?StoreTypeID=${storeID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaGetDepartMent = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(`${apiUrls?.GetDepartMent}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

// export const PurchaGetItemStockDetails = async (itemID) => {
//   try {
//     const option = {
//       method: "get",
//     };

//     const data = await makeApiRequest(
//       `${apiUrls?.GetItemStockDetails}?itemID${itemID}`,
//       option
//     );
//     return data;
//   } catch (error) {
//     console.log(error, "SomeThing Went Wrong");
//   }
// };

export const PurchaseGetItems = async (prifix, storeID) => {
  // console.log("getItempayload",payload);
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data: prifix,
    };

    const data = await makeApiRequest(
      `${apiUrls?.PurchaseGetItems}?StoreTypeID=${storeID}&itemtype=${1}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

// export const PurchaseGetItems = async (storeID,itemtype) => {
//   try {
//     const option = {
//       method: "get",
//     };

//     const data = await makeApiRequest(
//       `${apiUrls?.PurchaseGetItems}?storeID=${storeID}?&itemtype=${1}`,
//       option
//     );
//     return data;
//   } catch (error) {
//     console.log(error, "SomeThing Went Wrong");
//   }
// };

export const PurchaseRequestItems = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetAutoPurchaseRequestItems}`,
      option
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.log(error, "SomeThing Went Wrong");
  }
};

export const SavePurchaseRequest = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.SavePurchaseRequest}`,
      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseGetItemStockDetails = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data:payload
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetItemStockDetails}?itemID=${payload?.ItemID}&DeptRoleID=${payload?.RoleIDTo}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const GetPurchaseRequest = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(`${apiUrls?.GetPurchaseRequest}`, option);
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const OnEditPurchaseRequest = async (requestNo) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.OnEditPurchaseRequest}?requestNo=${requestNo}`,
      // `${apiUrls?.OnEditPurchaseRequest}?departmentLedgerNo=${departmentLedgerNo}&requestNo=${requestNo}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

// CreatePurchaseRequest End

// CreatePurchaseOrder Start

export const CreatePurchaseOrderGetCategorys = async (storeID) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.PurchaseOrderGetCategorys}?storeID=${storeID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PurchaseOrderSearchPO = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.PurchaseOrderSearchPOURL}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const GetPurchaseOrderItemDetailsTerms = async (payloadData) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetPurchaseOrderItemDetailsTerms}?purchaseOrderNo=${payloadData}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseOrderGetSubCategory = async (categoryID) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.PurchaseOrderGetSubCategoryByCategory}?categoryID=${categoryID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseOrderGetPOList = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.PurchaseOrderGetPOList}`,
      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.log(error, "SomeThing Went Wrong");
  }
};

export const OrderGetPurchaseItems = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.PurchaseOrderGetPurchaseItems}`,
      option
    );

    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const CreatePurchaseOrderSave = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.CreatePurchaseOrderSave}`,
      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.log(error, "SomeThing Went Wrong");
  }
};

export const GetPORequest = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.CreatePOGetPurchaseRequests}?fromDate=${payload?.fromDate}&toDate=${payload.toDate}&storeType=${payload?.storeType}&PRNumber=${payload?.purchaseReqNo}`,

      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));

    console.log(error, "SomeThing Went Wrong");
  }
};
export const GetTermAndConditions = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.POGetTermAndConditions}`,

      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const GetPOpuchaseTermsAndConditon = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetPOpuchaseTermsAndConditon}`,

      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const GetPOByTermsandCondition = async (PONumber) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.CreatePurchaseOrderGetPOByTermsandCondition}?PONumber=${PONumber}`,
      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const GetPurchaseRequestItems = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };
    store.dispatch(setLoading(false));

    const data = await makeApiRequest(
      `${apiUrls?.GetPurchaseRequestItems}`,
      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const OnEditGetPurchaseOrderItemDetails = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.GetPurchaseOrderItemDetails}?purchaseOrderNo=${payload?.PONo}&DeptRoleID=${payload?.DeptRoleID}`,
      // `${apiUrls?.OnEditPurchaseRequest}?departmentLedgerNo=${departmentLedgerNo}&requestNo=${requestNo}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

// CreatePurchaseOrder End

//view purchase request start

export const PurchaseBindGetItems = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.SearchPurchaseRequestBindItem}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const POSearchPRSummary = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.SearchPRSummary}`,

      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const ViewPurchaseOrderSearchPO = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.ViewPurchaseOrderServiceSearchPO}`,

      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PRBindEmployee = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(`${apiUrls?.BindEmployee}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const getPOItemsDetails = async (PONumber) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.CreatePurchaseOrderGetPOItemsDetails}?PONumber=${PONumber}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PRBindLedger = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(`${apiUrls?.PRBindLedger}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PRGetPRDetailsByPRNo = async (PurchaseRequestNo) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.PRGetPRDetailsByPRNo}?PurchaseRequestNo=${PurchaseRequestNo}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PRSearchPRDetailsPDF = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.PRSearchPRDetails}`,

      option
    );
    store.dispatch(setLoading(false));

    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
//view purchase request end

//tools Start

export const GRNGetStore = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(`${apiUrls?.GRNGetStore}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const GRNBindRequisitionType = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.GRNBindRequisitionType}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const GRNGetVendor = async () => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(`${apiUrls?.GRNGetVendor}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const GRNSearch = async (payData) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payData,
    };

    const data = await makeApiRequest(`${apiUrls?.GRNSearch}`, option);
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PRPOGRNBindItemapp = async (PRno) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
      // data:payData
    };

    const data = await makeApiRequest(
      `${apiUrls?.PRPOGRNAnalysisBindItemapp}?PRNo=${PRno}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const RNPOApprovalPOReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.PurchaseOrderApprovalPOReport}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PReqGetPRDetailsReport = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls?.PRGetPRDetailsReport}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const ViewPurchaseOrderAddRemark = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };
    const data = await makeApiRequest(
      `${apiUrls?.ViewPurchaseOrderAddRemark}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const PurchaseReport = async (payload) => {
  // console.log("Payload" , payload)
  store.dispatch(setLoading(true));
  try {
    const { CategoryID, SearchTyep, SubCategoryID, UserValidateID } = payload;
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.PurchaseReportPrint}?CategoryID=${CategoryID}&SearchTyep=${SearchTyep}&SubCategory=${SubCategoryID}&UserValidateID=${UserValidateID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const ViewPurchaseOrderBindPORemark = async (PONo) => {
  // console.log("Payload" , payload)
  store.dispatch(setLoading(true));
  try {
    // const {CategoryID , SearchTyep , SubCategoryID , UserValidateID} = payload
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.ViewPurchaseOrderBindPORemark}?PONo=${PONo}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const EDPLaboratorySetupSaveAnatomic = async (payload) => {
  // console.log("Payload" , payload)
  store.dispatch(setLoading(true));
  try {
    // const {CategoryID , SearchTyep , SubCategoryID , UserValidateID} = payload
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.EDPLaboratorySetupSaveAnatomic}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
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

export const EDPLaboratorySetupBindAnatomic = async () => {
  // console.log("Payload" , payload)
  store.dispatch(setLoading(true));
  try {
    // const {CategoryID , SearchTyep , SubCategoryID , UserValidateID} = payload
    const option = {
      method: "get",
      // data : payload
    };

    const data = await makeApiRequest(
      `${apiUrls?.EDPLaboratorySetupBindAnatomic}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const StoreItemMasterSavePOCategoryMaster = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.StoreItemMasterSavePOCategoryMaster}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const StoreItemMasterGetPOCategoryMaster = async (storeID) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.StoreItemMasterGetPOCategoryMaster}?StoreTypeID=${storeID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};

export const RequisitionGetDepartmetItemsToReturn = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.RequisitionGetDepartmetItemsToReturn}?CategoryID=${payload?.CategoryID}&SubcategoryID=${payload?.SubcategoryID}&ToCentreID=${payload?.ToCentreID}&ToRoleID=${payload?.ToRoleID}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PurchaseOrderCloseGetOrderDetails = async (OrderNumber) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "get",
    };

    const data = await makeApiRequest(
      `${apiUrls?.OrderCloseGetOrderDetailsURL}?PurchaseOrderNo=${OrderNumber}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const PurchaseOrderCloseSavePoClose = async (payload) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
      data: payload,
    };

    const data = await makeApiRequest(
      `${apiUrls?.OrderCloseSavePoCloseURL}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
export const CreatePurchaseOrderPurchaseOrderSendForApproval = async (
  PurchaseOrderNo
) => {
  store.dispatch(setLoading(true));
  try {
    const option = {
      method: "post",
    };

    const data = await makeApiRequest(
      `${apiUrls?.CreatePurchaseOrderPurchaseOrderSendForApproval}?PurchaseOrderNo=${PurchaseOrderNo}`,
      option
    );
    store.dispatch(setLoading(false));
    return data;
  } catch (error) {
    store.dispatch(setLoading(false));
    console.log(error, "SomeThing Went Wrong");
  }
};
//tools end
