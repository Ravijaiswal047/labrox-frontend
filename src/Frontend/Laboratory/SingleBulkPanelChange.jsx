import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { getTrimmedData, isChecked } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useSelector } from "react-redux";
import { SearchButton } from "../../components/UI/CustomButton";
import './SingleBulkPanelChange.css';
import UltraFastSelect from "../../components/UltraFastSelect/UltraFastSelect";

const SingleBulkPanelChange = () => {
  const { t } = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
  const [RateData, setRateData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    VisitNo: "",
  });

  const handleChangeNew = (e, index) => {
    const { name, value } = e.target;
    if (name == "NewCentreID") {
      getAccessDataRate(value);
      const data = [...tableData];
      data[index][name] = value;
      data[index]["NewPanelID"] = "";
      setTableData(data);
    }
    if (name == "NewPanelID") {
      const data = [...tableData];
      data[index][name] = value;
      setTableData(data);
    }
  };

  const handleSearchSelectChange = (label, value, index) => {
    if (label === "NewCentreID") {
      const data = [...tableData];
      if (value?.value) {
        getAccessDataRate(String(value?.value));
        data[index][label] = String(value?.value);
        data[index]["NewCentre"] = value?.label?.split("~")[1];
        data[index]["NewPanelID"] = "";
      } else {
        getAccessDataRate("");
        data[index][label] = "";
        data[index]["NewCentre"] = "";
        data[index]["NewPanelID"] = "";
      }
      setTableData(data);
    }
    if (label == "NewPanelID") {
      const data = [...tableData];
      if (value?.value) {
        data[index][label] = String(value?.value);
        data[index]["NewPanel"] = value?.label?.split("~")[1];
      } else {
        data[index][label] = "";
        data[index]["NewPanel"] = "";
      }
      setTableData(data);
    }
  };
  const handelSave = () => {
    const data = [...tableData];
    if (data[0]?.NewPanelID != "" && data[0]?.NewCentreID != "") {
      // data[0] has the dropdown selections (NewCentreID, NewPanelID)
      // dataOriginal[0] has the original record (LabNo, CentreID, RateTypeID)
      const selected = data[0];
      const original = dataOriginal?.[0];

      const Payload = {
        LedgertansactionNo: String(original?.LabNo),
        centreID: original?.CentreID,
        rateTypeID: original?.RateTypeID,
        newCentreId: selected?.NewCentreID,
        newRateTypeId: selected?.NewPanelID,
        fromDate: moment(new Date()).format("YYYY-MM-DD"),
        toDate: moment(new Date()).format("YYYY-MM-DD"),
        // newReferRateId: 0
      };

      setLoading(true);
      axiosInstance
        .post(`RateType/BulkSaveRateType`, Payload)
        .then((res) => {
          if (res.data.success) {
            toast.success(res?.data?.message);
            setTableData([]);
            handelSearch("");
          } else {
            setLoading(false);
            toast.error(res.data.message);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message || err?.data?.message || t("Something Went Wrong"),
          );
          setLoading(false);
        });
    } else if (data[0]?.NewCentreID == "") {
      toast.error("Please Select New Centre");
    } else {
      toast.error("Please Select New Panel");
    }
  };

  const dynamicOperation = (val, property, mode) => {
    if (mode === "sum") {
      return val?.reduce((acc, cur) => acc + Number(cur?.[property] || 0), 0);
    }
    if (mode === "concat") {
      return val?.reduce((acc, cur, index) => {
        return acc + (index ? ", " : "") + (cur?.[property] || "");
      }, "");
    }
  };
  const [dataOriginal, setDataOriginal] = useState([]);
  const handelSearch = (labNo = "") => {
    if (!labNo && formData?.VisitNo?.trim() == "") {
      toast.error("Enter Visit no.");
    } else {
      setLoading(true);
      axiosInstance
        .post(`RateType/BulkChangeRateType`, {
          LedgertansactionNo: String(labNo) || String(formData?.VisitNo),
          CentreID: 0,
          BusinessUnitID: "",
          rateTypeID: 0,
          fromDate: moment(new Date()).format("YYYY-MM-DD"),
          toDate: moment(new Date()).format("YYYY-MM-DD"),
        })
        .then((res) => {
          if (res?.data?.success) {
            setDataOriginal(res?.data?.data);
            const data = res?.data?.data;
            const val =
              data?.length > 0
                ? [
                  {
                    ...data[0],
                    NewCentreID: "",
                    NewPanelID: "",
                    NewPanel: "",
                    NewCentre: "",
                    Rate: dynamicOperation(data, "Rate", "sum"),
                    NewRate: dynamicOperation(data, "NewRate", "sum"),
                    ItemName: dynamicOperation(data, "ItemName", "concat"),
                    ItemStatus: dynamicOperation(data, "status", "concat")
                  },
                ]
                : [];
            const valOriginal = data?.map((ele) => {
              return {
                ...ele,
                Amount: String(ele?.Amount),
                TestID: String(ele?.TestID),
                PatientID: String(ele?.PatientID),
                InvestigationID: String(ele?.InvestigationID),
                IsPackage: String(ele?.IsPackage),
                DiscountAmt: String(ele?.DiscountAmt),
                DiscountOnTotal: String(ele?.DiscountOnTotal),
                OldPanelAmount: String(ele?.OldPanelAmount),
                OldPanelID: String(ele?.OldPanelID),
                OldCentreId: String(ele?.OldCentreId),
                ItemID: String(ele?.ItemID),
                NewCentreID: "",
                NewPanelID: "",
                NewPanel: "",
                NewCentre: "",
              };
            });
            setTableData(val);
            setOriginalData(valOriginal);
          } else {
            setTableData([]);
            toast.error(res?.data?.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Wents Wrong",
          );
          setLoading(false);
        });
    }
  };

  console.log("valOriginal",dataOriginal)
  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
              label: ele.Centre,
            };
          });

          setCentreData(CentreDataValue);
        })
        .catch((err) =>
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Wents Wrong",
          ),
        );
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const getAccessDataRate = (centerID) => {
      axiosInstance
        .post("Centre/getRateTypeWithCentre", {
          CentreID: centerID,
        })
        .then((res) => {
          const data = res?.data?.message;
          const val = data.map((ele) => {
            return {
              value: ele?.RateTypeID,
              label: ele?.RateTypeName,
            };
          });
          setRateData(val);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    useEffect(() => {
      getAccessDataRate("");
      getAccessCentres();
      if (reprintLabNo) {
        setFormData((prev) => ({ ...prev, VisitNo: reprintLabNo }));
        handelSearch(reprintLabNo);
      }
    }, [reprintLabNo]);

    console.log("tableData", tableData);

    return (
      <>
        {/* <Accordion
          title={t("Single Bulk Panel Change")}
          showDrop={true}
          defaultValue={true}
        > */}
        <div className="row px-2 mt-2">
          <div className="col-sm-2 ">
            <Input
              placeholder=" "
              className="required-fields"
              id="VisitNo"
              type="text"
              lable="VisitNo"
              name="VisitNo"
              value={formData?.VisitNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => handelSearch("")}
            />
          </div>
        </div>
        {/* </Accordion> */}
        <Accordion title={t("Patient Details")} defaultValue={true}>
          {loading ? (
            <Loading />
          ) : (
            <>
              {tableData?.length > 0 ? (
                <div className="row p-2">
                  <div className="col-12">
                    <Tables>
                      <thead className="cf">
                        <tr>
                          {[
                            t("S.No."),
                            t("Visit No"),
                            t("PatientName"),
                            t("Age/Gender"),
                            // t("Investigation"),
                            t("Old Centre"),
                            t("Old Panel"),
                            t("New Centre"),
                            t("New Panel"),
                          ].map((ele, index) => (
                            <th key={index}>{ele}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((ele, index) => (
                          <tr key={index}>
                            <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                            <td data-title={t("Visit No")}>
                              {ele?.LabNo}&nbsp;
                            </td>
                            <td data-title={t("PatientName")}>
                              {ele?.PName}&nbsp;
                            </td>
                            <td data-title={t("Age")}>{ele?.AgeGender}&nbsp;</td>
                            {/* <td
                              data-title={t("Investigation")}
                              style={{
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                              }}
                            >
                              {ele?.ItemName}&nbsp;
                            </td> */}
                            <td data-title={t("Old Centre")}>
                              {ele?.CentreName}&nbsp;
                            </td>
                            <td data-title={t("Old Panel")}>
                              {ele?.RateTypeName}&nbsp;
                            </td>
                            <td
                              data-title={t("New Centre")}
                              style={{ width: "15%", maxWidth: "15%" }}
                            >
                              <UltraFastSelect
                                options={[
                                  { label: "Select New Centre", value: "" },
                                  ...CentreData,
                                ]}
                                name="NewCentreID"
                                // lable={t("Centre")}
                                id="Centre"
                                placeholder={t("Select New Centre")}
                                value={ele?.NewCentreID}
                                searchable={true}
                                onChange={(label, value) =>
                                  handleSearchSelectChange(label, value, index)
                                }
                                className="required-fields"
                                openMenuOnFocus={true}
                                tabIndex={1}
                              />

                            </td>
                            <td
                              data-title={t("New Panel")}
                              style={{ width: "15%", maxWidth: "15%" }}
                            >
                              <UltraFastSelect
                                options={[
                                  { label: "Select New Client", value: "" },
                                  ...RateData,
                                ]}
                                name="NewPanelID"
                                // lable={t("Panel")}
                                id="Panel"
                                searchable={true}
                                placeholder={t("Select New Client")}
                                value={ele?.NewPanelID}
                                onChange={(label, value) =>
                                  handleSearchSelectChange(label, value, index)
                                }
                                className="required-fields"
                                openMenuOnFocus={true}
                                tabIndex={2}
                              />

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Tables>


                  </div>{" "}
                </div>
              ) : (
                <NoRecordFound />
            )}
          </>
        )}{" "}
      </Accordion>
      <Accordion title={t("Test Details")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {tableData?.length > 0 ? (
              <div className="row p-2">
                <div className="col-12">
                  <Tables>
                    <thead className="cf">
                      <tr>
                        {[
                          t("S.No."),
                          t("Investigation"),
                        ].map((ele, index) => (
                          <th key={index}>{ele}</th>
                        ))}
                      </tr>
                    </thead>
                    {/* <tbody>
                      {tableData?.map((ele, index) => (
                        <tr key={index}>
                          <td data-title={t("S.No")} style={{width: "10%"}}>{index + 1}&nbsp;</td>
                          
                          <td
                            data-title={t("Investigation")}
                            style={{
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                          >
                            {ele?.ItemName}&nbsp;
                          </td>
                        </tr>
                      ))}
                    </tbody> */}
                    <tbody>
                      {(() => {
                        let testSrNo = 1;

                        return tableData?.map((ele, rowIndex) => {
                          let tests = [];
                          try {
                            const parsed = ele?.Item ? JSON.parse(ele.Item) : [];
                            tests = Array.isArray(parsed)
                              ? parsed.map((item) => item.ItemName || "")
                              : [];
                          } catch {
                            tests = [];
                          }

                          const statuses = ele?.ItemStatus
                            ? ele.ItemStatus.split(",").map(s => s.trim())
                            : [];

                          return tests.map((test, idx) => (
                            <tr key={`${rowIndex}-${idx}`}>
                              <td data-title={t("S.No")} style={{ width: "10%" }}>
                                {testSrNo++}
                              </td>

                              <td
                                data-title={t("Investigation")}
                                className=""
                                style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                              >
                                <div
                                  className={`investigation-cell round Status-${statuses[idx] || ele.status}`}
                                  style={{ marginBottom: "4px", padding: "1px 4px" }}
                                >
                                  {test}
                                </div>
                              </td>
                            </tr>
                          ));
                        });
                      })()}
                    </tbody>
                  </Tables>


                </div>{" "}
              </div>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}{" "}
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <div className="row">
          <div className="col-sm-1 mt-1">
            <SearchButton
              text={"Save"}
              onClick={handelSave}
            />
          </div>
        </div>
      )}

    </>
  );
};

export default SingleBulkPanelChange;
