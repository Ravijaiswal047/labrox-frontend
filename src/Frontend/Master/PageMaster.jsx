import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { PageMasterValidation } from "../../utils/Schema";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Link, useNavigate } from "react-router-dom";
import { number, dateConfig } from "../../utils/helpers";
import { Button, Form } from "react-bootstrap";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { LuMoveUpRight } from "react-icons/lu";
import { CustomButton } from "../../components/UI/CustomButton";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { FaEdit } from "react-icons/fa";
import { getDesignationData, getDesignationDataNew } from "../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { Dialog } from "primereact/dialog";
import NoRecordFound from "../../components/formComponent/NoRecordFound";





const PageMaster = () => {
  const navigate = useNavigate()
  const [menudata, setMenuData] = useState([]);
  const [update, setUpdate] = useState(false);
  const [load, setLoad] = useState(false);
  const [savedata, setSaveData] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("")
  const [designation, setDesignation] = useState([])
  const { SuperAdmin } = useLocalStorage('userData', 'get');
  const theme = useLocalStorage("theme", "get");
  const [showAudit, setShowAudit] = useState(false);
  const [pageLogData, setPageLogData] = useState([]);
  const [auditPageName, setAuditPageName] = useState("");
  const [auditPageId, setAuditPageId] = useState("");
  const [payload, setPayload] = useState({
    PageName: "",
    Url: "",
    Priority: "",
    isActive: 1,
    MenuID: "0",
    SetMaster: 0,
    PageID: "",
    AllowDynamicControl: 0,
    DesignationID: [],
  });
  const { t } = useTranslation();

  const colorCodingData = [
    { color: "#fff", id: "1", labelKey: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "InActive" },

  ];

  const handleSelectChange = (name, value) => {
    if (name === "MenuID") {
      setPayload({ ...payload, [name]: value?.value, ItemValue: "" });
      setErrors({});
      fetchPageMaster(value);
    } else {
      setPayload({ ...payload, [name]: value?.value, ItemValue: "" });
      setErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleMultiSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  const fetchMenuApi = () => {
    axiosInstance
      .get("Menu/SelectAllMenu")
      .then((res) => {
        console.log(res);
        const data = res?.data?.message;
        const menuapi = data.map((ele) => {
          return {
            label: ele?.MenuName,
            value: ele?.ID,
          };
        });
        menuapi.unshift({ label: "Select", value: "" });
        setMenuData(menuapi);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong.",
        );
      });
  };

  const fetchPageMaster = (value) => {
    axiosInstance
      .post("Menu/SelectAllPage", { MenuID: String(value?.value || "") })
      .then((res) => {
        console.log(res);
        if (res?.data?.success) {
          const data = res?.data?.message;
          setSaveData(data);
        } else {
          setSaveData([]);
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const filteredData = savedata?.filter((item) => {
    return (
      item?.MenuName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.PageName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const editIDMaster = (id) => {
    setUpdate(true);
    axiosInstance
      .post("Menu/SelectAllPageByPageID", {
        PageID: id,
      })
      .then((res) => {
        const data = res.data.message[0];
        const designationIds = data.DesignationList?.map(
          (designation) => designation.DesignationID
        ) || [];

        setPayload({
          PageName: data.PageName || "",
          Url: data.Url || "",
          Priority: data.Priority || "",
          isActive: data.isActive ?? 1,
          MenuID: String(data.MenuID || "0"),
          SetMaster: data.SetMaster || 0,
          PageID: data.PageID || "",
          AllowDynamicControl: data.AllowDynamicControl || 0,
          DesignationID: designationIds,
        });
      })
      .catch((err) => console.log(err));
  };

  console.log("Payload hello", payload)

  const handleSave = (url, btnName) => {
    let generatedError = PageMasterValidation(payload);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(url, {
          ...payload,
          MenuID: String(payload.MenuID),
          designationIds: payload.DesignationID
        })
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res.data?.message);

            fetchPageMaster("");
            if (btnName === "Update") {
              setUpdate(false);
            }
            setPayload({
              PageName: "",
              Url: "",
              Priority: "",
              isActive: 1,
              MenuID: "",
              SetMaster: 0,
              PageID: "",
              DesignationID: []
            });
          } else {
            toast.error(res?.data?.message);
          }
          setLoad(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad(false);
        });
    } else {
      setErrors(generatedError);
      setLoad(false);
    }
  };
  const handleRedirect = (ele) => {
    navigate('/PageControlMaster', { state: ele })
  }

  const handlePageMasterAccessLog = async (ele) => {
    if (!ele?.PageID) {
      toast.warn("Something Went Wrong!");
      return;
    }

    setAuditPageName(ele?.PageName || "");
    setAuditPageId(ele?.PageID || "");
    setShowAudit(true);
    setPageLogData([]);

    try {
      const res = await axiosInstance.get(
        `Menu/GetPageMasterAuditLogs?pageId=${ele.PageID}`
      );
      setPageLogData(res?.data?.data || res?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something Went Wrong");
    }
  };




  useEffect(() => {
    fetchPageMaster("");
    fetchMenuApi();
    getDesignationDataNew(setDesignation, true);
  }, []);

  return (
    <>
      <Accordion
        name={t("Page Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={menudata}
              name="MenuID"
              lable={t("Menu")}
              id="MenuID"
              removeIsClearable={true}
              placeholderName={t("Menu")}
              value={payload?.MenuID}
              onChange={handleSelectChange}
              isDisabled={payload?.CompanyID == 0 ? true : false}
            />
            <div className="error-message">{errors?.MenuID}</div>
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Page Name"
              className="required-fields"
              name="PageName"
              id="PageName"
              placeholder=""
              max={50}
              disabled={payload?.CompanyID == 0 ? true : false}
              value={payload?.PageName}
              onChange={handleChange}
            />
            <div className="error-message">{errors?.PageName}</div>
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="URL"
              className="required-fields"
              name="Url"
              id="Url"
              placeholder=""
              disabled={payload?.CompanyID == 0 ? true : false}
              value={payload?.Url}
              onChange={handleChange}
            />
            <div className="error-message">{errors?.Url}</div>
          </div>
          <div className="col-sm-2">
            <Input
              type="number"
              lable="Priority"
              name="Priority"
              id="Priority"
              placeholder=""
              onInput={(e) => number(e, 4)}
              value={payload?.Priority}
              onChange={handleChange}
            />
            <div className="error-message">{errors?.Priority}</div>
          </div>
          <div className="col-sm-2">
            <MultiSelectComp
              label="Designation"
              options={designation}
              value={payload?.DesignationID}
              name="DesignationID"
              id="DesignationID"
              onChange={handleMultiSelectChange}
              lable={t("Select Designation")}
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <Form.Check
              type="switch"
              id="isActive"
              name="isActive"
              label={t("Active")}
              checked={payload?.isActive}
              disabled={payload?.CompanyID == 0 ? true : false}
              onChange={handleChange}
              className="m-0"
            />
          </div>
          {!payload?.PageID && (
            <div className="col-sm-1 mt-1 d-flex">
              <Form.Check
                type="switch"
                id="SetMaster"
                name="SetMaster"
                label={t("SetMaster")}
                checked={payload?.SetMaster}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="col-sm-1 mt-1 d-flex">
            <Form.Check
              type="switch"
              id="AllowDynamicControl"
              name="AllowDynamicControl"
              label={t("AllowDynamicControl")}
              checked={payload?.AllowDynamicControl}
              disabled={SuperAdmin != 1 ? true : false}
              onChange={handleChange}
              className="m-0"
            />
          </div>
        </div>
        <div className="d-flex my-2 justify-content-center">
          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <CustomButton
                text={update ? t("Update") : t("Save")}
                icon={update ? "edit" : "save"}
                onClick={() => update
                  ? handleSave("Menu/UpdatePageMaster", "Update")
                  : handleSave("Menu/SavePageMaster", "Save")
                }
              />
            )
            }
          </div>
          <div className="col-sm-1">
            <CustomButton
              id={"Reset"}
              text={t("Reset")}
              icon={"refresh"}
              onClick={() => {
                setPayload({
                  PageName: "",
                  Url: "",
                  Priority: "",
                  isActive: 1,
                  MenuID: "",
                  SetMaster: 0,
                  PageID: "",
                });
                setUpdate(false);
                setErrors({});
              }}
            />
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div
            className="link-title-container"
            id="pr_id_11"
          >
            <div className="d-flex" style={{ gap: "5px" }}>
              {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                />
              ))}
              <input
                className=""
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                style={{
                  borderColor: "#c0c0c0ff",
                  borderStyle: "solid",
                  borderRadius: "5px"
                }}
              />
            </div>
          </div>
        }
      >
        {load ? (
          <Loading />
        ) : (
          <div className="row p-2 ">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Menu Name")}</th>
                    <th>{t("Page Name")}</th>
                    <th>{t("URL")}</th>
                    <th
                      style={{ maxWidth: "500px", width: "500px" }}
                    >{t("Designation")}</th>
                    <th>{t("Is Master")}</th>
                    <th>{t("Priority")}</th>
                    <th>{t("IsActive")}</th>
                    <th>{t("Action")}</th>
                    <th>{t("DynamicControl")}</th>
                    <th>{t("view access log")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((ele, index) => {
                    const rowStyle = !ele?.isActive ? { backgroundColor: "#f5c6cb" } : {};
                    return (
                      <tr key={index}
                        style={rowStyle}
                      >
                        <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                        <td data-title={t("Menu Name")}>{ele?.MenuName}&nbsp;</td>
                        <td data-title={t("PageName")}>{ele?.PageName}&nbsp;</td>
                        <td data-title={t("URL")}>{ele?.Url}&nbsp;</td>
                        <td
                          data-title={t("URL")}
                          style={{
                            maxWidth: "500px",
                            width: "500px",
                            wordWrap: "break-word",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            overflow: "hidden",
                          }}
                        >
                          {ele?.DesignationList?.map((item) => item.DesignationName).join(", ") || "—"}
                          &nbsp;
                        </td>
                        <td data-title={t("IsMaster")}>
                          {ele?.CompanyID == 0 ? "Master" : "Self"}&nbsp;
                        </td>
                        <td data-title={t("Priority")}>{ele?.Priority}&nbsp;</td>
                        <td data-title={t("IsActive")}>
                          {ele?.isActive == 1 ? "Active" : "InActive"}&nbsp;
                        </td>
                        <td>
                          {/* <CustomButton
                          // text={t("Edit")}
                          icon={"edit"}
                           onClick={() => {
                            window?.scroll(0, 0);
                            editIDMaster(ele?.PageID);
                            setErrors({});
                          }}
                        /> */}
                          <button
                            type="button"
                            className="btn btn-sm text-white"
                            onClick={() => {
                              editIDMaster(ele?.PageID);
                              setErrors({});
                              window.scrollTo({
                                top: 0,
                                left: 0,
                                behavior: "smooth",
                              });
                            }}
                          >
                            <FaEdit color="white" />
                          </button>
                          {/* <Link
                          className="text-primary"
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                         
                        >
                          {t("Edit")}
                        </Link> */}
                        </td>
                        <td data-title={t("Active")}>
                          {ele?.AllowDynamicControl == 1 && <Button onClick={() => handleRedirect(ele)} className="rounded-full py-2"><LuMoveUpRight /></Button>}
                        </td>
                        <td>
                          <i
                            className="fa fa-search coloricon"
                            onClick={() => handlePageMasterAccessLog(ele)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Tables>
            </div>
          </div>
        )}
      </Accordion>
      {showAudit && (
        <Dialog
          visible={showAudit}
          className={theme}
          header={
            <span style={{ fontSize: "14px" }}>
              PageID: {auditPageId} | Page : {auditPageName}
            </span>
          }
          onHide={() => setShowAudit(false)}
          style={{ width: "80vw" }}
        >
          <div className="card">
            <div className="card-body p-0" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Field Name")}</th>
                    <th>{t("Old Value")}</th>
                    <th>{t("New Value")}</th>
                    <th>{t("Date & Time")}</th>
                    <th>{t("Changed By")}</th>



                  </tr>
                </thead>
                <tbody>
                  {pageLogData.length > 0 ? (
                    pageLogData.map((log, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{log.columnName || "-"}</td>
                        <td>{log.oldValue ?? "-"}</td>
                        <td>{log.newValue ?? "-"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {log.dtEntry ? dateConfig(log.dtEntry, 0) : "-"}
                        </td>
                        <td>{log.createdByName || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}><NoRecordFound /></td>
                    </tr>
                  )}
                </tbody>
              </Tables>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default PageMaster;
