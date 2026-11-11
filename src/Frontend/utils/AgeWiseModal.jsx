import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";
import { isChecked } from "../util/Commonservices";
import FilterInput from "../../components/Filter/FilterInput";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton";

const AgeWiseModal = ({ show, handleClose, DiscountData }) => {
  const [Dropdown, setDropdown] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [InvestigationData, setInvestigationData] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [filterInput, setFilterInput] = useState('')
  const [OriginalInvestigationData, setOriginalInVestigationData] = useState([])
  const { t } = useTranslation();

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
      .post("AgeWiseDiscount/getDiscountMasterItemData", {
        DiscountId: DiscountData?.DiscountId,
      })
      .then((res) => {
        if(Array.isArray(res.data.message) && res?.data?.message?.length > 0){
          setTableData(res.data.message);
          return
        }else{
          setTableData([])
        }
      })
      .catch((err) => console.log(err));
  };

  const Fetch = (id) => {
    axiosInstance
      .post("AgeWiseDiscount/AgeWiseDiscountGetInvestigationData", {
        DepartmentID: Number(id),
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
        setOriginalInVestigationData(newVal)
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        console.log(err);
      });
  };

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
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
        .post("AgeWiseDiscount/RemoveInvestigationDiscountMaster", {
          DiscountID : String(DiscountID || ""),
          InvestigationId : InvestigationId,
        })
        .then((res) => {
          if (res?.data?.message === "Removed successfully") {
            toast.success(res?.data?.message);
            Fetch(selectedValue);
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

  console.log('OriginalInvestigationData::', OriginalInvestigationData);

  const handleFilterInput = (e) => {
    const value = e.target.value;
    setFilterInput(value);

    const filterInvData = OriginalInvestigationData?.filter((item) =>
      Object.keys(item).some((key) =>
        String(item[key])
          .toLowerCase()
          .includes(value.toLowerCase())
      )
    );

    setInvestigationData(filterInvData);
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
        };
      });
      axiosInstance
        .post("AgeWiseDiscount/AddDiscountMasterItem", payload)
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
            setSelectedValue("")
            setInvestigationData(val);
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
  };

  useEffect(() => {
    getDiscountMasterItemData();
  }, [DiscountData?.DiscountID]);

  console.log(InvestigationData);
  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t("Global Share")}
        visible={show}
        onHide={() => {
          handleClose();
          setInvestigationData([]);
        }}
        draggable={false}
        className={theme}
        style={{ width: "1000px" }}
      >
        <div className="row px-2 py-2 d-flex justify-content-between">
          <div className="col-sm-6 col-12">
            <SelectBox
              options={[
                { label: "Select Department", value: "0" },
                ...Dropdown,
              ]}
              value={selectedValue}
              className={'p-0'}
              name="DepartmentID"
              onChange={handleSelectChange}
            />
          </div>
          {
            OriginalInvestigationData?.length > 0 &&
            <div className="">
              <FilterInput onChange={handleFilterInput} value={filterInput} />
            </div>
          }
        </div>

        {(InvestigationData.length > 0) ? (
          <Tables>
            <thead>
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
        ) :
          (tableData?.length <= 0 ? <NoRecordFound /> : "")
        }
        <div className="row">
          <div className="col-sm-3 py-2">
            {InvestigationData.length > 0 && (
              <SaveButton
                onClick={Api}
                text={"Add"}
              />
              // <button
              //   type="button"
              //   className="btn btn-block  btn-warning btn-sm"
              //   onClick={Api}
              // >
              //   {t("Add")}
              // </button>
            )}
          </div>
        </div>
        {tableData.length > 0 && (
          <Tables>
            <thead>
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
        )}
        <div className="row">
          <div className="col-sm-2 pt-2">
            <CancelButton
              onClick={handleClose}
              text={t("Close")}
            />
            {/* <button
              className="btn btn-block btn-danger btn-sm"
              onClick={handleClose}
            >
              {t("Close")}
            </button> */}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AgeWiseModal;
