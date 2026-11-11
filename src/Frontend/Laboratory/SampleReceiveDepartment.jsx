import { useEffect, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import { SearchButton } from "../../components/UI/CustomButton";

const SampleReceiveDepartment = () => {
  const [payload, setPayload] = useState({
    fromDate: "",
    toDate: "",
    department: "",
    searchBy: "",
    searchText: "",
    panel: "",
    testCode: "",
    sinno: "",
  });
  const [loading, setLoading] = useState(false);

  const [t] = useTranslation();

  const searchByOptions = [
    { label: "SIN No", value: "sinno" },
    { label: "Visit No", value: "visitno" },
    { label: "Patient Name", value: "PName" },
  ];

  const handleSelectChange = (...args) => {
    let option = null;
    if (args.length === 1) option = args[0];
    else option = args[1];

    if (option && option.target) {
      option = option.target.value;
    }

    const val = option ? option.value : "";
    setPayload((prev) => ({ ...prev, [args[0]]: String(val) }));
  };

  const handleDateSelect = (...args) => {
    console.log(args);

    const date = args[0];
    const fieldName = args[1];

    const val = date ? new Date(date).toISOString() : null;
    setPayload((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "searchText")
      setPayload((prev) => ({ ...prev, searchText: value }));
    if (id === "RouteNo") setPayload((prev) => ({ ...prev, RouteNo: value }));
  };

  const sampleData = [
    {
      SinNo: "SIN20251001",
      CollectionDate: "2025-10-10",
      FromCentre: "Central Lab, Delhi",
      VisitNo: "VIS1001",
      PatientName: "Rohit Mehra",
      DoctorName: "Dr. A. Sharma",
      Department: "Biochemistry",
      TestName: "Lipid Profile",
      OutSourceLab: "SRL Diagnostics",
      TAT: "24 hrs",
      FileRequired: "Yes",
      Status: "Transfered",
      AddReport: "Uploaded",
      Select: false,
    },
    {
      SinNo: "SIN20251002",
      CollectionDate: "2025-10-11",
      FromCentre: "Health Plus, Noida",
      VisitNo: "VIS1002",
      PatientName: "Priya Singh",
      DoctorName: "Dr. R. Bhatia",
      Department: "Pathology",
      TestName: "CBC",
      OutSourceLab: "Thyrocare",
      TAT: "12 hrs",
      FileRequired: "No",
      Status: "Recieved",
      AddReport: "Pending",
      Select: true,
    },
    {
      SinNo: "SIN20251003",
      CollectionDate: "2025-10-12",
      FromCentre: "Apollo Clinic, Gurugram",
      VisitNo: "VIS1003",
      PatientName: "Amit Verma",
      DoctorName: "Dr. S. Kapoor",
      Department: "Microbiology",
      TestName: "COVID RT-PCR",
      OutSourceLab: "Metropolis Labs",
      TAT: "6 hrs",
      FileRequired: "Yes",
      Status: "Processing",
      AddReport: "Not Added",
      Select: false,
    },
  ];

  const panelOptions = [
    { label: "All Panel", value: "all" },
    { label: "Diagnostice Center", value: "pathology pvt. ltd" },
  ];
  const departmentOptions = [
    { label: "All Department", value: "all" },
    { label: "Diagnostice Center", value: "pathology pvt. ltd" },
  ];
  const testCodeOptions = [
    { label: "All Department", value: "all" },
    { label: "Diagnostice Center", value: "pathology pvt. ltd" },
  ];

  return (
    <>
      <Accordion
        name={t("Outsource Test To Other Lab")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <Accordion defaultValue={true} title={t("Search Option")} />

        <div className="row pt-2 px-2 py-2">
          <div className="col-12">
            <div className="row align-items-end justify-content-start g-3">
              {/* From Date */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="fromDate"
                  placeholder=" "
                  id="fromDate"
                  lable="From Date"
                  value={payload.fromDate ? new Date(payload.fromDate) : null}
                  onChange={handleDateSelect}
                />
              </div>

              {/* To Date */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="toDate"
                  placeholder=" "
                  id="toDate"
                  lable="To Date"
                  value={payload.toDate ? new Date(payload.toDate) : null}
                  onChange={handleDateSelect}
                />
              </div>

              {/* Department select */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-2 my-1">
                <ReactSelect
                  dynamicOptions={departmentOptions}
                  name="department"
                  label={t("Department")}
                  id="department"
                  removeIsClearable={true}
                  placeholderName={t("Select Department")}
                  value={
                    departmentOptions.find(
                      (o) => o.value === payload.department,
                    ) ?? null
                  }
                  onChange={handleSelectChange}
                  isDisabled={loading || departmentOptions.length === 0}
                />
              </div>

              {/* Search by select */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-2 my-1">
                <ReactSelect
                  dynamicOptions={searchByOptions}
                  name="searchBy"
                  label={t("Search By")}
                  id="searchBy"
                  removeIsClearable={true}
                  placeholderName={t("Search By")}
                  value={
                    searchByOptions.find((o) => o.value === payload.searchBy) ??
                    null
                  }
                  onChange={handleSelectChange}
                  isDisabled={loading || searchByOptions.length === 0}
                />
              </div>

              {/* Search text input (SIN/Visit/Patient) */}
              <div className="col-12 col-sm-6 col-md-8 col-lg-2 my-1">
                <Input
                  id="searchText"
                  className="select-input-box form-control form-control-sm"
                  type="text"
                  name="searchText"
                  maxLength={100}
                  label={t("Enter value")}
                  placeholder={t("Enter SIN / Visit No / Patient Name")}
                  value={payload.searchText}
                  onChange={handleInputChange}
                />
              </div>

              {/* Panel select */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-2 my-1">
                <ReactSelect
                  dynamicOptions={panelOptions}
                  name="panel"
                  label={t("Panel")}
                  id="panel"
                  removeIsClearable={true}
                  placeholderName={t("Select Panel")}
                  value={
                    panelOptions.find((o) => o.value === payload.panel) ?? null
                  }
                  onChange={handleSelectChange}
                  isDisabled={loading || panelOptions.length === 0}
                />
              </div>

              {/* Test Code select */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-2 my-1">
                <ReactSelect
                  dynamicOptions={testCodeOptions}
                  name="testCode"
                  label={t("Test Code")}
                  id="testCode"
                  removeIsClearable={true}
                  placeholderName={t("Select Test")}
                  value={
                    testCodeOptions.find((o) => o.value === payload.testCode) ??
                    null
                  }
                  onChange={handleSelectChange}
                  isDisabled={loading || testCodeOptions.length === 0}
                />
              </div>

              <div className="col-12 col-sm-6 col-md-4 col-lg-2 my-1">
                {loading ? (
                  <Loading />
                ) : (
                  // <button
                  //   type="button"
                  //   className="btn btn-sm btn-primary w-100 text-white"
                  //   //   onClick={handleSearch}
                  // >
                  //   {t("Search")}
                  // </button>
                  <SearchButton
                      text={"Search"}
                      //  onClick={handleSearch}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion
        defaultValue={true}
        title={t(`Patient Detail Total investigation(s): ${sampleData.length}`)}
      >
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div className="table-responsive" style={{ width: "100%" }}>
                {sampleData.length > 0 ? (
                  <Tables
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <thead>
                      <tr>
                        <th scope="col">{t("Sin No")}</th>
                        <th scope="col">{t("Collection Date")}</th>
                        <th scope="col">{t("From Centre")}</th>
                        <th scope="col">{t("Visit No.")}</th>
                        <th scope="col">{t("Sin No.")}</th>
                        <th scope="col">{t("Patient Name")}</th>
                        <th scope="col">{t("Doctor Name")}</th>
                        <th scope="col">{t("Department")}</th>
                        <th scope="col">{t("Test Name")}</th>
                        <th scope="col">{t("Out Source Lab")}</th>
                        <th scope="col">{t("TAT")}</th>
                        <th scope="col">{t("File Required")}</th>
                        <th scope="col">{t("Status")}</th>
                        <th scope="col">{t("Add Report")}</th>
                        <th scope="col">{t("Select")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sampleData.map((row, idx) => {
                        const statusColor =
                          row.Status === "Transfered"
                            ? "text-success"
                            : row.Status === "Recieved"
                              ? "text-warning"
                              : "text-primary";

                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td data-title={t("Sin No")}>{t(row.SinNo)}</td>
                            <td data-title={t("Collection Date")}>
                              {t(row.CollectionDate)}
                            </td>
                            <td data-title={t("From Centre")}>
                              {t(row.FromCentre)}
                            </td>
                            <td data-title={t("Visit No.")}>
                              {t(row.VisitNo)}
                            </td>
                            <td data-title={t("Patient Name")}>
                              {t(row.PatientName)}
                            </td>
                            <td data-title={t("Doctor Name")}>
                              {t(row.DoctorName)}
                            </td>
                            <td data-title={t("Department")}>
                              {t(row.Department)}
                            </td>
                            <td data-title={t("Test Name")}>
                              {t(row.TestName)}
                            </td>
                            <td data-title={t("Out Source Lab")}>
                              {t(row.OutSourceLab)}
                            </td>
                            <td data-title={t("TAT")}>{t(row.TAT)}</td>
                            <td data-title={t("File Required")}>
                              {t(row.FileRequired)}
                            </td>
                            <td
                              data-title={t("Status")}
                              className={statusColor}
                            >
                              {t(row.Status)}
                            </td>
                            <td data-title={t("Add Report")}>
                              {t(row.AddReport)}
                            </td>
                            <td data-title={t("Select")}>
                              <input
                                type="checkbox"
                                checked={row.Select}
                                onChange={() =>
                                  console.log("Checkbox toggled:", row.SinNo)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tables>
                ) : (
                  <NoRecordFound />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default SampleReceiveDepartment;
