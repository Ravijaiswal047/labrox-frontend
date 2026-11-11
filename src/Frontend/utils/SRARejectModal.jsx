import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const SRARejectModal = ({ show, handleClose, onSuccess }) => {
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const [loading, setLoading] = useState(false);
  const [testsOptions, setTestsOptions] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);

  const [rejectedPayload, setRejectedPayload] = useState({
    Barcode: "",
    testIds: [],
    rejectionReasonId: "",
    rejectionReason: "",
  })

  const [reasonsOptions, setReasonsOptions] = useState([]);
  const [reasonsLoading, setReasonsLoading] = useState(false);

  const [t] = useTranslation();

  useEffect(() => {
    if (!show) return;
    const fetchReasons = async () => {
      setReasonsLoading(true);
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
      } finally {
        setReasonsLoading(false);
      }
    };
    fetchReasons();
  }, [show]);

  const handleGetTests = async () => {
    if (!rejectedPayload.Barcode) return toast.error("Enter SIN No.");
    setTestsLoading(true);
    try {
      const res = await axiosInstance.post("SRA/GetTestByBarcode", { Barcode: rejectedPayload.Barcode });
      if(res?.data?.success && Array.isArray(res?.data?.message)){
        const data = res?.data?.message || [];
        const mappedItems = data.map((t) => ({ label: t.ItemName, value: String(t.TestID) }));
        setTestsOptions(mappedItems);
        toast.success("Tests loaded successfully");
      }else{
        toast.error(res?.data?.message || "Failed to load tests");
      }
    } catch (err) {
      console.error("Get tests error", err);
      setTestsOptions([]);
    } finally {
      setTestsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!rejectedPayload.Barcode) return toast.error("Enter SIN No.");
    if (!rejectedPayload.testIds) return toast.error("Select test.");
    if (!rejectedPayload.rejectionReasonId) return toast.error("Select reason.");

    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/RejectSample", rejectedPayload);

      if (res?.data?.success) {
        toast.success("Sample rejected");
        setRejectedPayload({
          Barcode: "",
          testIds: [],
          rejectionReasonId: "",
          rejectionReason: "",
        })
        handleClose();
      } else {
        toast.error(res?.data?.message || "Failed to reject sample");
      }
    } catch (err) {
      console.error("Reject API error", err);
      toast.error("Failed to reject sample");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRejectedPayload({ ...rejectedPayload, [name]: value });
  };

  const handleMultiSelectChange = (name, value) => {
    setRejectedPayload((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReactSelectChange = (name, value) => {
    setRejectedPayload((prev) => ({
      ...prev,
      [name]: value?.value
    }))
  }

  useEffect(() => {
    if (!show) {
      setTestsOptions([]);
    }
  }, [show]);

  const handleCloseModal = () => {
    setRejectedPayload({
      Barcode: "",
      testIds: [],
      rejectionReasonId: "",
      rejectionReason: "",
    })
    handleClose();
  }
  return (
    <Dialog
      visible={show}
      className={theme}
      onHide={() => {
        setRejectedPayload({
          Barcode: "",
          testIds: [],
          rejectionReasonId: "",
          rejectionReason: "",
        })
        handleClose()
      }}
      header={t("Reject Sample")}
      style={{
        width: isMobile ? "100vw" : "40vw",
      }}
    >
      <div className="row pt-2 pl-2 pr-2">
        <div className="row col-12">
          <div className="col-9">
            <Input
              id="Barcode"
              name="Barcode"
              className="select-input-box form-control form-control-sm"
              type="text"
              maxLength={20}
              lable="SIN No"
              value={rejectedPayload.Barcode}
              onChange={handleChange}
            />
          </div>

          <div className="col-3">
            <CustomButton
              text={testsLoading ? "Loading..." : "Get Tests"}
              onClick={handleGetTests}
              disabled={testsLoading}
            />
          </div>
        </div>

        <div className="col-12" style={{ width: "80%" }}>
          <MultiSelectComp
            options={testsOptions}
            name="testIds"
            label={t("Tests")}
            id="testIds"
            placeholder=" "
            value={rejectedPayload.testIds}
            onChange={handleMultiSelectChange}
          />
        </div>

        <div className="col-12" style={{ width: "80%" }}>
          <ReactSelect
            dynamicOptions={reasonsOptions}
            name="rejectionReasonId"
            lable={t("Select Reason")}
            id="rejectionReasonId"
            removeIsClearable={true}
            placeholderName={t("Select Reason")}
            value={rejectedPayload.rejectionReasonId}
            onChange={handleReactSelectChange}
            isDisabled={reasonsLoading || reasonsOptions.length === 0}
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
      </div>
      <div className="d-flex align-items-center justify-content-end" style={{
        gap: "5px"
      }}>
        <CancelButton
          text={"Cancel"}
          onClick={handleCloseModal}
          disabled={loading}
        />
        <SaveButton
          text={loading ? "Processing..." : "Proceed"}
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>
    </Dialog>
  );
};

export default SRARejectModal;
