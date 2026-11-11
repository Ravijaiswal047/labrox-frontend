import React, { useEffect, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { AddBlankData } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Cursor from "quill/blots/cursor";

function ImmunoAntibody({ setAntibodyRows, antibodyRows,REStatus }) {
  const MarkerResultOptions = [
    "clone",
    "type",
    "stainingResult",
    "intensity",
    "pattern",
    "percentage",
  ];

  const optionNames = [
    "Clone",
    "Type",
    "StainingResult",
    "Intensity",
    "Pattern",
    "Parcentage",
  ];
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    MarkerName: "",
    MarkerId: "",
  });

  const [mappingHelp, setMappingHelp] = useState([]);
  const [getMapItem, setGetMapItem] = useState([]);

  const [load, setLoad] = useState(false);
  const [rows, setRows] = useState([]);

  const [markerData, setMarkerData] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState({});

  // useEffect(() => {
  //   // Guard clause
  //   if (!rows || rows.length === 0) return;
  //   const optionNames = [
  //     "Clone",
  //     "Type",
  //     "StainingResult",
  //     "Intensity",
  //     "Pattern",
  //     "Parcentage",
  //   ];

  //   const temp = {};

  //   optionNames.forEach((name) => {
  //     const helpData = mappingHelp || [];
  //     temp[name] = helpData
  //       .filter((ele) => ele.ResultOption === name)
  //       .map((ele) => ({
  //         label: ele.Help,
  //         value: ele.helpid,
  //         isBold: ele?.Isbold,
  //       }));
  //   });

  //   setFilteredOptions(temp); // 🔥 executes ONLY 6 times
  // }, [rows]);

  useEffect(() => {
    if (setAntibodyRows) {
      setAntibodyRows(rows);
    }
  }, [rows]);

  useEffect(() => {
    if (antibodyRows && antibodyRows.length > 0) {
      const bindAntibodyHelp = antibodyRows.map((ele) => {
        return {
          ...ele,
          clone: ele?.clone,
        };
      });
      setRows(antibodyRows);
      setFormData({
        ...formData,
        MarkerName: antibodyRows?.[0]?.MarkerName,
        MarkerId: antibodyRows?.[0]?.MarkerID,
      });
      mapHelpMenu(antibodyRows?.[0]?.MarkerID);
    }
  }, [antibodyRows?.length > 0]);

  const handleTestSearch = () => {
    setLoad(true);
    axiosInstance
      .post("IHC/GetIHCMarker", {
        TypeName: "Marker",
        ID: 0,
      })
      .then((res) => {
        setLoad(false);
        let data = res.data.message;
        let response = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.Name,
          };
        });
        setMarkerData(response);
      })
      .catch((err) => {
        setLoad(false);
        setMarkerData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong."
        );
      });
  };

  const getDropdownOptions = (DropdownValue, optionName) => {
    const filteredDropDownData =
      DropdownValue?.filter((ele) => ele.ResultOption === optionName)?.map(
        (ele) => ({
          label: ele.Help,
          value: ele.helpid,
        })
      ) || [];

    return filteredDropDownData;
  };

  const mapHelpMenu = (MarkerId) => {
    axiosInstance
      .post("IHC/MappedData", {
        MasterID: MarkerId,
      })
      .then((res) => {
        const data = res?.data?.message;
        const DropdownValue = res?.data?.data;
        const val = data.map((ele) => {
          return {
            ...ele,
            MapTypeID: "1",
          };
        });
        setGetMapItem(val);
        setMappingHelp(DropdownValue);

        const temp = {};

        optionNames.forEach((name) => {
          const helpData = DropdownValue || [];
          temp[name] = helpData
            .filter((ele) => ele.ResultOption === name)
            .map((ele) => ({
              label: ele.Help,
              value: ele.helpid,
              isBold: ele?.Isbold,
            }));
        });

        setFilteredOptions(temp);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong"
        );
      });
  };

  const fetchMap = (MarkerId) => {
    axiosInstance
      .post("IHC/MappedData", {
        MasterID: MarkerId,
      })
      .then((res) => {
        const data = res?.data?.message;
        const DropdownValue = res?.data?.data;
        const val = data.map((ele) => {
          return {
            ...ele,
            MapTypeID: "1",
          };
        });
        setGetMapItem(val);
        const tableRows = val.map((ele) => ({
          Antibody: ele.NAME,
          MarkerID: MarkerId,
          MapID: ele.MapID,
          MapTypeID: ele.MapTypeID,
          clone: "",
          cloneisBold: "",
          type: "",
          typeisBold: "",
          stainingResult: "",
          stainingResultisBold: "",
          intensity: "",
          intensityisBold: "",
          pattern: "",
          patternisBold: "",
          percentage: "",
          percentageisBold: "",
        }));

        setMappingHelp(DropdownValue);
        setRows(tableRows);
        const temp = {};

        optionNames.forEach((name) => {
          const helpData = DropdownValue || [];
          temp[name] = helpData
            .filter((ele) => ele.ResultOption === name)
            .map((ele) => ({
              label: ele.Help,
              value: ele.helpid,
              isBold: ele?.Isbold,
            }));
        });

        setFilteredOptions(temp);
      })
      .catch((err) => {
        setRows([]);

        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong"
        );
      });
  };

  useEffect(() => {
    handleTestSearch();
  }, []);

  const handleSearchSelectChange = async (rowIndex, label, value) => {
    const antibodyColumns = [
      "clone",
      "type",
      "stainingResult",
      "intensity",
      "pattern",
      "percentage",
    ];

    if (label == "MarkerId") {
      const MarkerName = value?.label;
      const MarkerId = value?.value;

      setFormData({
        ...formData,
        MarkerId: MarkerId,
        MarkerName: MarkerName,
      });

      fetchMap(MarkerId);
    }
    if (antibodyColumns.includes(label)) {
      const updatedRows = [...rows];

      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        // [label]: {
        //   label: value.label,
        //   value: value.value,
        //   isBold: value?.isBold,
        // },
        [label]: value?.value,
        [`${label}isBold`]: value?.isBold,
      };
      setRows(updatedRows);
    }
  };

  return (
    <div>
      <Accordion
        name={t("Immuno HistoChemistry Antibodies")}
        defaultValue={true}
        isBreadcrumb={true}
        notOpen={true}
        linkTo="/immunoresultEntry"
        linkTitle={
          <div className="row">
            <div className="pt-2" style={{ width: "200px" }}>
              <ReactSelect
                dynamicOptions={markerData}
                name="MarkerId"
                lable={t("Marker")}
                id="Marker"
                removeIsClearable={true}
                placeholderName={t("Marker")}
                value={formData?.MarkerId}
                onChange={(label, value) =>
                  handleSearchSelectChange("", label, value)
                }
                isDisabled={REStatus === "Approved"}
              />
            </div>
            <div className="p-2">
              {/* <button
                className="btn btn-block btn-success btn-sm"
                //   onClick={handleSave}
              >
                {t("Save Mapping")}
              </button> */}
              {/* <SaveButton
                text={"Save Mapping"}
                id="btnSave"
                onClick={handleSave}
              /> */}
            </div>
          </div>
        }
      >
        <div className="row p-2">
          <div className="col-12">
            <Tables
              style={{
                maxHeight: "142px",
                overflowY: "auto",
              }}
            >
              <thead className="cf sticky-top">
                <tr>
                  <th className="text-center">{t("Sr.No")}</th>
                  <th className="text-center">{t("Antibody")}</th>
                  <th className="text-center">{t("Clone")}</th>
                  <th className="text-center">{t("Type")}</th>
                  <th className="text-center">{t("Staining Result")}</th>
                  <th className="text-center">{t("Intensity")}</th>
                  <th className="text-center">{t("Pattern")}</th>
                  <th className="text  -center">{t("Percentage")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, dayIndex) => (
                  <tr key={dayIndex}>
                    <td data-title={t("Sr.No")} className="text-center">{dayIndex + 1}</td>

                    <td data-title={t("Antibody")} className="text-center">{row?.Antibody}</td>
                    {MarkerResultOptions.map((roundKey) => {
                      const optionNameMap = {
                        clone: "Clone",
                        type: "Type",
                        stainingResult: "StainingResult",
                        intensity: "Intensity",
                        pattern: "Pattern",
                        percentage: "Parcentage",
                      };

                      const optionName = optionNameMap[roundKey];
                      return (
                        <td key={roundKey} data-title={t(optionName)}>
                          <ReactSelect
                            dynamicOptions={filteredOptions[optionName] || []}
                            className={
                              row?.[`${roundKey}isBold`] == 1 && "isBoldIHC"
                            }
                            name={roundKey}
                            id={roundKey}
                            removeIsClearable={true}
                            value={row[roundKey]}
                            onChange={(label, value) =>
                              handleSearchSelectChange(dayIndex, label, value)
                            }
                            isDisabled={REStatus==="Approved"}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </div>
  );
}

export default ImmunoAntibody;
