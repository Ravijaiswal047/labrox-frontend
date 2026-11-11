import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { validateSampleTypeHMIS } from "../../utils/Schema";
import { getTrimmedData } from "../../utils/helpers";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";

const SampleTypeMasterInterface = () => {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState({});
  const [SampleType, setSampleType] = useState([]);
  const [formData, setFormData] = useState({
    InterfaceCompany: "",
    HmisSampleName: "",
    HmisSampleCode: "",
    SampleTypeID: 0,
    isActive: 1,
    ID: 0,
  });
  const [companyInterface, setCompanyInterface] = useState([]);
  const { t } = useTranslation();

  const handleSearch = () => {
    setLoad(true);
    axiosInstance
      .get("ItemMasterInterface/GetSampleTypeData")
      .then((res) => {
        setData(res.data.message);

        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };
  const postData = () => {
    let generatedError = validateSampleTypeHMIS(formData);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(
          "ItemMasterInterface/SaveSampleTypeData",
          getTrimmedData({
            ...formData,
            SampleTypeID: formData?.SampleTypeID ?? 0,
          }),
        )
        .then((res) => {
          if (res?.data?.success) {
            setFormData({
              SampleTypeID: "",
              HmisSampleName: "",
              HmisSampleCode: "",
              isActive: 0,
              ID: 0,
              InterfaceCompany: "",
            });
            toast.success(res?.data?.message);
            handleSearch();
            setErr({});
            setLoad(false);
          } else {
            toast.error(res?.data?.message);
            setLoad(false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad(false);
        });
    } else {
      setErr(generatedError);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(type);
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSearchSelectChange = (label, value) => {
    setFormData({ ...formData, [label]: value?.value });
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const getSampleType = () => {
    axiosInstance
      .get("SampleType/getSampleTypeByInvestigation")
      .then((res) => {
        let data = res.data.message;

        let SampleType = data.map((ele) => {
          return {
            value: ele.id,
            label: ele.SampleName,
          };
        });
        return setSampleType(SampleType);
      })
      .catch((err) => console.log(err));
  };

  const getInterfaceCompany = () => {
    axiosInstance
      .get("ItemMasterInterface/BindInterfaceCompany")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.CompanyName,
            label: ele?.CompanyName,
          };
        });
        setCompanyInterface(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getInterfaceCompany();
    getSampleType();
  }, []);

  const handleEdit = (data) => {
    console.log(data);
    setFormData({
      HmisSampleName: data?.HmisSampleName,
      HmisSampleCode: data?.HmisSampleCode,
      isActive: data?.isActive,
      SampleTypeID: data?.SampleTypeId,
      ID: data?.ID,
      InterfaceCompany: data?.InterfaceCompany,
    });
  };

  console.log({ formData });

  return (
    <>
      <Accordion
        name={t("Sample Type Master Interface")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={companyInterface}
              removeIsClearable={true}
              name="InterfaceCompany"
              lable="Interface Company"
              id="InterfaceCompany"
              placeholderName="Interface Company"
              value={formData?.InterfaceCompany}
              onChange={handleSearchSelectChange}
            />
            {formData?.InterfaceCompany === "" && (
              <span className="error-message">{err?.InterfaceCompany}</span>
            )}
          </div>
          <div className="col-sm-2  ">
            <ReactSelect
              dynamicOptions={SampleType}
              className="required-fields"
              name="SampleTypeID"
              lable={t("SampleType")}
              id="SampleType"
              removeIsClearable={true}
              placeholderName={t("Select Sample")}
              value={formData?.SampleTypeID}
              onChange={handleSearchSelectChange}
            />
            {formData?.SampleTypeID === 0 && (
              <span className="error-message">{err?.SampleTypeID}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable="Sample Code"
              id="HmisSampleCode"
              name="HmisSampleCode"
              placeholder=" "
              max={15}
              onChange={handleChange}
              value={formData?.HmisSampleCode}
            />
            {formData?.HmisSampleCode?.trim() === "" && (
              <span className="error-message">{err?.SampleCode}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable="Sample Name"
              id="HmisSampleName"
              name="HmisSampleName"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.HmisSampleName}
            />
            {formData?.HmisSampleName?.trim() === "" && (
              <span className="error-message">{err?.SampleName}</span>
            )}
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="isActive"
                type="checkbox"
                className="mb-3"
                checked={formData?.isActive}
                onChange={handleChange}
              />
            </div>
            <label htmlFor="isActive" className="ml-2">
              {t("Active")}
            </label>
            &nbsp;
          </div>
          <div className="col-sm-1">
            <button
              type="button"
              className={`btn btn-info btn-sm w-100`}
              onClick={postData}
            >
              {formData?.ID !== 0 ? t("Update") : t("Save")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {load ? (
          <Loading />
        ) : (
          <div className="row p-2">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("InterfaceCompany")}</th>
                    <th>{t("SampleTypeID")}</th>
                    <th>{t("SampleTypeName")}</th>
                    <th>{t("HMIS SampleName")}</th>
                    <th>{t("HMIS SampleCode")}</th>
                    <th>{t("Active")}</th>
                    <th className="text-center">
                      <i class="fa fa-edit"></i>
                    </th>
                  </tr>
                </thead>
                {data.map((data, i) => (
                  <tbody>
                    {" "}
                    <tr>
                      <td data-title={t("S.No")} className="text-center">
                        {i + 1}&nbsp;
                      </td>
                      <td
                        data-title={t("InterfaceCompany")}
                        className="text-center"
                      >
                        {data?.InterfaceCompany}&nbsp;
                      </td>
                      <td
                        data-title={t("SampleTypeID")}
                        className="text-center"
                      >
                        {data?.SampleTypeId}&nbsp;
                      </td>
                      <td
                        data-title={t("SampleTypeName")}
                        className="text-center"
                      >
                        {data?.SampleTypeName}&nbsp;
                      </td>
                      <td
                        data-title={t("HMIS SampleName")}
                        className="text-center"
                      >
                        {data?.HmisSampleName}&nbsp;
                      </td>

                      <td
                        data-title={t("HMIS SampleCode")}
                        className="text-center"
                      >
                        {data?.HmisSampleCode}&nbsp;
                      </td>
                      <td data-title={t("IsActive")} className="text-center">
                        {data?.isActive == 1 ? "Active" : "InActive"}&nbsp;
                      </td>
                      <td data-title="Select" className="text-center">
                        <button
                          className="btn btn-primary btn-sm btn-class"
                          onClick={() => {
                            handleEdit(data);
                          }}
                        >
                          <i class="fa fa-edit"></i>
                        </button>
                      </td>
                    </tr>{" "}
                  </tbody>
                ))}
              </Tables>
            </div>
          </div>
        )}
      </Accordion>
    </>
  );
};

export default SampleTypeMasterInterface;
