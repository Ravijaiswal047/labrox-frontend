import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { SearchButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import Accordion from "../../../components/UI/Accordion"
import Tables from "../../../components/UI/customTable"
import NoRecordFound from "../../../components/formComponent/NoRecordFound"
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi"
import PdfPreviewModal from "../../utils/PdfPreviewModal"
import { parseAwsKeys } from "../../../utils/helpers"
import moment from "moment"

const NeedleStickInjurySearch = ({ onEdit }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [previewConfig, setPreviewConfig] = useState({ visible: false, url: null })

    const [payload, setPayload] = useState({
        centreID: "",
        fromDate: new Date(),
        toDate: new Date(),
    })

    useEffect(() => {
        getAccessCentresReports(setCentre)
    }, [])

    const handleOpenPreview = (keys) => {
        const parsedKeys = parseAwsKeys(keys)
        if (!parsedKeys) return
        setPreviewConfig({ visible: true, url: parsedKeys })
    }

    const handleClosePreview = () => {
        setPreviewConfig({ visible: false, url: null })
    }

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({ ...prev, [name]: value }))
    }

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({ ...prev, [name]: value?.value ?? "" }))
    }

    const handleSearch = async () => {
        setLoading(true)
        const finalPayload = {
            centreID: Number(payload.centreID) || 0,
            fromDate: moment(payload.fromDate).format("YYYY-MM-DD"),
            toDate: moment(payload.toDate).format("YYYY-MM-DD"),
        }
        try {
            const res = await axiosInstance.post("ESG/GetInjuarPerson", finalPayload)
            if (res?.data?.success) {
                setTableData(res?.data?.message || [])
            } else {
                toast.error(res?.data?.message || t("Error while fetching data"))
            }
        } catch {
            toast.error(t("Something went wrong"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <PdfPreviewModal
                visible={previewConfig.visible}
                url={previewConfig.url}
                onClose={handleClosePreview}
            />
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={centre}
                        name="centreID"
                        id="centreID"
                        placeholderName={t("Select Centre")}
                        value={payload.centreID}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="fromDate"
                        id="fromDate"
                        className="custom-calendar"
                        lable={t("From Date")}
                        value={payload.fromDate}
                        onChange={handleDateChange}
                        maxDate={payload.toDate}
                        
                    />
                    </div>
                {/* </div> */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="toDate"
                        id="toDate"
                        className="custom-calendar"
                        lable={t("To Date")}
                        value={payload.toDate}
                        onChange={handleDateChange}
                        minDate={payload.fromDate}
                        maxDate={new Date()}
                         
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <SearchButton
                        text={t("Search")}
                        onClick={handleSearch}
                        disabled={loading}
                         className="mx-2"
                    />
                </div>
            </div>

            <Accordion title={t("Needle Stick Injury Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Centre")}</th>
                                        <th>{t("Injured Person")}</th>
                                        <th>{t("Injured Person Role")}</th>
                                        <th>{t("Source Patient Name")}</th>
                                        <th>{t("Source Patient Status")}</th>
                                        <th>{t("Device")}</th>
                                        <th>{t("Injury Description")}</th>
                                        <th>{t("Injury Date")}</th>
                                        <th>{t("Injury Form")}</th>
                                        <th>{t("Test Record")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Centre")}>{data?.CentreName}</td>
                                            <td data-title={t("Person Name")}>{data?.PersonName}</td>
                                            <td data-title={t("Role")}>
                                                {data?.Role === "Other" ? data?.OtherRole : data?.Role}
                                            </td>
                                            <td data-title={t("Source Patient Name")}>{data?.SourcePatientName}</td>
                                            <td data-title={t("HIV/HBV/HCV Status")}>{data?.HIVStatus}</td>
                                            <td data-title={t("Device")}>
                                                {data?.Device === "Other" ? data?.OtherDevice : data?.Device}
                                            </td>
                                            <td data-title={t("Injury Description")}>{data?.InjuryDescription}</td>
                                            <td data-title={t("Injury Date")}>{data?.InjuryDate}</td>

                                            {/* Injury Form */}
                                            <td data-title={t("Injury Form")}>
                                                {Number(data?.NeedleStickCount) > 0 ? (
                                                    <i
                                                        className="fa fa-file-text text-primary cursor-pointer fs-5"
                                                        onClick={() => handleOpenPreview(data?.NeedleStickFiles)}
                                                        title={t("View Injury Form")}
                                                    />
                                                ) : (
                                                    <span className="text-muted">{t("Not Uploaded")}</span>
                                                )}
                                            </td>

                                            {/* Test Record */}
                                            <td data-title={t("Test Record")}>
                                                {Number(data?.NeedleStickTestCount) > 0 ? (
                                                    <i
                                                        className="fa fa-file-text text-success cursor-pointer fs-5"
                                                        onClick={() => handleOpenPreview(data?.NeedleStickTestFiles)}
                                                        title={t("View Test Record")}
                                                    />
                                                ) : (
                                                    <span className="text-muted">{t("Not Uploaded")}</span>
                                                )}
                                            </td>

                                            <td data-title={t("Action")}>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => onEdit(data)}
                                                >
                                                    <i className="fa fa-edit"></i>
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
        </>
    )
}

export default NeedleStickInjurySearch
