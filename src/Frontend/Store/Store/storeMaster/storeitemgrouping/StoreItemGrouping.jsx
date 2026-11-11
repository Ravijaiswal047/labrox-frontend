import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";

const StoreItemGrouping = () => {
  const { t } = useTranslation();

  const initialState = {
    GroupName: "",
    Items: [],
  };

  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [itemGrouping, setItemGrouping] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const getBindItems = async () => {
    try {
      const res = await axiosInstance.get("StoreItemGrouping/getItem");
      setItemList(res.data.message || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayloadMultiSelectNumbers = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => Number(item?.code));
  };

  const handleAdd = () => {
    if (!payload?.Items?.length > 0) {
      return toast.error("Select atleast one Item");
    }
    const datas = payload?.Items?.map((ele) => ({
      itemId: ele?.code,
      typeName: ele?.name,
    }));
    setTableData((prev) => [...prev, ...datas]);
  };

  const handleRemove = (indexToRemove) => {
    const updatedData = tableData?.filter(
      (_, index) => index !== indexToRemove
    );
    setTableData(updatedData);
  };
  const handleSave = async () => {
    if (!payload?.GroupName) {
      return toast.error("Group Name is Required");
    }
    if (!tableData?.length > 0) {
      return toast.error("Atleast one Row  Required in Item table");
    }
    const reqestbody = tableData?.map((ele) => ({
      itemId: String(ele?.itemId),
      groupName: String(payload?.GroupName || ""),
    }));
    try {
      const res = await axiosInstance.post(
        "StoreItemGrouping/savegroup",
        reqestbody
      );
      const response = res.data.message || [];
      toast?.success(response);
      setTableData([]);
      setPayload({ ...initialState });
      handleSearch();
    } catch (err) {
      toast?.error(err?.response?.data?.message);
    }
  };
  const handleSearch = async () => {
    try {
      const res = await axiosInstance.get("StoreItemGrouping/searcholdgroups");
      const response = res.data.message || [];

      setItemGrouping(response);
    } catch (err) {
      toast?.error(err?.response?.data?.message);
    }
  };
  const handleEdit = async (item) => {
    try {
      const res = await axiosInstance.get("StoreItemGrouping/groupitems", {
        params: { groupname: item || "" },
      });
      const response = res.data.message || [];

      setTableData(response);
    } catch (err) {
      toast?.error(err?.response?.data?.message);
    }
  };
  useEffect(() => {
    getBindItems();
    handleSearch();
  }, []);
  return (
    <>
      <div className="card">
        <Heading
          name="Store Item Grouping For Direct Issue"
          isBreadcrumb={true}
        />
        <div className="row p-2">
          <Input
            type="text"
            placeholder=" "
            lable="Group Name"
            id="GroupName"
            name="GroupName"
            value={payload.GroupName || tableData[0]?.groupName}
            onChange={handleChange}
            className={"required-fields"}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />

          <MultiSelctItems
            placeholderName="Items"
            name="Items"
            values={payload}
            setValues={setPayload}
            dynamicOptions={itemList}
            labelKey="typeName"
            valueKey="itemId"
            respclass="col-xl-4 col-sm-4 col-md-6 col-12"
            requiredClassName={"required-fields"}
          />

          <div className="col-sm-4 d-flex align-items-centre">
            <button className="btn btn-sm btn-success" onClick={handleAdd}>
              Add
            </button>
            <button
              className="btn btn-sm btn-success ml-2"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>

        {tableData?.length > 0 && (
          <div className="row">
            <div className="col-sm-12">
              <Tables>
                <thead>
                  <tr>
                    <th style={{ width: "7%" }}>{t("Sr No.")}</th>
                    <th>{t("Item ID")}</th>
                    <th>{t("Item Name")}</th>
                    <th style={{ width: "7%" }}>{t("Delete")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item?.itemId}</td>
                      <td>{item?.typeName}</td>
                      <td>
                        <span
                          // className="btn btn-sm btn-danger"
                          onClick={() => handleRemove(index)}
                        >
                          ❌
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        )}
      </div>
      {itemGrouping?.length > 0 && (
        <div className="card mt-2">
          <Heading name={"Group Detail"} isBreadcrumb={true} />
          <div className="row">
            <div className="col-sm-12">
              <Tables>
                <thead>
                  <tr>
                    <th style={{ width: "7%" }}>{t("Sr No.")}</th>
                    <th>{t("Group Name")}</th>
                    <th>{t("Create Date")}</th>
                    <th>{t("Create By")}</th>
                    <th style={{ width: "7%" }}>{t("View Item")}</th>
                  </tr>
                </thead>
                <tbody>
                  {itemGrouping?.map((row, index) => (
                    <tr key={index}>
                      <td data-title={t("Sr No.")}>{index + 1}</td>
                      <td data-title={t("Group Name")}>{row?.groupName}</td>
                      <td data-title={t("Create Date")}>{row?.entryDate}</td>
                      <td data-title={t("Create By")}>{row?.entryByName}</td>
                      <td data-title={t("View Item")}>
                        <i
                          className="fa fa-eye"
                          aria-hidden="true"
                          onClick={() => handleEdit(row?.groupName)}
                          style={{ cursor: "pointer" }}
                        ></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoreItemGrouping;
