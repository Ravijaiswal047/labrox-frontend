import React, { useEffect, useState } from "react";
import CustomTable from "../../components/Table/CustomTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { Input } from "@profabric/react-components";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setRateTypeControllerData } from "../../store/reducers/loadingSlice/loadingSlice";
import {
  getChangedFlagRecords,
  getTrimmedData,
  handleFlagToggle,
  normalizeFlagValues,
  number,
  PreventSpecialCharacter,
} from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";

const RateTypeController = ({ rateTypeID = "", name = "" }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const propsData = rateTypeID?.data || "";
  const { rateTypeControllerData } = useSelector((data) => data?.loadingSlice);
  const [controllerTableData, setControllerTableData] = useState([]);

  const controllerColumns = [
    { header: "Sr. No", field: "SrNo", width: "4%" },
    { header: "FlagName", field: "FlagName", width: "16%" },
    { header: "Value", field: "Value", width: "16%" },
    { header: "Created By", field: "CreatedBy", width: "16%" },
    { header: "Created On", field: "CreatedOn", width: "16%" },
    { header: "Last Updated By", field: "LastUpdatedBy", width: "16%" },
    { header: "Last Updated On", field: "LastUpdatedOn", width: "16%" },
  ];

  const renderControl = (row) => {
    console.log("renderControlrow", row);
    switch (row.ControlType) {
      case "Checkbox":
        const isChecked = row.FlagValue === "1" || row.FlagValue === 1;
        return (
          <label
            className="switch"
            style={{ display: "flex", alignItems: "center", marginBottom: "0" }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleFlagToggle(setControllerTableData, row, e)}
            />
            <span className="slider round2"></span>
          </label>
        );

      case "TextBox":
        return (
          <Input
            onChange={(e) => {
              const value = e?.target?.value;
              setControllerTableData((prev) =>
                prev.map((r) =>
                  r?.FlagName === row?.FlagName
                    ? {
                        ...r,
                        FlagValue: value,
                        isChanged: value !== r?.originalFlagValue,
                      }
                    : r,
                ),
              );
            }}
            value={row?.FlagValue || ""}
            name="FlagValue"
            // className="required-fields"
            type="text"
            placeholder=""
            lable={t("Flag Value")}
            id="Visit No"
          />
        );

      case "Calender":
        const calendarValue = row?.FlagValue
          ? new Date(row?.FlagValue)
          : null;
        return (
          <DatePicker
            className="custom-calendar"
            name="Date"
            value={calendarValue}
            // onChange={(e) => {
            //   const value = e.target.value;
            //   setControllerTableData((prev) =>
            //     prev.map((r) =>
            //       r.FlagName === row.FlagName
            //         ? {
            //             ...r,
            //             FlagValue: value,
            //             isChanged: value !== r.originalFlagValue,
            //           }
            //         : r,
            //     ),
            //   );
            // }}
            onChange={(selectedDate) => {
              // selectedDate is already a Date
              const yyyy = selectedDate?.getFullYear();
              const mm = String(selectedDate?.getMonth() + 1).padStart(2, "0");
              const dd = String(selectedDate?.getDate()).padStart(2, "0");
              const hh = String(selectedDate?.getHours()).padStart(2, "0");
              const min = String(selectedDate?.getMinutes()).padStart(2, "0");
              const ss = String(selectedDate?.getSeconds()).padStart(2, "0");

              // Construct ISO manually using local time
              const isoValue = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}.000Z`;
              setControllerTableData((prev) =>
                prev.map((r) =>
                  r?.FlagName === row?.FlagName
                    ? {
                      ...r,
                      FlagValue: isoValue, // ✅ saved here
                      isChanged: isoValue !== r?.originalFlagValue,
                    }
                    : r
                )
              );
            }}
            placeholder=" "
            lable="Date"
            maxDate={new Date()}
          />
        );

      case "Dropdown":
        return (
          <ReactSelect
            dynamicOptions={row?.Options}
            name="Dropdown"
            lable={t("Select Flag")}
            removeIsClearable={true}
            placeholderName={t("Select Flag")}
            value={row.FlagValue || ""}
            onChange={(name, selectedOption) => {
              const value = selectedOption?.value || "";

              setControllerTableData((prev) =>
                prev.map((r) =>
                  r?.FlagName === row.FlagName
                    ? {
                        ...r,
                        FlagValue: value,
                        isChanged: value !== r?.originalFlagValue, // ✅ change tracking
                      }
                    : r,
                ),
              );
            }}
          />
        );

      default:
        return row.FlagValue || "";
    }
  };

  const controllerRenderData = controllerTableData.map((row, index) => ({
    ...row,
    Value: renderControl(row),
  }));

  const GetRateTypesController = async (cntID = "") => {
    await axiosInstance
      .post(apiUrls?.GetRateTypes, {
        centreId: String(cntID),
        DataType: name == "center" ? "Centre" : "RateType"
      })
      .then((res) => {
        if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          // console.log("company res", res);
          setControllerTableData(normalizeFlagValues(res.data.data));
        }
        // setControllerTableData(res?.data?.data)
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("xxxx");
      });
  };

  const updateRateTypeController = async () => {
    await axiosInstance(apiUrls?.InsertCentre, {
      flagRates: controllerTableData,
    })
      .then((res) => {
        setControllerTableData(res?.data?.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("xxxx");
      });
  };

  useEffect(() => {
    if (propsData?.CentreID) {
      GetRateTypesController(propsData?.CentreID);
    }
    else{
      GetRateTypesController("");
    }
  }, [propsData?.centreID, propsData]);

  useEffect(() => {
    dispatch(setRateTypeControllerData(controllerTableData));
  }, [controllerTableData]);

  console.log("propsData", propsData);
  console.log("controllerTableData", controllerTableData);
  console.log("controllerRenderData",controllerRenderData);

  return (
    <>
      <div>
        <CustomTable
          columns={controllerColumns}
          data={controllerRenderData}
          theadStyle={{ zIndex: 1 }}
          scrollView="scroll"
          tableHeight="table-responsive"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        />
      </div>
    </>
  );
};

export default RateTypeController;
