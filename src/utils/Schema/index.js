import moment from "moment";
import * as Yup from "yup";
import { useLocalStorage } from "../hooks/useLocalStorage";

const userData = useLocalStorage("userData", "get");
const DefaultCurrencyName = userData?.DefaultCurrencyName;
const pinLength = DefaultCurrencyName == "KES" ? 5 : 6;

export const validateAlleryType = (formData) => {
  let err = "";
  if (formData?.Name.trim() === "") {
    err = { ...err, Name: "This Field is Required" };
  }
  if (formData?.Minimum.trim() === "") {
    err = { ...err, Minimum: "This Field is Required" };
  }
  if (formData?.Maximum.trim() === "") {
    err = { ...err, Maximum: "This Field is Required" };
  }
  return err;
};

export const validateAlleryDrug = (formData) => {
  let err = "";
  if (formData?.AllergyTypeID === "") {
    err = { ...err, AllergyTypeID: "This Field is Required" };
  }
  if (formData?.Name.trim() === "") {
    err = { ...err, Name: "This Field is Required" };
  }
  return err;
};
const conditionalRequired = (message) =>
  Yup.string().test("isRequired", message, function (value) {
    if (this.parent.PNDT) {
      return value;
    }
    return true;
  });
const conditionalRequiredMobile = (message) =>
  Yup.string().test("isRequired", message, function (value) {
    // if (this.parent.BTB != 1) {
    if (this.parent.BTB != 1 && this.parent.SUBPCC != 1) {
      return value;
    }
    return true;
  });
const conditionalCategory = (message) =>
  Yup.string().test("isRequired", message, function (value) {
    const { CategoryCheck } = this.parent;
    if (CategoryCheck > 0) {
      return !!value;
    }
    return true;
  });
const conditionalPatientCode = (message) =>
  Yup.string().test("isRequired", message, function (value) {
    const { CompanyCodeCheck } = this.parent;
    if (CompanyCodeCheck == 1) {
      return !!value;
    }
    return true;
  });
export const PatientRegisterSchema = Yup.object({
  // Mobile: conditionalRequiredMobile("This Field is Required").min(
  //   10,
  //   "Minimum 10 characters"
  // ),
  FirstName: Yup.string()
    .required("This Field is Required")
    .min(1)
    .max(40)
    .trim(),
  DoctorID: Yup.string().required("This Field is Required"),
  DoctorName: Yup.string(),
  Email: Yup.string().email(),
  Husband: conditionalRequired("This Field is Required"),
  NoOfChildren: conditionalRequired("This Field is Required"),
  NoOfSon: conditionalRequired("This Field is Required"),
  NoOfDaughter: conditionalRequired("This Field is Required"),
  Pregnancy: conditionalRequired("This Field is Required"),
  AgeOfSon: conditionalRequired("This Field is Required"),
  AgeOfDaughter: conditionalRequired("This Field is Required"),
  PNDTDoctor: conditionalRequired("This Field is Required"),
  Category: conditionalCategory("This Field is Required"),
  PatientCode: conditionalPatientCode("This Field is Required"),
});

export const CouponValidateSchema = (
  state,
  formData,
  LTData,
  selectedRateType = "",
) => {
  let err = "";
  if (
    state?.Mobile == "" &&
    selectedRateType?.IsMobileRequired == 1 &&
    LTData?.BTB != 1
  ) {
    err = { ...err, Mobile: "This Field is Required" };
  }

  if (
    state?.Mobile != "" &&
    state?.Mobile.length < 10 &&
    selectedRateType?.IsMobileRequired == 1
  ) {
    err = { ...err, Mobiles: "Mobile must be at least 10 characters" };
  }

  if (state?.FirstName == "") {
    err = { ...err, FirstName: "This Field is Required" };
  }
  if (state?.FirstName != "" && state?.FirstName.trim().length < 3) {
    err = { ...err, FirstNames: "FirstName must be at least 3 characters" };
  }
  // if (state?.AgeYear) {
  //   err = { ...err, FirstNames: "Age is required." };
  // }
  if (state?.DOB == "") {
    err = { ...err, DOB: "This Field is Required" };
  }
  // if (formData?.DoctorName == "") {
  //   err = { ...err, DoctorName: "This Field is Required" };
  // }
  // if (formData?.DoctorName != "" && formData?.DoctorID == "") {
  //   err = { ...err, DoctorID: "This Field is Required" };
  // }
  return err;
};
export const DoctorSchema = Yup.object({
  Name: Yup.string().required("Please Enter Your Name"),
  Mobile: Yup.string().min(10).max(10),
  Department: Yup.string().required("Please Select Department"),
  Specialization: Yup.string().required("Please Select Specialization"),
});

export const emailValidate = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email);
};

