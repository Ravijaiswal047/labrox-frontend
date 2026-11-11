import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import DatePicker from "../../../components/formComponent/DatePicker";
import { SearchButton } from "../../../components/UI/CustomButton";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import Accordion from "../../../components/UI/Accordion";
import Tables from "../../../components/UI/customTable";
import PdfPreviewModal from "../../utils/PdfPreviewModal";
import { parseAwsKeys } from "../../../utils/helpers";

const AuditSearch = ({ onEdit }) => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([]);
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [payload, setPayload] = useState({
        centreId: [],
        status: "",
        fromDate: new Date(),
        toDate: new Date(),
    });


    const auditStatusOptions = [
        { label: "Open", value: "0" },
        { label: "In Process", value: "1" },
        { label: "Closed", value: "2" },
    ]

    const [previewConfig, setPreviewConfig] = useState({
        visible: false,
        url: null,
      });

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message;
            const CentreDataValue = data.map((ele) => ({
                value: ele.CentreID,
                label: ele.Centre,
            }));
            setCentre(CentreDataValue);
        } catch (error) {
            console.error("Error fetching centres", error);
        }
    };

    const handleOpenPreview = (keys) => {
        const parsedKeys = parseAwsKeys(keys);
    
        if (!parsedKeys) return;
    
        setPreviewConfig({
          visible: true,
          url: parsedKeys,
        });
      };
    
      const handleClosePreview = () => {
        setPreviewConfig({ visible: false, url: null });
      };
    

    useEffect(() => {
        getAccessCentres();
    }, []);

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

    const handleSearch = async () => {
        setLoading(true);

        const finalPayload = {
            centreId: payload.centreId,
            status: Number(payload.status),
            fromDate: payload.fromDate,
            toDate: payload.toDate
        };

        try {
            const res = await axiosInstance.post("ESG/GetAuditList", finalPayload);
            if (res.data?.success) {
                setTableData(res.data.message || []);
            } else {
                setTableData([]);
                toast.info(res.data?.message || t("No records found"));
            }
        } catch (error) {
            console.error("Search Error", error);
            toast.error(t("Something went wrong while fetching audit data"));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (name, value) => {
        setPayload(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (value, name) => {
        setPayload(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
        <PdfPreviewModal
                visible={previewConfig.visible}
                url={previewConfig.url}
                onClose={handleClosePreview}
              />
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label={t("Select Centres")}
                        options={centre}
                        value={payload.centreId}
                        name="centreId"
                        onChange={handleSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={auditStatusOptions}
                        name="status"
                        lable={t("Status")}
                        placeholderName={t("Select Status")}
                        removeIsClearable={true}
                        value={payload.status}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="fromDate"
                        className="custom-calendar"
                        lable={t("From Date")}
                        value={payload.fromDate}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="toDate"
                        lable={t("To Date")}
                        className="custom-calendar"
                        value={payload.toDate}
                        onChange={handleDateChange}
                        minDate={payload.fromDate}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <SearchButton
                        text={t("Search")}
                        onClick={handleSearch}
                    />
                </div>
            </div>

            <Accordion title={t("Audit Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Centre Name")}</th>
                                        <th>{t("ESG Report")}</th>
                                        <th>{t("Fire Safety Report")}</th> 
                                        <th>{t("Entry Date")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Centre Name")}>{data?.CentreName}</td>

                                            {/* ESG Report Column */}
                                            <td data-title={t("ESG Report")}>
                                                {data?.ESGKeyCount > 0 ? (
                                                    <div className="d-flex align-items-center">
                                                        <i
                                                            className="fa fa-file-text text-primary cursor-pointer fs-5"
                                                            // onClick={() => window.open(data.ESGReportFilePath, "_blank")}
                                                            onClick={() => handleOpenPreview(data?.ESGKey)}
                                                            title={t("View ESG Report")}
                                                        ></i>
                                                        {/* <small className="ms-1 text-muted">View</small> */}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted italic">{t("Not Uploaded")}</span>
                                                )}
                                            </td> 

                                            {/* Fire Safety Report Column */}
                                            <td data-title={t("Fire Safety Report")}>
                                                {data?.FireKeyCount > 0 ? (
                                                    <div className="d-flex align-items-center">
                                                        <i
                                                            className="fa fa-fire text-danger cursor-pointer fs-5"
                                                            // onClick={() => window.open(data.FireSafetyReportFilePath, "_blank")}
                                                            onClick={() => handleOpenPreview(data?.FireKey)}
                                                            title={t("View Fire Safety Report")}
                                                        ></i>
                                                        {/* <small className="ms-1 text-muted">View</small> */}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted italic">{t("Not Uploaded")}</span>
                                                )}
                                            </td> 

                                            <td data-title={t("Entry Date")}>
                                                {data?.dtEntry}
                                            </td>

                                            <td data-title={t("Status")}>
                                                <span className={`badge ${data?.Status == 0 ? "bg-warning text-dark" :
                                                        data?.Status == 1 ? "bg-info text-dark" :   
                                                            data?.Status == 2 ? "bg-success" :        
                                                                ""                   
                                                    }`}>
                                                    {
                                                        data?.Status === "0" ? t("Open") :
                                                            data?.Status === "1" ? t("In Progress") :
                                                                data?.Status === "2" ? t("Closed") :
                                                                     t("Unknown")
                                                    }
                                                </span>
                                            </td>

                                            <td data-title={t("Action")}>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => onEdit(data)}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
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
            </Accordion>
        </>
    );
};

export default AuditSearch;