import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { SaveButton } from "../../components/UI/CustomButton";

const PrintBarCode = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    BarcodeNo: "",
    FromNo: "001",
    Centre: "",
  });
  const [Centre, setCentre] = useState([]);
  const [load, setLoad] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "Centre") {
      getFromNumber(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  console.log(formData);
  const getFromNumber = (value) => {
    setLoad(true);
    axiosInstance
      .post("CommonController/GetBarcodeseries", {
        CentreId: Number(value),
      })
      .then((res) => {
        setLoad(false);
        setFormData((prev) => ({
          ...prev,
          Centre: value,
          FromNo: res?.data?.message[0]?.FormNo ?? "001",
        }));
      })
      .catch((err) => {
        setLoad(false);
        setFormData((prev) => ({
          ...prev,
          Centre: value,
          FromNo: "001",
        }));
      });
  };
  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res?.data?.message || [];
        let CentreDataValue = data?.map((ele) => ({
          value: ele?.CentreID,
          label: ele?.Centre,
        }));
        getFromNumber(CentreDataValue[0]?.value);
        setCentre(CentreDataValue);
      })
      .catch((err) => {
        toast.error("Failed to load Centre data");
      });
  };

  useEffect(() => {
    getAccessCentres();
  }, []);
  const handleSave = () => {
    if (formData?.BarcodeNo != "") {
      setLoad(true);

      axiosInstance
        .post("CommonController/SavePrintBarCode", {
          ...formData,
          BarcodeNo: Number(formData?.BarcodeNo),
          CentreId: Number(formData?.Centre),
        })
        .then((res) => {
          setLoad(false);
          toast.success(res?.data?.message);
          setFormData({
            ...formData,
            BarcodeNo: "",
            FromNo: "001",
          });
          getFromNumber(formData?.Centre);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    } else {
      toast.error("Barcode Number Is Required");
    }
  };
  return (
    <>
      <Accordion
        name={t("Print Barcode")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Barcode No"
              id="BarcodeNo"
              name="BarcodeNo"
              className="required-fields"
              placeholder=""
              max={20}
              value={formData?.BarcodeNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="From No"
              id="From No"
              name="FromNo"
              placeholder=""
              disabled={true}
              max={20}
              value={formData?.FromNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={Centre}
              name="Centre"
              id="Centre"
              lable="Centre"
              selectedValue={formData?.Centre}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <SaveButton
              text={"Save"}
              onClick={() => handleSave()}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default PrintBarCode;
