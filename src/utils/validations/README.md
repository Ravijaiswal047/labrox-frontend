# Centralized Validation System

This directory contains centralized validation utilities for the LDPL-LIMS application.

## Structure

```
validations/
├── index.js                           # Main export file
├── patientRegistrationValidation.js   # Patient registration specific validations
├── validationHelpers.js              # Reusable validation helper functions
└── README.md                         # This file
```

## Usage

### Patient Registration Validation

```javascript
import { validateBeforeSubmission } from '../../utils/validations';

// In your component
const validationParams = {
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
  setErr
};

if (validateBeforeSubmission(validationParams)) {
  // Proceed with API call
  handleSubmitApi();
}
```

### Individual Field Validation

```javascript
import { validateMobile, validateEmail, validateAge } from '../../utils/validations';

// Validate mobile number
const mobileValidation = validateMobile(phoneNumber, true); // true = required
if (!mobileValidation.isValid) {
  console.error(mobileValidation.message);
}

// Validate email
const emailValidation = validateEmail(emailAddress);
if (!emailValidation.isValid) {
  console.error(emailValidation.message);
}

// Validate age
const ageValidation = validateAge(years, months, days);
if (!ageValidation.isValid) {
  console.error(ageValidation.message);
}
```

## Available Validation Functions

### Core Validation
- `validateBeforeSubmission(params)` - Main validation function for patient registration
- `validatePatientRegistration(params)` - Core validation logic
- `displayValidationErrors(errors)` - Display errors to user
- `setFieldErrors(errors, setErr)` - Set field-specific errors in state

### Field-Specific Validations
- `validateMobile(mobile, isRequired)` - Mobile number validation
- `validateBarcode(barcodeNo, barcodeLogic, maxLength)` - Barcode validation
- `validateAge(ageYear, ageMonth, ageDays)` - Age validation
- `validateEmail(email)` - Email format validation
- `validateRequired(value, fieldName)` - Required field validation
- `validateName(name, fieldName, minLength)` - Name validation
- `validatePincode(pincode)` - Pincode validation
- `validatePaymentAmount(amount, isRequired)` - Payment amount validation
- `validateDiscount(discountAmount, discountPercentage, totalAmount)` - Discount validation
- `validateTestSelection(tests)` - Test selection validation
- `validateIdentityProof(proofType, proofNumber)` - Identity proof validation

## Benefits

1. **Centralized Logic**: All validation logic is in one place
2. **Reusability**: Helper functions can be used across different components
3. **Consistency**: Same validation rules applied everywhere
4. **Maintainability**: Easy to update validation rules
5. **Error Handling**: Consistent error display and field error setting
6. **Type Safety**: Clear parameter structure and return types

## Adding New Validations

1. Add helper functions to `validationHelpers.js`
2. Add specific validation logic to appropriate files
3. Export new functions from `index.js`
4. Update this README with usage examples

## Error Types

- `error` - Critical errors (displayed as toast.error)
- `warn` - Warning messages (displayed as notify with warn type)

## Return Format

All validation functions return:
```javascript
{
  isValid: boolean,
  message: string
}
```

Main validation function returns:
```javascript
{
  isValid: boolean,
  errors: Array<{
    field: string,
    message: string,
    type: 'error' | 'warn'
  }>
}
```