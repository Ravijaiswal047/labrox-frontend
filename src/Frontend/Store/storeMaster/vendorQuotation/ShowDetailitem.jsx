import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Heading from "../../../../components/UI/Heading";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Input from "../../../../components/formComponent/Input";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { exportToExcel } from "../../../../utils/helpers";
import { toast } from "react-toastify";
const ShowDetailitem = ({ items }) => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);

  const ShowDetailitemAPI = async (id) => {
    const requstBody = {
      itemId: String(items?.Itemid),
      type: String(1),
    };
    await axiosInstance
      .post("/VendorQuotation/ShowDetailitem", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        let success = res?.data?.success;
        if (success) {
          setTableData(data);
        }
      })
      .catch((err) => console.log("No Data Found"));
  };

  useEffect(() => {
    ShowDetailitemAPI();
  }, []);
  return (
    <>
      <div className="card mt-2">
        <Heading name={"Item Detail"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Category Type Name")}</th>
                  <th>{t("Sub Category Type Name")}</th>
                  <th>{t("Item Group Name")}</th>
                  <th>{t("Item ID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("HSN Code")}</th>
                  <th>{t("Item Code")}</th>
                  <th>{t("Is Active")}</th>
                  <th>{t("Description")}</th>
                  <th>{t("Specification")}</th>
                  <th>{t("Make and Model No")}</th>
                  <th>{t("Expirable")}</th>
                  <th>{t("Expiry Date Cutoff")}</th>
                  <th>{t("Temperature Stock")}</th>
                  <th>{t("GSTN Tax")}</th>
                  <th>{t("Manufacture Name")}</th>
                  <th>{t("Catalog No")}</th>
                  <th>{t("Machine Name")}</th>
                  <th>{t("Purchased Unit")}</th>
                  <th>{t("Converter")}</th>
                  <th>{t("Pack Size")}</th>
                  <th>{t("Consumption Unit")}</th>
                  <th>{t("Issue Multiplier")}</th>
                  <th>{t("Created Date")}</th>
                  <th>{t("Created By")}</th>
                  <th>{t("Checked Date")}</th>
                  <th>{t("Checked By")}</th>
                  <th>{t("Approved Date")}</th>
                  <th>{t("Approved By")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td>{row?.CategoryTypeName}</td>
                    <td>{row?.SubCategoryTypeName}</td>
                    <td>{row?.ItemGroupName}</td>
                    <td>{row?.ItemName}</td>
                    <td>{row?.HSNCode}</td>
                    <td>{row?.itemCode}</td>
                    <td>{row?.IsActive}</td>
                    <td>{row?.Description}</td>
                    <td>{row?.Specification}</td>
                    <td>{row?.MakeandModelNo}</td>
                    <td>{row?.Expirable}</td>
                    <td>{row?.Expdatecutoff}</td>
                    <td>{row?.TemperatureStock}</td>
                    <td>{row?.GSTNTax}</td>
                    <td>{row?.ManufactureName}</td>
                    <td>{row?.CatalogNo}</td>
                    <td>{row?.MachineName}</td>
                    <td>{row?.PurchasedUnit}</td>
                    <td>{row?.Converter}</td>
                    <td>{row?.PackSize}</td>
                    <td>{row?.ConsumptionUnit}</td>
                    <td>{row?.IssueMultiplier}</td>
                    <td>{row?.CreatedDate}</td>
                    <td>{row?.CreatedBy}</td>
                    <td>{row?.CheckedDate}</td>
                    <td>{row?.CheckedBy}</td>
                    <td>{row?.ApprovedDate}</td>
                    <td>{row?.Approv}</td>
                    <td>{row?.ApprovedBy}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowDetailitem;
