import React, { useEffect, useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import DatePicker from "../../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import Heading from "../../../components/UI/Heading";
import { ViewMenu } from "../../../components/SvgIcons";
import SeeMore from "../frameMenu/SeeMore";
import Issue from "./Issue";
import SampleStorage from "./SampleStorage";
import DeviceMaster from "../sampleStorageMaster/DeviceMaster";
import TrackMaster from "../sampleStorageMaster/TrackMaster";
import TrayMaster from "../sampleStorageMaster/TrayMaster";
import SampleStorageDashboard from "../sampleStorageDashboad/SampleStorageDashboard";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiUrls";
import moment from "moment";
import { toast } from "react-toastify";
import SampleDiscardReport from "./SampleDiscardReport";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import "./SampleStorage.css";
import { notify } from "../../../utils/utils";
import { CustomButton } from "../../../components/UI/CustomButton";

const colorCodingData = [
  { color: "#FFC0CB", id: "7", labelKey: "Selected" },
  { color: "#f4f74f", id: "15", labelKey: "Running" },
  { color: "#90EE90", id: "8", labelKey: "Full" },
];

const Discard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showMore, setShowMore] = useState(false);
  const [storageDevice_RackList, setStorageDevice_RackList] = useState([]);
  const [trackId, setTrackId] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [allSampleList, setAllSampleList] = useState([]);
  const [selectForDiscard, setSelectForDiscard] = useState([]);
  const [storeDetailsOfSample, setStoreDetailsOfSample] = useState({});

  const initialState = {
    Centre: "",
    ExpiryDate: new Date(),
    Device: "",
    Rack: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [centredata, setcentredata] = useState([]);

  const handleSelectChange = async (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));

    if (name == "Centre") {
      fetchDevice(value?.value);
    }

    // if (name === "Device") {
    //   const promises = [];

    //   const selectedTray = deviceList?.find(
    //     (item) => item?.value === value?.value
    //   )?.numberofrack;
    //   console.log("selectedTray", selectedTray);
    //   for (let i = 0; i < selectedTray; i++) {
    //     // promises.push(getStorageDivece_RackData(value?.value, i + 1));
    //   }

    //   // Wait for all API calls
    //   const results = await Promise.all(promises);

    //   // Store index-wise
    //   const indexedData = results.map((res, index) => ({
    //     index,
    //     data: res,
    //   }));

    //   // setStorageDevice_RackList(indexedData);
    // }
  };

  console.log("storageDevice_RackList", storageDevice_RackList);
  console.log("storageDevice_RackList::", storeDetailsOfSample);
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
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
      name: "Sample Storage",
      component: <SampleStorage setShowMore={setShowMore} />,
      url: "/SampleStorage",
    },
    {
      name: "Sample Issue",
      component: <Issue setShowMore={setShowMore} />,
      url: "/SampleIssue",
    },
    {
      name: "Sample Storage Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleStorageReport",
    },
  ];
  const [StorageNewTrayData, setStorageNewTrayData] = useState([]);
  const [LoadExpiredTraySearch, setLoadExpiredTraySearch] = useState([]);

  const fetchAllCenter = () => {
    axiosInstance
      .get("Employee/GetAllCentres")
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setcentredata(val);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchDevice = async (CentreID) => {
    await axiosInstance
      .post(apiUrls?.Fetchprocedure, {
        typeName: "GetStorageDeviceMasterbycentre",
        params: [`${useLocalStorage("DefaultCentre", "get")}`],
      })
      .then((res) => {
        const resData = res?.data?.data;
        const val = resData.map((ele) => ({
          ...ele,
          value: String(ele?.ID),
          label: ele?.DeviceName,
        }));
        setDeviceList(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDiscard = async () => {
    const reqBody = {
      trayCodes: selectForDiscard?.join(","),
    };
    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(apiUrls?.saveDiscard, reqBody);
      const { message, data, success } = res?.data || {};
      if (success) {
        toast.success(message);
        handleClear()
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLoadExpiredTray = async () => {
    const promises = [];
    const selectedTray = deviceList?.find(
      (item) => item?.value === payload?.Device
    )?.NumberOfRack;
    console.log("selectedTray", selectedTray);
    for (let i = 0; i < selectedTray; i++) {
      promises.push(getStorageDivece_RackData(payload?.Device, i + 1));
    }

    // Wait for all API calls
    const results = await Promise.all(promises);
    console.log("results", results);

    // Store index-wise
    const indexedData = [...results]?.map((res, index) => ({
      index,
      data: res,
    }));

    console.log("indexedData", indexedData);

    setStorageDevice_RackList(indexedData);
  };
  console.log("storageDevice_RackList", storageDevice_RackList);

  const getSamplesByTrayId = async (trayData) => {
    setSelectForDiscard((prev) =>
      prev.includes(trayData?.TrayCode)
        ? prev.filter((code) => code !== trayData?.TrayCode)
        : [...prev, trayData?.TrayCode]
    );

    if (selectForDiscard?.includes(trayData?.TrayCode)) {
      return;
    }

    const reqBody = {
      type: "StorageOLDTrayData",
      centreID: 0,
      departmentID: "",
      storageTypeID: 0,
      sampleType: "",
      trayID: String(trayData?.TrayID) || "",
      deviceID: 0,
      rackID: "",
      barcodeNo: "",
      sampleTypeID: 0,
    };

    dispatch(setLoading(true));
    await axiosInstance
      .post("SampleStorage/GetMaster", reqBody)
      .then((res) => {
        console.log("allBarcodeList", res);
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.message, "error");
          setAllSampleList([]);
          setStoreDetailsOfSample({});
          return;
        }
        setAllSampleList(res?.data?.message || []);
        setStoreDetailsOfSample(trayData);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  console.log("selectForDiscard", selectForDiscard);

  const handleClear = () => {
    setPayload(initialState);
    setSelectForDiscard([]);
    setStorageDevice_RackList([]);
    setAllSampleList([]);
    setStoreDetailsOfSample({});
  };

  const handleFilterInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilterInputValue(value);

    // Filter rows based on search term matching any field
    const filtered = tableData.filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key]).toLowerCase().includes(value)
      )
    );

    setTableData(filtered);
  };

  const getStorageDivece_RackData = async (StypeID, sinNo) => {
    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(apiUrls?.GetDeviceData,
        {
          deviceId: payload?.Device || 0,
          rackId: sinNo || 0,
          expirydate: moment(payload?.ExpiryDate)?.format("yy-MM-DD") || ""
        }
      );
      const { success, data } = res?.data || {};
      console.log("xxxdata", data);
      if (success && Array.isArray(data)) {
        return data; // return data instead of setting directly
      } else {
        // toast.error(message || "No Data found.");
        return [];
      }
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllCenter();
    fetchDevice();
  }, []);

  const [racks, setRacks] = useState([
    { id: 1, thumbnails: ["imgthumbnail", "imgthumbnail", "imgthumbnail"] },
    {
      id: 2,
      thumbnails: [
        "imgthumbnail",
        "imgthumbnailpartial",
        "imgthumbnail",
        "imgthumbnails",
      ],
    },
    {
      id: 3,
      thumbnails: [
        "imgthumbnail",
        "imgthumbnailpartial",
        "imgthumbnailpartial",
      ],
    },
  ]);

  const handleAddThumbnail = (rackId) => {
    const numberToAdd = 1; // change this to how many you want to add
    setRacks((prev) =>
      prev.map((rack) =>
        rack.id === rackId
          ? {
            ...rack,
            thumbnails: [
              ...rack.thumbnails,
              ...Array(numberToAdd).fill("imgthumbnails"),
            ],
          }
          : rack
      )
    );
  };

  // Remove only "imgthumbnails"
  const handleRemoveThumbnail = (rackId, index) => {
    setRacks((prev) =>
      prev.map((rack) =>
        rack.id === rackId
          ? {
            ...rack,
            thumbnails: rack.thumbnails.filter((_, i) => i !== index),
          }
          : rack
      )
    );
  };

  const fetchStorageTray = (sinNo) => {
    const reqBody = {
      type: "StorageDeviceData",
      centreID: 0,
      departmentID: "string",
      storageTypeID: 0,
      sampleType: "string",
      trayID: "string",
      deviceID: 0,
      rackID: "string",
      barcodeNo: sinNo,
      sampleTypeID: 0,
    };

    axiosInstance
      .post("SampleStorage/GetMaster", reqBody)
      .then((res) => {
        const { success, message } = res?.data || {};
        if (success && Array.isArray(message)) {
          setStorageDeviceData(message);
        } else {
          toast.error(message || "No Data found.");
        }
      })
      .catch((err) => {
        setStorageBarcodeNoValidate([]);
        console.log(err);
      });
  };

  console.log("LoadExpiredTraySearch", LoadExpiredTraySearch);

  const getTray = async () => {
    const reqBody = {
      type: "StorageDeviceData",
      centreID: 0,
      departmentID: "string",
      storageTypeID: 0,
      sampleType: "string",
      trayID: LoadExpiredTraySearch?.[0]?.TrayCode, //
      deviceID: 1, //LoadExpiredTraySearch?.[0]?.RackID,
      rackID: "string",
      barcodeNo: "sinNo",
      sampleTypeID: 0,
    };
    await axiosInstance
      .post("SampleStorage/GetMaster", reqBody)
      .then((res) => {
        const { success, data, message } = res?.data || {};
        if (success && Array.isArray(message)) {
          setStorageNewTrayData(data);
        } else {
          toast.error(message || "No Data found.");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  console.log("deviceList", deviceList);
  console.log("payload", payload);
  console.log("selectForDiscard", selectForDiscard);
  console.log("storeDetailsOfSample", storeDetailsOfSample);
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
      <div className="card">
        <Heading
          name={"Samples Discard"}
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
          <ReactSelect
            name="Centre"
            id="Centre"
            removeIsClearable={true}
            dynamicOptions={centredata}
            placeholderName="Centre"
            value={useLocalStorage("DefaultCentre", "get") || payload?.Centre}
            onChange={handleSelectChange}
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
            isDisabled={true}
          />
          <DatePicker
            name="ExpiryDate"
            id="ExpiryDate"
            value={payload?.ExpiryDate}
            onChange={dateSelect}
            // maxDate={new Date()}
            placeholder=""
            lable={t("Expiry Date")}
            className="custom-calendar"
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />
          <ReactSelect
            name="Device"
            id="Device"
            removeIsClearable={true}
            dynamicOptions={deviceList}
            placeholderName="Device"
            value={payload?.Device}
            onChange={handleSelectChange}
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />
          <div className="col-auto mt-1">
            <CustomButton onClick={handleLoadExpiredTray}
              text={t("Load Expired Tray")}
            />
          </div>
        </div>
      </div>
      <div className="card mt-2 discard-color-heading">
        <Heading
          name={t("Discarded Samples")}
          isBreadcrumb={true}
          secondTitle={
            <div className="d-flex flex-nowrap align-items-center">
              {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                />
              ))}
            </div>
          }
        />
        {storageDevice_RackList?.some(
          (item) => Array.isArray(item?.data) && item?.data?.length > 0
        ) && (
            <div className="row p-2">
              <div className="col-md">
                <table className="table table-striped tray_table table-bordered">
                  <tbody>
                    {storageDevice_RackList?.map((rack, idx) => (
                      <tr key={idx}>
                        <td className="d-flex align-items-center justify-content-start">
                          {/* RackID : 1 TYPE : "Processed" TotalCapacity : 4 TotalCount
                      : 1 TrayCode : "TRAY-123" */}
                          {[...rack?.data]?.map((cls, index) => {
                            return (
                              <>
                                <span
                                  onClick={() => getSamplesByTrayId(cls)}
                                  key={index}
                                  className={`m-2 ${selectForDiscard?.includes(cls?.TrayCode) ? "imgthumbnails" : "imgthumbnail"}`}
                                />
                                {/* <span
                              onClick={() => getSamplesByTrayId(cls?.TrayID)}
                              key={index}
                              className={`m-2 imgthumbnailpartial`}
                            /> */}
                              </>
                            );
                          })}
                        </td>
                        <td style={{ width: "15%" }}>
                          <button
                            className="btn btn-sm btn-success m-2 rounded"
                            onClick={() => fetchStorageTray(rack.id)}
                          >
                            Rack {idx + 1}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="col-sm-6 px-0 pt-0 barcodeList">
                <Heading title={"Sample Available in Rack"} />
                <div
                  style={{ gap: "2px", justifyContent: "space-evenly", }}
                  className="d-flex align-items-center border-bottom flex-wrap "
                >
                  <p className="mb-0">
                    <strong>Type :</strong>
                    <span> {storeDetailsOfSample?.Type}</span>
                  </p>
                  <p className="mb-0">
                    <strong>Tray Code :</strong>
                    <span> {storeDetailsOfSample?.TrayCode}</span>
                  </p>
                  <p className="mb-0">
                    <strong>Expiry Date :</strong>
                    <span> {storeDetailsOfSample?.ExpiryDate}</span>
                  </p>
                </div>
                {allSampleList?.length > 0 &&
                  <div className="col-sm-12 mt-2">
                    <div className="row g-2">
                      {allSampleList?.map((testItem, index) => (
                        <div key={index} className="tooltip-wrapper px-2">
                          {testItem?.BarcodeNo && (
                            <button className="bg-grey px-2 py-1 text-white border-0 fs-6 rounded">
                              {testItem?.BarcodeNo}
                            </button>
                          )}
                          <span className="tooltip-text">{testItem?.SampleTypeName}</span>
                        </div>
                      ))}
                    </div>
                  </div>}
              </div>
            </div>
          )}
      </div>
      {storageDevice_RackList?.some(
        (item) => Array.isArray(item?.data) && item?.data?.length > 0
      ) && (
          <div className="row">
            <div className="col-sm-12 d-flex justify-content-end">
              <Button className="rounded py-0 ml-2 mt-2" onClick={handleDiscard}>
                Discard
              </Button>
              <Button
                className="rounded py-0 ml-2 mt-2 bg-danger"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
    </>
  );
};

export default Discard;
