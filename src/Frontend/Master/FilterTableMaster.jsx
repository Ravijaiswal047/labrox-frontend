import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import { FilterPageType } from "../../utils/Constants";
import SetColumnOrderModal from "./FilterTableMasterModals/SetColumnOrderModal";
import { Button } from "react-bootstrap";

const FilterTableMaster = () => {
  const { t } = useTranslation();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [payload, setPayload] = useState({
    Type: "ResultEntry",
    EmployeeID: "",
  });
  const [columnConfig, setColumnConfig] = useState([]);
  const [employee, setEmployee] = useState([]);
  const handleSearchSelectChange = (label, value) => {
    if (label == "Type") {
      setPayload({
        ...payload,
        [label]: value?.value?.toString(),
      });
      getFilterResultOption(value?.value, payload?.EmployeeID);
    } else {
      setPayload({
        ...payload,
        [label]: value?.value?.toString(),
      });
      getFilterResultOption(payload?.Type, value?.value?.toString());
    }
  };
  const [load, setLoad] = useState(false);
  const getEmployee = () => {
    axiosInstance
      .get("Camp/GetEmployees")
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.NAME,
          };
        });
        setEmployee(value);
      })
      .catch((err) => {
        setEmployee([]);

        toast.error("No Data Found");
      });
  };

  const getFilterResultOption = (PageName, ID) => {
    setLoad(true);
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: PageName,
        EmployeeId: ID,
      })
      .then((res) => {
        setLoad(false);
        let data = res?.data?.message;

        setColumnConfig(data);
      })
      .catch((err) => {
        setColumnConfig([]);
        setLoad(false);
      });
  };

  console.log(columnConfig);
  const toggleColumnVisibility = (column, index) => {
    const updatedColumn =
      column?.header === "Action" || column?.header === "S.No"
        ? columnConfig.map((ele) => ({
          ...ele,
          visible: columnConfig[0]?.visible !== true,
        }))
        : columnConfig.map((ele, i) =>
          i === index ? { ...ele, visible: !ele.visible } : ele,
        );
    setColumnConfig(updatedColumn);
  };

  const handleClick = () => {
    if (payload?.EmployeeID == "") toast.error("Please Select Any Employee");
    else {
      setLoad(true);
      axiosInstance
        .post("Lab/SaveFilterTableReprintData", {
          SaveData: columnConfig,
          PageName: payload?.Type,
          EmployeeId: payload?.EmployeeID,
        })
        .then(() => {
          setLoad(false);
          getFilterResultOption(payload?.Type, payload?.EmployeeID);
          toast.success("Updated Successfully");
        })
        .catch(() => {
          setLoad(false);
          toast.error("Error");
        });
    }
  };

  useEffect(() => {
    getEmployee();
  }, []);


  const handleOrderSave = (orderArr) => {
    setColumnConfig((prev) => {
      const newArr = Array(prev.length);
      orderArr.forEach(({ id, DisplayOrder }) => {
        const found = prev.find((x) => x.header === id);
        if (found) newArr[DisplayOrder - 1] = found;
      });
      prev.forEach((x) => {
        if (!newArr.includes(x)) {
          const emptyIdx = newArr.findIndex((y) => !y);
          if (emptyIdx !== -1) newArr[emptyIdx] = x;
        }
      });
      return newArr.map((item, idx) => ({ ...item, ColumnOrder: idx + 1 }));
    });
  };

  console.log('columnConfig:::', columnConfig);

  return (
    <>
      <Accordion
        name={t("Filter Table Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          {" "}
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={employee}
              removeIsClearable={true}
              name="EmployeeID"
              lable="EmployeeID"
              id="EmployeeID"
              placeholderName="Employee Name"
              value={payload?.EmployeeID}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={FilterPageType}
              removeIsClearable={true}
              name="Type"
              lable="Type"
              id="Type"
              placeholderName="Select Filter Type Page"
              value={payload?.Type}
              onChange={handleSearchSelectChange}
            />
          </div>
        </div>
        {load ? (
          <Loading />
        ) : (
          <div className="row">
            {" "}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                padding: "10px",
              }}
            >
              {columnConfig?.map((column, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "4px",
                    whiteSpace: "nowrap",
                    border: "1px solid lightgrey",
                    borderRadius: "3px",
                    // flex: "1 1 auto",
                    minWidth: "130px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <i className="nav-icon mr-2" />
                    {column.header === "Action" || column.header === "S.No"
                      ? t("ToggleAll")
                      : t(column.header)}
                  </div>
                  <label
                    className="switch"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={column.visible}
                      onChange={() => toggleColumnVisibility(column, index)}
                    />
                    <span className="slider round2"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="row mb-2 ml-1">
          <div
            className="col-sm-1"
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <button
              className="btn btn-success rounded btn-sm btn-block"
              onClick={handleClick}
            >
              {t("Save")}
            </button>
          </div>
            <Button
              className="btn rounded"
              onClick={() => setShowOrderModal(true)}
            >
              Set Order
            </Button>
        </div>
      </Accordion>
      <SetColumnOrderModal
        show={showOrderModal}
        onHide={() => setShowOrderModal(false)}
        controllers={columnConfig}
        onSave={handleOrderSave}
      />
    </>
  );
};

export default FilterTableMaster;
