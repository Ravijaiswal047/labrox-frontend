import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { ExportToExcel, formatStandardDate } from "../../utils/helpers";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { CustomButton } from "../../components/UI/CustomButton";
import { Form } from "react-bootstrap";

const CustomReport = () => {
    const [options, setOptions] = useState([]);
    const [columns , setColumns] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: "",
        columns: [],
    })

    const handleChangeMap = (selectedOptions, name) => {
        const values = selectedOptions.map((opt) => opt.value);
        setPayload((prev) => ({
            ...prev,
            [name]: values,
        }));
    };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleColumnChange = (e, value) => {
        console.log("Column Change", value, e.target.checked);
        const { checked } = e.target;

        setPayload((prev) => {
            const prevColumns = prev.columns || [];

            let updatedColumns;

            if (checked) {
                // add
                updatedColumns = [...prevColumns, value];
            } else {
                // remove
                updatedColumns = prevColumns.filter((id) => id !== value);
            }

            return {
                ...prev,
                columns: updatedColumns,
            };
        });
    };

    const getAllCentre = async () => {

        await axiosInstance
            .get("centre/getGlobalCentres")
            .then((res) => {
                const resList = res?.data?.message?.map((item) => ({
                    ...item,
                    label: item?.Centre,
                    value: item?.CentreID,
                }));
                setOptions(resList);

            })
            .catch((err) => {
                toast.error(err?.data?.message || "Save failed! Please try again.");
            }).finally(() => {

            })

    };

      const getColumnsData = () => {
        axiosInstance
          .post("Global/GetGlobalDataAll")
          .then((res) => {
            console.log("Columns",res);
            let data = res?.data?.message || [];
              const PRIORITY = ["PName", "Age", "Gender"];
              const formattedData = data
                  ?.filter(item => item?.FieldType === "PatientCustomReportColumn")
                  ?.map(item => ({
                      label: item?.FieldDisplay,
                      value: item?.FieldId
                  }))
                  ?.sort((a, b) => {
                      const ai = PRIORITY.indexOf(a.label?.trim());
                      const bi = PRIORITY.indexOf(b.label?.trim());
                      if (ai !== -1 && bi !== -1) return ai - bi;
                      if (ai !== -1) return -1;
                      if (bi !== -1) return 1;
                      return 0;
                  });

              setColumns(formattedData);
            
          })
          .catch((err) => console.log(err))
          .finally(()=>{

          });
      };

    const handleExcelReport = () => {
        dispatch(setLoading(true));

        const selectedColumnLabels = columns
            .filter(col => payload.columns.includes(col.value))
            .map(col => col.label.trim().replace(/\s+/g, ""));
        const apiPayload = {
            centreIds: payload?.Centre || [],
            fromDate: formatStandardDate(payload?.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload?.ToDate, "YYYY-MM-DD"),
            selectData: selectedColumnLabels || [],
            ReportFormat: "Excel",
        };
        axiosInstance.post("RateType/getPatientData", apiPayload, {
            responseType: "blob",
            transformResponse: [(data) => data],
        })
            .then(async (res) => {
                const contentType = res.headers?.["content-type"] || "";

                // If server returned JSON (error response), read and show the message
                if (contentType.includes("application/json")) {
                    const text = await new Response(res.data).text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("Export failed! Please try again."));
                    return;
                }

                const blob = new Blob([res.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `Patient_Custom_Report_${new Date().getTime()}.xlsx`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success(t("Report downloaded successfully"));
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || t("Export failed! Please try again."));
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    useEffect(() => {
        getAllCentre();
        getColumnsData();
    }, []);

    console.log("payload", payload);
    console.log("columns",columns);

    return (
        <>
            <Accordion
                name="Patient Custom Report"
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2">
                    <div className="col-sm-3 col-md-3 col-lg-2">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="FromDate"
                            lable={t("FromDate")}
                            maxDate={new Date()}
                        />
                    </div>

                    <div className="col-sm-3 col-md-3 col-lg-2">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable={t("ToDate")}
                            maxDate={new Date()}
                            minDate={payload?.FromDate}
                        />
                    </div> 
                    
                    <div className="col-sm-3 col-md-3 col-lg-2">

                        <SelectBoxWithCheckbox
                            options={options}
                            name="Centre"
                            value={payload?.Centre}
                            placeholder={t("Centre")}
                            onChange={(e) => {
                                handleChangeMap(e, "Centre");
                            }}
                            lable={t("Centre")}

                        ></SelectBoxWithCheckbox>
                    </div>
                    
                    {/* <div className="col-sm-3 col-md-3 col-lg-2">

                        <SelectBoxWithCheckbox
                            options={columns}
                            name="columns"
                            value={payload?.columns}
                            placeholder={t("Columns")}
                            onChange={(e) => {
                                handleChangeMap(e, "columns");
                            }}
                            lable={t("Columns")}

                        ></SelectBoxWithCheckbox>
                    </div> */}  
                   
                    <CustomButton text="Excel Export" icon="excel" className="mb-1 mx-2"
                      onClick={handleExcelReport}
                     />
                </div>
                
            </Accordion>
            <Accordion
                title="Select Columns"
                defaultValue={true}
                notOpen={true}
                seconTitle={
                    <Form.Check
                        type="switch"
                        id="selectAllColumns"
                        label={t("Select All")}
                        checked={columns.length > 0 && payload.columns.length === columns.length}
                        onChange={(e) => {
                            e.stopPropagation();
                            setPayload((prev) => ({
                                ...prev,
                                columns: e.target.checked ? columns.map((c) => c.value) : [],
                            }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="m-0"
                    />
                }
            >
                <div className="row px-2 mb-2">
                    {columns?.map((item) => (
                        <div className="col-sm-2 mb-2" key={item.value}>
                            <Form.Check
                                type="switch"
                                id={`column_${item.value}`}
                                label={item.label}
                                checked={payload?.columns?.includes(item.value)}
                                onChange={(e) => handleColumnChange(e, item.value)}
                                className="m-0 mr-2"
                            />
                        </div>
                    ))}
                </div>
            </Accordion>
        </>
    );
};

export default CustomReport;