export const ReportEmailValidation = (formData) => {
  let err = "";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmails = (emails) => {
    const emailArray = emails.split(",").map((email) => email.trim());
    for (const email of emailArray) {
      if (!emailRegex.test(email)) {
        return false;
      }
    }
    return true;
  };

  if (!validateEmails(formData?.To)) {
    err = {
      ...err,
      To: "Please enter valid email addresses separated by commas",
    };
  }

  if (formData?.CC.trim().length > 0 && !validateEmails(formData?.CC)) {
    err = {
      ...err,
      CC: "Please enter valid email addresses separated by commas",
    };
  }

  if (formData?.BCC.trim().length > 0 && !validateEmails(formData?.BCC)) {
    err = {
      ...err,
      BCC: "Please enter valid email addresses separated by commas",
    };
  }
  return err;
};
export const SmsEmail = (formData) => {
  let err = "";
  if (formData?.SmsToPatient.length > 0 && formData?.SmsToPatient.length < 10) {
    err = {
      ...err,
      SmsToPatient: "Must contain atleast 10 digits",
    };
  }

  if (formData?.SmsToDoctor.length > 0 && formData?.SmsToDoctor.length < 10) {
    err = {
      ...err,
      SmsToDoctor: "Must contain atleast 10 digits",
    };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (
    formData?.EmailToPatient.trim().length > 0 &&
    !emailRegex.test(formData?.EmailToPatient)
  ) {
    err = { ...err, EmailToPatient: "Please enter a valid email address" };
  }

  if (
    formData?.EmailToDoctor.trim().length > 0 &&
    !emailRegex.test(formData?.EmailToDoctor)
  ) {
    err = { ...err, EmailToDoctor: "Please enter a valid email address" };
  }
  if (formData?.SmsToClient.length > 0 && formData?.SmsToClient.length < 10) {
    err = {
      ...err,
      SmsToClient: "Must contain atleast 10 digits",
    };
  }

  if (
    formData?.EmailToClient.trim().length > 0 &&
    !emailRegex.test(formData?.EmailToClient)
  ) {
    err = { ...err, EmailToClient: "Please enter a valid email address" };
  }
  return err;
};

export const validation = (formData) => {
  let err = "";
  if (formData?.Department.trim() === "") {
    err = { ...err, Department: "This Field is Required" };
  }
  if (formData?.Department.trim().length < 2) {
    err = { ...err, Departments: "Must have 2 Character" };
  }

  if (formData?.DepartmentCode.trim() === "") {
    err = { ...err, DepartmentCode: "This Field is Required" };
  }
  if (formData?.DepartmentCode.trim().length < 2) {
    err = { ...err, DepartmentCodes: "Must have 2 Character" };
  }

  return err;
};
export const CompanyMasterValidation = Yup.object({
  CompanyCode: Yup.string()
    .required("Please Enter Company Code")
    .min(3)
    .trim("The contact name cannot include leading and trailing spaces"),
  CompanyName: Yup.string()
    .trim("The contact name cannot include leading and trailing spaces")
    .required("Please Enter Company Name"),
  Email: Yup.string()
    .email()
    .required("Please Enter a Your Email")
    .trim("The contact name cannot include leading and trailing spaces")
    .matches(
      /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      "Please Enter a Valid Email",
    ),
  Mobile1: Yup.string()
    .min(10)
    .trim("The contact name cannot include leading and trailing spaces")
    .required("Please Enter Mobile Number"),
  Mobile2: Yup.string()
    .min(10)
    .trim("The contact name cannot include leading and trailing spaces"),
});
export const MenuMasterValidation = (payload) => {
  let errors = "";

  if (payload?.MenuName?.trim() === "") {
    errors = { ...errors, MenuName: "This Field is Required" };
  } else if (payload?.MenuName.length < 2) {
    errors = { ...errors, MenuName: "Must be 2 Character long" };
  }

  // if (payload?.Priority.trim() === "") {
  //   errors = { ...errors, Priority: "This Field is Required" };
  // }

  return errors;
};
export const PageMasterValidation = (payload) => {
  let errors = "";
  if (payload?.MenuID === "") {
    errors = { ...errors, MenuID: "This Field is Required" };
  }
  if (payload?.PageName?.trim() === "") {
    errors = { ...errors, PageName: "This Field is Required" };
  } else if (payload?.PageName.length < 2) {
    errors = { ...errors, PageName: "Must be 2 Character long" };
  }
  if (payload?.Url?.trim() === "") {
    errors = { ...errors, Url: "This Field is Required" };
  } else if (payload?.Url.length < 2) {
    errors = { ...errors, Url: "Must be 2 Character long" };
  }
  // if (toString(payload?.Priority).trim() === "") {
  //   errors = { ...errors, Priority: "This Field is Required" };
  // }

  return errors;
};

export const SubPageMasterValidation = (payload) => {
  let errors = "";
  if (payload?.MenuID === "") {
    errors = { ...errors, MenuID: "This Field is Required" };
  }
  if (payload?.PageId === "") {
    errors = { ...errors, PageId: "This Field is Required" };
  }
  if (payload?.SubPageName === "") {
    errors = { ...errors, SubPageName: "This Field is Required" };
  } else if (payload?.SubPageName.length < 2) {
    errors = { ...errors, SubPageName: "Must be 2 Character long" };
  }

  if (payload?.Url === "") {
    errors = { ...errors, Url: "This Field is Required" };
  } else if (payload?.Url.length < 2) {
    errors = { ...errors, Url: "Must be 2 Character long" };
  }

  if (toString(payload?.Priority).trim() === "") {
    errors = { ...errors, Priority: "This Field is Required" };
  }

  return errors;
};

export const validationForSampleType = (formData) => {
  let err = "";
  if (formData?.SampleName.trim() === "") {
    err = { ...err, SampleName: "This Field is Required" };
  }
  if (formData?.Container === "") {
    err = { ...err, Container: "This Field is Required" };
  }
  return err;
};

export const validationForMasterRanges = (payload) => {
  let err = "";
  if (payload?.TestName.trim() === "") {
    err = { ...err, TestName: "This Field is Required" };
  }
  if (payload?.Result === "") {
    err = { ...err, Result: "This Field is Required" };
  }
  if (payload?.Value === "") {
    err = { ...err, Value: "This Field is Required" };
  }
  return err;
};
export const CenterMasterValidationSchema = Yup.object({
  CentreCode: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  Centre: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  PANNo: Yup.string().min(10),
  BankAccountNo: Yup.string().min(10),
  IFSCCode: Yup.string().min(11),
  DemandDraft: Yup.string().min(6),
  Email: Yup.string()
    .email()
    .trim("The contact name cannot include leading and trailing spaces")
    .matches(
      /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      "Please Enter a Valid Email",
    ),
  Type: Yup.string().required("This Field is Required"),
  Phone: Yup.string().min(10).max(12).trim(),
  Url: Yup.string()
    .trim("Url cannot include leading and trailing spaces")
    .matches(/^[A-Za-z0-9._%-]+\.[A-Za-z]{2,6}$/, "Please Enter a Valid Url"),
});

export const RateMasterValidationSchema = Yup.object({
  CentreCode: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),

  Centre: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  Type: Yup.string().required("This Field is Required"),
  AgainstInvoice: Yup.string().required("This Field is Required"),
  Email: Yup.string()
    .email()
    .trim("The contact name cannot include leading and trailing spaces")
    .matches(
      /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      "Please Enter a Valid Email",
    ),
  InvoiceEmail: Yup.string()
    .email()
    .trim("The contact name cannot include leading and trailing spaces")
    .matches(
      /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      "Please Enter a Valid Email",
    ),
  Phone: Yup.string().min(10).max(12).trim(),
  Url: Yup.string()
    .trim("Url cannot include leading and trailing spaces")
    .matches(/^[A-Za-z0-9._%-]+\.[A-Za-z]{2,6}$/, "Please Enter a Valid Url"),
  IntimationLimit: Yup.string().test(
    "is-less-than-or-equal",
    "Intimation limit must be less than or equal to credit limit",
    function (intimationLimit) {
      const creditLimit = this.resolve(Yup.ref("CreditLimit"));
      return (
        !creditLimit ||
        !intimationLimit ||
        parseFloat(intimationLimit) <= parseFloat(creditLimit)
      );
    },
  ),
  minCashInBookingPercent: Yup.number()
    .max(100, "Maximum value is 100")
    .nullable(),
});

export const RateMasterValidationSchemacash = Yup.object({
  CentreCode: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),

  Centre: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  Type: Yup.string().required("This Field is Required"),

  Email: Yup.string()
    .email()
    .trim("The contact name cannot include leading and trailing spaces")
    .matches(
      /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      "Please Enter a Valid Email",
    ),
  InvoiceEmail: Yup.string()
    .email()
    .trim("The contact name cannot include leading and trailing spaces")
    .matches(
      /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      "Please Enter a Valid Email",
    ),
  Phone: Yup.string().min(10).max(12).trim(),
  Url: Yup.string()
    .trim("Url cannot include leading and trailing spaces")
    .matches(/^[A-Za-z0-9._%-]+\.[A-Za-z]{2,6}$/, "Please Enter a Valid Url"),
  minCashInBookingPercent: Yup.number()
    .max(100, "Maximum value is 100")
    .nullable(),
});

