import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  notify,
} from "../../../../utils/utils";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { PurchaGetBindAllCenter } from "../../../../NetworkServices/Purchase.js";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import Heading from "../../../../components/UI/Heading";
import Tables from "../../../../components/UI/customTable";
import Input from "../../../../components/formComponent/Input";
import RemainingAuthorizationModal from "./RemainingAuthorizationModal";
import {
  BindCentreWorkOrder,
  BindUsertypeApprovalMasterAPI,
  BindVoucherBillingScreenControls,
  LimitBindMapping,
  VoucherLimitCopyMappingAPI,
  VoucherLimitSaveMapping,
} from "../../../../NetworkServices/finance.js";
import VoucherTable from "./VoucherTable";
import { Tooltip } from "primereact/tooltip";
// import Modal from "../../../../components/ModalComonent/FinanceModal";
import { filterByTypes, handleReactSelectDropDownOptions } from "../../../utils/Utils";
// import Modal from "../../../../components/ModalComonent/FinanceModal";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../../components/UI/customTable/HisTable";
import { bindVoucherBillingScreenControls } from "../../../../NetworkServices/Pettycash.js";

const VoucherLimit = () => {
  const ip = useLocalStorage("ip", "get");
  const userData = useLocalStorage("userData", "get");
  const [t] = useTranslation();
  const [bindMapping, setBindMapping] = useState([]);
  const [center, setCentres] = useState([]);
  const [modalHandlerState, setModalHandlerState] = useState({
    header: null,
    show: false,
    size: null,
    component: null,
    footer: null,
    modalData: {},
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectItem, setSelectItem] = useState([]);
  const [amountLimits, setAmountLimits] = useState({});
  const [select, setSelect] = useState([]);
  const selectAllRef = useRef(null);

  const areAllSelected =
    selectedRows.length === bindMapping.length && bindMapping.length > 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedRows.length > 0 && selectedRows.length < bindMapping.length;
    }
  }, [selectedRows, bindMapping.length]);

  useEffect(() => {
    updateSelectItem(selectedRows);
  }, [selectedRows, bindMapping]);

  // Toggle individual row selection using index
  const handleRowSelect = (index) => {
    setSelectedRows((prevSelectedRows) => {
      let updatedSelectedRows;
      if (prevSelectedRows.includes(index)) {
        updatedSelectedRows = prevSelectedRows.filter((i) => i !== index);
      } else {
        updatedSelectedRows = [...prevSelectedRows, index];
      }
      return updatedSelectedRows;
    });
  };

  // Function to update selectItem based on selectedRows
  const updateSelectItem = (selectedIndices) => {
    const selectedValue = selectedIndices
      .map((index) => bindMapping[index]?.val)
      .filter(Boolean); // Ensure PurchaseRequestNo exists
    setSelectItem(selectedValue);
  };

  // Toggle "Select All" checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIndices = bindMapping.map((_, index) => index);
      setSelectedRows(allIndices);
    } else {
      setSelectedRows([]);
    }
  };
  const intialState = {
    userType: {},
    employee: {},
    allCenter: { value: userData?.MainCentreID },
  };
  const [values, setValues] = useState(intialState);

  const [dropDownState, setDropDownState] = useState({
    GetDepartMent: [],
    GetBindAllCenter: [],
    BindEmplyee: [],
  });

  const ApprovalLimitBindMapping = async () => {
    const centreID = String(values?.allCenter?.value);

    const userType = values?.userType?.value;
    const eid = values?.employee?.value;
    if (!centreID) {
      notify("Center is required!", "error");
      return;
    }

    if (!userType) {
      notify("userType is required!", "error");
      return;
    }
    if (!eid) {
      notify("Employee is required!", "error");
      return;
    }
    try {
      const payload = {
        centreID: centreID,
        eid: eid,
        userType: userType,
      };
      const response = await LimitBindMapping(payload);
      if (response?.success) {
        setBindMapping(response?.data);
        setValues((val) => ({ ...val, AllAmountLimit: 0 }));

        // **Important:** Set initial selected rows based on IsActive property
        const initiallySelectedRows = response?.data
          .map((val, index) => (val?.IsActive === 1 ? index : null)) // Modified condition here
          .filter((index) => index !== null);

        setSelectedRows(initiallySelectedRows);
      }
    } catch (error) {
      console.log(error, "SomeThing Went Wrong");
    }
  };

  const ApprovalLimitBindMappingALL = async({ TypeOfAutheriZion, Employee }) => {
    const payload = {
      CentreID: Number(values?.allCenter?.value || 0),
      EmployeeID: String(values?.employee?.value || ""),
      MultipleUserTypeID: TypeOfAutheriZion?.map((val) => val?.code).join(","),
      UserTypeID: String(values?.userType?.value),
      MultipleEmployee: Employee?.map((val) => val?.code).join(","),
      VmappingList: select?.map((val) => ({
        centreID: Number(values?.allCenter?.value),
        employeeID: String(val?.EmployeeID || ""),
        userType: String(values?.userType?.value),
        voucherTypeID: String(val?.VoucherTypeID),
        amountLimit: String(val?.AmountLimit),
      })),
    };

    const apiResp = await VoucherLimitCopyMappingAPI(payload);
    if (apiResp?.success) {
      setModalHandlerState({ show: false });
      notify(apiResp?.message, "success");
      ApprovalLimitBindMapping();
    }
  };

  const BindMapping = async () => {
    // return;
    try {
      const payload = {
        centreID: Number(values?.allCenter?.value),
        employeeID: String(values?.employee?.value || ""),
        utid: String(values?.userType?.value),
        vmappingList: select.map((val) => ({
          centreID: Number(values?.allCenter?.value),
          employeeID: String(val?.EmployeeID || ""),
          userType: String(values?.userType?.value),
          voucherTypeID: String(val?.VoucherTypeID),
          amountLimit: String(val?.AmountLimit),
        })),
      };
      const response = await VoucherLimitSaveMapping(payload);
      if (response?.success) {
        notify(response?.message, "success");
        setModalHandlerState({
          show: true,
          header: t(
            "Do you want to apply the same limit to remaining Authorization / Employees?"
          ),
          size: "60vw",
          component: (
            <RemainingAuthorizationModal
              setModalHandlerState={setModalHandlerState}
              dropDownState={dropDownState}
              selected={values?.userType}
              selectedEmp={values?.employee}
              modalHandlerState={modalHandlerState}
            />
          ),
          footer: <></>,
          buttonName: "Save",
          handleAPI: ApprovalLimitBindMappingALL,
        });
      } else {
        notify(response?.message, "error");
      }
    } catch (error) {
      console.log(error, "SomeThing Went Wrong");
    }
  };

   const getCentreAPI = async () => {
  
       let apiResp= await bindVoucherBillingScreenControls(1)
      //  debugger
       if(apiResp?.success){
         setCentres(filterByTypes(
            apiResp?.data,
            [14],
            ["TypeID"],
            "TextField",
            "ValueField"
          ));
       }
      
    }
    useEffect(() => {
      getCentreAPI();
    }, []);

  // const getPurchaGetBindAllCenterAPI = async () => {
  //   try {
  //     const GetBindAllCenter = await PurchaGetBindAllCenter();
  //     setDropDownState((val) => ({
  //       ...val,
  //       GetBindAllCenter: handleReactSelectDropDownOptions(
  //         GetBindAllCenter?.data,
  //         "CentreName",
  //         "CentreID"
  //       ),
  //     }));
  //   } catch (error) {
  //     console.log(error, "SomeThing Went Wrong");
  //   }
  // };

  const bindListData = async () => {
    // let apiResp = await BindVoucherBillingScreenControls(1);
    const [ScreenControls, usertypeApprovalList] = await Promise.all([
      BindVoucherBillingScreenControls(1),
      BindUsertypeApprovalMasterAPI(),
    ]);
    // filterByTypes(response?.data, [1], ["IsApproval"], "TextField", "ValueField")

    if (usertypeApprovalList?.success) {
      setDropDownState((val) => ({
        ...val,
        usertypeApprovalList: usertypeApprovalList?.data?.filter(
          (item) => item?.IsApproval !== 2
        ),
      }));
    }
    if (ScreenControls?.success) {
      const BindEmplyee = filterByTypes(
        ScreenControls?.data,
        [11],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      setDropDownState((val) => ({
        ...val,
        BindEmplyee: BindEmplyee,
      }));
    } else {
      // setList([])
    }
  };

  console.log("usertypeApprovalList", dropDownState);
  useEffect(() => {
    // getPurchaGetBindAllCenterAPI();
    bindListData();
  }, []);

  const handleReactChange = (name, e, key) => {
    setValues((val) => ({ ...val, [name]: e }));
  };

  useEffect(() => {
    if (values?.userType?.value && values?.employee?.value)
      ApprovalLimitBindMapping();
  }, [values?.userType, values?.employee]);
  // Handle amount limit change for each voucher
  const handleAmountLimitChange = (index, value,name) => {
    let newData = [...bindMapping];
    newData[index][name] = value;
    setBindMapping(newData);
  };

  useEffect(() => {
    // Log the selected items and their amount limits whenever selectedRows change
    const selectedData = selectedRows.map((index) => ({
      ...bindMapping[index],
      AmountLimit: amountLimits[index] || bindMapping[index]?.AmountLimit || 0,
    }));
    setSelect(selectedData);
  }, [selectedRows, amountLimits, bindMapping]);
  const isMobile = window.innerWidth <= 800;

  const handleChangeHead = (e) => {
    const { name, value } = e?.target;
    let updatedtbl = bindMapping?.map((val) => {
      val[name] = value;
      return val;
    });
    setBindMapping(updatedtbl);
    setValues((val) => ({ ...val, AllAmountLimit: value }));
  };
  const THEAD = [
    {
      width: "0.5%",
      name: isMobile ? (
        t("check")
      ) : (
        <input
          type="checkbox"
          className="table-checkbox ml-1"
          ref={selectAllRef} // Ref for indeterminate state
          checked={areAllSelected}
          onChange={handleSelectAll}
          
          // className="ml-1"
        />
      ),
    },

    { width: "1%", name: t("SNo") },
    { width: "5%", name: t("Voucher Code") },
    { width: "5%", name: t("Voucher List") },
    // { width: "5%", name: t("Amount Limit") },
    {
      width: "3%",
      name: isMobile ? (
        t("Amount Limit")
      ) : (
        <>
          <Tooltip
            target={`#AmountLimit`}
            position="top"
            content={t("AmountLimit")}
            event="focus"
            className="ToolTipCustom"
          />
          <input
            type="number"
            style={{ textAlign: "start" }}
            className="table-input"
            id="AmountLimit"
            placeholder={t("Amount Limit")}
            name="AmountLimit"
            onChange={handleChangeHead}
            value={values?.AllAmountLimit?values?.AllAmountLimit:""}
          />
        </>
      ),
    },
    { width: "5%", name: t("Entry Date") },
    { width: "5%", name: t("Entry By") },
  ];

  return (
    <>
      <FinanceModal
        visible={modalHandlerState?.show}
        setVisible={() =>
          setModalHandlerState({
            show: false,
            component: null,
            size: null,
          })
        }
        modalWidth={modalHandlerState?.size}
        Header={modalHandlerState?.header}
        // footer={modalHandlerState?.footer}
        handleAPI={modalHandlerState?.handleAPI}
        modalData={modalHandlerState?.modalData}
      >
        {modalHandlerState?.component}
      </FinanceModal>

      <div className="mt-2 spatient_registration_card">
        <div className="patient_registration card">
          <Heading
            name={t("Voucher Mapping Master")}
            isBreadcrumb={true}
          />
          <div className="row p-2">
            <ReactSelect
              className="required-fields"
              placeholderName={t("Centre")}
              searchable={true}
              respclass="col-xl-2 col-md-3 col-sm-6 col-12"
              id={"allCenter"}
              name={"allCenter"}
              removeIsClearable={true}
              onChange={(name, e) => handleReactChange(name, e)}
              dynamicOptions={center}
              value={values?.allCenter?.value}
            />
            <ReactSelect
              placeholderName={t("User Type")}
              searchable={true}
              respclass="col-xl-2 col-md-3 col-sm-6 col-12"
              id={"userType"}
              name={"userType"}
              removeIsClearable={true}
              onChange={(name, e) => handleReactChange(name, e)}
              dynamicOptions={handleReactSelectDropDownOptions(
                dropDownState?.usertypeApprovalList,
                "TextField",
                "ValueField"
              )}
              className="required-fields"
              value={values?.userType?.value}
            />

            <ReactSelect
              className="required-fields"
              placeholderName={t("Employee")}
              searchable={true}
              respclass="col-xl-2 col-md-3 col-sm-6 col-12"
              id={"employee"}
              name={"employee"}
              removeIsClearable={true}
              onChange={(name, e) => handleReactChange(name, e)}
              dynamicOptions={dropDownState?.BindEmplyee}
              value={values?.employee?.value}
            />
          </div>
        </div>

        {bindMapping?.length > 0 ? (
          <div className="card">
            <div className=" mt-2 ">
              <Heading title={t("Voucher Mapping")} isBreadcrumb={false} />
              <HisTable
                isSearch={true}
                thead={THEAD}
                tbody={bindMapping?.map((val, index) => ({
                  checkbox: (
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={selectedRows.includes(index)}
                      onChange={() => handleRowSelect(index)}
                    />
                  ),
                  sno: index + 1,
                  VoucherCode: val?.VoucherCode,
                  VoucherList: val?.VoucherName,
                  AmountLimit: (
                    <Input
                      className="table-input"
                      name="Remarks"
                      removeFormGroupClass={true}
                      type="number"
                      value={val?.AmountLimit?val?.AmountLimit:"0"}
                      onChange={(e) =>
                        handleAmountLimitChange(index, e.target.value,"AmountLimit")
                      }
                    />
                  ),
                  EntryDate: val?.LastUpdatedDate,
                  EntryBy: val?.LastUpdatedBy,
                }))}
                style={{ maxHeight: "50vh" }}
              />
              {bindMapping.length > 0 && (
                <div
                  className="p-2"
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <button
                    className="btn btn-sm btn-primary mr-1"
                    onClick={BindMapping}
                  >
                    {t("Save")}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default VoucherLimit;
