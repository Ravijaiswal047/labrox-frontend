import React, { useState, useEffect } from "react";

import { toast } from "react-toastify";
import { NoOfPricks, SampleSource } from "../../utils/Constants";
import { getSampleType } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import SampleRemark from "../utils/SampleRemark";
import DOSModal from "../utils/DOSModal";
import { SelectBox } from "../../components/formComponent/SelectBox";
import RejectModal from "../utils/RejectModal";

import { useTranslation } from "react-i18next";
import SampleHisto from "./SampleHisto";
import Tooltip from "../../components/formComponent/Tooltip";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Urgent from ".././Images/urgent.gif";
import './SampleCollectionTable.css';
function SampleCollectionTable({
  data,
  index,
  payload,
  setPayload,
  setSearchInvdata,
  searchInvdata,
  TableData,
  handleBarcode,
  handleCloseBarcodeModal,
  handleValQty,
  snr,
  accessRight,
  removeBarcodePayload,
  setRemoveBarcodePayload,
  rejectPayload,
  handleRejectPayload,
  handleRemoveBarcodePayload,
}) {
  const userData = useLocalStorage("userData", "get");
  console.log("userData", userData);
  const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const [t] = useTranslation();
  const [sampleTypeDropdown, setSampleTypeDropdown] = useState([]);
  const [show, setShow] = useState(false);
  const [remarkShow, setRemarkShow] = useState(false);
  const [dos, setDos] = useState(false);
  const [sampleTypeColors, setSampleTypeColors] = useState([]);
  const BarocdeNoMaxLength = useLocalStorage("BarocdeNoMaxLength", "get");

  const [mouseHover, setMouseHover] = useState({
    index: -1,
    data: "",
  });
  const handleShow = () => {
    setShow(!show);
  };

  // const syncPayloadIfSelected = (row) => {
  //   if (!row.isSelected) return;

  //   setPayload((prev) =>
  //     prev.map((p) =>
  //       p.TestID === row.TestID
  //         ? {
  //           ...p, 
  //           NoOfPricks: row.NoOfPricks,
  //           PricksRemarks: row.PricksRemarks,
  //         }
  //         : p
  //     )
  //   );
  // };

  const syncPayloadIfSelected = (row) => {
    if (!row.isSelected) return;

    setPayload((prev) =>
      prev.map((p) =>
        p.SINNo === row.SINNo
          ? {
            ...p,
            NoOfPricks: row.NoOfPricks,
            PricksRemarks: row.PricksRemarks,
          }
          : p
      )
    );
  };

  const handleChange = (e, index, sin, selected) => {
    const { name, value } = e.target;
    const data = [...searchInvdata];
    if (name === "SampleTypeID") {
      const selctedvalue = sampleTypeDropdown.find((ele) => ele.value == value);
      data[index][name] = selctedvalue?.value;
      data[index]["SampleType"] = selctedvalue?.label;
      setSearchInvdata(data);
    } else if (name === "NoOfPricks") {
      console.log(searchInvdata, "searchInvdata");
      const newdata = searchInvdata.map((ele) => {
        if (
          sin === ele?.SINNo &&
          (ele.Status === 1 || ele.Status === 4) &&
          ele.PricksNotRequired == 0
        ) {
          return {
            ...ele,
            [name]: Number(value),
            PricksRemarks: value === "" ? "" : ele?.PricksRemarks,
          };
        } else {
          return { ...ele };
        }
      });
      newdata[index][name] = Number(value);
      setSearchInvdata(newdata);
      syncPayloadIfSelected(newdata[index]);
    } else if (name === "PricksRemarks") {
      const newdata = searchInvdata.map((ele) => {
        if (
          sin === ele?.SINNo &&
          (ele.Status === 1 || ele.Status === 4) &&
          ele.PricksNotRequired == 0
        ) {
          return {
            ...ele,
            [name]: value,
          };
        } else {
          return { ...ele };
        }
      });
      newdata[index][name] = value;
      setSearchInvdata(newdata);
      syncPayloadIfSelected(newdata[index]);

    } else {
      data[index][name] = value;
      setSearchInvdata(data);
    }
  };
  const getBarcodeData = (testId, VisitNo, SINNo) => {
    const arr = [];
    arr.push(testId);
    axiosInstance
      .post("SC/getBarcode", {
        LedgerTransactionNo: VisitNo,
        BarcodeNo: SINNo,
        TestID: arr,
        barcodeNoDepartmentID: 0,
      })
      .then((res) => {
        const msg = res?.data?.message;
        const isUrl = typeof msg === "string" && (
          msg.startsWith("http://") ||
          msg.startsWith("https://") ||
          msg.startsWith("blob:") ||
          msg.startsWith("/")
        );
        if (res?.data?.success && isUrl) {
          window.location.href = msg;
          return;
        }
        toast.error(
          res?.data?.message || t("Barcode label could not be printed"),
        );
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message ||
            t("Barcode label could not be printed"),
        );
      });
  };

  const getAllDepartmentBarcodeData = (
    LedgerTransactionID,
    DepartmentID,
    barcodeNo,
  ) => {
    axiosInstance
      // --------------
      .post("SC/getBarcode", {
        LedgerTransactionNo: String(LedgerTransactionID),
        BarcodeNo: [barcodeNo],
        TestID: [],
        barcodeNoDepartmentID: Number(DepartmentID),
      })
      .then((res) => {
        if (res?.data?.success && res?.data?.message) {
          window.location.href = res.data.message;
          return;
        }
        toast.error(
          res?.data?.message || t("Barcode label could not be printed"),
        );
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message ||
            t("Barcode label could not be printed"),
        );
      });
  };

  const handleUrgent = (e, index, data) => {
    const { checked } = e.target;
    const isUrgentVal = checked ? 1 : 0;

    axiosInstance
      .post("SC/UpdateUrgentPLO", {
        TestIDHash: data?.TestIDHash || data?.TestIdhash,
        isUrgent: isUrgentVal,
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Updated Successfully"));
        const val = [...searchInvdata];
        val[index]["isUrgent"] = isUrgentVal;
        setSearchInvdata(val);

        const updatedPayload = payload.map((p) =>
          p.TestIDHash === data?.TestIDHash || p.TestIdhash === data?.TestIdhash
            ? { ...p, isUrgent: isUrgentVal }
            : p
        );
        setPayload(updatedPayload);
      })
      .catch((err) => {
        if (err?.response?.status === 504) {
          toast.error(t("Something Went Wrong"));
        } else if (err?.response?.status === 401) {
          toast.error(err?.response?.data?.message);
        } else {
          toast.error(err?.response?.data?.message || t("Something Went Wrong"));
        }
      });
  };

  const handleColorChange = (e, index, data) => {
    const selectedColor = e.target.value;

    axiosInstance
      .post("SC/UpdateColorPLO", {
        TestIDHash: data?.TestIDHash || data?.TestIdhash,
        ColorName: selectedColor,
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Updated Successfully"));
        // Update both keys locally so the color select reflects the change immediately
        const val = [...searchInvdata];
        val[index]["ColorName"] = selectedColor;
        val[index]["CustomColor"] = selectedColor;
        setSearchInvdata([...val]);

        const updatedPayload = payload.map((p) =>
          p.TestIDHash === data?.TestIDHash || p.TestIdhash === data?.TestIdhash
            ? { ...p, ColorName: selectedColor, CustomColor: selectedColor }
            : p
        );
        setPayload(updatedPayload);

        // Re-fetch from API to show the updated vial color from the server
        // if (typeof TableData === "function") {
        //   TableData();
        // }
      })
      .catch((err) => {
        if (err?.response?.status === 504) {
          toast.error(t("Something Went Wrong"));
        } else if (err?.response?.status === 401) {
          toast.error(err?.response?.data?.message);
        } else {
          toast.error(err?.response?.data?.message || t("Something Went Wrong"));
        }
      });
  };

  // const handlePayload = (e, index, data) => {
  //   const { checked } = e.target;
  //   if (checked) {
  //     if (
  //       Number(data?.NoOfPricks) > 1 &&
  //       (!data?.PricksRemarks || data?.PricksRemarks.trim() === "")
  //     ) {
  //       toast.error(
  //         "Pricks Remarks is mandatory when No Of Pricks is greater than 1"
  //       );
  //       return;
  //     }
  //     if (data?.SINNo?.length >= 3) {
  //       const val = [...searchInvdata];
  //       const updatedSearchData = val.map((ele) => {
  //         const canSelect =
  //           (ele.Status === 1 ||
  //             (ele.Status === 4 && ele?.isSampleReCollection == 1) ||
  //             snr) &&
  //           ele.Status !== 2 &&
  //           ele.Status !== 3 &&
  //           ele.Status !== 10 &&
  //           ele.Status !== 6 &&
  //           ele.Status !== 5 &&
  //           ele.Approved !== 1;

  //         if (ele.SINNo === data.SINNo && ele.SINNo.length >= 3 && canSelect) {
  //           return { ...ele, isSelected: true };
  //         }
  //         return ele;
  //       });

  //       setSearchInvdata(updatedSearchData);

  //       setPayload((prev) => {
  //         const newSelections = updatedSearchData.filter(
  //           (ele) =>
  //             ele.SINNo === data.SINNo &&
  //             ele.isSelected &&
  //             !prev.some((p) => p.TestID === ele.TestID)
  //         );
  //         return [...prev, ...newSelections];
  //       });
  //     } else {
  //       toast.error(
  //         t("Barcode is Required Field and Should Contain atleast 3 character")
  //       );
  //     }
  //   } else {
  //     const val = [...searchInvdata];
  //     const updatedSearchData = val.map((ele) => {
  //       if (ele.SINNo === data.SINNo) {
  //         return { ...ele, isSelected: false };
  //       }
  //       return ele;
  //     });
  //     setSearchInvdata(updatedSearchData);
  //     setPayload((prev) => prev.filter((ele) => ele.SINNo !== data.SINNo));
  //   }
  // };

  const handlePayload = (e, index, data) => {
    const { checked } = e.target;
    if (checked) {
      if (
        Number(data?.NoOfPricks) > 1 &&
        (!data?.PricksRemarks || data?.PricksRemarks.trim() === "")
      ) {
        toast.error(
          "Pricks Remarks is mandatory when No Of Pricks is greater than 1"
        );
        return;
      }
      if (data?.SINNo?.length >= 3) {
        const val = [...searchInvdata];
        const updatedSearchData = val.map((ele, i) => {
          const canSelect =
            (ele.Status === 1 ||
              (ele.Status === 4 && ele?.isSampleReCollection == 1) ||
              snr) &&
            ele.Status !== 2 &&
            ele.Status !== 3 &&
            ele.Status !== 10 &&
            ele.Status !== 6 &&
            ele.Status !== 5 &&
            ele.Approved !== 1;

          if (DefaultCurrencyName === "KES") {
            if (i === index && canSelect) {
              return { ...ele, isSelected: true };
            }
          } else {
            if (ele.SINNo === data.SINNo && ele.SINNo.length >= 3 && canSelect) {
              return { ...ele, isSelected: true };
            }
          }
          return ele;
        });

        setSearchInvdata(updatedSearchData);

        setPayload((prev) => {
          const newSelections = updatedSearchData.filter(
            (ele) =>
              ele.SINNo === data.SINNo &&
              ele.isSelected &&
              !prev.some((p) => p.TestID === ele.TestID)
          );
          return [...prev, ...newSelections];
        });
      } else {
        toast.error(
          t("Barcode is Required Field and Should Contain atleast 3 character")
        );
      }
    } else {
      const val = [...searchInvdata];
      const updatedSearchData = val.map((ele, i) => {
        if (i === index) {
          return { ...ele, isSelected: false };
        }
        return ele;
      });
      setSearchInvdata(updatedSearchData);
      setPayload((prev) => prev.filter((ele) => ele.TestID !== data.TestID));
    }
  };
  useEffect(() => {
    getSampleType(setSampleTypeDropdown, data?.InvestigationID);
  }, []);

  useEffect(() => {
    if (
      (data?.Status == 1 ||
        (data?.Status == 4 && data?.isSampleReCollection == 1)) &&
      data?.SINNo &&
      data?.SINNo?.length >= 3 &&
      !data?.isSelected
    ) {
      setSearchInvdata((prev) => {
        const val = [...prev];
        val[index]["isSelected"] = true;
        return val;
      });
      setPayload((prev) => [...prev, { ...data, isSelected: true }]);
    }
  }, [data?.SINNo]);

  console.log(data?.isSelected);
  const handleShowRemark = () => {
    setRemarkShow((prev) => !prev);
  };
  console.log(searchInvdata);
  const handleSaveRemarks = (value, index, sin) => {
    handleShowRemark();
    const newdata = searchInvdata?.map((ele) => {
      if (
        sin === ele?.SINNo &&
        (ele.Status === 1 || ele.Status === 4) &&
        ele.PricksNotRequired == 0
      ) {
        return {
          ...ele,
          ["PricksRemarks"]: value,
        };
      } else {
        return { ...ele };
      }
    });
    newdata[index]["PricksRemarks"] = value;
    setSearchInvdata(newdata);
    syncPayloadIfSelected(newdata[index]);
  };

  const handleSearch = () => {
    axiosInstance
      .get("SampleType/getSampleType")
      .then((res) => {
        setSampleTypeColors(res.data.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getSampleColor = (id, customColor) => {
    if (customColor) return customColor;
    const sample = sampleTypeColors.find((item) => String(item.id) === String(id));
    return sample ? sample.ColorName : "transparent";
  };

  const uniqueSampleColors = sampleTypeColors.filter(
    (item, index, self) =>
      item.ColorName &&
      item.ColorName.trim() !== "" &&
      index === self.findIndex((t) => t.ColorName === item.ColorName)
  );

  useEffect(() => {
    handleSearch();
  }, []);

  console.log("pricks", data);

  return (
    <>
      {remarkShow && (
        <SampleRemark
          show={remarkShow}
          PageName={data?.PricksRemarks}
          handleShow={handleShowRemark}
          state={data}
          handleSave={handleSaveRemarks}
          title={"Enter Pricks Remark"}
        />
      )}
      {dos && (
        <DOSModal
          show={dos}
          LTData={data}
          onHandleShow={() => setDos(false)}
          id={data?.InvestigationID}
        />
      )}
      {show && (
        <RejectModal
          show={show}
          handleShow={handleShow}
          data={data}
          TableData={TableData}
        />
      )}
      <td className={`color-Status-${data.Status} `} data-title={t("S.No")}>
        {index + 1}
        {data.StatSample == 1 ? (
          <span
            className="fa fa-cog fa-spin"
            data-toggle="tooltip"
            data-placement="top"
            title="STATSample"
          ></span>
        ) : (
          <></>
        )}&nbsp;
        {data?.isUrgent === 1 && (
          <span>
            <img
              src={Urgent}
              className="sizeicon ml-2"
              title="Urgent"
            ></img>
          </span>
        )}
        {/* {data?.IsVip === 1 && (
          <span>
            <i
              className="bi bi-shield-fill-check mr-1 vip-font-size"
              style={{ color: "#FFC107", display: "inline", width: "5%" }}
              title="VIP Patient"
            />
          </span>

        )} */}
      </td>

      <td
        data-title={t("Test")}
        onMouseEnter={() => {
          if (data?.SampleRemarks != "") {
            setMouseHover({
              index: index,
              data: data?.SampleRemarks,
            });
          }
        }}
        onMouseLeave={() => {
          if (data?.SampleRemarks != "") {
            setMouseHover({
              index: -1,
              data: "",
            });
          }
        }}
      >
        {mouseHover?.index === index && data?.SampleRemarks && (
          <div className="sampleremarktest">
            <span>{mouseHover?.data}</span>
          </div>
        )}
        {data?.Test || data?.TestName || data?.ItemName || data?.testName || ""}
      </td>

      <td data-title={t("Barcode No")}>
        <input
          value={data?.SINNo}
          name="SINNo"
          className="form-control"
          type="text"
          maxLength={Number(BarocdeNoMaxLength) || undefined}
          onChange={(e) =>
            handleBarcode(e, data?.BarcodeLogic, data?.SampleTypeID, index)
          }
          onBlur={(e) => {
            handleCloseBarcodeModal(
              e.target.value,
              data?.LedgerTransactionID,
              data?.BarcodeLogic,
              data?.SampleTypeID,
            );
            if (DefaultCurrencyName === "KES") {
              if (e.target.value.length < 9) {
                toast.error(
                  t("Barcode Should Contain at least 9 characters")
                );
                return;
              }
            }

          }}
        />
      </td>
      {/* <td data-title={t("UHID")}>
        {data?.PatientCode}
      </td> */}
      <td
        data-title={t("Barcode Print")}
      // style={{ textAlign: "center", color: "black !important" }}
      >
        {data?.Status == 2 || data?.Status == 3 ? (
          <div
            className="pt-2"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div
              onClick={() => {
                getBarcodeData(data?.TestID, data?.VisitNo, [data?.SINNo]);
              }}
            >
              <Tooltip label={"TestWise"}>
                <i className="fa fa-print " style={{ cursor: "pointer" }}></i>
              </Tooltip>
            </div>
            <div
              onClick={() => {
                console.log("dataBarcode", data);
                getAllDepartmentBarcodeData(
                  data?.VisitNo,
                  data?.DepartmentID,
                  data?.SINNo,
                );
              }}
            >
              <Tooltip label={"DepartmentWise"}>
                <i
                  className="fa fa-print pl-4 "
                  style={{ cursor: "pointer", color: "red" }}
                ></i>
              </Tooltip>
            </div>
          </div>
        ) : (
          <> &nbsp;</>
        )}
      </td>
      {!data?.HideSourceofSample ? (
        <td data-title={t("Source")}>
          <SelectBox
            onChange={(e) => handleChange(e, index)}
            name="Source"
            options={SampleSource}
            selectedValue={data?.Source}
          />
        </td>
      ) : (
        <td></td>
      )
      }

      {/* <td data-title={t("Source")}>
        <SelectBox
          onChange={(e) => handleChange(e, index)}
          name="Source"
          options={SampleSource}
          selectedValue={data?.Source}
        />
      </td>
       */}
      <td
        data-title={t("DOS")}
        style={{
          textAlign: "center",
        }}
        onClick={() => setDos(true)}
      >
        <i className="fa fa-home iconStyle p-1" />
      </td>

      <td data-title={t("Vial Qty")}>
        {(data.Status === 1 || data.Status === 4) && data?.SINNo !== "" ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <i
              className="fa fa-minus text-danger pointer"
              onClick={() => handleValQty("sub", data?.SINNo, data?.isSelected)}
            ></i>
            {/* <button className="btn btn-sm btn-danger">-</button> */}
            <span className="mx-2 ">{data?.valQty}</span>
            <i
              className="fa fa-plus text-success pointer"
              onClick={() => handleValQty("add", data?.SINNo, data?.isSelected)}
            ></i>
            {/* <button className="btn btn-sm btn-primary">+</button> */}
          </div>
        ) : (
          <>{data?.VialQty}</>
        )}
      </td>
      <td data-title={t("No Of Pricks")}>
        <SelectBox
          options={NoOfPricks}
          id="NoOfPricks"
          name="NoOfPricks"
          isDisabled={
            !(data.Status === 1 || data.Status === 4) ||
            data?.PricksNotRequired == 1
          }
          selectedValue={data?.NoOfPricks === 0 ? 1 : data?.NoOfPricks}
          onChange={(e) => {
            handleChange(e, index, data?.SINNo, data?.isSelected);
          }}
        />
      </td>
      <td data-title={t("Remarks")}>
        {!(data.Status === 1 || data.Status === 4) ||
          data?.NoOfPricks === "" ||
          !data?.NoOfPricks ? (
          <button
            type="button"
            className="btn btn-primary btn-sm form-control input-sm"
            disabled
          >
            {t("Remark")}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm form-control input-sm"
            name="PricksRemarks"
            onClick={handleShowRemark}
          >
            {t("Remark")}
          </button>
        )}
      </td>
      <td
        data-title={t("SampleTypeID")}
        style={{ padding: "4px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
          <select
            title="Select Color"
            onChange={(e) => handleColorChange(e, index, data)}
            value={data?.ColorName || ""}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "5px",
              backgroundColor: data?.ColorName,
              color: "transparent",
              cursor: "pointer",
              border: "1px solid #ccc",
              appearance: "none",
              flexShrink: 0,
            }}
          >
            <option value="" style={{ backgroundColor: "#fff", display: "none" }}></option>
            {uniqueSampleColors.map((colorItem) => (
              <option
                key={colorItem.id}
                value={colorItem.ColorName}
                style={{ backgroundColor: colorItem.ColorName, color: "transparent" }}
              >
                {colorItem.ColorName}
              </option>
            ))}
          </select>
        </div>
        <div style={{ width: "100%" }}>
          <SelectBox
            name="SampleTypeID"
            options={sampleTypeDropdown && sampleTypeDropdown.length > 0 ? sampleTypeDropdown : (data?.SampleType ? [{ value: data?.SampleTypeID || 1, label: data?.SampleType }] : [
              { value: 1, label: "Whole Blood EDTA" },
              { value: 2, label: "Serum" },
              { value: 3, label: "Fluoride Plasma" },
              { value: 4, label: "Sodium Citrate Plasma" },
              { value: 5, label: "Plain Blood (Red)" },
              { value: 6, label: "Heparin Plasma" },
              { value: 7, label: "Urine Routine" }
            ])}
            onChange={(e) => handleChange(e, index)}
            selectedValue={data?.SampleTypeID}
          />
        </div>
        {data?.IsHisto == 1 && (
          <>
            <SampleHisto
              lable="No. Of Container"
              name="Container"
              handleChange={(e) => handleChange(e, index)}
              value={data?.Container}
            />
            <SampleHisto
              lable="No. Of Slide"
              name="Slide"
              handleChange={(e) => handleChange(e, index)}
              value={data?.Slide}
            />
            <SampleHisto
              lable="No. Of Block"
              name="Block"
              handleChange={(e) => handleChange(e, index)}
              value={data?.Block}
            />
          </>
        )}
      </td>
      <td data-title={t("Reject")}>
        {data.Approved === 0 && data.Status != 4 && (
          <div className="d-flex align-items-center">
            <input
              type="checkbox"
              className="ml-2"
              checked={data?.isReject}
              onChange={(e) => handleRejectPayload(e, index, data)}
            />
          </div>
        )}
      </td>
      <td
        data-title={t("Select")}
        className="text-center"
        style={{ textAlign: "center" }}
      >
        {data.Status !== 2 &&
          data.Status !== 3 &&
          data.Status !== 10 &&
          data.Status !== 6 &&
          data.Status !== 5 &&
          data.Approved !== 1 &&
          (data.Status === 1 ||
            (data.Status === 4 && data?.isSampleReCollection == 1) ||
            snr) && (
            <input
              disabled={
                data.Status == 1 ||
                  (data.Status === 4 && data?.isSampleReCollection == 1) ||
                  snr
                  ? false
                  : true
              }
              checked={data?.isSelected}
              type="checkbox"
              onChange={(e) => {
                handlePayload(e, index, data);
              }}
            />
          )}
      </td>
      {accessRight?.includes("29") && (
        <td data-title={t("Remove Barcode")} className="text-center">
          {(data?.SINNo || data?.BarcodeNo) &&
            data?.ResultFlag === 0 &&
            data?.MacDataCount === 0 ? (
            <input
              type="checkbox"
              checked={removeBarcodePayload?.includes(data?.TestIDHash || data?.TestIdhash)}
              onChange={(e) => handleRemoveBarcodePayload(e, data)}
            />
          ) : (
            <Tooltip
              label={
                !(data?.SINNo || data?.BarcodeNo) ? t("No Barcode/SIN") :
                  data?.ResultFlag !== 0 ? t("Result already flagged") :
                    data?.MacDataCount !== 0 ? t("Machine data exists") :
                      t("Cannot remove")
              }
            >
              <i
                className="bi bi-ban m-0 text-icon-size-comment ml-3"
                style={{ color: "red" }}
              ></i>
            </Tooltip>
          )}
        </td>
      )}
      <td data-title={t("Urgent")}>
        {data.Approved === 0 && data.Status != 4 && (
          <div>
            <input
              checked={data?.isUrgent === 1 || data?.isUrgent === true}
              type="checkbox"
              onChange={(e) => {
                handleUrgent(e, index, data);
              }}
            />
          </div>
        )}
      </td>
    </>
  );
}

export default SampleCollectionTable;
