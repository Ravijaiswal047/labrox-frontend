import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import Heading from "../../../../components/UI/Heading";
import { PlusIcon, ViewMenu } from "../../../../components/SvgIcons";
// import QCFrameMenu from "../QCFrameMenu";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { toast } from "react-toastify";
const MicroQcReport = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialState = {
    Centre: "",
    Machine: "",
    Control: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    machineList: [],
    controlList: [],
  });
  const { ShowDefaultLoginCentre } = useLocalStorage("userData", "get");
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");

  const handleSelectChange = (name, e) => {
    if (!e) return;

    const value = e.value;
    setPayload((prev) => ({ ...prev, [name]: value }));

    if (name === "Centre") {
      getMachineList(value);
      getControlList(value);
      return;
    } else if (name === "Control") {
      setPayload((prev) => ({ ...prev, ControlName: (e?.label)?.split('#')?.[0].trim(), LotNumber: (e?.label)?.split('#')?.[1].trim() }));
      return;
    }
  };
  const dateSelect = (date, name) => {

    setPayload((prev) => ({
      ...prev,
      [name]: date,

    }));

  };

  const handleReset = () => {
    setPayload((prev) => ({ ...initialState, Centre: prev.Centre }));
    setTableData([]);
  };









  const getAllCentre = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetCentreById)
      .then((res) => {
        console.log("res", res?.data);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.centre,
          value: item?.centreid,
        }));
        setDropdownlist((prev) => ({ ...prev, centreList: resList }));
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, Centre: DefaultCentre ?? resList?.[0]?.value }));
          getMachineList(DefaultCentre || resList?.[0]?.value || "");
          getControlList(DefaultCentre || resList?.[0]?.value || "");
        }
        else {
          setPayload((prev) => ({ ...prev, Centre: resList?.[0]?.value }));
          getMachineList(resList?.[0]?.value);
          getControlList(resList?.[0]?.value);
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getMachineList = async (centreId) => {
    // console.log("centerid..............",centreId);
    setDropdownlist((prev) => ({ ...prev, machineList: [] }));
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindReportMachine, {
        centreId: centreId.toString(),
      })
      .then((res) => {
        console.log("res..........", res);
        if (res?.data?.success) {
          const resList = res?.data?.data?.map((item) => ({
            ...item,
            label: item?.MACHINEID,
            value: item?.MACHINEID,
          }));
          setDropdownlist((prev) => ({ ...prev, machineList: resList }));
          // setPayload((prev) => ({ ...prev, Machine: resList?.[0]?.label }));
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getControlList = async (centreID) => {

    setDropdownlist((prev) => ({ ...prev, controlList: [] }));
    dispatch(setLoading(true));
    await axiosInstance
      .post("QCValueEntryMicro/bind-control", { centre: centreID.toString() })
      .then((res) => {
        console.log("res..........", res);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.ControlName,
          value: item?.controlid,
        }));
        setDropdownlist((prev) => ({ ...prev, controlList: resList }));
        // setPayload((prev) => ({ ...prev, Control: resList?.[0]?.value }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };
  const getLabReport = async () => {
    if (!payload?.Machine) {
      toast.error("Please Select Machine");
      return
    }
    if (!payload?.Control) {
      toast.error("Please Select Controller");
      return
    }
    const apiPayload = {
      machineId: payload?.Machine?.toString() || "",
      labId: payload?.Centre?.toString() || "",
      controlId: payload?.Control?.toString() || "",
      fromDate: payload?.FromDate ? new Date(payload.FromDate).toISOString() : "",
      toDate: payload?.ToDate ? new Date(payload.ToDate).toISOString() : "",
    };
    dispatch(setLoading(true));
    await axiosReport
      .post("commonReports/QCMicroReport", apiPayload, {
        responseType: "blob",
      })
      .then((res) => {
        if (res?.data?.type === "application/json") {
          res.data.text().then((text) => {
            const errorData = JSON.parse(text);
            notify(errorData?.message || "No Report Found", "warning");
          });
          return;
        }
        const pdfBlob = new Blob([res.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
      })
      .catch((err) => {
        notify(err?.data?.message || "No Report Found", "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    getAllCentre();
  }, []);




  return (
    <>
      {/* {showMore && <QCFrameMenu />} */}
      <Heading
        name={"QC Report"}
        isBreadcrumb={"true"}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      />
      <div className="row">
        <ReactSelect
          name="Centre"
          id="Centre"
          removeIsClearable={true}
          dynamicOptions={dropdownlist.centreList}
          placeholderName="Centre"
          value={payload?.Centre}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
          isShowBorder={true}
        />

        <ReactSelect
          name="Machine"
          id="Machine"
          removeIsClearable={true}
          dynamicOptions={dropdownlist.machineList}
          placeholderName="Machine"
          value={payload?.Machine}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
          isShowBorder={true}
        />
        <ReactSelect
          name="Control"
          id="Control"
          removeIsClearable={true}
          dynamicOptions={dropdownlist.controlList}
          placeholderName="Control/Lot Number"
          value={payload?.Control}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
          isShowBorder={true}
        />
        <DatePicker
          name="FromDate"
          id="FromDate"
          value={payload?.FromDate}
          onChange={dateSelect}
          maxDate={new Date()}
          placeholder=""
          lable={t("From Date")}
          className="custom-calendar"
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
        />
        <DatePicker
          name="ToDate"
          id="ToDate"
          value={payload?.ToDate}
          onChange={dateSelect}
          maxDate={new Date()}
          minDate={payload?.FromDate}
          placeholder=""
          lable={t("To Date")}
          className="custom-calendar"
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
        />

        <CustomButton text="Get Report" className="mx-2 mb-1" icon="pdf"
          onClick={() => getLabReport()} />
        <CustomButton text="Reset" className="mx-2 mb-1" icon="refresh"
          onClick={handleReset} />


      </div>

    </>
  );
};

export default MicroQcReport;
