import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import CustomModal from "../utils/CustomModal";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { checkDuplicateBarcode } from "../../utils/NetworkApi/commonApi";
import { isChecked } from "../util/Commonservices";
import { CancelButton, EditButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const ChangeBarCode = () => {
  const { t } = useTranslation();
  const [LabNo, setLabNo] = useState("");
  const [data, setData] = useState([]);
  const ComingBarcodeLogic = data[0]?.BarcodeLogic
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();

  const userData = useLocalStorage("userData", "get");
  console.log("userData", userData);
  const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const location = useLocation();
  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
  const handleChangeNew = (e, index, sampletypeId) => {
    const { checked } = e.target;
    if (index >= 0) {
      const updateData = data.map((ele, i) => {
        if (isManual ? i === index : ele?.SampleTypeID === sampletypeId) {
          return {
            ...ele,
            isSelect:
              checked && (ele?.BarcodeNo && ele?.BarcodeLogic !== 1 && (DefaultCurrencyName === "KES" || ele?.BarcodeLogic !== 3))
                ? true
                : false,
          };
        } else {
          return ele;
        }
      });

      setData(updateData);
    } else {
      const updateData = data.map((ele) => {
        return {
          ...ele,
          isSelect:
            checked && (ele?.BarcodeNo && ele?.BarcodeLogic !== 1 && (DefaultCurrencyName === "KES" || ele?.BarcodeLogic !== 3))
              ? true
              : false,
        };
      });
      setData(updateData);
    }
  };

  // const handleChangeNew = (e, index, sampletypeId) => {
  //   const { checked } = e.target;
  //   if (index >= 0) {
  //     const updateData = data.map((ele, i) => {
  //       const isMatch = DefaultCurrencyName === "KES"
  //         ? i === index
  //         : (isManual ? i === index : ele?.SampleTypeID === sampletypeId);

  //       if (isMatch) {
  //         return {
  //           ...ele,
  //           isSelect:
  //             checked && (ele?.BarcodeNo && ele?.BarcodeLogic !== 1 && (DefaultCurrencyName === "KES" || ele?.BarcodeLogic !== 3))
  //               ? true
  //               : false,
  //         };
  //       } else {
  //         return ele;
  //       }
  //     });

  //     setData(updateData);
  //   } else {
  //     const updateData = data.map((ele) => {
  //       if (DefaultCurrencyName === "KES") return ele;
  //       return {
  //         ...ele,
  //         isSelect:
  //           checked && (ele?.BarcodeNo && ele?.BarcodeLogic !== 1 && (DefaultCurrencyName === "KES" || ele?.BarcodeLogic !== 3))
  //             ? true
  //             : false,
  //       };
  //     });
  //     setData(updateData);
  //   }
  // };
  const fetch = () => {
    // console.log("entered",Lab);
    setLoading(true);
    axiosInstance
      .post("ChangeBarcode/GetData", {
        labNo: reprintLabNo && location.pathname !== '/ChangeBarCode' ? reprintLabNo : LabNo,
      })
      .then((res) => {
        const data = res?.data?.message;
        if (data.length > 0) {
          const val = data.map((ele) => {
            return {
              ...ele,
              labNo: ele?.LedgerTransactionNo,
              isSelect: false,
              oldBarcodeNo: ele?.BarcodeNo,
            };
          });
          setLoading(false);
          setData(val);
        } else {
          toast.error("No Data Found");
          setData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
        setLoading(false);
      });
  };

  const Submit = () => {
    const val = data.filter((ele) => ele?.isSelect === true);
    const invalidBarcode = val.find(
      (ele) => !ele?.BarcodeNo || ele?.BarcodeNo?.length < 9
    );
    const invalidmaxBarcode = val.find(
      (ele) => ele?.BarcodeNo && (ele?.BarcodeNo?.length > 11)
    );

    if (DefaultCurrencyName === "KES") {
      if (invalidBarcode && ComingBarcodeLogic == 3) {
        toast.error("Barcode min length must be at least 9");
        return;
      }
      if (invalidmaxBarcode && ComingBarcodeLogic == 3) {
        toast.error("Barcode max length only be  11");
        return;
      }
    }

    if (val.length > 0) {
      setLoading(true);
      axiosInstance
        .post("ChangeBarcode/UpdateBarcode", {
          savedata: val,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          setLoading(false);
          fetch();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : err?.data?.message,
          );
          setLoading(false);
        });
    } else {
      toast.error("Please Choose One Test");
    }
  };

  const handleBarcode = (e, i, barcodeLogic, sampletypeId) => {
    const { value } = e.target;
    //  ADD THIS: block input if more than 9 characters
    if (value.length > 9) {
     toast.error("Barcode cannot exceed 9 characters");
      return;
    }
    if (barcodeLogic === 1 || barcodeLogic === 2) {
      const updateData = data.map((ele, index) => {
        if (index === i) {
          return {
            ...ele,
            isSelect: false,
            BarcodeNo: value,
          };
        } else {
          return ele;
        }
      });
      setData(updateData);
    } else if (barcodeLogic === 3) {
      const updateData = data.map((ele, index) => {
        if (isManual ? index === i : true) {
          return {
            ...ele,
            BarcodeNo: value,
          };
        } else {
          return ele;
        }
      });
      setData(updateData);
    }

    if (barcodeLogic === 4) {
      // Only check for duplicates when manual mode is disabled
      if (!isManual) {
        let flag = true;
        for (let j = 0; j < data.length; j++) {
          if (
            data[j]?.SampleTypeID !== sampletypeId &&
            value !== "" &&
            value === data[j]?.BarcodeNo
          ) {
            flag = false;
            break;
          }
        }

        if (!flag) {
          toast.error("This BarCode is Already Given");
          return;
        }
      }

      // Update the barcode value
      const updateData = data.map((ele, index) => {
        if (isManual ? index === i : ele?.SampleTypeID === sampletypeId) {
          return {
            ...ele,
            BarcodeNo: value,
          };
        } else {
          return ele;
        }
      });
      setData(updateData);
    }
  };

  // validation
  const handleCloseBarcodeModal = (
    value,
    LedgerTransactionID,
    barcodeLogic,
    sampletypeId,
    i,
  ) => {
    if (value !== "") {
      checkDuplicateBarcode(value, LedgerTransactionID).then((res) => {
        if (res === " " || res === "") {
        } else {
          if (barcodeLogic === 3) {
            const updatedData = data.map((ele, index) => {
              if (isManual ? index === i : true) {
                return {
                  ...ele,
                  BarcodeNo: "",
                  LedgerTransactionID: LedgerTransactionID,
                };
              } else {
                return ele;
              }
            });
            setData(updatedData);
            toast.error(res);
          }

          if (barcodeLogic === 4) {
            const updatedData = data.map((ele, index) => {
              if (isManual ? index === i : ele?.SampleTypeID === sampletypeId) {
                return {
                  ...ele,
                  BarcodeNo: "",
                  isChecked: "true",
                };
              } else {
                return ele;
              }
            });
            setData(updatedData);
            toast.error(res);
          }
        }
      });
    }
  };

  // end

  const handleCancle = () => {
     setData([]);
    setLabNo("");
  };

  const hiddenButtons = () => {
    const val = data?.filter((item) => item?.isSelect === true);
    return val.length > 0 ? true : false;
  };

  useEffect(() => {
    if (reprintLabNo && location.pathname !== '/ChangeBarCode') {
      // setPayload((prev) => ({
      //   ...prev,             
      //   LabNo: reprintLabNo              
      // }));
      // fetch({ LabNo : reprintLabNo});
      setLabNo(reprintLabNo);
      fetch()
    }
  }, []);
  const hasSampleCollected = data?.some(
    (item) => item?.IsSampleCollected === "Y" && item?.BarcodeLogic === 3
  );

  return (
    <>
      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}
      <Accordion
        name={t("Change BarCode")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {/* <form action="" onSubmit={fetch}> */}
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <Input
              id="Lab No"
              // lable="Lab Number"
              lable="Visit No"
              placeholder=" "
              type="text"
              value={LabNo}
              onChange={(e) => setLabNo(e.target.value)}
              required
            />
          </div>
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <SearchButton
                text={"Search"}
                id="btnSave"
                onClick={fetch}
                disabled={LabNo.length > 3 ? false : true}
              />
            )}
          </div>
        </div>
        {/* </form> */}
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Accordion
            title={t("Search Detail")}
            defaultValue={true}
            linkTo={"#"}
            notopen={true}
            linkTitle={
              <div
                className="d-flex align-items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isManual}
                  onChange={(e) => setIsManual(e.target.checked)}
                />
                <label
                  className="ml-2 mb-0"
                  style={{ cursor: "pointer" }}
                >
                  {t("Manual")}
                </label>
              </div>
            }
          >
            {data.length > 0 ? (
              <>
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("View")}</th>
                      <th>{t("Lab No.")}</th>
                      <th>{t("PName")}</th>
                      <th>{t("Age/Sex")}</th>
                      <th>{t("Sample Type")}</th>
                      <th>{t("Investigation")}</th>
                      <th>{t("BarCode")}</th>
                      <th>
                        <div>{t("Test")}</div>
                        <div>
                          <input
                            type="checkbox"
                            name="isSelect"
                            disabled={data.some((item) => item?.IsSampleCollected === "Y")}
                            checked={
                              data.length > 0 &&
                              data.filter(
                                (item) =>
                                  item?.BarcodeNo &&
                                  item?.BarcodeLogic !== 1 &&
                                  (DefaultCurrencyName === "KES" || item?.BarcodeLogic !== 3)
                              ).length > 0 &&
                              data
                                .filter(
                                  (item) =>
                                    item?.BarcodeNo &&

                                    item?.BarcodeLogic !== 1
                                    &&
                                    (DefaultCurrencyName === "KES" || item?.BarcodeLogic !== 3)
                                )
                                .every((item) => item?.isSelect)
                            }
                            onChange={(e) => {
                              handleChangeNew(e);
                            }}
                          // disabled={
                          //   data[0]?.BarcodeLogic === 4 ||
                          //     data[0]?.BarcodeLogic === 2
                          //     ? true
                          //     : false
                          // }
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.map((item, index) => (
                      <tr key={index}>
                        <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                        <td
                          data-title={t("View")}
                          onClick={() => {
                            setModal(true);
                            setVisitID(item?.LedgerTransactionNo);
                          }}
                        >
                          <i className="fa fa-search" />
                        </td>
                        <td data-title={t("Lab No.")}>
                          {item.LedgerTransactionNo}&nbsp;
                        </td>
                        <td data-title={t("PName")}>{item?.PName}&nbsp;</td>
                        <td data-title={t("Age/Sex")}>
                          {item.AgeGender}&nbsp;
                        </td>
                        <td data-title={t("Sample Type")}>
                          {item.SampleTypeName}&nbsp;
                        </td>
                        <td data-title={t("Investigation")}>
                          {item.Investigation}&nbsp;
                        </td>
                        <td data-title={t("BarCode")}>
                          {item.BarcodeLogic === 3 ||
                            item.BarcodeLogic === 4 ? (
                            <input
                              type="text"
                              disabled={hasSampleCollected}
                              value={item.BarcodeNo}
                              name="BarcodeNo"
                              maxLength={9}
                              minLength={1}
                              onChange={(e) => {
                                handleBarcode(
                                  e,
                                  index,
                                  item?.BarcodeLogic,
                                  item?.SampleTypeID,
                                );
                              }}
                              onBlur={(e) => {
                                handleCloseBarcodeModal(
                                  e.target.value,
                                  item?.LedgerTransactionID,
                                  item?.BarcodeLogic,
                                  item?.SampleTypeID,
                                  index,
                                );
                              }}

                            />
                          ) : (
                            item.BarcodeNo
                          )}
                          &nbsp;
                        </td>
                        <td data-title={t("Test")}>
                          <input
                            disabled={hasSampleCollected}
                            type="checkbox"
                            name="isSelect"
                            onChange={(e) =>
                              handleChangeNew(e, index, item?.SampleTypeID)
                            }
                            checked={item?.isSelect}
                          // disabled={
                          //   item?.BarcodeLogic === 1 ||
                          //     item?.BarcodeLogic === 3
                          //     ? trueo
                          //     : item?.BarcodeNo
                          //       ? false
                          //       : true
                          // }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>

                {loading ? (
                  <Loading />
                ) : (
                  <>
                    {hiddenButtons() && (
                      <div className="row mt-2 mb-2 px-2">
                        <div className="col-sm-1">
                          <EditButton
                            text={"Update"}
                            id="btnUpdate"
                            onClick={Submit}
                          />
                        </div>

                        <div className="col-sm-1">

                          <CancelButton
                            text={"Cancel"}
                            id="btnCancle"
                            onClick={handleCancle}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <NoRecordFound />
              </>
            )}
          </Accordion>
        </>
      )}
    </>
  );
};

export default ChangeBarCode;
