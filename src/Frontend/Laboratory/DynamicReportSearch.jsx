import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import { getTrimmedData } from "../../utils/helpers";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import DynamicLabReportSearchTable from "../Table/DynamicLabReportSearchTable";

const DynamicReportSearch = () => {
  const [dispatchData, setDispatchData] = useState([]);
  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [Identity, setIdentity] = useState([]);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    LabNo: "",
  });

  function createCheckbox(item) {
    if (item.status == 5 || item.status == 6) {
      return `<input type=\"checkbox\" onchange={handleCheck}  value=\"${item.TestIdHash}\" id=\"${item.LedgerTransactionID}\" class=${item.LedgerTransactionID} />`;
    } else {
      return "";
    }
  }

  function modifyArray(dataArray) {
    let modifiedArray = [];
    let tempObject = {};

    dataArray.forEach((item) => {
      if (tempObject[item.LedgerTransactionID]) {
        tempObject[item.LedgerTransactionID].Test += `<p class="round Status-${
          item.status
        }">${createCheckbox(item)}${item.Test}</p>`;
      } else {
        tempObject[item.LedgerTransactionID] = { ...item };
        tempObject[item.LedgerTransactionID].Test = `<p class="round Status-${
          item.status
        }">${createCheckbox(item)}${item.Test}</p>`;
      }
    });

    for (let key in tempObject) {
      modifiedArray.push(tempObject[key]);
    }

    return modifiedArray;
  }

  useEffect(() => {
    getPaymentModes("Identity", setIdentity);
  }, []);
  const { t } = useTranslation();

  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const handleUploadCount = (name, value, secondName) => {
    let data = [...dispatchData];
    if (name === "UploadDocumentCount") {
      data[show?.index][name] = value;
      data[show?.index][secondName] = value === 0 ? 0 : 1;
      setDispatchData(data);
    } else {
      data[show4?.index][name] = value;
      data[show4?.index][secondName] = value === 0 ? 0 : 1;
      setDispatchData(data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const TableData = () => {
    if (formData?.LabNo.trim() != "") {
      setLoading(true);
      axiosInstance
        .post(
          "Dispatch/DynamicLabSearch",
          getTrimmedData({
            LabNo: formData.LabNo.trim(),
          }),
        )
        .then((res) => {
          if (
            Array.isArray(res?.data?.message) &&
            res?.data?.message.length > 0
          ) {
            const response = res?.data?.message;
            const datas = response?.map((ele) => {
              return {
                ...ele,
                Test: ele?.TestName,
                status: ele?.Status,
                TestIdHash: ele?.TestIDHash,
              };
            });
            const Finaldata = modifyArray(datas);
            setDispatchData(Finaldata);
            setLoad(true);
          } else {
            toast.error(res?.data?.message);

            setDispatchData([]);
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
          setDispatchData([]);
        });
    } else {
      toast.error("Visit No./BarCodeNo Is Required");
    }
  };
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData();
    }
  };
  return (
    <>
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
      <Accordion
        name={"Dynamic Report Search"}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-3">
            <Input
              onChange={handleChange}
              value={formData?.LabNo}
              name="LabNo"
              className="required-fields"
              type="text"
              onKeyDown={handleKeyDown}
              placeholder=""
              lable="Visit No./BarCodeNo"
              id="Visit No"
            />
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-info btn-block btn-sm"
              onClick={() => TableData()}
            >
              {t("Search")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : load ? (
          <>
            <DynamicLabReportSearchTable
              dispatchData={dispatchData}
              show={setShow4}
              show2={setShow}
            />
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default DynamicReportSearch;
