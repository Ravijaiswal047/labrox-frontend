import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { number } from "../../utils/helpers";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import Form from 'react-bootstrap/Form'
import FormControl from "react-bootstrap/FormControl";
import { FaEdit } from "react-icons/fa";
import FilterInput from "../../components/Filter/FilterInput";
import Heading from "../../components/UI/Heading";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import CustomTable from "../../components/Table/CustomTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import FullTextEditor from "../../components/formComponent/TextEditor";

const MembershipCardMaster = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState({ save: false, table: false });
  const [isUpdate, setIsUpdate] = useState(false);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isRenewalEnabled, setIsRenewalEnabled] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const [openHeaderModal, setOpenHeaderModal] = useState(false);
  const [editTable, setEditTable] = useState(false);
  const [editorValue, setEditorValue] = useState("");

  const [DateData, setDateData] = useState({
    AgeYear: "",
    AgeDays: "",
    AgeMonth: "", 
  });
  const [payload, setPayload] = useState({
    CardName: "",
    Description: "",
    NoOfDependant: "",
    Amount: "",
    ValidYear: "",
    ValidMonth: "",
    ValidDays: "",
    logobase64: "",
    ValidUpto: new Date(),
    IsActive: true,
    CardGeneration: "",
    BarcodeLength: "",
    DynamicHtml: ""
  });
  const [filterInputValue, setFilterInputValue] = useState("");

  const handleFilterInputChange = (e) => {
    setFilterInputValue(e.target.value);
  };

  
  const filteredData = (Array.isArray(tableData) ? tableData : [])?.filter((ele) => {
    const search = filterInputValue.toLowerCase();

    const matchesSearch =
      ele?.CardName?.toLowerCase().includes(search) ||
      ele?.Description?.toLowerCase().includes(search) ||
      ele?.No_of_dependant?.toString().includes(search) ||
      ele?.Amount?.toString().includes(search) ||
      ele?.Validity?.toLowerCase().includes(search) ||
      ele?.ValidUpTo?.toLowerCase().includes(search) ||
      ele?.Active?.toString().toLowerCase().includes(search) ||
      ele?.CreatedByInfo?.toLowerCase().includes(search) ||
      ele?.UpdatedByInfo?.toLowerCase().includes(search) ||
      ele?.AllowManualRenewalText?.toLowerCase().includes(search) ||
      ele?.RenewalAmount?.toString().includes(search);  

    const matchesStatus = selectedStatus
      ? ele?.Active?.toString().toLowerCase() === selectedStatus.toLowerCase()
      : true;

    return matchesSearch && matchesStatus;
  });

  const getRowColor = (status) => {
    if (status === "Active") return "#c4f884";
    if (status === "De-Active") return "#ffc4cc";
    return "#ffffff";
  };

  const tableDataFormatted = filteredData?.map((ele, index) => ({
    ...ele,
    SrNo: index + 1,
    CreatedByInfo: ele?.CreatedDate,
    UpdatedByInfo: ele?.Updatedate,
    // AllowManualRenewalText: ele?.Active === "Active"? "Allow" : ele?.Active === "De-Active" ? "Not-Allow" : "",
    AllowManualRenewalText:
      ele?.AllowManualRenewal === 1
        ? "Allow"
        : ele?.AllowManualRenewal === 0
          ? "Not Allow"
          : "",
    // StatusText: ele?.IsActive === 1 ? "Active" : "De-Active",
    Actions: (
      <FaEdit
        className="text-primary"
        style={{ cursor: "pointer", textDecoration: "underline" }}
        onClick={() => getItemTable(ele)}
      />
    ),
    rowColor: getRowColor(ele?.IsActive === 1 ? "Active" : "De-Active"),
  }));


  
  const colorCodingData = [
    { id: 1, color: "#c4f884", labelKey: "Active" },
    { id: 2, color: "#ffc4cc", labelKey: "In-Active" },
  ];


