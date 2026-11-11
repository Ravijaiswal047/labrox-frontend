
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import { toast } from "react-toastify"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import { SaveButton } from "../../../components/UI/CustomButton"
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi"

const DiversityInclusion = ({ editData, setEditData }) => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([]);
    const [loading, setLoading] = useState(false);

    const [payload, setPayload] = useState({
        centreId: "",
        maleCount: "",
        femaleCount: "",
        isActive: 1
    })

    useEffect(() => {
        if (editData) {
            setPayload({
                id: editData?.Id,
                centreId: editData?.CentreId || "",
                maleCount: editData?.MaleCount ?? "",
                femaleCount: editData?.FemaleCount ?? "",
                isActive: editData?.IsActive ?? 1,
            });
        }
    }, [editData]);

    useEffect(() => {
        getAccessCentresReports(setCentre)
    }, [])

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
    };

    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };


    const handleSave = async () => {
        const {
            centreId,
            maleCount,
            femaleCount,
            isActive
        } = payload;

        if (!centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!maleCount) {
            toast.error(t("Please select Employee"));
            return;
        }
        if (!femaleCount) {
            toast.error(t("Please enter identification type"));
            return;
        }

        setLoading(true);

        const finalPayload = {
            id: payload.id,
            centreId: centreId,
            maleCount: Number(maleCount),
            femaleCount: Number(femaleCount),
            isActive: isActive
        };

        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateDiversity", finalPayload);
            if (res?.data?.success) {
                toast.success(t(`Diversity record ${editData ? "updated" : "saved"} successfully`));

                setPayload({
                    centreId: "",
                    maleCount: "",
                    femaleCount: "",
                    isActive: 1
                })
            } else {
                toast.error(res?.data?.message || t(`Error while ${editData ? "updating" : "saving"} data`));
            }
        } catch (error) {
            console.error("Divesity Error:", error);
            toast.error(t("Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={centre}
                        name="centreId"
                        lable={t("Centre")}
                        id="centreId"
                        removeIsClearable={true}
                        placeholderName={t("Select Centre")}
                        value={payload.centreId}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="maleCount"
                        id="maleCount"
                        lable={"Number of male emp."}
                        value={payload?.maleCount}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="femaleCount"
                        id="femaleCount"
                        lable={"Number of female emp."}
                        value={payload?.femaleCount}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-auto mb-3 d-flex align-items-center" style={{ gap: "5px" }}>
                    <label className="switch mb-0">
                        <input
                            type="checkbox"
                            checked={payload.isActive === 1}
                            onChange={() => handleToggle("isActive")}
                        />
                        <span className="slider"></span>
                    </label>
                    <strong>
                        <span>{t("IsActive")}</span>
                    </strong>
                </div>
                <div className="col-auto mb-3 d-flex align-items-end">
                    <SaveButton
                        text={"Save"}
                        onClick={handleSave}
                        disabled={loading}
                    />
                </div>
            </div>
        </>
    )
}

export default DiversityInclusion;