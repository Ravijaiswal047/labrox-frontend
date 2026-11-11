import React from "react";
import Tables from "../../../../components/UI/customTable";
import { useTranslation } from "react-i18next";

const StoreItemMasterDetailModel = ({ tableData }) => {
     const { t } = useTranslation();
     console.log(tableData)
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead>
              <tr>
                <th>{t("CategoryTypeName")}</th>
                <th>{t("SubCategoryTypeName")}</th>
                <th>{t("ItemGroupName")}</th>
                <th>{t("Itemid")}</th>
                <th>{t("ItemName")}</th>
                <th>{t("HSNCode")}</th>
                <th>{t("ItemCode")}</th>
                <th>{t("IsActive")}</th>
                <th>{t("Description")}</th>
                <th>{t("Specification")}</th>
                <th>{t("MakeandModelNo")}</th>
                <th>{t("Expirable")}</th>
                <th>{t("Expdatecutoff")}</th>
                <th>{t("TemperatureStock")}</th>
                <th>{t("GSTNTax")}</th>
                <th>{t("ManufactureName")}</th>
                <th>{t("CatalogNo")}</th>
                <th>{t("MachineName")}</th>
                <th>{t("PurchasedUnit")}</th>
                <th>{t("Converter")}</th>
                <th>{t("PackSize")}</th>
                <th>{t("ConsumptionUnit	")}</th>
                <th>{t("IssueMultiplier")}</th>
                <th>{t("CreatedDate")}</th>
                <th>{t("CreatedBy")}</th>
                <th>{t("CheckedDate")}</th>
                <th>{t("CheckedBy")}</th>
                <th>{t("ApprovedDate")}</th>
                <th>{t("ApprovedBy")}</th>
              </tr>
            </thead>
            <tbody>
             {tableData?.map((item, index) => (
             <tr key={index}>
                <td data-title={t("CategoryTypeName")}>{item?.categoryTypeName}</td>
                <td data-title={t("SubCategoryTypeName")}>{item?.subCategoryTypeName}</td>
                <td data-title={t("ItemGroupName")}>{item?.itemGroupName}</td>
                <td data-title={t("Itemid")}>{item?.itemID}</td>
                <td data-title={t("ItemName")}>{item?.itemName}</td>
                <td data-title={t("HSNCode")}>{item?.hsnCode}</td>
                <td data-title={t("ItemCode")}>{item?.apolloItemCode}</td>
                <td data-title={t("IsActive")}>{item?.isActive ? "Yes" : "No"}</td>
                <td data-title={t("Description")}>{item?.description}</td>
                <td data-title={t("Specification")}>{item?.specification}</td>
                <td data-title={t("MakeandModelNo")}>{item?.makeAndModelNo}</td>
                <td data-title={t("Expirable")}>{item?.isExpirable === 1 ? "Yes" : "No"}</td>
                <td data-title={t("Expdatecutoff")}>{item?.expDateCutoff || "-"}</td>
                <td data-title={t("TemperatureStock")}>{item?.temperatureStock}</td>
                <td data-title={t("GSTNTax")}>{item?.gstnTax}%</td>
                <td data-title={t("ManufactureName")}>{item?.manufactureName || "-"}</td>
                <td data-title={t("CatalogNo")}>{item?.catalogNo || "-"}</td>
                <td data-title={t("MachineName")}>{item?.machineName || "-"}</td>
                <td data-title={t("PurchasedUnit")}>{item?.purchasedUnit || "-"}</td>
                <td data-title={t("Converter")}>{item?.converter || "-"}</td>
                <td data-title={t("PackSize")}>{item?.packSize || "-"}</td>
                <td data-title={t("ConsumptionUnit")}>{item?.consumptionUnit || "-"}</td>
                <td data-title={t("IssueMultiplier")}>{item?.issueMultiplier || "-"}</td>
                <td data-title={t("CreatedDate")}>{item?.createdDate || "-"}</td>
                <td data-title={t("CreatedBy")}>{item?.createdBy || "-"}</td>
                <td data-title={t("CheckedDate")}>{item?.checkedDate || "-"}</td>
                <td data-title={t("CheckedBy")}>{item?.checkedBy || "-"}</td>
                <td data-title={t("ApprovedDate")}>{item?.approvedDate || "-"}</td>
                <td data-title={t("ApprovedBy")}>{item?.approvedBy || "-"}</td>
                </tr>
            ))}
            </tbody>


          </Tables>
        </div>
      </div>
    </>
  );
};

export default StoreItemMasterDetailModel;
