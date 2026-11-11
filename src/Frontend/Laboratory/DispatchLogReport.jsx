import { useEffect, useState } from "react";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { ExportToExcel } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import { toast } from "react-toastify";
import { Table } from "react-bootstrap";
import { getStatusColor, SampleStatus, StatusCheck } from "../../utils/Constants";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import Tables from "../../components/UI/customTable";
import moment from "moment";

const DispatchLogReport = () => {
  const [t] = useTranslation();
  const [formData, setFormData] = useState({
    CentreId: [],
    RateTypeID: "",
    FromDate: new Date(),
    ToDate: new Date(),
    IsPdf: null,
    SampleStatus: "",
  });
  const [centreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState({
    excel: false,
    search: false
  });
  const [currentStatus, setCurrentStatus] = useState("");

  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      const data = res.data.message;
      const CentreDataValue = data.map((ele) => {
        return {
          value: ele.CentreID,
          label: ele.Centre,
        };
      });
      let allValues = CentreDataValue.map((ele) => ele.value);
      setCentreData(CentreDataValue);
      fetchRateTypes(allValues);
    } catch (error) {
      console.log("Error while fetching centres");
    }
  };

  const fetchRateTypes = async (ids) => {
    try {
      const res = await axiosInstance.post("/Centre/GetRateType", {
        CentreId: ids,
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAccessCentres();
  }, []);

  const handleSelectMultiChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value?.value });
  };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDownloadReport = async (pdf) => {
    const requestBody = {
      ...formData,
      IsPdf: pdf === 1 ? 1 : 0,
    }

     axiosInstance.post(
        "Dispatch/GetDispatchLogReport", requestBody
      ).then(async (res) => {
        if(res.data.success && Array.isArray(res.data.message)) {
          setTableData(res?.data.message)
        } else {
          toast.error(res?.data?.message || "No record found")
          setTableData([])
        }
      }).finally(() => {
        setLoading({ search: false })
      })
  };

  const handleDownloadExcel = async (pdf) => {
    const requestBody = {
      ...formData,
      IsPdf: pdf === 1 ? 1 : 0,
    }

     try {
      setLoading({ excel: true });
      const res = await axiosReport.post(
      "Dispatch/GetDispatchLogReport",
      requestBody,
      { responseType: "blob" }
    );

    const contentType = res.headers?.["content-type"] || "";
    if (contentType.includes("application/json")) {
      // Parse the blob as text to read the JSON message
      const text = await res.data.text();
      const json = JSON.parse(text);
      toast.warning(json?.message || "No records found.");
      return;
    }

    if (!res.data || res.data.size === 0) {
      toast.warning("No data available to export.");
      return;
    }

    const url = window.URL.createObjectURL(
      new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `DispatchLogReport_${moment().format("YYYYMMDD")}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
     } catch (error) {
      console.log("Error while downloading report", error);
      toast.error("Failed to download report");
     } finally {
      setLoading({ excel: false });
     }
  };

  const filterStatusWise = (status) => {
    setCurrentStatus(status);
    setFormData((prev) => ({ ...prev, SampleStatus: status }));
  };

  const filteredData = tableData.filter((item) => {
    if (currentStatus === "") return true;
    return String(item.Status) === String(currentStatus);
  });

  return (
    <>
    <Accordion
      name={`${t("Print Patient Report")}`}
      defaultValue={true}
      isBreadcrumb={true}
    >
      <div className="row px-2 mt-2 p-1">
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <MultiSelectComp
            label="All Centre"
            options={centreData}
            value={formData?.CentreId}
            name="CentreId"
            id="CentreId"
            onChange={handleSelectMultiChange}
            lable={t("Select Centre")}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <ReactSelect
            dynamicOptions={RateTypes}
            name="RateTypeID"
            lable={t("RateType")}
            id="RateTypeID"
            removeIsClearable={true}
            placeholderName={t("RateType")}
            value={formData?.RateTypeID}
            onChange={handleSelectChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            className="custom-calendar"
            name="FromDate"
            placeholder=" "
            id="FromDate"
            lable="FromDate"
            value={formData?.FromDate}
            onChange={dateSelect}
            maxDate={new Date(formData?.ToDate)}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            className="custom-calendar"
            name="ToDate"
            value={formData?.ToDate}
            onChange={dateSelect}
            placeholder=" "
            id="ToDate"
            lable="ToDate"
            maxDate={new Date()}
            minDate={new Date(formData?.FromDate)}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1 d-flex" style={{ gap: "5px" }}>
          {/* <div>
            {loading.search ? (
              <button
                type={"text"}
                className={`rounded px-3`}
                disabled={loading.search}
              >
                <i className="fa fa-spinner fa-spin me-2 mr-2" />
                {t("Searching...")}
              </button>
            ) : (
              <SearchButton
                text={"Search"}
                onClick={() => handleDownloadReport(1)}
                disabled={loading.search}
              />
            )}
          </div> */}
          <div>
            {loading.excel ? (
              <button
                type={"text"}
                className={`rounded px-3`}
                disabled={loading.excel}
              >
                <i className="fa fa-spinner fa-spin me-2 mr-2" />
                {t("Downloading...")}
              </button>
            ) : (
              <CustomButton
                text={"Excel"}
                icon={"excel"}
                onClick={() => handleDownloadExcel(0)}
                disabled={loading.excel}
              />
            )}
          </div>
        </div>
      </div>
      {/* <div
        style={{ gap: "6px" }}
        className="mt-1 mb-1 px-2 py-1 bg-white d-flex sampleStatusClass"
      >
        <strong style={{ minWidth: "100px" }}>{t("Sample Status")} : </strong>
        {SampleStatus?.map((sItem, idx) => (
          <TableFilterDot
            key={idx}
            color={`${getStatusColor(sItem?.value)}`}
            title={`${sItem?.label}`}
            onClick={() => filterStatusWise(sItem?.value)}
            bgColor={`#e9e2e1`}
          />
        ))}
      </div> */}
    </Accordion>
    {/* <Accordion
      name={`${t("Search Data")}`}
      defaultValue={true}
      isBreadcrumb={true}
    >
      {loading.search ? (
          <Loading />
        ) : (
          <div className="row ">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Visit No")}</th>
                    <th>{t("Barcode No")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Item Name")}</th>
                    <th>{t("Patient Name")}</th>
                    <th>{t("Age")}</th>
                    <th>{t("Gender")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Dispatch Date")}</th>
                    <th>{t("Dispatch By")}</th>
                    <th>{t("Dispatch To")}</th>
                  </tr>
                </thead>

                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center text-danger">
                        {t("No data found")}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((ele, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor:
                            ele?.IsDispatch === 1
                              ? getStatusColor(ele?.Status)
                              : "",
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>{ele?.VisitNo}</td>
                        <td>{ele?.BarcodeNo}</td>
                        <td>{ele?.DepartmentName}</td>
                        <td>{ele?.ItemName}</td>
                        <td>{ele?.PName}</td>
                        <td>{ele?.Age}</td>
                        <td>{ele?.Gender}</td>
                        <td>{SampleStatus.find((s) => String(s?.value) === String(ele?.Status))?.label || ele?.Status}</td>
                        <td>{ele?.dtDispatch}</td>
                        <td>{ele?.DispatchByName}</td>
                        <td>{ele?.DispatchTo}</td>
                      </tr>
                    ))
                  )}
                </tbody>

              </Tables>
            </div>
          </div>
        )}
    </Accordion> */}
</>
  );
};

export default DispatchLogReport;
