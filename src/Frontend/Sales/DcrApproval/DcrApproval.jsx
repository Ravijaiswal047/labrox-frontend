import { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Loading from "../../../components/loader/Loading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Tables from "../../../components/UI/customTable";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import { Button } from "react-bootstrap";
import DatePicker from "../../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";
import Heading from "../../../components/UI/Heading";
import moment from "moment";
import DcrRejectReasonModal from "./DcrRejectReasonModal";
import { SalesConvertedOptions } from "../../../utils/Constants";

const DcrApproval = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [BindFor, setBindFor] = useState([]);
  const [TableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsConverted, setSelectedRowsConverted] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    fromDate: new Date(),
    toDate: new Date(),
  });

  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1
  })
  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectMultiChange = (select, name) => {
    const val = select.map((ele) => {
      return ele?.value;
    });
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const getBindCreatedForDropDown = () => {
    axiosInstance
      .get("SalesFunnel/BindCreatedFor", {
        params: {
          bindfor: "mslapprove",
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

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = TableData.map((row) => row.DCRId);
      const ConvertedData = TableData.map((row) => row.SalesConverted);
      setSelectedRows(allIds);
      setSelectedRowsConverted(ConvertedData)
    } else {
      setSelectedRows([]);
      setSelectedRowsConverted([]);
    }
  };

  const handleRowCheck = (row) => {
    const key = row?.DCRId;
    const converted = row?.SalesConverted;

    setSelectedRows((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
    setSelectedRowsConverted((prev) =>
      prev.includes(converted) ? prev.filter((id) => id !== converted) : [...prev, converted]
    );

  };

  const handleSearch = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.post("SalesFunnel/DcrSearch", {
        fromDate: moment(formData.fromDate).format("YYYY-MM-DD"),
        toDate: moment(formData.toDate).format("YYYY-MM-DD"),
        employeeIds: formData.employeeId.map(String),
      });
      console.log(res);
      setTableData(res?.data?.success ? res.data.data : []);
      setLoad(false);
    } catch (err) {
      console.log(err);
      setTableData([]);
      setLoad(false);
    }
  };

  const handleApproveReject = async (reject = false) => {
    const filteredData = TableData.filter((ele) => ele.Print === 1);
    if (filteredData.length === 0) {
      toast.warn("Please select Any Row");
      return;
    }

    const requstBody = filteredData.map((row) => ({
      ids: row.DCRId,
      IsConverted: Number(row.SalesConverted),
    }));

    try {
      setLoad(true);

      const res = await axiosInstance.post("SalesFunnel/DcrApprove", requstBody);

      if (res?.data?.success) {
        toast.success(res?.data?.message);
        // setSelectedRows([]);
        setLoad(false);
        handleSearch();
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("Something went wrong"));
    } finally {
      setLoad(false);
    }
  };

  const handleCheckboxSingle = (e, index) => {
    const { name, checked } = e.target;
    const datas = [...TableData];
    datas[index][name] = checked ? 1 : 0;
    setTableData(datas);
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    const data = TableData?.map((ele) => {
      let updated = {
        ...ele,
        [name]: checked ? 1 : 0,
      };
      return updated;
    });
    setTableData(data);
  };
  useEffect(() => {
    getBindCreatedForDropDown();
  }, []);
console.log({TableData})
  return (
    <>
      {show?.modal &&
        <DcrRejectReasonModal
          show={show?.modal}
          handleClose={() =>
            setShow({ modal: false, data: "", index: -1 })
          }
          state={TableData}
          title={"Reject Remark"}
          TableData={handleSearch}
          PageName={TableData}
        />

      }
      <Accordion
        name={t("DCR Approval")}
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
            <SelectBoxWithCheckbox
              // autoSelectFirst={true}
              options={BindFor}
              name="employeeId"
              placeholderName="Employee"
              value={formData?.employeeId}
              onChange={handleSelectMultiChange}
            />
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            {load ? (
              <Loading />
            ) : (
              <Button className="rounded" onClick={handleSearch}>
                Search
              </Button>
            )}
          </div>
          {formData?.employeeId && <><div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            {load ? (
              <Loading />
            ) : (
              <Button className="rounded" onClick={() => handleApproveReject()}>
                Approve
              </Button>
            )}
          </div>  <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
              {load ? (
                <Loading />
              ) : (
                <Button
                  className="rounded"
                    onClick={() => {
                      const filteredData = TableData.filter((ele) => ele.Print === 1);
                      if (filteredData.length === 0) {
                        toast.warn("Please select Any Row");
                        return;
                      }
                      setShow({
                        modal: true,
                        data: formData,
                        index: -1,
                      })

                    }}
                  >
                  Reject
                </Button>
              )}
            </div></>
          }


        </div>
        <Heading title={t("DCR-List")} />
        <Tables>
          <thead>
            <tr>
              <th style={{ width: "2%" }}>{t("S No.")}</th>
              <th>{t("Employee")}</th>
              <th>{t("Client / Doctor")}</th>
              <th>{t("Tagged With")}</th>
              <th>{t("Meeting")}</th>
              <th>{t("MOM")}</th>
              <th>{t("Remarks")}</th>
              <th>{t("SalesConverted")}</th>
              <th style={{ width: "2%" }}>
                {/* <input
                  type="checkbox"
                  checked={
                    TableData.length > 0 &&
                    selectedRows.length === TableData.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                /> */}
                <input
                  type="checkbox"
                  name="Print"
                  checked={
                    TableData.length > 0 &&
                    TableData.every((item) => item.Print === 1)
                  }
                  onChange={handleCheckbox}
                />
              </th>
            </tr>
          </thead>
          {TableData.length > 0 ? (
            TableData.map((ele, index) => (
              <tbody key={index}>
                <tr>
                  <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                  <td data-title={t("Employee")}>{ele?.CreatedBy}</td>
                  <td data-title={t("Client / Doctor")}>{ele?.DoctorName}</td>
                  <td data-title={t("Tagged With")}>{ele?.CentreName}</td>
                  <td data-title={t("Meeting")}>{ele?.IsMeeting}</td>
                  <td data-title={t("MOM")}>{ele?.MOM}</td>
                  <td data-title={t("Remarks")}>{ele?.Remarks}</td>
                  <td data-title={t("SalesConverted")}>
                    <ReactSelect
                      dynamicOptions={SalesConvertedOptions}
                      name="SalesConverted"
                      lable={t("SalesConverted")}
                      id="SalesConverted"
                      removeIsClearable={true}
                      // placeholderName={t("SalesConverted")}
                      value={ele?.SalesConverted}
                      onChange={(label, value) => {
                        setTableData((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, [label]: value?.value } : r,
                          ),
                        );
                      }}
                    />
                  </td>
                  <td data-title={t("Action")}>
                    {/* <input
                      type="checkbox"
                      checked={selectedRows.includes(ele.DCRId)}
                      onChange={() => handleRowCheck(ele)}
                    /> */}
                    <input
                      type="checkbox"
                      checked={ele?.Print === 1}
                      name="Print"
                      onChange={(e) =>
                        handleCheckboxSingle(e, index)
                      }
                    />
                  </td>
                </tr>
              </tbody>
            ))
          ) : (
            <tbody>
              <tr>
                <td colSpan={17} className="text-center">
                  <NoRecordFound />
                </td>
              </tr>
            </tbody>
          )}
        </Tables>
      </Accordion>
    </>
  );
};

export default DcrApproval;
