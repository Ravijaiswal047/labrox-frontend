import React, { use, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { AutoComplete } from "primereact/autocomplete";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Tables from "../../../../components/UI/customTable";
import Heading from "../../../../components/UI/Heading";
import { exportToExcel, parseAwsKeys } from "../../../../utils/helpers";
import Input from "../../../../components/formComponent/Input";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { guidNumber } from "../../../../utils/generateGuid";
import UploadFile from "../../../utils/UploadFileModal/UploadFile";
import PdfPreviewModal from "../../../utils/PdfPreviewModal";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
import {
  getAccessCentresReports,
  getBindCentreNew,
} from "../../../../utils/NetworkApi/commonApi";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import "./ManageApproval.css";

const ManageApproval = () => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  console.log("userData", userData);
  const st_ManageApprovalWithCentre = userData?.st_ManageApprovalWithCentre;
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [authorityTypeOptions, setAuthorityTypeOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [checkboxList, setCheckboxList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [centreList, setCentreList] = useState([]);
  const isMobile = window.innerWidth <= 768;
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });
  console.log(previewConfig, "previewConfig");
  const [showImage, setShowImage] = useState({
    visible: false,
    url: "",
  });
  const [showFileModal, setShowFileModal] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  console.log(showFileModal.data, "showFileModal");

  const [payload, setPayload] = useState({
    EmployeeName: "",
    EmployeeID: "",
    AuthorityType: "",
    ShowRate: "",
    appRightFor: "",
    appRightForMap: {}, // helper for checkbox mapping
    PerMonthpayment: "",
    PerPOpayment: "",
    FilePath: "",
    CentreId: [],

  });

  const handleSelectChange = (name, value) => {
    const val = value?.value;
    setPayload((prev) => ({ ...prev, [name]: val }));
    if (name === "AuthorityType") {
      bindApproval(val);
      bindTable(val, "0");
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInputChange = (e, item) => {
    const { checked, id, value, type } = e.target;
    setPayload((prev) => {

      if (type === "text") {
        return {
          ...prev,
          [id]: value,
        };
      }

      const updatedMap = { ...prev.appRightForMap };
      if (id === "ShowRate") {
        return {
          ...prev,
          ShowRate: checked ? "1" : "0",
        };
      }
      if (item?.TypeIDApprove) {
        if (checked) {
          updatedMap[item.TypeIDApprove] = item.typename;
        } else {
          delete updatedMap[item.TypeIDApprove];
        }
      }

      const appRightForStr = Object.entries(updatedMap)
        .map(([key, val]) => `${key}#${val}`)
        .join(",");

      return {
        ...prev,
        appRightForMap: updatedMap,
        appRightFor: appRightForStr,
      };
    });
  };

  const handleAutoCompleteSelect = (e) => {
    console.log(e);
    const selected = e.value;
    setPayload((prev) => ({
      ...prev,
      EmployeeName: selected?.label || selected,
      EmployeeID: selected?.value || selected,
    }));
  };

  const handleAutoCompleteChange = (e) => {
    const val = typeof e.value === "object" ? e.value.label : e.value;
    setAutoCompleteVal(val);
    // searchEmployees(val);
    setPayload((prev) => ({ ...prev, EmployeeName: val }));
  };

  const searchEmployees = (query) => {
    axiosInstance
      .get("InventryManageApprovalStore/Employeesearch", {
        params: { query: query || "" },
      })
      .then((res) => {
        const response = res?.data?.message;
        setStockSuggestions(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "No Data Found"
        );
      });
  };

  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.label}
      </div>
    </div>
  );

  const getAuthorityTypes = () => {
    axiosInstance
      .get("InventryManageApprovalStore/gettypedate")
      .then((res) => {
        const response = res?.data?.message;
        setAuthorityTypeOptions(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const bindApproval = (typeToBind) => {
    axiosInstance
      .get("InventryManageApprovalStore/bind", {
        params: {
          typeToBind: typeToBind || "",
        },
      })
      .then((res) => {
        const response = res?.data?.message;
        setCheckboxList(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };



  useEffect(() => {
    getAccessCentresReports(setCentreList)
  }, [])


  //   useEffect(() => {
  //   getBindCentreNew([], [], 0, (data) => {
  //     const centreData = data?.map((item) => ({
  //       label: item?.centre,
  //       value: item?.centreID,
  //     }));

  //     setCentreList(centreData);
  //   });
  // }, []);

  const Saveapproval = () => {
    const bodyReq = {
      employeeID: String(payload.EmployeeID),
      typeData: payload?.appRightFor || "",
      appRightFor: String(payload?.AuthorityType),
      showRate: String(payload?.ShowRate) || "",
      poAppLimitPerPO: payload?.PerPOpayment || "",
      poAppLimitPerMonth: payload?.PerMonthpayment || "",
      CentreID: String(payload?.CentreId || ""),
    };

    axiosInstance
      .post("InventryManageApprovalStore/saveapproval", bodyReq)
      .then((res) => {
        toast.success(res?.data?.message);
        bindTable(payload?.AuthorityType, "0");
        setPayload({
          EmployeeName: "",
          EmployeeID: "",
          AuthorityType: "",
          ShowRate: "",
          appRightFor: "",
          appRightForMap: {},
        });
        setAutoCompleteVal("");
        setStockSuggestions([]);
        setCheckboxList([]);
        getAuthorityTypes();
        // bindApproval("");
        bindApproval(payload?.AuthorityType);
        // searchEmployees("");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const bindTable = (val, con) => {
    axiosInstance
      .get("InventryManageApprovalStore/Manageapproval", {
        params: {
          appRightFor: String(val),
          con: con,
        },
      })
      .then((res) => {
        setTableData(Array.isArray(res?.data?.message) ? res.data.message : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  useEffect(() => {
    getAuthorityTypes();
  }, []);
  const handleRemove = (Id) => {
    axiosInstance
      .post("InventryManageApprovalStore/removeapproval", {
        AppRightID: String(Id),
      })
      .then((res) => {
        toast.success(res?.data?.message);
        bindTable("0", 0);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const handleOpenUploadModal = () => {
    const currentGuid = payload.FilePath ? payload.FilePath : guidNumber();
    setPayload(prev => ({ ...prev, FilePath: currentGuid }));
    setShowFileModal({
      modal: true,
      data: currentGuid,
      index: -1,
    });
  };
  const handleUploadCount = (name, count, isUploaded) => {
    console.log("UPLOAD STATUS:", isUploaded);
    if (isUploaded === true) {
      setIsFileUploaded(true);
    }
  };

  const handleUploadSignature = () => {
    debugger
    // if (!isFileUploaded) {
    //   toast.error("No Signature Uploaded");
    //   return;
    // }
    if (!payload.EmployeeID) {
      toast.error("Please Select Employee");
      return;
    }
    const bodyReq = {
      EmployeeID: String(payload.EmployeeID),
      FileName: String(showFileModal.data),
    };
    axiosInstance
      .post("InventryManageApprovalStore/SaveApprovalDocument", bodyReq)
      .then((res) => {
        toast.success(res?.data?.message);
        setIsFileUploaded(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  }
  const handleOpenPreview = (keys) => {
    let posign = null;

    // Check if it's a valid JSON before calling parseAwsKeys
    try {
      const parsed = JSON.parse(keys);
      if (Array.isArray(parsed) && parsed.length > 0) {
        posign = parsed;
      }
    } catch (err) {
      // plain string, use directly
      posign = [keys];
    }

    if (!posign || posign.length === 0) return;

    setPreviewConfig({
      visible: true,
      url: posign,
    });
  };



  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
    setTimeout(() => setPreviewConfig({ visible: false, url: null }), 0);
  };

  const handleExport = () => {
    exportToExcel(tableData, "Manage Approval");
  };
  return (
    <>
      {showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => {
            setShowFileModal({ modal: false, data: "", index: -1 });
            handleUploadSignature();
          }}
          documentId={showFileModal?.data}
          pageName="Manage Approval"
          handleUploadCount={handleUploadCount}
        />
      )}
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
        ModalSize={{ width: "50%", height: "50%" }}
      />
      <Accordion
        name={t("Manage Approval")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              completeMethod={() => searchEmployees(autoCompleteVal)}
              className="w-100 required-fields"
              onSelect={handleAutoCompleteSelect}
              id="empName"
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
            />
            <label htmlFor="empName" className="lable searchtest">
              Employee Name
            </label>
          </div>
          {st_ManageApprovalWithCentre === "1" && (
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <MultiSelectComp
                label={t("Select Centre")}
                options={centreList}
                value={payload?.CentreId}
                name="CentreId"
                id="CentreId"
                onChange={handleMultiSelectChange}
              />
            </div>
          )}
          <ReactSelect
            name="AuthorityType"
            id="AuthorityType"
            removeIsClearable={true}
            placeholderName="Authority Type"
            dynamicOptions={authorityTypeOptions?.map((ele) => ({
              label: ele?.NAME,
              value: ele?.ID,
            }))}
            value={payload?.AuthorityType}
            onChange={handleSelectChange}
            respclass="col-12 col-sm-6 col-md-2 my-1"
          />

          {(payload?.AuthorityType === "PI" ||
            payload?.AuthorityType === "SI") && (
              <RadioInput
                type="checkbox"
                label="Show Rate"
                id="ShowRate"
                name="ShowRate"
                checked={payload?.ShowRate === "1"}
                onChange={handleInputChange}
              />
            )}

          {checkboxList?.map((item) => (
            <RadioInput
              key={item?.TypeIDApprove}
              type="checkbox"
              label={item?.typename}
              id={item?.typename}
              name={item?.typename}
              checked={!!payload?.appRightForMap?.[item?.TypeIDApprove]}
              onChange={(e) => handleInputChange(e, item)}
            />
          ))}
          <div className="col-12 col-sm-6 col-md-2 my-1 d-flex justify-items-center">
            <CustomButton
              text={t("Save Approval")}
              icon={"save"}
              onClick={Saveapproval}
            />

            <CustomButton
              icon={"excel"}
              text={t("Export to Excel")}
              className="btn btn-sm btn-success ml-2"
              onClick={handleExport}
            />
          </div>
        </div>

        <div className="row px-2">
          {payload?.AuthorityType === "PO" &&
            Object.values(payload?.appRightForMap || {}).includes("Approval") && (
              <>
                <Input
                  type="text"
                  name="PerPOpayment"
                  id="PerPOpayment"
                  lable="Maxmimum Limit(Per PO) Rs."
                  value={payload?.PerPOpayment}
                  onChange={handleInputChange}
                  respclass="col-xl-2 col-sm-4 col-md-6 co-12"
                />

                <Input
                  type="text"
                  name="PerMonthpayment"
                  id="PerMonthpayment"
                  lable="Maxmimum Limit(Per Month) Rs."
                  value={payload?.PerMonthpayment}
                  onChange={handleInputChange}
                  respclass="col-xl-2 col-sm-4 col-md-6 co-12"
                />
                <CustomButton icon={"add"}
                  text={t("Upload Sign")}
                  onClick={handleOpenUploadModal}
                />
              </>
            )}
          <div className="col-sm-12">
            <p
              className="text-danger text-center"
              style={{ fontStyle: "italic" }}
            >
              VQ - Vendor Quotation , PO - Purchase Order , VM - Vendor Master ,
              IM - Item Master , PI - Purchase Indent , SI - Sales Indent , IS -
              Item Issue, POD - Proof Of Document, SPV - Stock Physical
              Verification, SR - Supplier Return
            </p>
          </div>
        </div>
      </Accordion>
      <div className="ma-search-heading">
        <Heading
          title={t("Search Filter")}
          secondTitle={
            <>
              <button
                className="btn btn-sm btn-success"
                onClick={() => bindTable(0, 0)}
              >
                Search All
              </button>
            </>
          }
        />
      </div>
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>{t("Employee Name")}</th>
                <th>{t("Employee Code")}</th>
                <th>{t("Authority Type")}</th>
                <th>{t("Approval")}</th>
                <th>{t("PO Approval Limit")}</th>
                <th>{t("PO Approval Level")}</th>
                <th>{t("PO Approval Item Type")}</th>
                <th>{t("PO Sign")}</th>
                <th>{t("Show Rate")}</th>
                <th>{t("Created By")}</th>
                <th>{t("Created Date")}</th>
                <th>{t("Remove")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((row, index) => (
                <tr key={index}>
                  <td data-title="Sr No.">{index + 1}</td>
                  <td data-title="Employee Name">{row?.EmployeeName}</td>
                  <td data-title="Employee Code">{row?.EmployeeCode}</td>
                  <td data-title="Authority Type">{row?.TypeName}</td>
                  <td data-title="Approval">{row?.AppRightFor}</td>
                  <td data-title="PO Approval Limit">{row?.POAppLimitPerPO}</td>
                  <td data-title="PO Approval Level">
                    {row?.POAppLimitPerMonth}
                  </td>
                  <td data-title="PO Approval Item Type">
                    {row?.poApprovalItemType}
                  </td>
                  <td data-title="PO Sign">
                    {row?.posign ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleOpenPreview(row?.posign)}
                      >
                        View Sign
                      </button>
                    ) : (
                      " "
                    )}
                  </td>
                  <td data-title="Show Rate">{row?.ShowRate}</td>
                  <td data-title="Created By">{row?.CreatedBys}</td>
                  <td data-title="Created Date">{row?.CreatedDate}</td>
                  <td>
                    <button onClick={() => handleRemove(row?.ApprightID)}>
                      <i className="fa fa-trash text-danger"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default ManageApproval;
