import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";


import { Form } from "react-bootstrap";

import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";

// import './LabWorksheet.css';
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../components/Filter/FilterInput";
import Tables from "../../components/UI/customTable";
import Heading from "../../components/UI/Heading";


const LabWorksheet = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  
  const initialPayload = {
    
  };

  const [payload, setPayload] = useState(initialPayload);

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    
      setPayload((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      }));
    

  };

  const handleReset = () => {
    setPayload(initialPayload);
    setErrors({});
    setIsEditMode(false);
  };

  
  return (
    <>
      <Accordion
        name={t("Lab Worksheet")}
        defaultValue={true}
        isBreadcrumb={true}
      />

      {/* </Accordion> */}
      <Heading
        title={t("Worksheet Records")}
        // secondTitle={
        //   <>
        //     <div className="col-sm-12 d-flex justify-content-end gap-custom p-0">
        //       {colorCodingData?.map(({ color, labelKey, id }) => (
        //         <ColorCodingSearch
        //           key={id}
        //           color={color}
        //           label={t(labelKey)}
        //           onClick={() => handleStatusFilter(id)}
        //           cursor="pointer"
        //         />
        //       ))}
        //       <FilterInput
        //         value={searchTerm}
        //         onChange={handleChangeSearch}
        //         placeholder="Filter Table"
        //         inputClass="transparent-background"
        //       />
        //     </div>
        //   </>
        // }
      />
      <div className="row p-2 ">
        <div className="col-12">
          {/* <Tables>
            <thead className="cf">
              <tr>
                <th>{t("Sr. No")}</th>
                <th>{t("Vehicle No")}</th>
                <th>{t("Type")}</th>
                <th>{t("Vehicle Name")}</th>
                <th>{t("Last Reading")}</th>
                <th>{t("Modal No")}</th>
                <th>{t("RC No")}</th>
                <th>{t("Last Inspection Date")}</th>
                <th>{t("Insurance No")}</th>
                <th>{t("Insurance Expiry Date")}</th>
                <th>{t("Avg/Lt")}</th>
                <th>{t("Model")}</th>
             
                <th>{t("Created By")}</th>
                <th>{t("Created On")}</th>
                <th>{t("Updated By")}</th>
                <th>{t("Updated On")}</th>
                <th>{t("Edit")}</th>
              </tr>
            </thead>

            <tbody>
              {tableData?.length > 0 ? (
                tableData?.map((item, i) => {
                  const rowColor = item?.isActive === 1 ? '#75f975' : '#ffe58f';

                  return (
                    <tr
                      key={i}
                      className={`vehicle-row ${item?.isActive === 1 ? 'active' : 'deactive'}`}

                      style={{ backgroundColor: rowColor, backgroundImage: 'none', color: 'white' }}
                    >
                      <td data-title={t("Sr. No")}>{i + 1}</td>
                      <td data-title={t("Vehicle No")}>{item?.VehicleNo}</td>
                      <td data-title={t("Type")}>{item?.VehicleType}</td>
                      <td data-title={t("Vehicle Name")}>{item?.VehicleName}</td>
                      <td data-title={t("Last Reading")}>{item?.LastReading}</td>
                      <td data-title={t("Modal No")}>{item?.ModalNo}</td>
                      <td data-title={t("RC No")}>{item?.RCNo}</td>
                      <td data-title={t("Last Inspection Date")}>{item?.LastInspectionDate}</td>
                      <td data-title={t("Insurance No")}>{item?.InsuranceNo}</td>
                      <td data-title={t("Insurance Expiry Date")}>{item?.InsuranceExpiryDate}</td>
                      <td data-title={t("Avg/Lt")}>{item?.Average}</td>
                      <td data-title={t("Model")}>{item?.ModalType}</td>
                      <td data-title={t("Created By")}>{item?.CreatedBy}</td>
                      <td data-title={t("Created On")}>{item?.CreatedOn}</td>
                      <td data-title={t("Updated By")}>{item?.UpdatedBy}</td>
                      <td data-title={t("Updated On")}>{item?.UpdatedOn}</td>
                      <td data-title={t("Edit")}>
                        <Link to="#">
                          <FaEdit color="black" onClick={() => handleEdit(item)} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="17" style={{ textAlign: "center", padding: "10px" }}>
                    {t("No Records Found")}
                  </td>
                </tr>
              )}
            </tbody>
          </Tables> */}
        </div>
      </div>
    </>
  );
};

export default LabWorksheet;
