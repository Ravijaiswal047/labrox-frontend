import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { CouponCheck, CouponMasterSchema } from "../../utils/Schema";
import { getTrimmedData, isValidPercent, number } from "../../utils/helpers";
import moment from "moment";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Accordion from "@app/components/UI/Accordion";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";

const CouponMasterEdit = ({ show, setShow, details }) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState("multiple");
  const DisShareType = [
    { label: "Client Share", value: 0 },
    { label: "Lab Share", value: 1 },
    { label: "Both", value: 2 },
  ];
  const [testDetails, setTestDetails] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [formData, setFormData] = useState({
    ZoneID: [],
    StateID: [],
    CityID: [],
    CentreId: "",
    BusinessType: [],
    centresId: [],
    CouponCode: details?.CoupanID,
    CouponType: "",
    Coupontypes: [],
    CouponId: details?.coupantypeid,
    FromDate: new Date(details?.validfrom),
    ToDate: new Date(details?.validto),
    CouponCount: details?.CountApplyCoupon,
    MinimumAmount: details?.minbookingamount,
    Selecteddepartments: "",
    DiscShareType: details?.DiscShareType,
    DiscountAmount: details?.discountamount == 0 ? "" : details?.discountamount,
    DiscountPercent:
      details?.discountpercentage == 0 ? "" : details?.discountpercentage,
    inHouseDiscountAmount: details.inHouseDiscountAmount == 0 ? "" : details.inHouseDiscountAmount,
    inHousePer: details.inHousePer == 0 ? "" : details.inHousePer,
    outSourceDiscountAmount: details.outSourceDiscountAmount == 0 ? "" : details.outSourceDiscountAmount,
    outSourcePer: details.outSourcePer == 0 ? "" : details.outSourcePer,
    Items: [],
    testId: "",
    CoupanName: details?.CoupanName,
  });
  console.log(formData);
  const Type = [
    {
      label: "Select Type",
      value: "",
    },

    { label: "Booking", value: "Booking" },
    { label: "Processing Lab", value: "Processing Lab" },
    ,
    { label: "Both", value: "2" },
  ];
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [errors, setErros] = useState({});
  const [testDiscounts, setTestDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [testDrop, setTestDrop] = useState([]);

  const [billingType, setBillingType] = useState("Total Bill");
  const handleRadioChange = (event) => {
    console.log(event.target.value);
    setBillingType(event.target.value);
    setDiscountPercentage("");
    setFormData({ ...formData, DiscountPercent: "" });
    const tests = selectedtests.map((item) => {
      return { ...item, discper: "" };
    });
    setSelectedtests(tests);
  };
  const handleRadioChange2 = (event) => {
    setSelectedOption(event.target.value);
    setFormData({ ...formData, CouponCount: "" });
  };

  const handleSelectMultiChange = (select, name) => {
    if (name === "StateID") {
      const val = select.map((ele) => {
        return ele?.value;
      });
      console.log(val);
      setFormData({
        ...formData,
        [name]: val,
        CityID: [],
        CentreId: "",
        centresId: [],
      });
      if (val.length > 0) {
        fetchCities(val);
      }
      setCentres([]);
      setTypes([]);
      setCities([]);
    } else if (name === "ZoneID") {
      const val = select.map((ele) => {
        return ele?.value;
      });

      if (val.length > 0) {
        setFormData({ ...formData, [name]: val, StateID: [], CityID: [] });
        setStates([]);
        fetchStates(val);
      } else {
        setFormData({ ...formData, StateID: [], CityID: [] });
        setStates([]);
        setCities([]);
      }
    } else if (name == "CentreId") {
      const val = select.map((ele) => {
        return ele?.value;
      });
      if (val.length > 0) {
        getCentres(val);
      }
      setCentres([]);
      setFormData({ ...formData, [name]: val, centresId: [] });
    } else if (name == "CityID") {
      const val = select.map((ele) => {
        return ele?.value;
      });
      setCentres([]);
      setTypes([]);
      setFormData({ ...formData, [name]: val });
      if (val.length > 0) {
        fetchcentres(val, "city");
      } else if (val.length == 0) {
        fetchcentres("", "city");
      }
    } else if (name == "Selecteddepartments") {
      const val = select.map((ele) => {
        return ele?.value;
      });
      setTestDrop([]);
      setFormData({ ...formData, [name]: val, testId: [] });
      if (val.length > 0) {
        fetchTests(val);
      }
    } else {
      const val = select?.map((ele) => ele?.value);
      setFormData({ ...formData, [name]: val });
    }
  };
  const fetchcentres = (value) => {
    axiosInstance
      .post("Centre/getCentreData", {
        CentreType: value,
        CentreName: "",
        CentreCode: "",
        DataType: "Centre",
      })
      .then((res) => {
        const centres = res?.data?.message.map((item) => {
          return {
            label: item?.Centre,
            value: item?.CentreID,
          };
        });
        setCentres(centres);
      })
      .catch((err) => console.log(err));
  };

  const [Departments, setDepartMents] = useState([]);
  const [zones, setZones] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [centres, setCentres] = useState([]);
  const [selectedcentres, setSelectedcentres] = useState([]);
  const [selectedtests, setSelectedtests] = useState([]);
  const [types, setTypes] = useState([]);
  console.log(details);
  const fetchCities = (id) => {
    const postdata = {
      StateId: [Number(id)],
    };

    axiosInstance
      .post("CommonHC/GetCityData", postdata)
      .then((res) => {
        let data = res.data.message;

        let value = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.City,
          };
        });

        setCities(value);
      })
      .catch((err) => {
        toast.error("Something Went wrong");
      });
  };
  const fetchStates = (val) => {
    axiosInstance
      .post("CommonHC/GetStateData", {
        BusinessZoneID: val,
      })
      .then((res) => {
        let data = res.data.message;

        let value = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.State,
          };
        });
        console.log(val);
        setStates(value);
      })
      .catch((err) => {
        toast.error("Something went wrong");
      });
  };
  const fetchTypes = (val) => {
    axiosInstance
      .post("CouponMaster/BindTypeByCity", {
        CityId: val,
      })
      .then((res) => {
        console.log(res?.data?.message);
        const types = res?.data?.message.map((item) => {
          return {
            value: item?.CentreId,
            label: item?.CentreType,
          };
        });
        setTypes(types);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };
  const getCentres = (value) => {
    let payload = {
      CentreType: value,
      CentreName: "",
      CentreCode: "",
      DataType: "Centre",
    };
    axiosInstance
      .post("Centre/getCentreData", payload)
      .then((res) => {
        console.log(res?.data?.message);
        const newcentres = res?.data?.message.map((item) => {
          return {
            label: item?.Centre,
            value: item?.CentreID,
          };
        });
        setCentres(newcentres);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };
  const fetchTests = (value) => {
    axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: value,
        TestName: "",
      })
      .then((res) => {
        console.log(res?.data.message);
        const tests = res?.data?.message.map((item) => {
          return {
            label: item?.TestName,
            value: item?.InvestigationID,
            code: item?.testCode ? item?.TestCode : "3210",
            DepartmentID: item?.DepartmentID ? item?.DepartmentID : "1",
          };
        });
        setTests(res?.data?.message);
        setTestDrop(tests);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const handlePercentchange = (e, index) => {
    const { value } = e?.target;
    console.log(selectedtests);
    if (value > 0 && value < 99.99) {
      if (value < 99.99) {
        if (isValidPercent(value)) {
          const updatedTests = selectedtests.map((test, i) => {
            if (i === index) {
              return { ...test, discper: value };
            }
            return test;
          });
          setSelectedtests(updatedTests);
          setDiscountPercentage("");
        }
      }
    } else if (value > 99.99) {
      return;
    } else {
      const updatedTests = selectedtests.map((test, i) => {
        if (i === index) {
          return { ...test, discper: "" };
        }
        return test;
      });
      setSelectedtests(updatedTests);
      setDiscountPercentage("");
    }
  };
  const handleFilter = (ele, i) => {
    console.log(selectedtests);
    console.log(ele);
    const newtests = selectedtests?.filter((item) => {
      return item.id != ele?.id;
    });

    setSelectedtests(newtests);
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    console.log(value);
    if (name == "MinimumAmount") {
      if (value.length < 11) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name == "DiscountAmount") {
      if (value.length < 10) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name == "CouponCode") {
      setFormData({
        ...formData,
        [name]: CouponCheck(value) ? value : formData[name],
      });
    } else if (name == "CouponCount") {
      if (value.length < 6) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name == "CentreId") {
      if (value == "") {
        setCentres([]);
        setFormData({ ...formData, CentreId: "", centresId: [] });
      } else if (value == 2) {
        setCentres([]);
        setFormData({ ...formData, CentreId: value, centresId: [] });
        fetchcentres("");
      } else {
        setCentres([]);
        fetchcentres(value);
        setFormData({ ...formData, [name]: value, centresId: [] });
      }
    } else if (name == "MinimumAmount") {
      if (value == "") {
        setFormData({ ...formData, [name]: 0 });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name == "Selecteddepartments") {
      if (value == "") {
        setTestDrop([]);
        setFormData({ ...formData, Selecteddepartments: "", testId: [] });
      } else {
        setTestDrop([]);
        setFormData({ ...formData, Selecteddepartments: value, testId: [] });
        fetchTests(value);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const removeCentre = (ele) => {
    console.log(selectedcentres);
    const centres = selectedcentres.filter((item) => {
      return item.id != ele?.id;
    });
    setSelectedcentres(centres);
  };

  const BindCouponType = () => {
    axiosInstance
      .get("CouponMaster/Bindcoupontype")
      .then((res) => {
        console.log(res?.data?.message);
        const Coupontypes = res?.data?.message.map((item) => {
          return {
            value: item?.ID,
            label: item?.CoupanType,
          };
        });
        setFormData({ ...formData, Coupontypes: Coupontypes });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "No record found...",
        );
      });
  };
  const getCouponType = (id) => {
    console.log(formData?.Coupontypes);
    const ele = formData?.Coupontypes.filter((item) => {
      return item.value == id;
    });
    console.log(ele);
    return ele[0].label;
  };
  const getCouponCode = (str) => {
    let arr = str.split(",");
    let arr2 = arr.map((item) => {
      return item.trim();
    });
    return arr2.join(",");
  };
  //  const getpayload=()=>{
  //   console.log(testDetails)
  //   console.log(testDiscounts)
  //   const tests=testDetails.map((item,index)=>{
  //    return {
  //      FromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
  //          ToDate:moment(formData?.ToDate).format("YYYY-MM-DD"),
  //          MinimumAmount: formData?.MinimumAmount,
  //          CountApplyCoupon: formData?.CouponCount,
  //          DiscountPercent: testDiscounts[index]==undefined?'0':testDiscounts[index],
  //          DiscountAmount: "0",
  //           BillType: billingType === "Total Bill" ? "1" : "2",
  //          Centers: formData?.CentreId.join(","),
  //          SubcategoryIds: item?.SubcategoryId,
  //          Items: item?.ItemId,
  //          CoupanName:formData?.CoupanName,
  //          CoupanTypeId: formData?.CouponId,
  //          CoupanType:getCouponType(formData?.CouponId),
  //          CoupanCategoryId: "0",
  //          CoupanCategory: "Select",
  //          CoupanCode:getCouponCode(formData?.CouponCode),
  //          Issuefor: "All",
  //          Mobile: "",
  //          Uhid: "",
  //          ApplicableFor: "1",
  //          IsmultipleCouponApply: "0",
  //          IsMultiplePatientCoupon: selectedPatient === "multiple" ? "1" : "0",
  //         IsOneTimePatientCoupon: selectedPatient === "onetime" ? "1" : "0",
  //          DiscShareType: formData?.DiscShareType,
  //          approvaltypereject : "1"

  //    }
  //  })
  //  return tests;
  // }

  const checkEmpty = (tests) => {
    for (let i of tests) {
      if (i.discper == "") {
        return false;
      }
    }
    return true;
  };
  const getBusinessZones = () => {
    axiosInstance
      .get("LocationMaster/GetZone")
      .then((res) => {
        const regions = res.data.message.map((region) => ({
          label: region.BusinessZoneName,
          value: region.BusinessZoneID,
        }));

        setZones(regions);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const BindDepartments = () => {
    axiosInstance
      .get("CouponMaster/BindDepartment")
      .then((res) => {
        console.log(res?.data?.message);
        const Departments = res?.data?.message.map((item) => {
          return {
            value: item?.SubcategoryId,
            label: item?.NAME,
          };
        });
        setDepartMents(Departments);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const getData = (value) => {
    console.log(value);
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
  console.log(formData);

  const testChecker = () => {
    const ele = testDetails.filter((item) => {
      return item.ItemId == formData?.testId;
    });
    if (ele.length == 1) {
      toast.error("Test Already Added");
      return true;
    } else if (ele.length == 0) {
      return false;
    }
  };
  const BindCouponDetails = () => {
    // setFormData({...formData,
    //   CouponCount:details?.CountApplyCoupon,
    //   FromDate:new Date(details?.validfrom),
    //   ToDate:new Date(details?.validto),
    //   MinimumAmount:details?.minbookinamount,
    //   CouponId:details?.coupantypeid,
    //   CoupanName:details?.CoupanName,
    //   DiscountAmount:details?.discountamount,
    //   DiscountPercent:details?.discountpercentage,
    //   CoupanId:details?.coupantypeid,
    //   CouponCode:details?.CoupanId,
    //   DiscShareType:getData(details?.DiscShareType)
    // })
    setBillingType(details?.TYPE);
    details?.MultiplePatientCoupon == "Yes"
      ? setSelectedOption("multiple")
      : setSelectedOption("onetime");
    details?.OneTimePatientCoupon == "Yes"
      ? setSelectedOption("onetime")
      : setSelectedOption("multiple");
    BindCentres();
    BindTests();
    bindDepartments();
    getBusinessZones();
    BindCouponType();
  };
  console.log(selectedtests);

  const getCentresid = () => {
    console.log(selectedcentres);
    const ids = selectedcentres.map((item) => item?.id);
    return ids;
  };
  // const handleUpdate = () => {
  //   const obj = {
  //     ...formData,
  //     multiple: selectedOption,
  //     testwise: billingType,
  //   };

  //   const generatedError = CouponMasterSchema(obj);
  //   console.log(obj);
  //   delete generatedError.CouponCode;
  //   delete generatedError.Centre;
  //   console.log(generatedError);
  //   let payload;
  //   if (selectedcentres.length != 0) {
  //     if (Object.keys(generatedError).length === 0) {
  //       setLoading(true);
  //       if (billingType == "Total Bill") {
  //         payload = {
  //           CoupanName: formData?.CoupanName.trim(),
  //           coupantypeid: formData?.CouponId,
  //           coupantype: getCouponType(formData?.CouponId),
  //           coupancategory: "Select",
  //           coupancategoryid: "0",
  //           FromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
  //           ToDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
  //           MinBookingAmount:
  //             formData?.MinimumAmount != "" ? formData?.MinimumAmount : "0",
  //           ApplicableFor: "1",
  //           IsMultipleCouponApply: "0",
  //           billtype: billingType === "Total Bill" ? "1" : "2",
  //           discountamount:
  //             formData?.DiscountAmount != "" ? formData?.DiscountAmount : "0",
  //           discountpercent:
  //             formData?.DiscountPercent != "" ? formData?.DiscountPercent : "0",
  //           Issuefor: "ALL",
  //           IsMultiplePatientCoupon: selectedOption === "multiple" ? "1" : "0",
  //           IsOneTimePatientCoupon: selectedOption === "onetime" ? "1" : "0",
  //           CountApplyCoupon: formData?.CouponCount ? formData?.CouponCount : 1,
  //           CoupanId: details?.CoupanId,
  //           Center: getCentresid(),
  //           DiscShareType: formData?.DiscShareType,
  //           AllItem: [],
  //         };
  //         console.log(payload);
  //       } else {
  //         const testDATA = selectedtests.map((item) => {
  //           return {
  //             itemid: item?.id,
  //             subcategoryid: item?.department,
  //             discper: item?.discper,
  //             DiscAmount: 0,
  //           };
  //         });

  //         payload = {
  //           CoupanName: formData?.CoupanName.trim(),
  //           coupantypeid: formData?.CouponId,
  //           coupantype: getCouponType(formData?.CouponId),
  //           coupancategory: "Select",
  //           coupancategoryid: "0",
  //           FromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
  //           ToDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
  //           MinBookingAmount:
  //             formData?.MinimumAmount != "" ? formData?.MinimumAmount : "0",
  //           ApplicableFor: "1",
  //           IsMultipleCouponApply: "0",
  //           billtype: billingType === "Total Bill" ? "1" : "2",
  //           discountamount: "0",
  //           discountpercent: "0",
  //           Issuefor: "ALL",
  //           IsMultiplePatientCoupon: selectedOption === "multiple" ? "1" : "0",
  //           IsOneTimePatientCoupon: selectedOption === "onetime" ? "1" : "0",
  //           CountApplyCoupon: formData?.CouponCount
  //             ? Number(formData?.CouponCount)
  //             : "1",
  //           CoupanId: details?.CoupanId,
  //           DiscShareType: formData?.DiscShareType,
  //           Center: getCentresid(),
  //           AllItem: testDATA,
  //         };
  //       }
  //       if (billingType == "Total Bill") {
  //         if (
  //           formData?.DiscountAmount != "" ||
  //           formData?.DiscountPercent != ""
  //         ) {
  //           console.log(payload);
  //           axiosInstance
  //             .post("CouponMasterApproval/UpdateData", getTrimmedData(payload))
  //             .then((res) => {
  //               toast.success(res?.data?.message);
  //               setFormData({
  //                 ZoneID: [],
  //                 StateID: [],
  //                 CityID: [],
  //                 CentreId: "",
  //                 BusinessType: [],
  //                 centresId: [],
  //                 CouponType: "",
  //                 Coupontypes: [],
  //                 CouponId: "",
  //                 FromDate: new Date(),
  //                 ToDate: new Date(),
  //                 CouponCount: "",
  //                 MinimumAmount: "0",
  //                 Selecteddepartments: "",
  //                 DiscShareType: "",
  //                 DiscountAmount: "",
  //                 DiscountPercent: "",
  //                 CouponCode: "",
  //                 Items: [],
  //                 testId: "",
  //                 CoupanName: "",
  //               });
  //               setShow(details);
  //             })
  //             .catch((err) => {
  //               toast.error(err?.response?.data?.message);
  //             });
  //         } else {
  //           toast.error("Enter Discount Amount or Percentage");
  //         }
  //       } else if (billingType == "Test Wise") {
  //         const emptydisc = checkEmpty(selectedtests);
  //         console.log(emptydisc);
  //         if (selectedtests.length > 0) {
  //           if (emptydisc) {
  //             axiosInstance
  //               .post("CouponMasterApproval/UpdateData", payload)
  //               .then((res) => {
  //                 toast.success(res?.data?.message);
  //                 setFormData({
  //                   ZoneID: [],
  //                   StateID: [],
  //                   CityID: [],
  //                   CentreId: "",
  //                   BusinessType: [],
  //                   centresId: [],
  //                   CouponType: "",
  //                   Coupontypes: [],
  //                   CouponId: "",
  //                   FromDate: new Date(),
  //                   ToDate: new Date(),
  //                   CouponCount: "",
  //                   MinimumAmount: "0",
  //                   Selecteddepartments: "",
  //                   DiscShareType: "",
  //                   DiscountAmount: "",
  //                   DiscountPercent: "",
  //                   CouponCode: "",
  //                   Items: [],
  //                   testId: "",
  //                   CoupanName: "",
  //                 });
  //                 setShow(details);
  //               })
  //               .catch((err) => {
  //                 toast.error(err?.response?.data?.message);
  //               });
  //           } else {
  //             toast.error("Enter Discount Percentage of each Test");
  //           }
  //         } else {
  //           toast.error("Add aleast one Test");
  //         }
  //       }
  //     }
  //   } else {
  //     toast.error("Select atleast one centre");
  //   }

  //   setLoading(false);
  //   setErros(generatedError);
  // };

  const handleUpdate = () => {
      if (
      selectedOption === "multiple" &&
      Number(formData?.CouponCount) < Number(details?.CountApplyCoupon)
    ) {
      toast.error(
        `Coupon Count cannot be less than ${details?.CountApplyCoupon}`
      );
      return;
    }
    const obj = {
      ...formData,
      multiple: selectedOption,
      testwise: billingType,
    };

    const generatedError = CouponMasterSchema(obj);
    // Remove fields not required for update validation
    delete generatedError.CouponCode;
    delete generatedError.Centre;

    let payload;
    if (selectedcentres.length != 0) {
      if (Object.keys(generatedError).length === 0) {
        setLoading(true);

        // 1. Payload Generation
        if (billingType == "Total Bill" || billingType == "Inhouse/Outsource") {
          payload = {
            CoupanName: formData?.CoupanName.trim(),
            coupantypeid: formData?.CouponId,
            coupantype: getCouponType(formData?.CouponId),
            coupancategory: "Select",
            coupancategoryid: "0",
            FromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
            ToDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
            MinBookingAmount: formData?.MinimumAmount != "" ? formData?.MinimumAmount : "0",
            ApplicableFor: "1",
            IsMultipleCouponApply: "0",
            // Map BillType: Total=1, Inhouse/Outsource=3, others=2
            billtype: billingType === "Total Bill" ? "1" : billingType === "Inhouse/Outsource" ? "3" : "2",
            discountamount: String(formData?.DiscountAmount != "" ? formData?.DiscountAmount : "0"),
            discountpercent: formData?.DiscountPercent != "" ? formData?.DiscountPercent : "0",

            // --- New Fields for Inhouse/Outsource Update ---
            inHouseDiscountAmount: formData?.inHouseDiscountAmount || "0",
            inHousePer: formData?.inHousePer || "0",
            outSourceDiscountAmount: formData?.outSourceDiscountAmount || "0",
            outSourcePer: formData?.outSourcePer || "0",
            // -----------------------------------------------

            Issuefor: "ALL",
            IsMultiplePatientCoupon: selectedOption === "multiple" ? "1" : "0",
            IsOneTimePatientCoupon: selectedOption === "onetime" ? "1" : "0",
            CountApplyCoupon: formData?.CouponCount ? formData?.CouponCount : 1,
            CoupanId: details?.CoupanId,
            Center: getCentresid(),
            DiscShareType: formData?.DiscShareType,
            AllItem: [],
          };
        } else {
          const testDATA = selectedtests.map((item) => {
            return {
              itemid: String(item?.id),
              subcategoryid: String(item?.department),
              discper: String(item?.discper),
              DiscAmount: 0,
            };
          });

          payload = {
            CoupanName: formData?.CoupanName.trim(),
            coupantypeid: formData?.CouponId,
            coupantype: getCouponType(formData?.CouponId),
            coupancategory: "Select",
            coupancategoryid: "0",
            FromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
            ToDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
            MinBookingAmount: formData?.MinimumAmount != "" ? formData?.MinimumAmount : "0",
            ApplicableFor: "1",
            IsMultipleCouponApply: "0",
            billtype: "2",
            discountamount: "0",
            discountpercent: "0",
            inHouseDiscountAmount: "0",
            inHousePer:  "0",
            outSourceDiscountAmount: "0",
            outSourcePer: "0",
            Issuefor: "ALL",
            IsMultiplePatientCoupon: selectedOption === "multiple" ? "1" : "0",
            IsOneTimePatientCoupon: selectedOption === "onetime" ? "1" : "0",
            CountApplyCoupon: formData?.CouponCount ? Number(formData?.CouponCount) : "1",
            CoupanId: details?.CoupanId,
            DiscShareType: formData?.DiscShareType,
            Center: getCentresid(),
            AllItem: testDATA,
          };
        }

        // 2. Execution Logic
        const executeUpdate = (finalPayload) => {
          console.log("finalPayload", finalPayload);
          axiosInstance
            .post("CouponMasterApproval/UpdateData", getTrimmedData(finalPayload))
            .then((res) => {
              toast.success(res?.data?.message);
              resetFormAfterUpdate(); // Helper call
              setShow(details);
            })
            .catch((err) => {
              toast.error(err?.response?.data?.message);
            })
            .finally(() => setLoading(false));
        };

        if (billingType == "Total Bill") {
          if (formData?.DiscountAmount != "" || formData?.DiscountPercent != "") {
            executeUpdate(payload);
          } else {
            toast.error("Enter Discount Amount or Percentage");
            setLoading(false);
          }
        }
        // --- New Logic for Inhouse/Outsource ---
        else if (billingType == "Inhouse/Outsource") {
          if (
            formData?.inHouseDiscountAmount != "" ||
            formData?.inHousePer != "" ||
            formData?.outSourceDiscountAmount != "" ||
            formData?.outSourcePer != ""
          ) {
            executeUpdate(payload);
          } else {
            toast.error("Enter Inhouse or Outsource Discount details");
            setLoading(false);
          }
        }
        else if (billingType == "Test Wise") {
          const emptydisc = checkEmpty(selectedtests);
          if (selectedtests.length > 0) {
            if (emptydisc) {
              executeUpdate(payload);
            } else {
              toast.error("Enter Discount Percentage of each Test");
              setLoading(false);
            }
          } else {
            toast.error("Add atleast one Test");
            setLoading(false);
          }
        }
      } else {
        setErros(generatedError);
      }
    } else {
      toast.error("Select atleast one centre");
    }
  };

  // Helper to keep state clean
  const resetFormAfterUpdate = () => {
    setFormData({
      ZoneID: [], StateID: [], CityID: [], CentreId: "", BusinessType: [],
      centresId: [], CouponType: "", Coupontypes: [], CouponId: "",
      FromDate: new Date(), ToDate: new Date(), CouponCount: "",
      MinimumAmount: "0", Selecteddepartments: "", DiscShareType: "",
      DiscountAmount: "", DiscountPercent: "", CouponCode: "", Items: [],
      testId: "", CoupanName: "", inHouseDiscountAmount: "",
      inHousePer: "", outSourceDiscountAmount: "", outSourcePer: ""
    });
    setErros({});
  };

  const dateSelect = (date, name, value) => {
    if (name == "FromDate") {
      setFormData((formData) => ({ ...formData, [name]: date, ToDate: date }));
    } else {
      setFormData((formData) => ({ ...formData, [name]: date }));
    }
  };

  const BindTests = () => {
    axiosInstance
      .post("CouponMasterApproval/BindCouponDetails", {
        CoupanId: [details?.CoupanId],
      })
      .then((res) => {
        console.log(res);
        let data = res?.data?.message;
        if (data?.[0].type == 2) {
          let BindTest = data?.map((ele) => {
            return {
              Testname: ele?.TestName,
              discper: ele?.DiscPer,
              department: ele?.SubCategoryId,
              id: ele?.ItemId,
              Testcode: ele?.TestCode,
            };
          });

          setSelectedtests(BindTest);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleAddtest = () => {
    console.log(selectedtests);
    console.log(formData?.testId);
    if (formData?.testId.length > 0) {
      const testDetailsid = selectedtests.map((item) => item.id);
      let flag = [];
      formData?.testId?.forEach((testId) => {
        const isTestIdAlreadyAdded = selectedtests.some(
          (detail) => detail?.id === testId,
        );
        console.log(isTestIdAlreadyAdded);
        if (!isTestIdAlreadyAdded) {
          console.log(tests);
          const teststoshow = tests.filter((item) => {
            return formData?.testId.includes(item?.InvestigationID);
          });
          const teststoshow2 = teststoshow.filter((item) => {
            return !testDetailsid.includes(item?.InvestigationID);
          });
          console.log(teststoshow2);
          const teststoshow3 = teststoshow2.map((item) => {
            return {
              Testcode: item?.TestCode ? item?.TestCode : "",
              Testname: item?.TestName ? item?.TestName : "",
              id: item?.InvestigationID,
              department: item?.DepartmentID,
              discper: discountPercentage ? discountPercentage : "",
            };
          });
          console.log(teststoshow3);

          setSelectedtests([...selectedtests, ...teststoshow3]);
          flag.push(isTestIdAlreadyAdded);
        } else {
          flag.push(isTestIdAlreadyAdded);
        }
      });

      if (!flag.includes(false)) {
        toast.error("Test already added");
      }
    } else {
      toast.error("Select Atleast One Test");
    }
  };
  const BindCentres = () => {
    axiosInstance
      .post("CouponMasterApproval/BindCenterModal", {
        CoupanID: [details?.CoupanId],
      })
      .then((res) => {
        let data = res?.data?.message;
        console.log(data);
        let BindCentre = data?.map((ele) => {
          return {
            value: ele?.Centre,
            id: ele?.CentreId,
          };
        });
        setSelectedcentres(BindCentre);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const removeRow = (id) => { };
  console.log(formData);
  const addCentre = () => {
    if (formData?.centresId.length > 0) {
      const newIds = formData?.centresId.filter(
        (id) => !selectedcentres.some((center) => center.id === id),
      );
      console.log(newIds);
      console.log(centres);
      const newCentres = centres.filter((center) =>
        newIds.includes(center.value),
      );
      if (newCentres.length == 0) {
        toast.error("Center already added");
      } else {
        const centrestobeadded = newCentres.map((item) => {
          return {
            value: item?.label,
            id: item?.value,
          };
        });
        setSelectedcentres((prevSelectedCentres) => [
          ...prevSelectedCentres,
          ...centrestobeadded,
        ]);
      }
    } else {
      toast.error("Select Centre to Add");
    }
  };

  const bindDepartments = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        console.log(res?.data?.message);
        const Departments = res?.data?.message.map((item) => {
          return {
            value: item?.DepartmentID,
            label: item?.Department,
          };
        });
        setDepartMents(Departments);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const getDepartment = (id) => {
    console.log(Departments, id);
    const ele = Departments.filter((item) => {
      return item.value == id;
    });
    return ele[0]?.label;
  };
  console.log(discountPercentage);

  const CheckAndSetPercentage = (e) => {
    const { value } = e.target;
    console.log(value);
    if (value.length <= 5) {
      if (value < 100) {
        if (isValidPercent(value)) {
          setDiscountPercentage(value);
          setFormData({ ...formData, DiscountPercent: value });
          let arr = [];
          for (let i of testDetails) {
            arr.push(value);
          }
          const tests = selectedtests.map((item) => {
            return {
              ...item,
              discper: value,
            };
          });
          setSelectedtests(tests);
        }
      }
      if (value == "") {
        console.log(value);
        const tests = selectedtests.map((item) => {
          return {
            ...item,
            discper: "",
          };
        });
        setSelectedtests(tests);
        setFormData({ ...formData, DiscountPercent: "" });
        setDiscountPercentage("");
      }
    }
  };

  useEffect(() => {
    BindCouponDetails();
  }, []);
  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setCentres(CentreDataValue);
      })
      .catch((err) => {
        console.log(err?.response?.data?.message);
      });
  };
  useEffect(() => {
    getAccessCentres();
  }, []);

  const isMobile = window.innerWidth <= 768;

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        visible={show}
        className={theme}
        header={t("Coupon Master Edit")}
        onHide={() => {
          setShow();
        }}
        style={{
          width: isMobile ? "80vw" : "70vw",
        }}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-4">
            <SelectBoxWithCheckbox
              name="centresId"
              lable={t("Centre")}
              onChange={handleSelectMultiChange}
              options={centres}
              value={formData?.centresId}
            />
          </div>
          <div className="col-sm-2">
            <button
              type="button"
              className="btn btn-block btn-primary btn-sm"
              onClick={addCentre}
            >
              Add
            </button>
          </div>
        </div>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            <Tables>
              <thead className="cf text-center" style={{ zIndex: 99 }}>
                <tr>
                  <th className="text-center">{t("S.No")}</th>
                  <th className="text-center">
                    {t("Coupon Applicable on these Centres")}
                  </th>
                  <th className="text-center">{t("Remove")}</th>
                </tr>
              </thead>
              <tbody>
                {selectedcentres.map((ele, index) => (
                  <>
                    <tr key={index}>
                      <td data-title="S.No" className="text-center">
                        {index + 1} &nbsp;
                      </td>
                      <td
                        data-title="Coupon Applicable Centre/PUP"
                        className="text-center"
                      >
                        {ele?.value}&nbsp;
                      </td>
                      <td data-title="Remove" className="text-center">
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#8B0000",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            removeCentre(ele);
                          }}
                        >
                          X
                        </span>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              lable={t("Coupon Name")}
              placeholder=""
              name="CoupanName"
              value={formData?.CoupanName}
              onChange={handleChange}
              max={20}
            />
            {formData?.CoupanName.trim() == "" && (
              <span className="error-message">{errors?.CouponName}</span>
            )}
            {formData?.CoupanName.length > 0 &&
              formData?.CoupanName.trim().length < 3 && (
                <span className="error-message">
                  {errors?.CouponNameLength}
                </span>
              )}
          </div>
          <div className="col-sm-2">
            <SelectBox
              name="CouponId"
              selectedValue={formData?.CouponId}
              lable={t("Coupon Type")}
              options={[
                { label: "Select Type", value: "" },
                ...formData?.Coupontypes,
              ]}
              onChange={handleChange}
            />
            {formData?.CouponId == 0 && (
              <span className="error-message">{errors?.CouponId}</span>
            )}
          </div>
          <div className="col-sm-2">
            <DatePicker
              name="FromDate"
              lable={t("From Date")}
              className="custom-calendar"
              onChange={dateSelect}
              value={formData?.FromDate}
              minDate={new Date()}
            />
            {formData?.FromDate == "" && (
              <span className="error-message">{errors?.FromDate}</span>
            )}
          </div>
          <div className="col-sm-2">
            <DatePicker
              name="ToDate"
              lable={t("To Date")}
              className="custom-calendar"
              onChange={dateSelect}
              value={formData?.ToDate}
              minDate={formData?.FromDate}
            />
            {formData?.ToDate == "" && (
              <span className="error-message">{errors?.ToDate}</span>
            )}
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                id="MultiplePatient"
                name="patientType"
                value="multiple"
                checked={selectedOption === "multiple"}
                onChange={handleRadioChange2}
              />
            </div>
            <label htmlFor="MultiplePatient" className="control-label ml-2">
              {t("For Multiple Patient")}
            </label>
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                id="OneTimePatient"
                name="patientType"
                value="onetime"
                checked={selectedOption === "onetime"}
                onChange={handleRadioChange2}
              />
            </div>
            <label htmlFor="MultiplePatient" className="control-label ml-2">
              {t("For One Time Patient")}
            </label>
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2">
          {selectedOption === "multiple" && (
            <div className="col-sm-2">
              <Input
                name="CouponCount"
                lable={t("Coupon Count")}
                placeholder=""
                value={formData?.CouponCount}
                type="number"
                onInput={(e) => number(e, 10)}
                onChange={handleChange}
              />
              {selectedOption == "multiple" && formData?.CouponCount == "" && (
                <span className="error-message">{errors.CouponCount}</span>
              )}
              {selectedOption == "multiple" &&
                !formData?.CouponCount == "" &&
                formData?.CouponCount == 0 && (
                  <span className="error-message">{errors.CouponCountzer}</span>
                )}
            </div>
          )}
          <div className="col-sm-2">
            <Input
              type="number"
              lable={t("Min Bill Amt")}
              placeholder=""
              name="MinimumAmount"
              value={formData?.MinimumAmount}
              onInput={(e) => number(e, 10)}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="billingType"
                value="Total Bill"
                checked={billingType === "Total Bill"}
                onChange={handleRadioChange}
              />
            </div>
            <label htmlFor="MultiplePatient" className="control-label ml-2">
              {t("Total Bill")}
            </label>
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="billingType"
                value="Test Wise"
                checked={billingType == "Test Wise"}
                onChange={handleRadioChange}
              />
            </div>
            <label htmlFor="MultiplePatient" className="control-label ml-2">
              {t("Test Wise")}
            </label>
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="billingType"
                value="Inhouse/Outsource"
                checked={billingType == "Inhouse/Outsource"}
                onChange={handleRadioChange}
              />
            </div>
            <label htmlFor="MultiplePatient" className="control-label ml-2">
              {t("Inhouse/Outsource")}
            </label>
          </div>
          <div className="col-sm-2" style={{ display: "flex" }}>
            <SelectBox
              options={DisShareType}
              lable={t("DiscShare Type")}
              name="DiscShareType"
              onChange={handleChange}
              selectedValue={formData?.DiscShareType}
            />
            {formData?.DiscShareType == "" && (
              <span className="error-message">{errors?.DiscShareType}</span>
            )}
          </div>
          {billingType === "Test Wise" && (
            <div className="col-sm-2">
              <SelectBox
                name="Selecteddepartments"
                lable={t("Department")}
                onChange={handleChange}
                options={[
                  { label: "Select Department", value: "" },
                  ...Departments,
                ]}
                selectedValue={formData?.Selecteddepartments}
              />
            </div>
          )}
        </div>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              lable={t("Test")}
              options={testDrop}
              name="testId"
              onChange={handleSelectMultiChange}
              value={formData?.testId}
            />
          </div>
          <div className="col-sm-2">
            <button
              type="button"
              className="btn btn-block btn-primary btn-sm"
              onClick={handleAddtest}
            >
              {t("Add")}
            </button>
          </div>

          {billingType === "Total Bill" && (
            <>
              <div className="col-sm-2">
                <Input
                  name="DiscountAmount"
                  lable={t("Discount Amt")}
                  placeholder=""
                  type="number"
                  onInput={(e) => number(e, 10)}
                  onChange={handleChange}
                  value={formData?.DiscountAmount}
                  disabled={formData?.DiscountPercent != ""}
                />
                {formData?.DiscountAmount == "" && (
                  <span className="error-message">{errors.Discamount}</span>
                )}
              </div>
              <div className="col-sm-2">
                <Input
                  lable={t("Discount%")}
                  placeholder=""
                  type="number"
                  name="DiscountPercent"
                  onChange={(e) => {
                    CheckAndSetPercentage(e);
                  }}
                  max={5}
                  value={formData?.DiscountPercent}
                  disabled={formData?.DiscountAmount != ""}
                />
              </div>
            </>
          )}

          {billingType === "Inhouse/Outsource" && (
            <>
              <div className="col-sm-2">
                <Input
                  name="inHouseDiscountAmount"
                  id="inHouseDiscountAmount"
                  lable={t("Inhouse Discount Amt")}
                  placeholder=" "
                  className="required-fields"
                  type="number"
                  onInput={(e) => number(e, 20)}
                  onChange={handleChange}
                  value={formData?.inHouseDiscountAmount}
                  disabled={formData?.inHousePer != ""}
                />
                {formData?.DiscountAmount == "" && (
                  <span className="error-message">{errors.inHouseDiscountAmount}</span>
                )}
              </div>
              <div className="col-sm-2">
                <Input
                  placeholder=""
                  type="number"
                  id="inHousePer"
                  className="required-fields"
                  lable={t("Inhouse Discount %")}
                  name="inHousePer"
                  onChange={(e) => {
                    CheckAndSetPercentage(e);
                  }}
                  max={10}
                  value={formData?.inHousePer}
                  disabled={formData?.inHouseDiscountAmount != ""}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  name="outSourceDiscountAmount"
                  id="outSourceDiscountAmount"
                  lable={t("Outsource Discount Amt")}
                  placeholder=" "
                  className="required-fields"
                  type="number"
                  onInput={(e) => number(e, 20)}
                  onChange={handleChange}
                  value={formData?.outSourceDiscountAmount}
                  disabled={formData?.outSourcePer != ""}
                />
                {formData?.DiscountAmount == "" && (
                  <span className="error-message">{errors.outSourcePer}</span>
                )}
              </div>
              <div className="col-sm-2">
                <Input
                  placeholder=""
                  type="number"
                  id="outSourcePer"
                  className="required-fields"
                  lable={t("Outsource Discount %")}
                  name="outSourcePer"
                  onChange={(e) => {
                    CheckAndSetPercentage(e);
                  }}
                  max={10}
                  value={formData?.outSourcePer}
                  disabled={formData?.outSourceDiscountAmount != ""}
                />
                {formData?.DiscountAmount == "" && (
                  <span className="error-message">{errors.outSourcePer}</span>
                )}
              </div>
            </>
          )}

          <div className="col-sm-2">
            <button
              type="button"
              className="btn btn-block btn-success btn-sm"
              onClick={handleUpdate}
            >
              Update
            </button>
          </div>
        </div>
        {selectedtests.length > 0 && (
          <Accordion title={t("Search Data")} defaultValue={true}>
            <div className="row pt-2 pl-2 pr-2">
              <div className="col-sm-12">
                <Tables>
                  <thead className="cf text-center" style={{ zIndex: 99 }}>
                    <tr>
                      <th className="text-center">{t("Test Code")}</th>
                      <th className="text-center">{t("Test Name")}</th>
                      <th className="text-center">{t("Department")}</th>
                      <th className="text-center" style={{ width: "100px" }}>
                        <Input
                          type="number"
                          name="Discall"
                          className="form-control input-sm"
                          placeholder={"Disc % All"}
                          value={discountPercentage}
                          onChange={(e) => {
                            if (
                              e.target.value <= 99.99 ||
                              e.target.value == ""
                            ) {
                              CheckAndSetPercentage(e);
                            }
                          }}
                        />
                      </th>
                      <th className="text-center">{t("Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedtests.map((ele, index) => (
                      <>
                        <tr key={index}>
                          <td data-title="Test Code" className="text-center">
                            {ele?.Testcode} &nbsp;
                          </td>
                          <td data-title="Test Name" className="text-center">
                            {ele?.Testname}&nbsp;
                          </td>
                          <td data-title="Department" className="text-center">
                            {getDepartment(ele?.department)} &nbsp;
                          </td>
                          <td data-title="Disc% All" className="text-center">
                            <Input
                              className="form-control input-sm"
                              name="discount"
                              onChange={(e) => {
                                handlePercentchange(e, index);
                              }}
                              value={ele?.discper}
                            />
                          </td>
                          <td data-title="Action" className="text-center">
                            &nbsp;
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#8B0000",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                handleFilter(ele, index);
                              }}
                            >
                              X
                            </span>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
          </Accordion>
        )}
      </Dialog>
    </>
  );
};

export default CouponMasterEdit;
