import React from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const getDisplayValue = (value) => {
  if (value === 0) return 0;
  return value || "-";
};

const POAgainstPIRateModal = ({
  show,
  handleClose,
  state,
  rateList = [],
  onSelect,
}) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const rows = rateList?.length ? rateList : state ? [state] : [];
  console.log(rows,"row")

  const handleSelect = (row) => {
    if (onSelect) {
      onSelect(row, state);
    }
  };

  return (
    <Dialog
      header={t("Select Supplier")}
      visible={show}
      className={theme}
      onHide={handleClose}
      draggable={false}
      style={{ width: isMobile ? "95vw" : "66vw" }}
    >
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead>
              <tr>
                <th>{t("#")}</th>
                <th>{t("Select")}</th>
                <th>{t("Supplier")}</th>
                <th>{t("Item")}</th>
                <th>{t("Rate")}</th>
                <th>{t("Discount %")}</th>
                <th>{t("IGST %")}</th>
                <th>{t("SGST %")}</th>
                <th>{t("CGST %")}</th>
              </tr>
            </thead>
            <tbody>
              {rows?.length > 0 ? (
                rows.map((row, index) => (
                  <tr key={`${row?.ItemID || row?.itemID || index}-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      <CustomButton
                        text={t("Select")}
                        className="btn-primary btn-sm"
                        onClick={() => handleSelect(row)}
                      />
                    </td>
                    <td>
                      {getDisplayValue(
                        row?.SupplierName ??
                          row?.supplierName ??
                          row?.VendorName ??
                          row?.vendorName
                      )}
                    </td>
                    <td>
                      {getDisplayValue(
                        row?.ItemName ?? row?.itemName ?? state?.ItemName
                      )}
                    </td>
                    <td>{getDisplayValue(row?.Rate ?? row?.rate)}</td>
                    <td>
                      {getDisplayValue(row?.DiscountPer ?? row?.discountPer)}
                    </td>
                    <td>
                      {getDisplayValue(row?.TaxPerIGST ?? row?.taxPerIGST)}
                    </td>
                    <td>
                      {getDisplayValue(row?.TaxPerSGST ?? row?.taxPerSGST)}
                    </td>
                    <td>
                      {getDisplayValue(row?.TaxPerCGST ?? row?.taxPerCGST)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center">
                    {t("No Record Found")}
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-sm-12 text-center">
          <CustomButton
            text={t("Close")}
            className="btn-danger btn-sm"
            onClick={handleClose}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default POAgainstPIRateModal;
