import React from "react";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";

const ItemWiseShare = ({ itemList, handleCheckboxChange }) => {
     const { t } = useTranslation();
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead>
              <tr>
                <th style={{ width: "5%", textAlign: "center" }}>
                  {t("S.No.")}
                </th>
                <th style={{ width: "50%", textAlign: "left" }}>
                  {t("Test Name")}
                </th>
                <th style={{ width: "15%", textAlign: "right" }}>
                  {t("ShareAmt")}
                </th>
                <th style={{ width: "15%", textAlign: "right" }}>
                  {t("Amount")}
                </th>
                <th style={{ width: "10%", textAlign: "center" }}>{t("#")}</th>
              </tr>
            </thead>
            <tbody>
              {itemList.map((item, index) => (
                <tr key={item.sNo}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td style={{ textAlign: "left" }}>{item.itemname}</td>
                  <td style={{ textAlign: "right" }}>{item.docshareamount}</td>
                  <td style={{ textAlign: "right" }}>{item.rate}</td>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(index)} // Placeholder for interaction
                      // If the checkbox should not be interactive, add `readOnly`
                      // readOnly
                    />
                  </td>
                </tr>
              ))}
              {itemList.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    {t("No data found.")}
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default ItemWiseShare;
