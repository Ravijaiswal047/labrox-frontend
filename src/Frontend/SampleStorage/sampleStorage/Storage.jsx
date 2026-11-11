import React, { useEffect, useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../components/formComponent/DatePicker";
import Heading from "../../../components/UI/Heading";
// import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Input from "../../../components/formComponent/Input";
import "./SampleStorage.css";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SeeMore from "../frameMenu/SeeMore";
import { ViewMenu } from "../../../components/SvgIcons";
import Discard from "./Discard";
import Issue from "./Issue";
import DeviceMaster from "../sampleStorageMaster/DeviceMaster";
import TrackMaster from "../sampleStorageMaster/TrackMaster";
import TrayMaster from "../sampleStorageMaster/TrayMaster";
import SampleStorageDashboard from "../sampleStorageDashboad/SampleStorageDashboard";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { notify } from "../../../utils/utils";
import { apiUrls } from "../../../utils/apiUrls";
import SampleDiscardReport from "./SampleDiscardReport";
import moment from "moment";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import ColorCodingSearch from "../../../components/commonComponents/ColorCodingSearch";

const tryTypeList = [
  { label: "Old Tray", value: "rd1" },
  { label: "New Tray", value: "rd2" },
];

const colorCodingData = [
  { color: "#FFC0CB", id: "7", labelKey: "New" },
  { color: "#f4f74f", id: "15", labelKey: "Running" },
  { color: "#90EE90", id: "8", labelKey: "Full" },
];

const Storage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showMore, setShowMore] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [StorageDeviceData, setStorageDeviceData] = useState([]);
  const [StorageBarcodeNoValidate, setStorageBarcodeNoValidate] = useState([]);
  const [storageDevice_RackList, setStorageDevice_RackList] = useState([]);
  const [barcode, setBarcode] = useState([]);
  const [bindTrayData, setBindTrayData] = useState([]);
  const [originalOldTrayData, setOriginalOldTrayData] = useState([]);

  const initialState = {
    Type: "P",
    StorageType: "",
    ProcessDate: new Date(),
    TrayType: "",
    NewTray: "",
    SINNo: "",
    SampleType: "",
    Device: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [StorageNewTrayData, setStorageNewTrayData] = useState([]);
  const [trayName, setTrayName] = useState([]);
  const [storedSampleInTray, setStoredSampleInTray] = useState([]);
  const [inserTray, setInsertTray] = useState({
    selectTrayId: "",
  });

  // const tray =
  //   StorageNewTrayData.length > 0
  //     ? StorageNewTrayData.find((t) => t.ID === payload.NewTray)
  //     : null;

  const seeMoreData = [
    {
      name: "Sample Storage Dashboard",
      component: <SampleStorageDashboard setShowMore={setShowMore} />,
      url: "/Dashboard#samplestoragedashboard",
    },
    {
      name: "Sample Storage Tray Master",
      component: <TrayMaster setShowMore={setShowMore} />,
      url: "/SampleStorageTrayMaster",
    },
    {
      name: "Sample Storage Type Master",
      component: <TrackMaster setShowMore={setShowMore} />,
      url: "/SampleStorageTypeMaster",
    },
    {
      name: "Sample Storage Device Master",
      component: <DeviceMaster setShowMore={setShowMore} />,
      url: "/SampleStorageDeviceMaster",
    },
    {
      name: "Sample Issue",
      component: <Issue setShowMore={setShowMore} />,
      url: "/SampleIssue",
    },
    {
      name: "Sample Discard",
      component: <Discard setShowMore={setShowMore} />,
      url: "/Samplediscard",
    },
    {
      name: "Sample Discard Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleDiscardReport",
    },
    {
      name: "Sample Storage Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleStorageReport",
    },
    {
      name: "Sample Issue Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleIssueReport",
    },
    {
      name: "Sample Storage Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleStorageReport",
    },
  ];

  const handleSelectChange = async (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));

    if (name === "Device") {
      const selectedDevice = deviceList?.find(
        (item) => item?.value === value?.value,
      );

      const numberOfRacks = selectedDevice?.numberofrack || 0;

      if (numberOfRacks === 0) {
        notify("Selected device has no racks configured.", "warn");
        setStorageDevice_RackList([]);
        return;
      }

      const promises = [];

      for (let i = 1; i <= numberOfRacks; i++) {
        promises.push(getStorageDivece_RackData(value?.value, i));
      }

      const results = await Promise.all(promises);
      const indexedData = results.map((res, index) => ({
        index,
        data: res,
      }));

      setStorageDevice_RackList(indexedData);
    }

    if (name === "TrayType") {
      if (value?.value === "rd2") {
        fetchStorageNewTray();
      } else {
        fetchStorageOLDTray();
      }
    } else if (name === "NewTray") {
      const selectedTray = StorageNewTrayData.find(
        (t) => t.ID === value?.value,
      );
      getOldTrayStoreSample(value?.value);
      if (selectedTray) {
        setTrayName(selectedTray.TrayCode.split("^"));
        fetchDevice();
      }
    } else if (!payload?.Type || payload.Type === "") {
      toast.error(" Please Select Type");
      return;
    }
  };

  const [errors, setErrors] = useState({});

  const dateSelect = (date, name) => {
    setPayload((prev) => ({ ...prev, [name]: date }));
  };

  const getOldTrayStoreSample = async (trayId = "") => {
    // StorageOLDTrayData
    const reqBody = {
      type: "StorageOLDTrayData",
      centreID: 0,
      departmentID: "",
      storageTypeID: 0,
      sampleType: "",
      trayID: String(trayId || payload?.NewTray) || "",
      deviceID: 0,
      rackID: "",
      barcodeNo: "",
      sampleTypeID: 0,
    };
    dispatch(setLoading(true));
    axiosInstance
      .post(apiUrls?.GetMaster, reqBody)
      .then((res) => {
        const { success, message } = res?.data || {};
        if (!Array.isArray(message)) {
          // notify(message, 'error');
          setStoredSampleInTray([]);
          return;
        }
        setStoredSampleInTray(message);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const bindOldTray = async () => {
    // StorageOLDTrayData
    dispatch(setLoading(true));
    const reqBody = {
      type: payload?.Type || "",
      date: payload?.ProcessDate ? moment(payload?.ProcessDate).format("yy-MM-DD") : "",
    }
    dispatch(setLoading(true));
    axiosInstance
      .post(apiUrls?.BindOldTray, reqBody)
      .then((res) => {
        const { success, message } = res?.data || {};
        console.log("bindOldTray::", res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const bindTray = async () => {
    // StorageOLDTrayData
    dispatch(setLoading(true));
    const reqBody = {
      sampletype: payload?.SampleType?.toString() || "",
    }
    dispatch(setLoading(true));
    axiosInstance
      .post(apiUrls?.BindTray, reqBody)
      .then((res) => {
        const { success, message } = res?.data || {};
        if(success && Array.isArray(message) && message?.length > 0){
            setBindTrayData(message);
            setPayload((prev) => ({ ...prev, ["TrayType"]: "rd1" }));
            fetchStorageOLDTray(message);
        }
        else {
          setPayload((prev) => ({ ...prev, ["TrayType"]: "rd2" }));
          fetchStorageNewTray();
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  console.log("sampleStorage::", storedSampleInTray);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPayload((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
      };
      return updated;
    });

    // if SINNo input changes, call API
    // if (name === "SINNo" && value?.length > 5) {
    //   if (!payload?.Device) {
    //     notify("Kindly select Device and Rack.", "warn");
    //     return;
    //   }
    //   if (!inserTray?.selectTrayId) {
    //     notify("Kindly select Rack.", "warn");
    //     return;
    //   }
    //   fetchStorageBarcodeNoValidate(value);
    // }
  };

  const [DropDownList, setDropDownList] = useState({
    TypedynamicOptions: [
      { label: "Processed Samples", value: "P" },
      {
        label: "Scheduled Samples",
        value: "S",
      },
    ],
    Samplelist: [],
  });

  const fetchBindSample = () => {
    axiosInstance
      .get("SampleStorage/BindSample")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.id,
            label: ele?.samplename,
          };
        });
        setDropDownList((prev) => ({ ...prev, Samplelist: val }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getExpDate = () => {
    if (!trayName?.[2]) return null;

    const today = new Date();
    const [numStr, unitRaw] = trayName[2].split(" "); // e.g. "2 Months"
    const num = parseInt(numStr, 10);
    const unit = unitRaw.toLowerCase();

    const newDate = new Date(today);

    if (unit.includes("day")) {
      newDate.setDate(today.getDate() + num);
    } else if (unit.includes("month")) {
      newDate.setMonth(today.getMonth() + num);
    } else if (unit.includes("year")) {
      newDate.setFullYear(today.getFullYear() + num);
    }

    // format YYYY-MM-DD
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const buildRequestBody = () => {
    if (!payload?.Device) {
      notify("Kindly select Device", "warn");
      return;
    }
    if (!payload?.SampleType) {
      notify("Kindly select Sample Type", "warn");
      return;
    }
    if (!payload?.TrayType) {
      notify("Kindly select Tray Type", "warn");
      return;
    }
    if (!payload?.TrayType) {
      notify("Kindly select Tray Type", "warn");
      return;
    }
    if (!inserTray.selectTrayId) {
      notify("Kindly select Rack", "warn");
      return;
    }
    if (!barcode) {
      notify("Kindly select barcode or SIN No.", "warn");
      return;
    }
    const oldTrayCode = StorageNewTrayData?.find(
      (item) => item?.ID == payload?.NewTray,
    )?.SystemGen_Traycode;
    console.log("barcodexx", barcode);
    const savePayloadList = barcode?.map((barItem, idx) => ({
      roleID: 0,
      deviceID: payload?.Device || "",
      rackID: String(inserTray.selectTrayId),
      trayID: String(payload?.NewTray),
      trayCode: oldTrayCode || "",
      slotNumber: String(barcode),
      type: payload?.Type,
      barcodeNo: barItem,
      status: "1",
      sampleTypeID: String(payload?.SampleType),
      processedDate: moment(payload.ProcessDate).format("yy-MM-DD"),
      expiryDate: getExpDate(),
    }));

    console.log("savePayloadList", savePayloadList);

    return savePayloadList;
  };

  const handleSave = async () => {
    const url = "SampleStorage/save";
    try {
      const reqBody = buildRequestBody();
      console.log("reqBody:::", reqBody);
      // return
      const response = await axiosInstance.post(url, reqBody);
      const { success, message } = response?.data || {};
      if (success) {
        toast.success(message || "Saved Successfully.");
        fetchBindSample();
        setPayload(initialState);
        setIsUpdate(false);
        setBarcode([]);
        return;
      }
      toast.error(message);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };

  const handleClear = () => {
    setPayload(initialState);
  };

  const fetchStorageNewTray = (SamType = "") => {
    console.log("payload.SampleType", payload.SampleType);
    if (!payload.SampleType) {
      toast.warn("Please select Sample Type !");
      return;
    }

    const reqBody = {
      type: "StorageNewTray",
      centreID: 0,
      departmentID: "",
      storageTypeID: 0,
      sampleType: String(SamType || payload?.SampleType),
      trayID: "",
      deviceID: 0,
      rackID: "",
      barcodeNo: "",
      sampleTypeID: 0,
    };
    axiosInstance
      .post(apiUrls?.GetMaster, reqBody)
      .then((res) => {
        const { success, message } = res?.data || {};
        if (success && Array.isArray(message)) {
          setStorageNewTrayData(message);
          // setMasterTableData(message);
          return;
        }
        toast.error(message);
        setStorageNewTrayData([]);
      })
      .catch((err) => {
        setTableData([]);
        console.log(err);
      });
  };

  const fetchStorageOLDTray = (enabledtray=bindTrayData) => {
    const reqBody = {
      type: "StorageOLDTray",
      centreID: 0,
      departmentID: "",
      storageTypeID: 0,
      sampleType: String(payload?.SampleType),
      trayID: "",
      deviceID: 0,
      rackID: "",
      barcodeNo: "",
      sampleTypeID: 0,
    };
    axiosInstance
      .post("SampleStorage/GetMaster", reqBody)
      .then((res) => {
        const { success, message } = res?.data || {};
        if (success && Array.isArray(message)) {
          const bindTrayNames = enabledtray?.map(
            (item) => item?.ID
          );
          
          console.log("bindTrayNames", bindTrayNames);

          const filteredData = message?.filter((item) =>
            bindTrayNames?.includes(item?.ID)
          );

          console.log("filteredData", filteredData);

          setStorageNewTrayData(filteredData);
          setOriginalOldTrayData(message);
          // setMasterTableData(message);
          return;
        }
        toast.error(message);
      })
      .catch((err) => {
        setTableData([]);
        console.log(err);
      });
  };
  const fetchStorageBarcodeNoValidate = async (sinNo) => {
    try {
      console.log("fetchStorageBarcodeNoValidate called with SIN No:", sinNo);
      if (!payload?.SampleType) {
        notify("Kindly select sample type", "warn");
        return;
      }
      const reqBody = {
        type: "StorageBarcodeNoValidate",
        centreID: 0,
        departmentID: "",
        storageTypeID: 0,
        sampleType: "",
        trayID: "",
        deviceID: 0,
        rackID: "",
        barcodeNo: sinNo,
        sampleTypeID: String(payload?.SampleType) || "0",
      };

      const res = await axiosInstance.post("SampleStorage/GetMaster", reqBody);
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message) && message?.length > 0) {
        setStorageBarcodeNoValidate(message);
        toast.success("Barcode found !");
        return message;
      }
      setStorageBarcodeNoValidate([]);

    toast.error("Barcode Not found !");

    return null;
      // toast.error("Barcode Not found !");
    } catch (err) {
      setStorageBarcodeNoValidate([]);
      console.log(err);
    }
  };

  const handleRemove = () => {
    setInsertTray((prev) => ({ ...prev, selectTrayId: "" }));
    setBarcode([]);
  };

  const handleAddThumbnail = (rackId) => {
    setInsertTray((prev) => ({ ...prev, selectTrayId: rackId + 1 }));
    // if (!inserTray?.selectTrayId) {
    // }
  };

  const trayPositionMap = {};
  StorageNewTrayData.forEach(({ ID, TrayCode }) => {
    const parts = TrayCode?.split("^"); // (asd^11X221^1 Days) TrayName(asd) - Capacity1 X Capacity2 (11 X 221) - Expiray unit (1) -  Exp Type (Days) = 1 Day
    if (parts[1]) {
      trayPositionMap[parts[1]] = ID; // Example: "5X5" => 9
    }
  });

  console.log("StorageNewTrayData", StorageNewTrayData);

  const fetchDevice = async () => {
    // debugger;
    try {
      const res = await axiosInstance.post(apiUrls?.getDeviceMaster, {
        isActive: "1",
      });
      const resData = res?.data?.message || [];
      console.log("resData", resData);
      const val = resData.map((ele) => ({
        ...ele,
        value: String(ele.ID),
        label: ele.DeviceName,
        numberofrack: ele.NumberOfRack,
      }));
      setDeviceList(val);
      // setPayload((prev) => ({ ...prev, ["Device"]: val?.[0]?.value }));
    } catch (err) {
      console.log(err);
    }
  };

  // const getStorageDivece_RackData = async (StypeID, sinNo) => {
  //   const reqBody = {
  //     type: "StorageDeviceData",
  //     centreID: 0,
  //     departmentID: "",
  //     storageTypeID: 0,
  //     sampleType: "",
  //     trayID: "",
  //     deviceID: Number(StypeID),
  //     rackID: String(sinNo),
  //     barcodeNo: "",
  //     sampleTypeID: 0,
  //   };

  //   try {
  //     const res = await axiosInstance.post("SampleStorage/GetMaster", reqBody);
  //     const { success, message } = res?.data || {};
  //     if (success && Array.isArray(message)) {
  //       return message; // return data instead of setting directly
  //     } else {
  //       // toast.error(message || "No Data found.");
  //       return [];
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     return [];
  //   }
  // };

  // getStorageDivece_RackData - update payload as per requirement
  const getStorageDivece_RackData = async (deviceId, rackId) => {
    const reqBody = {
      deviceId: Number(deviceId),
      rackId: Number(rackId),
      expirydate: "",
    };

    try {
      const res = await axiosInstance.post(
        "SampleStorage/GetDeviceData",
        reqBody,
      ); // apna sahi URL daalna
      const { success, message } = res?.data || {};
      if (success && Array.isArray(message)) {
        return message;
      } else {
        return [];
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const noOfRacksRow = Array.from(
    {
      length: deviceList?.find((item) => item.value === payload?.Device)
        ?.numberofrack,
    },
    (_, i) => i + 1,
  );

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      if (!payload.Device) {
        notify("Kindly select Device.", "warn");
        return;
      }
      if (!inserTray.selectTrayId) {
        notify("Kindly select Rack.", "warn");
        return;
      }
      const validatedData = await fetchStorageBarcodeNoValidate(
      payload?.SINNo
    );

    // if barcode not found
      if (!validatedData || validatedData?.length === 0) {
        return;
      }

      const validatedBarcode =
        validatedData?.[0]?.BarcodeNo;

      if (
        validatedBarcode &&
        !barcode?.includes(validatedBarcode)
      ) {
        setBarcode((prev) => [
          ...prev,
          validatedBarcode,
        ]);
      }
      // fetchStorageBarcodeNoValidate(payload?.SINNo);
      // console.log("StorageBarcodeNoValidate",StorageBarcodeNoValidate);
      // if (!barcode?.includes(StorageBarcodeNoValidate?.[0]?.BarcodeNo)) {
      //   setBarcode((prev) => [
      //     ...prev,
      //     StorageBarcodeNoValidate?.[0]?.BarcodeNo || "",
      //   ]);
      // }
      // else{
      //   notify("Barcode already added on this slot !", "warn");
      // }
    }
  };

  console.log("barcode", barcode);

  const handlebarcodeRemove = (inserBarcodeIndex) => {
    setBarcode((prev) => {
      let filetredBarcode = prev?.filter((_, idx) => idx !== inserBarcodeIndex);
      return filetredBarcode;
    });
  };

  useEffect(() => {
    fetchBindSample();
  }, []);

  useEffect(() =>{
    bindOldTray();

  },[payload?.Type,payload?.ProcessDate])

  useEffect(() =>{
    if(payload?.SampleType !== ""){
    bindTray();
    }
  },[payload?.SampleType]);

  // useEffect(()=>{

  //   const bindTrayNames = bindTrayData?.map(
  //     (item) => item?.ID
  //   );

  //   console.log("bindTrayNames", bindTrayNames,originalOldTrayData);

  //   const filteredData = originalOldTrayData?.filter((item) =>
  //     bindTrayNames?.includes(item?.ID)
  //   );

  //   console.log("filteredData", filteredData);

  //   setStorageNewTrayData(filteredData);

  // },[bindTrayData])

  const selectedTrayName = StorageNewTrayData?.find(
    (item) => item?.ID === payload?.NewTray,
  )?.TrayCode?.split("^")?.[1];
  const trayRows = Number(selectedTrayName?.split("X")?.[0]) || 10;
  const trayCols = Number(selectedTrayName?.split("X")?.[1]) || 10;

  console.log("payload?.SampleType", barcode);
  console.log("StorageBarcodeNoValidate",StorageBarcodeNoValidate);
  return (
    <>
      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}
      <div className="card sample-storage-heading">
        <Heading
          name={"Sample Storage"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <div className="row p-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              name="Type"
              id="Type"
              removeIsClearable={true}
              dynamicOptions={DropDownList?.TypedynamicOptions}
              placeholderName={t("Type")}
              value={payload?.Type}
              onChange={handleSelectChange}
              respclass={""}
            />
            {errors?.Type && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Type}
              </div>
            )}
          </div>
          <ReactSelect
            name="SampleType"
            id="SampleType"
            removeIsClearable={true}
            dynamicOptions={DropDownList.Samplelist}
            placeholderName={t("Sample Type")}
            value={payload?.SampleType}
            onChange={handleSelectChange}
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />
          <DatePicker
            name="ProcessDate"
            id="ProcessDate"
            value={payload?.ProcessDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Process Date")}
            className="custom-calendar"
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />
        </div>
      </div>
      <div className="card mt-2">
        <div style={{ gap: "4px" }} className="row p-2 responsive_width">
          <div className="w-50 flex-grow-1">
            <Heading
              name={t("Add Sample To Tray")}
              isBreadcrumb={true}
              secondTitle={
                <div style={{ display: "flex", gap: "16px" }}>
                  <div>
                    <strong>TrayName:</strong> {trayName[0]}
                  </div>
                  <div>
                    <strong>Size:</strong> {trayName[1]}
                  </div>
                  <div>
                    <strong>Duration:</strong> {trayName[2]}
                  </div>
                </div>
              }
            />
            <div className="row p-2">
              <ReactSelect
                name="TrayType"
                id="TrayType"
                removeIsClearable={true}
                dynamicOptions={tryTypeList}
                placeholderName="Tray Type"
                value={payload?.TrayType}
                onChange={handleSelectChange}
                respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
              />
              <ReactSelect
                name="NewTray"
                id="NewTray"
                removeIsClearable={true}
                dynamicOptions={StorageNewTrayData?.map((item) => ({
                  label: item.TrayCode?.split("^")[0],
                  value: item.ID,
                }))}
                placeholderName="Tray Name"
                value={payload?.NewTray}
                onChange={handleSelectChange}
                respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable={t("SIN No")}
                id="SINNo"
                name="SINNo"
                value={payload?.SINNo}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
              />
            </div>
            {/* Tray Table */}
            <div className="row p-2">
              <div className="col-sm-12 makeTableResponsive">
                <table className="table table-striped sample_cell_table table-bordered">
                  {selectedTrayName?.length > 0 ? (
                    <tbody>
                      {Array.from({ length: trayRows || 10 }, (_, row) => (
                        <tr key={row}>
                          {Array.from({ length: trayCols || 10 }, (_, col) => {
                            let cellIndex =
                              row * trayName[1]?.split("X")?.[1] + col;
                            let inserBarcodeIndex = 0;
                            return (
                              <td key={col} className="p-1">
                                {`${row + 1}X${col + 1}`}
                                {storedSampleInTray?.length > 0 &&
                                  storedSampleInTray[cellIndex] && storedSampleInTray[cellIndex]
                                            ?.BarcodeNo && (
                                    <div className="tooltip-wrapper mx-1">
                                      <button className="bg-grey text-white border-0 fs-6 rounded">
                                        {
                                          storedSampleInTray[cellIndex]
                                            ?.BarcodeNo
                                        }
                                      </button>
                                      <span className="tooltip-text">
                                        {
                                          storedSampleInTray[cellIndex]
                                            ?.SampleTypeName || "N/A"
                                        }
                                      </span>
                                    </div>
                                  )}
                                {barcode?.length > 0 &&
                                  cellIndex > storedSampleInTray?.length - 1 &&
                                  cellIndex <
                                    storedSampleInTray?.length +
                                      barcode?.length && (
                                    <div className="tooltip-wrapper">
                                      <button className="bg-grey text-white border-0 fs-6 rounded">
                                        {
                                          barcode[
                                            cellIndex -
                                              storedSampleInTray?.length
                                          ]
                                        }
                                        <span
                                          className="cross_icon_barcode"
                                          onClick={() =>
                                            handlebarcodeRemove(
                                              inserBarcodeIndex,
                                            )
                                          }
                                        >
                                          X
                                        </span>
                                      </button>
                                      <span className="tooltip-text">
                                        {
                                          StorageBarcodeNoValidate?.[0]
                                            ?.ItemName
                                        }
                                      </span>
                                    </div>
                                  )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <></>
                  )}
                </table>
              </div>
            </div>
          </div>
          <div className="w-25 flex-grow-1 device-detail-heading">
            <Heading
              name={t("Device Detail")}
              isBreadcrumb={true}
              secondTitle={
                <div className="d-flex justify-content-end w-100">
                  {colorCodingData.map(({ color, labelKey, id }) => (
                    <ColorCodingSearch
                      key={id}
                      color={color}
                      label={t(labelKey)}
                      //   onClick={() => handleCallViewMedReq(id)}
                    />
                  ))}
                </div>
              }
            />
            <div className="row p-2">
              <ReactSelect
                name="Device"
                id="Device"
                removeIsClearable={true}
                dynamicOptions={deviceList}
                placeholderName="Device"
                value={payload?.Device}
                onChange={handleSelectChange}
                respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
              />
            </div>
            <div className="row p-2">
              <div className="col-sm-5">
                <table className="table tray_table table-striped table-bordered">
                  {deviceList.length > 0 ? (
                    <tbody>
                      {noOfRacksRow?.map((rackNumber, idx) => (
                        <tr key={rackNumber}>
                          <td style={{ width: "15%" }}>
                            <button
                              className="btn btn-sm btn-success m-2"
                              onClick={() => handleAddThumbnail(rackNumber - 1)}
                            >
                              Rack {rackNumber}
                            </button>
                          </td>
                          <td className="d-flex align-items-center justify-content-start">
                            {[storageDevice_RackList[idx]]?.map(
                              (racksDetail, index) => {
                                let rackFillPerc =
                                  (racksDetail?.data?.[0]?.TotalCount /
                                    racksDetail?.data?.[0]?.TotalCapacity) *
                                  100;
                                // if(racksDetail?.data?.[0]?.TotalCapacity > racksDetail?.data?.[0]?.TotalCount)
                                {
                                  return (
                                    <>
                                      <span
                                        key={index}
                                        className={` ${rackFillPerc == 100 ? "imgthumbnail" : "d-none"} m-2 `}
                                      />
                                      <span
                                        key={index}
                                        className={` ${rackFillPerc > 50 ? "imgthumbnail" : "d-none"} m-2 `}
                                      />
                                      <span
                                        key={index}
                                        className={` ${rackFillPerc >= 1 ? "imgthumbnailpartial" : "d-none"} m-2 `}
                                        // onClick={() =>
                                        //   cls === "imgthumbnails" &&
                                        //   handleRemoveThumbnail(rack?.id, index)
                                        // }
                                      />
                                      <span
                                        key={index}
                                        className={` ${`${inserTray.selectTrayId - 1 === idx ? "imgthumbnails" : "d-none"}`} m-2 `}
                                        // onClick={() =>
                                        //   cls === "imgthumbnails" &&
                                        //   handleRemoveThumbnail(rack?.id, index)
                                        // }
                                      >
                                        <span
                                          className="cross_icon"
                                          onClick={handleRemove}
                                        >
                                          X
                                        </span>
                                      </span>
                                    </>
                                  );
                                }
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <></>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row px-2 mb-2">
        <div className="col-sm-12 d-flex justify-content-end">
          <Button className="rounded py-0 ml-2 mt-2" onClick={handleSave}>
            Save
          </Button>
          <Button
            className="rounded py-0 ml-2 mt-2 bg-danger"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </div>
    </>
  );
};

export default Storage;
