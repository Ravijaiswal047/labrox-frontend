import { useEffect, useState } from "react";
import Input from "../../../components/formComponent/Input";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton";
import Heading from "../../../components/UI/Heading";
import Accordion from "../../../components/UI/Accordion";
import Tables from "../../../components/UI/customTable";
import { axiosInstance } from "../../../utils/axiosInstance";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";

const ReportFilters = () => {
    const [t] = useTranslation();
      const theme = useLocalStorage("theme", "get");
    
    const [filterData, setFilterData] = useState([])
    const [reportHeadData, setReportHeadData] = useState([])
    const [reportData, setReportData] = useState([])
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [selectedReportName, setSelectedReportName] = useState("");


    // console.log("Report filter", filterData)
    // console.log("head data", reportHeadData)

    const initialState = {
        dataType: "Combine",
        name: "",
        combineId: 0,
        displayName: "",
        filterOption: "TEXTBOX",
        filterIds: [],
        reportHead: "",
        IsActive: 1,
        remarks: "",
        status: ""
    }

    const [payload, setPayload] = useState(initialState);
    const getReportHeadLabelById = (id) => {
        const found = reportHeadData.find(item => item.value === id);
        return found ? found.label : "";
    };

    const handleReport = async (status) => {

        let reportHeadName = "";
        let combineId = 0;

        if (payload.dataType === "Report") {
            const found = reportHeadData.find(
                item => item.value === payload.reportHead
            );

            if (!found) {
                toast.error("Please select Report Head");
                return;
            }

            reportHeadName = found.label;  
            combineId = found.value;        
        }

        const finalPayload = {
            id: isEdit ? editId : 0,
            dataType: payload.dataType,
            name: payload.name,
            parentId: payload.parentId || 0,
            combineId,                    
            dispalyName: payload.displayName,
            filterOption: payload.filterOption || "",
            filterIds: payload.filterIds || [],
            reportHead: reportHeadName,     
            IsActive: payload.IsActive,
            remarks: payload.remarks || "",
            status
        };

        try {
            const res = await axiosInstance.post(
                "CombineMISReport/ReportTypeInsert",
                finalPayload
            );

            if (res?.data?.success) {
                toast.success(
                    status === "update"
                        ? "Record updated successfully"
                        : "Record saved successfully"
                );
                fetchReportTable();
            } else {
                toast.error(res?.data?.message || "Save failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    const handleDataTypes = async (dataType) => {
        const finalPayload = {
            ...initialState,
            dataType,
            status: "search"
        };

        try {
            const res = await axiosInstance.post(
                "CombineMISReport/ReportTypeInsert",
                finalPayload
            );
            if (res?.data?.success) {
                const data = res?.data.data ?? [];

                const dataValue = data.map((item) => ({
                    label: item.Name,
                    value: item.ID
                }))

                if (dataType === "Filter") {
                    setFilterData(dataValue || [])
                }

                if (dataType === "Combine") {
                    setReportHeadData(dataValue || [])
                }
            }

        } catch (error) {
            console.error("Error while fetching data", error);
            setFilterData(data.map(item => ({
                label: item.Name,
                value: item.Id
            })));
            setReportHeadData(data.map(item => ({
                label: item.Name,
                value: item.Id
            })));
        }
    };

    useEffect(() => {

        resetEditMode();
        if (payload.dataType === "Filter") {
            handleDataTypes("Filter");
        }

        if (payload.dataType === "Report") {
            handleDataTypes("Filter");
            handleDataTypes("Combine");
        }

    }, [payload.dataType]);

    const fetchReportTable = async () => {
        try {
            const res = await axiosInstance.post("CombineMISReport/ReportTypeInsert", {
                dataType: payload.dataType,
                status: "search"
            });
            if (res?.data?.success) {
                setReportData(Array.isArray(res.data.data) ? res.data.data : []);
            }
        } catch (err) {
            console.error("Error fetching table data", err);
            setReportData([]);
        }
    }
    useEffect(() => {
        resetEditMode();
        fetchReportTable();

        if (payload.dataType === "Filter") {
            handleDataTypes("Filter");
        }

        if (payload.dataType === "Report") {
            handleDataTypes("Filter");
            handleDataTypes("Combine");
        }
    }, [payload.dataType]);


    const onEdit = (row) => {
        setPayload({
            dataType: payload.dataType,
            name: row.Name || "",
            parentId: row.ParentId || 0,
            displayName: row.DisplayName || "",
            filterOption: row.FilterOption || "TEXTBOX",
            filterIds: row.FilterIds || [],
            reportHead: row.ReportHeadId || "",
            IsActive: row.IsActive ?? 1,
            remarks: row.Remarks || "",
        });

        setEditId(row.ID);
        setIsEdit(true);
    };

    const resetEditMode = () => {
        setIsEdit(false);
        setEditId(null);
        setPayload(prev => ({
            ...prev,
            name: "",
            displayName: "",
            filterOption: "",
            filterIds: [],
            reportHead: "",
            remarks: "",
            IsActive: 1
        }));
    };


    const DataTypeOptions = [
        { label: "Report Head", value: "Combine" },
        { label: "Report Master", value: "Report" },
        { label: "Filter", value: "Filter" }
    ];

    const FilterOptions = [
        { label: "Text box", value: "TEXTBOX" },
        { label: "Drop Down", value: "DROPDOWN" },
        { label: "Toggle Button", value: "TOGGLEBUTTON" },
        { label: "Multi Select", value: "MULTISELECT" }
    ];

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value || ""
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMultiSelectChange = (name, value) => {
        setPayload(prev => ({
            ...prev,
            [name]: Array.isArray(value) ? value : []
        }));
    };

    const handleToggle = () => {
        setPayload((prev) => ({
            ...prev,
            IsActive: prev.IsActive === 1 ? 0 : 1
        }));
    };

    const isReportHead = payload.dataType === "Combine";
    const isReportMaster = payload.dataType === "Report";
    const isFilter = payload.dataType === "Filter";

    const filteredReportData = reportData.filter(row => {
        if (payload.dataType === "Report") {
            return row.DataType === "Report";
        }
        return row.DataType === payload.dataType;
    });
    const getReportHeadName = (id) => {
        const found = reportHeadData.find(item => item.value === id);
        return found ? found.label : "-";
    };

    const resolveFilterNamesById = (filtersString) => {
        try {
            if (!filtersString || !filterData.length) return [];

            const parsed = JSON.parse(filtersString);
            if (!Array.isArray(parsed)) return [];

            return parsed.map(f => {
                const found = filterData.find(
                    fd => Number(fd.value) === Number(f.filterId)
                );

                const filterName = found?.label ?? "Unknown Filter";
                const filterOption = f.filterOption || "";

                return filterOption
                    ? ` Filter Name - ${filterName} |  Control Type - ${filterOption}`
                    : `Filter Name - ${filterName}`;
            });

        } catch (error) {
            console.error("Error parsing filters:", error);
            return [];
        }
    };

    const handleViewFilters = (row) => {
        const names = resolveFilterNamesById(row.Filters);
        setSelectedFilters(names);
        setSelectedReportName(row.Name);
        setShowFilterModal(true);
    };

    return (
        <>
            <Heading title="New Reports" />
            <div className="row px-2 py-2 align-items-center">
                <div className="col-sm-2">
                    <ReactSelect
                        dynamicOptions={DataTypeOptions}
                        name="dataType"
                        lable={t("Data Type")}
                        removeIsClearable={true}
                        placeholderName={t("Data Type")}
                        value={payload?.dataType}
                        onChange={handleReactSelectChange}
                    />
                </div>

                {payload.dataType && (
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            lable="Name"
                            value={payload?.name}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {payload.dataType && (
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="displayName"
                            id="displayName"
                            lable="Display Name"
                            value={payload?.displayName}
                            onChange={handleChange}
                        />
                    </div>
                )}


                {isFilter && (
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={FilterOptions}
                            name="filterOption"
                            lable={t("Control Type")}
                            removeIsClearable={true}
                            placeholderName={t("Control Type")}
                            value={payload?.filterOption}
                            onChange={handleReactSelectChange}
                        />
                    </div>
                )}

                {isReportMaster && (
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={reportHeadData}
                            name="reportHead"
                            lable={t("Select Report Head")}
                            removeIsClearable={true}
                            placeholderName={t("Select Report Head")}
                            value={payload.reportHead}
                            onChange={handleReactSelectChange}
                        />
                    </div>
                )}

                {isReportMaster && (
                    <div className="col-sm-2">
                        <MultiSelectComp
                            label="Select Filters"
                            options={filterData}
                            value={payload.filterIds}
                            name="filterIds"
                            id="filterIds"
                            onChange={handleMultiSelectChange}
                        />
                    </div>
                )}


                {payload.dataType && (
                    <div
                        className="col-auto d-flex align-items-center p-2"
                        style={{ gap: "5px" }}
                    >
                        <label className="switch mb-1">
                            <input
                                type="checkbox"
                                checked={payload.IsActive === 1}
                                onChange={handleToggle}
                            />
                            <span className="slider"></span>
                        </label>
                        <strong className="mb-1">{t("IsActive")}</strong>
                    </div>
                )}

                {payload.dataType && (
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="remarks"
                            lable="Remarks"
                            value={payload.remarks}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {payload.dataType && (
                    <div className="mb-2">
                        <SaveButton
                            className="mx-1"
                            text={isEdit ? "Update" : "Save"}
                            onClick={() => handleReport(isEdit ? "update" : "insert")}
                        />

                        <CustomButton
                            className="mx-1"
                            text="Search"
                            onClick={fetchReportTable}
                        />
                    </div>
                )}
            </div>
            <Accordion
                title={t("Reports")}
                defaultValue={true}
                notOpen={true}
                linkTo="#"
                linkTitle={
                    <div
                        className="link-title-container mt-2 d-none d-md-flex"
                        id="pr_id_11"
                    >
                        {/* <div>
                            <input
                                className=" mb-2"
                                type="text"
                                name="search"
                                id="search"
                                placeholder="Search..."
                            // value={searchTerm}
                            // onChange={(e) => {
                            //     setSearchTerm(e.target.value);
                            //     setCurrentPage(1);
                            // }}
                            />
                        </div> */}
                    </div>
                }

            >

                <div className="row px-1">
                    <div className="col-12">
                        <Tables>
                            <thead className="cf">
                                <tr>
                                    <th>{t("S.No")}</th>
                                    <th>{t("Data Type")}</th>
                                    <th>{t("Name")}</th>
                                    <th>{t("Remarks")}</th>
                                    <th>{t("Display Name")}</th>
                                    {isFilter && <th>{t("Control Type")}</th>}
                                    {isReportMaster && <th>{t("Report Head")}</th>}
                                    {isReportMaster && <th>{t("Filter")}</th>}
                                    <th>{t("Created By")}</th>
                                    <th>{t("Created Date")}</th>
                                    <th>{t("Last Updated By")}</th>
                                    <th>{t("Last Updated Date")}</th>
                                    <th>{t("Action")}</th>
                                </tr>
                            </thead>



                            <tbody>
                                {filteredReportData.length > 0 ? (
                                    filteredReportData.map((row, index) => (
                                        <tr key={row.ID || index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {row.DataType}
                                                </span>
                                            </td>
                                            <td>{row.Name}</td>
                                            <td>{row.Remarks}</td>
                                            <td>{row.DispalyName}</td>
                                            {isFilter && <td>{row.FilterOption}</td>}
                                            {isReportMaster && (
                                                <td>{getReportHeadName(row.CombineReportID)}</td>
                                            )}

                                            {isReportMaster && (
                                                <td className="text-center">
                                                    <span
                                                        // className="text-primary"
                                                        title="View Filters"
                                                        onClick={() => handleViewFilters(row)}
                                                    >
                                                        <i className="fa fa-eye"></i>
                                                    </span>
                                                </td>
                                            )}

                                            <td>{row.CreatedByName}</td>
                                            <td>{row.dtEntry}</td>
                                            <td>{row.UpdateByName}</td>
                                            <td>{row.dtUpdate}</td>
                                            <td>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => onEdit(row)}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="text-center">
                                            No records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>



                        </Tables>
                    </div>
                </div>

            </Accordion>

            {showFilterModal && (
                <Dialog
                        visible={showFilterModal}
                        className={theme}
                        header={t(`Filters for: ${selectedReportName}`)}
                        onHide={() => {
                          setShowFilterModal(false);
                        }}
                        // style={{
                        //   width: isMobile ? "80vw" : "70vw",
                        // }}
                      >
                <div >
                    <div>
                        <div className="">
                            <div className="">
                                <h5 className="">
                                    
                                </h5>
                                
                            </div>


                            <div
                                className=" p-0"
                                style={{ maxHeight: "60vh", overflowY: "auto" }}
                            >
                                {selectedFilters.length > 0 ? (
                                    <ul className="list-group list-group-flush">
                                        {selectedFilters.map((f, idx) => (
                                            <li
                                                key={idx}
                                                className="list-group-item d-flex align-items-center"
                                            >
                                                <i className="fa fa-filter text-primary me-2" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted text-center my-4">
                                        No filters assigned
                                    </p>
                                )}
                            </div>


                            <div className="">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
                </Dialog>
            )}


        </>
    );
};

export default ReportFilters;
