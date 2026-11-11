import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RiDeleteBin7Fill } from "react-icons/ri";
import { SaveButton } from "../../components/UI/CustomButton";

const CenterAccess = () => {
  const [center, setCenter] = useState([]);
  const [allCenter, setAllCenter] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState({
    Data: [],
    CentreID: "",
    EmployeeID: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [centerTable, setCenterTable] = useState([]);
  const [Employee, setEmployee] = useState([]);

  const { t } = useTranslation();

  const fetchCenter = () => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
            DefaultCentreId: ele.DefaultCentreId,
          };
        });
        console.log(data);
        setCenter(value);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  const handleReactSelectChange = (name, option) => {
    setSelectedCenter({
      ...selectedCenter,
      [name]: String(option?.value ?? ""),
    });
    if (name === "CentreID") {
      getData(String(option?.value ?? ""));
    }
  };

  const fetchAllCenter = () => {
    axiosInstance
      .get("Employee/GetAllCentres")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.CentreID,
            label: ele?.Centre,
          };
        });
        setAllCenter(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchCenter(center);
    fetchAllCenter();
  }, []);

  const filteredTable = centerTable.filter((ele) =>
    `${ele.Centre} ${ele.dataCentreAccessName} ${ele.Name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleChanges = (select, name) => {
    const mappedData = select.map((ele) => ele?.value);
    console.log(mappedData);
    setSelectedCenter({ ...selectedCenter, [name]: mappedData });
  };

  console.log("selectedCenter::", selectedCenter);

  const handleSave = () => {
    if (
      selectedCenter?.CentreID === "" &&
      selectedCenter?.Data.length === 0 &&
      selectedCenter?.EmployeeID === ""
    ) {
      toast.error("All feilds are required to save");
    } else if (selectedCenter?.CentreID === "") {
      toast.error("Please select a center");
    } else if (selectedCenter?.Data.length === 0) {
      toast.error("Please select an access center");
    } else if (selectedCenter?.EmployeeID === "") {
      toast.error("Please select an Employee");
    } else {
      axiosInstance
        .post("CentreAccess/saveCentreAccess", selectedCenter)
        .then((res) => {
          // window.location.reload();
          getData(selectedCenter.CentreID);
          toast.success("Saved Successfully");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong");
        });
    }
  };

  const handleRemove = (id) => {
    const payLoad = {
      CentreID: selectedCenter.CentreID,
      Data: [
        {
          dataCentreAccess: id?.dataCentreAccess,
          isActive: "0",
          EmployeeID: id?.EmployeeID,
        },
      ],
    };
    axiosInstance
      .post("CentreAccess/DeleteCentreAccess", payLoad)
      .then((res) => {
        // window.location.reload();
        getData(selectedCenter.CentreID);
        toast.success("Deleted successfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const handleRemoveAll = () => {
    const mappedData = centerTable.map((ele) => {
      return {
        dataCentreAccess: ele.dataCentreAccess,
        isActive: "0",
        EmployeeID: ele?.EmployeeID,
      };
    });
    const payLoad = {
      CentreID: selectedCenter.CentreID,
      Data: mappedData,
    };
    console.log(payLoad);
    axiosInstance
      .post("CentreAccess/DeleteCentreAccess", payLoad)
      .then((res) => {
        window.location.reload();
        toast.success("All Centre Deleted successfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const getData = (id) => {
    axiosInstance
      .post("CentreAccess/GetAccessData", {
        CentreID: id,
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          setCenterTable(data);
        } else {
          setCenterTable([]);
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;
    setSelectedCenter({ ...selectedCenter, [name]: value });
    // getData(value);
  };
  const BindEmployeeReports = (setEmployee) => {
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
  useEffect(() => {
    BindEmployeeReports(setEmployee);
  }, []);
  return (
    <>
      <Accordion
        name={t("Centre Access")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              placeholderName="Select Centre"
              searchable={true}
              removeIsClearable={true}
              id="Centre"
              name="CentreID"
              onChange={handleReactSelectChange}
              value={selectedCenter?.CentreID}
              className="required-fields"
              dynamicOptions={[
                { label: "Select Centre", value: "" },
                ...center,
              ]}
            />
          </div>
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              className="required-fields"
              name="Data"
              placeholder=" "
              lable="Center"
              id="Center Access"
              options={allCenter}
              onChange={handleChanges}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              lable="Employee"
              id="Employee"
              name="EmployeeID"
              onChange={handleSelectChange}
              selectedValue={selectedCenter?.EmployeeID}
              options={[{ label: "Select Employee", value: "" }, ...Employee]}
            />
          </div>
          <div className="col-sm-1 col-xs-12">
            <SaveButton
              text={"Save"}
              onClick={handleSave}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {centerTable && centerTable.length > 0 ? (
          <div className="row p-2">
            <div className="col-12">
              <div className=" mb-1 d-flex justify-content-end">
                <input
                  type="text"
                  style={{ width: "300px" }}
                  className="form-control"
                  placeholder="Search by Center, Access Center, or EmployeeName"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Tables>
                <thead>
                  {/* Remove the empty tr as it creates unnecessary space */}
                  <tr>
                    <th className="text-center">{t("S.No")}</th>
                    <th className="text-center">{t("Center")}</th>
                    <th className="text-center">{t("Access Center")}</th>
                    <th className="text-center">{t("Employee Name")}</th>
                    <th className="text-center">{t("CreatedBy/date")}</th>
                    <th className="text-center">{t("UpdatedBy/date")}</th>

                    <th className="text-center">
                      <label className="mr-2">Remove All</label>
                      <button
                        className="btn btn-info btn-sm w-5"
                        onClick={handleRemoveAll}
                      >
                        <RiDeleteBin7Fill />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTable.length > 0 ? (
                    filteredTable.map((ele, index) => (
                      <tr key={index}>
                        <td data-title="S.No." className="text-center">
                          {index + 1}
                        </td>
                        <td data-title="Center" className="text-center">
                          {ele.Centre}
                        </td>
                        <td data-title="Access Center" className="text-center">
                          {ele.dataCentreAccessName}
                        </td>
                        <td data-title="Employee Name" className="text-center">
                          {ele.Name}
                        </td>
                        <td data-title={t("CreateBy/Date")}>
                          {ele?.CreatedByName && ele?.dtEntry
                            ? `${ele?.CreatedByName}/${ele?.dtEntry}`
                            : "--"}
                          &nbsp;
                        </td>
                        <td data-title={t("Updated/Date")}>
                          {ele?.UpdatedByName && ele?.dtUpdate
                            ? `${ele.UpdatedByName} / ${ele.dtUpdate}`
                            : "--"}
                        </td>
                        <td data-title="Remove" className="text-center">
                          <button
                            className="btn btn-danger btn-sm w-4"
                            onClick={() => handleRemove(ele)}
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No matching records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Tables>
            </div>
          </div>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default CenterAccess;
