import { useEffect, useState } from "react";
import Input from "../../components/formComponent/Input";
import Accordion from "../../components/UI/Accordion";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../components/UI/customTable";

const SmartReportParameterMaster = () => {
    const [t] = useTranslation()
    const [formData, setFormData] = useState({
        GroupName: "",
        isActive: 1,
    })
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const colorCodingData = [
        { color: "#FFFFFF", id: "1", labelKey: "Active" },
        { color: "#f5c6cb", id: "2", labelKey: "In Active" },
    ];

    
    const fetchGroupMaster = async () => {
        try {
            const res = await axiosInstance.get("SmartReport/GroupMaster");
            const data = res?.data;
            if (data?.success) {
                setTableData(data?.data);
            }
        } catch (error) {
            console.log("Error while fetching data", error)
        }
    }

    useEffect(() => {
        fetchGroupMaster();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleToggle = (field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleSubmit = async () => {
        const finalPayload = {
            ...formData,
            isActive: formData.isActive === 1 ? 1 : 0,
        }
        setLoading(true);
        try {
            const res = await axiosInstance.post("SmartReport/GroupMaster", finalPayload);
            const data = res?.data;
            if (data?.success) {
                toast.success(data?.message);
                fetchGroupMaster()
                setFormData({
                    GroupName: "",
                    isActive: 1,
                });
            }
        } catch (error) {
            console.log("Error while fetching data", error)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    const filteredData = tableData?.filter((item) => {
        return (
            item?.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.createdByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.updatedByName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });


    return (
        <>
            <Accordion
                name={t("Smart Report Parameter Master")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 pl-2 pr-2 mt-1">
                    <div className="col-sm-2">
                        <Input
                            className="required-fields"
                            type="text"
                            name="GroupName"
                            id="GroupName"
                            max={30}
                            value={formData?.GroupName}
                            onChange={handleChange}
                            lable="Group Name"
                        />
                    </div>
                    <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                        gap: "5px"
                    }}>
                        <label class="switch mb-0">
                            <input
                                type="checkbox"
                                checked={formData.isActive === 1}
                                onChange={() => handleToggle("isActive")}
                            />
                            <span class="slider"></span>
                        </label>
                        <strong>
                            <span>{t("IsActive")}</span>
                        </strong>
                    </div>
                    <div className="col-sm-auto">
                        <SaveButton
                            text={"Save"}
                            onClick={handleSubmit}
                            disabled={loading}
                        />
                    </div>
                </div>
            </Accordion>
            <Accordion
                title={t("Search Data")}
                defaultValue={true}
                notOpen={true}
                linkTo="#"
                linkTitle={
                    <div
                        className="d-none d-md-flex align-items-center justify-content-between"
                        id="pr_id_11"
                        style={{
                            gap: "5px"
                        }}
                    >
                        {colorCodingData.map(({ color, labelKey, id }) => (
                            <ColorCodingSearch
                                key={id}
                                color={color}
                                label={t(labelKey)}
                            />
                        ))}
                        <div className="mt-2">
                            <Input
                                className=""
                                type="text"
                                name="search"
                                id="search"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                }
            >
                {filteredData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Group Name")}</th>
                                        <th>{t("createdAt")}</th>
                                        <th>{t("createdByName")}</th>
                                        <th>{t("updatedAt")}</th>
                                        <th>{t("updatedByName")}</th>
                                        {/* <th>{t("Action")}</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData && filteredData.map((data, index) => {
                                        const rowColor = data.isActive == 1 ? "#FFFFFF" : "#f5c6cb";
                                        return (
                                            <tr key={index} style={{ backgroundColor: rowColor }}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Group Name")}>{data?.groupName}</td>
                                            <td data-title={t("createdAt")}>{data?.dtEntry}</td>
                                            <td data-title={t("createdByName")}>{data?.createdByName}</td>
                                            <td data-title={t("updatedAt")}>{data?.updatedAt || "-"}</td>
                                            <td data-title={t("updatedByName")}>{data?.updatedByName || "-"}</td>
                                            {/* <td data-title={t("Action")}>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => onEdit(data)}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                            </td> */}
                                        </tr>
                                        )
                                    })}
                                </tbody>
                            </Tables>
                        </div>
                    </div>
                ) : (<NoRecordFound />)}
            </Accordion>
        </>
    );
};

export default SmartReportParameterMaster;
