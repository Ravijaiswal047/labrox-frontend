import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useTranslation } from "react-i18next";
import {
  autocompleteOnBlur,
  ExportToExcel,
  getTrimmedData,
  PreventSpecialCharacter,
} from "../../utils/helpers";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";

import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton, EditButton, SaveButton } from "../../components/UI/CustomButton";
const CampCreationMaster = () => {
  const localData = useLocalStorage("userData", "get");
  const [load, setLoad] = useState(false);
  const [selected, setSelected] = useState("ccm");
  const [suggestion, setSuggestion] = useState([]);
  const [searchTest, setSearchTest] = useState("TestName");
  const [indexMatch, setIndexMatch] = useState(0);
  const [campData, setCampData] = useState([]);

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    CampName: "",
    IsActive: true,
    TestName: "",
  });
  const [tableData, setTableData] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const reg = /^([^0-9$%]*)$/;
    if (type == "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      if (PreventSpecialCharacter(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
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
              setIndexMatch(suggestion.length - 1);
            }
            break;
          case 40:
            if (suggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            if (suggestion.length > 0) {
              handleListSearch(suggestion[indexMatch], name);
            }
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
    }
  };

  const UpdateCampName = (id) => {
    const payload = {
      CampName: formData?.CampName.trim(),
      ID: formData?.id,
      IsActive: formData?.IsActive == true ? 1 : 0,
    };
    setLoad(true);
    if (payload?.CampName.length > 2) {
      axiosInstance
        .post("Camp/UpdateCamp", getTrimmedData(payload))
        .then((res) => {
          toast.success(res?.data?.message);
          setFormData({
            CampName: "",
            IsActive: false,
          });
          getCamp();
          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could Not Update",
          );
        });
    } else {
      setLoad(false);
      toast.error("CampName must have atleast 3 characters");
    }
  };
  const SaveCampName = () => {
    const payload = {
      CampName: formData?.CampName.trim(),
      IsActive: formData?.IsActive == true ? 1 : 0,
    };
    if (payload?.CampName.length > 2) {
      setLoad(true);
      axiosInstance
        .post("Camp/SaveCamp", payload)
        .then((res) => {
          toast.success(
            res?.data?.message ? res?.data?.message : "Camp Saved Successfully",
          );
          setFormData({
            CampName: "",
            IsActive: false,
          });
          getCamp();
          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could not Save",
          );
        });
    } else {
      setLoad(false);
      toast.error("CampName must have atleast 3 characters");
    }
  };

  const handleEditCampName = (ele) => {
    console.log(ele);
    setFormData({
      id: ele?.ID,
      CampName: ele?.CampName,
      IsActive: ele?.IsActiveStatus == 1 ? true : false,
    });
    window.scroll(0, 0);
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
  const getSuggestion = (value) => {
    let payload;
    if (searchTest === "TestName") {
      payload = {
        DataType: "",
        TestName: value,
        ShortName: "",
        TestCode: "",
        DepartmentID: "",
        IsActive: "1",
      };
    } else {
      payload = {
        DataType: "",
        TestName: "",
        ShortName: "",
        TestCode: value,
        DepartmentID: "",
        IsActive: "1",
      };
    }
    axiosInstance
      .post("Investigations/GetInvestigations", payload)
      .then((res) => {
        setSuggestion(res?.data?.message);
      })
      .catch((err) => console.log(err));
  };

  const debouce = handleDeboucing(getSuggestion);
  const handleTestChange = (event) => {
    const { value } = event.target;
    if (value.length > 2) {
      debouce(value);
    }
  };
  const handleListSearch = (data, name) => {
    console.log(data);
    switch (name) {
      case "TestName":
        document.getElementById("testSearch").value = "";
        setIndexMatch(0);
        setSuggestion([]);

        const obj = {
          ...data,
          ItemName: data?.TestName,
          AddedBy: localData.Username,
          AddedDate: moment(new Date()).format("DD-MMM-YYYY hh:mm A"),
        };
        const hasDuplicateID = tableData.some(
          (item) => item.InvestigationID === obj?.InvestigationID,
        );

        if (!hasDuplicateID) {
          setTableData([...tableData, obj]);
        } else {
          toast.error("Test Already Added");
        }
        break;
    }
  };

  const getCamp = () => {
    axiosInstance
      .get("Camp/GetCamp")
      .then((res) => {
        if (res?.status === 200) {
          setCampData(res?.data?.message);
        } else {
          toast?.error("No Record Found");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log("Camp data", campData)
  const getTestDetails = () => {
    axiosInstance
      .get("Camp/getTestDetail")
      .then((res) => {
        const value = res.data.message.map((item) => {
          return { ...item, InvestigationID: item?.ItemID };
        });
        setTableData(value);
        console.log("value",value);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleExport = () => {
    const excelData = tableData?.map((item, index) => ({
      "Sr.No": index + 1,
      "TestName": item.ItemName,
      "TestCode": item.TestCode, // or ItemCode if API sends that
      "Added By": item.AddedBy,
      "Added Date": item.AddedDate,
      "LastUpdatedBy": item.LastUpdatedBy,
      "LastUpdatedDate": item.LastUpdatedDate,
    }));

    ExportToExcel(excelData, "Test_Details.xlsx");
  };
  useEffect(() => {
    getCamp();
  }, []);

  useEffect(() => {
    if (selected === "fcm") {
      getTestDetails();
    }
  }, [selected]);

  const handleSavefreetest = () => {
    if (tableData.length == 0) {
      toast.error("Select atleast one Test");
    } else {
      setLoad(true);
      console.log(tableData);
      const data = tableData.map((item) => {
        return {
          ItemID: `${item?.InvestigationID}`,
          IsNew: item?.ID ? "0" : "1",
          IsOld: item?.ID ? "1" : "0",
        };
      });
      axiosInstance
        .post("Camp/saveCampTest", { ItemDetail: data })
        .then((res) => {
          toast.success(res?.data?.message);

          setLoad(false);
          getTestDetails();
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err?.response?.data?.message);
        });
    }
  };
  const handleFilter = (data) => {
    if (data?.ID) {
      axiosInstance
        .post("Camp/removeCampTest", {
          CampTestID: data?.ID,
        })
        .then((res) => {
          if (res.status === 200) {
            getTestDetails();
            toast.success("Test Removed Successfully");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      const value = tableData.filter(
        (ele) => ele.InvestigationID != data.InvestigationID,
      );
      setTableData(value);
    }
  };

  return (
    <>
      <Accordion
        name={t("Camp Creation Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-3 mt-2 mb-1">
          <CustomButton
              text={"CampNameCreationMaster"}
              style={{
              border: selected === "ccm" ? "2px solid green" : "none",
            }}
            onClick={() => setSelected("ccm")}
          />
          <CustomButton
            text={"FreeCampTestMaster"}
            style={{
              border: selected === "fcm" ? "2px solid green" : "none",
              marginLeft: "5px",
            }}
            onClick={() => setSelected("fcm")}
          />
        </div>
      </Accordion>
      {selected === "ccm" && (
        <Accordion title={t("Camp Name Creation Master")} defaultValue={true}>
          <div className="row  px-2 mt-2 mb-1">
            <div className="col-sm-2">
              <Input
                onChange={handleChange}
                value={formData?.CampName}
                name="CampName"
                type="text"
                placeholder=" "
                lable="Camp Name"
                id="CampName"
                max={20}
              />
            </div>
            <div className="col-sm-1">
              <input
                name="IsActive"
                className="mt-2"
                type="checkbox"
                onChange={handleChange}
                checked={formData.IsActive}
              />
              <label htmlFor="IsActive" className="ml-2">
                {t("IsActive")}
              </label>
            </div>
            {load ? (
              <div className="col-sm-1">
                <Loading />
              </div>
            ) : (
              <div className="col-sm-1">
                {!formData?.id && (
                  <SaveButton
                      text={"Save"}
                      onClick={SaveCampName}
                  />
                )}
                {formData?.id && (
                  <EditButton
                    text={"Update"}
                    onClick={UpdateCampName}
                  />
                )}
              </div>
            )}
          </div>
          {campData.length > 0 && (
            <Tables>
              <thead className="cf text-center" style={{ zIndex: 99 }}>
                <tr>
                  <th className="text-center">{t("S.No")}</th>
                  <th className="text-center">{t("Camp Name")}</th>
                  <th className="text-center">{t("IsActive")}</th>
                  <th className="text-center">{t("Created By")}</th>
                  <th className="text-center">{t("Created Date")}</th>
                  <th className="text-center">{t("Edit")}</th>
                </tr>
              </thead>
              <tbody>
                {[...campData]?.map((data, index) => (
                  <>
                    <tr key={index}>
                      <td style={{width:'5%'}} data-title="S.No">{index + 1}</td>
                      <td data-title="Camp Name">{data?.CampName}</td>
                      <td data-title="IsActive">{data?.IsActive}</td>
                      <td data-title="Created By">{data?.CreatedBy}</td>
                      <td data-title="Created Date">{data?.CreatedDate}</td>
                      <td data-title="Edit" className="text-center">
                        <EditButton
                          text={"Edit"}
                          onClick={() => {
                            handleEditCampName(data);
                          }}
                        />
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Tables>
          )}
        </Accordion>
      )}
      {selected === "fcm" && (
        <Accordion title={t("Free Camp Test Master")} defaultValue={true}>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-5">
              <Input
                autoComplete="off"
                placeholder=" "
                lable="Type Test Name or Test Code"
                id="testSearch"
                name="TestName"
                type="text"
                max={30}
                onChange={handleTestChange}
                onBlur={() => {
                  autocompleteOnBlur(setSuggestion);
                  setTimeout(() => {
                    const element = document.getElementById("testSearch");
                    if (element) {
                      element.value = "";
                    }
                  }, 500);
                }}
                onKeyDown={handleIndex}
              />
              {suggestion.length > 0 && (
                <ul className="suggestion-data" style={{ zIndex: 99 }}>
                  {suggestion.map((data, index) => (
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
            <>
              <div className="col-sm-2">
                <input
                  type="radio"
                  name="type"
                  value="TestName"
                  checked={searchTest == "TestName"}
                  onChange={(e) => {
                    setSearchTest(e.target.value);
                  }}
                />

                <label htmlFor="inputEmail3" className="ml-2">
                  {t("ByTestName")}
                </label>
              </div>
              <div className="col-sm-2">
                <input
                  type="radio"
                  name="type"
                  value="TestCode"
                  checked={searchTest == "TestCode"}
                  onChange={(e) => {
                    setSearchTest(e.target.value);
                  }}
                />

                <label htmlFor="inputEmail3" className="ml-2">
                  {t("ByTestCode")}
                </label>
              </div>

              <div className="col-sm-2">
                <span
                  className="font-weight-bold"
                  style={{ fontWeight: "bold" }}
                >
                  {t("Total Test")} : {tableData?.length}
                </span>
              </div>
            </>
          </div>
          <div>
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Test Code")}</th>
                  <th>{t("Test Name")}</th>
                  <th>{t("Added By")}</th>
                  <th>{t("Added DateTime")}</th>
                  <th>{t("Last Updated By")}</th>
                  <th>{t("Last Updated DateTime")}</th>
                </tr>
              </thead>
              {tableData.length > 0 && (
                <tbody>
                  {tableData.map((data, index) => (
                    <>
                      <tr>
                        <td data-title="S.No" key={index}>
                          <div className="d-flex justify-content-around">
                            <span>{index + 1}</span>
                            <span>
                              <button
                                className="btn btn-danger btn-sm "
                                onClick={() => {
                                  handleFilter(data);
                                }}
                              >
                                X
                              </button>
                            </span>
                          </div>
                        </td>
                        <td data-title="Test Code">{data?.TestCode}</td>
                        <td data-title="Test Name">{data?.ItemName}</td>
                        <td data-title="Added By">{data?.AddedBy}</td>
                        <td data-title="Added DateTime">{data?.AddedDate}</td>
                        <td data-title="Last Updated By">
                          {data?.LastUpdatedBy}
                        </td>
                        <td data-title="Last Updtaed DateTime">
                          {data?.LastUpdatedDate}
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              )}
            </Tables>
          </div>
          <div className="row mt-2 mb-1 px-2">
            {/* <div className="col-sm-1"> */}
              {!load && (
                <SaveButton
                  text={"Save"}
                  onClick={handleSavefreetest}
                  disabled={tableData.every((obj) => obj.hasOwnProperty("ID"))}
                  className="mr-2 ml-1"
                />
              )}
              {load && <Loading />}
            {/* </div> */}
            <CustomButton text="Export to Excel" icon="excel" onClick={handleExport}/>
          </div>
        </Accordion>
      )}
    </>
  );
};

export default CampCreationMaster;
