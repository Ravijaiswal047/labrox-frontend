import React, { useEffect, useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import Input from "../../../components/formComponent/Input";
import Heading from "../../../components/UI/Heading";
import CustomTable from "../../../components/Table/CustomTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import {SaveButton} from "../../../components/UI/CustomButton"
const SampleTransfer = () => {
  const [t] = useTranslation();
  const [centredata, setcentredata] = useState([]);
  const localData = useLocalStorage("userData", "get");
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    TransferTo: "",
    centre: "",
    BatchNumber: "",
    SinNumber: "",
  });

  const handleSelectChange = (name, e) => {
    const { value } = e;
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const fetchAllCenter = () => {
    axiosInstance
      .get("Employee/GetAllCentres")
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setcentredata(val);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    fetchAllCenter();
  }, []);

  const tableHeaders = [
    { header: "S.No.", field: "sNo", width: "5%" },
    { header: "Centre Name", field: "centreName" },
    { header: "Centre Code", field: "centreCode" },
    { header: "Amount", field: "amount" },
    { header: "Date", field: "date" },
    { header: "CreatedByName", field: "createdByName" },
    { header: "Payment Mode", field: "paymentMode" },
    { header: "Transaction ID", field: "TransactionID" },
    { header: "Remark", field: "remark" },
    { header: "Action", field: "action" },
    { header: "Attachment", field: "attachment" },
  ];
  return (
    <>
      <div className="card">
        <Heading title="Sample Transfer" />
        <div className="row p-2">
          <ReactSelect
            name="TransferTo"
            id="TransferTo"
            removeIsClearable={true}
            dynamicOptions={
              (localData.CompanyCode === "PKL" || location.pathname === "/getReport/grnreport")
                ? []
                : [
                  { label: "Select", value: "0" },
                  { label: "NPLRC Lalitpur", value: "1" },
                  { label: "NPLRC Kathmandu", value: "2" },
                ]
            }
            placeholderName="TransferTo"
            onChange={handleSelectChange}
            value={payload.TransferTo}
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />
          <ReactSelect
            name="centre"
            id="centre"
            removeIsClearable={true}
            isShowBorder={true}
            dynamicOptions={centredata}
            placeholderName="Centre"
            value={payload?.centre}
            onChange={handleSelectChange}
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              placeholder=" "
              lable={t("Batch Number")}
              id="BatchNumber"
              name="BatchNumber"
              value={payload?.BatchNumber}
              onChange={handleChange}
            // respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              placeholder=" "
              lable={t("SIN No.")}
              id="SinNumber"
              name="SinNumber"
              value={payload?.SinNumber}
              onChange={handleChange}
            />
          </div>
          <div className="col-auto mt-1">
            <SaveButton text={t("Save")} />
          </div>
        </div>
      </div>

      {/* <div className="mt-1 table_ticket">
        <CustomTable
          columns={tableHeaders}
          data={tableData.map((item, index) => ({
            rowColor: item.ColorCode,
            sNo: index + 1,
            centreName: item?.Centre,
            centreCode: item?.CentreCode,
            amount: item?.Amount,
            date: item?.TransactionDate,
            createdByName: item?.CreatedByname,
            paymentMode: item?.PaymentMode,
            TransactionID:
              item?.TransactionID != null ? item.TransactionID : "-",
            remark: (
              <span title={item?.Remarks || ""} style={{ cursor: "default" }}>
                {truncateText(item?.Remarks, 30)}
              </span>
            ),
            action: item?.StatusText,
            attachment: (
              <div className="d-flex align-items-center">
                <img width={16} height={16} src={fileIcon} alt="fileIcon" />
                <span className="mx-1">({item?.FileCount || 0})</span>
              </div>
            ),
          }))}
        />
      </div> */}
    </>
  );
};
export default SampleTransfer;
