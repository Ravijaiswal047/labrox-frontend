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

const MultiBulkPanelChange = () => {
  const { t } = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [RateData, setRateData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
  });

  const handleSearchSelectChange = (label, value, index) => {
    console.log({ label, value, index });
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

  // const handleCollection = (e, index) => {
  //   const { name, checked } = e.target;
  //   const datas = [...tableData];
  //   datas[index][name] = checked ? 1 : 0;
  //   setTableData(datas);
  // };

  const handelSave = () => {
    const data = [...tableData];

    const checkedData = data.filter((ele) => ele.isChecked === 1);
    if (checkedData.length === 0) {
      toast.error("Please select at least one row for update");
      return;
    }

    const invalidData = checkedData.filter(
      (ele) => !ele.NewPanelID || !ele.NewCentreID,
    );
    if (invalidData.length > 0) {
      toast.error(
        "Please select New Centre and New Panel for all selected rows",
      );
      return;
    }
    const val = originalData
      .filter((item) => item.isChecked === 1)
      .map((ele) => {
        const mergeData = data.find(
          (item) => item.LedgerTransactionNo === ele.LedgerTransactionNo,
        );
        return {
          ...ele,
          AdjustmentAmount: ele?.AdjustmentAmount?.toString(),
          NewPanelID: mergeData?.NewPanelID || ele.NewPanelID,
          NewCentreID: mergeData?.NewCentreID || ele.NewCentreID,
          NewCentre: mergeData?.NewCentre || ele?.NewCentre,
          NewPanel: mergeData?.NewPanel || ele?.NewPanel,
          isChecked: mergeData?.isChecked || ele?.isChecked,
          LabNo: ele?.LedgerTransactionNo,
        };
      });

    const mapData = {};
    val?.forEach((item) => {
      const LabNo = item?.LedgerTransactionNo;
      const DetailsItem = { ...item };
      if (!mapData[LabNo]) {
        mapData[LabNo] = {
          LabNo: LabNo,
          Details: [DetailsItem],
        };
      } else {
        mapData[LabNo]?.Details.push(DetailsItem);
      }
    });
    const groupedData = Object.values(mapData);

    setLoading(true);
    axiosInstance
      .post("ChangePanel/SaveNewPanelRatesBulk", groupedData)
      .then((res) => {
        if (res.data.success) {
          toast.success(res?.data?.message);
          setTableData([]);
          handelSearch(); // Reload table
        } else {
          setLoading(false);
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.data?.message ? err?.data?.message : t("Something Went Wrong"),
        );
        setLoading(false);
      });
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

  const handleCollection = (e, index) => {
    const { name, checked } = e.target;
    console.log({ name, checked });
    const datas = [...tableData];
    datas[index][name] = checked ? 1 : 0;

    if (!checked) {
      datas[index].NewCentre = "";
      datas[index].NewCentreID = "";
      datas[index].NewPanel = "";
      datas[index].NewPanelID = "";
    }

    setTableData(datas);

    setOriginalData((prev) =>
      prev.map((item) =>
        item.LedgerTransactionNo === datas[index].LedgerTransactionNo
          ? { ...item, [name]: checked ? 1 : 0 }
          : item,
      ),
    );

    // setOriginalData((prev) =>
    //   prev.map((item) =>
    //     item.LedgerTransactionNo === datas[index].LedgerTransactionNo
    //       ? {
    //           ...item,
    //           [name]: checked ? 1 : 0,
    //           ...(checked
    //             ? {}
    //             : {
    //                 NewCentre: "",
    //                 NewCentreID: "",
    //                 NewPanel: "",
    //                 NewPanelID: "",
    //               }),
    //         }
    //       : item
    //   )
    // );
  };

  const handleCheckbox = (e) => {
    const { checked } = e.target;
    const data = tableData?.map((ele) => {
      return {
        ...ele,
        isChecked: checked ? 1 : 0,
        ...(checked
          ? {}
          : {
              NewCentre: "",
              NewCentreID: "",
              NewPanel: "",
              NewPanelID: "",
            }),
      };
    });
    setTableData(data);
    const dataOriginal = originalData?.map((ele) => {
      return {
        ...ele,
        isChecked: checked ? 1 : 0,
      };
    });
    setOriginalData(dataOriginal);
  };

  const handelSearch = () => {
    setLoading(true);
    axiosInstance
      .post("ChangePanel/SearchBulkPanel", {
        searchdata: getTrimmedData({
          FromDate: moment(formData?.FromDate).format("DD-MMM-YYYY"),
          ToDate: moment(formData?.ToDate).format("DD-MMM-YYYY"),
        }),
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          const val =
            data?.length > 0
              ? data?.map((item) => {
                  return {
                    ...item,
                    NewCentreID: "",
                    NewPanelID: "",
                    NewPanel: "",
                    NewCentre: "",
                    ItemName: dynamicOperation(
                      data.filter(
                        (x) =>
                          x.LedgerTransactionNo === item.LedgerTransactionNo,
                      ),
                      "ItemName",
                      "concat",
                    ),
                  };
                })
              : [];

          const finalData = val.filter((item, index, self) => {
            console.log({ item, index, self });
            return (
              index ===
              self.findIndex(
                (all) => all.LedgerTransactionNo === item.LedgerTransactionNo,
              )
            );
          });
          setTableData(finalData);

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
  };

  console.log({ tableData });
  console.log({ originalData });

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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
      .catch((err) => console.log(err));
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
  }, []);

  return (
    <>
      <Accordion
        title="Single Bulk Panel Change"
        showDrop={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              id="From Date"
              lable="FromDate"
              value={formData?.FromDate}
              onChange={dateSelect}
              maxDate={new Date(formData?.ToDate)}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              id="To Date"
              lable="ToDate"
              name="ToDate"
              value={formData?.ToDate}
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={new Date(formData.FromDate)}
            />
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-block btn-info btn-sm"
              onClick={handelSearch}
            >
              {t("Search")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Details")} defaultValue={true}>
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
                          t("Age"),
                          t("Gender"),
                          t("Investigation"),
                          t("Old Centre"),
                          t("Old Panel"),
                          t("New Centre"),
                          t("New Panel"),
                          <input
                            type="checkbox"
                            checked={
                              tableData.length > 0
                                ? isChecked(
                                    "isChecked",
                                    tableData,
                                    true,
                                  ).includes(false)
                                  ? false
                                  : true
                                : false
                            }
                            onChange={handleCheckbox}
                          />,
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
                            {ele?.LedgerTransactionNo}&nbsp;
                          </td>
                          <td data-title={t("PatientName")}>
                            {ele?.PName}&nbsp;
                          </td>
                          <td data-title={t("Age")}>{ele?.Age}&nbsp;</td>
                          <td data-title={t("Gender")}>{ele?.Gender}&nbsp;</td>
                          <td
                            data-title={t("Investigation")}
                            style={{
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                          >
                            {ele?.ItemName}&nbsp;
                          </td>
                          <td data-title={t("Old Centre")}>
                            {ele?.OldCentre}&nbsp;
                          </td>
                          <td data-title={t("Old Panel")}>
                            {ele?.OldPanel}&nbsp;
                          </td>
                          <td
                            data-title={t("New Centre")}
                            style={{
                              width: "15%",
                              cursor: !ele?.isChecked ? "not-allowed" : "auto",
                            }}
                          >
                            <ReactSelect
                              dynamicOptions={[
                                { label: "Select New Centre", value: "" },
                                ...CentreData,
                              ]}
                              name="NewCentreID"
                              //   lable={t("Centre")}
                              id="Centre"
                              placeholderName={t("Select New Centre")}
                              value={ele?.NewCentreID}
                              onChange={(label, value) =>
                                handleSearchSelectChange(label, value, index)
                              }
                              isDisabled={!ele?.isChecked ? true : false}
                            />
                          </td>
                          <td
                            data-title={t("New Panel")}
                            style={{
                              width: "15%",
                              cursor: !ele?.isChecked ? "not-allowed" : "auto",
                            }}
                          >
                            <ReactSelect
                              dynamicOptions={[
                                { label: "Select New Client", value: "" },
                                ...RateData,
                              ]}
                              name="NewPanelID"
                              //   lable={t("Panel")}
                              id="Panel"
                              placeholderName={t("Select New Client")}
                              value={ele?.NewPanelID}
                              isDisabled={!ele?.isChecked ? true : false}
                              onChange={(label, value) =>
                                handleSearchSelectChange(label, value, index)
                              }
                            />
                          </td>
                          <td data-title="#">
                            <input
                              type="checkbox"
                              checked={ele?.isChecked}
                              name="isChecked"
                              onChange={(e) => handleCollection(e, index)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>

                  {loading ? (
                    <Loading />
                  ) : (
                    <div className="row">
                      <div className="col-sm-1 mt-1">
                        <button
                          className="btn btn-block btn-success btn-sm"
                          onClick={handelSave}
                        >
                          {t("Save")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>{" "}
              </div>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}{" "}
      </Accordion>
    </>
  );
};

export default MultiBulkPanelChange;
