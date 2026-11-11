import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import AuditTrailDataTable from "../Table/AuditTrailDataTable";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
function CustomModal({ visitID, TestId, show, onHide }) {
  const [optionData, setOptionData] = useState([]);

  const [auditValue, setAuditValue] = useState({
    visitNo: visitID,
    itemId: "",
    testID: TestId,
  });

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  // i18n start

  const { t } = useTranslation();
  // i18n end

  const handleChange = (e) => {
    const val = e.target.value;
    setAuditValue((prev) => ({
      ...prev,
      itemId: val,
      testID: val || TestId,
    }));
  };

  const selectOption = () => {
    axiosInstance
      .post("TestData/BindTest", { VisitNo: visitID })
      .then((res) => {
        setOptionData(res?.data?.message);
      })
      .catch((err) => console.log(err));
  };

  const auditApiData = () => {
    setLoading(true);
    axiosInstance
      .post("TestData/GetAuditTrailData", {
        visitNo: auditValue?.visitNo,
        testID: auditValue?.testID,
      })
      .then((res) => {
        if (res.data?.success && Array.isArray(res?.data?.message)) {
          setTableData(res?.data?.message);
        } else {
          setTableData([]);
          toast.error(res.data?.message || "No Data Available");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (show) {
      setAuditValue({
        visitNo: visitID,
        itemId: "",
        testID: TestId,
      });
      selectOption();
    }
  }, [show, visitID, TestId]);

  useEffect(() => {
    if (show && auditValue.visitNo) {
      auditApiData();
    }
  }, [show, auditValue.itemId, auditValue.testID, auditValue.visitNo]);

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      header={tableData[0]?.pname}
      onHide={onHide}
      top={"100px"}
      visible={show}
      className={theme}
      style={{
        width: isMobile ? "80vw" : "60vw",
      }}
    >
      <div className="row mb-2">
        <div className="col-sm-12">
          <select
            className="select-input-box form-control input-sm"
            onChange={handleChange}
            value={auditValue.testID}
          >
            <option value="">{t("All Test")}...</option>
            {optionData.map((data, index) => (
              <option value={data.TestID} key={index}>
                {data.ItemName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <AuditTrailDataTable tableData={tableData} optionData={optionData} loading={loading} />

      <div className="row mt-2">
        <div className="col-sm-2">
          <button className="btn btn-block btn-danger btn-sm" onClick={onHide}>
            {t("Close")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default CustomModal;
