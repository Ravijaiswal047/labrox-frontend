import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import './Driver.css';
import { CustomButton } from "../../../components/UI/CustomButton";
import { FaEdit, FaPlus } from "react-icons/fa";
import Tables from "../../../components/UI/customTable";

const Driver = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const drivers = [
    { id: 1, name: "John Doe", contact: "123-456-7890" },
    { id: 2, name: "Jane Smith", contact: "987-654-3210" },
    { id: 3, name: "Michael Johnson", contact: "555-123-9876" },
    { id: 4, name: "Emily Davis", contact: "444-555-6666" },
    { id: 5, name: "William Brown", contact: "222-333-4444" },
    { id: 6, name: "Olivia Wilson", contact: "111-222-3333" },
    { id: 7, name: "James Taylor", contact: "999-888-7777" },
    { id: 8, name: "Sophia Anderson", contact: "666-555-4444" }
  ];

  return (
    <>
      <Accordion
        name={t("Manage Driver")}
        defaultValue={true}
        isBreadcrumb={true}
      ></Accordion>
      <div className="">
        {/* <h2 className="dashboard-heading">Drivers</h2> */}
        <div className="row dashboard-row main-container">
          <div className="col-12 dashboard-col">
            {/* Left column content */}
            <div className=" p-1 d-flex justify-content-between">
              <div>
                {/* <h4 className="dashboard-sub-heading">Manage Drivers</h4>
                            <p style={{color: "#585757"}}>View, Add & Edit Driver Information.</p>   */}
              </div>
              <div className="mb-1">
                <CustomButton icon="add" text="Add Driver" />
              </div>

            </div>
            <Accordion
              title={t("Driver Records")}
              defaultValue={true}
            // isBreadcrumb={true}
            ></Accordion>
            <div className="p-1">
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("Driver Name")}</th>
                    <th>{t("Contact")}</th>
                    <th>{t("Action")}</th>

                  </tr>
                </thead>

                <tbody>
                  {drivers?.map((item, i) => {
                    // const rowColor = item.isActive === 1 ? '#90EE90' : '#ffe58f';

                    return (
                      <tr
                        key={i} // Ensure each row has a unique key
                      // className={item.isActive === 1 ? 'active' : 'deactive'}
                      // style={{ backgroundColor: rowColor, backgroundImage: 'none' }} 
                      >
                        <td data-title={t("Driver Name")}>
                          {item.name ?? "John Doe"}
                        </td>

                        {/* 👉 New: Contact */}
                        <td data-title={t("Contact")}>
                          {item.contact ?? "9876543210"}
                        </td>

                        {/* 👉 New: Action */}
                        <td data-title={t("Action")}>

                          <FaEdit />

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tables>
            </div>


          </div>
        </div>
      </div>

    </>
  );
};

export default Driver;
