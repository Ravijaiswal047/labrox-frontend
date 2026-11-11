import { toast } from "react-toastify";
import axios from "axios";
import { axiosInstance } from "../axiosInstance";
import moment from "moment";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { apiUrls } from "../apiUrls";

const userData = useLocalStorage("userData", "get");
const DefaultCurrencyName = userData?.DefaultCurrencyName;
export const getCentreDetails = (state) => {
  axiosInstance
    .get("Centre/getGlobalCentres")
    .then((res) => {
      let data = res.data.message;
      let value = data.map((ele) => {
        return {
          value: ele.CentreID,
          label: ele.Centre,
          DefaultCentreId: ele.DefaultCentreId,
        };
      });
      state(value);
    })
    .catch((err) => {
      console.log(err);
      toast.error("Something went wrong");
    });
};

export const getPageData = (state, state2) => {
  axiosInstance
    .get("Menu/MainMenuPageData")
    .then((res) => {
      let data = res?.data?.message;
      let finalData = filtermenu(data?.menuData, data?.pageData);
      const allPageData = finalData.flatMap((menu) => menu.pageData);
      const allMenu = {
        MenuID: 0,
        MenuName: "All Menu",
        value: 0,
        label: "All Menu",
        pageData: allPageData,
      };
      finalData.unshift(allMenu);
      state(finalData);
      state2(finalData[0].pageData);
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Went Wrong",
      );
    });
};

const filtermenu = (menu, page) => {
  let resultData = [];
  const menuData = [...menu];
  const pageData = [...page];
  for (const item of menuData) {
    let subMenu = pageData.filter(
      (ele) =>
        ele.MenuName === item?.MenuName &&
        ele.MenuID === item?.MenuID &&
        ele.PageName !== "" &&
        ele.PageUrl !== "",
    );
    subMenu = subMenu.map((ele) => {
      return { ...ele, label: ele?.PageName, value: ele.PageID };
    });
    item.value = item?.MenuID;
    item.label = item?.MenuName;
    item.pageData = subMenu;
    resultData.push(item);
  }
  return resultData;
};

export const getQuickLinks = (setState) => {
  axiosInstance.get("Menu/getQuickLinks").then((res) => {
    const datas = res?.data?.message?.map((ele) => ele?.Url?.toLowerCase());
    setState(datas);
  });
};

