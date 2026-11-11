import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { CompanyKeyValidationSchema } from "../../utils/Schema";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";

const CompanyKey = () => {
  const [payload, setPayload] = useState({
    CompanyID: "",
    KeyID: "",
    SecretKey: "",
  });
  const [company, setCompany] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErros] = useState({});
  const getCompanyName = () => {
    axiosInstance
      .get("CompanyMaster/getCompanyName")
      .then((res) => {
        let data = res?.data?.message;
        let Company = data?.map((ele) => {
          return {
            value: ele?.CompanyId,
            label: ele?.CompanyName,
          };
        });
        Company.unshift({ label: "Select Company", value: "" });
        setCompany(Company);
      })
      .catch((err) =>
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };
  const GetKeyData = (id) => {
    axiosInstance
      .post("CompanyMaster/getRazorpaySecretkey", {
        CompanyId: id,
      })
      .then((res) => {
        let data = res?.data?.message;
        setTableData(data);
      })
      .catch((err) => toast.error("No Data Found"));
  };

  useEffect(() => {
    GetKeyData("");
    getCompanyName();
  }, []);

  const SaveData = () => {
    const generatedError = CompanyKeyValidationSchema(payload);
    if (generatedError === "") {
      setLoading(true);

      axiosInstance
        .post("CompanyMaster/SaveRazorpaySecretkey", {
          ...payload,
        })
        .then((res) => {
          setLoading(false);
          toast.success(res?.data?.message);
          setPayload({
            CompanyID: "",
            KeyID: "",
            SecretKey: "",
          });
          GetKeyData("");
          setErros({});
        })
        .catch((err) => {
          setLoading(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    } else {
      setErros(generatedError);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value.trim(),
    });
  };

  const handleReset = () => {
    setPayload({
      CompanyID: "",
      KeyID: "",
      SecretKey: "",
    });
    GetKeyData("");
    setErros({});
  };
  const { t } = useTranslation();
  return (
    <>
      <Accordion
        name={t("Company Key")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row  px-2 mt-2 mb-1">
          <div className="col-md-2">
            <ReactSelect
              dynamicOptions={company}
              value={payload?.CompanyID}
              name="CompanyID"
              className="required-fields"
              placeholderName="Company"
              onChange={(_, e) => {
                GetKeyData(e?.value);
                setPayload({
                  ...payload,
                  CompanyID: e?.value,
                });
              }}
            />
            {payload?.CompanyID === "" && (
              <span className="error-message">{errors?.CompanyID}</span>
            )}
          </div>

          <div className="col-md-2 col-md-2">
            <Input
              lable="Key ID"
              placeholder=" "
              id="Key ID"
              name="KeyID"
              value={payload?.KeyID}
              onChange={handleChange}
              className="required-fields"
            />
            {payload?.KeyID === "" && (
              <span className="error-message">{errors?.KeyID}</span>
            )}
          </div>

          <div className="col-md-2">
            <Input
              lable="Secret Key"
              placeholder=" "
              id="Secret Key"
              name="SecretKey"
              className="required-fields"
              value={payload?.SecretKey}
              onChange={handleChange}
            />{" "}
            {payload?.SecretKey === "" && (
              <span className="error-message">{errors?.SecretKey}</span>
            )}
          </div>
          <div className="col-md-1">
            {loading ? (
              <Loading />
            ) : (
              <SaveButton
                  text={"Save"}
                  onClick={SaveData}
              />
            )}
          </div>

          <div className="col-md-1">
            <CustomButton
              text={"Reset"}
              icon={"refresh"}
              onClick={handleReset}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title="Search Detail" defaultValue={true}>
        <Tables>
          <thead className="cf text-center">
            <tr>
              <th className="text-center">{t("S.No")}</th>
              <th className="text-center">{t("Company Name")}</th>
              <th className="text-center">{t("Key ID")}</th>{" "}
              <th className="text-center">{t("Secret Key")}</th>
            </tr>
          </thead>
          {tableData?.length > 0 && (
            <tbody>
              {tableData.map((ele, index) => (
                <>
                  <tr>
                    <td data-title="S.No" className="text-center">
                      {index + 1}
                    </td>
                    <td data-title="CompanyName" className="text-center">
                      {ele?.CompanyName}
                    </td>
                    <td data-title="KeyID" className="text-center">
                      {ele?.KeyID}
                    </td>
                    <td data-title="SecretKey" className="text-center">
                      {ele?.SecretKey}
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          )}
        </Tables>
      </Accordion>
    </>
  );
};

export default CompanyKey;
