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
const TestSelectModalForDaySpecial = ({ show, handleClose, DiscountData }) => {
  const { t } = useTranslation();
  const [Dropdown, setDropdown] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [InvestigationData, setInvestigationData] = useState([]);

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartmentData")
      .then((res) => {
        let data = res.data.message;
        let Department = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        Department.unshift({ label: "All", value: "" });
        setDropdown(Department);
      })
      .catch((err) => console.log(err));
  };

  const filterData = () => {
    let data = [];
    for (let i = 0; i < tableData?.length; i++) {
      data.push(tableData[i]["InvestigationId"]);
    }

    return data;
  };

  const getDiscountMasterItemData = () => {
    axiosInstance
      .post("Promotional/getPromotionalMasterItemData", {
        DiscountId: DiscountData?.DiscountId,
        PromotionalID: DiscountData?.PromotionalID,
      })
      .then((res) => {
        setTableData(res.data.message);
      })
      .catch((err) => console.log(err));
  };

  const Fetch = (id) => {
    axiosInstance
      .post("AgeWiseDiscount/AgeWiseDiscountGetInvestigationData", {
        DepartmentID: id,
        PromotionalID: DiscountData?.PromotionalID,
        DiscountPer: DiscountData?.DiscountPer,
      })
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          let data = res.data.message;
          const val = data.filter((ele) => {
            if (!filterData().includes(ele?.InvestigationID)) {
              return {
                ele,
              };
            }
          });

          const newVal = val.map((ele) => {
            return {
              ...ele,
              DiscountId: DiscountData?.DiscountId,
              DiscountPer: DiscountData?.DiscountPer,
              isActive: "0",
            };
          });
          setInvestigationData(newVal);
        } else {
          setInvestigationData([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log(InvestigationData);

  const handleSelectChange = (event) => {
    Fetch(event.target.value);
  };

  const handleCheckbox = (e, index, data) => {
    const { name, checked } = e.target;
    checkDuplicate(data?.InvestigationID, data?.DiscountId)
      .then((res) => {
        if (res === "Duplicate Investigation") {
          toast.error(res);
        } else {
          if (index >= 0) {
            const data = [...InvestigationData];
            data[index][name] = checked ? "1" : "0";
            return setInvestigationData(data);
          } else {
            const val = InvestigationData.map((ele) => {
              return {
                ...ele,
                [name]: checked ? "1" : "0",
              };
            });
            return setInvestigationData(val);
          }
        }
      })
      .catch((err) => console.log(err));
  };

  const disableData = (DiscountID, InvestigationId) => {
    if (window.confirm("Are You Sure?")) {
      axiosInstance
        .post("Promotional/RemoveInvestigationPromotionalMaster", {
          DiscountID: DiscountID,
          InvestigationId: InvestigationId,
          PromotionalID: DiscountData?.PromotionalID,
        })
        .then((res) => {
          getDiscountMasterItemData();
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
          console.log(err);
        });
    }
  };

  const checkDuplicate = (InvestigationId, DiscountId) => {
    return new Promise((resolve, reject) => {
      axiosInstance
        .post("AgeWiseDiscount/DuplicateInvestigationDiscountMaster", {
          InvestigationID: InvestigationId,
          DiscountId: DiscountId,
          PromotionalID: DiscountData?.PromotionalID,
        })
        .then((res) => {
          if (res.data.message) {
            resolve(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  };

  useEffect(() => {
    getDepartment();
  }, []);

  const Api = () => {
    const data = InvestigationData.filter((ele) => ele?.isActive === "1");
    if (data.length > 0) {
      const payload = data.map((ele) => {
        return {
          DiscountID: ele.DiscountId,
          InvestigationId: ele.InvestigationID,
          DiscountPer: ele.DiscountPer,
          isActive: ele.isActive,
          PromotionalID: DiscountData?.PromotionalID,
        };
      });
      axiosInstance
        .post("Promotional/AddPromotionalMasterItem", payload)
        .then((res) => {
          if (res.data.message) {
            toast.success(res.data.message);
            const val = InvestigationData.map((ele) => {
              return {
                ...ele,
                isActive: 0,
              };
            });
            Fetch();
            setInvestigationData(val);
            getDiscountMasterItemData();
            document.getElementById("select-department").value = 0;
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
  }, [DiscountData?.DiscountID]);
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
        setInvestigationData([]);
      }}
      width="50vw"
      header={t("Test Select Modal For DaySpecial")}
      className={theme}
    >
      <div className="row">
        <div className="col-sm-6">
          <SelectBox
            options={[{ label: "Select Department", value: "0" }, ...Dropdown]}
            name="DepartmentID"
            placeholder=" "
            id="Select Department"
            lable="Select Department"
            onChange={handleSelectChange}
          />
        </div>
      </div>
      {InvestigationData.length > 0 && (
        <>
          <div style={{ height: "auto", overflow: "auto" }}>
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
                  <th>{t("Investigation Code")}</th>
                  <th>{t("Investigation Name")}</th>
                  <th>
                    <input
                      type="checkbox"
                      onChange={handleCheckbox}
                      checked={
                        InvestigationData?.length > 0
                          ? isChecked(
                              "isActive",
                              InvestigationData,
                              "1",
                            ).includes(false)
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
                {InvestigationData?.map((ele, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No")}>{index + 1} &nbsp;</td>
                    <td data-title={t("Investigation Code")}>
                      {ele?.TestCode} &nbsp;
                    </td>
                    <td data-title={t("Investigation Name")}>
                      {ele?.TestName} &nbsp;
                    </td>
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
        </>
      )}

      <div className="row mt-2 mb-2">
        <div className="col-sm-3">
          {InvestigationData.length > 0 && (
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
      <Accordion title="Selected Test" defaultValue={true}></Accordion>
      {tableData.length > 0 && (
        <>
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
                  <th>{t("Department Name")}</th>
                  <th>{t("Investigation Code")}</th>
                  <th>{t("Investigation Name")}</th>
                  <th>{t("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((ele, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                    <td data-title={t("Department Name")}>
                      {ele?.Department}&nbsp;
                    </td>
                    <td data-title={t("Investigation Code")}>
                      {ele?.TestCode}&nbsp;
                    </td>
                    <td data-title={t("Investigation Name")}>
                      {ele?.TestName}&nbsp;
                    </td>
                    <td data-title={t("Action")}>
                      <button
                        className="btn btn-danger btn-sm"
                        name="disableData"
                        onClick={() =>
                          disableData(ele?.DiscountID, ele?.InvestigationId)
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
        </>
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

export default TestSelectModalForDaySpecial;
