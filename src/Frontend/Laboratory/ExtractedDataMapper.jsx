/**
 * Utility to map extracted form data to PatientRegistration form fields
 * Handles the new LDPL Diagnostics form format
 */

import moment from "moment";

const cleanValue = (val) => {
  if (val === undefined || val === null) return "";
  const str = String(val).trim();
  
  // If it's just a common prefix or placeholder, treat as empty
  const placeholders = ["LDPL", "LDPL-", "N/A", "NONE", "NIL", "NULL", "-", ".", "_", "/"];
  if (placeholders.includes(str.toUpperCase())) return "";
  
  // If it's just special characters
  if (str.length > 0 && /^[^a-zA-Z0-9]+$/.test(str)) return "";
  
  return str;
};

const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const parseFullName = (fullName = "") => {
  if (!fullName) return { FirstName: "", MiddleName: "", LastName: "" };
  
  // Clean titles from full name
  const titles = ["MR.", "MRS.", "MS.", "MISS.", "DR.", "M/S.", "F/S.", "SIR", "MR", "MRS", "MS", "DR"];
  let cleanedName = fullName.trim();
  let extractedTitle = "";

  const words = cleanedName.split(/\s+/);
  if (words.length > 0) {
    const firstWordClean = words[0].toUpperCase().replace(/[.;:]/g, "");
    if (titles.includes(firstWordClean)) {
      extractedTitle = words[0];
      words.shift();
      cleanedName = words.join(" ");
    }
  }

  const parts = words;
  return {
    Title: extractedTitle,
    FirstName: parts[0] || "",
    MiddleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    LastName: parts.length > 1 ? parts[parts.length - 1] : "",
  };
};

export const parseAge = (ageStr = "") => {
  if (!ageStr) return "";
  const match = String(ageStr).match(/\d+/);
  return match ? match[0] : ageStr;
};

export const parseDate = (dateStr = "") => {
  if (!dateStr) return null;
  try {
    const parsed = moment(dateStr, [
      "DD/MM/YYYY",
      "DD-MM-YYYY",
      "DD MMM YYYY",
      "DD MMMM YYYY",
      "YYYY-MM-DD",
      "D/M/YYYY",
      "D-M-YYYY",
    ]);
    return parsed.isValid() ? parsed.toDate() : null;
  } catch (e) {
    console.error("Error parsing date:", e);
    return null;
  }
};

export const parseTimeString = (timeStr = "") => {
  if (!timeStr) return { hour: 0, minute: 0, second: 0 };
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/);
  if (!match) return { hour: 0, minute: 0, second: 0 };

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const second = match[3] ? parseInt(match[3], 10) : 0;
  const period = match[4];

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return { hour, minute, second };
};

export const mapGender = (gender = "") => {
  const genderMap = {
    F: "Female",
    FEMALE: "Female",
    M: "Male",
    MALE: "Male",
    "M/S": "Male",
    "F/S": "Female",
  };
  return genderMap[(gender || "").toUpperCase()] || gender;
};

// Derive a sensible default title from gender when none is explicitly provided
export const deriveTitle = (gender = "") => {
  const g = (gender || "").toLowerCase();
  if (g === "male") return "Mr.";
  if (g === "female") return "Miss.";
  return "";
};

