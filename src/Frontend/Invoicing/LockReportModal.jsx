import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
import { toast } from "react-toastify";
import { number } from "../../utils/helpers";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";

import Tables from "../../components/UI/customTable";
import { useMemo } from "react";

const LockReportModal = ({
  selectedData,
  lockreportshow,
  setLockReportShow,
  handleSearch,
}) => {
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  console.log("LockReportModal", selectedData);
  const [loading, setLoading] = useState(false);

  const [payload, setPayload] = useState({
    DaysHour: "days",
    txtTimeLimit: "0",
    Reason: "",
    LastReason: "",
    UpdateTimeLimit: false,
  });
  const [tableData, setTableData] = useState([]);
  const [load, setLoad] = useState(false);
  const [PageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [CentreData, setCentreData] = useState([]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return tableData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, tableData, PageSize]);

  const { t } = useTranslation();
  const handleSelectChange = (e) => {
    const { name, value } = e?.target;
    if(payload?.DaysHour == "minute" && name == 'txtTimeLimit' && value > 59){
      return
    }
    if (name == "Reason") {
      setPayload({
        ...payload,
        [name]: value,
      });
    } else if (name == "LastReason") {
      setPayload({
        ...payload,
        [name]: value,
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };
  const handleUpdate = () => {
    setLoading(true);
    if (payload?.txtTimeLimit)
      if (!payload?.txtTimeLimit || payload?.txtTimeLimit == 0) {
        toast.error("Limit Can't Be Blank Or Zero.");
        setLoading(false);
      } else if (payload?.Reason == "") {
        toast.error("Please Enter Lock Client Reason.");
        setLoading(false);
      } else {
        axiosInstance
          .post("Accounts/ForcefullyLockOrUnlock", {
            Reason: payload.Reason.toString(),
            IsLock: selectedData?.IsLockStatus ? 0 : 1,
            RateTypeID: Number(selectedData.RateTypeID),
            Uptodate: `${payload?.txtTimeLimit?.toString()} ${payload?.DaysHour?.toString()}`,
          })
          .then((res) => {
            toast.success(res?.data?.message);
            setLoading(false);
            setLockReportShow(false);
            handleSearch();
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Something Went Wrong.",
            );
            setLoading(false);
          });
      }
  };

  console.log("currentTableData", currentTableData);
  const BindLedgerStatus = () => {
    setLoading(true);

    axiosInstance
      .post("Accounts/BindLedgerStatus", {
        RateTypeID: Number(selectedData.RateTypeID),
      })
      .then((res) => {
        if(Array.isArray(res?.data?.message)){
          setTableData(res?.data?.message);
        }else{
          setTableData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong.");
        setLoading(false);
      });
  };

  console.log('xxxxxx', tableData);

  useEffect(() => {
    BindLedgerStatus();
  }, []);
  return (
    <>
      <Dialog
        visible={lockreportshow}
        header={t("Enter Time Limit To Unlock The Client")}
        onHide={() => setLockReportShow(false)}
        className={theme}
        style={{
          width: isMobile ? "80vw" : "40vw",
        }}
      >
        <div className="row">
          <label className="col-sm-1">{t("PUP")}:</label>
          <div className="col-sm-10">{selectedData?.RateTypeName}</div>
        </div>
        <div className="row">
          <div className="col-sm-5 d-flex">
            <input
              type="checkbox"
              className="mb-3"
              name="UpdateTimeLimit"
              checked={payload?.UpdateTimeLimit}
              onChange={(e) => {
                setPayload({
                  ...payload,
                  [e.target.name]: e.target.checked,
                });
              }}
            />
            <label className="control-label" style={{ marginLeft: "5px" }}>
              {t("Unlock Client for Time Limit :")}
            </label>
          </div>

          <div className="col-sm-3">
            <Input
              type="number"
              className="required-fields"
              name="txtTimeLimit"
              onInput={(e) => number(e, 2)}
              value={payload?.txtTimeLimit}
              disabled={payload?.UpdateTimeLimit ? false : true}
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-sm-4">
            <SelectBox
              options={[
                { label: "Minutes", value: "minute" },
                { label: "Hours", value: "hours" },
                { label: "Days", value: "days" },
              ]}
              isDisabled={payload?.UpdateTimeLimit ? false : true}
              name="DaysHour"
              selectedValue={payload?.DaysHour}
              onChange={handleSelectChange}
            />
          </div>
        </div>
        <div className="row">
          <label className="col-sm-2">{t("Reason")} :</label>

          <div className="col-sm-10">
            <Input
              className="required-fields"
              type="text"
              name="Reason"
              // onInput={(e) => number(e, 50)}
              maxLength={100}
              value={payload?.Reason}
              onChange={handleSelectChange}
              disabled={payload?.UpdateTimeLimit ? false : true}
            />
          </div>
        </div>
        <div className="row justify-content-center">
          {loading ? (
            <Loading />
          ) : (
            <div className="col-sm-2 m-2 text-center">
              <button
                className="btn btn-block btn-sm btn-success"
                onClick={handleUpdate}
                disabled={!payload?.UpdateTimeLimit}
              >
                {t("Update")}
              </button>
            </div>
          )}
        </div>

        {load ? (
          <Loading />
        ) : (
          <div
            style={{
              maxHeight: "310px",
              overflowY: "auto",
            }}
          >
            {" "}
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("Select")}</th>
                  <th>{t("Created By")}</th>
                  <th>{t("Entry Date & Time")}</th>
                  <th>{t("Up To")}</th>
                  <th>{t("Reason")}</th>
                </tr>
              </thead>

              <tbody>
                {currentTableData?.map((data, index) => (
                  <tr key={index}>
                    {/* <td data-title={t("Select")}>
                      <button
                        className="btn btn-info btn-sm d-flex align-items-center"
                        onClick={() => handleSelctData(data)}
                      >
                        {t("Select")}
                      </button>
                    </td> */}
                    <id>{index + 1}</id>
                    <td data-title={t("Created By")}>
                      {data?.CreatedByName || "-"}
                    </td>
                    <td data-title={t("Entry Date & Time")}>
                      {data?.dtEntry || "-"}
                    </td>
                    <td data-title={t("Up To")}>{data?.UpTo || "-"}</td>
                    <td data-title={t("Reason")}>{data?.Reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        )}

        {/* {currentTableData?.length > 0 && (
          <div className="d-flex justify-content-end">
            <label className="mt-4 mx-2">{t("No Of Record/Page")}</label>
            <SelectBox
              className="mt-3 p-1 RecordSize mr-2"
              options={Record}
              selectedValue={PageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            />{" "}
            <Pagination
              className="pagination-bar mb-2"
              currentPage={currentPage}
              totalCount={tableData?.length}
              pageSize={PageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />{" "}
          </div>
        )} */}
      </Dialog>
    </>
  );
};
export default LockReportModal;
