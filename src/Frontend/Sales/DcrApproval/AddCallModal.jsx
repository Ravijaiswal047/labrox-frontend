import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import RadioInput from "../../../components/formComponent/DocShareRadioInput";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../../utils/axiosInstance";
import Loading from "../../../components/loader/Loading";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";

const AddCallModal = ({ show, onHide, employeeList, AddCallEmployeeList, date, empId, empName }) => {
  const navigate = useNavigate();
  const theme = useLocalStorage("theme", "get");
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const [load, setLoad] = useState(false);
  const [extisitngEmployee, setExtisitngEmployee] = useState([]);

  const [formData, setFormData] = useState({
    funnelId: "",
    employeeId: empId,
    employeeName: empName,
    travelDate: date,
  });
  const [toggle, setToggle] = useState({
    mode: "1",
  });
  const [empList, setEmpList] = useState([]);
  const [toggleType, setToggleType] = useState({
    buttons: "1",
  });

  console.log(formData);
  const handleChanges = (selected) => {
    const val = selected.map((ele) => ele.value);
    setEmpList(val);
  };

  const handleModalClose = () => {
    onHide(false);
  };

  const handleSearchSelectChange = (label, value) => {
    setFormData({ ...formData, [label]: String(value?.value) });
  };

  const getBindCreatedForDropDown = () => {
    const payload = {
      taggedType: toggle.mode === "1" ? "1" : "2",
      employeeIds: String(empList) || "",
      Type: toggleType.buttons === "1" ? "1" : "3",
    };
    axiosInstance
      .post("SalesFunnel/SearchTravelFunnel", payload)
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.FunnelId,
            label: ele?.Label,
          };
        });
        setExtisitngEmployee(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const handleAddCall = async () => {
    const payload = {
      funnelId: String(formData.funnelId),
      employeeId: String(formData.employeeId) || "",
      employeeName: formData.employeeName,
      travelDate: moment(formData.travelDate).format("YYYY-MM-DD"),
    };
    try {
      setLoad(true);
      await axiosInstance
        .post("SalesFunnel/DcrAddCallClick", payload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setLoad(false);
            handleModalClose();
          } else {
            toast.error(res?.data?.message);
            setLoad(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getBindCreatedForDropDown();
  // }, []);

  useEffect(() => {
    getBindCreatedForDropDown();
  }, [empList, toggleType.buttons]);

  return (
    <>
      <Dialog
        header={t("Add Call")}
        visible={show}
        onHide={handleModalClose}
        className={theme}
        style={{ width: isMobile ? "95vw" : "40vw" }}
        modal
      >
        <div className="row pt-2 pl-2 pr-3">
          <div className="d-flex align-items-center mb-2 pl-2">
            <RadioInput
              inputType="radio"
              className="mb-0"
              label="Self Tagged"
              id="1"
              name="mode"
              value="1"
              checked={toggle.mode === "1"}
              onChange={(e) =>
                setToggle((prev) => ({ ...prev, mode: e.target.value }))
              }
            />
            <RadioInput
              inputType="radio"
              className="mb-0"
              label="Downward Tagged"
              id="2"
              name="mode"
              value="2"
              checked={toggle.mode === "2"}
              onChange={(e) =>
                setToggle((prev) => ({ ...prev, mode: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-3">
          {toggle.mode === "2" && (
            <div className="col-sm-4">
              <SelectBoxWithCheckbox
                name="empList"
                placeholder=" "
                lable={t("Employee")}
                id="empList"
                options={AddCallEmployeeList}
                value={empList}
                onChange={handleChanges}
              />
            </div>
          )}
        </div>
        <div className="row pt-2 pl-2 pr-3">
          <div className="d-flex align-items-center mb-2 pl-2">
            <div className="form-check ">
              <input
                type="radio"
                className="form-check-input mb-0"
                id="existingMSL"
                name="buttons"
                value="1"
                checked={toggleType.buttons === "1"}
                onChange={(e) =>
                  setToggleType((prev) => ({
                    ...prev,
                    buttons: e.target.value,
                  }))
                }
              />
              <label className="fw-bold" htmlFor="existingMSL">
                Existing MSL
              </label>
            </div>

            <RadioInput
              inputType="radio"
              className="mb-0"
              label="Existing Funnel"
              id="3"
              name="buttons"
              value="3"
              checked={toggleType.buttons === "3"}
              onChange={(e) =>
                setToggleType((prev) => ({ ...prev, buttons: e.target.value }))
              }
            />
            <RadioInput
              inputType="radio"
              className="mb-0"
              label="New Client"
              id="4"
              name="buttons"
              value="4"
              checked={toggleType.buttons === "4"}
              onChange={(e) =>
                setToggleType((prev) => ({ ...prev, buttons: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-3">
          {toggleType.buttons !== "4" && (
            <div className="col-sm-4">
              <ReactSelect
                dynamicOptions={extisitngEmployee}
                name="funnelId"
                lable={t("Rate Type")}
                id="funnelId"
                removeIsClearable={true}
                placeholderName={t("Existing Client")}
                value={formData?.funnelId}
                onChange={handleSearchSelectChange}
                className="required-fields"
              />
            </div>
          )}
        </div>
        <div className="d-flex col-sm-4 mt-2 mb-2">
          {toggleType.buttons !== "4" && (
            <>
              {load ? (
                <Loading />
              ) : (
                <button
                  onClick={handleAddCall}
                  className="btn btn-block btn-success btn-sm"
                >
                  Add Save
                </button>
              )}
            </>
          )}

          {toggleType.buttons === "4" && (
            <button
              onClick={() => navigate("/funnel-createfunnel")}
              className="btn btn-block btn-success btn-sm ml-2"
            >
              Create New Funnel
            </button>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default AddCallModal;
