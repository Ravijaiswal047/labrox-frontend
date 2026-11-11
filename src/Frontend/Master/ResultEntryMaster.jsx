import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import Button from "../../components/formComponent/Button";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { validationForMasterRanges } from "../../utils/Schema";

const ResultEntryMaster = () => {
  const [MapTest, setMapTest] = useState([]);
  const [load, setLoad] = useState(false);
  const [disable, setDisable] = useState({
    update: true,
    loading: false,
  });

  const [err, setErr] = useState({});
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    InvestigationId: "",
    TestName: "",
    Result: "",
    Value: "",
  });
  const { t } = useTranslation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // if (!/^\d*-?\d*$/.test(value)) return;

    const specialChar = /^[^a-zA-Z0-9]+$/;
    if (name === "Result") {
      if (value == "" || specialChar.test(value)) {
        setPayload({
          ...payload,
          [name]: value,
        });
      }
    } else {
      setPayload({
        ...payload,
        [name]: value,
      });
    }
  };

  const handleChange2 = (e, index) => {
    const { name, value } = e.target;
    const specialChar = /^[^a-zA-Z0-9]+$/;
    if (name === "Result") {
      if (value == "" || specialChar.test(value)) {
        setTableData((prev) =>
          prev.map((data, i) => {
            if (i === index) {
              let updatedData = { ...data, [name]: value };
              console.log({ updatedData });
              return updatedData;
            }
            return data;
          }),
        );
      }
    } else {
      setTableData((prev) =>
        prev.map((data, i) =>
          i === index ? { ...data, [name]: value } : data,
        ),
      );
    }
  };

  const handleSearchSelectChange = (label, value) => {
    setPayload({
      ...payload,
      ["TestName"]: value?.label,
      ["InvestigationId"]: value?.value,
    });
  };

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res.data.message;
        let MapTest = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
            DataType: ele?.DataType,
          };
        });
        const testData = MapTest?.filter((ele) => ele?.DataType == "Test");
        setMapTest(testData);
      })
      .catch((err) => console.log(err));
  };

  const handleAddTestRange = () => {
    let generatedError = validationForMasterRanges(payload);
    if (generatedError === "") {
      if (payload?.TestName && payload?.Result && payload?.Value) {
        const newRows = {
          InvestigationID: payload?.InvestigationId,
          TestName: payload?.TestName,
          Result: payload?.Result,
          Value: payload?.Value,
          ID: 0,
        };

        setTableData((prevData) => [...prevData, newRows]);
        toast.success(" row added successfully");
        setErr({});
        setPayload({
          ...payload,
          Result: "",
          Value: "",
        });
      }
    } else {
      setErr(generatedError);
    }
  };

  const fetch = (payloads) => {
    setLoad(true);
    axiosInstance
      .post("Investigations/SearchTestRanges", {
        InvestigationID: payloads,
      })
      .then((res) => {
        if (res?.data?.success) {
          setDisable({
            ...disable,
            update: res?.data?.message.length > 0 ? true : false,
          });
          const data = res.data?.message.length > 0 ? res.data?.message : "";
          let val = data.map((ele) => {
            return {
              InvestigationID: ele?.InvestigationID,
              TestName: ele?.TestName,
              Result: ele?.Result,
              Value: ele?.Value,
              ID: ele?.ID,
            };
          });
          setTableData(val);
        } else {
          setDisable({
            update: false,
            loading: false,
          });
          setTableData([]);
          toast.error("No Record Found");
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
  };

  console.log({ tableData });

  useEffect(() => {
    getInvestigationList();
  }, []);

  const handleDeleteTestData = (index) => {
    setTableData((data) => data.filter((_, i) => i !== index));
  };

  const handleSubmit = (url) => {
    setDisable({ ...disable, loading: true });
    const TableData = tableData.map(
      ({ TestName, InvestigationID, ...rest }) => rest,
    );

    const InvestigationID = payload?.InvestigationId;

    axiosInstance
      .post(url, { InvestigationID, Ranges: TableData })
      .then((res) => {
        toast.success(res?.data?.message);
        fetch(payload?.InvestigationId);
        setDisable({ ...disable, loading: false });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setDisable({ ...disable, loading: false });
      });
  };

  useEffect(() => {
    if (payload?.InvestigationId !== "") {
      fetch(payload?.InvestigationId);
    }
  }, [payload?.InvestigationId]);

  return (
    <>
      <Accordion
        name={t("Result Entry Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-3">
            <ReactSelect
              name="TestName"
              id="TestName"
              removeIsClearable={true}
              dynamicOptions={MapTest}
              placeholderName="TestName"
              value={payload?.TestName}
              onChange={handleSearchSelectChange}
              className="required-fields"
            />
            {payload?.TestName?.trim() === "" && (
              <span className="error-message">{err?.TestName}</span>
            )}
          </div>
          <div className="row pl-2 pr-2">
            <div className="pl-3">
              <Input
                lable="Result"
                id="Result"
                type="text"
                name="Result"
                value={payload?.Result}
                onChange={handleInputChange}
                placeholder=" "
                className="required-fields"
              />
              {payload?.Result?.trim() === "" && (
                <span className="error-message">{err?.Result}</span>
              )}
            </div>
            <div className="pl-3">
              <Input
                lable="Value"
                id="Value"
                type="text"
                name="Value"
                value={payload?.Value}
                onChange={handleInputChange}
                placeholder=" "
                className="required-fields"
              />
              {payload?.Value?.trim() === "" && (
                <span className="error-message">{err?.Value}</span>
              )}
            </div>
            <div className="pl-2">
              {load ? (
                <Loading />
              ) : (
                <Button
                  name={"Add"}
                  className={"btn btn-sm btn-primary mx-1"}
                  handleClick={handleAddTestRange}
                />
              )}
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion defaultValue={true}>
        <div className="row p-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Test Name")}</th>
                  <th>{t("Result")}</th>
                  <th>{t("Value")}</th>
                  <th>{t("Action")}</th>
                </tr>
              </thead>{" "}
              <tbody>
                {tableData?.map((data, index) => (
                  <tr key={index}>
                    <td>{data?.TestName}</td>
                    <td>
                      <Input
                        id="Result"
                        type="text"
                        name="Result"
                        value={data?.Result}
                        onChange={(e) => handleChange2(e, index)}
                        placeholder=" "
                      />
                    </td>
                    <td>
                      <Input
                        id="Value"
                        type="text"
                        name="Value"
                        value={data?.Value}
                        onChange={(e) => handleChange2(e, index)}
                        placeholder=" "
                      />
                    </td>
                    <td>
                      {index === tableData?.length - 1 && (
                        <i
                          className="fa fa-trash px-2"
                          onClick={() => handleDeleteTestData(index)}
                          style={{ color: "red", cursor: "pointer" }}
                        ></i>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
            {disable?.loading ? (
              <Loading />
            ) : (
              <>
                {payload?.TestName && (
                  <div className="row mt-2">
                    <div className="col-sm-1">
                      <button
                        type="button"
                        className="btn btn-block btn-success btn-sm"
                        id="btnSave"
                        onClick={() =>
                          handleSubmit("Investigations/SaveOrUpdateTestRanges")
                        }
                      >
                        {disable?.update ? t("Update") : t("Save")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ResultEntryMaster;
