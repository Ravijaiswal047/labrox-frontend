import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import { CustomButton } from "../../components/UI/CustomButton";
const TransferMachineRanges = () => {
  const [Machine, setMachine] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [state, setState] = useState({
    FromCentre: "",
    ToCentre: "",
    FromMachine: "",
    ToMachine: "",
  });

  const { t } = useTranslation();
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  console.log(state);

  const getMachine = () => {
    axiosInstance
      .get("RE/BindMachineGroup")
      .then((res) => {
        let data = res.data.message;
        let Machine = data.map((ele) => {
          return {
            value: ele.MachineId,
            label: ele.MachineName,
          };
        });
        Machine.unshift({ label: "All", value: "" });
        setMachine(Machine);
      })
      .catch((err) => console.log(err));
  };

  const postApi = () => {
    if (
      state?.FromCentre &&
      state?.ToCentre &&
      state?.FromMachine &&
      state?.ToMachine
    ) {
      axiosInstance
        .post("machineReferencesRanges/TransferMachineRefRangesData", {
          FromCentre: state?.FromCentre,
          FromMachine: state?.FromMachine,
          ToCentre: state?.ToCentre,
          ToMachine: state?.ToMachine,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          setState({
            FromCentre: "",
            ToCentre: "",
            FromMachine: "",
            ToMachine: "",
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong",
          );
        });
    } else {
      toast.error("All fields are Required.");
    }
  };

  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        CentreDataValue.unshift({ label: "All", value: "" });
        setCentreData(CentreDataValue);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getAccessCentres();
    getMachine();
  }, []);
  return (
    <>
      <Accordion
        name={t("Machine Reference Ranges Transfer")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-1 mt-1 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              options={CentreData}
              name="FromCentre"
              lable="FromCentre"
              selectedValue={state?.FromCentre}
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              options={Machine}
              lable="From Machine Group"
              onChange={handleSelectChange}
              name="FromMachine"
              selectedValue={state?.FromMachine}
            />
          </div>

          <div className="col-sm-1">
            <CustomButton
              text={">>"}
              style={{ width: "50px" }}
              onClick={postApi}
              className="mx-4"
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              lable="To Centre"
              options={
                state?.FromCentre
                  ? CentreData.filter((ele) => ele.value != state?.FromCentre)
                  : CentreData
              }
              name="ToCentre"
              selectedValue={state?.ToCentre}
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              lable="To Machine Group"
              options={Machine}
              onChange={handleSelectChange}
              name="ToMachine"
              selectedValue={state?.ToMachine}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default TransferMachineRanges;
