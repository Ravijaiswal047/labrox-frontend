import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import { ViewMenu } from "../../../../components/SvgIcons";
import ILCFrameMenu from "../ILCFrameMenu";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../../components/Table/CustomTable";
import { CustomButton, SaveButton } from "../../../../components/UI/CustomButton";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { formatStandardDate,validateRequiredFields } from "../../../../utils/helpers";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { toast } from "react-toastify";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../../../components/Filter/FilterInput";

const ILCLabMaster = () => {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [errors, setErrors] = useState({});
  const initialState = {
    LabName: "",
    LabAddress: "",
    ContactNo: "",
    ContactPersonName: "",
    MOURenewDate: new Date(),
    IsActive: "1",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const [masterTable, setMasterTable] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const colorCodingData = [
    { color: "#ffe58f", id: "7", labelKey: "Deactive" },
    { color: "#75f975", id: "8", labelKey: "Active" },
  ];

  const columns = [
    { header: "#", field: "srNo", width: "3%" },
    { header: "ILC Lab Name", field: "ilcLabName" },
    { header: "ILC Lab Address", field: "ilcLabAddress" },
    { header: "Contact No", field: "contactNo" },
    { header: "Contact Person Name", field: "contactPersonName" },
    { header: "MOU Renew Date", field: "mouRenewDate" },
    { header: "MOU Document", field: "mouDocument" },
    { header: "Entry Date", field: "entryDate" },
    { header: "Entry By", field: "entryBy" },
    { header: "Update Date", field: "updateDate" },
    { header: "Update By", field: "updateBy" },
    { header: "Edit", field: "edits" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "ContactNo") {
      if (!/^\d*$/.test(value)) return;
    }
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const onEdit = (item) => {
    setPayload({
      LabName: item?.ilcLabName || "",
      LabAddress: item?.ilcLabAddress || "",
      ContactNo: item?.contactNo || "",
      ContactPersonName: item?.contactPersonName || "",
      MOURenewDate: new Date(item?.mouRenewDate),
      IsActive: item?.status === "Active" ? "1" : "0",
      LabId: item?.labId || 0,
    });
    setIsUpdate(true);
  };

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleReset = () => {
    setPayload(initialState);
    setErrors({});
    setIsUpdate(false);
    setSearchTerm("");
  }

  const getLabData = async () => {
    axiosInstance
      .get(apiUrls?.ILCBindData)
      .then((res) => {
        console.log("Res",res);
        if (res?.data?.succss) {
          const mappedData = res?.data?.message?.map((item) => ({
            labId: item?.LabID || "",
            ilcLabName: item?.ILCLabName || "",
            ilcLabAddress: item?.ILCLabAddress || "",
            contactNo: item?.ContactNo || "",
            contactPersonName: item?.ContactPersonname || "",
            mouRenewDate: item?.MOURenewDate || "",
            mouDocument: item?.MOUDocument || "",
            status: item?.IsActive || "",
            entryDate: item?.dtEntry || "",
            entryBy: item?.EntryByName || "",
            updateDate: item?.UpdateDate || "",
            updateBy: item?.UpdateByName || "",
          }));
          setTableData(mappedData);
          setMasterTable(mappedData);
        }
        else {
          toast.error(
            res?.data?.message
              ? res?.data?.message
              : "Error Occured",
          );
        }
      })
      .catch((err) => {
        console.log("get err", err);
        toast.error(
          err?.data?.message
            ? err?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });

  }

  const handleSubmit = async (isUpdate = false) => {
  const requiredFields = [
    "LabName",
    "LabAddress",
    "ContactNo",
    "ContactPersonName",
  ];

  const errors = validateRequiredFields(payload, requiredFields);
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }

  const apiPayload = {
    labName: payload?.LabName ?? "",
    labAddress: payload?.LabAddress ?? "",
    contactNo: payload?.ContactNo ?? "",
    contactPersonName: payload?.ContactPersonName ?? "",
    renewDate: payload?.MOURenewDate
      ? formatStandardDate(payload.MOURenewDate, "YYYY-MM-DD")
      : "",
    isActive: payload?.IsActive?.toString() ?? (isUpdate ? "0" : "1"),
    mouDocument: "",
    ...(isUpdate && { labId: payload?.LabId?.toString() ?? "" }),
  };

  const apiUrl = isUpdate
    ? apiUrls?.ILCUpdateData
    : apiUrls?.ILCSaveData;

  try {
    const res = await axiosInstance.post(apiUrl, apiPayload);

    if (res?.data?.success) {
      toast.success(res?.data?.message || "Saved Successfully");
      getLabData();
      handleReset();
    } else {
      toast.error(res?.data?.message || "Error Occured");
    }
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Error Occured"
    );
  }
};

  const handleChangeSearch = (e) => {
    const value = e?.target?.value?.toLowerCase();
    setSearchTerm(e?.target?.value);

    if (!value) {
      setTableData(masterTable);
      return;
    }

    const searchableKeys = [
      "ilcLabName",
      "ilcLabAddress",
      "contactNo",
      "contactPersonName",
      "mouRenewDate",
      "RCNo",
      "InsuranceNo",
    ];

    const filtered = masterTable?.filter((row) =>
      searchableKeys?.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableData(filtered);
  };

  console.log("TableData",tableData);


  useEffect(() => {
    getLabData();
  }, []);

  return (
    <>
      {showMore && <ILCFrameMenu />}
      <div className="card">
        <Heading
          name={"ILC Lab Master"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <div className="row px-2 pt-2">
          <div className="col-xl-2 col-sm-4 col-md-3 co-12">
            <Input
              type="text"
              placeholder=" "
              lable={t("ILC Lab Name")}
              id="LabName"
              name="LabName"
              value={payload?.LabName}
              onChange={handleChange}
            // className={"required-fields"}
            />
            {payload?.LabName === "" && (
              <span className="error-message">{errors?.LabName}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-3 co-12">
            <Input
              type="text"
              placeholder=" "
              lable={t("ILC Lab Address")}
              id="LabAddress"
              name="LabAddress"
              value={payload?.LabAddress}
              onChange={handleChange}
            // className={"required-fields"}
            />
            {payload?.LabAddress === "" && (
              <span className="error-message">{errors?.LabAddress}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-3 co-12">
            <Input
              type="text"
              placeholder=" "
              lable={t("Contact No")}
              id="ContactNo"
              name="ContactNo"
              value={payload?.ContactNo}
              onChange={handleChange}
              maxLength={10}
            />
            {payload?.ContactNo === "" && (
              <span className="error-message">{errors?.ContactNo}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-3 co-12">
            <Input
              type="text"
              placeholder=" "
              lable={t("Contact Person Name")}
              id="ContactPersonName"
              name="ContactPersonName"
              value={payload?.ContactPersonName}
              onChange={handleChange}
            // className={"required-fields"}
            />
            {payload?.ContactPersonName === "" && (
              <span className="error-message">{errors?.ContactPersonName}</span>
            )}
          </div>


          <DatePicker
            name="MOURenewDate"
            id="MOURenewDate"
            value={payload?.MOURenewDate}
            onChange={dateSelect}
            minDate={new Date()}
            placeholder=""
            lable={t("MOU Renew Date")}
            className="custom-calendar"
          />

          <div
            className="col-auto d-flex align-items-center px-2 "
            style={{ gap: "5px" }}
          >
            <label className="switch mb-1">
              <input
                name="IsActive"
                type="checkbox"
                checked={payload?.IsActive === "1"}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
            <strong className="mb-1">{t("IsActive")}</strong>
          </div>
          {isUpdate ? <SaveButton
            className="rounded py-0" onClick={() => handleSubmit(true)}
            text="Update"
          /> :
            <SaveButton
              className="rounded py-0" onClick={() => handleSubmit(false)}
              text="Save"
            />
          }
          <CustomButton
            icon="refresh"
            text="Reset"
            onClick={handleReset}
            className="mx-2"
          />
        </div>
      </div>
      <div className="card mt-2">
        <Heading title={"Search Details"} defaultValue={"true"}
          secondTitle={
            <>
              {/* <div className="col-sm-12 d-flex justify-content-end gap-custom p-0"> */}
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  // onClick={() => handleStatusFilter(id)}
                  cursor="pointer"
                />
              ))}
              <FilterInput
                value={searchTerm}
                onChange={handleChangeSearch}
                placeholder="Filter Table"
                inputClass="transparent-background"
              />
              {/* </div> */}
            </>}
        />

        <CustomTable
          columns={columns}
          data={tableData?.map((item, index) => ({
            srNo: index + 1,
            ...item,
            rowColor:
              (item?.status === "Active")
                ? "#75f975"   // active → light green
                : "#ffe58f",
            edits: (
              <i
                onClick={() => onEdit(item)}
                aria-hidden="true"
                className="fa fa-edit"
                style={{ cursor: "pointer", color: "#21218b" }}
              />
            ),
          }))}
        />
      </div>
    </>
  );
};

export default ILCLabMaster;
