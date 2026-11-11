import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { Input } from "@profabric/react-components";
import { SelectBox } from "../../components/formComponent/SelectBox";
import HelpMenuModal from "../utils/HelpMenuModal";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";

const InvestigationsHelpMenu = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [Edit, setEdit] = useState(false);
  const [Value, setValue] = useState("");
  const [HelpMenu, setHelpMenu] = useState([]);
  const [load, setLoad] = useState(false);
  const [formData, setFormData] = useState({
    HelpMenuId: "",
    InvestigationId: state?.data?.InvestigationID
      ? state?.data?.InvestigationID
      : "",
    IsActive: "1",
    // MenuId: "",
    isBold: "0",
    MenuName: "",
  });
  console.log();
  const { t } = useTranslation();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getHelpMenu = () => {
    axiosInstance
      .post("Investigations/GetHelpMenu", {
        InvestigationID: state?.data?.InvestigationID,
      })
      .then((res) => {
        let data = res.data.message;
        let helpMenu = data.map((ele) => {
          return {
            value: ele.MenuId,
            label: ele.MenuName,
            isBold: ele.isBold,
          };
        });

        setHelpMenu(helpMenu);
      })
      .catch((err) => console.log(err));
  };
  const MapHelpMenu = () => {
    if (formData?.HelpMenuId) {
      setLoad(true);
      axiosInstance
        .post("Investigations/MapHelpMenu", {
          HelpMenuId: formData?.HelpMenuId?.toString(),
          InvestigationId: state?.data?.InvestigationID,
          IsActive: formData?.IsActive,
          isBold: Number(formData?.isBold),
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
          toast.error(err.response.data.message);
        });
    } else {
      toast.error("please Choose Help menu");
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    });
  };
  const UnMapHelpMenu = () => {
    if (formData?.HelpMenuId) {
      setLoad(true);
      axiosInstance
        .post("Investigations/UnMapHelpMenu", {
          HelpMenuId: formData?.HelpMenuId?.toString(),
          InvestigationId: state?.data?.InvestigationID,
          IsActive: "0",
          isBold: Number(formData?.isBold),
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
          toast.error(err.response.data.message);
        });
    } else {
      toast.error("please Choose Help menu");
    }
  };

  console.log(HelpMenu);

  const handleSearchSelectChange = (label, value) => {
    console.log({ label, value });
    setFormData({
      ...formData,
      [label]: value?.value,
      MenuName: value?.label,
      isBold: getBold(value?.value),
    });
  };

  const getBold = (value) => {
    const values = HelpMenu?.filter((ele) => ele.value == value);
    return values[0]?.isBold;
  };
  const handleShowMapMenu = () => {
    axiosInstance
      .post("Investigations/ShowMapMenu", {
        InvestigationID: state?.data?.InvestigationID,
      })
      .then((res) => {
        setValue(res?.data?.message[0]?.HelpMenu);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  useEffect(() => {
    getHelpMenu();
    handleShowMapMenu();
  }, []);
  return (
    <>
      {" "}
      {show && (
        <HelpMenuModal
          show={show}
          handleClose={handleClose}
          Edit={Edit}
          getHelpMenu={getHelpMenu}
          state={formData}
          setFormData2={setFormData}
          isBold={formData?.isBold}
          data={state?.data?.TestName}
        />
      )}{" "}
      <Accordion name={t("Help Menu")} defaultValue={true} isBreadcrumb={true} backButton={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-6">
            <div className="row pt-2 pl-2 pr-2">
              <div className="col-sm-12">
                <Input
                  type="text"
                  lable="Test Name"
                  id="Test Name"
                  placeholder=" "
                  disabled
                  value={state?.data?.TestName}
                />
              </div>
            </div>
            <div className="row pt-2 pl-2 pr-2">
              <div className="col-sm-12">
                <ReactSelect
                  dynamicOptions={HelpMenu}
                  name="HelpMenuId"
                  lable="Help Menu"
                  id="Help Menu"
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
              style={{
                border: "1px solid black",
                padding: "20px",
                //   width: "500px",
              }}
            >
              <h5>{t("Details")} : </h5>
              <span className="text-center">{Value}</span>
            </div>
          </div>
        </div>
        {load ? (
          <Loading />
        ) : (
          <div className="row pt-2 pl-2 pr-2 pb-2">
            <div className="col-sm-1">
              <input
                type="checkbox"
                name="isBold"
                id="isBold"
                onChange={handleChange}
                checked={formData?.isBold == "1" ? true : false}
              />
              <label className="ml-2" htmlFor="isBold">
                {" "}
                {t("IsBold")}
              </label>
            </div>
            <div className="col-sm-1">
              <button
                disabled={formData?.HelpMenuId == ""}
                className="btn btn-success btn-block btn-sm"
                onClick={MapHelpMenu}
              >
                {t("Map")}
              </button>
            </div>
            <div className="col-sm-1">
              <button
                disabled={formData?.HelpMenuId == ""}
                className="btn btn-success btn-block btn-sm"
                onClick={UnMapHelpMenu}
              >
                {t("UnMap")}
              </button>
            </div>
            <div className="col-sm-1">
              <button
                className="btn btn-success btn-block btn-sm"
                onClick={() => {
                  handleShow();
                  setEdit(false);
                }}
                state={{ data: state?.data?.TestName }}
              >
                {t("Add New Help")}
              </button>
            </div>
            <div className="col-sm-1">
              <button
                className="btn  btn-success  btn-block btn-sm"
                disabled={formData?.HelpMenuId == ""}
                onClick={() => {
                  handleShow();
                  setEdit(true);
                }}
              >
                {t("Edit Help")}
              </button>
            </div>{" "}
            <div className="col-sm-1">
              {state?.flag ? (
                <Link
                  to="/Investigations"
                  state={{
                    other: {
                      button: "Update",
                      pageName: "Edit",
                      showButton: true,
                    },
                    url1: state?.url1,
                    url: "Investigations/UpdateInvestigation",
                  }}
                >
                  <span className="btn btn-block btn-primary btn-sm">
                    {" "}
                    {t("Back")}
                  </span>
                </Link>
              ) : (
                <button
                  className="btn btn-block btn-primary btn-sm"
                  onClick={() => navigate(-1)}
                >
                  {t("Back")}
                </button>
              )}
            </div>
          </div>
        )}
      </Accordion>
    </>
  );
};

export default InvestigationsHelpMenu;
