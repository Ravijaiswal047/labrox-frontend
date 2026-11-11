import React, { use, useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { useSSR, useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { FaPlus } from "react-icons/fa";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";

const NepalDateEditor = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([
    {
      Date: "2025-10-31",
      NepalDate: "2082-07-14",
      NepalMonthYear: "Kartik 2082",
      selected: false,
    },
    {
      Date: "2025-10-30",
      NepalDate: "2082-07-13",
      NepalMonthYear: "Kartik 2082",
      selected: false,
    },
  ]);

  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
  });

  const { t } = useTranslation();

  const dateSelect = (value, name) => {
    const d = new Date(value);
    const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));



  };
  const handleSelectChange = (index, isSelected) => {
    const updated = [...tableData];
    updated[index] = { ...updated[index], selected: isSelected };

    if (isSelected) {
      updated.splice(index + 1, 0, {
        ...updated[index],
        Date: updated[index].DATE || "",
        NepalDate: updated[index].nepal_date || "",
        NepalMonthYear: updated[index].nepal_month_year || "",
        isNew: true,
        isUserAdded: false,
        selected: false,
        parentIndex: index,
      });
    } else {

      const newRowIndex = updated.findIndex(
        (r) => r.isNew && r.parentIndex === index
      );
      if (newRowIndex !== -1) updated.splice(newRowIndex, 1);
    }

    setTableData(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index] = { ...updated[index], [field]: value.trimStart() };
    setTableData(updated);
  };

  const handleConfirmNewRow = (index) => {
    const updated = [...tableData];
    const row = updated[index];

    const cleanDate = (row.Date || row.DATE)?.trim();
    const cleanNepalDate = (row.NepalDate || row.nepal_date)?.trim();
    const cleanMonthYear = (row.NepalMonthYear || row.nepal_month_year)?.trim();

    if (!cleanDate || !cleanNepalDate || !cleanMonthYear)
      return toast.error("Please fill all fields before confirming.");


    if (row.parentIndex !== undefined) {
      updated[row.parentIndex] = {
        ...updated[row.parentIndex],
        DATE: cleanDate,
        nepal_date: cleanNepalDate,
        nepal_month_year: cleanMonthYear,
        selected: false,
        isUserAdded: true,
      };
    }


    updated.splice(index, 1);
    console.log("saved-data", row)

    setTableData(updated);
    toast.info("Row updated. Click Save to submit.");
  };

  const handleSearch = () => {
    setLoading(true);
    axiosInstance
      .post("Nepali/GetNepaliCalendarData", {
        fromDate: payload?.FromDate,
        toDate: payload?.ToDate,
      })
      .then((res) => {
        if (res.status === 200) {
          const normalized = (res?.data?.data || []).map((row) => ({
            ID: row.ID,
            DATE: row.DATE || "",
            nepal_date: row.nepal_date || "",
            nepal_month_year: row.nepal_month_year || "",
            dtEntry: row.dtEntry || "",
            isEditing: false,
            isUserAdded: false,
            selected: false,
          }));
          setTableData(normalized);
        }
        setLoading(false);
        console.log("search-data", tableData)
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something Went Wrong");
        setLoading(false);
      });
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const formatToDDMMYYYY = (date) => {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleSave = () => {
    const data = tableData
      .filter((r) => r.isUserAdded === true)
      .map((r) => {
        const id = r.ID ?? "";
        const nepalDate = (r.NepalDate || r.nepal_date)?.trim().replace(/\//g, "-");
        const nepalMonthYear = (r.NepalMonthYear || r.nepal_month_year)?.trim();
        const engDate = (r.Date || r.DATE)?.trim();
        return `${id}#${nepalDate}#${nepalMonthYear}#${engDate}`;
      });

    console.log("Final strings:", data);


    if (!data.length)
      return toast.warn("No confirmed rows to save. Click ✓ on a row first.");

    const invalid = data.some((str) => {
      const parts = str.split("#");
      return parts.length !== 4 || parts.some((p) => !p.trim());
    });
    if (invalid)
      return toast.error("Please fill all fields in every row.");

    const payload_data = {
      data,
      fromDate: formatToDDMMYYYY(payload?.FromDate),
      toDate: formatToDDMMYYYY(payload?.ToDate),
    };

    console.log("Sending payload:", JSON.stringify(payload_data, null, 2));

    setLoading(true);
    axiosInstance
      .post("Nepali/SaveData", payload_data)
      .then((res) => {
        toast.success(res?.data?.message || "Saved Successfully");
        setTableData((prev) =>
          prev.map((r) => ({ ...r, isUserAdded: false, selected: false }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("Validation Errors:", JSON.stringify(err?.response?.data?.errors, null, 2));
        toast.error(err?.response?.data?.title || err?.response?.data?.message || "Something Went Wrong");
        setLoading(false);
      });
  };

  const handleCancelEdit = (index) => {
    const updated = [...tableData];
    const row = updated[index];


    if (row.parentIndex !== undefined) {
      updated[row.parentIndex] = {
        ...updated[row.parentIndex],
        selected: false,
      };
    }


    updated.splice(index, 1);
    setTableData(updated);
  };

  // const handleMarkForDelete = (i) => {

  // };




  return (
    <>
      <Accordion
        name="Nepal Date Editor"
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-2 align-items-end">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              placeholder=" "
              id="FromDate"
              lable="FromDate"
              maxDate={new Date()}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              placeholder=" "
              id="ToDate"
              lable="ToDate"
              maxDate={new Date()}
              minDate={new Date(payload?.FromDate)}
            />
          </div>

          {/* Search & Submit buttons */}
          <div className="col-md-4 col-sm-12 mt-10 col-12 d-flex flex-wrap align-items-center mb-2" style={{ gap: "8px" }}>
            <CustomButton
              text={"Search"}
              icon={"search"}
              onClick={handleSearch}
            />
            <SaveButton
              text={"Submit"}
              onClick={handleSave}
            />
          </div>
        </div>
      </Accordion>

      <Accordion title={t("Search Detail")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : tableData.length > 0 ? (
          <Tables>
            <thead style={{ position: "sticky", top: 0 }}>
              <tr>
                <th>{t("Sr. No")}</th>
                <th>{t("Date")}</th>
                <th>{t("Nepal Date")}</th>
                <th>{t("Nepal Month Year")}</th>
                <th>{t("Select")}</th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((ele, index) => (
                <tr
                  key={index}
                  style={
                    ele?.isNew
                      ? { background: "#eef0f0" }
                      : ele?.isUserAdded
                        ? { background: "#f0fff4" }
                        : {}
                  }
                >
                  <td data-title="Sr. No" style={{ whiteSpace: "nowrap" }}>
                    {!ele?.isNew ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            minWidth: "18px",
                          }}
                        >
                          {index + 1}
                        </span>

                        <span
                          onClick={() =>
                            handleSelectChange(index, !ele?.selected)
                          }
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: ele?.selected ? "#198754" : "#c7c7c7",
                            cursor: "pointer",
                            userSelect: "none",
                            lineHeight: "1",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: `1px solid ${ele?.selected ? "#198754" : "#b8b4b4"
                              }`,
                          }}
                        >
                          +
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: "#aaa", fontSize: "11px" }}>
                        {index}
                      </span>
                    )}
                  </td>

                  <td data-title="Date">
                    {ele?.isNew ? (
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="DD-MM-YYYY"
                        value={ele?.Date || ""}
                        onChange={(e) =>
                          handleInputChange(index, "Date", e.target.value)
                        }
                      />
                    ) : (
                      ele?.DATE || ""
                    )}
                  </td>

                  <td data-title="Nepal Date">
                    {ele?.isNew ? (
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="YYYY/MM/DD"
                        value={ele?.NepalDate || ""}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "NepalDate",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      ele?.nepal_date || ""
                    )}
                  </td>

                  <td data-title="Nepal Month Year">
                    {ele?.isNew ? (
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="e.g. Kartik 2082"
                        value={ele?.NepalMonthYear || ""}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "NepalMonthYear",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      ele?.nepal_month_year || ""
                    )}
                  </td>

                  <td data-title="Select">
                    {ele?.isNew ? (
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-success btn-sm px-2"
                          title="Confirm changes"
                          onClick={() => handleConfirmNewRow(index)}
                        >
                          ✓
                        </button>

                        <button
                          className="btn btn-danger btn-sm px-2"
                          title="Cancel edit"
                          onClick={() => handleCancelEdit(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : ele?.selected ? (
                      <input
                        type="checkbox"
                        checked={ele?.selected || false}
                        onChange={() =>
                          handleSelectChange(index, !ele?.selected)
                        }
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default NepalDateEditor;
