import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import Accordion from "../../../components/UI/Accordion";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import DatePicker from "../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import { useDispatch } from "react-redux";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";
import moment from "moment";
import { toast } from "react-toastify";
import { getSearchController } from "../../../utils/NetworkApi/commonApi";

const DcrReports = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  //   const [load, setLoad] = useState(false);
  const [BindFor, setBindFor] = useState([]);

  const [formData, setFormData] = useState({
    employeeId: "",
    fromDate: new Date(),
    toDate: new Date(),
    ReportType: "0",
    isChecked_NotDone: 0,
  });

  console.log(formData);

  const reportList = [
    { label: "Detail", value: "0" },
    { label: "Summary", value: "1" },
    { label: "PDF", value: "2" },
  ];

  const handleReactChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
  };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckChange = (name, e) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.checked ? 1 : 0,
    }));
  };

  const handleChanges = (select, name) => {
    const val = select.map((ele) => {
      return ele?.value;
    });

    setFormData({ ...formData, [name]: val });
  };

  const getBindCreatedForDropDown = () => {
    axiosInstance
      .get("SalesFunnel/BindCreatedFor" ,{
        params: {
          bindfor: "mslmaster",
        },
      })
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.CreatedFor,
            label: ele?.CreatedForName,
          };
        });
        setBindFor(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const isJsonResponse = (buffer) => {
    try {
      const text = new TextDecoder("utf-8").decode(buffer);
      const json = JSON.parse(text);
      return json;
    } catch {
      return null;
    }
  };

  const getDcrReport = async () => {
    try {
      dispatch(setLoading(true));

      const reportType = formData?.ReportType;

      // RULE BASED DECISION
      const isExcel = reportType === "0" || reportType === "1";
      const isPdf = reportType === "2";

      const getPayload = {
        Fromdate: moment(formData?.fromDate).format("YYYY-MM-DD"),
        Todate: moment(formData?.toDate).format("YYYY-MM-DD"),
        EmployeeId: formData?.employeeId?.map(Number),
        ReportType: reportType,
        isChecked_NotDone: String(formData?.isChecked_NotDone),
      };

      const res = await axiosInstance.post(
        "SalesFunnel/DailyCallReport",
        getPayload,
        {
          responseType: isExcel || isPdf ? "arraybuffer" : "json",
        },
      );

      const jsonResponse = isJsonResponse(res.data);

      if (jsonResponse && jsonResponse.success === false) {
        toast.warning(jsonResponse.message);
        return;
      }

      // ================= PDF (OPEN IN NEW TAB) =================
      if (isPdf) {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        window.open(url, "_blank");
        return;
      }

      // ================= EXCEL (DOWNLOAD) =================
      if (isExcel) {
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download =
          reportType === "0"
            ? "DCR_Detail_Report.xlsx"
            : "DCR_Summary_Report.xlsx";

        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getBindCreatedForDropDown();
  }, []);

  return (
    <>
      <Accordion
        name={t("DailyCallReports")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <DatePicker
              name="fromDate"
              value={formData?.fromDate}
              className="custom-calendar"
              placeholder=" "
              id="fromDate"
              lable="fromDate"
              onChange={dateSelect}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              name="toDate"
              value={formData?.toDate}
              className="custom-calendar"
              placeholder=" "
              id="toDate"
              lable="ToDate"
              onChange={dateSelect}
            />
          </div>
          <div className="col-sm-2">
            {/* <ReactSelect
              //   autoSelectFirst={true}
              dynamicOptions={[{ label: "Select", value: "" }, ...BindFor]}
              name="employeeId"
              placeholderName={"Employee"}
              id="employeeId"
              lable={t("Employee")}
              value={formData?.employeeId}
              onChange={handleReactChange}
            /> */}
            <SelectBoxWithCheckbox
              name="employeeId"
              placeholder=" "
              lable={t("Employee")}
              id="employeeId"
              options={BindFor}
              value={formData?.employeeId}
              onChange={handleChanges}
              className="required-fields"
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[{ label: "Select", value: "" }, ...reportList]}
              name="ReportType"
              placeholderName={"Report Type"}
              id="ReportType"
              lable={t("Report Type")}
              value={formData?.ReportType}
              onChange={handleReactChange}
            />
          </div>
          <div className="mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="isChecked_NotDone"
                id="isChecked_NotDone"
                placeholder=""
                checked={formData?.isChecked_NotDone}
                onChange={(e) => handleCheckChange("isChecked_NotDone", e)}
              />
            </div>
            <label className="ml-2" htmlFor="isChecked_NotDone">
              {t("Call Not Done")}
            </label>
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-4  d-flex justify-content-start"
          >
            <Button className="rounded" onClick={getDcrReport}>
              Report
            </Button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DcrReports;
