import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { number } from "../../utils/helpers";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";

const InvalidContactNumber = () => {
  const [update, setUpdate] = useState(false);
  const [load, setLoad] = useState(false);
  const [formData, setFormData] = useState([]);
  const [input, setInput] = useState({
    MobileNo: "",
    IsActive: "",
    Id: "",
  });
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setInput({
      ...input,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    });
  };

  const validation = () => {
    let error = "";
    if (input?.MobileNo?.length !== 10) {
      error = "Invalid Mobile Number";
    }
    return error;
  };

  const getfetch = () => {
    axiosInstance
      .get("CommonController/GetInvalidMobileNo")
      .then((res) => {
        if (res?.data.success) {
          setFormData(res?.data?.message);
        } else {
          setFormData([]);
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSave = (url, btnName) => {
    const generatedError = validation();
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(url, input)
        .then((res) => {
          toast.success(res?.data?.message);
          setLoad(false);
          getfetch();
          setInput({
            MobileNo: "",
            IsActive: "",
          });
          btnName === "Update" && setUpdate(false);
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
      toast.error(generatedError);
    }
  };

  const handleEdit = (data) => {
    setInput({ ...data, Id: data?.id });
    setUpdate(true);
  };

  useEffect(() => {
    getfetch();
  }, []);
  return (
    <>
      <Accordion
        name={t("Invalid Contact Number")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <Input
              lable="Invalid Contact Number"
              className="required-fields"
              id="Invalid Contact Number"
              placeholder=" "
              type="number"
              name="MobileNo"
              onInput={(e) => number(e, 10)}
              value={input?.MobileNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsActive"
                checked={input?.IsActive == "1" ? true : false}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <label className="ml-2">{t("IsActive")}</label>
          </div>
          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : update ? (
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                id="btnSave"
                title="Save"
                onClick={() =>
                  handleSave("CommonController/UpdateInvalidMobileNo", "Update")
                }
              >
                {t("Update")}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                id="btnUpdate"
                title="Update"
                onClick={() =>
                  handleSave("CommonController/InsertInvalidMobileNo", "Save")
                }
              >
                {t("Save")}
              </button>
            )}
          </div>
        </div>{" "}
        {load ? (
          <Loading />
        ) : (
          <>
            {formData.length > 0 ? (
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Mobile No")}.</th>
                    <th>{t("Status")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {formData?.map((ele, index) => (
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td data-title={t("Mobile No")}>{ele?.MobileNo}&nbsp;</td>
                      <td data-title={t("Status")}>
                        {ele?.IsActive === 1 ? t("Active") : t("InActive")}
                        &nbsp;
                      </td>
                      <td data-title={t("Action")}>
                        {
                          <div
                            className="text-primary"
                            style={{
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                            onClick={() => handleEdit(ele)}
                          >
                            {t("Edit")}
                          </div>
                        }
                        &nbsp;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}
      </Accordion>
    </>
  );
};

export default InvalidContactNumber;