export const InvestigationsMasterSchema = Yup.object().shape({
  TestCode: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  TestName: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  // ShortName: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // PrintName: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  SampleContainer: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  FromAge: Yup.number().required("This Field is Required"),
  // PrintSequence: Yup.number().required("This Field is Required"),
  ToAge: Yup.number()
    .required("This Field is Required")
    .test(
      "from-to-age",
      "To age must be greater than or equal to FromAge",
      function (value) {
        const { FromAge } = this.parent;
        return value >= FromAge;
      },
    )
    .test("not-zero", "Age must not be zero", function (value) {
      return value !== 0;
    }),

  ReportType: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  Gender: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),

  DepartmentID: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),

  // SampleQty: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // SampleRemarks: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  SampleTypeId: Yup.string().test(
    "isRequired",
    "This Field is Required",
    function (value) {
      const sampleOption = this.parent.SampleOption;
      if (sampleOption === "Sample Required") {
        return !!value;
      }
      return true;
    },
  ),
  // SampleTypeId: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  BaseRate: Yup.number().required("This Field is Required"),
  MaxRate: Yup.number()
    .required("This Field is Required")
    .test(
      "MaxRate",
      "MaxRate must be greater than or equal to BaseRate",
      function (value) {
        const { BaseRate } = this.parent;
        return value >= BaseRate;
      },
    ),

  MethodName: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
});

export const ProfileInvestigationsMasterSchema = Yup.object().shape({
  TestCode: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  TestName: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  // ShortName: Yup.string()
  //   .required("This Field is Required")
  // .trim("The contact name cannot include leading and trailing spaces"),
  // PrintName: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  SampleContainer: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  FromAge: Yup.number().required("This Field is Required"),
  ToAge: Yup.number()
    .required("This Field is Required")
    .test(
      "from-to-age",
      "To age must be greater than or equal to FromAge",
      function (value) {
        const { FromAge } = this.parent;
        return value >= FromAge;
      },
    ),
  ReportType: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  Gender: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),

  DepartmentID: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),

  // SampleQty: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // SampleRemarks: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // SampleTypeId: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  SampleTypeId: Yup.string().test(
    "isRequired",
    "This Field is Required",
    function (value) {
      const sampleOption = this.parent.SampleOption;
      if (sampleOption === "Sample Required") {
        return !!value;
      }
      return true;
    },
  ),

  BaseRate: Yup.number().required("BaseRate is required"),
  MaxRate: Yup.number()
    .required("This Field is Required")
    .test(
      "MaxRate",
      "MaxRate must be greater than or equal to BaseRate",
      function (value) {
        const { BaseRate } = this.parent;
        return value >= BaseRate;
      },
    ),
});
export const PackageInvestigationsMasterSchema = Yup.object().shape({
  TestCode: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  TestName: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  // ShortName: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  FromAge: Yup.number().required("This Field is Required"),
  // PrintSequence: Yup.number().required("This Field is Required"),
  ToAge: Yup.number()
    .required("This Field is Required")
    .test(
      "from-to-age",
      "To age must be greater than or equal to FromAge",
      function (value) {
        const { FromAge } = this.parent;
        return value >= FromAge;
      },
    )
    .test("not-zero", "Age must not be zero", function (value) {
      return value !== 0;
    }),

  Gender: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  DepartmentID: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  BaseRate: Yup.number().required("This Field is Required"),
  MaxRate: Yup.number()
    .required("This Field is Required")
    .test(
      "MaxRate",
      "MaxRate must be greater than or equal to BaseRate",
      function (value) {
        const { BaseRate } = this.parent;
        return value >= BaseRate;
      },
    ),
});

export const DocotorReferal = Yup.object({
  // DoctorCode: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // Phone: Yup.number(),
  // Title: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  Name: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  // Locality: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // Zone: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // Degree: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // Specialization: Yup.string()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  //  ClinicName: Yup.string()
  //    .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces"),
  // Email: Yup.string()
  //   .email()
  //   .required("This Field is Required")
  //   .trim("The contact name cannot include leading and trailing spaces")
  //   .matches(
  //     /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
  //     "Please Enter a Valid Email"
  //   ),
  // Mobile: Yup.string()
  //   .matches(
  //     /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
  //     "Phone number is not valid",
  //   )
  //   .matches(/^[5-9]\d{9}$/, "Phone number is not valid")
  //   .required("This Field is Required"),
  Mobile: Yup.string()
  .when([], {
    is: () => DefaultCurrencyName === "KES",
    then: (schema) =>
      schema
        //  .matches(/^\+254\d{9}$/, "Enter valid  number")
        // .required("This Field is Required"),
        // .matches(/^\+254\d{9}$/, "Enter valid number")
        .min(5, "Minimum 5 digits required")
        .max(13, "Maximum 13 digits allowed")
        .required("This Field is Required"),
    otherwise: (schema) => schema,
  }),
});

export const EmployeeMasterSchema = Yup.object({
  Name: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  Mobile: Yup.string().matches(
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
    "Phone number is not valid",
  ),
  Email: Yup.string()
    .email()
    .trim("The contact name cannot include leading and trailing spaces")
    .matches(
      /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      "Please Enter a Valid Email",
    ),
  Department: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  Centre: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  AccessRight: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  ApprovalRight: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  CentreID: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  DesignationID: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  Username: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  isPassword: Yup.boolean(),
  Password: Yup.string().when("isPassword", (isPassword, schema) => {
    if (isPassword[0]) {
      return schema
        .required("Please Enter your password")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
          "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character",
        );
    }
    return schema;
  }),
});
export const EmployeeValidation = (formData) => {
  let err = {};

  if (!formData?.Name?.trim()) {
    err = { ...err, Name: "This Field is Required" };
  }
  if (!formData?.Mobile) {
    err = { ...err, Mobile: "This Field is Required" };
  }
  if (formData?.Mobile?.length > 0 && formData?.Mobile?.length < 10) {
    err = { ...err, Mobile2: "Length Must Be Of 10 Digits" };
  }
  if (
    formData?.Email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)
  ) {
    err = { ...err, Email: "Please Enter a Valid Email Address" };
  }
  ["Department", "Centre", "CentreID", "DesignationID", "Username"].forEach(
    (field) => {
      const fieldValue = formData?.[field];

      if (
        fieldValue === "" ||
        fieldValue == null ||
        (Array.isArray(fieldValue) && fieldValue?.length === 0)
      ) {
        err = { ...err, [field]: "This Field is Required" };
      }
    },
  );

  if (formData?.isPassword) {
    if (!formData.Password) {
      err = { ...err, Password: "Please Enter your password" };
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(
        formData.Password,
      )
    ) {
      err = {
        ...err,
        Password:
          "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character",
      };
    }
  }

  return err;
};
export const validationForDesignations = (formData) => {
  let err = "";
  if (formData?.Name.trim() === "") {
    err = { ...err, Name: "This Field is Required" };
  }
  if (formData?.SequenceNo === "") {
    err = { ...err, SequenceNo: "This Field is Required" };
  }
  return err;
};

export const AdvancePaymentValidationSchema = (formData) => {
  let err = "";
  if (formData?.Type == "") {
    // err = { ...err, Type: "This Field is Required" };
  }
  if (formData?.RateTypeID == "") {
    err = { ...err, RateTypeID: "This Field is Required" };
  }

  return err;
};

