import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { getTrimmedData } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
const ImmunoHelpMenuModal = ({
  show,
  handleClose,
  Edit,
  Value,
  getHelpMenu,
  setFormData2,
  state,
}) => {
  const [formData, setFormData] = useState(
    Edit
      ? {
          Id: state?.Id,
          // MarkerID: state?.MarkerID,
          // MarkerName: state?.MarkerName,
          // MarkerResultOptionsID: state?.MarkerResultOptionsID,
          // ResultOption: state?.MarkerResultOptionsName,
          Help: state?.MenuName,
          IsActive: 1,
          // MenuId:"",
        }
      : {
          Id: 0,
          // MarkerID: state?.MarkerID,
          // MarkerName: state?.MarkerName,
          // MarkerResultOptionsID: state?.MarkerResultOptionsID,
          // ResultOption: state?.MarkerResultOptionsName,
          IsActive: 1,
          Help: "",
          // MenuId:"",
        },
  );

  const { t } = useTranslation();

  const AddHelp = () => {
    axiosInstance
      .post("IHC/SaveIHCMarkerHelp", getTrimmedData(formData))
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          handleClose();
          getHelpMenu();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      header={Edit ? t("Update Help Menu") : t("Add New Help Menu")}
      visible={show}
      className={theme}
      onHide={handleClose}
      style={{
        width: isMobile ? "60vw" : "30vw",
      }}
    >
      {/* <div className="row">
        <div className="col-sm-6">
            <label>{t("MarkerName")}</label>
          <Input
            id="MarkerName"
            label="Marker Name"
            placeholder=" "
            type="text"
            name="MarkerName"
            value={state?.MarkerName || ""}
            disabled
          />
        </div>
        <div className="col-sm-6">
            <label>{t("ResultOptions")}</label>
          <Input
            id="MarkerResultOptionsName"
            label="Marker Result Options"
            placeholder=" "
            type="text"
            name="MarkerResultOptionsName"
            value={state?.MarkerResultOptionsName || ""}
            disabled
          />
        </div>
      </div> */}

      <div className="row">
        <div className="col-sm-12">
          <textarea
            style={{ height: "100px", width: "100%", padding: "10px" }}
            maxLength={200}
            type="text"
            placeholder={t("Please Enter Help Menu")}
            onChange={handleChange}
            name="Help"
            value={formData?.Help}
          ></textarea>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          {Edit ? (
            <button
              type="button"
              className="btn btn-block btn-success btn-sm"
              id="btnSave"
              onClick={AddHelp}
            >
              {t("Update")}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-block btn-success btn-sm"
              id="btnSave"
              onClick={AddHelp}
            >
              {t("Save")}
            </button>
          )}
        </div>
        <div className="col-sm-6">
          <button
            type="button"
            className="btn btn-block btn-danger btn-sm"
            id="btnSave"
            onClick={() => handleClose()}
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ImmunoHelpMenuModal;
