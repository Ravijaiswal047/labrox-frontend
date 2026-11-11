import moment from "moment";
import { useEffect } from "react";
import { StatusCheck } from "./Constants";
import * as XLSX from "xlsx";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { toast } from "react-toastify";
export const sleep = (time) => new Promise((res) => setTimeout(res, time));

export const calculateWindowSize = (windowWidth) => {
  if (windowWidth >= 1200) {
    return "lg";
  }
  if (windowWidth >= 992) {
    return "md";
  }
  if (windowWidth >= 768) {
    return "sm";
  }
  return "xs";
};

export const setWindowClass = (classList) => {
  const window = document && document?.getElementById("root");
  if (window) {
    // @ts-ignore
    window.classList = classList;
  }
};
export const addWindowClass = (classList) => {
  const window = document && document?.getElementById("root");
  if (window) {
    // @ts-ignore
    window.classList.add(classList);
  }
};

export const removeWindowClass = (classList) => {
  const window = document && document?.getElementById("root");
  if (window) {
    // @ts-ignore
    window.classList.remove(classList);
  }
};

export const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

export const Tabfunctionality = (event) => {
  if (event.key === "Tab") {
    const currentInput = event.target;
    const inputs = Array.from(document.querySelectorAll("input[required]"));
    const currentIndex = inputs.findIndex((input) => input === currentInput);

    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % inputs.length; // Get the index of the next required input
      inputs[nextIndex].focus(); // Focus on the next required input
      event.preventDefault(); // Prevent the default tab behavior
    }
  }
};

export const TruncatedLabel = (lable, length) => {
  if (typeof lable === "string" || typeof lable === "number") {
    const labelAsString = typeof lable === "number" ? lable.toString() : lable;
    if (length === undefined) {
      return labelAsString.length > 15
        ? labelAsString.substring(0, 15) + "..."
        : labelAsString;
    } else {
      return labelAsString.length > 8
        ? labelAsString.substring(0, 8) + "..."
        : labelAsString;
    }
  }
};

export function getCookie(name) {
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)",
    ),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function useClickOutside(ref, handleClose, active) {
  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handleClose, active]);
}
export const changeDarkMode = () => {
  document.documentElement.getAttribute("data-theme") == "DarkMode"
    ? document.documentElement.removeAttribute("data-theme")
    : document.documentElement.setAttribute("data-theme", "DarkMode");
};
// export const useLocalStorage = (key, type, valueToStore) => {
//   if (type === "set") {
//     window.localStorage.setItem(key, JSON.stringify(valueToStore));
//   } else if (type === "get") {
//     return JSON.parse(getLocalStorageDecryptData(key));
//   }
// };
export const PreventNumber = (value) => {
  const reg = /^([^0-9$%]*)$/;
  if (reg.test(value)) {
    return PreventSpecialCharacter(value);
    // return true;
  } else {
    return false;
  }
};
export const number = (e, sliceValue, valueGreater) => {
  if (/[^0-9.]/.test(e.target.value)) {
    e.target.value = e.target.value.replace(/[^0-9.]/g, "");
  }
  const isNumberType = e.target.type === "number";
  const pos = isNumberType ? null : e.target.selectionStart;

  if (handleCheckDot(e)) {
    if ((e.target.value.match(/\./g) || []).length > 1) {
      e.target.value = e.target.value.replace(".", "");
      
      // Only set range if type is NOT "number"
      if (!isNumberType && pos !== null) {
        e.target.setSelectionRange(pos - 1, pos - 1);
      }
    }
    return;
  } else {
    // Handling slicing
    if (valueGreater) {
      e.target.value =
        Number(e.target.value) > valueGreater
          ? e.target.value.slice(0, e.target.value.length - 1)
          : e.target.value.slice(0, sliceValue);
    } else {
      e.target.value = e.target.value.slice(0, sliceValue);
    }

    // Only set range if type is NOT "number"
    if (!isNumberType && pos !== null) {
      e.target.setSelectionRange(pos, pos);
    }
    return;
  }
};

