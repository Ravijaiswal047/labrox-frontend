import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import ReactSelect from "../../components/formComponent/ReactSelect";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { Button } from "react-bootstrap";
import FileUpload from "./FileUpload";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiEndpoints";
import { notify } from "../../utils/utils";
import { useDispatch } from "react-redux";
import { clearFiles } from "../../store/reducers/fileUploadSlice/fileUploadSlice";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";

const ViewIssueModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ticketInfo, setTicketInfo] = useState([]);
  const { viewIssueModalData } = useSelector((data) => data.ticketing);
  const [dropdownList, setDropdownList] = useState({
    responseList: [],
    replyAndResolveLog: [],
  });
  const initialPayload = {
    predefindResponse: "",
    reply: "",
    uploadFile: {},
  };
  const [payload, setPayload] = useState(initialPayload);

  console.log("viewIssueModalData", viewIssueModalData);

  const issueComments = [
    {
      name: "KANIKA YADAV",
      team: "SUPPORT",
      comment: "msf required",
      timestamp: "01 Aug 2025 03:34 PM",
    },
    {
      name: "KRIPA KUMARI (GGN_CCG)",
      team: "SUPPORT",
      comment: "informed to faridabad group",
      timestamp: "01 Aug 2025 04:05 PM",
    },
  ];

  const responseOptions = [
    { label: "Select Response", value: 0 },
    { label: "Response", value: 1 },
    { label: "auto", value: 2 },
    { label: "dummy response", value: 3 },
    { label: "Demo Response", value: 4 },
    { label: "Informed to client", value: 5 },
    { label: "Informed to Sales(            )", value: 6 },
    { label: "Test code changed , also informed to sales(        )", value: 7 },
    { label: "billing done and informed to SRA", value: 8 },
    { label: "History received and informed to histo group", value: 9 },
    { label: "Sample stability over so we are closing the ticket", value: 10 },
    { label: "Escalated till Ashish Sir", value: 11 },
    { label: "Escalated till  Jitender Sir", value: 12 },
    { label: "Escalated till  Dr. Magu", value: 13 },
    { label: "Informed to", value: 14 },
    {
      label: "Reminder 1 forwarded to by call and msg",
      value: 15,
    },
    { label: "Adhar card attached in LIs a slo informed to dept", value: 16 },
    { label: "USG  attached in LIs a slo informed to dept", value: 17 },
    { label: "Add on done and informed to", value: 18 },
    { label: "as per client plz discard the sample", value: 19 },
    { label: "Tried to call to the patient but not responding", value: 20 },
    { label: "expired blood culture bottel received", value: 21 },
    { label: "Reminder 1 forwarded to", value: 22 },
  ];

  const infoFields = [
    {
      label: "Issue No",
      value: ticketInfo?.IssueNo || viewIssueModalData?.IssueNo || "N/A",
    },
    { label: "Created By", value: ticketInfo?.CreatedByName || "N/A" },
    { label: "Status", value: ticketInfo?.Status || "N/A" },
    { label: "Barcode No.", value: ticketInfo?.BarcodeNo || "N/A" },
    { label: "Visit No.", value: ticketInfo?.LedgertransactionNo || "N/A" },
    { label: "Client", value: ticketInfo?.ClientName || "N/A" },
    { label: "Test", value: ticketInfo?.TestName || "N/A" },
    { label: "Mobile No.", value: ticketInfo?.Mobile || "N/A" },
    { label: "Submit Date", value: ticketInfo?.dtEntry || "N/A" },
    { label: "Subject", value: ticketInfo?.SUBJECT || "N/A" },
  ];

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, value, files } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: e.target.type === "file" ? files[0] : value,
    }));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result); // strip "data:*/*;base64,"
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileResponse = async (files) => {
    if (files) {
      const fileArray = Array.isArray(files) ? files : [files];
      const documentData = await Promise.all(
        fileArray.map(async (file) => await fileToBase64(file))
        // fileArray.map(async (file) => ({
        //   fileName: file.name,
        //   fileBase64: await fileToBase64(file),
        // }))
      );
      setPayload((prev) => ({ ...prev, uploadFile: documentData }));
    } else {
      console.log("File cleared");
    }
  };

  const getTicketInfo = async () => {
    const ticketInfoPayload = {
      type: "TicketInfo",
      categoryId: 0,
      queryID: 0,
      responseID: 0,
      priorityID: 0,
      ticketID: viewIssueModalData?.ID,
    };
    await axiosInstance
      .post(apiUrls?.GetDataMaster, ticketInfoPayload)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.message, "success");
          return;
        }
        console.log("res?.data?.messageVIew", res?.data?.message);
        setTicketInfo(res?.data?.message?.[0]);
        getReplyLog();
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const saveReply = async (type = "") => {
    if (
      ticketInfo?.isresolved ||
      dropdownList?.replyAndResolveLog?.[
        dropdownList?.replyAndResolveLog?.length - 1
      ]?.isresolved === 1
    ) {
      notify("This has been resolved.", "warn");
      return;
    }
    if (!type) {
      notify("Something went wrong", "error");
      return;
    }
    if(!payload?.predefindResponse){
      notify("Resolved Response is required.", "error");
      return;
    }
    if(!cpayload?.reply){
      notify("Reply is required.", "error");
      return;
    }
    const selectedResponse = dropdownList?.responseList?.find(
      (item) => item?.value === String(payload?.predefindResponse)
    );
    // return
    const saveRepyPayload = {
      ticketID: viewIssueModalData?.ID,
      queryID: selectedResponse?.value,
      query: selectedResponse?.label,
      // files: payload?.uploadFile,
      files: [],
      reply: payload?.reply,
      transactionType: type,
    };
    await axiosInstance
      .post(apiUrls?.SaveTicketReply, saveRepyPayload)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.message, "success");
          handleReset();
          getReplyLog();
          return;
        }
        console.log("SaveTicketReply", res?.data?.message);
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const fetchInitialList = async () => {
    const fetchReponseListPaylod = {
      type: "ResponseList",
      categoryId: 0,
      queryID: 0,
      responseID: 0,
      priorityID: 0,
      ticketID: 0,
    };
    await axiosInstance
      .post(apiUrls?.GetDataMaster, fetchReponseListPaylod)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.message, "success");
          return;
        }
        console.log("replyAndResolveLog", res?.data?.message);
        let resList = res?.data?.message?.map((item, idx) => ({
          ...item,
          label: item?.SUBJECT,
          value: String(item?.Id),
        }));
        setDropdownList((prev) => ({ ...prev, responseList: resList }));
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };
  const getReplyLog = async () => {
    const replyPaylod = {
      type: "TicketResponseInfo",
      categoryId: 0,
      queryID: 0,
      responseID: 0,
      priorityID: 0,
      ticketID: ticketInfo?.IssueNo || viewIssueModalData?.ID,
    };
    await axiosInstance
      .post(apiUrls?.GetDataMaster, replyPaylod)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.message, "success");
          return;
        }
        console.log("fetchInitialList", res?.data?.message);
        setDropdownList((prev) => ({
          ...prev,
          replyAndResolveLog: res?.data?.message,
        }));
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const handleReset = () => {
    setPayload(initialPayload);
    dispatch(clearFiles());
  };

  useEffect(() => {
    if (viewIssueModalData?.ID) {
      getTicketInfo();
    }
    fetchInitialList();
  }, [viewIssueModalData?.ID]);

  return (
    <div className="container-fluid p-0">
      <div className="row px-2 g-3">
        {infoFields.map((field, index) => (
          <div className="col-12 col-md-6 col-lg-4" key={index}>
            <p className="mb-1">
              <strong>{field.label} : </strong>
              <span>{field.value || "-"}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 w-100" style={{ background: "#f9f9f9" }}>
        {dropdownList?.replyAndResolveLog?.map((log, index) => (
          <div key={index} className="border-bottom px-2 pb-2 mb-3">
            <div className="d-flex justify-content-between flex-wrap">
              <div>
                <strong>{log.CreatedByName}</strong>
                <div className="text-muted small">{log?.RoleName}</div>
              </div>
              <div className="text-end">
                <strong className="">Date: {log?.dtEntry}</strong>
                {log.isresolved === 1 && (
                  <div style={{ color: "green" }} className="mt-2">
                    {"Resolved"}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2">{log.Detail}</div>
          </div>
        ))}
      </div>
      <h1 style={{ fontWeight: "700" }} className="px-2">
        Enter Resolve Response -
      </h1>
      <div className="row px-2">
        <div className="col-sm-3 col-md-4">
          <ReactSelect
            dynamicOptions={dropdownList?.responseList}
            name="predefindResponse"
            lable={t("Predefind Response")}
            id="predefindResponse"
            removeIsClearable={true}
            placeholderName={t("Predefind Response")}
            value={payload?.predefindResponse}
            onChange={handleReactChange}
            className="required-fields"
          />
        </div>
        <div className="col-md-3 col-sm-4">
          <FileUpload
            allowedTypes={[""]} // or "*" for all
            uploadSize="multiple" // "single" | "multiple"
            onFileSelect={handleFileResponse}
          />
        </div>
        <div className="col-sm-3 textaresdf col-md-4">
          <TextAreaInput
            type="text"
            name="reply"
            lable="Enter Reply"
            id="reply"
            value={payload.reply}
            placeholder=" "
            rows={2}
            onChange={handleChange}
          />
        </div>
        <div
          style={{ gap: "4px" }}
          className="w-100 d-flex align-items-center justify-content-center flex-wrap"
        >
          <Button onClick={() => saveReply("Resolved")} className="px-4">
            Resolved
          </Button>
          <Button onClick={() => saveReply("Insert")} className="px-4">
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewIssueModal;