const statusCounts = {
  "Active": (Array.isArray(tableData) ? tableData : [])?.filter((item) => item.IsActive === 1)?.length || 0,
  "De-Active": (Array.isArray(tableData) ? tableData : [])?.filter((item) => item.IsActive === 0)?.length || 0,
};


const colorCodingDataWithCount = colorCodingData.map((item) => ({
  ...item,
  count: statusCounts[item.labelKey] || 0,
}));




  const tableHeaders = [
    { field: "SrNo", header: t("S.No") },
    { field: "CardName", header: t("Card Name") },
    { field: "Description", header: t("Description") },
    { field: "No_of_dependant", header: t("No.of Dependant") },
    { field: "Amount", header: t("Card Amount") },
    { field: "Validity", header: t("Validity") },
    { field: "ValidUpTo", header: t("Valid UpTo") },
    { field: "CreatedByInfo", header: t("Created By/Date") },
    { field: "UpdatedByInfo", header: t("Updated By/Date") },
    { field: "AllowManualRenewalText", header: t("Renewal Allow") },
    { field: "RenewalAmount", header: t("Renewal Amount") },
    // { field: "StatusText", header: t("Status") },
    { field: "Actions", header: t("Select") },
  ];
  const handleChange = (e) => {
    const { name, value } = e?.target;
    if (name === "CardName") {
      setPayload({
        ...payload,
        [name]: value.trimStart(),
      });
    } else if (name === "Description") {
      setPayload({
        ...payload,
        [name]: value.trimStart(),
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };

    const handleReactSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value?.value
    }))
  }

  const NoOfDependantPerson = [
    {
      label: "Select",
      value: "",
    },
    {
      label: 0,
      value: 0,
    },
    {
      label: 1,
      value: 1,
    },
    {
      label: 2,
      value: 2,
    },
    {
      label: 3,
      value: 3,
    },
    {
      label: 4,
      value: 4,
    },
    {
      label: 5,
      value: 5,
    },
    {
      label: 6,
      value: 6,
    },
    {
      label: 7,
      value: 7,
    },
    {
      label: 8,
      value: 8,
    },
  ];

  const handleToggle = () => {
    const newValue = !isRenewalEnabled;
    setIsRenewalEnabled(newValue);

    if (!newValue) {
      setAmount("");
    }
  };


  const handleCalculate = (e) => {
    const { name, value } = e.target;
    let diff = {};
    if (name === "ValidYear") {
      diff = moment().add(value, "years");
      setDateData({
        ...DateData,
        AgeYear: diff?._d,
      });
    }

    if (name === "ValidMonth") {
      diff = moment(DateData?.AgeYear || new Date().now).add(value, "months");
      setDateData({
        ...DateData,
        AgeMonth: diff?._d,
      });
    }

    if (name === "ValidDays") {
      diff = moment(DateData?.AgeMonth || new Date().now).add(value, "days");
      setDateData({
        ...DateData,
        AgeDays: diff?._d,
      });
    }

    setPayload({
      ...payload,
      [name]: value,
      ValidUpto: diff?._d,
    });
  };

  const validationMembership = () => {
    let errors = "";
    if (payload?.CardName === "") {
      errors = { ...errors, CardName: "Please enter CardName." };
    }
    if (payload?.Amount?.length === 0) {
      errors = { ...errors, Amount: "Please enter CardAmount." };
    }
    if (payload?.NoOfDependant === "") {
      errors = {
        ...errors,
        NoOfDependant: "Please enter Total Dependant Person.",
      };
    }
    if (payload?.Description === "") {
      errors = { ...errors, Description: "Please enter Description." };
    }
    if (payload?.ValidYear === "") {
      errors = { ...errors, ValidYear: "Please enter Validity." };
    }
    return errors;
  };
  function areDatesEqualWithoutTime(date1, date2) {
    const datePart1 = new Date(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate()
    );
    const datePart2 = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate()
    );
    return datePart1.getTime() === datePart2.getTime();
  }

  const handleSave = async () => {
    setLoad({ ...load, save: true });
    const generatedError = validationMembership();
    if (generatedError === "") {
      setErrors({});

      if (areDatesEqualWithoutTime(new Date(payload?.ValidUpto), new Date())) {
        toast.error("Enter valid Validity");
        setLoad({ ...load, save: false });
      } else {
        await axiosInstance
          .post("MembershipCardMaster/SaveMembershiCardData", {
            CardName: payload?.CardName,
            Description: payload?.Description,
            NoOfDependant: payload?.NoOfDependant.toString(),
            Amount: payload?.Amount.toString(),
            IsActive: payload?.IsActive ? 1 : 0,
            ValidYear: payload?.ValidYear || 0,
            ValidMonth: payload?.ValidMonth || 0,
            ValidDays: payload?.ValidDays || 0,
            ValidUpTo: payload?.ValidUpto,
            Membershiplogo: payload?.logobase64,
            ID: "",
            Image: "",
            AllowManualRenewal: isRenewalEnabled ? 1 : 0,
            RenewalAmount: isRenewalEnabled ? amount : 0.00,
            CardGeneration: payload?.CardGeneration,
            BarcodeLength:
              payload?.CardGeneration === "System"
                ? Number(payload?.BarcodeLength)
                : Number(payload?.BarcodeLength),
            DynamicHtml: payload?.DynamicHtml,
          })
          .then((res) => {
            if(res.data?.success){
            toast.success(res?.data?.message);
            setPayload({
              CardName: "",
              Description: "",
              NoOfDependant: "",
              Amount: "",
              ValidYear: "",
              ValidMonth: "",
              ValidDays: "",
              ValidUpto: new Date(),
              Membershiplogo: "",
              IsActive: true,
              CardGeneration: "",
              BarcodeLength: "",
              DynamicHtml: ""
            });
            setAmount("");
            setIsRenewalEnabled(false);
            handletableData();
            setLoad({ ...load, save: false });
            } else {
            toast.error(res?.data?.message);
            setLoad({ ...load, save: false });
            }
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Something went wrong."
            );
            setLoad({ ...load, save: false });
          });
      }
    } else {
      setErrors(generatedError);
      setLoad({ ...load, save: false });
    }
  };

