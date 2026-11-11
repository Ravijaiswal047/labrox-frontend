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
const ShowGRNStatusPost = ({ items, OnChangeTax }) => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);

  const handlePostRowApi = async (id, type) => {
    const requstBody = {
      grnId: String(items.grnid || ""),
      type: String(items.type || ""),
    };
    await axiosInstance
      .post("GRNStatus/Post", { ...requstBody })
      .then((res) => {
        const respons = res?.data?.message;
        const status = res?.data?.success;

        if (status) {
          toast.success(respons);
        }
      });
  };
  return (
    <>
      <div className="card mt-2">
        <Heading
          name={`Do you want to  ${items.heading}`}
          isBreadcrumb={true}
        />
        <div className="row">
          <div className="col-sm-12">
            <div className="ShowGRNStatusPost-center-buttons">
              <button
                className="btn btn-sm btn-success"
                onClick={handlePostRowApi}
              >
                Yes
              </button>
              <button
                className="btn btn-sm btn-success"
                onClick={handlePostRowApi}
              >
                No
              </button>
            </div>
            {/* <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("View Item")}</th>
                  <th>{t("GRN No")}</th>
                  <th>{t("Barcode No")}</th>
                  <th>{t("Stock ID")}</th>
                  <th>{t("Item ID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Batch Number")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("Discount (%)")}</th>
                  <th>{t("Tax (%)")}</th>
                  <th>{t("Unit Price")}</th>
                  <th>{t("Is Free")}</th>
                  <th>{t("Price")}</th>
                  <th>{t("Converter")}</th>
                  <th>{t("Expiry Date")}</th>
                  <th>{t("Paid Qty")}</th>
                  <th>{t("Free Qty")}</th>
                  <th>{t("Initial Count")}</th>
                  <th>{t("Major Unit")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row?.barcodeno}</td>
                    <td>{row?.stockid}</td>
                    <td>{row?.itemid}</td>
                    <td>{row?.itemname}</td>
                    <td>{row?.batchnumber}</td>
                    <td>{row?.rate}</td>
                    <td>{row?.discountper}</td>
                    <td>{row?.taxper}</td>
                    <td>{row?.unitprice}</td>
                    <td>{row?.isfree}</td>
                    <td>{row?.price}</td>
                    <td>{row?.converter}</td>
                    <td>{row?.ExpiryDate}</td>
                    <td>{row?.PaidQty}</td>
                    <td>{row?.FreeQty}</td>
                    <td>{row?.initialcount}</td>
                    <td>{row?.MajorUnit}</td>
                  </tr>
                ))}
              </tbody>
            </Tables> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowGRNStatusPost;
