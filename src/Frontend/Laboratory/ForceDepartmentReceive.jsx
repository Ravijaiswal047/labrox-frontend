import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Time, getTrimmedData } from "../../utils/helpers";
import { defaultSearchTypes } from "../../utils/Constants";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import moment from "moment";
import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DepartmentReceiveTable from "../Table/DepartmentReceiveTable";
import { SearchButton } from "../../components/UI/CustomButton";

const ForceDepartmentReceive = () => {
  const [t] = useTranslation();
  const [RateTypes, setRateTypes] = useState([]);

  const [drdata, setDrData] = useState([]);
  const [searchstatus, setSearchStatus] = useState(2);
  const [saveTestId, setSaveTestId] = useState([]);
  const [load, setLoad] = useState(false);
  const [Identity, setIdentity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collecteddataexist, SetCollectedDataExist] = useState([]);

  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [organ, setOrgan] = useState([]);
  const [pageType, setpageType] = useState("");
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const today = new Date();
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: defaultSearchTypes || "",
    RefundFilter: null,
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    DoctorReferal: "",
    DepartmentID: "",
    DoctorName: "",
    SampleStatus: 2,
  });

  const totalPatient = () => {
    const visitNos = drdata?.map((item) => item?.VisitNo);
    const uniqueVisitNos = new Set(visitNos);
    return uniqueVisitNos?.size;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const SaveSampleReceiveDepartment = () => {
    const UpdateData = drdata?.filter((ele) =>
      ele?.IsChecked == 1 ? true : false,
    );
    const SaveData = UpdateData.map((item) => ({
      ...item,
      HistoCytoSampleDetail: `${item?.Container}^${item?.Slide}^${item?.Block}^`,
    }));
    if (UpdateData?.length > 0) {
      axiosInstance
        .post("/DepartmentReceive/SampleReceiveDepartment", {
          data: SaveData,
        })
        .then((res) => {
          toast.success(res.data.message);
          TableData("2");
          setDrData([]);
        })
        .catch((err) => {
          if (err.response.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response.status === 401) {
            toast.error(err.response.data.message);
          }
        });
    } else {
      toast.error("Please select atlease one item to continue");
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData(2);
    }
  };

  const TableData = (status) => {
    setpageType(status);

    setSearchStatus(status);

    setLoading(true);
    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });
    axiosInstance
      .post(
        "/DepartmentReceive/DepartmentReceive",
        getTrimmedData({
          CentreID: formData.CentreID ? [Number(formData.CentreID)] : [],
          SelectTypes: "BarcodeNo",
          ItemValue: formData.ItemValue.trim(),
          RateTypeID: formData?.RateTypeID
            ? [Number(formData?.RateTypeID)]
            : [],
          CollectionBoyID: 0,
          DoctorReferal: formData.DoctorReferal,
          FromDate: moment(formData.FromDatre).format("DD/MMM/YYYY"),
          ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
          FromTime: formData.FromTime,
          ToTime: formData.ToTime,
          DepartmentID: formData.DepartmentID
            ? [Number(formData.DepartmentID)]
            : [],
          SampleStatus: status,
        }),
      )
      .then((res) => {
        const data = res?.data?.message?.map((ele) => {
          return {
            ...ele,
            IsChecked: 0,
            Container:
              ele?.HistoCytoSampleDetail == ""
                ? "0"
                : ele?.HistoCytoSampleDetail?.split("^")?.[0],
            Slide:
              ele?.HistoCytoSampleDetail == ""
                ? "0"
                : ele?.HistoCytoSampleDetail?.split("^")?.[1],
            Block:
              ele?.HistoCytoSampleDetail == ""
                ? "0"
                : ele?.HistoCytoSampleDetail?.split("^")?.[2],
          };
        });
        setDrData(data);
        SetCollectedDataExist(res?.data?.message.some((v) => v.Status === 2));
        setLoad(true);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  const handleUploadCount = (name, value, secondName) => {
    let data = [...drdata];
    if (name === "UploadDocumentCount") {
      data[show?.index][name] = value;
      data[show?.index][secondName] = value === 0 ? 0 : 1;
      setDrData(data);
    } else {
      data[show4?.index][name] = value;
      data[show4?.index][secondName] = value === 0 ? 0 : 1;
      setDrData(data);
    }
  };

  const BindApprovalDoctor = () => {
    axiosInstance
      .get("CommonController/BindApprovalDoctor")
      .then((res) => {
        let data = res.data.message;
        let doctorData = data.map((ele) => {
          return {
            value: ele?.employeeid,
            label: ele?.name,
          };
        });
        doctorData.unshift({ label: "Select Doctor", value: "" });

        setDoctorAdmin(doctorData);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    BindApprovalDoctor();
    //   getDepartment();
    //   getPaymentModes("Identity", setIdentity);
    //   getCollectionBoy(setCollectionBoyList, true);
  }, []);
  return (
    <>
      {/* <Heading isBreadcrumb={true} name="DepartmentReceive" /> */}
      <Accordion
        name={t("Force Department Receive")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <Accordion
          defaultValue={true}
          title={t("Department Receive Details")}
        />
        <div className="row pt-2 pl-2 pr-2"></div>
        <div className="row pt-1 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              onKeyDown={handleKeyDown}
              type="text"
              name="ItemValue"
              lable={"Barcode No."}
              max={20}
              value={formData.ItemValue}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => TableData(2)}
            />
          </div>
        </div>
      </Accordion>
      {show4?.modal && (
        <MedicialModal
          show={show4.modal}
          handleClose={() => {
            setShow4({
              modal: false,
              data: "",
              index: -1,
            });
          }}
          MedicalId={show4?.data}
          handleUploadCount={handleUploadCount}
        />
      )}

      {show?.modal && (
        <UploadFile
          show={show?.modal}
          handleClose={() => {
            setShow({ modal: false, data: "", index: -1 });
          }}
          options={Identity}
          documentId={show?.data}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
        />
      )}
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : load ? (
          <>
            <DepartmentReceiveTable
              drdata={drdata}
              setSaveTestId={setSaveTestId}
              saveTestId={saveTestId}
              show={setShow4}
              show2={setShow}
              TableData={TableData}
              setDrData={setDrData}
              pageType={pageType}
              organ={organ}
              doctorAdmin={doctorAdmin}
              formData={formData}
              searchstatus={searchstatus}
            />
            <div className="row mb-2" style={{ float: "right" }}>
              {drdata.length > 0 &&
                (searchstatus == "2" || collecteddataexist) && (
                  <div className="col-sm-1 ms-auto">
                    <button
                      className="btn btn-info btn-sm mx-2"
                      onClick={() => SaveSampleReceiveDepartment()}
                    >
                      {t("Receive")}
                    </button>
                  </div>
                )}
            </div>
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default ForceDepartmentReceive;
