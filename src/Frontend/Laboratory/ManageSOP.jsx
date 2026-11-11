import React, { useEffect, useRef, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import Heading from "../../components/UI/Heading";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { apiUrls } from "../../utils/apiUrls";
import { axiosInstance } from "../../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { PreventSpecialCharacter, validateRequiredFields } from "../../utils/helpers";
import { Form } from "react-bootstrap";
import Tables from "../../components/UI/customTable";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../components/Filter/FilterInput";
import { colorCodingDataNew } from "../../utils/Constants";
import { CustomButton } from "../../components/UI/CustomButton";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import './ManageSOP.css';
import { getBase64, getDesignationData, getimgurl } from "../../utils/NetworkApi/commonApi";
import { Link } from "react-router-dom";
import { FaEdit, FaSearch } from "react-icons/fa";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import DesignationsModal from "../utils/DesignationsModal";

const ManageSOP = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [errors, setErrors] = useState({});
    const initialPayload = {
        Name: "",
        Designation: [],
        DesignationLabel: [],
        isActive: 1,
        Center: [],
        CenterLabel: [],
    };
    const [payload, setPayload] = useState(initialPayload);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [tableData, setTableData] = useState([]);
    const [masterTable, setMasterTable] = useState([]);
    const [designationList, setDesignationList] = useState([]);
    const [centerList, setCenterList] = useState([]);
    const [previewConfig, setPreviewConfig] = useState({
        visible: false,
        url: null,
    });

    // const [rowHandler1, setRowHandler1] = useState({
    //     ButtonShow: false,
    // });
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // File Data States
    const [formData, setFormData] = useState({
        DocumentType: "",
        SelectFile: "",
        Document_Base64: "",
        FileExtension: "",
    })
    const [showDesignationModal, setShowDesignationModal] = useState(false);
    const [designationListGet, setDesignationListGet] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);


    //// Upload File Content

    // const handleDeliveryButton3 = () => {
    //     setRowHandler1({
    //         ...rowHandler1,
    //         ButtonShow: !rowHandler1?.ButtonShow,
    //     });
    // };

    const handleShowDesignations = (designations) => {
        const list = designations?.split(",").map((d) => d.trim());
        setDesignationListGet(list);
        setShowDesignationModal(true);
    };

    const handleFileChange = (e) => {
        const file = e?.target?.files?.[0];
        processFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size exceeds 5MB limit");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];
                const fileExtension = file.name.split(".").pop();

                setFormData((prev) => ({
                    ...prev,
                    SelectFile: file,
                    Document_Base64: base64String,
                    FileExtension: fileExtension,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleStatusFilter = (id) => {
        if (id === "all") {
            setStatusFilter(null);
            setTableData(masterTable);
            return;
        }

        const status = id === "8" ? 1 : 0;

        // toggle filter
        if (statusFilter === status) {
            setStatusFilter(null);
            setTableData(masterTable);
            return;
        }

        setStatusFilter(status);

        const filteredData = masterTable.filter(
            (item) => item?.IsActive === status
        );

        setTableData(filteredData);
    };

    //// Upload File Content

    const handleChange = (e) => {
        const { name, value, type, checked } = e?.target;
        if (name === "Name") {
            setPayload((prev) => ({
                ...prev,
                [name]: ["Name"].includes(name)
                    ? PreventSpecialCharacter(value)
                        ? value.toUpperCase()
                        : payload[name]
                    : value.toUpperCase(),
            }))
        }
        else {
            setPayload((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
            }));
        }

    };

    const handleReset = () => {
        setPayload(initialPayload);
        setErrors({});
        setIsEditMode(false);
        setFormData(
            {
                DocumentType: "",
                SelectFile: "",
                Document_Base64: "",
                FileExtension: "",
            }
        )
        setDragActive(false);
        setSearchTerm("");
        getSOPData();

    };

    const handlePrint = async (item) => {
        try {
            dispatch(setLoading(true));

            const file = await getBase64(item);

            if (!file) {
                toast.error("Unable to fetch file");
                return;
            }

            showDocument(file);

        } catch (err) {
            toast.error("Error opening file");
        } finally {
            dispatch(setLoading(false));
        }
    };
    const showDocument = (file) => {
        const byteCharacters = atob(file.base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: file.mime_type });

        const blobUrl = URL.createObjectURL(blob);

        window.open(blobUrl, "_blank");
    };

    const handleSelectMultiChange = (select, name) => {
        console.log("select", select, name);

        const ids = select?.map((ele) => ele.value);

        if (name === "Designation") {
            setPayload((prev) => ({
                ...prev,
                [name]: ids,
                DesignationLabel: select   // save full object
            }));
        }
        else if (name === "Center") {
            setPayload((prev) => ({
                ...prev,
                [name]: ids,
                CenterLabel: select   // save full object
            }));
        }
        else {
            setPayload((prev) => ({
                ...prev,
                [name]: ids,
            }));
        }


    };

    const handleEdit = (item) => {
        const selectedCenters = centerList.filter((center) =>
            item?.CentreID?.split(",")
                .map(Number)
                .includes(center.value)
        );
        setPayload((prev) => ({
            ...prev,
            Name: item?.SOPName || "",
            SOPId: item?.SOPId,
            Designation: item?.DesignationIds
                ? item?.DesignationIds.split(",").map((id) => Number(id.trim()))
                : [],
            DesignationLabel: item?.Designations
                ? item?.Designations.split(",").map((label, index) => ({
                    value: Number(item?.DesignationIds.split(",")[index]),
                    label: label.trim(),
                }))
                : [],
            isActive: item?.IsActive ?? 1,
            Center: item?.CentreID ? item?.CentreID.split(",").map((id) => Number(id.trim())) : [],
            CenterLabel: selectedCenters,
        }));

        setFormData((prev) => ({
            ...prev,
            SelectFile: { name: item?.awsKey?.split("/").pop() }, // show filename
            awsKey: item?.awsKey,
        }));

        setIsEditMode(true);
    };

    const handleUpdate = async () => {
        const requiredFields = ["Name", "Designation", "Center"];

        const errors = validateRequiredFields(payload, requiredFields);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        const sopDesignations = payload?.DesignationLabel?.map((ele) => ({
            designationId: ele?.value,
            designationName: ele?.label,
            isActive: payload?.isActive || 0,
        }));
        const centreLists = payload?.CenterLabel?.map((ele) => ({
            centreId: ele?.value,
        }))

        const apiPayload = {
            sopId: payload?.SOPId,
            sopName: payload?.Name || "",
            isActive: payload?.isActive || 0,
            awsKey: formData?.awsKey || "",
            fileBase64: formData?.Document_Base64 || "",
            fileName: formData?.SelectFile?.name || "",
            sopDesignations: sopDesignations || [],
            sopCentres: centreLists || [],
        };

        dispatch(setLoading(true));

        axiosInstance
            .post(apiUrls.UpdateSOPManager, apiPayload)
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(res?.data?.message);
                    handleReset();
                    // 🔹 refresh table

                }
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message || "Error Occurred"
                );
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    const handleChangeSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(e.target.value);

        if (!value) {
            setTableData(masterTable);
            return;
        }

        const searchableKeys = [
            "SOPName",
            "Designations"
        ];

        const filtered = masterTable?.filter((row) =>
            searchableKeys.some((key) =>
                String(row[key] || "")
                    .toLowerCase()
                    .includes(value),
            ),
        );

        setTableData(filtered);
    };

    const handleOpenPreview = (keys) => {
        setPreviewConfig({
            visible: true,
            url: keys,
        });
    };

    const handleClosePreview = () => {
        setPreviewConfig({ visible: false, url: null });
    };

    const handleSave = async () => {
        const requiredFields = [
            "Name",
            "Designation",
            "Center"
        ];
        const errors = validateRequiredFields(payload, requiredFields);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        if (formData?.SelectFile === "") {
            toast.error("Please Select a File");
            return;
        }

        const sopDesignations = payload?.DesignationLabel?.map((ele) => ({
            designationId: ele?.value,
            designationName: ele?.label,
            sopName: payload?.Name,
            isActive: payload?.isActive || 0,
        }));

        const centreLists = payload?.CenterLabel?.map((ele) => ({
            centreId: ele?.value,
        }))

        const apiPayload = {
            sopName: payload?.Name || "",
            fileBase64: String(formData?.Document_Base64) || "",
            fileName: String(formData?.SelectFile?.name) || "",
            isActive: payload?.isActive || 0,
            sopDesignations: sopDesignations || [],
            sopCentres: centreLists || [],
        }

        dispatch(setLoading(true));

        axiosInstance
            .post(apiUrls.SaveSOPManager, apiPayload)
            .then((res) => {
                console.log("saveres", res);
                if (res?.data?.success) {
                    toast.success(res?.data?.message);
                    handleReset();

                }
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : "Error Occured",
                );
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    }

    const getSOPData = async () => {

        dispatch(setLoading(true));

        const apiPayload = {
            designationId: payload?.Designation || [],
            sopName: payload?.Name || "",
            centreId: payload?.Center || []
        }

        axiosInstance
            .post(apiUrls.GetSOPData, apiPayload)
            .then((res) => {
                console.log("get res", res);
                if (res?.data?.success && res?.data?.data?.length > 0) {
                    // toast.success(res?.data?.message);
                    setTableData(res?.data?.data);
                    setMasterTable(res?.data?.data);
                }
                else {
                    // toast.success("No Record Found");
                    setTableData([]);
                    setMasterTable([]);
                }

            })
            .catch((err) => {
                toast.error(
                    err?.data?.data?.message
                        ? err?.data?.data?.message
                        : "Error Occured",
                );
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    }
    const getAccessCentres = () => {
        axiosInstance
            .get("centre/getGlobalCentres")
            .then((res) => {
                let data = res.data.message;
                let CentreDataValue = data.map((ele) => {
                    return {
                        value: ele.CentreID,
                        label: ele.Centre,
                    };
                });
                setCenterList(CentreDataValue);
            })
            .catch((err) => console.log(err));
    };
    const activeCount = tableData?.filter((item) => item?.IsActive === 1)?.length || 0;
    const deactiveCount = tableData?.filter((item) => item?.IsActive === 0)?.length || 0;

    useEffect(() => {
        getDesignationData(setDesignationList, true);
        getSOPData();
        getAccessCentres();
    }, []);

    // console.log("errors", errors);
    // console.log("masterTable", masterTable);
    // console.log("tableData", tableData);
    // console.log("formData", formData);
    console.log("payload", payload);
    // console.log("designation", designationList);
    return (
        <>
            <Accordion
                name={t("Manage SOP")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row p-1">
                    <div className="col-xl-2 col-sm-4 col-md-2 col-12">
                        <Input
                            type="text"
                            placeholder=""
                            lable={t("Name")}
                            id="Name"
                            name="Name"
                            value={payload?.Name}
                            onChange={handleChange}
                            maxLength={10}
                        />
                        {payload?.Name === "" && (
                            <span className="error-message">{errors?.Name}</span>
                        )}
                    </div>
                    <div className="col-xl-2 col-sm-4 col-md-2 col-12">
                        <SelectBoxWithCheckbox
                            name="Designation"
                            onChange={handleSelectMultiChange}
                            options={designationList}
                            placeholder=" "
                            lable={t("Designation")}
                            className="required-fields"
                            id="Designation"
                            value={payload?.Designation}
                        />
                        {payload?.Designation?.length === 0 && (
                            <span className="error-message">{errors?.Designation}</span>
                        )}
                    </div>
                    <div className="col-xl-2 col-sm-4 col-md-2 col-12">
                        <SelectBoxWithCheckbox
                            name="Center"
                            onChange={handleSelectMultiChange}
                            options={centerList}
                            placeholder=" "
                            lable={t("Center")}
                            className="required-fields"
                            id="Center"
                            value={payload?.Center}
                        />
                        {payload?.Center?.length === 0 && (
                            <span className="error-message">{errors?.Center}</span>
                        )}
                    </div>

                    {/* <div className="col-xl-2 col-sm-2 d-flex col-md-2 col-12"> */}
                    <Form.Check
                        type="switch"
                        id="isActive1"
                        name="isActive"
                        label={t("Active")}
                        onChange={handleChange}
                        checked={payload?.isActive}
                        className="mx-4"
                    />
                    {/* <CustomButton text="Select File" icon="Save" className="mx-2" onClick={handleDeliveryButton3} /> */}
                    {/* {rowHandler1?.ButtonShow && ( */}
                    <div
                        className={`col-sm-6 col-md-4 ${dragActive ? "drag-active" : ""} mx-2`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            border: "2px dashed #ccc",
                            borderRadius: "8px",
                            padding: "10px",
                            textAlign: "center",
                            cursor: "pointer",
                            backgroundColor: dragActive ? "#e6f7ff" : "#fff",

                        }}
                    >
                        <p>Drag & Drop your file here or click below to select</p>
                        <input
                            type="file"
                            id="SelectFile"
                            name="SelectFile"
                            accept=".pdf,.png,.jpg,.jpeg"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            style={{ color: "white", padding: "0px 10px" }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Browse File
                        </button>
                        {formData?.SelectFile?.name && (
                            <p
                                style={{
                                    marginTop: "8px",
                                    marginBottom: "5px",
                                    fontSize: "14px",
                                    color: "black",
                                }}
                            >
                                Selected: <strong>{formData?.SelectFile?.name}</strong>
                            </p>
                        )}
                    </div>
                    {/* )} */}
                    <CustomButton text={isEditMode ? "Update" : "Save"} icon="Save" className="mx-2" onClick={isEditMode ? handleUpdate : handleSave} />
                    <CustomButton text="Search" icon="Search" className="mx-2" onClick={getSOPData} />
                    <CustomButton text="Reset" icon="refresh" className="mx-2" onClick={handleReset} />
                    {/* </div> */}

                </div>

            </Accordion>
            <Heading
                title={t("Manage SOP Records")}
                secondTitle={
                    <>
                        {/* <div className="col-sm-12 d-flex justify-content-end gap-custom p-0"> */}
                        {colorCodingDataNew?.map(({ color, labelKey, id }) => {
                            const count = id === "8" ? activeCount : deactiveCount;
                            return (
                                <ColorCodingSearch
                                    key={id}
                                    color={color}
                                    label={`${t(labelKey)} (${count})`}
                                    onClick={() => handleStatusFilter(id)}
                                    cursor="pointer"
                                    style={{ opacity: statusFilter === (id === "8" ? 1 : 0) ? 1 : 0.6 }}
                                //   className="mx-2"
                                />
                            )
                        })}
                        <FilterInput
                            value={searchTerm}
                            onChange={handleChangeSearch}
                            placeholder="Filter Table"
                        />
                        {/* </div> */}
                    </>
                }
            />
            <div className="row">
                <div className="col-12">
                    <Tables>
                        <thead className="cf">
                            <tr>
                                <th>{t("Sr. No")}</th>
                                <th>{t("SOP Name")}</th>
                                <th>{t("Designation")}</th>
                                <th>{t("Upload By")}</th>
                                <th>{t("Uploaded Date")}</th>
                                <th>{t("Last Updated By")}</th>
                                <th>{t("Last Updated Date")}</th>
                                <th>{t("View")}</th>
                                <th>{t("Print")}</th>
                                <th>{t("Edit")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tableData?.length > 0 ? (
                                tableData.map((item, i) => {
                                    const rowColor = item?.IsActive === 1 ? "#75f975" : "#ffe58f";

                                    return (
                                        <tr
                                            key={i}
                                            className={`vehicle-row ${item?.IsActive === 1 ? "active" : "deactive"}`}
                                            style={{
                                                backgroundColor: rowColor,
                                                backgroundImage: "none",
                                                color: "white",
                                            }}
                                        >
                                            <td data-title={t("Sr. No")}>
                                                {i + 1}
                                            </td>

                                            <td data-title={t("Name")}>{item?.SOPName}</td>

                                            <td data-title={t("Designation")}>
                                                {(() => {
                                                    const designationArray = item?.Designations?.split(",").map((d) => d.trim()) || [];

                                                    return (
                                                        <>
                                                            {designationArray.slice(0, 2).join(", ")}

                                                            {designationArray.length > 2 && (
                                                                <span
                                                                    style={{ cursor: "pointer", color: "blue", marginLeft: "5px" }}
                                                                    onClick={() => handleShowDesignations(item?.Designations)}
                                                                >
                                                                    +{designationArray.length - 2}more
                                                                </span>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </td>

                                            <td data-title={t("Upload By")}>{item?.CreatedByName}</td>

                                            <td data-title={t("Uploaded Date")}>{item?.dtEntry}</td>

                                            <td data-title={t("Last Updated By")}>
                                                {item?.LastUpdatedByName || "-"}
                                            </td>

                                            <td data-title={t("Last Updated Date")}>
                                                {item?.LastUpdatedDate || "-"}
                                            </td>

                                            <td data-title={t("View")}>
                                                <FaSearch
                                                    style={{ marginLeft: "6px", cursor: "pointer", color: "#0087ff" }}
                                                    title="View"
                                                    // onClick={() => handleSearch(item)}
                                                    onClick={() => handleOpenPreview(item?.awsKey)}
                                                    className="mx-2"
                                                />
                                            </td>

                                            <td data-title={t("Print")}>
                                                <i
                                                    className="fa fa-print"
                                                    style={{ cursor: "pointer", textAlign: "center", color: "black", }}
                                                    onClick={() => handlePrint(item)}
                                                    title="Print"
                                                ></i>

                                            </td>

                                            <td data-title={t("Edit")}>
                                                <Link to="#">
                                                    <FaEdit
                                                        color="#0087ff"
                                                        onClick={() => handleEdit(item)}
                                                        title="Edit"
                                                    />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
                                        {t("No Records Found")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Tables>
                </div>
            </div>
            <PdfPreviewModal
                visible={previewConfig.visible}
                url={previewConfig.url}
                onClose={handleClosePreview}
            />
            <DesignationsModal
                show={showDesignationModal}
                onHide={() => setShowDesignationModal(false)}
                designationList={designationListGet}
            />
        </>
    );
};

export default ManageSOP;
