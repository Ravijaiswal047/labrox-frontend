import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import Tooltip from "../../components/formComponent/Tooltip";
import CustomModal from "../../components/formComponent/Modal";
import Tables from "../../components/UI/customTable";
import Accordion from "@app/components/UI/Accordion";
import { CustomButton, CancelButton } from "../../components/UI/CustomButton";

const emptySuffixRow = { parameterName: "", suffix: "" };

const PrePrintedBarcode = () => {
  const [t] = useTranslation();

  const [fromBarcode, setFromBarcode] = useState("");
  const [noOfBarcode, setNoOfBarcode] = useState("100");

  const [showAddModal, setShowAddModal] = useState(false);
  const [tempSuffixRows, setTempSuffixRows] = useState([{ ...emptySuffixRow }]);
  const [suffixList, setSuffixList] = useState([]);

  const [printGuId, setPrintGuId] = useState("");
  const [historyData, setHistoryData] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ parameterName: "", suffix: "" });

  const getNextRange = () => {
    axiosInstance
      .get("PrePrintedBarcode/GetNextRange")
      .then((res) => {
        const value = res?.data?.message?.fromBarCode;
        const val = String(value ?? "").replace(/[^0-9]/g, "");
        setFromBarcode(val);
        // if (val && val.length <= 8) {
        //   toast.error(t("Please contact to the backend administrator"));
        // }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || t("Failed to fetch barcode range")
        );
      });
  };

  const getHistory = () => {
    axiosInstance
      .get("PrePrintedBarcode/GetHistory")
      .then((res) => {
        setHistoryData(res?.data?.message || []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to fetch history"));
      });
  };

  const fetchAllBarcodeSuffix = () => {
    axiosInstance
      .get("PrePrintedBarcode/GetAllBarcodeSuffix")
      .then((res) => {
        const data = res?.data?.message || [];
        setSuffixList(
          data.map((item) => ({
            id: item?.Id,
            parameterName: item?.ParameterName,
            suffix: item?.Suffix,
            isActive: item?.IsActive === 1,
            checked: true,
          }))
        );
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to fetch"));
      });
  };

  useEffect(() => {
    getNextRange();
    fetchAllBarcodeSuffix();
    getHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNoOfBarcodeChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val !== "" && Number(val) > 500) {
      val = "500";
      toast.error(t("No. of Barcode should be between 1 and 500"));
    }
    setNoOfBarcode(val);
  };

  const handleOpenAddModal = () => {
    setTempSuffixRows([{ ...emptySuffixRow }]);
    setShowAddModal(true);
    fetchAllBarcodeSuffix();
  };

  const handleTempRowChange = (index, field, value) => {
    setTempSuffixRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setTempSuffixRows((prev) => [...prev, { ...emptySuffixRow }]);
  };

  const handleRemoveRow = (index) => {
    setTempSuffixRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSuffixConfig = () => {
    const validRows = tempSuffixRows.filter((row) => row.parameterName?.trim());
    if (validRows.length === 0) {
      toast.error(t("Please add at least one parameter"));
      return;
    }
    axiosInstance
      .post("PrePrintedBarcode/InsertBarcodeSuffix1", {
        suffixConfigList: validRows.map((row) => ({
          parameterName: row.parameterName,
          suffix: row.suffix,
        })),
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Saved Successfully"));
        setTempSuffixRows([{ ...emptySuffixRow }]);
        fetchAllBarcodeSuffix();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to save"));
      });
  };

  const handleToggleActive = (item) => {
    const newIsActive = !item.isActive;
    axiosInstance
      .post("PrePrintedBarcode/DeleteBarcodeSuffix", {
        id: item.id,
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Updated Successfully"));
        setSuffixList((prev) =>
          prev.map((row) =>
            row.id === item.id ? { ...row, isActive: newIsActive } : row
          )
        );
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to update"));
      });
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ parameterName: item.parameterName, suffix: item.suffix });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ parameterName: "", suffix: "" });
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = (item) => {
    if (!editForm.parameterName?.trim()) {
      toast.error(t("Please enter parameter name"));
      return;
    }
    axiosInstance
      .post("PrePrintedBarcode/UpdateBarcodeSuffix", {
        id: item.id,
        parameterName: editForm.parameterName,
        suffix: editForm.suffix,
        isActive: item.isActive ? 1 : 0,
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Updated Successfully"));
        setSuffixList((prev) =>
          prev.map((row) =>
            row.id === item.id
              ? {
                  ...row,
                  parameterName: editForm.parameterName,
                  suffix: editForm.suffix,
                }
              : row
          )
        );
        setEditingId(null);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to update"));
      });
  };

  const handleSuffixCheckboxToggle = (id) => {
    setSuffixList((prev) =>
      prev.map((row) => (row.id === id ? { ...row, checked: !row.checked } : row))
    );
  };

  const selectedSuffixList = suffixList.filter((item) => item.checked);

  const handlePrint = () => {
    // if (!fromBarcode || fromBarcode.length <= 8) {
    //   toast.error(t("Please contact to the backend administrator"));
    //   return;
    // }
    if (!noOfBarcode || Number(noOfBarcode) < 1 || Number(noOfBarcode) > 500) {
      toast.error(t("No. of Barcode should be between 1 and 500"));
      return;
    }
    axiosInstance
      .post("PrePrintedBarcode/PrintBarcode", {
        fromBarCode: Number(fromBarcode),
        toBarCode: Number(noOfBarcode),
        barcodeSuffixlist: selectedSuffixList.map((item) => ({
          parameterName: item.parameterName,
          suffix: item.suffix,
        })),
      })
      .then((res) => {
        const barcodeStrings = res?.data?.message?.barcodeStrings;
        if (barcodeStrings) window.location.href = barcodeStrings;
        setPrintGuId(res?.data?.message?.guId || "");
        toast.success(t("Printed Successfully"));
        getNextRange();
        getHistory();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to print"));
      });
  };

  return (
    <>
      <Accordion
        name={t("Pre-Printed Barcode")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 align-items-center">
          <Input
            respclass="col-sm-2"
            id="FromBarcode"
            name="FromBarcode"
            lable={t("From Barcode")}
            value={fromBarcode}
            readOnly
          />

          <Input
            respclass="col-sm-2"
            id="NoOfBarcode"
            name="NoOfBarcode"
            lable={t("No. of Barcode")}
            value={noOfBarcode}
            onChange={handleNoOfBarcodeChange}
          />

          <div className="col-sm-auto d-flex align-items-center flex-wrap" style={{ gap: "14px" }}>
            <div className="d-flex align-items-center">
              <label className="mb-0 mr-2">{t("Barcode Type")} :</label>
              <Tooltip label={t("Add Barcode Type")}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleOpenAddModal}
                >
                  <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                </button>
              </Tooltip>
            </div>
            {suffixList
              .filter((item) => item.isActive)
              .map((item) => (
                <label
                  key={item.id}
                  htmlFor={`suffix-${item.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    cursor: "pointer",
                    marginBottom: 0,
                    gap: "6px",
                  }}
                >
                  <input
                    type="checkbox"
                    id={`suffix-${item.id}`}
                    style={{ width: "16px", height: "16px" }}
                    checked={!!item.checked}
                    onChange={() => handleSuffixCheckboxToggle(item.id)}
                  />
                  <span>
                    {item.parameterName}
                    {item.suffix ? ` (${item.suffix})` : ""}
                  </span>
                </label>
              ))}
          </div>

          <div className="col-sm-auto">
            <CustomButton
              text={t("Print")}
              icon="print"
              onClick={handlePrint}
            />
          </div>
        </div>

      </Accordion>

      {/* {printGuId && (
        <div className="row px-2 mt-2">
          <div className="col-sm-auto">
            <strong>{t("GUID")}: </strong>
            <span>{printGuId}</span>
          </div>
        </div>
      )} */}

      <Accordion 
      title={t("Print Log")} defaultValue={true}>
        <div className="row mt-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("From Barcode")}</th>
                  <th>{t("No. of Barcode")}</th>
                  <th>{t("Printed By")}</th>
                  <th>{t("Printed Date")}</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      {t("No Log Found")}
                    </td>
                  </tr>
                ) : (
                  historyData.map((row, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{row?.FromBarCode}</td>
                      <td>{row?.ToBarCode}</td>
                      <td>{row?.EmpName}</td>
                      <td>{row?.PrintedDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>

      {showAddModal && (
        <CustomModal
          visible={showAddModal}
          setVisible={setShowAddModal}
          Header={t("Barcode Parameter")}
          modalWidth="60vw"
          buttons={
            <CancelButton
              text={t("Close")}
              onClick={() => setShowAddModal(false)}
            />
          }
        >
          {tempSuffixRows.map((row, i) => (
            <div className="row align-items-center mb-2" key={i}>
              <Input
                respclass="col-sm-5"
                id={`ParameterName-${i}`}
                name="parameterName"
                lable={t("Parameter Name")}
                value={row.parameterName}
                onChange={(e) =>
                  handleTempRowChange(i, "parameterName", e.target.value)
                }
              />
              <Input
                respclass="col-sm-5"
                id={`Suffix-${i}`}
                name="suffix"
                lable={t("Suffix")}
                value={row.suffix}
                onChange={(e) =>
                  handleTempRowChange(i, "suffix", e.target.value)
                }
              />
              <div className="col-sm-2">
                {tempSuffixRows.length > 1 && (
                  <CustomButton
                    icon="delete"
                    variant="danger"
                    onClick={() => handleRemoveRow(i)}
                  />
                )}
              </div>
            </div>
          ))}
          <div className="row mb-3">
            <div className="col-sm-auto">
              <CustomButton
                icon="add"
                text={t("Add Row")}
                onClick={handleAddRow}
                className="mx-2"
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Save")}
                icon="save"
                onClick={handleSaveSuffixConfig}
              />
            </div>
          </div>

          {suffixList.length > 0 && (
            <div className="row">
              <div className="col-12">
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("Parameter Name")}</th>
                      <th>{t("Suffix")}</th>
                      <th>{t("Active")}</th>
                      <th>{t("Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suffixList.map((item) => {
                      const isEditing = editingId === item.id;
                      return (
                        <tr key={item.id}>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="form-control"
                                value={editForm.parameterName}
                                onChange={(e) =>
                                  handleEditFieldChange("parameterName", e.target.value)
                                }
                              />
                            ) : (
                              item.parameterName
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="form-control"
                                value={editForm.suffix}
                                onChange={(e) =>
                                  handleEditFieldChange("suffix", e.target.value)
                                }
                              />
                            ) : (
                              item.suffix
                            )}
                          </td>
                          <td>
                            <Form.Check
                              type="switch"
                              id={`isActive-${item.id}`}
                              checked={!!item.isActive}
                              onChange={() => handleToggleActive(item)}
                            />
                          </td>
                          <td>
                            {isEditing ? (
                              <>
                                <CustomButton
                                  icon="check"
                                  onClick={() => handleSaveEdit(item)}
                                  className="mx-1"
                                />
                                <CustomButton
                                  icon="cancel"
                                  variant="secondary"
                                  onClick={handleCancelEdit}
                                />
                              </>
                            ) : (
                              <CustomButton
                                icon="edit"
                                onClick={() => handleStartEdit(item)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Tables>
              </div>
            </div>
          )}
        </CustomModal>
      )}
    </>
  );
};

export default PrePrintedBarcode;
