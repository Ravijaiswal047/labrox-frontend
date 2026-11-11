import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";
import { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import "./styles/PageControlMaster.css";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

const PageControlMaster = () => {
  const [t] = useTranslation();
  const location = useLocation();
  const pageMeta = location?.state;
  const menuName = pageMeta?.MenuName;

  const initialControls = {
    id: 0,
    pageID: String(pageMeta?.PageID) ?? "",
    pageName: pageMeta?.PageName ?? "",
    controlDisplayName: "",
    controlDisplayId: "",
    isActive: true,
    required: false,
  };
  const [newControl, setNewControl] = useState(initialControls);
  const [page, setPage] = useState([]);
  const [controls, setControls] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  console.log("Initial new control", newControl);

  useEffect(() => {
    const fetchMainMenu = async () => {
      try {
        const res = await axiosInstance.get("Menu/MainMenuPageData");
        const data = res?.data?.message;
        const pageData = Array.isArray(data?.pageData) ? data?.pageData : [];

        const filteredPages = menuName
          ? pageData.filter((p) => p.MenuName === menuName)
          : pageData;

        const mappedPages = filteredPages.map((p) => ({
          label: p?.PageName,
          value: String(p?.PageID),
        }));
        setPage(mappedPages);
      } catch (error) {
        console.log("Error while fetching page data", error);
      }
    };

    fetchMainMenu();
  }, []);

  const fetchPageControlData = async (pageId) => {
    try {
      const res = await axiosInstance.post("CompanyMaster/GetPageControlData", {
        pageID: pageId,
      });
      const data = res?.data;
      if (data.success) {
        setControls(data?.message || []);
      } else {
        setControls([]);
      }
    } catch (error) {
      console.log("Error while fetching page data", error);
    }
  };

  useEffect(() => {
    if (newControl.pageID) {
      fetchPageControlData(Number(newControl.pageID));
    }
  }, [newControl.pageID]);

  const handleReactSelect = (name, value) => {
    console.log("name value", name, value);
    setNewControl((prev) => ({
      ...prev,
      pageName: value?.label,
      pageID: value?.value,
    }));
  };

  const handleNewControlChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewControl((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleNewControlEnabled = () => {
    setNewControl((prev) => {
      const newActive = !prev.isActive;
      return {
        ...prev,
        isActive: newActive,
        required: newActive ? prev.required : false,
      };
    });
  };

  const handleInsert = async () => {
    const payload = {
      pageID: Number(newControl.pageID),
      pageName: newControl.pageName,
      controlDisplayName: newControl.controlDisplayName,
      controlDisplayID: newControl.controlDisplayId,
      isActive: !!newControl.isActive,
      // required: !!newControl.required,
    };

    if (isEdit && newControl.id) {
      payload.id = newControl.id;
    }
    try {
      let res;
      if (isEdit) {
        res = await axiosInstance.post(
          "CompanyMaster/UpdatePageControlData",
          payload
        );
      } else {
        res = await axiosInstance.post(
          "CompanyMaster/SavePageControlData",
          payload
        );
      }

      const data = res?.data;
      if (data.success) {
        toast.success(
          isEdit ? "Control updated successfully" : "Control added successfully"
        );

        setNewControl((prev) => ({
          ...prev,
          controlDisplayName: "",
          controlDisplayId: "",
          isActive: true,
          required: false,
          id: 0,
        }));

        await fetchPageControlData(Number(newControl.pageID));
        setIsEdit(false);
      }
    } catch (error) {
      console.log("Control adding error: ", error);
    }
  };

  const handleEdit = (control) => {
    setNewControl({
      id: control.ID,
      pageID: String(control.PageID),
      pageName: control.PageName,
      controlDisplayName: control.ControlDisplayName,
      controlDisplayId: control.ControlDisplayID,
      isActive: control.IsActive,
      required: false,
    });
    setIsEdit(true);
  };

  return (
    <>
      <Accordion
        name={t("Page Control Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="px-2">
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <ReactSelect
                dynamicOptions={[{ label: "Select", value: "" }, ...page]}
                name="pageName"
                lable={t("Select Page")}
                id="pageName"
                removeIsClearable={true}
                placeholderName={t("Select Page")}
                value={newControl.pageID}
                onChange={handleReactSelect}
                isDisabled={page.length === 0}
              />
            </div>
          </div>
          {newControl.pageID != "" && (
            <div className="row px-2 mt-2 mb-1 d-flex align-items-center">
              <div className="col-sm-3">
                <Input
                  id="controlDisplayName"
                  type="text"
                  name="controlDisplayName"
                  lable="Control Display Name"
                  value={newControl.controlDisplayName}
                  onChange={handleNewControlChange}
                />
              </div>  
              <div className="col-sm-3">
                <Input
                  id="controlDisplayId"
                  type="text"
                  name="controlDisplayId"
                  lable="Control Display Id"
                  value={newControl.controlDisplayId}
                  onChange={handleNewControlChange}
                />
              </div>
              <div className="col-sm-1">
                <label className="switch mb-0 mr-1">
                  <input
                    type="checkbox"
                    checked={!!newControl.isActive}
                    onChange={toggleNewControlEnabled}
                  />
                  <span className="slider"></span>
                </label>
                <label className="form-label mb-0">Is Active</label>
              </div>
              {/* <div className="col-sm-1 d-flex align-items-center">
                {newControl.isActive ? (
                  <>
                    <label className="switch mb-0 mr-1">
                      <input
                        type="checkbox"
                        name="required"
                        checked={!!newControl.required}
                        onChange={handleNewControlChange}
                        className="mr-2"
                        id="new_required"
                      />
                      <span className="slider"></span>
                    </label>
                    <label htmlFor="new_required" className="form-label mb-0">
                      Required
                    </label>
                  </>
                ) : (
                  <div style={{ height: 24 }} />
                )}
              </div> */}

              <div className="col-sm-1">
                <button
                  type="button"
                  className="btn btn-block btn-primary btn-sm"
                  onClick={handleInsert}
                  disabled={!newControl.controlDisplayId}
                >
                  {isEdit ? t("Update") : t("Add")}
                </button>
              </div>
            </div>
          )}
        </div>    
      </Accordion>

      <Accordion title={t("Controls")} defaultValue={true}>
        {controls.length === 0 ? (
          <NoRecordFound />
        ) : (
          <div style={{ minHeight: "40vh" }}>
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("Control Display Name")}</th>
                  <th>{t("Control Display ID")}</th>
                  <th>{t("Active")}</th>
                  {/* <th>{t("Mandatory")}</th> */}
                  <th>{t("Edit")}</th>
                </tr>
              </thead>
              <tbody>
                {controls.map((control, idx) => (
                  <tr key={control.id} className="ml-0">
                    <td data-title={t("#")}>{idx + 1}</td>
                    <td data-title={t("Control Display Name")}>
                      {control.ControlDisplayName}
                    </td>
                    <td data-title={t("Control Display ID")}>
                      {control.ControlDisplayID}
                    </td>
                    <td data-title={t("Active")}>
                      <label className="switch mb-0">
                        <input
                          type="checkbox"
                          // id={control.ID}
                          checked={!!control.IsActive}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    {/* <td data-title={t("Mandatory")}>
                        {control.isActive ? (
                          <label className="switch mb-0">
                            <input
                              type="checkbox"
                              checked={!!control.required}
                              aria-label={`Required for ${control.ControlDisplayName}`}
                              className="mr-2"
                            />
                            <span className="slider"></span>
                          </label>
                        ) : (
                          <div style={{ width: 18, marginRight: 2 }} />
                        )}
                      </td> */}
                    <td
                      data-title={t("Edit")}
                      style={{
                        textDecoration: "underline",
                        color: "blue",
                      }}
                      onClick={() => handleEdit(control)}
                    >
                      Edit
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        )}
      </Accordion>
    </>
  );
};

export default PageControlMaster;
