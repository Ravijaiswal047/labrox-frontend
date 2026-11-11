import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { ImmunoHistoMasterSchema, MicroBioMasterSchema } from "../../utils/Schema";
import { dateConfig, ExportToExcel, getTrimmedData, number } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import { ImmunoHistoType } from "../../utils/Constants";
import excelIcon from "../../assets/image/excel.png"
import ImmunoHelpMenu from "./ImmunoHelpMenu";
import FilterInput from "../../components/Filter/FilterInput";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";
import TableFilterDot from "../Components/TableFilterDot";

const ImmunoHistoMaster = () => {
  const [filterInputValue, setFilterInputValue] = useState("");
  const [TableData, setTableData] = useState([]);
  const [filterTableData, setFilterTableData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    search: false,
  });
  const [payload, setPayload] = useState({
    Name: "",
    TypeID: "1",
    TypeName: "Marker",
    IsActive: 1,
    ID: 0,
    Markercode:"",
  });
  const [err, setErr] = useState({});
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    });
  };

  const handleFilterInputChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFilterInputValue(value);

        // Filter rows based on search term matching any field
        const filtered = TableData.filter((row) =>
            Object.keys(row).some((key) =>
                String(row[key]).toLowerCase().includes(value)
            )
        );
        setFilterTableData(filtered);
    };

  const handleTestSearch = (id) => {
    setLoading({
      ...loading,
      search: true,
    });
    axiosInstance
      .post("IHC/GetIHCMarker", {
        TypeName: id,
        ID: 0,
      })
      .then((res) => {
        setLoading({
          ...loading,
          search: false,
        });
        setTableData(res?.data?.message);
        setFilterTableData(res?.data?.message);
        setErr({});
      })
      .catch((err) => {
        setLoading({
          ...loading,
          search: false,
        });
        setTableData([]);
        setFilterTableData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong."
        );
      });
  };

  const handleSelect = (event) => {
    const { name, value, selectedIndex } = event?.target;
    const label = event?.target?.children[selectedIndex].text;
    setPayload({ ...payload, [name]: value, TypeName: label });
    handleTestSearch(label);
  };

  const handleEdit = (data) => {
    setPayload({
      Name: data?.Name,
      TypeID: data?.TypeID,
      TypeName: data?.TypeName,
      IsActive: data?.IsActive,
      ID: data?.ID,
      Markercode: data?.Markercode
    });
    setIsEdit(true);
    window.scrollTo(0, 0);
  };

  const handleSave = () => {
    const generatedError = ImmunoHistoMasterSchema(payload);

    if (generatedError === "") {
      setLoading({
        ...loading,
        save: true,
      });
      axiosInstance
        .post("/IHC/SaveIHCMarker", getTrimmedData(payload))
        .then((res) => {
          toast.success(res?.data?.message);
          setLoading({
            ...loading,
            save: false,
          });
          setErr({});
          setIsEdit(false);
          setPayload({
            Name: "",
            TypeID: "1",
            IsActive: 1,
            TypeName: "Marker",
            ID: 0,
            Markercode:"",
          });
          handleTestSearch("Marker");
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured"
          );
          setLoading({
            ...loading,
            save: false,
          });
        });
    } else setErr(generatedError);
  };
  useEffect(() => {
    handleTestSearch("Marker");
  }, []);

  const statusCount = (statuType)=>{
    if(statuType!="all"){
      return TableData?.filter((item=> item?.IsActive == statuType))?.length
    }
    else return TableData?.length;
  }

  const filterOnClick = (type) => {
    if(type==='all'){
      setFilterTableData(TableData)
      return
    }
    setFilterTableData(
      TableData?.filter((data) => {
        // Normalize status to lowercase for comparison
        return String(data?.IsActive)?.toLowerCase() === type.toLowerCase();
      })
    );
  };

  return (
    <>
      <Accordion
        name={t("ImmunoHisto Chemistry Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              options={ImmunoHistoType}
              name="TypeID"
              lable="Immuno Histo Type"
              id="ImmunoHistoType"
              onChange={handleSelect}
              isDisabled={isEdit}
              selectedValue={payload?.TypeID}
            />
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              id="Name"
              lable="Name"
              placeholder=" "
              type="text"
              name="Name"
              value={payload?.Name}
              onChange={handleChange}
            />
            {payload?.Name?.trim() === "" && (
              <span className="error-message">{err?.Name}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              id="Markercode"
              lable="Markercode"
              placeholder=" "
              type="text"
              name="Markercode"
              value={payload?.Markercode}
              onChange={handleChange}
            />
            {payload?.Markercode?.trim() === "" && (
              <span className="error-message">{err?.Markercode}</span>
            )}
          </div>
          <div className="col-sm-1 mt-1 ml-2 d-flex">
            <div className="mt-1">
              {/* <input
                type="checkbox"
                name="IsActive"
                checked={payload?.IsActive == "1" ? true : false}
                onChange={(e) => handleChange(e)}
              /> */}
              <label
                className="switch ml-1"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={payload?.IsActive == 1 ? true : false}
                  name="IsActive"
                  onChange={(e) => handleChange(e)}
                />
                <span className="slider round2"></span>
              </label>
            </div>
            <label className="ml-2" htmlFor="IsActive">
              {t("Active")}
            </label>
          </div>
          <div className="mb-1 ml-2">
            <SaveButton
              text={payload?.ID !== 0 ? t("Update") : t("Save")}
              id="btnSave"
              onClick={handleSave}
            />
          </div>
          <div className="ml-3 mb-1">
            <CancelButton
              text={t("Reset")}
              id="btnSave"
              onClick={() => {
                setIsEdit(false);
                setErr({});
                setPayload({
                  Name: "",
                  TypeID: "1",
                  IsActive: 1,
                  TypeName: "Marker",
                  ID: 0,
                  Markercode: "",
                });
              }}
            />
          </div>
        </div>
      </Accordion>
      <Accordion
        name={t("Search Data")}
        defaultValue={true}
        isBreadcrumb={true}
        notOpen={true}
        linkTo="/ImmunoHistoChemistryMaster"
        linkTitle={
          <div
            className="link-title-container mt-2 d-none mb-2 d-md-flex"
            id="pr_id_11"
          >
            <TableFilterDot
              onClick={() => filterOnClick("1")}
              color={"#eff5e7ff"}
              title={`Active (${statusCount("1")})`}
            />
            <TableFilterDot
              onClick={() => filterOnClick("0")}
              color={"#f89f84ff"}
              title={`InActive (${statusCount("0")})`}
            />
            <TableFilterDot
              onClick={() => filterOnClick("all")}
              title={`Show All (${statusCount("all")})`}
              // bgColor={"#ebebebbf"}
            />
            <FilterInput
              value={filterInputValue}
              onChange={handleFilterInputChange}
              placeholder="Filter Table"
            />
            <img
              src={excelIcon}
              alt="Filter Icon"
              title="ExcelDownload"
              className="mx-3 mt-1"
              style={{ width: "20px", height: "20px" }}
              onClick={() => ExportToExcel(TableData)}
            />
          </div>
        }
      >
        {loading?.search ? (
          <Loading />
        ) : (
          TableData?.length > 0 && (
            <Tables
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <thead>
                <tr>
                  {[
                    t("S.No"),
                    t("ImmunoType"),
                    t("Code"),
                    t("Name"),
                    t("Created By"),
                    t("Created Date"),
                    t("Last Updated By"),
                    t("Last Updated Date"),
                    t("Edit"),
                    t("Tagging"),
                  ].map((ele, index) => (
                    <th key={index}>{ele}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading?.search ? (
                  <Loading />
                ) : (
                  filterTableData?.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        item?.IsActive ? "row-active-imp" : "row-inactive-imp"
                      }
                    >
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td data-title={t("Type")}>{item?.TypeName}&nbsp;</td>
                      <td data-title={t("Code")}>{item?.Markercode}&nbsp;</td>
                      <td data-title={t("Name")}>{item?.Name}&nbsp;</td>
                      <td data-title={t("Created By")}>
                        {item?.CreatedByName}&nbsp;
                      </td>
                      <td data-title={t("Created Date")}>
                        {dateConfig(item?.dtEntry)}&nbsp;
                      </td>
                      <td data-title={t("Last Updated By")}>
                        {item?.UpdatedByName}&nbsp;
                      </td>
                      <td data-title={t("Last Updated Date")}>
                        {dateConfig(item?.dtUpdate)}&nbsp;
                      </td>
                      <td data-title={t("Edit")}>
                        <div
                          className="text-primary"
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => handleEdit(item)}
                        >
                          <i
                            className="fa fa-edit"
                            style={{ color: "#605ca8", cursor: "pointer" }}
                          ></i>
                        </div>
                      </td>
                      <td data-title={t("Tagging")}>
                        {item?.TypeID == "1" && (
                          <Link
                            to={`/ImmunoHistoChemistryMasterMapping`}
                            state={{
                              item: item,
                            }}
                          >
                            <i
                              className="fa fa-tag"
                              style={{ color: "#605ca8", cursor: "pointer" }}
                            ></i>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Tables>
          )
        )}
      </Accordion>
      <ImmunoHelpMenu />
    </>
  );
};

export default ImmunoHistoMaster;
