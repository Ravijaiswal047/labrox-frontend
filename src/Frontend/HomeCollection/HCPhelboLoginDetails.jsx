import React, { useEffect, useState } from 'react'
import Accordion from '../../components/UI/Accordion'
import { useTranslation } from 'react-i18next'
import DatePicker from '../../components/formComponent/DatePicker';
import { axiosInstance } from '../../utils/axiosInstance';
import ReactSelect from '../../components/formComponent/ReactSelect';
import { CustomButton, SearchButton } from '../../components/UI/CustomButton';
import { ExportToExcel } from '../../utils/helpers';
import NoRecordFound from '../../components/formComponent/NoRecordFound';
import Tables from '../../components/UI/customTable';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import { Dialog } from 'primereact/dialog';
const HCPhelboLoginDetails = () => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;

    const [stateOptions, setStateOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [searchData, setSearchData] = useState([]);
    const [loading, setLoading] = useState(false)

    const [imgLoading, setImgLoading] = useState(false)

    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        StateID: "",
        CityID: "",
    });

    const [showImg, setShowImg] = useState({
        data: "",
        open: false
    })

    const getStateDropDown = () => {
        axiosInstance
            .post("CommonHC/GetStateData", {
                BusinessZoneID: 0,
            })
            .then((res) => {
                if (Array.isArray(res?.data?.message)) {
                    const data = res?.data?.message;
                    const States = data?.map((ele) => {
                        return {
                            // ID: ele?.ID,
                            value: ele?.ID,
                            label: ele?.State,
                        };
                    });
                    setStateOptions(States);
                } else {
                    setStateOptions([]);
                }
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };
    const getCityDropDown = (StateId) => {
        axiosInstance
            .post("CommonHC/GetCityData", {
                StateId: [StateId],
            })
            .then((res) => {
                if (Array.isArray(res?.data?.message)) {
                    const data = res?.data?.message;
                    const Cities = data?.map((ele) => {
                        return {
                            value: ele?.ID,
                            label: ele?.City,
                        };
                    });
                    setCityOptions(Cities);
                } else {
                    setCityOptions([]);
                }
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };

    useEffect(() => {
        getStateDropDown();
    }, [])

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, event) => {
        const { value } = event;
        if (name === "StateID") {
            setPayload((prev) => ({
                ...prev,
                [name]: value
            }));
            getCityDropDown(value);
        } else {
            setPayload((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSearch = async () => {
        const finalPayload = {
            fromDate: payload.FromDate,
            toDate: payload.ToDate,
            stateId: payload.StateID.toString(),
            cityId: payload.CityID,
        }
        setLoading(true)
        try {
            const res = await axiosInstance.post("CustomerCare/HomeCollectionLoginDetail", finalPayload)
            if (res.data?.success && Array.isArray(res.data?.message)) {
                setSearchData(res.data?.message)
            } else {
                setSearchData([])
            }
        } catch (error) {
            console.log("Error while fetching login detail", error)
        } finally {
            setLoading(false)
        }
    }

    const getImage = async (imageKey) => {
    setImgLoading(true)
    setShowImg({ data: "", open: true }) // open dialog immediately with loading state
    try {
        const res = await axiosInstance.post(`LogisticWeb/GetImages?ImageKey=${imageKey}`)
        if (res.data?.success && res.data?.message) {
            const src = res.data.message?.trim()
            setShowImg({ data: src, open: true })
        } else {
            toast.error("Image not found")
            setShowImg({ data: "", open: false })
        }
    } catch (error) {
        console.log("Error while fetching image", error)
        toast.error("Failed to load image")
        setShowImg({ data: "", open: false })
    } finally {
        setImgLoading(false)
    }
}

    return (
        <div>
            <Accordion
                name={t("Phlebotomist Login Details")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row mx-2 mt-2">
                    <div className="col-sm-2">
                        <DatePicker
                            name="FromDate"
                            className="custom-calendar"
                            id="FromDate"
                            lable={t("FromDate")}
                            value={payload.FromDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <DatePicker
                            name="ToDate"
                            className="custom-calendar"
                            id="ToDate"
                            lable={t("ToDate")}
                            value={payload.ToDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select State", value: "" }, ...stateOptions]}
                            name="StateID"
                            id="State"
                            lable="State"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("State")}
                            value={payload?.StateID}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select City", value: "" }, ...cityOptions]}
                            name="CityID"
                            id="City"
                            lable="City"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("City")}
                            value={payload?.CityID}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-auto">
                        <SearchButton
                            text={"Search"}
                            onClick={handleSearch}
                            disabled={loading}
                        />
                    </div>
                    <div className="col-sm-auto">
                        <CustomButton
                            text={"Export To Excel"}
                            icon={"Excel"}
                            onClick={() => ExportToExcel()}
                            variant="outline"
                        />
                    </div>
                </div>
            </Accordion>
            <Accordion
                name="Search Data"
                defaultValue={true}
            >
                <div className="row gx-3 gy-3">
                    <div className="card w-100">
                        <div className="card-body p-2">
                            <div className="table-responsive" style={{ width: "100%" }}>
                                {searchData?.length > 0 ? (
                                    <Tables
                                        style={{
                                            maxHeight: "400px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th scope="col">{t("#")}</th>
                                                <th scope="col">{t("Name")}</th>
                                                <th scope="col">{t("Mobile")}</th>
                                                <th scope="col">{t("State")}</th>
                                                <th scope="col">{t("City")}</th>
                                                <th scope="col">{t("LoginDate")}</th>
                                                <th scope="col">{t("PhelboSource")}</th>
                                                <th scope="col">{t("SelfieImage")}</th>
                                                <th scope="col">{t("BikeImage")}</th>
                                                <th scope="col">{t("BagImage")}</th>
                                                <th scope="col">{t("TempImage")}</th>
                                                <th scope="col">{t("TempValue")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchData.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{row?.name}</td>
                                                    <td>{row?.Mobile}</td>
                                                    <td>{row?.state}</td>
                                                    <td>{row?.City}</td>
                                                    <td>{row?.LoginDate}</td>
                                                    <td>{row?.PhelboSource}</td>
                                                    <td>
                                                        {row?.SelfieUrl ?
                                                            <div onClick={() => getImage(row.SelfieUrl)}>
                                                                <i className="bi bi-eye-fill text-blue"></i>
                                                            </div> : "-"}
                                                    </td>
                                                    <td>
                                                        {row?.BikeUrl ?
                                                            <div onClick={() => getImage(row.BikeUrl)}>
                                                                <i className="bi bi-eye-fill text-blue"></i>
                                                            </div> : "-"}
                                                    </td>
                                                    <td>
                                                        {row?.BagUrl ?
                                                            <div onClick={() => getImage(row.BagUrl)}>
                                                                <i className="bi bi-eye-fill text-blue"></i>
                                                            </div> : "-"}
                                                    </td>
                                                    <td>
                                                        {row?.TempImage ?
                                                            <div onClick={() => getImage(row.TempImage)}>
                                                                <i className="bi bi-eye-fill text-blue"></i>
                                                            </div> : "-"}
                                                    </td>
                                                    <td>{row.TempValue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Tables>
                                ) : (
                                    <NoRecordFound />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Accordion>

            <Dialog
                visible={showImg.open}
                className={theme}
                header={t("Image")}
                onHide={() => {
                    setShowImg({ data: "", open: false });
                }}
                style={{
                    width: isMobile ? "80vw" : "70vw",
                }}
            >
                 <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
        {imgLoading ? (
            <div>Loading...</div>
        ) : showImg?.data ? (
            <img
                src={showImg.data}
                alt="Full View"
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
                onError={(e) => {
                    console.error("Image failed to render, src prefix:", showImg.data?.substring(0, 50))
                    e.target.style.display = "none"
                }}
            />
        ) : (
            <div>No image found.</div>
        )}
    </div>
            </Dialog>
        </div>
    )
}

export default HCPhelboLoginDetails