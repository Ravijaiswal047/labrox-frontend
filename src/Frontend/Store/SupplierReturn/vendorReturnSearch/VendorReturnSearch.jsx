import React, { useEffect, useState } from "react";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Heading from "../../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { CustomButton } from "../../../../components/UI/CustomButton";
import moment from "moment";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loading from "../../../../components/loader/Loading";
const VendorReturnSearch = () => {
  const { t } = useTranslation();
  const [loctionData, setLocationData] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [loading, setLoading] = useState(false);
  const initialState = {
    SupplierId: "",
    LocationId: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState(initialState);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };


  useEffect(() => {
    GetBindCurrentLocaton();
    getSupplierApi();
  }, []);

  const GetBindCurrentLocaton = () => {
    axiosInstance
      .post("StoreCreateSalesIndent/bindalldata", { locationIds: [21, 22] })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationId,
        }));
        setLocationData(newRes);
      })
      .catch(() => console.log("Something went wrong"));
  };

  const getSupplierApi = async () => {
    await axiosInstance
      .get("VendorQuotation/bindsupplier")
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setSupplierList(Array.isArray(response) ? response : []);
        } else {
          toast.error("Data not found!");
        }
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const handleSearch = () => {
    if (!payload?.LocationId) {
      toast.warn("Please Select Location");
      return;
    }
    if (!payload?.SupplierId) {
      toast.warn("Please Select Supplier");
      return;
    }
    const data = {
      FromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
      ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
      LocationId: String(payload?.LocationId?.[0] || 0),
      SupplierId: String(payload?.SupplierId || 0),
    };
    axiosInstance
      .post("VendorReturn/SearchVendorData", data)
      .then((res) => {
        const response = res?.data?.message;
        setTableData(response);
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  }

  const handleExcel = async () => {
    const data = {
      FromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
      ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
      LocationId: String(payload?.LocationId?.[0]) || "0",
      SupplierId: String(payload?.SupplierId || "0"),
    };

    try {
      const res = await axiosInstance.post(
        "VendorReturn/SearchVendorData",
        data
      );

      const apiData = res?.data?.message || [];

      if (!Array.isArray(apiData) || apiData.length === 0) {
        toast.warn("No data found");
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(apiData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "VendorReturn");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(blob, "VendorReturnData.xlsx");
      setPayload([]);
    } catch (error) {
      console.error(error);
      toast.error("Error downloading Excel");
    }
  };


  const handlePrint = (id) => {
    setLoading(true);
    axiosReport
      .post(
        `StoreReports/VendorReturnReceipt?salesNo=${id}`,
        {},
        { responseType: "blob" }
      )
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
      })
      .catch((err) => {
        console.error("Batch receipt error:", err);
        toast.error(err?.response?.data?.message || "PDF load failed");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <div className="card">
        <Heading name={"Item Replacement"} isBreadcrumb={true} />
        <div className="row p-2">
          <ReactSelect
            name="LocationId"
            id="LocationId"
            removeIsClearable={true}
            dynamicOptions={loctionData}
            placeholderName="Location"
            value={payload?.LocationId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="SupplierId"
            id="SupplierId"
            removeIsClearable={true}
            dynamicOptions={supplierList?.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
            placeholderName="Supplier"
            value={payload?.SupplierId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("TO Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <div className="col-sm-2 d-flex">
            <CustomButton
              text={"Search"}
              icon={"search"}
              className="mr-2"
              onClick={handleSearch}
            />
            <CustomButton
              text={"Export To Excel"}
              icon={"excel"}
              onClick={handleExcel}
            />
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Item Replacement List"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th style={{ width: "3%" }}>{t("Sr.No.")}</th>
                  <th>{t("ReturnInvoiceNo")}</th>
                  <th>{t("GRNNo")}</th>
                  <th>{t("ReturnDate")}</th>
                  <th>{t("SupplierName")}</th>
                  <th>{t("LocationName")}</th>
                  <th>{t("ItemName")}</th>
                  <th>{t("BatchNumber")}</th>
                  <th>{t("ExpiryDate")}</th>
                  <th>{t("ReturnQty")}</th>
                  <th>{t("Unit")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("DiscAmt")}</th>
                  <th>{t("TaxAmt")}</th>
                  <th>{t("UnitPrice")}</th>
                  <th>{t("Print")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.vendorReturnNo}</td>
                    <td>{row?.LedgerTransactionNo || "NA"}</td>
                    <td>{row.returnDate}</td>
                    <td>{row.supplierName}</td>
                    <td>{row.location}</td>
                    <td>{row.itemName}</td>
                    <td>{row.batchNumber}</td>
                    <td>{row.expiryDate}</td>
                    <td>{row.returnQty}</td>
                    <td>{row.minorUnit}</td>
                    <td>{row.rate}</td>
                    <td>{row.discountAmount}</td>
                    <td>{row.taxAmount}</td>
                    <td>{row.unitPrice}</td>
                    <td>
                      {loading ? (
                        <Loading />
                      ) : (
                        <CustomButton
                          icon={"pdf"}
                          onClick={() => handlePrint(row.vendorReturnNo)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorReturnSearch;
