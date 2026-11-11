import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { PreventSpecialCharacter } from "../../utils/helpers";
import ViewTest from "./ViewTest";
import ViewCoupon from "./ViewCoupon";
import ViewCentre from "./ViewCentre";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import CouponMasterEdit from "./CouponMasterEdit";
import CouponMasterReject from "./CouponMasterReject";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import "./CouponMasterApproval.css";

const CouponMasterApproval = () => {
  const { t } = useTranslation();

  const Accessright = useLocalStorage("accessRight", 'get')
  const accessRightArray = Accessright.split(",");

  const StatusType = [
    {
      label: "Made",
      value: "0",
    },
    {
      label: "Checked",
      value: "1",
    },
    {
      label: "Approved",
      value: "2",
    },
    {
      label: "Rejected",
      value: "3",
    },
  ];

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    Status: "0",
    CouponCategoryId: "0",
    CoupanTypeId: "0",
    CoupanName: "",
  });
  const [searchData, setSearchData] = useState([]);
  const [couponType, setCouponType] = useState([]);
  // const [show, setShow] = useState({
  //   rejectShow: false,
  //   ViewCentre: false,
  //   ViewTest: false,
  //   ViewCoupon: false,
  //   Edit: false,
  // });
  const [showreject, setShowreject] = useState(false);
  const [showcoupon, setShowCoupon] = useState(false);
  const [showCentre, setShowCentre] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [authority, setAuthority] = useState([]);
  const [Coupons, setCoupons] = useState([]);
  const [Id, setId] = useState("");
  const [details, setDetails] = useState({});

  const dateSelect = (date, name) => {
    setFormData({ ...formData, [name]: date });
  };
  const formChangeHandler = (e) => {
    const { name, value } = e?.target;
    if (name == "CoupanName") {
      setFormData({
        ...formData,

        [name]: PreventSpecialCharacter(value) ? value : formData[name],
      });
    } else setFormData({ ...formData, [name]: value });
  };

  const handleStatus = () => {
    toast.success("Done");
  };
  const performSearch = (Data) => {
    const updatedFormData = {
      ...Data,
      FromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
      ToDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
    };
    setLoading(true);
    axiosInstance
      .post("CouponMasterApproval/SearchData", updatedFormData)
      .then((res) => {
        setLoading(false);
        setCoupons(res?.data?.message);
        if (res?.data?.message.length == 0) {
          toast.error("No record found..");
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occurred",
        );
      });
  };
  const getCouponType = () => {
    axiosInstance
      .get("CouponMaster/Bindcoupontype")
      .then((res) => {
        let data = res?.data?.message;
        let CouponType = data?.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.CoupanType,
          };
        });

        setCouponType(CouponType);
      })
      .catch((err) => {
        toast.error(
          err?.response.data.message
            ? err?.response.data.message
            : "Something Went Wrong",
        );
      });
  };
  const handleSearch = () => {
    performSearch(formData);
  };
  const handleStatusType = (type) => {
    setFormData({
      ...formData,
      Status: type,
    });

    performSearch({
      ...formData,
      Status: type,
    });
  };
  const handleCheck = (ele) => {
    let payload;
    switch (ele?.approved) {
      case 0:
        payload = {
          Status: "1",
          DataType: "Centre",
          CentreType: "Processing Lab",
          CoupanID: ele?.CoupanId,
          LedgerTransactionNo: "",
        };
        break;
      case 1:
        payload = {
          Status: "2",
          DataType: "Centre",
          CentreType: "Processing Lab",
          CoupanID: ele?.CoupanId,
          LedgerTransactionNo: "",
        };
        break;
      case 2:
        payload = {
          Status: "0",
          DataType: "Centre",
          CentreType: "Processing Lab",
          CoupanID: ele?.CoupanId,
          LedgerTransactionNo: "",
        };
        break;
    }
    axiosInstance
      .post("CouponMasterApproval/Approved", payload)
      .then((res) => {
        if (ele?.approved == 0) {
          performSearch({
            CoupanName: "",
            CoupanTypeId: formData?.CoupanTypeId,
            CouponCategoryId: "0",
            Status: "0",
          });
        } else if (ele?.approved == 1) {
          performSearch({
            CoupanName: "",
            CoupanTypeId: formData?.CoupanTypeId,
            CouponCategoryId: "0",
            Status: "1",
          });
        } else if (ele?.approved == 2) {
          performSearch({
            CoupanName: "",
            CoupanTypeId: formData?.CoupanTypeId,
            CouponCategoryId: "0",
            Status: "2",
          });
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };

  const getColor = (status) => {
    switch (status) {
      case 0:
        return "lightyellow";
      case 1:
        return "Pink";
        break;
      case 2:
        return "#90EE90";
        break;
      case 3:
        return "#FF5722";
        break;
    }
  };
  const fetchdetails = (id) => {
    const obj = Coupons.filter((item) => {
      return item.CoupanID == id;
    });
    return obj[0];
  };
  const getRights = () => {
    axiosInstance
      .get("ManageApproval/GiveAppRightsToEmployee")
      .then((res) => {
        const authority = res?.data?.message.map((item) => item.AuthorityType);

        setAuthority(authority);
      })
      .catch((err) => {
        console.log(err?.response?.data?.message);
      });
  };
  const getData = (value) => {
    switch (value) {
      case 0:
        return "Client Share";
        break;
      case 1:
        return "Lab Share";
        break;
      case 2:
        return "Both";
    }
  };

  useEffect(() => {
    getCouponType();
    getRights();
  }, []);
  const closereject = (ele) => {
    setShowreject(false);
    if (ele?.approved == 0) {
      performSearch({
        CoupanName: "",
        CoupanTypeId: formData?.CoupanTypeId,
        CouponCategoryId: "0",
        Status: "0",
      });
    } else if (ele?.approved == 1) {
      performSearch({
        CoupanName: "",
        CoupanTypeId: formData?.CoupanTypeId,
        CouponCategoryId: "0",
        Status: "1",
      });
    }
  };
  const closecentre = () => {
    setShowCentre(false);
  };
  const closecoupon = () => {
    setShowCoupon(false);
  };
  const closetest = () => {
    setShowTest(false);
  };
  const closeedit = (ele) => {
    setShowEdit(false);
    if (ele?.approved == 0) {
      performSearch({
        CoupanName: "",
        CoupanTypeId: formData?.CoupanTypeId,
        CouponCategoryId: "0",
        Status: "0",
      });
    } else if (ele?.approved == 1) {
      performSearch({
        CoupanName: "",
        CoupanTypeId: formData?.CoupanTypeId,
        CouponCategoryId: "0",
        Status: "1",
      });
    }
  };
  return (
    <>
      {showreject && (
        <CouponMasterReject
          show={showreject}
          setShow={closereject}
          details={details}
        />
      )}
      {showCentre && (
        <ViewCentre show={showCentre} setShow={closecentre} id={Id} />
      )}
      {showcoupon && (
        <ViewCoupon show={showcoupon} setShow={closecoupon} id={Id} />
      )}

      {showTest && <ViewTest show={showTest} setShow={closetest} id={Id} />}

      {showEdit && (
        <CouponMasterEdit
          show={showEdit}
          setShow={closeedit}
          details={details}
        />
      )}
      <Accordion
        name={t("Coupon Master Approval")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              name="FromDate"
              lable={t("From Date")}
              className="custom-calendar"
              value={formData?.FromDate}
              onChange={dateSelect}
              maxDate={formData?.ToDate}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              name="ToDate"
              lable={t("To Date")}
              className="custom-calendar"
              value={formData?.ToDate}
              onChange={dateSelect}
              minDate={formData?.FromDate}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBox
              name="Status"
              lable={t("Status")}
              onChange={formChangeHandler}
              options={StatusType}
              selectedValue={formData?.Status}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBox
              name="CoupanTypeId"
              lable={t("Type")}
              onChange={formChangeHandler}
              options={[
                { label: "Select Coupon Type", value: "0" },
                ...couponType,
              ]}
              selectedValue={formData?.CoupanTypeId}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              id="CoupanName"
              lable={t("Coupon Name")}
              autoComplete="off"
              placeholder=""
              name="CoupanName"
              max={30}
              value={formData?.CoupanName}
              onChange={formChangeHandler}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <div className="col-auto">
              {loading ? (
                <Loading />
              ) : (
                // <button
                //   type="button"
                //   className="btn btn-block btn-success btn-sm"
                //   onClick={handleSearch}
                // //   style={{ width: "70px" }}
                // >
                //   {t("Search")}
                // </button>
                <SearchButton
                  text={"Search"}
                  onClick={handleSearch}
                />
              )}
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        className="cma-search-heading"
        seconTitle={
          <div style={{ display: "flex", flexWrap: "nowrap", gap: "12px", alignItems: "center" }}>
            <div>
              <button
                style={{ marginTop: "2px", height: "14px", border: "1px solid", backgroundColor: "lightyellow" }}
                onClick={(e) => { e.stopPropagation(); handleStatusType("0"); }}
              ></button>
              &nbsp;&nbsp;
              <label className="control-label">{t("Made")}</label>
            </div>
            <div>
              <button
                style={{ marginTop: "2px", height: "14px", border: "1px solid", backgroundColor: "Pink" }}
                onClick={(e) => { e.stopPropagation(); handleStatusType("1"); }}
              ></button>
              &nbsp;&nbsp;
              <label className="control-label">{t("Checked")}</label>
            </div>
            <div>
              <button
                style={{ marginTop: "2px", height: "14px", border: "1px solid", backgroundColor: "#90EE90" }}
                onClick={(e) => { e.stopPropagation(); handleStatusType("2"); }}
              ></button>
              &nbsp;&nbsp;
              <label className="control-label">{t("Approved")}</label>
            </div>
            <div>
              <button
                style={{ marginTop: "2px", height: "14px", border: "1px solid", backgroundColor: "#FF5722" }}
                onClick={(e) => { e.stopPropagation(); handleStatusType("3"); }}
              ></button>
              &nbsp;&nbsp;
              <label className="control-label">{t("Rejected")}</label>
            </div>
          </div>
        }
      >
        {Coupons.length > 0 && (
          <Tables>
            <thead className="cf text-center" style={{ zIndex: 99 }}>
              <tr>
                <th className="text-center">{t("S.No")}</th>
                <th className="text-center">{t("CouponName")}</th>
                <th className="text-center">{t("CouponType")}</th>
                <th className="text-center">{t("Share Type")}</th>
                <th className="text-center">{t("ValidFrom")}</th>
                <th className="text-center">{t("Valid To")}</th>
                <th className="text-center">{t("Min. Billing Amt.")}</th>
                <th className="text-center">{t("Issue For")}</th>
                <th className="text-center">{t("Applicable")}</th>
                <th className="text-center">{t("Disc. Amt.")}</th>
                <th className="text-center">{t("Disc.(%)")}</th>
                <th className="text-center">{t("Inhouse Disc. Amt.")}</th>
                <th className="text-center">{t("Inhouse Disc.(%)")}</th>
                <th className="text-center">{t("Outsource Disc. Amt.")}</th>
                <th className="text-center">{t("Outsource Disc.(%)")}</th>

                <th className="text-center">{t("Mul. Patient Coupon")}</th>
                <th className="text-center">{t("OneTimeCoupon")}</th>
                <th className="text-center">{t("TotalCoupon")}</th>
                <th className="text-center">{t("UsedCoupon")}</th>
                <th className="text-center">{t("Rem.Coupon")}</th>
                <th className="text-center">{t("ViewCenter")}</th>
                <th className="text-center">{t("ViewTest")}</th>
                <th className="text-center">{t("ViewCoupon")}</th>
                <th className="text-center">{t("Status")}</th>
                <th className="text-center">{t("Reject")}</th>
                <th className="text-center">{t("Edit")}</th>
              </tr>
            </thead>
            <tbody>
              {Coupons.map((ele, index) => (
                <>
                  <tr
                    key={ele?.CouponId}
                    style={{ backgroundColor: getColor(ele?.approved) }}
                  >
                    <td data-title="S.No" className="text-center">
                      {index + 1}
                    </td>
                    <td data-title="Coupon Name" className="text-center">
                      {ele?.CoupanName}
                    </td>
                    <td data-title="Coupon Type" className="text-center">
                      {ele?.coupantype}
                    </td>
                    <td
                      data-title="Discount Share Type"
                      className="text-center"
                    >
                      {getData(ele?.DiscShareType)}
                    </td>
                    <td data-title="Valid From" className="text-center">
                      {ele?.validfrom}
                    </td>
                    <td data-title="To Date" className="text-center">
                      {ele?.validto}
                    </td>
                    <td
                      data-title="Min. Billing Amount"
                      className="text-center"
                    >
                      {ele?.minbookingamount}
                    </td>
                    <td data-title="Issue For" className="text-center">
                      {ele?.issuetype}
                    </td>
                    <td data-title="Applicable" className="text-center">
                      {ele?.TYPE}
                    </td>
                    <td data-title="Discount Amt." className="text-center">
                      {ele?.discountamount}
                    </td>
                    <td data-title="Discount(%)" className="text-center">
                      {ele?.discountpercentage}
                    </td>
                    <td data-title="Inhouse Discount Amt." className="text-center">
                      {ele?.inHouseDiscountAmount}
                    </td>
                    <td data-title="Inhouse Discount(%)" className="text-center">
                      {ele?.inHousePer}
                    </td>
                    <td data-title="Outsource Discount Amt." className="text-center">
                      {ele?.outSourceDiscountAmount}
                    </td>
                    <td data-title="Outsource Discount(%)" className="text-center">
                      {ele?.outSourcePer}
                    </td>

                    <td
                      data-title="Multiple Patient Coupon"
                      className="text-center"
                    >
                      {ele?.MultiplePatientCoupon}
                    </td>
                    <td data-title="One Time Coupon" className="text-center">
                      {ele?.OneTimePatientCoupon}
                    </td>
                    <td data-title="TotalCoupon" className="text-center">
                      {ele?.CountApplyCoupon}
                    </td>
                    <td data-title="UsedCoupon" className="text-center">
                      {ele?.CountApplyCoupon - ele?.RemainingCount}
                    </td>
                    <td data-title="Rem. Coupon" className="text-center">
                      {ele?.RemainingCount}
                    </td>
                    <td data-title="View Center/PUP" className="text-center ">
                      <div
                        className="fa fa-search"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setId(ele?.CoupanId);
                          setShowCentre(true);
                        }}
                      ></div>
                    </td>
                    <td data-title="View Test" className="text-center">
                      {ele?.TYPE == "Test Wise" && (
                        <div
                          className="fa fa-search"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setId(ele?.CoupanId);
                            setShowTest(true);
                          }}
                        ></div>
                      ) || "-"}
                    </td>
                    <td data-title="View Coupon" className="text-center">
                      <div
                        className="fa fa-search"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setId(ele?.CoupanId);
                          setShowCoupon(true);
                        }}
                      ></div>
                    </td>
                    <td data-title="Status Change" className="text-center">
                      {ele.approved == "0" && (
                        // Check / reject- 24
                        // approval / Reject - 25
                        // Reject - [24. 25, 28]
                        <CustomButton
                          icon={"check"}
                           disabled={!accessRightArray?.includes("24")}
                          style={{ backgroundColor: "Pink" }}
                          onClick={() => {
                            handleCheck(ele);
                          }}
                        />
                      )}
                      {ele.approved == "1" && (
                        <button
                          className="btn btn-sm"
                          disabled={!(accessRightArray?.includes("25"))}
                          style={{ backgroundColor: "#90EE90" }}
                          onClick={() => {
                            handleCheck(ele);
                          }}
                        >
                          Approve
                        </button>
                      )}
                      {ele.approved == "2" && (
                        <button
                          className=" btn btn-primary btn-sm"
                          disabled={
                            !authority.includes("NotApproval") ||
                            ele?.IsUsed == 1
                          }
                          onClick={() => {
                            handleCheck(ele);
                          }}
                        >
                          Not Approve
                        </button>
                      )}
                    </td>
                    <td data-title="Reject" className="text-center">
                      {(
                        ele?.approved == "0" ||
                        accessRightArray?.includes('24') ||
                        accessRightArray?.includes('25') ||
                        accessRightArray?.includes('28')
                      ) && (
                          <CustomButton
                            icon={"cancel"}
                            title={"Reject"}
                            disabled={
                              accessRightArray?.includes('24') ||
                              accessRightArray?.includes('25') ||
                              accessRightArray?.includes('28')
                            }
                            style={{ backgroundColor: "#FF5722" }}
                            onClick={() => {
                              setShowreject(true);
                              setDetails(ele);
                            }}
                          />
                        )}
                      {ele?.approved == "1" && (
                        <CustomButton
                          icon={"cancel"}
                          title={"Reject"}
                          disabled={!authority.includes("Reject")}
                          style={{ backgroundColor: "#FF5722" }}
                          onClick={() => {
                            setShowreject(true);
                            setDetails(ele);
                          }}
                        />

                      )}
                    </td>
                    <td data-title="Edit" className="text-center">
                      {ele?.approved == "0" && (
                        <CustomButton
                          icon={"edit"}
                          // disabled={!authority.includes("Edit")}
                          onClick={() => {
                            setDetails(ele);
                            setShowEdit(true);
                          }}
                        />
                      )}
                      {ele?.approved == "1" && (
                        <CustomButton
                          icon={"edit"}
                          disabled={!authority.includes("Edit")}
                          onClick={() => {
                            setDetails(ele);
                            setShowEdit(true);
                          }}
                        />
                      )}
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </Tables>
        )}
      </Accordion>
    </>
  );
};

export default CouponMasterApproval;
