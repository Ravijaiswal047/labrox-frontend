import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { CustomButton, EditButton, SaveButton } from "../../components/UI/CustomButton";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { formulaList } from "../../utils/Constants";
import { Form } from "react-bootstrap";
import { FaEdit, FaSearch } from "react-icons/fa";
import MachineModal from "../utils/MachineModal";
import Heading from "../../components/UI/Heading";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../components/Filter/FilterInput";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

const MachineGroup = () => {
  const [tableData, setTableData] = useState([]);
  const [masterTable, setMasterTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [machineData, setMachineData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [state, setState] = useState({
    MachineName: "",
    Formula: "",
    isActive: 1,
  });

  const colorCodingData = [
    { color: "#ffe58f", id: "7", labelKey: "Deactive" },
    { color: "#75f975", id: "8", labelKey: "Active" },
    // { color: "#d9d9d9", id: "all", labelKey: "All" },
  ];

  const handleSelectChange = (name, option) => {
    if (!option) return;    
      setState((prev) => ({
        ...prev,
        [name]: option?.value,       
      }));
    }

  const { t, i18n } = useTranslation();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // setState({ ...state, [name]: value });
    setState((prev) => ({...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const fetch = () => {
    setLoading(true);
    axiosInstance
      .get("MachineGroup/BindMachineGroup")
      .then((res) => {
        setTableData(res?.data?.message);
        setMasterTable(res?.data?.message);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went Wrong",
        );
        setLoading(false);
      });
  };

  const BindData = (data) => {
    console.log("edit data", data);
    setState({
      ID: data?.ID,
      MachineName: data?.Name,
      Formula: data?.IQC_SD_Formula,
      isActive: data?.IsActive,
    });
  };

  const handleChangeSearch = (e) => {
    const value = e?.target?.value?.toLowerCase();
    setSearchTerm(e?.target?.value);

    if (!value) {
      setTableData(masterTable);
      return;
    }

    const searchableKeys = [
      "Name",
      "CreatedByName",
      "UpdatedByName",
      "dtEntry",
      "dtUpdate",
    ];

    const filtered = masterTable?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableData(filtered);
  };

  const handleSave = (url) => {
    let apiPayload = {};
    if(url === "MachineGroup/InsertMachineGroup"){
      apiPayload = {
        machineName: state?.MachineName || "",
        iqC_SD_Formula: state?.Formula || 0,
      }
    }
    else if(url === "MachineGroup/UpdateMachineGroup"){
      apiPayload = {
        id: state?.ID || 0,
        machineName: state?.MachineName || "",
        isActive: state?.isActive || 0,
        iqC_SD_Formula: state?.Formula || 0
      }
    }
    axiosInstance
      .post(url, apiPayload)
      .then((res) => {
        toast.success(res?.data?.message);
        setState({
          MachineName: "",
        });
        fetch();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went Wrong",
        );
      });
  };
  
  const handleReset = () => {
    setState({
      MachineName: "",
      Formula: "",
      isActive: 1,
    })
  }



  useEffect(() => {
    fetch();
  }, []);

  console.log("state", state);
  console.log("tableData", tableData);
  return (
    <>
      <Accordion
        name={t("Machine Group")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        {modal && (
          <MachineModal
            show={modal}
            onHide={() => setModal(false)}
            machineData={machineData}
          />
        )}
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              placeholder=""
              type="text"
              className="required-fields"
              max={25}
              name="MachineName"
              id="MachineName"
              value={state?.MachineName}
              onChange={handleChange}
              required
              lable={t("Machine Group")}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="Formula"
              id="Formula"
              removeIsClearable={true}
              dynamicOptions={formulaList}
              placeholderName="Formula"
              value={state?.Formula}
              onChange={handleSelectChange}
            />
          </div>
          <Form.Check
            type="switch"
            id="isActive"
            name="isActive"
            label={t("Active")}
            onChange={handleChange}
            checked={state?.isActive}
            className="mr-2"
          />
          {/* <div className="col-sm-1"> */}
            {loading ? (
              <Loading />
            ) : state?.ID ? (
              <EditButton
                text={"Update"}
                onClick={() => handleSave("MachineGroup/UpdateMachineGroup")}
                disabled={state?.MachineName?.length > 3 ? false : true}
                className="mr-2"
              />
            ) : (
              <SaveButton
                text={"Save"}
                onClick={() => handleSave("MachineGroup/InsertMachineGroup")}
                disabled={state?.MachineName?.length > 3 ? false : true}
                className="mr-3"
              />
            )}
          {/* </div> */}
          {/* <div className="col-sm-1"> */}
            <CustomButton text= "reset" onClick={handleReset} className="mr-2" icon="refresh"/>
          {/* </div> */}
        </div>

        
      </Accordion>
      <Heading
        title={t("Search Details")}
        secondTitle={
          <>
            <div className="col-sm-12 d-flex justify-content-end gap-custom p-0">
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  // onClick={() => handleStatusFilter(id)}
                  cursor="pointer"
                />
              ))}
              <FilterInput
                value={searchTerm}
                onChange={handleChangeSearch}
                placeholder="Filter Table"
                inputClass="transparent-background"
              />
            </div>
          </>
        }
      />
      {tableData?.length > 0 ? (
      <Tables>
          <thead className="cf">
            <tr>
              {[t("S.No"), t("Machine Group"), t("Created By"), t("Created Date"), t("Updated By"), t("Updated Date"),t("Machine Info"), t("Action")].map((ele, index) => (
                <th key={index}>{ele}</th>
              ))}
            </tr>
          </thead>
          
              <tbody>
            {tableData?.map((ele, index) => {
            const rowColor = ele?.IsActive === 1 ? '#75f975' : '#ffe58f';
            return (
              <tr key={index}
              style={{ backgroundColor: rowColor, backgroundImage: 'none', color: 'black' }}
              >
                <td data-title={t("S.No")} style={{width: "60px"}}>{index + 1}&nbsp;</td>
                <td data-title={t("Machine Group")}>{ele?.Name}&nbsp;</td>
                <td data-title={t("Created By")}>
                  {ele?.CreatedByName || "-"}&nbsp;
                </td>

                <td data-title={t("Created Date")}>
                  {ele?.dtEntry || "-"}&nbsp;
                </td>

                <td data-title={t("Updated By")}>
                  {ele?.UpdatedByName || "-"}&nbsp;
                </td>

                <td data-title={t("Updated Date")}>
                  {ele?.dtUpdate || "-"}&nbsp;
                </td>
                <td data-title={t("Machine Info")}>
                  <FaSearch color="#17a2b8" 
                  onClick={() => {
                                    setModal(true);
                                    setMachineData(ele);
                                  }}
                  />
                </td>
                <td
                  data-title={t("Action")}
                  className="text-info"
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    window.scroll(0, 0);
                    BindData(ele);
                  }}
                >
                  {/* {t("Select")} */}
                  <FaEdit />
                </td>
              </tr>
            )
          }
          )}
          </tbody>
          
          
        </Tables>
        ) : (
            <NoRecordFound/>
          )}
    </>
  );
};

export default MachineGroup;