const handleCheckDot = (e) => {
  const data = [...e.target.value];
  return data.includes(".");
};

export const PreventSpecialCharacter = (value) => {
  const reg = /[^a-zA-Z 0-9 ]/g;
  if (!reg.test(value)) {
    return true;
  } else {
    return false;
  }
};
export const PreventSpecialCharacterAddress = (value) => {
  const reg = /[^a-zA-Z 0-9,/.&()-]/g;
  return !reg.test(value);
};
export const PreventSpecialCharacterFirstName = (value) => {
  // const reg = /[^a-zA-Z0-9. ]/g;
  // return !reg.test(value);
  return /^[a-zA-Z0-9 ()/.]*$/.test(value);
};

export const autocompleteOnBlur = (state) => {
  setTimeout(() => {
    state([]);
  }, 500);
};
export const getTrimmedData = (obj) => {
  if (obj && typeof obj === "object") {
    Object.keys(obj).map((key) => {
      if (typeof obj[key] === "object") {
        getTrimmedData(obj[key]);
      } else if (typeof obj[key] === "string") {
        obj[key] = obj[key].trim();
      }
    });
  }
  return obj;
};

export const getChangedFlagRecords = (tableData) => {
  if (!Array.isArray(tableData)) return [];
  console.log("getChangedFlagRecords");
  return tableData
    .filter((row) => row.isChanged)
    .map((row) => ({
      flagId: row.FlagID,
      flagName: row.FlagName,
      flagValue: row.FlagValue,
      PageID: row.PageID,
    }));
};

// export const normalizeFlagValues = (data = []) =>
//   data.map((item, index) => ({
//     SrNo: index + 1,
//     FlagID: item.FlagID,
//     FlagName: item.FlagName,
//     FlagValue:
//     item.FlagValue === "1" || item.FlagValue === 1 ? "1" : (item.FlagValue || ""),
//     originalFlagValue: item.FlagValue || "",
//     ControlType: item.ControlType,
//     PossibleValues: item.PossibleValues,
//     CreatedBy: item.CreatedByName || "",
//     CreatedOn: item.CreatedOn || "",
//     LastUpdatedBy: item.UpdatedByName || "",
//     LastUpdatedOn: item.UpdatedOn || "",
//     isChanged: false,
//   }));

export const normalizeFlagValues = (data = []) =>
  data.map((item, index) => {
    // Create dropdown options if PossibleValues exist
    // console.log("data",data);
    let options = [];
    if (item.ControlType === "Dropdown" && item.PossibleValues) {
      options = item.PossibleValues.split("|").map((val) => ({
        label: val,
        value: val,
      }));
    }

    const initialPages = Array.isArray(item.PageList)
      ? item.PageList.map((p) => p?.PageID)
      : [];

    return {
      SrNo: index + 1,
      FlagID: item.FlagID,
      FlagName: item.FlagName,
      // FlagValue: item.FlagValue,
      FlagValue:
        item.FlagValue === "1" || item.FlagValue === 1
          ? "1"
          : item.FlagValue || "",
      originalFlagValue: item.FlagValue || "",
      ControlType: item.ControlType,
      PossibleValues: item.PossibleValues,
      Options: options, // ✅ Added line
      CreatedBy: item.CreatedByName || "",
      CreatedOn: item.CreatedOn || item.dtEntry || "",
      LastUpdatedBy: item.UpdatedByName || "",
      LastUpdatedOn: item.UpdatedOn || item.dtUpdate || "",
      PageID: initialPages,
      isChanged: false,
    };
  });

export const handleFlagToggle = (setTableData, row, e) => {
  const isChecked = e.target.checked;
  const newValue = isChecked ? "1" : row.originalFlagValue === "0" ? "0" : "0";

  setTableData((prev) =>
    prev.map((r) =>
      r.FlagID === row.FlagID
        ? {
            ...r,
            FlagValue: newValue,
            isChanged: true,
            originalFlagValue: r.originalFlagValue ?? r.FlagValue,
          }
        : r,
    ),
  );
};

