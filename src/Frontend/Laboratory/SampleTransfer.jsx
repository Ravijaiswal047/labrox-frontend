import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPrint, faSpinner } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import PendingBarcodeModal from "../utils/PendingBarcodeModal";
import { toast } from "react-toastify";
import { ExportToExcel, SRAFormatDate } from "../../utils/helpers";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CancelButton, CustomButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Tooltip } from "primereact/tooltip";
import moment from "moment";

const SampleTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [allCenter, setAllCenter] = useState("0");
  const [isCollectionCentre, setIsCollectionCentre] = useState(false);
  const [fieldBoyOptions, setFieldBoyOptions] = useState([]);
  const [transferToOptions, setTransferToOptions] = useState([]);
  const [payload, setPayload] = useState({
    center: "",
    sinNo: "",
    batchNo: "",
  });

  const [showPendingBarcodeModal, setShowPendingBarcodeModal] = useState(false);
  const [batchesFilter, setBatchesFilter] = useState({
    fromDate: SRAFormatDate(new Date()),
    toDate: SRAFormatDate(new Date()),
  });
  const [batchDetail, setBatchDetail] = useState([]);
  const [pendingBatches, setPendingBatches] = useState([]);
  const [getBathes, setGetBatches] = useState([]);
  const [isBatchTransfer, setIsBatchTransfer] = useState(false);
  const [batchTransfer, setBatchTransfer] = useState({
    batchNo: "",
    fieldBoyId: "",
    fieldBoyName: "",
    courierDetail: "By Air",
    docketNo: "",
  });

  const [showReject, setShowReject] = useState({
    show: false,
    data: null,
  });
  const [reasonsOptions, setReasonsOptions] = useState([]);
  const [rejectedPayload, setRejectedPayload] = useState({
    Barcode: "",
    testIds: "",
    rejectionReasonId: "",
    rejectionReason: "",
  });
  const [printLoading, setPrintLoading] = useState(null);
  const [inHouseModal, setInHouseModal] = useState({ open: false, data: [], loading: false, batchNo: "", toCentre: "", sinNo: "", addLoading: false });
  const [testSelectModal, setTestSelectModal] = useState({
    open: false,
    tests: [],
    selectedTestIds: [],
    loading: false,
  });
  const [removeModal, setRemoveModal] = useState({
    open: false,
    batch: null,
    reason: "",
    loading: false,
  });

  const [t] = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const getCentreLabel = (centreId, fallbackName = "") => {
    if (fallbackName) return fallbackName;
    if (!centreId && centreId !== 0) return "";
    return (
      transferToOptions.find((o) => String(o.value) === String(centreId))
        ?.label || ""
    );
  };

  const resolveBatchToCentre = (batchNo) => {
    if (!batchNo) return getCentreLabel(payload.center);
    const fromPending = pendingBatches.find(
      (b) => String(b.dispatchcode) === String(batchNo),
    );
    if (fromPending?.ToCentre) return fromPending.ToCentre;
    const fromTransferred = getBathes.find(
      (b) => String(b.dispatchcode) === String(batchNo),
    );
    if (fromTransferred?.ToCentre) return fromTransferred.ToCentre;
    return getCentreLabel(
      fromPending?.ToCentreID ?? fromTransferred?.ToCentreID ?? payload.center,
    );
  };

  const formatBatchWithCentre = (batchNo, toCentreName) => {
    if (!batchNo) return "";
    const centre = toCentreName || resolveBatchToCentre(batchNo);
    return centre
      ? `${t("Batch No")}: ${batchNo} | ${t("To Centre")}: ${centre}`
      : `${t("Batch No")}: ${batchNo}`;
  };

  // fetch centres
  useEffect(() => {
    const fetchCentre = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.post("SRA/BindSampleTransferCentre", {
          AllCentre: allCenter,
        });

        const data = res?.data?.message || [];
        const mapped = data.map((r) => ({
          label: r.Centre,
          value: String(r.CentreID),
        }));

        const collectionCentre = !!(
          res?.data?.data?.isCollectionCentre ??
          res?.data?.Data?.isCollectionCentre
        );
        setIsCollectionCentre(collectionCentre);
        if (collectionCentre && allCenter !== "0") {
          setAllCenter("0");
        }

        setTransferToOptions(mapped);
        setPayload((prev) => ({ ...prev, center: mapped.length > 0 ? mapped[0].value : "" }));
      } catch (err) {
        console.error("Failed to load centers", err);
        setTransferToOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCentre();
  }, [allCenter]);

  // fetch pending batches
  const fetchPendingBatches = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("SRA/batch-pending");

      const data = res?.data?.message || [];

      setPendingBatches(data);
    } catch (err) {
      console.error("Failed to load centers", err);
      setPendingBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBatches();
  }, []);

  // fetch field Boy
  useEffect(() => {
    const fetchFieldBoys = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("FieldBoyMaster/BindFieldBoy");

        const data = res?.data?.message || [];

        const mapped = [
          { label: "Select", value: "" },
          ...data.map((r) => ({
            label: r.NAME,
            value: String(r.FieldBoyID),
          })),
        ];

        setFieldBoyOptions(mapped);
      } catch (err) {
        console.error("Failed to load centers", err);
        setFieldBoyOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFieldBoys();
  }, []);

  const handleDateSelect = (...args) => {
    const date = args[0];
    const fieldName = args[1];

    const val = date ? new Date(date).toISOString() : null;
    setBatchesFilter((prev) => ({ ...prev, [fieldName]: val }));
  };

  const searchBatches = async () => {
    setLoading(true);
    try {
      const payload = {
        fromDate: moment(batchesFilter.fromDate).format("YYYY-MM-DD") || "",
        toDate: moment(batchesFilter.toDate).format("YYYY-MM-DD") || "",
      };

      const res = await axiosInstance.post("SRA/GetBatches", payload);
      // adjust depending on API response shape
      const data = res?.data?.message ?? res?.data ?? [];
      setGetBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load batches", err);
      setGetBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (name, option) => {
    setPayload((prev) => ({
      ...prev,
      [name]: option?.value ?? null
    }));
  };


  const handleCheckboxAllCenter = (e) => {
    const checked = e.target.checked;
    setAllCenter(checked ? "1" : "0");
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "sinNo") setPayload((prev) => ({ ...prev, sinNo: value }));
    if (id === "batchNo") setPayload((prev) => ({ ...prev, batchNo: value }));
  };

  const handleNewBatch = async () => {
    if (payload.batchNo) {
      const ok = window.confirm("Do you want to generate a new batch no. ?");
      if (!ok) return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get("SRA/GenerateBatch", {});
      const data = res?.data?.message;
      const newBatch = data?.BatchNo ?? "";
      setPayload((prev) => ({ ...prev, batchNo: String(newBatch) }));
      setBatchDetail([]); // avoid carrying previous batch vial counts
    } catch (err) {
      console.error("Failed to get new batch", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBatch = async () => {
    if (!payload.batchNo) {
      toast.error("Batch no is required!");
      return;
    }
    if (!payload.sinNo) {
      toast.error("Sin no is required!");
      return;
    }
    if (!payload.center) {
      toast.error("Center is required!");
      return;
    }
    // const searchPayload = {
    //   center: payload.center || "0",
    //   sinNo: payload.sinNo || "",
    //   dispatchCode: payload.batchNo || "",
    // };

    const searchPayload = {
      batchNo: String(payload.batchNo),
      barcodeNo: String(payload.sinNo),
      toCentreID: Number(payload.center),
    };

    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/SampleSearchBatch", [searchPayload]);
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        fetchPendingBatches();
        handleBatchDetail(payload.batchNo);
        setPayload((prev) => ({ ...prev, sinNo: "" }));
      } else {
        toast.error(res?.data?.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Search failed", err);
      toast.error(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDetail = async (batchNo) => {
    if (!batchNo) {
      toast.error("Batch no is required!");
      return;
    }
    // Clear immediately so previous batch vial qty never flashes/carries forward
    setBatchDetail([]);
    setPayload((prev) => ({ ...prev, batchNo: String(batchNo) }));
    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/fill-by-dispatch", {
        dispatchCode: batchNo,
      });
      const message = res.data?.message ?? res.data?.Message ?? [];
      if (Array.isArray(message)) {
        setBatchDetail(message);
      } else if (message && Array.isArray(message.Active ?? message.active ?? message.Items ?? message.items)) {
        setBatchDetail(message.Active ?? message.active ?? message.Items ?? message.items);
      } else {
        setBatchDetail([]);
        if (
          typeof message === "string" &&
          message.toLowerCase().includes("no records")
        ) {
          toast.error("No records found.");
        }
      }
    } catch (err) {
      console.error("Search failed", err);
      setBatchDetail([]);
    } finally {
      setLoading(false);
    }
  };

  const openRemoveFromBatch = (batch) => {
    const sampleLogisticID = Number(
      batch?.sampleLogisticID ?? batch?.SampleLogisticID ?? 0,
    );
    if (!sampleLogisticID) {
      toast.error(t("Unable to remove: missing logistic id"));
      return;
    }
    setRemoveModal({ open: true, batch, reason: "", loading: false });
  };

  const handleRemoveFromBatch = async () => {
    const batch = removeModal.batch;
    const reason = String(removeModal.reason || "").trim();
    const sampleLogisticID = Number(
      batch?.sampleLogisticID ?? batch?.SampleLogisticID ?? 0,
    );
    const batchNo =
      batch?.dispatchCode || batch?.DispatchCode || payload.batchNo;
    const sinNo = batch?.BarcodeNo || batch?.barcodeno || "";

    if (!sampleLogisticID) {
      toast.error(t("Unable to remove: missing logistic id"));
      return;
    }
    if (!reason) {
      toast.error(t("Reason is mandatory to remove sample from batch."));
      return;
    }

    setRemoveModal((prev) => ({ ...prev, loading: true }));
    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/UpdateBatch", {
        SampleLogisticID: sampleLogisticID,
        BatchNo: String(batchNo),
        SinNo: String(sinNo),
        Reason: reason,
      });
      if (res?.data?.success) {
        toast.success(res?.data?.message || t("Removed successfully"));
        setRemoveModal({ open: false, batch: null, reason: "", loading: false });
        handleBatchDetail(batchNo);
        fetchPendingBatches();
      } else {
        toast.error(res?.data?.message || t("Failed to remove"));
        setRemoveModal((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error("Remove from batch failed", err);
      toast.error(err?.response?.data?.message || t("Failed to remove"));
      setRemoveModal((prev) => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Source of truth for No of Vials / per-type Qty:
   * one physical vial = unique BarcodeNo + SampleTypeID in current batchDetail.
   * Dedupes test-level duplicates; recomputes whenever batchDetail changes (add/remove/switch).
   */
  const { vialSummary, totalVialQty } = useMemo(() => {
    const byType = new Map();
    const uniqueVials = new Set();

    (batchDetail || []).forEach((c) => {
      const barcode = String(c?.BarcodeNo ?? c?.Barcodeno ?? "").trim();
      const typeId = String(c?.SampleTypeID ?? c?.SampleTypeId ?? "").trim();
      const typeName = String(c?.SampleTypeName ?? "").trim();
      const typeKey = typeId || typeName;
      if (!barcode || !typeKey) return;

      const vialKey = `${barcode}|${typeKey}`.toLowerCase();
      uniqueVials.add(vialKey);

      if (!byType.has(typeKey)) {
        byType.set(typeKey, {
          SampleTypeID: c?.SampleTypeID ?? c?.SampleTypeId,
          SampleTypeName: typeName || typeKey,
          ColorName: c?.ColorName,
          barcodes: new Set(),
        });
      }
      byType.get(typeKey).barcodes.add(barcode.toLowerCase());
    });

    const summary = Array.from(byType.values()).map((item) => ({
      SampleTypeID: item.SampleTypeID,
      SampleTypeName: item.SampleTypeName,
      ColorName: item.ColorName,
      Noofvials: item.barcodes.size,
    }));

    return {
      vialSummary: summary,
      totalVialQty: uniqueVials.size,
    };
  }, [batchDetail]);

  // Keep Batch Table Vial Qty in sync with the same vial source of truth as "No of Vials"
  useEffect(() => {
    if (loading) return; // avoid writing 0 while clearing detail for a batch switch/reload
    const batchNo = String(payload?.batchNo || "").trim();
    if (!batchNo) return;

    const syncQty = (list) =>
      (list || []).map((b) =>
        String(b?.dispatchcode ?? b?.DispatchCode ?? "") === batchNo
          ? { ...b, Quantity: totalVialQty }
          : b,
      );

    setPendingBatches((prev) => {
      const next = syncQty(prev);
      const changed = next.some((b, i) => b.Quantity !== prev[i]?.Quantity);
      return changed ? next : prev;
    });
    setGetBatches((prev) => {
      const next = syncQty(prev);
      const changed = next.some((b, i) => b.Quantity !== prev[i]?.Quantity);
      return changed ? next : prev;
    });
  }, [payload?.batchNo, totalVialQty, loading]);

  const getContrastColor = (hexColor) => {
    if (!hexColor || hexColor.charAt(0) !== '#') return 'black';

    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  };

  const openPendingModal = () => {
    setShowPendingBarcodeModal(true);
  };

  const handleBatchTransferInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "batchNo")
      setBatchTransfer((prev) => ({ ...prev, batchNo: value }));
    if (id === "courierDetail")
      setBatchTransfer((prev) => ({ ...prev, courierDetail: value }));
    if (id === "docketNo")
      setBatchTransfer((prev) => ({ ...prev, docketNo: value }));
  };

  const handleBatchTransferSelectChange = (name, value) => {
    setBatchTransfer((prev) => ({
      ...prev,
      [name]: value?.value
    }))
  }

  const handleSubmitBatch = async () => {
    if (!batchTransfer.batchNo) {
      toast.error("Batch no is required!");
      return;
    }
    if (!batchTransfer.fieldBoyId) {
      toast.error("Field Boy is required!");
      return;
    }

    const selectedFieldBoy = fieldBoyOptions.find(opt => opt.value === batchTransfer.fieldBoyId)
    const fieldBoyName = selectedFieldBoy ? selectedFieldBoy.label : "";

    const payload = {
      batchNo: batchTransfer.batchNo,
      fieldBoyID: batchTransfer.fieldBoyId,
      fieldBoy: fieldBoyName,
      courierDetail: batchTransfer.courierDetail || "",
      courierDocketNo: batchTransfer.docketNo || "",
      otherBoy: "0",
      cashAmount: "0",
    };

    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/UpdateBatchStatus", payload);
      const data = res?.data;

      if (data.success) {
        toast.success(data?.message);
        printReport(batchTransfer.batchNo);
        fetchPendingBatches();
        searchBatches();
        setBatchDetail([]);
        setPayload((prev) => ({ ...prev, batchNo: "", sinNo: "" }));
        setBatchTransfer({
          batchNo: "",
          fieldBoyId: "",
          fieldBoyName: "",
          courierDetail: "By Air",
          docketNo: "",
        });
        setIsBatchTransfer(false);
      } else {
        toast.error(data?.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Transfer failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showReject.show) return;
    const fetchReasons = async () => {
      try {
        const res = await axiosInstance.post("Global/getGlobalData", {
          Type: "RejectReason",
        });
        const data = res?.data?.message || [];

        const mapped = data.map((r) => ({
          label: r.FieldDisplay,
          value: String(r.FieldID),
        }));

        mapped.push({ label: "Other", value: "other" });
        setReasonsOptions(mapped);
      } catch (err) {
        console.error("Failed to load reasons", err);
        setReasonsOptions([]);
      }
    };
    fetchReasons();
  }, [showReject.show]);

  const handleReactSelectChange = (name, value) => {
    setRejectedPayload((prev) => ({
      ...prev,
      [name]: value?.value
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRejectedPayload({ ...rejectedPayload, [name]: value });
  };

  const handleRejectBatch = async () => {
    const finalPayload = {
      ...rejectedPayload,
      testIds: rejectedPayload.testIds.split(",").map((id) => String(id)),
    }
    try {
      const res = await axiosInstance.post("SRA/RejectSample", finalPayload);
      if (res?.data?.success) {
        toast.success("Sample rejected");
        setRejectedPayload({
          Barcode: "",
          testIds: "",
          rejectionReasonId: "",
          rejectionReason: "",
        })
        setShowReject({
          show: false,
          data: null,
        })
      } else {
        toast.error(res?.data?.message || "Failed to reject sample");
      }
    } catch (err) {
      console.error("Transfer failed", err);
    }
  }

  const submitAddBatch = async (testIds = []) => {
    const selectedIds = (Array.isArray(testIds) ? testIds : [])
      .map(String)
      .filter(Boolean);

    if (selectedIds.length === 0) {
      toast.error(t("Please select at least one test"));
      return;
    }

    setInHouseModal((prev) => ({ ...prev, addLoading: true }));
    try {
      const res = await axiosInstance.post("SRA/AddBatch", {
        sinNo: inHouseModal.sinNo,
        // send both casings so binding never drops the selection
        testIds: selectedIds,
        TestIds: selectedIds,
        data: [
          {
            batchNo: inHouseModal.batchNo,
            toCentreID: Number(payload.center),
            fieldBoyID: "",
            fieldBoy: "",
            courierDetail: "",
            courierDocketNo: "",
            status: "",
          },
        ],
      });
      if (res.data?.success) {
        toast.success(
          typeof res.data.message === "string"
            ? res.data.message
            : t("Added successfully"),
        );
        setInHouseModal((prev) => ({ ...prev, sinNo: "", addLoading: false }));
        setTestSelectModal({
          open: false,
          tests: [],
          selectedTestIds: [],
          loading: false,
        });
        handleInHouseSearch(inHouseModal.batchNo);
        handleBatchDetail(inHouseModal.batchNo);
        fetchPendingBatches();
      } else {
        toast.error(res.data?.message || t("Something went wrong"));
        setInHouseModal((prev) => ({ ...prev, addLoading: false }));
      }
    } catch (err) {
      console.error("AddBatch failed", err);
      toast.error(err?.response?.data?.message || t("Something went wrong"));
      setInHouseModal((prev) => ({ ...prev, addLoading: false }));
    }
  };

  const handleAddBatch = async () => {
    if (!inHouseModal.sinNo) {
      toast.error(t("SIN No is required!"));
      return;
    }
    if (!inHouseModal.batchNo) {
      toast.error(t("Batch No is required!"));
      return;
    }
    if (!payload.center) {
      toast.error(t("Center is required!"));
      return;
    }

    setInHouseModal((prev) => ({ ...prev, addLoading: true }));
    try {
      const res = await axiosInstance.post("SRA/GetTestByBarcode", {
        Barcode: String(inHouseModal.sinNo).trim(),
      });
      const testsRaw = res?.data?.message ?? res?.data?.Message ?? [];
      const success = res?.data?.success ?? res?.data?.Success;

      if (!success || !Array.isArray(testsRaw) || testsRaw.length === 0) {
        toast.error(
          typeof testsRaw === "string"
            ? testsRaw
            : t("No transferable test found for this barcode"),
        );
        setInHouseModal((prev) => ({ ...prev, addLoading: false }));
        return;
      }

      const tests = testsRaw.map((t) => ({
        department: t?.Department ?? t?.department ?? "",
        testCode: t?.TestCode ?? t?.testCode ?? "",
        testName:
          t?.TestName ??
          t?.testName ??
          t?.ItemName ??
          t?.itemName ??
          "",
        label: t?.ItemName ?? t?.itemName ?? t?.TestName ?? t?.testName ?? "",
        value: String(t?.TestID ?? t?.testID ?? t?.testid ?? ""),
      })).filter((t) => t.value);

      if (tests.length === 0) {
        toast.error(t("No transferable test found for this barcode"));
        setInHouseModal((prev) => ({ ...prev, addLoading: false }));
        return;
      }

      // Single test → add directly without asking
      if (tests.length === 1) {
        await submitAddBatch([tests[0].value]);
        return;
      }

      // Multiple tests → ask which TestName to transfer (none pre-selected)
      setInHouseModal((prev) => ({ ...prev, addLoading: false }));
      setTestSelectModal({
        open: true,
        tests,
        selectedTestIds: [],
        loading: false,
      });
    } catch (err) {
      console.error("GetTestByBarcode failed", err);
      toast.error(err?.response?.data?.message || t("Something went wrong"));
      setInHouseModal((prev) => ({ ...prev, addLoading: false }));
    }
  };

  const handleConfirmSelectedTests = async () => {
    const selected = testSelectModal.selectedTestIds || [];
    if (!selected.length) {
      toast.error(t("Please select at least one test"));
      return;
    }
    setTestSelectModal((prev) => ({ ...prev, loading: true }));
    try {
      await submitAddBatch([...selected]);
    } finally {
      setTestSelectModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const toggleTestSelection = (testId) => {
    setTestSelectModal((prev) => {
      const exists = prev.selectedTestIds.includes(testId);
      return {
        ...prev,
        selectedTestIds: exists
          ? prev.selectedTestIds.filter((id) => id !== testId)
          : [...prev.selectedTestIds, testId],
      };
    });
  };

  const handleInHouseSearch = async (batchNo) => {
    const searchBatchNo = batchNo ?? inHouseModal.batchNo;
    if (!searchBatchNo) {
      toast.error(t("Batch No is required!"));
      return;
    }
    setInHouseModal(prev => ({ ...prev, loading: true, data: [] }));
    try {
      const res = await axiosInstance.post("SRA/SearchBatch", { batchNo: String(searchBatchNo) });
      if (res.data?.success && Array.isArray(res.data?.message)) {
        setInHouseModal(prev => ({ ...prev, data: res.data.message, loading: false }));
      } else {
        toast.error(res.data?.message || t("No data found"));
        setInHouseModal(prev => ({ ...prev, data: [], loading: false }));
      }
    } catch (err) {
      console.error("InHouse search failed", err);
      toast.error(t("Something went wrong"));
      setInHouseModal(prev => ({ ...prev, loading: false }));
    }
  };

  const printReport = async (dispatchCode) => {
    setPrintLoading(dispatchCode);
    const toastId = toast.loading(t("Generating report..."));
    try {
      const res = await axiosReport.post("commonReports/DispatchSampleReport",
        {
          dispatchCode: dispatchCode,
        },
        { responseType: "blob" }
      );
      if (res?.status === 200) {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileURL = window.URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        toast.update(toastId, {
          render: t("Report generated"),
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: res?.data?.message || t("Failed to print report"),
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to print report", error);
      toast.update(toastId, {
        render: t("Failed to generate report"),
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setPrintLoading(null)
    }
  }

  return (
    <>
      <Accordion
        name={t("Sample Transfer")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 px-2 py-2">
          <div className="col-12">
            <div
              className="d-flex flex-wrap align-items-end"
              style={{ gap: "10px" }}
            >
              {/* Transfer To + All Centre */}
              <div
                className="d-flex align-items-end"
                style={{ flex: "1 1 220px", minWidth: "180px", maxWidth: "360px", gap: "12px" }}
              >
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <ReactSelect
                    dynamicOptions={transferToOptions}
                    name="center"
                    lable={t("Transfer To")}
                    id="center"
                    removeIsClearable={true}
                    placeholderName={t("Transfer To")}
                    value={payload.center}
                    onChange={handleSelectChange}
                    isDisabled={loading || transferToOptions.length === 0}
                  />
                </div>
                {!isCollectionCentre && (
                <div
                  className="d-flex align-items-center flex-shrink-0"
                  style={{ height: "38px", gap: "8px" }}
                >
                  <input
                    id="centers"
                    type="checkbox"
                    name="centers"
                    className="form-check-input m-0"
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    checked={allCenter === "1"}
                    onChange={handleCheckboxAllCenter}
                  />
                  <label
                    htmlFor="centers"
                    className="mb-0 text-nowrap"
                    style={{ fontSize: "12px", lineHeight: 1, cursor: "pointer" }}
                  >
                    {t("All Centre")}
                  </label>
                </div>
                )}
              </div>

              {/* SIN No */}
              <div style={{ flex: "0 1 140px", minWidth: "120px", maxWidth: "180px" }}>
                <Input
                  id="sinNo"
                  className="select-input-box form-control form-control-sm"
                  type="text"
                  name="ItemValue"
                  maxLength={20}
                  lable="SIN No"
                  value={payload.sinNo}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEditBatch();
                    }
                  }}
                />
              </div>

              {/* Batch No + New Batch */}
              <div
                className="d-flex align-items-end"
                style={{ flex: "1 1 180px", minWidth: "160px", maxWidth: "300px", gap: "8px" }}
              >
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <Input
                    id="batchNo"
                    className="select-input-box form-control form-control-sm"
                    type="text"
                    name="batchNo"
                    maxLength={20}
                    lable="Batch No"
                    value={payload.batchNo}
                    onChange={handleInputChange}
                    readOnly
                  />
                </div>
                <div className="flex-shrink-0">
                  {loading ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      text={"New Batch"}
                      icon={"add"}
                      onClick={handleNewBatch}
                    />
                  )}
                </div>
              </div>

              {/* Action buttons — same line */}
              <div
                className="d-flex align-items-end flex-shrink-0"
                style={{ gap: "8px" }}
              >
                <CustomButton
                  icon={"pending"}
                  text={t("Pending Barcode")}
                  onClick={openPendingModal}
                />
                <CustomButton
                  icon={"page"}
                  text={t("InHouse")}
                  onClick={() => {
                    if (!payload.batchNo || !payload.center) {
                      toast.warning(
                        t("Please create a new batch and select a center first."),
                      );
                      return;
                    }
                    setInHouseModal({
                      open: true,
                      data: [],
                      loading: false,
                      batchNo: payload.batchNo,
                      toCentre: "",
                      sinNo: "",
                      addLoading: false,
                    });
                    handleInHouseSearch(payload.batchNo);
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="mt-3 mx-2 px-3 py-2"
            style={{
              width: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#fafbfc",
            }}
          >
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("No of Vials")}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "26px",
                    height: "22px",
                    padding: "0 8px",
                    borderRadius: "11px",
                    background: "#e2e8f0",
                    color: "#0f172a",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {totalVialQty || 0}
                </span>
              </div>
              {!vialSummary?.length && (
                <small style={{ color: "#94a3b8" }}>{t("No sample types")}</small>
              )}
            </div>

            <div
              className="d-flex flex-wrap align-items-stretch"
              style={{ gap: "10px" }}
            >
              {vialSummary?.map((c, i) => {
                const uniqueId = `vial-${i}`;
                const sampleName = c?.SampleTypeName || c?.ColorName || "-";
                const qty = Number(c?.Noofvials) || 0;
                return (
                  <Fragment key={i}>
                    <Tooltip
                      target={`#${uniqueId}`}
                      position="top"
                      content={`${sampleName}: ${qty}`}
                    />
                    <div
                      id={uniqueId}
                      className="d-flex align-items-center"
                      style={{
                        gap: "8px",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        minWidth: "120px",
                        maxWidth: "180px",
                        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                        cursor: "default",
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          flex: "0 0 34px",
                          borderRadius: "6px",
                          backgroundColor: c?.ColorName || "#cbd5e1",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      />
                      <div
                        style={{
                          minWidth: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#1e293b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={sampleName}
                        >
                          {sampleName}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          Qty: {qty}
                        </div>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion
        defaultValue={true}
        title={
          payload.batchNo
            ? formatBatchWithCentre(payload.batchNo)
            : t("Batch Details")
        }
      >
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div
                className="table-responsive"
                style={{
                  minHeight: "130px",
                  maxHeight: "180px",
                  overflowY: "auto",
                }}
              >
                <Tables className="table table-sm mb-0 p-2">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>SIN No</th>
                      <th>Patient Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Sample Type</th>
                      <th>Test</th>
                      <th>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchDetail.length > 0 ? (
                      batchDetail.map((batch, idx) => {
                        const sampleTypeName =
                          batch.SampleTypeName || batch.SampleType || "-";
                        return (
                        <tr key={batch?.sampleLogisticID || idx}>
                          <td data-title={t("#")}>{idx + 1}</td>
                          <td data-title={t("SIN No")}>{batch.BarcodeNo}</td>
                          <td data-title={t("Patient Name")}>{batch.PName}</td>
                          <td data-title={t("Age")}>{batch.Age}</td>
                          <td data-title={t("Gender")}>{batch.Gender}</td>
                          <td data-title={t("Sample Type")}>{sampleTypeName}</td>
                          <td data-title={t("Test")}>
                            {batch.InvestigationName || batch.Test}
                          </td>
                          <td data-title={t("Remove")} className="text-center">
                            <FontAwesomeIcon
                              icon={faTrash}
                              title={t("Remove")}
                              style={{ color: "#dc3545", cursor: "pointer" }}
                              onClick={() => openRemoveFromBatch(batch)}
                            />
                          </td>
                        </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-3">
                          {t("No data found")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Tables>
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      {/* Pending list  */}
      <Accordion defaultValue={true} title={t("Pending List")}>
        {isBatchTransfer ? (
          <div
            className="d-flex flex-wrap align-items-end pt-2 px-2 py-3"
            style={{ gap: "10px" }}
          >
            <div style={{ flex: "1 1 120px", minWidth: "110px", maxWidth: "180px" }}>
              <Input
                id="batchNo"
                className="select-input-box form-control form-control-sm"
                type="text"
                name="batchNo"
                maxLength={20}
                lable="Batch No"
                value={batchTransfer.batchNo}
                onChange={handleBatchTransferInputChange}
                readOnly
              />
            </div>
            <div style={{ flex: "1 1 160px", minWidth: "140px", maxWidth: "260px" }}>
              <Input
                id="transferToCentre"
                className="select-input-box form-control form-control-sm"
                type="text"
                name="transferToCentre"
                lable={t("To Centre")}
                value={resolveBatchToCentre(batchTransfer.batchNo)}
                readOnly
              />
            </div>
            <div style={{ flex: "1 1 140px", minWidth: "130px", maxWidth: "200px" }}>
              <ReactSelect
                dynamicOptions={fieldBoyOptions}
                name="fieldBoyId"
                lable={t("Field Boy")}
                id="fieldBoyId"
                removeIsClearable={true}
                placeholderName={t("Field Boy")}
                value={batchTransfer.fieldBoyId}
                onChange={handleBatchTransferSelectChange}
              />
            </div>
            <div style={{ flex: "1 1 130px", minWidth: "120px", maxWidth: "180px" }}>
              <Input
                id="courierDetail"
                className="select-input-box form-control form-control-sm"
                type="text"
                name="courierDetail"
                maxLength={20}
                lable="Courier Detail"
                value={batchTransfer.courierDetail}
                onChange={handleBatchTransferInputChange}
              />
            </div>
            <div style={{ flex: "1 1 120px", minWidth: "110px", maxWidth: "160px" }}>
              <Input
                id="docketNo"
                className="select-input-box form-control form-control-sm"
                type="text"
                name="docketNo"
                maxLength={20}
                lable="Docket No"
                value={batchTransfer.docketNo}
                onChange={handleBatchTransferInputChange}
              />
            </div>
            <div className="d-flex flex-shrink-0 align-items-end" style={{ gap: "10px" }}>
              <SaveButton text={"Submit"} onClick={handleSubmitBatch} />
              <CancelButton
                text={"Cancel"}
                className="bg-light text-dark"
                onClick={() => setIsBatchTransfer(false)}
              />
            </div>
          </div>
        ) : (
          <div className="row gx-3 gy-3">
            <div className="card w-100">
              <div className="card-body p-2">
                <div
                  className="table-responsive"
                  style={{
                    minHeight: "130px",
                    maxHeight: "180px",
                    overflowY: "auto",
                  }}
                >
                  <Tables
                    className="table table-sm mb-0 p-2"
                    style={{ tableLayout: "auto", width: "100%" }}
                  >
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">{t("Batch No.")}</th>
                        <th scope="col">{t("To Centre")}</th>
                        <th scope="col">{t("Vials Qty.")}</th>
                        <th scope="col">{t("Field Boy")}</th>
                        <th scope="col">{t("Other Detail")}</th>
                        <th scope="col">{t("Status")}</th>
                        <th scope="col">{t("InHouse")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBatches.length > 0 ? (
                        pendingBatches.map((batch, idx) => (
                          <tr key={idx}>
                            <td data-title={t("Transfer")}>
                              {batch.Status === "Pending for Dispatch" ? (
                                <span
                                  className="text-link text-primary"
                                  style={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setIsBatchTransfer(true);
                                    setBatchTransfer({
                                      batchNo: batch.dispatchcode,
                                      fieldBoyId: "",
                                      fieldBoyName: "",
                                      courierDetail: "By Air",
                                      docketNo: "",
                                    });
                                  }}
                                >
                                  {t("Transfer")}
                                </span>
                              ) : (
                                <span>{t("")}</span>
                              )}
                            </td>
                            <td
                              data-title={t("Batch No.")}
                              style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                            >
                              <span
                                className="text-link text-primary"
                                style={{
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handleBatchDetail(batch.dispatchcode)
                                }
                              >
                                {batch.dispatchcode}
                              </span>
                            </td>
                            <td
                              data-title={t("To Centre")}
                              style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                            >
                              {batch.ToCentre ||
                                getCentreLabel(batch.ToCentreID) ||
                                "-"}
                            </td>
                            <td data-title={t("Vials")}>{batch.Quantity}</td>
                            <td
                              data-title={t("Field Boy")}
                              style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                            >
                              {batch.PickUpFieldBoy}
                            </td>
                            <td
                              data-title={t("Other Detail")}
                              style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                            >
                              {batch.CourierDetail}
                            </td>
                            <td data-title={t("Status")}>{batch.Status}</td>
                            <td data-title={t("InHouse")}>
                              <i
                                className="fa fa-search coloricon"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setInHouseModal({
                                    open: true,
                                    data: [],
                                    loading: false,
                                    batchNo: batch.dispatchcode,
                                    toCentre:
                                      batch.ToCentre ||
                                      getCentreLabel(batch.ToCentreID),
                                    sinNo: "",
                                    addLoading: false,
                                  });
                                  handleInHouseSearch(batch.dispatchcode);
                                }}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center text-muted py-3"
                          >
                            {t("No data found")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Tables>
                </div>
              </div>
            </div>
          </div>
        )}
      </Accordion>

      <Accordion defaultValue={true} title={t(" ")}>
        <div className="row pt-2 px-2 pb-2 align-items-end">
          <div className="col-sm-2 mb-1">
            <DatePicker
              className="custom-calendar"
              name="fromDate"
              placeholder=" "
              id="fromDate"
              lable="From Date"
              value={
                batchesFilter.fromDate ? new Date(batchesFilter.fromDate) : null
              }
              onChange={handleDateSelect}
            />
          </div>
          <div className="col-sm-2 mb-1">
            <DatePicker
              className="custom-calendar"
              name="toDate"
              placeholder=" "
              id="toDate"
              lable="To Date"
              value={
                batchesFilter.toDate ? new Date(batchesFilter.toDate) : null
              }
              onChange={handleDateSelect}
            />
          </div>
          <div className="col-sm-auto mb-1">
            <SearchButton text={"Search"} onClick={searchBatches} />
          </div>
          <div className="col-sm-auto mb-1">
            <CustomButton
              icon={"excel"}
              text={"Sample Transfer Report"}
              onClick={() =>
                ExportToExcel(getBathes, "SampleTransferReport.xlsx")
              }
              disabled={getBathes.length === 0}
            />
          </div>
        </div>

        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div
                className="table-responsive"
                style={{
                  minHeight: "130px",
                  maxHeight: "180px",
                  overflowY: "auto",
                }}
              >
                <Tables className="table table-sm mb-0 p-2">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">{t("Batch No.")}</th>
                      <th scope="col">{t("To Centre")}</th>
                      <th scope="col">{t("Vials Qty.")}</th>
                      <th scope="col">{t("Field Boy")}</th>
                      <th scope="col">{t("Other Detail")}</th>
                      <th scope="col">{t("Status")}</th>
                      <th scope="col">{t("Print")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBathes.map((batch, idx) => (
                      <tr key={idx}>
                        <td data-title={t("Transfer")}>{t("Transferred")}</td>
                        <td
                          data-title={t("Batch No.")}
                          style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                        >
                          <span
                            className="text-link text-primary"
                            style={{
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handleBatchDetail(batch.dispatchcode)
                            }
                          >
                            {batch.dispatchcode}
                          </span>
                        </td>
                        <td
                          data-title={t("To Centre")}
                          style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                        >
                          {batch.ToCentre ||
                            getCentreLabel(batch.ToCentreID) ||
                            "-"}
                        </td>
                        <td data-title={t("Vials")}>{batch.Quantity}</td>
                        <td
                          data-title={t("Field Boy")}
                          style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                        >
                          {batch.PickUpFieldBoy ? batch.PickUpFieldBoy : "-"}
                        </td>
                        <td
                          data-title={t("Other Detail")}
                          style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                        >
                          {batch.OtherDetail ? batch.OtherDetail : "-"}
                        </td>
                        <td data-title={t("Status")}>{batch.Status}</td>
                        <td>
                          <button
                            className="text-white"
                            onClick={() => printReport(batch.dispatchcode)}
                            disabled={printLoading === batch.dispatchcode}
                          >
                            {printLoading === batch.dispatchcode ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faPrint} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      <Dialog
        header={
          inHouseModal.batchNo
            ? `${t("InHouse Batch Search")} - ${formatBatchWithCentre(
                inHouseModal.batchNo,
                inHouseModal.toCentre,
              )}`
            : t("InHouse Batch Search")
        }
        visible={inHouseModal.open}
        onHide={() =>
          setInHouseModal({
            open: false,
            data: [],
            loading: false,
            batchNo: "",
            toCentre: "",
            sinNo: "",
            addLoading: false,
          })
        }
        className={theme}
        style={{ width: isMobile ? "95vw" : "85vw" }}
        contentStyle={{
          height: isMobile ? "72vh" : "78vh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="row pt-2 pl-2 pr-2 mb-2 align-items-end">
          <div className="col-sm-2 mb-1">
            <Input
              id="inHouseBatchNo"
              name="inHouseBatchNo"
              lable={t("Batch No")}
              placeholder="Batch No"
              type="text"
              value={inHouseModal.batchNo}
              disabled={true}
              onChange={(e) => setInHouseModal(prev => ({ ...prev, batchNo: e.target.value }))}
            />
          </div>
          <div className="col-sm-3 mb-1">
            <Input
              id="inHouseToCentre"
              name="inHouseToCentre"
              lable={t("To Centre")}
              placeholder="To Centre"
              type="text"
              value={
                inHouseModal.toCentre ||
                resolveBatchToCentre(inHouseModal.batchNo)
              }
              disabled={true}
            />
          </div>
          <div className="col-sm-auto mb-1">
            <SearchButton
              text={t("Search")}
              onClick={() => handleInHouseSearch()}
              loading={inHouseModal.loading}
              disabled={inHouseModal.loading}
            />
          </div>
          <div className="col-sm-2 mb-1">
            <Input
              id="inHouseSinNo"
              name="inHouseSinNo"
              lable={t("Barcode No")}
              type="text"
              value={inHouseModal.sinNo}
              onChange={(e) => setInHouseModal(prev => ({ ...prev, sinNo: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddBatch(); } }}
            />
          </div>
          <div className="col-sm-auto mb-1">
            <CustomButton
              text={t("Add")}
              icon="add"
              onClick={handleAddBatch}
              loading={inHouseModal.addLoading}
              disabled={inHouseModal.addLoading}
            />
          </div>
        </div>

        {inHouseModal.loading ? (
          <Loading />
        ) : inHouseModal.data.length > 0 ? (
          <Tables style={{ maxHeight: "58vh", overflowY: "auto", flex: 1 }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>{t("S.No")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Barcode No")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Patient Name")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Age")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Gender")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Sample Type")}</th>
                <th style={{ minWidth: "320px", maxWidth: "320px", whiteSpace: "normal" }}>{t("Test")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Status")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Dispatch Code")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Field Boy")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Courier Detail")}</th>
                <th style={{ whiteSpace: "nowrap" }}>{t("Docket No")}</th>
              </tr>
            </thead>
            <tbody>
              {inHouseModal.data.map((row, i) => {
                const sampleTypeName = row.SampleType || row.SampleTypeName || "-";
                return (
                <tr key={i}>
                  <td style={{ whiteSpace: "nowrap" }}>{i + 1}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.BarcodeNo || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.PName || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.Age || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.Gender || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{sampleTypeName}</td>
                  <td style={{ minWidth: "320px", maxWidth: "320px", whiteSpace: "normal", wordBreak: "break-word" }}>{row.Test || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.Status || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.DispatchCode || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.PickUpFieldBoy || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.CourierDetail || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{row.CourierDocketNo || "-"}</td>
                </tr>
                );
              })}
            </tbody>
          </Tables>
        ) : (
          <NoRecordFound />
        )}
      </Dialog>

      <Dialog
        header={t("Select Test To Transfer")}
        visible={testSelectModal.open}
        onHide={() =>
          !testSelectModal.loading &&
          setTestSelectModal({
            open: false,
            tests: [],
            selectedTestIds: [],
            loading: false,
          })
        }
        className={`${theme} inhouse-test-select-dialog`}
        style={{ width: isMobile ? "95vw" : "65vw" }}
        contentStyle={{ minHeight: isMobile ? "55vh" : "62vh" }}
        closable={!testSelectModal.loading}
        footer={
          <div className="d-flex justify-content-end" style={{ gap: "8px" }}>
            <CancelButton
              text={t("Cancel")}
              onClick={() =>
                setTestSelectModal({
                  open: false,
                  tests: [],
                  selectedTestIds: [],
                  loading: false,
                })
              }
              disabled={testSelectModal.loading}
            />
            <SaveButton
              text={t("Add Selected")}
              onClick={handleConfirmSelectedTests}
              loading={testSelectModal.loading || inHouseModal.addLoading}
              disabled={
                testSelectModal.loading ||
                inHouseModal.addLoading ||
                !testSelectModal.selectedTestIds?.length
              }
            />
          </div>
        }
      >
        <div className="p-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="mb-0" style={{ fontSize: "13px" }}>
              {t("Barcode")}: <strong>{inHouseModal.sinNo}</strong>
            </p>
            <span style={{ fontSize: "12px", color: "#475569" }}>
              {testSelectModal.selectedTestIds.length} /{" "}
              {testSelectModal.tests.length} {t("selected")}
            </span>
          </div>
          <div style={{ maxHeight: "52vh", overflowY: "auto" }}>
            <Tables>
              <thead>
                <tr>
                  <th
                    style={{ width: "60px" }}
                    className="text-center align-middle"
                  >
                    <label
                      htmlFor="selectAllTests"
                      className="d-flex flex-column align-items-center justify-content-center m-0"
                      style={{ cursor: "pointer", gap: "4px" }}
                    >
                      <input
                        type="checkbox"
                        id="selectAllTests"
                        className="form-check-input m-0"
                        style={{
                          width: "14px",
                          height: "14px",
                          cursor: "pointer",
                          accentColor: "#0d6efd",
                        }}
                        checked={
                          testSelectModal.tests.length > 0 &&
                          testSelectModal.selectedTestIds.length ===
                            testSelectModal.tests.length
                        }
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setTestSelectModal((prev) => ({
                            ...prev,
                            selectedTestIds: checked
                              ? prev.tests.map((row) => row.value)
                              : [],
                          }));
                        }}
                      />
                      {/* <span style={{ fontSize: "10px", fontWeight: 600 }}>
                        {t("All")}
                      </span> */}
                    </label>
                  </th>
                  <th style={{ width: "60px" }}>{t("Sr.No")}</th>
                  <th>{t("Department")}</th>
                  <th>{t("Test Code")}</th>
                  <th>{t("Test Name")}</th>
                </tr>
              </thead>
              <tbody>
                {testSelectModal.tests.map((test, index) => {
                  const isChecked = testSelectModal.selectedTestIds.includes(
                    test.value,
                  );
                  return (
                    <tr
                      key={test.value}
                      style={{
                        cursor: "pointer",
                        background: isChecked ? "#e8f1ff" : undefined,
                      }}
                      onClick={() => toggleTestSelection(test.value)}
                    >
                      <td
                        className="text-center align-middle"
                        style={{ width: "60px" }}
                      >
                        <label
                          htmlFor={`test-${test.value}`}
                          className="d-flex align-items-center justify-content-center m-0"
                          style={{
                            // minHeight: "15px",
                            // minWidth: "36px",
                            cursor: "pointer",

                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            id={`test-${test.value}`}
                            className="form-check-input m-0"
                            style={{
                              width: "14px",
                              height: "14px",
                              cursor: "pointer",
                              accentColor: "#0d6efd",
                            }}
                            checked={isChecked}
                            onChange={() => toggleTestSelection(test.value)}
                          />
                        </label>
                      </td>
                      <td style={{ width: "60px" }}>{index + 1}</td>
                      <td style={{width:"130px"}}>{test.department || "-"}</td>
                      <td style={{width:"70px"}}>{test.testCode || "-"}</td>
                      <td>{test.testName || test.label || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Tables>
          </div>
        </div>
      </Dialog>

      <PendingBarcodeModal
        show={showPendingBarcodeModal}
        handleClose={() => setShowPendingBarcodeModal(false)}
        centerId={payload.center}
        batchNo={payload.batchNo}
        transferToOptions={transferToOptions}
        allCenter={allCenter}
        onCenterChange={handleSelectChange}
        onAllCenterChange={handleCheckboxAllCenter}
        fetchPendingBatches={fetchPendingBatches}
        onAddedToBatch={(batchNo) => handleBatchDetail(batchNo)}
      />

      <Dialog
        visible={removeModal.open}
        onHide={() =>
          !removeModal.loading &&
          setRemoveModal({ open: false, batch: null, reason: "", loading: false })
        }
        header={t("Remove Sample from Batch")}
        className={theme}
        style={{ width: isMobile ? "95vw" : "420px" }}
        breakpoints={{ "640px": "95vw" }}
        draggable={false}
        closable={!removeModal.loading}
        footer={
          <div className="d-flex justify-content-end" style={{ gap: "12px" }}>
            <CancelButton
              text={t("Cancel")}
              onClick={() =>
                setRemoveModal({
                  open: false,
                  batch: null,
                  reason: "",
                  loading: false,
                })
              }
              disabled={removeModal.loading}
            />
            <SaveButton
              text={t("Remove")}
              onClick={handleRemoveFromBatch}
              loading={removeModal.loading}
              disabled={removeModal.loading}
            />
          </div>
        }
      >
        <div className="pt-2">
          <p className="mb-2" style={{ fontSize: "13px", color: "#334155" }}>
            {t("SIN No")}:{" "}
            <strong>
              {removeModal.batch?.BarcodeNo ||
                removeModal.batch?.barcodeno ||
                "-"}
            </strong>
            {" | "}
            {t("Test")}:{" "}
            <strong>
              {removeModal.batch?.InvestigationName ||
                removeModal.batch?.Test ||
                "-"}
            </strong>
          </p>
          <Input
            id="removeReason"
            name="removeReason"
            className="form-control form-control-sm required-fields"
            type="text"
            lable={t("Reason")}
            placeholder=" "
            value={removeModal.reason}
            maxLength={200}
            onChange={(e) =>
              setRemoveModal((prev) => ({ ...prev, reason: e.target.value }))
            }
          />
          <small className="text-danger">{t("Reason is mandatory")}</small>
        </div>
      </Dialog>

      <Dialog
        visible={showReject.show}
        onHide={() => setShowReject({ show: false, data: null })}
        header={t("Sample Transfer Report")}
        className={theme}
        style={{ width: isMobile ? "90%" : "30%" }}
        footer={
          <div className="flex justify-content-between">
            <CustomButton
              text={t("Cancel")}
              onClick={() => setShowReject({ show: false, data: null })}
              className="mr-2"
            />
            <CustomButton
              text={t("Reject")}
              onClick={handleRejectBatch}
              className="ml-2"
            />
          </div>
        }
      >
        <p>{t("Are you sure you want to reject this sample?")}</p>
        <div className="col-12">
          <ReactSelect
            dynamicOptions={reasonsOptions}
            name="rejectionReasonId"
            lable={t("Select Reason")}
            id="rejectionReasonId"
            removeIsClearable={true}
            placeholderName={t("Select Reason")}
            value={rejectedPayload.rejectionReasonId}
            onChange={handleReactSelectChange}
          />
        </div>

        {rejectedPayload.rejectionReasonId === "other" && (
          <div className="col-12">
            <Input
              id="rejectionReason"
              name="rejectionReason"
              className="form-control form-control-sm"
              type="text"
              lable="Other Reason"
              value={rejectedPayload.rejectionReason}
              onChange={handleChange}
            />
          </div>
        )}
      </Dialog>
    </>
  );
};

export default SampleTransfer;
