import React, { useState } from "react";
import { useEffect } from "react";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { isChecked } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";

import Accordion from "@app/components/UI/Accordion";
const CentreSelectModalForDaySpecial = ({
  show,
  handleClose,
  DiscountData,
}) => {
  console.log(DiscountData);
  const [Dropdown, setDropdown] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [InvestigationData, setInvestigationData] = useState([]);

  const { t } = useTranslation();

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

        setDropdown(CentreDataValue);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getDiscountMasterItemData = () => {
    axiosInstance
      .post("Promotional/getPromotionalMasterCentreData", {
        DiscountId: DiscountData?.DiscountId,
        PromotionalID: DiscountData?.PromotionalID,
      })
      .then((res) => {
        setTableData(res.data.message);
      })
      .catch((err) => console.log(err));
  };

  const handleCheckbox = (e, index, data) => {
    const { name, checked } = e.target;
    if (index >= 0) {
      const data = [...Dropdown];
      data[index][name] = checked ? "1" : "0";
      return setDropdown(data);
    } else {
      const val = Dropdown.map((ele) => {
        return {
          ...ele,
          [name]: checked ? "1" : "0",
        };
      });
      return setDropdown(val);
    }
  };

  const disableData = (DiscountID, CentreID, PromotionalID) => {
    if (window.confirm("Are You Sure?")) {
      axiosInstance
        .post("Promotional/RemovePromotionalCentre", {
          DiscountID: DiscountID,
          CentreID: CentreID,
          PromotionalID: PromotionalID,
        })
        .then((res) => {
          if (res?.data?.message === "Remove successfully") {
            toast.success(res?.data?.message);
            getDiscountMasterItemData();
          }
        })
        .catch((err) => {
          toast.error(err.response.data.message);
          console.log(err);
        });
    }
  };

  useEffect(() => {
    getAccessCentres();
  }, []);

  const Api = () => {
    const data = Dropdown.filter((ele) => ele?.isActive === "1");
    console.log(data);
    if (data.length > 0) {
      const payload = data.map((ele) => {
        return {
          CentreID: ele.value,
          isActive: ele.isActive,
          DiscountID: DiscountData?.DiscountId,
          PromotionalID: DiscountData?.PromotionalID,
          DiscountPer: DiscountData?.DiscountPer,
        };
      });
      axiosInstance
        .post("Promotional/AddPromotionalMasterCentre", payload)
        .then((res) => {
          if (res.data.message) {
            toast.success(res.data.message);
            const val = Dropdown.map((ele) => {
              return {
                ...ele,
                isActive: 0,
              };
            });
            getDiscountMasterItemData();
            const resetData = [...Dropdown].map((ele) => {
              return { ...ele, isActive: 0 };
            });
            setDropdown(resetData);
          }
        })
        .catch((err) => {
          toast.error(err.response.data.message);

          if (err?.response?.status === 504) {
            toast.error("Something went wrong");
          }
        });
    } else {
      toast.error("Please Select One Test");
    }
  };

  useEffect(() => {
    getDiscountMasterItemData();
  }, []);

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      size="lg"
      style={{
        width: isMobile ? "80vw" : "50vw",
      }}
      visible={show}
      onHide={() => {
        handleClose();
      }}
      width="50vw"
      header={t("Centre Select Modal For DaySpecial")}
      className={theme}
    >
      {Dropdown.length > 0 && (
        <div style={{ maxHeight: "280px" }}>
          <Tables>
            <thead
              className="cf"
              style={{
                position: "sticky",
                top: -2,
              }}
            >
              <tr>
                <th>{t("S.No")}</th>
                <th>{t("Name")}</th>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleCheckbox}
                    checked={
                      Dropdown?.length > 0
                        ? isChecked("isActive", Dropdown, "1").includes(false)
                          ? false
                          : true
                        : false
                    }
                    name="isActive"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {Dropdown?.map((ele, index) => (
                <tr key={index}>
                  <td data-title={t("S.No")}>{index + 1} &nbsp;</td>
                  <td data-title={t("Name")}>{ele?.label} &nbsp;</td>
                  <td>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={ele?.isActive === "1" ? true : false}
                      onChange={(e) => handleCheckbox(e, index, ele)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      )}

      <div className="row mt-2 mb-2">
        <div className="col-sm-3">
          {Dropdown.length > 0 && (
            <button
              type="button"
              className="btn btn-block  btn-success btn-sm"
              onClick={Api}
            >
              {t("Add")}
            </button>
          )}
        </div>
      </div>
      <Accordion title="Selected Centre" defaultValue={true}></Accordion>
      {tableData.length > 0 && (
        <div style={{ height: "auto", overflow: "auto", margin: "10px" }}>
          <Tables>
            <thead
              className="cf"
              style={{
                position: "sticky",
                top: -2,
              }}
            >
              <tr>
                <th>{t("S.No")}</th>
                <th>{t("Centre Name")}</th>
                <th>{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((ele, index) => (
                <tr key={index}>
                  <td data-title={t("S.No")}>{index + 1}&nbsp;</td>

                  <td data-title={t("Centre Name")}>{ele?.centre}&nbsp;</td>
                  <td data-title={t("Action")}>
                    <button
                      className="btn btn-danger btn-sm"
                      name="disableData"
                      onClick={() =>
                        disableData(
                          ele?.DiscountID,
                          ele?.Centreid,
                          ele?.PromotionalID,
                        )
                      }
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      )}

      <div className="row mt-2 mb-1">
        <div className="col-sm-3">
          <button
            className="btn btn-block btn-danger btn-sm"
            onClick={handleClose}
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default CentreSelectModalForDaySpecial;
