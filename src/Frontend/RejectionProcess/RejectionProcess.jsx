import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BindEmployeeReports,
  getCollectionBoy,
} from "../../utils/NetworkApi/commonApi";
import { DateTypeSearch2 } from "../../utils/Constants";
import { axiosInstance } from "../../utils/axiosInstance";
import { AddBlankData } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Heading from "../../components/UI/Heading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import { SelectBox } from "../../components/formComponent/SelectBox";

const RejectionProcess = () => {
  const [t] = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [user, SetUser] = useState([]);
  const [collectionBoy, setCollectionBoy] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [proEmployee, setProEmployee] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [selectedAmounts, setSelectedAmounts] = useState([]);

  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    RateTypeID: "",
    DateTypeSearch: "Date",
    FromTime: new Date(new Date().setHours(0, 0, 0, 0)),
    ToTime: new Date(new Date().setHours(23, 59, 59, 999)),
  });

  const [state, setState] = useState({
    ProEmployee: "",
  });

  const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
  const User = localStorage.getItem("User") ? true : false;
  const navigate = useNavigate();

  const totalAmount = selectedAmounts.reduce(
    (sum, val) => sum + Number(val),
    0,
  );

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        let data = res?.data?.message;
        let proData = data?.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.EmployeeName,
          };
        });
        setProEmployee(proData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setFormData({ ...formData, [label]: value?.value, RateTypeID: "" });
      if (value?.value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value));
      } else {
        fetchRateTypes([value?.value]);
      }
    } else {
      setFormData({ ...formData, [label]: value?.value });
    }
  };

  const handleProEmployeeChange = (name, e) => {
    setState((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleReactSelectChange = (name, e) => {
    setCollectionBoy(e?.value);
  };

  const handleSelectChange = (event) => {
    const { name, value } = event?.target;
    setFormData({ ...formData, [name]: value });
  };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (amount, isChecked) => {
    setSelectedAmounts((prev) =>
      isChecked ? [...prev, amount] : prev.filter((a) => a !== amount),
    );
  };

  const filteredData = searchData.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item?.PatientName?.toLowerCase().includes(term) ||
      item?.TestName?.toLowerCase().includes(term) ||
      item?.Mobile?.toString().includes(term)
    );
  });

  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };

  const getAccessCentres = () => {
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
        let allValues = CentreDataValue.map((ele) => ele.value);
        setCentreData(CentreDataValue);
        fetchRateTypes(allValues);
      })
      .catch((err) => console.log(err));
  };

  const fetchRateTypes = async (id) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: id,
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = () => {
    setLoading(true);

    const payload = {
      centreID: formData?.CentreID ? [formData.CentreID] : [],
      rateTypeID: formData?.RateTypeID ? [formData.RateTypeID] : [],
      fromDate: formData?.FromDate
        ? new Date(formData.FromDate).toISOString().split("T")[0]
        : "",
      toDate: formData?.ToDate
        ? new Date(formData.ToDate).toISOString().split("T")[0]
        : "",
      fromTime: formData?.FromTime
        ? new Date(formData.FromTime).toLocaleTimeString("en-US", {
            hour12: false,
          })
        : "",
      toTime: formData?.ToTime
        ? new Date(formData.ToTime).toLocaleTimeString("en-US", {
            hour12: false,
          })
        : "",
      dateTypeSearch: formData?.DateTypeSearch || "Date",
      proEmployeeID: Number(state?.ProEmployee) || 0,
      collectionBoyID: Number(collectionBoy) || 0,
    };

    console.log("Search Payload:", payload);
    if (!formData.CentreID) {
      toast.error("Please select Centre");
      setLoading(false);
      return;
    }

    axiosInstance
      .post("Dispatch/RejectionPRocessSearch", payload)
      .then((res) => {
        setLoading(false);
        if (res?.data?.success) {
          setSearchData(res?.data?.message || []);
          toast.success(res?.data?.message || "Search completed successfully");
        } else {
          toast.error(res?.data?.message || "No data found");
          setSearchData([]);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Search Error:", err);
        toast.error(
          err?.response?.data?.message ||
            err?.data?.message ||
            "Something went wrong",
        );
        setSearchData([]);
      });
  };

  useEffect(() => {
    getProEmployee();
    getCollectionBoy(setCollectionBoyList, true);
    getAccessCentres();
    BindEmployeeReports(SetUser);
  }, []);

  return (
    <>
      <Accordion title={t("Rejection Process")} defaultValue={"true"}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={AddBlankData(CentreData, "All Centre")}
              name="CentreID"
              lable={t("Centre")}
              id="Centre"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={formData?.CentreID}
              onChange={handleSearchSelectChange}
              isDisabled={User}
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: "All RateType", value: "" },
                ...RateTypes,
              ]}
              name="RateTypeID"
              lable={t("RateType")}
              id="RateType"
              removeIsClearable={true}
              placeholderName={t("RateType")}
              value={formData?.RateTypeID}
              onChange={handleSearchSelectChange}
              isDisabled={User}
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              lable="DateTypeSearch"
              options={DateTypeSearch2}
              selectedValue={formData?.DateTypeSearch}
              name="DateTypeSearch"
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              value={formData?.FromDate}
              onChange={dateSelect}
              placeholder=" "
              id="FromDate"
              lable="FromDate"
              maxDate={new Date(formData?.ToDate)}
              disabled={User}
            />
          </div>
          <div className="col-sm-1">
            <CustomTimePicker
              name="FromTime"
              placeholder="FromTime"
              value={formData?.FromTime}
              id="FromTime"
              lable="FromTime"
              onChange={handleTime}
              disabled={User}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              value={formData?.ToDate}
              onChange={dateSelect}
              placeholder=" "
              id="ToDate"
              lable="ToDate"
              maxDate={new Date()}
              minDate={new Date(formData?.FromDate)}
              disabled={User}
            />
          </div>
          <div className="col-sm-1">
            <CustomTimePicker
              name="ToTime"
              placeholder="ToTime"
              value={formData?.ToTime}
              id="ToTime"
              lable="ToTime"
              onChange={handleTime}
              disabled={User}
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              name="collectionBoy"
              dynamicOptions={[
                { label: t("Select Collection Boy"), value: "" },
                ...collectionBoyList,
              ]}
              placeholderName={t("Collection Boy")}
              value={collectionBoy}
              onChange={handleReactSelectChange}
            />
          </div>

          <div className="col-sm-2 col-6">
            <ReactSelect
              dynamicOptions={[{ label: "Select", value: "" }, ...proEmployee]}
              name={"ProEmployee"}
              id={"ProEmployee"}
              label="ProEmployee"
              value={state?.ProEmployee}
              onChange={handleProEmployeeChange}
              placeholderName={"ProEmployee"}
              respclass={""}
            />
          </div>
          <div className="col-sm-1 col-4">
            <button
              className="btn btn-primary btn-block btn-sm"
              disabled={User || loading}
              onClick={handleSave}
            >
              {loading ? <Loading /> : t("Search")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion
        notOpen={true}
        seconTitle={
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="fw-bold d-flex align-items-center">
              <span>Total Selected Amount:&nbsp;</span>
              <span
                style={{
                  minWidth: "100px",
                  display: "inline-block",
                  textAlign: "left",
                }}
              >
                ₹{totalAmount}
              </span>
            </div>
            {searchData.length > 0 && (
              <div className="mt-2 mt-md-0">
                <input
                  type="text"
                  placeholder="Search by Name, Test or Mobile..."
                  className="form-control form-control-sm"
                  style={{ width: "250px" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
        }
        title={
          <>
            {searchData?.length === 0 ? (
              t("Search Result")
            ) : (
              <div className="d-flex w-75 flex-grow-1 justify-content-between">
                {t("Rejection Process")}

                {/* {searchData.length > 0 && (
                  <div className="d-flex justify-content-end mb-1 mt-1">
                    <input
                      type="text"
                      placeholder="Search by Name, Test or Mobile..."
                      className="form-control form-control-sm"
                      style={{ width: "250px" }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )} */}
              </div>
            )}
          </>
        }
        defaultValue={true}
      >
        {filteredData.length > 0 ? (
          <div className="mt-3">
            <Tables>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Visit No</th>
                  <th>Patient Name</th>
                  <th>Test Name</th>
                  <th>Mobile</th>
                  <th>Centre</th>
                  <th>{t("Rate Type")}</th>
                  <th>Amount</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.VisitNo}</td>
                    <td>{item.PatientName}</td>
                    <td>{item.TestName}</td>
                    <td>{item.Mobile}</td>
                    <td>{item.Centre}</td>
                    <td>{item.RateTypeName}</td>
                    <td>{item.Amount}</td>
                    <td data-title={"Select"} className="text-center">
                      <input
                        type="checkbox"
                        name="IsChecked"
                        onChange={(e) =>
                          handleCheckboxChange(item.Amount, e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        ) : (
          searchData.length > 0 && (
            <p className="text-center text-danger mt-3">
              No matching records found.
            </p>
          )
        )}
      </Accordion>
    </>
  );
};

export default RejectionProcess;
