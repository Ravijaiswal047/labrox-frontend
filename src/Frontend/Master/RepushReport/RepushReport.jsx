import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
// import AnimatedPage from "../../../routes/AnimatedPage ";
import Loading from "../../../components/loader/Loading";
import DataTable from "./RepushTable";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { SelectBox } from "../../../components/formComponent/SelectBox";
import Pagination from "../../../Pagination/Pagination";
import { Record } from "../../../utils/Constants";

const RepushReport = () => {
  const { t } = useTranslation();

  const [selected, setSelected] = useState("CDAC");
  const [load, setLoading] = useState(false);
  const [allData, setAllData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  // pagination
  const [first] = useState(0);

  const buttons = [
    { id: "cdac", label: "CDAC" },
    { id: "ftp", label: "FTP" },
    { id: "raipur", label: "Raipur" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/CRMIntegration/Failedsenddata");
      setAllData(res.data.message);
      console.log(res.data.message.raipur, "here is the data ");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTableData = () => {
    if (!allData) return [];

    let rawData = [];
    switch (selected) {
      case "CDAC":
        rawData =
          allData.cdac?.map((item, idx) => ({
            id: item.TestId,
            sr: first + idx + 1,
            ...item,
          })) || [];
        break;
      case "FTP":
        rawData =
          allData.ftp?.map((item, idx) => ({
            id: item.LedgerTransactionid,
            sr: first + idx + 1,
            ...item,
          })) || [];
        break;
      case "Raipur":
        rawData =
          allData.raipur?.map((item, idx) => ({
            id: item.testid,
            sr: first + idx + 1,
            ...item,
          })) || [];
        break;
      default:
        rawData = [];
    }

    return rawData;
  };

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const tableData = getTableData();

  const firstIndex = (currentPage - 1) * pageSize;

  const lastIndex = firstIndex + pageSize;
  const paginatedData =
    pageSize === tableData.length
      ? tableData
      : tableData.slice(firstIndex, lastIndex);

  const getColumns = () => {
    switch (selected) {
      case "CDAC":
        return [
          { key: "sr", label: "S.no" },
          { key: "TestId", label: "Test Id" },
          { key: "LedgerTransactionNo", label: "Lab No" },
          { key: "hmis_patCrNo", label: "hmis_patCrNo" },
        ];
      case "FTP":
        return [
          { key: "sr", label: "S.no" },
          { key: "LedgerTransactionNo", label: "Lab No" },
          { key: "PName", label: "Patient Name" },
          { key: "LedgerTransactionid", label: "Transaction Id" },
        ];
      case "Raipur":
        return [
          { key: "sr", label: "S.no" },
          { key: "testid", label: "Test Id" },
          { key: "reason", label: "Reason" },
        ];
      default:
        return [];
    }
  };

  const getCheckboxKey = () => {
    switch (selected) {
      case "CDAC":
        return "Issendcdac";
      case "FTP":
        return "Issendftp";
      case "Raipur":
        return "Issendraipur";
      default:
        return "";
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      let payload = {};

      switch (selected) {
        case "CDAC":
          payload = {
            type: "Cdac",
            TestId: selectedRows.map((row) => row.TestId),
            LedgerTransactionId: [],
          };
          break;

        case "FTP":
          payload = {
            type: "Ftp",
            LedgerTransactionId: selectedRows.map(
              (row) => row.LedgerTransactionid,
            ),
            TestId: [],
          };
          break;

        case "Raipur":
          payload = {
            type: "RaipurJson",
            TestId: selectedRows.map((row) => row.testid),
            LedgerTransactionId: [],
          };
          break;

        default:
          break;
      }

      const res = await axiosInstance.post(
        "/CRMIntegration/RePushFaileddata",
        payload,
      );

      if (res.data?.success) {
        toast.success(res.data.message);
        setSelectedRows([]);
        fetchData();
      } else {
        toast.error("Update failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Accordion
        name={t("Report Repush")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
          {buttons.map((btn) => (
            <button
              key={btn.id}
              className={`col-sm-2 btn h-100 ml-2 mr-2 ${
                selected === btn.label ? "btn-primary" : "btn-info"
              }`}
              onClick={() => {
                setSelected(btn.label);
                setSelectedRows([]);
              }}
              disabled={selected === btn.label}
            >
              {t(btn.label)}
            </button>
          ))}
        </div>
      </Accordion>

      <Accordion title={t(selected)} defaultValue={true}>
        {/* <AnimatedPage> */}
        <DataTable
          columns={getColumns()}
          data={paginatedData}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          checkboxKey={getCheckboxKey()}
          first={first}
        />
        {tableData?.length > 0 && (
          <>
            <div className="row ml-2">
              <div className="col-sm-1 p-2">
                {load ? (
                  <Loading />
                ) : (
                  <button
                    className="btn btn-block btn-success btn-sm"
                    onClick={handleUpdate}
                  >
                    {t("Update")}
                  </button>
                )}
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-end">
              <label className="mt-4 mx-2">{t("No Of Record/Page")}</label>
              <SelectBox
                className="mt-3 p-1 RecordSize mr-2"
                selectedValue={pageSize}
                options={[
                  { label: "All", value: tableData?.length },
                  ...Record,
                ]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPageSize(value);
                  setCurrentPage(1);
                }}
              />

              <Pagination
                currentPage={currentPage}
                totalCount={tableData?.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
        {/* </AnimatedPage> */}
      </Accordion>
    </div>
  );
};

export default RepushReport;
