import { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

const HCTemporaryPhelboAproval = () => {
    const navigate = useNavigate();
    const [t] = useTranslation()
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [list, setlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        pheleboid: 0,
        noofRecord: "50",
        searchvalue: "",
        searchState: "",
        searchCity: "",
        status: "",
    })
    const [approveModal, setApproveModal] = useState(false);
    const [approveData, setApproveData] = useState({
        tempPhleboId: 0,
        joinFromDate: "",
        joinToDate: "",
        username: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false);

    const recordoptions = [
        { label: "50", value: "50" },
        { label: "100", value: "100" },
        { label: "200", value: "200" },
        { label: "500", value: "500" },
        { label: "1000", value: "1000" },
        { label: "2000", value: "2000" },
    ];

    const fetchStates = () => {
        axiosInstance
            .post("CommonHC/GetStateData", {
                BusinessZoneID: 0,
            })
            .then((res) => {
                let data = res.data.message;
                let value = data.map((ele) => {
                    return {
                        value: ele.ID,
                        label: ele.State,
                        id: ele.ID,
                    };
                });
                setStates(value);
            })
            .catch((err) => {
                setLoading(false);
                setStates([]);
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : "Error Occured",
                );
            });
    };

    useEffect(() => {
        fetchStates();
    }, []);

    const handleSplitData = (id) => {
        const data = id.split("#")[0];
        return data;
    };

    const fetchCities = (id) => {
        const postdata = {
            StateId: [id],
        };
        axiosInstance
            .post("CommonHC/GetCityData", postdata)
            .then((res) => {
                let data = res.data.message;
                let value = data.map((ele) => {
                    return {
                        value: handleSplitData(ele.ID),
                        label: ele.City,
                    };
                });
                setCities(value);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : "Error Occured",
                );
            });
    };

    const handleSelectChange = async (name, event) => {
        const { value } = event;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "searchState") {
            setCities([]);
            setFormData((prev) => ({ ...prev, searchCity: "" }));
            if (value) {
                fetchCities(value);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearch = async (status) => {
        const finalPaylod = {
            ...formData,
            pheleboid: formData.pheleboid || 0,
            noofRecord: Number(formData.noofRecord),
            searchState: formData.searchState ? String(formData.searchState) : "",
            searchCity: formData.searchCity ? String(formData.searchCity) : "",
            status: status === -1 ? "" : String(status),
        }
        setLoading(true)
        try {
            const res = await axiosInstance.post("TemporaryPheleboApproval/GetTempPhelebotomist", finalPaylod);
            const data = res.data.message;
            if (res.data?.success) {
                setlist(data);
            } else {
                toast.error(res.data?.message)
            }
        } catch (error) {
            console.log("Error while search temporary phlebo", error);
        } finally {
            setLoading(false)
        }
    };

    const handleApprove = async () => {
        setLoading(true)
        try {
            const res = await axiosInstance.post("TemporaryPheleboApproval/ApprovalTempPhlebotomist", approveData);
            if (res.data?.success) {
                setApproveModal(false)
                toast.success(res.data?.message)

                handleSearch(-1)
            } else {
                toast.error(res.data?.message)
            }
        } catch (error) {
            console.log("Error while search temporary phlebo", error);
        } finally {
            setLoading(false)
        }
    };

    const handleReject = async (phleboId) => {
        setLoading(true)
        try {
            const res = await axiosInstance.post("TemporaryPheleboApproval/RejectTempPhelebotomist", { pheleboid: String(phleboId) });
            if (res.data?.success) {
                toast.success(res.data?.message)
                handleSearch(-1)
            } else {
                toast.error(res.data?.message)
            }
        } catch (error) {
            console.log("Error while reject temporary phlebo", error);
        } finally {
            setLoading(false)
        }
    };

    return (
        <>
            <Accordion
                name={t("Temporary Phelebotomist Approval")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 pl-2 pr-2 mb-1">
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={recordoptions}
                            lable="No. of Records"
                            id="noofRecord"
                            className="required-fields"
                            name="noofRecord"
                            removeIsClearable={true}
                            placeholderName={t("No. of Records")}
                            value={formData.noofRecord}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select State", value: "" }, ...states]}
                            lable="State"
                            id="State"
                            className="required-fields"
                            name="searchState"
                            removeIsClearable={true}
                            placeholderName={t("State")}
                            value={formData.searchState}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select City", value: "" }, ...cities]}
                            lable="City"
                            id="City"
                            className="required-fields"
                            name="searchCity"
                            removeIsClearable={true}
                            placeholderName={t("City")}
                            value={formData.searchCity}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            className="select-input-box form-control input-sm"
                            type="text"
                            name="searchvalue"
                            id="searchvalue"
                            lable={"Search Value"}
                            value={formData.searchvalue}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-sm-auto">
                        <SearchButton
                            text={"Search"}
                            onClick={() => handleSearch(-1)}
                        />
                    </div>
                    <div className="col-sm-auto">
                        <CustomButton
                            text={"Pending"}
                            onClick={() => handleSearch(0)}
                        />
                    </div>
                    <div className="col-sm-auto">
                        <CustomButton
                            text={"Approved"}
                            onClick={() => handleSearch(1)}
                        />
                    </div>
                    <div className="col-sm-auto">
                        <CustomButton
                            text={"Rejected"}
                            onClick={() => handleSearch(2)}
                        />
                    </div>
                </div>
            </Accordion>
            <Accordion title={t("Search Data")} defaultValue={true}>
                {list.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Name")}</th>
                                        <th>{t("Age/Gender")}</th>
                                        <th>{t("Movile")}</th>
                                        <th>{t("Email")}</th>
                                        <th>{t("Date")}</th>
                                        <th>{t("Address")}</th>
                                        <th>{t("City")}</th>
                                        <th>{t("Pincode")}</th>
                                        <th>{t("Document")}</th>
                                        <th>{t("Work Location")}</th>
                                        <th>{t("Join From")}</th>
                                        <th>{t("Join To")}</th>
                                        <th>{t("Edit")}</th>
                                        <th>{t("Approve")}</th>
                                        <th>{t("Reject")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list && list.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Name")}>{data?.Name}</td>
                                            <td data-title={t("Age/Gender")}>{`${data?.Age}/${data?.Gender}`}</td>
                                            <td data-title={t("Mobile")}>
                                                {data?.Mobile}
                                            </td>
                                            <td data-title={t("Email")}>
                                                {data?.Email}
                                            </td>
                                            <td data-title={t("Date")}>{data?.dtEntry}</td>
                                            <td data-title={t("Address")}>
                                                {data?.P_Address}
                                            </td>
                                            <td data-title={t("City")}>
                                                {data?.City}
                                            </td>
                                            <td data-title={t("Pincode")}>
                                                {data?.P_Pincode}
                                            </td>
                                            <td data-title={t("Document")}>
                                                {data?.DucumentNo}
                                            </td>
                                            <td data-title={t("Work Location")}>
                                                {data?.CityNames}
                                            </td>
                                            <td data-title={t("Join From")}>
                                                {data?.JoinFromDate}
                                            </td>
                                            <td data-title={t("Join To")}>
                                                {data?.JoinToDate}
                                            </td>
                                            <td data-title={t("Edit")}>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => navigate("/TemporaryPhlebotomist", { state: { PhleboId: data?.Temp_PhlebotomistID } })}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                            </td>
                                            <td data-title={t("Approve")}>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => {
                                                        setApproveModal(true)
                                                        setApproveData({
                                                            ...approveData,
                                                            tempPhleboId: data?.Temp_PhlebotomistID,
                                                            joinFromDate: data?.JoinFromDate,
                                                            joinToDate: data?.JoinToDate,
                                                        })
                                                    }}
                                                >
                                                    <i className="fa fa-check"></i>
                                                </button>
                                            </td>
                                            <td data-title={t("Reject")}>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => handleReject(data?.Temp_PhlebotomistID)}
                                                >
                                                    <i className="fa fa-times"></i>
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

            <Dialog
                visible={approveModal}
                className={theme}
                header={t("Approve")}
                onHide={() => {
                    setApproveModal(false)
                    setApproveData({
                        tempPhleboId: 0,
                        joinFromDate: "",
                        joinToDate: "",
                        username: "",
                        password: "",
                    })
                }}
                style={{
                    width: isMobile ? "80vw" : "20vw",
                }}
            >
                <div className="row pt-2 pl-2 pr-2 mb-1">
                    <div className="col-sm-12">
                        <Input
                            className="select-input-box form-control input-sm"
                            type="text"
                            name="username"
                            id="username"
                            lable={"Username"}
                        value={approveData.username}
                        onChange={(e)=>setApproveData({...approveData, username:e.target.value})}
                        />
                    </div>
                    <div className="col-sm-12">
                        <div style={{ position: "relative" }}>

                            <Input
                                className="select-input-box form-control input-sm"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                lable={"Password"}
                            value={approveData.password}
                            onChange={(e)=>setApproveData({...approveData, password:e.target.value})}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "0px",
                                    top: "2px",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#6c757d",
                                    zIndex: 10
                                }}
                            >
                                <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
                            </button>
                        </div>
                    </div>
                    <div className="col-12 d-flex justify-content-between mt-2">

                        <div className="col-sm-auto">
                            <CustomButton
                                text={t("Cancel")}
                                icon={"cancel"}
                                onClick={() => {
                                    setApproveModal(false)
                                    setApproveData({
                                        tempPhleboId: 0,
                                        joinFromDate: "",
                                        joinToDate: "",
                                        username: "",
                                        password: "",
                                    })
                                }}
                            />
                        </div>
                        <div className="col-sm-auto">
                            {loading ? (
                                <Loading />
                            ) : (
                                <CustomButton
                                    text={t("Approve")}
                                    icon={"check"}
                                    onClick={handleApprove}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default HCTemporaryPhelboAproval;