import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { getTrimmedData } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CancelButton, EditButton, SaveButton } from "../../components/UI/CustomButton";
const HelpMenuModal = ({
  show,
  handleClose,
  Edit,
  Value,
  getHelpMenu,
  setFormData2,
  state,
  data,
}) => {
  const [formData, setFormData] = useState(
    Edit
      ? {
          MenuName: state?.MenuName,
          IsActive: "1",
          MenuId: state?.HelpMenuId?.toString(),
          isBold: state?.isBold == 1 ? "1" : "0",
        }
      : {
          MenuName: "",
          IsActive: "1",
          isBold: "0",
        },
  );

  const { t } = useTranslation();

  const AddHelp = () => {
    axiosInstance
      .post(
        Edit
          ? "Investigations/UpdateHelpMenu"
          : "Investigations/InsertHelpMenu",
        getTrimmedData(formData),
      )
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          setFormData2({
            MenuName: formData?.MenuName,
            IsActive: "1",
            HelpMenuId: formData?.MenuId?.toString(),
            isBold: formData?.isBold == 1 ? "1" : "0",
          });
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
  console.log(state);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
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
      style={{width: "30vw"}}
    >
      <div className="row">
        <p style={{ fontWeight: "bold" }}>Test Name :{data}</p>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <textarea
            style={{ height: "100px", width: "100%", padding: "10px" }}
            maxLength={200}
            type="text"
            placeholder={t("Please Enter Help Menu")}
            onChange={handleChange}
            name="MenuName"
            value={formData?.MenuName}
          ></textarea>
        </div>
      </div>
      <div className="row d-none">
        <div className="col-sm-12">
          <input
            type="checkbox"
            name="isBold"
            onChange={handleChange}
            checked={formData?.isBold === "1" ? true : false}
          />
          <label className="ml-2">IsBold</label>
        </div>
      </div>

      <div className="row d-flex justify-content-between">
        <div className="col-sm-auto">
          {Edit ? (
            <EditButton
            text={"Update"}
              onClick={AddHelp}
            />

          ) : (
            <SaveButton
            text={"Save"}
              onClick={AddHelp}
            />
          )}
        </div>
        <div className="col-sm-auto">
          <CancelButton
          text={"Close"}
            onClick={() => handleClose()}

          />
        </div>
      </div>
    </Dialog>
  );
};

export default HelpMenuModal;
