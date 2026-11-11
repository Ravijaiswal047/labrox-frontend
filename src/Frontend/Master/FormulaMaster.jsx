import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";

const FormulaMaster = () => {
  const [Investigation, setInvestigation] = useState([]);
  const [observationData, setObservationData] = useState([]);
  const [investigationName, setInvestigationName] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [load, setLoad] = useState({
    deleteLoad: false,
    saveLoad: false,
  });
  const [splitData, setSplitData] = useState({
    value: "",
    TestID: "",
  });
  const [splitLeft, setSplitLeft] = useState({
    Left: [],
    Right: "",
  });

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res.data.message;

        let MapTest = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });
        MapTest.unshift({ label: "Select...", value: "" });
        setInvestigation(MapTest);
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (e) => {
    const { value } = e.target;
    const findvalue = observationData.find((ele) => ele.TestID == value);
    setSplitData({
      ...splitData,
      value: findvalue?.TestName,
      TestID: findvalue?.TestID,
    });
  };
  console.log(splitData);
  const handleChangeRight = (e) => {
    const { name, value } = e.target;
    setSplitLeft({
      ...splitLeft,
      [name]: value,
    });
  };

  console.log(splitLeft);

  const handleEvent = (name) => {
    if (splitData.TestID !== "") {
      const data = splitData.value.split("#");
      if (name === "Left") {
        handleDuplicate().then((res) => {
          if (res.length > 0) {
            setSplitLeft({
              ...splitLeft,
              [name]: data,
              Right: res?.[0]?.formula,
            });
          } else {
            setSplitLeft({
              ...splitLeft,
              [name]: data,
            });
          }
        });
      }
      if (name === "Right") {
        setSplitLeft({
          ...splitLeft,
          [name]:
            splitLeft?.Right !== ""
              ? `${splitLeft?.Right}${data[1]}&`
              : `${data[1]}&`,
        });
      }
    }
  };

  const handleDuplicate = () => {
    return new Promise((resolve, reject) => {
      axiosInstance
        .post("FormulaMaster/getFormulaData", {
          TestID: splitData?.TestID,
        })
        .then((res) => {
          resolve(res?.data?.message);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          reject(err);
        });
    });
  };

  const handleDelete = () => {
    if (splitLeft?.Right !== "" && splitData?.TestID !== "") {
      setLoad({ ...load, deleteLoad: true });
      axiosInstance
        .post("FormulaMaster/DeleteFormulaMasterRecord", {
          Formula: splitLeft?.Right,
          TestID: splitLeft?.Left[1],
        })
        .then((res) => {
          toast.success(res?.data?.message);
          setLoad({ ...load, deleteLoad: false });
          setSplitData({
            value: "",
            TestID: "",
          });
          setSplitLeft({
            ...splitLeft,
            Right: "",
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad({ ...load, deleteLoad: false });
        });
    } else {
      toast.error("please Select one Value");
    }
  };

  const getObservationData = (id) => {
    setLoading(true);
    axiosInstance
      .post("FormulaMaster/getObservationData", {
        InvestigationID: id,
      })
      .then((res) => {
        setObservationData(res?.data?.message);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setLoading(false);
      });
  };

  const handleSubmit = () => {
    if (splitLeft?.Right !== "" && splitData?.TestID !== "") {
      setLoad({ ...load, saveLoad: true });
      axiosInstance
        .post("FormulaMaster/saveFormulaMaster", {
          Formula: splitLeft?.Right,
          TestID: splitLeft?.Left[1],
        })
        .then((res) => {
          toast.success(res.data?.message);
          setLoad({ ...load, saveLoad: false });
          setSplitData({
            value: "",
            TestID: "",
          });
          setSplitLeft({
            ...splitLeft,
            Right: "",
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad({ ...load, saveLoad: false });
        });
    } else {
      toast.error("please Enter Formula or Choose TestID");
    }
  };

  useEffect(() => {
    getInvestigationList();
  }, []);
  return (
    <>
      <Accordion
        name={t("Formula Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-3">
            <ReactSelect
              placeholderName="Investigation"
              dynamicOptions={Investigation}
              searchable={true}
              value={investigationName}
              onChange={(_, e) => {
                setInvestigationName(e?.value);
                getObservationData(e?.value);
                setSplitData({
                  value: "",
                  TestID: "",
                });
                setSplitLeft({
                  Left: [],
                  Right: "",
                });
              }}
            />
            {loading ? (
              <div className="mt-3">
                <Loading />
              </div>
            ) : (
              <select
                multiple
                className="form-control formula-tag"
                onChange={handleChange}
              >
                {observationData.map((ele, index) => (
                  <option key={index} value={ele?.TestID} className="p-2">
                    {ele?.TestName}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="col-sm-1 center">
            <button
              className="btn btn-block btn-info btn-sm"
              onClick={() => handleEvent("Left")}
            >
              {t("Left")}
            </button>
          </div>
          <div className="col-sm-1 center">
            <button
              className="btn btn-block btn-info btn-sm"
              onClick={() => handleEvent("Right")}
            >
              {t("Right")}
            </button>
          </div>
          <div className="col-sm-2">
            <Input
              className="form-control ui-autocomplete-input input-sm"
              value={splitLeft?.Left[0]}
              readOnly
            />
            <Input
              className="form-control ui-autocomplete-input input-sm"
              value={splitLeft?.Left[1]}
              readOnly
            />
          </div>
          <div className="col-sm-1 ">
            <div className="pi pi-equals"></div>
          </div>
          <div className="col-sm-3">
            <input
              className="form-control ui-autocomplete-input formula-tag"
              style={{ height: "100px !important" }}
              value={splitLeft?.Right}
              name="Right"
              type="text"
              onChange={handleChangeRight}
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2 mt-1">
          {load?.saveLoad ? (
            <Loading />
          ) : (
            <div className="col-sm-1 mb-1">
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={handleSubmit}
              >
                {t("Save")}
              </button>
            </div>
          )}
          {load?.deleteLoad ? (
            <Loading />
          ) : (
            <div className="col-sm-1 mb-1">
              <button
                className="btn btn-block btn-danger btn-sm"
                onClick={handleDelete}
              >
                {t("Delete")}
              </button>
            </div>
          )}
        </div>
      </Accordion>
    </>
  );
};

export default FormulaMaster;
