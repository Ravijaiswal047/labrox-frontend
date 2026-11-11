import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { isChecked } from "../util/Commonservices";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";

const DeptModal = ({ show, handleClose, DiscountData, url, title }) => {
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

  const filterData = () => {
    let data = [];
    for (let i = 0; i < tableData?.length; i++) {
      data.push(tableData[i]["InvestigationId"]);
    }

    return data;
  };

  const getDiscountMasterItemData = () => {
    if (title != "membership") {
      axiosInstance
        .post("AgeWiseDiscount/getDiscountMasterCentreData", {
          DiscountId: DiscountData?.DiscountId,
        })
        .then((res) => {
          setTableData(res.data.message);
        })
        .catch((err) => console.log(err));
    } else {
      axiosInstance
        .post("MembershipCardMaster/getMemberShipMasterCentreData", {
          MembershipNo: DiscountData?.CardNo,
          MembershipID: DiscountData?.CardID,
        })
        .then((res) => {
          if (Array.isArray(res.data?.message)) {
            setTableData(res.data.message);
          } else {
            setTableData([]);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const Fetch = (id) => {
    axiosInstance
      .post("AgeWiseDiscount/AgeWiseDiscountGetInvestigationData", {
        DepartmentID: id,
      })
      .then((res) => {
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
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        console.log(err);
      });
  };

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
        }
      })
      .catch((err) => console.log(err));
  };

  const disableData = (DiscountID, InvestigationId, id) => {
    if (title == "membership") {
      axiosInstance
        .post("MembershipCardMaster/RemoveMemberShipCentre", {
          CentreID: id,
          MembershipNo: DiscountData?.CardNo,
          MembershipID: DiscountData?.CardID,
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
    } else {
      axiosInstance
        .post("AgeWiseDiscount/RemoveInvestigationDiscountMaster", {
          DiscountID,
          InvestigationId,
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

  const checkDuplicate = (InvestigationId, DiscountId) => {
    return new Promise((resolve, reject) => {
      axiosInstance
        .post("AgeWiseDiscount/DuplicateInvestigationDiscountMaster", {
          InvestigationID: InvestigationId,
          DiscountId: DiscountId,
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
    getAccessCentres();
  }, []);

  const Api = () => {
    if (title == "membership") {
      const data = Dropdown.filter((ele) => ele?.isActive === "1");
      const payload = data.map((ele) => {
        return {
          CentreID: ele.value,
          MembershipNo: DiscountData?.CardNo,
          MembershipID: DiscountData?.CardID,
          isActive: 1,
        };
      });
      axiosInstance
        .post("MembershipCardMaster/AddMemberShipMasterCentre", payload)
        .then((res) => {
          toast.success(res.data.message);
          getDiscountMasterItemData();
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    } else {
      const data = Dropdown.filter((ele) => ele?.isActive === "1");
      console.log(data);
      if (data.length > 0) {
        const payload = data.map((ele) => {
          return {
            CentreID: ele.value,
            isActive: ele.isActive,
            DiscountID: DiscountData?.DiscountId,
          };
        });
        axiosInstance
          .post("AgeWiseDiscount/AddDiscountMasterCentre", payload)
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
    }
  };

  useEffect(() => {
    getDiscountMasterItemData();
  }, []);

  const theme = useLocalStorage("theme", "get");


  useEffect(() => {
  if (title === "membership" && Dropdown.length > 0 && tableData.length > 0) {
    const activeCentreIds = tableData
      .filter(ele => ele.isActive === true || ele.isActive === "1")
      .map(ele => String(ele.Centreid));

      console.log("Avtive centreid", activeCentreIds)

    const updatedDropdown = Dropdown.map(ele => ({
      ...ele,
      isActive: activeCentreIds.includes(String(ele.value)) ? "1" : "0",
    }));

    setDropdown(updatedDropdown);
  }
}, [tableData, Dropdown.length]);

console.log("dropdown data", Dropdown)

  return (
    <>
      <Dialog
        header={t("Centre Share")}
        visible={show}
        onHide={() => {
          handleClose();
        }}
        draggable={false}
        className={theme}
        style={{ width: "1000px" }}
      >
        {Dropdown.length > 0 && (
          <Tables>
            <thead>
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
        )}
        <div className="row justify-content-end">
          <div className="col-sm-auto pt-2">
            <CancelButton
              text={"Close"}
              onClick={handleClose}
            />
          </div>
          <div className="col-sm-auto pt-2">
            {Dropdown.length > 0 && (
              <SaveButton
                text={"Add"}
                onClick={Api}
              />
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DeptModal;
