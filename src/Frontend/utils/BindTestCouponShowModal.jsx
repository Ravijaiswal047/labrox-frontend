import { Dialog } from "primereact/dialog";
import React from "react";
import Tables from "../../components/UI/customTable";

const BindTestCouponShowModal = ({
  couponData,
  showCoupon,
  handleCloseBindTestCouponShowModal,
  handleSelectTestData,
}) => {
  const { t } = useTranslation();
  console.log(couponData);

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t("Coupon Detail")}
        visible={showCoupon}
        onHide={() => {
          handleCloseBindTestCouponShowModal();
        }}
        draggable={false}
        className={theme}
        style={{ width: "1000px" }}
      >
        <div className="row">
          <Tables>
            <thead>
              <tr>
                <th>{t("Select")}</th>
                <th>{t("TestId")}</th>
                <th>{t("TestName")}</th>
                {/* <th>{t("Rate")}</th> */}
                <th>{t("Discount %")}</th>
              </tr>
            </thead>
            <tbody>
              {couponData.map((ele, index) => (
                <tr key={index} style={{ color: "black" }}>
                  <td data-title="Select">
                    <button
                      type="button"
                      className="btn btn-info btn-sm"
                      onClick={() => {
                        handleSelectTestData(ele);
                      }}
                    >
                      {t("Select")}
                    </button>
                  </td>
                  <td data-title="TestId">{ele.TestId}&nbsp;</td>
                  <td data-title="TestName">{ele.TestName}&nbsp;</td>
                  {/* <td data-title="Rate">
                            {ele.Rate}&nbsp;
                          </td> */}
                  <td data-title="Discount %">
                    {ele.DiscountPercentage}&nbsp;
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
                handleCloseBindTestCouponShowModal();
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

export default BindTestCouponShowModal;
