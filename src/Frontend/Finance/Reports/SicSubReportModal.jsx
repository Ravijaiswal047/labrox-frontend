import React, { useEffect, useState } from "react";
import Heading from "../../../components/UI/Heading";
import Tables from "../../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import {
  FinanceSaveSICApproved,
  FinanceShowApprovalDetails,
} from "../../../NetworkServices/finance.js";
import moment from "moment";
import { notify } from "../../../utils/ustil2";

const SicSubReportModal = ({ val, data, handleClose }) => {
  debugger;
  const [t] = useTranslation();
  const [tableData, setTableData] = useState([""]);

  const [values, setValues] = useState({
    Status: { label: "All", value: "2" },
  });
  const [amount, setAmount] = useState({});
  console.log("Values", values);

  const handleAllCheckbox = (e) => {
    const checked = e.target.checked;
    const updatedData = tableData?.map((item) => {
      if (item?.isApprovedforFinancePost === 0) {
        return {
          ...item,
          isChecked: checked,
        };
      } else {
        return item;
      }
    });
    setTableData(updatedData);
  };
  const THEAD = [
    {
      name: (
        <input
          type="checkbox"
          className="table-checkbox"
          onChange={(e) => handleAllCheckbox(e)}
          checked={tableData?.every((item) => item.isChecked)}
        />
      ),
      width: "1%",
    },
    { name: "S.No", width: "1%" },
    { name: "Bill No." },
    { name: "Amount" },
    { name: "Status" },
    { name: "Approved By" },
    { name: "Approved Date" },
  ];

  const modalData = async () => {
    const payload = {};
    payload.branchCentreID = Number(data?.Centre?.value);
    payload.fromDate = moment(data.fromDate).format("DD-MMM-YYYY");
    payload.toDate = moment(data.toDate).format("DD-MMM-YYYY");
    payload.type = val.TypeID;
    payload.subHeadID = val.SubHeadID;
    payload.subTypeName = val.SubTypeName;
    const response = await FinanceShowApprovalDetails(payload);
    if (response?.success) {
      setTableData(
        response?.data?.map((val) => ({ ...val, isChecked: false }))
      );
      setValues((val) => ({
        ...val,
        tableData: response?.data,
      }));
    }
  };

  useEffect(() => {
    modalData();
  }, []);

  const getRowClass = (val, index) => {
    if (
      index === "" ||
      index === "undefined" ||
      tableData?.length === 0 ||
      tableData?.length === "undefined"
    ) {
      return;
    }
    console.log("index", index, tableData?.length);
    const data = Array.isArray(tableData) ? tableData[index] : [];
    if (data?.isApprovedforFinancePost === 1) {
      return "color-indicator-7-bg";
    }
  };

  useEffect(() => {
    const totalAmount = tableData?.reduce((acc, val) => acc + val?.Amount, 0);
    const filteredApprovedAmount = tableData?.filter(
      (val) => val?.isApprovedforFinancePost === 1
    );
    const filteredPendingAmount = tableData?.filter(
      (val) => val?.isApprovedforFinancePost === 0
    );
    const approvedAmount = filteredApprovedAmount?.reduce(
      (acc, val) => acc + val?.Amount,
      0
    );

    const totalPendingAmount = filteredPendingAmount?.reduce(
      (acc, val) => acc + val?.Amount,
      0
    );
    setAmount((val) => ({
      ...val,
      totalAmount: totalAmount,
      approvedAmount: approvedAmount,
      totalPendingAmount: totalPendingAmount,
    }));
  }, [tableData]);

  useEffect(() => {
    debugger;
    if (values?.Status?.value === "1") {
      const filteredApprovedAmount = values?.tableData?.filter(
        (val) => val?.isApprovedforFinancePost === 1
      );
      setTableData(filteredApprovedAmount);
    } else if (values?.Status?.value === "0") {
      const filteredPendingAmount = values?.tableData?.filter(
        (val) => val?.isApprovedforFinancePost === 0
      );
      setTableData(filteredPendingAmount);
    } else {
      setTableData(values?.tableData);
    }
  }, [values?.Status?.value]);

  const handleApproved = async () => {
    debugger;
    const filteredData = tableData?.filter((val) => val.isChecked === true);
    if (filteredData?.length === 0) {
      notify("Please Select Atleast One Bill No.", "warn");
      return;
    }
    const payload = {
      grnDataLists: tableData
        ?.filter((val) => val.isChecked === true)
        ?.map((item) => ({
          entryDetailIDs: item?.EntryDetailIDs,
        })),
    };

    const response = await FinanceSaveSICApproved(payload);
    if (response?.success) {
      notify(response?.message, "success");
      modalData();
    } else {
      notify(response?.message, "error");
    }
  };

  const handleCheckboxChange = (e, index) => {
    const updatedTableData = [...tableData];

    updatedTableData[index] = {
      ...updatedTableData[index],
      isChecked: e.target.checked,
    };

    setTableData(updatedTableData);
  };

  return (
    <div>
      <div>
        <ReactSelect
          placeholderName={t("Status")}
          id="Status"
          name="Status"
          requiredClassName={`required-fields`}
          value={values?.Status?.value}
          removeIsClearable={true}
          handleChange={(name, value) =>
            setValues((val) => ({ ...val, [name]: value }))
          }
          dynamicOptions={[
            { label: "All", value: "2" },
            { label: "Approved", value: "1" },
            { label: "Not-Approved", value: "0" },
          ]}
          searchable={true}
          respclass="col-xl-3 col-md-4 col-sm-6 col-12"
        />
        <Tables
          thead={THEAD}
          tbody={tableData?.map((val, index) => ({
            input: (
              <input
                type="checkbox"
                className="table-checkbox"
                checked={val?.isChecked}
                onChange={(e) => handleCheckboxChange(e, index)}
                disabled={val?.isApprovedforFinancePost === 1 ? true : false}
              />
            ),
            "s.no": index + 1,
            "Bill No": val.BillNo,
            Amount: val.Amount,
            Status: val.isApprovedforFinancePostStatus,
            ApprovedBy: val.ApprovedBy,
            ApprovedDate: val?.ApprovedDateTime,
          }))}
          getRowClass={getRowClass}
        />
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="w-100 pt-2 row">
          <LabeledInput
            label={"Total Amount"}
            value={amount?.totalAmount}
            className="col-xl-2 col-md-4 col-sm-6 col-12"
          />
          <LabeledInput
            label={"Total Approved Amount"}
            value={amount?.approvedAmount}
            className="col-xl-2 col-md-4 col-sm-6 col-12"
          />
          <LabeledInput
            label={"Total Pending Amount"}
            value={amount?.totalPendingAmount}
            className="col-xl-2 col-md-4 col-sm-6 col-12"
          />
        </div>
        <button className="btn btn-success" onClick={handleApproved}>
          Approved
        </button>
        <button className="btn btn-success ml-2" onClick={() => handleClose()}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SicSubReportModal;
