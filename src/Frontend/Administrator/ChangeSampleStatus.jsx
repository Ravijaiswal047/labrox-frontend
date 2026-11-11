import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import CustomModal from "../utils/CustomModal";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { ReportTypeNew } from "../../utils/Constants";
import { CancelButton, EditButton, SearchButton } from "../../components/UI/CustomButton";
const ChangeSampleStatus = () => {
  const { t } = useTranslation();
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    LabNo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  // const fetch = (e) => {
  //   e.preventDefault();
  //   axiosInstance
  //     .post("ChangeSampleStatusData/GetChangeSampleStatusData", {
  //       LabNo: input?.LabNo,
  //     })
  //     .then((res) => {
  //       const data = res?.data?.message;
  //       if (data.length > 0) {
  //         const val = data.map((ele) => {
  //           return {
  //             ...ele,
  //             ResultRemove: "0",
  //             SampleRemove: "0",
  //             // ReportType: "",
  //           };
  //         });
  //         setData(val);
  //       } else {
  //         toast.error("No Data Found");
  //       }
  //     })
  //     .catch((err) => {
  //       toast.error(
  //         err?.response?.data?.message
  //           ? err?.response?.data?.message
  //           : err?.data?.message,
  //       );
  //     });
  // };



  const Submit = () => {
    setLoading(true);
    const val = data.filter((ele) => ele.isChecked);
    if (val.length > 0) {
      const playdata = val.map((ele) => {
        const defaultReason = ele?.SampleRemove === "1" ? "Sample Status Remove" : ele?.ResultRemove === "1" ? "Result Remove" : "Status Change";
        return {
          LabNo: ele?.LedgerTransactionNo,
          ResultRemove: ele?.ResultRemove?.toString(),
          TestId: ele?.TestID,
          SampleRemove: ele?.SampleRemove?.toString(),
          ReportTypeStatus: ele?.ReportType,
          ReportType: ele?.ReportType,
          Reason: ele?.Reason || ele?.Remarks || defaultReason,
          Remarks: ele?.Remarks || ele?.Reason || defaultReason,
        };
      });
      axiosInstance
        .post("ChangeSampleStatusData/UpdateChangeSampleStatusData", playdata)
        .then((res) => {
          toast.success(res?.data?.message);
          setLoading(false);
          handleSearch();
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
      toast.error("Please Choose AtLeast One Test");
      setLoading(false);
    }
  };

  const handleReactSelect = (name, value, index) => {
    const val = [...data];
    val[index][name] = value?.value;
    val[index].isChecked = true;
    setData(val);
  };

  const ShowBtn = () => {
    return data.some((item) => item.isChecked);
  };

  const handleCheckbox = (e, index) => {
    const { name, checked } = e.target;
    const val = [...data];
    val[index][name] = checked ? "1" : "0";
    if (checked) {
      val[index].isChecked = true;
      if (name === "ResultRemove") {
        val[index].SampleRemove = "0";
      } else if (name === "SampleRemove") {
        val[index].ResultRemove = "0";
      }
    }
    setData(val);
  };

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    const val = data.map((item) => ({
      ...item,
      isChecked: checked,
    }));
    setData(val);
  };

  const handleRowCheck = (e, index) => {
    const { checked } = e.target;
    const val = [...data];
    val[index].isChecked = checked;
    setData(val);
  };

  const handleCancel = () => {
    setData([]);
    setInput({ LabNo: "" });
  };


  const handleSearch = () => {
    axiosInstance.post("ChangeSampleStatusData/GetChangeSampleStatusData", {
      LabNo: input?.LabNo
    })
      .then((res) => {
        const data = res?.data?.message;
        if (res?.data?.success && data.length > 0) {
          setData(data.map((item) => ({ ...item, isChecked: false })));
        } else {
          toast.error("No Data Found");
          setData([]);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
      });
  }

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
        name={t("Change Sample Status")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-2">
              <Input
                id="Lab No"
                lable="Visit No / Barcode"
                placeholder=" "
                type="text"
                name="LabNo"
                value={input.LabNo}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-1">
              {/* <button
                className="btn btn-block btn-info btn-sm"
                disabled={input?.LabNo.length > 3 ? false : true}
              >
                {t("Search")}
              </button> */}
              <SearchButton
                text={"Search"}
                disabled={input?.LabNo.length > 3 ? false : true}
                onClick={handleSearch}
              />
            </div>
          </div>
        </form>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {data.length > 0 ? (
          <>
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("View")}</th>
                  <th>{t("Lab No.")}</th>
                  <th>{t("PName")}</th>
                  <th>{t("Age/Sex")}</th>
                  <th>{t("Investigation")}</th>
                  <th>{t("BarCode")}</th>
                  <th>{t("Result Remove")}</th>
                  <th>{t("Sample Status Remove")}</th>
                  <th>{t("Report Type")}</th>
                  <th>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        data.length > 0 && data.every((item) => item.isChecked)
                      }
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td
                        data-title={t("View")}
                        onClick={() => {
                          setModal(true);
                          setVisitID(item.LedgerTransactionNo);
                        }}
                      >
                        <i className="fa fa-search" />
                      </td>
                      <td data-title={t("Lab No.")}>
                        {item.LedgerTransactionNo}&nbsp;
                      </td>
                      <td data-title={t("PName")}>{item?.PName}&nbsp;</td>
                      <td data-title={t("Age/Sex")}>{item.AgeGender}&nbsp;</td>
                      <td data-title={t("Investigation")}>
                        {item.Investigation}&nbsp;
                      </td>
                      <td data-title={t("BarcodeNo")}>
                        {item.BarcodeNo}&nbsp;
                      </td>

                      <td data-title={t("Result Remove")}>
                        <input
                          type="checkbox"
                          name="ResultRemove"
                          checked={item?.ResultRemove === "1" ? true : false}
                          disabled={item?.Approved == 1 || (item?.ResultFlag != 1 && item?.status != 10)}
                          onChange={(e) => {
                            handleCheckbox(e, index);
                          }}
                        />
                      </td>
                      <td data-title={t("Sample Status Remove")}>
                        <input
                          type="checkbox"
                          name="SampleRemove"
                          checked={item?.SampleRemove === "1" ? true : false}
                          disabled={item?.status == 1 && true}
                          onChange={(e) => {
                            handleCheckbox(e, index);
                          }}
                        />
                      </td>
                      <td data-title={t("Report Type")}>
                        <ReactSelect
                          dynamicOptions={ReportTypeNew?.filter((opt) => opt.value !== "")}
                          isShowBorder={true}
                          name={"ReportType"}
                          id={"ReportType"}
                          value={item?.ReportType}
                          onChange={(selectedOption, value) =>
                            handleReactSelect(selectedOption, value, index)
                          }
                          isDisabled={item?.ResultFlag == 1 || item?.Approved == 1}
                        />
                      </td>
                      <td data-title={t("Select")}>
                        <input
                          type="checkbox"
                          checked={item?.isChecked}
                          onChange={(e) => handleRowCheck(e, index)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Tables>

            {loading ? (
              <Loading />
            ) : (
              ShowBtn() && (
                <>
                  <div className="row mt-2 mb-1 px-2">
                    <div className="col-sm-1">
                      <EditButton
                        text={"Update"}
                        onClick={Submit}
                      />
                    </div>
                    <div className="col-sm-1">
                      <CancelButton
                        text={"Cancel"}
                        onClick={handleCancel}
                      />
                    </div>
                  </div>
                </>
              )
            )}
          </>
        ) : (
          <>
            {" "}
            <NoRecordFound />{" "}
          </>
        )}{" "}
      </Accordion>
    </>
  );
};

export default ChangeSampleStatus;
