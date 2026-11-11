import React, { useEffect, useState } from "react";
import Tables from "../../../../components/UI/customTable";
import Heading from "../../../../components/UI/Heading";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Checked } from "../../../../components/SvgIcons";

const StoreItemMasterApprovalModel = ({ item }) => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  console.log(item);
  const colorCodingData = [
      { color: "bisque", id: "15", labelKey: "Checked" },
    { color: "#FFC0CB", id: "7", labelKey: "Created" },
    { color: "#90EE90", id: "8", labelKey: "Approved" },
  ];
  const Getbindsavedmanufacture = () => {
    axiosInstance
      .get("StoreUnitMaster/bindsavedmanufacture", {
        params: {
          itemid: item?.itemIDGroup || "",
        },
      })
      .then((res) => {
        let response = res.data.message;
        if (response?.length > 0) {
          setTableData(response);
        } else {
          toast.error("No Data Found");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  useEffect(() => {
    Getbindsavedmanufacture();
  }, []);
  const  handleCheck = (id, item) => {
    console.log(id, item);
    axiosInstance
      .post("InventryManageApprovalStore/SetStatus", {
        itemId: item,
        status: id,
      })
      .then((res) => {
        let response = res.data.message;
        toast.success(response);
        Getbindsavedmanufacture()
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  return (
    <>
      <Heading
        title={"Store Item Master Approval"}
        secondTitle={colorCodingData?.map(({ color, labelKey, id }) => (
          <ColorCodingSearch
            key={id}
            color={color}
            label={t(labelKey)}
            //   onClick={() => handleCallViewMedReq(id)}
          />
        ))}
      />
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead>
              <tr>
                <th>{t("Check")}</th>
                <th>{t("Approve")}</th>
                <th>{t("Item Name")}</th>
                <th>{t("Manufacture Company")}</th>
                <th>{t("Catalog No")}</th>
                <th>{t("Machine Name")}</th>
                <th>{t("Purchased Unit")}</th>
                <th>{t("Converter")}</th>
                <th>{t("Pack Size")}</th>
                <th>{t("Consumption Unit")}</th>
                <th>{t("Issue Multiplier")}</th>
                <th>{t("Barcode")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((item, index) => (
                <tr
                  key={index}
                  style={{ backgroundColor: item?.rowcolor || "white" }}
                >
                  <td data-title={t("Check")}>
                    <span className="d-flex justify-content-center">
                       
                      {item?.ApprovalStatus == 0 ? (
                        <button
                          className="check-approve"
                          style={{ backgroundColor: "orange" }}
                          onClick={() => handleCheck(1, item?.ItemId)}
                        >
                          <Checked />
                        </button>
                      ) : (
                        ""
                      )}
                    </span>
                  </td>
                  <td data-title={t("Approve")}>
                    <span className="d-flex justify-content-center">
                      {item?.ApprovalStatus == 1 ? (
                        <button
                          className="check-approve"
                          style={{ backgroundColor: "#2ab62a" }}
                          onClick={() => handleCheck(2, item?.ItemId)}
                        >
                          <Checked />
                        </button>
                      ) : (
                        ""
                      )}
                    </span>
                  </td>
                  <td data-title={t("Item Name")}>{item?.typename || "-"}</td>
                  <td data-title={t("Manufacture Company")}>
                    {item?.ManufactureName || "-"}
                  </td>
                  <td data-title={t("Catalog No")}>{item?.CatalogNo || "-"}</td>
                  <td data-title={t("Machine Name")}>
                    {item?.MachineName || "-"}
                  </td>
                  <td data-title={t("Purchased Unit")}>
                    {item?.MajorUnitName || "-"}
                  </td>
                  <td data-title={t("Converter")}>{item?.Converter || "-"}</td>
                  <td data-title={t("Pack Size")}>{item?.PackSize || "-"}</td>
                  <td data-title={t("Consumption Unit")}>
                    {item?.MinorUnitName || "-"}
                  </td>
                  <td data-title={t("Issue Multiplier")}>
                    {item?.IssueMultiplier || "-"}
                  </td>
                  <td data-title={t("Barcode")}>
                    {item?.barcodeoption === 0
                      ? "None"
                      : item?.barcodeoption === 1
                        ? "Primary"
                        : item?.barcodeoption === 2
                          ? "Both"
                          : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default StoreItemMasterApprovalModel;
