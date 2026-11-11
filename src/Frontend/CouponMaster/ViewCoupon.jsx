import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";

const ViewCoupon = ({ show, setShow, id }) => {
  const [bindCoupon, setBindCoupon] = useState([]);
  const [showCoupons, setShowCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const getBindCoupon = () => {
    setLoading(true);
    axiosInstance
      .post("CouponMasterApproval/BindCouponCodeModal", {
        CoupanID: [id],
      })
      .then((res) => {
        console.log(id);
        console.log(res?.data?.message);
        let data = res?.data?.message;
        let BindCoupon = data?.map((ele) => {
          return {
            code: ele?.CoupanCode,
          };
        });
        setLoading(false);
        setBindCoupon(BindCoupon);
        setShowCoupons(BindCoupon);
      })
      .catch((err) => {
        console.log(err?.response?.data?.message);
      });
  };
  const filterCoupon = (value) => {
    console.log(value);

    const filteredCoupon = bindCoupon.filter((item) => {
      return item.code.toLowerCase().includes(value.toLowerCase());
    });
    setShowCoupons(filteredCoupon);
  };
  console.log(bindCoupon);
  useEffect(() => {
    getBindCoupon();
    return () => {
      setBindCoupon([]);
      setShowCoupons([]);
    };
  }, [id]);

  const { t } = useTranslation();

  const isMobile = window.innerWidth <= 768;

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        visible={show}
        className={theme}
        header={t("View Coupon")}
        onHide={() => {
          setShow();
        }}
        style={{
          width: isMobile ? "80vw" : "30vw",
        }}
      >
        <div className="row">
          <div className="col-sm-12">
            <Input
              placeholder=""
              lable={t("Enter Coupon Code")}
              onChange={(e) => {
                filterCoupon(e?.target?.value);
              }}
            />
          </div>
        </div>
        {loading && <Loading />}
        {!loading && (
          <Tables>
            <thead>
              <tr>
                <th>
                  <div className="row">
                    <div className="col-sm-6">Coupon Code</div>
                    <div className="col-sm-6">
                      Total Coupons: {bindCoupon?.length}
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {showCoupons.map((ele, index) => (
                <tr key={index}>
                  <td>{ele?.code}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        )}
        <div className="row mt-2 mb-1">
          <div className="col-md-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShow({ ...show, ViewCoupon: false });
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ViewCoupon;
