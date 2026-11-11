import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CampRequestSchema } from "../../utils/Schema";
import Accordion from "@app/components/UI/Accordion";
import CampRejectModal from "../utils/CampRejectModal";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import { Tab } from "react-bootstrap";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { number } from "../../utils/helpers";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";

const searchDataConst = {
  ID: "",
  center: "",
  CampName: "",
  coordinator: "",
  loaction: "",
  coordinatorNo: "",
  coordinatorEmail: "",
  campType: "",
  CampID: "",
  campDate: new Date(),
  IsAllowTinySms: 0,
  IsSendTinySmsBill: 0,
};

const CampRequest = () => {
  const location = useLocation();
  const { state } = location;
  console.log("sTate data", state)
  const [isLoading, setIsLoading] = useState({
    save: false,
    search: false,
    reject: false,
  });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    searchData: searchDataConst,
    TestName: "",
    serchtestby: "TestName",
    pagetype: false,
    SendTinySMSReport: 0,
    SendTinySmsBill: 0,
  });

  console.log("Formd ata payge type hello", formData?.pagetype)
  const [errors, setErros] = useState({});
  const [selectedTest, setSelectedTest] = useState([]);
  const [center, setCenter] = useState([]);
  const [campName, setCampName] = useState([]);
  const [testSearchBy, setTestSearchBy] = useState("TestName");
  const [testSuggestion, setTestSuggestion] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);

  useEffect(() => {
    if (state && state?.ID !== "") {
      getApprovedTest(state?.ID);
      getApproveData(state?.ID);
    }
  }, []);

  const getApproveData = (id) => {
    setIsLoading({ ...isLoading, search: true });
    axiosInstance
      .post("Camp/CheckCampRequest", {
        ID: id,
      })
      .then((res) => {
        setFormData((ele) => ({
          ...ele,
          // pagetype: true,
          searchData: {
            ...res?.data?.message[0]?.searchData,
            ID: id,
            CampID: res?.data?.message[0]?.CampID,
            center: res?.data?.message[0]?.CentreID,
            centername: res?.data?.message[0]?.Centre,
            CampName: res?.data?.message[0]?.CampName,
            coordinator: res?.data?.message[0]?.Contact_Person,
            loaction: res?.data?.message[0]?.Address,
            coordinatorNo: res?.data?.message[0]?.Mobile,
            coordinatorEmail: res?.data?.message[0]?.Email,
            campType: res?.data?.message[0]?.CampTypeID,
            campDate: moment(res?.data?.message[0]?.StartDate).format(
              "DD-MMM-YYYY",
            ),
            IsAllowTinySms: res?.data?.message[0]?.AllowTinySMS,
            IsSendTinySmsBill: res?.data?.message[0]?.IsSendTinySMSBill,
          },
        }));
        setIsLoading({ ...isLoading, search: false });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        resetDate();
        setIsLoading({ ...isLoading, search: false });
        navigate("/CampRequestApproval");
      });
  };
  const getApprovedTest = (id) => {
    setIsLoading({ ...isLoading, search: true });
    axiosInstance
      .post("Camp/GetCampItemDetails", {
        ID: id,
      })
      .then((res) => {
        const data = [...res?.data?.message];
        const updatedData = data.map((ele) => {
          return {
            ...ele,
            InvestigationID: ele?.ItemID,
            ItemId: ele?.ItemID,
            newRate: Number(ele?.RequestedRate).toFixed(2),
            TestCode: ele?.TestCode,
            TestName: ele?.TestName,
            Rate: Number(ele?.Rate).toFixed(2),
            typeoftest: "paid",
          };
        });
        setSelectedTest(updatedData);
        setIsLoading({ ...isLoading, search: false });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        resetDate();
        setIsLoading({ ...isLoading, search: false });
      });
  };
  const resetDate = () => {
    setIndexMatch(0);
    setTestSuggestion([]);
    setTestSearchBy("TestName");
    setSelectedTest([]);
    setFormData((ele) => ({
      searchData: searchDataConst,
      TestName: "",
      serchtestby: "TestName",
    }));
    setErros({});
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
        setCenter(CentreDataValue);
      })
      .catch((err) => {
        console.log(err?.response?.data?.message);
      });
  };

  const getCampMaster = () => {
    axiosInstance
      .get("Camp/bindCampMaster")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.CampName,
          };
        });
        setCampName(CentreDataValue);
      })
      .catch((err) => toast.error(err?.response?.data?.message));
  };

  useEffect(() => {
    getAccessCentres();
    getCampMaster();
  }, []);

  const handleSelectChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name === "CampID") {
      const campnameID = campName.filter((ele) => ele?.value == value)[0].label;

      setFormData((ele) => ({
        ...ele,
        searchData: {
          ...ele?.searchData,
          [name]: value,
          CampName: campnameID,
        },
      }));
    } else if (name === "center") {
      setSelectedTest([]);
      setTestSuggestion([]);
      setFormData((ele) => ({
        ...ele,
        searchData: {
          ...ele?.searchData,
          [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
          campType: "",
        },
      }));
    } else {
      setFormData((ele) => ({
        ...ele,
        searchData: {
          ...ele?.searchData,
          [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        },
      }));
    }
    name === "campType" && getFreeTest(value);
  };

  const getFreeTest = (type) => {
    setIsLoading({ ...isLoading, search: true });
    if (formData?.searchData?.center !== "") {
      if (type === "1") {
        axiosInstance
          .post("Camp/FreeCampDetail", {
            PanelID: formData?.searchData?.center,
          })
          .then((res) => {
            const testData = res?.data?.message;
            const updatedData = testData.map((ele) => {
              return {
                ...ele,
                newRate: 0,
                typeoftest: "free",
                TestCode: ele?.testCode,
                InvestigationID: ele?.ItemID,
              };
            });
            setSelectedTest([...selectedTest].concat(updatedData));
            setIsLoading({ ...isLoading, search: false });
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message);
            setIsLoading({ ...isLoading, search: false });
          });
      } else {
        setSelectedTest([]);
        setIsLoading({ ...isLoading, search: false });
      }
    } else {
      setIsLoading({ ...isLoading, search: false });
      toast.error("Please select Centre");
      setFormData((ele) => ({
        ...ele,
        searchData: {
          ...ele?.searchData,
          campType: "",
        },
      }));
    }
    setIsLoading({ ...isLoading, search: false });
  };

  const dateSelect = (value, name) => {
    const newDate = moment(value).format("DD-MMM-YYYY");

    setFormData((ele) => ({
      ...ele,
      searchData: {
        ...ele?.searchData,
        [name]: newDate,
      },
    }));
  };

  const handleTestRate = (e, ind) => {
    const { name, value } = e.target;
    const updatedData = [...selectedTest];
    const newRate = value <= Number(updatedData[ind].Rate);
    updatedData[ind][name] = newRate ? value : "";
    setSelectedTest(updatedData);
  };

  const handleListSearch = (data, name) => {
    switch (name) {
      case "TestName":
        setIndexMatch(0);
        setTestSuggestion([]);
        setFormData((ele) => ({ ...ele, TestName: "" }));
        const isAvailabletest = selectedTest.find(
          (ele) => ele?.TestCode === data?.TestCode,
        );
        isAvailabletest && toast.error("Test Already Added");
        const updatedTestData = !isAvailabletest
          ? [...selectedTest].concat([data])
          : selectedTest;
        setSelectedTest(updatedTestData);
        break;
      default:
        break;
    }
  };

  const handleIndex = (e) => {
    const { name } = e.target;
    switch (name) {
      case "TestName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(testSuggestion.length - 1);
            }
            break;
          case 40:
            if (testSuggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            if (testSuggestion.length > 0) {
              handleListSearch(testSuggestion[indexMatch], name);
            }
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };

  const getSuggestion = (value) => {
    if (formData?.searchData?.center) {
      if (value.length >= 2) {
        axiosInstance
          .post("TestData/BindBillingTestDataCamp", {
            TestName: value,
            CentreID: formData?.searchData?.center,
            SearchBy: testSearchBy,
          })
          .then((res) => {
            const testData = res?.data?.message;
            const updatedData = testData.map((ele) => {
              return { ...ele, newRate: "", typeoftest: "paid" };
            });
            setTestSuggestion(updatedData);
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message);
          });
      } else {
        setTestSuggestion([]);
      }
    } else {
      toast.error("Please Select Centre");
      setFormData((ele) => ({
        ...ele,
        TestName: "",
      }));
    }
  };

  const handleDeboucing = (fuc) => {
    let timeout;
    return function (value) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        fuc(value);
      }, 400);
    };
  };

  const debouce = handleDeboucing(getSuggestion);

  const handleChange = (event) => {
    const { value } = event.target;
    if (
      formData?.searchData.center === "" ||
      formData?.searchData.campType === ""
    ) {
      toast.error("Please Select Centre and CampType");
    } else {
      debouce(value);
      setFormData((ele) => ({
        ...ele,
        TestName: value,
      }));
    }
  };

  const getIfBlankReqRate = () => {
    let findBlankTest = [];
    if (selectedTest.length > 1) {
      findBlankTest = selectedTest.filter((ele) => ele?.newRate === "");
    }
    return findBlankTest.length === 0;
  };

  const handleSave = () => {
    const errors = CampRequestSchema(formData.searchData);
    console.log(errors);
    if (errors === "") {
      const campRequest = {
        CampName: formData?.searchData?.CampName,
        CampID: formData?.searchData?.CampID,
        CampCoordinator: formData?.searchData?.coordinator,
        CampAddress: formData?.searchData?.loaction,
        ContactNo: formData?.searchData?.coordinatorNo,
        Email: formData?.searchData?.coordinatorEmail,
        Panel_ID: formData?.searchData?.center, //
        CentreID:
          formData?.searchData?.campType == "1"
            ? useLocalStorage.DefaultCentre
            : formData?.searchData?.center, //
        CentreName: "Dummy",
        StartDate: moment(formData?.searchData?.campDate).format("YYYY-MM-DD"),
        EndDate: moment(formData?.searchData?.campDate).format("YYYY-MM-DD"),
        ID: formData?.searchData?.ID ?? "", //
        CampTypeID: formData?.searchData?.campType, //
        CampType:
          formData?.searchData?.campType === "1" ? "Free Camp" : "Paid Camp", //
        AllowTinySMS: formData?.searchData?.IsAllowTinySms,
        IsSendTinySMSBill: formData?.searchData?.IsSendTinySmsBill,
      };
      const payloadtest = selectedTest.map((ele) => {
        return {
          ItemId: ele?.InvestigationID,
          ItemCode: ele?.TestCode,
          ItemName: ele?.TestName,
          Rate: ele?.Rate,
          RequestedRate: Number(ele?.newRate),
        };
      });

      if (selectedTest.length === 0) {
        toast.error("Add test to proceed");
      } else if (!getIfBlankReqRate()) {
        toast.error("Requested Rate can not be blank");
      } else {
        setIsLoading({ ...isLoading, save: true });
        axiosInstance
          .post("Camp/SaveCampRequest", {
            campRequest: campRequest,
            campItemDetail: payloadtest,
          })
          .then((res) => {
            if(res?.status === 200){
              toast.success(res.data.message);
            } else {
              toast.error(res?.data?.message)
            }
            resetDate();
            setErros({});
            setIsLoading({ ...isLoading, save: false });
          })
          .catch((err) => {
            setErros({});
            toast.error(err?.response?.data?.message);
            setIsLoading({ ...isLoading, save: false });
          });
      }
    } else {
      setErros(errors);
    }
  };


  return (
    <>
      <Accordion
        name={t("Camp Request")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              isDisabled={formData?.pagetype}
              lable="Camp Center"
              id="Camp Center"
              name="center"
              onChange={handleSelectChange}
              selectedValue={formData?.searchData?.center}
              options={[{ label: "Select", value: "" }, ...(center ?? [])]}
            />
            {formData?.searchData.center === "" && (
              <span className="error-message">{errors?.Campcenter}</span>
            )}
          </div>
          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              isDisabled={formData?.pagetype}
              lable="Camp Name"
              id="CampName"
              name="CampID"
              onChange={handleSelectChange}
              selectedValue={formData?.searchData?.CampID}
              options={[{ label: "Select", value: "" }, ...(campName ?? [])]}
            />
            {formData?.searchData.CampID === "" && (
              <span className="error-message">{errors?.CampName}</span>
            )}
          </div>
          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              isDisabled={formData?.pagetype}
              lable="Camp Type"
              id="CampType"
              name="campType"
              onChange={handleSelectChange}
              selectedValue={formData?.searchData?.campType}
              options={[
                { label: "Select", value: "" },
                { label: "Free Camp", value: "1" },
                { label: "Paid Camp", value: "2" },
                ...([] ?? []),
              ]}
            />
            {formData?.searchData.campType === "" && (
              <span className="error-message">{errors?.Camptype}</span>
            )}
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="Camp Date"
              lable="Camp Date"
              name="campDate"
              value={new Date(formData?.searchData?.campDate)}
              onChange={dateSelect}
              minDate={new Date()}
            />
          </div>
          <div className="col-sm-2">
            <Input
              value={formData?.searchData?.coordinator}
              placeholder=" "
              lable="Camp Coordinator"
              id="Camp Coordinator"
              onChange={handleSelectChange}
              name="coordinator"
              max={"30"}
              type="text"
            />
          </div>
          <div className="col-sm-2">
            <Input
              placeholder=" "
              lable="Camp Coordinator Number"
              id="Camp Coordinator Number"
              onChange={handleSelectChange}
              name="coordinatorNo"
              type="number"
              onInput={(e) => number(e, 10)}
              max={"40"}
              value={formData?.searchData?.coordinatorNo}
            />
          </div>
          <div className="col-sm-2">
            <Input
              placeholder=" "
              lable="Camp Coordinator Email"
              id="Camp Coordinator Email"
              onChange={handleSelectChange}
              name="coordinatorEmail"
              type="email"
              // onInput={(e) => number(e, 10)}
              value={formData?.searchData?.coordinatorEmail}
            />
          </div>
          <div className="col-sm-2">
            <Input
              placeholder=" "
              lable="Camp Location Address"
              id="Camp Location Address"
              onChange={handleSelectChange}
              name="loaction"
              max={"40"}
              type={"text"}
              value={formData?.searchData?.loaction}
            />
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsAllowTinySms"
                checked={
                  formData?.searchData?.IsAllowTinySms === 0 ? false : true
                }
                onChange={handleSelectChange}
              />
            </div>
            <label htmlFor="inputEmail3" className="ml-2">
              {t("SendTinySMSReport")}
            </label>
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsSendTinySmsBill"
                checked={
                  formData?.searchData?.IsSendTinySmsBill === 0 ? false : true
                }
                onChange={handleSelectChange}
              />
            </div>
            <label htmlFor="inputEmail3" className="ml-2">
              {t("SendTinySmsBill")}
            </label>
          </div>
        </div>
        <div className="row"></div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-6">
            <div className="row">
              <div className="col-sm-6">
                <Input
                  disabled={formData?.searchData?.campType === "1"}
                  autoComplete="off"
                  lable="Type Test Name or Test Code"
                  name="TestName"
                  id="TestName"
                  placeholder=" "
                  type="text"
                  max={30}
                  value={formData?.TestName}
                  onChange={handleChange}
                  onBlur={() => {
                    setTimeout(() => {
                      setFormData((ele) => ({
                        ...ele,
                        TestName: "",
                      }));
                    }, 500);
                  }}
                  onKeyDown={handleIndex}
                />
                {testSuggestion.length > 0 && (
                  <ul className="suggestion-data" style={{ zIndex: 99 }}>
                    {testSuggestion.map((data, index) => (
                      <li
                        onClick={() => handleListSearch(data, "TestName")}
                        key={index}
                        className={`${index === indexMatch && "matchIndex"}`}
                      >
                        {data.TestName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-sm-3 mt-1 d-flex">
                <div className="mt-1">
                  <input
                    id={"TestName"}
                    type="radio"
                    name="type"
                    value="TestName"
                    checked={testSearchBy == "TestName"}
                    onChange={(e) => setTestSearchBy(e.target.value)}
                  />
                </div>
                &nbsp;
                <span htmlFor="TestName" className="">
                  {t("By Test name")}
                </span>
              </div>
              <div className="col-sm-3 mt-1 d-flex">
                <div className="mt-1">
                  <input
                    id={"TestCode"}
                    type="radio"
                    name="type"
                    value="TestCode"
                    checked={testSearchBy == "TestCode"}
                    onChange={(e) => setTestSearchBy(e.target.value)}
                  />
                </div>
                &nbsp;
                <span htmlFor="TestCode" className="">
                  {t("By Test code")}
                </span>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="row px-2 ">
              <div className="col-12">
                <Tables>
                  <thead className="cf text-center" style={{ zIndex: 99 }}>
                    <tr>
                      <th className="text-center" style={{ width: "20px" }}>
                        #
                      </th>
                      <th className="text-center" style={{ width: "50px" }}>
                        {t("Code")}
                      </th>
                      <th className="text-center">{t("Item")}</th>
                      <th className="text-center" style={{ width: "50px" }}>
                        {t("Rate")}
                      </th>
                      <th className="text-center" style={{ width: "20px" }}>
                        {t("Requested Rate")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTest.length > 0 &&
                      selectedTest.map((ele, index) => {
                        return (
                          <tr>
                            <td>
                              {ele?.typeoftest === "paid" && (
                                <button
                                  onClick={() => {
                                    const filterData = [...selectedTest].filter(
                                      (ele, ind) => ind != index,
                                    );
                                    setSelectedTest(filterData);
                                  }}
                                >
                                  X
                                </button>
                              )}
                            </td>
                            <td>{ele?.TestCode}</td>
                            <td>{ele?.TestName}</td>
                            <td>{ele?.Rate}</td>
                            <td>
                              <Input
                                disabled={
                                  ele?.typeoftest === "free" ? true : false
                                }
                                name="newRate"
                                className="form-control input-sm"
                                value={ele?.newRate}
                                type="number"
                                onInput={(e) => number(e, 5, Number(ele?.Rate))}
                                onChange={(e) => handleTestRate(e, index)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Tables>
              </div>
            </div>
          </div>
        </div>
        {isLoading.search ? (
          <Loading />
        ) : (
          <>
              <div className="row mb-2" style={{ justifyContent: "center" }}>
                <div className="col-sm-1  ">
                  {!isLoading.save && (
                    <SaveButton
                        text={"Save"}
                        onClick={() => {
                        handleSave();
                      }}
                    />
                  )}
                  {isLoading.save && <Loading />}
                </div>
                <div className="col-sm-1">
                  <CustomButton
                    text={"Reset"}
                    icon={"refresh"}
                    className="btn-danger"
                    onClick={() => {
                      resetDate();
                    }}
                  />
                </div>
              </div>
          </>
        )}
      </Accordion>
    </>
  );
};

export default CampRequest;
