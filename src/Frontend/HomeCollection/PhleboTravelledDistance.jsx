import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import moment from "moment";
import Tables from "../../components/UI/customTable";
import { FaSearch } from "react-icons/fa"
import PhleboTravelledDistanceViewModal from "../utils/PhleboTravelledDistanceViewModal";
import PhleboMapModal from "../utils/PhleboMapModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { toast } from "react-toastify";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SearchButton } from "../../components/UI/CustomButton";

const PhleboTravelledDistance = () => {
    const { t } = useTranslation();
    const [Phelbos, setPhelbos] = useState([]);
    const [phlebotomistData, setPhlebotomistData] = useState([]);
    const [load, setLoad] = useState(false);
    const [travelDetail, setTravelDetail] = useState(null)
    const [singleData, setSingleData] = useState([])
    const [singleDataLoading, setSingleDataLoading] = useState(false)
    const [travelMapData, setTravelMapData] = useState([]);
    const [mapData, setMapData] = useState(null)
    const [mapDataLoading, setMapDataLoading] = useState(false)
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openMapModal, setOpenMapModal] = useState(false);
    const [formData, setFormdata] = useState({
        fromdate: new Date(),
        todate: new Date(),
        type: "0",
        phelboid: "0",
        excel: "0",
        stateid: "0",
        cityid: "0",
    });

    const bindPhelbo = () => {
        axiosInstance
            .get("HomeCollectionSearch/BindPhelebo")
            .then((res) => {
                const data = res.data.message;
                const Phelbos = data.map((ele) => {
                    return {
                        name: ele.name,
                        value: ele.PhlebotomistID,
                        label: ele.name,
                    };
                });

                setPhelbos(Phelbos);
            })
            .catch((err) => {
                toast.error("Something Went wrong");
            });
    };

    const dateSelect = (value, name) => {
        console.log("value, name", value, name)
        setFormdata({
            ...formData,
            [name]: value,
        });
    };


    const formChangeHandler = (name, event) => {
        const { value } = event;
        setFormdata({ ...formData, [name]: value });
    };

    useEffect(() => {
        bindPhelbo();
    }, []);

    const handleSearch = async () => {
        setLoad(true);

        const payload = {
            fromdate: moment(formData.fromdate).format("DD-MMM-YYYY"),
            todate: moment(formData.todate).format("DD-MMM-YYYY"),
            type: String(formData.type ?? "0"),
            excel: Number(formData.excel ?? 0),
            stateid: String(formData.stateid ?? "0"),
            cityid: String(formData.cityid ?? "0"),
            phelboid: String(formData.phelboid ?? "0"),
            // phelboid: "2",
        };

        try {
            const res = await axiosInstance.post("HomeCollectionSearch/PhelboTravelData", payload);

            console.log("response status:", res.status);
            const data = res.data;
            if (data.success) {
                setPhlebotomistData(data.message)
            } else {
                setPhlebotomistData([])
            }
            setLoad(false)
        } catch (error) {
            setLoad(false)
            console.log("Error", error);
            toast.error("Something went wrong")
        }
    };


    const handleSearchById = async (data) => {
        setSingleDataLoading(true);
       
        setTravelDetail(data)


        const payload = {
            PhlebotomistID: String(data.PhlebotomistID),
            fromdate: moment(formData.fromdate).format("DD-MMM-YYYY"),
            todate: moment(formData.todate).format("DD-MMM-YYYY"),
        };

        try {
            const res = await axiosInstance.post("HomeCollectionSearch/PhelboTravelDataDetail", payload);
            const data = res.data;

         const message = Array.isArray(data?.message) ? data.message : (data?.message ? [data.message] : []);

         if (message.length === 0) {
                toast.error("No data found");
                setTravelMapData([]);
                return;
            }
            if (!data?.success) {
                toast.error("Something went wrong");
                setTravelMapData([]);
                return;
            }

            setSingleData(message)
             setOpenViewModal(true)
           
        } catch (error) {
            console.log("Error", error);
            toast.error("Something went wrong")
        } finally {
            setSingleDataLoading(false)
            
        }
    };

    const handleTravelDataForMap = async (data) => {
        console.log("travel distance", data)
        setMapDataLoading(true);
        setMapData(data)

        const raw = data.TravalDate;
        const parts = raw.split(" - ").map(p => p.trim());
        const selectedDate = parts.length > 1 ? parts[1] : parts[0];

        const payload = {
            PhlebotomistID: String(data.PhlebotomistID),
            fromdate: moment(selectedDate, "DD-MMM-YYYY").format("DD-MMM-YYYY")
        };

        try {
            const res = await axiosInstance.post("HomeCollectionSearch/PhelboTravelDataDetailForMap", payload);
            const data = res.data;

            const message = Array.isArray(data?.message) ? data.message : (data?.message ? [data.message] : []);

            if (message.length === 0) {
                toast.error("No data found");
                setTravelMapData([]);
                return;
            }
            if (!data?.success) {
                toast.error("Something went wrong");
                setTravelMapData([]);
                return;
            }



            setTravelMapData(message)
            setOpenMapModal(true);
        } catch (error) {
            console.log("Error", error);
            toast.error("Something went wrong")
            setTravelMapData([]);
        } finally {
            setMapDataLoading(false)
        }
    };

    // console.log("formData", formData);

    return (
        <>
            <Accordion
                name={t("Phlebo Travelled Distance")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 pl-2 pr-2">
                    <div className="col-sm-2">
                        {/* <SelectBox
                            name="phelboid"
                            lable={t("Phelbo")}
                            placeholder=""
                            selectedValue={formData?.phelboid}
                            options={[{ label: "Select Phelbo", value: "0" }, ...Phelbos]}
                            onChange={formChangeHandler}
                        /> */}
                        <ReactSelect
                            dynamicOptions={[{ label: "Select Phelbo", value: "0" }, ...Phelbos]}
                            name="phelboid"
                            lable={t("Phelbo")}
                            id="phelboid"
                            removeIsClearable={true}
                            placeholderName={t("Phelbo")}
                            value={formData?.phelboid}
                            onChange={formChangeHandler}
                        />
                    </div>
                    <div className="row col-sm-2">
                        <div className="col-sm-6 d-flex justify-content-center">
                            <input
                                type="radio"
                                name="reportType"
                                id="summary"
                                value={"0"}
                                checked={formData.type === "0"}
                                onChange={(e) => setFormdata({ ...formData, type: e.target.value })}
                            ></input>
                            <label className="control-label mb-0 mt-2 ml-2 " htmlFor="summary">
                                {t("Summary")}
                            </label>
                        </div>
                        <div className="col-sm-6 d-flex justify-content-center">
                            <input
                                type="radio"
                                name="reportType"
                                id="daywise"
                                value={"1"}
                                checked={formData.type === "1"}
                                onChange={(e) => setFormdata({ ...formData, type: e.target.value })}
                            ></input>
                            <label className="control-label mb-0 mt-2 ml-2" htmlFor="daywise">
                                {t("Day Wise")}
                            </label>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <DatePicker
                            className="custom-calendar"
                            name="fromdate"
                            value={formData?.fromdate}
                            placeholder=" "
                            id="fromdate"
                            lable="FromDate"
                            onChange={dateSelect}
                            maxDate={new Date(formData.todate)}
                            // maxDate={new Date()}
                        />
                    </div>
                    <div className="col-sm-2">
                        <DatePicker
                            className="custom-calendar"
                            name="todate"
                            value={formData?.todate}
                            placeholder=" "
                            id="todate"
                            lable="ToDate"
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={new Date(formData.fromdate)}
                        />
                    </div>
                    <div className="col-md-1 col-sm-6 col-xs-12">
                        {load ? (
                            <Loading />
                        ) : (
                            // <button
                            //     type="button"
                            //     className="btn btn-block btn-success btn-sm"
                            //     onClick={handleSearch}
                            // >
                            //     {t("Search")}
                            // </button>
                            <SearchButton
                                text={"Search"}
                                onClick={handleSearch}
                            />
                        )}
                    </div>
                </div>
            </Accordion>

            <Accordion title={t("Search Data")} defaultValue={true}>
                <div className="row px-2 mt-2 mb-2">
                    <div className="col-12">
                        <>
                            {phlebotomistData.length > 0 ? (
                                <Tables
                                    style={{
                                        maxHeight: "400px",
                                        overflowY: "auto",
                                    }}
                                >
                                    <thead className="cf">
                                        <tr>
                                            <th>{t("S.No")}</th>
                                            <th>{t("Phlebotomist ID")}</th>
                                            <th>{t("Phlebotomist Name")}</th>
                                            <th>{t("Mobile")}</th>
                                            <th>{t("Travel Date")}</th>
                                            <th>{t("Travel Distance")}</th>
                                            <th className="text-center">{t("View Detail")}</th>
                                            <th className="text-center">{t("View in Map")}</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {phlebotomistData.map((item, index) => (
                                            <tr key={item.sno ?? index}>
                                                <td data-title={t("S.No")}>{index + 1}</td>
                                                <td data-title={t("Phlebotomist ID")}>{item.PhlebotomistID}</td>
                                                <td data-title={t("Phlebotomist Name")}>{item.Name}</td>
                                                <td data-title={t("Mobile")}>{item.Mobile}</td>
                                                <td data-title={t("Travel Date")}>{item.TravalDate}</td>
                                                <td data-title={t("Travel Distance (km)")}>{item.TravalDistance}</td>

                                                {/* View Detail button */}
                                                <td className="text-center" data-title={t("View Detail")}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleSearchById(item)}
                                                        aria-label={`${t("View Detail")} ${item.phlebotomistName}`}
                                                    >
                                                        <FaSearch />
                                                    </button>
                                                </td>

                                                {/* View in Map button */}
                                                <td className="text-center" data-title={t("View in Map")}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => handleTravelDataForMap(item)}
                                                        aria-label={`${t("View in Map")} ${item.phlebotomistName}`}
                                                    >
                                                        <FaSearch />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Tables>
                            ) : (
                                <NoRecordFound />
                            )}
                        </>


                    </div>{" "}
                </div>{" "}
            </Accordion>
            {singleDataLoading ? (
                <Loading />
            ) : (
                openViewModal && (
                    <PhleboTravelledDistanceViewModal
                        show={openViewModal}
                        handleClose={() => setOpenViewModal(false)}
                        travelData={travelDetail}
                        data={singleData}
                    />
                )
            )}
            {mapDataLoading ? (
                <Loading />
            ) : (
                openMapModal && (
                    <PhleboMapModal
                        show={openMapModal}
                        handleClose={() => setOpenMapModal(false)}
                        data={travelMapData}
                        mapData={mapData}
                    />
                )
            )}
        </>
    )
}

export default PhleboTravelledDistance;