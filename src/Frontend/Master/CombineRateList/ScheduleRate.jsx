import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import DatePicker from "../../../components/formComponent/DatePicker";
import Input from "../../../components/formComponent/Input";
import Tables from "../../../components/UI/customTable";
import moment from "moment";
import { CustomButton } from "../../../components/UI/CustomButton";

const ScheduleRate = () => {
  const { t } = useTranslation();
  const [RateCentres, setRateCentres] = useState([]);
  const [ItemList, setItemList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    RateType: "",
    Item: "",
    Rate: "",
    FromDate: new Date(),
    ToDate: new Date(),
    ItemCode: "",
  });

  const getRateCenters = () => {
    axiosInstance
      .get("centre/getRateList", { params: { IsRateList: 0 } })
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setRateCentres(CentreDataValue);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getRateItemList = () => {
    axiosInstance
      .post("RateList/getItemList", {
        DepartmentID: 0,
        BillingCategory: 0,
      })
      .then((res) => {
        let data = res.data.message;
        let val = data.map((ele) => {
          return {
            ...ele,
            value: ele?.InvestigationID,
            label: ele?.TestName,
          };
        });
        setItemList(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getRateCenters();
    getRateItemList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSelectChange = (name, e) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.value,
      // If it's Item selection, automatically fill ItemCode if available
      ...(name === "Item" && {
        ItemCode: ItemList.find((item) => item.value === e.value)?.TestCode || "",
      }),
    }));
  };

  const handleAdd = () => {
    const { RateType, Item, Rate, FromDate, ToDate, ItemCode } = formData;

    if (!RateType && !Item) return toast.error("Please select Rate Type or Item");
    if (!Rate) return toast.error("Please enter Rate");
    if (!FromDate) return toast.error("Please select From Date");
    if (!ToDate) return toast.error("Please select To Date");

    const selectedRateType = RateCentres.find((x) => x.value === RateType);
    const selectedItem = ItemList.find((x) => x.value === Item);

    const isDuplicate = tableData.some(
      (row) => row.RateTypeID === RateType && row.TestID === Item
    );

    if (isDuplicate) {
      return toast.error("Rate for this item and rate type already added");
    }

    const newRow = {
      RateTypeID: RateType,
      RateTypeCode: RateType || "", // Using ID as code if specific code not available
      RateTypeName: selectedRateType?.label || "",
      TestID: Item,
      TestCode: selectedItem?.TestCode || "",
      TestName: selectedItem?.label || "",
      Rate: Rate,
      FromDate: moment(FromDate).format("DD-MMM-YYYY"),
      ToDate: moment(ToDate).format("DD-MMM-YYYY"),
      ItemCode: ItemCode || selectedItem?.TestCode || "",
    };

    setTableData([...tableData, newRow]);
    // Optionally reset some fields but maybe keep RateType for easier entry
    setFormData({
      ...formData,
      Item: "",
      Rate: "",
      ItemCode: "",
    });
  };

  const handleRemove = (index) => {
    const newData = [...tableData];
    newData.splice(index, 1);
    setTableData(newData);
  };

  return (
    <>
      <Accordion name={t("Schedule Rate")} defaultValue={true} isBreadcrumb={true}>
        <div className="row pt-2 px-2">
          <div className="col-sm-2 col-md-2">
            <ReactSelect
              dynamicOptions={RateCentres}
              id="RateType"
              placeholderName={t("Rate Type")}
              removeIsClearable={true}
              name="RateType"
              value={formData.RateType}
              onChange={(name, e) => handleSelectChange("RateType", e)}
              searchable={true}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <ReactSelect
              dynamicOptions={ItemList}
              id="Item"
              placeholderName={t("Item")}
              removeIsClearable={true}
              name="Item"
              value={formData.Item}
              onChange={(name, e) => handleSelectChange("Item", e)}
              searchable={true}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              type="number"
              name="Rate"
              value={formData.Rate}
              onChange={handleInputChange}
              lable={t("Rate")}
              id="Rate"
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <DatePicker
              name="FromDate"
              id="FromDate"
              lable={t("Contract From Date")}
              value={formData.FromDate}
              onChange={handleDateChange}
              dateFormat="dd-M-yy"
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <DatePicker
              name="ToDate"
              id="ToDate"
              lable={t("Contract To Date")}
              value={formData.ToDate}
              onChange={handleDateChange}
              dateFormat="dd-M-yy"
            />
          </div>
          
          <div className="col-sm-3 col-md-2">
            <Input
              type="text"
              name="ItemCode"
              value={formData.ItemCode}
              onChange={handleInputChange}
              lable={t("Item Code")}
              id="ItemCode"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              type="text"
              name="ItemDisplayName"
              value={formData.ItemDisplayName}
              onChange={handleInputChange}
              lable={t("Item Display Name")}
              id="ItemDisplayName"
            />
          </div>
          
          <div className="col-sm-1 mb-1">
            <CustomButton
            text={t("Add")}
            icon={'add'}
              onClick={handleAdd}
            />
              
          </div>
        </div>
      </Accordion>

      <Accordion title={t("Schedule Rate List")} defaultValue={true}>
        <div className="row p-2">
          <div className="col-12">
            {tableData.length > 0 ? (
              <Tables>
                <thead>
                  <tr>
                    <th>{t("Sr.No.")}</th>
                    <th>{t("RateTypeCode")}</th>
                    <th>{t("RateTypeName")}</th>
                    <th>{t("TestCode")}</th>
                    <th>{t("TestName")}</th>
                    <th>{t("Rate")}</th>
                    <th>{t("FromDate")}</th>
                    <th>{t("ToDate")}</th>
                    <th>{t("ItemCode")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.RateTypeCode}</td>
                      <td>{row.RateTypeName}</td>
                      <td>{row.TestCode}</td>
                      <td>{row.TestName}</td>
                      <td>{row.Rate}</td>
                      <td>{row.FromDate}</td>
                      <td>{row.ToDate}</td>
                      <td>{row.ItemCode}</td>
                      <td className="text-center">
                        <i
                          className="fa fa-trash text-danger"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemove(index)}
                        ></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            ) : (
              <div className="text-center">{t("No Record Found")}</div>
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ScheduleRate;
