import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Heading from "../../../components/UI/Heading";
import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import Input from "../../../components/formComponent/Input";
import Tables from "../../../components/UI/customTable";
import { axiosInstance } from "../../../utils/axiosInstance";
import { exportToExcel } from "../../../utils/helpers";
import { toast } from "react-toastify";
const ShowDetailitemGRNStatus = ({ items }) => {
  const { t } = useTranslation();

  const [tableData, setTableData] = useState([]);
  console.log("ShowDetailitemGRNStatus", tableData);
  const ShowDetailitemAPI = async (id) => {
    const requstBody = {
      grnId: String(items?.LedgerTransactionID),
    };
    await axiosInstance
      .post("/GRNStatus/BindItemDetail", {
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
            <Tables
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <thead>
                <tr>
                  <th className="text-center">{t("#")}</th>
                  {/* <th className="text-center">{t("Item Code")}</th> */}
                  <th className="text-center">{t("Item Name/Code")}</th>
                  <th className="text-center">{t("Converter")}</th>
                  <th className="text-center">{t("Barcode No")}</th>
                  <th className="text-center">{t("HSN Code")}</th>
                  <th className="text-center">{t("Category")}</th>
                  <th className="text-center">{t("Unit")}</th>
                  <th className="text-center">{t("Paid Qty")}</th>
                  <th className="text-center">{t("Free Qty")}</th>
                  <th className="text-center">{t("Batch Number")}</th>
                  <th className="text-center">{t("Expiry Date")}</th>
                  <th className="text-center">{t("Unit Price")}</th>
                  <th className="text-center">{t("Disc %")}</th>
                  <th className="text-center">{t("Tax %")}</th>
                  <th className="text-center">{t("Total Price")}</th>
                  <th className="text-center">{t("InHand Qty")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td className="text-center" data-title={t("#")}>
                      {index + 1}
                    </td>
                    {/* <td className="text-center" data-title={t("Item Code")}>{row?.itemid}</td> */}
                    <td className="text-center" data-title={t("Item Name")}>
                      {row?.itemname}/{row?.itemid}
                    </td>
                    <td className="text-center" data-title={t("Converter")}>
                      {row?.converter}
                    </td>
                    <td className="text-center" data-title={t("Barcode No")}>
                      {row?.barcodeno}
                    </td>
                    <td className="text-center" data-title={t("HSN Code")}>
                      {row?.HsnCode}
                    </td>
                    <td className="text-center" data-title={t("Category")}>
                      {row?.CategoryTypeCode}
                    </td>
                    <td className="text-center" data-title={t("Unit")}>
                      {row?.MajorUnit}
                    </td>
                    <td className="text-center" data-title={t("Paid Qty")}>
                      {row?.PaidQty}
                    </td>
                    <td className="text-center" data-title={t("Free Qty")}>
                      {row?.FreeQty}
                    </td>
                    <td className="text-center" data-title={t("Batch Number")}>
                      {row?.batchnumber}
                    </td>
                    <td className="text-center" data-title={t("Expiry Date")}>
                      {row?.ExpiryDate}
                    </td>
                    <td className="text-center" data-title={t("Unit Price")}>
                      {row?.price}
                    </td>
                    <td className="text-center" data-title={t("Disc %")}>
                      {row?.discountper}
                    </td>
                    <td className="text-center" data-title={t("Tax %")}>
                      {row?.taxper}
                    </td>
                    <td className="text-center" data-title={t("Total Price")}>
                      {row?.unitprice}
                    </td>
                    <td className="text-center" data-title={t("InHand Qty")}>
                      {row?.initialcount}
                    </td>
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

export default ShowDetailitemGRNStatus;
