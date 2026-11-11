import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Checkbox from "../../../../components/formComponent/Checkbox";
import Tables from "../../../../components/UI/customTable";
import CustomModalAlert from "../../../../components/formComponent/CustomModalAlert";
import { FaTrash } from "react-icons/fa";
import {
  handleReactSelectDropDownOptions,
  notify,
} from "../../../utils/Utils";
import {
  FinanceBindCentre,
  BindMappingDetails,
  SaveMapping,
  RemoveMapping,
  BindCentreWorkOrder,
} from "../../../../NetworkServices/finance";
import { BindMainCenter } from "../../../../NetworkServices/Pettycash";
import moment from "moment";
import HisTable from "../../../../components/UI/customTable/HisTable";

const MapMainCentreToBranch = () => {
  const [t] = useTranslation();
  const [centres,setCentres] = useState([]);

  const [values, setValues] = useState({
    branchCentre: null,
    mainCentre: null,
    isMainCentre: false,
  });

  const [tableData, setTableData] = useState([]);

  const [dropDownState, setDropDownState] = useState({
    BindBranchCentre: [],
    BindMainCentre: [],
  });

  const [deleteData, setDeleteData] = useState({
    isOpen: false,
    mapID: "",
    branchCentreID: "",
    mainCentreID: "",
  });

  const theadMappingTable = [
    { width: "1%", name: t("Sr No") },
    { width: "5%", name: t("Branch Centre") },
    { width: "5%", name: t("Main Centre") },
    { width: "5%", name: t("Entry By") },
    { width: "5%", name: t("Entry Date") },
    { width: "1%", name: t("Action") },
  ];

  // const handleBindBranchCentre = async () => {
  //   let apiResp = await FinanceBindCentre();
  //   if (apiResp?.success) {
  //     setDropDownState((val) => ({
  //       ...val,
  //       BindBranchCentre: handleReactSelectDropDownOptions(
  //         apiResp?.data,
  //         "CentreName",
  //         "CentreID",
  //       ),
  //     }));
  //   } else {
  //     console.log("Some error occurred");
  //   }
  // };

     const getPatientType = async() => {
        // debugger
        const resp = await BindCentreWorkOrder({ centreID: 0, rateTypeID: 0 })
        setCentres(resp?.message || []);
  };

  const handleBindMainCentre = async () => {
    let apiResp = await BindMainCenter();
    if (apiResp?.success) {
      setDropDownState((val) => ({
        ...val,
        BindMainCentre: handleReactSelectDropDownOptions(
          apiResp?.data,
          "Centre",
          "MainCentreID",
        ),
      }));
    } else {
      console.log("Some error occurred");
    }
  };

  const handleBindMappingDetails = async () => {
    let apiResp = await BindMappingDetails();
    if (apiResp?.success) {
      setTableData(apiResp?.data || []);
    } else {
      setTableData([]);
    }
  };

  const handleReactChange = (name, e) => {
    if (name === "branchCentre") {
      setValues((val) => ({
        ...val,
        [name]: e,
        mainCentre: val?.isMainCentre ? e : val?.mainCentre,
      }));
    } else {
      setValues((val) => ({ ...val, [name]: e }));
    }
  };

  const handleCheckboxChange = (name, checked) => {
    setValues((val) => ({
      ...val,
      [name]: checked,
      mainCentre: checked ? val?.branchCentre : null,
    }));
  };

  const handleSaveMapping = async () => {
    if (!values?.branchCentre?.value || !values?.mainCentre?.value) {
      notify("Please fill in required fields", "error");
      return;
    }

    let payload = {
      branchCentre: String(values?.branchCentre?.value || ""),
      mainCentre: String(values?.mainCentre?.value || ""),
    };

    try {
      const apiResp = await SaveMapping(payload);
      if (apiResp?.success) {
        notify(apiResp?.message, "success");
        setValues({
          branchCentre: null,
          mainCentre: null,
          isMainCentre: false,
        });
        handleBindMappingDetails();
        handleBindMainCentre();
      } else {
        notify(apiResp?.message, "error");
      }
    } catch (error) {
      notify("An error occurred while saving mapping", "error");
    }
  };

  const handleRemoveMapping = async () => {
    let payload = {
      mapID: String(deleteData?.mapID || ""),
      branchCentreID: String(deleteData?.branchCentreID || ""),
      mainCentreID: String(deleteData?.mainCentreID || ""),
    };
    const apiResp = await RemoveMapping(payload);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      handleBindMappingDetails();
      handleBindMainCentre();
      return true;
    } else {
      notify(apiResp?.message, "error");
      return false;
    }
  };

  useEffect(() => {
    // handleBindBranchCentre();
    getPatientType();
    handleBindMainCentre();
    handleBindMappingDetails();
  }, []);

  return (
    <>
      <div className="mt-2 spatient_registration_card">
        <div className="card">
          <div className="patient_registration ">
            <Heading
              name={t("Map Main Centre To Branch")}
              isBreadcrumb={true}
            />
            <div className="row p-2">
              <ReactSelect
                placeholderName={t("Branch Centre")}
                searchable={true}
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                id={"branchCentre"}
                name={"branchCentre"}
                removeIsClearable={true}
                onChange={(name, e) => handleReactChange(name, e)}
                dynamicOptions={centres}
                value={values?.branchCentre?.value}
                className={`required-fields`}
              />
              <Checkbox
                id="isMainCentre"
                name="isMainCentre"
                label={t("Is Main Centre")}
                checked={values?.isMainCentre}
                onChange={handleCheckboxChange}
                respClass="col-xl-2 col-md-3 col-sm-4 col-12"
              />
              <ReactSelect
                placeholderName={t("Main Centre")}
                searchable={true}
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                id={"mainCentre"}
                name={"mainCentre"}
                removeIsClearable={true}
                onChange={(name, e) => handleReactChange(name, e)}
                dynamicOptions={dropDownState?.BindMainCentre}
                value={values?.mainCentre?.value}
                isDisabled={values?.isMainCentre}
                className={`required-fields`}
              />
              <div className="col-xl-2 col-md-3 col-sm-4 col-12">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveMapping}
                >
                  {t("Save Mapping")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 patient_registration card">
          <Heading title={t("Mapping Detail")} />
          {tableData.length > 0 && (
            <div className="">
              <HisTable
                thead={theadMappingTable}
                tbody={tableData?.map((val, index) => ({
                  SrNo: index + 1,
                  BranchCentre: val?.BranchCentre,
                  MainCentre: val?.MainCentre,
                  EntryBy: val?.EntryBy,
                  EntryDate: moment(
                    val?.EntryDateTime,
                    "DD-MMM-YYYY hh:mm:ss A",
                  ).format("DD/MMM/YYYY"),
                  Action: (
                    <span
                      onClick={() =>
                        setDeleteData({
                          isOpen: true,
                          mapID: val?.Mapid,
                          branchCentreID: val?.CentreID,
                          mainCentreID: val?.MainCentreID,
                        })
                      }
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      <FaTrash />
                    </span>
                  ),
                }))}
                scrollView={"scrollView"}
                isSearch={true}
                style={{ maxHeight: "50vh" }}
              />
            </div>
          )}
        </div>
      </div>
      <CustomModalAlert
        isOpen={deleteData?.isOpen}
        setIsOpen={(isOpen) => setDeleteData((val) => ({ ...val, isOpen }))}
        handleActionItem={handleRemoveMapping}
      />
    </>
  );
};

export default MapMainCentreToBranch;