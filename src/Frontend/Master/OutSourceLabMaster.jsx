import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { ExportToExcel, getTrimmedData, number } from "../../utils/helpers";
import { OutSourceLabMasterValidationSchema } from "../../utils/Schema";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import moment from "moment";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { FaFileExcel } from "react-icons/fa";
import FilterInput from "../../components/Filter/FilterInput";
import { CustomButton } from "../../components/UI/CustomButton";

const OutSourceLabMaster = () => {
  const [update, setUpdate] = useState(false);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    OutSourceLabID: "",
    LabName: "",
    Address: "",
    ContactPersonName: "",
    PhoneNo: "",
    MobileNo: "",
    EmailID: "",
    isActive: "1",
  });
  const { t } = useTranslation();

  const getOutSourceLabData = () => {
    axiosInstance
      .get("OutSourceLabMaster/getAllOutSourceLabData", formData)
      .then((res) => {
        if (res.status === 200) {
          setData(res.data.message);
          setFilterData(res.data.message);
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const editOutSourceLabMaster = (id) => {
    axiosInstance
      .post("OutSourceLabMaster/getAllOutSourceLabDataById", {
        OutSourceLabID: id,
      })
      .then((res) => {
        const data = res.data.message[0];
        setFormData(data);
      })
      .catch((err) => console.log(err));
  };

  const { errors, handleBlur, touched, handleSubmit } = useFormik({
    initialValues: formData,
    enableReinitialize: true,
    validationSchema: OutSourceLabMasterValidationSchema,
    onSubmit: (values) => {
      setLoad(true);
      if (update === true) {
        axiosInstance
          .post(
            "OutSourceLabMaster/UpdateOutSourceLabData",
            getTrimmedData({
              ...values,
            }),
          )
          .then((res) => {
            if (res.data.message) {
              setUpdate(false);
              setLoad(false);
              toast.success(res.data.message);
              setFormData({
                OutSourceLabID: "",
                LabName: "",
                Address: "",
                ContactPersonName: "",
                PhoneNo: "",
                MobileNo: "",
                EmailID: "",
                isActive: "1",
              });
              getOutSourceLabData();
            } else {
              toast.error("Something went wrong");
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
        setLoad(true);
        axiosInstance
          .post(
            "OutSourceLabMaster/InsertOutSourceLabData",
            getTrimmedData({
              ...values,
            }),
          )
          .then((res) => {
            if (res.data.message) {
              setLoad(false);
              toast.success(res.data.message);
              setFormData({
                OutSourceLabID: "",
                LabName: "",
                Address: "",
                ContactPersonName: "",
                PhoneNo: "",
                MobileNo: "",
                EmailID: "",
                isActive: "1",
              });
              getOutSourceLabData();
            } else {
              toast.error("Something went wrong");
            }
          })
          .catch((err) => {
            toast.error(err.response.data.message);
            setLoad(false);
          });
      }
    },
  });

  console.log(errors);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  //handleExcel!

  const handleExcel = () => {
    
    const filteredExcelData = data.map((item, i) => ({
      "Sr No": i + 1,
      "Lab Name": item.LabName,
      "Address": item.Address,
      "Phone No": item.PhoneNo,
      "Mobile No": item.MobileNo,
      "Contact Person": item.ContactPersonName,
      "Active": item.isActiveStatus,
      "Created By": item.CreatedByName,
      "Created On": moment(item.dtEntry).format("DD-MMM-YYYY"),
    }));

    ExportToExcel(filteredExcelData); 
  };

  //Filter Data

  const filteredData = data.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.LabName?.toLowerCase().includes(searchText) ||
      item.Address?.toLowerCase().includes(searchText) ||
      item.PhoneNo?.toLowerCase().includes(searchText) ||
      item.MobileNo?.toLowerCase().includes(searchText) ||
      item.ContactPersonName?.toLowerCase().includes(searchText) ||
      item.isActiveStatus?.toLowerCase().includes(searchText) ||
      item.CreatedByName?.toLowerCase().includes(searchText) ||
      item.dtEntry?.toLowerCase().includes(searchText)
    );
  });

  useEffect(() => {
    getOutSourceLabData();
  }, []);

  console.log("filteredData", filteredData);
  return (
    <>
      <Accordion
        name={t("Out Source Lab Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Lab Name"
              name="LabName"
              id="LabName"
              className="required-fields"
              placeholder=""
              value={formData?.LabName}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            {errors?.LabName && touched?.LabName && (
              <div className="error-message">{errors?.LabName}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Contact Person Name"
              name="ContactPersonName"
              className="required-fields"
              id="ContactPersonName"
              placeholder=""
              value={formData?.ContactPersonName}
              onChange={handleChange}
            />
            {errors?.ContactPersonName && touched?.ContactPersonName && (
              <div className="error-message">{errors?.ContactPersonName}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Address"
              name="Address"
              id="Address"
              placeholder=""
              value={formData?.Address}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="number"
              lable="Phone No"
              name="PhoneNo"
              id="PhoneNo"
              placeholder=""
              value={formData?.PhoneNo}
              onInput={(e) => number(e, 10)}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="number"
              lable="Mobile No"
              name="MobileNo"
              id="MobileNo"
              className="required-fields"
              placeholder=""
              value={formData?.MobileNo}
              onInput={(e) => number(e, 10)}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            {errors?.MobileNo && touched?.MobileNo && (
              <div className="error-message">{errors?.MobileNo}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              type="email"
              lable="Email ID"
              name="EmailID"
              id="EmailID"
              placeholder=""
              value={formData?.EmailID}
              onChange={handleChange}
              required
            />
            {errors?.EmailID && touched?.EmailID && (
              <div className="error-message">{errors?.EmailID}</div>
            )}
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="isActive"
                checked={formData?.isActive}
                onChange={handleChange}
              />
            </div>
            <label className="ml-2">{t("Active")}</label>
          </div>
          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <CustomButton
                type="submit"
                text={update ? t("Update") : t("Create")}
                icon={update ? t("edit") : t("save")}
                onClick={handleSubmit}
              />
            )}
          </div>
          <div className="col-sm-1">
              <CustomButton
                text={"Export"}
                icon={"excel"}
                onClick={handleExcel}
                type="submit"
              />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row p-2 ">
          <div className="col-12 d-flex justify-content-end">
              <FilterInput value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>
          <div className="col-12 mt-2">
            {filteredData.length > 0 ? (
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Lab Name")}</th>
                    <th>{t("Address")}</th>
                    <th>{t("Phone No")}</th>
                    <th>{t("Mobile No")}</th>
                    <th>{t("Contact Person Name")}</th>
                    <th>{t("Active")}</th>
                    <th>{t("Created By")}</th>
                    <th>{t("Created On")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((data, i) => (
                    <tr key={i}>
                      <td data-title={t("S.No")}>{i + 1}&nbsp;</td>
                      <td data-title={t("Lab Name")}>{data?.LabName}&nbsp;</td>
                      <td data-title={t("Address")}>{data?.Address}&nbsp;</td>
                      <td data-title={t("Phone No")}>{data?.PhoneNo}&nbsp;</td>
                      <td data-title={t("Mobile No")}>
                        {data?.MobileNo}&nbsp;
                      </td>
                      <td data-title={t("Contact Person Name")}>
                        {data?.ContactPersonName}&nbsp;
                      </td>
                      <td data-title={t("Active")}>
                        {data?.isActiveStatus}&nbsp;
                      </td>
                      <td data-title={t("Created By")}>
                        {data?.CreatedByName}&nbsp;
                      </td>
                      <td data-title={t("Created On")}>
                        {moment(data?.dtEntry).format("DD-MMM-YYYY")}
                        &nbsp;
                      </td>

                      <td data-title={t("Edit")}>
                        <div
                          className="text-primary"
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => {
                            window.scroll(0, 0);
                            editOutSourceLabMaster(data?.OutSourceLabID);
                            setUpdate(true);
                          }}
                        >
                          {t("Edit")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            ) : (
              <NoRecordFound />
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default OutSourceLabMaster;
