import React, { useEffect, useState } from "react";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import { checkDuplicateBarcode } from "../../utils/NetworkApi/commonApi";
import { useLocation } from "react-router-dom";
import { isChecked } from "../util/Commonservices";

function BarcodeLogicModal({
  show,
  onClose,
  tableData,
  data,
  handleCloseBarcodeModal,
  BarcodeLogic,
  setShow5,
  LedgerTransactionID = "",
}) {
  const { t } = useTranslation();
  const [barcode, setBarcode] = useState(data?.InvestigationSampleType);
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  // const handleChangePloBarCode = (e, sampletypeId) => {
  //   const value = e?.target?.value?.trimStart();

  //   if (BarcodeLogic === 5) {
  //     const updatedBarCodeData = barcode?.map((ele) => ({
  //       ...ele,
  //       barcodeNo: value,
  //       // ele?.sampleId === sampletypeId ? value : ele?.barcodeNo || "",
  //     }));
  //     setBarcode(updatedBarCodeData);
  //   }
  //   if (BarcodeLogic === 4) {
  //     const updatedBarCodeData = barcode?.map((ele) => ({
  //       ...ele,
  //       barcodeNo:
  //         ele?.sampleId === sampletypeId ? value : ele?.barcodeNo || "",
  //     }));
  //     setBarcode(updatedBarCodeData);
  //   }
  //   if (BarcodeLogic === 3) {
  //     const updatedBarCodeData = barcode.map((ele) => ({
  //       ...ele,
  //       barcodeNo: ele?.sampleId != 0 ? value : "",
  //     }));
  //     setBarcode(updatedBarCodeData);
  //   }
  // };

  const handleChangePloBarCode = (e, sampletypeId) => {
    // Handle both plain value and event object
    const value = (typeof e === "string" ? e : e?.target?.value)?.trimStart() ?? "";

    if (BarcodeLogic === 5) {
      const updatedBarCodeData = barcode?.map((ele) => ({
        ...ele,
        barcodeNo: value,
      }));
      setBarcode(updatedBarCodeData);
    }
    if (BarcodeLogic === 4) {
      const updatedBarCodeData = barcode?.map((ele) => ({
        ...ele,
        barcodeNo: ele?.sampleId === sampletypeId ? value : ele?.barcodeNo || "",
      }));
      setBarcode(updatedBarCodeData);
    }
    if (BarcodeLogic === 3) {
      const updatedBarCodeData = barcode.map((ele) => ({
        ...ele,
        barcodeNo: ele?.sampleId != 0 ? value : "",
      }));
      setBarcode(updatedBarCodeData);
    }
  };
  const handleSetAndClose = async () => {
    const allSampleIdsZero = barcode?.every((ele) => ele?.sampleId === "0");
    const selectedBarcodes = barcode?.filter((ele) => ele?.setBarcode === 1);

    if (allSampleIdsZero) {
      setShow5({ modal: false, index: -1 });
      // toast.error("Not set for sample not required")
    } else {
      // const checkBarcode = barcode?.find((ele) => {
      //   if (ele?.sampleId === "0") {
      //     return false;
      //   }
      //   return ele?.barcodeNo === "" || ele?.barcodeNo?.length < 3;
      // });
      if (!selectedBarcodes || selectedBarcodes?.length === 0) {
        toast.error("Please select atleast one row");
        return;
      }
      const checkBarcode = barcode?.find((ele) => {
        if (ele?.sampleId === "0") return false;
        if (
          ele?.setBarcode === 1 &&
          (ele?.barcodeNo === "" || ele?.barcodeNo?.length < 3)
        ) {
          return true;
        }
        return false;
      });
      if (checkBarcode) {
        if (checkBarcode.barcodeNo === "") {
          toast.error("Barcode is Required");
        } else {
          toast.error("Minimum 3 Char is Required");
        }
        return;
      }
      let hasError = false;
      if (BarcodeLogic == 4) {
        const checkedSampleIds = new Set();
        for (const item of barcode) {
          const value = item.barcodeNo;
          const sampleId = item.sampleId;
          if (sampleId === "0" || !item.setBarcode) {
            continue;
          }
          if (!checkedSampleIds.has(sampleId)) {
            const res = await checkDuplicateBarcode(value, LedgerTransactionID);
            checkedSampleIds.add(sampleId);
            if (res !== "") {
              toast.error(res);
              setBarcode((prev) =>
                prev.map((ele) =>
                  ele.sampleId === sampleId ? { ...ele, barcodeNo: "" } : ele,
                ),
              );
              hasError = true;
              break;
            }
          }
        }
      }
      if (BarcodeLogic == 3) {
        const found = barcode?.find(
          (item) => item?.sampleId !== "0" && item?.barcodeNo,
        );

        const res = await checkDuplicateBarcode(
          found.barcodeNo,
          LedgerTransactionID,
        );
        if (res !== "") {
          toast.error(res);
          setBarcode((prev) => prev.map((ele) => ({ ...ele, barcodeNo: "" })));
          hasError = true;
        }
      }
      if (!hasError) {
        toast.success("Barcode Save Successfully");
        handleCloseBarcodeModal(barcode);
      }
    }
  };
  const handleAllCheckbox = (e) => {
    const { checked } = e.target;
    const data = barcode?.map((ele) => {
      return {
        ...ele,
        setBarcode: checked ? 1 : 0,
      };
    });

    setBarcode(data);
  };

  const handleCheckbox = (e, index) => {
    const { name, checked } = e.target;
    const datas = [...barcode];
    if (BarcodeLogic === 5) {
      const sampleId = datas[index].sampleId;
      datas.forEach((item) => {
        item[name] = checked ? 1 : 0;
        // if (item.sampleId === sampleId) {
        // }
      });
    }

    if (BarcodeLogic === 4) {
      const sampleId = datas[index].sampleId;
      datas.forEach((item) => {
        if (item.sampleId === sampleId) {
          item[name] = checked ? 1 : 0;
        }
      });
    }

    if (BarcodeLogic === 3) {
      datas[index][name] = checked ? 1 : 0;
    }

    setBarcode(datas);
  };

  useEffect(() => {
    if (show?.modal) {
      setBarcode(
        JSON.parse(JSON.stringify(data?.InvestigationSampleType || {})),
      );
    }
  }, [show?.modal, data]);
  console.log(barcode);
  return (
    <Dialog
      visible={show?.modal}
      className={theme}
      header={t("Set Your BarCode Here")}
      onHide={onClose}
      style={{
        width: isMobile ? "80vw" : "50vw",
      }}
    >
      <>
        <div className="row">
          <Tables>
            <thead className="cf">
              <tr>
                <th>TestID</th>
                <th>Test Name</th>
                <th>SampleType Name</th>
                <th>BarCode</th>
                <th className="text-center">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={
                      barcode?.length > 0
                        ? isChecked("setBarcode", barcode, true).includes(false)
                          ? false
                          : true
                        : false
                    }
                    name="setBarcode"
                    onChange={handleAllCheckbox}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {barcode?.map((data, index) => (
                <tr key={index}>
                  <td data-title={t("TestId")}>{data?.testID}&nbsp;</td>
                  <td data-title={t("Test Name")}>{data?.testName}&nbsp;</td>
                  <td data-title={t("SampleType Name")}>
                    {data?.sampleName}&nbsp;
                  </td>
                  <td data-title={t("BarCode")}>
                    <Input
                      type="text"
                      value={data?.barcodeNo}
                      onChange={(e) => {
                        handleChangePloBarCode(e, data?.sampleId);
                      }}
                      max={15}
                      min={3}
                      // disabled={data?.sampleId == "0" || BarcodeLogic ===3 ? true : false}

                      disabled={
                        location.pathname?.toLowerCase() ===
                          "/editpatientdetails"
                          ? data?.sampleId == "0" ||
                          !data?.setBarcode ||
                          (BarcodeLogic === 3 && data?.barcodefill) ||
                          (BarcodeLogic === 5 && data?.barcodefill) ||
                          (BarcodeLogic == 4 && data?.barcodefill)
                          : data?.sampleId == "0" || !data?.setBarcode
                      }
                    // onInput={(e) => {
                    //   checkDuplicate(e?.target?.value, data?.sampleId)
                    // }}
                    />
                  </td>
                  <td className="text-center" data-title={t("setBarcode")}>
                    {data?.sampleId == "0" ? (
                      <></>
                    ) : (
                      <input
                        type="checkbox"
                        checked={data?.setBarcode}
                        name="setBarcode"
                        onChange={(e) => handleCheckbox(e, index)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>

        <div className="row mt-2">
          <div className="col-sm-4">
            <button
              className="btn btn-block btn-success btn-sm"
              onClick={handleSetAndClose}
            >
              {t("Set & Close")}
            </button>
          </div>
        </div>
      </>
    </Dialog>
  );
}

export default BarcodeLogicModal;
