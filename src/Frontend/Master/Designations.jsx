import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import DesignationModal from "../utils/DesignationModal";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { dateConfig } from "../../utils/helpers";
import { toast } from "react-toastify";
import AccessReportsModal from "../utils/AccessReportsModal";
import Input from "../../components/formComponent/Input";
import { CustomButton } from "../../components/UI/CustomButton";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { FaEdit } from "react-icons/fa";
import DesignationFormDialog from "./DesignationFormDialog";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

const Designations = () => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const [data, setData] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogEditData, setDialogEditData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAudit,setShowAudit]=useState(false);
  const [pageLogData,setPageLogData]=useState([]);
  const [auditDesignationName,setAuditDesignationName]=useState("");

  const [show, setShow] = useState({
    modal: false,
    id: "",
    name: "",
  });

  const [showAccessReport, setShowAccessReport] = useState({
    modal: false,
    id: "",
    name: "",
  });



  

 






  const colorCodingData = [
    { color: "#FFFFFF", id: "1", labelKey: "Active" },
    { color: "#ff000014", id: "2", labelKey: "In Active" },
  ];

  // ================= FETCH DATA =================
  const getDesignationData = () => {
    setLoading(true);
    axiosInstance
      .get("Designation/getAllDesignationData")
      .then((res) => {
        if (res.status === 200) {
          setData(res.data.data || []);
          setFilteredData(res.data.data || []); // ✅ show all initially
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    getDesignationData();
  }, []);

  const handleSearchChange = (value) => {
    setSearchText(value);

    if (!value.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) =>
      item.DesignationName?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);
  };


  const handleCheckboxChange = (_, designation) => {
    setLoading(true);

    const updatedPayload = {
      Name: designation.DesignationName,
      IsDirectApprove: designation.IsDirectApprove.toString(),
      IsNewTestApprove: designation.IsNewTestApprove.toString(),
      IsSales:
      designation.IsSales !== undefined
      ? designation.IsSales.toString()
      : "",
      IsShowSpecialRate: designation.IsShowSpecialRate.toString(),
      isActive: designation.isActive.toString(),
      SequenceNo: designation.SequenceNo,
      DesignationID: designation.DesignationID,
      RecEdit: 0,
      EditInfo: 0,
      reportopen: designation.reportopen == 1 ? 0 : 1,
      iconName: designation.IconName || designation.iconName || "",
    };

    axiosInstance
      .post("Designation/UpdateDesignationData", updatedPayload)
      .then((res) => {
        if (res.status === 200) {
          toast.success(res.data.message);
          getDesignationData();
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message || "Something Went Wrong"
        );
      });
  };

  const handleAuditLog = async (designationId, designationName) => {
  if (!designationId) {
    toast.warn("Something Went Wrong!");
    return;
  }

  setAuditDesignationName(designationName || "");
  setShowAudit(true);
  setPageLogData([]);
  // setLoading(true);

  try {
    const res = await axiosInstance.get(
      `Menu/GetPageAccessRightLogs?designationId=${designationId}`
    );


    setPageLogData(res?.data?.data || res?.data || []);

  } catch (err) {
    toast.error(err?.response?.data?.message || "No Record  found");
  } finally {
    // setLoading(false);
  }
};



  return (
    <>
      {show.modal && (
        <DesignationModal
          show={show}
          onHandleClose={() =>
            setShow({ modal: false, id: "", name: "" })
          }
        />
      )}

      {showAccessReport.modal && (
        <AccessReportsModal
          show={showAccessReport}
          onHandleClose={() =>
            setShowAccessReport({ modal: false, id: "", name: "" })
          }
        />
      )}

      <Accordion
        name={t("Designations")}
        isBreadcrumb
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div className="d-flex mt-2 gap-2" style={{ gap: "5px" }}>
            {colorCodingData.map(({ color, labelKey, id }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={t(labelKey)}
              />
            ))}
            <Input
              type="text"
              placeholder="Search Designation"
              value={searchText}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <CustomButton
              onClick={() => {
                // e.stopPropagation();
                setDialogEditData(null);
                setDialogVisible(true);
              }}
              text={"Create New"}
              icon={"add"}
            />
          </div>
        }
      >
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            {loading ? (
              <Loading />
            ) : (
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Designation Name")}</th>
                    <th>{t("View Rights")}</th>
                    <th>{t("Access Reports")}</th>
                    <th>{t("Sequence No")}</th>
                    <th>{t("Date Of Creation")}</th>
                    <th>{t("Date Of Updation")}</th>
                    <th>{t("IsReportOpen")}</th>
                    <th>{t("view page log")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, i) => (
                      <tr
                        key={item.DesignationID}
                        style={{
                          backgroundColor:
                            item.isActive === false ||
                            item.isActive == 0 ||
                            item.ActiveStatus === "De-Active" ||
                            item.ActiveStatus === "False"
                              ? "#ff000014"
                              : "",
                        }}
                      >
                        <td style={{ whiteSpace: "nowrap",}}>
                          {i + 1}
                          <FaEdit
                            size={14}
                            color="#4a90d9"
                            title={t("Edit")}
                            style={{ cursor: "pointer", marginLeft: "6px", verticalAlign: "middle" }}
                            onClick={() => {
                              setDialogEditData(item);
                              setDialogVisible(true);
                            }}
                          />
                        </td>
                        <td>{item.DesignationName}</td>

                        <td>
                          <i
                            className="fa fa-search coloricon"
                            onClick={() =>
                              setShow({
                                modal: true,
                                id: item.DesignationID,
                                name: item.DesignationName,
                              })
                            }
                          />
                        </td>

                        <td>
                          <i
                            className="fa fa-search coloricon"
                            onClick={() =>
                              setShowAccessReport({
                                modal: true,
                                id: item.DesignationID,
                                name: item.DesignationName,
                              })
                            }
                          />
                        </td>

                        <td>{item.SequenceNo}</td>
                        <td>{dateConfig(item.dtEntry)}</td>
                        <td>
                          {item.dtUpdate !== "0000-00-00 00:00:00"
                            ? dateConfig(item.dtUpdate)
                            : "-"}
                        </td>
                        {/* <td>{item.NewTestApproves}</td>
                        <td>{item.ShowSpecialRate}</td>
                        <td>{item.ActiveStatus}</td>
                        <td>{item.DirectApprove}</td> */}

                        <td>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.reportopen}
                              onChange={(e) =>
                                handleCheckboxChange(e, item)
                              }
                            />
                            <span className="slider round2" />
                          </label>
                        </td>
                        <td>
                           <i
                            className="fa fa-search coloricon"
                            onClick={()=>handleAuditLog(item.DesignationID, item.DesignationName)}
                          />
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </Tables>
            )}
          </div>
        </div>
      </Accordion>

      <DesignationFormDialog
        visible={dialogVisible}
        setVisible={setDialogVisible}
        editData={dialogEditData}
        onSuccess={getDesignationData}
      />

      {showAudit && (
        <Dialog
          visible={showAudit}
          className={theme}
          header={
            <span style={{ fontSize: "14px" }}>
              {t("Page Access Audit Log")} — {auditDesignationName}
            </span>
          }
          onHide={() => setShowAudit(false)}
          style={{ width: "80vw" }}
        >
          <div className="card">
            <div className="card-body p-0" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {loading ? (
                <Loading />
              ) : (
                <Tables>
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                       <th>{t("status")}</th>
                      <th>{t("Old Status")}</th>
                      <th>{t("New Status")}</th>
                      <th>{t("Changed By")}</th>
                      <th>{t("Date")}</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {pageLogData.length > 0 ? (
                      pageLogData.map((log, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                           <td>{log.pageName || "-"}</td>
                            <td>
                            <span
                              className={`badge ${
                                log.oldStatus === "Allow"
                                  ? "bg-success"
                                  : log.oldStatus === "Deny"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {log.oldStatus === "Allow" ? "Active" : log.oldStatus === "Deny" ? "Inactive" : log.oldStatus || "-"}
                            </span>
                          </td>


                          <td>
                            <span
                              className={`badge ${
                                log.newStatus === "Allow"
                                  ? "bg-success"
                                  : log.newStatus === "Deny"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {log.newStatus === "Allow" ? "Active" : log.newStatus === "Deny" ? "Inactive" : log.newStatus || "-"}
                            </span>
                          </td>
                            <td>{log.changedBy || "-"}</td>

                          <td style={{ whiteSpace: "nowrap" }}>
                            {log.dateTime ? dateConfig(log.dateTime, 0) : "-"}
                          </td>
                        
                         
                       
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6}><NoRecordFound /></td>
                      </tr>
                    )}
                  </tbody>
                </Tables>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default Designations;
