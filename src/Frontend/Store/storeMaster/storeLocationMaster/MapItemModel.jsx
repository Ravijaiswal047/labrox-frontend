import React, { useEffect, useRef, useState } from "react";
import Tables from "../../../../components/UI/customTable";
import Heading from "../../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import "../../Indent/createIndent/Indent.css";
import * as XLSX from "xlsx";
import {
  GetBindcattype,
  GetBinditem,
  GetBindSubcattype,
  GetItemCategory,
  GetMachine,
} from "../../../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { exportToExcel } from "../../../../utils/helpers";
import { toast } from "react-toastify";
import { CustomButton, SaveButton, SearchButton } from "../../../../components/UI/CustomButton";
import Input from "../../../../components/formComponent/Input";
import { current } from "@reduxjs/toolkit";
import { RiFileExcel2Fill } from "react-icons/ri";

const MapItemModel = ({ items }) => {
  console.log(items?.locationID, "ITEMS");
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [DropDownList, setDropDownList] = useState({
    categorylist: [],
    subcategorylist: [],
    itemcategorylist: [],
    machinelist: [],
    items: [],
    locationlist: [],
  });

  const [payload, setPayload] = useState({
    CurrentLocation: items?.locationID,
    CategoryType: "",
    SubCategoryType: "",
    ItemCategory: "",
    Machine: "",
    Items: "",
  });

  const handleSelectChange = (name, value) => {
    console.log("value", value, name);
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };


  const handlePayloadMultiSelectNumbers = (data) => {
    if (!Array.isArray(data)) return [];
    const result = data.map((item) => Number(item?.code));
    console.log(result);
    return result;
  };

  const handleSelectMultiChange = (name, select) => {
    setPayload((prev) => {
      let updatedPayload = { ...prev, [name]: select };

      const categoryIds = handlePayloadMultiSelectNumbers(updatedPayload?.CategoryType);
      const subCategoryIds = handlePayloadMultiSelectNumbers(updatedPayload?.SubCategoryType);
      const itemCategoryIds = handlePayloadMultiSelectNumbers(updatedPayload?.ItemCategory);

      // 🔥 RESET DEPENDENT FIELDS (THIS IS WHAT YOU NEED)

      if (name === "CategoryType") {
        updatedPayload.SubCategoryType = [];
        updatedPayload.ItemCategory = [];
        updatedPayload.Items = [];

        GetBindSubcattype(categoryIds, (data) => {
          setDropDownList((prev) => ({ ...prev, subcategorylist: data }));
        });
      }

      if (name === "SubCategoryType") {
        updatedPayload.ItemCategory = [];
        updatedPayload.Items = [];

        GetItemCategory(subCategoryIds, (data) => {
          setDropDownList((prev) => ({ ...prev, itemcategorylist: data }));
        });
      }

      if (name === "ItemCategory") {
        updatedPayload.Items = [];
      }

      // 🔥 ITEMS API (independent)
      if (
        categoryIds.length ||
        subCategoryIds.length ||
        itemCategoryIds.length
      ) {
        GetBinditem(categoryIds, subCategoryIds, itemCategoryIds, (data) => {
          setDropDownList((prev) => ({ ...prev, items: data }));
        });
      }

      return updatedPayload;
    });
  };

  useEffect(() => {
    GetBindcattype((data) => {
      setDropDownList((prev) => ({ ...prev, categorylist: data }));
    });
    GetMachine((data) => {
      setDropDownList((prev) => ({ ...prev, machinelist: data }));
    });
  }, []);

  const ErrorHandling = () => {
    const errors = {};

    if (
      !payload?.CategoryType ||
      !Array.isArray(payload.CategoryType) ||
      payload.CategoryType.length === 0
    ) {
      errors.CategoryType = "Category Type is required";
    }

    if (
      !payload?.Items ||
      !Array.isArray(payload.Items) ||
      payload.Items.length === 0
    ) {
      errors.Items = "At least one item must be selected";
    }

    return errors;
  };

  const handleSaveMapItem = () => {
    const customerrors = ErrorHandling();
    if (Object.keys(customerrors)?.length > 0) {
      toast.error(Object.values(customerrors)[0]);
      return false;
    }
    axiosInstance
      .post("MappingStoreItemWithCentre/SaveMappingData", {
        items: handlePayloadMultiSelectNumbers(payload?.Items) || [0],
        centres: [payload?.CurrentLocation] || [0],
      })
      .then((res) => {
        let data = res.data.message;
        toast.success(data);
        handleSearch();
        handleReset();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  const MapLoction = () => {
    axiosInstance
      .post("MappingStoreItemWithCentre/bindlocation", {
        centreId: "",
        stateId: "",
        typeId: "",
        countryid: "",
        cityId: "",
        // currentLocation: String(payload.CurrentLocation),
      })
      .then((res) => {
        let data = res.data.message;
        const result = data
          ?.map((item) => ({
            label: item?.Location,
            value: item?.LocationID,
          }))
        setDropDownList((prev) => ({ ...prev, locationlist: result }));
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  useEffect(() => {
    MapLoction();
  }, []);

  const handleAllChanges = (e) => {
    const { name, value } = e.target;
    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        [name]: value,
      }))
    );
  };

  const handleChange = (index, name, value) => {
    setTableData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [name]: value } : row))
    );
  };

  const handleCheckboxChange = (index, field, checked) => {
    setTableData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: checked } : row))
    );
  };

  const handleAllCheckboxChange = (e) => {
    const isFirst = e.target.parentElement.innerText.includes("Delete");
    const field = isFirst ? "firstCheck" : "secondCheck";
    const checked = e.target.checked;

    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        [field]: checked,
      }))
    );
  };
  console.log(tableData);
  const handleAllItemDelete = () => {
    const selectedRows = tableData?.filter((ele) => ele.firstCheck === true);
    const selectedIds = selectedRows?.map((ele) => Number(ele?.mapId));
    console.log(selectedIds);
    axiosInstance
      .post("MappingStoreItemWithCentre/DeleteRows", {
        ids: selectedIds || "",
      })
      .then((res) => {
        let data = res.data.message;
        toast.success(data);
        handleSearch();
        // setTableData([]);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const handleAllItemPI = (row) => {
    console.log(row, "log");
    const selectedRows = tableData?.filter((ele) => ele.secondCheck === true);
    const selectedIds = selectedRows?.map((ele) => String(ele?.mapId));
    const idsWithStatus = tableData
      .filter((row) => row.secondCheck)
      .map((row) => `${row.mapId}#1`);

    axiosInstance
      .post("MappingStoreItemWithCentre/PIItemMapping", {
        id: idsWithStatus,
        locationId: String(payload?.CurrentLocation) || "",
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

  const handleExcelDownload = (tableData) => {
    exportToExcel(tableData, "MapItems");
  };

  useEffect(() => {
    // if (payload?.CurrentLocation) {
    handleSearch();
    // }
  }, []);

  const handleSearch = () => {
    axiosInstance
      .post("MappingStoreItemWithCentre/SearchData", {
        items: handlePayloadMultiSelectNumbers(payload?.Items) || [0],
        locationIds: [payload?.CurrentLocation] || [0],
      })
      .then((res) => {
        if (res?.data?.success) {
          setTableData(res.data.message);
        } else {
          setTableData([]);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
        );
        setTableData([]);
      });
  };


  const handleReset = () => {
    setPayload({
      ...payload,
      CategoryType: "",
      SubCategoryType: "",
      ItemCategory: "",
      Machine: "",
      Items: "",
    });
    setTableData([]);

  };

  const handleSaveMin = () => {
    const selectedRows = tableData?.filter(
      (row) => row?.secondCheck === true
    );
    console.log(selectedRows);
    if (!selectedRows?.length) {
      toast.error("Please select at least one Item PI");
      return;
    }
    const payloadData = {
      mappings: selectedRows.map((row) => ({
        mapId: Number(row?.mapId) || 0,
        minLevel: Number(row?.minLevel) || 0,
        reorderLevel: Number(row?.reorderLevel) || 0,
      })),
    };

    axiosInstance
      .post(
        "MappingStoreItemWithCentre/UpdateMappingWithLocations",
        payloadData
      )
      .then((res) => {
        toast.success(res?.data?.message || "Updated successfully");
        handleSearch();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Something went wrong"
        );
      });
  };
  const handleFileChange = (e) => {
    console.log(e)
    console.log(e.target.files[0], "files")
    const file = e.target.files[0];
    if (!file) return;
    const allowedExtensions = ["xls", "xlsx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Please upload only Excel file (.xls or .xlsx)");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        console.log("Excel JSON:", jsonData);
        const formattedData = jsonData.map((item) => ({
          mapId: Number(item?.mapId) || 0,
          minLevel: Number(item?.minLevel) || 0,
          reorderLevel: Number(item?.reorderLevel) || 0,
        }));

        await axiosInstance.post(
          "MappingStoreItemWithCentre/UpdateMappingWithLocations",
          {
            mappings: formattedData,
          }
        );

        toast.success("Excel Uploaded & Mapping Updated Successfully");

      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };


  useEffect(() => {
    if (payload?.CurrentLocation) {
      setPayload((prev) => ({
        ...prev,
        CategoryType: [],
        SubCategoryType: [],
        ItemCategory: [],
        Machine: [],
        Items: [],
      }));

      setDropDownList((prev) => ({
        ...prev,
        subcategorylist: [],
        itemcategorylist: [],
        items: [],
      }));

      setTableData([]);
    }
  }, [payload?.CurrentLocation]);

  return (
    <>
      <Heading name={"Item Detail"} isBreadcrumb={true} />
      <div className="row px-2 pt-2">
        <ReactSelect
          name="CurrentLocation"
          id="CurrentLocation"
          removeIsClearable={true}
          dynamicOptions={DropDownList?.locationlist}
          placeholderName="Current Location"
          value={payload?.CurrentLocation}
          onChange={handleSelectChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />

        <MultiSelctItems
          placeholderName="Category Type"
          name="CategoryType"
          values={payload}
          setValues={setPayload}
          labelKey="categoryTypeName"
          valueKey="categoryTypeID"
          dynamicOptions={DropDownList?.categorylist}
          handleChange={handleSelectMultiChange}
          requiredClassName={"required-fields"}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <MultiSelctItems
          placeholderName="Sub Category Type"
          name="SubCategoryType"
          values={payload}
          setValues={setPayload}
          labelKey="subCategoryTypeName"
          valueKey="subCategoryTypeID"
          dynamicOptions={DropDownList?.subcategorylist}
          handleChange={handleSelectMultiChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <MultiSelctItems
          placeholderName="Item Category"
          name="ItemCategory"
          values={payload}
          setValues={setPayload}
          labelKey="name"
          valueKey="subCategoryID"
          dynamicOptions={DropDownList?.itemcategorylist}
          handleChange={handleSelectMultiChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <MultiSelctItems
          placeholderName="Machine"
          name="Machine"
          values={payload}
          setValues={setPayload}
          labelKey="name"
          valueKey="id"
          dynamicOptions={DropDownList?.machinelist}
          handleChange={handleSelectMultiChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <MultiSelctItems
          placeholderName="Items"
          name="Items"
          values={payload}
          setValues={setPayload}
          labelKey="itemName"
          valueKey="itemId"
          dynamicOptions={DropDownList?.items}
          handleChange={handleSelectMultiChange}
          requiredClassName={"required-fields"}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <div
          className="col-sm-5 col-md-12 col-12 mb-2 d-flex"
          style={{ gap: "10px" }}
        >
          <SearchButton text={t("Search")} onClick={handleSearch} />
          <SaveButton text={t("Save")} onClick={handleSaveMapItem} />
          <CustomButton icon={"refresh"} text={t("Reset")} onClick={handleReset} />
          {/* <CustomButton icon={"excel"} text={t("Upload Excel")} /> */}
        </div>
      </div>

      {tableData?.length > 0 && (
        <>
          <div className="card mt-2">
            <Heading name={"Issue Detail"} isBreadcrumb={true} secondTitle={
              tableData?.length > 0 && (
                <RiFileExcel2Fill
                  size={24}
                  className="text-success mr-3"
                  style={{ cursor: "pointer" }}
                  title="Export to Excel"
                  onClick={() => handleExcelDownload(tableData)}
                />
              )
            } />
            <div className="row">
              <div className="col-sm-12">
                <Tables style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th>
                        <span className="ml-2">Sr. No.</span>
                      </th>
                      <th>IsPIItem</th>
                      <th>Centre</th>
                      <th>Location</th>
                      <th>Item</th>
                      <th>
                        Min Level
                        <Input
                          type="number"
                          name="minLevel"
                          className="form-control"
                          id="minLevel"
                          onChange={handleAllChanges}
                        />
                      </th>
                      <th>
                        Reorder Level
                        <Input
                          type="number"
                          className="form-control"
                          name="reorderLevel"
                          id="reorderLevel"
                          onChange={handleAllChanges}
                        />
                      </th>
                      <th>
                        <span className="d-flex justify-content-around">
                          <input
                            type="checkbox"
                            className="ml-2"
                            onChange={handleAllCheckboxChange}
                          />
                          <button
                            className="btn btn-danger btn-sm mt-2"
                            onClick={handleAllItemDelete}
                          >
                            Delete
                          </button>
                        </span>
                      </th>
                      <th>
                        <span className="d-flex justify-content-around">
                          <input
                            className="ml-2"
                            type="checkbox"
                            onChange={handleAllCheckboxChange}
                          />
                          <button
                            className="btn btn-danger btn-sm mt-2"
                            onClick={handleAllItemPI}
                          >
                            Item PI
                          </button>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td data-title={t("S.No")}>
                          <span className="ml-2">{index + 1}</span>
                        </td>
                        <td data-title={t("isPIItem")}>{row.isPIItem === true ? "Yes" : "No"}</td>
                        <td data-title={t("Centre")}>{row.centre}</td>
                        <td data-title={t("Location")}>{row.location}</td>
                        <td data-title={t("Item")}>{row.itemName}</td>
                        <td data-title={t("Min Level")}>

                          <Input
                            type="number"
                            className="form-control"
                            name="minLevel"
                            value={row.minLevel}
                            onChange={(e) =>
                              handleChange(index, "minLevel", e.target.value)
                            }
                          />
                        </td>
                        <td data-title={t("Reorder Level")}>
                          {/* <input
                            type="text"
                            className="form-control"
                            value={row.ReorderLevel}
                            name="ReorderLevel"
                            onChange={(e) =>
                              handleChange(
                                index,
                                "ReorderLevel",
                                e.target.value
                              )
                            }
                          /> */}
                          <Input
                            type="number"
                            className="form-control"
                            name="reorderLevel"
                            value={row.reorderLevel}
                            onChange={(e) =>
                              handleChange(
                                index,
                                "reorderLevel",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td data-title={t("Delete")}>
                          <span style={{ marginLeft: "15px" }}>
                            <input
                              type="checkbox"
                              checked={row.firstCheck}
                              name="firstCheck"
                              onChange={(e) =>
                                handleCheckboxChange(
                                  index,
                                  "firstCheck",
                                  e.target.checked
                                )
                              }
                            />
                          </span>
                        </td>
                        <td data-title={t("Item PI")}>
                          <span style={{ marginLeft: "15px" }}>
                            <input
                              type="checkbox"
                              checked={row.secondCheck}
                              name="secondCheck"
                              onChange={(e) =>
                                handleCheckboxChange(
                                  index,
                                  "secondCheck",
                                  e.target.checked
                                )
                              }
                            />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-sm-12 d-flex justify-content-end">
              <SaveButton text={t("Save Min,Record Level")} onClick={handleSaveMin} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MapItemModel;