export const AddBlankData = (state, name) => {
  return [{ label: name, value: "" }, ...state];
};

export const AllDataDropDownPayload = (data, state, key) => {
  if (data) {
    return [parseInt(data)];
  } else {
    const val = state?.map((ele) => ele[key]);
    return val;
  }
};

export const isChecked = (name, state, value, id) => {
  if (id) {
    const data = state?.map((ele) => {
      if (ele?.TestID === id) {
        return ele[name] === value ? true : false;
      } else {
        return ele;
      }
    });
    return data;
  } else {
    const data = state?.map((ele) => {
      return ele[name] == value ? true : false;
    });
    return data;
  }
};
export const dateConfig = (date, withTime) => {
  const format = withTime === 0 ? "DD-MMM-YYYY" : "DD-MMM-YYYY hh:mm a";
  const formatted = moment(date && date).format(format);
  return formatted === "Invalid date" ? "-" : formatted;
};

export const Time = (date) => {
  console.log("date:::", date);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const selectedValueCheck = (selectedState, state) => {
  console.log("selectedState, state", selectedState, state);
  const data = selectedState.find((ele) => ele.value == state);
  return data === undefined ? { label: "", value: "" } : data;
};
export const DyanmicStatusResponse = (state) => {
  console.log("state", state);
  let status = -1;
  if (!state || state.length === 0) return "No Data Found";

  for (let i = 0; i < state?.length; i++) {
    if (state[i].isChecked == 1 || state[i].IsChecked === 1 || state[i].isChecked === true || state[i].IsChecked === true) {
      console.log("entered");
      status = state[i].Status;
      break;
    }
  }
  return StatusCheck[status] || "No Test Selected";
};

export const shouldIncludeAIIMSID = () => {
  const IsPoct = useLocalStorage("userData", "get")?.IsPoct;
  return IsPoct == 1 ? true : false;
};
export const DyanmicStatusResponseCulture = (state) => {
  console.log("ResultTestData::::>>", state);
  console.log(state);
  let status = -1;
  for (let i = 0; i < state?.length; i++) {
    if (state[i].IsChecked == 1) {
      status = state[i].Status;
      break;
    }
  }
  console.log(status);
  console.log("StatusCheck11", StatusCheck);
  return StatusCheck[status];
};
export const AllowCharactersNumbersAndSpecialChars = (value) => {
  const reg = /[^a-zA-Z0-9\-\/ ]|(\s{2,})|(\/{2,})|(-{2,})/g;
  return !reg.test(value);
};
export const IndexHandle = (currentPage, pageSize) => {
  return (currentPage - 1) * pageSize;
};

export const ExportToExcel = (data, fileName = "data.xlsx") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};

