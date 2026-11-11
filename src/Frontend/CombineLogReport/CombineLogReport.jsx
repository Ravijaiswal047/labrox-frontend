import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import moment from 'moment'
import { CustomButton } from '../../components/UI/CustomButton'
import MultiSelectComp from '../../components/formComponent/MultiSelectComp'
import DatePicker from '../../components/formComponent/DatePicker'
import Accordion from '../../components/UI/Accordion'
import { axiosInstance, axiosReport } from '../../utils/axiosInstance'
import AutoComplete from '../../components/formComponent/AutoComplete'
import Input from '../../components/formComponent/Input'
import { BindEmployeeReports } from '../../utils/NetworkApi/commonApi'
import { autocompleteOnBlur } from '../../utils/helpers'

const CombineLogReport = () => {
    const { t } = useTranslation()
    const [testCentreData, setTestCentreData] = useState([])
    const [formData, setFormData] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        TestCentreID: [],
        // UserID: "",
        // UserLabel: "",
    })
    const [loadingFormat, setLoadingFormat] = useState(false)
    // const [user, SetUser] = useState([])
    const [userSuggestions, setUserSuggestions] = useState([])
    // const [selectUser, setSelectUser] = useState(false)
    const [userIndex, setUserIndex] = useState(0)

    const handleMultiChange = (name, selected) => {
        setFormData((prev) => ({ ...prev, [name]: selected || [] }))
    }

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }))
    }

    // const handleUserInputChange = (e) => {
    //     const value = e.target.value
    //     setFormData((prev) => ({ ...prev, UserLabel: value }))

    //     if (value.trim() === "") {
    //         setSelectUser(false)
    //         setUserSuggestions([])
    //         setFormData((prev) => ({ ...prev, UserID: "", UserLabel: "" }))
    //     } else {
    //         const filtered = user.filter((item) =>
    //             item.label.toLowerCase().includes(value.toLowerCase())
    //         )
    //         setUserSuggestions(filtered)
    //         setSelectUser(true)
    //     }
    // }

    // const handleUserSelect = (selected) => {
    //     if (selected) {
    //         setFormData((prev) => ({
    //             ...prev,
    //             UserLabel: selected.label,
    //             UserID: String(selected.value),
    //         }))
    //         setUserSuggestions([])
    //         setSelectUser(false)
    //     }
    // }

    // const handleUserKeyDown = (e) => {
    //     if (userSuggestions.length === 0) return
    //     if (e.which === 38) {
    //         setUserIndex((prev) => prev > 0 ? prev - 1 : userSuggestions.length - 1)
    //     } else if (e.which === 40) {
    //         setUserIndex((prev) => prev === userSuggestions.length - 1 ? 0 : prev + 1)
    //     } else if (e.which === 13) {
    //         handleUserSelect(userSuggestions[userIndex])
    //         setUserIndex(0)
    //     }
    // }

    const getTestCentres = async () => {
        try {
            const res = await axiosInstance.get("CommonController/BindTestCentreList")
            if (res.data?.message) {
                setTestCentreData(
                    res.data.message.map((e) => ({
                        value: e.CentreID,
                        label: e.Centre,
                    }))
                )
            }
        } catch (err) {
            console.error("Error fetching test centres", err)
        }
    }

    useEffect(() => {
        getTestCentres()
        // BindEmployeeReports(SetUser)
    }, [])

    const handleReport = async () => {
        if (!formData.FromDate || !formData.ToDate) {
            toast.error(t("Please select From Date and To Date"))
            return
        }

        setLoadingFormat(true)

        const payload = {
            FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
            ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
            centreID: formData.TestCentreID.map((tc) => tc.value ?? tc),
            // userID: formData.UserID || "",
        }

        try {
            const res = await axiosReport.post(
                "CombineLogReport/LoginLogReport/CombineLoginLogReport",
                payload,
                { responseType: "blob" }
            )

            const blob = res.data
            const contentType = res.headers?.["content-type"] || ""
            const isJsonOrText =
                contentType.includes("application/json") ||
                contentType.includes("text/")

            if (isJsonOrText || blob.size === 0 || blob.size < 100) {
                toast.error(t("No records found for selected filters"))
                return
            }

            const excelBlob = new Blob([blob], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            const url = window.URL.createObjectURL(excelBlob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute(
                "download",
                `CombineLogReport_${new Date().toISOString().slice(0, 10)}.xlsx`
            )
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success(t("Excel downloaded successfully"))
            setTimeout(() => window.URL.revokeObjectURL(url), 5000)

        } catch (err) {
            console.error(err)
            toast.error(t("Error generating Excel report"))
        } finally {
            setLoadingFormat(false)
        }
    }

    return (
        <>
            <Accordion title={t("Combine Log Report")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">
                    <div className="col-sm-2">
                        <DatePicker
                            name="FromDate"
                            value={formData.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("From Date")}
                        />
                    </div>

                    <div className="col-sm-2">
                        <DatePicker
                            name="ToDate"
                            value={formData.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("To Date")}
                        />
                    </div>

                    <div className="col-sm-2">
                        <MultiSelectComp
                            options={testCentreData}
                            value={formData.TestCentreID}
                            name="TestCentreID"
                            onChange={handleMultiChange}
                            label={t("Test Centre")}
                        />
                    </div>
                    {/* <div className="col-sm-2">
                        <Input
                            type="text"
                            name="UserLabel"
                            lable={t("Employee")}
                            value={formData.UserLabel || ""}
                            placeholder=" "
                            onChange={handleUserInputChange}
                            onKeyDown={handleUserKeyDown}
                            onBlur={() => autocompleteOnBlur(setUserSuggestions)}
                        />
                        {selectUser && userSuggestions.length > 0 && (
                            <AutoComplete
                                selects={selectUser}
                                test={userSuggestions.map((item) => ({ TestName: item.label }))}
                                handleListSearch={(selected) =>
                                    handleUserSelect(
                                        userSuggestions.find((item) => item.label === selected.TestName)
                                    )
                                }
                                indexMatch={userIndex}
                            />
                        )}
                    </div> */}

                    <div className="col-sm-auto">
                        <CustomButton
                            text={t("Excel")}
                            onClick={handleReport}
                            icon={"excel"}
                            disabled={loadingFormat}
                            loading={loadingFormat}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    )
}

export default CombineLogReport