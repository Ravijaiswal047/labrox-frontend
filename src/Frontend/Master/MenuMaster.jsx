import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { MenuMasterValidation } from "../../utils/Schema";
import Input from "../../components/formComponent/Input";
import { number } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import Accordion from "../../components/UI/Accordion";
import Heading from "../../components/UI/Heading";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import MenuOrderModal from "./MenuMaster/MenuOrderModal";
import { FaEdit } from "react-icons/fa";
import "./MenuMaster.css";

const MenuMaster = () => {
  const payLoadConst = {
    MenuName: "",
    Priority: "",
    isActive: 1,
    Description: "",
    ID: "",
    SetMaster: 1,
  };

  const [update, setUpdate] = useState(false);
  const [load, setLoad] = useState(false);
  const [savedata, setSaveData] = useState([]);
  const [errors, setErrors] = useState({});
  const [payload, setPayload] = useState(payLoadConst);
  const [searchText, setSearchText] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false)
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleToggle = () => {
    setPayload((prev) => ({
      ...prev,
      isActive: prev.isActive === 1 ? 0 : 1,
    }));
  };

  const handleToggleSetMaster = () => {
    setPayload((prev) => ({
      ...prev,
      SetMaster: prev.SetMaster === 1 ? 0 : 1,
    }));
  };

  const fetchPageMaster = () => {
    axiosInstance
      .get("Menu/getAllMenu")
      .then((res) => {
        if (res?.data?.success) {
          setSaveData(res?.data?.message || []);
        } else {
          setSaveData([]);
          toast.error(res?.data?.message);
        }
      })
      .catch(() => toast.error("Error Occured"));
  };

  const editIDMaster = (id) => {
    setUpdate(true);
    setLoad(true);

    axiosInstance
      .post("Menu/getMenuByID", { ID: id })
      .then((res) => {
        const data = res?.data?.message?.[0];
        setPayload({
          MenuName: data?.MenuName,
          Priority: data?.Priority?.toString(),
          isActive: data?.isActive,
          Description: data?.Description,
          ID: data?.ID,
          SetMaster: data?.IsSetMaster,
          CompanyID: data?.CompanyID,
        });
        setLoad(false);
      })
      .catch(() => setLoad(false));
  };

  const colorCodingData = [
    { color: "#90ee90", id: "1", labelKey: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "In Active" },
  ];
  const handleSave = (url) => {
    const generatedError = MenuMasterValidation(payload);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(url, payload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            fetchPageMaster();
            setPayload(payLoadConst);
            setUpdate(false);
          } else {
            toast.error(res?.data?.message);
          }
          setLoad(false);
        })
        .catch(() => {
          toast.error("Error Occured");
          setLoad(false);
        });
    } else {
      setErrors(generatedError);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchText) return savedata;

    const search = searchText.toLowerCase();

    return savedata.filter(
      (item) =>
        item?.MenuName?.toLowerCase().includes(search) ||
        item?.Description?.toLowerCase().includes(search) ||
        item?.Priority?.toString().includes(search)
    );
  }, [savedata, searchText]);

  useEffect(() => {
    fetchPageMaster();
  }, []);


  const handlePriorityChange = async (items) => {
    try {
      const res = await axiosInstance.post("Menu/UpdateMenuMasterPriority", items);
      if (res?.data?.success) {
        toast.success("Priority Updated successfully");
        setShowOrderModal(false);
        fetchPageMaster();
      } else {
        toast.error(res?.data?.message || "Error while setting order")
      }
    } catch (error) {
      console.log("Error while setting order", error)
    }
  }

  return (
    <>

      <Heading name={t("Menu Master")} defaultValue isBreadcrumb />
      <div className="row pt-2 pl-2 pr-2">
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <Input
            lable="Menu Name"
            name="MenuName"
            value={payload.MenuName}
            onChange={handleChange}
            className="required-fields"
          />
          <div className="error-message">{errors?.MenuName}</div>
        </div>

        <div className="col-12 col-sm-6 col-md-2 my-1">
          <Input
            lable="Priority"
            name="Priority"
            value={payload.Priority}
            onInput={(e) => number(e, 4)}
            onChange={handleChange}
          />
          <div className="error-message">{errors?.Priority}</div>
        </div>

        <div className="col-12 col-sm-6 col-md-2 my-1">
          <Input
            lable="Description"
            name="Description"
            value={payload.Description}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-sm-6 col-md-2 my-1 d-flex">
          <div className="mr-4 d-flex align-items-center">
            <label className="switch">
              <input
                type="checkbox"
                checked={payload.isActive === 1}
                onChange={handleToggle}
              />
              <span className="slider"></span>
            </label>
            <strong className="ml-2 mb-1">{t("IsActive")}</strong>
          </div>
          <div className="d-flex align-items-center">
            <label className="switch">
              <input
                type="checkbox"
                checked={payload.SetMaster === 1}
                onChange={handleToggleSetMaster}
              />
              <span className="slider"></span>
            </label>
            <strong className="ml-2 mb-1">{t("Set Master")}</strong>
          </div>
        </div>



        <div className="col-auto my-1">
          {load ? (
            <Loading />
          ) : (
            <CustomButton
              text={update ? "Update" : "Save"}
              icon={update ? "edit" : "save"}
              onClick={() =>
                handleSave(
                  update ? "Menu/UpdateMenu" : "Menu/SaveMenuMaster",
                  update ? "Update" : "Save"
                )
              }
            />

          )}
        </div>

        <div className="col-auto my-1">
          <CustomButton
            text="Reset"
            icon="refresh"
            onClick={() => {
              setPayload(payLoadConst);
              setUpdate(false);
              setErrors({});
            }}
          />
        </div>
        <div className="col-auto my-1">
          <CustomButton
            text="Set Priority"
            onClick={() => {
              setShowOrderModal(true)
            }}
          />
        </div>
      </div>

      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        className="mm-search-accordion"
        linkTitle={
          <div className="d-flex align-items-center" style={{ gap: "5px" }}>
            <div className="d-none d-md-flex" style={{ gap: "5px" }}>
              {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
              ))}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Input
                type="text"
                placeholder="Search Menu..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        }
      >
        {load ? (
          <Loading />
        ) : (
          <div className="row ">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Menu Name</th>
                    <th>Description</th>
                    <th>Is Master</th>
                    <th>Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-danger">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((ele, index) => (
                      <tr
                        key={ele.ID}
                        style={{ backgroundColor: ele?.isActive === false ? "#f5c6cb" : "#90ee90" }}
                      >
                        <td data-title="S.No">{index + 1}</td>
                        <td data-title="Menu Name">{ele?.MenuName || "-"}</td>
                        <td data-title="Description">{ele?.Description || "-"}</td>
                        <td data-title="Is Master">{ele?.IsSetMaster == 1 ? "Yes" : "No"}</td>
                        <td data-title="Priority">{ele?.Priority || "-"}</td>
                        <td data-title="Action">
                          <button
                            className="btn btn-sm text-white p-1"
                            onClick={() => {
                              window.scrollTo(0, 0);
                              editIDMaster(ele.ID);
                            }}
                          >
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </Tables>
            </div>
          </div>
        )}
      </Accordion>

      {showOrderModal && (
        <MenuOrderModal
          show={showOrderModal}
          onHide={() => setShowOrderModal(false)}
          controllers={savedata}
          onSave={handlePriorityChange}
        />
      )}
    </>
  );
};

export default MenuMaster;
