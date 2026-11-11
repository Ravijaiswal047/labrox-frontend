import React, { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import { Button, Modal } from "react-bootstrap";
import { CiCirclePlus } from "react-icons/ci";
import "./TargetSheet.css";
import FinancialYearPopUpModal from "./FinancialYearPopUpModal";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setModalOpen } from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiEndpoints";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../utils/utils";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import CustomTwoRowTable from "../../components/Table/CustomTwoRowTable";

const CampTab = () => {
    const [t] = useTranslation();
    const dispatch = useDispatch();
    const { modalOpen } = useSelector((state) => state?.ticketing);
    const [payload, setPayload] = useState({
        centre: [],
        fy: "",
    });

    console.log(payload);

    const [dropdownlist, setDropdownlist] = useState({
        centreList: [],
        FyList: [],
    });
    
    const [campSaleData, setCampSaleData] = useState([]);
    console.log("campSaleData",campSaleData);
    
    const months = [
        { key: "apr", label: "April" },
        { key: "may", label: "May" },
        { key: "jun", label: "Jun" },
        { key: "jul", label: "July" },
        { key: "aug", label: "Aug" },
        { key: "sep", label: "Sept" },
        { key: "oct", label: "Oct" },
        { key: "nov", label: "Nov" },
        { key: "dec", label: "Dec" },
        { key: "jan", label: "Jan" },
        { key: "feb", label: "Feb" },
        { key: "mar", label: "March" },
    ];

    const doctorShareData = campSaleData?.map((row, index) => ({
        ...row,
        SrNo: index + 1,
        centre: row.centreID,
    }));
    
    const handleSelectMultiChange = (select, name) => {
        const val = select?.map(ele => ele.centreid);
        setPayload((prev) => ({ ...prev, [name]: val }));
    };

    const handleReactChange = (name, e) => {
        setPayload((prev) => ({ ...prev, [name]: e?.value }));
    };

    const handleOpenFinancialYModal = (visible) => {
        dispatch(setModalOpen(visible));
    };

    const getCampSale = async () => {

        const CampSalePayload = {
            "centreIDs": payload?.centre,
            "financialYear": (payload?.fy)?.toString() || ""
        }
        
        dispatch(setLoading(true));
        await axiosInstance
            .post(apiUrls.GetCentreCampTarget, CampSalePayload)
            .then((res) => {
                // console.log('res', res.data);
                setCampSaleData(res.data.data)
            })
            .catch((err) => {
                console.log(err);
                notify(err?.respose?.data?.message, "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
        
    }

    const saveCampSale = async () => {
    }

    const GetFinancialYear = (name) => {
        const generateFYFallback = () => {
            const today = new Date();
            const currentYear = today.getFullYear();
            const month = today.getMonth();
            const fyStart = month >= 3 ? currentYear : currentYear - 1;
            return [
                {
                    label: `${fyStart - 1}-${fyStart}`,
                    value: `${fyStart - 1}-${fyStart}`,
                },
                {
                    label: `${fyStart}-${fyStart + 1}`,
                    value: `${fyStart}-${fyStart + 1}`,
                },
                {
                    label: `${fyStart + 1}-${fyStart + 2}`,
                    value: `${fyStart + 1}-${fyStart + 2}`,
                },
            ];
        };

        axiosInstance
            .post("Global/GetGlobalData", {
                Type: name,
            })
            .then((res) => {
                let data = res.data.message;
                if (Array.isArray(data) && data.length > 0) {
                    let SampleContainer = data.map((ele) => {
                        return {
                            value: ele.FieldDisplay,
                            label: ele.FieldDisplay,
                        };
                    });
                    setDropdownlist((prev) => ({ ...prev, FyList: SampleContainer }));
                } else {
                    setDropdownlist((prev) => ({
                        ...prev,
                        FyList: generateFYFallback(),
                    }));
                }
            })
            .catch((err) => {
                console.log(err);
                setDropdownlist((prev) => ({
                    ...prev,
                    FyList: generateFYFallback(),
                }));
            });
    };

    const getAllCentre = async () => {
        dispatch(setLoading(true));
        await axiosInstance
          .get(apiUrls.BindCentre)
          .then((res) => {
    
            const resList = res?.data?.message?.map((item) => ({
              ...item,
              label: item?.centre,
              value: item?.centreid,
            }));
            setDropdownlist((prev) => ({ ...prev, centreList: resList }));
            setPayload((prev) => ({ ...prev, centre: resList?.[0]?.value }));
          })
          .catch((err) => {
            notify(err?.data?.message, "error");
          });
        dispatch(setLoading(false));
      };
    
      useEffect(() => {
        getAllCentre();
        GetFinancialYear("FinancialYear");
    }, []);
    

    return (
        <div className="machineTab">
            <Heading title={"Camp"} />
            <div className="card px-2 py-2 h-100">
                <div className="row mb-2 mt-1">
                    <div className="col-sm-3 col-md-2">
                        <SelectBoxWithCheckbox
                            name="centre"
                            className="required-fields"
                            placeholder={t("Centre")}
                            lable={t("Centre")}
                            id="centre"
                            onChange={handleSelectMultiChange}
                            options={dropdownlist?.centreList || []}
                            value={payload?.centre?.value}
                        />
                    </div>
                    <div className="col-sm-3 col-md-2">
                        <ReactSelect
                            dynamicOptions={dropdownlist?.FyList}
                            name="fy"
                            isShowBorder={true}
                            lable={t("Finacial Year")}
                            id="fy"
                            removeIsClearable={false}
                            placeholderName={t("Finacial Year")}
                            value={payload?.fy}
                            onChange={handleReactChange}
                            className="required-fields"
                        />
                    </div>
                    <Button className="rounded px-4 mx-4" onClick={getCampSale}>Search</Button>
                    <Button className="rounded px-4" onClick={saveCampSale}>Save</Button>
                    <div className="flex-grow-1 px-2">
                        <Button
                            onClick={() => handleOpenFinancialYModal(true)}
                            style={{ float: "right" }}
                            className="inertBtn"
                        >
                            <CiCirclePlus className="inserFyIcon" color="#fff" />
                        </Button>
                    </div>
                </div>
                {/* <CustomTwoRowTable editRows={editRows}
                    onEditRowsChange={setEditRows} months={months} data={doctorShareData} onDataChange={setHomeCollectionData}
                    calculateRowTotal={(row) => calculateRowTotal(row, months)}
                    columnTotals={columnTotals}
                    grandTotal={grandTotal}
                /> */}
            </div>
            <Modal
                Header={"Add Financial Year"}
                setVisible={() => handleOpenFinancialYModal(false)}
                visible={modalOpen}
                children={<FinancialYearPopUpModal />}
                modalWidth={"40%"}
            />
        </div>
    )
}
export default CampTab;