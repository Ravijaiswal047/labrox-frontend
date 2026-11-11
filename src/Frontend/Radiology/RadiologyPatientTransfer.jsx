import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";
import { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import {
  CustomButton,
  SaveButton,
  SearchButton,
} from "../../components/UI/CustomButton";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { axiosInstance } from "../../utils/axiosInstance";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import { SearchBy } from "../../utils/Constants";
import { shouldIncludeAIIMSID } from "../../utils/helpers";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { toast } from "react-toastify";
import moment from "moment";
import CustomModal from "../utils/CustomModal";

const RadiologyPatientTransfer = () => {
  const [formData, setFormData] = useState({
    SelectTypes: "",
    ItemValue: "",
    StatusID: "1",
    FromDate: new Date(),
    ToDate: new Date(),
    CentreId: "",
    RateTypeID: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [centreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [openLogModal, setOpenLogModal] = useState(false);
  const [visitNo, setVisitNo] = useState("");
  const [t] = useTranslation();

  const STATUS_BUTTON = [
    {
      label: "Yes",
      color: "#669bbc",
      type: "yes",
    },
    {
      label: "No",
      color: "white",
      type: "no",
    },
  ];

  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      const data = res.data.message;
      const CentreDataValue = data.map((ele) => {
        return {
          value: ele.CentreID,
          label: ele.Centre,
        };
      });
      let allValues = CentreDataValue.map((ele) => ele.value);
      setCentreData(CentreDataValue);
      fetchRateTypes(allValues);
    } catch (error) {
      console.log("Error while fetching centres");
    }
  };

  const fetchRateTypes = async (ids) => {
    try {
      const res = await axiosInstance.post("/Centre/GetRateType", {
        CentreId: ids,
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAccessCentres();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value?.value });
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      //   TableData("1");
      console.log("Clicked hello");
    }
  };

  const handleTableSelectChange = (name, value, rowData) => {
    console.log(name, value, rowData);

    const uniqueId = rowData.TestID;

    setTableData((prevData) => {
      const rowIndexToUpdate = prevData.findIndex(
        (item) => item.TestID === uniqueId
      );
      if (rowIndexToUpdate === -1) {
        console.error("Could not find row with TestIDHash:", uniqueId);
        return prevData;
      }
      const newData = [...prevData];
      newData[rowIndexToUpdate] = {
        ...newData[rowIndexToUpdate],
        [name]: value?.value,
      };

      console.log("New Data", newData);
      return newData;
    });
  };

  console.log("Table data hello", tableData);

  const handleCheckboxChange = (index, isChecked) => {
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        IsSelected: isChecked,
      };
      return newData;
    });
  };

  const handleSearch = async () => {
    try {
      const requestBody = {
        businessUnitIds: formData.CentreId ? [String(formData?.CentreId)] : [],
        rateTypeIDs: formData.RateTypeID ? [String(formData.RateTypeID)] : [],
        fromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
        toDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
        // statusID: useFilterStatus ? Number(formData.StatusID) : 0,
        selectTypes: formData.SelectTypes,
        itemValue: formData.ItemValue,
      };

      console.log("Payload search data hello", requestBody);

      const res = await axiosInstance.post(
        "Radiology/GetPatientTransfer",
        requestBody
      );

      if (res?.data?.success) {
        setTableData(res?.data?.message || []);
        setLoading(false);
      } else {
        setTableData([]);
        toast.warn(res?.data?.message || "No records found.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Estimate Error:", err);
      toast.warn("No records found");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const selectedRows = tableData.filter((item) => item.IsSelected);

    if (selectedRows.length === 0) {
      toast.warn("No tests selected for assignment.");
      return;
    }

    const finalTestIDs = selectedRows.map((item) => String(item.TestID));
    const finalTestIDsHash = selectedRows.map((item) => String(item.TestIDHash))

    const finalCentreIDs = selectedRows.map((item) => {
      if (!item.CentreID) {
        console.error(`Centre not selected for TestID: ${item.TestIDHash}`);
      }
      return String(item.CentreID);
    });

    const payloadToSend = {
      testID: finalTestIDs,
      testIDHash: finalTestIDsHash,
      TestCentreId: finalCentreIDs,
    };

    try {
      const res = await axiosInstance.post("Radiology/PatientTransfer", payloadToSend);
      const data = res?.data;

      if(data?.success) {
        toast.success("Transfered successfully.")
      }
    } catch (error) {
      console.log("Error while transfering!")
    }
  };

  return (
    <>
      <Accordion
        name={t("Radiology Patient Transfer")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 p-2">
          <div className="col-12">
            <div className="form-row align-items-center">
              <div
                className="col-12 col-sm-2 d-flex"
                style={{ display: "flex" }}
              >
                <div style={{ width: "50%" }}>
                  <SelectBox
                    options={[
                      ...SearchBy,
                      ...(shouldIncludeAIIMSID()
                        ? [{ label: "AIIMSID", value: "AIIMSID" }]
                        : []),
                    ]}
                    selectedValue={formData?.SelectTypes}
                    name="SelectTypes"
                    id="SelectTypes"
                    lable="SelectTypes"
                    onChange={handleChange}
                  />
                </div>
                <div style={{ width: "50%" }}>
                  {formData?.SelectTypes === "Mobile" ? (
                    <div style={{ width: "100%" }}>
                      <Input
                        className="select-input-box form-control input-sm"
                        type="number"
                        name="ItemValue"
                        max={10}
                        onKeyDown={handleKeyDown}
                        value={formData?.ItemValue}
                        onChange={handleChange}
                        onInput={(e) => number(e, 10)}
                      />
                      {errors?.ItemValue && (
                        <div className="error-message">{errors?.ItemValue}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: "100%" }}>
                      <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="ItemValue"
                        max={20}
                        onKeyDown={handleKeyDown}
                        value={formData?.ItemValue}
                        onChange={handleChange}
                      />
                      {errors?.ItemValue && (
                        <div className="error-message">{errors?.ItemValue}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-sm-2">
                <ReactSelect
                  dynamicOptions={centreData}
                  name="CentreId"
                  lable={t("Centre")}
                  id="CentreId"
                  removeIsClearable={true}
                  placeholderName={t("Centre")}
                  value={formData?.CentreId}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-sm-2">
                <ReactSelect
                  dynamicOptions={RateTypes}
                  name="RateTypeID"
                  lable={t("RateType")}
                  id="RateTypeID"
                  removeIsClearable={true}
                  placeholderName={t("RateType")}
                  value={formData?.RateTypeID}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-12 col-sm-2 mt-2">
                <DatePicker
                  className="custom-calendar"
                  name="FromDate"
                  value={formData?.FromDate}
                  placeholder=" "
                  id="FromDate"
                  lable="FromDate"
                  onChange={dateSelect}
                  maxDate={new Date(formData.ToDate)}
                />
              </div>
              <div className="col-12 col-sm-2 mt-2">
                <DatePicker
                  className="custom-calendar"
                  name="ToDate"
                  value={formData?.ToDate}
                  placeholder=" "
                  id="ToDate"
                  lable="ToDate"
                  onChange={dateSelect}
                  maxDate={new Date()}
                  minDate={new Date(formData.FromDate)}
                />
              </div>

              {/* Search button */}
              <div className="col-auto">
                {loading ? (
                  <Loading />
                ) : (
                  <SearchButton text={"Search"} onClick={handleSearch} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Patient Details")} defaultValue={true}>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            {loading ? (
              <Loading />
            ) : tableData.length > 0 ? (
              <>
                <Tables
                  style={{
                    maxHeight: "380px",
                    overflowY: "auto",
                  }}
                >
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Visit No.")}</th>
                      <th>{t("Patient Name")}</th>
                      <th>{t("Investigation")}</th>
                      <th>{t("Booking Centre")}</th>
                      <th>{t("Processing Centre")}</th>
                      <th>{t("Centre")}</th>
                      <th>{t("Select")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((data, index) => (
                      <tr key={data.sno}>
                        <td data-title={"S No."}>
                          <span className="mr-3">{index + 1}</span>
                          <span
                            onClick={() => {
                              setOpenLogModal(true);
                              setVisitNo(data?.VisitNo);
                            }}
                          >
                            <i className="fa fa-search" />
                          </span>
                        </td>
                        <td data-title={"Visit No."}>{data?.VisitNo}</td>
                        <td data-title={"Pname | Age | Gender"}>
                          <span>{data?.PName}</span> <br />
                          <span>{data?.Age}</span> <br />
                          <span>{data?.Gender}</span> <br />
                        </td>
                        <td data-title={"Investigation"}>{data?.ItemName}</td>
                        <td data-title={"Booking Centre"}>
                          {data?.BookingCentre}
                        </td>
                        <td data-title={"Processing Centre"}>
                          {data?.ProcessingCentre}
                        </td>
                        <td data-title={"Centre"}>
                          <ReactSelect
                            dynamicOptions={centreData}
                            name="CentreID"
                            lable={t("Centre")}
                            id={`Centre-${index}`}
                            removeIsClearable={true}
                            placeholderName={t("Centre")}
                            value={data?.CentreID}
                            onChange={(name, value) =>
                              handleTableSelectChange(name, value, data)
                            }
                          />
                        </td>
                        <td data-title={t("Select")} className="px-2">
                          <input
                            id={`select-${index}`}
                            type="checkbox"
                            name="IsSelected"
                            className="me-2 mr-2"
                            checked={data.IsSelected || false}
                            onChange={(e) =>
                              handleCheckboxChange(index, e.target.checked)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
                <div className="mt-3 d-flex" style={{ gap: "4px" }}>
                  <SaveButton text={"Save"} onClick={handleSave} />
                </div>
              </>
            ) : (
              <NoRecordFound />
            )}
          </div>
        </div>
      </Accordion>

      {openLogModal && (
        <CustomModal
          show={openLogModal}
          onHide={() => {
            setOpenLogModal(false)
            setVisitNo("")
          }}
          visitID={visitNo}
        />
      )}
    </>
  );
};

export default RadiologyPatientTransfer;
