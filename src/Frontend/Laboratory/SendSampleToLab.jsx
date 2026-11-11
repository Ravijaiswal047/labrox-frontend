import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  getAccessCentres,
  getCollectionBoy,
} from "../../utils/NetworkApi/commonApi";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import moment from "moment";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import { getAccurateAge, Status } from "../../utils/Constants";
import { IndexHandle, Time } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import Pagination from "../../Pagination/Pagination";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
const SendSampleToLab = () => {
  const [Center, setCenter] = useState([]);
  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const [CollectionBoy, setCollectionBoy] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [ToCenter, setToCenter] = useState([]);
  const [load, setLoad] = useState({
    searchLoad: false,
    saveLoad: false,
  });
  const [errors, setErrors] = useState({});
  const { t, i18n } = useTranslation();
  const today = new Date();
  const [payload, setPayload] = useState({
    FromCentre: "",
    DATE: new Date(),
    ToDate: new Date(),
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    rFromTime: "00:00:00",
    ToTime: "23:59:59",
    Status: "1",
    ToCentre: "",
    EqualCentre: 1,
    FieldBoyID: "",
    FieldBoyName: "",
    ChkForce: 0,
    TestName: "",
    BarcodeNo: "",
  });
  const [savePayload, setSavePayload] = useState({
    Remarks: "",
    DispatchRecievedBy: "",
  });

  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearchSelectChange = (label, value) => {
    if (label === "FromCentre") {
      setPayload({ ...payload, [label]: String(value?.value) });
      getToAccessCenter(String(value?.value));
    } else {
      setPayload({ ...payload, [label]: String(value?.value) });
    }
  };
  const handleSelection = (event) => {
    const { name, value, selectedIndex } = event?.target;
    const label = event?.target?.children[selectedIndex].text;
    if (name === "FieldBoyID") {
      setPayload({
        ...payload,
        [name]: value,
        FieldBoyName: label,
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const validationFields = () => {
    let errors = "";
    if (payload?.ToCentre === "") {
      errors = { ...errors, ToCenter: "Please Select Centre" };
    }
    if (payload?.FieldBoyID === "") {
      errors = {
        ...errors,
        FieldBoyID: "Please Select Collection Boy",
      };
    }
    if (DefaultCurrencyName === "KES" && !savePayload?.Remarks?.trim()) {
      errors = { ...errors, Remarks: "Please Enter Remark" };
    }
    if (DefaultCurrencyName === "KES" && !savePayload?.DispatchRecievedBy?.trim()) {
      errors = { ...errors, DispatchRecievedBy: "Please Enter Dispatch Recieved By" };
    }
    return errors;
  };
  const handleTime = (time, name) => {
    setPayload({ ...payload, [name]: time });
  };

  const handleSave = () => {
    const generatedError = validationFields();
    if (generatedError === "") {
      setErrors({});
      let data = tableData?.filter((ele) => ele?.isSelected === true);
      if (data.length > 0) {
        setLoad({ ...load, saveLoad: true });

        const newdata = data.map((ele) => {
          return {
            ...ele,
            TestID: String(ele?.TestID),
            BarcodeNo: ele?.BarcodeNo,
            VisitID: ele?.LedgerTransactionNo,
            PatientCode: ele?.PatientCode,
            ItemName: ele?.TestName,
            FromCentre: payload?.FromCentre,
            ToCentre: payload?.ToCentre,
            FieldBoyID: payload?.FieldBoyID,
            FieldBoyName: payload?.FieldBoyName,
            Remarks: DefaultCurrencyName === "KES" ? savePayload?.Remarks : "",
            DispatchRecievedBy:
              DefaultCurrencyName === "KES" ? savePayload?.DispatchRecievedBy : "",
          };
        });
        axiosInstance
          .post("SendSampleToLab/SendSampleToLab", newdata)
          .then((res) => {
            toast.success(res?.data?.message);
            setTableData([]);
            setLoad({ ...load, saveLoad: false });
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured",
            );
            setLoad({ ...load, saveLoad: false });
          });
      } else {
        toast.error("Please Choose One Value");
      }
    } else {
      setErrors(generatedError);
    }
  };

  const handleSelectValue = () => {
    let match = false;
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i]["isSelected"]) {
        match = true;
        break;
      }
    }
    return match;
  };
  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const getToAccessCenter = (value) => {
    axiosInstance
      .post("SendSampleToLab/TransferCentreList", {
        BookingCentreID: value ?? "",
      })
      .then((res) => {
        let data = res?.data?.message;
        data = [...data]?.filter((ele) => ele?.CentreID != payload?.FromCentre);
        const val = data.map((ele) => {
          return {
            value: ele?.CentreID,
            label: ele?.Centre,
          };
        });
        setToCenter(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearch = (page = '', size = pageSize) => {
    const generatedError = validation();
    if (generatedError === "") {
      setLoad({ ...load, searchLoad: true });
      axiosInstance
        .post("SendSampleToLab/SearchDataToSendSample", {
          ...payload,
          DATE: moment(payload?.DATE).format("YYYY-MM-DD"),
          ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
          TestCentre: payload?.ToCentre,
          FromTime: payload.FromTime,
          ToTime: payload.ToTime,
          pageNumber: Number(page),
          pageSize: Number(size),
        })
        .then((res) => {
          const data = res.data.message;
          if (data.length > 0) {
            const val = data.map((ele) => {
              return {
                ...ele,
                isSelected: false,
              };
            });
            setTableData(val);
            setTotalCount(res?.data?.data?.totalRecords || 0)
          } else {
            setTableData([]);
            setTotalCount(0)
            toast.error("No Data Found");
          }
          setLoad({ ...load, searchLoad: false });
          setErrors({});
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad({ ...load, searchLoad: false });
        });
    } else {
      toast.error(generatedError);
    }
  };

  const validation = () => {
    let error = "";
    if (!payload?.FromCentre) {
      error = "Please Select FromCentre.";
    } else if (!payload?.ToCentre) {
      error = "Please Select ToCentre.";
    }
    return error;
  };

  const handleBarcodeReceive = (e) => {
    const keypress = [9, 13];
    if (keypress.includes(e.which)) {
      handleSearch(1, pageSize);
    }
  };

  const handleBarcodeNo = (e) => {
    const { name, value } = e.target;
    setPayload(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePayloadChange = (e) => {
    const { name, value } = e.target;
    setSavePayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelected = (e, index) => {
    const { name, checked } = e.target;
    const data = [...tableData];
    data[index][name] = checked;
    setTableData(data);
  };

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    const updatedData = tableData?.map((item) => {
      if (item?.issend === 1 && item?.dispatchcode === "") {
        return { ...item, isSelected: checked };
      }
      return item;
    });
    setTableData(updatedData);
  };

  useEffect(() => {
    getAccessCentres(setCenter);

    getCollectionBoy(setCollectionBoy);
    getToAccessCenter();
  }, []);
  return (
    <>
      <Accordion
        name={t("Send Sample To Lab")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row  px-2 mt-2">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={Center}
              name="FromCentre"
              lable={t("FromCentre")}
              id="FromCentre"
              removeIsClearable={true}
              placeholderName={t("FromCentre")}
              value={payload?.FromCentre}
              onChange={handleSearchSelectChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={ToCenter}
              name="ToCentre"
              lable={t("ToCentre")}
              id="ToCentre"
              removeIsClearable={true}
              placeholderName={t("ToCentre")}
              value={payload?.ToCentre}
              onChange={handleSearchSelectChange}
              className="required-fields"
            />
            {errors?.ToCenter && (
              <span className="error-message">{errors?.ToCenter}</span>
            )}
          </div>
          <div className="col-sm-2 ">
            <DatePicker
              className="custom-calendar"
              name="DATE"
              value={payload?.DATE}
              onChange={dateSelect}
              placeholder=" "
              id="DATE"
              lable="FromDate"
              maxDate={new Date(payload?.ToDate)}
            />
            {errors?.FromDate && (
              <span className="error-message">{errors?.FromDate}</span>
            )}
          </div>
          <div className="col-md-1">
            <CustomTimePicker
              name="FromTime"
              placeholder="FromTime"
              value={payload?.FromTime}
              id="FromTime"
              lable="FromTime"
              onChange={handleTime}
            />
          </div>
          <div className="col-sm-2 ">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              placeholder=" "
              id="ToDate"
              lable="ToDate"
              maxDate={new Date()}
              minDate={new Date(payload?.Date)}
            />

            {errors?.ToDate && (
              <span className="error-message">{errors?.ToDate}</span>
            )}
          </div>
          <div className="col-md-1">
            <CustomTimePicker
              name="ToTime"
              placeholder="ToTime"
              value={payload?.ToTime}
              id="ToTime"
              lable="ToTime"
              onChange={handleTime}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={Status}
              name="Status"
              lable="Status"
              id="Status"
              onChange={handleSelection}
              selectedValue={payload?.Status}
            />
          </div>
          <div className="col-sm-2">
            <Input
              lable="BarcodeNo"
              id="BarcodeNo"
              name="BarcodeNo"
              placeholder=""
              onKeyDown={handleBarcodeReceive}
              value={payload.BarcodeNo}
              onChange={handleBarcodeNo}
            />
          </div>
          <div className="col-sm-2">
            <input
              name="ChkForce"
              type="checkbox"
              checked={payload?.ChkForce}
              onChange={handleChange}
            />
            <label className="ml-2" htmlFor="ApplicableForAll">
              {t("Forcely Transfer")}
            </label>
          </div>
          <div className="col-sm-1 mb-2" style={{ alignSelf: "flex-end" }}>
            {load?.searchLoad ? (
              <Loading />
            ) : (
              <SearchButton
                text={"Search"}
                onClick={() => handleSearch(1, pageSize)}
              />
            )}
          </div>
        </div>
        {/* <div className="row px-2 mb-1">
          
        </div> */}
      </Accordion>

      <Accordion title={t("Search Data")} defaultValue={true}>
        {tableData?.length > 0 ? (
          <div className="row px-1">
            <div className="col-12">
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    {/* <th>{t("Select")}</th> */}
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          tableData?.filter(item => item.issend === 1 && item.dispatchcode === "")
                            ?.every(item => item.isSelected)
                        }
                        onChange={(e) => handleSelectAll(e)}
                      />
                    </th>
                    <th>{t("DispatchCode")}</th>
                    <th>{t("Barcode No.")}</th>
                    <th>{t("VisitNo")}</th>
                    <th>{t("Sample Date")}</th>
                    <th>{t("Name")}</th>
                    <th>{t("Registration Date")}</th>
                    <th>{t("Age")}</th>
                    <th>{t("Test")}</th>
                  </tr>
                </thead>
                {tableData?.map((data, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: data?.dispatchcode !== "" && "#9795c6",
                    }}
                  >
                    <td data-title={t("S.No")}>{index + 1 + IndexHandle(currentPage, pageSize)}&nbsp;</td>
                    <td data-title={t("Select")}>
                      {/* {data?.issend == 1 && data?.dispatchcode === "" && ( */}
                        <input
                          type="checkbox"
                          checked={data?.isSelected}
                          name="isSelected"
                          className="ml-2"
                          onChange={(e) => handleSelected(e, index)}
                        />
                      {/* )} */}
                      &nbsp;
                    </td>
                    <td data-title={t("DispatchCode")}>
                      {data?.dispatchcode ? data?.dispatchcode : "-"}&nbsp;
                    </td>
                    <td data-title={t("Barcode No.")}>
                      {data?.BarcodeNo}&nbsp;
                    </td>
                    <td data-title={t("VisitNo")}>
                      {data?.LedgerTransactionNo}&nbsp;
                    </td>
                    <td data-title={t("Sample Date")}>
                      {/* {data?.SampleDate}&nbsp; */}
                      <p className="mt-1 mb-0">{data?.SampleDate?.split(' ')?.[0]}</p>
                      <p className="mb-0">{data?.SampleDate?.split(' ')?.slice(1)}</p>
                    </td>
                    <td data-title={t("Name")}>{data?.PName}&nbsp;</td>
                    <td data-title={t("Registration Date")}>
                      {data?.RegDate}&nbsp;
                    </td>
                    <td data-title={t("Age")} style={{ whiteSpace: "nowrap" }}>
                      {data?.Pinfo ? getAccurateAge(data?.Pinfo?.split("/")?.[0]) + '/' + data?.Pinfo?.split("/")?.[1] : "-"}&nbsp;
                    </td>
                    <td data-title={t("Test")}>{data?.TestName}&nbsp;</td>
                  </tr>
                ))}
              </Tables>

              {["1", "2"]?.includes(payload?.Status) && handleSelectValue() && (
                <>
                  <div className="row mt-2">
                    <label className="col-sm-1" style={{ textAlign: "end" }}>
                      Field Boy :
                    </label>
                    <div className="col-sm-2">
                      <SelectBox
                        options={[
                          { label: "Select", value: "" },
                          ...CollectionBoy,
                        ]}
                        name="FieldBoyID"
                        selectedValue={payload?.FieldBoyID}
                        onChange={handleSelection}
                      />
                      {errors?.FieldBoyID && (
                        <span className="error-message">
                          {errors?.FieldBoyID}
                        </span>
                      )}
                    </div>
                    {DefaultCurrencyName === "KES" && (
                      <>
                        <div className="col-sm-2">
                          <Input
                            type="text"
                            lable={t("Remark")}
                            id="Remarks"
                            name="Remarks"
                            value={savePayload?.Remarks}
                            onChange={handleSavePayloadChange}
                            maxLength={100}
                            className="required-fields"
                          />
                          {errors?.Remarks && (
                            <span className="error-message">
                              {errors?.Remarks}
                            </span>
                          )}
                        </div>
                        <div className="col-sm-2">
                          <Input
                            type="text"
                            lable={t("Dispatch Recieved By")}
                            id="DispatchRecievedBy"
                            name="DispatchRecievedBy"
                            value={savePayload?.DispatchRecievedBy}
                            onChange={handleSavePayloadChange}
                            maxLength={50}
                            className="required-fields"
                          />
                          {errors?.DispatchRecievedBy && (
                            <span className="error-message">
                              {errors?.DispatchRecievedBy}
                            </span>
                          )}
                        </div>
                      </>
                    )}

                    <div className="col-sm-1 mb-2">
                      {load?.saveLoad ? (
                        <Loading />
                      ) : (
                        <SaveButton
                          text={"Save"}
                          onClick={handleSave}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>{" "}
          </div>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
      <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 w-full">
        {totalCount > 25 && (
          <>
            <div style={{ minWidth: '150px' }}>
              <ReactSelect
                value={pageSize}
                dynamicOptions={[
                  { label: '25', value: 25 },
                  { label: '50', value: 50 },
                  { label: '100', value: 100 },
                  { label: '150', value: 150 },
                ]}
                name={'pageSize'}
                label={t("pageSize")}
                removeIsClearable={true}
                onChange={(name, value) => {
                  setPageSize(value?.value);
                  setCurrentPage(1);
                  handleSearch(1, value?.value);
                }}
              />
            </div>

            {totalCount > pageSize && (
              <Pagination
                className="pagination-bar"
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  handleSearch(page, pageSize);
                }}
              />
            )}
          </>
        )}

      </div>
    </>
  );
};

export default SendSampleToLab;
