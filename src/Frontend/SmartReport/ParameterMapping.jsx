import { useEffect, useState } from "react"
import Accordion from "../../components/UI/Accordion"
import { useTranslation } from "react-i18next"
import ReactSelect from "../../components/formComponent/ReactSelect"
import Input from "../../components/formComponent/Input"
import { CustomButton, SaveButton, SearchButton } from "../../components/UI/CustomButton"
import { axiosInstance } from "../../utils/axiosInstance"
import { toast } from "react-toastify"
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch"
import Loading from "../../components/loader/Loading"
import Tables from "../../components/UI/customTable"
import NoRecordFound from "../../components/formComponent/NoRecordFound"

const ParameterMapping = () => {
    const [t] = useTranslation()
    const [groups, setGroups] = useState([])
    const [investigations, setInvestigations] = useState([])
    const [observations, setObservations] = useState([])
    const [isEdit, setIsEdit] = useState(false)
    const [formData, setFormData] = useState({
        GroupId: 0,
        InvestigationId: 0,
        ObservationId: 0,
        XAxis: "",
        YAxis: "",
        isActive: 1,
    })
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("")

    const colorCodingData = [
        { color: "#FFFFFF", id: "1", labelKey: "Active" },
        { color: "#f5c6cb", id: "2", labelKey: "In Active" },
    ];

    const getGroups = async () => {
        try {
            const res = await axiosInstance.get("SmartReport/GroupMasterDropdown");
            const data = res.data?.message;
            console.log("data", data)

            if (res.data?.success && Array.isArray(data)) {
                const mappedGroups = data.map((d) => ({
                    label: d.GroupName,
                    value: d.GroupId
                }))
                setGroups(mappedGroups)
            } else {
                setGroups([])
            }
        } catch (error) {
            console.log("Error", error)
        }
    }
    const getInvestigations = async () => {
        try {
            const res = await axiosInstance.get("Investigations/GetSmartReportInvestigations");
            const data = res.data?.message;
            if (res.data?.success && Array.isArray(data)) {
                const mappedInvestigations = data.map((d) => ({
                    label: `${d.testCode} - ${d.testName}`,
                    value: d.investigationId
                }))
                setInvestigations(mappedInvestigations)
            } else {
                setInvestigations([])
            }
        } catch (error) {
            console.log("Error", error)
        }
    }
    const getObservation = async (investigationId) => {
        try {
            const res = await axiosInstance.get(`Investigations/EditInvestigation?id=${investigationId}&DataType=Profile`);
            const data = res.data?.observationData;

            if (res.data?.success && Array.isArray(data)) {
                const mappedObservations = data.map((d) => ({
                    label: d.TestName,
                    value: d.TestId
                }))
                setObservations(mappedObservations)
            } else {
                setObservations([])
            }
        } catch (error) {
            console.log("Error", error)
        }
    }

    const handleSearch = async () => {
        try {
            const res = await axiosInstance.get("SmartReport/GetSmartReportMappings");
            const data = res.data?.message;
            if (res.data.success && Array.isArray(data)) {
                setTableData(data)
            } else {
                toast.error(data)
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    useEffect(() => {
        getGroups();
        getInvestigations();
        handleSearch();
    }, [])

    const filteredData = tableData?.filter((item) => {
        return (
            item?.GroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.InvestigationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.LabObservationName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });


    const handleChange = (e) => {
        const { name, value } = e?.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleToggle = (field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };
    const handleSelectChange = (name, event) => {
        const value = event?.value;

        if (name === "InvestigationId") {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }))
            getObservation(value)
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleSave = async () => {
        try {
            const groupName = groups.find((group) => group.value == formData.GroupId).label;
            const finalData = {
                groupId: formData.GroupId,
                groupName: groupName,
                investigationId: formData.InvestigationId,
                labObservationId: formData.ObservationId,
                leftPostion: formData.XAxis,
                topPostion: formData.YAxis,
                isActive: formData.isActive
            }
            const res = await axiosInstance.post("SmartReport/CreateSmartReportMapping", finalData);
            if (res.data.success) {
                toast.success("Smart report mapping saved.")
                handleSearch();
                setFormData({
                    GroupId: 0,
                    InvestigationId: 0,
                    ObservationId: 0,
                    XAxis: "",
                    YAxis: "",
                    isActive: 1,
                })
            } else {
                toast.error(res.data?.message)
            }
        } catch (error) {
            console.log("error", error)
        }
    }
    const handleUpdate = async () => {
        try {
            const groupName = groups.find((group) => group.value == formData.GroupId)?.label;
            const finalData = {
                groupId: formData.GroupId,
                groupName: groupName,
                investigationId: formData.InvestigationId,
                labObservationId: formData.ObservationId,
                leftPostion: formData.XAxis,
                topPostion: formData.YAxis,
                isActive: formData.isActive
            }
            const res = await axiosInstance.post("SmartReport/UpdateSmartReportMapping", finalData);
            if (res.data.success) {
                toast.success("Smart report mapping updated.")
                handleSearch();
                setIsEdit(false);
                setFormData({
                    GroupId: 0,
                    InvestigationId: 0,
                    ObservationId: 0,
                    XAxis: "",
                    YAxis: "",
                    isActive: 1,
                })
            } else {
                toast.error(res.data?.message)
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleEdit = (item) => {
        setIsEdit(true);
        setFormData({
            GroupId: item?.GroupId,
            InvestigationId: item?.InvestigationID,
            ObservationId: item?.LabObservationID,
            XAxis: item?.LeftPostion,
            YAxis: item?.TopPostion,
            isActive: item?.IsActive
        })
        getObservation(item?.InvestigationID)
    }

    return (
        <>
            <Accordion
                name={t("Smart Report Parameter Mapping")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 pl-2 pr-2 mt-1">
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={groups}
                            name="GroupId"
                            lable={t("Group")}
                            id="GroupId"
                            removeIsClearable={true}
                            placeholderName={t("Select Group")}
                            value={formData.GroupId}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={investigations}
                            name="InvestigationId"
                            lable={t("Investigation")}
                            id="InvestigationId"
                            removeIsClearable={true}
                            placeholderName={t("Select Investigation")}
                            value={formData.InvestigationId}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={observations}
                            name="ObservationId"
                            lable={t("Observation")}
                            id="ObservationId"
                            removeIsClearable={true}
                            placeholderName={t("Select Observation")}
                            value={formData.ObservationId}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-1">
                        <Input
                            className="select-input-box form-control input-sm"
                            type="text"
                            name="XAxis"
                            id="XAxis"
                            lable={"X Axis"}
                            value={formData.XAxis}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-sm-1">
                        <Input
                            className="select-input-box form-control input-sm"
                            type="text"
                            name="YAxis"
                            id="YAxis"
                            lable={"Y Axis"}
                            value={formData.YAxis}
                            onChange={handleChange}
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
                        <CustomButton
                            text={isEdit ? "Update" : "Save"}
                            icon={isEdit ? "edit" : "save"}
                            onClick={isEdit ? handleUpdate : handleSave}
                        />
                    </div>
                </div>
            </Accordion>
            <Accordion
                name={t("Parameter Mapping")}
                defaultValue={true}
                isBreadcrumb={true}
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
                <div className="row px-2 mt-2 mb-2">
                    <div className="col-12">
                        {loading ? (
              <Loading />
            ) : (
                <>
                    <Tables>
                        <thead className="cf">
                            <tr>
                                <th>{t("S.No")}</th>
                                <th>{t("Group Name")}</th>
                                <th>{t("Investigation Name")}</th>
                                <th>{t("Observation Name")}</th>
                                <th>{t("X-Axis")}</th>
                                <th>{t("Y-Axis")}</th>
                                <th>{t("Action")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData?.length > 0 ? (
                                filteredData?.map((item, index) => {
                                    const rowColor = item.IsActive == 1 ? "#FFFFFF" : "#f5c6cb";
                                    return (
                                        <tr key={index} style={{ backgroundColor: rowColor }}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Group Name")}>{item?.GroupName}</td>
                                            <td data-title={t("Investigation Name")}>{item?.InvestigationName}</td>
                                            <td data-title={t("Observation Name")}>{item?.LabObservationName}</td>
                                            <td data-title={t("X-Axis")}>{item?.LeftPostion}</td>
                                            <td data-title={t("Y-Axis")}>{item?.TopPostion}</td>
                                            <td data-title={t("Action")}>
                                                <CustomButton
                                                    icon={"edit"}
                                                    onClick={() => handleEdit(item)}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center">
                                        <NoRecordFound />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Tables>
                </>
            )}
                    </div> 
                </div>
            </Accordion>
        </>
    )
}

export default ParameterMapping
