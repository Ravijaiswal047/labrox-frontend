import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";

import { PreventSpecialCharacterandNumber } from "../util/Commonservices";
import {
  AllowCharactersNumbersAndSpecialChars,
  HandleHCBooking,
} from "../../utils/Schema";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Tables from "../../components/UI/customTable";
import {
  isValidPercent,
  number,
  autocompleteOnBlur,
} from "../../utils/helpers";
import { getDoctorSuggestion } from "../../utils/NetworkApi/commonApi";
import { HCPaymentMode } from "../../utils/Constants";
import TestNameModal from "../utils/TestNameModal";
import { axiosInstance } from "../../utils/axiosInstance";
import ReactSelect from "../../components/formComponent/ReactSelect";
// import ViewCouponDetail from "../util/ViewCouponDetail";
// import BindTestCouponShowModal from "../util/BindTestCouponShowModal";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton"

const DoAppointmentModal = ({
  selectedPhelebo,
  routeValueData,
  callhandleOnRouteValue,
  appointment,
  handleAppointment,
}) => {
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [DocData, setDocData] = useState({
    DoctorName: "",
  });
  const [rateType, setRateType] = useState({
    data: [],
    value: "",
    refRate: "",
  });
  const [dropFalse, setDropFalse] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showDOS, setShowDOS] = useState(false);
  const [bindSourceCall, setBindSourceCall] = useState([]);
  const [discountApproval, setDiscountApproval] = useState([]);

  const [testSearchType, setTestSearchType] = useState("By Test Name");
  const [indexMatch, setIndexMatch] = useState(0);
  const [suggestion, setSuggestion] = useState([]);
  const [bookingData, setBookingData] = useState({
    TestName: "",
    CentreID: "",
    InvestigationID: "",
  });
  const [load, setLoad] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [disAmt, setdisAmt] = useState("");
  const [net, setNet] = useState(0);
  const [discountamount, setDiscountAmount] = useState(0); //discounted amount
  const [tableData, setTableData] = useState([]);
  // const [pheleboCharge, setPheleboCharge] = useState([]);
  const [record, setRecord] = useState([]);
  const [lastThreeVisitShow, setLastThreeVisitShow] = useState(false);
  const [lastThreeVisit, setLastThreeVisit] = useState(false);
  const [suggestedTestShow, setSuggestedTestShow] = useState(false);
  const [suggestedTest, setSuggestedTest] = useState([]);
  // const [discount, setDiscount] = useState(0); //total amount after discount
  const [appointData, setAppointData] = useState({
    AppDateTime: `${moment(selectedPhelebo.AppointmentDate).format(
      "DD-MMM-YYYY",
    )} ${selectedPhelebo.SelectedTime}`,
    // Address: selectedPhelebo?.Address ? selectedPhelebo?.Address : "",
    SelectedTime: selectedPhelebo.SelectedTime,
    updatepatient: "",
    HardCopyRequired: "",
    PheleboNumber: selectedPhelebo.PheleboNumber,
    PhlebotomistID: selectedPhelebo.SelectedPheleboId,
    atitude: "",
    Longitude: "",
    ispermanetaddress: 1,
    ReceiptRequired: 1,
    Alternatemobileno: "",
    Client: "",
    Paymentmode: "",
    SourceofCollection: "",
    Phelebotomistname: selectedPhelebo.PheleboName,
    emailidpcc: selectedPhelebo?.Email,
    centrename: selectedPhelebo?.DropLocationLabel,
    RouteName: selectedPhelebo?.SelectedBindRoute,
    RouteID: selectedPhelebo?.RouteId,
    deliverych: "",
    endtime: "",
    oldprebookingid: "",
    hcrequestid: "",
    followupcallid: "",
    // phelboshare: pheleboCharge?.value,
  });
  const [testData, setTestData] = useState({
    Title: selectedPhelebo?.Title,
    Patient_ID: selectedPhelebo?.Patient_ID,
    PatientCode:  selectedPhelebo?.PatientCode,
    PName: selectedPhelebo?.NAME,
    Mobile: selectedPhelebo?.Mobile,
    Email: selectedPhelebo?.Email,
    DOB: selectedPhelebo?.DOB,
    Age: selectedPhelebo?.Age,
    AgeYear: selectedPhelebo?.AgeYear,
    AgeMonth: selectedPhelebo?.AgeMonth,
    AgeDays: selectedPhelebo?.AgeDays,
    TotalAgeInDays: selectedPhelebo?.TotalAgeInDays,
    Gender: selectedPhelebo?.Gender,
    VIP: "",
    House_No: selectedPhelebo?.Address ? selectedPhelebo?.Address : "",
    LocalityID: selectedPhelebo?.LocalityID,
    Locality: selectedPhelebo?.Locality,
    CityID: selectedPhelebo?.CityID,
    City: selectedPhelebo?.City,
    StateID: selectedPhelebo?.StateID,
    State: selectedPhelebo?.State,
    Pincode: selectedPhelebo?.Pincode,
    Landmark: selectedPhelebo?.Landmark,
    PreBookingCentreID: selectedPhelebo?.centreid,
    Panel_ID: selectedPhelebo?.centreid,
    GrossAmt: "",
    DiscAmt: "",
    DisReason: "",
    NetAmt: "",
    DiscountTypeID: "",
    AdrenalinEmpID: 0,
    MRP: 0,
    TestCode: "",
    SubCategoryID: "",
    DoctorID: "",
    DoctorName: "",
    RefDoctor: "",
    OtherDoctor: "",
    Remarks: "",
    isUrgent: false,
    // isPediatric: "",
  });

  useEffect(() => {
    if (selectedPhelebo) {
      setTestData((prev) => ({
        ...prev,
        Title: selectedPhelebo?.Title,
        Patient_ID: selectedPhelebo?.Patient_ID,
        PatientCode: selectedPhelebo?.PatientCode,
        PName: selectedPhelebo?.NAME,
        Mobile: selectedPhelebo?.Mobile,
        Email: selectedPhelebo?.Email,
        DOB: selectedPhelebo?.DOB,
        Age: selectedPhelebo?.Age,
        AgeYear: selectedPhelebo?.AgeYear,
        AgeMonth: selectedPhelebo?.AgeMonth,
        AgeDays: selectedPhelebo?.AgeDays,
        TotalAgeInDays: selectedPhelebo?.TotalAgeInDays,
        Gender: selectedPhelebo?.Gender,
        House_No: selectedPhelebo?.Address ? selectedPhelebo?.Address : "",
        LocalityID: selectedPhelebo?.LocalityID,
        Locality: selectedPhelebo?.Locality,
        CityID: selectedPhelebo?.CityID,
        City: selectedPhelebo?.City,
        StateID: selectedPhelebo?.StateID,
        State: selectedPhelebo?.State,
        Pincode: selectedPhelebo?.Pincode,
        Landmark: selectedPhelebo?.Landmark,
        PreBookingCentreID: selectedPhelebo?.centreid,
        Panel_ID: selectedPhelebo?.centreid,
      }));

      setAppointData((prev) => ({
        ...prev,
        AppDateTime: `${moment(selectedPhelebo?.AppointmentDate).format(
          "DD-MMM-YYYY",
        )} ${selectedPhelebo?.SelectedTime}`,
        SelectedTime: selectedPhelebo?.SelectedTime,
        PheleboNumber: selectedPhelebo?.PheleboNumber,
        PhlebotomistID: selectedPhelebo?.SelectedPheleboId,
        Phelebotomistname: selectedPhelebo?.PheleboName,
        emailidpcc: selectedPhelebo?.Email,
        centrename: selectedPhelebo?.DropLocationLabel,
        RouteName: selectedPhelebo?.SelectedBindRoute,
        RouteID: selectedPhelebo?.RouteId,
      }));
    }
  }, [selectedPhelebo]);

  console.log("testData,appointData", testData, selectedPhelebo);  

  const [showLog, setShowLog] = useState({ status: false, data: "" });
  const [errors, setError] = useState([]);

  const [showCoupon, setShowCoupon] = useState({
    BindTestCouponShow: false,
    ShowCouponDetail: false,
  });
  const [coupon, setCoupon] = useState({
    code: "",
    field: false,
    type: 1,
  });
  
  const getRateType = () => {
    axiosInstance
      .post("Centre/BindRateTypeWorkOrder", {
        centreID: selectedPhelebo?.DropLocationId,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
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
          value: val[0]?.value,
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
  setRateType((prev) => ({
    ...prev,
    value: value?.value,
    refRate: value?.refRate,
  }));

  setTableData([]);
};

  useEffect(() => {
    getRateType();
  }, [selectedPhelebo]);
  // const [couponData, setCouponData] = useState([
  //   {
  //     CoupanId: 167,
  //     CoupanName: "Vpn",
  //     MinBookingAmount: 100.0,
  //     DiscountAmount: 20,
  //     DiscountPercentage: 20.0,
  //     Type: 1,
  //   },
  // ]);
  const [couponDetails, setCouponDetails] = useState([]);
  const [couponData, setCouponData] = useState([]);
  // const handleCloseDOS = () => setShowDOS(false);
  const handleCloseCancel = () => setShowCancel(false);
  const handleCloseReschedule = () => setShowReschedule(false);
  const handleChange = (name,e) => {
    const {value } = e;
    if(name === "SourceofCollection"){
      setAppointData({
      ...appointData,
      [name]: value?.toString(),
    });
    }
    else{
      setAppointData({
      ...appointData,
      [name]: value,
    });
    }
    
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointData({
      ...appointData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTestChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(name);

    if (name === "Remarks" || name === "DisReason") {
      const Value = PreventSpecialCharacterandNumber(value)
        ? value
        : testData[name];

      setTestData({
        ...testData,
        [name]: Value,
      });
    } else if (name == "House_No") {
      setTestData({
        ...testData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : testData[name],
      });
    } else {
      setTestData({
        ...testData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // console.log(DocData);
  useEffect(() => {
    getDoctorSuggestion(DocData, setDoctorSuggestion, setDocData);
  }, [DocData?.DoctorName]);
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
    if (!coupon?.field) {
      setDiscountPercentage("");
      setdisAmt("");
      // setDiscount(0);
      setDiscountAmount(0);
    }
  }, [tableData.length]);

  useEffect(() => {
    // setDiscount(Number(net) - Number(disAmt));
    setDiscountAmount(disAmt);
  }, [disAmt]);

  useEffect(() => {
    if (!isNaN(net) && !isNaN(discountPercentage)) {
      const discountAmount = (discountPercentage / 100) * net;
      setDiscountAmount(discountAmount);
      // setDiscount(Number(net) - Number(discountAmount));
    }
  }, [discountPercentage]);

  useEffect(() => {
    // console.log(discountamount);

    if (discountamount == "" || discountamount == 0) {
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

  // console.log(testData?.DoctorID);
  const handleCheckBox = (index, e) => {
    const { name, checked } = e.target;

    const newData = [...tableData];

    newData[index] = {
      ...newData[index],
      [name]: checked,
    };

    setTableData(newData);
  };

  const handleSubmit = () => {
    const datas = tableData.map((ele) => {
      // Guarded division. When every selected test is Rate 0 the net is 0, so
      // discount/0 gave Infinity, then 0 * Infinity gave NaN, and that NaN was
      // written straight into the saved DiscAmt and NetAmt below - a booking
      // stored with no price at all. There is nothing to spread a discount
      // across when the net is zero, so the percentage is zero.
      const netTotal = Number(net);
      const DiscountPercentage =
        netTotal > 0 ? (Number(discountamount) / netTotal) * 100 : 0;

      // Belt and braces on the money itself: a Rate that is missing or
      // non-numeric would put NaN back into the saved amount by another route.
      const rowRate = Number(ele?.Rate);
      const rawNetAmount = rowRate - (DiscountPercentage / 100) * rowRate;
      const NetAmount = (
        Number.isFinite(rawNetAmount) ? rawNetAmount : 0
      ).toFixed(2);

      return {
        ...ele,
        DisReason: testData?.DisReason.trim(),
        DoctorID: testData?.DoctorID,
        GrossAmt: ele?.Rate,
        Remarks: testData?.Remarks.trim(),
        DoctorName: testData?.DoctorName,
        RefDoctor: testData?.DoctorName,
        TestCode: ele?.TestCode,
        House_No: testData?.House_No.trim(),
        MRP: Number(ele?.MRP),
        Rate: Number(ele?.Rate),
        DiscAmt:
          coupon?.field && coupon?.type == 2
            ? Number(ele?.DiscAmt)
            : tableData?.length > 1
              ? Number((Number(ele?.Rate) - Number(NetAmount)).toFixed(2))
              : Number(discountamount),
        NetAmt:
          coupon?.field && coupon?.type == 2
            ? Number(ele?.NetAmt)
            : tableData?.length > 1
              ? Number(NetAmount)
              : Number(net) - Number(discountamount),
        isUrgent: ele?.isUrgent ? 1 : 0,
        VIP: testData?.VIP ? 1 : 0,
        Panel_ID: Number(rateType?.value),
        ItemId: ele?.InvestigationID?.toString(),
        Patient_ID: String(ele?.Patient_ID),
        PatientCode: selectedPhelebo?.PatientCode,
        // isPediatric: testData?.isPediatric ? 1 : 0,
      };
    });
    console.log(appointData, datas);
    const generatedError = HandleHCBooking(
      appointData,
      datas[0],
      discountamount,
      coupon?.field,
    );

    if (generatedError === "") {
      setLoad(true);
      axios
        .post("/api/v1/CustomerCare/SaveHomeCollection", {
          datatosave: datas,
          ...appointData,

          CouponCode: coupon?.field ? coupon?.code : "",
          CouponId: coupon?.field ? couponData[0]?.CoupanId : "",
          IsCoupon: coupon?.field ? 1 : 0,
          HardCopyRequired: appointData.HardCopyRequired ? 1 : 0,
        })
        .then((res) => {
          setLoad(false);
          console.log(res?.data?.message);
          toast.success("Booking Successfully");
          handleAppointment();
          callhandleOnRouteValue(routeValueData);
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
      setLoad(false);
      setError(generatedError);
    }
  };

  const handleBooking = () => {
    if (tableData.length === 0) {
      toast.error("Please Select Any Test");
    }
    // else {
    //   if (
    //     disAmt > 0 ||
    //     discountPercentage > 0 ||
    //     disAmt != "" ||
    //     discountPercentage != ""
    //   ) {
    //     if (testData?.DoctorID && testData?.DisReason) {
    //       handleSubmit();
    //     } else {
    //       toast.error("Please Choose Discount Approval And Discount Reason");
    //     }
    //   }
    else {
      handleSubmit();
    }
    // }
  };

  const getSuggested = () => {
    axios
      .post("/api/v1/CustomerCare/showOldTest", {
        uhid: selectedPhelebo.Patient_ID,
        // uhid: 1516,
      })
      .then((res) => {
        const data = res?.data?.message;
        setSuggestedTest(data);
        setSuggestedTestShow(true);
      })
      .catch((err) => console.log(err));
  };

  const getLastThreeVisit = () => {
    axios
      .post("/api/v1/CustomerCare/GetLastThreeVisit", {
        uhid: selectedPhelebo.Patient_ID,
        // uhid: 1516,
      })
      .then((res) => {
        const data = res?.data?.message;
        setLastThreeVisit(data);
        setLastThreeVisitShow(true);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getSuggested();
    getLastThreeVisit();
  }, []);

  const { t } = useTranslation();
  // console.log(selectedPhelebo);
  function onValueChange(event) {
    setTestSearchType(event.target.value);
  }

  const getBindSourceCall = () => {
    axios
      .get("/api/v1/CustomerCare/bindcollsource")
      .then((res) => {
        const data = res?.data?.message;
        const SourceCall = data?.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.Source,
          };
        });
        // console.log(SourceCall);
        setBindSourceCall(SourceCall);
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };

  const handleSplit = (id, symbol) => {
    const data = id?.split(symbol);
    return data;
  };
  const getDiscountApproval = () => {
    axios
      .get("/api/v1/DiscApproval/BindDiscApproval")
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

  const handleBookingChange = (e) => {
    const { name, value } = e.target;

    if (coupon?.field) {
      toast.error("Remove Coupon First");
    } else setBookingData({ ...bookingData, [name]: value });

    // console.log(bookingData);
  };
  const SearchTest = (e) => {
    const val = e.target.value;
    // console.log(val.length);

    if (val.length >= 3) {
      axios
        .post("/api/v1/TestData/BindBillingTestData", {
            ActualRateTypeID: rateType?.value,
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

  // const handleListSearch = (data, name) => {
  //   switch (name) {
  //     case "TestName":

  //       if (data?.IsAllowHomeCollection === 0) {
  //       toast.error("This test not allowed");
  //       return;
  //     }

  //       setBookingData({
  //         ...bookingData,
  //         TestName: "",
  //         InvestigationID: data.InvestigationID,
  //       });
  //       setIndexMatch(0);
  //       setSuggestion([]);
  //       // console.log(data);
  //       getTableData(data, "Test");
  //       break;
  //     case "DoctorName":
  //       setDocData({ ...DocData, [name]: data.Name });
  //       setTestData({
  //         ...testData,
  //         [name]: data.Name,
  //         RefDoctor: data.Name,
  //         // DoctorID: data.DoctorReferalID,
  //         // ReferLabId: data.DoctorReferalID,
  //         // ReferLabName: data.Name,
  //       });
  //       setIndexMatch(0);
  //       setDoctorSuggestion([]);
  //       setDropFalse(false);
  //       break;
  //     default:
  //       break;
  //   }
  // };
  // console.log(tableData, testData);
  
  const handleListSearch = (data, name) => {
  switch (name) {
    case "TestName":
      
      if (data?.IsAllowHomeCollection === 0) {
        toast.error("This Test Is Not Available For Home Collection.");
        return;
      }

      setBookingData({
        ...bookingData,
        TestName: "",
        InvestigationID: data.InvestigationID,
      });

      setIndexMatch(0);
      setSuggestion([]);
      getTableData(data, "Test");

      break;

    case "DoctorName":
      setDocData({ ...DocData, [name]: data.Name });

      setTestData({
        ...testData,
        [name]: data.Name,
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
    console.log(data);
    const ItemIndex = tableData.findIndex(
      (e) => e.InvestigationID === data.InvestigationID,
    );
    console.log(ItemIndex);
    if (ItemIndex === -1) {
      axiosInstance
        .post("TestData/BindSingleTestData", {
          InvestigationID: data.InvestigationID,
          CentreID: data.CentreID,
          ActualRateTypeID: rateType?.value,
          CentreIdNew: selectedPhelebo?.DropLocationId,
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
            const appendedData = [
              ...tableData,
              ...newData.map((ele) => {
                return {
                  ...testData,
                  TestGender: ele?.Gender,
                  // DiscAmt: data?.Discount ? data?.Discount : "",

                  DiscAmt: data?.Discount
                    ? ((Number(ele?.Rate) * data?.Discount) / 100).toFixed(2)
                    : "",
                  DataType: ele?.DataType,
                  SubCategoryID: ele?.DepartmentID,
                  FromAge: ele?.FromAge,
                  InvestigationID: ele?.InvestigationID,
                  IsSampleRequired: ele?.IsSampleRequired,
                  Rate: ele?.Rate,
                  GrossAmt: ele?.Rate,
                  NetAmt: data?.Discount
                    ? (
                        ele?.Rate -
                        (Number(ele?.Rate) * data?.Discount) / 100
                      ).toFixed(2)
                    : Number(ele?.Rate).toFixed(2),
                  // NetAmt: ele?.Rate,
                  SampleRemarks: ele?.SampleRemarks,
                  ReportType: ele?.ReportType,
                  RequiredAttachment: ele?.RequiredAttachment,
                  SampleCode: ele?.SampleCode,
                  SampleName: ele?.SampleName,
                  SampleTypeID: ele?.SampleTypeID,
                  TestCode: ele?.TestCode,
                  ItemId: ele?.TestCode,
                  ItemName: ele?.TestName,
                  ToAge: ele?.ToAge,
                  deleiveryDate: ele?.deleiveryDate,
                  refRateValue: ele?.refRateValue,
                };
              }),
            ];
            setTableData(appendedData);

            if (key == "Coupon") {
              setCoupon({
                ...coupon,
                field: true,
                type: 2,
              });
            }
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
  console.log("Tabledata", tableData)
  // const getPheleboCharge = () => {
  //   axios
  //     .post("/api/v1/CustomerCare/getphelbotomistcharge", {
  //       PhlebotomistID: selectedPhelebo?.SelectedPheleboId,
  //       appdate: moment(selectedPhelebo.AppointmentDate).format("DD-MMM-YYYY"),
  //     })
  //     .then((res) => {
  //       const data = res?.data?.message;
  //       const Charge = data.map((ele) => {
  //         return {
  //           label: ele.chargename,
  //           value: ele.chargeamount,
  //         };
  //       });
  //       setPheleboCharge(Charge);
  //     })
  //     .catch((err) => console.log(err));
  // };
  const handleFilter = (data) => {
    if (coupon?.field) {
      toast.error(
        "You can't remove test because you have applied coupon, first remove coupon code.",
      );
    } else {
      console.log(tableData);
      const value = tableData.filter(
        (ele) => ele.InvestigationID !== data.InvestigationID,
      );
      setTableData(value);
      // console.log(value);
      toast.success("Test Successfully Removed");
    }
  };

  const getSearchRecords = () => {
    const AppDateTime = moment(selectedPhelebo?.AppointmentDate).format(
      "YYYY-MM-DD",
    );
    axios
      .post("/api/v1/CustomerCare/SearchRecords", {
        PhlebotomistID: selectedPhelebo.SelectedPheleboId,
        // AppDateTime: "2023-09-20 18:28:17",
        AppDateTime: `${AppDateTime} ${selectedPhelebo?.SelectedTime}:00`,
      })
      .then((res) => {
        const data = res?.data?.message;
        // console.log(data);
        setRecord(data);
      })
      .catch((err) => console.log(err));
  };

  const CheckAndSetPercentage = (e) => {
    const { value } = e.target;
    console.log(value);
    if (isValidPercent(value)) {
      setDiscountPercentage(value);
    }

    if (value == "") {
      setDiscountPercentage("");
    }
  };

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
  console.log(discountamount);
  const handleCouponValidate = () => {
    // if (tableData.length > 0) {
    console.log(coupon.code);
    console.log(tableData);

    // console.log(couponData);
    // console.log(couponData)

    if (disAmt || discountPercentage) {
      toast.error("First Remove Discount For Adding Coupon");
    } else {
      axios
        .post("/api/v1/CouponMaster/BindTestForAppliedCoupon", {
          CoupanCode: coupon?.code.trim(),
          CentreId: selectedPhelebo?.DropLocationId,
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
    });
    setTableData([]);
    if (coupon?.field) toast.error("Coupon Removed Successfully");
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

    // console.log(LTData?.CentreID, ele?.ItemID);
    //   const selectedTest = tableData?.filter((eles,index)=>{
    //       return eles?.TestCode==ele?.ItemID
    //   })
    // //   console.log(selectedTest)
    //   if(selectedTest.length==0){

    const data = {
      InvestigationID: ele?.TestId,
      CentreID: selectedPhelebo?.DropLocationId,
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
  const handleCouponDetailsModal = () => {
    axios
      .post("/api/v1/CouponMaster/GetCouponValidationData", {
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
  useEffect(() => {
    // setShowDOS(true);
    getBindSourceCall();
    getDiscountApproval();
    // getPheleboCharge();
    getSearchRecords();
  }, []);

  useEffect(() => {
  if (!selectedPhelebo) return;

  setAppointData({
    AppDateTime: `${moment(selectedPhelebo.AppointmentDate).format(
      "DD-MMM-YYYY"
    )} ${selectedPhelebo.SelectedTime}`,
    SelectedTime: selectedPhelebo.SelectedTime,
    updatepatient: "",
    HardCopyRequired: "",
    PheleboNumber: selectedPhelebo.PheleboNumber,
    PhlebotomistID: selectedPhelebo.SelectedPheleboId,
    atitude: "",
    Longitude: "",
    ispermanetaddress: 1,
    ReceiptRequired: 1,
    Alternatemobileno: "",
    Client: "",
    Paymentmode: "",
    SourceofCollection: "",
    Phelebotomistname: selectedPhelebo.PheleboName,
    emailidpcc: selectedPhelebo?.Email,
    centrename: selectedPhelebo?.DropLocationLabel,
    RouteName: selectedPhelebo?.SelectedBindRoute,
    RouteID: selectedPhelebo?.RouteId,
    deliverych: "",
    endtime: "",
    oldprebookingid: "",
    hcrequestid: "",
    followupcallid: "",
  });

  setTestData({
    Title: selectedPhelebo?.Title,
    Patient_ID: selectedPhelebo?.Patient_ID,
    PName: selectedPhelebo?.NAME,
    Mobile: selectedPhelebo?.Mobile,
    Email: selectedPhelebo?.Email,
    DOB: selectedPhelebo?.DOB,
    Age: selectedPhelebo?.Age,
    AgeYear: selectedPhelebo?.AgeYear,
    AgeMonth: selectedPhelebo?.AgeMonth,
    AgeDays: selectedPhelebo?.AgeDays,
    TotalAgeInDays: selectedPhelebo?.TotalAgeInDays,
    Gender: selectedPhelebo?.Gender,
    VIP: "",
    House_No: selectedPhelebo?.Address ? selectedPhelebo?.Address : "",
    LocalityID: selectedPhelebo?.LocalityID,
    Locality: selectedPhelebo?.Locality,
    CityID: selectedPhelebo?.CityID,
    City: selectedPhelebo?.City,
    StateID: selectedPhelebo?.StateID,
    State: selectedPhelebo?.State,
    Pincode: selectedPhelebo?.Pincode,
    Landmark: selectedPhelebo?.Landmark,
    PreBookingCentreID: selectedPhelebo?.centreid,
    Panel_ID: selectedPhelebo?.centreid,
    GrossAmt: "",
    DiscAmt: "",
    DisReason: "",
    NetAmt: "",
    DiscountTypeID: "",
    AdrenalinEmpID: 0,
    MRP: 0,
    TestCode: "",
    SubCategoryID: "",
    DoctorID: "",
    DoctorName: "",
    RefDoctor: "",
    OtherDoctor: "",
    Remarks: "",
    isUrgent: false,
  });

}, [selectedPhelebo]);

  console.log(showLog);
  const isMobile = window.innerWidth <= 768;
  const handlecloseLog = () => {
    setShowLog({
      status: false,
      data: "",
    });
  };
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      {showLog?.status && (
        <TestNameModal
          show={showLog?.status}
          onHandleShow={handlecloseLog}
          id={showLog?.data}
        />
      )}
      {/* {showCancel && (
        <AppointmentCancelModal
          showCancel={showCancel}
          handleCloseCancel={handleCloseCancel}
          handleAppointment={handleAppointment}
        />
      )} */}
      {/* 
      {showReschedule && (
        <AppointmentRescheduleModal
          showReschedule={showReschedule}
          handleCloseReschedule={handleCloseReschedule}
          handleAppointment={handleAppointment}
        />
      )} */}

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
      {/* {showDOS && (
        <DOSModal showDOS={showDOS} handleCloseDOS={handleCloseDOS} />
      )} */}
      {/* <Dialog
        visible={appointment}
        className={theme}
        header={t("Appointment")}
        onHide={() => {
          callhandleOnRouteValue(routeValueData);
          handleAppointment();
        }}
        style={{
          width: isMobile ? "80vw" : "75vw",
        }}
      > */}
        <div>
          <>
            <div className="row mt-3 mt-md-1">
              <div className="col-md-2">
                <Input
                  placeholder=" "
                  type="text"
                  lable="Phelebotmist Name"
                  id="Phelebotmist Name"
                  className="required-fields"
                  value={appointData?.Phelebotomistname}
                  disabled={true}
                />
              </div>
              <div className="col-md-2">
                <Input
                  placeholder=" "
                  type="text"
                  lable="Phelebotmist Number"
                  id="Phelebotmist Number"
                  className="required-fields"
                  value={appointData?.PheleboNumber}
                  disabled={true}
                />
              </div>
              <div className="col-md-2">
                <Input
                  placeholder=" "
                  type="text"
                  lable="App. Date & Time"
                  id="Appointment Date & Time"
                  className="required-fields"
                  value={appointData.AppDateTime}
                  disabled={true}
                />
              </div>
              <div className="col-md-2">
                <Input
                  lable="Doctor Name"
                  id="DoctorName"
                  placeholder=" "
                  className="required-fields"
                  max={20}
                  value={DocData?.DoctorName}
                  type="text"
                  onChange={(e) => {
                    setDocData({
                      ...DocData,
                      DoctorName: e.target.value,
                    });

                    if (e.target.value == "") {
                      setTestData({
                        ...testData,
                        DoctorName: "",
                        RefDoctor: "",
                      });
                      setDocData({
                        ...DocData,
                        DoctorName: e.target.value,
                      });
                      const data = tableData.map((ele) => {
                        return {
                          ...ele,
                          DoctorName: "",
                          RefDoctor: "",
                        };
                      });

                      setTableData(data);
                    }
                    setDropFalse(true);
                  }}
                  name="DoctorName"
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
                          RefDoctor: "",
                        });
                        setTestData({
                          ...testData,
                          DoctorName: "",
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
                {testData?.DoctorName == "" && (
                  <span className="error-message">{errors?.DoctorName}</span>
                )}
              </div>
              <div className="col-md-2">
                <Input
                  className="required-fields"
                  type="number"
                  autoComplete="off"
                  lable="Alternate Mobile No"
                  id="Alternate Mobile No"
                  max={10}
                  onChange={handleInputChange}
                  onInput={(e) => number(e, 10)}
                  value={appointData?.Alternatemobileno}
                  name="Alternatemobileno"
                  placeholder=" "
                />
                {appointData?.Alternatemobileno === "" && (
                  <span className="error-message">
                    {errors?.Alternatemobilenos}
                  </span>
                )}
                {appointData?.Alternatemobileno.length > 0 &&
                  appointData?.Alternatemobileno.length !== 10 && (
                    <span className="error-message">
                      {errors?.Alternatemobilenum}
                    </span>
                  )}
              </div>
              <div className="col-md-2">
                {/* <SelectBox
                  name="SourceofCollection"
                  lable="SourceofCollection"
                  id="SourceofCollection"
                  selectedValue={appointData?.SourceofCollection}
                  options={[
                    { label: "Source Of Collection", value: "" },
                    ...bindSourceCall,
                  ]}
                  onChange={handleChange}
                /> */}

              <ReactSelect
                dynamicOptions={[
                    { label: "Source Of Collection", value: "" },
                    ...bindSourceCall,
                  ]}
                name="SourceofCollection"
                  lable="SourceofCollection"
                  id="SourceofCollection"
                removeIsClearable={true}
                placeholderName={t("SourceofCollection")}
                value={appointData?.SourceofCollection}
                onChange={handleChange}
              />

                {appointData?.SourceofCollection === "" && (
                  <span className="error-message">
                    {errors?.SourceofCollection}
                  </span>
                )}
              </div>
            </div> 

            <div className="row mt-1">
              <div className="col-md-2">
                <Input
                  lable="Remarks"
                  id="Remarks"
                  type="text"
                  placeholder=" "
                  name="Remarks"
                  max={30}
                  onChange={handleTestChange}
                  value={testData?.Remarks}
                />
              </div>

              <div className="col-md-2">
                {/* <SelectBox
                  name="Paymentmode"
                  selectedValue={appointData?.Paymentmode}
                  lable="PaymentMode"
                  id="Paymentmode"
                  className="required-fields"
                  options={[
                    { label: "Select Payment Mode", value: "" },
                    ...HCPaymentMode,
                  ]}
                  onChange={handleChange}
                /> */}

                <ReactSelect
                dynamicOptions={[
                    { label: "Select Payment Mode", value: "" },
                    ...HCPaymentMode,
                  ]}
                name="Paymentmode"
                  lable="PaymentMode"
                  id="Paymentmode"
                  className="required-fields"
                removeIsClearable={true}
                placeholderName={t("PaymentMode")}
                value={appointData?.Paymentmode}
                onChange={handleChange}
              />

                {appointData?.Paymentmode === "" && (
                  <span className="error-message">{errors?.Paymentmode}</span>
                )}
              </div>

              <div className="col-md-2">
                <Input
                  placeholder=" "
                  type="text"
                  lable="House No"
                  id="House No"
                  className="required-fields"
                  max={30}
                  name="House_No"
                  onChange={handleTestChange}
                  value={testData?.House_No}
                />
                {testData?.House_No.trim() === "" && (
                  <span className="error-message">{errors?.House_Nos}</span>
                )}
                {testData?.House_No.trim().length > 0 &&
                  testData?.House_No.trim().length < 2 && (
                    <span className="error-message">{errors?.House_No}</span>
                  )}
              </div>
              {/* <div className="col-sm-1">
                <input
                  type="checkbox"
                  name="VIP"
                  onChange={handleTestChange}
                  checked={testData?.VIP}
                />
                <label className="control-label">&nbsp; {t("VIP")}</label>
              </div> */}
              <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                  gap: "5px"
                }}>
                  <label class="switch mb-0">
                    <input
                      type="checkbox"
                      name="VIP"
                      checked={testData?.VIP}
                      onChange={handleTestChange}
                    />
                    <span class="slider"></span>
                  </label>
                  <strong>
                    <span>{t("VIP")}</span>
                  </strong>
                </div>
              {/* <div className="col-sm-2">
                <input
                  type="checkbox"
                  name="HardCopyRequired"
                  onChange={handleInputChange}
                  checked={appointData?.HardCopyRequired}
                />
                &nbsp;&nbsp;
                <label className="control-label">
                  {t("HardCopyOfReportReq")}
                </label>
              </div> */}
              <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                  gap: "5px"
                }}>
                  <label class="switch mb-0">
                    <input
                      type="checkbox"
                      name="HardCopyRequired"
                      checked={appointData?.HardCopyRequired}
                      onChange={handleInputChange}
                    />
                    <span class="slider"></span>
                  </label>
                  <strong>
                    <span>{t("HardCopyOfReportReq")}</span>
                  </strong>
                </div>
              <div className="col-sm-3">
                <ReactSelect
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
            </div> 

            <>
              <div className="row mt-1"></div>

              <div className="row">
                <div className="col-sm-7 col-12">
                  <div className="row">
                    <div className="col-sm-7">
                      <Input
                        autoComplete="off"
                        name="TestName"
                        onInput={SearchTest}
                        placeholder=" "
                        type="text"
                        lable="Type TestCode or TestName"
                        id="Type TestCode or TestName"
                        className="required-fields"
                        onChange={handleBookingChange}
                        value={bookingData.TestName}
                        onKeyDown={handleIndex}
                        onBlur={() => {
                          autocompleteOnBlur(setSuggestion);
                          setTimeout(() => {
                            setBookingData({
                              ...bookingData,
                              TestName: "",
                            });
                          }, 500);
                        }}
                      />
                      {suggestion.length > 0 && (
                        <ul className="suggestion-data">
                          {suggestion.map((data, index) => (
                            <li
                              onClick={() => handleListSearch(data, "TestName")}
                              key={index}
                              className={`${
                                index === indexMatch && "matchIndex"
                              }`}
                            >
                              {data.TestName}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="col-sm-2" style={{ textAlign: "center" }}>
                      <CustomButton
                        text={`Count: ${tableData.length}`}
                      />
                    </div>

                    <div
                      className="col-sm-3"
                      style={{ textAlign: "center", fontWeight: "bold" }}
                    >
                      Discount Amt :&nbsp;
                      {Number(discountamount).toFixed(2)}
                    </div>
                  </div>

                  <>
                    <Tables>
                      <thead>
                        <tr>
                          <th> {t("SNo")}</th>
                          <th> {t("Code")}</th>
                          <th> {t("Item")}</th>
                          <th> {t("View")}</th>
                          {/* <th> {t("DOS")}</th> */}
                          {/* <th> {t("MRP")}</th> */}
                          <th> {t("Rate")}</th>
                          <th> {t("Disc.")}</th>
                          <th> {t("Amt.")}</th>
                          <th> {t("IsUrgent")}</th>
                        </tr>
                      </thead>

                      {/* {console.log(tableData)} */}
                      {tableData.length > 0 && (
                        <tbody>
                          {tableData.map((ele, index) => (
                            <>
                              <tr key={index}>
                                <td data-title="S.No">
                                  {index + 1}&nbsp;
                                  <button
                                    className="btn btn-danger  btn-sm"
                                    onClick={() => {
                                      handleFilter(ele);
                                    }}
                                  >
                                    X
                                  </button>
                                </td>

                                <td data-title={t("SampleCode")}>
                                  {ele.ItemId}
                                </td>
                                <td data-title={t("SampleName")}>
                                  {ele.ItemName}
                                </td>
                                <td data-title={t("View")}>
                                  {(ele?.DataType === "Test" ||
                                    ele?.DataType === "Package" ||
                                    ele?.DataType === "Profile") && (
                                    <i
                                      className="fa fa-search"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        setShowLog({
                                          status: true,
                                          data: ele?.InvestigationID,
                                        })
                                      }
                                    />
                                  )}
                                </td>
                                {/* <td
                                          data-title={t("DOS")}
                                          style={{ cursor: "pointer" }}
                                          onClick={() => setShowDOS(true)}
                                        >
                                          <i className="fa fa-search" />
                                            </td>}*/}
                                {/* <td data-title={t("MRP")}>{ele?.Discount}</td>  */}

                                <td data-title={t("Rate")}>{ele.Rate}</td>

                                <td data-title={t("Disc.")}>
                                  <input
                                    style={{
                                      width: "50px",
                                      textAlign: "end",
                                    }}
                                    type="number"
                                    disabled
                                    // name="discountamt"
                                    value={ele?.DiscAmt}
                                    min={0}
                                    // value={0}
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
                  </>
                </div>
                <div className="col-sm-5 col-12">
                  <div className="row">
                    <div className="col-md-4">
                      <Input
                        placeholder=" "
                        id="TotalAmount"
                        name="Total_Amount"
                        lable="Total Amount"
                        disabled={true}
                        value={net}
                        type="text"
                        readOnly="readonly"
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        placeholder=" "
                        id="TotalAmount"
                        lable="Amount To Pay"
                        name="Total_Amount"
                        disabled={true}
                        value={Number(net - discountamount).toFixed(2)}
                        type="text"
                        readOnly="readonly"
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        name="disAmt"
                        type="number"
                        value={disAmt}
                        onInput={(e) => number(e, 20)}
                        placeholder=" "
                        lable="Discount Amount"
                        id="DiscountA"
                        onChange={(e) => {
                          if (coupon?.field == true) {
                            toast.error("Remove Coupon First");
                          } else {
                            if (discountPercentage === "") {
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
                        name="discountPercentage"
                        type="number"
                        max={5}
                        placeholder=" "
                        lable="DiscountPercentage"
                        id="DiscountPercentage"
                        value={discountPercentage}
                        onChange={(e) => {
                          if (coupon?.field == true) {
                            toast.error("Remove Coupon First");
                          } else {
                            if (disAmt === "") {
                              // console.log(Number(e.target.value));
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
                    {/* </div>

                <div className="row p-2"> */}
                    <div className="col-md-4">
                      <SelectBox
                        name="DoctorID"
                        selectedValue={testData?.DoctorID}
                        onChange={handleTestChange}
                        lable="Discount Given By"
                        id="Discount Given By"
                        options={[
                          { label: "Select Discount By", value: "" },
                          ...discountApproval,
                        ]}
                        isDisabled={
                          tableData.length === 0 ||
                          discountamount == "" ||
                          discountamount == 0 ||
                          coupon?.field
                        }
                        className="select-input-box form-control input-sm"
                      />
                      {!coupon?.field &&
                        discountamount != "" &&
                        discountamount != 0 &&
                        testData?.DoctorID == "" && (
                          <span className="error-message">
                            {errors?.DoctorID}
                          </span>
                        )}
                    </div>
                    <div className="col-md-4">
                      <Input
                        name="DisReason"
                        max={30}
                        disabled={
                          tableData.length === 0 ||
                          discountamount == "" ||
                          discountamount == 0 ||
                          coupon?.field
                        }
                        placeholder=" "
                        lable="Discount Reason"
                        id="Discount Reason"
                        value={testData?.DisReason}
                        onChange={handleTestChange}
                      />
                      {!coupon?.field &&
                        discountamount != "" &&
                        discountamount != 0 &&
                        testData?.DisReason == "" && (
                          <span className="error-message">
                            {errors?.DisReason}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="row d-none">
                    <div className="col-sm-2 text-success input-group-text font-weight-bold">
                      {t("Coupon")} &nbsp;&nbsp;&nbsp;:
                    </div>
                    <div className="col-sm-3">
                      <Input
                        className="select-input-box form-control input-sm required"
                        type="text"
                        placeholder={"Enter Coupon Code"}
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
                    <div className="col-sm-3" style={{ textAlign: "center" }}>
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
                    <div className="col-sm-1">
                      <a
                        className="fa fa-search coloricon"
                        style={{ cursor: "pointer" }}
                        onClick={handleCouponDetailsModal}
                      ></a>
                    </div>
                  </div>
                </div>
              </div>
            </>
            
          </>

          {/* <div className="box-body"> */}
          <div
            className="row mb-1 mt-4"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div className="col-sm-2">
              {load ? (
                <Loading />
              ) : (
                // <button
                //   type="button"
                //   className="btn btn-primary btn-block btn-sm"
                //   onClick={handleBooking}
                // >
                //   {t("Book Slot")}
                // </button>
                <SaveButton
                    text={"Book Slot"}
                    onClick={handleBooking}
                    className="col-sm-12"
                />

              )}
            </div>
          </div>
          {/* </div> */}

          {/* <Modal.Body>
            {record.length > 0 && (
              <div className="box hcStatus">
                <div className="box-body">
                  <div className="row">
                    <label className="col-md-2">{t("Appointment List")} </label>
                    <div className="col-md-3">
                      <button
                        style={{
                          marginTop: "2px",
                          height: "16px",
                          backgroundColor: "#5694dc",
                        }}
                      ></button>
                      <label className="control-label">
                        &nbsp;{t("Selected Patient Pending")}
                      </label>
                    </div>
                    <div className="col-md-3 ">
                      <button
                        style={{
                          marginTop: "2px",
                          height: "16px",
                          backgroundColor: "darkgray",
                        }}
                      ></button>
                      <label className="control-label">
                        &nbsp;{t("Other Patient Pending")}
                      </label>
                    </div>
                    <div className="col-md-2">
                      <button
                        style={{
                          marginTop: "2px",
                          height: "16px",
                          backgroundColor: "lightgreen",
                        }}
                      ></button>
                      <label className="control-label">
                        &nbsp;{t("Completed")}
                      </label>
                    </div>
                    <div className="col-md-2">
                      <button
                        style={{
                          marginTop: "2px",
                          height: "16px",
                          backgroundColor: "pink",
                        }}
                      ></button>
                      <label className="control-label">
                        &nbsp;{t("Cancel")}
                      </label>
                    </div>
                  </div>
                </div>
                <div
                  className="box-body divResult table-responsive boottable"
                  id="no-more-tables"
                >
                  <div className="row">
                    <table
                      className="table table-bordered table-hover table-striped table-responsive tbRecord"
                      cellPadding="{0}"
                      cellSpacing="{0}"
                    >
                      <thead className="cf text-center" style={{ zIndex: 99 }}>
                        <tr>
                          <th className="text-center">{t("PrebookingID")}</th>
                          <th className="text-center">{t("App DateTime")}</th>
                          <th className="text-center">{t("Patient Name")}</th>
                          <th className="text-center">{t("Age/Gender	")}</th>

                          <th className="text-center">{t("Mobile")}</th>
                          <th className="text-center">{t("Address")}</th>
                          <th className="text-center">{t("Area")}</th>
                          <th className="text-center">{t("Pincode")}</th>
                          <th className="text-center">{t("Test")}</th>
                          <th className="text-center">{t("GrossAmt")}</th>
                          <th className="text-center">{t("DiscAmt")}</th>
                          <th className="text-center">{t("NetAmt")}</th>
                          {/* <th className="text-center">{t("Edit")}</th>
                          <th className="text-center">{t("RS")}</th>
                          <th className="text-center">{t("Cancel")}</th> */}
          {/* </tr> */}
          {/* </thead> */}

          {/* <tbody>
                        {record.map((ele, index) => (
                          <tr
                            key={index}
                            style={{
                              backgroundColor: ele?.rowcolor,
                              color: "black",
                            }}
                          >
                            <td
                              data-title="PrebookingID"
                              className="text-center"
                            >
                              {ele.prebookingid}&nbsp;
                            </td>
                            <td
                              data-title="AppDateTime"
                              className="text-center"
                            >
                              {ele.appdatetime}&nbsp;
                            </td>
                            <td
                              data-title="PatientName"
                              className="text-center"
                            >
                              {ele.pname}&nbsp;
                            </td>
                            <td data-title="AgeGender" className="text-center">
                              {ele.pinfo}&nbsp;
                            </td>
                            <td data-title="Mobile" className="text-center">
                              {ele.mobile}&nbsp;
                            </td>
                            <td data-title="Address" className="text-center">
                              {ele.house_no}&nbsp;
                            </td>
                            <td data-title="Area" className="text-center">
                              {ele.locality}&nbsp;
                            </td>
                            <td data-title="Pincode" className="text-center">
                              {ele.pincode}&nbsp;
                            </td>
                            <td data-title="Test" className="text-center">
                              {ele.testname}&nbsp;
                            </td>
                            <td data-title="GrossAmt" className="text-center">
                              {ele.rate}&nbsp;
                            </td>

                            <td data-title="DiscAmt" className="text-center">
                              {ele.discamt}&nbsp;
                            </td>
                            <td data-title="NetAmt" className="text-center">
                              {ele.netamt}&nbsp;
                            </td> */}
          {/* <td
                              data-title="Edit"
                              className="text-center"
                              style={{ cursor: "pointer" }}
                            >
                              ✎&nbsp;
                            </td>
                            <td
                              data-title="RS"
                              className="text-center"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setShowReschedule(true);
                              }}
                            >
                              ↺&nbsp;
                            </td>
                            <td
                              data-title="Cancel"
                              className="text-center"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setShowCancel(true);
                              }}
                            >
                              X&nbsp;
                            </td> */}
          {/* </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body> */}

          {/* <Modal.Footer>
            <div className="box-body">
              <div
                className="row"
                style={{ display: "flex", justifyContent: "space-around" }}
              >
                {lastThreeVisit.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setLastThreeVisitShow((prev) => !prev);
                    }}
                  >
                    {t("Last Three Apointment of")} {selectedPhelebo?.Phelebo}
                    {t("test case")}
                  </button>
                )}
                {suggestedTest.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSuggestedTestShow((prev) => !prev);
                    }}
                  >
                    {t("SuggestedTest")}
                  </button>
                )}
              </div>
            </div>
          </Modal.Footer> */}
        </div>
      {/* </Dialog> */}
    </>
  );
};

export default DoAppointmentModal;
