import { useEffect, useState } from "react"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"
import { useTranslation } from "react-i18next"
import DatePicker from "../../../components/formComponent/DatePicker"
import Input from "../../../components/formComponent/Input"
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import { axiosInstance } from "../../../utils/axiosInstance"
import Accordion from "../../../components/UI/Accordion"
import UploadFile from "../../utils/UploadFileModal/UploadFile"
import { guidNumber } from "../../../utils/generateGuid"
import moment from "moment"

const DISPOSAL_METHOD_OPTIONS = [
    { label: "Municipal waste disposal", value: "Municipal waste disposal" },
    { label: "Puncture-proof sharp container", value: "Puncture-proof sharp container" },
    { label: "Third-party disposal", value: "Third-party disposal" },
    { label: "Autoclave", value: "Autoclave" },
    { label: "Neutralization", value: "Neutralization" },
    { label: "Dilution", value: "Dilution" },
    { label: "Others", value: "Others" },
];

const WasteManagement = ({ editData, setEditData }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [loading, setLoading] = useState({
        generated: false,
        disposal: false
    })
    const [showFileModal, setShowFileModal] = useState({
        modal: false,
        data: "",
        index: -1,
    });
    const [payload, setPayload] = useState({
        CentreId: "",
        WasteMonth: "",
        InfectiousKg: "",
        GeneralKg: "",
        SharpsKg: "",
        IsActive: 1,
        ChemicalWasteLtrs: "",
    })
    const [disposablePayload, setDisposablePayload] = useState({
        WasteGeneratedId: 0,
        DisposalDate: new Date(),
        DisposalMethod: [],
        DisposalItemType: "",
        IsActive: 1,
        FilePath: "",
    })
    const [othersText, setOthersText] = useState("");

    useEffect(() => {
        if (editData) {
            setPayload({
                Id: editData?.Id,
                CentreId: editData?.CentreId,
                WasteMonth: editData?.WasteMonth ? new Date(editData.WasteMonth) : "",
                InfectiousKg: editData?.InfectiousKg || "",
                GeneralKg: editData?.GeneralKg || "",
                SharpsKg: editData?.SharpsKg || "",
                IsActive: editData?.IsActive ?? 1,
                ChemicalWasteLtrs: editData?.ChemicalWaste || "",
            });

            setDisposablePayload(prev => ({
                ...prev,
                WasteGeneratedId: editData?.Id,
                DisposalMethod: [],
                DisposalItemType: "",
            }));
            setOthersText("");
        }
    }, [editData]);

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message;
            const CentreDataValue = data.map((ele) => {
                return {
                    value: ele.CentreID,
                    label: ele.Centre,
                };
            });
            setCentre(CentreDataValue);
        } catch (error) {
            console.log("Error while fetching centres");
        }
    };

    useEffect(() => {
        getAccessCentres()
    }, [])

    const handleSelectChange = (name, value, stateName) => {
        const setter = stateName === "disposable" ? setDisposablePayload : setPayload;

        setter((prev) => ({
            ...prev,
            [name]: value?.value
        }));
    };

    const handleDateChange = (value, name, stateName) => {
        const setter = stateName === "disposable" ? setDisposablePayload : setPayload;

        setter((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggle = (field, stateName) => {
        const setter = stateName === "disposable" ? setDisposablePayload : setPayload;

        setter((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleInputChange = (e, stateName) => {
        const { name, value } = e.target;
        const setter = stateName === "disposable" ? setDisposablePayload : setPayload;

        setter((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenUploadModal = () => {
        const currentGuid = payload.FilePath || guidNumber();

        setDisposablePayload(prev => ({ ...prev, FilePath: currentGuid }));

        setShowFileModal({
            modal: true,
            data: currentGuid,
            index: -1,
        });
    };

    const handleCaptureUploadedFile = (name, count, isUploaded) => {
        if (count > 0) {
            toast.success(`${count} file(s) linked successfully.`);
        }
    };

    const handleSave = async () => {
        setLoading({ ...loading, generated: true })
        const { CentreId, WasteMonth, GeneralKg, InfectiousKg, SharpsKg } = payload;

        if (!WasteMonth) {
            toast.error(t("Please select a Waste Month"));
            return
        }
        if (!CentreId) {
            toast.error(t("Please select a Centre"));
            return
        }
        const hasAtLeastOneKg = Number(GeneralKg) > 0 || Number(InfectiousKg) > 0 || Number(SharpsKg) > 0 || Number(payload.ChemicalWasteLtrs) > 0;
        if (!hasAtLeastOneKg) {
            toast.error(t("Please select a General, Infectious or Sharps Kg"));
            return
        }

        const finalPayload = {
            id: payload?.Id || 0,
            centreId: CentreId,
            wasteMonth: WasteMonth,
            generalKg: Number(GeneralKg) || 0,
            infectiousKg: Number(InfectiousKg) || 0,
            sharpsKg: Number(SharpsKg) || 0,
            chemicalWaste: Number(payload.ChemicalWasteLtrs) || 0,
        }
        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateWasteGenerated", finalPayload);
            const data = res?.data;
            if (data?.success) {
                toast.success(`Waste generated data ${editData ? "updated" : "added"}.`)
                setEditData(null)

                setPayload({
                    CentreId: "",
                    WasteMonth: "",
                    InfectiousKg: "",
                    GeneralKg: "",
                    SharpsKg: "",
                    IsActive: 1,
                    ChemicalWasteLtrs: "",
                })
            } else {
                toast.error(data?.message || "Error while adding data")
            }
        } catch (error) {
            console.log("Error while adding data", error)
        } finally {
            setLoading({ ...loading, generated: false })
        }
    }
    const handleDisposableSave = async () => {
        setLoading({ ...loading, disposal: true })
        const { DisposalDate, DisposalMethod, FilePath, WasteGeneratedId, DisposalItemType } = disposablePayload;

        if (!WasteGeneratedId) {
            toast.error(t("No waste record selected for disposal. Please select one from the list."));
            setLoading({ ...loading, disposal: false });
            return;
        }
        if (!DisposalDate) {
            toast.error(t("Please select Disposal Date"));
            setLoading({ ...loading, disposal: false });
            return;
        }
        if (!DisposalItemType) {
            toast.error(t("Please select an Item to Dispose"));
            setLoading({ ...loading, disposal: false });
            return;
        }
        if (!DisposalMethod.length) {
            toast.error(t("Please select Disposal Method"));
            setLoading({ ...loading, disposal: false });
            return;
        }
        if (DisposalMethod.includes("Others") && !othersText.trim()) {
            toast.error(t("Please specify the custom disposal method for Others"));
            setLoading({ ...loading, disposal: false });
            return;
        }

        const methodsToSend = DisposalMethod.map(m => m === "Others" ? othersText.trim() : m).join(", ");

        const now = new Date();
        const disposalDateWithTime = moment(DisposalDate)
            .set({ hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds(), millisecond: 0 })
            .format("YYYY-MM-DDTHH:mm:ss");

        const finalDisposablePayload = {
            wasteGeneratedId: WasteGeneratedId,
            disposalDate: disposalDateWithTime,
            disposalMethod: DisposalMethod,
            disposalItemType: DisposalItemType,
            filePath: FilePath,
            otherDisposalType: DisposalMethod.includes("Others") ? othersText.trim() : ""
        }
      
        try {
            const res = await axiosInstance.post("ESG/AddWasteDisposal", finalDisposablePayload);
            const data = res?.data;
            if (data?.success) {
                toast.success(`Waste disposable saved successfully.`);
                // Update editData's DisposalList so the disposed item is excluded from the dropdown
                setEditData(prev => ({
                    ...prev,
                    DisposalList: [
                        ...(prev.DisposalList || []),
                        { DisposalItemType: DisposalItemType }
                    ]
                }));
                // Reset form fields but keep WasteGeneratedId so next disposal works
                setDisposablePayload(prev => ({
                    ...prev,
                    DisposalDate: new Date(),
                    DisposalMethod: [],
                    DisposalItemType: "",
                    FilePath: "",
                }));
                setOthersText("");
            } else {
                toast.error(data?.message || "Error while adding data")
            }
        } catch (error) {
            console.log("Error while adding data", error)
        } finally {
            setLoading({ ...loading, disposal: false })
        }
    }

    return (
        <>
             {!editData?.isDisposalMode && (
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={centre}
                        name="CentreId"
                        lable={t("Centre")}
                        id="CentreId"
                        removeIsClearable={true}
                        placeholderName={t("Select Centre")}
                        value={payload.CentreId}
                        onChange={(name, val) => handleSelectChange(name, val, "main")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="WasteMonth"
                        id="WasteMonth"
                        className="custom-calendar"
                        lable={t("Select Month & Year")}
                        value={payload.WasteMonth}
                        onChange={(value, name) => handleDateChange(value, name, "main")}
                        view="month"
                        dateFormat="M/yy"
                        placeholder="MM/YYYY"
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="number"
                        name="InfectiousKg"
                        id="InfectiousKg"
                        lable={"Infectious (in kg)"}
                        value={payload.InfectiousKg}
                        onChange={(e) => handleInputChange(e, "main")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="number"
                        name="GeneralKg"
                        id="GeneralKg"
                        lable={"General (in kg)"}
                        value={payload.GeneralKg}
                        onChange={(e) => handleInputChange(e, "main")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="number"
                        name="SharpsKg"
                        id="SharpsKg"
                        lable={"Sharps (in kg)"}
                        value={payload.SharpsKg}
                        onChange={(e) => handleInputChange(e, "main")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="number"
                        name="ChemicalWasteLtrs"
                        id="ChemicalWasteLtrs"
                        lable={"Chemical Waste (in ltrs)"}
                        value={payload.ChemicalWasteLtrs}
                        onChange={(e) => handleInputChange(e, "main")}
                    />
                </div>
                {/* <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                    gap: "5px"
                }}>
                    <label class="switch mb-0">
                        <input
                            type="checkbox"
                            checked={payload.IsActive === 1}
                            onChange={() => handleToggle("IsActive", "main")}
                        />
                        <span class="slider"></span>
                    </label>
                    <strong>
                        <span>{t("IsActive")}</span>
                    </strong>
                </div> */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <CustomButton
                        text={editData ? "Update" : "Log Waste"}
                        icon={editData ? "edit" : "save"}
                        onClick={handleSave}
                        disabled={loading.generated}
                    />
                </div>
            </div>
             )}
            {editData?.isDisposalMode && (
                <Accordion
                    title={"Waste Disposable"}
                    defaultValue={true}
                >
                    <div className="row p-2">
                        <div className="col-sm-2">
                            <DatePicker
                                name="DisposalDate"
                                id="DisposalDate"
                                lable={t("Select Date")}
                                value={disposablePayload.DisposalDate}
                                onChange={(name, value) => handleDateChange(name, value, "disposable")}
                            />
                        </div>
                        <div className="col-sm-2">
                            <ReactSelect
                                id="DisposalItemType"
                                name="DisposalItemType"
                                placeholderName="Item to Dispose"
                                value={disposablePayload.DisposalItemType}
                                dynamicOptions={(() => {
                                    const disposed = editData?.DisposalList?.map(d => d.DisposalItemType) || [];
                                    return [
                                        ...(Number(editData?.GeneralKg) > 0 && !disposed.includes("GeneralKg") ? [{ label: `General (${editData.GeneralKg} Kg)`, value: "GeneralKg" }] : []),
                                        ...(Number(editData?.InfectiousKg) > 0 && !disposed.includes("InfectiousKg") ? [{ label: `Infectious (${editData.InfectiousKg} Kg)`, value: "InfectiousKg" }] : []),
                                        ...(Number(editData?.SharpsKg) > 0 && !disposed.includes("SharpsKg") ? [{ label: `Sharps (${editData.SharpsKg} Kg)`, value: "SharpsKg" }] : []),
                                        ...(Number(editData?.ChemicalWaste) > 0 && !disposed.includes("ChemicalWaste") ? [{ label: `Chemical Waste (${editData.ChemicalWaste} Ltrs)`, value: "ChemicalWaste" }] : []),
                                    ];
                                })()}
                                onChange={(name, val) => setDisposablePayload(prev => ({ ...prev, [name]: val?.value ?? "" }))}
                            />
                        </div>
                        <div className="col-sm-2">
                            <MultiSelectComp
                                id="DisposalMethod"
                                name="DisposalMethod"
                                // label="Disposal Method"
                                placeholder="Disposal Method"
                                value={disposablePayload.DisposalMethod}
                                options={DISPOSAL_METHOD_OPTIONS}
                                onChange={(name, value) => setDisposablePayload(prev => ({ ...prev, [name]: value }))}
                            />
                        </div>
                        {disposablePayload.DisposalMethod.includes("Others") && (
                            <div className="col-sm-2">
                                <Input
                                    type="text"
                                    name="OthersText"
                                    id="OthersText"
                                    lable={"Specify Others"}
                                    // placeholder="Specify Others"
                                    value={othersText}
                                    onChange={(e) => setOthersText(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="col-auto">
                            <CustomButton
                                text={disposablePayload.FilePath ? t("File Linked") : t("Upload file")}
                                onClick={handleOpenUploadModal}
                            />
                        </div>
                        <div className="col-auto d-flex" style={{ gap: "6px" }}>
                            <CustomButton
                                text={"Cancel"}
                                onClick={() => setEditData(null)}
                            />
                            <SaveButton
                                text={"Record Disposal"}
                                onClick={handleDisposableSave}
                            />
                        </div>
                    </div>
                </Accordion>
            )}

            {showFileModal?.modal && (
                <UploadFile
                    show={showFileModal?.modal}
                    handleClose={() => {
                        setShowFileModal({ modal: false, data: "", index: -1 });
                    }}
                    // options={Identity}
                    documentId={showFileModal?.data}
                    pageName="Chemical"
                    handleUploadCount={handleCaptureUploadedFile}
                />
            )}
        </>
    )
}

export default WasteManagement