export const FieldMasterValidation = Yup.object({
  Name: Yup.string()
    .required("Please Enter Your Name")
    .min(3)
    .max(20)
    .trim("The contact name cannot include leading and trailing spaces"),
  Age: Yup.string()
    .required("Please Enter Your Name")
    .min(1)
    .max(3)
    .trim("The contact name cannot include leading and trailing spaces"),
  Mobile: Yup.string()
    .typeError("That doesn't look like a phone number")
    .required("Phone number is required!")
    .min(10)
    .max(10)
    .trim("The contact name cannot include leading and trailing spaces"),
});

export const InvestigationCommentMasterValidation = (payload) => {
  let errors = "";
  if (payload?.InvestigationID === "") {
    errors = { ...errors, InvestigationID: "This Field is Required" };
  }
  return errors;
};

export const InvestigationCommentValidation = Yup.object().shape({
  InvestigationID: Yup.array().required("This Field is Required"),
});
export const MicroBioMasterSchema = (formData) => {
  let err = "";

  if (formData?.Name.trim() === "") {
    err = { ...err, Name: "This Field is Required" };
  }
  if (formData?.Code.trim() === "") {
    err = { ...err, Code: "This Field is Required" };
  }

  return err;
};

export const validationForIDMAster = (formData) => {
  let err = "";
  if (formData?.TypeName === "") {
    err = { ...err, TypeName: "This Field is Required" };
  }
  if (formData?.InitialChar?.trim() === "") {
    err = { ...err, InitialChar: "This Field is Required" };
  }

  if (formData?.TypeLength === "") {
    err = { ...err, TypeLength: "This Field is Required" };
  }
  return err;
};

export const OutSourceLabMasterValidationSchema = Yup.object({
  LabName: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  ContactPersonName: Yup.string()
    .required("This Field is Required")
    .trim("The contact name cannot include leading and trailing spaces"),
  MobileNo: Yup.string().min(10).required("This Field is Required"),
  EmailID: Yup.string().email(),
});
export const ChangePasswordSchema = Yup.object({
  OldPassword: Yup.string()
    .required("Please Enter your old Password")
    .min(6)
    .trim("The contact name cannot include leading and trailing spaces"),
  NewPassword: Yup.string()
    .trim("The contact name cannot include leading and trailing spaces")
    .required("Please Enter your password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character",
    ),
  ConfirmPassword: Yup.string()
    .trim("The contact name cannot include leading and trailing spaces")
    .required()
    .oneOf([Yup.ref("NewPassword"), null], "Passwords must match"),
});
export const CompanyKeyValidationSchema = (payload) => {
  let err = "";
  if (payload?.CompanyID === "") {
    err = { ...err, CompanyID: "This Field is Required" };
  }
  if (payload?.KeyID.trim() === "") {
    err = { ...err, KeyID: "This Field is Required" };
  }
  if (payload?.SecretKey.trim() === "") {
    err = { ...err, SecretKey: "This Field is Required" };
  }

  return err;
};
export const OnlinePaymentValidationSchema = (payload) => {
  let err = "";
  if (payload?.RateTypeId === "") {
    err = { ...err, RateTypeId: "This Field is Required" };
  }
  if (payload?.Amount === "") {
    err = { ...err, Amount: "This Field is Required" };
  }

  return err;
};
export const ModalityMasterValidations = (formData) => {
  let err = "";
  if (formData?.DepartmentId == "") {
    err = { ...err, DepartmentId: "This Field is Required" };
  }
  if (formData?.ModalityName == "") {
    err = { ...err, ModalityName: "This Field is Required" };
  }

  return err;
};
export const RoomTypeValidation = (payloadRoom) => {
  let err = "";
  if (payloadRoom?.RoomName == "") {
    err = { ...err, RoomName: "This Field is Required" };
  }
  if (payloadRoom?.RoomType == "") {
    err = { ...err, RoomType: "This Field is Required" };
  }

  return err;
};
export const RoomMapValidation = (payloadMap) => {
  let err = "";
  if (payloadMap?.RoomId == "") {
    err = { ...err, RoomId: "This Field is Required" };
  }
  if (payloadMap?.GroupId == "") {
    err = { ...err, GroupId: "This Field is Required" };
  }

  return err;
};
export const TimeSlotValidation = (payload) => {
  let err = "";
  if (payload?.ModalityId == "") {
    err = { ...err, ModalityId: "This Field is Required" };
  }
  if (payload?.ShiftId == "") {
    err = { ...err, ShiftId: "This Field is Required" };
  }
  if (payload?.CentreId == "") {
    err = { ...err, CentreId: "This Field is Required" };
  }
  if (payload?.DurationforPatient == "") {
    err = { ...err, DurationforPatient: "This Field is Required" };
  }

  return err;
};
export const TokenGenerationMasterValidations = (formData) => {
  let err = "";
  if (formData?.DepartmentId == "") {
    err = { ...err, DepartmentId: "This Field is Required" };
  }
  if (formData?.ModalityId == "") {
    err = { ...err, ModalityId: "This Field is Required" };
  }
  if (formData?.GroupName == "") {
    err = { ...err, GroupName: "This Field is Required" };
  }
  if (formData?.Sequence == "") {
    err = { ...err, Sequence: "This Field is Required" };
  }

  return err;
};
export const validationForAgeWise = (formData) => {
  let err = "";
  if (formData?.DiscountType.trim() === "") {
    err = { ...err, DiscountType: "This Field is Required" };
  }
  // if (formData?.FromAge > formData?.ToAge ) {
  //   err = { ...err,FromAgeCheck : "FromAge is greater" };
  // }
  // if (formData?.FromAge < formData?.ToAge) {
  //   err = { ...err, ToAgeCheck: "ToAge is greater" };
  // }
  if (["", "0"].includes(formData?.DiscountPer)) {
    err = { ...err, DiscountPer: "This Field is Required" };
  } else if (formData?.DiscountPer > 100) {
    err = { ...err, DiscountPer: "Enter Valid Discount" };
  }

  if (formData?.FromAge === "") {
    err = { ...err, FromAge: "This Field is Required" };
  } else if (formData?.FromAge > 110) {
    err = { ...err, FromAge: "Enter Valid Age" };
  }

  if (
    moment(formData?.FromDate).format("DD-MM-YYYY") >
    moment(formData?.ToDate).format("DD-MM-YYYY")
  ) {
    err = { ...err, ToDateCheck: "Invalid Date" };
  }

  if (formData?.ToAge === "") {
    err = { ...err, ToAge: "This Field is Required" };
  } else if (formData?.ToAge > 110) {
    err = { ...err, ToAge: "Enter Valid Age" };
  } else if (formData?.ToAge == 0) {
    err = { ...err, ToAge: " Should not be 0" };
  } else if (formData?.ToAge < formData?.FromAge) {
    err = { ...err, ToAge: " Must be equal or greater than FromAge" };
  }

  if (formData?.Gender === "") {
    err = { ...err, Gender: "Gender is Required" };
  }

  if (formData?.DiscountShareType === "") {
    err = { ...err, DiscountShareType: "DiscountShareType is Required" };
  }

  return err;
};

