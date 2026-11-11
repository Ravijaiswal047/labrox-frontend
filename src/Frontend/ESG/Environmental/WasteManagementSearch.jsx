import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import DatePicker from "../../../components/formComponent/DatePicker"
import { SearchButton } from "../../../components/UI/CustomButton"
import { axiosInstance } from "../../../utils/axiosInstance"
import moment from "moment"
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"
import Accordion from "../../../components/UI/Accordion"
import Tables from "../../../components/UI/customTable"
import NoRecordFound from "../../../components/formComponent/NoRecordFound"
import { toast } from "react-toastify"
// import Dialog from "@mui/material/Dialog"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { Dialog } from "primereact/dialog"
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage"
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch"
import Heading from "../../../components/UI/Heading"

const WasteManagementSearch = ({ onEdit }) => {
  const [t] = useTranslation()
  const isMobile = window.innerWidth <= 768;
  const [centre, setCentre] = useState([])
  const [payload, setPayload] = useState({
    CentreId: [],
    FromDate: new Date(),
    ToDate: new Date(),
    DisposalType: "SharpsKg",
  })
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [activeFilter, setActiveFilter] = useState(null)
  const [disposeModal, setDisposeModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false);
  const [disposeData, setDisposeData] = useState({});
  const theme = useLocalStorage("theme", "get");

  const disposalTypeOptions = [
    { label: "Sharp", value: "SharpsKg" },
    { label: "Infectious", value: "InfectiousKg" },
    { label: "Chemical", value: "ChemicalWaste" },
    { label: "General", value: "GeneralKg" },
  ]

  const WASTE_ITEM_KEYS = ["GeneralKg", "InfectiousKg", "SharpsKg", "ChemicalWaste"];

  const getDueItems = (data) => {
    const disposed = data.DisposalList?.map(d => d.DisposalItemType) || [];
    return WASTE_ITEM_KEYS.filter(key => Number(data[key]) > 0 && !disposed.includes(key));
  };

  const wasteStatusColorData = [
    { id: null, labelKey: "All", color: "#c0c0c0" },
    { id: 1, labelKey: "Active", color: "#75f975" },
    { id: 0, labelKey: "Disposed", color: "#ffb3b3" },
  ];

  const handleReactSelectChange = (name, value) => {
  setPayload((prev) => ({
    ...prev,
    [name]: value?.value || "",
  }))
}

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
      setCentre(CentreDataValue);
    } catch (error) {
      console.log("Error while fetching centres");
    }
  };

  useEffect(() => {
    getAccessCentres()
  }, [])

  const handleMultiSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (value, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    setLoading(true)
    const finalPayload = {
      centreId: payload.CentreId,
      fromDate: payload.FromDate,
      toDate: payload.ToDate,
      type: payload.DisposalType,
    }
    try {
      const res = await axiosInstance.post("ESG/GetWasteGeneratedByCentreAndMonth", finalPayload);
      const data = res?.data;
      if (data?.success) {
        setTableData(data?.message || []);
      } else {
        setTableData([]);
        toast.error(data?.message || "No record found!")
      }
    } catch (error) {
      console.log("Error while fetching data", error)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchDisposalData = async (generatedId) => {
    setModalLoading(true);
    setDisposeModal(true);
    try {
      const res = await axiosInstance.post(`ESG/GetDisposeLog`,{
        id: generatedId,
      });
      console.log("disposal data", res)
      if (res?.data?.success) {
        setDisposeData(res?.data?.data || {});
      } else {
         setDisposeData({});
        toast.error(res?.data?.message || "No record found!")
      }
    } catch (error) {
      console.error("Error fetching disposal data", error);
      toast.error(t("Failed to load disposal records"));
       setDisposeData({});
    } finally {
      setModalLoading(false);
    }
  };

  const filteredData = activeFilter === null
    ? tableData
    : tableData.filter((d) => d.IsActive === activeFilter);

  return (
    <>
      <div className="row px-2 py-2">
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <MultiSelectComp
            label="All Centre"
            options={centre}
            value={payload?.CentreId}
            name="CentreId"
            id="CentreId"
            onChange={handleMultiSelectChange}
            lable={t("Select Centre")}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <ReactSelect
            dynamicOptions={disposalTypeOptions}
            name="DisposalType"
            lable={t("Disposal Type")}
            id="DisposalType"
            removeIsClearable={false}
            placeholderName={t("Select Disposal Type")}
            value={payload.DisposalType}
            onChange={handleReactSelectChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            name="FromDate"
            id="FromDate"
            lable={t("FromDate")}
            value={payload.FromDate}
            className="custom-calendar"
            onChange={handleDateChange}
            maxDate={payload?.ToDate}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            name="ToDate"
            id="ToDate"
            lable={t("ToDate")}
            className="custom-calendar"
            value={payload.ToDate}
            onChange={handleDateChange}
            minDate={payload.FromDate}
            maxDate={new Date()}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <SearchButton
            text={"Search"}
            onClick={handleSearch}
          />
        </div>
      </div>
      <Heading
        title={t("Search Data")}
        defaultValue={true}
        secondTitle={
          <div className="d-flex flex-wrap justify-content-end mb-2" style={{ gap: "4px" }}>
            {wasteStatusColorData.map(({ color, labelKey, id }) => (
              <div key={id === null ? "all" : id}>
                <ColorCodingSearch
                  color={color}
                  label={t(labelKey)}
                  onClick={() => setActiveFilter(id)}
                  cursor="pointer"
                />
              </div>
            ))}
          </div>
        }
      />
        {filteredData.length > 0 ? (
          <div className="row px-1">
            <div className="col-12">
              <Tables>
                <thead className="cf">
                  <tr
                     
  
                  >
                    <th>{t("S.No")}</th>
                    <th>{t("Centre")}</th>
                    <th>{t("Waste Month")}</th>
                    <th>{t("General (Kg)")}</th>
                    <th>{t("Infectious (Kg)")}</th>
                    <th>{t("Sharps (Kg)")}</th>
                    <th>{t("Chemical Waste (Ltrs)")}</th>
                    {/* <th>{t("Compliance (%)")}</th> */}
                    <th>{t("Created At")}</th>
                    <th>{t("Dispose")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((data, index) => (
                    <tr key={index} 
                     style={{
    backgroundColor:
      data?.IsActive === 0
        ? "#ffb3b3" // Disposed
        : "#75f975", // Active
  }}
                    >
                      <td data-title={t("S.No")}>{index + 1}</td>
                      <td data-title={t("Centre")}>{data?.CentreName}</td>
                      <td data-title={t("Waste Month")}>
                        {moment(data?.WasteMonth, "DD-MMM-YY hh:mm A").format("MMM YYYY")}
                      </td>
                      <td data-title={t("General (Kg)")}>{data?.GeneralKg}</td>
                      <td data-title={t("Infectious (Kg)")}>{data?.InfectiousKg}</td>
                      <td data-title={t("Sharps (Kg)")}>{data?.SharpsKg}</td>
                      <td data-title={t("Chemical Waste (Ltrs)")}>
                        {data?.ChemicalWaste}
                      </td>
                      {/* <td data-title={t("Compliance (%)")}> */}
                        {/* <span className="badge bg-info text-dark">
                          {data?.CompliancePercent}%
                        </span>
                      </td> */}
                      <td data-title={t("Created At")}>{data?.dtEntry}</td>
                      
                     <td data-title={t("Dispose")} className="">
  {data?.IsActive === 1 && getDueItems(data).length > 0 && (
    <button
      className="btn btn-xs btn-success"
      title={t("Record Disposal")}
      onClick={() => onEdit({ ...data, isDisposalMode: true })}
    >
      <i className="fa fa-trash"></i>
    </button>
  )}
</td>
{/* <td data-title={t("Dispose")} className="">
  {data?.IsActive === 1 && (
    <button
      className="btn btn-xs btn-success"
      title={t("Record Disposal")}
      onClick={() => onEdit({ ...data, isDisposalMode: true })}
    >
      <i className="fa fa-trash"></i>
    </button>
  )}
</td> */}

<td
  data-title={t("Action")}
  className="d-flex gap-1"
  style={{ gap: "5px" }}
>
 
{data?.IsActive === 1 && (
  <button
    className="btn btn-xs btn-primary"
    onClick={() => onEdit(data)}
    title={t("Edit Record")}
  >
    <i className="fa fa-edit"></i>
  </button>
)}
{data?.DisposalList?.length > 0 && (
  <button
    className="btn btn-xs btn-info"
    title={t("View Disposal History")}
    onClick={() => fetchDisposalData(data?.Id)}
  >
    <i className="fa fa-eye"></i>
  </button>
)}
</td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        ) : (
          <NoRecordFound />
        )}
      {/* </Accordion> */}

      <Dialog
        visible={disposeModal}
        header={`${t("Waste Disposal History")}${disposeData?.CentreName ? ` — ${disposeData.CentreName}` : ""}${disposeData?.WasteMonth?.value ? ` | ${moment(disposeData.WasteMonth.value).format("MMM YYYY")}` : ""}`}
        onHide={() => {
          setDisposeModal(false);
          setDisposeData({});
        }}
        style={{ width: isMobile ? "90vw" : "60vw" }}
        className={theme}
      >
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            {modalLoading ? (
              <div className="text-center p-4">
                <i className="fa fa-spinner fa-spin fa-2x"></i>
              </div>
            ) : 
            // disposeData.length > 0 ? (
            //   <Tables>
            //     <thead className="cf">
            //       <tr>
            //         <th>{t("S.No")}</th>
            //         <th>{t("Centre")}</th>
            //         <th>{t("Disposal Method")}</th>
            //         <th>{t("Entry Date")}</th>
            //         <th>{t("File")}</th>
            //       </tr>
            //     </thead>
            //     <tbody>
            //       {disposeData.map((item, idx) => (
            //         <tr key={idx}>
            //           <td data-title={t("S.No")}>{idx + 1}</td>
            //           <td data-title={t("Centre")}>{item?.centreName}</td>
            //           <td data-title={t("Disposal Method")}>
            //             <span className="badge bg-light text-dark border">
            //               {item?.DisposalMethod}
            //             </span>
            //           </td>
            //           <td data-title={t("Entry Date")}>
            //             {item?.dtEntry ? moment(item.dtEntry).format("DD-MMM-YYYY hh:mm A") : "-"}
            //           </td>
            //           <td data-title={t("File")}>
            //             {item?.FilePath ? (
            //               <i
            //                 className="fa fa-file-pdf-o text-danger cursor-pointer"
            //                 onClick={() => window.open(item.FilePath, "_blank")}
            //                 title={t("View Document")}
            //               ></i>
            //             ) : "-"}
            //           </td>
            //         </tr>
            //       ))}
            //     </tbody>
            //   </Tables>
            // ) : (
            //   <div className="text-center p-4">
            //     <NoRecordFound />
            //   </div>
            // )
            Object.keys(disposeData).length > 0 ? (
              <>
                {/* Original quantities summary */}
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  {[
                    { label: "General", key: "GeneralKg", unit: "Kg" },
                    { label: "Infectious", key: "InfectiousKg", unit: "Kg" },
                    { label: "Sharps", key: "SharpsKg", unit: "Kg" },
                    { label: "Chemical Waste", key: "ChemicalWaste", unit: "Ltrs" },
                  ].filter(({ key }) => Number(disposeData[key]) > 0).map(({ label, key, unit }) => (
                    <div key={key} className="card text-center px-3 py-2" style={{ minWidth: "100px" }}>
                      <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {disposeData[key]} <small>{unit}</small>
                      </div>
                      <div style={{ fontSize: "11px", color: "#666" }}>{t(label)}</div>
                    </div>
                  ))}
                  {/* <span className="badge bg-info text-dark ms-auto" style={{ fontSize: "13px", padding: "6px 12px" }}>
                    {disposeData.CompliancePercent ?? 0}% {t("Complete")}
                  </span> */}
                </div>

                {/* Disposal log table */}
                {disposeData.DisposeLogList?.length > 0 ? (
                  <Tables>
                    <thead className="cf">
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("Item")}</th>
                        <th>{t("Qty")}</th>
                        <th>{t("Disposal Method")}</th>
                        <th>{t("Disposal Date")}</th>
                        <th>{t("Created Date")}</th>
                        <th>{t("Created By")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disposeData.DisposeLogList.map((item, idx) => {
                        const ITEM_LABEL = { GeneralKg: "General", InfectiousKg: "Infectious", SharpsKg: "Sharps", ChemicalWaste: "Chemical Waste" };
                        const ITEM_UNIT = { GeneralKg: "Kg", InfectiousKg: "Kg", SharpsKg: "Kg", ChemicalWaste: "Ltrs" };
                        const methods = Array.isArray(item.DisposalMethod) ? item.DisposalMethod : [];
                        const methodDisplay = methods.length
                          ? methods.map(m => (m === "Others" && item.OtherDisposalType) ? item.OtherDisposalType : m).join(", ")
                          : "-";
                        return (
                          <tr key={idx}>
                            <td data-title={t("S.No")}>{idx + 1}</td>
                            <td data-title={t("Item")}>{t(ITEM_LABEL[item.DisposalItemType] || item.DisposalItemType)}</td>
                            <td data-title={t("Qty")}>{item.DisposedValue} {ITEM_UNIT[item.DisposalItemType] || ""}</td>
                            <td data-title={t("Disposal Method")}>
                              <span className="badge bg-light text-dark border">{methodDisplay}</span>
                            </td>
                            <td data-title={t("Disposal Date")}>{item.DisposalDate?.split(" ")?.[0]}</td>
                            <td data-title={t("Created Date")}>{item.dtEntry}</td>
                            <td data-title={t("Created By")}>{item.CreatedByName || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tables>
                ) : (
                  <NoRecordFound />
                )}
              </>
            ) : (
              <NoRecordFound />
            )
            }
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default WasteManagementSearch;