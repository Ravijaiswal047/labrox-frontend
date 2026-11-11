import React, { useEffect, useState, useMemo } from 'react'
import ReactSelect from '../../components/formComponent/ReactSelect';
import { axiosInstance } from '../../utils/axiosInstance';
import { useTranslation } from 'react-i18next';
import Accordion from '../../components/UI/Accordion';
import MultiSelectComp from '../../components/formComponent/MultiSelectComp';
import DatePicker from '../../components/formComponent/DatePicker';
import AutoComplete from '../../components/formComponent/AutoComplete';
import { GetRateTypeByGlobalCentre } from '../../utils/NetworkApi/commonApi';
import { autocompleteOnBlur, ExportToExcel } from '../../utils/helpers';
import Input from '../../components/formComponent/Input';
import { CustomButton, SearchButton } from '../../components/UI/CustomButton';
import Tables from '../../components/UI/customTable';
import ColorCodingSearch from '../../components/ModalComponent/ColorCodingSearch';
import Loading from '../../components/loader/Loading';
import { NoOfRecord } from '../../utils/Constants';
import moment from 'moment';
import { toast } from 'react-toastify';

const OnlinePaymentSearch = () => {
    const { t } = useTranslation();

    const [centre, setCentre] = useState([]);
    const [searchRateTypes, setSearchRateTypes] = useState([]);

    const [payload, setPayload] = useState({
        LedgertansactionNo: "",
        BusinessUnitID: "",
        CentreID: [],
        RateTypeID: 0,
        RateTypeLabel: "",
        FromDate: (new Date()),
        ToDate: new Date(),
        status: "",
    })

    const [client, setClient] = useState([]);
    const [rateTypeSuggestions, setRateTypeSuggestions] = useState([]);
    const [rateTypeIndex, setRateTypeIndex] = useState(0);
    const [selectRateType, setSelectRateType] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentModeFilter, setPaymentModeFilter] = useState("All");

    const paymentModeOptions = [
        { value: "All", label: "All" },
        { value: "UPI", label: "UPI" },
        { value: "NEFT", label: "NEFT" },
        { value: "CARD", label: "CARD" },
        { value: "Unified Payments", label: "Unified Payments" },
        { value: "Online", label: "Online" },
        { value: "Bharat QR", label: "Bharat QR" },
        { value: "CASH", label: "CASH" },
        { value: "Credit Card", label: "Credit Card" },
        { value: "Paytm", label: "Paytm" },
        { value: "netbanking", label: "Net Banking" },
        { value: "Cheque", label: "Cheque" },
        { value: "Net Banking", label: "Net Banking" },
        { value: "NB", label: "NB" },
        { value: "EMI", label: "EMI" },
    ];

    const handleSearchSelectChange = (name, value) => {
        if (name === "CentreID") {
            setPayload((prev) => ({
                ...prev,
                CentreID: value?.value,
                RateTypeID: 0
            }));
            // if (value?.value) {
            //     fetchRateTypes([value?.value], true);
            // } else {
            //     setSearchRateTypes([]);
            // }
        } else if (name === "RateTypeID") {
            setPayload((prev) => ({
                ...prev,
                [name]: value?.value
            }));
        }
    };

    const handleSelectMultiChange = (name, selectedArray) => {
        setPayload((prev) => ({ ...prev, CentreID: selectedArray || [] }));
    };

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

    const colorCodingData = [
        { color: "#90ee90", id: "1", labelKey: "Success" },
        { color: "#f5c6cb", id: "2", labelKey: "Failed" },
        { color: "#fff3cd", id: "3", labelKey: "Pending" },
    ];

    const getStatusCategory = (status) => {
        const s = (status || "").toUpperCase();
        if (s === "SUCCESS") return "Success";
        if (["AUTHORIZATION_FAILED", "AUTHENTICATION_FAILED", "JUSPAY_DECLINED", "CAPTURE_FAILED", "FAILED", "VOID_FAILED", "CAPTURE_FAILED"].includes(s)) {
            return "Failed";
        }
        if (["NEW", "PENDING_VBV", "PENDING", "VOID_INITIATED", "STARTED", "AUTHORIZING", "CAPTURE_INITIATED"].includes(s)) {
            return "Pending";
        }
        return s; // Return original if no match, though usually it will be one of these
    };

    const statusCounts = useMemo(() => {
        return tableData.reduce((acc, item) => {
            const category = getStatusCategory(item?.status);
            if (category === "Success") acc.success++;
            else if (category === "Failed") acc.failed++;
            else if (category === "Pending") acc.pending++;
            acc.all++;
            return acc;
        }, { success: 0, failed: 0, pending: 0, all: 0 });
    }, [tableData]);

    const filteredData = useMemo(() => {
        let data = tableData;

        if (statusFilter !== "All") {
            data = data.filter(item => getStatusCategory(item?.status) === statusFilter);
        }

        if (paymentModeFilter !== "All") {
            data = data.filter(item => item?.PaymentMode === paymentModeFilter);
        }

        if (!searchText) return data;

        const search = searchText.toLowerCase();

        return data.filter(
            (item) =>
                item?.BusinessUnit?.toLowerCase().includes(search) ||
                item?.RateTypeName?.toLowerCase().includes(search) ||
                item?.RateTypeCode?.toLowerCase().includes(search) ||
                item?.PaymentMode?.toLowerCase().includes(search) ||
                item?.Remarks?.toLowerCase().includes(search) ||
                item?.status?.toLowerCase().includes(search) ||
                item?.transactionid?.toString().toLowerCase().includes(search) ||
                item?.amount?.toString().toLowerCase().includes(search)
        );
    }, [tableData, searchText, statusFilter, paymentModeFilter]);

    const getRowColor = (status) => {
        const category = getStatusCategory(status);
        const found = colorCodingData.find(item => item.labelKey === category);
        return found ? found.color : "transparent";
    }

    const handleRateTypeChange = (e) => {
        const value = e.target.value;

        setPayload((prev) => ({ ...prev, RateTypeLabel: value }));

        if (value.trim() === "") {
            setSelectRateType(false);
            setRateTypeSuggestions([]);
            setPayload((prev) => ({ ...prev, RateTypeID: 0, RateTypeLabel: "" }));
        } else {
            const filtered = client.filter((item) =>
                item.label.toLowerCase().includes(value.toLowerCase())
            );
            setRateTypeSuggestions(filtered);
            setSelectRateType(true);
        }
    };

    const handleSearch = () => {
        setLoading(true);
        setTableData([]);
        axiosInstance.post("PaymentGateway/PaymentStatussearch", {
            RateTypeID: payload.RateTypeID || 0,
            businessUnitIDs: payload.CentreID || [],
            FromDate: (moment(payload.FromDate).format("YYYY-MM-DD")),
            ToDate: (moment(payload.ToDate).format("YYYY-MM-DD")),
            status: payload.status,
        })
        .then((res) => {
            console.log("res", res);
            if (Array.isArray(res.data.message)) {
                setTableData(res.data.message);
            } else {
                setTableData([]);
            }
        })
        .catch((err) => {
            console.log("err", err);
            setTableData([]);
        })
        .finally(() => {
            setLoading(false);
        })
    }

    const handleResend = async (item) => {
        const originalData = [...tableData];
        // Optimistic UI update
        setTableData((prev) =>
            prev.map((row) =>
                row.ID === item.ID ? { ...row, status: "Success" } : row
            )
        );

        try {
            const res = await axiosInstance.post("PaymentGateway/ResendPayment", {
                id: item?.ID,
                orderID: item?.orderId,
            });
            console.log("res", res);
            if (res.data.success) {
                const msg = (typeof res.data.message === 'string') ? res.data.message : "Payment Resent Successfully";
                toast.success(msg);
                
                // If API returns an updated status, use it
                let newStatus = "Success";
                if (res.data.status && typeof res.data.status === 'string') {
                    newStatus = res.data.status;
                } else if (res.data.message?.status && typeof res.data.message.status === 'string') {
                    newStatus = res.data.message.status;
                }

                setTableData((prev) =>
                    prev.map((row) =>
                        row.ID === item.ID ? { ...row, status: newStatus } : row
                    )
                );
            } else {
                toast.error((typeof res.data.message === 'string') ? res.data.message : "Failed to resend payment");
                setTableData(originalData); // Revert on failure
            }
        } catch (error) {
            console.log("error", error);
            toast.error(error?.response?.data?.message || "Something went wrong");
            setTableData(originalData); // Revert on error
        }
    };

    const handleRateTypeKeyDown = (e) => {
        if (rateTypeSuggestions.length === 0) return;

        if (e.which === 38) { // Up
            setRateTypeIndex((prev) =>
                prev > 0 ? prev - 1 : rateTypeSuggestions.length - 1
            );
        } else if (e.which === 40) { // Down
            setRateTypeIndex((prev) =>
                prev === rateTypeSuggestions.length - 1 ? 0 : prev + 1
            );
        } else if (e.which === 13) { // Enter
            handleRateTypeSelect(rateTypeSuggestions[rateTypeIndex]);
            setRateTypeIndex(0);
        }
    };

    const handleRateTypeSelect = (data) => {
        setPayload((prev) => ({
            ...prev,
            RateTypeLabel: data?.label,
            RateTypeID: data?.value,
        }));
        setSelectRateType(false);
        setRateTypeSuggestions([]);
    };

    useEffect(() => {
        GetRateTypeByGlobalCentre(setClient);
    }, []);
    const dateSelect = (value, name) => {
        setPayload({
            ...payload,
            [name]: value,
        });
    };

    useEffect(() => {
        getAccessCentres();
    }, []);
    return (
        <>
            <Accordion title={"Online Payment Search"} defaultValue={true}>
                <div className="row px-2 mt-2 mb-1">
                    <div className="col-sm-2">
                        <MultiSelectComp
                            options={centre}
                            name="CentreID"
                            id="CentreID"
                            label={t("BusinessUnit")}
                            value={payload?.CentreID}
                            onChange={handleSelectMultiChange}
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
                    <div className="col-sm-2">

                        <Input
                            type="text"
                            name="RateTypeID"
                            lable="Rate Type"
                            value={payload.RateTypeLabel || ""}
                            placeholder=" "
                            onChange={handleRateTypeChange}
                            onKeyDown={handleRateTypeKeyDown}
                            onBlur={(e) => {
                                const snapshot = [...rateTypeSuggestions];
                                autocompleteOnBlur(setRateTypeSuggestions);

                                setTimeout(() => {
                                    setPayload((prev) => {
                                        const typed = (e.target.value || "").trim();
                                        if (!typed) {
                                            return { ...prev, RateTypeID: 0, RateTypeLabel: "" };
                                        }
                                        // If a rate type was already selected and label matches typed text, keep it
                                        if (prev.RateTypeID && prev.RateTypeLabel &&
                                            prev.RateTypeLabel.toLowerCase() === typed.toLowerCase()) {
                                            return prev;
                                        }
                                        // Otherwise try to match from snapshot
                                        const match = snapshot.find(
                                            (ele) => ele.label.toLowerCase() === typed.toLowerCase()
                                        );
                                        if (match) {
                                            return {
                                                ...prev,
                                                RateTypeLabel: match.label,
                                                RateTypeID: Number(match.value),
                                            };
                                        }
                                        // Also try matching from the full client list as fallback
                                        const clientMatch = client.find(
                                            (ele) => ele.label.toLowerCase() === typed.toLowerCase()
                                        );
                                        if (clientMatch) {
                                            return {
                                                ...prev,
                                                RateTypeLabel: clientMatch.label,
                                                RateTypeID: Number(clientMatch.value),
                                            };
                                        }
                                        return { ...prev, RateTypeID: 0 };
                                    });
                                }, 200);
                            }}
                        />

                        {selectRateType && rateTypeSuggestions.length > 0 && (
                            <AutoComplete
                                selects={selectRateType}
                                test={rateTypeSuggestions.map((item) => ({
                                    TestName: item.label,
                                }))}
                                handleListSearch={(selected) =>
                                    handleRateTypeSelect(
                                        rateTypeSuggestions.find(
                                            (item) => item.label === selected.TestName
                                        )
                                    )
                                }
                                indexMatch={rateTypeIndex}
                            />
                        )}
                    </div>
                    <SearchButton
                        text={t("Search")}
                     onClick={handleSearch}
                    // disabled={loading}
                     loading={loading}
                    />
                    <CustomButton
                        text={t("Export")}
                        className='ml-4'
                        icon={"excel"}
                        onClick={()=> ExportToExcel(tableData, "OnlinePaymentSearch.xlsx")}
                        
                    />
                </div>
            </Accordion>
            <Accordion
                title={t("Search Data")}
                defaultValue={true}
                notOpen={true}
                linkTo="#"
                linkTitle={
                    tableData.length > 0 && (
                    <div className=" d-flex" style={{ gap: "10px", alignItems: "center" }}>
                        <div className="" style={{width: "150px"}}>
                                <ReactSelect
                                    name="PaymentMode"
                                    placeholderName={t("Payment Mode")}
                                    dynamicOptions={paymentModeOptions}
                                    value={paymentModeFilter}
                                    removeIsClearable={true}
                                    onChange={(name, value) => setPaymentModeFilter(value?.value || "All")}
                                />
                            </div>
                        <div
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation();
                                setStatusFilter("All");
                            }}
                            className={`px-2 py-1 rounded ${statusFilter === "All" ? '' : ''}`}
                            style={{ cursor: "pointer", fontSize: "12px", fontWeight:800, border: statusFilter === "All" ? "" : "" }}
                        >
                            All ({statusCounts.all})
                        </div>
                        {colorCodingData.map(({ color, labelKey, id }) => (
                            <ColorCodingSearch
                                key={id}
                                color={color}
                                label={`${t(labelKey)} (${statusCounts[labelKey.toLowerCase()]})`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation();
                                    setStatusFilter(labelKey);
                                }}
                                cursor="pointer"
                            />
                        ))}
                        <div>
                            <Input
                                type="text"
                                placeholder="Search...."
                                value={searchText}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    )
                }
            >
                {loading ? (
                    <Loading />
                ) : (
                    tableData.length > 0 && (
                        <div>
                            <Tables>
                                <thead>
                                    <tr>
                                        <th style={{ width: "5%" }}>S.No</th>
                                        <th>Business Unit</th>
                                        <th>Rate Type Name</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Payment Mode</th>
                                        <th>Order ID</th>
                                        <th>Transaction ID</th>
                                        <th>RrnNo</th>
                                        <th>Remarks</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={index} style={{ backgroundColor: getRowColor(item?.status) }}>
                                            <td>{index + 1}</td>
                                            <td style={{ width: "250px", wordWrap: "break-word", whiteSpace: "normal" }}>{item?.BusinessUnit}</td>
                                            <td style={{ width: "300px", wordWrap: "break-word", whiteSpace: "normal" }}>{`${item?.RateTypeName} - ${item?.RateTypeCode}    `}</td>
                                            <td style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}>{item?.amount}</td>
                                            <td style={{ width: "150px", wordWrap: "break-word", whiteSpace: "normal" }}>{item?.dtEntry}</td>
                                            <td style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}>{item?.PaymentMode}</td>
                                            <td style={{ width: "150px", wordWrap: "break-word", whiteSpace: "normal" }}>{item?.transactionid}</td>
                                            <td style={{ width: "170px", wordWrap: "break-word", whiteSpace: "normal" }}>{item?.tnx_reference}</td>
                                            <td style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}>{item?.RrnNo}</td>
                                            <td style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}>{item?.Remarks}</td>
                                            
                                            <td style={{ width: "150px", wordWrap: "break-word", whiteSpace: "normal" }}>
                                                {item?.status}
                                                {getStatusCategory(item?.status) !== "Success" && (
                                                    <CustomButton
                                                        text="Resend"
                                                        className="btn-sm ml-2"
                                                        onClick={() => handleResend(item)}
                                                        style={{ padding: "2px 3px", fontSize: "10px", height: '15px' }}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    )
                )}

            </Accordion>
        </>
    );
};

export default OnlinePaymentSearch;