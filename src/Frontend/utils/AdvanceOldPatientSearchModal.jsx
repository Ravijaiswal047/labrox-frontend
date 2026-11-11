import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import { dateConfig, Time } from "../../utils/helpers";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Tables from "../../components/UI/customTable";
import Pagination from "../../Pagination/Pagination";
import { Record } from "../../utils/Constants";
import { axiosInstance } from "../../utils/axiosInstance";
import { SelectBox } from "../../components/formComponent/SelectBox";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import Accordion from "../../components/UI/Accordion";
import { CustomButton } from "../../components/UI/CustomButton";
import './AdvanceOldPatientSearchModal.css';
const AdvanceOldPatientSearchModal = ({ show, setShow, handleSelctData, centreID = "", handleCreateNewPatient = () => { }, handleResetCreateNewPatient = () => { }, onMobileChange = () => { } }) => {
  const today = new Date();
  const [payload, setPayload] = useState({
    Mobile: "",
    UHID: "",
    Name: "",
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
  });

  const { t } = useTranslation();
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const [tableData, setTableData] = useState([]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
    if (name === "Mobile") {
      onMobileChange(value);
    }
  };
  const [load, setLoad] = useState(false);
  const [PageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [CentreData, setCentreData] = useState([]);
  const [showNewPatientBtn, setShowNewPatientBtn] = useState(false);
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return tableData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, tableData, PageSize]);

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const handleSearch = () => {
    setLoad(true);
    axiosInstance
      .post("Booking/getPatientDetails", {
        Mobile: payload?.Mobile?.trim(),
        PatientCode: payload?.UHID?.trim(),
        Name: payload?.Name?.trim(),
        FromDate: moment(payload.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(payload.ToDate).format("DD/MMM/YYYY"),
        FromTime: payload.FromTime,
        ToTime: payload.ToTime,
        CentreID: centreID?.toString(),
      })
      .then((res) => {
        if (Array.isArray(res.data.message)) {
          setTableData(res.data.message);
        } else {
          setTableData([]);
          setShowNewPatientBtn(true);
        }
      })
      .catch((err) => {
        setTableData([]);
        setShowNewPatientBtn(true);
        toast.error(err?.response?.data?.message);
      })
      .finally(() => setLoad(false));
  };
  const handleTime = (time, name) => {
    setPayload({ ...payload, [name]: time });
  };
  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setPayload({
        ...payload,
        ["CentreID"]: value?.value,
      });
    }
  };
  const getAccessCentres = (state) => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        CentreDataValue.unshift({ label: t("None"), value: "" });
        state(CentreDataValue);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          window.sessionStorage.clear();
          window.location.href = "/login";
        }
      });
  };

  const handleReset = () => {
    setShow(true);
    setPayload({
      Mobile: "",
      UHID: "",
      Name: "",
      FromDate: new Date(),
      ToDate: new Date(),
      CentreID: "",
      FromTime: "00:00:00",
      ToTime: "23:59:59",
    })
    setTableData([]);
    setShowNewPatientBtn(false);
    handleResetCreateNewPatient();
    //  handleCreateNewPatient({ toggleDefault: false });
  }

  const handleNewPatient = () => {
    const mobile = payload?.Mobile;
    setShow(false);
    setPayload({
      Mobile: "",
      UHID: "",
      Name: "",
      FromDate: new Date(),
      ToDate: new Date(),
      CentreID: "",
      FromTime: "00:00:00",
      ToTime: "23:59:59",
    })
    setTableData([]);
    setShowNewPatientBtn(false);
    handleCreateNewPatient(mobile);
  }

  useEffect(() => {
    getAccessCentres(setCentreData);
  }, []);
  console.log("show", show);
  return (
    <>
      {/* <Dialog
        header={t("Old Patient Search")}
        visible={show}
        className={theme}
        onHide={() => setShow(false)}
        style={{
          width: isMobile ? "80vw" : "75vw",
        }}
      > */}
      <div className="row px-2">
        {/* <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={CentreData}
              name="CentreID"
              lable="Centre"
              id="Centre"
              removeIsClearable={true}
              placeholderName="Centre"
              value={payload?.CentreID}
              onChange={handleSearchSelectChange}
            />
          </div> */}
        <div className="uhid-width mx-2">
          <Input
            type="text"
            lable="Mobile"
            id="Mobile"
            name="Mobile"
            value={payload.Mobile}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder=" "
            maxLength={10}
            className=""
          />
        </div>
        <div className="uhid-width mx-2">
          <Input
            type="text"
            lable="UHID"
            id="UHID"
            name="UHID"
            value={payload.UHID}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder=" "

          />
        </div>
        <div className="input-patient mx-2">
          <Input
            type="text"
            lable="Patient Name"
            id="Name"
            name="Name"
            value={payload.Name}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder=" "
          />
        </div>
        <div className="col-md-2 col-xl-2 col-lg-1">
          <DatePicker
            className="custom-calendar"
            name="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            placeholder=" "
            id="FromDate"
            lable="FromDate"
            maxDate={new Date(payload?.ToDate)}
          />
        </div>
        <div className="col-md-2 col-lg-1">
          <CustomTimePicker
            name="FromTime"
            placeholder="FromTime"
            value={payload?.FromTime}
            id="FromTime"
            lable="FromTime"
            onChange={handleTime}
          />
        </div>
        <div className="col-md-2 col-xl-2 col-lg-1">
          <DatePicker
            className="custom-calendar"
            name="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            placeholder=" "
            id="ToDate"
            lable="ToDate"
            maxDate={new Date()}
            minDate={new Date(payload?.FromDate)}
          />
        </div>
        <div className="col-md-2 col-lg-1">
          <CustomTimePicker
            name="ToTime"
            placeholder="ToTime"
            value={payload?.ToTime}
            id="ToTime"
            lable="ToTime"
            onChange={handleTime}
          // className=""
          />
        </div>
        <CustomButton text="Search" icon="search" onClick={handleSearch} className="mx-2" />
        <CustomButton text="Reset" icon="refresh" onClick={handleReset} className="mx-2" />
      </div>
      {/* <div className="row mb-2 px-2">
          
          
          <div className="col-md-1">
            <button
              type="button"
              value={"Search"}
              id="btnSearch"
              className="btn btn-block btn-success btn-sm"
              onClick={handleSearch}
            >
              {t("Search")}
            </button> 
            
          </div>
          
        </div> */}

      {load ? (
        <Loading />
      ) : (currentTableData?.length > 0 && show) ? (

        <Accordion title={t("Old Patients")} defaultValue={true}>
          <div
            style={{
              maxHeight: "310px",
              overflowY: "auto",
              padding: "0px 2px",
            }}
          >
            {" "}
            {/* {currentTableData?.length > 0 && show && */}
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("Select")}</th>
                  <th>{t("UHID")}</th>
                  <th>{t("Patient Name")}</th>
                  <th>{t("Age")}</th>
                  <th>{t("DOB")}</th>
                  <th>{t("Gender")}</th>
                  <th>{t("Mobile")}</th>
                  <th>{t("City")}</th>
                  <th>{t("State")}</th>
                </tr>
              </thead>
              <tbody>
                {currentTableData.map((data, index) => (
                  <tr key={index}>
                    <td data-title={t("Select")}>
                      {/* <button
                        className="btn btn-info  btn-sm d-flex"
                        onClick={() => handleSelctData(data)}
                      >
                        {t("Select")}&nbsp;
                      </button> */}
                      <i class="fa fa-pen-to-square my-1"
                        onClick={() => {
                          handleSelctData(data);
                          setTableData([]);
                        }
                        }
                        style={{ color: "#0087ff" }}></i>

                    </td>
                    <td data-title={t("UHID")}>{data?.PatientCode}&nbsp;</td>
                    <td data-title={t("Patient Name")}>
                      {data?.Title +
                        " " +
                        data?.FirstName +
                        " " +
                        data?.MiddleName +
                        " " +
                        data?.LastName}
                      &nbsp;
                    </td>
                    <td data-title={t("Age")}>{data?.Age}&nbsp;</td>
                    <td data-title={t("DOB")}>{dateConfig(data?.DOB)}&nbsp;</td>
                    <td data-title={t("Gender")}>{data?.Gender}&nbsp;</td>
                    <td data-title={t("Mobile")}>{data?.Mobile}&nbsp;</td>
                    <td data-title={t("City")}>{data?.City}&nbsp;</td>
                    <td data-title={t("State")}>{data?.State}&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
            {/* } */}

            <CustomButton text="Create New" icon="add" className="rounded-15 mb-2 mt-1" onClick={handleNewPatient} />
          </div>
        </Accordion>

      ) : (null)}


      {/* {(showNewPatientBtn && tableData?.length == 0) &&
        <Accordion title={t("Search Details")} defaultValue={true}>
          <CustomButton text="Create New" icon="add" className="rounded-15 mb-2 mt-1" onClick={handleNewPatient} />
        </Accordion>
      } */}

      {currentTableData?.length > 0 && show && (
        <div className="d-flex justify-content-end">
          <label className="mt-4 mx-2">{t("No Of Record/Page")}</label>
          <SelectBox
            className="mt-3 p-1 RecordSize mr-2"
            options={Record}
            selectedValue={PageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          />{" "}
          <Pagination
            className="pagination-bar mb-2"
            currentPage={currentPage}
            totalCount={tableData?.length}
            pageSize={PageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />{" "}
        </div>
      )}
      {/* </Dialog> */}
    </>
  );
};

export default AdvanceOldPatientSearchModal;
