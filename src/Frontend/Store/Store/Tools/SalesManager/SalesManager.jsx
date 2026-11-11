import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Tables from "../../../../components/UI/customTable";
import NoRecordFound from "../../../../components/formComponent/NoRecordFound";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "../../../../components/UI/Accordion";

const SalesManager = () => {
    const [t] = useTranslation();
    const [activeData, setActiveData] = useState([])
    const [currentData, setCurrentData] = useState([])
    const [load, setLoad] = useState(false);
    const [selectedRadio, setSelectedRadio] = useState("SalesManager");
    const [dropDown, setDropDown] = useState({
        SalesManager: [],
        FieldBoy: []
    });
    const [payload, setPayload] = useState({
        SalesManager: "",
        FieldBoy: "",
        SalesManagerUpdate: "",
        FieldBoyUpdate: ""
    });

    console.log("pay", payload)

    const handleSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
        // Refresh the table when dropdown changes
        // setActiveData([]);
        // setCurrentData([]);
        if(name === "SalesManager") {
            setActiveData([]);
            setCurrentData([]);
        } else if(name === "FieldBoy") {
            setActiveData([]);
            setCurrentData([]);
        }
  
    }

    const getProEmployee = () => {
        axiosInstance
            .get("Employee/ProEmployee")
            .then((res) => {
                let data = res?.data?.message;
                let proData = data?.map((ele) => {
                    return {
                        value: ele?.EmployeeID,
                        label: ele?.EmployeeName,
                    };
                });
                setDropDown((prev) => ({
                    ...prev,
                    SalesManager: proData
                }));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const getFieldBoy = () => {
        axiosInstance
            .get("CommonController/BindEmpFieldBoy")
            .then((res) => {
                if (res.data.success) {
                    const mapped = res.data.message.map((ele) => ({
                        value: ele?.EmployeeID ?? ele?.FieldBoyID ?? ele?.ID,
                        label: ele?.EmployeeName ?? ele?.FieldBoyName ?? ele?.Name,
                    }));
                    setDropDown((prev) => ({
                        ...prev,
                        FieldBoy: mapped
                    }));
                }
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        getProEmployee();
        getFieldBoy();
    }, []);

    const handleSearch = () => {
        if (!payload?.SalesManager?.value) {
            toast.error("Please select a Sales Manager");
            return;
        }
        setLoad(true);
        const finalPayload = {
            employeeId: payload?.SalesManager?.value || null,
        };
        axiosInstance
            .post("SalesManager/GetSalesManagerData", finalPayload)
            .then((res) => {
                const data = Array.isArray(res?.data?.data)
                    ? res?.data?.data
                    : Array.isArray(res?.data?.message)
                        ? res?.data?.message
                        : [];
                setActiveData(data);
                setCurrentData(data);
                setLoad(false);
                if (data.length === 0) {
                    toast.error("No Data Found");
                }
            })
            .catch(() => {
                setActiveData([]);
                setCurrentData([]);
                setLoad(false);
                toast.error("No Data Found");
            });
    };

    const handleSearch1 = () => {
        setLoad(true);
        const finalPayload = {
            fieldBoyId: payload?.FieldBoy?.value || null,
        };
        axiosInstance
            .post("SalesManager/GetFieldBoyData", finalPayload)
            .then((res) => {
                const data = Array.isArray(res?.data?.data)
                    ? res?.data?.data
                    : Array.isArray(res?.data?.message)
                        ? res?.data?.message
                        : [];
                setActiveData(data);
                setCurrentData(data);
                setLoad(false);
                if (data.length === 0) {
                    toast.error("No Data Found");
                }
            })
            .catch(() => {
                setActiveData([]);
                setCurrentData([]);
                setLoad(false);
                toast.error("No Data Found");
            });
    };

    const handleUpdateSalesManager = () => {
        // Check if SalesManager and SalesManagerUpdate are the same
        if (payload?.SalesManager?.value === payload?.SalesManagerUpdate?.value) {
            toast.error("Cannot update with the same Sales Manager name");
            return;
        }

        const finalPayload = {
            salesManagerId: payload?.SalesManagerUpdate?.value || null,
            panelIds:
                currentData
                    ?.filter((item) => item?.isActive)
                    ?.map((item) => item?.RateTypeId)
                    ?.filter(Boolean) || [],
        };

        axiosInstance
            .post("SalesManager/UpdateSalesManager", finalPayload)
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(
                        res?.data?.message || "Sales Manager updated successfully"
                    );
                    // handleSearch(); 
                } else {
                    toast.error(res?.data?.message || "Update failed");
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to update Sales Manager");
            });
    };

    const handleUpdateSalesManager1 = () => {
        // Check if FieldBoy and FieldBoyUpdate are the same
        if (payload?.FieldBoy?.value === payload?.FieldBoyUpdate?.value) {
            toast.error("Cannot update with the same Field Boy name");
            return;
        }

        const finalPayload = {
            fieldBoyId: payload?.FieldBoyUpdate?.value || null,
            panelIds:
                currentData
                    ?.filter((item) => item?.isActive)
                    ?.map((item) => item?.RateTypeId)
                    ?.filter(Boolean) || [],
        };
        axiosInstance
            .post("SalesManager/UpdateFieldBoy", finalPayload)
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(res?.data?.message || "Field Boy updated successfully");
                    // handleSearch1(); 
                } else {
                    toast.error(res?.data?.message || "Update failed");
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to update Field Boy");
            });
    };

    // FIX: use index as unique key since we don't know which ID field is unique
    const handleChange = (e) => {
        const { name, checked } = e.target;
        setCurrentData((prevData) =>
            prevData.map((item, idx) =>
                String(idx) === name
                    ? { ...item, isActive: checked }
                    : item
            )
        );
    };

    // no change needed here
    const handleSelectAll = (e) => {
        const { checked } = e.target;
        setCurrentData((prevData) =>
            prevData.map((item) => ({ ...item, isActive: checked }))
        );
    };

    console.log("drop", dropDown)

    return (
        <>
            <div className="card">
                <Heading
                    title={t("Update Sales Manager")}
                    defaultValue={true}
                    secondTitle={
                        <>
                            <div className="d-flex align-items-center" style={{ gap: "20px" }}>
                                <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                                    <input
                                        type="radio"
                                        name="radioSelection"
                                        id="radioSalesManager"
                                        value="SalesManager"
                                        checked={selectedRadio === "SalesManager"}
                                        onChange={(e) => {
                                            setSelectedRadio(e.target.value);
                                            setPayload((prev) => ({
                                                ...prev,
                                                FieldBoy: "",
                                                SalesManager: "",
                                                FieldBoyUpdate: "",
                                                SalesManagerUpdate: ""
                                            }));
                                            setActiveData([]);
                                            setCurrentData([]);
                                        }}
                                    />
                                    <label className="control-label mb-0" htmlFor="radioSalesManager">
                                        {t("SalesManager")}
                                    </label>
                                </div>

                                <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                                    <input
                                        type="radio"
                                        name="radioSelection"
                                        id="radioFieldBoy"
                                        value="FieldBoy"
                                        checked={selectedRadio === "FieldBoy"}
                                        onChange={(e) => {
                                            setSelectedRadio(e.target.value);
                                            setPayload((prev) => ({
                                                ...prev,
                                                FieldBoy: "",
                                                SalesManager: "",
                                                FieldBoyUpdate: "",
                                                SalesManagerUpdate: ""
                                            }));
                                            setActiveData([]);
                                            setCurrentData([]);
                                        }}
                                    />
                                    <label className="control-label mb-0" htmlFor="radioFieldBoy">
                                        {t("FieldBoy")}
                                    </label>
                                </div>
                            </div>
                        </>
                    }
                />
                <div className="row px-2 py-2">

                    {selectedRadio === "SalesManager" && (
                        <div className="col-sm-2">
                            <ReactSelect
                                name="SalesManager"
                                id="SalesManager"
                                placeholderName={t("SalesManager")}
                                removeIsClearable={true}
                                dynamicOptions={[
                                    { label: "Select", value: "" },
                                    ...dropDown?.SalesManager
                                ]}
                                value={payload?.SalesManager?.value}
                                onChange={handleSelectChange}
                            />
                        </div>
                    )}

                    {selectedRadio === "FieldBoy" && (
                        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                            <ReactSelect
                                name="FieldBoy"
                                id="FieldBoy"
                                removeIsClearable={true}
                                placeholderName={t("FieldBoy")}
                                value={payload?.FieldBoy?.value}
                                dynamicOptions={[
                                    { label: "Select", value: "" },
                                    ...dropDown?.FieldBoy
                                ]}
                                onChange={handleSelectChange}
                            />
                        </div>
                    )}

                    <div className="col-sm-2 d-flex align-items-end pb-2">
                        <button
                            className="btn btn-sm btn-success"
                            onClick={selectedRadio === "SalesManager" ? handleSearch : handleSearch1}
                        >
                            {t("Search")}
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="mt-2">
                <Accordion title={t("Added Items")} defaultValue={true}>
                    {activeData.length > 0 ? (
                        <div className="row px-1">
                            <div className="col-12">
                                <Tables className="table table-bordered table-hover">
                                    <thead className="cf">
                                        <tr>
                                            <th>{t("S.No")}</th>
                                            <th>{t("Business Unit")}</th>
                                            <th>{t("RateType ID")}</th>
                                            <th>{t("RateType Code")}</th>
                                            <th>{t("RateType")}</th>
                                            <th>{t("Mobile No")}</th>
                                            <th>{t("Email")}</th>
                                            <th>{t("Address")}</th>
                                            <th>
                                                {t("Action")}
                                                <input
                                                    type="checkbox"
                                                    style={{ marginLeft: "6px", cursor: "pointer" }}
                                                    // FIX: only checked when all items exist AND all are isActive:true
                                                    checked={
                                                        currentData.length > 0 &&
                                                        currentData.every((item) => item?.isActive === true)
                                                    }
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.map((data, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{data?.BussinessUnit}</td>
                                                <td>{data?.RateTypeId}</td>
                                                <td>{data?.RateTypeCode}</td>
                                                <td>{data?.RateTypeName}</td>
                                                <td>{data?.Phone}</td>
                                                <td>{data?.Email}</td>
                                                <td>{data?.Address}</td>
                                                <td>
                                                    {/* FIX: use String(index) as name — guaranteed unique */}
                                                    <input
                                                        type="checkbox"
                                                        name={String(index)}
                                                        checked={data?.isActive || false}
                                                        onChange={handleChange}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Tables>

                                <div className="d-flex justify-content-end align-items-end pb-2 mt-3" style={{ gap: "8px" }}>
                                    {selectedRadio === "SalesManager" && (
                                        <div style={{ width: "200px" }}>
                                            <ReactSelect
                                                name="SalesManagerUpdate"
                                                id="SalesManagerUpdate"
                                                placeholderName={t("SalesManager Update")}
                                                removeIsClearable={true}
                                                dynamicOptions={[
                                                    { label: "Select", value: "" },
                                                    ...dropDown?.SalesManager
                                                ]}
                                                value={payload?.SalesManagerUpdate?.value}
                                                onChange={handleSelectChange}
                                            />
                                        </div>
                                    )}
                                    {selectedRadio === "FieldBoy" && (
                                        <div style={{ width: "200px" }}>
                                            <ReactSelect
                                                name="FieldBoyUpdate"
                                                id="FieldBoyUpdate"
                                                removeIsClearable={true}
                                                placeholderName={t("FieldBoy Update")}
                                                value={payload?.FieldBoyUpdate?.value}
                                                dynamicOptions={[
                                                    { label: "Select", value: "" },
                                                    ...dropDown?.FieldBoy
                                                ]}
                                                onChange={handleSelectChange}
                                            />
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-sm btn-success mb-1"
                                        onClick={selectedRadio === "SalesManager" ? handleUpdateSalesManager : handleUpdateSalesManager1}
                                    >
                                        {t("Update")}
                                    </button>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <NoRecordFound />
                    )}
                </Accordion>
            </div>
        </>
    )
}

export default SalesManager;