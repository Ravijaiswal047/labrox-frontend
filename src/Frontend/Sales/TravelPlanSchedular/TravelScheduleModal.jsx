import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import Tables from "../../../components/UI/customTable";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";
import Loading from "../../../components/loader/Loading";
import Input from "../../../components/formComponent/Input";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import "../../Sales/TableOverflow.css";
const TravelScheduleModal = ({ show, onHide, schdule, data = [] }) => {
  console.log(schdule);
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;

  const theme = useLocalStorage("theme", "get");

  const handleModalClose = () => {
    onHide(false);
    setFunnels([]), setTeamOptions([]);
  };

  const [funnels, setFunnels] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [load, setLoad] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (data?.funnels) {
      setFunnels(
        data.funnels.map((f) => ({
          ...f,
          remark: "",
          jointWork: [],
          checked: false,
        })),
      );
    }

    if (data?.team) {
      setTeamOptions(
        data.team.map((t) => ({
          label: t.Name,
          value: t.EmployeeId,
        })),
      );
    }
  }, [data]);

  const handleSave = () => {
    const selectedRows = funnels.filter((f) => f.checked);

    if (selectedRows.length === 0) {
      toast.error(t("Please select Any Row"));
      return;
    }

    // const invalidJointWork = selectedRows.find(
    //   (f) => !f.jointWork || f.jointWork.length === 0,
    // );

    // if (invalidJointWork) {
    //   toast.error(t("Please select Joint Work"));
    //   return;
    // }

    const payload = {
      MslTokens: selectedRows.map((f) => {
        const ids = f.jointWork.join(",");
        const labels = teamOptions
          .filter((t) => f.jointWork.includes(t.value))
          .map((t) => t.label)
          .join(",");

        return `${f.MSLId}#${ids}#${labels}#${f.remark}`;
      }),
      TravelDate: schdule.selectedDate,
      DayName: schdule.Day,
      Month: schdule.Month,
      Year: schdule.Year,
    };
    axiosInstance.post("SalesFunnel/TravelSelectMsl", payload).then((res) => {
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        onHide(false);
        setLoad(false);
      } else {
        toast.error(res?.data?.message);
        setLoad(false);
      }
    });
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);

    const updated = funnels.map((f) => ({
      ...f,
      checked: checked,
    }));

    setFunnels(updated);
  };

  return (
    <Dialog
      header={schdule.selectedDate}
      visible={show}
      onHide={handleModalClose}
      className={theme}
      style={{ width: isMobile ? "95vw" : "90vw" }}
      modal
    >
      <div className="row d-flex">
        <div className="col-md-2 d-flex">
          <span
            className="statusConfirmed"
            style={{ backgroundColor: "lightpink" }}
          ></span>
          <label className="reprintLable" style={{ cursor: "pointer" }}>
            {t("Not Collected")}
          </label>
        </div>
        <div className="col-md-2 d-flex">
          <span
            className="statusConfirmed"
            style={{ backgroundColor: "yellow" }}
          ></span>
          <label className="reprintLable" style={{ cursor: "pointer" }}>
            {t("Limit Remaining")}
          </label>
        </div>
        <div className="col-md-2 d-flex">
          <span
            className="statusConfirmed"
            style={{ backgroundColor: "greenyellow" }}
          ></span>
          <label className="reprintLable" style={{ cursor: "pointer" }}>
            {t("Limit Completed")}
          </label>
        </div>
        <div className="col-md-2 d-flex">
          <span
            className="statusConfirmed"
            style={{ backgroundColor: "crimson" }}
          ></span>
          <label className="reprintLable" style={{ cursor: "pointer" }}>
            {t("Limit Exceeded")}
          </label>
        </div>
      </div>
      <div className="col-12">
        <Tables removeScrollOverFlow={true}
        // style={{
        //   maxHeight: "400px",
        //   overflowY: "auto",
        // }}
        >
          <tr>
            <thead style={{ position: "sticky", top: 0, }}>
              <tr>
                <th style={{ width: "2%" }}>{t("S.No")}</th>
                <th style={{ width: "2%" }}>{t("Category")}</th>
                <th>{t("Pres./Non Pres.")}</th>
                <th>{t("Tagged With")}</th>
                <th>{t("Client Name")}</th>
                <th>{t("Doctor")}</th>
                {/* <th>{t("Meeting Days")}</th> */}
                <th>{t("MeetStartTime")}</th>
                <th>{t("State")}</th>
                <th>{t("City")}</th>
                <th>{t("Locality")}</th>
                <th>{t("Pincode")}</th>
                <th>{t("Calls")}</th>
                <th style={{ width: "12%" }}>{t("Remark")}</th>
                <th style={{ width: "12%" }}>{t("Joint Work")}</th>
                <th style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {funnels.map((row, index) => (
                <tr key={index} style={{ backgroundColor: row.RowColor }}>
                  <td
                    data-title={t("S.No")}
                    className="text-center"
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {index + 1}&nbsp;
                  </td>
                  <td
                    data-title={t("Category")}
                    className="text-center"
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {row.ExpectedCategoryName}
                  </td>
                  <td
                    data-title={t("Pres./Non Prescriber")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {row.ProspectTypeName}
                  </td>
                  <td
                    data-title={t("Tagged With")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {" "}
                    {row.CentreName}
                  </td>
                  <td
                    data-title={t("Client Name")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {row.OrganizationName}{" "}
                  </td>
                  <td
                    data-title={t("Doctor")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {" "}
                    {row.OPDDoctor}
                  </td>
                  {/* <td data-title={t("Meeting Days")}> {row.MeetingDays}</td> */}
                  <td
                    data-title={t("Meeting Start Time")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {row.MeetingStartTime}
                  </td>
                  <td
                    data-title={t("State")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {row.StateName}{" "}
                  </td>
                  <td
                    data-title={t("City")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {row.CityName}
                  </td>
                  <td
                    data-title={t("Locality")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {" "}
                    {row.Locality}
                  </td>
                  <td
                    data-title={t("Pincode")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {" "}
                    {row.Pincode}
                  </td>
                  <td
                    data-title={t("Selected Calls")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    {row.NoofExpectedCalls}
                  </td>
                  <td
                    data-title={t("Remark")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    <Input
                      value={row.remark}
                      onChange={(e) => {
                        const updated = [...funnels];
                        updated[index].remark = e.target.value;
                        setFunnels(updated);
                      }}
                    />
                  </td>

                  <td
                    data-title={t("Joint Work")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    <SelectBoxWithCheckbox
                      // autoSelectFirst={true}
                      className={"required-fields"}
                      options={teamOptions}
                      value={row.jointWork}
                      label={t("Select Team")}
                      onChange={(selected) => {
                        const updated = [...funnels];
                        updated[index].jointWork = selected.map((x) => x.value);
                        setFunnels(updated);
                      }}
                    />
                  </td>

                  <td className="text-center"
                    data-title={t("Action")}
                    style={{ backgroundColor: row.RowColor }}
                  >
                    <input
                      type="checkbox"
                      checked={row.checked}
                      onChange={(e) => {
                        const updated = [...funnels];
                        updated[index].checked = e.target.checked;

                        setFunnels(updated);


                        const allChecked = updated.every((f) => f.checked);
                        setSelectAll(allChecked);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </tr>
        </Tables>
        <div className="col-sm-2 mt-2 mb-2">
          {load ? (
            <Loading />
          ) : (
            <button
              className="btn btn-block btn-success btn-sm"
              onClick={handleSave}
            >
              {t("Schedule Calls")}
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default TravelScheduleModal;
