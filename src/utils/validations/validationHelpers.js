/**
 * Helper functions for various validations
 */

/**
 * Validate mobile number
 */
export const validateMobileDigits = (mobile) => {
  const value = String(mobile ?? "");
  if (!value) {
    return { isValid: true, message: "" };
  }
  if (/\D/.test(value)) {
    return {
      isValid: false,
      message: "Mobile number must contain only digits",
    };
  }
  return { isValid: true, message: "" };
};

export const PHONE_MAX_LENGTH = 10;
export const PHONE_MAX_LENGTH_KES = 14;

export const getPhoneMaxLength = (currency) =>
  String(currency || "").toUpperCase() === "KES"
    ? PHONE_MAX_LENGTH_KES
    : PHONE_MAX_LENGTH;

export const validatePhone = (phone, maxLength = PHONE_MAX_LENGTH) => {
  const value = String(phone ?? "");
  if (!value) {
    return { isValid: true, message: "" };
  }
  if (/\D/.test(value)) {
    return { isValid: false, message: "Phone must contain only digits" };
  }
  if (value.length > maxLength) {
    return {
      isValid: false,
      message: `Phone cannot exceed ${maxLength} digits`,
    };
  }
  return { isValid: true, message: "" };
};

export const TRF_NO_MAX_LENGTH = 30;

export const validateTrfNo = (trfNo) => {
  const value = String(trfNo ?? "");
  if (!value) {
    return { isValid: true, message: "" };
  }
  if (/[^a-zA-Z0-9 ]/.test(value)) {
    return {
      isValid: false,
      message: "TRF No cannot contain special characters",
    };
  }
  if (value.length > TRF_NO_MAX_LENGTH) {
    return {
      isValid: false,
      message: `TRF No cannot exceed ${TRF_NO_MAX_LENGTH} characters`,
    };
  }
  return { isValid: true, message: "" };
};