const handleUpdate = () => {
  setLoad({ ...load, save: true });
  const generatedError = validationMembership();
  if (generatedError === "") {
    setErrors({});
    if (areDatesEqualWithoutTime(new Date(payload?.ValidUpto), new Date())) {
      toast.error("Enter valid Validity");
      setLoad({ ...load, save: false });
    } else {
      axiosInstance
        .post("MembershipCardMaster/UpdateMembershiCardData", {
          CardName: payload?.CardName,
          Description: payload?.Description,
          NoOfDependant: payload?.NoOfDependant.toString(),
          Amount: payload?.Amount.toString(),
          IsActive: payload?.IsActive ? 1 : 0,
          ValidYear: payload?.ValidYear || 0,
          ValidMonth: payload?.ValidMonth || 0,
          ValidDays: payload?.ValidDays || 0,
          ValidUpTo: payload?.ValidUpto,
          Id: payload?.ID,
          Membershiplogo: payload?.logobase64,
          Image: "",
          AllowManualRenewal: isRenewalEnabled ? 1 : 0,
          RenewalAmount: isRenewalEnabled ? amount : 0.00,
          CardGeneration: payload?.CardGeneration,
          BarcodeLength:
            payload?.CardGeneration === "System"
              ? Number(payload?.BarcodeLength)
              : Number(payload?.BarcodeLength),
            DynamicHtml: payload?.DynamicHtml,
          })
        .then((res) => {
          if(res?.data?.success){          
          toast.success(res?.data?.message);
          setPayload({
            CardName: "",
            Description: "",
            NoOfDependant: "",
            Amount: "",
            ValidYear: "",
            ValidMonth: "",
            ValidDays: "",
            ValidUpto: new Date(),
            Membershiplogo: "",
            IsActive: true,
            CardGeneration: "",
            BarcodeLength: "",
            DynamicHtml: "",
          });
          setAmount("");
          setIsRenewalEnabled(false);
          handletableData();
          setIsUpdate(false);
          setLoad({ ...load, save: false });
          } else {
            toast.error(res.data?.success)
          setLoad({ ...load, save: false });
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong."
          );
          setLoad({ ...load, save: false });
        });
    }
  } else {
    setErrors(generatedError);
    setLoad({ ...load, save: false });
  }
};

 const getItemTable = (ele) => {
  setIsUpdate(true);
  setPayload({
    CardName: ele?.CardName,
    Description: ele?.Description,
    NoOfDependant: ele?.No_of_dependant?.toString(),
    Amount: ele?.Amount?.toString(),
    IsActive: ele?.IsActive === 1 ? true : false,
    ValidYear: ele?.ValidYear,
    ValidMonth: ele?.ValidMonth,
    ValidDays: ele?.ValidDays,
    ValidUpto: new Date(ele?.ValidUpTo),
    logobase64: ele?.MembershipLogo,
    ID: ele?.ID,
    CardGeneration: ele?.CardGeneration,
    BarcodeLength: ele?.BarcodeLength,
    DynamicHtml: ele?.DynamicHtml,
  });

  // Set renewal amount and renewal enabled status independently
  setAmount(ele?.RenewalAmount || "");
  setIsRenewalEnabled(ele?.AllowManualRenewal === 1 ? true : false);

  setErrors({});
};



  const UploadLogo = () => { };

  const handletableData = () => {
    setLoad({ ...load, table: true });
    axiosInstance
      .get("MembershipCardMaster/GetMembershiCardData")
      .then((res) => {
        setTableData(Array.isArray(res?.data?.message) ? res?.data?.message : []);
        setLoad({ ...load, table: false });
      })
      .catch((err) => {
        console.log(err);
        setLoad({ ...load, table: false });
      });
  };
  console.log(load);
  const handleSelectChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setPayload({ ...payload, [name]: type === "checkbox" ? checked : value });
  };

  const handleBlur = (type) => {
    const err = validationMembership(payload, type, errors);
    setErrors(err);
  };
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  const guidNumber = () => {
    const guidNumber =
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4();

    return guidNumber;
  };

  const handleCancel = () => {
    setIsUpdate(false);
    setPayload({
      CardName: "",
      Description: "",
      NoOfDependant: "",
      Amount: "",
      ValidYear: "",
      ValidMonth: "",
      ValidDays: "",
      ValidUpto: new Date(),
      IsActive: true,
      DynamicHtml: "",
    });
    setAmount("");
    setIsRenewalEnabled(false);
  };

  useEffect(() => {
    handletableData();
  }, []);
  console.log("payload",payload);
  return (
    <>
      {show && (
        <UploadFile
          show={show}
          pageName={"MembershipCardLogo"}
          documentId={payload?.logobase64}
          handleClose={() => setShow(false)}
        />
      )}
      <Accordion
        name={t("Membership Card Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              name="CardName"
              id="CardName"
              Activeceholder=""
              max={30}
              value={payload?.CardName}
              onChange={handleChange}
              lable="Card Name"
            />
            {errors?.CardName && (
              <div className="error-message">{errors?.CardName}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              name="Description"
              id="Description"
              Activeceholder=""
              max={50}
              value={payload?.Description}
              onChange={handleChange}
              lable="Description"
            />
            {errors?.Description && (
              <div className="error-message">{errors?.Description}</div>
            )}
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={NoOfDependantPerson}
              name="NoOfDependant"
              lable={t("No.of Dependant")}
              id="NoOfDependant"
              removeIsClearable={true}
              placeholderName={t("No.of Dependant")}
              value={payload.NoOfDependant}
              onChange={handleReactSelectChange}
            />
            {errors?.NoOfDependant && (
              <div className="error-message">{errors?.NoOfDependant}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="number"
              name="Amount"
              id="Amount"
              placeholder=""
              value={payload?.Amount}
              onInput={(e) => number(e, 16)}
              onChange={handleChange}
              lable="Card Amount"
            />
            {errors?.Amount && (
              <div className="error-message">{errors?.Amount}</div>
            )}
          </div>
          <div className="col-sm-2">
            <div className="d-flex">
              <div className="row">
                <div className="col-sm-3">
                  <label className="col-sm-14">{t("Validity: ")}</label>
                </div>
                <div className="col-sm-3 px-0">
                  <Input
                    //   className="required-fields"
                    style={{ width: "10px" }}
                    id="ValidYear"
                    name="ValidYear"
                    className="required-fields"
                    value={payload?.ValidYear}
                    onChange={handleCalculate}
                    type="number"
                    placeholder="Years"
                    onInput={(e) => number(e, 2, 20)}
                  />
                </div>
                <div className="col-sm-3 px-0">
                  <Input
                    id="ValidMonth"
                    name="ValidMonth"
                    className="required-fields"
                    value={payload?.ValidMonth}
                    disabled={!payload?.ValidYear}
                    onChange={handleCalculate}
                    type="number"
                    placeholder="Months"
                    onInput={(e) => number(e, 2, 12)}
                  />
                </div>
                <div className="col-sm-3 px-0">
                  <Input
                    id="ValidDays"
                    name="ValidDays"
                    className="required-fields"
                    type="number"
                    value={payload?.ValidDays}
                    onChange={handleCalculate}
                    disabled={!payload?.ValidMonth}
                    placeholder="Days"
                    onInput={(e) => number(e, 2, 31)}
                  />
                </div>
              </div>
            </div>
            {errors?.ValidYear && (
              <div className="error-message">{errors?.ValidYear}</div>
            )}
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="DOB"
              maxDate={new Date()}
              value={payload?.ValidUpto}
              disabled
              lable={t("Valid Upto")}
            />
          </div>
        </div>
        <div className="row pt-1 pl-2 pr-2 mb-1">
          <div className="col-sm-auto">
            <CustomButton
              text={t("UploadLogo")}
              icon="image"
              onClick={() => {
                if (payload?.logobase64 == "" || payload?.logobase64 == null) {
                  setPayload({ ...payload, logobase64: guidNumber() });
                }
                console.log(payload);
                setShow(true);
              }}
            />
          </div>
          <div className="col-sm-auto">
            <CustomButton
              text={t("Header")}
              onClick={() => {
                setEditorValue(payload?.DynamicHtml || "");
                setEditTable(true);
                setOpenHeaderModal(true);
              }}
            />
          </div>

          <div className="col-sm-2">
            {/* <SelectBox
              // options={NoOfDependantPerson}
              className="input-sm required-fields"
              name="CardGeneration"
              id="CardGeneration"
              placeholder=""
              onChange={handleChange}
              selectedValue={payload?.CardGeneration}
              lable="Card Option"
              options={[
                { label: "Select Option", value: "" },
                { label: "Pre Printed", value: "Pre Printed" },
                { label: "System", value: "System" }
              ]}
            /> */}

            <ReactSelect
              dynamicOptions={[
                { label: "Select Option", value: "" },
                { label: "Pre Printed", value: "Pre Printed" },
                { label: "System", value: "System" }
              ]}
              name="CardGeneration"
              lable={t("Card Option")}
              id="CardGeneration"
              removeIsClearable={true}
              placeholderName={t("Card Option")}
              value={payload.CardGeneration}
              onChange={handleReactSelectChange}
            />
          </div>

          {payload?.CardGeneration === "Pre Printed" && (
            <div className="col-sm-2">
              <Input
                style={{ width: "100px" }}
                id="BarcodeLength"
                name="BarcodeLength"
                className="required-fields"
                value={payload?.BarcodeLength || ""}
                onChange={handleChange}
                type="number"
                lable="Barcode digit(4 or 6)"
                maxLength={6}
                onInput={(e) => number(e, 6)}
              />
            </div>
          )}
          {/* <label className="col-sm-1 d-flex align-items-cente">{t("Status")} :</label> */}
          <div className="col-sm-auto d-flex align-items-center">
            <Form.Check
              type="switch"
              name="IsActive"
              id="switch"
              checked={payload?.IsActive}
              onChange={handleSelectChange}
            />
            <label className="col-sm-10 mb-0">
              {payload?.IsActive ? t("Active") : t("De-Active")}
            </label>
          </div>

          <div className="col-sm-auto d-flex align-items-center">
            <Form.Check
              type="switch"
              id="custom-switch"
              label={t("Membership Renewal")}
              checked={isRenewalEnabled}
              onChange={handleToggle}
            />

            {isRenewalEnabled && (
              <Input
                id="RenewalAmount"
                lable="Enter Amount"
                name="RenewalAmount"
                className="required-fields ml-2"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
              />
            )}
          </div>

          {load.save ? (
            <Loading />
          ) : (
            <div className="col-sm-1">
              <SaveButton
                text={isUpdate ? t("Update") : t("Save")}
                onClick={isUpdate ? handleUpdate : handleSave}
              />
            </div>
          )}{" "}
          <div className="col-sm-14">
            {isUpdate ? (
              <CancelButton
                text={t("Cancel")}
                onClick={handleCancel}
              />
            ) : (
              false
            )}
          </div>
        </div>
      </Accordion>
      {/* <Accordion title={t("Search Data")} defaultValue={true}> */}
      <Heading
        title={t("Card List")}
        secondTitle={
          <>
            {colorCodingDataWithCount?.map(({ color, labelKey, id,count  }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={`${t(labelKey)} (${count})`} // Add count here
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                onClick={() => setSelectedStatus(labelKey)}
              />
            ))}
          <CustomButton
              text={"Show All"}
              onClick={() => setSelectedStatus(null)}
              className="mx-2"
            />
             <FilterInput
              value={filterInputValue}
              onChange={handleFilterInputChange}
              placeholder="Filter Table"
            />
          </>
        }
      />

      {load.table ? (
        <Loading />
      ) : (
        <>

          <div>
            {filteredData?.length > 0 && (
              <CustomTable columns={tableHeaders} data={tableDataFormatted} />
            )}
          </div>

        </>
      )}
      <Dialog
        visible={openHeaderModal}
        onHide={() => setOpenHeaderModal(false)}
        className={theme}
        style={{ width: isMobile ? "90vw" : "40vw" }}
        header={
          <div className="d-flex justify-content-between align-items-center w-100">
            <div style={{ fontSize: "12px" }}>{t("Kindly use patient name: {PName}, IssueDate: {IssueDate}, FamilyMemberTable: {FamilyMemberTable}")}</div>
          </div>
        }
      >
        <div id="Header">
          <FullTextEditor
            value={editorValue}
            EditTable={editTable}
            setEditTable={setEditTable}
            setValue={setEditorValue}
          />
        </div>
        <div className="row col-12 mt-2 mb-2">
          <div className="col-sm-6">
            <SaveButton
              text={"Save"}
              className="col-12"
              onClick={() => {
                setPayload({ ...payload, DynamicHtml: editorValue });
                setOpenHeaderModal(false);
              }}
            />
          </div>
          <div className="col-sm-6">
            <CancelButton
              text={"Close"}
              className="col-12"
              onClick={() => setOpenHeaderModal(false)}
            />
          </div>
        </div>
      </Dialog>
      {/* </Accordion> */}
    </>
  );
};

export default MembershipCardMaster;
