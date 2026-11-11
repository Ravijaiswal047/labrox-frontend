import React, { useEffect, useState } from "react";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";

import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import moment from "moment";
import { EditButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

const lightenRowColor = (color) => {
  if (!color) return "";
  const key = String(color).toLowerCase().trim();
  const map = {
    pink: "#ffe4ec",
    lightgreen: "#e8f8e8",
    "#ff00ff": "#f5d0fe",
    "#ff00fc": "#f5d0fe",
    magenta: "#f5d0fe",
    lightyellow: "#fffde7",
    yellow: "#fffde7",
    red: "#fecaca",
  };
  return map[key] || color;
};

const getGenderShort = (gender) => {
  const g = String(gender || "").toLowerCase();
  if (g.startsWith("f")) return "F";
  if (g.startsWith("m")) return "M";
  return gender || "-";
};

const isFemaleGender = (gender) =>
  String(gender || "").toLowerCase().startsWith("f");

const STATUS_BUTTON = [
  {
    label: "Pending",
    color: "white",
    type: "Pending",
  },
  {
    label: "Microscopic",
    color: "#fec0cb",
    type: "Microscopic",
  },
  {
    label: "Plating",
    color: "#90ee8e",
    type: "Plating",
  },
  {
    label: "Incubation",
    color: "#ff00fc",
    type: "Incubation",
  },
];

const ENTRY_TYPE = [
  {
    label: "Microscopic",
    value: "Microscopic",
  },
  {
    label: "Plating",
    value: "Plating",
  },
  {
    label: "Incubation",
    value: "Incubation",
  },
  {
    label: "All",
    value: "All",
  },
];

const MICROSCOPIC_OPTION = [
  {
    label: "Select",
    value: "",
  },
  {
    label: "Wet Mount",
    value: "Wet Mount",
  },
  {
    label: "Gram Stain",
    value: "Gram Stain",
  },
  {
    label: "AFB",
    value: "AFB",
  },
  {
    label: "Other",
    value: "Other",
  },
];

const INCUBATION_TIME = [
  {
    label: "Select",
    value: "",
  },
  {
    label: "12 Hours",
    value: 12,
  },
  {
    label: "24 Hours",
    value: 24,
  },
  {
    label: "48 Hours",
    value: 48,
  },
  {
    label: "7 Days",
    value: 168,
  },
  {
    label: "15 Days",
    value: 360,
  },
];

const PLATING_COUNT = [
  {
    label: "1",
    value: "1",
  },
  {
    label: "2",
    value: "2",
  },
  {
    label: "3",
    value: "3",
  },
  {
    label: "4",
    value: "4",
  },
];
function MicroLabEntry() {
  const { t } = useTranslation();
  const [payload, setPayload] = useState({
    EntryType: "All",
    FromDate: new Date(),
    ToDate: new Date(),
    VisitNo: "",
    SinNo: "",
  });
  const [loading, setLoading] = useState(false);

  const [load, setLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [singleData, setSingleData] = useState({});
  const [whichData, setWhichData] = useState({
    Pending: false,
    MicroScopic: false,
    Plating: false,
    Incubation: false,
  });
  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };
  const handleSearch = (type) => {
    setLoad(true);
    setTableData([]);
    setSingleData({});
    let searchType = type;

    if (useLocalStorage("userData", "get").SkipMicLabEntry == 0) {
      // if (true) {
      if (!type && payload?.EntryType === "Microscopic") {
        searchType = "Microscopic";
      }
      axiosInstance
        .post("RECulture/SearchREData", {
          EntryType: payload?.EntryType,
          FromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
          ToDate: moment(payload.ToDate).format("YYYY-MM-DD"),
          VisitNo: payload?.VisitNo,
          SINNo: payload?.SinNo,
          SearchType: searchType,
        })
        .then((res) => {
          setLoad(false);
          if (res?.data?.message.length == 0) {
            toast.error("No Record Found");
          }
          setTableData(res?.data?.message);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err?.response?.data?.message);
        });
    } else {
      setLoad(false);
      if (
        window.confirm(
          "MicroLabEntry Already Done, Do you want to redirect to ResultEntryCulture",
        )
      ) {
        window.location.replace("/resultculture");
      }
    }
  };

  const MicroScopyComponent = ({ data, show }) => {
    const [tableData, setTableData] = useState([]);
    const [payload2, setPayload2] = useState({
      MicroScopic: "",
      MicroScopicComment: "",
    });

    const handleChange2 = (e) => {
      const { name, value } = e.target;
      setPayload2({ ...payload2, [name]: value });
    };
    const handleSave = (data) => {
      setLoading(true);
      const savePayload = tableData.map((ele) => {
        return {
          Test_ID: data.TestID,
          LabObservation_ID: ele?.labObservationID,
          LabObservationName: ele?.labObservationName,
          Value: ele?.value,
          ReadingFormat: ele?.Unit,
          LedgerTransactionNo: data.LedgerTransactionNo,
          BarcodeNo: data.BarcodeNo,
          Reporttype: "Preliminary 1",
        };
      });

      axiosInstance
        .post("RECulture/SaveMicroScopicdata", {
          datatosave: savePayload,
          MicroScopic: payload2?.MicroScopic,
          MicroScopicComment: payload2?.MicroScopicComment,
        })
        .then((res) => {
          setLoading(false);
          handleSearch("Microscopic");
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    };

    const fetch = () => {
      axiosInstance
        .post("RECulture/getMicroScopyData", {
          InvestigationID: data?.InvestigationID,
          LedgerTransactionNo: data?.LedgerTransactionNo,
          TestID: data?.TestID,
          BarcodeNo: data?.BarcodeNo,
          Gender: data?.Gender,
          AgeInDays: data?.AgeInDays,
        })
        .then((res) => {
          setTableData(res?.data?.message);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    useEffect(() => {
      show && fetch();
    }, []);

    return (
      <>
        <Accordion title={t("MicroScopy Detail")} defaultValue={true}>
          {show && (
            <>
              <div className="row px-2 mt-2 mb-1">
                <div className="col-sm-6">
                  <SelectBox
                    options={MICROSCOPIC_OPTION}
                    id="MicroScopic"
                    lable="MicroScopic"
                    selectedValue={payload2?.MicroScopic}
                    name="MicroScopic"
                    onChange={handleChange2}
                  />
                </div>

                <div className="col-sm-6">
                  <Input
                    lable="MicroScopic Comment"
                    id="MicroScopicComment"
                    placeholder=" "
                    value={payload2?.MicroScopicComment}
                    onChange={handleChange2}
                    name="MicroScopicComment"
                  />
                </div>
              </div>
            </>
          )}

          {/* <Table>
            <thead class="cf">
              <tr>
                <th>S.no</th>
                <th>Observation</th>
                <th>Value</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody></tbody>
          </Table> */}

          {show && (
            <div>
              {loading.pend && <Loading />}
              {!loading.pend && (
                <div className="col-sm-2 mb-1">
                  <SaveButton
                    text={"Save"}
                    onClick={() => handleSave(data)}
                  />
                </div>
              )}
            </div>
          )}
        </Accordion>
      </>
    );
  };

  const PlatingComponent = ({ data, show }) => {
    const [tableData, setTableData] = useState([""]);
    const [comment, setComment] = useState("");
    const [err, setErr] = useState(-1);

    const handleChange = (e) => {
      const value = parseInt(e.target.value);
      const length = [];
      setErr(-1);
      for (let i = 0; i < value; i++) {
        length.push("");
      }
      setTableData(length);
    };

    const handleChangeComment = (e) => {
      const { value, name } = e.target;
      setComment(value);
    };

    const handletableChange = (e, index) => {
      const { value } = e.target;
      const data = [...tableData];
      data[index] = value;
      setTableData(data);
    };
    const check = (data) => {
      for (let i of data) {
        if (i.length == 0) {
          return false;
        }
      }
      return true;
    };
    const handleSave = () => {
      const { match, index } = handleValidation();
      if (match) {
        toast.error("Please enter Value");
        setErr(index);
      } else {
        setLoading(true);
        axiosInstance
          .post("RECulture/SavePlatingData", {
            datatosave: [
              {
                Test_ID: data.TestID,
                LedgerTransactionNo: data.LedgerTransactionNo,
                BarcodeNo: data.BarcodeNo,
                NoOfPlate: tableData.length,
                Comment: comment,
                PlateNo: tableData,
              },
            ],
          })
          .then((res) => {
            setLoading(false);
            handleSearch("Plating");
            toast.success(res?.data?.message);
          })
          .catch((err) => {
            setLoading(false);
            console.log(err);
          });
      }
    };

    const handleValidation = () => {
      let match = false;
      let index = -1;
      for (let i = 0; i < tableData.length; i++) {
        if (tableData[i] == "") {
          match = true;
          index = i;
          break;
        }
      }
      return {
        index,
        match,
      };
    };

    return (
      <>
        <Accordion title={t("Plating Detail")} defaultValue={true}>
          <div className="row  px-2 mt-2 mb-1">
            <div className="col-sm-8">
              <Input
                lable="Comment"
                id="comment"
                name="comment"
                value={comment}
                type="comment"
                placeholder=" "
                onChange={handleChangeComment}
              />
            </div>

            <div className="col-sm-4">
              <SelectBox
                options={PLATING_COUNT}
                name="PLATING_COUNT"
                lable="PLATING_COUNT"
                id="PLATINGCOUNT"
                value={tableData?.length}
                onChange={handleChange}
              />
            </div>
          </div>
          <>
            <div className="p-2">
              <Tables>
                <thead class="cf">
                  <tr>
                    <th>{t("S.no")}</th>
                    <th>{t("Plate Number")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((ele, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <input
                          className={`select-input-box form-control input-sm ${index == err && "requireds"
                            }`}
                          value={ele}
                          onChange={(e) => handletableChange(e, index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
              {show && (
                <div className="col-sm-2 mt-2">
                  <SaveButton
                    text={"Save"}
                    onClick={() => handleSave()}
                  />
                </div>
              )}
            </div>
          </>
        </Accordion>
      </>
    );
  };

  const IncubationComponent = ({ data, show }) => {
    const [payload, setPayload] = useState({
      IncubationPeriod: 12,
      BatchNo: "",
      IncubationComment: "",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setPayload({ ...payload, [name]: value });
    };

    const handleSave = () => {
      setLoading(true);
      console.log(payload);
      if (payload?.BatchNo == "" || payload?.IncubationComment == "") {
        setLoading(false);
        toast.error("BatchNo and IncubationComment are required");
        return;
      }
      axiosInstance
        .post("RECulture/SaveIncubationData", {
          datatosave: [
            {
              Test_ID: data.TestID,
              LedgerTransactionNo: data.LedgerTransactionNo,
              BarcodeNo: data.BarcodeNo,
              IncubationPeriod: payload?.IncubationPeriod,
              BatchNo: payload?.BatchNo,
              IncubationComment: payload?.IncubationComment,
            },
          ],
        })
        .then((res) => {
          setLoading(false);
          handleSearch("Incubation");
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          setLoading(false);
          toast.error(err?.data?.response);
        });
    };

    return (
      <>
        <Accordion title={t("Incubation Detail")} defaultValue={true}>
          <div className="row  px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                options={INCUBATION_TIME}
                id="IncubationPeriod"
                lable="IncubationPeriod"
                selectedValue={payload?.IncubationPeriod}
                name="IncubationPeriod"
                onChange={handleChange}
              />
            </div>

            <div className="col-sm-4">
              <Input
                type="text"
                lable="BatchNo"
                id="BatchNo"
                placeholder=""
                value={payload?.BatchNo}
                name="BatchNo"
                onChange={handleChange}
              />
            </div>

            <div className="col-sm-4">
              <Input
                lable="IncubationComment"
                id="IncubationComment"
                name="IncubationComment"
                placeholder=" "
                onChange={handleChange}
              />
            </div>
          </div>
          {show && (
            <div className="col-sm-2 mt-2 mb-1">
              <SaveButton
                text={"Save"}
                onClick={handleSave}
              />
            </div>
          )}{" "}
        </Accordion>
      </>
    );
  };

  const UpdateComponent = ({ data, show }) => {
    const [comment, setComment] = useState("");
    const [err, setErr] = useState(-1);
    const [load, setLoad] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [formData, setFormData] = useState({
      MicroScopicComment: "",
      MicroScopic: "",
      PlatingComment: "",
      NoofPlate: "",
      PlateNo: [],
      IncubationPeriod: "",
      IncubationBatch: "",
      IncubationComment: "",
      MicroscopicDoneBY: "",
      MicroscopicDate: "",
      IncubationDate: "",
    });
    console.log(show);
    const handleChange = (e) => {
      const { name, value } = e.target;
      if (name == "NoofPlate") {
        let arr = [];
        for (let i = 0; i < parseInt(value); i++) {
          arr.push("");
        }
        setFormData({ ...formData, [name]: value, PlateNo: arr });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    };

    const fetch = () => {
      axiosInstance
        .post("RECulture/GetSavedData", {
          Test_ID: data?.TestID,
        })
        .then((res) => {
          const obj = res?.data?.message[0];
          console.log(obj);
          setFormData({
            MicroScopic: obj?.MicroScopic,
            MicroScopicComment: obj?.MicroScopicComment,
            MicroscopicDoneBY: obj?.MicroScopicDoneBy,
            MicroscopicDate: obj?.MicroScopicDate,
            PlatingDate: obj?.PlatingDate,
            PlatingDoneBy: obj?.PlatingDoneBy,
            IncubationDate: obj?.IncubationDate,
            IncubationDoneBy: obj?.IncubationDoneBy,
            PlatingComment: obj?.PlatingComment,
            NoofPlate: obj?.NoofPlate,
            PlateNo: obj?.PlateNo,
            IncubationPeriod: obj?.IncubationPeriod,
            IncubationBatch: obj?.IncubationBatch,
            IncubationComment: obj?.IncubationComment,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    };
    const fetchMicroscopy = () => {
      axiosInstance
        .post("RECulture/getMicroScopyData", {
          InvestigationID: data?.InvestigationID,
          LedgerTransactionNo: data?.LedgerTransactionNo,
          TestID: data?.TestID,
          BarcodeNo: data?.BarcodeNo,
          Gender: data?.Gender,
          AgeInDays: data?.AgeInDays,
        })
        .then((res) => {
          setTableData(res?.data?.message);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    const handletableChange = (e, index) => {
      const { value } = e.target;
      const data = formData?.PlateNo;
      data[index] = value;
      setFormData({ ...formData, PlateNo: data });
    };
    const handleValidation = () => {
      let match = false;
      let index = -1;
      for (let i = 0; i < formData?.PlateNo?.length; i++) {
        if (formData?.PlateNo[i] == "") {
          match = true;
          index = i;
          break;
        }
      }
      return {
        index,
        match,
      };
    };
    function emptycheck(obj) {
      const requiredKeys = [
        "MicroScopic",
        "MicroScopicComment",
        "PlatingComment",
        "IncubationPeriod",
        "IncubationBatch",
        "IncubationComment",
      ];
      return requiredKeys.filter(
        (key) =>
          obj[key] === "" || obj[key] === null || obj[key] === undefined,
      );
    }
    const handleUpdate = () => {
      if (
        String(data?.reportstatus || "").toLowerCase() === "saved" ||
        Number(data?.ResultFlag) === 1 ||
        Number(data?.Approved) === 1
      ) {
        toast.error("Record cannot be updated after result save/approval");
        return;
      }

      const plates = (formData?.PlateNo || []).filter(
        (p) => p != null && String(p).trim() !== "",
      );
      const obj = {
        Test_ID: data?.TestID,
        MicroScopic: formData?.MicroScopic,
        MicroScopicComment: formData?.MicroScopicComment,
        PlatingComment: formData?.PlatingComment,
        IncubationPeriod: String(formData?.IncubationPeriod ?? ""),
        IncubationBatch: formData?.IncubationBatch,
        IncubationComment: formData?.IncubationComment,
        NoofPlate: formData?.NoofPlate?.toString(),
        NoOfPlate: formData?.NoofPlate?.toString(),
        Comment: formData?.PlatingComment,
        BatchNo: formData?.IncubationBatch,
        PlateNo: plates,
      };
      const payload = {
        datatoupdate: [obj],
        datatosave: (tableData || [])
          .filter((ele) => ele?.labObservationID)
          .map((ele) => {
            return {
              Test_ID: data.TestID,
              LabObservation_ID: ele?.labObservationID,
              LabObservationName: ele?.labObservationName,
              Value: ele?.value,
              ReadingFormat: ele?.Unit,
              LedgerTransactionNo: data.LedgerTransactionNo,
              BarcodeNo: data.BarcodeNo,
              Reporttype: "Preliminary 1",
            };
          }),
      };
      const check = emptycheck(obj);
      if (check.length == 0) {
        setLoad(true);
        axiosInstance
          .post("RECulture/UpdateAllData", payload)
          .then((res) => {
            if (res?.data?.success === false) {
              toast.error(
                res?.data?.message ||
                  "Record cannot be updated after result save/approval",
              );
              setLoad(false);
              return;
            }
            toast.success(res?.data?.message || "Data Updated Successfully");
            setSingleData({});
            handleSearch(data?.CultureStatus || "");
            setLoad(false);
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message ||
                err?.response?.data?.Message ||
                "Update failed",
            );
            setLoad(false);
          });
      } else {
        toast.error(`Please Enter ${check.join(",")}`);
      }
    };

    useEffect(() => {
      fetch();
      fetchMicroscopy();
    }, []);

    return load ? (
      <Loading />
    ) : (
      <>
        <div className="row">
          <div className="col-sm-6">
            <Accordion title={t("MicroScopy Details")} defaultValue={true}>
              <div className="row px-2 mt-2 mb-1">
                <div className="col-sm-12">
                  <SelectBox
                    options={MICROSCOPIC_OPTION}
                    selectedValue={formData?.MicroScopic}
                    name="MicroScopic"
                    id="MicroScopic"
                    lable="MicroScopic"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row px-2 mt-1 mb-1">
                <div className="col-sm-12">
                  <Input
                    lable="MicroScopic Comment"
                    id="MicroScopicComment"
                    placeholder=" "
                    name="MicroScopicComment"
                    onChange={handleChange}
                    value={formData?.MicroScopicComment}
                  />
                </div>
              </div>
              {/* <div className="row">
                <table
                  className="table table-bordered table-hover table-striped tbRecord"
                  cellPadding="{0}"
                  cellSpacing="{0}"
                  style={{ whiteSpace: "normal" }}
                >
                  <thead class="cf">
                    <tr>
                      <th>S.no</th>
                      <th>Observation</th>
                      <th>Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div> */}
            </Accordion>
          </div>
          <div className="col-sm-6">
            <Accordion title={t("Plating Details")} defaultValue={true}>
              {" "}
              <div className="row px-2 mt-2 mb-1">
                <div className="col-sm-12">
                  <Input
                    lable="Comment"
                    id="comment"
                    value={formData?.PlatingComment}
                    type="comment"
                    placeholder=" "
                    name="PlatingComment"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row px-2 mt-1 mb-1">
                <div className="col-sm-12">
                  <SelectBox
                    options={PLATING_COUNT}
                    name="NoofPlate"
                    lable="NoofPlate"
                    id="NoofPlate"
                    placeholder=""
                    selectedValue={formData?.NoofPlate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="p-2">
                <Tables>
                  <thead class="cf">
                    <tr>
                      <th>{t("S.no")}</th>
                      <th>{t("Plate Number")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData?.PlateNo?.map((ele, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            className={`select-input-box form-control input-sm ${index == err && "requireds"
                              }`}
                            value={ele}
                            onChange={(e) => handletableChange(e, index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </Accordion>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6">
            <Accordion title={t("Incubation Detail")} defaultValue={true}>
              <div className="row  px-2 mt-2 mb-1">
                <div className="col-sm-12">
                  <SelectBox
                    options={INCUBATION_TIME}
                    selectedValue={Number(formData?.IncubationPeriod)}
                    lable="IncubationPeriod"
                    id="IncubationPeriod"
                    name="IncubationPeriod"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row px-2 mt-1 mb-1">
                <div className="col-sm-12">
                  <Input
                    lable="BatchNo"
                    id="Batch"
                    type="text"
                    placeholder=" "
                    value={formData?.IncubationBatch}
                    name="IncubationBatch"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row px-2 mt-1 mb-1">
                <div className="col-sm-12">
                  <Input
                    lable="IncubationComment"
                    placeholder=" "
                    id="IncubationComment"
                    name="IncubationComment"
                    onChange={handleChange}
                    value={formData?.IncubationComment}
                  />
                </div>
              </div>
            </Accordion>
          </div>
          <div className="col-sm-6">
            <div className="p-2">
              <Tables>
                <tbody>
                  <tr className="line-height-table">
                    <td>
                      <label className="requiredlabel">
                        {t("Microscopy Done By")}
                      </label>
                      <div>{formData?.MicroscopicDoneBY}</div>
                    </td>

                    <td>
                      <label className="requiredlabel">
                        {t("Microscopic Done Date")}
                      </label>
                      <div>{formData?.MicroscopicDate}</div>
                    </td>
                  </tr>

                  <tr className="line-height-table">
                    <td>
                      <label className="requiredlabel">
                        {t("Plating Done By")}
                      </label>
                      <div>{formData?.PlatingDoneBy}</div>
                    </td>

                    <td>
                      <label className="requiredlabel">
                        {t("Plating Done Date")}
                      </label>
                      <div>{formData?.PlatingDate}</div>
                    </td>
                  </tr>

                  <tr className="line-height-table">
                    <td>
                      <label className="requiredlabel">
                        {t("Incubation Done By")}
                      </label>
                      <div>{formData?.IncubationDoneBy}</div>
                    </td>

                    <td>
                      <label className="requiredlabel">
                        {t("Incubation Done Date")}
                      </label>
                      <div>{formData?.IncubationDate}</div>
                    </td>
                  </tr>
                </tbody>
              </Tables>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-2 mt-1 mb-1 ml-1">
            <EditButton
              text={"Update"}
              onClick={handleUpdate}
            />
          </div>
        </div>
      </>
    );
  };
  const handleSearchWiseDetails = (type, data) => {
    switch (type) {
      case "":
        return <MicroScopyComponent data={data} show={true} />;
        break;
      case "Microscopic":
        return <PlatingComponent data={data} show={true} />;
        break;
      case "Plating":
        return <IncubationComponent data={data} show={true} />;
        break;
      case "Incubation":
        return <UpdateComponent data={data} show={false} />;
        break;
      default:
        break;
    }
  };

  return (
    <>
      {" "}
      {load ? (
        <Loading />
      ) : (
        <>
          <Accordion
            name={t("Micro Lab Entry")}
            defaultValue={true}
            isBreadcrumb={true}
          >
            <div className="row px-2 mt-2 mb-1">
              <div className="col-sm-2">
                <SelectBox
                  options={ENTRY_TYPE}
                  selectedValue={payload?.EntryType}
                  name="EntryType"
                  id="EntryType"
                  lable="EntryType"
                  onChange={handleChange}
                />
              </div>

              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  name="FromDate"
                  id="FromDate"
                  lable="FromDate"
                  value={payload?.FromDate}
                  onChange={dateSelect}
                  maxDate={new Date(payload?.ToDate)}
                />
              </div>

              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  name="ToDate"
                  value={payload?.ToDate}
                  onChange={dateSelect}
                  placeholder=" "
                  id="ToDate"
                  lable="ToDate"
                  maxDate={new Date()}
                  minDate={new Date(payload?.FromDate)}
                />
              </div>

              <div className="col-sm-2">
                <Input
                  value={payload?.VisitNo}
                  name={"VisitNo"}
                  placeholder=" "
                  lable="Visit No"
                  id="VisitNo"
                  type="text"
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  lable="Barcode No"
                  id="SinNo"
                  placeholder=" "
                  value={payload?.SinNo}
                  name={"SinNo"}
                  type="text"
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-1">
                <SearchButton
                  text={"Search"}
                  onClick={() => handleSearch("")}
                />
              </div>
            </div>
            <>
              <style>
                {`
                    .status-filter-wrapper {
                      display: flex;
                      flex-wrap: wrap;
                      gap: 8px;
                        margin-bottom: 4px;
                    
                    }

                    .status-item {
                      display: flex;
                      align-items: center;
                      padding: 4px 12px;
                      background: #ffffff;
                      border: 1px solid #e2e8f0;
                      border-radius: 20px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                      
                    }

                    .status-item:hover {
                      border-color: #cbd5e1;
                      background: #f8fafc;
                      transform: translateY(-1px);
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }

                    .status-circle {
                      width: 10px;
                      height: 10px;
                      border-radius: 50%;
                      margin-right: 8px;
                      border: 1px solid rgba(0,0,0,0.05);
                    }

                    .status-text {
                      font-size: 13px;
                      font-weight: 500;
                      color: #334155;
                      margin-bottom: 0;
                      cursor: pointer;
                    }
                  `}
              </style>
              <div className="status-filter-wrapper">
                {STATUS_BUTTON.map((ele, index) => (
                  <div
                    key={index}
                    className="status-item"
                    onClick={() => handleSearch(ele?.label)}
                  >
                    <div
                      className="status-circle"
                      style={{
                        backgroundColor: ele?.color || "#cbd5e1",
                      }}
                    />
                    <label className="status-text">
                      {t(ele?.label)}
                    </label>
                  </div>
                ))}
              </div>
            </>
          </Accordion>
          {tableData?.length > 0 && (
            <div className="row">
              <div className="col-sm-7">
                {/* {tableData?.length > 0 && ( */}
                {tableData.length > 0 && (
                  <>
                    <Accordion
                      title={t("Total Patient") + ` : ${tableData?.length}`}
                      defaultValue={true}
                    >
                      {tableData.length > 0 ? (
                        <Tables>
                          <thead class="cf">
                            <tr>
                              <th>{t("S.No")}</th>
                              <th>{t("VisitNo./LRN")}</th>
                              <th>{t("Barcode No")}</th>
                              <th>{t("Patient Name")}</th>
                              <th>{t("Test Name")}</th>
                              <th>{t("Sample Receiving Date and Time")}</th>
                            </tr>
                          </thead>
                          {/* <tbody>
                          {tableData?.map((ele, index) => (
                            <tr
                              key={index}
                              style={{
                                cursor: "pointer",
                                background: ele?.rowcolor,
                              }}
                              onClick={() => setSingleData(ele)}
                            >
                              <td>{index + 1}</td>
                              <td>{ele?.LedgerTransactionNo}</td>
                              <td>{ele?.BarcodeNo}</td>
                              <td>{ele?.PName}</td>
                              <td>{ele?.TestName}</td>
                              <td>{ele?.SampleReceiveDate}</td>
                            </tr>
                          ))}
                        </tbody> */}
                          <tbody>
                            {Array.isArray(tableData) &&
                              tableData.map((ele, index) => {
                                const female = isFemaleGender(ele?.Gender);
                                const isSelected =
                                  singleData?.TestID === ele?.TestID;
                                return (
                                  <tr
                                    key={index}
                                    style={{
                                      cursor: "pointer",
                                      background: isSelected
                                        ? "#e0f2fe"
                                        : lightenRowColor(ele?.rowcolor),
                                      color: "#000",
                                    }}
                                    onClick={() => setSingleData(ele)}
                                  >
                                    <td>{index + 1}</td>
                                    <td>{ele?.LedgerTransactionNo}</td>
                                    <td>{ele?.BarcodeNo}</td>
                                    <td style={{ whiteSpace: "normal", minWidth: "140px" }}>
                                      <div
                                        className="d-flex align-items-start"
                                        style={{ gap: "6px" }}
                                      >
                                        <i
                                          className={
                                            female
                                              ? "bi bi-person-standing-dress"
                                              : "bi bi-person-standing"
                                          }
                                          style={{
                                            color: female ? "#cf68e1" : "#2563eb",
                                            fontSize: "16px",
                                            marginTop: "2px",
                                            flexShrink: 0,
                                          }}
                                        />
                                        <div style={{ lineHeight: 1.25 }}>
                                          <div>{ele?.PName}</div>
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "#64748b",
                                            }}
                                          >
                                            {ele?.Age || "-"} /{" "}
                                            {getGenderShort(ele?.Gender)}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>{ele?.TestName}</td>
                                    <td>{ele?.SampleReceiveDate}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </Tables>
                      ) : (
                        <>
                          <NoRecordFound />
                        </>
                      )}
                    </Accordion>
                  </>
                )}
              </div>
                {singleData && Object?.keys(singleData)?.length > 0 && (
                <div className="col-sm-5">
                  {!loading && (
                    <Accordion title={t("Details")} defaultValue={true}>
                      <Tables>
                        <tbody  >
                          <tr className="line-height-table ">
                            <td className="requiredlabel " style={{ fontWeight: "bold" }} >
                              {t("Patient Name")}:
                            </td>
                            <td colSpan={3}>{singleData?.PName}</td>
                          </tr>
                          <tr className="line-height-table">
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>{t("Age")}:</td>
                            <td>{singleData?.Age}</td>
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>{t("Gender")}:</td>
                            <td>{singleData?.Gender}</td>
                          </tr>

                          <tr className="line-height-table">
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>{t("Visit No")}:</td>
                            <td>{singleData?.LedgerTransactionNo}</td>
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>
                              {t("Barcode No")}:
                            </td>
                            <td>{singleData?.BarcodeNo}</td>
                          </tr>

                          <tr className="line-height-table">
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>{t("Test Name")}:</td>
                            <td colSpan={3}>{singleData?.TestName}</td>
                          </tr>

                          <tr className="line-height-table">
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>
                              {t("Sample Type")}:
                            </td>
                            <td>{singleData?.SampleTypeName}</td>
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>{t("RateType")}:</td>
                            <td>{singleData?.PanelName}</td>
                          </tr>

                          <tr className="line-height-table">
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>
                              {t("Sample Col. Date")}:
                            </td>
                            <td>{singleData?.SampleCollectionDate}</td>
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>
                              {t("Sample Rec. Date")}:
                            </td>
                            <td>{singleData?.SampleReceiveDate}</td>
                          </tr>

                          <tr className="line-height-table">
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>{t("Status")}:</td>
                            <td></td>
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>
                              {t("Last Status Date")}:
                            </td>
                            <td></td>
                          </tr>

                          <tr className="line-height-table">
                            <td className="requiredlabel" style={{ fontWeight: "bold" }}>{t("RateType")}:</td>
                            <td>{singleData?.PanelName}</td>
                          </tr>
                        </tbody>
                      </Tables>
                      <div className="mt-3">
                        {handleSearchWiseDetails(
                          singleData?.CultureStatus,
                          singleData,
                        )}
                      </div>
                    </Accordion>
                  )}
                  {loading && <Loading />}
                </div>
              )}
            </div>
          )}{" "}
        </>
      )}
    </>
  );
}

export default MicroLabEntry;
