import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";

const InvestigationsRequiredField = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const ID = {
    InvestigationID: state?.data ? state?.data : "",
  };

  const { t } = useTranslation();

  const getInvestigationsList = () => {
    axiosInstance
      .post("Investigations/RequiredFields", {
        InvestigationID: ID.InvestigationID,
      })
      .then((res) => {
        if (res.status === 200) {
          setLoad(false);
          setData(res.data.message);
        }
      })
      .catch((err) => console.log(err));
  };

  const post = () => {
    setLoad(true);

    axiosInstance
      .post("Investigations/SaveInvestigationRequired", {
        InvestigationRequiredData: data,
      })
      .then((res) => {
        if (res.data.message) {
          setLoad(false);
          toast.success(res.data.message);
        } else {
          toast.error("Something went wrong");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        setLoad(false);
      });
  };

  const handleChangeMain = (e, i, names) => {
    const { value, name, checked, type } = e.target;
    const datas = [...data];
    if (names) {
      datas[i][names] = value;
      setData(datas);
    } else {
      datas[i][name] = type === "checkbox" ? (checked ? 1 : 0) : value;
      setData(datas);
    }
  };

  useEffect(() => {
    getInvestigationsList();
  }, []);
  return (
    <>
      <Accordion
        name={`Test Name : ${state?.TestName}`}
        defaultValue={true}
        isBreadcrumb={true}
        backButton={true}
      >
        <div className="row p-2 ">
          <div className="col-12">
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Investigation Name")}</th>
                  <th>{t("Field ID")}</th>
                  <th>{t("Field Name")}</th>
                  <th>{t("Show On Booking")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((data, i) => (
                  <tr key={i}>
                    <td data-title={t("S.No")}>{i + 1}&nbsp;</td>
                    <td data-title={t("Investigation Name")}>
                      {state?.TestName}&nbsp;
                    </td>
                    <td data-title={t("Field ID")}>{data?.FieldID}&nbsp;</td>
                    <td data-title={t("Field Name")}>
                      {data?.FieldName}&nbsp;
                    </td>
                    <td data-title={t("Show On Booking")}>
                      <input
                        type="checkbox"
                        name="showonbooking"
                        checked={data?.showonbooking}
                        onChange={(e) => handleChangeMain(e, i)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2 pb-2">
          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={post}
              >
                {t("Save")}
              </button>
            )}
          </div>{" "}
          <div className="col-sm-1">
            {state?.flag ? (
              <Link
                to="/Investigations"
                state={{
                  other: {
                    button: "Update",
                    pageName: "Edit",
                    showButton: true,
                  },
                  url1: state?.url1,
                  url: "Investigations/UpdateInvestigation",
                }}
              >
                <span className="btn btn-block btn-primary btn-sm">
                  {t("Back")}
                </span>
              </Link>
            ) : (
              <button
                className="btn btn-block btn-primary btn-sm"
                onClick={() => navigate(-1)}
              >
                {t("Back")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default InvestigationsRequiredField;