export const downloadExcelBlob = (blob, name) => {
  const url = window.URL.createObjectURL(
    new Blob([blob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${name}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const openPdfBlob = (blob, openInNewWindow = false) => {
  const url = window.URL.createObjectURL(
    new Blob([blob], { type: "application/pdf" })
  );
  if (openInNewWindow) {
    window.open(
      url,
      "_blank",
      "width=800,height=800,toolbar=0,location=0,menubar=0"
    );
  } else {
    window.open(url, "_blank");
  }
}

// export const formatCurrency = (amount) => {
//   const DefaultCurrencyName = useLocalStorage("userData", "get")?.DefaultCurrencyName;

//   if (DefaultCurrencyName !== "KES") {
//     return amount;
//   }

//   if (amount === null || amount === undefined || amount === "") {
//     return amount;
//   }

//   const normalizedAmount = String(amount).replace(/[,\s]/g, "");
//   const numericAmount = Number(normalizedAmount);

//   if (!Number.isFinite(numericAmount)) {
//     return amount;
//   }

//   const decimalLength = normalizedAmount.includes(".")
//     ? normalizedAmount.split(".")[1].length
//     : 0;

//   return new Intl.NumberFormat("en-US", {
//     minimumFractionDigits: decimalLength,
//     maximumFractionDigits: decimalLength,
//   }).format(numericAmount);
// };

export const isCheckedNew = (name, state, value, id, secondName) => {
  const data = state?.map((ele) => {
    if (ele[secondName] === id) {
      return ele[name] === value ? true : false;
    } else {
      return ele;
    }
  });
  return data;
};

export const getBase64 = (file) => {
  return new Promise((resolve) => {
    let baseURL = "";
    // Make new FileReader
    let reader = new FileReader();

    // Convert the file to base64 text
    reader.readAsDataURL(file);

    // on reader load somthing...
    reader.onload = () => {
      // Make a fileInfo Object
      baseURL = reader.result;
      resolve(baseURL);
    };
  });
};

export const formatStandardDate = (
  dateInput = new Date(),
  formatType = "DD-MM-YYYY",
) => {
  const date = new Date(dateInput);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return formatType === "YYYY-MM-DD"
    ? `${yyyy}-${mm}-${dd}`
    : `${dd}-${mm}-${yyyy}`;
};

export function formatDate(dateString) {
  const date = new Date(dateString);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

export const SRAFormatDate = (date) => {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options).replace(",", "");
};

export const isValidPercent = (value) => {
  return /^\d+(\.\d{0,2})?$/.test(value);
};
export const AllowedSpecialChar = (val, allowedSpecialCharacters) => {
  const isValid =
    val === "" ||
    [...val].every(
      (char) =>
        /[a-zA-Z0-9]/.test(char) || allowedSpecialCharacters.includes(char),
    );
  if (isValid) {
    return val;
  } else {
    return;
  }
};
export const PreventSpecialCharacterandNumber = (value) => {
  const reg = /[^a-zA-Z ]/g;
  if (!reg.test(value)) {
    return true;
  } else {
    return false;
  }
};
export const PreventCharacter = (value) => {
  const reg = /[^0-9]/g;
  if (!reg.test(value)) {
    return true;
  } else {
    return false;
  }
};

export const HandleHCEditBooking = (appointData, coupon) => {
  let err = "";
  if (!appointData.AlternateMobileNo) {
    err = { ...err, Alternatemobilenos: "This Field is Required" };
  }
  if (appointData?.AlternateMobileNo.length !== 10) {
    err = { ...err, Alternatemobilenum: "Please enter valid number" };
  }
  if (appointData?.PaymentMode == "") {
    err = { ...err, Paymentmode: "Select Payment Mode" };
  }
  if (appointData?.RefDoctor == "") {
    err = { ...err, RefDoc: "Select Refer Doctor" };
  }
  if (appointData?.SourceofCollection == "") {
    err = { ...err, Source: "Select Source of Collection" };
  }
  if (
    !coupon &&
    (appointData?.DisAmt != "" || appointData?.DiscountPercentage != "")
  ) {
    if (appointData?.DisReason == "") {
      err = { ...err, DisReason: "Enter Discount Reason" };
    }
    if (appointData?.DoctorId == "") {
      err = { ...err, DoctorId: "Select Discount Given By" };
    }
  }

  return err;
};

export const commonDataState = (data) => {
  return data?.map((ele) => ele?.value);
};
export function removeSpecialCharacters(str) {
  return str.replace(/[^a-zA-Z0-9\s]/g, "");
}
export function convertValuesToString(arr) {
  return arr.map((obj) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      newObj[key] = obj[key]?.toString();
    });
    return newObj;
  });
}

export function onlyNumbers(s) {
  return /^\d+$/.test(s);
}
export function CheckDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
    ? 1
    : 0;
}
export function downloadPdf(blobData) {
  console.log(blobData);
  const blob = new Blob([blobData], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `LabReport_${new Date().getTime()}.pdf`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default async function downloadPdfFromUrl(pdfUrl) {
  if (!pdfUrl) return;

  // Encode spaces and special characters in the URL
  const encodedUrl = encodeURI(pdfUrl);

  // Create a temporary invisible link
  const link = document.createElement("a");
  link.href = encodedUrl;
  link.download = `LabReport_${new Date().getTime()}.pdf`;
  // link.target = "_blank"; // optional — allows mobile browsers to handle it better

  // Add link to DOM, click, then clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const parseRemarks = (remarksList) => {
  try {
    return JSON.parse(remarksList || "[]");
  } catch {
    return [];
  }
};

// export const convertAgeToDays = (value, type, age) => {
//   if (!value || value === '') return 0;
//   const numValue = parseFloat(value);

//   const currentDate = new Date();
//   let targetDate = new Date();

//   if (age === 'FromAge') {
//     switch(type) {
//       case 'Days':
//         targetDate.setDate(currentDate.getDate() - numValue);
//         break;
//       case 'Months':
//         targetDate.setMonth(currentDate.getMonth() - numValue);
//         break;
//       case 'Years':
//         targetDate.setFullYear(currentDate.getFullYear() - numValue);
//         break;
//       default:
//         targetDate.setDate(currentDate.getDate() - numValue);
//     }
//   } else if (age === 'ToAge') {
//     switch(type) {
//       case 'Days':
//         targetDate.setDate(currentDate.getDate() + numValue);
//         break;
//       case 'Months':
//         targetDate.setMonth(currentDate.getMonth() + numValue);
//         break;
//       case 'Years':
//         targetDate.setFullYear(currentDate.getFullYear() + numValue);
//         break;
//       default:
//         targetDate.setDate(currentDate.getDate() + numValue);
//     }
//   }
//   const diffInMs = Math.abs(targetDate - currentDate);
//   const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

//   console.log(`🔄 convertAgeToDays - Input: ${value} ${type}, Age: ${age}, Result: ${diffInDays} days`);

//   return diffInDays;
// };

export const convertAgeToDays = (value, type, age) => {
  if (!value || value === "") return 0;
  const numValue = parseFloat(value);

  let days = 0;

  switch (type) {
    case "Days":
      days = numValue;
      break;
    case "Months":
      days = numValue * 30;
      break;
    case "Years":
      days = numValue * 365;
      break;
    default:
      days = numValue;
  }

  return days;
};

export const validateRequiredFields = (payload, requiredFields) => {
  const errors = {};

  // requiredFields.forEach((field) => {
  //   if (
  //     !payload[field] ||
  //     (typeof payload[field] === "string" && payload[field].trim() === "")
  //   ) {
  //     errors[field] = "This Field is Required";
  //   }
  // });

  requiredFields.forEach((field) => {
    const value = payload[field];

    // ❌ null or undefined
    if (value === null || value === undefined) {
      errors[field] = "This field is required";
      return;
    }

    // ❌ empty string
    if (typeof value === "string" && value.trim() === "") {
      errors[field] = "This field is required";
      return;
    }

    // ❌ empty array
    if (Array.isArray(value) && value.length === 0) {
      errors[field] = "This field is required";
      return;
    }
  });

  if (!payload?.qc === 1 || !payload?.eqas === 1) {
    console.log("payload?.qc", !payload?.qc);
    errors.qcEqas = "At least one of QC or EQAS must be selected";
  }

  if (
    !payload?.rca === 1 ||
    !payload?.correctiveAction === 1 ||
    !payload?.preventiveAction === 1
  ) {
    errors.actions = "At least one action must be selected";
  }

  if (payload?.AnswerType && payload?.AnswerType === "0") {
    errors.AnswerType = "Answer Type must be selected";
  }

  return errors;
};

export const parseBackendDate = (dateStr) => {
  const [datePart, timePart, meridian] = dateStr.split(" ");

  const [day, monthStr, year] = datePart.split("-");
  const monthMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  let [hours, minutes] = timePart?.split(":")?.map(Number);

  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  return new Date(
    Number(year),
    monthMap[monthStr],
    Number(day),
    hours,
    minutes,
    0,
  );
};

export const getComparableValue = (rawValue) => {
  if (rawValue === null || rawValue === undefined) return null;

  const valueStr = rawValue.toString().trim();
  if (valueStr === "") return null;

  const OFFSET = 0.01;

  // IMPORTANT: check < and > BEFORE parseFloat
  if (valueStr[0] === "<") {
    const num = parseFloat(valueStr.substring(1));
    return isNaN(num) ? null : num - OFFSET;
  }

  if (valueStr[0] === ">") {
    const num = parseFloat(valueStr.substring(1));
    return isNaN(num) ? null : num + OFFSET;
  }

  const num = parseFloat(valueStr);
  return isNaN(num) ? null : num;
};

export const getRangeClass = (rawValue, min, max) => {
  const value = getComparableValue(rawValue);
  console.log("finalvalue", value, typeof min);

  if (value === null || isNaN(min) || isNaN(max) || (min === 0 && max === 0)) {
    return "";
  }

  if (value > max) return "high";
  if (value < min) return "low";
  return "";
};

export const getMaxToDate = (getDate= new Date(), maxRange= 30) => {
    if (!getDate) return new Date();

    const date = new Date(getDate);
    date.setDate(date.getDate() + maxRange);

    return date > new Date() ? new Date() : date;
  };

export const statusOptions = [
  // {label: "Open", value: 1},
  { label: "Convert", value: 2 },
  { label: "Dead", value: 3 },
  { label: "Cancel", value: 4 },
];

export const statusConfig = {
    Open: { id: 1, bg: "#fff7b2", text: "#b59c00" },
    Convert: { id: 2, bg: "#d6f1f1", text: "#d3539e" },  
    Dead: { id: 3, bg: "#f08080", text: "#800000" },  
    Cancelled: { id: 4, bg: "#add8e6", text: "#004080" },
    
  };

export const exportToExcel = (data, fileName) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const maxWidths = data.reduce((colWidths, row) => {
    Object.keys(row).forEach((key, index) => {
      const value = row[key]?.toString() || "";
      colWidths[index] = Math.max(colWidths[index] || 0, value.length);
    });
    return colWidths;
  }, []);
  ws["!cols"] = maxWidths.map((width) => ({ wch: width + 2 }));
  ws["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: maxWidths.length - 1, r: data.length },
    }),
  };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const parseAwsKeys = (keys) => {
  if (!keys) {
    toast.error("No attachment found for this record");
    return null;
  }

  let parsedKeys = [];

  try {
    parsedKeys = typeof keys === "string" ? JSON.parse(keys) : keys;
  } catch (err) {
    if (typeof keys === "string" && keys.trim() !== "") {
      parsedKeys = keys.includes(",")
        ? keys.split(",").map((k) => k.trim())
        : [keys.trim()];
    } else {
      parsedKeys = [];
    }
  }

  if (!parsedKeys || parsedKeys.length === 0) {
    toast.error("No attachment found for this record");
    return null;
  }

  return parsedKeys;
};

export const toNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};
export const formatCurrency = (amount) => {
  const DefaultCurrencyName = useLocalStorage("userData", "get")?.DefaultCurrencyName;

  if (DefaultCurrencyName !== "KES") {
    return amount;
  }

  if (amount === null || amount === undefined || amount === "") {
    return amount;
  }

  const normalizedAmount = String(amount).replace(/[,\s]/g, "");
  const numericAmount = Number(normalizedAmount);

  if (!Number.isFinite(numericAmount)) {
    return amount;
  }

  const decimalLength = normalizedAmount.includes(".")
    ? normalizedAmount.split(".")[1].length
    : 0;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalLength,
    maximumFractionDigits: decimalLength,
  }).format(numericAmount);
};

export const getSubString = (value, maxlength) => {
  if (value?.length > maxlength) {
    return value?.substring(0, maxlength) + "...";
  } else {
    return value
  }
};