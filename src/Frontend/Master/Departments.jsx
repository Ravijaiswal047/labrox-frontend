import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  AllowCharactersNumbersAndSpecialChars,
  dateConfig,
  getTrimmedData,
} from "../../utils/helpers";
import { validation } from "../../utils/Schema";
import { toast } from "react-toastify";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { usePageControls } from "../../utils/hooks/usePageControls";
import { CustomButton, EditButton } from "../../components/UI/CustomButton";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import ReactSelect from "../../components/formComponent/ReactSelect";

const Departments = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [tableData, setTableData] = useState([]);
  const [err, setErr] = useState({});
  const [formData, setFormData] = useState({
    Department: "",
    categoryName: "",
    categoryID: 0,
    DepartmentID: 0,
    DepartmentCode: "",
    BarcodeGroup: "",
    isActive: 1,
    isMembershipcard: 0,
    isPackage: 0,
    Microbiology: 0,
    radiology: 0,
    IsHisto: 0,
    IsOPDConsultation: 0,
    SampleCollectionTimeInMinute: 0,
    SRATimeInMinute: 0,
    DepartmentReceiveTimeInMinute: 0,
    ApprovalTimeInMinute: 0,
    ResultEntryTimeInMinute: 0,
    DispatchTimeInMinute: 0,
  });
  console.log("formData", formData);
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const { isActive } = usePageControls(pathname);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (
      [
        "isMembershipcard",
        "isPackage",
        "Microbiology",
        "radiology",
        "IsHisto",
      ].includes(name)
    ) {
      setFormData({
        ...formData,
        [name]: checked ? 1 : 0,
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : formData[name],
      });
    }
  };
  const handleReactSelectChange = (name, e) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e ? e.value : "",
    }));
  };
  const colorCodingData = [
    { color: "#FFFFFF", id: "1", labelKey: "Active", status: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "De-Active", status: "De-Active" },
  ];

  const { t } = useTranslation();
  const postData = () => {
    console.log('generatedError::formData', formData)
    let generatedError = validation(formData);
    console.log('generatedError', generatedError)
    const departmentCategory = DepartmentCategory?.find((item) => item.value === formData?.categoryID)?.label || "";
    const url = formData?.DepartmentID ? "/Department/UpdateDepartmentData" : "Department/InsertDepartmentData";
    if (generatedError === "") {
      setLoading(true);
      axiosInstance
        .post(
          url,
          getTrimmedData({
            ...formData,
            categoryName: departmentCategory,
            isActive: formData?.isActive ? true : false,
          })
        )
        .then((res) => {
          if (res.data.message) {
            setFormData({
              categoryID: 0,
              categoryName: "",
              Department: "",
              DepartmentCode: "",
              BarcodeGroup: "",
              isActive: 1,
              DepartmentID: 0,
              isMembershipcard: 0,
              isPackage: 0,
              Microbiology: 0,
              radiology: 0,
              IsHisto: 0,
              IsOPDConsultation: 0,
              SampleCollectionTimeInMinute: 0,
              SRATimeInMinute: 0,
              DepartmentReceiveTimeInMinute: 0,
              ApprovalTimeInMinute: 0,
              ResultEntryTimeInMinute: 0,
              DispatchTimeInMinute: 0,
            });
            setLoading(false);
            getTableData();
            setErr({});
            toast.success(res.data.message);
          } else {
            toast.error("Something went wrong");
            setLoading(false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured"
          );
          setLoading(false);
        });
    } else {
      setErr(generatedError);
      setLoading(false);
    }
  };
  const EditData = (data) => {
    console.log('generatedErrorEdit::', data);
    setFormData({
      categoryName: data?.CategoryName,
      categoryID: data?.CategoryID,
      Department: data?.Department,
      DepartmentCode: data?.DepartmentCode,
      BarcodeGroup: data?.BarcodeGroup || "",
      isActive: data?.Status == "Active" ? 1 : 0,
      DepartmentID: data?.DepartmentID,
      isMembershipcard: data?.isMembershipcard,
      isPackage: data?.isPackage,
      Microbiology: data?.Microbiology,
      radiology: data?.Radiology,
      IsHisto: data?.IsHisto,
      IsOPDConsultation: data?.IsOPDConsultation,
      SampleCollectionTimeInMinute: data?.SampleCollectionTimeInMinute,
      SRATimeInMinute: data?.SRATimeInMinute,
      DepartmentReceiveTimeInMinute: data?.DepartmentReceiveTimeInMinute,
      ApprovalTimeInMinute: data?.ApprovalTimeInMinute,
      ResultEntryTimeInMinute: data?.ResultEntryTimeInMinute,
      DispatchTimeInMinute: data?.DispatchTimeInMinute,
    });
  };
  const getTableData = () => {
    axiosInstance
      .get("Department/getDepartmentData")
      .then((res) => {
        setTableData(res.data.message);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getTableData();

  }, []);

  const handleToggle = (e) => {
    console.log('hanldle toggle', e.target.name);
    const { name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name] === 1 ? 0 : 1,
    }));
  };
  const [DepartmentCategory, setDepartmentCategory] = useState([]);

  const getMappingGlobalData = (state, name) => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: name,
      })
      .then((res) => {
        let data = res.data.message;
        let DepartmentCategory = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        return state(DepartmentCategory);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getMappingGlobalData(setDepartmentCategory, "DepartmentCategory");
  }, []);

  console.log('formData', formData)
  const filteredData = useMemo(() => {
    const data = Array.isArray(tableData) ? tableData : [];
    if (!searchText) return data;

    const search = searchText.toLowerCase();

    return data.filter(
      (item) =>
        // item?.DepartmentName?.toLowerCase().includes(search) ||
        item?.Department?.toLowerCase().includes(search)
    );
  }, [tableData, searchText]);
  console.log("DepartmentCategory", DepartmentCategory);
  return (
    <>

      <Accordion
        name={t("Departments")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 my-2">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={DepartmentCategory}
              name="categoryID"
              placeholderName="Department Category"
              id="categoryID"
              placeholder=" "
              value={formData?.categoryID}
              onChange={handleReactSelectChange}
            />
          </div>
          {isActive("DepartmentCode") && (
            <div className="col-sm-2">
              <Input
                className="required-fields"
                name="DepartmentCode"
                lable="Department Code"
                id="Department Code"
                placeholder=" "
                value={formData?.DepartmentCode}
                onChange={handleChange}
              />
              {formData?.DepartmentCode.trim() === "" && (
                <span className="error-message">{err?.DepartmentCode}</span>
              )}
              {formData?.DepartmentCode.trim().length > 0 &&
                formData?.DepartmentCode.trim().length < 2 && (
                  <span className="error-message">{err?.DepartmentCodes}</span>
                )}
            </div>
          )}
          {isActive("DepartmentName") && (
            <div className="col-sm-2">
              <Input
                className="required-fields"
                name="Department"
                lable="Department Name"
                id="Department Name"
                placeholder=" "
                value={formData?.Department}
                onChange={handleChange}
              />
              {formData?.Department.trim() === "" && (
                <span className="error-message">{err?.Department}</span>
              )}
              {formData?.Department.trim().length > 0 &&
                formData?.Department.trim().length < 2 && (
                  <span className="error-message">{err?.Department}</span>
                )}
            </div>
          )}
          {isActive("BarcodeGroup") && (
            <div className="col-sm-2">
              <Input
                className="required-fields"
                name="BarcodeGroup"
                lable="Barcode Group"
                id="BarcodeGroup"
                placeholder=" "
                value={formData?.BarcodeGroup}
                onChange={handleChange}
                maxLength={5}
              />
              {(formData?.BarcodeGroup ?? "").trim() === "" && (
                <span className="error-message">{err?.BarcodeGroup}</span>
              )}
              {(formData?.BarcodeGroup ?? "").trim().length > 0 &&
                (formData?.BarcodeGroup ?? "").trim().length < 2 && (
                  <span className="error-message">{err?.BarcodeGroup}</span>
                )}
            </div>
          )}


          {isActive("SampleCollectionTimeInMinute ") && (
            <div className="col-sm-2">
              <Input
                type="number"
                // className="required-fields"
                name="SampleCollectionTimeInMinute "
                lable="SampleCollectionTimeInMinute "
                id="SampleCollectionTimeInMinute "
                placeholder=" "
                value={formData?.SampleCollectionTimeInMinute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    SampleCollectionTimeInMinute: e.target.value,
                  })
                }
                maxLength={5}
              />
              {/* {(formData?.SampleCollectionTimeInMinute ?? "").trim() === "" && (
                <span className="error-message">{err?.SampleCollectionTimeInMinute}</span>
              )}
              {(formData?.SampleCollectionTimeInMinute ?? "").trim().length > 0 &&
                (formData?.SampleCollectionTimeInMinute ?? "").trim().length < 2 && (
                  <span className="error-message">{err?.SampleCollectionTimeInMinute}</span>
                )} */}
            </div>
          )}
          {isActive("SRATimeInMinute ") && (
            <div className="col-sm-2">
              <Input
                type="number"
                // className="required-fields"
                name="SRATimeInMinute "
                lable="SRATimeInMinute "
                id="SRATimeInMinute "
                placeholder=" "
                value={formData?.SRATimeInMinute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    SRATimeInMinute: e.target.value,
                  })
                }
                maxLength={5}
              />
              {/* {(formData?.SRATimeInMinute ?? "").trim() === "" && (
                <span className="error-message">{err?.SRATimeInMinute}</span>
              )}
              {(formData?.SRATimeInMinute ?? "").trim().length > 0 &&
                (formData?.SRATimeInMinute ?? "").trim().length < 2 && (
                  <span className="error-message">{err?.SRATimeInMinute}</span>
                )} */}
            </div>
          )}
          {isActive("DepartmentReceiveTimeInMinute ") && (
            <div className="col-sm-2">
              <Input
                type="number"
                // className="required-fields"
                name="DepartmentReceiveTimeInMinute "
                lable="DepartmentReceiveTimeInMinute "
                id="DepartmentReceiveTimeInMinute "
                placeholder=" "
                value={formData?.DepartmentReceiveTimeInMinute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    DepartmentReceiveTimeInMinute: e.target.value,
                  })
                }
                maxLength={5}
              />
              {/* {(formData?.DepartmentReceiveTimeInMinute ?? "").trim() === "" && (
                <span className="error-message">{err?.DepartmentReceiveTimeInMinute}</span>
              )}
              {(formData?.DepartmentReceiveTimeInMinute ?? "").trim().length > 0 &&
                (formData?.DepartmentReceiveTimeInMinute ?? "").trim().length < 2 && (
                  <span className="error-message">{err?.DepartmentReceiveTimeInMinute}</span>
                )} */}
            </div>
          )}
          {isActive("ResultEntryTimeInMinute ") && (
            <div className="col-sm-2">
              <Input
                type="number"
                // className="required-fields"
                name="ResultEntryTimeInMinute "
                lable="ResultEntryTimeInMinute "
                id="ResultEntryTimeInMinute "
                placeholder=" "
                value={formData?.ResultEntryTimeInMinute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ResultEntryTimeInMinute: e.target.value,
                  })
                }
                maxLength={5}
              />
              {/* {(formData?.ResultEntryTimeInMinute ?? "").trim() === "" && (
                <span className="error-message">{err?.ResultEntryTimeInMinute}</span>
              )}
              {(formData?.ResultEntryTimeInMinute ?? "").trim().length > 0 &&
                (formData?.ResultEntryTimeInMinute ?? "").trim().length < 2 && (
                  <span className="error-message">{err?.ResultEntryTimeInMinute}</span>
                )} */}
            </div>
          )}
          {isActive("ApprovalTimeInMinute ") && (
            <div className="col-sm-2">
              <Input
                type="number"
                // className="required-fields"
                name="ApprovalTimeInMinute "
                lable="ApprovalTimeInMinute "
                id="ApprovalTimeInMinute "
                placeholder=" "
                value={formData?.ApprovalTimeInMinute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ApprovalTimeInMinute: e.target.value,
                  })
                }
                maxLength={5}
              />
              {/* {(formData?.ApprovalTimeInMinute ?? "").trim() === "" && (
                <span className="error-message">{err?.ApprovalTimeInMinute}</span>
              )}
              {(formData?.ApprovalTimeInMinute ?? "").trim().length > 0 &&
                (formData?.ApprovalTimeInMinute ?? "").trim().length < 2 && (
                  <span className="error-message">{err?.ApprovalTimeInMinute}</span>
                )} */}
            </div>
          )}
          {isActive("DispatchTimeInMinute ") && (
            <div className="col-sm-2">
              <Input
                type="number"
                // className="required-fields"
                name="DispatchTimeInMinute "
                lable="DispatchTimeInMinute "
                id="DispatchTimeInMinute "
                placeholder=" "
                value={formData?.DispatchTimeInMinute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    DispatchTimeInMinute: e.target.value,
                  })
                }
                maxLength={5}
              />
              {/* {(formData?.ApprovalTimeInMinute ?? "").trim() === "" && (
                <span className="error-message">{err?.ApprovalTimeInMinute}</span>
              )}
              {(formData?.ApprovalTimeInMinute ?? "").trim().length > 0 &&
                (formData?.ApprovalTimeInMinute ?? "").trim().length < 2 && (
                  <span className="error-message">{err?.ApprovalTimeInMinute}</span>
                )} */}
            </div>
          )}



          {isActive("isActive") && (
            <div className="col-sm-1 d-flex align-items-center">
              <label className="switch">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive === 1}
                  onChange={(e) => handleToggle(e)}
                />
                <span className="slider"></span>
              </label>
              <strong className="ml-2 mb-2">{t("IsActive")}</strong>
            </div>
          )}
          {isActive("isPackage") && (
            <div className="col-sm-1 d-flex align-items-center">
              <label className="switch">
                <input
                  type="checkbox"
                  name="isPackage"
                  id="isPackage"
                  checked={formData.isPackage === 1}
                  onChange={(e) => handleToggle(e)}
                />
                <span className="slider"></span>
              </label>
              <strong className="ml-2 mb-2">{t("IsPackage")}</strong>
            </div>
          )}
          {isActive("isMembershipcard") && (
            <div className="col-sm-auto d-flex align-items-center">
              <label className="switch">
                <input
                  type="checkbox"
                  name="isMembershipcard"
                  id="isMembershipcard"
                  checked={formData.isMembershipcard === 1}
                  onChange={(e) => handleToggle(e)}
                />
                <span className="slider"></span>
              </label>
              <strong className="ml-2 mb-2">{t("IsMembershipcard")}</strong>
            </div>
          )}
          {isActive("Microbiology") && (
            <div className="col-sm-auto d-flex align-items-center">
              <label className="switch">
                <input
                  type="checkbox"
                  name="Microbiology"
                  id="Microbiology"
                  checked={formData.Microbiology === 1}
                  onChange={(e) => handleToggle(e)}
                />
                <span className="slider"></span>
              </label>
              <strong className="ml-2 mb-2">{t("IsMicroBio.")}</strong>
            </div>
          )}
          {isActive("radiology") && (
            <div className="col-sm-auto d-flex align-items-center">
              <label className="switch">
                <input
                  type="checkbox"
                  name="radiology"
                  id="radiology"
                  checked={formData.radiology === 1}
                  onChange={(e) => handleToggle(e)}
                />
                <span className="slider"></span>
              </label>
              <strong className="ml-2 mb-2">{t("IsRadiology")}</strong>
            </div>
          )}
          {isActive("IsHisto") && (
            <div className="col-sm-auto d-flex align-items-center">
              <label className="switch">
                <input
                  type="checkbox"
                  name="IsHisto"
                  id="IsHisto"
                  checked={formData.IsHisto === 1}
                  onChange={(e) => handleToggle(e)}
                />
                <span className="slider"></span>
              </label>
              <strong className="ml-2 mb-2">{t("IsHisto")}</strong>
            </div>
          )}
          <div className="col-sm-auto d-flex align-items-center">
            <label className="switch">
              <input
                type="checkbox"
                name="IsOPDConsultation"
                id="IsOPDConsultation"
                checked={formData.IsOPDConsultation === 1}
                onChange={(e) => handleToggle(e)}
              />
              <span className="slider"></span>
            </label>
            <strong className="ml-2 mb-2">{t("IsOPDConsultation")}</strong>
          </div>
          {/* <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="IsHisto"
                type="checkbox"
                checked={formData?.IsHisto == 0 ? false : true}
                onChange={handleChange}
              />
            </div>
            <label className="col-sm-10">{t("IsHisto")}</label>
          </div>  */}
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <>
                { }
                <CustomButton
                  text={formData?.DepartmentID ? t("Update") : t("Create")}
                  icon={formData?.DepartmentID ? t("edit") : t("save")}
                  className={`btn ${formData?.DepartmentID ? "btn-warning" : "btn-info"
                    } btn-block  btn-sm text-white`}
                  id="btnSave"
                  onClick={postData}
                />
              </>
            )}
          </div>
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <>
                { }
                <CustomButton
                  text={"Reset"}
                  icon={"refresh"}
                  className="btn btn-danger btn-block  btn-sm"
                  id="btnSave"
                  onClick={() => {
                    setFormData({
                      categoryID: 0,
                      categoryName: "",
                      Department: "",
                      DepartmentCode: "",
                      BarcodeGroup: "",
                      isActive: 1,
                      DepartmentID: 0,
                      isMembershipcard: 0,
                      isPackage: 0,
                      Microbiology: 0,
                      radiology: 0,
                      IsHisto: 0,
                      IsOPDConsultation: 0,
                    });
                    setErr({});
                  }}
                />
              </>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={

          <div className=" d-flex" style={{ gap: "5px" }}>
            {colorCodingData.map(({ color, labelKey, id, status }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={`${t(labelKey)} (${filteredData?.filter(
                  (item) => item?.Status === status
                ).length
                  })`}
              />
            ))}

            <div>

              <Input
                type="text"
                placeholder="Search Department..."
                value={searchText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSearchText(e.target.value)}
                className="mt-2"
              />

            </div>
          </div>
        }>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            <Tables data={tableData ?? []}>
              <>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Code")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Department Category")}</th>
                    <th>{t("Entry Date")}</th>
                    <th>{t("Update Date")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    filteredData?.map((item, index) => (
                      <tr key={index} style={{
                        backgroundColor: item?.Status === "De-Active" ?
                          colorCodingData.find(i => i.status === "De-Active")?.color : ""
                      }}>
                        <td data-title={"S.No"}>{index + 1}&nbsp;</td>
                        <td data-title={"Code"}>{item?.DepartmentCode || '-'}&nbsp;</td>
                        <td data-title={"Department"}>
                          {item?.Department}&nbsp;
                        </td>
                        <td data-title={"Department Category"}>
                          {item?.CategoryName}&nbsp;
                        </td>
                        <td data-title={"Entry Date"}>
                          {dateConfig(item?.dtEntry)}
                        </td>
                        <td data-title={"Update Date"}>
                          {item?.dtUpdate !== "0000-00-00 00:00:00"
                            ? dateConfig(item?.dtUpdate)
                            : "-"}
                          &nbsp;
                        </td>
                        <td data-title={"Action"}>
                          {item.companyId === 0 ? (
                            <p
                              style={{ color: "red" }}
                              Tooltip="System Generated it can't be changed"
                            >
                              {t("System Generated it can't be changed")}
                            </p>
                          ) : (
                            <EditButton
                              className="btn btn-primary btn-lg"
                              id="btnSave"
                              title="Edit"
                              onClick={() => EditData(item)}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default Departments;
