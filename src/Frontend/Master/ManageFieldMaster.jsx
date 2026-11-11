import React, { useEffect, useState } from "react";
import { getVisitType } from "../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import Button from "../../components/formComponent/Button";
import { shouldIncludeAIIMSID } from "../../utils/helpers";

const Field = [
  { FieldType: "OPD/IPD", IsVisible: 0, IsMandatory: 0 },
  { FieldType: "BedNo", IsVisible: 0, IsMandatory: 0 },
  { FieldType: "Source", IsVisible: 0, IsMandatory: 0 },
  { FieldType: "HLMPatientType", IsVisible: 0, IsMandatory: 0 },
  { FieldType: "Vip&Masking", IsVisible: 0, IsMandatory: 0 },
  { FieldType: "Nationality", IsVisible: 0, IsMandatory: 0 },
  { FieldType: "ID_Passport", IsVisible: 0, IsMandatory: 0 },
];

const ManageFieldMaster = () => {
  const [VisitType, setVisitType] = useState([]);
  const [load, setLoad] = useState(true);
  const [disable, setDisable] = useState({
    update: true,
    loading: false,
  });
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    visitId: "",
    VisitType: "",
    FieldType: "",
    IsVisible: 0,
    IsMandatory: 0,
    isDropdown: 0,
  });
  const { t } = useTranslation();

  const fetch = (payloads) => {
    setLoad(true);
    axiosInstance
      .post("ManageFieldMaster/getAllManageFieldMasterData", {
        VisitTypeID: payloads,
      })
      .then((res) => {
        if (res?.data?.success) {
          setDisable({
            ...disable,
            update: res?.data?.message.length > 0 ? true : false,
          });
          const data = res.data?.message.length > 0 ? res.data?.message : Field;
          let val = data.map((ele) => {
            return {
              FieldType: ele?.FieldType,
              IsVisible: ele?.IsVisible,
              IsMandatory: ele?.IsMandatory,
              isDropdown: ele?.isDropdown,
              VisitType: payload?.VisitType,
              VisitTypeID: payload?.visitId,
            };
          });
          setTableData(val);
        } else {
          setDisable({
            update: true,
            loading: false,
          });
          setTableData([]);
          toast.error("No Record Found");
        }

        setLoad(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setLoad(false);
      });
  };

  const handleChange = (e, index) => {
    const { name, checked } = e.target;
    const data = [...tableData];
    data[index][name] = checked ? 1 : 0;
    if (!checked) {
      data[index]["IsMandatory"] = 0;
      data[index]["isDropdown"] = 0;
    }
    setTableData(data);
  };

  const handleSelect = (event) => {
    const { name, value, selectedIndex } = event?.target;
    const label = event?.target?.children[selectedIndex].text;
    setPayload({ ...payload, [name]: value, VisitType: label });
  };

  const handlInputChange = (e) => {
    const { name, value } = e.target;
    console.log({ name, value });
    setPayload({ ...payload, [name]: value });
  };

  const handleFieldType = () => {
    if (payload?.FieldType) {
      const newRows = {
        FieldType: payload?.FieldType,
        IsVisible: payload?.IsVisible,
        IsMandatory: payload?.IsMandatory,
        isDropdown: payload?.isDropdown,
        VisitType: payload?.VisitType,
        VisitTypeID: payload?.visitId,
      };
      console.log({ newRows });
      setTableData((prevData) => [...prevData, newRows]);
      toast.success("Field type added successfully");
    }
    setPayload({ ...payload, FieldType: "" });
  };

  console.log({ tableData });

  const handleSubmit = (url) => {
    setDisable({ ...disable, loading: true });
    axiosInstance
      .post(url, tableData)
      .then((res) => {
        toast.success(res?.data?.message);
        fetch(payload?.visitId);
        setDisable({ ...disable, loading: false });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setDisable({ ...disable, loading: false });
      });
  };

  useEffect(() => {
    if (VisitType.length > 0) {
      setPayload({
        ...payload,
        visitId: VisitType[0].value,
        VisitType: VisitType[0].label,
      });
    }
  }, [VisitType]);

  useEffect(() => {
    if (payload?.visitId !== "") {
      fetch(payload?.visitId);
    }
  }, [payload?.visitId]);

  useEffect(() => {
    getVisitType(setVisitType);
  }, []);
  return (
    <>
      <Accordion
        name={t("Manage Field Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-3">
            <SelectBox
              lable="Visit Type"
              id="Visit Type"
              options={VisitType}
              selectedValue={payload?.visitId}
              name="visitId"
              onChange={handleSelect}
            />
          </div>
          <div className="row pl-2 pr-2">
            <div className="pl-3">
              <Input
                lable="FieldType"
                id="FieldType"
                type="text"
                name="FieldType"
                value={payload?.FieldType}
                onChange={handlInputChange}
                placeholder=" "
              />
            </div>
            <div className="pl-2">
              <Button
                name={t("Add")}
                className={"btn btn-sm btn-primary mx-1"}
                handleClick={handleFieldType}
              />
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion defaultValue={true}>
        <div className="row p-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Field Type")}</th>
                  <th>{t("IsVisible")}</th>
                  <th>{t("IsMandatory")}</th>
                  {shouldIncludeAIIMSID() && <th>{t("isDropdown")}</th>}
                </tr>
              </thead>{" "}
              <tbody>
                {tableData?.map((data, index) => (
                  <tr key={index}>
                    <td>{data?.FieldType}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={data?.IsVisible === 1 ? true : false}
                        name="IsVisible"
                        onChange={(e) => handleChange(e, index)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={data?.IsMandatory}
                        disabled={data?.IsVisible === 1 ? false : true}
                        name="IsMandatory"
                        onChange={(e) => handleChange(e, index)}
                      />
                    </td>
                    {shouldIncludeAIIMSID() && (
                      <>
                        {data?.FieldType === "BedNo" ? (
                          <td>
                            <input
                              type="checkbox"
                              checked={data?.isDropdown}
                              disabled={data?.IsVisible !== 1}
                              name="isDropdown"
                              onChange={(e) => handleChange(e, index)}
                            />
                          </td>
                        ) : (
                          <td></td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </Tables>
            {disable?.loading || load ? (
              <Loading />
            ) : (
              <>
                <div className="row mt-2">
                  <div className="col-sm-1">
                    <button
                      type="button"
                      className="btn btn-block btn-success btn-sm"
                      id="btnSave"
                      onClick={() =>
                        handleSubmit(
                          "ManageFieldMaster/SaveManageFieldMasterData",
                        )
                      }
                      disabled={disable?.update ? true : false}
                    >
                      {t("Save")}
                    </button>
                  </div>
                  <div className="col-sm-1">
                    <button
                      type="button"
                      className="btn btn-block btn-success btn-sm"
                      id="btnSave"
                      onClick={() =>
                        handleSubmit(
                          "ManageFieldMaster/UpdateManageFieldMasterData",
                        )
                      }
                      disabled={disable?.update ? false : true}
                    >
                      {t("Update")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ManageFieldMaster;
