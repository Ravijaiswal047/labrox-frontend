import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import ReactSelect from "../../components/formComponent/ReactSelect";
import HelpMenuModal from "../utils/HelpMenuModal";
import Loading from "../../components/loader/Loading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../components/UI/CustomButton";

const InvestigationsHelpMenuDialog = ({ visible, onHide, investigationData }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [show, setShow] = useState(false);
  const [Edit, setEdit] = useState(false);
  const [Value, setValue] = useState("");
  const [HelpMenu, setHelpMenu] = useState([]);
  const [load, setLoad] = useState(false);
  const [formData, setFormData] = useState({
    HelpMenuId: "",
    InvestigationId: "",
    IsActive: "1",
    isBold: "0",
    MenuName: "",
  });

  useEffect(() => {
    if (visible && investigationData?.InvestigationID) {
      setFormData((prev) => ({
        ...prev,
        HelpMenuId: "",
        InvestigationId: investigationData.InvestigationID,
        isBold: "0",
        MenuName: "",
      }));
      getHelpMenu();
      handleShowMapMenu();
    }
  }, [visible, investigationData?.InvestigationID]);

  const getHelpMenu = () => {
    axiosInstance
      .post("Investigations/GetHelpMenu", {
        InvestigationID: investigationData?.InvestigationID,
      })
      .then((res) => {
        const data = res.data.message;
        setHelpMenu(
          data.map((ele) => ({
            value: ele.MenuId,
            label: ele.MenuName,
            isBold: ele.isBold,
          })),
        );
      })
      .catch((err) => console.log(err));
  };

  const handleShowMapMenu = () => {
    axiosInstance
      .post("Investigations/ShowMapMenu", {
        InvestigationID: investigationData?.InvestigationID,
      })
      .then((res) => {
        setValue(res?.data?.message?.[0]?.HelpMenu);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const MapHelpMenu = () => {
    if (!formData?.HelpMenuId) {
      toast.error("Please choose Help menu");
      return;
    }
    setLoad(true);
    axiosInstance
      .post("Investigations/MapHelpMenu", {
        HelpMenuId: formData.HelpMenuId.toString(),
        InvestigationId: investigationData?.InvestigationID,
        IsActive: formData.IsActive,
        isBold: Number(formData.isBold),
      })
      .then((res) => {
        setLoad(false);
        if (res.data.success) {
          getHelpMenu();
          toast.success("Mapped successfully");
          handleShowMapMenu();
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        setLoad(false);
        toast.error(err?.response?.data?.message);
      });
  };

  const UnMapHelpMenu = () => {
    if (!formData?.HelpMenuId) {
      toast.error("Please choose Help menu");
      return;
    }
    setLoad(true);
    axiosInstance
      .post("Investigations/UnMapHelpMenu", {
        HelpMenuId: formData.HelpMenuId.toString(),
        InvestigationId: investigationData?.InvestigationID,
        IsActive: "0",
        isBold: Number(formData.isBold),
      })
      .then((res) => {
        setLoad(false);
        if (res?.data?.success) {
          getHelpMenu();
          toast.success(res?.data?.message);
          handleShowMapMenu();
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        setLoad(false);
        toast.error(err?.response?.data?.message);
      });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const handleSearchSelectChange = (label, value) => {
    setFormData((prev) => ({
      ...prev,
      [label]: value?.value,
      MenuName: value?.label,
      isBold: getBold(value?.value),
    }));
  };

  const getBold = (value) => {
    const found = HelpMenu?.find((ele) => ele.value == value);
    return found?.isBold ?? "0";
  };

  return (
    <>
      <Dialog
        header={t("Help Menu")}
        visible={visible}
        onHide={onHide}
        draggable={false}
        className={theme}
        style={{ width: "80vw" }}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-6">
            <div className="row pt-2 pl-2 pr-2">
              <div className="col-sm-12">
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={investigationData?.TestName || ""}
                  placeholder="Test Name"
                />
              </div>
            </div>
            <div className="row pt-2 pl-2 pr-2 mt-2">
              <div className="col-sm-12">
                <ReactSelect
                  dynamicOptions={HelpMenu}
                  name="HelpMenuId"
                  id="HelpMenuId"
                  removeIsClearable={true}
                  placeholderName="Help Menu"
                  value={formData?.HelpMenuId}
                  onChange={handleSearchSelectChange}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div
              className="text-center"
              style={{ border: "1px solid black", padding: "20px" }}
            >
              <h5>{t("Details")} :</h5>
              <span>{Value}</span>
            </div>
          </div>
        </div>

        {load ? (
          <Loading />
        ) : (
          <div className="row pt-2 pl-2 pr-2 pb-2 mt-2 align-items-center">
            <div className="col-sm-auto">
              <input
                type="checkbox"
                name="isBold"
                id="isBoldDialog"
                onChange={handleChange}
                checked={formData?.isBold == "1"}
              />
              <label className="ml-2 mb-0" htmlFor="isBoldDialog">
                {t("IsBold")}
              </label>
            </div>
            <div className="col-sm-auto">
              {/* <button
                disabled={!formData?.HelpMenuId}
                className="btn btn-success btn-sm"
                onClick={MapHelpMenu}
              >
                {t("Map")}
              </button> */}
              <CustomButton
                text={"Map"}
                disabled={!formData?.HelpMenuId}
                onClick={MapHelpMenu}
              />
            </div>
            <div className="col-sm-auto">
             
              <CustomButton
                text={"UnMap"}
                 disabled={!formData?.HelpMenuId}
                onClick={UnMapHelpMenu}
              />
            </div>
            <div className="col-sm-auto">
            <CustomButton
                text={"Add New Help"}
                onClick={() => { setShow(true); setEdit(false); }}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={"Edit Help"}
                onClick={() => { setShow(true); setEdit(true); }}

              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={"Close"}
                onClick={onHide}
              />
            </div>
          </div>
        )}
      </Dialog>

      {show && (
        <HelpMenuModal
          show={show}
          handleClose={() => setShow(false)}
          Edit={Edit}
          getHelpMenu={getHelpMenu}
          state={formData}
          setFormData2={setFormData}
          isBold={formData?.isBold}
          data={investigationData?.TestName}
        />
      )}
    </>
  );
};

export default InvestigationsHelpMenuDialog;
