import React, { useEffect, useMemo, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import { getEmployeeCenter } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import { AddBlankData, number } from "../../utils/helpers";
import { SelectBox } from "../../components/formComponent/SelectBox";
import {
  EmailType,
  MailStatuses,
  PatientType,
  Record,
  Roles,
} from "../../utils/Constants";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import moment from "moment";
import { toast } from "react-toastify";
import { isChecked } from "../util/Commonservices";
import Pagination from "../../Pagination/Pagination";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";

const STATUS_BUTTON = [
  {
    value: "2",
    label: "Approved",
    color: "#90EE90",
  },
  {
    value: "0",
    label: "Mail Request",
    color: "#FFC0CB",
  },
  {
    value: "1",
    label: "Mail Sent",
    color: "#3399FF",
  },
  {
    value: "-1",
    label: "Failed",
    color: "#E2680A",
  },
];

const MailStatus = () => {
  const { t } = useTranslation();
  const [department, setDepartment] = useState([]);
  const [doctorData, setDoctorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [centreData, setCentreData] = useState([]);
  const [rateTypes, setRateTypes] = useState([]);
  const [SearchData, setSearchData] = useState([]);
  const [errors, setErrors] = useState({});
  const [payload, setPayload] = useState({
    FromLabNo: "",
    ToLabNo: "",
    LabNo: "",
    PName: "",
    CentreID: "",
    PanelID: "",
    dtFrom: new Date(),
    dtTo: new Date(),
    Dept: "",
    Mobile: "",
    PhoneNo: "",
    RegNo: "",
    refrdby: "1",
    Ptype: "0",
    Client: "",
    Status: "2",
    type: "1",
    mailst: "2",
    mailstLabel: "Patient",
    PrintHeader: "",
    CardNoFrom: "",
    CardNoTo: "",
    PatientMailID: "",
    CCMailID: "",
    isChecked: "",
  });
  console.log(payload);
  const [PageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTableData, setCurrentTableData] = useState([]);
  useEffect(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    const data = SearchData?.map((ele) => {
      return {
        ...ele,
        isChecked: 0,
      };
    });
    setCurrentTableData(data.slice(firstPageIndex, lastPageIndex));
    setErrors({});
  }, [currentPage, SearchData, PageSize]);

  console.log(currentTableData);

  const handleChange = (e, index) => {
    const { name, value } = e.target;

    const validateEmail = (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    };

    if (name === "PatientMailID" || name === "CCMailID") {
      const updatedData = currentTableData.map((item, i) => {
        if (
          i === index ||
          item.LedgerTransactionNo ===
            currentTableData[index]?.LedgerTransactionNo
        ) {
          return { ...item, [name]: value };
        }
        return item;
      });

      setCurrentTableData(updatedData);
    } else {
      setPayload({
        ...payload,
        [name]: value,
      });
    }
  };

  console.log(currentTableData);

  function handleEmailCheck(dataArray) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const index = dataArray?.map((ele) => {
      return {
        Index: ele?.Index,
      };
    });

    console.log(index);

    const updatedTableData = currentTableData.map((item1) => {
      const match = index.find((item2) => item2.Index == item1.Index);
      const emailKey = handleNameReturn(item1?.mailst);
      const emailValue = item1[emailKey];
      const ccEmailValue = item1.CCMailID;

      return {
        ...item1,
        IsError:
          !!match &&
          (!emailValue ||
            !emailRegex.test(emailValue) ||
            !emailRegex.test(ccEmailValue)),
      };
    });

    setCurrentTableData(updatedTableData);

    return dataArray.some((item) => {
      const emailKey = handleNameReturn(item?.mailst);
      const emailValue = item[emailKey];
      const ccEmailValue = item.CCMailID;
      return (
        !emailValue ||
        !emailRegex.test(emailValue) ||
        !emailRegex.test(ccEmailValue)
      );
    });
  }

  const handleSearchSelectChange = (label, value) => {
    if (label === "mailst") {
      setPayload({
        ...payload,
        mailst: value?.value,
        mailstLabel: value?.label,
      });
    } else {
      setPayload({
        ...payload,
        [label]: value?.value,
      });
    }
  };

  const handleSearchMultiSelectChange = (name, value) => {
    // const val = select.map((ele) => {
    //   return ele?.value;
    // });
    setPayload({ ...payload, [name]: value, PanelID: "" });
    fetchRateTypes(val);
  };

  const handleCheckChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };
  const handleNameReturn = (type) => {
    if (type == "2") {
      return "PatientMailID";
    } else if (type == "1") {
      return "PanelMailID";
    } else {
      return "DoctorEmailId";
    }
  };
  const handleSearch = (type) => {
    let searchType = type;
    setLoading(true);
    axiosInstance
      .post("MailStatus/SearchMail", {
        FromLabNo: payload?.FromLabNo,
        ToLabNo: payload?.ToLabNo,
        LabNo: payload?.LabNo,
        PName: payload?.PName,
        CentreID: Array.isArray(payload?.CentreID) ? payload?.CentreID : [],
        PanelID: (payload?.PanelID).toString(),
        dtFrom: moment(payload?.dtFrom).format("DD-MMM-YYYY"),
        dtTo: moment(payload?.dtTo).format("DD-MMM-YYYY"),
        Dept: payload?.Dept?.toString(),
        Mobile: payload?.Mobile,
        PhoneNo: payload?.PhoneNo,
        RegNo: payload?.RegNo,
        refrdby: payload?.refrdby,
        Ptype: payload?.Ptype,
        Client: payload?.Client,
        Status: searchType,
        type: payload?.type,
        mailst: payload?.mailst,
        PrintHeader: payload?.PrintHeader,
        CardNoFrom: payload?.CardNoFrom,
        CardNoTo: payload?.CardNoTo,
      })
      .then((res) => {
        setLoading(false);
        if (res?.data.success) {
          const data = res?.data?.message;
          const tabledata = data?.map((ele, index) => {
            return {
              ...ele,
              isChecked: 0,
              IsError: false,
              Index: index,
            };
          });
          setSearchData(tabledata);
        } else {
          toast.error("No Record Found");
          setSearchData([]);
        }
        setErrors({});
      })
      .catch((err) => {
        setLoading(false);
        setSearchData([]);
        toast.error(err?.response?.data?.message);
      });
  };
  console.log(errors);
  const handleSendMail = () => {
    const filteredData = currentTableData?.filter((ele) => ele?.isChecked);
    console.log(filteredData);
    if (filteredData?.length > 0) {
      if (handleEmailCheck(filteredData)) {
        toast.error("Please Enter Valid Mail Id's in selected rows");
      } else {
        const AutoEmailData = filteredData?.map((ele) => {
          return {
            PName: ele?.FirstName,
            Transaction_ID: "0",
            LedgerTransactionNo: ele?.LedgerTransactionNo,
            TestID: ele?.TestID?.toString(),
            TestName: ele?.TestName,
            EmailId: ele[handleNameReturn(ele?.mailst)],
            CCMailID: ele?.CCMailID,
            PHead: payload?.PrintHeader ? 1 : 0,
            mailstLabel: payload?.mailstLabel,
          };
        });
        console.log(AutoEmailData);
        axiosInstance
          .post("MailStatus/SaveAutoEmailData", {
            AutoEmailData: AutoEmailData,
          })
          .then((res) => {
            if (res?.data?.success) {
              const data = res?.data?.message;
              const updatedTableData = currentTableData.map((item) => {
                if (filteredData.some((ele) => ele === item)) {
                  return { ...item, CCMailID: "" };
                }
                return item;
              });
              setCurrentTableData(updatedTableData);
              toast.success(data);
              handleSearch();
            } else {
              toast.error("Mail not sent");
            }
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message);
          });
      }
    } else {
      const updatedTableData = currentTableData.map((item1) => {
        return {
          ...item1,
          IsError: false,
        };
      });
      setCurrentTableData(updatedTableData);
      toast.error("Please Select Any Row");
    }
  };

  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const getDepartments = () => {
    axiosInstance
      .get("Department/getDepartmentEmployeeMaster")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.DepartmentID,
            label: ele?.Department,
          };
        });
        val.unshift({ label: "Select", value: "" });
        setDepartment(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getDoctorSuggestion = () => {
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
        setDoctorData([{ label: "Self", value: "1" }, ...val]);
      })
      .catch((err) => console.log(err));
  };
  const handleCheckbox = (e) => {
    const { checked } = e.target;
    const data = currentTableData?.map((ele) => {
      return {
        ...ele,
        isChecked: checked ? 1 : 0,
      };
    });

    setCurrentTableData(data);
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
      list.unshift({ label: "Select", value: "" });
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
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

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  const handleCheckChanges = (e, index) => {
    const { name, checked } = e.target;
    const datas = [...currentTableData];
    datas[index][name] = checked ? 1 : 0;
    setCurrentTableData(datas);
  };

  useEffect(() => {
    getAccessCentres();
    getDepartments();
    getDoctorSuggestion();
  }, []);

  return (
    <>
      <Accordion
        name={t("Mail Status")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <Input
              lable={t("From Lab No")}
              name="FromLabNo"
              id="FromLabNo"
              type="text"
              placeholder=""
              max={50}
              value={payload?.FromLabNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              lable={t("To Lab No")}
              name="ToLabNo"
              id="ToLabNo"
              type="text"
              placeholder=""
              max={50}
              value={payload?.ToLabNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              lable={t("Lab No")}
              name="LabNo"
              id="LabNo"
              type="text"
              placeholder=""
              max={50}
              value={payload?.LabNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              lable={t("Patient Name")}
              name="PName"
              id="PName"
              type="text"
              placeholder=""
              max={50}
              value={payload?.PName}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <MultiSelectComp
              name="CentreID"
              id="Center"
              label="Center"
              placeholder=" "
              value={payload?.CentreID}
              options={centreData}
              onChange={handleSearchMultiSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="PanelID"
              id="RateType"
              lable={t("Rate Type")}
              placeholderName={t("Rate Type")}
              value={payload?.PanelID}
              dynamicOptions={rateTypes}
              removeIsClearable={true}
              onChange={handleSearchSelectChange}
            />
          </div>
        </div>
        <div className="row pl-2 pr-2">
          <div className="col-sm-2">
            <DatePicker
              name="dtFrom"
              id="FromDate"
              lable="From Date"
              className="custom-calendar"
              value={payload?.dtFrom}
              onChange={dateSelect}
              maxDate={new Date(payload?.dtTo)}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              name="dtTo"
              id="ToDate"
              lable="To Date"
              className="custom-calendar"
              value={payload?.dtTo}
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={new Date(payload?.dtFrom)}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="Dept"
              id="Department"
              lable="Department"
              placeholderName={t("Department")}
              value={payload?.Dept}
              dynamicOptions={department}
              removeIsClearable={true}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              lable={t("Mobile No")}
              name="Mobile"
              id="MobileNo"
              type="number"
              placeholder=""
              value={payload?.Mobile}
              onChange={handleChange}
              onInput={(e) => number(e, 10)}
            />
          </div>
          <div className="col-sm-2">
            <Input
              lable={t("Phone No")}
              name="PhoneNo"
              id="PhoneNo"
              type="number"
              placeholder=""
              value={payload?.PhoneNo}
              onChange={handleChange}
              onInput={(e) => number(e, 10)}
            />
          </div>
          <div className="col-sm-2">
            <Input
              lable={t("UHID No")}
              name="RegNo"
              id="UHIDNo"
              type="text"
              placeholder=""
              max={50}
              value={payload?.RegNo}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="row pl-2 pr-2">
          <div className="col-sm-2">
            <ReactSelect
              name="refrdby"
              id="ReferBy"
              lable="Refer By"
              placeholderName={t("Refer By")}
              removeIsClearable={true}
              value={payload?.refrdby}
              dynamicOptions={doctorData}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="Ptype"
              id="PatientType"
              lable="Patient Type"
              placeholderName={t("Patient Type")}
              removeIsClearable={true}
              value={payload?.Ptype}
              dynamicOptions={PatientType}
              onChange={handleSearchSelectChange}
            />
          </div>
          {/* <div className="col-sm-2">
            <ReactSelect
              name="Client"
              id="Client"
              lable="Client"
              placeholderName={t("Client")}
              removeIsClearable={true}
              value={payload?.Client}
              dynamicOptions={doctorData}
              onChange={handleSearchSelectChange}
            />
          </div> */}
          <div className="col-sm-2">
            <ReactSelect
              name="Status"
              id="Status"
              lable="Status"
              placeholderName={t("Status")}
              removeIsClearable={true}
              dynamicOptions={MailStatuses}
              value={payload?.Status}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="type"
              id="EmailType"
              lable="Email Type"
              placeholderName={t("Email Type")}
              removeIsClearable={true}
              dynamicOptions={EmailType}
              value={payload?.type}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="mailst"
              id="Roles"
              lable="Roles"
              placeholderName={t("Roles")}
              removeIsClearable={true}
              dynamicOptions={Roles}
              value={payload?.mailst}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="PrintHeader"
                id="PrintHeader"
                value="PrintHeader"
                checked={payload?.PrintHeader == 0 ? false : true}
                onChange={(e) => handleCheckChange(e)}
              />
            </div>
            <label className="control-label ml-2" htmlFor="PrintHeader">
              {t("Print Header")}
            </label>
          </div>
        </div>
        <div
          className="row pl-2 pr-2 mb-2"
          //   style={{
          //     display: "flex",
          //     justifyContent: "center",
          //     alignContent: "center",
          //   }}
        >
          <div className="col-sm-1">
            <button
              className="btn btn-block btn-success btn-sm"
              type="button"
              onClick={() => handleSearch(payload?.Status)}
            >
              {t("Search")}
            </button>
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-block btn-success btn-sm"
              type="button"
              onClick={handleSendMail}
            >
              {t("Send Mail")}
            </button>
          </div>
          {STATUS_BUTTON.map((ele, index) => (
            <div key={index} className="col-sm-1 mt-1 d-flex">
              <button
                className="statusConfirmed"
                style={{
                  backgroundColor: ele?.color,
                }}
                id={ele?.label}
                onClick={() => handleSearch(ele?.value)}
              ></button>
              <label
                className="mt-1 ml-1"
                htmlFor={ele?.label}
                style={{
                  color: "black",
                }}
              >
                {ele?.label}
              </label>
            </div>
          ))}
        </div>
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <Accordion title={t("Search Data")} defaultValue={true}>
          <div className="row px-2 mt-2 mb-2">
            <div className="col-12">
              {loading ? (
                <Loading />
              ) : currentTableData?.length > 0 ? (
                <>
                  <Tables>
                    <thead>
                      <tr>
                        <th>{t("S.No.")}</th>
                        <th>{t("UHID")}</th>
                        <th>{t("Visit No.")}</th>
                        <th>{t("Center")}</th>
                        <th>{t("Rate Type")}</th>
                        <th>{t("Patient Name")}</th>
                        <th>{t("Age/Sex")}</th>
                        <th>{t("Investigation")}</th>
                        <th>{t("Doctor")}</th>
                        <th>
                          {[handleNameReturn(currentTableData[0]?.mailst)] ||
                            "Email"}
                        </th>
                        <th>{t("CC")}</th>
                        <th>{t("Date")}</th>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              currentTableData.length > 0
                                ? isChecked(
                                    "isChecked",
                                    currentTableData,
                                    "1",
                                  ).includes(false)
                                  ? false
                                  : true
                                : false
                            }
                            onChange={handleCheckbox}
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData?.map((ele, index) => (
                        <tr
                          key={index}
                          style={{
                            cursor: "pointer",
                            background: ele?.rowColor,
                          }}
                        >
                          <td>{index + 1}</td>
                          <td>{ele?.PatientCode}</td>
                          <td>{ele?.LedgerTransactionNo}</td>
                          <td>{ele?.Centre}</td>
                          <td>{ele?.PanelName}</td>
                          <td>{ele?.FirstName}</td>
                          <td>{ele?.age}</td>
                          <td>{ele?.TestName}</td>
                          <td>{ele?.Doctor}</td>
                          <td style={{ width: "450px" }}>
                            <Input
                              type="text"
                              name={handleNameReturn(ele?.mailst)}
                              disabled={!ele?.isChecked}
                              className={ele?.IsError ? "required-fields" : ""}
                              placeholder=""
                              value={ele[handleNameReturn(ele?.mailst)]}
                              onChange={(e) => handleChange(e, index)}
                            />
                          </td>
                          <td style={{ width: "450px" }}>
                            <Input
                              type="text"
                              name="CCMailID"
                              disabled={!ele?.isChecked}
                              className={ele?.IsError ? "required-fields" : ""}
                              placeholder=""
                              value={ele?.CCMailID}
                              onChange={(e) => handleChange(e, index)}
                            />
                          </td>
                          <td>{ele?.InDate}</td>
                          <td>
                            <div className="mt-1">
                              <input
                                type="checkbox"
                                name="isChecked"
                                id="isChecked"
                                checked={ele?.isChecked == 0 ? false : true}
                                onChange={(e) => handleCheckChanges(e, index)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </>
              ) : (
                <>
                  <NoRecordFound />
                </>
              )}
            </div>
          </div>

          {currentTableData?.length > 0 && (
            <div className="d-flex justify-content-end">
              <label className="mt-4 mx-2">No Of Record/Page</label>
              <SelectBox
                className="mt-3 p-1 RecordSize mr-2"
                options={Record}
                selectedValue={PageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              />{" "}
              <Pagination
                className="pagination-bar mb-2"
                currentPage={currentPage}
                totalCount={SearchData?.length}
                pageSize={PageSize}
                onPageChange={(page) => setCurrentPage(page)}
              />{" "}
            </div>
          )}
        </Accordion>
      )}
    </>
  );
};

export default MailStatus;