export const validationForMachineMaster = (payload) => {
  let err = "";
  if (payload?.MachineID.trim() === "") {
    err = { ...err, MachineID: "This Field is Required" };
  }
  if (payload?.MachineName === "") {
    err = { ...err, MachineName: "This Field is Required" };
  }

  if (payload?.CentreID === "") {
    err = { ...err, CentreID: "Centre ID is Required" };
  }

  if (payload?.GlobalMachineID === "") {
    err = { ...err, GlobalMachineID: "Global Machine ID is Required" };
  }
  if (payload?.ITDKEY === "") {
    err = { ...err, ITDKEY: "This Field is Required" };
  }

  return err;
};

export const CampRequestSchema = (formData) => {
  let err = "";
  if (formData?.CampName === "") {
    err = { ...err, CampName: "This Field is Required" };
  }
  if (formData?.center === "") {
    err = { ...err, Campcenter: "This Field is Required" };
  }
  if (formData?.campType === "") {
    err = { ...err, Camptype: "This Field is Required" };
  }

  return err;
};
export const validateIssue = (formData, type, error) => {
  // console.log("formData",formData);
  let err = error ?? "";
  if (formData?.cardid === "" && (type === "cardid" || type === "All")) {
    err = { ...err, cardid: "This feild is Required" };
  }

  if (formData?.PatientData?.DOB === "" && (type === "DOB" || type === "All")) {
    err = { ...err, DOB: "Select from Item" };
  }

  if (
    formData?.PatientData?.Mobile === "" &&
    (type === "Mobile" || type === "All")
  ) {
    err = { ...err, Mobile: "This Field is Required" };
  } else if (
    formData?.PatientData?.Mobile.length !== 10 &&
    (type === "Mobile" || type === "All")
  ) {
    err = { ...err, Mobilelen: "Invalid!.. 10 Digits Required" };
  }

  if (
    formData?.PatientData?.PName === "" &&
    (type === "PName" || type === "All")
  ) {
    err = { ...err, PName: "This Field is Required" };
  } else if (
    formData?.PatientData?.PName !== "" &&
    formData?.PatientData?.PName.length <= 2 &&
    (type === "PName" || type === "All")
  ) {
    err = { ...err, PNamelength: "Name should contain minimum 3 character" };
  }

  return err;
};

export const RouteMasterValidationSchema = (formData) => {
  let err = "";
  if (formData?.BusinessZoneId.trim() === "") {
    err = { ...err, BusinessZoneId: "This Field is Required" };
  }
  if (formData?.StateId.trim() === "") {
    err = { ...err, StateId: "This Field is Required" };
  }
  if (formData?.CityId.trim() === "") {
    err = { ...err, CityId: "This Field is Required" };
  }
  if (!formData?.Route || formData?.Route.trim() === "") {
    err = { ...err, Route: "This Field is Required" };
  }
  if (formData?.Route.trim().length < 2) {
    err = { ...err, Routes: "Must Have 2 length" };
  }
  return err;
};

