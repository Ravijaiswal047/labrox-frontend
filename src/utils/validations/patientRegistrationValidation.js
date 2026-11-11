import { notify } from "../utils";
import { toast } from "react-toastify";
import {
  validateMobile,
  validateBarcode,
  validateAge,
  validateEmail,
  validateRequired,
  validateName,
  validatePincode,
  validatePaymentAmount,
  validateDiscount,
  validateTestSelection,
  validateIdentityProof,
  validateDynamicFields
} from "./validationHelpers";

/**
 * Centralized validation utility for Patient Registration
 * All validations before API call should be handled here
 */

export const validatePatientRegistration = ({
  state,
  selectedRateType,
  LTData,
  tableData,
  BarcodeLogic,
  BarocdeNoMaxLength,
  PLO,
  RcData,
  handleRateTypePaymode,
  throughMemberData,
  visibleFields,
  coupon,
  disAmt,
  discountPercentage,
  Match,
  PaymentData,
  valiateProofID,
  handleFileValidationUpload,
  getTestNamesWithBlankSampleTypeID,
  filterUnPaidRcData,
  DynamicFieldValidations,
  checkBarcodeValidationForBlank,
  fieldConfigs = [],
}) => {
  const errors = [];

  // 1. Age validation
  const ageValidation = validateAge(state?.AgeYear, state?.AgeMonth, state?.AgeDays);
  if (!ageValidation.isValid) {
    errors.push({
      field: "AgeYear",
      message: ageValidation.message,
      type: "error"
    });
  }

  // 2. Mobile number validation
  const mobileValidation = validateMobile(state?.Mobile, selectedRateType?.IsMobileRequired == 1);
  if (!mobileValidation.isValid) {
    errors.push({
      field: "Mobile",
      message: mobileValidation.message,
      type: "warn"
    });
  }

  // 3. Email validation
  const emailValidation = validateEmail(state?.Email);
  if (!emailValidation.isValid) {
    errors.push({
      field: "Email",
      message: emailValidation.message,
      type: "error"
    });
  }

  // 4. Name validation
  const firstNameValidation = validateName(state?.FirstName, "First Name");
  if (!firstNameValidation.isValid) {
    errors.push({
      field: "FirstName",
      message: firstNameValidation.message,
      type: "error"
    });
  }

  // 5. Barcode validation
  const barcodeValidation = validateBarcode(state?.BarcodeNo, BarcodeLogic, BarocdeNoMaxLength);
  if (!barcodeValidation.isValid) {
    errors.push({
      field: "BarcodeNo",
      message: barcodeValidation.message,
      type: "error"
    });
  }

  if (BarcodeLogic === 4 && checkBarcodeValidationForBlank(tableData)) {
    errors.push({
      field: "BarcodeNo",
      message: "Barcode validation failed for blank entries.",
      type: "error"
    });
  }

  // 6. Barcode logic validation for collected samples
  if (BarcodeLogic === 3 || BarcodeLogic === 4) {
    const collectedSamples = tableData?.filter(
      (ele) => ele?.IsSampleCollected === "S"
    );
    const hasAnyChecked = collectedSamples?.every((ele) =>
      ele?.InvestigationSampleType?.some((item) => item?.setBarcode === 1)
    );
    
    if (!hasAnyChecked) {
      const missingBarcodeTests = collectedSamples?.filter((ele) =>
        ele?.InvestigationSampleType?.some((item) => {
          return (
            item?.sampleId !== "0" &&
            item?.setBarcode !== 1 &&
            !item?.barcodeNo
          );
        })
      );

      const TestNames = missingBarcodeTests?.map((ele) => ele?.TestName);
      const isMissingBarcode = missingBarcodeTests?.length > 0;
      
      if (isMissingBarcode) {
        errors.push({
          field: "BarcodeNo",
          message: `Barcode is required for ${TestNames.join(", ")}`,
          type: "error"
        });
      }
    }
  }

  // 5. Dynamic field validations (API-based)
  const combinedFormData = { ...state, ...LTData };
  const dynamicValidation = validateDynamicFields(fieldConfigs, combinedFormData);
  
  if (!dynamicValidation.isValid) {
    errors.push(...dynamicValidation.errors);
  }
  
  // 6. Legacy dynamic field validations (fallback)
  if (DynamicFieldValidations) {
    const dynamicFieldErrors = DynamicFieldValidations();
    const dynamicFieldFlag = dynamicFieldErrors.filter((ele) => ele?.isError === true);
    
    if (dynamicFieldFlag.length > 0) {
      dynamicFieldFlag.forEach(field => {
        errors.push({
          field: field.FieldType,
          message: field.message,
          type: "error"
        });
      });
    }
  }

  // 7. Test selection validation
  const testValidation = validateTestSelection(PLO);
  if (!testValidation.isValid) {
    errors.push({
      field: "Tests",
      message: testValidation.message,
      type: "error"
    });
  }

  // 8. Identity proof validation
  const identityValidation = validateIdentityProof(LTData?.PatientIDProof, LTData?.PatientIDProofNo);
  if (!identityValidation.isValid) {
    errors.push({
      field: "PatientIDProof",
      message: identityValidation.message,
      type: "error"
    });
  }

  // 9. Payment validation
  const paymentCheck = PaymentData();
  if (paymentCheck) {
    errors.push({
      field: "Payment",
      message: "Please Fill All The Required Fields",
      type: "error"
    });
  }

  // 10. Discount validation
  const match = Match();
  if (!coupon?.field && (disAmt || discountPercentage || match)) {
    if (throughMemberData) {
      // Allow for member data
    } else {
      if (LTData?.DiscountOnTotal !== 0) {
        if (
          (LTData?.DiscountApprovedBy === "" || LTData?.DiscountReason === "") &&
          (LTData?.DiscountId === "" || LTData?.DiscountReason === "")
        ) {
          errors.push({
            field: "Discount",
            message: "Please Choose Discount Approval And Discount Reason",
            type: "error"
          });
        }
      }
    }
  }

  // 11. Document validation
  const { DocumentFlag, message } = handleFileValidationUpload();
  if (!DocumentFlag) {
    errors.push({
      field: "Document",
      message: `${message} is Required Document`,
      type: "error"
    });
  }

  // 12. Sample type validation
  const sampleTypeError = getTestNamesWithBlankSampleTypeID();
  if (sampleTypeError) {
    errors.push({
      field: "SampleType",
      message: sampleTypeError,
      type: "error"
    });
  }

  // 13. Payment amount validation
  if (filterUnPaidRcData()) {
    errors.push({
      field: "Payment",
      message: "Please Enter Paid Amount to continue",
      type: "error"
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Display validation errors to user
 */
export const displayValidationErrors = (errors) => {
  errors.forEach(error => {
    switch (error.type) {
      case "warn":
        notify(error.message, "warn");
        break;
      case "error":
        toast.error(error.message);
        break;
      default:
        toast.error(error.message);
    }
  });
};

/**
 * Set field-specific errors in state
 */
export const setFieldErrors = (errors, setErr) => {
  const fieldErrors = {};
  errors.forEach(error => {
    if (error.field) {
      fieldErrors[error.field] = error.message;
    }
  });
  setErr(prev => ({ ...prev, ...fieldErrors }));
};

/**
 * Main validation function to be called before API submission
 */
export const validateBeforeSubmission = (validationParams) => {
  const { isValid, errors } = validatePatientRegistration(validationParams);
  
  if (!isValid) {
    displayValidationErrors(errors);
    setFieldErrors(errors, validationParams.setErr);
    return false;
  }
  
  return true;
};