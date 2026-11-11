import { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { SRAFormatDate } from "../../utils/helpers";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { toast } from "react-toastify";

const SDRTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [allCentre, setAllCentre] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [t] = useTranslation();
  const [payload, setPayload] = useState({
    sendTo: "",
    BatchNo: "",
  });

  const handleSelectChange = (...args) => {
    let option = null;
    if (args.length === 1) option = args[0];
    else option = args[1];

    if (option && option.target) {
      option = option.target.value;
    }

    const val = option ? option.value : "";
    setPayload((prev) => ({ ...prev, [args[0]]: String(val) }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "BatchNo") setPayload((prev) => ({ ...prev, BatchNo: value }));
  };

  const handleRowSelect = (testId, barcodeNo) => {
    setSelectedRows((prev) => {
      const exists = prev?.find((r) => r.testId === testId);

      if (exists) {
        return prev.filter((r) => r.testId !== testId);
      } else {
        return [...prev, { testId, barcodeNo }];
      }
    });
  };

  const fetchCentre = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.post("SRA/BindSampleTransferCentre", {
          AllCentre: "1",
        });

        const data = res?.data?.message || [];
        const mapped = data?.map((r) => ({
          label: r.Centre,
          value: String(r.CentreID),
        }));

        setAllCentre(mapped);
      } catch (err) {
        console.error("Failed to load centers", err);
        setAllCentre([]);
      } finally {
        setLoading(false);
      }
    };

  const handleReset = () => {  
    handleSearch();
    setPayload((prev) => ({
      ...prev,
      sendTo: "",
    }));
    setSelectedRows([]);
   }

  const handleSearch = async () => {
    const searchPayload = {
      BarcodeOrVisitNo: payload?.BatchNo || "",
    };
    setLoading(true);
    axiosInstance
          .post("SRA/GetSampleSearchForcefulTransfer", searchPayload)
          .then((res) => {
            console.log("Search result", res?.data);
            if(res?.data?.success && Array.isArray(res?.data?.message)){
              setTableData(res.data.message);     
            }
            else{
              setTableData([]);
              toast.error("No records found");
            }
            setSelectedRows([]);
          })
          .catch((err) => {
            toast.error(
              err?.data?.message || "Error Occurred"
            );
          })
          .finally(() => {
            setLoading(false);
          });
  };

  const handleSendNow = async () => {
    if (!payload.sendTo) {
      toast.error("Please select centre");
      return;
    }

    if (selectedRows?.length === 0) {
      toast.error("Please select at least one row");
      return;
    }

    const sendPayload = {
      centreId: Number(payload.sendTo),
      items: selectedRows?.map((row) => ({
        testId: row.testId,
        barcodeNo: row.barcodeNo,
      })),
    };

    try {
      setLoading(true);

      const res = await axiosInstance.post(
        "SRA/SampleForcefulTransfer",
        sendPayload
      );

      if (res?.data?.success) {
        toast.success("Transfer successful");
        handleReset();
      } else {
        toast.error(res?.data?.message || "Transfer failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

   // fetch centres
  useEffect(() => {
    fetchCentre();
  }, []);

  console.log("payload",payload);

  return (
    <>
      <Accordion
        name={t("SDR Transfer")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2">
          <div className="col-12">
            <div className="row align-items-end justify-content-center g-3">
              {/* First Input + Button */}
              <div className="col-12 col-sm-8 col-lg-4 my-1">
                <Input
                  id="BatchNo"
                  className="select-input-box form-control form-control-sm"
                  type="text"
                  name="BatchNo"
                  maxLength={20}
                  lable="SIN No Or Visit No"
                  value={payload.BatchNo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-12 col-sm-4 col-lg-1 my-1 mb-2">
                {loading ? (
                  <Loading />
                ) : (
                  <SearchButton
                        text={"Search"}
                        onClick={handleSearch}
                  />
                )}
              </div>

              {/* Second Input + Button */}
              <div className="col-12 col-sm-8 col-lg-4 my-1">
                <ReactSelect
                  dynamicOptions={allCentre}
                  name="sendTo"
                  label={t("From Centre")}
                  id="sendTo"
                  removeIsClearable={true}
                  placeholderName={t("Send To Centre")}
                  value={
                    allCentre?.find((o) => o.value === payload.sendTo)?.value ?? null
                  }
                  onChange={handleSelectChange}
                  isDisabled={loading || allCentre.length === 0}
                />
              </div>
              <div className="col-12 col-sm-4 col-lg-1 my-1 mb-2">
                {loading ? (
                  <Loading />
                ) : (
                  <CustomButton
                      text={"Send Now"}
                      icon={"share"}
                      onClick={handleSendNow}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion defaultValue={true} title={t("Search Result")}>
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body py-0 px-2">
              <div className="table-responsive" style={{ width: "100%" }}>
                {tableData?.length > 0 ? (
                  <Tables
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <thead>
                      <tr>
                        <th scope="col">{t("S. No")}</th>
                        <th scope="col">{t("TestID")}</th>
                        <th scope="col">{t("Test Name")}</th>
                        <th scope="col">{t("Barcode No.")}</th>
                        <th scope="col">{t("PName")}</th>                   
                        <th scope="col">{t("Age/Gender")}</th>
                        <th scope="col">{t("Visit No")}</th>
                        <th scope="col">{t("Booking Centre")}</th>             
                        <th scope="col">{t("Status")}</th>
                        <th scope="col">{t("Select")}</th>
                      
                      </tr>
                    </thead>

                    <tbody>
                      {tableData?.map((row, idx) => {
                        const statusColor =
                          row.Status === "Result Done"
                            ? "text-success"
                              : "text-primary";

                        return (
                          <tr key={idx} style={{padding: "5px 0"}}>
                            <td style={{ width: "50px" }}>{idx + 1}</td>
                            <td data-title={t("TestID")}>{t(row.testid)}</td>
                            <td data-title={t("Test Name")}>{t(row.itemname)}</td>
                            <td data-title={t("Barcode No.")}>
                              {t(row.barcodeno)}
                            </td>
                            <td data-title={t("PName")}>{t(row.pname)}</td>
                            <td data-title={t("Age/Gender")}>{t(row.age)}</td>                         
                            <td data-title={t("Visit No")}>{t(row.LedgerTransactionNo)}</td>
                            <td data-title={t("From Centre")}>
                              {t(row.BookingCentre)}
                            </td>                         
                            <td
                              data-title={t("Status")}
                              className={statusColor}
                            >
                              {t(row.STATUS)}
                            </td>
                            <td data-title={t("Select")}>
                              {row.STATUS === "Pending" && (
                                <input
                                  type="checkbox"
                                  checked={selectedRows?.some((r) => r.testId === row.testid)}
                                  onChange={() => handleRowSelect(row.testid, row.barcodeno)}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tables>
                ) : (
                  <NoRecordFound />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default SDRTransfer;