export const LocationMasterValidationSchema = (formData) => {
  let err = "";
  if (formData?.BusinessZoneID?.toString().trim() === "") {
    err = { ...err, BusinessZoneID: "This Field is Required" };
  }
  if (formData?.StateID?.toString().trim() === "") {
    err = { ...err, StateID: "This Field is Required" };
  }
  if (formData?.CityID?.toString().trim() === "") {
    err = { ...err, CityID: "This Field is Required" };
  }

  return err;
};
export const LocationUpdateSchema = (obj) => {
  let err = "";
  if (obj?.BusinessZoneID.toString().trim() === "") {
    err = { ...err, BusinessZoneID: "This Field is Required" };
  }
  if (obj?.StateID.toString().trim() === "") {
    err = { ...err, StateID: "This Field is Required" };
  }
  if (obj?.CityID.trim() === "") {
    err = { ...err, CityID: "This Field is Required" };
  }
  if (obj?.Locality.trim() === "") {
    err = { ...err, Locality: "This Field is Required" };
  }
  if (obj?.Locality.trim().length > 0) {
    if (obj?.Locality.trim().length < 3) {
      err = { ...err, Localitys: "Must Have 3 character" };
    }
  }
  if (obj?.Pincode == "") {
    err = { ...err, Pincode: "This Field is Required" };
  }
  if (obj?.Pincode != "") {
    if (obj?.Pincode.trim().length != pinLength) {
      err = { ...err, PincodeLength: "Invalid Pincode" };
    }
  }
  return err;
};
export const PhelebotomistMappingValdationSchema = (formData) => {
  let err = "";
  if (formData?.BusinessZoneId.toString().trim() === "") {
    err = { ...err, BusinessZoneId: "This Field is Required" };
  }
  if (formData?.StateId.toString().trim() === "") {
    err = { ...err, StateId: "This Field is Required" };
  }
  if (formData?.CityId.trim() === "") {
    err = { ...err, CityId: "This Field is Required" };
  }
  return err;
};
export const PhlebotomistMappingValdationSchema = (formData) => {
  const errors = {};

  if (!formData.BusinessZoneId || formData.BusinessZoneId.trim() === "") {
    errors.BusinessZoneId = "This Field is Required";
  }
  if (!formData.StateId || formData.StateId.trim() === "") {
    errors.StateId = "This Field is Required";
  }
  if (!formData.CityId || formData.CityId.trim() === "") {
    errors.CityId = "This Field is Required";
  }

  return errors;
};
export const NewPatientModalValidationSchema = (formData) => {
  let err = "";

  if (!formData.PName || formData.PName.trim() === "") {
    err = { ...err, PName: "This Field is Required" };
  }
  if (formData?.PName.trim().length < 3) {
    err = { ...err, PNames: "Must Have 3 length" };
  }
  if (!formData.DOB || formData.DOB === "") {
    err = { ...err, DOB: "This Field is Required" };
  }

  if (
    !formData.StateID.toString() ||
    formData.StateID.toString().trim() === ""
  ) {
    err = { ...err, StateID: "This Field is Required" };
  }
  if (!formData.Pincode || formData.Pincode.trim() === "") {
    err = { ...err, Pincode: "This Field is Required" };
  }

  if (!formData.CityID.toString() || formData.CityID.toString().trim() === "") {
    err = { ...err, CityID: "This Field is Required" };
  }
  if (
    !formData.CountryID.toString() ||
    formData.CountryID.toString().trim() === ""
  ) {
    err = { ...err, CountryID: "This Field is Required" };
  }
  if (!formData.Gender || formData.Gender.trim() === "") {
    err = { ...err, Gender: "This Field is Required" };
  }
  if (
    !formData.LocalityID?.toString() ||
    formData.LocalityID?.toString().trim() === ""
  ) {
    err = { ...err, LocalityID: "This Field is Required" };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (formData?.Email.trim().length > 0 && !emailRegex.test(formData?.Email)) {
    err = { ...err, Emailvalid: "Please enter a valid email address" };
  }
  if (
    formData?.HouseNo.trim().length > 0 &&
    formData?.HouseNo.trim().length < 2
  ) {
    err = { ...err, HouseNo: "Must Have 2 length" };
  }

  if (
    formData?.Landmark.trim().length > 0 &&
    formData?.Landmark.trim().length < 3
  ) {
    err = { ...err, Landmark: "Must Have 3 length" };
  }
  return err;
};

export const AppointmentModalValidationSchema = (searchData) => {
  let err = "";
  if (!searchData.StateID) {
    err = { ...err, StateID: "This Field is Required" };
  }
  if (!searchData.CityID) {
    err = { ...err, CityID: "This Field is Required" };
  }

  if (!searchData.LocalityID) {
    err = { ...err, LocalityID: "This Field is Required" };
  }

  // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // if (
  //   searchData?.Email.trim().length > 0 &&
  //   !emailRegex.test(searchData?.Email)
  // ) {
  //   err = { ...err, Emailvalid: "Please enter a valid email address" };
  // }

  // if (
  //   searchData?.Landmark.trim().length > 0 &&
  //   searchData?.Landmark.trim().length < 3
  // ) {
  //   err = { ...err, Landmark: "Must Have 3 length" };
  // }
  // if (
  //   searchData?.Address.trim().length > 0 &&
  //   searchData?.Address.trim().length < 3
  // ) {
  //   err = { ...err, Address: "Must Have 3 length" };
  // }
  return err;
  // if (!searchData.DropLocationId) {
  //   err = { ...err, DropLocationId: "Pick any DropLocation" };
  // }

  return err;
};
// export const PatientRegisterSchema = (formdata) => {
//   let err = {};
//   if (formdata?.Mobile === "") {
//     err = { ...err, Mobile: "This Field Required" };
//   }

//   return err;
// };
export const AppointmentModalValidationSchema2 = (searchData) => {
  let err = "";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (
    searchData?.Email.trim().length > 0 &&
    !emailRegex.test(searchData?.Email)
  ) {
    err = { ...err, Emailvalid: "Please enter a valid email address" };
  }

  if (
    searchData?.Landmark.trim().length > 0 &&
    searchData?.Landmark.trim().length < 3
  ) {
    err = { ...err, Landmark: "Must Have 3 length" };
  }
  if (
    searchData?.Address.trim().length > 0 &&
    searchData?.Address.trim().length < 3
  ) {
    err = { ...err, Address: "Must Have 3 length" };
  }
  return err;
  // if (!searchData.DropLocationId) {
  //   err = { ...err, DropLocationId: "Pick any DropLocation" };
  // }

  return err;
};

export const AllowCharactersNumbersAndSpecialChars = (value) => {
  const reg = /[^a-zA-Z0-9\-\/ ]|(\s{2,})|(\/{2,})|(-{2,})/g;
  return !reg.test(value);
};
export const HandleHCBooking = (appointData, datas, discountamount, coupon) => {
  // console.log(datas);
  let err = "";
  if (!appointData.Alternatemobileno) {
    err = { ...err, Alternatemobilenos: "This Field is Required" };
  }

  if (!appointData.SourceofCollection) {
    err = { ...err, SourceofCollection: "This Field is Required" };
  }
  if (!appointData.Paymentmode) {
    err = { ...err, Paymentmode: "This Field is Required" };
  }
  if (appointData?.Alternatemobileno.length !== 10) {
    err = { ...err, Alternatemobilenum: "Please enter valid number" };
  }
  if (datas?.House_No.trim().length > 0 && datas?.House_No.trim().length < 2) {
    err = { ...err, House_No: "Must Have 2 length" };
  }
  if (!datas.House_No || datas.House_No.trim() === "") {
    err = { ...err, House_Nos: "This Field is Required" };
  }
  if (!datas.DoctorName || datas.DoctorName.trim() === "") {
    err = { ...err, DoctorName: "Please Pick Any Doctor" };
  }

  if (!coupon && (discountamount != "" || discountamount != 0)) {
    if (datas?.DisReason == "") {
      err = { ...err, DisReason: "Enter Discount Reason" };
    }
    if (datas?.DoctorID == "") {
      err = { ...err, DoctorID: "Select Discount Given By" };
    }
  }

  // if (datas?.RefDoctor.trim().length < 3) {
  //   err = { ...err, RefDoctors: "Must Have 3 length" };
  // }
  return err;
};

export const PhelboSaveHolidayValidationSchema = (formData) => {
  let err = "";
  if (formData?.StateId === "") {
    err = { ...err, StateId: "This Field is Required" };
  }
  if (formData?.CityId === "") {
    err = { ...err, CityId: "This Field is Required" };
  }
  if (formData?.Phlebotomist.trim() === "") {
    err = { ...err, Phlebotomist: "This Field is Required" };
  }
  if (formData?.FromDate === "") {
    err = { ...err, FromDate: "This Field is Required" };
  }
  if (formData?.ToDate === "") {
    err = { ...err, ToDate: "This Field is Required" };
  }
  return err;
};

export const PhelboSearchHolidayValidationSchema = (formData) => {
  let err = "";

  if (formData?.fromDate === "") {
    err = { ...err, fromDate: "This Field is Required" };
  }
  if (formData?.toDate === "") {
    err = { ...err, toDate: "This Field is Required" };
  }
  return err;
};
export const UpdatePatientValidation = (formData) => {
  let err = "";
  if (formData?.StateId === "") {
    err = { ...err, StateId: "This Field is Required" };
  }
  if (formData?.Gender === "") {
    err = { ...err, Gender: "This Field is Required" };
  }
  if (formData?.CityId === "") {
    err = { ...err, CityId: "This Field is Required" };
  }
  if (formData?.LocalityId === "") {
    err = { ...err, LocalityId: "This Field is Required" };
  }
  if (formData?.Pincode === "") {
    err = { ...err, Pincode: "This Field is Required" };
  }
  if (formData?.AgeYear === "") {
    err = { ...err, AgeYear: "This Field is Required" };
  }
  if (
    formData?.FirstName.trim() != "" &&
    formData?.FirstName.trim().length < 3
  ) {
    err = { ...err, FirstNameLength: "This Field is Required (min 3 letters)" };
  }
  if (formData?.FirstName.trim() === "") {
    err = { ...err, FirstNameNumber: "This Field is Required" };
  }
  if (
    formData?.LandMark.trim() !== "" &&
    formData?.LandMark.trim().length < 3
  ) {
    err = { ...err, LandMark: "Min 3 letter Required" };
  }
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (formData?.Email.trim() != "") {
    if (!emailPattern.test(formData?.Email)) {
      err = { ...err, Email: "Should be a valid email" };
    }
  }
  return err;
};

export const PhelbotomistValidationSchema = (formData) => {
  let err = "";
  if (formData?.Name.trim() === "") {
    err = { ...err, Name: "This Field is Required" };
  }

  if (formData?.Name.trim().length < 3) {
    err = { ...err, NameLength: "Name Must contain atleast 3 characters" };
  }
  if (moment(formData?.Age).format("DD-MMM-YYYY") === "") {
    err = { ...err, Age: "This Field is Required" };
  }
  if (formData?.Mobile === "") {
    err = { ...err, Mobileempty: "This Field is Required" };
  }
  if (formData?.Mobile.length !== 10) {
    err = { ...err, Mobileinvalid: "Please enter valid number" };
  }
  if (
    formData?.Qualification?.trim().length > 0 &&
    formData?.Qualification?.trim().length < 2
  ) {
    err = {
      ...err,
      QualificationLength: "Qualification Must contain atleast 2 characters",
    };
  }

  // if (formData?.DeviceID.trim() === "") {
  //   err = { ...err, DeviceID: "This Field is Required" };
  // }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (formData?.Email.trim() !== "" && !emailRegex.test(formData?.Email)) {
    err = { ...err, Emailvalid: "Enter a valid email address" };
  }

  if (formData?.Gender === "") {
    err = { ...err, Gender: "Select Gender" };
  }

  if (formData?.DocumentType === "") {
    err = { ...err, DocumentType: "Select Document Type" };
  }
  if (formData?.DocumentNo.trim() == "") {
    err = { ...err, DocumentNo: "This Field is Required" };
  }
  // Only for document types with no length of their own. Aadhaar and PAN each
  // have an exact length checked just below, and telling someone their Aadhaar
  // must be "greater than 6" when it must be exactly 12 sends them to a number
  // that will be rejected again. The specific rule is the useful one, so the
  // generic minimum steps aside for those two.
  if (
    formData?.DocumentType != "90" &&
    formData?.DocumentType != "56" &&
    formData?.DocumentNo.trim().length <= 6
  ) {
    err = {
      ...err,
      DocumentNolength: "Document Length Must be Greator than 6 length",
    };
  }
  if (formData?.DocumentType == "90") {
    if (formData?.DocumentNo.trim().length != 12) {
      err = { ...err, Aadharlength: "Aadhar Number Must Be of 12 length" };
    }
  }
  if (formData?.DocumentType == "56") {
    if (formData?.DocumentNo.trim().length != 10) {
      err = { ...err, PanLength: "Pan Number Must Be of 10 length" };
    }
  }

  if (formData?.UserName.trim() === "") {
    err = { ...err, UserName: "This Field is Required" };
  }
  if (!formData?.PhelebotomistId || formData?.IsPassword) {
    if (formData?.Password.trim() === "") {
      err = { ...err, Password: "This Field is Required" };
    }

    const PassCheck =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

    if (
      formData?.Password.trim().length > 0 &&
      !PassCheck.test(formData?.Password)
    ) {
      err = {
        ...err,
        Passwordl:
          "Password Must of 8 Character including One UpperCase, One Lowercase, One Number and One Special Character",
      };
    }
  }

  if (formData?.UserName.trim().length <= 3) {
    err = { ...err, UserNameL: "Username Must be of 4 Character" };
  }
  if (formData?.PhelboSource.trim() === "") {
    err = { ...err, PhelboSource: "This Field is Required" };
  }

  if (formData?.StateId.length == 0) {
    err = { ...err, State: "Select atleast one State" };
  }
  if (formData?.CityId.length == 0) {
    err = { ...err, City: "Select atleast one City" };
  }
  if (formData?.LoginTime == "") {
    err = { ...err, LoginTime: "This Field is Required" };
  }
  if (formData?.LogoutTime == "") {
    err = { ...err, LogoutTime: "This Field is Required" };
  }
  if (formData?.P_Pincode.trim().length > 0) {
    if (formData?.P_Pincode?.trim().length != 6) {
      err = { ...err, PincodeLength: "Pincode Must be of 6 length" };
    }
  }
  if (formData?.PanNo.trim().length > 0) {
    if (formData?.PanNo?.trim().length != 10) {
      err = { ...err, PanLength: "Pan Number Must Be of 10 length" };
    }
  }
  if (formData?.P_Address.trim().length > 0) {
    if (formData?.P_Address?.trim().length < 3) {
      err = {
        ...err,
        P_Addresslength: "Address Must contain atleast 3 characters",
      };
    }
  }
  if (formData?.P_City.trim().length > 0) {
    if (formData?.P_City?.trim().length < 3) {
      err = {
        ...err,
        P_Citylength: "City Must contain atleast 3 characters",
      };
    }
  }
  if (formData?.Other_Contact.length > 0) {
    if (formData?.Other_Contact?.length != 10) {
      err = { ...err, OtherContact: "Phone Number Must Be of 10 length" };
    }
  }
  if (formData?.FatherName.trim().length > 0) {
    if (formData?.FatherName?.trim().length < 3) {
      err = {
        ...err,
        FatherNameLength: "Name Must contain atleast 3 characters",
      };
    }
  }
  if (formData?.MotherName.trim().length > 0) {
    if (formData?.MotherName?.trim().length < 3) {
      err = {
        ...err,
        MotherNameLength: "Name Must contain atleast 3 characters",
      };
    }
  }
  if (
    formData?.Vehicle_Num.trim().length > 0 &&
    formData?.Vehicle_Num.trim().length < 5
  ) {
    err = {
      ...err,
      Vehicle_NumLength: "Vehicle Number Must cantain atleast 5 characters",
    };
  }
  // Threshold was 11 while the message said 10, so someone who read the message,
  // typed exactly 10 characters as instructed and saved again was told the same
  // thing was still wrong, with no way to work out what it actually wanted.
  // Matched to the message, which is also what every other rule in this function
  // does - Father/Mother name check < 3 and say 3, Vehicle_Num checks < 5 and
  // says 5. The same length is checked again where the field is rendered in
  // PhelebotomistRegisteration.jsx, and both have to agree.
  if (
    formData?.DrivingLicence.trim().length > 0 &&
    formData?.DrivingLicence.trim().length < 10
  ) {
    err = {
      ...err,
      DrivingLicence_NumLength:
        "Driving License Must contain atleast 10 characters",
    };
  }

  return err;
};

