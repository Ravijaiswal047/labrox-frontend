import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getTrimmedData, isValidPercent, number } from "../../utils/helpers";
import moment from "moment";
import { CouponCheck, CouponMasterSchema } from "../../utils/Schema";
import ViewTest from "./ViewTest";
import Accordion from "@app/components/UI/Accordion";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ViewCentre from "./ViewCentre";
import ViewCoupon from "./ViewCoupon";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton"
import * as XLSX from "xlsx";

const CouponMaster = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    ZoneID: [],
    StateID: [],
    CityID: [],
    CentreId: "",
    BusinessType: [],
    centresId: [],
    CouponType: "",
    Coupontypes: [],
    CouponId: "",
    FromDate: new Date(),
    ToDate: new Date(),
    CouponCount: "",
    MinimumAmount: "0",
    Selecteddepartments: "",
    DiscShareType: "",
    DiscountAmount: "",
    DiscountPercent: "",
    inHouseDiscountAmount: "",
    inHousePer: "",
    outSourceDiscountAmount: "",
    outSourcePer: "",
    CouponCode: "",
    Items: [],
    testId: "",
    CoupanName: "",
  });
  const [showreject, setShowreject] = useState(false);
  const [showcoupon, setShowCoupon] = useState(false);
  const [showCentre, setShowCentre] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [authority, setAuthority] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Departments, setDepartMents] = useState([]);
  const [zones, setZones] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [centres, setCentres] = useState([]);
  const [types, setTypes] = useState([]);
  const [Addtype, showAddtype] = useState(false);
  const [errors, setErros] = useState({});
  const [billingType, setBillingType] = useState("Total Bill");
  const [selectedPatient, setSelectedPatient] = useState("multiple");
  const DisShareType = [
    { label: "Client Share", value: "0" },
    { label: "Lab Share", value: "1" },
    { label: "Both", value: "2" },
  ];
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

  const [tests, setTests] = useState([]);
  const [Coupons, setCoupons] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [testDetails, setTestDetails] = useState([]);
  const [testDrop, setTestDrop] = useState([]);
  const [testDiscounts, setTestDiscounts] = useState([]);
  const [id, setId] = useState("");

  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = accessRightStr
    ? accessRightStr?.split(",").filter(Boolean)
    : [];

  const handlePatientChange = (value) => {
    setFormData({ ...formData, CouponCount: "" });
    setSelectedPatient(value);
  };

  const handleSelectChange = () => { };

  const handleRadioChange = (event) => {
    setBillingType(event.target.value);
    setDiscountPercentage("");
    setFormData({ ...formData, DiscountPercent: "" });
    setTestDiscounts([]);
  };

  const fetchTests = (value) => {
    console.log(value);
    axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: value,
        TestName: "",
      })
      .then((res) => {
        const tests = res?.data?.message.map((item) => {
          return {
            label: item?.TestName,
            value: item?.InvestigationID,
            code: item?.TestCode,
            DepartmentID: item?.DepartmentID,
            Department: getDepartment(item?.DepartmentID),
          };
        });

        setTests(tests);
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
    } else if (name == "CityID") {
      const val = select.map((ele) => {
        return ele?.value;
      });

      setFormData({ ...formData, [name]: val });
      if (val.length > 0) {
        fetchcentres(val, "city");
      } else if (val.length == 0) {
        fetchcentres("", "city");
      }
      setCentres([]);
      setTypes([]);
    } else if (name == "Selecteddepartments") {
      const val = select.map((ele) => {
        return ele?.value;
      });

      setFormData({ ...formData, [name]: val });
      if (val.length > 0) {
        fetchTests(val);
      }
    } else {
      const val = select?.map((ele) => ele?.value);
      setFormData({ ...formData, [name]: val });
    }
  };
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
            value: ele.ID.split("#")[0],
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
  // const sameCouponcode = (str) => {
  //   let arr = str.split(",");
  //   console.log(arr);
  //   for (let i = 0; i < arr.length - 1; i++) {
  //     console.log(arr[i]);
  //     for (let j = i + 1; j < arr.length; j++) {
  //       console.log(arr[j]);
  //       if (arr[i].trim() == arr[j].trim()) {
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // };

  const sameCouponcode = (str) => {
    const arr = str.split(",").map(item => item.trim()).filter(item => item !== "");
    const uniqueCodes = new Set(arr);
    return uniqueCodes.size === arr.length;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    console.log(value);
    if (name == "MinimumAmount") {
      console.log(value);
      if (value.length < 11) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name == "CouponCode") {
      setFormData({
        ...formData,
        [name]: CouponCheck(value) ? value : formData[name],
      });
    } else if (name == "CouponCount") {
      if (value.length < 10) {
        if (/^\d*$/.test(value) || value === "") {
          setFormData({ ...formData, [name]: value });
        }
      }
    } else if (name == "DiscountAmount") {
      if (value.length < 6) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name == "CentreId") {
      //   if (value == "") {
      //     if(formData?.CityID.length==0)
      //     {
      //       setCentres([]);
      //     }
      //     setFormData({ ...formData, [name]: value, centresId: [] });
      //   } else {
      //     if (value == "2") {
      //       fetchcentres("", "type");
      //       setFormData({ ...formData, [name]: value, centresId: [] });
      //       setCentres([]);
      //     } else {
      //       fetchcentres(value, "type");
      //       setFormData({ ...formData, [name]: value, centresId: [] });
      //       setCentres([]);
      //     }
      //   }
      // } else {
      //   setFormData({ ...formData, [name]: value });
      // }
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


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName]

      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const codes = json
        .map(row => row[0])
        .filter(cell => cell !== undefined && cell !== null && cell !== "")
        .join(", ");

      handleChange({
        target: {
          name: "CouponCode",
          value: codes,
        },
      });
    }

    reader.readAsArrayBuffer(file);
  }
  const fetchcentres = (value) => {
    // let payload;
    // if (type == "type") {
    //   if (formData?.CityID.length > 0) {
    //     payload = {
    //       Type: value,
    //       CityId: formData?.CityID,
    //     };
    //   } else {
    //     payload = {
    //       Type: value,
    //       CityId: "",
    //     };
    //   }
    // }
    // if (type == "city") {
    //   payload = {
    //     Type: formData?.CentreId,
    //     CityId: value,
    //   };
    // }

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
  // const CheckAndSetPercentage = (e) => {
  //   const {name, value } = e.target;
  //   if (value.length <= 5) {
  //     if (value < 100) {
  //       if (isValidPercent(value)) {
  //         setDiscountPercentage(value);
  //         setFormData({ ...formData, [name]: value });
  //         let arr = [];
  //         for (let i of testDetails) {
  //           arr.push(value);
  //         }
  //         setTestDiscounts(arr);
  //       }
  //     }
  //     if (value == "") {
  //       let arr = [];
  //       for (let i of testDetails) {
  //         arr.push("");
  //       }
  //       setTestDiscounts(arr);
  //       setFormData({ ...formData, DiscountPercent: "" });
  //       setDiscountPercentage("");
  //     }
  //   }
  // };

  const CheckAndSetPercentage = (e) => {
    const { name, value } = e.target; // Get both name and value

    if (value.length <= 5) {
      if (value === "" || (parseFloat(value) < 100 && isValidPercent(value))) {

        setFormData({ ...formData, [name]: value });

        if (name === "DiscountPercent") {
          setDiscountPercentage(value);

          let arr = testDetails.map(() => (value === "" ? "" : value));
          setTestDiscounts(arr);
        }
      }
    }
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

  const saveCouponHandler = () => {
    console.log(formData?.CouponType);
    let payload = {
      CoupanType: formData?.CouponType,
    };
    if (payload?.CoupanType.trim().length > 1) {
      axiosInstance
        .post("CouponMaster/SaveCoupontype", getTrimmedData(payload))
        .then((res) => {
          if (res?.data?.message == "Save successfully") {
            toast.success("Coupon Saved Successfully");
            showAddtype(false);
            setFormData({ ...formData, CouponType: "" });
            BindCouponType(1);
          } else {
            toast.error(res?.data?.message);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could not save",
          );
        });
    } else {
      toast.error("Coupon length must have atleast 2 characters");
    }
  };
  const getCouponType = (id) => {
    const ele = formData?.Coupontypes.filter((item) => {
      return item.value == id;
    });
    console.log(ele);
    return ele[0].label;
  };
  const getpayload = () => {
    console.log(testDetails);
    console.log(testDiscounts);
    const tests = testDetails.map((item, index) => {
      return {
        FromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
        ToDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
        MinimumAmount:
          formData?.MinimumAmount != "" ? formData?.MinimumAmount : "0",
        CountApplyCoupon:
          formData?.CouponCount == "" ? "1" : formData?.CouponCount,
        DiscountPercent:
          testDiscounts[index] == undefined ? "" : testDiscounts[index],
        DiscountAmount: "0",
        BillType: billingType === "Total Bill" ? "1" : "2",
        Centers: formData?.centresId.join(","),
        SubcategoryIds: item?.DepartmentID,
        Items: item?.value,
        CoupanName: formData?.CoupanName.trim(),
        CoupanTypeId: formData?.CouponId,
        CoupanType: getCouponType(formData?.CouponId),
        CoupanCategoryId: "0",
        CoupanCategory: "Select",
        CoupanCode: getCouponCode(formData?.CouponCode),
        Issuefor: "All",
        Mobile: "",
        Uhid: "",
        ApplicableFor: "1",
        IsmultipleCouponApply: "0",
        IsMultiplePatientCoupon: selectedPatient === "multiple" ? "1" : "0",
        IsOneTimePatientCoupon: selectedPatient === "onetime" ? "1" : "0",
        DiscShareType: formData?.DiscShareType,
        approvaltypereject: "1",
      };
    });
    return tests;
  };

  const getCouponCode = (str) => {
    let arr = str.split(",");
    let arr2 = arr.map((item) => {
      return item.trim();
    });

    return arr2.join(",");
  };
  const checkCouponCodes = (str) => {
    let arr = str.split(",");
    for (let i of arr) {
      if (i.trim().length < 2) {
        return false;
      }
    }
    return true;
  };

const checkEmpty = (payload = []) => {
  for (let i of payload) {
    if (i.DiscountPercent == "" || i.DiscountPercent == "0") {
      return false;
    }
  }
  return true;
};

  const CouponSave = () => {
    const obj = {
      ...formData,
      multiple: selectedPatient,
      testwise: billingType,
    };
    const generatedError = CouponMasterSchema(obj);
    console.log(generatedError, obj);
    let payload;

    console.log("Payload", payload);

    if (generatedError === "") {
      if (billingType == "Total Bill" || billingType == "Inhouse/Outsource") {
        payload = {
          allitem: [
            {
              FromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
              ToDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
              MinimumAmount:
                formData?.MinimumAmount != "" ? formData?.MinimumAmount : "0",
              CountApplyCoupon:
                formData?.CouponCount == "" ? "1" : formData?.CouponCount,
              DiscountPercent:
                formData?.DiscountPercent != "" ? formData?.DiscountPercent : "",
              DiscountAmount:
                formData?.DiscountAmount != "" ? formData?.DiscountAmount : "",

              // --- New Fields for Inhouse/Outsource ---
              inHouseDiscountAmount: Number(formData?.inHouseDiscountAmount) || 0,
              inHousePer: Number(formData?.inHousePer) || 0,
              outSourceDiscountAmount: Number(formData?.outSourceDiscountAmount) || 0,
              outSourcePer: Number(formData?.outSourcePer) || 0,
              // ----------------------------------------

              BillType: billingType === "Total Bill" ? "1" : billingType === "Inhouse/Outsource" ? "3" : "2",
              Centers: formData?.centresId.join(","),
              SubcategoryIds: "",
              Items: "",
              CoupanName: formData?.CoupanName.trim(),
              CoupanTypeId: formData?.CouponId,
              CoupanType: getCouponType(formData?.CouponId),
              CoupanCode: getCouponCode(formData?.CouponCode),
              CoupanCategoryId: "0",
              CoupanCategory: "Select",
              Issuefor: "All",
              Mobile: "",
              Uhid: " ",
              ApplicableFor: "1",
              IsmultipleCouponApply: "0",
              IsMultiplePatientCoupon:
                selectedPatient === "multiple" ? "1" : "0",
              IsOneTimePatientCoupon: selectedPatient === "onetime" ? "1" : "0",
              DiscShareType: formData?.DiscShareType,
              approvaltypereject: "1",
            },
          ],
          FileName: "",
          FileNameType: "",
          FileNameTypeWithCoupon: " ",
        };
      } else {
        payload = {
          allitem: getpayload(),
          FileName: "",
          FileNameType: "",
          FileNameTypeWithCoupon: "",
        };
      }

      if (billingType == "Total Bill") {
        if (formData?.DiscountAmount != "" || formData?.DiscountPercent != "") {
          let check = checkCouponCodes(formData?.CouponCode);
          let checksame = sameCouponcode(formData?.CouponCode);
          if (check) {
            if (checksame) {
              setLoading(true);
              axiosInstance
                .post("CouponMaster/SaveCoupan", getTrimmedData(payload))
                .then((res) => {
                  if(res.data?.success) {
                    toast.success(res?.data?.message);
                    setLoading(false);
                    resetFormData(); // Helper to clear state
                    BindCoupons();
                  } else {
                    toast.error(res?.data?.message || "Error while saving Coupon")
                    setLoading(false);
                  }
                })
                .catch((err) => {
                  setLoading(false);
                  toast.error(err?.response?.data?.message || "Error while saving Coupon");
                });
            } else {
              toast.error("Enter different coupon codes");
              setLoading(false);
            }
          } else {
            toast.error("All coupon codes must have length of atleast of 2 characters");
            setLoading(false);
          }
        } else {
          toast.error("Enter Discount Amount or Percentage");
          setLoading(false);
        }
      }
      else if (billingType == "Inhouse/Outsource") {
        if (
          formData?.inHouseDiscountAmount != "" ||
          formData?.inHousePer != "" ||
          formData?.outSourceDiscountAmount != "" ||
          formData?.outSourcePer != ""
        ) {
          let check = checkCouponCodes(formData?.CouponCode);
          let checksame = sameCouponcode(formData?.CouponCode);
          if (check) {
            if (checksame) {
              setLoading(true);
              axiosInstance
                .post("CouponMaster/SaveCoupan", getTrimmedData(payload))
                .then((res) => {
                  if(res.data?.success) {
                    toast.success(res?.data?.message);
                    setLoading(false);
                    resetFormData(); // Helper to clear state
                    BindCoupons();
                  } else {
                    toast.error(res?.data?.message || "Error while saving Coupon")
                    setLoading(false);
                  }
                })
                .catch((err) => {
                  setLoading(false);
                  toast.error(err?.response?.data?.message || "Error while saving Coupon");
                });
            } else {
              toast.error("Enter different coupon codes");
              setLoading(false);
            }
          } else {
            toast.error("All coupon codes must have length of atleast of 2 characters");
          }
        } else {
          toast.error("Enter Inhouse or Outsource Discount details");
        }
      }
      // ----------------------------------------
      else if (billingType == "TestWise Bill") {
       const emptydisc = checkEmpty(payload.allitem);
        if (testDetails.length > 0) {
          if (emptydisc) {
            let check = checkCouponCodes(formData?.CouponCode);
            let checksame = sameCouponcode(formData?.CouponCode);
            if (check) {
              if (checksame) {
                setLoading(true);
                axiosInstance
                  .post("CouponMaster/SaveCoupan", payload)
                  .then((res) => {
                    setLoading(false);
                    toast.success(res?.data?.message);
                    resetFormData();
                    setTestDetails([]);
                    BindCoupons();
                    setDiscountPercentage("");
                    setTestDiscounts([]);
                  })
                  .catch((err) => {
                    setLoading(false);
                    toast.error(err?.response?.data?.message);
                  });
              } else {
                toast.error("Enter different coupon codes");
              }
            } else {
              toast.error("All coupon codes must have length of atleast of 2 characters");
            }
          } else {
            toast.error("Enter Discount Percentage of each Test");
          }
        } else {
          toast.error("Add aleast one Test");
        }
      }
    } else {
      setLoading(false);
      setErros(generatedError);
    }
  };

  // Created this simple helper to avoid repeating the long setFormData block
  const resetFormData = () => {
    setFormData({
      ...formData,
      ZoneID: [], StateID: [], CityID: [], CentreId: "", BusinessType: [], centresId: [],
      CouponType: "", CouponId: "", FromDate: new Date(), ToDate: new Date(),
      CouponCount: "", MinimumAmount: "0", Selecteddepartments: "", DiscShareType: "",
      DiscountAmount: "", DiscountPercent: "", CouponCode: "", Items: [],
      testId: "", CoupanName: "", inHouseDiscountAmount: "", inHousePer: "",
      outSourceDiscountAmount: "", outSourcePer: "",
    });
    setErros({});
  };

  const BindCouponType = (key) => {
    axiosInstance
      .get("CouponMaster/Bindcoupontype")
      .then((res) => {
        const Coupontypes = res?.data?.message.map((item) => {
          return {
            value: item?.ID,
            label: item?.CoupanType,
          };
        });
        if (key) {
          const val = Coupontypes[Coupontypes.length - 1].value;
          setFormData({ ...formData, Coupontypes: Coupontypes, CouponId: val });
        } else {
          setFormData({ ...formData, Coupontypes: Coupontypes });
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "No record found...",
        );
      });
  };
  const dateSelect = (date, name, value) => {
    if (name == "FromDate") {
      setFormData((formData) => ({ ...formData, [name]: date, ToDate: date }));
    } else {
      setFormData((formData) => ({ ...formData, [name]: date }));
    }
  };
  const BindDepartments = () => {
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
  const handleFilter = (ele, i) => {
    console.log(ele);
    console.log(testDetails);
    const newtests = testDetails?.filter((item) => {
      return item.value != ele?.value;
    });
    const discounts = testDiscounts?.filter((item, index) => {
      return index != i;
    });
    if (testDetails?.length == 1) {
      setDiscountPercentage("");
    }
    setTestDiscounts(discounts);
    setTestDetails(newtests);
  };
  const handleAddtest = () => {
    if (formData?.testId.length > 0) {
      console.log(testDetails);
      const testDetailsid = testDetails.map((item) => item.value);
      let flag = [];
      formData?.testId?.forEach((testId) => {
        const isTestIdAlreadyAdded = testDetails.some(
          (detail) => detail?.value === testId,
        );
        console.log(isTestIdAlreadyAdded);
        if (!isTestIdAlreadyAdded) {
          console.log(tests);
          const teststoshow = tests.filter((item) => {
            return formData?.testId.includes(item?.value);
          });
          const teststoshow2 = teststoshow.filter((item) => {
            return !testDetailsid.includes(item?.value);
          });

          setTestDetails([...testDetails, ...teststoshow2]);
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

  console.log(testDetails);

  const removeRow = (id) => {
    if (authority.includes("Edit")) {
      axiosInstance
        .post("CouponMaster/RemoveRow", {
          Id: id,
          Type: billingType == "Total Bill" ? "" : "0",
        })
        .then((res) => {
          toast.success(res?.data?.message);
          BindCoupons();
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    } else {
      toast.error("Give Edit Right to Remove");
    }
  };
  const BindCoupons = () => {
    axiosInstance
      .get("CouponMaster/BindCouponMaster")
      .then((res) => {
        console.log(res?.data?.message);
        setCoupons(res?.data?.message);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };
  const getRights = () => {
    axiosInstance
      .get("ManageApproval/GiveAppRightsToEmployee")
      .then((res) => {
        const authority = res?.data?.message.map((item) => item.AuthorityType);
        console.log('authority', authority);
        setAuthority(authority);
      })
      .catch((err) => {
        console.log(err?.response?.data?.message);
      });
  };
  console.log(authority);
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

  console.log(tests);
  console.log(testDetails);
  useEffect(() => {
    BindDepartments();
  }, []);
  useEffect(() => {
    getBusinessZones();
    BindCouponType();
    getRights();
    BindCoupons();
  }, []);

  const handlePercentchange = (e, index) => {
    const { value } = e?.target;

    if (value.length > 0 && value < 99.99) {
      if (value < 99.99) {
        if (isValidPercent(value)) {
          const updatedDiscounts = [...testDiscounts];
          updatedDiscounts[index] = value;
          setTestDiscounts(updatedDiscounts);
          setDiscountPercentage("");
        }
      }
    } else if (value > 99.99) {
      return;
    } else {
      const updatedDiscounts = [...testDiscounts];
      updatedDiscounts[index] = "";
      setTestDiscounts(updatedDiscounts);
      setDiscountPercentage("");
    }
  };
  const handleActive = (id, status) => {
    axiosInstance
      .post("CouponMaster/Updatestatus", {
        Status: status == "Active" ? "0" : "1",
        CoupanId: id,
      })
      .then((res) => {
        toast.success("Status updated successfully");
        BindCoupons();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };
  const closereject = () => {
    setShowreject(false);
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
  const closeedit = () => {
    setShowEdit(false);
  };

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
      {showCentre && (
        <ViewCentre show={showCentre} setShow={closecentre} id={id} />
      )}
      {showcoupon && (
        <ViewCoupon show={showcoupon} setShow={closecoupon} id={id} />
      )}
      {showTest && <ViewTest show={showTest} setShow={closetest} id={id} />}
      <Accordion
        name={t("Coupon Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              name="centresId"
              className="required-fields"
              lale={t("Centre")}
              onChange={handleSelectMultiChange}
              options={centres}
              value={formData?.centresId}
            />
            {formData?.centresId.length == 0 && (
              <span className="error-message">{errors?.Centre}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              name="CoupanName"
              lable={t("Coupon Name")}
              placeholder=""
              className="required-fields"
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
              lable={t("Coupon Type")}
              className="required-fields"
              selectedValue={formData?.CouponId}
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
          <div className="col-sm-1">
            {/* <button
              className="btn btn-block btn-primary btn-sm"
              onClick={() => {
                showAddtype(true);
              }}
            >
              {t("New")}
            </button> */}
            <CustomButton
              icon={"add"}
              text={"Add"}
              className="btn btn-block btn-primary btn-sm"
              onClick={() => {
                showAddtype(true);
              }}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              name={t("From Date")}
              lable="From Date"
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
        </div>

        <div className="row pt-1 pl-2 pr-2">
          <div className="col-sm-4" style={{ display: "flex" }}>
            <div className="col-sm-4 mt-1 d-flex">
              <div className="mt-1">
                <input
                  type="radio"
                  name="patient"
                  value="multiple"
                  checked={selectedPatient === "multiple"}
                  onChange={() => handlePatientChange("multiple")}
                />
              </div>
              <label className="control-label ml-2">
                {t("Multiple Patient")}
              </label>
            </div>
            <div className="col-sm-4 mt-1 d-flex">
              <div className="mt-1">
                <input
                  type="radio"
                  name="patient"
                  value="onetime"
                  checked={selectedPatient === "onetime"}
                  onChange={() => handlePatientChange("onetime")}
                />
              </div>
              <label className="control-label ml-2">
                {t("OneTime Patient")}
              </label>
            </div>
            {selectedPatient == "multiple" && (
              <div className="col-sm-4">
                <Input
                  type="text"
                  lable={t("Coupon Count")}
                  className="required-fields"
                  placeholder=""
                  onInput={(e) => number(e, 5)}
                  name="CouponCount"
                  onChange={handleChange}
                  value={formData?.CouponCount}
                />
                {selectedPatient == "multiple" &&
                  formData?.CouponCount == "" && (
                    <span className="error-message">{errors.CouponCount}</span>
                  )}
                {selectedPatient == "multiple" &&
                  !formData?.CouponCount == "" &&
                  formData?.CouponCount == 0 && (
                    <span className="error-message">
                      {errors.CouponCountzer}
                    </span>
                  )}
              </div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              type="number"
              lable={t("Min Billing Amt")}
              placeholder=""
              name="MinimumAmount"
              value={formData?.MinimumAmount}
              onInput={(e) => number(e, 10)}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              name="DiscShareType"
              className="required-fields"
              lable={t("Disc Share Type")}
              options={[
                { label: "Select Dis Type", value: "" },
                ...DisShareType,
              ]}
              selectedValue={formData?.DiscShareType}
              onChange={handleChange}
            />
            {formData?.DiscShareType == "" && (
              <span className="error-message">{errors?.DiscShareType}</span>
            )}
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="billingType"
                value="Total Bill"
                checked={billingType === "Total Bill"}
                onChange={handleRadioChange}
              />
            </div>
            <label className="control-label ml-2">{t("Total Bill")}</label>
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="billingType"
                value="TestWise Bill"
                checked={billingType === "TestWise Bill"}
                onChange={handleRadioChange}
              />
            </div>
            <label className="control-label ml-2">{t("TestWise Bill")}</label>
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="billingType"
                value="Inhouse/Outsource"
                checked={billingType === "Inhouse/Outsource"}
                onChange={handleRadioChange}
              />
            </div>
            <label className="control-label ml-2">{t("Inhouse/Outsource")}</label>
          </div>
        </div>
        <div className="row pt-1 pl-2 pr-2">
          {billingType == "TestWise Bill" && (
            <>
              <div className="col-sm-2">
                <SelectBox
                  name="Selecteddepartments"
                  lable={t("Department")}
                  placeholder=""
                  onChange={handleChange}
                  options={[
                    { label: "Select Department", value: "" },
                    ...Departments,
                  ]}
                  selectedValue={formData?.Selecteddepartments}
                />
              </div>
              <div className="col-sm-2">
                <SelectBoxWithCheckbox
                  lable={t("Test")}
                  options={testDrop}
                  id="Test"
                  name="testId"
                  onChange={handleSelectMultiChange}
                  value={formData?.testId}
                />
              </div>
              <div className="col-sm-1">
                {/* <button
                  type="button"
                  className="btn btn-block btn-primary btn-sm"
                  onClick={handleAddtest}
                >
                  {t("Add")}
                </button> */}
                <CustomButton
                  icon={"add"}
                  text={"Add"}
                  onClick={handleAddtest}
                />
              </div>
            </>
          )}
          {billingType === "Total Bill" && (
            <>
              <div className="col-sm-2">
                <Input
                  name="DiscountAmount"
                  id="DiscountAmount"
                  lable={t("Discount Amt")}
                  placeholder=" "
                  className="required-fields"
                  type="number"
                  onInput={(e) => number(e, 20)}
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
                  placeholder=""
                  type="number"
                  id="DiscountPercent"
                  className="required-fields"
                  lable={t("Discount %")}
                  name="DiscountPercent"
                  onChange={(e) => {
                    CheckAndSetPercentage(e);
                  }}
                  max={10}
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
          <>
            <div className="col-sm-2">
              <input
                type="file"
                className="form-control form-control-sm"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>
            {/* <div className="col-sm-1">
                  <CustomButton
                    icon={"add"}
                    text={"Add"}
                    onClick={handleFileUpload}
                  />
                </div> */}
          </>
          <div className="col-12 col-sm-12">
            <Input
              name="CouponCode"
              placeholder=" "
              lable={t("Coupon Code")}
              className="required-fields"
              type="text"
              max={30}
              value={formData?.CouponCode}
              onChange={handleChange}
            />
            {formData?.CouponCode == "" && (
              <span className="error-message">{errors?.CouponCode}</span>
            )}
            <a style={{ color: "red" }}>*Coupon Codes Seprated by(,)</a>
          </div>
          <div className="col-sm-3">
          </div>
        </div>
        {testDetails.length > 0 && (
          <div className="row px-2 mt-2 mb-2">
            <div className="col-12">
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
                        placeholder={"Disc % All"}
                        value={discountPercentage}
                        onChange={(e) => {
                          if (Number(e.target.value) <= 99.99) {
                            CheckAndSetPercentage(e);
                          }
                        }}
                      />
                    </th>
                    <th className="text-center">{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {testDetails.map((ele, index) => (
                    <>
                      <tr key={index}>
                        <td data-title="Test Code" className="text-center">
                          {ele?.code} &nbsp;
                        </td>
                        <td data-title="Test Name" className="text-center">
                          {ele?.label}&nbsp;
                        </td>
                        <td data-title="Department" className="text-center">
                          {getDepartment(ele?.DepartmentID)} &nbsp;
                        </td>
                        <td data-title="Disc% All" className="text-center">
                          <Input
                            className="form-control input-sm"
                            name="discount"
                            onChange={(e) => {
                              handlePercentchange(e, index);
                            }}
                            value={testDiscounts[index]}
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
        )}
        <div
          className="row"
          style={{ display: "flex", alignContent: "center" }}
        >
          <div className="col-md-1 col-sm-6 col-xs-12 ml-2 mt-2 mb-2">
            {loading ? (
              <Loading />
            ) : (
              <SaveButton
                text={"Save"}
                onClick={CouponSave}
                // disabled={!authority.includes("Maker")}
                disabled={!accessRight?.includes('28')}
              />
            )}
          </div>
        </div>
      </Accordion>

      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            <Tables>
              <thead className="cf text-center" style={{ zIndex: 99 }}>
                <tr>
                  <th className="text-center">{t("S.No")}</th>
                  <th className="text-center">{t("Coupon Name")}</th>
                  <th className="text-center">{t("Coupon Type")}</th>
                  <th className="text-center">{t("Discount Share Type")}</th>
                  <th className="text-center">{t("Valid From")}</th>
                  <th className="text-center">{t("Valid To")}</th>
                  <th className="text-center">{t("Min. Billing Amount")}</th>
                  <th className="text-center">{t("Issue For")}</th>
                  <th className="text-center">{t("Applicable")}</th>
                  <th className="text-center">{t("Discount Amt.")}</th>
                  <th className="text-center">{t("Discount(%)")}</th>
                  <th className="text-center">{t("Inhouse Discount Amt.")}</th>
                  <th className="text-center">{t("Inhouse Discount(%)")}</th>
                  <th className="text-center">{t("Outsource Discount Amt.")}</th>
                  <th className="text-center">{t("Outsource Discount(%)")}</th>
                  <th className="text-center">
                    {t("Multiple Patient Coupon")}
                  </th>
                  <th className="text-center">{t("One Time Coupon")}</th>
                  <th className="text-center">{t("TotalCoupon")}</th>
                  <th className="text-center">{t("UsedCoupon")}</th>
                  <th className="text-center">{t("Rem.Coupon")}</th>
                  <th className="text-center">{t("View Center/PUP")}</th>
                  <th className="text-center">{t("View Test")}</th>
                  <th className="text-center">{t("View Coupon")}</th>
                  <th className="text-center">{t("Status")}</th>
                  <th className="text-center">{t("Change Status")}</th>
                  <th className="text-center">{t("Remove")}</th>
                </tr>
              </thead>
              <tbody>
                {Coupons.map((ele, index) => (
                  <>
                    <tr key={ele?.CouponId}>
                      <td data-title="S.No" className="text-center">
                        {index + 1}&nbsp;
                      </td>
                      <td data-title="Coupon Name" className="text-center">
                        {ele?.CoupanName}&nbsp;
                      </td>
                      <td data-title="Coupon Type" className="text-center">
                        {ele?.CoupanType}&nbsp;
                      </td>
                      <td
                        data-title="Discount Share Type"
                        className="text-center"
                      >
                        {getData(ele?.DiscShareType)}&nbsp;
                      </td>
                      <td data-title="Valid From" className="text-center">
                        {ele?.ValidFrom}&nbsp;
                      </td>
                      <td data-title="To Date" className="text-center">
                        {ele?.ValidTo}&nbsp;
                      </td>
                      <td
                        data-title="Min. Billing Amount"
                        className="text-center"
                      >
                        {ele?.MinbookingAmount}&nbsp;
                      </td>
                      <td data-title="Issue For" className="text-center">
                        {ele?.IssueType}&nbsp;
                      </td>
                      <td data-title="Applicable" className="text-center">
                        {ele?.TYPE}&nbsp;
                      </td>
                      <td data-title="Discount Amt." className="text-center">
                        {ele?.DiscountAmount}&nbsp;
                      </td>
                      <td data-title="Discount(%)" className="text-center">
                        {ele?.DiscountPercentage}&nbsp;
                      </td>
                      <td data-title="Inhouse Discount Amt." className="text-center">
                        {ele?.inHouseDiscountAmount}&nbsp;
                      </td>
                      <td data-title="Inhouse Discount(%)" className="text-center">
                        {ele?.inHousePer}&nbsp;
                      </td>
                      <td data-title="Outsource Discount Amt." className="text-center">
                        {ele?.outSourceDiscountAmount}&nbsp;
                      </td>
                      <td data-title="Outsource Discount(%)" className="text-center">
                        {ele?.outSourcePer}&nbsp;
                      </td>
                      <td
                        data-title="Multiple Patient Coupon"
                        className="text-center"
                      >
                        {ele?.MultiplePatientCoupon}&nbsp;
                      </td>
                      <td data-title="One Time Coupon" className="text-center">
                        {ele?.OneTimePatientCoupon}&nbsp;
                      </td>
                      <td data-title="TotalCoupon" className="text-center">
                        {ele?.CountApplyCoupon}&nbsp;
                      </td>
                      <td data-title="UsedCoupon" className="text-center">
                        {ele?.TotalCountApplyCoupon}&nbsp;
                      </td>
                      <td data-title="Rem. Coupon" className="text-center">
                        {ele?.CountApplyCoupon - ele?.TotalCountApplyCoupon}
                        &nbsp;
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
                        &nbsp;
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
                        )}
                        &nbsp;
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
                        &nbsp;
                      </td>
                      <td data-title="Status" className="text-center">
                        {ele?.Isactive}&nbsp;
                      </td>
                      <td data-title="Change Status" className="text-center">
                        <button
                          type="button"
                          className=" btn btn-primary   btn-sm"
                          disabled={!authority.includes("StatusChange")}
                          onClick={() => {
                            handleActive(ele?.CoupanId, ele?.Isactive);
                          }}
                        >
                          {ele?.Isactive == "Active" ? "Deactive" : "Active"}
                        </button>
                      </td>
                      <td data-title="Remove" className="text-center">
                        {ele?.Approved == "0" && (
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#8B0000",
                              fontWeight: "bold",
                              cursor: authority.includes("Edit")
                                ? "pointer"
                                : "not-allowed",
                            }}
                            onClick={() => {
                              if (authority.includes("Edit")) {
                                removeRow(ele?.CoupanId);
                              }
                            }}
                          >
                            X
                          </span>
                        )}
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
      {Addtype && (
        <Dialog
          style={{
            width: isMobile ? "80vw" : "60vw",
          }}
          visible={Addtype}
          onHide={() => {
            showAddtype(false);
            setFormData({ ...formData, CouponType: "" });
          }}
          width="50vw"
          header={t("Add Coupon")}
          className={theme}
        >
          <div className="row">
            <div className="col-sm-8">
              <Input
                name="CouponType"
                lable={t("Coupon Type")}
                value={formData?.CouponType}
                onChange={handleChange}
                max={20}
              />
            </div>
            <div className="col-sm-2">
              <SaveButton
                text={"Save"}
                onClick={saveCouponHandler}
              />
            </div>
            <div className="col-sm-1">
              <CancelButton
                text={"Cancel"}
                nClick={() => {
                  showAddtype(false);
                  setFormData({ ...formData, CouponType: "" });
                }}
              />
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default CouponMaster;
