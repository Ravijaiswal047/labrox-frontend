// Dynamic validation utility
export const createDynamicValidation = (controllersData, formData) => {
  // Input parameter validation
  if (
    !Array.isArray(controllersData) ||
    !formData ||
    typeof formData !== "object"
  ) {
    return { isValid: true, errors: {}, missingFields: [] };
  }

  const errors = {};
  const missingFields = [];

  controllersData.forEach((control) => {
    if (control.IsShow === 1) {
      const fieldId = control.ControlDisplayID;
      const fieldValue = formData[fieldId];

      // Skip validation for BarcodeNo field
      if (fieldId?.toLowerCase()?.includes('barcode')) {
        return;
      }

      // Required field validation
      if (control.IsMandatory === 1) {
        if (!fieldValue || fieldValue === "" || fieldValue === null || fieldValue === undefined) {
          errors[fieldId] = `${control.ControlDisplayName || fieldId} is required`;
          missingFields.push(control.ControlDisplayName || fieldId);
        }
      }

      // Additional validations based on field type and value
      if (fieldValue && fieldValue !== "" && fieldValue !== null && fieldValue !== undefined) {
        // Email validation
        if (fieldId.toLowerCase().includes("email")) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(fieldValue.toString().trim())) {
            errors[fieldId] = "Invalid email format";
          }
        }
        
        // Mobile validation - more specific for 10-digit mobile numbers
        if (fieldId.toLowerCase().includes("mobile")) {
          const mobileStr = fieldValue.toString().trim();
          if (!/^[0-9]{10}$/.test(mobileStr)) {
            errors[fieldId] = "Mobile number must be exactly 10 digits";
          }
        }
        
        // Phone validation (general)
        if (fieldId.toLowerCase().includes("phone") && !fieldId.toLowerCase().includes("mobile")) {
          const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
          if (!phoneRegex.test(fieldValue.toString().trim())) {
            errors[fieldId] = "Invalid phone number format";
          }
        }

        // Date validation
        if (fieldId.toLowerCase().includes("date") || fieldId === "DOB") {
          if (isNaN(Date.parse(fieldValue))) {
            errors[fieldId] = "Invalid date format";
          }
        }
        
        // Name validations
        if (["FirstName", "MiddleName", "LastName"].includes(fieldId)) {
          const nameStr = fieldValue.toString().trim();
          if (nameStr.length < 2) {
            errors[fieldId] = `${fieldId} must be at least 2 characters`;
          }
          if (!/^[a-zA-Z\s\.]+$/.test(nameStr)) {
            errors[fieldId] = `${fieldId} should contain only letters`;
          }
        }
        
        // Age validations
        if (fieldId === "AgeYear") {
          const age = parseInt(fieldValue);
          if (isNaN(age) || age < 0 || age > 120) {
            errors[fieldId] = "Age must be between 0 and 120 years";
          }
        }
        
        if (fieldId === "AgeMonth") {
          const months = parseInt(fieldValue);
          if (isNaN(months) || months < 0 || months > 11) {
            errors[fieldId] = "Months must be between 0 and 11";
          }
        }
        
        if (fieldId === "AgeDays") {
          const days = parseInt(fieldValue);
          if (isNaN(days) || days < 0 || days > 31) {
            errors[fieldId] = "Days must be between 0 and 31";
          }
        }
        
        // Patient Code validation
        if (fieldId === "PatientCode") {
          const codeStr = fieldValue.toString().trim();
          if (codeStr.length < 3) {
            errors[fieldId] = "Patient Code must be at least 3 characters";
          }
        }
        
        // Pincode validation
        if (fieldId.toLowerCase().includes("pincode") || fieldId.toLowerCase().includes("zip")) {
          const pincodeStr = fieldValue.toString().trim();
          if (!/^[0-9]{6}$/.test(pincodeStr)) {
            errors[fieldId] = "Pincode must be exactly 6 digits";
          }
        }

        // Title validation
        if (fieldId === "Title") {
          if (!fieldValue || fieldValue === "") {
            errors[fieldId] = "Title is required";
          }
        }

        // Gender validation
        if (fieldId === "Gender") {
          const validGenders = ["Male", "Female", "Other"];
          if (!validGenders.includes(fieldValue)) {
            errors[fieldId] = "Please select a valid gender";
          }
        }

        // Centre validation
        if (fieldId === "CentreID") {
          if (!fieldValue || fieldValue === "" || fieldValue === 0) {
            errors[fieldId] = "Centre selection is required";
          }
        }

        // Rate Type validation
        if (fieldId === "RateID") {
          if (!fieldValue || fieldValue === "" || fieldValue === 0) {
            errors[fieldId] = "Rate Type selection is required";
          }
        }
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingFields,
  };
};
