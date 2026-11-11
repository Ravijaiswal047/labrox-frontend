import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import { getTrimmedData, shouldIncludeAIIMSID } from "../../utils/helpers";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import DynamicLabSearchTable from "../Table/DynamicLabSearchTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { useLocation, useSearchParams } from "react-router-dom";
import { SearchButton } from "../../components/UI/CustomButton";
import DynamicLabSearchTableNew from "../Table/DynamicLabSearchTableNew";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const DynamicLabSearch = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const labNoData = searchParams.get("data");
  const [dispatchData, setDispatchData] = useState([]);
  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const userData = useLocalStorage("userData", "get");
  const [showNewTable] = useState(userData?.DispatchScreenTableUI == "1");
  const [Identity, setIdentity] = useState([]);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ LabNo: "" });
  const { t } = useTranslation();
  function createCheckbox(item) {
    if (item.status == 5 || item.status == 6) {
      return `<input type=\"checkbox\" onchange={handleCheck}  value=\"${item.TestIdHash}\" id=\"${item.LedgerTransactionID}\" class=${item.LedgerTransactionID} />`;
    } else {
      return "";
    }
  }

  function isBarcodeExists(list, barcode) {
    return list.some(item => item.BarcodeNo === barcode);
  }

  function modifyArray(dataArray) {
    console.log("dataArray",dataArray);
    let modifiedArray = [];
    let tempObject = {};

    dataArray.forEach((item) => {

      const hasPackage =
      item.PackageName && item.PackageName !== "-" && item.packagecode;

      const barcodeInfo = {
            BarcodeNo: item?.SinNo,
            SampleName: item?.SampleName || ""
        };

      if (tempObject[item.LedgerTransactionID]) {
        tempObject[item.LedgerTransactionID].Test += `<p class="round Status-${
          item.status
        }">${createCheckbox(item)}${item.Test}</p>`;

        if (!tempObject[item.LedgerTransactionID].PliDataList) {
          tempObject[item.LedgerTransactionID].PliDataList = [];
        }
        
        // if (item.SinNo) {
        //   tempObject[item.LedgerTransactionID].PliDataList.push(barcodeInfo);
        // }

          tempObject[item.LedgerTransactionID].PliDataList.push({
            ...item,
            BarcodeNo: item?.SinNo,
            SampleName: item?.SampleName || ""
          });
        
        tempObject[item.LedgerTransactionID].IsCulture += `${item.IsCulture}#`;
        const remarksList = JSON.parse(item.RemarksList || "[]");
        tempObject[item.LedgerTransactionID].RemarksList = [
                ...tempObject[item.LedgerTransactionID].RemarksList,
                ...remarksList
            ];
        tempObject[item.LedgerTransactionID].LabRemarkCount += item.LabRemarkCount || 0;

        if (!tempObject[item.LedgerTransactionID]._packageTests) tempObject[item.LedgerTransactionID]._packageTests = {};
        if (!tempObject[item.LedgerTransactionID]._noPackageTests) tempObject[item.LedgerTransactionID]._noPackageTests = [];
        
        if (!item.TestName || item.TestName.trim() === "") return;
        if (hasPackage) {
          if (!tempObject[item.LedgerTransactionID]._packageTests[item.packagecode]) {
            tempObject[item.LedgerTransactionID]._packageTests[item.packagecode] = {
              packageName: item.PackageName,
              tests: []
            };
          }
          tempObject[item.LedgerTransactionID]._packageTests[item.packagecode].tests.push(item);
        } else {
          tempObject[item.LedgerTransactionID]._noPackageTests.push(item);
        }
      } else {
        tempObject[item.LedgerTransactionID] = { ...item };

        tempObject[item.LedgerTransactionID].PliDataList = [];
        // if (item.SinNo) {
        //   tempObject[item.LedgerTransactionID].PliDataList.push({
        //     BarcodeNo: item.SinNo,
        //     SampleName: item.SampleName || ""
        //   });
        // }

        tempObject[item.LedgerTransactionID].PliDataList.push({
          ...item,
          BarcodeNo: item.SinNo,
          SampleName: item.SampleName || ""
        });

        tempObject[item.LedgerTransactionID].Test = `<p class="round Status-${
          item.status
        }">${createCheckbox(item)}${item.Test}</p>`;

        tempObject[item.LedgerTransactionID].IsCulture = `${item.IsCulture}#`;
        tempObject[item.LedgerTransactionID].RemarksList = JSON.parse(item.RemarksList || "[]");
        tempObject[item.LedgerTransactionID].LabRemarkCount= item.LabRemarkCount || 0;

        tempObject[item.LedgerTransactionID].FinalTest = "";
        tempObject[item.LedgerTransactionID]._packageTests = {};
        tempObject[item.LedgerTransactionID]._noPackageTests = [];

        const hasPackage = item.PackageName && item.PackageName !== "-" && item.packagecode;
        if (hasPackage) {
          tempObject[item.LedgerTransactionID]._packageTests[item.packagecode] = {
            packageName: item.PackageName,
            tests: [item]
          };
        } else {
          tempObject[item.LedgerTransactionID]._noPackageTests.push(item);
        }

      }
    });

    for (let key in tempObject) {
      const entry = tempObject[key];

    // 1️⃣ Tests without package first
    entry._noPackageTests.forEach((test) => {
      entry.FinalTest += `<p class="round Status-${test.status}">${createCheckbox(test)}${test.Test}</p>`;
    });

    // 2️⃣ Grouped packages
    for (let pkgCode in entry._packageTests) {
      const pkg = entry._packageTests[pkgCode];
      entry.FinalTest += `<p class="round"><strong>${pkg.packageName}</strong></p>`; // package header
      pkg.tests.forEach((test) => {
        entry.FinalTest += `<p class="round Status-${test.status}" style="margin-left:16px">${createCheckbox(test)}${test.Test}</p>`; // tests under package
      });
    }

    // Cleanup temporary objects
    delete entry._packageTests;
    delete entry._noPackageTests;
      modifiedArray.push(tempObject[key]);
    }

    return modifiedArray;
  }

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

  const TableData = useCallback((status, labno) => {
    
    const searchNo = labno ? labno.trim() : formData?.LabNo ? formData.LabNo.trim() : "";
    
    if (!searchNo || searchNo?.length <= 4) {
      // toast.error("Please enter valid Visit No/Barcode No.");
      return;
    }
    setLoading(true);
    axiosInstance
      .post(
        "Dispatch/DynamicLabSearch",
        getTrimmedData({
          LabNo: searchNo,
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
  }, []);

  useEffect(() => {
    getPaymentModes("Identity", setIdentity);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const searchVal = event.data.visitNo || labNoData;
      if (searchVal) {
        setFormData({ LabNo: searchVal });
        TableData("", searchVal);
      }
    };

    window.addEventListener("message", handleMessage);

    // Notify parent that listener is ready
    window.opener?.postMessage({ listenerReady: true }, window.location.origin);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const incomingData = labNoData || location.state?.data;
    if (incomingData) {
      setFormData({ LabNo: incomingData });
      TableData("", incomingData);
    }
  }, [labNoData, location.state]);

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
        name={t("Dynamic Lab Search")}
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
              placeholder=""
              lable={
                shouldIncludeAIIMSID()
                  ? t("VisitNo / BarcodeNo / CrNo / Mobile")
                  : t("VisitNo / BarcodeNo / Mobile")
              }
              id="Visit No"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const labno = formData?.LabNo?.trim();
                  if (labno && labno.length >= 3) {
                    TableData("", labno);
                  } else {
                    toast.error("Please enter valid search term.");
                  }
                }
              }}
            />
          </div>
          <div className="col-sm-1">
            <SearchButton
                text={"Search"}
                onClick={() => {              
                  const labno = formData?.LabNo?.trim();  
                  if (labno && labno.length >= 3) {
                    TableData("", labno);  
                  } else {
                    toast.error("Please enter valid search term.");
                  }
                }}
            />
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        seconTitle={
          <div className="ml-auto d-flex align-items-center mt-1 px-2">
          </div>
        }
      >
        {loading ? (
          <Loading />
        ) : load ? (
          <>
            {showNewTable ? (
              <DynamicLabSearchTableNew
                dispatchData={dispatchData}
                show={setShow4}
                show2={setShow}
                TableData={TableData}
                labNo={formData?.LabNo}
              />
            ) : (
              <DynamicLabSearchTable
                dispatchData={dispatchData}
                show={setShow4}
                show2={setShow}
                TableData={TableData}
                labNo={formData?.LabNo}
              />
            )}
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default DynamicLabSearch;
