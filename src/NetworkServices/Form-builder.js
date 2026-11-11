// NOTE: Backend endpoints for the Form Builder module are not wired up yet.
// All real API calls below are commented out so the FormBuilder pages can be
// integrated and navigated without breaking the build. Each function returns
// a safe empty/default response shaped the same way the callers expect.
import makeApiRequest from "../utils/axiosInstance";
// import { apiUrls } from "../utils/apiEndpoints";

export const FormBuilderGetFieldTypeMaster = async () => {
  try {
    const options = { method: "GET" };
    const data = await makeApiRequest(
      "FormBuilder/GetFieldTypeMaster",
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderGetFormTypeMaster = async () => {
  try {
    const options = { method: "GET" };
    const data = await makeApiRequest(
      "FormBuilder/GetFormTypeMaster",
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderGetOtherTableLinkage = async (isGeneral) => {
  try {
    const options = { method: "GET" };
    const data = await makeApiRequest(
      `FormBuilder/GetOtherTableLinkage?Type=${isGeneral}`,
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderCreateAndUpdateFormLayout = async (params) => {
  try {
    const options = { method: "POST", data: params };
    const data = await makeApiRequest(
      "FormBuilder/CreateAndUpdateFormLayout",
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderGetFormPreviewByFormId = async (formId) => {
  try {
    const options = { method: "GET" };
    const data = await makeApiRequest(
      `FormBuilder/GetFormPreviewByFormId?form_id=${formId}`,
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderGetFormSubmissionByPatient = async (
  formId,
  patientID,
  transactionID,
) => {
  try {
    const options = { method: "GET" };
    const data = await makeApiRequest(
      `FormBuilder/GetFormSubmissionByPatient?form_id=${formId}&patient_id=${patientID}&transaction_id=${transactionID}`,
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderSaveFormSubmission = async (params) => {
  try {
    const options = { method: "POST", data: params };
    const data = await makeApiRequest(
      "FormBuilder/SaveFormSubmission",
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderGetOptionValue = async (tableLinkageId) => {
  try {
    const options = { method: "GET" };
    const data = await makeApiRequest(
      `FormBuilder/GetOptionValue?table_linkage_id=${tableLinkageId}`,
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderGetPatientDefaultValue = async (
  linkageId,
  patientID,
  transactionID,
) => {
  try {
    const options = { method: "GET" };
    const data = await makeApiRequest(
      `FormBuilder/GetPatientDefaultValue?table_linkage_id=${linkageId}&patientID=${patientID}&TransactionID=${transactionID}`,
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderPrintForm = async (params) => {
  try {
    const options = { method: "POST", data: params };
    const data = await makeApiRequest(
      "FormBuilder/PrintForm",
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderSaveFormSendToEmail = async (params) => {
  try {
    // const options = { method: "POST", data: params };
    // const data = await makeApiRequest(
    //   "FormBuilderController/SaveFormSendToEmail",
    //   options,
    // );
    // return data;
    return { success: false, data: null, message: "API not connected yet" };
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderGetFormsList = async (
  startDate,
  endDate,
  statusValue,
) => {
  try {
    const options = { method: "GET" };
    const data = await makeApiRequest(
      `FormBuilder/GetFormsList?fromDate=${startDate}&toDate=${endDate}&status=${statusValue}`,
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};

export const FormBuilderUpdateStatus = async (params) => {
  try {
    const options = { method: "POST", data: params };
    const data = await makeApiRequest(
      "FormBuilder/UpdateStatus",
      options,
    );
    return data;
  } catch (error) {
    console.error("Error Found", error);
  }
};
