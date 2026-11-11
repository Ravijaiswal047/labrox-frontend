import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import { CustomButton } from "../../components/UI/CustomButton";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { toast } from "react-toastify";

const DignosticMaster = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState({
        dignomasterid: 0,
        dignoName: "",
        isActive: 1,
    });

    const getAllData = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                "DignosticMaster/GetAllDignosticMaster"
            );
            if (res?.data?.success) {
                const formattedData = res.data.message.map((item) => ({
                    dignomasterid: item.Dignomasterid,
                    dignoName: item.DignoName,
                    isActive: item.IsActive,
                    companyId: item.CompanyId,
                }));
                setData(formattedData);
            }
        } catch (error) {
            console.log("GetAll Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllData();
    }, []);


    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setPayload((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    const handleSave = async () => {
        if (!payload.dignoName.trim()) {
            toast.error("Diagnostic Master Name is required");
            return;
        }
        try {
            setLoading(true);
            const body = {
                dignomasterid: payload.dignomasterid,
                dignoName: payload.dignoName,
                isActive: payload.isActive,
            };
            const apiUrl =
                payload.dignomasterid === 0
                    ? "DignosticMaster/SaveDignosticMaster"
                    : "DignosticMaster/UpdateDignosticMaster";
            const res = await axiosInstance.post(apiUrl, body);
            if (res?.data?.success) {
                resetForm();
                getAllData();
            }
        } catch (error) {
            console.log("Save/Update Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                `DignosticMaster/GetDignosticMasterById?id=${id}`
            );
            if (res?.data?.success) {
                const item = res.data.message;
                setPayload({
                    dignomasterid: item.Dignomasterid,
                    dignoName: item.DignoName,
                    isActive: item.IsActive,
                });
            }
        } catch (error) {
            console.log("Edit Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setPayload({
            dignomasterid: 0,
            dignoName: "",
            isActive: 1,
        });
    };

    return (
        <>
            <Accordion
                name={t("Diagnostic Master")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 mt-2 mb-2">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <Input
                            lable="Diagnostic Master Name"
                            name="dignoName"
                            placeholder=""
                            id="dignoName"
                            value={payload.dignoName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={payload.isActive === 1}
                            onChange={handleChange}
                        />
                        <label className="control-label">IsActive</label>
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        {payload.dignomasterid === 0 ? (
                            <CustomButton
                                text={t("Save")}
                                icon={"save"}
                                className="btn btn-info btn-sm"
                                onClick={handleSave}

                            />
                        ) : (
                            <CustomButton
                                className="btn btn-info btn-sm"
                                onClick={handleSave}
                                text={t("Update")}
                                icon={"Edit"}
                            />
                        )}
                        <CustomButton
                            text={t("Reset")}
                            icon={"Refresh"}
                            className="btn btn-secondary btn-sm ml-2"
                            onClick={resetForm}
                        />
                    </div>
                </div>
            </Accordion>
            <Accordion title="Search Detail" defaultValue={true}>
                {loading ? (
                    <Loading />
                ) : (
                    <Tables>
                        <>
                            <thead>
                                <tr>
                                    <th style={{ width: "3%" }}>S.No</th>
                                    <th>Name</th>
                                    <th>Active</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((ele, index) => (
                                        <tr key={ele.dignomasterid}>
                                            <td data-title="S.No">{index + 1}</td>
                                            <td data-title="Name">{ele.dignoName}</td>
                                            <td data-title="Active">{ele.isActive === 1 ? "Active" : "De-Active"}</td>
                                            <td data-title="Action">
                                                <CustomButton
                                                    //text={t("Edit")}
                                                    icon={"Edit"}
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() =>
                                                        handleEdit(ele.dignomasterid)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <NoRecordFound />
                                )}
                            </tbody>
                        </>
                    </Tables>
                )}
            </Accordion>
        </>
    );
};

export default DignosticMaster;