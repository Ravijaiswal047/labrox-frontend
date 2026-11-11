import React from "react";
import { useTranslation } from "react-i18next";
import Input from "./Input";
import { roundDiscount, sumDiscountBearBy } from "../../utils/discountBearBy";

const FIELDS = [
  { key: "Doctor", label: "Doctor" },
  { key: "RateType", label: "RateType" },
  { key: "Management", label: "Management" },
];

function DiscountBearBy({
  totalDiscount = 0,
  value,
  onChange,
  locked = false,
  disabled = false,
}) {
  const { t } = useTranslation();
  const alloc = value || { Doctor: 0, RateType: 0, Management: 0 };
  const total = roundDiscount(totalDiscount);
  const splitTotal = sumDiscountBearBy(alloc);
  const matched = Math.abs(splitTotal - total) <= 0.01;
  const readOnly = locked || disabled || total <= 0;

  const handleField = (key, raw) => {
    if (readOnly) return;
    const nextValue = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(nextValue) || nextValue < 0) return;
    onChange?.({
      ...alloc,
      [key]: raw === "" ? "" : roundDiscount(nextValue),
    });
  };

  if (total <= 0) return null;

  return (
    <div className="row px-2 mt-2">
      <div className="col-12 mb-1">
        <strong>{t("Discount Bear By")}</strong>
        {locked ? (
          <span className="ml-2 text-muted" style={{ fontSize: "12px" }}>
            {t("Management Discount")}
          </span>
        ) : (
          <span
            className="ml-2"
            style={{
              fontSize: "12px",
              color: matched ? "#198754" : "#dc3545",
            }}
          >
            {t("Split")} {splitTotal.toFixed(2)} / {total.toFixed(2)}
          </span>
        )}
      </div>
      {FIELDS.map((field) => (
        <div className="col-sm-3 col-4 mb-1" key={field.key}>
          <Input
            type="number"
            name={`DiscountBearBy_${field.key}`}
            id={`DiscountBearBy_${field.key}`}
            lable={t(field.label)}
            placeholder=" "
            value={alloc[field.key] === "" ? "" : alloc[field.key]}
            disabled={readOnly || (locked && field.key !== "Management")}
            onChange={(e) => handleField(field.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default DiscountBearBy;
