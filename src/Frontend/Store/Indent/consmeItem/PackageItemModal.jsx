import React from "react";
import Heading from "../../../../components/UI/Heading";
import Tables from "../../../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";

export const PackageItemModal = ({ tableData, setTableData }) => {
  const { t } = useTranslation();
  const handleQtyChange = (index, value) => {
    const updated = [...tableData];
    updated[index].ItemQty = value;
    setTableData(updated);
  };
  const colorCodingData = [
    { color: "#ADD8E6", id: "1", labelKey: "In Stock" }, // Light Blue
    { color: "#FF6347", id: "2", labelKey: "Out of Stock" }, // Light Green
    { color: "#FFA500", id: "3", labelKey: "Low Available Qty" }, // Orange
    { color: "#90EE90", id: "4", labelKey: "Header" }, // Tomato Red
  ];
  return (
    <>
      <div className="card">
        <Heading
          name={"Package Item"}
          isBreadcrumb={true}
          secondTitle={
            <>
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  //   onClick={() => handleCallViewMedReq(id)}
                />
              ))}
            </>
          }
        />
        <div className="row px-2 py-2">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("ItemId")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("StockID")}</th>
                  <th>{t("Batch Number")}</th>
                  <th>{t("Expiry Date")}</th>
                  <th>{t("BarcodeNo")}</th>
                  <th>{t("Available Qty")}</th>
                  <th>{t("Consume Unit")}</th>
                  <th>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{t("Item Qty")}</span>

                      <input
                        type="text"
                        placeholder=""
                        // style={{ width: "100%" }}
                      />
                    </div>
                  </th>
                  <th>{t("Issue Qty")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="#">{index + 1}</td>
                    <td data-title="ItemId">{row?.ItemId}</td>
                    <td data-title="Item Name">{row?.ItemName}</td>
                    <td data-title="StockID">{row?.StockID}</td>
                    <td data-title="Batch Number">{row?.BatchNumber}</td>
                    <td data-title="Expiry Date">{row?.ExpiryDate}</td>
                    <td data-title="BarcodeNo">{row?.BarcodeNo}</td>
                    <td data-title="Available Qty">{row?.AvailableQty}</td>
                    <td data-title="Consume Unit">{row?.ConsumeUnit}</td>
                    <td data-title="Item Qty">
                      <input
                        type="number"
                        value={row?.ItemQty}
                        onChange={(e) => handleQtyChange(index, e.target.value)}
                      />
                    </td>
                    <td data-title="Issue Qty">{row?.IssueQty}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row p-2">
          <div className="col-sm-12 d-flex justify-content-end">
            <button className="btn btn-primary">{t("Add All")}</button>
          </div>
        </div>
      </div>
    </>
  );
};
