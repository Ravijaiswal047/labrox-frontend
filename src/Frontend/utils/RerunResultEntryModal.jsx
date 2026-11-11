import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { isChecked } from "../../utils/helpers";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";

function RerunResultEntryModal({ show, data, handleClose }) {
  const [tableData, setTableData] = useState([]);
  const [DropDownData, setDropDownData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Reason, setReason] = useState("");
  const [t] = useTranslation();
  const fetchDropDown = () => {
    axiosInstance
      .get("RE/GetRerunresion")
      .then((res) => {
        const data = res?.data?.message?.map((ele) => {
          return {
            label: ele?.RerunResion,
            value: ele?.RerunResion,
          };
        });
        setDropDownData(data);
        setReason(data[0]?.value);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetch = () => {
    axiosInstance
      .post("RE/GetRerunData", {
        LabNO: data?.LedgerTransactionNo,
        TestId: data?.TestID,
      })
      .then((res) => {
        const data = res?.data?.message?.map((ele, index) => {
          return {
            ...ele,
            isChecked: false,
          };
        });
        setTableData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleChecked = (e, index) => {
    const { name, checked } = e.target;
    if (index >= 0) {
      const data = [...tableData];
      data[index][name] = checked;
      setTableData(data);
    } else {
      const data = tableData.map((ele) => {
        return {
          ...ele,
          [name]: checked,
        };
      });
      setTableData(data);
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setReason(value);
  };

  const handleSubmit = () => {
    const payload = tableData.filter((ele) => ele?.isChecked === true);
    console.log(payload, "payload");
    if (payload?.length > 0) {
      setLoading(true);
      axiosInstance
        .post("RE/savererundata", {
          TestID: data?.TestID,
          ledgerTransactionID: data?.LedgerTransactionID,
          ledgerTransactionNo: data?.LedgerTransactionNo,
          Reason: "Check",
          ObservationData: payload,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          handleClose();
          setLoading(false);
        })
        .catch((err) => {
          toast.error(
            err?.data?.message ? err?.data?.message : "Something Went Wrong",
          );
          setLoading(false);
        });
    } else {
      toast.error("Please Choose one Test");
    }
  };

  useEffect(() => {
    fetch();
    fetchDropDown();
  }, []);

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      visible={show}
      style={{
        width: isMobile ? "80vw" : "30vw",
      }}
      header={t("Test Rerun")}
      onHide={handleClose}
      className={theme}
    >
      <div className="">
        <Tables>
          <thead class="cf">
            <tr>
              <th>{t("S.no")}</th>
              <th>{t("Parameter")}</th>
              <th>{t("Value")}</th>
              <th className="text-center">
                <input
                  type="checkbox"
                  name="isChecked"
                  checked={
                    tableData.length > 0
                      ? isChecked("isChecked", tableData, true).includes(false)
                        ? false
                        : true
                      : false
                  }
                  onChange={(e) => handleChecked(e)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((ele, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{ele?.LabObservationName}</td>
                <td>{ele?.VALUE}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    name="isChecked"
                    checked={ele?.isChecked}
                    onChange={(e) => handleChecked(e, index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Tables>

        <div className="row mt-2">
          <div className="col-sm-3">
            <label>{t("Rerun Reason")}:</label>
          </div>
          <div className="col-sm-9">
            <SelectBox
              className="select-input-box form-control input-sm"
              options={DropDownData}
              selectedValue={Reason}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-sm-6">
            {loading ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                onClick={handleSubmit}
              >
                {t("Save")}
              </button>
            )}
          </div>
          <div className="col-sm-6">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={handleClose}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default RerunResultEntryModal;
6;
