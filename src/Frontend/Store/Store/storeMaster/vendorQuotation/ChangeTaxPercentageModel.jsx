import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Heading from "../../../../components/UI/Heading";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Input from "../../../../components/formComponent/Input";
import {
  getBindCentreNew,
  getBindCentreType,
  getBindCity,
  getBindCountry,
  getBindLocation,
  getBindstate,
} from "../../../../utils/NetworkApi/commonApi";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { exportToExcel } from "../../../../utils/helpers";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/UI/CustomButton";
const ChangeTaxPercentageModel = ({ handleChangeModel, items, index, OnChangeTax }) => {
  console.log("modal data", items);

  const [dropDownApis, setDropDownApis] = useState({
    centretypebind: [],
    countrybind: [],
    statebind: [],
    citybind: [],
    centrebind: [],
    locationlist: [],
    locationbind: [],
  });
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  // const [payload, setPayload] = useState({
  //   CurrentLocation: items?.locationID,
  //   CentreType: [],
  //   CountryId: "",
  //   StateId: [],
  //   CityId: [],
  //   CentreId: [],
  //   LocationID: [],
  //   ItemName:items?.ItemName,
  //   OldTaxPercentage:"",
  //   NewTaxPercentage:""
  // });

  const [payload, setPayload] = useState({
    ItemName: items?.ItemName,
    OldTaxPercentage: items?.totalGST,
    NewTaxPercentage: "",
  });
  const handlePayloadMultiSelectNumbers = (data) => {
    console.log("Data received:", data);
    if (!Array.isArray(data)) return [];
    return data.map((item) => Number(item?.code));
  };
  const handlePayloadMultiSelectString = (data) => {
    console.log("Data received:", data);
    if (!Array.isArray(data)) return "";
    return data.map((item) => String(item?.code)).join(",");
  };

  const handleSelectChange = (name, value) => {
    if (name === "CentreType") return;
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
    if (name === "CountryId") {
      getBindstate(value?.value, (data) => {
        setDropDownApis((prev) => ({ ...prev, statebind: data }));
      });
    }
  };
  const handleSelectMultiChange = (name, select) => {
    setPayload((prev) => ({ ...prev, [name]: select }));
    switch (name) {
      case "CentreType":
        setPayload((prev) => ({ ...prev, [name]: select }));
        getBindCentreNew(
          [],
          handlePayloadMultiSelectNumbers(select),
          payload?.StoreNotCreated,
          (data) => {
            setDropDownApis((prev) => ({ ...prev, centrebind: data }));
          }
        );

        break;

      case "StateId":
        getBindCity(handlePayloadMultiSelectNumbers(select), (data) => {
          setDropDownApis((prev) => ({ ...prev, citybind: data }));
        });
        break;

      case "CityId":
        getBindCentreNew(
          handlePayloadMultiSelectNumbers(select),
          handlePayloadMultiSelectNumbers(payload?.CentreType),
          payload?.StoreNotCreated ?? "0",
          (data) => {
            setDropDownApis((prev) => ({ ...prev, centrebind: data }));
          }
        );
        break;

      case "CentreId":
        getBindLocation(
          handlePayloadMultiSelectNumbers(select),
          handlePayloadMultiSelectNumbers(payload?.StateId),
          handlePayloadMultiSelectNumbers(payload?.CentreType),
          handlePayloadMultiSelectNumbers(payload?.CountryId),
          handlePayloadMultiSelectNumbers(payload?.CityId),
          (data) => {
            setDropDownApis((prev) => ({ ...prev, locationbind: data }));
          }
        );
        break;

      default:
        break;
    }
  };

  // useEffect(() => {
  //   getBindCentreType((data) => {
  //     setDropDownApis((prev) => ({ ...prev, centretypebind: data }));
  //   });
  //   getBindCountry((data) => {
  //     setDropDownApis((prev) => ({ ...prev, countrybind: data }));
  //   });
  // }, []);
  const MapLoction = () => {
    axiosInstance
      .get("MappingStoreItemWithCentre/bindlocation", {
        centreId: "",
        stateId: "",
        typeId: "",
        countryid: "",
        cityId: "",
      })
      .then((res) => {
        let data = res.data.message;
        const result = data
          ?.map((item) => ({
            label: item?.location,
            value: item?.locationID,
          }))
          ?.find((option) => option?.value === items?.locationID);
        console.log([result]);
        setDropDownApis((prev) => ({ ...prev, locationlist: [result] }));
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const ErrorHandling = () => {
    const errors = {};

    if (
      !payload?.CentreType ||
      !Array.isArray(payload.CentreType) ||
      payload.CentreType.length === 0
    ) {
      errors.CentreType = "Centre Type is required";
    }
    if (!payload?.CountryId || payload.CountryId === "") {
      errors.CountryId = "Country is required";
    }
    if (
      !payload?.CentreId ||
      !Array.isArray(payload.CentreId) ||
      payload.CentreId.length === 0
    ) {
      errors.CentreId = "At least one Centre must be selected";
    }
    if (
      !payload?.LocationID ||
      !Array.isArray(payload.LocationID) ||
      payload.LocationID.length === 0
    ) {
      errors.LocationID = "At least one Location must be selected";
    }

    return errors;
  };
  const handleSearch = () => {
    axiosInstance
      .post("CenterIndentRight/SearchData", {
        fCenterID: [Number(items?.locationID)],
        tCenterID: handlePayloadMultiSelectNumbers(payload?.LocationID) || [],
        indentType: "SI",
      })
      .then((res) => {
        let data = res.data.message;
        setTableData(data);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  // const handleSave = () => {
  //   const customerrors = ErrorHandling();
  //   if (Object.keys(customerrors)?.length > 0) {
  //     toast.error(Object.values(customerrors)[0]); // show first error
  //     return false;
  //   }
  //   axiosInstance
  //     .post("CenterIndentRight/SubmitData", {
  //       fCenterIDs: [Number(items?.locationID)] || [0],
  //       tCenterIDs: handlePayloadMultiSelectNumbers(payload?.LocationID) || [0],
  //       indentType: "SI",
  //     })
  //     .then((res) => {
  //       let data = res.data.message;
  //       toast.success(data);
  //       handleSearch();
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       toast.error("Something went wrong");
  //     });
  // };
  const handleRemove = () => {
    const selectedRows = tableData?.filter((ele) => ele.isActive === true);
    const selectedIds = selectedRows?.map((ele) => String(ele?.id));
    axiosInstance
      .post("CenterIndentRight/RemoveData", {
        id: selectedIds,
      })
      .then((res) => {
        let data = res.data.message;
        toast.success(data);
        handleSearch();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  const handleCheckboxChange = (index, field, checked) => {
    setTableData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: checked } : row))
    );
  };

  const handleAllCheckboxChange = (e) => {
    const isFirst = e.target.parentElement.innerText.includes("Delete");
    const field = isFirst ? "isActive" : "secondCheck";
    const checked = e.target.checked;

    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        [field]: checked,
      }))
    );
  };
  const handleReset = () => {
    setPayload({
      ItemName: items?.ItemName,
      OldTaxPercentage: "",
      NewTaxPercentage: "",
    });
    // setTableData([]);
  };
  const handleExcelDownload = (tableData) => {
    exportToExcel(tableData, "StoreLocationSIModel");
  };
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setTaxValue((prev) => ({ ...prev, [name]: value }));
  // };

  //   const handleChange = (e) => {
  //   setTaxValue(e.target.value);
  // };
  //   const [taxValue, setTaxValue] = useState(items?.gstntax || 0);



  const [taxValue, setTaxValue] = useState({
    NewTaxPercentage: items?.gstntax || "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeTax = () => {
    if (payload?.NewTaxPercentage === "") {
      return toast?.warn("Plese input New Tax Percentage")
    }
    OnChangeTax(index, payload?.NewTaxPercentage);
  };
  return (
    <>
      <div className="card">
        <Heading name={"Change Tax Percentage"} isBreadcrumb={true} />
        <div className="row px-2 pt-2">
          {/* <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            dynamicOptions={dropDownApis?.locationlist}
            placeholderName="Current Location"
            value={payload?.CurrentLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          /> */}
          {/* <MultiSelctItems
            placeholderName="Centre Type"
            values={payload}
            setValues={setPayload}
            name="CentreType"
            dynamicOptions={dropDownApis?.centretypebind}
            labelKey="type1"
            valueKey="id"
            requiredClassName={"required-fields"}
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          /> */}
          <Input
            type="text"
            placeholder=" "
            lable="Item Name"
            id="ItemName"
            name="ItemName"
            value={payload?.ItemName}
            onChange={handleChange}
            disabled={true}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Old Tax Percentage"
            id="OldTaxPercentage"
            name="OldTaxPercentage"
            value={taxValue?.NewTaxPercentage}
            disabled={true}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="New Tax Percentage"
            id="NewTaxPercentage"
            name="NewTaxPercentage"
            value={payload?.NewTaxPercentage}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-3 d-flex" style={{ gap: '10px' }}>
            {/* <button
              className="btn btn-sm btn-success"
              onClick={handleChangeTax}
            >
              {t("Change Tax")}
            </button>
            <button
              className="btn btn-sm btn-success ml-2"
              onClick={handleReset}
            >
              {t("Reset")}
            </button> */}

            <CustomButton icon={"forword"} text={t("Change Tax")} onClick={handleChangeTax} className="ml-2" />
            <CustomButton icon={"refresh"} text={t("Reset")} onClick={handleReset} className="ml-2" />

            {/* <button
              className="btn btn-sm btn-success ml-2"
              onClick={handleSearch}
            >
              {t("Search")}
            </button>
            <button
              className="btn btn-sm btn-success ml-2"
              onClick={() => handleExcelDownload(tableData)}
            >
              {t("Export To Excel")}
            </button> */}
          </div>
        </div>
      </div>
      {/* <div className="card mt-2">
        <Heading name={"Issue Detail"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr. No.")}</th>
                  <th>{t("From Location")}</th>
                  <th>{t("To Location")}</th>
                  <th>{t("Indent Type")}</th>
                  <th>
                    <>
                      <input
                        type="checkbox"
                        onChange={handleAllCheckboxChange}
                      />

                      <button
                        className="btn btn-sm btn-success ml-2"
                        onClick={handleRemove}
                      >
                        {t("Delete")}
                      </button>
                    </>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr. No.">{index + 1}</td>
                    <td data-title="From Location">{row?.fromCenter}</td>
                    <td data-title="To Location">{row?.toCenter}</td>
                    <td data-title="Indent Type">{row?.indentType}</td>
                    <td data-title="Delete">
                      <>
                        <input
                          type="checkbox"
                          checked={row.isActive}
                          name="isActive"
                          onChange={(e) =>
                            handleCheckboxChange(
                              index,
                              "isActive",
                              e.target.checked
                            )
                          }
                        />
                      </>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default ChangeTaxPercentageModel;