export const validateMobile = (mobile, isRequired = false) => {
  if (isRequired && !mobile) {
    return { isValid: false, message: "Mobile number is required." };
  }

  const digitCheck = validateMobileDigits(mobile);
  if (!digitCheck.isValid) {
    return digitCheck;
  }
  
  if (mobile && mobile.length !== 10) {
    return { isValid: false, message: "Mobile number must be 10 digits." };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validate barcode based on logic
 */
export const validateBarcode = (barcodeNo, barcodeLogic, maxLength) => {
  if (barcodeLogic === 3 && !barcodeNo) {
    return { isValid: false, message: "Barcode is required." };
  }
  
  if (barcodeNo && barcodeNo.length < maxLength) {
    return { isValid: false, message: `Barcode must be ${maxLength} digits.` };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validate age fields
 */
export const AGE_YEAR_MAX = 120;
export const AGE_MONTH_MAX = 12;
export const AGE_DAY_MAX = 31;

const isEmptyAgeValue = (value) =>
  value === "" || value === null || value === undefined;

export const validateAgeComponent = (name, value) => {
  if (isEmptyAgeValue(value)) {
    return { isValid: true, message: "" };
  }

  const num = Number(value);
  if (!Number.isFinite(num)) {
    return { isValid: false, message: "Please enter a valid number" };
  }

  if (name === "AgeYear" && (num < 0 || num > AGE_YEAR_MAX)) {
    return {
      isValid: false,
      message: `Years must be between 0 and ${AGE_YEAR_MAX}`,
    };
  }

  if (name === "AgeMonth" && (num < 0 || num > AGE_MONTH_MAX)) {
    return {
      isValid: false,
      message: `Months must be between 0 and ${AGE_MONTH_MAX}`,
    };
  }

  if (name === "AgeDays" && (num < 0 || num > AGE_DAY_MAX)) {
    return {
      isValid: false,
      message: `Days must be between 0 and ${AGE_DAY_MAX}`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate age fields
 */
export const validateAge = (ageYear, ageMonth, ageDays) => {
  if (!ageYear && !ageMonth && !ageDays) {
    return { isValid: false, message: "Age is required." };
  }

  const yearCheck = validateAgeComponent("AgeYear", ageYear);
  if (!yearCheck.isValid) return yearCheck;

  const monthCheck = validateAgeComponent("AgeMonth", ageMonth);
  if (!monthCheck.isValid) return monthCheck;

  const dayCheck = validateAgeComponent("AgeDays", ageDays);
  if (!dayCheck.isValid) return dayCheck;

  return { isValid: true, message: "" };
};

export const WEIGHT_MAX_KG = 999;

export const validateWeight = (value) => {
  const typed = String(value ?? "").trim();
  if (!typed) {
    return { isValid: true, message: "" };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(typed)) {
    return { isValid: false, message: "Weight must be a valid number" };
  }
  const num = Number(typed);
  if (!Number.isFinite(num) || num < 0 || num > WEIGHT_MAX_KG) {
    return {
      isValid: false,
      message: `Weight cannot exceed ${WEIGHT_MAX_KG} kg`,
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Validate email format
 * EPD-061/062/063/064: reject missing @, missing domain, spaces, and multiple @.
 */
export const validateEmail = (email) => {
  if (email === undefined || email === null || String(email).trim() === "") {
    return { isValid: true, message: "" };
  }

  const value = String(email).trim();
  const atCount = (value.match(/@/g) || []).length;
  if (atCount !== 1 || /\s/.test(value)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // local@domain.tld — rejects "shivam@", "shivam.kumar.example.com", etc.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate required fields
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName} is required.` };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validate field based on API configuration
 * @param {Object} fieldConfig - Field configuration from API
 * @param {any} value - Field value
 * @returns {Object} Validation result
 */
export const validateFieldByConfig = (fieldConfig, value) => {
  if (!fieldConfig) {
    return { isValid: true, message: "" };
  }
  
  const { isMandatory, label, name } = fieldConfig;
  const fieldName = label || name;
  
  if (isMandatory && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: false, message: `${fieldName} is required.` };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validate name fields (minimum 3 characters)
 */
export const validateName = (name, fieldName, minLength = 3) => {
  if (!name || name.trim().length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters.` };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validate pincode
 */
export const validatePincode = (pincode) => {
  if (pincode === undefined || pincode === null || String(pincode).trim() === "") {
    return { isValid: true, message: "" };
  }

  const value = String(pincode).trim();
  if (!/^\d{6}$/.test(value)) {
    return { isValid: false, message: "Pincode must be 6 digits." };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate payment amount
 */
export const validatePaymentAmount = (amount, isRequired = false) => {
  if (isRequired && (!amount || amount <= 0)) {
    return { isValid: false, message: "Payment amount is required." };
  }
  
  if (amount && amount < 0) {
    return { isValid: false, message: "Payment amount cannot be negative." };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Validate discount values
 */
export const validateDiscount = (discountAmount, discountPercentage, totalAmount) => {
  if (discountAmount !== "" && discountAmount != null && Number(discountAmount) < 0) {
    return { isValid: false, message: "Discount cannot be negative" };
  }

  if (discountAmount && discountAmount > totalAmount) {
    return { isValid: false, message: "Discount amount cannot exceed total amount." };
  }
  
  if (discountPercentage && (discountPercentage < 0 || discountPercentage > 100)) {
    return { isValid: false, message: "Discount percentage must be between 0 and 100." };
  }
  
  return { isValid: true, message: "" };
};

export const validateRowDiscount = (discountValue, rate) => {
  if (discountValue === "" || discountValue === null || discountValue === undefined) {
    return { isValid: true, message: "" };
  }

  const numericDiscount = Number(discountValue);
  if (Number.isNaN(numericDiscount) || numericDiscount < 0) {
    return { isValid: false, message: "Discount cannot be negative" };
  }

  if (numericDiscount > Number(rate)) {
    return { isValid: false, message: "Please Give Valid Discount" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate test selection
 */
export const validateTestSelection = (tests) => {
  if (!tests || tests.length === 0) {
    return { isValid: false, message: "Please select at least one test." };
  }
  
  return { isValid: true, message: "" };
};

export const sanitizeCountryName = (value) =>
  String(value ?? "").replace(/[^\p{L}\s'-]/gu, "");

export const isValidCountryNameInput = (value) => {
  const typed = String(value ?? "").trim();
  if (!typed) return true;
  return /^[\p{L}\s'-]+$/u.test(typed);
};

export const validateCountryName = (value) => {
  if (!String(value ?? "").trim()) {
    return { isValid: true, message: "" };
  }
  if (!isValidCountryNameInput(value)) {
    return {
      isValid: false,
      message: "Country cannot contain numbers or special characters",
    };
  }
  return { isValid: true, message: "" };
};

export const parseTypedDate = (value) => {
  if (!value && value !== 0) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  const numeric = text.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    const year = Number(numeric[3]);
    const date = new Date(year, month, day, 12, 0, 0, 0);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  const named = text.match(
    /^(\d{1,2})[/\-. ]([A-Za-z]{3,9})[/\-. ](\d{2}|\d{4})$/,
  );
  if (named) {
    const months = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      sept: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };
    const day = Number(named[1]);
    const month = months[named[2].toLowerCase()];
    let year = Number(named[3]);
    if (named[3].length === 2) {
      year += year >= 70 ? 1900 : 2000;
    }
    if (month !== undefined) {
      const date = new Date(year, month, day, 12, 0, 0, 0);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
    }
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const validateFromToDateRange = (fromValue, toValue) => {
  const fromDate = parseTypedDate(fromValue);
  const toDate = parseTypedDate(toValue);
  if (!fromDate || !toDate) {
    return { isValid: true, message: "" };
  }

  const fromDay = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
  );
  const toDay = new Date(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate(),
  );
  if (fromDay > toDay) {
    return {
      isValid: false,
      message: "From Date cannot be later than To Date",
    };
  }

  return { isValid: true, message: "" };
};

export const validateDob = (value) => {
  if (!value && value !== 0) {
    return { isValid: true, message: "" };
  }

  if (typeof value === "string" && !value.trim()) {
    return { isValid: true, message: "" };
  }

  const dob = parseTypedDate(value);
  if (!dob) {
    return { isValid: false, message: "Please enter a valid date of birth" };
  }

  const dobDay = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (dobDay > todayDay) {
    return {
      isValid: false,
      message: "Date of birth cannot be a future date",
    };
  }

  return { isValid: true, message: "" };
};

export const calculateAgeFromDob = (value) => {
  const dob = parseTypedDate(value);
  if (!dob) {
    return { years: "", months: "", days: "" };
  }

  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dobDay = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
  if (dobDay > todayDay) {
    return { years: "", months: "", days: "" };
  }

  let years = todayDay.getFullYear() - dobDay.getFullYear();
  let months = todayDay.getMonth() - dobDay.getMonth();
  let days = todayDay.getDate() - dobDay.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(
      todayDay.getFullYear(),
      todayDay.getMonth(),
      0,
    ).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0 && months === 0 && days === 0) {
    days = 1;
  }

  return { years, months, days };
};

const AADHAAR_REGEX = /^[2-9][0-9]{11}$/;

export const isAadhaarIdType = (proofType) =>
  /aadhaar|aadhar/i.test(String(proofType || ""));

export const sanitizeAadhaarInput = (value) =>
  String(value ?? "").replace(/\D/g, "").slice(0, 12);

export const validateAadhaarNumber = (proofNumber) => {
  const value = String(proofNumber || "").trim();
  if (!value) {
    return { isValid: true, message: "" };
  }
  if (/\D/.test(value)) {
    return { isValid: false, message: "Aadhaar must contain only digits" };
  }
  if (value.length !== 12) {
    return { isValid: false, message: "Aadhaar must be exactly 12 digits" };
  }
  if (!AADHAAR_REGEX.test(value)) {
    return {
      isValid: false,
      message: "Please enter a valid 12-digit Aadhaar number",
    };
  }
  return { isValid: true, message: "" };
};

// Five letters, four digits, a letter - e.g. ABCDE1234F.
const PAN_REGEX = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/;

export const isPanIdType = (proofType) =>
  /\bpan\b|pan\s*card/i.test(String(proofType || ""));

export const validatePanNumber = (proofNumber) => {
  const value = String(proofNumber || "").trim();
  if (!value) {
    // Matches validateAadhaarNumber: an empty value is handled by the caller,
    // which decides whether the field was required in the first place.
    return { isValid: true, message: "" };
  }
  if (value.length !== 10) {
    return { isValid: false, message: "PAN must be exactly 10 characters" };
  }
  if (!PAN_REGEX.test(value)) {
    return {
      isValid: false,
      message: "Please enter a valid PAN, e.g. ABCDE1234F",
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Validate identity proof
 */
export const validateIdentityProof = (proofType, proofNumber) => {
  if (isAadhaarIdType(proofType)) {
    if (proofType && !String(proofNumber || "").trim()) {
      return { isValid: false, message: "Please enter valid identity proof number." };
    }
    return validateAadhaarNumber(proofNumber);
  }

  // PAN has a fixed shape and only Aadhaar was ever checked against one. Anything
  // of five characters or more passed as a PAN, so "ABCD@1234F" was accepted as
  // readily as a real one. Same treatment as Aadhaar above, so the two identity
  // types are enforced the same way rather than one being a special case.
  if (isPanIdType(proofType)) {
    if (proofType && !String(proofNumber || "").trim()) {
      return { isValid: false, message: "Please enter valid identity proof number." };
    }
    return validatePanNumber(proofNumber);
  }

  if (proofType && (!proofNumber || proofNumber.length < 5)) {
    return { isValid: false, message: "Please enter valid identity proof number." };
  }

  return { isValid: true, message: "" };
};

export const ADDRESS_MAX_LENGTH = 50;

export const validateAddress = (address) => {
  const value = String(address || "");
  if (value.length > ADDRESS_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Address cannot exceed ${ADDRESS_MAX_LENGTH} characters`,
    };
  }
  return { isValid: true, message: "" };
};

export const LAST_NAME_MAX_LENGTH = 50;
export const FIRST_NAME_MAX_LENGTH = 35;

export const sanitizeLastNameInput = (value) => String(value ?? "").trim();

export const validateFirstName = (firstName) => {
  const value = String(firstName ?? "");
  if (value.length > FIRST_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `First Name cannot exceed ${FIRST_NAME_MAX_LENGTH} characters`,
    };
  }
  return { isValid: true, message: "" };
};

export const validateLastName = (lastName) => {
  const value = sanitizeLastNameInput(lastName);
  if (value.length > LAST_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Last Name cannot exceed ${LAST_NAME_MAX_LENGTH} characters`,
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Dynamic field validation based on API configuration
 * @param {Array} fieldConfigs - Array of field configurations from API
 * @param {Object} formData - Current form data
 * @returns {Object} Validation result
 */
export const validateDynamicFields = (fieldConfigs, formData) => {
  const errors = [];
  
  if (!Array.isArray(fieldConfigs)) {
    return { isValid: true, errors: [] };
  }
  
  fieldConfigs.forEach(field => {
    const { id, name, label, isMandatory } = field;
    const fieldValue = formData[id] || formData[name];
    
    if (isMandatory && (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === ''))) {
      errors.push({
        field: id || name,
        message: `${label || name} is required.`,
        type: "error"
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Get field configuration by ID
 * @param {Array} fieldConfigs - Array of field configurations
 * @param {string} fieldId - Field ID to search for
 * @returns {Object|null} Field configuration or null
 */
export const getFieldConfig = (fieldConfigs, fieldId) => {
  if (!Array.isArray(fieldConfigs)) return null;
  return fieldConfigs.find(field => field.id === fieldId || field.name === fieldId) || null;
};

/**
 * Check if field is mandatory based on API configuration
 * @param {Array} fieldConfigs - Array of field configurations
 * @param {string} fieldId - Field ID to check
 * @returns {boolean} True if field is mandatory
 */
export const isFieldMandatory = (fieldConfigs, fieldId) => {
  const config = getFieldConfig(fieldConfigs, fieldId);
  return config ? config.isMandatory : false;
};