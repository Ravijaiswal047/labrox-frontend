import React, { useEffect, useState } from "react";
import CustomTable from "../../components/Table/CustomTable";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Input from "../../components/formComponent/Input";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import { notify } from "../../utils/utils";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../utils/axiosInstance";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const EditCustomizeDate = () => {
  const [t] = useTranslation();
  const repritRowData = useSelector(
    (state) => state.loadingSlice.repritRowData
  );
  const [tableData, setTableData] = useState([]);

  const tableHeaders = [
    { header: t("S.No"), field: "SrNo" },
    { header: t("Visit No."), field: "VisitNo" },
    { header: t("Test Name"), field: "Investigation" },
    { header: t("Reg. Date & Time"), field: "RegistrationDate" },
    { header: t("S.Collection Date & Time"), field: "SampleCollectionDate" },
    { header: t("Prev.SColl Date & Time"), field: "PreSampleCollectionDate" },
    { header: t("Dept.Receive Date & Time"), field: "SampleReceiveDate" },
    { header: t("Result Date & Time"), field: "ResultEnteredDate" },
    { header: t("Approval Date & Time"), field: "ApprovedDate" },
    { header: t("Update"), field: "Update" },
  ];

  const dateFields = [
    "RegistrationDate",
    "SampleCollectionDate",
    "PreSampleCollectionDate",
    "SampleReceiveDate",
    "ApprovedDate",
    "ResultEnteredDate",
  ];

  const parseDate = (val) =>
    val ? dayjs(val, "DD-MMM-YYYY HH:mm:ss").toDate() : null;

  const mergeDateChange = (oldValue, newDate) => {
    if (!newDate) return oldValue; // keep blank

    const newD = new Date(newDate);

    if (!oldValue) return newD; // blank old date --> only date, no time merge

    const old = new Date(oldValue);
    newD.setHours(old.getHours(), old.getMinutes(), old.getSeconds());
    return newD;
  };

  const mergeTimeChange = (oldValue, newTime) => {
    // If old date is null → keep null always
    if (!oldValue) return null;

    if (!newTime) return oldValue;

    const old = new Date(oldValue);

    let hours, minutes, seconds;

    if (typeof newTime === "string") {
      const parts = newTime.split(":");
      hours = parseInt(parts[0]);
      minutes = parseInt(parts[1]);
      seconds = parseInt(parts[2] || 0);
    } else if (newTime?.$d instanceof Date) {
      const d = newTime.$d;
      hours = d.getHours();
      minutes = d.getMinutes();
      seconds = d.getSeconds();
    } else if (newTime instanceof Date) {
      hours = newTime.getHours();
      minutes = newTime.getMinutes();
      seconds = newTime.getSeconds();
    }

    old.setHours(hours, minutes, seconds);
    return old;
  };

  const getCustomizeData = () => {
    const payload = { TestId: repritRowData?.TestIDDetail?.split(",") };

    axiosInstance
      .post("RE/CustomizedDate", payload)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          toast.error(res?.data?.message, "error");
          setTableData([]);
          return;
        }

        const formatted = res.data.message.map((item, i) => {
          const mapped = {
            ...item,
            SrNo: i + 1,
            Investigation: item.TestName,
            Update: false,
          };

          dateFields.forEach((key) => {
            mapped[key] = parseDate(item[key]);
          });

          return mapped;
        });

        setTableData(formatted);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (repritRowData?.TestIDDetail) getCustomizeData();
  }, [repritRowData?.TestIDDetail]);

  console.log("tableData",tableData);

  const updateValue = (index, field, value) => {
    const rows = [...tableData];
    rows[index][field] = value;
    setTableData(rows);
  };

  const renderDateTimeCell = (value, index, field, row) => {
    let isDisabled = true;

    if (field === "ResultEnteredDate") {
      isDisabled = !(row.ResultFlag === 1);
    } else if (field === "ApprovedDate") {
      isDisabled = !(row.Approved === 1);
    } else {
      isDisabled = !value;
    }

    return (
      <>
        <DatePicker
          value={value || null}
          disabled={isDisabled}
          onChange={(date) =>
            updateValue(index, field, mergeDateChange(value, date))
          }
        />

        <CustomTimePicker
          value={value || null}
          disabled={isDisabled}
          onChange={(time) =>
            updateValue(index, field, mergeTimeChange(value, time))
          }
        />
      </>
    );
  };

  const renderData = tableData.map((row, index) => {
    const r = { ...row };

    dateFields.forEach((field) => {
      r[field] = renderDateTimeCell(row[field], index, field, row);
    });

    r.Update = (
      <input
        type="checkbox"
        checked={row.Update}
        onChange={() => updateValue(index, "Update", !row.Update)}
      />
    );

    return r;
  });

  const formatForAPI = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;

    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hh}:${mm}:${ss}`;
  };

  const handleUpdate = () => {
    const selected = tableData.filter((r) => r.Update);

    if (!selected.length)
      return notify("Kindly select row to update Date.", "warn");

    const formattedData = selected.map((r) => ({
      ledgerTransactionNo: r.VisitNo,
      testIdHash: r.TestIdHash,
      sampleDate: formatForAPI(r.SampleCollectionDate),
      date: formatForAPI(r.RegistrationDate),
      approvedDate: formatForAPI(r.ApprovedDate),
      preSampleCollectionDate: formatForAPI(r.PreSampleCollectionDate),
      sampleReceiveDate: formatForAPI(r.SampleReceiveDate),
      resultEnteredDate: r.ResultEnteredDate, // untouched
      isSampleCollected: r.IsSampleCollected,
      resultFlag: r.ResultFlag,
      approved: r.Approved,
    }));

    axiosInstance
      .post("RE/UpdateCustomizedDate", { data: formattedData })
      .then((res) => {
        console.log(res);
        if (!res?.data?.status) {
          toast.success("Record Updated Successfully");
          return;
        }
        toast.success("Record Updated Successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="card">
      {/* <div className="row">
        <div className="col-sm-2 col-6">
          <Input lable={"Enter Visit No."} />
        </div>
        <SearchButton text={t("Search")} />
      </div> */}

      <CustomTable columns={tableHeaders} data={renderData} />

      <div className="d-flex justify-content-end">
        <SaveButton
          text={t("Update")}
          className="my-2"
          style={{ width: 100 }}
          onClick={handleUpdate}
        />
      </div>
    </div>
  );
};

export default EditCustomizeDate;
