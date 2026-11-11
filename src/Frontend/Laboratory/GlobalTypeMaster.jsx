import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Accordion from "@app/components/UI/Accordion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getTrimmedData } from "../../utils/helpers";
import { SelectBox } from "../../components/formComponent/SelectBox";
import axios from "axios";
import { BindFieldType } from "../../utils/NetworkApi/commonApi";
import Input from "../../components/formComponent/Input";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";

import { useTranslation } from "react-i18next";
import { CustomButton } from "../../components/UI/CustomButton";
const GlobalTypeMaster = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  console.log(state);
  const [FieldType, setFieldType] = useState([]);
  const [load, setLoad] = useState(false);
  const [payload, setPayload] = useState({
    FieldType: "",
    FieldDisplay: "",
    IsActive: "1",
  });

  const { t } = useTranslation();
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "FieldType") {
      setPayload({
        ...payload,
        ["FieldType"]: value?.value,
      });
    }
  };
  console.log(payload);
  const validations = (payload) => {
    let err = "";
    if (payload?.FieldType == "" || !payload.FieldType) {
      err = "Please Choose Field Type";
    } else if (payload?.FieldDisplay == "") {
      err = "Please Enter Field Display";
    }

    return err;
  };

  const handleSubmit = () => {
    const generated = validations(getTrimmedData(payload));
    if (generated === "") {
      setLoad(true);
      axios
        .post(
          state?.url ? state?.url : "/api/v1/Global/InsertGlobalData",
          getTrimmedData(payload),
        )
        .then((res) => {
          toast.success(res.data?.message);
          setLoad(false);
          if (payload?.FieldType === "SelectType") {
            setPayload({
              FieldType: "",
              FieldDisplay: "",
              IsActive: "1",
            });
            BindFieldType(setFieldType);
          } else {
            navigate("/ViewGlobalMaster");
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
      toast.error(generated);
    }
  };

  useEffect(() => {
    if (state?.data) {
      setPayload({
        FieldId: state?.data?.FieldId,
        FieldType: state?.data?.FieldType,
        FieldDisplay: state?.data?.FieldDisplay,
        IsActive: state?.data?.IsActive === 1 ? "1" : "0",
      });
    }
  }, []);

  useEffect(() => {
    BindFieldType(setFieldType);
  }, []);
  return (
    <>
      <Accordion
        name={t("Global Type Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-2 col-md-2">
            <ReactSelect
              removeIsClearable={true}
              dynamicOptions={FieldType}
              name="FieldType"
              className="required-fields"
              id={t("Field Type")}
              placeholderName={t("Field Type")}
              value={payload?.FieldType}
              onChange={handleSearchSelectChange}
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              name="FieldDisplay"
              className="required-fields"
              lable={t("Field Display")}
              id={t("Field Display")}
              placeholder=" "
              value={payload?.FieldDisplay}
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-sm-1 d-flex align-items-center">
            <Form.Check
              type="switch"
              id="IsActive"
              label={t(payload?.IsActive === "1" ? ("Active") : ("InActive"))}
              checked={payload?.IsActive === "1"}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  IsActive: e.target.checked ? "1" : "0",
                })
              }
            />
          </div>

          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <CustomButton
                text={state?.url ? "Update" : "Create"}
                icon={state?.url ? "add" : "save"}
                onClick={handleSubmit}
              />
            )}
          </div>

          <div className="col-sm-1">
            <Link to="/ViewGlobalMaster">{t("Back to List")}</Link>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default GlobalTypeMaster;
