import React, { useEffect, useState } from "react";
import ExcelPreviewHandler from "./ExcelPreviewHandler";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import { notify } from "../../../utils/utils";
import { ExportToExcel } from "../../../utils/helpers";
import {
  setImportExcelData,
  setLoading,
} from "../../../store/reducers/loadingSlice/loadingSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const ExcelUploadModal = () => {
  const dispatch = useDispatch();
  const { importExcelData } = useSelector((data) => data?.loadingSlice);
  const downloadOptList = [
    { label: "InvestigationWise", value: "InvestigationWise" },
    { label: "RateTypeWise", value: "RateTypeWise" },
  ];
  const [t] = useTranslation();
  const initPayload = {
    downlaodOption: downloadOptList[0]?.value,
    rateList: "",
    Investigation: "",
  };
  const [payload, setPayload] = useState(initPayload);
  const [dropdownList, setDropdownList] = useState({
    rateTypeList: [],
    investigationList: [],
  });

  const handleReactChange = (name, e) => {
    if (name == "downlaodOption") {
      // e?.value == '1' && getInvestigations()
    }
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const getRateCenters = () => {
    axiosInstance
      .get(apiUrls?.getRateList)
      .then((res) => {
        let data = res.data.message;

        let resRateTypeList = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setDropdownList((prev) => ({ ...prev, rateTypeList: resRateTypeList }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getInvestigations = async () => {
    await axiosInstance
      .get(apiUrls?.BindInvestigationList)
      .then((res) => {
        const invResLIst = res?.data?.message?.map((item, _) => ({
          label: item?.TestName,
          value: String(item?.InvestigationID),
        }));
        setDropdownList((prev) => ({ ...prev, investigationList: invResLIst }));
      })
      .catch((err) => console.log(err))
      .finally(() => {});
  };

  const getDownloadExcelData = async () => {
  if (!payload?.downlaodOption) {
    notify("Kinldy Select Download Option", "warn");
    return;
  }
  if (payload?.downlaodOption == "RateTypeWise" && !payload?.rateList) {
    notify("Kinldy Select RateList", "warn");
    return;
  }
  if (payload?.downlaodOption !== "RateTypeWise" && !payload?.Investigation) {
    notify("Kinldy Select Investigation", "warn");
    return;
  }

  const rateListPayload = {
    typeName: payload?.downlaodOption,
    typeID:
      payload?.downlaodOption == "RateTypeWise"
        ? payload?.rateList
        : payload?.Investigation,
  };

  dispatch(setLoading(true));

  await axiosInstance
    .post(apiUrls?.GetRateListWithType, rateListPayload)
    .then((res) => {
      if (Array.isArray(res?.data?.message)) {
        let selectedLabel = "";

        if (payload?.downlaodOption === "RateTypeWise") {
          selectedLabel =
            dropdownList?.rateTypeList?.find(
              (item) => item.value === payload?.rateList
            )?.label || "RateType";
        } else {
          selectedLabel =
            dropdownList?.investigationList?.find(
              (item) => item.value === payload?.Investigation
            )?.label || "Investigation";
        }

        let fileName = selectedLabel;
        fileName = fileName.replace(/\s+/g, "-");
        fileName = fileName.replace(/[^a-zA-Z0-9-]/g, "");
        fileName = fileName.replace(/-+/g, "-");
        fileName = fileName.replace(/^-+|-+$/g, "");
        fileName = `${fileName}.xlsx`;

        ExportToExcel(res?.data?.message, fileName);
        notify("Download successfully.", "success");
        return;
      }

      notify(res?.data?.message, "error");
    })
    .catch((err) => console.log(err))
    .finally(() => {
      dispatch(setLoading(false));
    });
};

  const saveImported = async () => {
  if (importExcelData?.length === 0) {
    notify("Kindly import excel data", "warn");
    return;
  }

  dispatch(setLoading(true));

  try {
    const res = await axiosInstance.post(apiUrls?.SaveRateList, {
      data: importExcelData,
    });

    notify(res?.data?.message || "Excel uploaded successfully", "success");

    dispatch(setImportExcelData([]));
    setPayload(initPayload);

  } catch (err) {
    console.log("err", err);
    notify(err?.response?.data?.message || "Upload failed", "error");
  } finally {
    dispatch(setLoading(false));
  }
};

  useEffect(() => {
    getRateCenters();
    getInvestigations();
  }, []);

  return (
    <>
      <div className="importInHouseDoctorModal_main row mt-2">
        <div className="col-sm-3 col-md-3">
          <ReactSelect
            dynamicOptions={downloadOptList}
            isShowBorder={true}
            name="downlaodOption"
            lable={t("Download Option")}
            id="downlaodOption"
            removeIsClearable={false}
            placeholderName={t("Download Option")}
            value={payload?.downlaodOption}
            onChange={handleReactChange}
            className="required-fields"
          />
        </div>
        {payload?.downlaodOption !== "RateTypeWise" && (
          <div className="col-sm-3 col-md-3">
            <ReactSelect
              dynamicOptions={dropdownList?.investigationList}
              id="Investigation"
              placeholderName="Investigation"
              name="Investigation"
              value={payload?.Investigation}
              onChange={handleReactChange}
              searchable={true}
              removeIsClearable={true}
            />
          </div>
        )}
        {payload?.downlaodOption == "RateTypeWise" && (
          <div className="col-sm-3 col-md-3">
            <ReactSelect
              dynamicOptions={dropdownList?.rateTypeList}
              id="RateType"
              placeholderName={t("Rate Type")}
              name="rateList"
              value={payload?.rateList}
              onChange={handleReactChange}
              searchable={true}
              removeIsClearable={true}
            />
          </div>
        )}
        <div style={{ gap: "4px" }} className="d-flex align-items-center">
          <Button onClick={getDownloadExcelData} className="rounded">
            Download Template
          </Button>
        </div>
        <div
          style={{ gap: "4px" }}
          className="d-flex justify-content-end align-items-center grow mx-2"
        >
          <ExcelPreviewHandler />
        </div>
      </div>
      <div>
        {/* table  */}
      </div>

      <div
        style={{ gap: "4px" }}
        className="d-flex border-top py-2 mt-2 justify-content-center align-items-center"
      >
        <Button onClick={saveImported} className="rounded px-4">
          Save
        </Button>
      </div>
    </>
  );
};

export default ExcelUploadModal;