export const checkDuplicateBarcode = (barcodeNumber, LedgerTransactionID) => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post("PatientRegistration/checkBarcodeNo", {
        BarcodeNo: barcodeNumber,
        LedgerTransactionID: LedgerTransactionID?.toString(),
      })
      .then((res) => {
        resolve(res?.data?.message);
      })
      .catch((err) => {
        resolve(err?.response?.data?.message);
      });
  });
};
export const getAccessCentres = (
  state,
  centreState,
  setCentreState,
  LTDataIniti,
  handleRateType,
  VisitTypeCategory,
  fetchFields,
  callFromRegistration = 0,
  setCenterType,
) => {
  // when CentreVsRateTypeatWorkOrder == 0 then logic will call RateTypeVsCentre so this api will not in used
  const { CentreVsRateTypeatWorkOrder, DefaultVisitTypeatWorkOrder } =
    useLocalStorage("userData", "get");
  if (callFromRegistration == 1 && CentreVsRateTypeatWorkOrder == 0) {
    return;
  }
  axiosInstance
    // .get("Centre/getAccessCentres")
    .post(apiUrls.BindCentreWorkOrder, {
      centreID: 0,
      rateTypeID: 0,
    })
    .then((res) => {
      let data = res.data.message;
      let CentreDataValue = data.map((ele) => {
        return {
          ...ele,
          value: ele.CentreID || ele?.value,
          label: ele.Centre || ele?.label,
          VisitType: ele?.VisitType,
          // HideAmount: ele?.HideAmount,
          SetMRP: ele?.SetMRP,
          BTB: ele?.BTB,
          SUBPCC: ele?.SUBPCC,
        };
      });
      state(CentreDataValue);

      if (centreState) {
        const filteredSelectedCentre = CentreDataValue?.filter(
          (ele) => ele?.value == useLocalStorage("DefaultCentre", "get"),
        );
        setCentreState({
          ...LTDataIniti,
          SrfId: "",
          IcmrId: "",
          RegistrationDate: new Date(),
          CentreID: filteredSelectedCentre[0]?.value,
          CentreName: filteredSelectedCentre[0]?.label,
          VisitType:
            filteredSelectedCentre[0]?.VisitType ||
            DefaultVisitTypeatWorkOrder ||
            "Walkin",
          SetMRP: filteredSelectedCentre[0]?.SetMRP,
          BTB: filteredSelectedCentre[0]?.BTB,
          SUBPCC: filteredSelectedCentre[0]?.SUBPCC,
          OPDIPD: "",
          HLMUHID: "",
          ID_Passport: "",
          Nationality: "",
          HLMOPDIPDNo: "",
          DiscountApprovedBy: "",
          DiscountOnTotal: "",
          DiscountId: "",
          DiscountReason: "",
          Category: "",
          HisBillNo: "",
          BedNo: "",
        });
        VisitTypeCategory(
          filteredSelectedCentre[0]?.VisitType ||
          DefaultVisitTypeatWorkOrder ||
          "Walkin",
        );
        handleRateType(
          filteredSelectedCentre[0]?.value,
          filteredSelectedCentre[0]?.VisitType ||
          DefaultVisitTypeatWorkOrder ||
          "Walkin",
        );
        fetchFields(
          filteredSelectedCentre[0]?.VisitType ||
          DefaultVisitTypeatWorkOrder ||
          "Walkin",
        );
      }
    })
    .catch((err) => {
      if (err.response.status === 401) {
        window.sessionStorage.clear();
        window.location.href = "/login";
      }
    });
};
export const getAccessDataRate = (
  state,
  centerID,
  callFromRegistration = 0,
  setState = null,
  setAllReceipt = null,
  AllowMembershipCard = 0,
  CentreTypeArg = null,
  setisCoPayment = 0,
  harcodePanel = false,
  isSelectCome = false
) => {
  const {
    CentreVsRateTypeatWorkOrder,
    AllowAdvanceOldPatientSearchAtWorkOrder,
    DefaultVisitTypeatWorkOrder,
  } = useLocalStorage("userData", "get");
  console.log("CentreVsRateTypeatWorkOrder", CentreVsRateTypeatWorkOrder);
  const CentreType =
    CentreTypeArg == 1
      ? DefaultVisitTypeatWorkOrder || "Walkin"
      : CentreTypeArg || DefaultVisitTypeatWorkOrder || "Walkin";
  // console.log("setAllReceipt",setAllReceipt);
  if (callFromRegistration == 1 && CentreVsRateTypeatWorkOrder == 0) {
    return;
  }
  return new Promise((resolve, reject) => {
    axiosInstance
      // .post("Centre/getRateTypeWithCentre", {
      //   CentreID: centerID,
      // })
      .post(apiUrls.BindRateTypeWorkOrder, {
        centreID: centerID || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType:
          Number(AllowAdvanceOldPatientSearchAtWorkOrder) === 0
            ? ""
            : CentreType,
        AllowHomeCollection: 0,
        AllowMembershipCard: AllowMembershipCard || 0,
      })
      .then((res) => {
        const data = res?.data?.message;
        console.log("getAccessDataRate", data);
        const val =
          DefaultCurrencyName === "KES" && isSelectCome
            ? [
              {
                BusinessUnitID: "",
                Invoice_To: "",
                value: "",
                label: "Select RateType",
              },
              ...data.map((ele) => {
                return {
                  BusinessUnitID: ele?.BusinessUnitID,
                  ReferenceRate: ele?.ReferenceRate,
                  Invoice_To: ele?.InvoiceTo,
                  value: ele?.RateTypeID,
                  label: ele?.RateTypeName,
                  BarcodeLogic: ele?.BarcodeLogic,
                  LockRegistration: ele?.LockRegistration,
                  PayMode: ele?.PayMode,
                  RateTypeEmail: ele?.Email,
                  RateTypePhone: ele?.Phone,
                  ClientAddress: ele?.ClientAddress,
                  HideAmount: ele?.HideAmount,
                  ProEmployee: ele?.ProEmployee,
                  AutoEmail: ele?.IsAutoPRDM,
                  IsMobileRequired: ele?.IsMobileRequired,
                  AutoTRF: ele?.AutoTRF,
                  AutoReceipt: ele?.AutoReceipt,
                  AutoMRPReceipt: ele?.AutoMRPReceipt,
                  SampleCollectionType: ele?.SampleCollectionType,
                  IsUrgent: ele?.IsUrgent,
                  CoPaymentApplicable: ele?.CoPaymentApplicable,
                  CentreType: ele?.CentreType || ele?.centreType,
                  centreType: ele?.centreType || ele?.CentreType,
                  Country: ele?.Country,
                  RequiredAttachment: ele?.RequiredAttachment,
                  AllowZeroRateBooking: ele?.AllowZeroRateBooking || 0,
                  IsForcelyBookingLock: ele?.IsForcelyBookingLock || 0,
                  isManualDiscountApply: ele?.isManualDiscountApply || 0,
                  AgainstInvoice: ele?.AgainstInvoice,
                };
              }),
            ]
            : data.map((ele) => {
              return {
                BusinessUnitID: ele?.BusinessUnitID,
                ReferenceRate: ele?.ReferenceRate,
                Invoice_To: ele?.InvoiceTo,
                value: ele?.RateTypeID,
                label: ele?.RateTypeName,
                BarcodeLogic: ele?.BarcodeLogic,
                LockRegistration: ele?.LockRegistration,
                PayMode: ele?.PayMode,
                RateTypeEmail: ele?.Email,
                RateTypePhone: ele?.Phone,
                ClientAddress: ele?.ClientAddress,
                HideAmount: ele?.HideAmount,
                ProEmployee: ele?.ProEmployee,
                AutoEmail: ele?.IsAutoPRDM,
                IsMobileRequired: ele?.IsMobileRequired,
                AutoTRF: ele?.AutoTRF,
                AutoReceipt: ele?.AutoReceipt,
                AutoMRPReceipt: ele?.AutoMRPReceipt,
                SampleCollectionType: ele?.SampleCollectionType,
                IsUrgent: ele?.IsUrgent,
                CoPaymentApplicable: ele?.CoPaymentApplicable,
                CentreType: ele?.CentreType || ele?.centreType,
                centreType: ele?.centreType || ele?.CentreType,
                Country: ele?.Country,
                RequiredAttachment: ele?.RequiredAttachment,
                AllowZeroRateBooking: ele?.AllowZeroRateBooking || 0,
                IsForcelyBookingLock: ele?.IsForcelyBookingLock || 0,
                isManualDiscountApply: ele?.isManualDiscountApply || 0,
                AgainstInvoice: ele?.AgainstInvoice,
              };
            });

        centerID === "" && val.unshift({ label: "All RateType", value: "" });
        state(val);
        // setisCoPayment(val?.[0]?.CoPaymentApplicable || 0);
        // console.log("ratetype length",val?.length,val);
        // if (typeof setAllReceipt === "function") {
        //   const firstRateType = val?.[0] ?? {};

        //   setAllReceipt({
        //     AutoTRF: firstRateType.AutoTRF || "",
        //     AutoReceipt: firstRateType.AutoReceipt || "",
        //     AutoMRPReceipt: firstRateType.AutoMRPReceipt || "",
        //   });
        // }
        // resolve(val);
        // typeof setState === "function" &&
        //   setState((prev) => ({ ...prev, RateID: val?.[0]?.value }));
        state(val);

        // Auto-select hardcoded Research Panel when harcodePanel is true
        state(val);
        centerID === "" && val.unshift({ label: "All RateType", value: "" });

        if (harcodePanel) {
          const hardcodedRateTypeID = 16672;
          const hardcodedEntry = val.find((ele) => ele.value === hardcodedRateTypeID);

          if (hardcodedEntry) {
            typeof setState === "function" &&
              setState((prev) => ({ ...prev, RateID: hardcodedEntry.value }));

            if (typeof setAllReceipt === "function") {
              setAllReceipt({
                AutoTRF: hardcodedEntry.AutoTRF || "",
                AutoReceipt: hardcodedEntry.AutoReceipt || "",
                AutoMRPReceipt: hardcodedEntry.AutoMRPReceipt || "",
              });
            }

            resolve(val);
            return; // ← exits .then() callback, skips default logic below
          }
        }

        // Default logic (only runs when harcodePanel is false)
        if (typeof setAllReceipt === "function") {
          const firstRateType = val?.[0] ?? {};
          setAllReceipt({
            AutoTRF: firstRateType.AutoTRF || "",
            AutoReceipt: firstRateType.AutoReceipt || "",
            AutoMRPReceipt: firstRateType.AutoMRPReceipt || "",
          });
        }

        resolve(val);
        typeof setState === "function" &&
          setState((prev) => ({ ...prev, RateID: val?.[0]?.value }));
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
export const getAccessDataRateReport = (state, centerID) => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post("Centre/GetRateType", {
        CentreID: Array?.isArray(centerID) ? centerID : [],
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.RateTypeID,
            label: ele?.RateTypeName,
            BarcodeLogic: ele?.BarcodeLogic,
            LockRegistration: ele?.LockRegistration,
            PayMode: ele?.PayMode,
            RateTypeEmail: ele?.Email,
            RateTypePhone: ele?.Phone,
            ClientAddress: ele?.ClientAddress,
            HideAmount: ele?.HideAmount,
            ProEmployee: ele?.ProEmployee,
          };
        });
        state(val);
        resolve(val);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
export const getBindDiscApproval = (state) => {
  axiosInstance
    .get("DiscApproval/BindDiscApproval")
    .then((res) => {
      const data = res.data?.message;
      let val = data.map((ele) => {
        return {
          label: ele?.Name,
          value: ele?.EmployeeID,
        };
      });
      val.unshift({ label: "Select Disc Approval", value: "" });
      state(val);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const getBindDiscReason = (state) => {
  axiosInstance
    .post("Global/getGlobaldata", {
      Type: "DiscountReason",
    })
    .then((res) => {
      const data = res.data?.message;
      let val = data.map((ele) => {
        return {
          label: ele?.FieldDisplay,
          value: ele?.FieldDisplay,
        };
      });
      val.unshift({ label: "SelectDiscountReason", value: "" });
      state(val);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const getBindReportDeliveryMethod = (state) => {
  axiosInstance
    .post("Global/getGlobaldata", {
      Type: "ReportDeliveryMethod",
    })
    .then((res) => {
      const data = res.data?.message;
      const val = data.map((ele) => {
        return {
          label: ele?.FieldDisplay,
          value: ele?.FieldDisplay,
        };
      });
      state(val);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const GetGlobalData = (state, type) => {
  axiosInstance
    .post("Global/getGlobaldata", {
      Type: type,
    })
    .then((res) => {
      const data = res.data?.message;
      const val = data.map((ele) => {
        return {
          label: ele?.FieldDisplay,
          value: ele?.FieldDisplay,
        };
      });
      state(val);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getCollectionBoy = (state) => {
  axiosInstance
    .get("FieldBoyMaster/BindFieldBoy")
    .then((res) => {
      const data = res?.data?.message || [];
      if (!Array.isArray(data)) {
        state([]);
        return;
      }
      const seen = new Set();
      const collection = [];
      for (const ele of data) {
        const rawName = (ele?.NAME || "").replace(/\s+/g, " ").trim();
        const normKey = rawName.toLowerCase();
        if (normKey && !seen.has(normKey)) {
          seen.add(normKey);
          collection.push({
            value: String(ele.FieldBoyID),
            label: rawName,
          });
        }
      }
      state(collection);
    })
    .catch((err) => console.log(err));
};

export const getDoctorSuggestion = (formData, state, setFormData) => {
  if (formData.DoctorName.length >= 1) {
    axiosInstance
      .post("DoctorReferal/getDoctorData", {
        DoctorName: formData.DoctorName,
      })
      .then((res) => {
        if (res.data.success && Array.isArray(res?.data?.message)) {
          state(res?.data?.message);
        } else {
          state([]);
        }
      })
      .catch((err) => console.log(err));
  } else {
    state([]);
  }
};
export const getPaymentModes = (name, state) => {
  axiosInstance
    .post("Global/getGlobalData", { Type: name })
    .then((res) => {
      let data = res.data.message;
      let value = data.map((ele) => {
        return {
          value: [
            "specialization",
            "PatientType",
            "Source",
            "BankName",
          ].includes(name)
            ? ele.FieldDisplay
            : ele.FieldID,
          label: ele.FieldDisplay,
        };
      });
      state(value);
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Went Wrong",
      );
    });
};

export const getDashboardAccessCentres = ({ state, callbackFun }) => {
  axiosInstance
    .get("Centre/getAccessCentres")
    .then((res) => {
      let data = res.data.message;
      if (Array.isArray(data)) {
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        state(CentreDataValue);
        callbackFun(
          "CentreID",
          CentreDataValue?.map((ele) => ele?.value),
        );
      } else {
        console.error("Unexpected data format:", data);
      }
    })
    .catch((err) => {
      console.log("API call failed:", err); // Log error
    });
};
export const getVisitType = (state) => {
  axiosInstance
    .get("Centre/visitTypeList")
    .then((res) => {
      let data = res.data.message;
      let Visit = data.map((ele) => {
        return {
          value: ele.FieldID,
          label: ele.FieldDisplay,
        };
      });
      state(Visit);
    })
    .catch((err) => console.log(err));
};
export const getsecondDoctorSuggestion = (formData, state, setFormData) => {
  if (formData.SecondReferDoctor.length >= 1) {
    axiosInstance
      .post("DoctorReferal/getDoctorData", {
        DoctorName: formData.SecondReferDoctor,
      })
      .then((res) => {
        if (res.data?.success && Array.isArray(res?.data?.message)) {
          state(res?.data?.message);
        } else {
          // setTimeout(() => {
          //   setFormData({ ...formData, SecondReferDoctor: "" });
          // }, 100);
          state([]);
        }
      })
      .catch((err) => console.log(err));
  } else {
    state([]);
  }
};

export const GetMedicalHistoryData = (
  MedicalId,
  setState,
  state,
  ID,
  handleUploadCount,
) => {
  axiosInstance
    .post("patientRegistration/GetMedicalHistoryData", {
      PatientGuid: MedicalId,
      LedgerTransactionID: ID ? ID : 1,
    })
    .then((res) => {
      const data = res?.data?.message;
      if (res?.data?.success) {
        const val = data.map((ele) => {
          return {
            MedicalHistory: ele?.MedicalHistory,
            LedgerTransactionID: ele?.LedgerTransactionID,
            PatientMedicalHistoryID: ele?.PatientMedicalHistoryID,
            date: moment(ele?.dtEntry)
              .utcOffset("+05:30")
              .format("YYYY-MM-DDTHH:mm:ss"),
            CreatedByName: ele?.CreatedByName,
          };
        });
        handleUploadCount(
          "MedicalHistoryCount",
          data.length,
          "IsMedicalHistory",
        );
        setState({
          PatientGuid: MedicalId,
          patientmedicalhistoryiesVM: val,
        });
      } else {
        handleUploadCount("MedicalHistoryCount", 0, "IsMedicalHistory");
        setState({ PatientGuid: MedicalId, patientmedicalhistoryiesVM: [] });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getSampleType = (state, id) => {
  axiosInstance
    .post("SampleType/getSampleTypeInVestigationWise", {
      InvestigationID: id,
    })
    .then((res) => {
      const data = res.data.message;
      console.log(data);
      let maindata = data.map((ele) => {
        return {
          value: ele?.id,
          label: ele?.SampleName,
        };
      });
      state(maindata);
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Error Occured",
      );
    });
};

export const getRejectCount = () => {
  axiosInstance
    .get("SC/getrejectcount")
    .then((res) => {
      const data = res?.data?.message[0]?.Rejected;
      const rejectCountElement = document.getElementById("RejectCount");
      if (rejectCountElement) {
        rejectCountElement.textContent = data;
        if (data === 0) {
          document.getElementById("rejectCountCont").style.display = "none";
        } else {
          document.getElementById("rejectCountCont").style.display = "flex";
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

export const checkEmploypeeWiseDiscount = (data, id) => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post("PatientRegistration/IsValidDiscountAmount", {
        TotalAmount: data?.GrossAmount,
        EmployeeID: id,
        CentreId: data?.CentreID,
        DiscountAmount: data?.DiscountOnTotal,
      })
      .then((res) => {
        resolve(false);
      })
      .catch((err) => {
        reject(err?.response?.data?.message);
      });
  });
};

export const DepartmentWiseItemList = (
  id,
  name,
  state,
  autocomplete,
  dataType,
  options = {},
) => {
  const payload = {
    testName: name,
    dataType: dataType,
  };

  // 👇 conditionally decide what to send
  if (options.useDepartmentIDs) {
    payload.departmentIDs = id;
  } else {
    payload.departmentID = String(id || "");
  }
  axiosInstance
    .post("CommonController/DepartmentWiseItemList", payload)
    .then((res) => {
      let data = [];
      if (Array.isArray(res?.data?.message)) {
        data = res.data.message;
      }

      const suggestions = autocomplete
        ? data.map((ele) => ({
          TestName: ele.TestName,
          InvestigationID: ele.InvestigationID,
        }))
        : data;

      state(suggestions);
    })
    .catch((err) => {
      toast.error(err?.response?.data?.message || "Error Occured");
    });
};

export const BindEmployeeReports = (state) => {
  axiosInstance
    .get("Camp/GetEmployees")
    .then((res) => {
      let data = res.data.message;
      let EmployeeData = data.map((ele) => {
        return {
          value: ele?.EmployeeID,
          label: ele?.NAME,
        };
      });
      state(EmployeeData);
    })
    .catch((err) => console.log(err));
};
export const BindFieldType = (state) => {
  axiosInstance
    .get("Global/BindFieldType")
    .then((res) => {
      const data = res.data?.message;
      const val = data.map((ele) => {
        return {
          label: ele?.FieldType,
          value: ele?.FieldType,
        };
      });
      state(val);
    })
    .catch((err) => {
      console.log(err);
    });
};

// export const getDepartmentReports = (state) => {
//   axiosInstance
//     .get("Department/getDepartment")
//     .then((res) => {
//       let data = res.data.message;
//       let DeptDataValue = data.map((ele) => {
//         return {
//           value: ele.DepartmentID,
//           label: ele.Department,
//         };
//       });
//       state(DeptDataValue);
//     })
//     .catch((err) => console.log(err));
// };

export const getAccessCentresReports = (state) => {
  axiosInstance
    .get("Centre/getAccessCentres")
    .then((res) => {
      let data = res.data.message;
      console.log(data);
      let CentreDataValue = data.map((ele) => {
        return {
          value: ele.CentreID,
          label: ele.Centre,
        };
      });
      state(CentreDataValue);
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Error Occured",
      );
    });
};

export const getDepartmentReports = (state) => {
  axiosInstance
    .get("Department/getDepartment")
    .then((res) => {
      const dept = res.data.message.map((ele) => ({
        value: ele.DepartmentID,
        label: ele.Department,
      }));
      state(dept);
    })
    .catch((err) => {
      console.log(err);
      toast.error("Error fetching departments");
    });
};

export const BindApprovalDoctorReports = (state) => {
  axiosInstance
    .get("CommonController/GetReferalDoctorData")
    .then((res) => {
      let data = res.data.message;
      let doctorData = data.map((ele) => {
        return {
          value: ele?.DoctorReferalId,
          label: ele?.Name,
        };
      });
      state(doctorData);
    })
    .catch((err) => console.log(err));
};

export const BindProEmployee = (state) => {
  axiosInstance
    .get("Employee/ProEmployee")
    .then((res) => {
      let data = res.data.message;
      let doctorData = data.map((ele) => {
        return {
          value: ele?.EmployeeID,
          label: ele?.EmployeeName,
        };
      });
      state(doctorData);
    })
    .catch((err) => console.log(err));
};
export const getDepartment = (state, api, manageOrdering, setCheckField) => {
  axiosInstance
    .get(`Department/${api ? api : "getDepartmentData"}`)
    .then((res) => {
      let data = res.data.message;
      let Department = data.map((ele, index) => {
        if (manageOrdering) {
          return {
            printOrder: ele?.printorder,
            value: ele.DepartmentID,
            label: ele.Department,
          };
        } else {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        }
      });
      if (setCheckField) {
        setCheckField({
          billingCategory: true,
          department: true,
        });
      }
      state(Department);
    })
    .catch((err) => {
      if (setCheckField) {
        setCheckField({
          billingCategory: true,
          department: true,
        });
      }
      console.log(err);
    });
};
export const getDesignationData = (state, all) => {
  axiosInstance
    .get("Designation/getDesignation")
    .then((res) => {
      let data = res.data.message;
      let Visit = data.map((ele) => {
        return {
          value: ele.DesignationID,
          label: ele.DesignationName,
        };
      });
      !all && Visit.unshift({ label: "All", value: "" });
      state(Visit);
    })
    .catch((err) => console.log(err));
};

export const getDesignationDataNew = (state, all) => {
  axiosInstance
    .get("Designation/getAllDesignationData")
    .then((res) => {
      let data = res.data.data;
      let Visit = data.map((ele) => {
        return {
          value: ele.DesignationID,
          label: ele.DesignationName,
        };
      });
      !all && Visit.unshift({ label: "All", value: "" });
      state(Visit);
    })
    .catch((err) => console.log(err));
};


export const GetAccessRightMaster = (state) => {
  axios
    .get("/api/v1/Employee/GetAccessRightMaster")
    .then((res) => {
      let data = res.data.message;
      let CentreDataValue = data.map((ele) => {
        return {
          value: ele.AccessbyId,
          label: ele.accessby,
        };
      });
      state(CentreDataValue);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const GetAccessRightMasterHead = (setAccessRight, setAccessHead) => {
  axios
    .get("/api/v1/Employee/GetAccessRightMaster")
    .then((res) => {
      const data = res.data.message;

      const accessRightOptions = data.map((ele) => ({
        value: ele.AccessbyId,
        label: ele.accessby,
        AccessHead: ele.AccessHead,
      }));

      const accessHeadOptions = [
        ...new Map(
          data.map((item) => [
            item.AccessHead,
            {
              value: item.AccessHead,
              label: item.AccessHead,
            },
          ]),
        ).values(),
      ];

      setAccessRight(accessRightOptions);
      setAccessHead(accessHeadOptions);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const GetAccessRightApproval = (state) => {
  axios
    .post("/api/v1/Employee/getApprovalRightMaster")
    .then((res) => {
      let data = res.data.message;

      let CentreDataValue = data.map((ele) => {
        return {
          value: ele.EmployeeID,
          label: ele.NAME,
        };
      });
      state(CentreDataValue);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const getEmployeeCenter = (state) => {
  axios
    .get("/api/v1/Employee/GetAllCentres")
    .then((res) => {
      let data = res?.data?.message;
      console.log(data, "empmaster");
      // if (DefaultCurrencyName === "KES") {
      //   data = data.filter((ele) => ele.CentreTypes === "INSURANCE");
      // }
      const val = data.map((ele) => {
        return {
          value: ele?.CentreID,
          label: ele?.Centre,
        };
      });
      state(val);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const GetRateTypeByGlobalCentre = (state) => {
  axios
    .post("/api/v1/Accounts/GetRateTypeByGlobalCentre", {
      TypeId: "",
    })
    .then((res) => {
      let data = res.data.message;
      let responce = data.map((ele) => {
        return {
          value: ele.RateTypeID,
          label: ele.RateTypeName,
        };
      });
      state(responce);
    })
    .catch((err) => console.log(err));
};

export const getAccessRateType = (state) => {
  axios
    .get("/api/v1/RateType/getAccessRateType")
    .then((res) => {
      let data = res.data.message;
      let CentreDataValue = data.map((ele) => {
        return {
          value: ele.RateTypeID,
          label: ele.Rate,
        };
      });
      state(CentreDataValue);
    })
    .catch((err) => console.log(err));
};

export const bindDepartment = (state) => {
  axios
    .get("/api/v1/ModalityMaster/BindDepartment")
    .then((res) => {
      let data = res.data.message;
      let responce = data.map((ele) => {
        return {
          value: ele.DepartmentId,
          label: ele.Department,
        };
      });
      state(responce);
    })
    .catch((err) =>
      toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
    );
};
export const bindFloor = (state) => {
  axios
    .get("/api/v1/ModalityMaster/BindFloor")
    .then((res) => {
      let data = res.data.message;
      let responce = data.map((ele) => {
        return {
          value: ele.NAME,
          label: ele.NAME,
        };
      });
      state(responce);
    })
    .catch((err) =>
      toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
    );
};
export const BindRoomList = (state) => {
  axios
    .get("/api/v1/ModalityMaster/BindRoomList")
    .then((res) => {
      let data = res.data.message;
      let responce = data.map((ele) => {
        return {
          value: ele.Id,
          label: ele.RoomName,
        };
      });
      state(responce);
    })
    .catch((err) =>
      toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
    );
};
export const BindGroupToken = (state) => {
  axios
    .get("/api/v1/ModalityMaster/BindGroupToken")
    .then((res) => {
      let data = res.data.message;
      let responce = data.map((ele) => {
        return {
          value: ele.GroupID,
          label: ele.GroupName,
        };
      });
      state(responce);
    })
    .catch((err) =>
      console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
    );
};

export const CheckApprovalRights = (state) => {
  axiosInstance.get("Camp/Aprrovalrights").then((res) => {
    if (Array.isArray(res?.data?.message)) {
      state(res?.data?.message);
      return;
    } else {
      state([]);
    }
  });
};

export const getDesignationSalesData = (state, setLoading, isActive = 1) => {
  if (setLoading) setLoading(true);

  axiosInstance
    .get(`SalesHierarchy/GetDesignationSales?IsActive=${isActive}`)
    .then((res) => {
      if (res?.status === 200) {
        const data = res.data.data || res.data.message || [];
        state(Array.isArray(data) ? data : []);

        toast.success(res?.data?.message || "Data fetched successfully");
      } else {
        toast.error("Unexpected response from server");
      }
    })
    .catch((err) => {
      console.error("Get Designation Data Error:", err);
      toast.error(
        err?.response?.data?.message ||
        "Something went wrong while fetching data",
      );
    })
    .finally(() => {
      if (setLoading) setLoading(false);
    });
};
export const GetDesignationwithEmployee = (setData, isActive = 1) => {
  axiosInstance
    .get(`SalesHierarchy/GetDesignationwithEmployee?IsActive=${isActive}`)
    .then((res) => {
      if (res?.status === 200 && res?.data?.success) {
        const data = res.data.message || [];
        setData(Array.isArray(data) ? data : []);
        console.log("Designation with Employee Data:", data);
      } else {
        console.error("Unexpected response:", res);
      }
    })
    .catch((error) => {
      console.error("Error fetching designation with employee data:", error);
    });
};

export const getSearchController = async (pageId = "") => {
  try {
    const res = await axiosInstance.post(`CompanyMaster/GetPageDataDetails`, {
      pageID: pageId,
    });

    if (!Array.isArray(res?.data?.message)) {
      notify(res?.data?.message, "error");
      return { controllersData: [], controllerTabbingOrder: [] };
    }

    const controllersData = res.data.message.sort(
      (a, b) => a?.TabOrder - b?.TabOrder,
    );

    const controllerTabbingOrder = controllersData.filter(
      (item) => item?.TabOrder !== 0,
    );

    return { controllersData, controllerTabbingOrder };
  } catch (error) {
    console.log("error", error);
    return { controllersData: [], controllerTabbingOrder: [] };
  }
};

export const getEqasPrograms = async (centerid, setStateFn = null) => {
  try {
    const apiPayload = {
      processingLabId: centerid?.toString() || "",
    };

    const res = await axiosInstance.post(
      apiUrls.BindProgramRegistration,
      apiPayload,
    );

    let resList = [];

    if (res?.data?.success) {
      resList = res?.data?.data?.map((item) => ({
        ...item,
        label: item?.ProgramName,
        value: item?.ProgramId,
      }));
    }

    // ✅ If setter is passed, update that state
    if (typeof setStateFn === "function") {
      setStateFn(resList);
    }

    return resList; // ✅ always return data
  } catch (err) {
    notify(err?.data?.message, "error");
    console.log("error", err);
    return [];
  } finally {
  }
};

//Store
export const getAllCentreService = async () => {
  try {
    const res = await axiosInstance.get(apiUrls.GetAccessProcessingLab);

    if (res?.data?.success) {
      return res.data.message.map((item) => ({
        ...item,
        label: item?.centre,
        value: item?.centreid,
      }));
    }

    return [];
  } catch (error) {
    // notify(error?.data?.message || "Error Occured" , "error");
    console.log("error", error);
  }
};
//Store
export const getCategoryType = (state) => {
  axiosInstance
    .get("StoreCommonServices/BindCategory")
    .then((res) => {
      let data = res.data.message;
      state(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getSubCategory = (categoryId, state) => {
  axiosInstance
    .get("StoreCommonServices/BindSubCategory", {
      params: { categoryId: String(categoryId) || "" },
    })
    .then((res) => {
      let data = res.data.message;
      state(data);
    })
    .catch((err) => {
      console.log(err);
      state([]);
    });
};

export const getItemCategory = (subcategoryid, state) => {
  console.log(subcategoryid);
  axiosInstance
    .get("StoreCommonServices/BindItemType", {
      params: { subcategoryid: String(subcategoryid) || "" },
    })
    .then((res) => {
      const { message, success } = res.data;

      if (success && Array.isArray(message) && message.length > 0) {
        state(message);
      } else if (!success && typeof message === "string") {
        // toast.error(message);
        state([]);
      } else {
        // toast.error("Unexpected response format.");
        state([]);
      }
    })
    .catch((err) => {
      console.log(err);
      // toast.error(err?.response?.data?.message);
      state([]);
    });
};

export const getManufacture = (state) => {
  axiosInstance
    .get("StoreCommonServices/BindManufacture")
    .then((res) => {
      let data = res.data.message;
      state(data);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const getBindUnit = (state) => {
  axiosInstance
    .get("StoreCommonServices/BindUnit")
    .then((res) => {
      let data = res.data.message;
      state(data);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const getBindMachine = (state) => {
  axiosInstance
    .get("StoreCommonServices/BindMachine")
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message || "No subcategories found.");
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};

export const GetBindcattype = (state) => {
  axiosInstance
    .get("MappingStoreItemWithCentre/Bindcattype")
    .then((res) => {
      let data = res.data.message;
      state(data);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const GetBindSubcattype = (categoryTypeId, state) => {
  axiosInstance
    .get("MappingStoreItemWithCentre/BindSubcattype", {
      params: { categoryTypeId: String(categoryTypeId) || "" },
    })
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message);
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};
export const GetItemCategory = (subCategoryTypeMasterId, state) => {
  axiosInstance
    .get("MappingStoreItemWithCentre/BindSubCategory", {
      params: {
        subCategoryTypeMasterId: String(subCategoryTypeMasterId) || "",
      },
    })
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message);
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};

export const GetBinditem = (
  categoryTypeId,
  subCategoryTypeId,
  categoryId,
  state,
) => {
  axiosInstance
    .get("MappingStoreItemWithCentre/Binditem", {
      params: {
        categoryTypeId: String(categoryTypeId) || "",
        subCategoryTypeId: String(subCategoryTypeId) || "",
        categoryId: String(categoryId) || "",
      },
    })
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error("No subcategories found.");
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
    });
};

export const GetMachine = (state) => {
  axiosInstance
    .get("StoreCommonServices/BindMachine")
    .then((res) => {
      let data = res.data.message;
      state(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getBindLocation = (
  centreId,
  stateId,
  typeId,
  countryid,
  cityId,
  state,
) => {
  console.log(centreId, stateId, typeId, countryid, cityId);
  axiosInstance
    .post("MappingStoreItemWithCentre/bindlocation", {
      centreId: centreId?.toString() || "",
      stateId: stateId?.toString() || "",
      typeId: typeId?.toString() || "",
      countryid: countryid?.toString() || "",
      cityId: cityId?.toString() || "",
    })
    .then((res) => {
      let data = res.data.message;
      state(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getDoctor = (state) => {
  axiosInstance
    .post("DoctorReferal/getDoctorDataBind")
    .then((res) => {
      const data = res?.data?.message;
      const val = data?.map((ele) => {
        return {
          label: ele?.DoctorName,
          value: ele?.DoctorID,
        };
      });
      state(val);
    })
    .catch((err) => console.log(err));
};

export const getBindCentreType = (state) => {
  axiosInstance
    .get("InventryManageApprovalStore/BindCentreType")
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message || "No Centre Type found.");
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};
export const getBindCountry = (state) => {
  axiosInstance
    .get("InventryManageApprovalStore/GetCountryData")
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message || "No Country found.");
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};
export const GetZoneData = (countryId, state) => {
  axiosInstance
    .get("InventryManageApprovalStore/GetZoneData", {
      params: {
        CountryID: String(countryId) || "",
      },
    })
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message || "No Zones found.");
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};

export const GetPOZoneData = (state) => {
  axiosInstance
    .get("POSearch/loadBusinessZone")
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message || "No Zones found.");
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};
export const getBindstate = (CountryID, BusinessZoneId, state) => {
  axiosInstance
    .get("InventryManageApprovalStore/bindstate", {
      params: {
        CountryID: String(CountryID) || "",
        BusinessZoneId: String(BusinessZoneId) || "",
      },
    })
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message);
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};

export const getPOBindstate = (BusinessZoneId, state) => {
  axiosInstance
    .get("POSearch/GetStatesByZone", {
      params: {
        Zoneid: String(BusinessZoneId) || "",
      },
    })
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message);
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};
export const getBindCity = (stateid, state) => {
  axiosInstance
    .get("InventryManageApprovalStore/BindCentreCity", {
      params: { stateid: String(stateid) },
    })
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message || "No City found.");
      }
    })
    .catch((err) => {
      console.error(err);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};
export const getBindCentreNew = (cityID, type1Id, isStoreCreated, state) => {
  console.log("getBindCentreNew called with:", {
    cityID,
    type1Id,
    isStoreCreated,
  });

  axiosInstance
    .post("InventryManageApprovalStore/bindCentreNew", {
      CityID: Array.isArray(cityID) ? cityID : [],
      Type1Id: Array.isArray(type1Id) ? type1Id : [],
      IsStoreCreated: String(isStoreCreated || "0"),
    })
    .then((res) => {
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        state(message);
      } else {
        state([]);
        toast.error(message || "No Centre found.");
      }
    })
    .catch((err) => {
      console.error("getBindCentreNew error:", err?.response?.data);
      state([]);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!",
      );
    });
};

export const getimgurl = async (id) => {
  try {
    const response = await axiosInstance.post("CommonController/GetFileUrl", {
      Key: id,
    });

    return response?.data?.message;
  } catch (err) {
    return null;
  }
};

export const getBase64 = async (data) => {
  try {
    const res = await axiosInstance.post(apiUrls.GetS3FileAsBase64, {
      fileKey: data?.awsKey || "",
      sopId: data?.SOPId || 0,
      sopName: data?.SOPName || "",
    });

    console.log("base64", res);

    if (res?.data?.success && res?.data?.data?.length > 0) {
      return res?.data?.data[0]; // return the object
    } else {
      return null;
    }
  } catch (err) {
    toast.error(err?.data?.message ? err?.data?.message : "Error Occured");
  }
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const parseGeminiJSON = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", text);
    throw new Error("Invalid JSON returned from AI");
  }
};

export const readGRNInvoiceWithGemini = async (
  file,
  GEMINI_API_KEY,
  GEMINI_MODEL,
) => {
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is missing");
  }

  const base64Image = await fileToBase64(file);

  const prompt = `
Extract data from this medical requisition form image. The image might be rotated; please analyze it carefully regardless of orientation.
Return ONLY valid JSON in the following format:
{
  "patientDetails": {
    "title": "",
    "name": "",
    "age": "",
    "gender": "",
    "mobileNo": "",
    "referringCustomer": "",
    "referringDoctor": "",
    "dateOfCollection": "",
    "timeOfCollection": "",
    "trfNo": ""
  },
  "specimenCollectionDetails": {
    "testName": "",
    "testNames": [],
    "testCode": "",
    "testCodes": [],
    "specimenTypes": {
      "plain": "",
      "edta": "",
      "sodiumFluoride": "",
      "sodiumCitrate": "",
      "sodiumHeparin": "",
      "urine": "",
      "fluidsOthers": ""
    }
  },
  "clientDetails": {
    "clientCode": "",
    "clientContactNo": "",
    "emailId": "",
    "clinicalHistoryNotes": ""
  },
  "additionalInfo": {
    "lmp": "",
    "dob": "",
    "weightKg": "",
    "heightCm": ""
  },
  "labUseOnly": {
    "noOfSamplesReceived": "",
    "receivedBy": ""
  }
}

Rules:
- Extract ONLY handwritten/filled-in values.
- Ignore pre-printed labels.
- For Age, return numeric value only.
- For Gender, identify which box (M/F) is marked.
- For Test Names, look everywhere for handwritten text like CBC, RBS, PSA, etc.
- "trfNo" is the TRF/Requisition number explicitly labelled "TRF No" or "Requisition No" on the form. It is NOT the same as testCode. If no such labelled field exists, leave it "".
- If a field is not found or empty, use "".
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file?.type || "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error:", data);
    throw new Error(data?.error?.message || `API Error ${response.status}`);
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    console.error("Gemini Empty Response:", data);
    throw new Error(
      "AI returned an empty response. Please try a clearer photo.",
    );
  }

  try {
    return parseGeminiJSON(rawText);
  } catch (err) {
    console.error("JSON Parse Error:", rawText);
    throw new Error("AI returned data in an invalid format. Please try again.");
  }
};

export const getAccessCentresBulk = (
  setCentreData,
  formData,
  setFormData,
  handleRateType
) => {
  axiosInstance
    .post(apiUrls.BindCentreWorkOrder, {
      centreID: 0,
      rateTypeID: 0,
    })
    .then((res) => {
      let data = res.data.message || [];
      let CentreDataValue = data.map((ele) => ({
        ...ele,
        value: ele.CentreID || ele?.value,
        label: ele.Centre || ele?.label,
      }));
      setCentreData(CentreDataValue);

      // Try to set the default centre and its rate type automatically
      const defaultCentreId = useLocalStorage("DefaultCentre", "get");
      const defaultCentre =
        CentreDataValue.find((ele) => String(ele.value) === String(defaultCentreId)) || CentreDataValue[0];

      if (defaultCentre && setFormData && formData) {
        setFormData({
          ...formData,
          CentreID: defaultCentre.value,
          CentreName: defaultCentre.label,
        });
        if (handleRateType) {
          handleRateType(defaultCentre.value);
        }
      }
    })
    .catch((err) => {
      if (err?.response?.status === 401) {
        window.sessionStorage.clear();
        window.location.href = "/login";
      } else {
        console.error("Error fetching bulk centres:", err);
      }
    });
};
