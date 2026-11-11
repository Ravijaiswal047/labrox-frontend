import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
const PhelebotomistMappingModal = ({
  show,
  handleClose,
  name,
  dataObj,
  routes,
  phelebo,
  dropLocation,
  Innerdata,
}) => {
  const { t } = useTranslation();
  const handleValue = (name) => {
    return name === "Route"
      ? Innerdata?.RouteId
      : name === "Phelebo"
        ? Innerdata?.PhelboIdNew[0]
        : name === "DropLocation"
          ? Innerdata?.DropLocationIdNew[0]
          : "";
  };
  const [areaBind, setAreaBind] = useState([]);
  const [value, setValue] = useState(handleValue(name));

  const getAreas = (api, payload) => {
    axiosInstance
      .post(api, payload)
      .then((res) => {
        const data = res.data.message;
        handleCheckThroughApi(data, handleKeyName(name), value);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleCheckThroughApi = (areabind, key, id) => {
    const data = areabind?.map((ele) => {
      if (ele[key] == id) {
        return {
          ...ele,
          ChkArea: 1,
        };
      } else {
        return {
          ...ele,
          ChkArea: 0,
        };
      }
    });
    setAreaBind(data);
  };

  const handleChange = (name,e) => {
    const { value } = e;
    setValue(value);
  };

  const handleDropDown = (name) => {
    switch (name) {
      case "Route":
        return (
          // <SelectBox
          //   // options={routes}
          //   options={[{ label: "Select Route", value: "" }, ...routes]}
          //   name="Route"
          //   selectedValue={value}
          //   className="input-sm"
          //   onChange={(e) => handleChange(e)}
          // />
          <ReactSelect
                dynamicOptions={[{ label: "Select Route", value: "" }, ...routes]}
                name="Route"
                lable={t("Route")}       
                removeIsClearable={true}
                placeholderName={t("Route")}
                value={value}
                onChange={handleChange}
              />
        );
        break;
      case "Phelebo":
        return (
          // <SelectBox
          //   // options={phelebo}
          //   options={[{ label: "Select Phlebo", value: "" }, ...phelebo]}
          //   name="Phelebo"
          //   selectedValue={value}
          //   className="input-sm"
          //   onChange={(e) => handleChange(e)}
          // />
          <ReactSelect
                dynamicOptions={[{ label: "Select Phlebo", value: "" }, ...phelebo]}
                name="Phelebo"
                lable={t("Phelebo")}       
                removeIsClearable={true}
                placeholderName={t("Phelebo")}
                value={value}
                onChange={handleChange}
              />
        );
        break;
      case "DropLocation":
        return (
          // <SelectBox
          //   // options={dropLocation}
          //   options={[
          //     { label: "Select DropLocation", value: "" },
          //     ...dropLocation,
          //   ]}
          //   name="DropLocation"
          //   selectedValue={value}
          //   className="input-sm"
          //   onChange={(e) => handleChange(e)}
          // />
          <ReactSelect
                dynamicOptions={[
              { label: "Select DropLocation", value: "" },
              ...dropLocation,
            ]}
                name="DropLocation"
                lable={t("DropLocation")}       
                removeIsClearable={true}
                placeholderName={t("DropLocation")}
                value={value}
                onChange={handleChange}
              />
        );
        break;
      default:
        break;
    }
  };

  const handlePayload = (name, data) => {
    switch (name) {
      case "Route":
        return {
          API: "PhelebotomistMapping/SaveRoute",
          payload: {
            LocalityId: data?.Id,
            RouteId: value?.toString(),
            ChkArea: data?.ChkArea,
          },
        };
        break;
      case "Phelebo":
        return {
          API: "PhelebotomistMapping/SavePhelebo",
          payload: {
            LocalityId: data?.Id,
            PheleboId: value?.toString(),
            ChkArea: data?.ChkArea,
          },
        };
        break;
      case "DropLocation":
        return {
          API: "PhelebotomistMapping/SaveDropLocation",
          payload: {
            CentreId: value?.toString(),
            DropLocationId: value?.toString(),
            LocalityId: data?.Id,
            ChkArea: data?.ChkArea,
          },
        };
        break;
      default:
        break;
    }
  };

  const handleAPI = (name, data) => {
    const { API, payload } = handlePayload(name, data);
    axiosInstance
      .post(API, payload)
      .then((res) => {
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };
  //names -> Route,Phelebo.......
  const handleCheck = (e, ele, names, index) => {
    // console.log(value);
    if (value && value != 0) {
      const { name, checked } = e.target;
      const data = { ...ele, [name]: checked ? "1" : "0" };
      const val = [...areaBind];
      val[index][name] = checked ? "1" : "0";
      setAreaBind(val);
      handleAPI(names, data);
    } else toast.error("Please select any " + names);
  };

  const handleKeyName = (name) => {
    switch (name) {
      case "Route":
        return "RouteId";
        break;
      case "Phelebo":
        return "PheleboId";
        break;
      case "DropLocation":
        return "droplocationID";
        break;
      default:
        break;
    }
  };

  const handleBindCheckPayload = (data, name, value) => {
    switch (name) {
      case "Route":
        return data;
        break;
      case "Phelebo":
        return { ...data, PheleboId: value?.toString() };
        break;
      case "DropLocation":
        return { ...data, DropLocationId: value?.toString() };
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    getAreas(
      dataObj?.apiUrl,
      handleBindCheckPayload(dataObj?.payload, name, value),
    );
  }, [value]);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      visible={show}
      onHide={handleClose}
      header={t(`Map : ${name} `)}
      className={theme}
      style={{
        width: isMobile ? "80vw" : "30vw",
      }}
    >
      <div className="row">
        <label className="col-sm-12  col-md-3">{name} :</label>
        <div className="col-sm-12 col-md-6">{handleDropDown(name)}</div>
      </div>

      <div className="row">
        <label className="col-sm-12  col-md-2">Area :</label>

        {areaBind?.map((ele, index) => (
          <div key={index} className="col-sm-12 col-md-9">
            <input
              type="checkbox"
              name="ChkArea"
              checked={ele?.ChkArea == 0 ? false : true}
              onChange={(e) => handleCheck(e, ele, name, index)}
            />
            <span className="PheloMapArea">
              {ele?.NAME} Pincode {ele?.PinCode || ele?.Pincode}
            </span>
          </div>
        ))}
      </div>
    </Dialog>
  );
};

export default PhelebotomistMappingModal;
