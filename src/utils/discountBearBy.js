export const emptyDiscountBearBy = () => ({
  Doctor: 0,
  RateType: 0,
  Management: 0,
});

export const roundDiscount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
};

export const sumDiscountBearBy = (alloc = {}) =>
  roundDiscount(
    roundDiscount(alloc.Doctor) +
      roundDiscount(alloc.RateType) +
      roundDiscount(alloc.Management),
  );

export const isManagementDiscountType = ({
  couponApplied,
  throughMemberData,
  throughFamilyData,
  discountType,
} = {}) =>
  !!couponApplied ||
  !!throughMemberData ||
  !!throughFamilyData ||
  Number(discountType) === 2;

export const syncDiscountBearBy = (prev = emptyDiscountBearBy(), total, locked) => {
  const t = roundDiscount(total);
  if (t <= 0) return emptyDiscountBearBy();
  if (locked) {
    return { Doctor: 0, RateType: 0, Management: t };
  }
  const rateType = roundDiscount(prev.RateType);
  const management = roundDiscount(prev.Management);
  const others = roundDiscount(rateType + management);
  if (others <= t) {
    return {
      Doctor: roundDiscount(t - others),
      RateType: rateType,
      Management: management,
    };
  }
  return { Doctor: t, RateType: 0, Management: 0 };
};

export const validateDiscountBearBy = (alloc, total) => {
  const t = roundDiscount(total);
  if (t <= 0) {
    return { ok: true };
  }
  const sum = sumDiscountBearBy(alloc);
  if (Math.abs(sum - t) > 0.01) {
    return {
      ok: false,
      message: `Discount Bear By split (${sum.toFixed(2)}) must equal the discount amount (${t.toFixed(2)})`,
    };
  }
  return { ok: true };
};

export const toDiscountBearByPayload = (alloc = emptyDiscountBearBy()) => ({
  DiscountBearByDoctor: roundDiscount(alloc.Doctor),
  DiscountBearByRateType: roundDiscount(alloc.RateType),
  DiscountBearByManagement: roundDiscount(alloc.Management),
});
