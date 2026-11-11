import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { isRound, RoundUpTo } from "../../utils/Constants";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Form } from "react-bootstrap";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { InputText } from "primereact/inputtext";
import { CloudCog } from "lucide-react";
const MachineParamModal = ({
  show,
  handleClose,
  data,
  active,
  onclickmachinedata,
  bindlabobservationdata,

}) => {
  console.log(data, active);
  const [payload, setPayload] = useState({
    Machine_ParamID: data?.Machine_ParamID ? data?.Machine_ParamID : "",
    MACHINEID: data?.Machineparam ?? "",
    // MachineParam: data?.MachinePARAM || "",
    MachineParam: data?.MachineParam || "",
    Suffix: "",
    AssayNo: data?.AssayNo ? data?.AssayNo : "",
    RoundUpTo: (data?.RoundUpTo ?? 0).toString(),
    IsOrderable: data?.IsOrderable == "FALSE" ? 0 : 1,
    Decimalcalc: data?.Decimalcalc ?? "",
    IsRound: (data?.IsRound ?? "1").toString(),
    CommaRemoveSeprate: data?.CommaRemoveSeprate == 1 ? 1 : 0,
  });

  //   const [payload, setPayload] = useState({
  //   Machine_ParamID: data?.Machine_ParamID || "",
  //   MACHINEID: active?.value || "",
  //   MachineParam: data?.MachineParam || "",
  //   Suffix: "",
  //   AssayNo: data?.AssayNo || "",
  //   RoundUpTo: (data?.RoundUpTo ?? 0).toString(),
  //   IsOrderable: data?.IsOrderable == "FALSE" ? 0 : 1,
  //   Decimalcalc: data?.Decimalcalc || "",
  //   IsRound: (data?.IsRound ?? "1").toString(),
  //   CommaRemoveSeprate: data?.CommaRemoveSeprate == 1 ? 1 : 0,
  // });

  useEffect(() => {
    const machineId = active?.value || active || "";
    setPayload({
      Machine_ParamID: data?.Machine_ParamID || "",
      MACHINEID: typeof machineId === "string" ? machineId : machineId?.value || "",
      MachineParam: data?.MachineParam || "",
      Suffix: data?.Suffix || "",
      AssayNo: data?.AssayNo || "",
      RoundUpTo: (data?.RoundUpTo ?? 0).toString(),
      IsOrderable: (data?.IsOrderable === "TRUE" || data?.IsOrderable == 1) ? 1 : 0,
      Decimalcalc: data?.Decimalcalc || "",
      IsRound: (data?.IsRound ?? "1").toString(),
      CommaRemoveSeprate: data?.CommaRemoveSeprate == 1 ? 1 : 0,
    });
  }, [data]);

  console.log("DATA", data);
  console.log("PAYLOAD", payload);
  const { t, i18n } = useTranslation();
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };
  console.log(data, "anuj");
  const handleSubmit = (url) => {
    axiosInstance
      .post(url, payload)
      .then((res) => {
        handleClose();
        toast.success(res?.data?.message);
        const machineId = active?.value || active || "";
        onclickmachinedata(typeof machineId === "string" ? machineId : machineId?.value);
        if (data?.Machine_ParamID) bindlabobservationdata(data?.Machine_ParamID);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  console.log("payload", payload);
  console.log("show", show);
  return (
    <>
      <Dialog
        // header={t("Machine Param Basic Information")}
        header={

          <div style={{ fontSize: "14px", marginTop: "4px" }}>
            <span><strong>MachineID:&nbsp;&nbsp;</strong>{payload?.MACHINEID}</span>
            <span style={{ marginLeft: "16px" }}>
              <strong>MachineParamID:&nbsp;&nbsp;</strong>{payload?.Machine_ParamID}
            </span>
          </div>

        }
        onHide={() => {
          handleClose();
        }}
        className={theme}
        visible={show}
        style={{
          width: isMobile ? "80vw" : "50vw",
        }}
      >
        <Tables>
          <tbody>
            {/* <tr>
              <td className="py-1">
                <label for="usr">{t("MachineID")}:</label>
              </td>
              <td className="py-1">
                <Input
                  name="MACHINEID"
                  id="MACHINEID"
                  type="text"
                  onChange={handleChange}
                  className="select-input-box form-control input-sm"
                  readonly="readonly"
                  disabled={data?.isId ? true : false}
                  value={payload?.MACHINEID}
                />
              </td>
            </tr>
            <tr>
              <td className="py-2">
                <label for="usr">{t("Machine_ParamID")}:</label>
              </td>
              <td className="py-2">
                <Input
                  name="Machine_ParamID"
                  type="text"
                  onChange={handleChange}
                  className="select-input-box form-control input-sm"
                  // disabled={data?.isEnable ? true : false}
                  value={payload?.Machine_ParamID}
                  readonly={payload?.Machine_ParamID ? true : false}
                />
              </td>
            </tr> */}
            <tr>
              <td className="py-1">
                <label for="usr">{t("MachineParam ID")}:</label>
              </td>
              <td className="py-1">
                <InputText
                  name="Machine_ParamID"
                  type="text"
                  value={payload?.Machine_ParamID}
                  onChange={handleChange}
                  className="select-input-box form-control input-sm"
                  disabled={data?.Machine_ParamID}
                />
              </td>
            </tr>
            <tr>
              <td className="py-1">
                <label for="usr">{t("Alias")}:</label>
              </td>
              <td className="py-1">
                <Input
                  name="MachineParam"
                  type="text"
                  value={payload?.MachineParam}
                  onChange={handleChange}
                  className="select-input-box form-control input-sm"
                />
              </td>
            </tr>
            <tr>
              <td className="py-1">
                <label for="usr">{t("Suffix")}:</label>
              </td>
              <td className="py-1">
                <Input
                  name="Suffix"
                  type="text"
                  value={payload?.Suffix}
                  onChange={handleChange}
                  className="select-input-box form-control input-sm"
                />
              </td>
            </tr>
            <tr>
              <td className="py-1">
                <label for="usr">{t("Assay No")}:</label>
              </td>
              <td className="py-1">
                <Input
                  name="AssayNo"
                  type="text"
                  value={payload?.AssayNo}
                  onChange={handleChange}
                  className="select-input-box form-control input-sm"
                />
              </td>
            </tr>

            <tr>
              <td className="py-1">
                <label for="usr">{t("isOrderable")}:</label>
              </td>
              <td className="py-1">

                <Form.Check
                  type="switch"
                  id="IsOrderable"
                  name="IsOrderable"
                  onChange={handleChange}
                  checked={payload?.IsOrderable == 1}
                />
              </td>
            </tr>
            <tr>
              <td className="py-1">
                <label for="usr">{t("RoundUpTo")}:</label>
              </td>
              <td className="py-1">
                <SelectBox
                  name="RoundUpTo"
                  options={RoundUpTo}
                  onChange={handleChange}
                  className="select-input-box form-control input-sm"
                  selectedValue={payload?.RoundUpTo}
                />
              </td>
            </tr>


            <tr>
              <td className="py-1">
                <label for="usr">{t("Remove Commas")}:</label>
              </td>
              <td className="py-1">
                <Form.Check
                  type="switch"
                  id="CommaRemoveSeprate"
                  name="CommaRemoveSeprate"
                  onChange={handleChange}
                  checked={payload?.CommaRemoveSeprate == 1}
                />
              </td>
            </tr>

            {/* <tr>
              <td className="py-1">
                <label for="usr">{t("IsRound")}:</label>
              </td>
              <td className="py-1">
                <SelectBox
                  name="IsRound"
                  options={isRound}
                  selectedValue={payload.IsRound}
                  className="select-input-box form-control input-sm"
                  onChange={handleChange}
                />
              </td>
            </tr> */}
          </tbody>
        </Tables>

        <div className="row mt-2 mb-1 d-flex justify-content-center">
          {data?.Machine_ParamID ? (
            <div className="col-sm-3">
              <button
                className="btn  btn-primary btn-sm"
                onClick={() => handleSubmit("MachineGroup/UpdateParam")}
              >
                {t("Update & Close")}
              </button>
            </div>
          ) : (
            <div className="col-sm-3">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSubmit("MachineGroup/AddParam")}
              >
                {t("Set & Close")}
              </button>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default MachineParamModal;
