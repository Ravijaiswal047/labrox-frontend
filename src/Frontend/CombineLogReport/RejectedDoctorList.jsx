import React, { useEffect, useState } from 'react'
import { CustomButton } from '../../components/UI/CustomButton'
import MultiSelectComp from '../../components/formComponent/MultiSelectComp'
import DatePicker from '../../components/formComponent/DatePicker'
import { useTranslation } from 'react-i18next'
import Accordion from '../../components/UI/Accordion'
import { axiosInstance, axiosReport } from '../../utils/axiosInstance'
import { toast } from 'react-toastify'
import moment from 'moment'


const RejectedDoctorList = () => {
    const { t } = useTranslation()
        const [testCentreData, setTestCentreData] = useState([])
        const [formData, setFormData] = useState({
            FromDate: new Date(),
            ToDate: new Date(),
            TestCentreID: [],
            
        })
        const [loadingFormat, setLoadingFormat] = useState(false)
        // const [user, SetUser] = useState([])
        const [userSuggestions, setUserSuggestions] = useState([])
   
        const [userIndex, setUserIndex] = useState(0)
    
        const handleMultiChange = (name, selected) => {
            setFormData((prev) => ({ ...prev, [name]: selected || [] }))
        }
    
        const dateSelect = (date, name) => {
            setFormData((prev) => ({ ...prev, [name]: date }))
        }
        
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
            
        }

        try {
            const res = await axiosReport.post(
                "DoctorReport/AutoRejectedDoctorReport/DoctorReport",
                payload,
                { responseType: "blob" }
            )

            const blob = res.data

            // Some backends return an error JSON body on blob-typed endpoints
            // without an accurate content-type header, so always try parsing
            // the blob as JSON first rather than trusting the header alone.
            try {
                const text = await blob.text();
                const json = JSON.parse(text);
                if (json?.success === false) {
                    toast.error(t(json?.message || "No Data Found"));
                    return;
                }
            } catch (e) {
                // Not JSON — this is the real excel file, fall through.
            }

            if (blob.size === 0 || blob.size < 100) {
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
                `RejectedDoctorList_${new Date().toISOString().slice(0, 10)}.xlsx`
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
      <Accordion title={t("Rejected Doctor List")} defaultValue={true}>
                    <div className="row px-2 mt-2 p-1">
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <DatePicker
                                name="FromDate"
                                value={formData.FromDate}
                                onChange={dateSelect}
                                maxDate={new Date()}
                                lable={t("From Date")}
                                className="custom-calendar"
                            />
                        </div>
    
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <DatePicker
                                name="ToDate"
                                value={formData.ToDate}
                                onChange={dateSelect}
                                maxDate={new Date()}
                                minDate={formData.FromDate}
                                lable={t("To Date")}
                                className="custom-calendar"
                            />
                        </div>
    
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <MultiSelectComp
                                options={testCentreData}
                                value={formData.TestCentreID}
                                name="TestCentreID"
                                onChange={handleMultiChange}
                                label={t("Booking Centre")}
                            />
                        </div>
                       
    
                        <div className="col-sm-auto mt-1">
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
  )
}

export default RejectedDoctorList