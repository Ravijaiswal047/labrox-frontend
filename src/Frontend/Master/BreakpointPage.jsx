import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { isChecked } from "../util/Commonservices";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";

const BreakpointPage = () => {
  const [options, setOptions] = useState([]);
  const [tabledata, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    GroupID: "2",
  });
  const [load, setLoad] = useState(false);
  const [load2, setLoad2] = useState(false);
  const { t } = useTranslation();

  const BindCentre = () => {
    axiosInstance
      .post("CommonController/BindOrganism", {
        TypeID: 2,
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          let Organisum = data.map((ele) => {
            return {
              value: ele.organismid,
              label: ele.organismname,
            };
          });
          Organisum.unshift({ label: "Organism", value: "0" });
          setOptions(Organisum);
        } else {
          setOptions([]);
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleCheckbox = (e) => {
    const { checked } = e.target;
    const data = tabledata?.map((ele) => {
      return {
        ...ele,
        isActive: checked ? "1" : "0",
      };
    });
    setTableData(data);
  };

  const handleCollection = (e, index) => {
    const { name, checked, type, value } = e.target;
    const datas = [...tabledata];
    datas[index][name] = type === "checkbox" ? (checked ? "1" : "0") : value;
    setTableData(datas);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  useEffect(() => {
    BindCentre();
  }, []);

  const handleSearch = () => {
    setLoad(true);
    axiosInstance
      .post("BreakPoint/GetAntibioticList", payload)
      .then((res) => {
        if (res?.data?.success) {
          let tablemap = res?.data?.message;
          let data = tablemap?.map((ele) => {
            return {
              ...ele,
              isActive: "0",
            };
          });
          setTableData(data);
        } else {
          toast.error(res?.data?.message);
          setTableData([]);
        }
        setLoad(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Data Can not found",
        );
        setLoad(false);
      });
  };

  const handleSave = () => {
    const data = tabledata.filter((ele) => ele.isActive === "1");
    if (data?.length > 0) {
      setLoad2(true);
      const isInputEmpty = data.some((item) => item.breakpoint.trim() === "");
      if (isInputEmpty) {
        toast.error("Please enter value in the Breakpoint field");
        setLoad2(false);
        return;
      }

      axiosInstance
        .post("BreakPoint/SaveBreakPoint", {
          BreakPointData: data,
        })
        .then((res) => {
          toast.success(res.data?.message);
          setLoad2(false);
          handleSearch();
        })
        .catch((err) => {
          toast.error(
            err?.data?.message ? err?.data?.message : "Error Occured",
          );
          setLoad2(false);
        });
    } else {
      toast.error("please Choose One Value");
    }
  };
  return (
    <>
      <Accordion
        name={t("Break Point Page")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              name={"GroupID"}
              id="GroupID"
              placeholder=""
              options={options}
              selectedValue={payload?.GroupID}
              onChange={handleChange}
              lable={t("Organism")}
            />
          </div>
          <div className="col-sm-2">
            {load ? (
              <Loading />
            ) : (
              <SearchButton
                  text={"Search BreakPoint"}
                  onClick={handleSearch}
              />
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {tabledata.length > 0 && (
          <div className="row p-2 ">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>{t("Sr.No")}</th>
                    <th>{t("Antibiotic Name")}</th>
                    <th>{t("BreakPoint")} </th>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          tabledata.length > 0
                            ? isChecked("isActive", tabledata, "1").includes(
                                false,
                              )
                              ? false
                              : true
                            : false
                        }
                        onChange={handleCheckbox}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tabledata?.map((item, index) => (
                    <>
                      <tr key={index}>
                        <td data-title={t("Sr.No")}>{index + 1}&nbsp;</td>
                        <td data-title={t("Aniboitic Name")}>
                          {item?.name}&nbsp;
                        </td>
                        <td data-title={t("BreakPoint")}>
                          <Input
                            className="select-input-box form-control input-sm"
                            value={item?.breakpoint}
                            type="text"
                            name="breakpoint"
                            onChange={(e) => handleCollection(e, index)}
                          />
                        </td>
                        <td data-title="Status">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={item?.isActive === "1" ? true : false}
                            onChange={(e) => handleCollection(e, index)}
                          />
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </Tables>
              {isChecked("isActive", tabledata, "1").includes(true) && (
                <>
                  {/* Loading Start */}

                  {load2 ? (
                    <Loading />
                  ) : (
                    <div className="row">
                      <div className="col-sm-2" style={{ marginTop: "5px" }}>
                        <SaveButton
                            text={"Save"}
                            onClick={handleSave}
                            className="ml-5"
                          />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Accordion>
    </>
  );
};

export default BreakpointPage;
