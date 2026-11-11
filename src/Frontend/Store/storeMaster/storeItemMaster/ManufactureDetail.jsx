import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import { ClockSVG } from "../../../../components/SvgIcons";

const ManufactureDetail = ({
  manufactureTableList,
  handleRemove,
  handletableChange,
}) => {
  const { t } = useTranslation();
  console.log(manufactureTableList);
  return (
    <>
      {manufactureTableList?.length > 0 && (
        <div className="row px-2">
          <div className="col-sm-12">
            <Tables>
              <thead className="cf">
                <tr>
                  <th style={{ width: "2%" }}>{t("Action")}</th>
                  <th>{t("Manufacture Company")}</th>
                  <th>{t("Catalog No")}</th>
                  <th>{t("Machine Name")}</th>
                  <th>{t("Purchased Unit")}</th>
                  <th>{t("Converter")}</th>
                  <th>{t("Pack Size")}</th>
                  <th>{t("Consumption Unit")}</th>
                  <th>{t("Issue Multiplier")}</th>
                  {/* <th>{t("GlCode")}</th> */}
                </tr>
              </thead>
              <tbody>
                {manufactureTableList?.map((item, index) => (
                  <tr key={index}>
                    <td data-title={t("Active")}>
                      {item?.Active === true ? (
                        <span className="ml-2">
                          {console.log(item)}
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={item?.isActive}
                            onChange={(e) =>
                              handletableChange(
                                index,
                                "isActive",
                                e.target.checked ? 1 : 0
                              )
                            }
                          />
                        </span>
                      ) : (
                        <span
                          className="btnAdd"
                          onClick={() => handleRemove(index)}
                        >
                           <i className="bi bi-x-circle-fill text-danger"></i>
                        </span>
                      )}
                    </td>
                    <td data-title={t("Manufacture Company")}>
                      {item?.manufacureName}
                    </td>
                    <td data-title={t("Catalog No")}>{item?.CatalogNo}</td>
                    <td data-title={t("Machine Name")}>{item?.machineName}</td>
                    <td data-title={t("Purchased Unit")}>
                      {item?.purchaseUnitName}
                    </td>
                    <td data-title={t("Converter")}>{item?.Converter}</td>
                    <td data-title={t("Pack Size")}>{item?.PackSize}</td>
                    <td data-title={t("Consumption Unit")}>
                      {item?.ConsumeUnitName}
                    </td>
                    <td data-title={t("Issue Multiplier")}>
                      {item?.IssueMultiplier}
                    </td>
                    {/* <td data-title={t("GlCode")}>
                      <input
                        type="text"
                        className="form-control"
                        name="GlCodes"
                        value={item?.GlCodes} // Ensure GlCode is handled if undefined
                        onChange={(e) =>
                          handletableChange(index, "GlCodes", e.target.value)
                        }
                      />
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      )}
    </>
  );
};

export default ManufactureDetail;