export const mapExtractedDataToFormFields = (extractedData = {}) => {
  // Destructure nested objects from extracted data
  const patientDetails = extractedData?.patientDetails || {};
  const clientDetails = extractedData?.clientDetails || {};
  const specimenDetails = extractedData?.specimenCollectionDetails || {};
  const additionalInfo = extractedData?.additionalInfo || {};
  const labUseOnly = extractedData?.labUseOnly || {};

  // Parse components
  const nameParts = parseFullName(patientDetails.name || extractedData.FirstName || "");
  const collectionDate = parseDate(patientDetails.dateOfCollection);
  const dob = parseDate(additionalInfo.dob);
  const timeObj = parseTimeString(patientDetails.timeOfCollection);

  const clinicalNotes = clientDetails.clinicalHistoryNotes || extractedData.Remarks || extractedData.clinicalNotes || "";

  // Intelligent fallback for Height/Weight if missing in structured fields but present in notes
  let height = additionalInfo.heightCm || extractedData.Height || "";
  let weight = additionalInfo.weightKg || extractedData.Weight || "";

  if (!height && clinicalNotes) {
    const hMatch = clinicalNotes.match(/(?:Hight|Height|Ht)[:\s]*(\d+)/i);
    if (hMatch) height = hMatch[1];
  }
  if (!weight && clinicalNotes) {
    const wMatch = clinicalNotes.match(/(?:Weight|Wt)[:\s]*(\d+)/i);
    if (wMatch) weight = wMatch[1];
  }
  // Build mapped data object
  const mappedData = {
    // Patient demographic information
    FirstName: cleanValue(nameParts.FirstName || extractedData.FirstName),
    MiddleName: cleanValue(nameParts.MiddleName || extractedData.MiddleName),
    LastName: cleanValue(nameParts.LastName || extractedData.LastName),
    Title: cleanValue(
      patientDetails.title ||
      nameParts.Title ||
      extractedData.Title ||
      deriveTitle(
        mapGender(patientDetails.gender || extractedData.Gender || "")
      )
    ),
    
    // Age and DOB
    AgeYear: cleanValue(parseAge(patientDetails.age || extractedData.AgeYear)),
    DOB: dob || extractedData.DOB || "",
    
    // Gender
    Gender: mapGender(patientDetails.gender || extractedData.Gender || ""),
    
    // Contact information
    Mobile: cleanValue(patientDetails.mobileNo || extractedData.Mobile),
    Phone: cleanValue(clientDetails.clientContactNo || extractedData.Phone),
    Email: isValidEmail(clientDetails.emailId) ? clientDetails.emailId : (isValidEmail(extractedData.Email) ? extractedData.Email : ""),
    
    // Client and reference information
    ClientRefNumber: cleanValue(clientDetails.clientCode || extractedData.ClientRefNumber || extractedData.ClientRefNo),
    ClientRefNo: cleanValue(clientDetails.clientCode || extractedData.ClientRefNo), // Legacy field
    
    // Doctor references
    DoctorName: cleanValue(patientDetails.referringDoctor || extractedData.DoctorName),
    ReferLabId: cleanValue(patientDetails.referringCustomer || extractedData.ReferLabId),
    SampleCollectionDate: patientDetails.dateOfCollection || extractedData.SampleCollectionDate || "",
    CentreID: cleanValue(patientDetails.RateID || extractedData.CentreID),
    
    // Specimen/Sample information
    BarcodeNo: cleanValue(specimenDetails.specimenTypes?.plain || extractedData.BarcodeNo),
    trfNo: cleanValue(patientDetails.trfNo || extractedData.trfNo),
    SampleBy: cleanValue(labUseOnly.receivedBy || extractedData.SampleBy),
    
    // Location information (if available)
    Ward: cleanValue(extractedData.Ward || patientDetails.ward),
    BedNo: cleanValue(extractedData.BedNo || patientDetails.bedNo),
    
    // Physical measurements
    Height: cleanValue(height),
    Weight: cleanValue(weight),
    
    // Clinical information
    Remarks: cleanValue(clinicalNotes),
    
    // Dates
    RegistrationDate: collectionDate ? collectionDate.toISOString() : "",
    Date: collectionDate ? collectionDate.toISOString() : "",
    dateOfCollection: patientDetails.dateOfCollection || "",
    
    // Test information
    __scannedTests__: (specimenDetails.testNames || []).join(", ") || specimenDetails.testName || extractedData.__scannedTests__ || "",
    testNames: Array.isArray(specimenDetails.testNames) ? specimenDetails.testNames : 
               (specimenDetails.testName ? specimenDetails.testName.split(/[\n,;/+&•*·]+/).map(t => t.trim()).filter(Boolean) : []),
    TestName: (specimenDetails.testNames || []).join(", ") || specimenDetails.testName || extractedData.TestName || "",
    TestCode: cleanValue(specimenDetails.testCode || extractedData.TestCode),
    
    // Pregnancy/LMP info (if available)
    LMP: cleanValue(additionalInfo.lmp || extractedData.LMP),
    
    // Additional fields
    clientName: cleanValue(clientDetails.clientName || extractedData.clientName),
    clientContactName: cleanValue(clientDetails.clientName),
    
    // Preserve original arrays
    TestNames: specimenDetails.testNames || extractedData.testNames || [],
    RateID : "",
    
    // Preserve specimen types structure
    specimenTypes: specimenDetails.specimenTypes || extractedData.specimenTypes || {},
  };

  return mappedData;
};

export const validateExtractedData = (extractedData = {}) => {
  const errors = [];
  const patientDetails = extractedData?.patientDetails || {};

  if (!patientDetails.name && !extractedData.FirstName) {
    errors.push("Patient name is required");
  }
  if (!patientDetails.age && !extractedData.AgeYear) {
    errors.push("Patient age is required");
  }
  if (!patientDetails.mobileNo && !extractedData.Mobile) {
    errors.push("Mobile number is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const prepareScannedDataForStorage = (extractedData = {}) => {
  // Map the data to form fields
  const mappedData = mapExtractedDataToFormFields(extractedData);

  // Validate minimum requirements
  const validation = validateExtractedData(extractedData);
  if (!validation.isValid) {
    console.warn("Extracted data validation warnings:", validation.errors);
  }

  // Return as JSON string
  return JSON.stringify(mappedData);
};

export default {
  parseFullName,
  parseAge,
  parseDate,
  parseTimeString,
  mapGender,
  deriveTitle,
  mapExtractedDataToFormFields,
  validateExtractedData,
  prepareScannedDataForStorage,
};

