import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axiosInstance";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../../components/formComponent/DatePicker";
import Input from "../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { CustomButton, SearchButton } from "../../../components/UI/CustomButton";
import Tables from "../../../components/UI/customTable";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import { getCentreDetails } from "../../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import moment from "moment";
import ServicePOClosedDetailsModal from "./ServicePOClosedDetailsModal";
import ServicePOCloseOrderModal from "./ServicePOCloseOrderModal";
function ServicePurchaseOrderSearch() {
  const { t } = useTranslation();
  const [payload, setPayload] = useState({
    CentreID: "all",
    IsItemName: false,
    ItemID: "",
    OrderNo: "",
    SupplierID: "",
    FromDate: new Date(),
    Status: "",
    ToDate: new Date(),
  });
  const [tableData, setTableData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [closedDetailsModal, setClosedDetailsModal] = useState({
    modal: false,
    data: null,
    index: -1,
  });
  const [closeOrderModal, setCloseOrderModal] = useState({
    modal: false,
    data: null,
    index: -1,
  });

  const [centreOptions, setCentreOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const statusOptions = [
    { label: "All", value: 2 },
    { label: "Approve", value: 1 },
    { label: "Reject", value: 0 },
  ];
  const getFilterType = () => {
    if (payload?.Status === 1) return "Approve";
    if (payload?.Status === 0) return "Reject";
    return "All";
  };

  const getSupplierList = () => {
    axiosInstance
      .get("StoreCommonServices/BindSupplier")
      .then((res) => {
        const response = res?.data?.message || [];
        setSupplierOptions(
          Array.isArray(response)
            ? response.map((ele) => ({
              label: ele?.supplierName,
              value: ele?.supplierId,
            }))
            : []
        );
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Supplier API Error");
        setSupplierOptions([]);
      });
  };

  const getItemList = () => {
    axiosInstance
      .get("ServicePO/BindItem")
      .then((res) => {
        const response = res?.data?.message || [];
        setItemOptions(
          Array.isArray(response)
            ? response.map((ele) => ({
              label: ele?.typename,
              value: ele?.itemID,
            }))
            : []
        );
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Item API Error");
        setItemOptions([]);
      });
  };
  const getCentreList = () => {
    getCentreDetails((data) => {
      setCentreOptions([{ label: "All", value: "all" }, ...data]);
    });
  };
  useEffect(() => {
    getCentreList();
    getSupplierList();
    getItemList();
  }, []);

  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value?.value ?? "",
    }));
  };



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "IsItemName" && !checked ? { ItemID: "" } : {}),
    }));
  };

  const dateSelect = (value, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildSearchPayload = () => ({
    CentreId: payload?.CentreID === "all" ? 0 : Number(payload?.CentreID || 0),
    PoNumber: payload?.OrderNo || "",
    ItemId: payload?.IsItemName ? String(payload?.ItemID || "0") : "0",
    VendorId: String(payload?.SupplierID || "0"),
    Status: "",
    FromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
    ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
    FilterType: getFilterType(),
  });

  const handleSearch = () => {
    const searchPayload = buildSearchPayload();

    axiosInstance
      .post("ServicePO/BindServicePO", searchPayload)
      .then((res) => {
        const data = res?.data?.message || [];
        setHasSearched(true);
        setTableData(data);

        if (data?.length === 0) {
          toast.error("No Data Found");
        }
      })
      .catch((err) => {
        setHasSearched(true);
        setTableData([]);
        toast.error(err?.response?.data?.message || "Error Occured");
      });
  };

  const isApprovedStatus = (status) =>
    ["approve", "approved"].includes(String(status || "").trim().toLowerCase());

  const isClosedStatus = (status) =>
    ["close", "closed"].includes(String(status || "").trim().toLowerCase());

  const handleViewHistory = (row, index) => {
    if (isApprovedStatus(row?.status)) {
      setCloseOrderModal({
        modal: true,
        data: row,
        index,
      });
      return;
    }

    if (!isClosedStatus(row?.status)) {
      toast.info("No action available for this status");
      return;
    }

    setClosedDetailsModal({
      modal: true,
      data: row,
      index,
    });
  };

  const colorCodingData = [
    { labelKey: "Approved", color: "#f3d512", id: "approved" },
    { labelKey: "Close", color: "#94bf2d", id: "close" },
    { labelKey: "Rejected", color: "#d8a5d9", id: "rejected" },
  ];

  return (
    <div>
      {closedDetailsModal?.modal && (
        <ServicePOClosedDetailsModal
          show={closedDetailsModal?.modal}
          handleClose={() =>
            setClosedDetailsModal({ modal: false, data: null, index: -1 })
          }
          state={closedDetailsModal?.data}
          refresh={handleSearch}
        />
      )}
      {closeOrderModal?.modal && (
        <ServicePOCloseOrderModal
          show={closeOrderModal?.modal}
          handleClose={() =>
            setCloseOrderModal({ modal: false, data: null, index: -1 })
          }
          state={closeOrderModal?.data}
          refresh={handleSearch}
        />
      )}
      <Accordion
        title={t("Service Purchase Order Search / Close")}
        name={t("Service Purchase Order Search / Close")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row p-2">
          <ReactSelect
            name="CentreID"
            id="CentreID"
            removeIsClearable={true}
            dynamicOptions={centreOptions}
            placeholderName="Centre"
            value={payload?.CentreID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            lable="Order No."
            id="OrderNo"
            name="OrderNo"
            value={payload?.OrderNo}
            onChange={handleChange}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                name="IsItemName"
                checked={payload?.IsItemName}
                onChange={handleChange}
                className="mr-1"
              />
              <div className="w-100">
                <ReactSelect
                  name="ItemID"
                  id="ItemID"
                  removeIsClearable={true}
                  dynamicOptions={itemOptions}
                  placeholderName="Item Name"
                  value={payload?.ItemID}
                  onChange={handleSelectChange}
                  isDisabled={!payload?.IsItemName}
                />
              </div>
            </div>
          </div>
          <ReactSelect
            name="SupplierID"
            id="SupplierID"
            removeIsClearable={true}
            dynamicOptions={supplierOptions}
            placeholderName="Supplier Name"
            value={payload?.SupplierID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="Status"
            id="Status"
            removeIsClearable={true}
            dynamicOptions={statusOptions}
            placeholderName="Status"
            value={payload?.Status}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
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
            placeholder=""
            lable={t("To Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <SearchButton text={"Search"} onClick={handleSearch} />
          </div>
        </div>
      </Accordion>

      {hasSearched && (
        <Accordion
          title={t("Search Result")}
          name={t("Search Result")}
          isBreadcrumb={true}
          defaultValue={true}
          className="mt-2"
          seconTitle={
            <div className="d-flex align-items-center flex-wrap">
              {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
              ))}
            </div>
          }
        >
          <div className="row">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S/No.")}</th>
                    <th>{t("PO Number")}</th>
                    <th>{t("Supplier")}</th>
                    <th>{t("PO Date")}</th>
                    <th>{t("Gross Amt.")}</th>
                    <th>{t("Disc. Amt.")}</th>
                    <th>{t("Net Amt.")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("View")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={row?.purchaseOrderNo || index}
                      style={{
                        backgroundColor: row?.statusColor || "white",
                      }}
                    >
                      <td data-title={t("S/No.")}>{index + 1}</td>
                      <td data-title={t("PO Number")}>{row?.purchaseOrderNo}</td>
                      <td data-title={t("Supplier")}>{row?.vendorName}</td>
                      <td data-title={t("PO Date")}>
                        {row?.createdDate}
                      </td>
                      <td data-title={t("Gross Amt.")}>{row?.grossTotal}</td>
                      <td data-title={t("Disc. Amt.")}>{row?.discount}</td>
                      <td data-title={t("Net Amt.")}>{row?.netTotal}</td>
                      <td data-title={t("Status")}>{row?.status}</td>
                      <td data-title={t("View")} className="text-center">
                        <CustomButton
                          icon="search"
                          onClick={() => handleViewHistory(row, index)}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                  {tableData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center">
                        <NoRecordFound />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Tables>
            </div>
          </div>
        </Accordion>
      )}
    </div>
  );
}

export default ServicePurchaseOrderSearch;
