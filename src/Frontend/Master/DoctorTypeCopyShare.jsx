import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { autocompleteOnBlur } from "../../utils/helpers";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { SelectBox } from "../../components/formComponent/SelectBox";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { All_Zero } from "../../utils/Constants";
import "./DoctorTypeCopyShare.css";

const DoctorTypeCopyShare = ({ onHide, Department }) => {
  const navigate = useNavigate();
  const [DoctorDataOne, setDoctorDataOne] = useState([]);
  const [DoctorDataSecond, setDoctorDataSecond] = useState([]);
  const [dropFalse, setDropFalse] = useState(true);
  const [dropFalse1, setDropFalse1] = useState(true);
  const [load, setLoad] = useState(false);
  const [payload, setPayload] = useState({
    DoctorDataOne: "",
    DoctorDataSecond: "",
    DepartmentID: [],
    All_Zero: "1",
  });
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const { t } = useTranslation();

  const handleChange = (e, state) => {
    state(true);
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value });
  };

  const handleNormalChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleIndex = (e, state, name) => {
    switch (e.which) {
      case 38:
        if (indexMatch !== 0) {
          setIndexMatch(indexMatch - 1);
        } else {
          setIndexMatch(state?.length - 1);
        }
        break;
      case 40:
        if (state?.length - 1 === indexMatch) {
          setIndexMatch(0);
        } else {
          setIndexMatch(indexMatch + 1);
        }
        break;
      case 13:
        handleListSearch(state[indexMatch], name);
        setIndexMatch(0);
        break;
      default:
        break;
    }
  };

  const handleListSearch = (data, name) => {
    switch (name) {
      case "DoctorDataOne":
        setPayload({
          ...payload,
          [name]: data.Name,
          FromDoctorId: data.Name ? data.DoctorReferalID : "",
        });
        setIndexMatch(0);
        setDoctorDataOne([]);
        setDropFalse(false);
        break;
      case "DoctorDataSecond":
        if (!selectedDoctors.find((s) => s.value === data.DoctorReferalID)) {
          setSelectedDoctors([
            ...selectedDoctors,
            { label: data.Name, value: data.DoctorReferalID },
          ]);
        }
        setPayload({
          ...payload,
          [name]: "",
        });
        setIndexMatch(0);
        setDoctorDataSecond([]);
        setDropFalse1(false);
        break;
      default:
        break;
    }
  };

  const handleRemoveDoctor = (value) => {
    const updated = selectedDoctors.filter((s) => s.value !== value);
    setSelectedDoctors(updated);
  };

  const Save = () => {
    if (selectedDoctors.length === 0) {
      toast.error("Please select at least one To-doctor.");
      return;
    }

    setLoad(true);
    const promises = selectedDoctors.map((doc) => {
      if (payload?.FromDoctorId === doc.value) {
        return Promise.resolve({
          error: `From-doctor and To-doctor (${doc.label}) cannot be the same.`,
        });
      }
      return axiosInstance.post("DoctorShare/SaveDocCopy", {
        FromDoctorId: payload?.FromDoctorId,
        ToDoctorId: doc.value,
        DepartmentID: payload?.DepartmentID,
        All_Zero: payload?.All_Zero,
      });
    });

    Promise.all(promises)
      .then((results) => {
        setLoad(false);
        const errors = results.filter((r) => r.error).map((r) => r.error);
        if (errors.length > 0) {
          errors.forEach((err) => toast.error(err));
        }

        const successResults = results.filter((r) => r.data && r.data.message);
        if (successResults.length > 0) {
          toast.success("Share copied successfully.");
          setSelectedDoctors([]);
          setPayload({
            FromDoctorId: "",
            ToDoctorId: "",
            DoctorDataOne: "",
            DoctorDataSecond: "",
            DepartmentID: [],
            All_Zero: "1",
          });
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Something went wrong");
        setLoad(false);
      });
  };

  const getDoctorSuggestion = (name, state) => {
    axiosInstance
      .post("DoctorReferal/getDoctorData", {
        DoctorName: name,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => {
          return {
            Name: ele?.Name,
            DoctorReferalID: ele?.DoctorReferalID,
          };
        });
        state(val);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (payload?.DoctorDataSecond.length > 1) {
      getDoctorSuggestion(payload?.DoctorDataSecond, setDoctorDataSecond);
    }
  }, [payload?.DoctorDataSecond]);

  useEffect(() => {
    if (payload?.DoctorDataOne?.length > 1) {
      getDoctorSuggestion(payload?.DoctorDataOne, setDoctorDataOne);
    }
  }, [payload?.DoctorDataOne]);
  return (
    <>
      <Accordion
        name={t("Doctor Type Copy Share")}
        isBreadcrumb={onHide ? false : true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <Input
              className="required-fields"
              id="From Doctor"
              lable="From Doctor"
              placeholder=" "
              type="text"
              name="DoctorDataOne"
              value={payload.DoctorDataOne}
              onChange={(e) => handleChange(e, setDropFalse)}
              onKeyDown={(e) => handleIndex(e, DoctorDataOne, "DoctorDataOne")}
              onBlur={(e) => {
                autocompleteOnBlur(setDoctorDataOne);
                setTimeout(() => {
                  const data = DoctorDataOne.filter(
                    (ele) => ele?.Name === e.target.value,
                  );
                  if (data?.length === 0) {
                    setPayload({ ...payload, DoctorDataOne: "" });
                  }
                }, 500);
              }}
              autoComplete="off"
            />
            {dropFalse && DoctorDataOne?.length > 0 && (
              <ul
                className="suggestion-data"
                style={{ top: "33px", width: "100%", right: "0px" }}
              >
                {DoctorDataOne.map((data, index) => (
                  <li
                    onClick={() => handleListSearch(data, "DoctorDataOne")}
                    className={`${index === indexMatch && "matchIndex"}`}
                    key={index}
                  >
                    {data?.Name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-sm-2 d-flex">
            <div className="flex-grow-1">
              <Input
                className="required-fields"
                id="To Doctor"
                lable="To Doctor"
                placeholder=" "
                type="text"
                name="DoctorDataSecond"
                value={payload.DoctorDataSecond}
                onChange={(e) => handleChange(e, setDropFalse1)}
                onKeyDown={(e) =>
                  handleIndex(e, DoctorDataSecond, "DoctorDataSecond")
                }
                onBlur={(e) => {
                  autocompleteOnBlur(setDoctorDataSecond);
                  setTimeout(() => {
                    const data = DoctorDataSecond.filter(
                      (ele) => ele?.Name === e.target.value,
                    );
                    if (data?.length === 0) {
                      setPayload({ ...payload, DoctorDataSecond: "" });
                    }
                  }, 500);
                }}
                autoComplete="off"
              />
              {dropFalse1 && DoctorDataSecond?.length > 0 && (
                <ul
                  className="suggestion-data"
                  style={{ top: "33px", width: "100%", right: "0px" }}
                >
                  {DoctorDataSecond.map((data, index) => (
                    <li
                      onClick={() => handleListSearch(data, "DoctorDataSecond")}
                      className={`${index === indexMatch && "matchIndex"}`}
                      key={index}
                    >
                      {data?.Name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedDoctors.length > 0 && (
              <span className="d-flex align-items-center counticon">
                {selectedDoctors.length}
                <i
                  className="bi bi-info-circle-fill infoIcon_cls"
                  data-tooltip-id="doctor-tooltip"
                ></i>
                <ReactTooltip
                  id="doctor-tooltip"
                  place="top"
                  clickable={true}
                  content={
                    <div>
                      <h6 className="mb-1 border-bottom">
                        Selected Doctors ({selectedDoctors.length})
                      </h6>
                      <ul className="mb-0 pl-3" style={{ listStyle: "none" }}>
                        {selectedDoctors.map((doc, idx) => (
                          <li
                            key={doc.value}
                            className="mb-2 d-flex justify-content-between align-items-center"
                          >
                            <span>
                              {idx + 1}. {doc.label}
                            </span>
                            <i
                              className="fa fa-times ml-2"
                              style={{ cursor: "pointer", color: "red" }}
                              onClick={() => handleRemoveDoctor(doc.value)}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                  style={{ zIndex: 9999 }}
                />
              </span>
            )}
          </div>
          <div className="col-sm-2">
            <MultiSelectComp
              label="Department"
              name="DepartmentID"
              options={Department}
              value={payload?.DepartmentID}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              lable="All/Zero Rate"
              name="All_Zero"
              options={All_Zero}
              selectedValue={payload?.All_Zero}
              onChange={handleNormalChange}
            />
          </div>
          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={Save}
              >
                {t("Save")}
              </button>
            )}
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-block btn-primary btn-sm"
              onClick={() => (onHide ? onHide() : navigate(-1))}
            >
              {onHide ? t("Close") : t("Back")}
            </button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DoctorTypeCopyShare;
