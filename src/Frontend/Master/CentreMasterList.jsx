import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { getCollectionBoy, getCentreDetails } from "../../utils/NetworkApi/commonApi";
import { CustomButton } from "../../components/UI/CustomButton";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { ExportToExcel } from "../../utils/helpers";
import { apiUrls } from "../../utils/apiUrls";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const CentreMasterList = () => {
  const localData = useLocalStorage("userData", "get");
  const CompanyID = localData?.CompanyID;
  const { t } = useTranslation();
  const { name } = useParams();
  const [salesManager, setSalesManager] = useState([]);
  console.log(useParams());
  const [loading, setLoading] = useState(false);
  const [excel1Loading, setExcel1Loading] = useState(false);
  const [excel2Loading, setExcel2Loading] = useState(false);
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [centreList, setCentreList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [CentreType, setCentreType] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [payload, setPayload] = useState({
    CentreType: "",
    fieldBoyID: 0,
    proID: 0,
    CentreID:"",
    BussinessUnitId: "",
    // StateID: CompanyID == 1002 ? "19" : "",
    CityID: "",
    CentreName: "",
    CentreCode: "",
    DataType: name === "Rate" ? "RateType" : "Centre",
  });
  const [data, setData] = useState([]);

  const handleSelect = (event) => {
    const { name, value } = event.target;
    setPayload({ ...payload, [name]: value });
  };
    const colorCodingData = [
    { color: "#FFFFFF", id: "1", labelKey: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "In Active" },
  ];

  const getCentreData = () => {
    setLoading(true);
    const finalPayload = {
      ...payload,
      fieldBoyID: payload.fieldBoyID === 0 ? 0 : Number(payload.fieldBoyID),
      proID: payload.proID === 0 ? 0 : Number(payload.proID),
      BussinessUnitId: payload.BussinessUnitId === "" ? 0 : Number(payload.BussinessUnitId),
      // StateID: CompanyID == 1002 ? "19" : (payload.StateID === "" ? 0 : Number(payload.StateID)),
      // stateID: CompanyID == 1002 ? "19" : (payload.StateID === "" ? 0 : Number(payload.StateID)),
      CityID: payload.CityID === "" ? 0 : Number(payload.CityID),
    }
    axiosInstance
      .post("Centre/getCentreData", finalPayload)
      .then((res) => {
        console.log("res",res);
        if (res?.data?.success) {
          setData(res.data.message?.map(item => ({ ...item, isChecked: item?.isActiveStatus === "Active" ? true : false })));
          setLoading(false);
        }else{
          setData([]);
          setLoading(false);
          toast?.success(res?.data?.message);
        }
      })
      .catch(
        (err) => {
          console.log(err)
          setLoading(false);
        }
        );
  };

  const getSalesManager = () => {
      axiosInstance
        .get("Employee/ProEmployee")
        .then((res) => {
          const data = res?.data?.message;
  
          const Type = data?.map((ele) => {
            return {
              value: ele?.EmployeeID,
              label: ele?.EmployeeName,
            };
          });
          setSalesManager(Type);
        })
        .catch((err) => {
          toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
        });
    };
  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        value.unshift({ label: "All", value: "" });
        switch (name) {
          case "CentreType":
            setCentreType(value);
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  const fetchCities = (id) => {
    const stateId = CompanyID == 1002 ? "19" : id;
    if (stateId) {
      axiosInstance
        .post("LocationMaster/bindCity", {
          stateID: stateId,
        })
        .then((res) => {
          const data = res.data.message;
          const value = data.map((ele) => ({
            value: ele.ID,
            label: ele.City,
          }));
          setCityList(value);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };
    const handleReactSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value?.value
    }))
  }

  const filteredData = useMemo(() => {
      if (!searchText) return data;
  
      const search = searchText.toLowerCase();
  
      return data.filter(
        (item) =>
          item?.Centre?.toLowerCase().includes(search) ||
          item?.CentreCode?.toLowerCase().includes(search) ||
          item?.CentreType?.toLowerCase().includes(search)
      );
    }, [data, searchText]);

  const handleCheckboxChange = (item, e) => {
    const { checked } = e.target;
    setData((prevData) =>
      prevData.map((d) =>
        d.CentreID === item.CentreID ? { ...d, isChecked: checked } : d
      )
    );
  };

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    setData((prevData) =>
      prevData.map((item) => ({ ...item, isChecked: checked }))
    );
  };

  const handleSaveChecked = () => {
    const checkedIds = filteredData
      .filter((item) => item.isChecked)
      .map((item) => Number(item.CentreID));
    const uncheckedIds = filteredData
      .filter((item) => !item.isChecked)
      .map((item) => Number(item.CentreID));

    const requests = [];

    if (checkedIds.length > 0) {
      requests.push(
        axiosInstance.post("Centre/UpdateCentreStatus", {
          centreIDs: checkedIds,
          isActive: 1,
          dataType: name === "Rate" ? "RateType" : "Centre",
        })
      );
    }

    if (uncheckedIds.length > 0) {
      requests.push(
        axiosInstance.post("Centre/UpdateCentreStatus", {
          centreIDs: uncheckedIds,
          isActive: 0,
          dataType: name === "Rate" ? "RateType" : "Centre",
        })
      );
    }

    if (requests.length === 0) return;

    setLoading(true);
    Promise.all(requests)
      .then((responses) => {
        toast.success("Status updated successfully");
        getCentreData();
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message
            ? err.response?.data?.message
            : "Something went wrong"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleExportExcel = async (type) => {
    if (type === "Type1") setExcel1Loading(true);
    else setExcel2Loading(true);

    const apiPayload = {
      centreType: "",
      centreName: payload?.CentreName || "",
      centreCode: payload?.CentreCode || "",
      dataType: "RateType",
      centreId: "",
      proID: payload?.proID || 0,
      fieldBoyID: payload?.fieldBoyID || 0,
      isForcelyBookingLock: 0,
      isForcelyReportingLock: 0,
      excelType: type || "",
    }

    axiosInstance
      .post(apiUrls?.GetCleintMasterData, apiPayload)
      .then((res) => {
        const data = res?.data?.message || [];
        if (!data.length) return;

        if(res?.data?.success){
        const formattedData = data?.map((item, index) => {
          const newObj = {
            "Sr. No": index + 1,
          };

          Object.keys(item).forEach((key) => {
            // ✅ Capitalize first letter of key
            const newKey = key.charAt(0).toUpperCase() + key.slice(1);

            newObj[newKey] = item[key];
          });

          return newObj;
        });
        ExportToExcel(formattedData,
         type === "Type2" ? "Client_Master_Excel2.xlsx" : "Client_Master_Excel1.xlsx");
      }
      else{
        toast?.success(res?.data?.message || "No Data Found");
      }

      })
      .catch((err) => {
        console.log("API Error:", err);
      })
      .finally(() => {
        if (type === "Type1") setExcel1Loading(false);
        else setExcel2Loading(false);
      });
  };

  useEffect(() => {
    // getCentreData();
    getDropDownData("CentreType");
     getCollectionBoy(setCollectionBoyList, true);
     getCentreDetails(setCentreList);
     getSalesManager();
     if (CompanyID == 1002) {
       fetchCities("19");
     }
  }, []);
  return (
    <>
      <Accordion
        name={`${t(name)} ${t("Type List")}`}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo={
          name === "center" ? "/CentreMaster/center" : "/CentreMaster/Rate"
        }
        linkTitle={
          <CustomButton
             icon={"back"}
          text={t("Create New")}
          />
        }
        state={{
          url: "Centre/InsertCentre",
        }}
      >
        <div className="row pt-2 pl-2 pr-2">
          {name === "center" && (
            <div className="col-sm-2 col-md-2">
              <SelectBox
                onChange={handleSelect}
                options={CentreType}
                id="Type"
                lable="Type"
                name="CentreType"
                selectedValue={payload?.CentreType}
              />
            </div>
          )}
          {CompanyID == 1002 && name==="Rate" && (
            <>
              <div className="col-sm-2 col-md-2">
                <ReactSelect
                  name="BussinessUnitId"
                  dynamicOptions={[
                    { label: t("Select Business Unit"), value: "" },
                    ...centreList,
                  ]}
                  placeholderName={t("Business Unit")}
                  lable={t("Business Unit")}
                  id="BussinessUnitId"
                  removeIsClearable={true}
                  value={payload?.BussinessUnitId}
                  onChange={handleReactSelectChange}
                />
              </div>
              <div className="col-sm-2 col-md-2">
                <ReactSelect
                  name="CityID"
                  dynamicOptions={[
                    { label: t("Select City"), value: "" },
                    ...cityList,
                  ]}
                  placeholderName={t("City")}
                  lable={t("City")}
                  id="CityID"
                  removeIsClearable={true}
                  value={payload?.CityID}
                  onChange={handleReactSelectChange}
                />
              </div>
            </>
          )}
          <div className="col-sm-2 col-md-2">
            <ReactSelect
              name="fieldBoyID"
              dynamicOptions={[
                { label: t("Select Field Boy"), value: "" },
                ...collectionBoyList,
              ]}
              placeholderName={t("Field Boy")}
              lable={t("Field Boy")}
              id="fieldBoyID"
              removeIsClearable={true}
              value={payload?.fieldBoyID}
              onChange={handleReactSelectChange}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <ReactSelect
               dynamicOptions={salesManager}
            name="proID"
            lable={t("Sales Manager")}
            id="proID"
            removeIsClearable={true}
            placeholderName={t("Select Sales Manager")}
            value={payload.proID}
            onChange={handleReactSelectChange}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              className="select-input-box form-control input-sm"
              placeholder=" "
              lable="Centre Name"
              id="CentreName"
              name="CentreName"
              type="text"
              value={payload?.CentreName}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              name="CentreCode"
              type="text"
              placeholder=" "
              lable="Centre Code"
              id="CentreCode"
              value={payload?.CentreCode}
              onChange={handleChange}
            />
          </div>
          {/* <div className="col-sm-1">
            <button
              type="submit"
              className="btn btn-block btn-info btn-sm"
              onClick={getCentreData}
            >
              {t("Search")}
            </button>
          </div> */}
          <CustomButton
                icon="search"
                text="Search"
                className="mx-2 mb-1"
                onClick={getCentreData}
              />
          {name === "Rate" && (
          <CustomButton
                icon="excel"
                text="Excel-I"
                className="mx-2 mb-1"
                onClick={() => handleExportExcel("Type1")}
                loading={excel1Loading}
              />
          )}
          {name === "Rate" && (
          <CustomButton
                icon="excel"
                text="Excel-II"
                className="mx-2 mb-1"
                onClick={() => handleExportExcel("Type2")}
                loading={excel2Loading}
              />
          )}
          {CompanyID == 1002 && name==="Rate" && (
            <CustomButton
              icon="save"
              text="Save"
              className="mx-2 mb-1"
              onClick={handleSaveChecked}
            />
          )}
        </div>
      </Accordion>
      <Accordion title={t("Search Data")}
       defaultValue={true}
               notOpen={true}
               linkTo="#"
               linkTitle={
       
                 <div className=" d-flex" style={{ gap: "5px" }}>
                   {colorCodingData.map(({ color, labelKey, id }) => (
                     <ColorCodingSearch
                       key={id}
                       color={color}
                       label={t(labelKey)}
                     />
                   ))}
                   <div>
       
                     <Input
                       type="text"
                       placeholder="Search Menu..."
                       value={searchText}
                       onClick={(e) => e.stopPropagation()}
                       onChange={(e) => setSearchText(e.target.value)}
                       className="mt-2"
                     />
       
                   </div>
                 </div>
               }
             >
        {loading ? (
          <Loading />
        ) : data.length > 0 ? (
          <div className="row p-2 ">
            <div className="col-12">
              <Tables>
                <thead className="cf">
                  <tr style={{maxWidth:"10%"}}>
                    <th>{t("S.No")}</th>
                    {name === "Rate" ? null : <th>{t("Centre Type")}</th>}
                    <th style={{maxWidth:"10%"}}>{t("Name")}</th>
                    <th>{t("Code")}</th>
                    <th>{t("Invoice To")}</th>
                    <th>{t("Business Unit")}</th>
                    <th>{t("Processing Lab")}</th>
                    <th>{t("Reference Rate")}</th>
                    <th>{t("Barcode Logic")}</th>
                    <th>{t("Invoicing")}</th>
                    <th>{t("Creation Date")}</th>
                    {CompanyID == 1002 && name==="Rate" && (
                      <th>
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            data.length > 0 &&
                            data.every((item) => item.isChecked)
                          }
                        />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData?.map((data, i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor:
                          data?.isActive === 1
                            ? colorCodingData[0].color
                            : colorCodingData[1].color,
                      }}
                    >
                      <td data-title={t("S.No")}
                      style={{ width: "50px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {i + 1}&nbsp;
                         <Link
                          state={{
                            data: data,
                            other: { button: "Update", pageName: "Edit" },
                            url: "Centre/UpdateCentre",
                            hideCredentials: true,
                          }}
                          to={
                            name === "center"
                              ? "/CentreMaster/center"
                              : "/CentreMaster/Rate"
                          }
                        >
                          <i className="fa fa-edit"></i>
                        </Link>
                        </td>
                      {name === "Rate" ? null : (
                        <td data-title="Centre Type">
                          {data?.CentreType}&nbsp; 
                        </td>
                      )}
                      <td data-title={t("Name")} style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}>{data?.Centre}&nbsp;</td>
                      <td data-title={t("Code")} style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}>{data?.CentreCode}&nbsp;</td>
                      <td data-title={t("Invoice To")}
                      style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {data?.InvoiceToStatus}&nbsp;
                      </td>
                      <td data-title={t("Business Unit")}
                      style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {data?.BusinessUnitStatus}&nbsp;
                      </td>
                      <td data-title={t("Processing Lab")}
                      style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {data?.ProcessingLabStatus}&nbsp;
                      </td>
                      <td data-title={t("Reference Rate")}
                      style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {data?.ReferenceRateStatus}&nbsp;
                      </td>
                      <td data-title={t("Barcode Logic")}
                      style={{ width: "150px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {data?.BarcodeDisplay}&nbsp;
                      </td>
                      <td data-title={t("Invoicing")}
                      style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {data?.InvoiceToStatus}&nbsp;
                      </td>
                      <td data-title={t("Date")}
                      style={{ width: "100px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >{data?.dtEntry}&nbsp;</td>
                      {CompanyID == 1002 && name==="Rate" && (
                        <td>
                          <input
                            type="checkbox"
                            checked={data?.isChecked || false}
                            onChange={(e) => handleCheckboxChange(data, e)}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
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

export default CentreMasterList;