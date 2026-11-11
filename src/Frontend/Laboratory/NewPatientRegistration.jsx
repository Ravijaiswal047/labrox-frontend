import React, { useEffect, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import Heading from "../../components/UI/Heading";
import Tables from "../../components/UI/customTable";
import FilterInput from "../../components/Filter/FilterInput";
import { useTranslation } from "react-i18next";
import { Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../utils/utils";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { getAccessCentres } from "../../utils/NetworkApi/commonApi";
// import "./NewPatientRegistration.css";

const NewPatientRegistration = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [defaultCentre, setDefaultCentre] = useState("");
  /* -------------------- State -------------------- */
  const initialPayload = {
    CentreID: defaultCentre || "",
    RateID: "",
    VisitTypeID: "Panel",
    Mobile:"",
    ULID:"",
    AppNo:"",
    CardNo:"",
    EmpID:"",
  };
  const [payload, setPayload] = useState(initialPayload);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [masterTable, setMasterTable] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [RateType,setRateType] = useState([]);
  const [VisitTypeID,setVisitTypeID] = useState([]);
  const { CentreVsRateTypeatWorkOrder, AllowAdvanceOldPatientSearchAtWorkOrder } = useLocalStorage("userData", "get");
  

  /* -------------------- Handlers -------------------- */
  const handleSave = () => {
    notify("Patient Registered Successfully", "success");
  };

  const handleReset = () => {
    setPayload(initialPayload);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setTableData(masterTable);
      return;
    }

    const filtered = masterTable.filter((row) =>
      Object.values(row || {}).some((val) =>
        String(val).toLowerCase().includes(value)
      )
    );

    setTableData(filtered);
  };

  const handleSearchSelectChange = (name, e) => {
    const value = e?.value;
    const newPayload = { ...payload, [name]: value };

    if (name === "CentreID") {
      newPayload.VisitTypeID = e?.VisitType || "";
    }

    setPayload(newPayload);

    if (name === "CentreID" || name === "VisitTypeID") {
      getRateTypeWorkOrder(newPayload.CentreID, newPayload.VisitTypeID);
    }
  };

  const getRateTypeWorkOrder = async (cid, ct) => {
      if (CentreVsRateTypeatWorkOrder == 1) {
        return;
      }
      await axiosInstance
        .post(apiUrls.BindRateTypeWorkOrder, {
          centreID: cid || payload?.CentreID || 0,
          rateTypeID: 0,
          AllowEstimate: 0,
          CentreType: (Number(AllowAdvanceOldPatientSearchAtWorkOrder) === 0) ? "" : (ct || payload?.VisitTypeID || ""),
          AllowHomeCollection: 0,
          AllowMembershipCard: 0
        })
        .then((res) => {
          const data = res?.data?.message;
          const val = data.map((ele) => {
            return {
              BusinessUnitID: ele?.BusinessUnitID,
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
            };
          });
          setRateType([...val]);
          if (val?.length == 1) {
            setPayload((prev) => ({ ...prev, RateID: val?.[0]?.value }));
          }
          // if (val?.length > 0 && AddBlankRateTypeWorkOrder == 0) {
          //   setState((prev) => ({ ...prev, RateID: val?.[0]?.value }));
          // }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => { });
    };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    // dummy table structure
    const data = [];
    setMasterTable(data);
    setTableData(data);
    getRateTypeWorkOrder(undefined, "Panel");
    getAccessCentres(
          setCentreData,
        );
  }, []);


  useEffect(()=>{
    if(CentreData?.length > 0){
      const filteredSelectedCentre = CentreData?.filter(
          (ele) => ele?.value == useLocalStorage("DefaultCentre", "get")
        );
      console.log("filteredSelectedCentre",filteredSelectedCentre)
      setDefaultCentre(filteredSelectedCentre[0]?.value);
      setPayload((prev) => ({...prev, CentreID : filteredSelectedCentre[0]?.value, VisitTypeID: "Panel"}));
      getRateTypeWorkOrder(filteredSelectedCentre[0]?.value, "Panel");
    }
  },[CentreData]);

  /* -------------------- Render -------------------- */
  return (
    <>
      {/* ================= Patient Registration ================= */}
      <Accordion
        name={t("New Patient Registration")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">

                  <div
                      className="col-sm-2 col-12 mb-1"
                  >
                      <ReactSelect
                          dynamicOptions={CentreData}
                          name="CentreID"
                          label={t("centre")}
                          id="CentreID"
                          removeIsClearable
                          placeholderName={t("Centre")}
                          value={payload?.CentreID}
                          onChange={(e) => handleSearchSelectChange("CentreID", e)}
                      />

                  </div>
                  <div className="col-sm-2 col-12 mb-1">
                      <ReactSelect
                          dynamicOptions={[
                              ...RateType,
                          ]}
                          name="RateID"
                          label={t("RateType")}
                          id="RateID"
                          removeIsClearable={true}
                          placeholderName={t("RateType")}
                          value={payload?.RateID}
                          onChange={(e) => handleSearchSelectChange("RateID", e)}
                      />
                  </div>
                  <div className="col-sm-2 col-12 mb-1">
                      <ReactSelect
                          name="VisitTypeID"
                          id="VisitTypeID"
                          removeIsClearable={true}
                          dynamicOptions={VisitTypeID}
                          placeholderName={t("VisitTypeID")}
                          label={t("VisitTypeID")}
                          value={payload?.VisitTypeID}
                          onChange={(e) => handleSearchSelectChange("VisitTypeID", e)}
                      />
                  </div>
          
          
        </div>
      </Accordion>

      <Accordion
        title={t("Search Details")}
        defaultValue={true}
      >
        <div className="row p-2">

                  <div
                      className="col-sm-2 col-12 mb-1"
                  >
                      <Input
                          type="text"
                          lable="Mobile"
                          id="Mobile"
                          name="Mobile"
                          value={payload?.Mobile}
                          onChange={handleChange}
                          placeholder=" "
                      />
                  </div>
                  <div className="col-sm-2 col-12 mb-1">
                     <Input
                          type="text"
                          lable="ULID"
                          id="ULID"
                          name="ULID"
                          value={payload?.ULID}
                          onChange={handleChange}
                          placeholder=" "
                      />
                  </div>
                  <div className="col-sm-2 col-12 mb-1">
                      <Input
                          type="text"
                          lable="AppNo"
                          id="AppNo"
                          name="AppNo"
                          value={payload?.AppNo}
                          onChange={handleChange}
                          placeholder=" "
                      />
                  </div>
                  <div className="col-sm-2 col-12 mb-1">
                      <Input
                          type="text"
                          lable="CardNo"
                          id="CardNo"
                          name="CardNo"
                          value={payload?.CardNo}
                          onChange={handleChange}
                          placeholder=" "
                      />
                  </div>
                  <div className="col-sm-2 col-12 mb-1">
                      <Input
                          type="text"
                          lable="EmpID"
                          id="EmpID"
                          name="EmpID"
                          value={payload?.EmpID}
                          onChange={handleChange}
                          placeholder=" "
                      />
                  </div>
                  <div className="col-sm-1">
                    <CustomButton text="Search" />
                      {/* <button
                          type="button"
                          value={"Search"}
                          id="btnSearch"
                          className="btn btn-block btn-success btn-sm"
                          onClick={handleSearch}
                      >
                          {t("Search")}
                      </button> */}
                  </div>
          
          
        </div>
      </Accordion>

      {/* ================= Patient Records ================= */}
      <Heading
        title={t("Patient Records")}
        // secondTitle={
        //   <div className="d-flex justify-content-end p-0">
        //     <FilterInput
        //       value={searchTerm}
        //       onChange={handleChangeSearch}
        //       placeholder={t("Filter Table")}
        //     />
        //   </div>
        // }
      />

      {/* <div className="row p-2">
        <div className="col-12">
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr. No")}</th>
                <th>{t("Patient Name")}</th>
                <th>{t("Patient ID")}</th>
                <th>{t("Created On")}</th>
                <th>{t("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    {t("No Records Found")}
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
        </div>
      </div> */}
    </>
  );
};

export default NewPatientRegistration;
