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
const ShowDetailsModel = ({ items }) => {
  console.log("items", items);

  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  console.log("tableData", tableData);
  const ShowDetailsModel = async (id) => {
    const requstBody = {
      qutationno: String(items?.Qutationno),
    };
    await axiosInstance
      .post("/VendorQuotation/ShowDetails", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.details;
        let success = res?.status;
        if (success === 200) {
          setTableData(data);
        }
      })
      .catch((err) => console.log("No Data Found"));
  };
  const ItemDetailFirstItem = tableData[0]; // first item
  console.log("ItemDetailFirstItem", ItemDetailFirstItem);

  useEffect(() => {
    ShowDetailsModel();
  }, []);

  return (
    <>
      <div className="card mt-2">
        <Heading name={"Item Detail"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <table className="">
              <tbody>
                <tr>
                  <td colSpan="2">
                    <table className="">
                      <tbody>
                        <tr>
                          <td width="150px">
                            <b>Qutationno:</b>
                          </td>
                          <td width="350px">
                            {ItemDetailFirstItem?.qutationno}
                          </td>

                          <td width="150px">
                            <b>Quotationrefno:</b>
                          </td>
                          <td width="350px">
                            {ItemDetailFirstItem?.quotationrefno}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <b>Vendor Name:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.vendorName}</td>
                          <td>
                            <b>Vendor Address:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.vendorAddress}</td>
                        </tr>

                        <tr>
                          <td>
                            <b>State:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.vednorStateName}</td>
                          <td>
                            <b>Gstnno:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.vednorStateGstnno}</td>
                        </tr>

                        <tr>
                          <td>
                            <b>Delivery State:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.deliveryStateName}</td>

                          <td>
                            <b>From Date:</b>
                          </td>
                          <td>
                            {ItemDetailFirstItem?.entryDateFrom} &nbsp;&nbsp;
                            <b>To Date:</b>
                            &nbsp;&nbsp;{ItemDetailFirstItem?.entryDateTo}
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <b>Created By:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.createdBy}</td>
                          <td>
                            <b>Created Date:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.createdDate}</td>
                        </tr>

                        <tr>
                          <td>
                            <b>Checked By:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.checkedBy}</td>
                          <td>
                            <b>Checked Date:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.checkedDate}</td>
                        </tr>

                        <tr>
                          <td>
                            <b>Approved By:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.approvedBy}</td>
                          <td>
                            <b>Approved Date:</b>
                          </td>
                          <td>{ItemDetailFirstItem?.approvedDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <Tables>
              <thead>
                <tr>
                  <th>{t("entryDateFrom")}</th>
                  <th>{t("entryDateTo")}</th>
                  <th>{t("deliveryLocationName")}</th>
                  <th>{t("qutationno")}</th>
                  <th>{t("quotationrefno")}</th>
                  <th>{t("vendorName")}</th>
                  <th>{t("vendorAddress")}</th>
                  <th>{t("vednorStateName")}</th>
                  <th>{t("vednorStateGstnno")}</th>
                  <th>{t("deliveryStateName")}</th>
                  <th>{t("deliveryCentreName")}</th>
                  <th>{t("itemCategoryName")}</th>
                  <th>{t("itemName")}</th>
                  <th>{t("hsnCode")}</th>
                  <th>{t("manufactureName")}</th>
                  <th>{t("machineName")}</th>
                  <th>{t("rate")}</th>
                  <th>{t("qty")}</th>
                  <th>{t("freeQty")}</th>
                  <th>{t("igstPer")}</th>
                  <th>{t("discountPer")}</th>
                  <th>{t("sgstPer")}</th>
                  <th>{t("cgstPer")}</th>
                  <th>{t("buyPrice")}</th>
                  <th>{t("discountAmt")}</th>
                  <th>{t("gstAmount")}</th>
                  <th>{t("finalPrice")}</th>
                  <th>{t("createdDate")}</th>
                  <th>{t("createdBy")}</th>
                  <th>{t("checkedDate")}</th>
                  <th>{t("checkedBy")}</th>
                  <th>{t("approvedDate")}</th>
                  <th>{t("approvedBy")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td>{row?.entryDateFrom}</td>
                    <td>{row?.entryDateTo}</td>
                    <td>{row?.deliveryLocationName}</td>
                    <td>{row?.qutationno}</td>
                    <td>{row?.quotationrefno}</td>
                    <td>{row?.vendorName}</td>
                    <td>{row?.vendorAddress}</td>
                    <td>{row?.vednorStateName}</td>
                    <td>{row?.vednorStateGstnno}</td>
                    <td>{row?.deliveryStateName}</td>
                    <td>{row?.deliveryCentreName}</td>
                    <td>{row?.itemCategoryName}</td>
                    <td>{row?.itemName}</td>
                    <td>{row?.hsnCode}</td>
                    <td>{row?.manufactureName}</td>
                    <td>{row?.machineName}</td>
                    <td>{row?.rate}</td>
                    <td>{row?.qty}</td>
                    <td>{row?.freeQty}</td>
                    <td>{row?.igstPer}</td>
                    <td>{row?.discountPer}</td>
                    <td>{row?.sgstPer}</td>
                    <td>{row?.cgstPer}</td>
                    <td>{row?.buyPrice}</td>
                    <td>{row?.discountAmt}</td>
                    <td>{row?.gstAmount}</td>
                    <td>{row?.finalPrice}</td>
                    <td>{row?.createdDate}</td>
                    <td>{row?.createdBy}</td>
                    <td>{row?.checkedDate}</td>
                    <td>{row?.checkedBy}</td>
                    <td>{row?.approvedDate}</td>
                    <td>{row?.approvedBy}</td>
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

export default ShowDetailsModel;
