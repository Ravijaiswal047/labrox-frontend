/**
 * Centralized validation utilities
 * Export all validation functions from here
 */

export {
  validatePatientRegistration,
  displayValidationErrors,
  setFieldErrors,
  validateBeforeSubmission
} from './patientRegistrationValidation';

export {
  validateMobile,
  validateMobileDigits,
  PHONE_MAX_LENGTH,
  PHONE_MAX_LENGTH_KES,
  getPhoneMaxLength,
  validatePhone,
  TRF_NO_MAX_LENGTH,
  validateTrfNo,
  validateBarcode,
  validateAge,
  validateAgeComponent,
  AGE_YEAR_MAX,
  AGE_MONTH_MAX,
  AGE_DAY_MAX,
  WEIGHT_MAX_KG,
  validateWeight,
  validateEmail,
  validateRequired,
  validateName,
  validatePincode,
  validatePaymentAmount,
  validateDiscount,
  validateRowDiscount,
  sanitizeCountryName,
  validateCountryName,
  parseTypedDate,
  validateFromToDateRange,
  validateDob,
  calculateAgeFromDob,
  validateTestSelection,
  validateIdentityProof,
  isAadhaarIdType,
  sanitizeAadhaarInput,
  validateAadhaarNumber,
  isPanIdType,
  validatePanNumber,
  ADDRESS_MAX_LENGTH,
  validateAddress,
  LAST_NAME_MAX_LENGTH,
  sanitizeLastNameInput,
  validateLastName,
  FIRST_NAME_MAX_LENGTH,
  validateFirstName,
  validateDynamicFields,
  validateFieldByConfig,
  getFieldConfig,
  isFieldMandatory
} from './validationHelpers';

// You can add more validation modules here as needed
// export * from './otherValidations';