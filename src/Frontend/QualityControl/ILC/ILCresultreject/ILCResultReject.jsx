import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ILCFrameMenu from "../ILCFrameMenu";
import { ViewMenu } from "../../../../components/SvgIcons";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { Button } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import { CustomButton } from "../../../../components/UI/CustomButton";
import Accordion from "../../../../components/UI/Accordion";

const ILCResultReject = () => {
  const { t } = useTranslation();
  const [showMore, setShowMore] = React.useState(false);
  const [centreData, setCentreData] = useState([]);
  const initialState = {
    LabName: "",
    LabAddress: "",
    ContactNo: "",
    ContactPersonName: "",
    MOURenewDate: "",
    isActive: "",
    Centre: "",
  };
  const [payload, setPayload] = React.useState(initialState);
  const [centreId, setCentreId] = useState([]);
  const [tableData, setTableData] = useState([
    {
      Hash: <input type="checkbox" className="form-check-input" />,
      ProcessingLab: "Lab A",
      ILCLab: "ILC-01",
      VisitID: "VST12345",
      SinNo: "SIN001",
      TestName: "HAEMATOCRIT (HCT)",
      ParameterName: <input type="text" className="form-control" />,
    },
    {
      Hash: <input type="checkbox" className="form-check-input" />,
      ProcessingLab: "Lab B",
      ILCLab: "ILC-02",
      VisitID: "VST12346",
      SinNo: "SIN002",
      TestName: "HEMOGLOBIN",
      ParameterName: <input type="text" className="form-control" />,
    },
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };
  const handleSelectChange = (name, value) => {
    console.log(name, value);
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleReactSelect = (name, e) => {
    console.log("gggggg", name, e);
    setPayload((prev) => ({ ...prev, [name]: e.value }));
  };
  const fetchAllCenter = () => {
    axiosInstance
      .get("CommonController/GetAccessProcessingLab")
      .then((res) => {
        if (res?.data?.success && Array.isArray(res?.data?.message)) {
                setCentreData(
                    res?.data?.message?.map((c) => ({
                        value: c.centreid,
                        label: c.centre,
                    }))
                );
            }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const getMonthList = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return monthNames.map((name, index) => ({
      label: name,
      value: String(index + 1).padStart(2, "0"),
    }));
  };
  const getYearList = () => {
    let yearArr = [];
    for (let i = 2024; i <= 2026; i++) {
      let obj = { label: String(i), value: String(i) };
      yearArr.push(obj);
    }
    return yearArr;
  };

  useEffect(() => {
    fetchAllCenter();
  }, []);
  const columns = [
    { header: "Sr. No.", field: "srNo", width: "5%" },
    { header: "#", field: "hash", width: "5%" },
    { header: "Processing Lab", field: "processingLab" },
    { header: "ILC Lab", field: "ilcLab" },
    { header: "Visit ID", field: "visitId" },
    { header: "Sin No", field: "sinNo" },
    { header: "Test Name", field: "testName" },
    { header: "Parameter Name", field: "parameterName" },
  ];

  const formattedData = tableData.map((item, index) => ({
    ...item,
    srNo: index + 1,
    hash: item?.Hash || "",
    processingLab: item?.ProcessingLab,
    ilcLab: item?.ILCLab,
    visitId: item?.VisitID,
    sinNo: item?.SinNo,
    testName: item?.TestName,
    parameterName: item?.ParameterName,
  }));

  return (
    <>
      {showMore && <ILCFrameMenu />}
      <div className="card">
        <Heading
          name={"ILC Lab Master"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <div className="row p-2">
          <ReactSelect
            name="Centre"
            id="Centre"
            removeIsClearable={true}
            dynamicOptions={centreData}
            placeholderName="Centre"
            value={payload?.Centre}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            isShowBorder={true}
          />
          <ReactSelect
            placeholderName={t("Month")}
            id="month"
            name="month"
            removeIsClearable={true}
            value={payload?.month}
            onChange={handleSelectChange}
            searchable={true}
            respclass={"col-xl-1 col-sm-4 col-md-6 col-12"}
            dynamicOptions={getMonthList()}
          />
          <ReactSelect
            placeholderName={t("Year")}
            id="year"
            name="year"
            removeIsClearable={true}
            value={payload?.year}
            onChange={handleReactSelect}
            searchable={true}
            respclass={"col-xl-1 col-sm-4 col-md-6 corl-12"}
            dynamicOptions={getYearList()}
          />
          {/* <div className="col-sm-2">
            <Button className="rounded py-0">{t("Search")}</Button>
          </div> */}
          <CustomButton text="Search" icon="search"/>
        </div>
      </div>
      <div className="card mt-2">
        <Accordion title={"Search Data"} defaultValue={"true"}
                seconTitle={<div>
                  <input
                  type="text"
                  placeholder="Search Data"
                  onClick={(e)=> e.stopPropagation()} 
                  />
                </div>}
                >
        <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={columns}
              data={formattedData}
              //   onEdit={handleEdit}
            />
          </div>
        </div>
        </Accordion>
      </div>
    </>
  );
};

export default ILCResultReject;
