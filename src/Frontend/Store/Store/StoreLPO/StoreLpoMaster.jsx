import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Accordion from "../../../components/UI/Accordion";
import Input from "../../../components/formComponent/Input";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { CustomButton } from "../../../components/UI/CustomButton";
import { getDesignationData } from "../../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../../utils/axiosInstance";
import Heading from "../../../components/UI/Heading";
import Tables from "../../../components/UI/customTable";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import Loading from "../../../components/loader/Loading";

const initialState = {
  Id: "",
  FromAmount: "",
  ToAmount: "",
  Designation: "",
  IsMandatory: 0,
  IsActive: 1,
};

const StoreLpoMaster = () => {
  const { t } = useTranslation();

  const [payload, setPayload] = useState(initialState);
  const [Designation, setDesigation] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [errors, setErrors] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDesignationData(setDesigation, true);
    handleSearch();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name, option) => {
    setPayload((prev) => ({
      ...prev,
      [name]: option?.value ?? "",
      ...(name === "Designation"
        ? {
            ToAmount:
              option?.POAppLimitPerPO != null
                ? Number(option.POAppLimitPerPO)
                : "",
          }
        : {}),
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "Designation" ? { ToAmount: "" } : {}),
    }));
  };

  const validate = () => {
    const err = {};
    if (payload.FromAmount === "" || payload.FromAmount === null)
      err.FromAmount = t("This Field Is Required");
    if (payload.ToAmount === "" || payload.ToAmount === null)
      err.ToAmount = t("This Field Is Required");
    if (
      Number(payload.ToAmount) > 0 &&
      Number(payload.FromAmount) > Number(payload.ToAmount)
    )
      err.ToAmount = t("To Amount must be greater than From Amount");

    if (!payload.Designation) err.Designation = t("This Field Is Required");
    return err;
  };

  const handleSearch = () => {
    setLoading(true);
    axiosInstance
      .get("StoreLPO/bindlpo")
      .then((res) => {
        const list = [res?.data?.data, res?.data?.message, res?.data].find(
          (v) => Array.isArray(v)
        );
        setTableData(list ?? []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        setTableData([]);
      })
      .finally(() => setLoading(false));
  };

  const handleReset = () => {
    setPayload(initialState);
    setErrors({});
    setIsUpdate(false);
  };

  const handleSave = () => {
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) {
      toast.error(t("Please Fill All Required Fields"));
      return;
    }

    setLoading(true);
    if (!isUpdate) {
      axiosInstance
        .post("StoreLPO/savelpo", {
          fromAmount: Number(payload.FromAmount) || 0,
          toAmount: Number(payload.ToAmount) || 0,
          designation: [Number(payload.Designation)],
          isMandatory: payload.IsMandatory == 1,
        })
        .then((res) => {
          if (res?.data?.success === true) {
            toast.success(res?.data?.message);
            handleReset();
            handleSearch();
          } else {
            toast.error(res?.data?.message);
            // handleReset();
            // handleSearch();
          }
          // toast.success(res?.data?.message);
          // handleReset();
          // handleSearch();
        })
        .catch((err) => toast.error(err?.response?.data?.message))
        .finally(() => setLoading(false));
    } else {
      axiosInstance
        .post("StoreLPO/updatelpo", {
          id: Number(payload.Id),
          fromAmount: Number(payload.FromAmount) || 0,
          toAmount: Number(payload.ToAmount) || 0,
          designation: Number(payload.Designation),
          isMandatory: payload.IsMandatory == 1,
          isActive: payload.IsActive == 1,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          handleReset();
          handleSearch();
        })
        .catch((err) => toast.error(err?.response?.data?.message))
        .finally(() => setLoading(false));
    }
  };

  const handleEdit = (row) => {
    const id = row?.id ?? row?.Id;
    setLoading(true);
    axiosInstance
      .get(`StoreLPO/getlpo?id=${id}`)
      .then((res) => {
        const data = res?.data?.data ?? res?.data?.message ?? res?.data ?? row;
        setIsUpdate(true);
        setPayload({
          Id: data?.id ?? data?.Id ?? id,
          FromAmount: data?.fromAmount ?? data?.FromAmount ?? "",
          ToAmount: data?.toAmount ?? data?.ToAmount ?? "",
          Designation: data?.designation ?? data?.Designation ?? "",
          IsMandatory:
            (data?.isMandatory ?? data?.IsMandatory) === true ||
              (data?.isMandatory ?? data?.IsMandatory) == 1
              ? 1
              : 0,
          IsActive:
            (data?.isActive ?? data?.IsActive) === true ||
              (data?.isActive ?? data?.IsActive) == 1
              ? 1
              : 0,
        });
        setErrors({});
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setLoading(false));
  };

  const handleDelete = (row) => {
    const id = row?.id ?? row?.Id;
    setLoading(true);
    axiosInstance
      .post(`StoreLPO/deletelpo?id=${id}`)
      .then((res) => {
        toast.success(res?.data?.message);
        if (Number(payload.Id) === Number(id)) handleReset();
        handleSearch();
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setLoading(false));
  };

  // resolve designation label for table display
  const getDesignationLabel = (id) =>
    Designation?.find((d) => String(d.value) === String(id))?.label ?? id;

  return (
    <>
      {loading && <Loading />}
      <Accordion
        name={t("Store LPO Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">


          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="Designation"
              id="Designation"
              removeIsClearable={true}
              dynamicOptions={Designation}
              placeholderName="Designation"
              value={payload?.Designation}
              onChange={handleSelectChange}
              className={"required-fields"}
              respclass={""}
            />
            {errors?.Designation && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.Designation}
              </div>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="number"
              placeholder=" "
              lable="From Amount"
              id="FromAmount"
              name="FromAmount"
              value={payload?.FromAmount}
              onChange={handleChange}
              className={"required-fields"}
            />
            {errors?.FromAmount && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.FromAmount}
              </div>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="number"
              placeholder=" "
              lable="To Amount"
              id="ToAmount"
              name="ToAmount"
              value={payload?.ToAmount}
              onChange={handleChange}
              className={"required-fields"}
            />
            {errors?.ToAmount && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.ToAmount}
              </div>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12 d-flex align-items-center">
            <Form.Check
              type="switch"
              id="IsMandatory"
              name="IsMandatory"
              className="mr-3"
              label={t("Is Mandatory")}
              checked={payload?.IsMandatory == 1}
              onChange={(e) =>
                setPayload((prev) => ({
                  ...prev,
                  IsMandatory: e.target.checked ? 1 : 0,
                }))
              }
            />
            {isUpdate && (
              <Form.Check
                type="switch"
                id="IsActive"
                name="IsActive"
                label={t("Active")}
                checked={payload?.IsActive == 1}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    IsActive: e.target.checked ? 1 : 0,
                  }))
                }
              />
            )}
          </div>

        </div>
        <div className="row px-2 pt-2">
          <div className="col-sm-2 d-flex p-2" style={{ gap: "10px" }}>
            <CustomButton
              icon={isUpdate ? "edit" : "save"}
              text={isUpdate ? "Update" : "Save"}
              onClick={handleSave}
            />
            <CustomButton icon={"refresh"} text={"Reset"} onClick={handleReset} />
          </div>
        </div>


        <Heading
          title={t("Search Details")}
        />
        <div className="row">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>{t("Sr No.")}</th>
                  <th>{t("From Amount")}</th>
                  <th>{t("To Amount")}</th>
                  <th>{t("Designation")}</th>
                  <th>{t("Is Mandatory")}</th>
                  <th>{t("Status")}</th>
                  <th style={{ width: "5%" }}>{t("Edit")}</th>
                  <th style={{ width: "5%" }}><i className="fa fa-trash"></i></th>
                </tr>
              </thead>
              <tbody>
                {tableData?.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr key={row?.id ?? row?.Id ?? index}>
                      <td data-title="Sr No.">{index + 1}</td>
                      <td data-title="From Amount">
                        {row?.fromAmount ?? row?.FromAmount}
                      </td>
                      <td data-title="To Amount">
                        {row?.toAmount ?? row?.ToAmount}
                      </td>
                      <td data-title="Designation">
                        {row?.designationName ??
                          row?.DesignationName ??
                          getDesignationLabel(
                            row?.designation ?? row?.Designation
                          )}
                      </td>
                      <td data-title="Is Mandatory">
                        {(row?.isMandatory ?? row?.IsMandatory) === true ||
                          (row?.isMandatory ?? row?.IsMandatory) == 1
                          ? t("Yes")
                          : t("No")}
                      </td>
                      <td data-title="Status">
                        {(row?.isActive ?? row?.IsActive) === true ||
                          (row?.isActive ?? row?.IsActive) == 1
                          ? t("Active")
                          : t("Inactive")}
                      </td>
                      <td data-title="Edit">
                        <i
                          className="fa fa-edit text-primary"
                          style={{ cursor: "pointer" }}
                          aria-hidden="true"
                          onClick={() => handleEdit(row)}
                        ></i>
                      </td>
                      <td data-title="Delete">
                        <i
                          className="fa fa-trash text-danger"
                          style={{ cursor: "pointer" }}
                          aria-hidden="true"
                          onClick={() => handleDelete(row)}
                        ></i>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      <NoRecordFound />
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion >
    </>
  );
};

export default StoreLpoMaster;