export const CouponCheck = (value) => {
  const reg = /^(?!.*,{2,}|^,)[a-zA-Z0-9\-\/, ]*$/;
  return reg.test(value);
};

export const CouponMasterSchema = (formData) => {
  let err = "";
  if (formData?.FromDate == "") {
    err = { ...err, FromDate: "This Field is Required" };
  }
  if (formData?.ToDate == "") {
    err = { ...err, ToDate: "This Field is Required" };
  }
  if (formData?.centresId.length == 0) {
    err = { ...err, Centre: "Select atleast one centre" };
  }
  if (typeof formData?.CouponCode == "string") {
    if (formData?.CouponCode.trim() == "") {
      err = { ...err, CouponCode: "This Field is Required" };
    }
  }
  if (formData?.CoupanName.trim() == "") {
    err = { ...err, CouponName: "This Field is Required" };
  }
  if (
    formData?.CoupanName.trim().length > 0 &&
    formData?.CoupanName.trim().length < 3
  ) {
    err = {
      ...err,
      CouponNameLength: "Name should contain atleast 3 characters",
    };
  }
  if (formData?.CouponId == "") {
    err = { ...err, CouponId: "This Field is Required" };
  }
  if (formData?.multiple == "multiple") {
    if (formData?.CouponCount == "") {
      err = { ...err, CouponCount: "This Field is Required" };
    }
  }
  if (formData?.multiple == "multiple") {
    if (formData?.CouponCount == 0 || formData?.CouponCount == "0") {
      err = { ...err, CouponCountzer: "Coupon count must be greater than 0" };
    }
  }
  if (typeof formData?.DiscShareType == "number") {
    console.log(formData?.DiscShareType);
    if (
      formData?.DiscShareType != 0 &&
      formData?.DiscShareType != 1 &&
      formData?.DiscShareType != 2
    ) {
      err = { ...err, DiscShareType: "This Field is Required" };
    }
  }
  if (typeof formData?.DiscShareType == "string") {
    if (formData?.DiscShareType == "") {
      err = { ...err, DiscShareType: "This Field is Required" };
    }
  }
  return err;
};

