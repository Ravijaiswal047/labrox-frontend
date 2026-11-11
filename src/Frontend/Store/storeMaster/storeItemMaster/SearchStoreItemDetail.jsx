import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Checked, PlusIcon } from "../../../../components/SvgIcons";
import Modal from "../../../../components/ModalComponent/Modal";
import StoreItemMasterDetailModel from "./StoreItemMasterDetailModel";
import StoreItemMasterApprovalModel from "./StoreItemMasterApprovalModel";
import { exportToExcel } from "../../../../utils/helpers";
import { CustomButton, SearchButton } from "../../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const SearchStoreItemDetail = ({ handleEdit }) => {

  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  const { t } = useTranslation();
  const initialState = {
    CategoryType: "sm.CategoryTypeID",
    Category: "",
    SearchBy: "sg.ItemNameGroup",
    Items: "",
    AppType: "",
    NoofRecord: "10",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);

  const handleSelectChange = (name, value) => {
    if (name === "CategoryType") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      GetAllSearchTypeCategory(value?.value);
    } else {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    }
  };
  console.log(payload);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  console.log({ payload })
  const searchStreItemMaster = () => {
    // debugger
    const requestBody = {
      searchType: String(payload?.SearchBy),
      searchValue: String(payload?.Items) || "",
      // category: String(payload?.Category) || "",
      categoryType: payload?.Category ? String(payload?.Category) : "",
      category: String(payload?.CategoryType),
      // categoryType: String(payload?.CategoryType),
      noOfRecord: Number(payload?.NoofRecord) || 0,
      appType: String(payload?.AppType) || "",
    };
    axiosInstance
      .post("InventryManageApprovalStore/SearchItemStore", requestBody)
      .then((res) => {
        const response = res.data?.data;
        console.log("res1", response);
        if (Array.isArray(response) && response.length > 0) {
          setTableData(response);
        } else {
          setTableData([]);
          toast.error("No Data Found");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(err?.response?.data?.message);
      });
  };

  const CategoryTypeeOption = [
    { label: "Select", value: "" },
    { label: "Category Type", value: "sm.CategoryTypeID" },
    { label: "SubCategory Type", value: "sm.SubCategoryTypeID" },
    { label: "Item Group", value: "sm.ItemGroupId" },
    { label: "Manufacture", value: "sm.ManufactureID" },
    { label: "Machine", value: "sm.MachineId" },
  ];
  const SearchByOption = [
    { label: "Select", value: "" },
    { label: "Item Name", value: "sg.ItemNameGroup" },
    { label: "Hsn Code", value: "sm.hsncode" },
    { label: "Item Code", value: "sm.itemidgroup" },
  ];
  const AppTypeOption = [
    { label: "Select", value: "" },
    { label: "Maked", value: "0" },
    { label: "Checked", value: "1" },
    { label: "Approved", value: "2" },
  ];
  const [category, setCategory] = useState([]);
  const GetAllSearchTypeCategory = (type) => {
    console.log(type);
    axiosInstance
      .get("InventryManageApprovalStore/BindAllDataToSearch", {
        params: { type: type || "" },
      })
      .then((res) => {
        if (res?.data?.success) {
          let response = res?.data?.message;
          if (response?.length > 0) {
            setCategory(response);
          } else {
            toast?.error("No Data Found");
          }
        } else {
          toast.error("something went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong"
        );
      });
  };
  const [modalData, setModalData] = useState({});
  const [handleModelData, setHandleModelData] = useState({});
  const handleModel = (
    label,
    width,
    type,
    isOpen,
    Component,
    handleInsertAPI,
    extrabutton
  ) => {
    setHandleModelData({
      label: label,
      width: width,
      type: type,
      isOpen: isOpen,
      Component: Component,
      handleInsertAPI: handleInsertAPI,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
  };
  useEffect(() => {
    setHandleModelData((val) => ({ ...val, modalData: modalData }));
  }, [modalData]);

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };
  const handleSelectEdit = (item) => {
    console.log(item, "selected item");
    handleEdit(item);
  };
  // const handleExcelDownload = (tableData) => {
  //   exportToExcel(tableData, "Search Item Master Details");
  // };
  const handleExcelDownload = (tableData) => {
    const updatedData = tableData.map((item) => {
      const { gstnTax, ...rest } = item;
      return {
        ...rest,
        [DefaultCurrencyName == "INR" ? "gstnTax" : "tax"]: gstnTax,
      };
    });
    exportToExcel(updatedData, "Search Item Master Details");
  };
  useEffect(() => { GetAllSearchTypeCategory(payload?.CategoryType) }, [])
  return (
    <>
      <Accordion
        name={t("Search Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <ReactSelect
            name="NoofRecord"
            id="NoofRecord"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "5", value: "5" },
              { label: "10", value: "10" },
              { label: "20", value: "20" },
              { label: "50", value: "50" },
              { label: "100", value: "100" },
              { label: "All", value: "2000" },
            ]}
            placeholderName="No of Record"
            value={payload?.NoofRecord}
            onChange={handleSelectChange}
            respclass={"col-xl-1 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="CategoryType"
            id="CategoryType"
            removeIsClearable={true}
            dynamicOptions={CategoryTypeeOption}
            placeholderName="Category Type"
            value={payload?.CategoryType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Category"
            id="Category"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Select", value: "" },
              ...category?.map((ele) => ({
                value: ele?.id,
                label: ele?.name,
              })),
            ]}
            placeholderName="Category"
            value={payload?.Category}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="SearchBy"
            id="SearchBy"
            removeIsClearable={true}
            dynamicOptions={SearchByOption}
            placeholderName="SearchBy"
            value={payload?.SearchBy}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Items"
            id="Items"
            name="Items"
            value={payload?.Items}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="AppType"
            id="AppType"
            removeIsClearable={true}
            dynamicOptions={AppTypeOption}
            placeholderName="App Type"
            value={payload?.AppType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="row ml-2 p-2" style={{ gap: "10px" }}>
            <SearchButton text={t("Search")} onClick={searchStreItemMaster} />
            {tableData?.length > 0 && (
              <CustomButton
                text={t("Excel")}
                icon="excel"
                onClick={() => handleExcelDownload(tableData)}
              />
            )}
          </div>

        </div>
      </Accordion>
      {tableData?.length > 0 && (
        <div className="card">
          <div className="row">
            <div className="col-sm-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead style={{ position: "sticky", top: "0" }}>
                  <tr>
                    <th style={{ width: "2%" }}>{t("#")}</th>
                    <th style={{ width: "3%" }}>{t("#")}</th>
                    <th style={{ width: "3%" }}>{t("Edit")}</th>
                    <th>{t("Category Type")}</th>
                    <th>{t("Sub Category Type")}</th>
                    <th>{t("Item Type")}</th>
                    <th>{t("Item Name")}</th>
                    {DefaultCurrencyName == "INR" && <th>{t("HSN Code")}</th>}
                    <th>{t("Item Code")}</th>
                    <th>{t(DefaultCurrencyName == "INR" ? "GST Tax" : "Tax")}</th>
                    <th>{t("Expirable")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((item, index) => (
                    <tr key={index}>
                      <td data-title="#">
                        <span
                          className="ml-1"
                          onClick={() =>
                            handleModel(
                              "Item Detail",
                              "80vw",
                              "Item Detail",
                              true,
                              <StoreItemMasterDetailModel
                                tableData={tableData}
                              />
                            )
                          }
                        >
                          {/* {index + 1} */}
                          <i
                            className="fa fa-search ml-2"
                            aria-hidden="true"
                          ></i>
                        </span>
                      </td>
                      <td data-title="View">
                        <span className="d-flex justify-content-center">
                          <button
                            className="btnAdd"
                            onClick={() =>
                              handleModel(
                                "Store Item Approval",
                                "80vw",
                                "Store Item Approval",
                                true,
                                <StoreItemMasterApprovalModel item={item} />
                              )
                            }
                          >
                            <PlusIcon />
                          </button>
                        </span>
                      </td>
                      <td data-title="Select">
                        <span className="d-flex justify-content-center">
                          <i
                            onClick={() => handleSelectEdit(item)}
                            className="fa fa-edit"
                            aria-hidden="true"
                          ></i>
                        </span>
                      </td>
                      <td data-title="Category Type">
                        {item?.categoryTypeName}
                      </td>
                      <td data-title="Sub Category Type">
                        {item?.subCategoryTypeName}
                      </td>
                      <td data-title="Item Type">{item?.itemGroupName}</td>
                      <td data-title="Item Name">{item?.itemName}</td>
                      {DefaultCurrencyName == "INR" && <td data-title="HSN Code">{item?.hsnCode}</td>}
                      <td data-title="Item Code">{item.apolloItemCode}</td>
                      <td data-title="GST Tax">{item?.gstnTax}%</td>
                      <td data-title="Expirable">
                        {item?.isExpirable === 1 ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        </div>
      )}
      {handleModelData?.isOpen && (
        <Modal
          visible={handleModelData?.isOpen}
          setVisible={setIsOpen}
          modalWidth={handleModelData?.width}
          Header={t(handleModelData?.label)}
          buttonType={"submit"}
          buttons={handleModelData?.extrabutton}
          modalData={handleModelData?.modalData}
          setModalData={setModalData}
        >
          {handleModelData?.Component}
        </Modal>
      )}
    </>
  );
};

export default SearchStoreItemDetail;
