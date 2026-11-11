import { useTranslation } from "react-i18next";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { useEffect, useState } from "react";
import { autocompleteOnBlur } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

const RateTypeMapping = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [rateType, setRateType] = useState([]);
    const [RateTypeSuggestion, setRateTypeSuggestion] = useState([]);
    const [selectRateType, setSelectRateType] = useState(false);
    const [indexMatch, setIndexMatch] = useState(0);
    const [rateTypeData, setRateTypeData] = useState([]);

    const [payload, setPayload] = useState({
        RateType: "",
        RateTypeID: 0,
    })

    const { state } = location;

    const getRateTypeWorkOrder = async () => {
        await axiosInstance
            .post(apiUrls.BindRateTypeDropdown, {
                centreID: 0,
                rateTypeID: 0,
                AllowEstimate: 0,   
                AllowHomeCollection: 0,
                AllowMembershipCard: 0,
            })
            .then((res) => {
                const data = res?.data?.message;
                const val = data.map((ele) => {
                    return {
                        value: ele?.RateTypeID,
                        label: ele?.RateTypeName,
                    };
                });
                setRateType([...val]);

            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => { });
    };

    const handleAddRateType = async () => {
        await axiosInstance
            .post(apiUrls.InvestigationRateTypeMapper, {
                centreID: payload?.RateTypeID || 0,
                investigationID: state?.InvestigationID || 0,
                actionType: 'insert',
            })
            .then((res) => {
                console.log("res", res);
                if (res?.data?.success) {
                    getRateTypeData();
                    setPayload((prev) => ({ ...prev, RateType: "", RateTypeID: 0 }));
                    toast.success(res?.data?.message);
                }
                //   const data = res?.data?.message || [];
                //   const val = data.map((ele) => ({
                //     value: ele?.RateTypeID,
                //     label: ele?.RateTypeName,
                //   }));
                //   setRateType(val);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleDeleteRateType = async (ele) => {
        await axiosInstance
            .post(apiUrls.InvestigationRateTypeMapper, {
                centreID: ele?.CentreID || 0,
                investigationID: ele?.InvestigationID || state?.InvestigationID || 0,
                actionType: 'remove',
            })
            .then((res) => {
                console.log("res delete", res);
                if (res?.data?.success) {
                    getRateTypeData();
                    setPayload((prev) => ({ ...prev, RateType: "", RateTypeID: 0 }));
                    toast.success(res?.data?.message);
                }
                //   const data = res?.data?.message || [];
                //   const val = data.map((ele) => ({
                //     value: ele?.RateTypeID,
                //     label: ele?.RateTypeName,
                //   }));
                //   setRateType(val);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const getRateTypeData = async () => {
        await axiosInstance
            .post(apiUrls.GetInvestigationRateTypeMapper, {
                investigationID: state?.InvestigationID || 0,
            })
            .then((res) => {
                console.log("res get", res);
                if (res?.data?.success) {
                    setRateTypeData(res?.data?.message || []);
                }
                else{
                    setRateTypeData([]);
                }
                
                //   const data = res?.data?.message || [];
                //   const val = data.map((ele) => ({
                //     value: ele?.RateTypeID,
                //     label: ele?.RateTypeName,
                //   }));
                //   setRateType(val);
            })
            .catch((err) => {
                console.log("err",err);
                setRateTypeData([]);
            });
    };

    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;


        if (name === "RateType") {
            setPayload({ ...payload, [name]: value });

            if (value === "") {
                setSelectRateType(false);
                setRateTypeSuggestion([]);
                setIndexMatch(0);
                return;
            }

            const filtered = rateType?.filter((ele) =>
                ele?.label?.toLowerCase().includes(value.toLowerCase())
            );

            setRateTypeSuggestion(filtered);
            setSelectRateType(true);
            setIndexMatch(0);
        }

        else {
            setPayload({
                ...payload,
                [name]: type === "checkbox" ? checked : value,
            });
        }
    };

    const handleIndexNew = (e, name) => {
        switch (name) {
            // ✅ RATE TYPE
            case "RateType":
                switch (e.which) {
                    case 38:
                        if (RateTypeSuggestion.length > 0) {
                            setIndexMatch((prev) =>
                                prev > 0 ? prev - 1 : RateTypeSuggestion.length - 1
                            );
                        }
                        break;

                    case 40:
                        if (RateTypeSuggestion.length > 0) {
                            setIndexMatch((prev) =>
                                prev < RateTypeSuggestion.length - 1 ? prev + 1 : 0
                            );
                        }
                        break;

                    case 13:
                        if (RateTypeSuggestion[indexMatch]) {
                            handleListSearchNew(RateTypeSuggestion[indexMatch], name);
                        }
                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    };

    const handleListSearchNew = (data, name) => {
        switch (name) {
            case "RateType":
                setPayload({
                    ...payload,
                    RateType: data?.label,
                    RateTypeID: data?.value,
                });
                setSelectRateType(false);
                setRateTypeSuggestion([]);
                setIndexMatch(0);
                break;

            default:
                break;
        }
    };

    useEffect(() => {
        getRateTypeWorkOrder();

    }, []);

    useEffect(() => {
        if (payload?.RateType === "") {
            setPayload((prev) => ({ ...prev, RateTypeID: 0 }));
        }
    }, [payload?.RateType])

    useEffect(() => {
        if (state?.InvestigationID) {
            getRateTypeData();
        }
    }, [state?.InvestigationID]);

    console.log("rateType", rateType);
    console.log("payload", payload);
    console.log("state", state);
    console.log("rateTypedata", rateTypeData);
    return (
        <div>
            <Accordion
                name={t("Rate Type Mapping")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 pl-2 pr-2 mb-4 align-items-center">
                    {/* Test Name */}
                    <div className="col-sm-2">
                        <Input
                            placeholder=" "
                            lable="TestName"
                            id="TestName"
                            disabled={true}
                            value={state?.TestName || state?.data || ""}
                            name="TestName"
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            placeholder=" "
                            lable="TestId"
                            id="TestId"
                            disabled={true}
                            value={state?.InvestigationID || ""}
                            name="TestName"
                        />
                    </div>
                    {/* InvestigationID */}

                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="RateType"
                            lable="Rate Type"
                            id="RateType"
                            value={payload?.RateType || ""}
                            placeholder=" "
                            onChange={handleChange}
                            onKeyDown={(e) => handleIndexNew(e, "RateType")}
                            onBlur={() => {
                                autocompleteOnBlur(setRateTypeSuggestion);
                                // setSelectRateType(false);
                            }}
                        />

                        {selectRateType &&
                            RateTypeSuggestion.length > 0 &&
                            payload?.RateType && (
                                <ul className="suggestion-data">
                                    {RateTypeSuggestion.map((data, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleListSearchNew(data, "RateType")}
                                            className={`${index === indexMatch && "matchIndex"}`}
                                        >
                                            {data?.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                    </div>


                    {/* Create New Button */}
                    <div className="col-sm-1">
                        <button className="btn btn-block btn-primary" onClick={handleAddRateType}>
                            {t("Add")}
                        </button>
                    </div>

                    {/* Back Button */}
                    <div className="col-sm-1">
                        {state?.flag ? (
                            <Link
                                to="/Investigations"
                                state={{
                                    other: {
                                        button: "Update",
                                        pageName: "Edit",
                                        showButton: true,
                                    },
                                    url1:`Investigations/EditInvestigation?id=${state?.InvestigationID}&DataType=${state?.dataType}`,
                                    url: "Investigations/UpdateInvestigation",
                                }}
                            >   
                                
                                <span className="btn btn-block btn-primary btn-sm">
                                    {t("Back")}
                                </span>
                            </Link>
                        ) : (
                            <button
                                className="btn btn-block btn-primary btn-sm"
                                onClick={() => navigate(-1)}
                            >
                                {t("Back")}
                            </button>
                        )}
                    </div>
                </div>

            </Accordion>

            {/* Placeholder for future Rate Type Mapping content */}
            <Accordion title={t("Rate Type Mapping Details")} defaultValue={true}>
                <div className="">
                    {rateTypeData?.length > 0 ? (
  <Tables>
    <thead className="cf">
      <tr>
        <th>{t("S.No")}</th>
        <th>{t("Rate Type Id")}</th>
        <th>{t("Rate Type Code")}</th>
        <th>{t("Rate Type Name")}</th>
        <th>{t("Created By")}</th>
        <th>{t("Created Date")}</th>
        <th>{t("Remove")}</th>
      </tr>
    </thead>

    <tbody>
      {rateTypeData?.map((ele, index) => (
        <tr key={index}>
          <td data-title={t("S.No")}>{index + 1}</td>
          <td data-title={t("Rate Type Id")}>{ele?.CentreID}</td>
          <td data-title={t("Rate Type Code")}>{ele?.CentreCode}</td>
          <td data-title={t("Rate Type Name")}>{ele?.Centre}</td>
          <td data-title={t("Created By")}>{ele?.CreatedBy}</td>
          <td data-title={t("Created Date")}>{ele?.CreatedOn}</td>
          <td data-title={t("Remove")}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteRateType(ele)}
            >
              X
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </Tables>
) : (
  <NoRecordFound />
)}
                </div>
            </Accordion>
        </div>
    );
};

export default RateTypeMapping;