export const ItemMasterInterfaceValidationSchema = (payload) => {
  let err = "";
  if (payload?.InterfaceCompany === "") {
    err = { ...err, InterfaceCompany: "This Field is Required" };
  }
  if (payload?.Department === "") {
    err = { ...err, Department: "This Field is Required" };
  }
  if (payload?.Test === "") {
    err = { ...err, Test: "This Field is Required" };
  }
  if (payload?.InterfaceTestCode?.trim() === "") {
    err = { ...err, InterfaceTestCode: "This Field is Required" };
  }
  // if (payload?.InterfaceTestName?.trim() === "") {
  //   err = { ...err, InterfaceTestName: "This Field is Required" };
  // }
  return err;
};

export const CentreMasterInterfaceValidationSchema = (payload) => {
  let err = "";
  if (payload?.Centre === "") {
    err = { ...err, Centre: "This Field is Required" };
  }
  if (payload?.RatetypeId === "") {
    err = { ...err, Centre: "This Field is Required" };
  }
  if (payload?.InterfaceCompany === "") {
    err = { ...err, InterfaceCompany: "This Field is Required" };
  }
  if (payload?.CentreIdInterface?.trim() === "") {
    err = { ...err, CentreIdInterface: "This Field is Required" };
  }
  if (payload?.InterfaceCentreName?.trim() === "") {
    err = { ...err, InterfaceCentreName: "This Field is Required" };
  }

  return err;
};
export const EstimateBillValidationSchema = (LTData, state, tableData) => {
  let err = {};

  if (!LTData?.PName?.trim()) {
    err = { ...err, PName: "This Field is Required" };
  }
  if (!LTData?.Mobile?.trim()) {
    err = { ...err, Mobile: "This Field is Required" };
  } else if (!/^\d{10}$/.test(LTData?.Mobile)) {
    err = { ...err, Mobile: "This Field is Required" };
  }
  if (tableData.length == 0) {
    err = { ...err, tableData: "Please Select a Test" };
  }

  return err;
};

export const validationRole = (formData) => {
  let err = "";
  if (formData?.RoleName.trim() === "") {
    err = { ...err, RoleName: "This Field is Required" };
  }
  return err;
};

export const validateSampleTypeHMIS = (formData) => {
  let err = "";
  if (formData?.InterfaceCompany === "") {
    err = { ...err, InterfaceCompany: "This Field is Required" };
  }
  if (formData?.HmisSampleName.trim() === "") {
    err = { ...err, SampleName: "This Field is Required" };
  }
  if (formData?.HmisSampleName.trim().length < 2) {
    err = { ...err, SampleNames: "Must have 2 Character" };
  }

  if (formData?.HmisSampleCode.trim() === "") {
    err = { ...err, SampleCode: "This Field is Required" };
  }
  if (formData?.SampleTypeID === 0) {
    err = { ...err, SampleTypeID: "This Field is Required" };
  }
  return err;
};
export const validationHMIS = (formData) => {
  let err = "";
  if (formData?.InterfaceCompany === "") {
    err = { ...err, InterfaceCompany: "This Field is Required" };
  }
  if (formData?.HmisDepartment.trim() === "") {
    err = { ...err, HmisDepartment: "This Field is Required" };
  }
  if (formData?.HmisDepartment.trim().length < 2) {
    err = { ...err, HmisDepartments: "Must have 2 Character" };
  }

  if (formData?.HmisDepartmentCode.trim() === "") {
    err = { ...err, HmisDepartmentCode: "This Field is Required" };
  }
  if (formData?.HmisDepartmentCode.trim().length < 2) {
    err = { ...err, HmisDepartmentCodes: "Must have 2 Character" };
  }
  if (formData?.DepartmentID === 0) {
    err = { ...err, DepartmentID: "This Field is Required" };
  }
  return err;
};

export const ImmunoHistoMasterSchema = (formData) => {
  let err = "";

  if (formData?.Name.trim() === "") {
    err = { ...err, Name: "This Field is Required" };
  }
  if (formData?.Markercode.trim() === "") {
    err = { ...err, Markercode: "This Field is Required" };
  }

  return err;
};

//Store
export const VendorMasterValidationSchema = (payload) => {
  let err = "";
  if (payload?.SupplierName === "") {
    err = { ...err, SupplierName: "This Field is Required" };
  }
  if (payload?.SupplierType === null) {
    err = { ...err, SupplierType: "This Field is Required" };
  }
  if (payload?.SupplierCategory === null) {
    err = { ...err, SupplierCategory: "This Field is Required" };
  }
  if (payload?.OrganizationType === null) {
    err = { ...err, OrganizationType: "This Field is Required" };
  }
  if (payload?.PrimaryContactPerson === "") {
    err = { ...err, PrimaryContactPerson: "This Field is Required" };
  }

  return err;
};

export const VendorQuotationValidationSchema = (payload = {}) => {
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || String(value).trim() === "") {
      return `${key} is required`;
    }
  }
  return ""; // no errors
};

export const VendorQuotationAllItemSchema = (payload) => {
  let err = "";
  if (payload?.SupplierName === "") {
    err = { ...err, SupplierName: "This Field is Required" };
  }
  if (payload?.DeliveryState === "") {
    err = { ...err, DeliveryState: "This Field is Required" };
  }
  if (payload?.DeliveryLocation?.length === 0) {
    err = { ...err, DeliveryLocation: "This Field is Required" };
  }
  if (payload?.Machine === "") {
    err = { ...err, Machine: "This Field is Required" };
  }
  return err;
};

export const VendorQuotationItemSchema = (payload) => {
  let err = "";
  if (payload?.SupplierName === "") {
    err = { ...err, SupplierName: "This Field is Required" };
  }
  if (payload?.DeliveryState === "") {
    err = { ...err, DeliveryState: "This Field is Required" };
  }
  if (payload?.DeliveryLocation?.length === 0) {
    err = { ...err, DeliveryLocation: "This Field is Required" };
  }
  if (payload?.Machine === "") {
    err = { ...err, Machine: "This Field is Required" };
  }
  if (payload?.ItemName === "") {
    err = { ...err, ItemName: "This Field is Required" };
  }
  return err;
};
