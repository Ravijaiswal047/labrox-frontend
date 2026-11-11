import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ViewTest from "../CompanyMaster/ViewTest";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";

const ViewCouponDetail = ({ couponDetails, showCoupon, handleCloseCoupon }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState({
    ViewTest: false,
  });

  console.log(couponDetails);

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      {show?.ViewTest && (
        <ViewTest
          show={show}
          setShow={setShow}
          id={couponDetails[0]?.CoupanId}
        />
      )}

      <Dialog
        visible={showCoupon}
        className={theme}
        header={t("Coupon Detail")}
        onHide={() => {
          handleCloseCoupon();
        }}
        style={{
          width: isMobile ? "80vw" : "70vw",
        }}
      >
        <div className="row">
          <Tables>
            <thead>
              <tr>
                <th>{t("SNo")}</th>
                <th>{t("Coupon Name")}</th>
                <th>{t("Coupon Type")}</th>
                <th>{t("Valid From")}</th>
                <th>{t("Valid To")}</th>
                <th>{t("Minimum Limit")}</th>
                <th>{t("Issue For")}</th>
                <th>{t("Applicable")}</th>
                <th>{t("View Test")}</th>
                <th>{t("Disc. Amt.")}</th>
                <th>{t("Disc.Perc.")}</th>
                <th>{t("Multiple Patient Coupon")}</th>
                <th>{t("One Time Coupon")}</th>
              </tr>
            </thead>
            <tbody>
              {couponDetails.map((ele, index) => (
                <tr key={index} style={{ color: "black" }}>
                  <td data-title="SNo">{index + 1}&nbsp;</td>
                  <td data-title="Coupon Name">{ele.CoupanName}&nbsp;</td>
                  <td data-title="Coupon Type">{ele.CoupanType}&nbsp;</td>
                  <td data-title="Valid From">{ele.Validfrom}&nbsp;</td>
                  <td data-title="Valid To">{ele.Validto}&nbsp;</td>
                  <td data-title="Min.Limit">{ele.MinBookingAmount}&nbsp;</td>
                  <td data-title="Issue For">{ele.IssueType}&nbsp;</td>
                  <td data-title="Applicable">{ele.Type}&nbsp;</td>
                  <td data-title="View Test">
                    <a
                      className="fa fa-search coloricon"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setShow({ ...show, ViewTest: true });
                      }}
                    ></a>
                    &nbsp;
                  </td>
                  <td data-title="Disc. Amt.">{ele.discountamount}&nbsp;</td>

                  <td data-title="Disc.Perc.">
                    {ele.discountpercentage}&nbsp;
                  </td>
                  <td data-title="Multiple Patient Coupon">
                    {ele.MultiplePatientCoupon}&nbsp;
                  </td>
                  <td data-title="One Time Coupon">
                    {ele.OneTimePatientCoupon}&nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
          <div className="col-sm-2">
            <button
              type="button"
              className="btn btn-danger  btn-sm"
              onClick={() => {
                handleCloseCoupon();
              }}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ViewCouponDetail;
