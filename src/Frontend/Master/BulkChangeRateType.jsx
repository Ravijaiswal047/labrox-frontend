import { use, useEffect, useMemo, useState } from "react";
import moment from "moment";
import Accordion from "../../components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import Input from "../../components/formComponent/Input";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import Pagination from "../../Pagination/Pagination";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";

const BulkChangeRateType = () => {
    const { t } = useTranslation();
    const [searchRateTypes, setSearchRateTypes] = useState([]);
    const [saveRateTypes, setSaveRateTypes] = useState([]);
    const [data, setData] = useState([]);
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, SetShowModal] = useState(false);
    const [modalData, setModalData] = useState({});
    const isMobile = window.innerWidth <= 768;

    const [totalPatient, setTotalPatient] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0)
    const [centre, setCentre] = useState([]);
    const [payload, setPayload] = useState({
        LedgertansactionNo:"",
        BusinessUnitID: "",
        CentreID: 0,
        RateTypeID: 0,
        FromDate: new Date(),
        ToDate: new Date(),
    })
    
    const [SavePayload, SetSavePayload] = useState({
        centreID: 0,
        rateTypeID: 0
    });

    const colorCodingData = [
        { color: "#FFFFFF", id: "1", labelKey: "Active" },
        { color: "#f5c6cb", id: "2", labelKey: "In Active" },
    ];


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
            let allValues = CentreDataValue.map((ele) => ele.value);
            setCentre(CentreDataValue);
        } catch (error) {
            console.log("Error while fetching centres");
        }
    };

    const fetchRateTypes = async (centreId, isSearch = true) => {
        try {
            const res = await axiosInstance.post("Centre/GetRateType", {
                CentreId: centreId,
            });
            const list = res?.data?.message.map((item) => ({
                label: item?.RateTypeName,
                value: item?.RateTypeID,
            }));
            if (isSearch) {
                setSearchRateTypes(list);
            } else {
                setSaveRateTypes(list);
            }
        } catch (err) {
            console.log(err);
        }
    };



    useEffect(() => {
        getAccessCentres();
        // fetchRateTypes([])
    }, []);
    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        // if (name === "BusinessUnitID") {
        //   getAccessCentres(value, "");
        // }
        // if (name === "invoiceBillingCycle") {
        //   getAccessCentres(payload.BusinessUnitID, value);
        // }

        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchSelectChange = (name, value) => {
        if (name === "CentreID") {
            setPayload((prev) => ({
                ...prev,
                CentreID: value?.value,
                RateTypeID: 0
            }));
            if (value?.value) {
                fetchRateTypes([value?.value], true);
            } else {
                setSearchRateTypes([]);
            }
        } else if (name === "RateTypeID") {
            setPayload((prev) => ({
                ...prev,
                [name]: value?.value
            }));
        }
    };

    const handleSaveSelectChange = (name, value) => {
        if (name === "centreID") {
            SetSavePayload((prev) => ({
                ...prev,
                centreID: value?.value,
                rateTypeID: ""
            }));
            if (value?.value) {
                fetchRateTypes([value?.value], false);
            } else {
                setSaveRateTypes([]);
            }
        } else if (name === "rateTypeID") {
            SetSavePayload((prev) => ({
                ...prev,
                [name]: value?.value
            }));
        }
    };

    const dateSelect = (value, name) => {
        setPayload({
            ...payload,
            [name]: value,
        });
    };
    const SaveDateSelect = (value, name) => {
        SetSavePayload({
            ...SavePayload,
            [name]: value,
        });
    };

    const getBulkRateType = async () => {
        try {
            const res = await axiosInstance
                .post("RateType/BulkChangeRateType", {
                    LedgertansactionNo: String(payload.LedgertansactionNo),
                    centreID: String(payload.CentreID) || 0,
                    rateTypeID: String(payload.RateTypeID) || 0,
                    fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                    toDate: moment(payload.ToDate).format("YYYY-MM-DD"),
                })
            if (res?.data?.success && Array.isArray(res.data.data)) {
                const fetchedData = res.data.data;
                setData(fetchedData);
                setTotalCount(fetchedData?.length);
                setTotalPatient(fetchedData?.length);
                setCurrentPage(1);

                const totalAmt = fetchedData.reduce(
                    (sum, item) => sum + Number(item.NetAmt || 0),
                    0
                );
                setTotalAmount(totalAmt);
            } else {
                toast.error(res?.data?.message || t("Error while fetching data"));
                setData([]);
                setTotalCount(0);
                setTotalPatient(0);
                setTotalAmount(0);
            }
        } catch (error) {
            console.log("Error while fetching Bulk Rate Type", error);
            setData([]);
            setTotalCount(0);
            setTotalPatient(0);
            setTotalAmount(0);
        }
    };

    const saveBulkRateType = async () => {
        if (!SavePayload.centreID || !SavePayload.rateTypeID) {
            toast.error(t("Please select both Business Unit and Rate Type"));
            return;
        }

        if (data.length === 0) {
            toast.error(t("No data to save"));
            return;
        }

        try {

           

            const Payload = {
                LedgertansactionNo: String(payload.LedgertansactionNo),
                centreID: payload.CentreID,
                rateTypeID: payload.RateTypeID,
                newCentreId: SavePayload.centreID,
                newRateTypeId: SavePayload.rateTypeID,
                fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                toDate: moment(payload.ToDate).format("YYYY-MM-DD"),
                // newReferRateId: 0
            };

            const res = await axiosInstance.post("RateType/BulkSaveRateType", Payload);

            if (res?.data?.success) {
                toast.success(t("Rate Type changed successfully"));
                SetSavePayload({
                    centreID: "",
                    rateTypeID: "",
                });
                // Refresh the data
                getBulkRateType();
            } else {
                toast.error(res?.data?.message || t("Error while saving"));
            }
        } catch (error) {
            console.log("Error while saving Bulk Rate Type", error);
            toast.error(t("Error while saving Bulk Rate Type"));
        }
    };


    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        return data.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, pageSize, data]);
    const theme = useLocalStorage("theme", "get");

    console.log("Bulk Rate Type Data", data);
    return (
        <>
            <Accordion
                title="Bulk Change Rate Type"
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 mt-2 mb-1">

                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[
                                { label: "All BusinessUnit", value: "" },
                                ...centre,
                            ]}
                            name="CentreID"
                            lable={t("BusinessUnit")}
                            id="CentreID"
                            removeIsClearable={true}
                            placeholderName={t("BusinessUnit")}
                            value={payload?.CentreID}
                            onChange={handleSearchSelectChange}
                        />
                    </div>

                    <div className="col-md-2">
                        <ReactSelect
                            dynamicOptions={[
                                { label: "All RateType", value: "" },
                                ...searchRateTypes,
                            ]}
                            name="RateTypeID"
                            lable={t("RateType")}
                            id="RateType"
                            removeIsClearable={true}
                            placeholderName={t("RateType")}
                            value={payload?.RateTypeID}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-md-2">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            placeholder={""}
                            id="FromDate"
                            lable="FromDate"
                        // maxDate={new Date(payload?.ToDate)}
                        />
                    </div>
                    <div className="col-md-2">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable="ToDate"
                            maxDate={new Date()}
                        // minDate={new Date(formData?.FromDate)}
                        />
                    </div>
                    <CustomButton
                        label="Search"
                        text={"Search"}
                        icon={"search"}
                        onClick={getBulkRateType}
                    />
                </div>
            </Accordion>
            <Accordion
                title={t("Search Data")}
                defaultValue={true}
                notOpen={true}
                linkTo="#"
                linkTitle={
                    <div className="link-title-container" id="pr_id_11">
                        <div className="link-title-item">
                            {t(`Total Patient: ${totalPatient}`)}
                        </div>
                        <div className="link-title-item">
                            {t(`Total Amount: ${totalAmount.toLocaleString("en-IN")}`)}
                        </div>
                    </div>
                }
            >
                <div className=" d-flex" style={{ gap: "10px" }}>
                    {currentTableData.length > 0 ? (
                        <>
                            {/* <div className="mb-2 text-muted">
                          <small>
                            Showing {filteredTableData.length} of {tableData.length} records
                            {searchText && ` (filtered by "${searchText}")`}
                          </small>
                        </div> */}
                            <Tables style={{ width: "70%", maxHeight: "400px", minHeight: "300px", overflowY: "scroll" }}>
                                <thead >
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Visit No")}</th>
                                        <th>{t("RegDate")}</th>
                                        <th>{t("Patient Name")}</th>
                                        <th>{t("Age/Gender")}</th>
                                        <th>{t("LabNo")}</th>
                                        <th>{t("GrossAmt")}</th>
                                        <th>{t("DiscAmt")}</th>
                                        <th>{t("NetAmt")}</th>
                                        <th>{t("Item")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTableData?.map((data, index) => (
                                        <tr
                                            key={index}
                                        // style={{
                                        //     backgroundColor:
                                        //         data?.isActive === 1 ? "#FFFFFF" : "#f5c6cb",
                                        // }}
                                        >
                                            <td data-title={t("S.No")}>{(currentPage - 1) * pageSize + index + 1}&nbsp;</td>
                                            <td data-title={t("Visit No")}>{data?.BarcodeNo}&nbsp;</td>
                                            <td data-title={t("RegDate")}>{data?.RegDate}&nbsp;</td>
                                            <td data-title={t("Patient Name")}>
                                                {data?.PName}&nbsp;
                                            </td>
                                            <td data-title={t("Age/Gender")}>{data?.AgeGender}&nbsp;</td>
                                            <td data-title={t("LabNo")}>{data?.LabNo}&nbsp;</td>
                                            <td data-title={t("GrossAmt")}>{Number(data?.GrossAmt) === 0 ? "-" : data?.GrossAmt}&nbsp;</td>
                                            <td data-title={t("DiscAmt")}>{Number(data?.DiscAmt) === 0 ? "-" : data?.DiscAmt}&nbsp;</td>
                                            <td data-title={t("NetAmt")}>{Number(data?.NetAmt) === 0 ? "-" : data?.NetAmt}&nbsp;</td>
                                            {/* <td data-title={t("Item")}>&nbsp;</td> */}
                                            <td data-title={t("Item")} className="text-center">
                                                <i
                                                    className="fa fa-eye"
                                                    style={{ color: "#100d47", cursor: "pointer" }}
                                                    onClick={() => {
                                                        SetShowModal(true);
                                                        setModalData(data);
                                                    }}
                                                ></i>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>

                        </>
                    ) : (
                        <NoRecordFound />
                    )}
                    <div style={{
                        width: "30%"
                    }}>
                        {showModal && (
                            <div className="col-md-12">
                                {modalData?.Item ? (
                                    (() => {
                                        try {
                                            const items = JSON.parse(modalData.Item);

                                            return (
                                                <div>
                                                    <Tables className="" style={{ maxHeight: "400px", overflowY: "scroll" }}>
                                                        <thead>
                                                            <tr>
                                                                <th>S.No</th>
                                                                <th>Item Name</th>
                                                                <th>Rate</th>
                                                                <th>Amount</th>
                                                                <th>Discount</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {Array.isArray(items) &&
                                                                items.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{idx + 1}</td>
                                                                        <td>{item.ItemName}</td>
                                                                        <td>{Number(item.Rate) === 0 ? "-" : item.Rate.toFixed(2)}</td>
                                                                        <td>{Number(item.Amount) === 0 ? "-" : item.Amount.toFixed(2)}</td>
                                                                        <td>{Number(item.Discount) === 0 ? "-" : item.Discount.toFixed(2)}</td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </Tables>
                                                </div>
                                            );
                                        } catch (error) {
                                            return <div>Error parsing item data</div>;
                                        }
                                    })()
                                ) : (
                                    <div>No item data available</div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </Accordion>
            {currentTableData.length > 0 && (
                <div className="row px-2 mt-2 mb-1">

                    <div className="col-sm-2 mt-3">
                        <ReactSelect
                            dynamicOptions={[
                                { label: "All BusinessUnit", value: "" },
                                ...centre,
                            ]}
                            name="centreID"
                            label={t("BusinessUnit")}
                            id="centreID"
                            removeIsClearable={true}
                            placeholderName={t("BusinessUnit")}
                            value={SavePayload?.centreID}
                            onChange={handleSaveSelectChange}
                        />
                    </div>

                    <div className="col-md-2 mt-3">
                        <ReactSelect
                            dynamicOptions={[
                                { label: "All RateType", value: "" },
                                ...saveRateTypes,
                            ]}
                            name="rateTypeID"
                            label={t("RateType")}
                            id="rateTypeID"
                            removeIsClearable={true}
                            placeholderName={t("RateType")}
                            value={SavePayload?.rateTypeID}
                            onChange={handleSaveSelectChange}
                        />
                    </div>
                    <div className="col-sm-1 mt-3">
                        <CustomButton
                            label="Save"
                            text={"Save"}
                            icon={"Save"}
                            onClick={saveBulkRateType}
                        />
                    </div>
                    
                    <div className="col-sm-1 mt-3"> </div>
                     <div className="col-sm-1"></div> 
                    {data.length > 50 && (
                        <div className="col-sm-2 mt-3">
                            <ReactSelect
                                value={pageSize}
                                dynamicOptions={[
                                    { label: '25', value: 25 },
                                    { label: '50', value: 50 },
                                    { label: '100', value: 100 },
                                    { label: '150', value: 150 },
                                ]}
                                name={'pageSize'}
                                label={t("pageSize")}
                                removeIsClearable={true}
                                onChange={(name, value) => {
                                    setPageSize(value?.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    )}
                    {data.length > 0 && (
                        <div className="col-sm-3">
                            <Pagination
                                className="pagination-bar"
                                currentPage={currentPage}
                                totalCount={totalCount}
                                pageSize={pageSize}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

        </>
    )
}
export default BulkChangeRateType;