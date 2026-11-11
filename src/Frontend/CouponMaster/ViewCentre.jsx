import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Dialog } from "primereact/dialog";
import Input from "../../components/formComponent/Input";

const ViewCentre = ({ show, setShow, id }) => {
  const [bindCentre, setBindCentre] = useState([]);
  const [centrestoshow, setcentrestoshow] = useState([]);
  const [loading, setLoading] = useState(false);

  const getBindCentreModal = () => {
    setLoading(true);
    axiosInstance
      .post("CouponMasterApproval/BindCenterModal", {
        CoupanID: [id],
      })
      .then((res) => {
        let data = res?.data?.message;
        console.log(data);
        let BindCentre = data?.map((ele) => {
          return {
            value: ele?.Centre,
          };
        });
        setLoading(false);
        setBindCentre(BindCentre);
        setcentrestoshow(BindCentre);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getBindCentreModal();
    return () => {
      setBindCentre([]);
      setcentrestoshow([]);
    };
  }, [id]);

  const filterCenter = (value) => {
    console.log(value);

    const filteredCentres = bindCentre.filter((item) => {
      return item.value.toLowerCase().includes(value.toLowerCase());
    });
    console.log(filteredCentres);
    setcentrestoshow(filteredCentres);
  };

  const { t } = useTranslation();

  const isMobile = window.innerWidth <= 768;

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        visible={show}
        className={theme}
        header={t("View Centre")}
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
              name="searchValue"
              id="searchValue"
              lable={t("Enter Centre Name")}
              placeholder=""
              onChange={(e) => {
                filterCenter(e?.target?.value);
              }}
              max={20}
            />
          </div>
        </div>
        {loading && <Loading />}
        {!loading && (
          <Tables>
            <thead className="cf text-center" style={{ zIndex: 99 }}>
              <tr>
                <th className="text-left" colSpan="2">
                  <div className="row">
                    <div className="col-sm-6">Centres</div>
                    <div className="col-sm-6">
                      Total Centres: {bindCentre?.length}
                    </div>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {centrestoshow.map((ele, index) => (
                <tr key={index}>
                  <td data-title="Centre">{ele?.value}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        )}
        <div className="row mt-2 mb-1">
          <div className="col-md-12">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShow();
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

export default ViewCentre;
