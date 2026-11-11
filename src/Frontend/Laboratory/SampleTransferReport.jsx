import { useEffect, useState } from "react";
import { SRAFormatDate } from "../../utils/helpers";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";

const SampleTransferReport = () => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [centres, setCentres] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [payload, setPayload] = useState({
    FromDate: SRAFormatDate(new Date()),
    ToDate: SRAFormatDate(new Date()),
    Centres: [],
    CentreType: "To", // From
  });

  console.log("Centres selected", selected);

  // fetch centres
  useEffect(() => {
    const fetchCentre = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("Centre/getAccessCentres");

        const message = res?.data?.message || [];

        if (Array.isArray(message)) {
          setCentres(message);
        } else {
          setCentres([]);
          if (typeof message === "string") {
            toast.error("No Centre found.");
          }
        }
      } catch (err) {
        console.error("Failed to load centers", err);
        setCentres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCentre();
  }, []);

  const handleDateSelect = (...args) => {
    const date = args[0];
    const fieldName = args[1];

    const val = date ? new Date(date).toISOString() : null;
    setPayload((prev) => ({ ...prev, [fieldName]: val }));
  };

  useEffect(() => {
    if (selectAll && centres.length) {
      setSelected(new Set(centres.map((c) => c.CentreID)));
    }
  }, [centres, selectAll]);

  const toggleSelect = (CentreID) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(CentreID)) s.delete(CentreID);
      else s.add(CentreID);
      setSelectAll(centres.length > 0 && s.size === centres.length);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(centres.map((c) => c.CenterID)));
      setSelectAll(true);
    }
  };

  const handleInputChange = (e) => {
    const { id } = e.target;
    setPayload((prev) => ({ ...prev, CentreType: id }));
  };

  const handleGetReport = async () => {
    const centresArray = Array.from(selected).map(String);
    const requestPayload = {
      ...payload,
      Centres: centresArray,
    };

    setLoading(true);
    try {
      await axiosInstance.post("SRA/GetReport", requestPayload);
      handleClose();
    } catch (err) {
      console.error("Get report failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Accordion
        name={t("Sample Transfer Report")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 px-2 py-2">
          <div className="col-12">
            <div className="row align-items-end gap-3 justify-content-center d-flex align-items-center">
              <div className="col-12 col-sm-6 col-md-3 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="FromDate"
                  placeholder=" "
                  id="FromDate"
                  lable="From Date"
                  value={payload.FromDate ? new Date(payload.FromDate) : null}
                  onChange={handleDateSelect}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-3 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="ToDate"
                  placeholder=" "
                  id="ToDate"
                  lable="To Date"
                  value={payload.ToDate ? new Date(payload.ToDate) : null}
                  onChange={handleDateSelect}
                />
              </div>
            </div>
            <div
              className="row align-items-end justify-content-center d-flex align-items-center px-5"
              style={{ gap: "20px" }}
            >
              <div className="d-flex align-items-center">
                <input
                  id="centers"
                  type="checkbox"
                  className="me-2 mr-2"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
                <label htmlFor="centers" className="mb-0 small">
                  All Centre
                </label>
              </div>
              <div
                className="col-12 col-sm-6 col-md-2 my-1 d-flex "
                style={{ gap: "10px" }}
              >
                <div className="form-check">
                  <input
                    id="From"
                    type="radio"
                    name="CentreType"
                    className="form-check-input"
                    checked={payload.CentreType === "From"}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="From" className="form-check-label">
                    From Centre
                  </label>
                </div>
                <div className="form-check">
                  <input
                    id="To"
                    type="radio"
                    name="CentreType"
                    className="form-check-input"
                    checked={payload.CentreType === "To"}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="To" className="form-check-label">
                    To Centre
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row pt-2 px-2 py-2">
          <div className="col-12">
            <div
              className="row align-items-end gap-3 justify-content-start d-flex"
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                padding: "10px",
                scrollbarWidth: "thin",
              }}
            >
              {centres.map((centre) => {
                const isChecked = selected.has(centre.CentreID);
                return (
                  <div
                    key={centre.CentreID}
                    className="col-12 col-sm-6 col-md-3 my-1 d-flex"
                    style={{ gap: "10px" }}
                  >
                    <input
                      id={`center-${centre.CentreID}`}
                      type="checkbox"
                      name="centers"
                      className="me-2"
                      checked={isChecked}
                      onChange={() => toggleSelect(centre.CentreID)}
                    />
                    <label
                      htmlFor={`center-${centre.CentreID}`}
                      className="mb-0 small text-truncate"
                      style={{ maxWidth: "100%" }}
                    >
                      {centre.Centre}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="row pt-2 px-2 py-2" style={{ width: "100%" }}>
          <div className="col-12 row align-items-center gap-3 justify-content-center d-flex">
            {/* Report Button */}
            <div className="col-12 col-sm-6 col-md-1 d-flex align-items-end">
              {loading ? (
                <Loading />
              ) : (
                <button
                  type="button"
                  className="btn text-white btn-sm w-100"
                  onClick={handleGetReport}
                >
                  {t("Report")}
                </button>
              )}
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default SampleTransferReport;
