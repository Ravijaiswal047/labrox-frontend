import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import {
  AllowCharactersNumbersAndSpecialChars,
  autocompleteOnBlur,
  HandleHCEditBooking,
  isValidPercent,
  number,
} from "../../utils/helpers";
import { PreventSpecialCharacterandNumber } from "../util/Commonservices";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { HCPaymentMode } from "../../utils/Constants";
import Tables from "../../components/UI/customTable";
import DOSModal from "../utils/DOSModal";
import TestNameModal from "../utils/TestNameModal";
import Loading from "../../components/loader/Loading";
import ViewCouponDetail from "../Master/ViewCouponDetail";
import BindTestCouponShowModal from "../utils/BindTestCouponShowModal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton, EditButton } from "../../components/UI/CustomButton";

const HCEditModal = ({
  handleClose,
  showEdit,
  handleCloseEdit,
  details,
  testDetails,
  PatientDetails,
  Discamount,
  changeFlow,
}) => {
  const [errors, setError] = useState({});
  const [showView, setShowview] = useState(false);
  const [rateType, setRateType] = useState({
    data: [],
    value: details?.panelid,
    refRate: "",
  });
  const [dropFalse, setDropFalse] = useState(true);
  const [id, setTestId] = useState("");
  const [showDOS, setShowDOS] = useState(false);
  const [bindSourceCall, setBindSourceCall] = useState([]);
  const [discountApproval, setDiscountApproval] = useState([]);
  const handleCloseDOS = () => setShowDOS(false);
  const [testSearchType, setTestSearchType] = useState("By Test Name");
  const [load, setLoad] = useState(false);
  const [indexMatch, setIndexMatch] = useState(0);
  const [suggestion, setSuggestion] = useState([]);
  const [bookingData, setBookingData] = useState({
    TestName: "",
    CentreID: "",
    InvestigationID: "",
  });

  const [discountPercentage, setDiscountPercentage] = useState("");
  const [disAmt, setdisAmt] = useState("");
  const [net, setNet] = useState(0);

  const [discountamount, setDiscountAmount] = useState();
  //discounted amount

  const [tableData, setTableData] = useState([]);

  const [appointData, setAppointData] = useState({
    AppDateTime: details?.AppDate,
    Remarks: details?.Remarks,
    updatepatient: "1",
    HardCopyRequired: details?.HardCopyRequired === 0 ? false : true,
    PheleboNumber: details?.PMobile,
    PhlebotomistID: details?.PhlebotomistId,
    atitude: "",
    Longitude: "",
    ispermanetaddress: 1,
    ReceiptRequired: 1,
    AlternateMobileNo: details?.AlternateMobileNo,
    Client: "",
    PaymentMode: testDetails[0]?.PaymentMode,
    SourceofCollection: Number(details?.SourceofCollection),
    Phelebotomistname: details?.PhleboName,
    emailidpcc: "",
    centrename: details?.Centre,
    RouteName: details?.RouteName,
    RouteID: "",
    deliverych: "",
    endtime: "",
    oldprebookingid: "",
    hcrequestid: "",
    VIP: details?.Vip === 0 ? false : true,
    followupcallid: "",
    PreBookingId: details?.PreBookingId,
    // phelboshare: pheleboCharge?.value,
  });
  console.log(appointData);
  console.log(PatientDetails);
  console.log(details);
  const [testData, setTestData] = useState({
    Title: PatientDetails[0]?.Title,
    Patient_ID: details?.Patient_ID,
    PName: PatientDetails[0]?.FirstName,
    Mobile: PatientDetails[0]?.Mobile,
    Email: PatientDetails[0]?.Email,
    DOB: PatientDetails[0]?.Dob,
    Age: PatientDetails[0]?.Age,
    AgeYear: PatientDetails[0]?.AgeYear,
    AgeMonth: PatientDetails[0]?.AgeMonth,
    AgeDays: PatientDetails[0]?.AgeDays,
    TotalAgeInDays: PatientDetails[0]?.TotalAgeInDays,
    Gender: PatientDetails[0]?.Gender,
    House_No: details?.House_No,
    LocalityID: PatientDetails[0]?.LocalityId,
    Locality: PatientDetails[0]?.Locality,
    CityID: PatientDetails[0]?.CityId,
    City: PatientDetails[0]?.City,
    StateID: PatientDetails[0]?.StateId,
    State: PatientDetails[0]?.State,
    Pincode: PatientDetails[0]?.PinCode,
    Landmark: "",
    PreBookingCentreID: details?.PreBookingCentreID,
    Panel_ID: "",
    GrossAmt: "",
    // DiscAmt: 0,
    DisReason: details?.DiscReason,

    NetAmt: "",
    DiscountTypeID: "",
    AdrenalinEmpID: 0,
    MRP: 0,
    TestCode: "",
    SubCategoryID: "",
    DoctorID: details?.DoctorId,
    RefDoctor: details?.Doctor,
    OtherDoctor: "",
    Remarks: details?.Remarks,
    isUrgent: false,
    isPediatric: "",
  });
  const initialRender = useRef(true);
  const [showLog, setShowLog] = useState({ status: false, data: "" });

  const [showCoupon, setShowCoupon] = useState({
    BindTestCouponShow: false,
    ShowCouponDetail: false,
  });
  console.log(details);
  const [coupon, setCoupon] = useState({
    code: details?.CouponCode,
    field: details?.IsCoupon ? true : false,
    type: 1,
  });
  const getRateType = () => {
    axiosInstance
      .post("Centre/getRateTypeWithCentre", {
        CentreID: details?.PreBookingCentreID,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.RateTypeID,
            label: ele?.RateTypeName,
            refRate: ele?.ReferenceRate,
          };
        });
        setRateType({
          data: val,
          value: details?.panelid,
          refRate: val[0]?.refRate,
        });
      })
      .catch((err) => {
        setRateType({
          data: [],
          value: "",
          refRate: "",
        });
        console.log(err);
      });
  };
  const handleSearchSelectChange = (label, value) => {
    setRateType({
      ...rateType,
      ["value"]: value?.value,
      ["refRate"]: value?.refRate,
    });
  };
  useEffect(() => {
    getRateType();
  }, []);
  console.log(Discamount, discountamount);
  useEffect(() => {
    if (details?.IsCoupon) {
      axiosInstance
        .post("CouponMaster/GetCouponValidationData", {
          CoupanCode: details?.CouponCode,
        })
        .then((res) => {
          const data = res?.data?.message;
          console.log(data);
          setCoupon({
            ...coupon,
            type: data[0]?.Type == "Test Wise" ? 2 : 1,
          });
        })
        .catch((err) => {
          toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
        });
    }
  }, []);

  const [couponData, setCouponData] = useState([]);
  const [couponDetails, setCouponDetails] = useState([]);
  const handleCloseCoupon = () => {
    setShowCoupon({
      ...showCoupon,
      ShowCouponDetail: false,
    });
  };
  const handleCloseBindTestCouponShowModal = () => {
    setShowCoupon({
      ...showCoupon,
      BindTestCouponShow: false,
    });
  };
  const handleCouponValidate = () => {
    // if (tableData.length > 0) {
    console.log(coupon.code);
    console.log(tableData);

    // console.log(couponData);
    // console.log(couponData)

    if (disAmt || discountPercentage) {
      toast.error("First Remove Discount For Adding Coupon");
    } else {
      axiosInstance
        .post("CouponMaster/BindTestForAppliedCoupon", {
          CoupanCode: coupon?.code.trim(),
          CentreId: details?.PreBookingCentreID,
        })
        .then((res) => {
          const coupondatas = res?.data?.message;
          console.log(coupondatas);
          setCouponData(res?.data?.message);
          console.log(couponData);
          if (coupondatas[0].Type == 2) {
            setTableData([]);
            setShowCoupon({
              ...showCoupon,
              BindTestCouponShow: true,
            });
          } else {
            if (tableData.length > 0) {
              {
                // if (coupondatas[0]?.CoupanName == coupon?.code) {
                if (net < coupondatas[0]?.MinBookingAmount) {
                  toast.error(
                    "Total Billing amount should be greater than minimum booking amount " +
                      couponData[0]?.MinBookingAmount +
                      " so coupon discount can not be applied",
                  );
                } else if (net < coupondatas[0]?.DiscountAmount) {
                  toast.error(
                    "Gross amount must be greator than " +
                      coupondatas[0]?.DiscountAmount +
                      " to apply this coupon",
                  );
                } else {
                  toast.success("Coupon Applied Successfully");
                  if (coupondatas[0]?.DiscountAmount == 0)
                    setDiscountPercentage(coupondatas[0]?.DiscountPercentage);

                  if (coupondatas[0]?.DiscountPercentage == 0)
                    setdisAmt(coupondatas[0]?.DiscountAmount);

                  setCoupon({
                    ...coupon,
                    field: true,
                  });
                }
                // } else {
                //   toast.error("Incorrect Coupon Code");
                // }
              }
            } else {
              toast.error("Please Select any test first then apply coupon");
            }
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        });
    }

    // const generatedError = CouponValidateSchema(state,formData)
    // console.log(generatedError)
    // if(generatedError==""){
    //   toast.success("validate")
    // }

    //     console.log(state,formData)
  };
  const handleCouponCancel = () => {
    setCoupon({
      code: "",
      field: false,
      type: 1,
    });
    setTableData([]);
    if (coupon?.field) toast.error("Coupon Removed Successfully");
  };

  const handleCouponDetailsModal = () => {
    axiosInstance
      .post("CouponMaster/GetCouponValidationData", {
        CoupanCode: coupon?.code.trim(),
      })
      .then((res) => {
        setCouponDetails(res?.data?.message);
        if (res?.data?.message.length > 0) {
          setShowCoupon({
            ...showCoupon,
            ShowCouponDetail: true,
          });
        } else {
          toast.error("No Coupon Details Found");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message ? "Details Not Found" : "Error Occured",
        );
      });
  };
  const handleSelectTestData = (ele) => {
    // setShowCoupon({
    //   ...showCoupon,
    //   BindTestCouponShow: false,
    // });
    // setCoupon({
    //   ...coupon,
    //   field: true,
    // });
    console.log(ele);

    console.log(tableData);

    // console.log(LTData?.CentreID, ele?.ItemID);
    //   const selectedTest = tableData?.filter((eles,index)=>{
    //       return eles?.TestCode==ele?.ItemID
    //   })
    // //   console.log(selectedTest)
    //   if(selectedTest.lenfgth==0){

    const data = {
      InvestigationID: ele?.TestId,
      CentreID: details?.PreBookingCentreID,
      Discount: Number(ele?.DiscountPercentage),
    };
    getTableData(data, "Coupon");

    // }
    //   else{

    // for (let i = 0; i < tableData.length; i++) {
    //   if (tableData[i].TestCode === ele.ItemID) {
    //      handleDiscount(ele?.Discount,i);
    //   }
    // }
    //   }
  };

  console.log(details);
  console.log(testDetails);
  console.log(PatientDetails);
  console.log(testData);
  const { t } = useTranslation();

  function onValueChange(event) {
    setTestSearchType(event.target.value);
  }

  useEffect(() => {
    // console.log(discountamount);

    if (
      discountamount == "" ||
      discountamount == 0
      // discountPercentage == 0 ||
      // discountPercentage == "" ||
      // disAmt == "" ||
      // disAmt == 0
    ) {
      setTestData({
        ...testData,
        DoctorID: "",
        DisReason: "",
      });
      setDiscountApproval([]);
      getDiscountApproval();
      //
    }
  }, [discountamount]);
  useEffect(() => {
    setNet(
      tableData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.Rate,
        0,
      ),
    );
    setDiscountAmount(
      tableData.reduce(
        (accumulator, currentValue) =>
          Number(accumulator) + Number(currentValue.DiscAmt),
        0,
      ),
    );
    const total = tableData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.Rate,
      0,
    );
    console.log(discountamount, total);
    console.log(tableData);
    if (!coupon?.field) {
      setDiscountPercentage("");
      setdisAmt("");
      // setDiscountAmount(0);
    }
  }, [tableData.length]);

  useEffect(() => {
    setNet(
      testDetails.reduce(
        (accumulator, currentValue) => accumulator + currentValue.Rate,
        0,
      ),
    );

    // // setDiscountPercentage("");
    // setdisAmt("");
    // setDiscount(0);
    // // setDiscountAmount(0);
  }, []);

  useEffect(() => {
    setDiscountAmount(disAmt);
  }, [disAmt]);

  useEffect(() => {
    if (!isNaN(net) && !isNaN(discountPercentage)) {
      const discountAmount = (discountPercentage / 100) * net;
      setDiscountAmount(discountAmount);
    }
  }, [discountPercentage]);

  const CheckAndSetPercentage = (e) => {
    const { value } = e.target;

    if (isValidPercent(value)) {
      setDiscountPercentage(value);
    }

    if (value == "") {
      setDiscountPercentage("");
    }
  };

  const getBindSourceCall = () => {
    axiosInstance
      .get("CustomerCare/bindcollsource")
      .then((res) => {
        const data = res?.data?.message;
        const SourceCall = data?.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.Source,
          };
        });
        console.log(SourceCall);
        setBindSourceCall(SourceCall);
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };
  const getDiscountApproval = () => {
    axiosInstance
      .get("DiscApproval/BindDiscApproval")
      .then((res) => {
        const data = res?.data?.message;
        const discount = data?.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.Name,
          };
        });
        setDiscountApproval(discount);
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };
  const handleSplit = (id, symbol) => {
    const data = id?.split(symbol);
    return data;
  };

  const handleBooking = () => {
    // if (tableData.length === 0) {
    //   toast.error("Please Select Any Test");
    // }
    // else {
    //   if (appointData?.PaymentMode) {
    //     if (disAmt || discountPercentage) {
    //       if (testData?.DoctorID && testData?.DisReason) {
    //         handleUpdate();
    //       } else {
    //         toast.error("Please Choose Discount Approval And Discount Reason");
    //       }
    //     } else {
    //       handleUpdate();
    //     }
    //   } else {
    //     toast.error("Please Select Payment Mode");
    //   }
    // }
    setDropFalse(false);
    handleUpdate();
  };

  const handleUpdate = () => {
    console.log(tableData, discountamount, disAmt, discountPercentage);
    const datas = tableData.map((ele) => {
      // Guarded division, same defect as DoAppointmentModal. With every selected
      // test at Rate 0 the net is 0, so discount/0 gave Infinity and 0 * Infinity
      // gave NaN. Here it is worse than there: DiscountPercentage is itself saved
      // on the row below, so an Infinity was persisted as well as the NaN amount.
      const netTotal = Number(net);
      const DiscountPercentage =
        netTotal > 0 ? (Number(discountamount) / netTotal) * 100 : 0;

      const rowRate = Number(ele?.Rate);
      const rawNetAmount = rowRate - (DiscountPercentage / 100) * rowRate;
      const NetAmount = (
        Number.isFinite(rawNetAmount) ? rawNetAmount : 0
      ).toFixed(2);

      return {
        ...ele,
        DepartmentID: ele?.DepartmentID,
        TestCode: ele?.TestCode,
        ItemId: ele?.InvestigationID?.toString(),
        DisReason: testData?.DisReason.trim(),
        DoctorID: testData?.DoctorID,
        DiscountPercentage: DiscountPercentage,
        GrossAmt: ele?.Rate,
        DiscAmt:
          coupon?.field && coupon?.type == 2
            ? ele?.DiscAmt
            : tableData?.length > 1
              ? (ele?.Rate - NetAmount).toFixed(2)
              : discountamount,
        NetAmt:
          coupon?.field && coupon?.type == 2
            ? ele?.NetAmt
            : tableData?.length > 1
              ? NetAmount
              : net - discountamount,
        isUrgent: ele?.isUrgent ? 1 : 0,
        Remarks: appointData?.Remarks.trim(),
        isPediatric: ele?.isPediatric ? 1 : 0,
        RefDoctor: testData?.RefDoctor.trim(),
        House_No: testData?.House_No.trim(),
        Panel_ID: Number(rateType?.value),
      };
    });

    console.log(coupon, datas);
    console.log(appointData);
    console.log(testData);
    const combinedInfo = {
      RefDoctor: testData.RefDoctor,
      PaymentMode: appointData.PaymentMode,
      SourceofCollection: appointData.SourceofCollection,
      AlternateMobileNo: appointData.AlternateMobileNo,
      DoctorId: testData?.DoctorID,
      DisReason: testData?.DisReason,
      DisAmt: disAmt,
      DiscountPercentage: discountPercentage,
    };
    console.log(combinedInfo);
    const generatedError = HandleHCEditBooking(combinedInfo, coupon?.field);
    console.log(generatedError);
    if (generatedError === "") {
      setLoad(true);
      if (tableData?.length > 0) {
        axiosInstance
          .post("HomeCollectionSearch/UpdateHomeCollection", {
            datatosave: datas,
            ...appointData,
            HardCopyRequired: appointData.HardCopyRequired ? 1 : 0,
            CouponCode: coupon?.field ? coupon?.code : "",
            CouponId: coupon?.field
              ? (couponData[0]?.CoupanId ?? details?.CouponId)
              : "",
            IsCoupon: coupon?.field ? 1 : 0,
            VIP: appointData.VIP ? 1 : 0,
          })
          .then((res) => {
            setLoad(false);
            console.log(res?.data?.message);
            toast.success("Update Successfully");
            // handleAppointment();
            // callhandleOnRouteValue(routeValueData);
            handleCloseEdit();
            changeFlow(appointData);
            handleClose();
          })
          .catch((err) => {
            setLoad(false);
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Something Went Wrong",
            );
          });
      } else {
        toast.error("Please Select Any Test");
        setLoad(false);
      }
    } else {
      setError(generatedError);
    }
  };
  const [DocData, setDocData] = useState({
    DoctorName: details?.Doctor,
  });
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const getDoctorSuggestion = () => {
    axiosInstance
      .post("DoctorReferal/getDoctorData", {
        DoctorName: DocData?.DoctorName,
      })
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          setDoctorSuggestion(res?.data?.message);
        } else {
          setTimeout(() => {
            setTestData({ ...testData, RefDoctor: "" });
          }, 100);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (!initialRender.current) {
      getDoctorSuggestion();
    } else {
      initialRender.current = false;
    }
  }, [DocData?.DoctorName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (coupon?.field) {
      toast.error("Remove Coupon First");
    } else setBookingData({ ...bookingData, [name]: value });
  };

  const handleAppointChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name == "Remarks") {
      const Value = PreventSpecialCharacterandNumber(value)
        ? value
        : appointData[name];

      setAppointData({
        ...appointData,
        [name]: Value,
      });
    } else {
      setAppointData({
        ...appointData,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    console.log(bookingData);
  };

  const handleReactSelectChange = (name,e) => {
    const {value} = e;
      setAppointData({
        ...appointData,
        [name]: value,
      });
  };

  const SearchTest = (e) => {
    const val = e.target.value;

    if (val.length >= 3) {
      axiosInstance
        .post("TestData/BindBillingTestData", {
          CentreID: rateType?.value,
          TestName: val,
          SearchBy: "TestName",
        })
        .then((res) => {
          if (res?.data?.success) setSuggestion(res?.data?.message);
          else {
            toast.error("Please check rate/Share and sample type");
          }
        })
        .catch((err) =>
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          ),
        );
    }
  };

  const handleIndex = (e) => {
    const { name } = e.target;
    switch (name) {
      case "TestName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(suggestion.length - 1);
            }
            break;
          case 40:
            if (suggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            if (suggestion.length > 0) {
              handleListSearch(suggestion[indexMatch], name);
            }
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      case "DoctorName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(doctorSuggestion.length - 1);
            }
            break;
          case 40:
            if (doctorSuggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            handleListSearch(doctorSuggestion[indexMatch], name);
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };
  const handleListSearch = (data, name) => {
    console.log(data);
    if (!data) {
      console.warn("Data is undefined or null");
      return;
    }
    switch (name) {
      case "TestName":
        setBookingData({
          ...bookingData,
          TestName: "",
          InvestigationID: data.InvestigationID,
        });
        setIndexMatch(0);
        setSuggestion([]);
        console.log(data);
        getTableData(data, "Test");
        break;
      case "DoctorName":
        setDocData({ ...DocData, [name]: data.Name });
        setTestData({
          ...testData,
          RefDoctor: data.Name,
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;
      default:
        break;
    }
  };

  console.log(showLog);
  const CheckageTest = (gender, ToAge, FromAge) => {
    let genderCheck = false;
    let ageCheck = true;
    let message = "";
    genderCheck = [testData?.Gender, "Both"].includes(gender) ? true : false;

    if (testData?.TotalAgeInDays > ToAge) {
      ageCheck = false;
      message = "Your Age is Greater than this test Maximum Age";
    }

    if (testData?.TotalAgeInDays < FromAge) {
      ageCheck = false;
      message = "Your Age is Less than this test Minimum Age";
    }

    return {
      genderCheck: genderCheck,
      ageCheck: ageCheck,
      message: message,
    };
  };

  const getTableData = (data, key) => {
    const ItemIndex = tableData.findIndex(
      (e) => e.InvestigationID === data.InvestigationID,
    );
    if (ItemIndex === -1) {
      axiosInstance
        .post("TestData/BindSingleTestData", {
          InvestigationID: data.InvestigationID,
          CentreID: data.CentreID,
          CentreIdNew: details?.PreBookingCentreID,
          FamilyMemberIsPrimary: 0,
          PatientCode: 0,
          MembershipCardID: 0,
          SetMRP: 0,
          IsPromotional: 0,
          PromotionalID: 0,
          IsVetCanine:0,
          ReferenceRate:rateType?.refRate,
        })
        .then((res) => {
          const newData = res?.data?.message;

          const { genderCheck, ageCheck, message } = CheckageTest(
            res?.data?.message[0]?.Gender,
            res?.data?.message[0]?.ToAge,
            res?.data?.message[0]?.FromAge,
          );

          if (genderCheck && ageCheck) {
            console.log(newData);
            const appendedData = [
              ...tableData,
              ...newData.map((ele) => {
                return {
                  ...testData,
                  DataType: ele?.DataType,
                  DepartmentID: ele?.DepartmentID,
                  FromAge: ele?.FromAge,
                  Gender: ele?.Gender,
                  InvestigationID: ele?.InvestigationID,
                  IsSampleRequired: ele?.IsSampleRequired,
                  Rate: data?.Rate ? data?.Rate : ele?.Rate,
                  GrossAmt: data?.Rate ? data?.Rate : ele?.Rate,
                  NetAmt: data?.Discount
                    ? (
                        ele?.Rate -
                        (Number(ele?.Rate) * data?.Discount) / 100
                      ).toFixed(2)
                    : Number(ele?.Rate).toFixed(2),
                  ReportType: ele?.ReportType,
                  RequiredAttachment: ele?.RequiredAttachment,
                  SampleCode: ele?.SampleCode,
                  SampleName: ele?.SampleName,
                  SampleTypeID: ele?.SampleTypeID,
                  ItemId: ele?.TestCode,
                  TestCode: ele?.TestCode,
                  ItemName: ele?.TestName,
                  ToAge: ele?.ToAge,
                  deleiveryDate: ele?.deleiveryDate,
                  refRateValue: ele?.refRateValue,
                  DiscAmt: data?.Discount
                    ? ((Number(ele?.Rate) * data?.Discount) / 100).toFixed(2)
                    : "",
                  SampleRemarks: ele?.SampleRemarks,
                };
              }),
            ];
            if (key == "Coupon") {
              setCoupon({
                ...coupon,
                field: true,
                type: 2,
              });
            }
            const appendata2 = appendedData.map((item) => {
              return { ...item, DiscAmt: "" };
            });
            console.log(appendata2);

            setTableData(key == "Coupon" ? appendedData : appendata2);
          } else {
            !genderCheck &&
              toast.error("This Test is Not for " + testData?.Gender);
            !ageCheck && toast.error(message);
          }
        })
        .catch((err) => console.log(err));
    } else {
      toast.error("Duplicate Test Found");
    }
  };

  const handleFilter = (data) => {
    if (coupon?.field) {
      toast.error(
        "You can't remove test because you have applied coupon, first remove coupon code.",
      );
    } else {
      const value = tableData.filter(
        (ele) => ele.InvestigationID !== data.InvestigationID,
      );
      console.log(value);
      setDiscountAmount("");
      setDiscountPercentage("");
      setTestData({
        ...testData,
        DoctorID: "",
        DisReason: "",
      });

      const value2 = value.map((item) => {
        return { ...item, DiscAmt: 0 };
      });
      setTableData(value2);
      toast.success("Test Successfully Removed");
    }
  };

  const fillTableData = () => {
    console.log(testData);
    console.log(testDetails);

    const testdetails1 = testDetails.map((ele) => {
      return {
        ...ele,
        Rate: ele?.Discamt + ele?.NetAmt,
      };
    });

    const testdetails2 = testdetails1.map(({ Discamt, ...rest }) => {
      return {
        ...rest,

        DiscAmt: Discamt,
        // Rate: Discamt + NetAmt,
      };
    });
    const testDetails3 = testdetails2.map((item) => {
      return { ...item, InvestigationID: item?.ItemId };
    });
    const tableData = testDetails3.map((item) => {
      return { ...testData, ...item };
    });
    console.log(tableData);
    setTableData(tableData);
  };

  const handleTestChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "RefDoctor" || name === "DisReason") {
      const Value = PreventSpecialCharacterandNumber(value)
        ? value
        : testData[name];

      setTestData({
        ...testData,
        [name]: Value,
      });
    } else if (name == "House_No") {
      if (AllowCharactersNumbersAndSpecialChars(value)) {
        setTestData({
          ...testData,
          [name]: type === "checkbox" ? checked : value,
        });
      }
    } else {
      setTestData({
        ...testData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };
  console.log(tableData);
  const handleCheckBox = (index, e) => {
    const { name, checked } = e.target;

    const newData = [...tableData];

    newData[index] = {
      ...newData[index],
      [name]: checked,
    };

    setTableData(newData);
  };
  useEffect(() => {
    getBindSourceCall();
    fillTableData();
    getDiscountApproval();
    setDiscountAmount(Discamount);
  }, []);

  useEffect(() => {});

  const handleShow = () => {
    setShowview((prev) => !prev);
  };

  const handlecloseLog = () => {
    setShowLog({
      status: false,
      data: "",
    });
  };

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      {showDOS && (
        <DOSModal showDOS={showDOS} handleCloseDOS={handleCloseDOS} />
      )}
      {/* {showCoupon.ShowCouponDetail && (
        <ViewCouponDetail
          couponDetails={couponDetails}
          showCoupon={showCoupon.ShowCouponDetail}
          handleCloseCoupon={handleCloseCoupon}
        />
      )}
      {showCoupon.BindTestCouponShow && (
        <BindTestCouponShowModal
          couponData={couponData}
          showCoupon={showCoupon.BindTestCouponShow}
          handleCloseBindTestCouponShowModal={
            handleCloseBindTestCouponShowModal
          }
          handleSelectTestData={handleSelectTestData}
        />
      )} */}
      <Dialog
        header={t("Edit Slot")}
        visible={showEdit}
        onHide={() => {
          handleCloseEdit();
        }}
        draggable={false}
        className={theme}
        style={{ width: "1000px" }}
      >
        <div className="row">
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable={t("Phelebotmist Name")}
              placeholder=""
              name="PhelebotmistName"
              id="PhelebotmistName"
              value={`${details?.PhleboName || ""} (${details?.PMobile || ""})`}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable={t("Appointment Date & Time")}
              placeholder=""
              name="AppointmentDateTime"
              id="AppointmentDateTime"
              value={details?.AppDate}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable={t("Referred Doctor")}
              placeholder=""
              name="DoctorName"
              id="DoctorName"
              value={DocData?.DoctorName}
              max={20}
              onChange={(e) => {
                if (e.target.value == "") {
                  setTestData({ ...testData, RefDoctor: "" });
                  setDocData({
                    ...DocData,
                    DoctorName: e.target.value,
                  });
                  setDropFalse(false);
                } else {
                  setDocData({
                    ...DocData,
                    DoctorName: e.target.value,
                  });
                  setTestData({ ...testData, RefDoctor: "" });
                  setDropFalse(true);
                }
              }}
              onBlur={(e) => {
                autocompleteOnBlur(setDoctorSuggestion);
                setTimeout(() => {
                  const data = doctorSuggestion.filter(
                    (ele) => ele?.Name === e.target.value,
                  );
                  if (data.length === 0) {
                    setDocData({
                      ...DocData,
                      DoctorName: "",
                      // RefDoctor: "",
                    });
                    setTestData({
                      ...testData,
                      // DoctorName: "",
                      RefDoctor: "",
                    });
                  }
                }, 200);
              }}
              onKeyDown={handleIndex}
            />
            {dropFalse && doctorSuggestion?.length > 0 && (
              <ul className="suggestion-data">
                {doctorSuggestion.map((data, index) => (
                  <li
                    onClick={() => handleListSearch(data, "DoctorName")}
                    className={`${index === indexMatch && "matchIndex"}`}
                    key={index}
                  >
                    {data?.Name}
                  </li>
                ))}
              </ul>
            )}
            {testData?.RefDoctor == "" && (
              <span className="error-message">{errors?.RefDoc}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="number"
              lable={t("Alternate Mobile No.")}
              placeholder=""
              autoComplete="off"
              max={10}
              name="AlternateMobileNo"
              onChange={handleAppointChange}
              id="AlternateMobileNo"
              onInput={(e) => number(e, 10)}
              value={appointData?.AlternateMobileNo}
            />
            {appointData?.AlternateMobileNo === "" && (
              <span className="error-message">
                {errors?.Alternatemobilenos}
              </span>
            )}
            {appointData?.AlternateMobileNo.length > 0 &&
              appointData?.AlternateMobileNo.length !== 10 && (
                <span className="error-message">
                  {errors?.Alternatemobilenum}
                </span>
              )}
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              className="required-fields"
              name="SourceofCollection"
              lable={t("Source of Collection")}
              selectedValue={appointData?.SourceofCollection}
              options={[
                { label: "Select Source Of Collection", value: "" },
                ...bindSourceCall,
              ]}
              onChange={handleAppointChange}
            /> */}
            <ReactSelect
                dynamicOptions={[
                { label: "Select Source Of Collection", value: "" },
                ...bindSourceCall,
              ]}
                className="required-fields"
              name="SourceofCollection"
              lable={t("Source of Collection")}
                removeIsClearable={true}
                placeholderName={t("")}
                value={appointData?.SourceofCollection}
                onChange={handleReactSelectChange}
              />
            {appointData?.SourceofCollection.length == 0 && (
              <span className="error-message">{errors?.Source}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable={t("Remarks")}
              placeholder=""
              name="Remarks"
              id="Remarks"
              onChange={handleAppointChange}
              max={20}
              value={appointData?.Remarks}
            />
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-sm-2">
            {/* <SelectBox
              className="required-fields"
              name="PaymentMode"
              lable="Payment Mode"
              id="PaymentMode"
              selectedValue={appointData?.PaymentMode}
              options={[
                { label: "Select Payment Mode", value: "" },
                ...HCPaymentMode,
              ]}
              isDisabled={tableData.length === 0}
              onChange={handleAppointChange}
            /> */}

            <ReactSelect
                dynamicOptions={[
                { label: "Select Payment Mode", value: "" },
                ...HCPaymentMode,
              ]}
                className="required-fields"
              name="PaymentMode"
              lable="Payment Mode"
              id="PaymentMode"
                removeIsClearable={true}
                placeholderName={t("Payment Mode")}
                value={appointData?.PaymentMode}
                onChange={handleReactSelectChange}
              />
            {appointData?.PaymentMode.length == 0 && (
              <span className="error-message">{errors?.Paymentmode}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable={t("Address")}
              placeholder=""
              name="House_No"
              id="House_No"
              onChange={handleAppointChange}
              max={20}
              value={testData?.House_No}
            />
          </div>

          <div className="col-sm-1 mt-1 d-flex align-items-center">
            <div className="mt-1">
              <input
                type="checkbox"
                name="VIP"
                onChange={handleAppointChange}
                checked={appointData?.VIP}
              />
            </div>
            <label className="ml-2 mb-0" style={{ whiteSpace: "nowrap" }}>
              {t("VIP")}
            </label>
          </div>

          <div className="col-sm-3 mt-1 d-flex align-items-center">
            <div className="mt-1">
              <input
                type="checkbox"
                name="HardCopyRequired"
                onChange={handleAppointChange}
                checked={appointData?.HardCopyRequired}
              />
            </div>
            <label className="ml-2 mb-0" style={{ whiteSpace: "nowrap" }}>
              {t("Hard copy of report required")}
            </label>
          </div>
          <div className="col-sm-3">
            <ReactSelect
              isDisabled={true}
              dynamicOptions={rateType?.data}
              name="value"
              lable="RateType"
              id="RateType"
              removeIsClearable={true}
              placeholderName="RateType"
              value={rateType?.value}
              onChange={handleSearchSelectChange}
            />
          </div>

          <div className="row d-flex justify-content-between">
            {/* <div className="col-sm-3 mt-1 d-flex align-items-center">
              <div className="mt-1">
                <input
                  type="radio"
                  name="testsearchtype"
                  value="By Test Name"
                  checked={testSearchType === "By Test Name"}
                  onChange={onValueChange}
                />
              </div>
              <label className="ml-2 mb-0" style={{ whiteSpace: "nowrap" }}>
                {t("By TestName")}
              </label>
            </div> */}

            {/* <div className="col-sm-3 mt-1 d-flex align-items-center">
              <div className="mt-1">
                <input
                  type="radio"
                  name="testsearchtype"
                  value="By Test Code"
                  checked={testSearchType === "By Test Code"}
                  onChange={onValueChange}
                />
              </div>
              <label className="ml-2 mb-0" style={{ whiteSpace: "nowrap" }}>
                {t("By TestCode")}
              </label>
            </div> */}

            {/* <div className="col-sm-3 mt-1 d-flex align-items-center">
              <div className="mt-1">
                <input
                  type="radio"
                  name="testsearchtype"
                  value="InBetween"
                  checked={testSearchType === "InBetween"}
                  onChange={onValueChange}
                />
              </div>
              <label className="ml-2 mb-0" style={{ whiteSpace: "nowrap" }}>
                {t("In Between")}
              </label>
            </div> */}
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-sm-7">
            <div className="row mt-1">
              <div className="col-sm-7">
                <Input
                  lable="Type Test Name Or Test Code"
                  placeholder=""
                  id="TestName"
                  autoComplete="off"
                  name="TestName"
                  className="required-fields"
                  onInput={SearchTest}
                  type="text"
                  onChange={handleChange}
                  value={bookingData.TestName}
                  onKeyDown={handleIndex}
                  onBlur={() => {
                    autocompleteOnBlur(setSuggestion);
                    setTimeout(() => {
                      setBookingData({ ...bookingData, TestName: "" });
                    }, 500);
                  }}
                />
                {suggestion.length > 0 && (
                  <ul className="suggestion-data">
                    {suggestion.map((data, index) => (
                      <li
                        onClick={() => handleListSearch(data, "TestName")}
                        key={index}
                        className={`${index === indexMatch && "matchIndex"}`}
                      >
                        {data.TestName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div
                className="col-sm-auto mt-0 mr-4"
                style={{ textAlign: "center" }}
              >
                <CustomButton
                  text={`Count : ${tableData.length}`}
                  disabled={tableData.length === 0}
                />
              </div>
              <div
                className="col-sm-3 mr-0 mt-1"
                style={{ textAlign: "center", fontWeight: "bold" }}
              >
                Discount Amt : {Number(discountamount).toFixed(2)}
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-sm-12">
                <div className="">
                  <Tables>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Code</th>
                        <th>Item</th>
                        <th>View</th>
                        <th>Rate</th>
                        <th>Disc.</th>
                        <th>Amt.</th>
                        <th>IsUrgent</th>
                      </tr>
                    </thead>
                    {tableData.length > 0 && (
                      <tbody>
                        {tableData.map((ele, index) => (
                          <>
                            <tr key={index}>
                              <td data-title="S.No">
                                {index + 1}&nbsp;
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => {
                                    handleFilter(ele);
                                  }}
                                >
                                  X
                                </button>
                              </td>

                              <td data-title={t("SampleCode")}>
                                {ele.TestCode ? ele.TestCode : ele?.ItemId}
                              </td>
                              <td data-title={t("SampleName")}>
                                {ele.TestName ? ele.TestName : ele?.ItemName}
                              </td>
                              <td data-title={t("View")}>
                                {(ele?.DataType === "Test" ||
                                  ele?.DataType === "Package" ||
                                  ele?.ItemType === "Test" ||
                                  ele?.ItemType === "Package" ||
                                  ele?.DataType === "Profile" ||
                                  ele?.ItemType === "Profile") && (
                                  <i
                                    className="fa fa-search"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setShowview(true);
                                      setTestId(ele?.ItemId);
                                    }}
                                  />
                                )}
                              </td>

                              <td data-title={t("Rate")}>{ele.Rate}</td>

                              <td data-title={t("Disc.")}>
                                <input
                                  style={{ width: "50px" }}
                                  type="number"
                                  className="select-input-box form-control input-sm"
                                  name="discountamt"
                                  value={ele?.DiscAmt}
                                  disabled
                                  min={0}
                                />
                              </td>
                              <td data-title={t("Amt.")}>
                                <input
                                  className="currency"
                                  value={Number(ele?.NetAmt).toFixed(2)}
                                  disabled
                                  style={{ width: "50px" }}
                                />
                              </td>
                              <td data-title={t("IsUrgent")}>
                                <input
                                  type="checkbox"
                                  name="isUrgent"
                                  onChange={(e) => handleCheckBox(index, e)}
                                  checked={tableData[index]?.isUrgent}
                                />
                              </td>
                            </tr>
                          </>
                        ))}
                      </tbody>
                    )}
                  </Tables>
                  {showLog?.status && (
                    <TestNameModal
                      show={showLog?.status}
                      onHandleShow={handlecloseLog}
                      id={showLog?.data}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm">
            <div className="row">
              <div className="col-md-4">
                <Input
                  data-val="false"
                  lable={t("Total Amount")}
                  placeholder={"Total_Amount"}
                  id="Total_Amount"
                  name="Total_Amount"
                  disabled={true}
                  value={net}
                  type="text"
                  readOnly="readonly"
                />
              </div>
              <div className="col-md-4">
                <Input
                  lable={t("Total Amount to Pay")}
                  data-val="false"
                  placeholder={"Total_Amount"}
                  id="Total_Amount"
                  name="Total_Amount"
                  disabled={true}
                  value={Number(net - discountamount).toFixed(2)}
                  type="text"
                  readOnly="readonly"
                />
              </div>
              <div className="col-md-4">
                <Input
                  lable={t("Discount Amount")}
                  name="DiscAmt"
                  placeholder=""
                  value={disAmt}
                  type="number"
                  onInput={(e) => number(e, 20)}
                  onChange={(e) => {
                    if (coupon?.field == true) {
                      toast.error("Remove Coupon First");
                    } else {
                      if (
                        tableData?.reduce(
                          (acc, init) => Number(acc) + Number(init.DiscAmt),
                          0,
                        ) != 0
                      ) {
                        toast.error("Discount already given");
                        return;
                      } else if (discountPercentage === "") {
                        if (net === 0 || net < Number(e.target.value)) {
                          toast.error("Please Enter Valid Discount");
                        } else {
                          setdisAmt(e.target.value);
                        }
                      } else {
                        toast.error("Discount Already Given");
                      }
                    }
                  }}
                  disabled={tableData.length === 0}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <Input
                  lable={t("Discount in %")}
                  name="discountPercentage"
                  placeholder=" "
                  type="number"
                  value={discountPercentage}
                  className="select-input-box form-control input-sm currency"
                  onChange={(e) => {
                    console.log(tableData);

                    if (coupon?.field == true) {
                      toast.error("Remove Coupon First");
                    } else {
                      if (
                        tableData?.reduce(
                          (acc, init) => Number(acc) + Number(init.DiscAmt),
                          0,
                        ) != 0
                      ) {
                        toast.error("Discount already given");
                        return;
                      } else if (disAmt === "") {
                        if (net === 0 || Number(e.target.value) > 100) {
                          toast.error("Please Enter Valid Discount");
                        } else {
                          CheckAndSetPercentage(e);
                        }
                      } else {
                        toast.error("Discount Already Given");
                      }
                    }
                  }}
                  disabled={tableData.length === 0}
                />
              </div>
              <div className="col-md-4">
                <SelectBox
                  name="DoctorID"
                  lable={t("Discount Given By")}
                  options={[
                    { label: "Select Discount By", value: "" },
                    ...discountApproval,
                  ]}
                  selectedValue={testData?.DoctorID}
                  isDisabled={
                    discountamount == "" || discountamount == 0 || coupon?.field
                  }
                  className="select-input-box form-control input-sm"
                  onChange={handleTestChange}
                />
                {!coupon.field &&
                  discountamount != "" &&
                  testData?.DoctorID == 0 && (
                    <span className="error-message">{errors?.DoctorId}</span>
                  )}
              </div>
              <div className="col-sm-4">
                <Input
                  name="DisReason"
                  placeholder=" "
                  lable={t("Discount Reason")}
                  disabled={
                    discountamount == "" || discountamount == 0 || coupon?.field
                  }
                  className="select-input-box form-control input-sm"
                  value={testData?.DisReason}
                  onChange={handleTestChange}
                />
                {!coupon.field &&
                  discountamount != "" &&
                  testData?.DisReason == "" && (
                    <span className="error-message">{errors?.DisReason}</span>
                  )}
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4 d-none">
                <Input
                  type="text"
                  lable={"Enter Coupon Code"}
                  placeholder=""
                  value={coupon.code}
                  max={30}
                  disabled={coupon.field}
                  onChange={(e) =>
                    setCoupon({
                      ...coupon,
                      code: e.target.value,
                    })
                  }
                />
              </div>
              {/* <div className="col-sm-3" style={{ textAlign: "center" }}>
                <button
                  className="btn btn-success btn-block btn-sm"
                  onClick={handleCouponValidate}
                  disabled={coupon.field}
                >
                  {t("Validate")}
                </button>
              </div>
              <div className="col-sm-3">
                <button
                  className="btn btn-danger btn-sm btn-block"
                  onClick={handleCouponCancel}
                >
                  {t("Cancel")}
                </button>
              </div>
              <div className="col-sm-2">
                <a
                  className="pi pi-search coloricon"
                  style={{ cursor: "pointer" }}
                  onClick={handleCouponDetailsModal}
                ></a>
              </div> */}
            </div>
          </div>
        </div>
        <div
          className="row"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div className="col-md-2 mt-2">
            {load ? (
              <Loading />
            ) : (
              // <button
              //   type="button"
              //   className="btn btn-primary btn-block btn-sm"
              //   onClick={handleBooking}
              // >
              //   Update Appointment
              // </button>
              <EditButton
                  text={"Update Appointment"}
                  onClick={handleBooking}
              />
            )}
          </div>
        </div>
      </Dialog>
      {showView && (
        <TestNameModal show={showView} onHandleShow={handleShow} id={id} />
      )}
    </>
  );
};

export default HCEditModal;
