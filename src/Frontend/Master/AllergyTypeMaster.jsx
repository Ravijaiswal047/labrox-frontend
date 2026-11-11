import React, { useEffect, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { getTrimmedData } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import { validateAlleryType } from "../../utils/Schema";
import { CustomButton } from "../../components/UI/CustomButton";
import { Form } from "react-bootstrap";

function AllergyTypeMaster() {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [err, setErr] = useState({});
  const [formData, setFormData] = useState({
    Name: "",
    Minimum: "",
    Maximum: "",
    DisplayReading: "",
    DisplayborderReading: "",
    DefaultReading: "",
    BorderMin: "",
    BorderMax: "",
    Unit: "",
    IsActive: 1,
    ID: 0,
    printName: "",
  });

  const handleSearch = () => {
    setLoad(true);
    axiosInstance
      .get("ResultentryAllergy/GetAllAllergyTypes")
      .then((res) => {
        if (Array.isArray(res?.data?.message)) {
          setTableData(res.data.message);
          setLoad(false);
        } else {
          setTableData([]);
          setLoad(false);
          // toast?.error(res?.data?.message ? res?.data?.message : "No Data found")
        }
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };
  useEffect(() => {
    handleSearch();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log({ name, value, type });
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const saveAlleryTypeData = () => {
    let generatedError = validateAlleryType(formData);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(
          "ResultentryAllergy/SaveOrUpdateAllergyType",
          getTrimmedData({
            ...formData,
          }),
        )
        .then((res) => {
          if (res?.data?.success) {
            setFormData({
              Name: "",
              Minimum: "",
              Maximum: "",
              DisplayReading: "",
              DisplayborderReading: "",
              DefaultReading: "",
              BorderMin: "",
              BorderMax: "",
              Unit: "",
              IsActive: 1,
              ID: 0,
              printName: "",
            });
            toast.success(res?.data?.message);
            handleSearch();
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
  const handleEdit = (data) => {
    console.log(data);
    setFormData({
      Name: data?.Name,
      Minimum: data?.Minimum,
      Maximum: data?.Maximum,
      DisplayReading: data?.DisplayReading,
      DisplayborderReading: data?.DisplayBorderReading,
      DefaultReading: data?.DefaultReading,
      BorderMin: data?.BorderMin,
      BorderMax: data?.BorderMax,
      Unit: data?.Unit,
      IsActive: data?.IsActive,
      ID: data?.ID,
      printName: data?.PrintName,
    });
  };
  console.log({ load });
  console.log("formData",formData);
  return (
    <>
      <Accordion
        name={t("AllergyTypeMaster")}
        showDrop={true}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              className="required-fields"
              id="Name"
              type="text"
              lable="AllergyTypeName"
              name="Name"
              value={formData?.Name}
              onChange={handleChange}
              maxLength={25}
            />
            {formData?.Name === "" && (
              <span className="error-message">{err?.Name}</span>
            )}
          </div>

          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              className="required-fields"
              id="printName"
              type="text"
              lable="Print Name"
              name="printName"
              value={formData?.printName}
              onChange={handleChange}
              maxLength={25}
            />
            {formData?.printName === "" && (
              <span className="error-message">{err?.printName}</span>
            )}
          </div>

          <div className="col-sm-1 col-6">
            <Input
              placeholder=" "
              id="Minimum"
              type="number"
              lable="Min Value"
              name="Minimum"
              value={formData?.Minimum}
              onChange={handleChange}
              maxLength={10}
            />
          </div>

          <div className="col-sm-1 col-6">
            <Input
              placeholder=" "
              id="Maximum"
              type="number"
              lable="Max Value"
              name="Maximum"
              value={formData?.Maximum}
              onChange={handleChange}
              maxLength={10}
            />
          </div>
          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              id="DisplayReading"
              type="text"
              lable="DisplayReading"
              name="DisplayReading"
              value={formData?.DisplayReading}
              onChange={handleChange}
              maxLength={50}
            />
          </div>
          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              id="DisplayborderReading"
              type="text"
              lable="DisplayborderReading"
              name="DisplayborderReading"
              value={formData?.DisplayborderReading}
              onChange={handleChange}
              maxLength={50}
            />
          </div>
          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              id="DefaultReading"
              type="text"
              lable="DefaultReading"
              name="DefaultReading"
              value={formData?.DefaultReading}
              onChange={handleChange}
              maxLength={10}
            />
          </div>
          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              id="BorderMin"
              type="text"
              lable="BorderMin"
              name="BorderMin"
              value={formData?.BorderMin}
              onChange={handleChange}
              maxLength={10}
            />
          </div>
          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              id="BorderMax"
              type="text"
              lable="BorderMax"
              name="BorderMax"
              value={formData?.BorderMax}
              onChange={handleChange}
              maxLength={10}
            />
          </div>
          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              id="Unit"
              type="text"
              lable="Unit"
              name="Unit"
              value={formData?.Unit}
              onChange={handleChange}
              maxLength={10}
            />
          </div>
          {/* <div className="col-sm-2 d-flex col-6 mt-2">
            <div className="mt-1">
              <input
                name="IsActive"
                type="checkbox"
                className="mb-3"
                checked={formData?.IsActive}
                onChange={handleChange}
              />
            </div>
            <label htmlFor="IsActive" className="ml-2">
              {t("Active")}
            </label>
            &nbsp;
          </div> */}
          <div className="col-sm-2 d-flex col-6 mt-2">
            <Form.Check
              type="switch"
              id="IsActive"
              name="IsActive"
              label={t("Active")}
              onChange={handleChange}
              checked={formData?.IsActive}
            />
          </div>
          <div className="col-sm-1 mb-1">
            <CustomButton
              text={formData?.ID !== 0 ? t("Update") : t("Save")}
              icon={formData?.ID !== 0 ? t("edit") : t("save")}
              onClick={saveAlleryTypeData}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Result")} defaultValue={true}>
        {load ? (
          <Loading />
        ) : (
          <>
            {tableData?.length > 0 ? (
              <div className="row p-2">
                <div className="col-12">
                  <Tables>
                    <thead className="cf">
                      <tr>
                        {[
                          t("S.No."),
                          t("Allergy Type Name"),
                          t("Print Name"),
                          t("Min Value"),
                          t("Max Value"),
                          t("Unit"),
                          t("DisplayReading"),
                          t("DefaultReading"),
                          t("BorderMin"),
                          t("BorderMax"),
                          t("DisplayborderReading"),
                          t("IsActive"),
                          t("Edit"),
                        ].map((ele, index) => (
                          <th key={index}>{ele}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((ele, index) => (
                        <tr key={index}>
                          <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                          <td data-title={t("Allergy Type Name")}>
                            {ele?.Name}&nbsp;
                          </td>
                          <td data-title={t("Print Name")}>
                            {ele?.PrintName || ""}&nbsp;
                          </td>
                          <td data-title={t("Min Value")}>
                            {ele?.Minimum}&nbsp;
                          </td>
                          <td data-title={t("Max Value")}>
                            {ele?.Maximum}&nbsp;
                          </td>
                          <td data-title={t("Unit")}>{ele?.Unit}&nbsp;</td>
                          <td data-title={t("DisplayReading")}>
                            {ele?.DisplayReading}&nbsp;
                          </td>
                          <td data-title={t("DefaultReading")}>
                            {ele?.DefaultReading}&nbsp;
                          </td>
                          <td data-title={t("BorderMin")}>
                            {ele?.BorderMin}&nbsp;
                          </td>
                          <td data-title={t("BorderMax")}>
                            {ele?.BorderMax}&nbsp;
                          </td>
                          <td data-title="DisplayborderReading">
                            {ele?.DisplayBorderReading}&nbsp;
                          </td>
                          <td data-title={t("IsActive")}>
                            {ele?.IsActive == 1 ? "Active" : "InActive"}&nbsp;
                          </td>
                          <td>
                            <i
                              className="fa fa-edit"
                              onClick={() => handleEdit(ele)}
                              style={{ color: "#605ca8", cursor: "pointer" }}
                            ></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>{" "}
              </div>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}{" "}
      </Accordion>
    </>
  );
}

export default AllergyTypeMaster;
