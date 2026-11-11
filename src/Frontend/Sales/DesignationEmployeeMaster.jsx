import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import ViewDesignationModal from "../utils/ViewDesignationModal";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import AddDesignationModal from "../utils/AddDesignationModal";
import { getDesignationSalesData } from "../../utils/NetworkApi/commonApi";
import { FaPlus } from "react-icons/fa";

const DesignationEmployeeMaster = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState({
    DesignationID: "",
  });
  const [showAddModal, setShowAddModal] = useState({
    modal: false,
    id: "",
    name: "",
    empCount: 0,
    sequence: "",
  });
  const [show, setShow] = useState({
    modal: false,
    id: "",
    name: "",
  });
  const { t } = useTranslation();

  const handleCloseModal = () => {
    setShow({
      modal: false,
      id: "",
      name: "",
    });
    getDesignationSalesData(setData, setLoading);
  };
  const handleCloseAddModal = () => {
    setShowAddModal({
      modal: false,
      id: "",
      name: "",
      empCount: 0,
      sequence: "",
    });
    getDesignationSalesData(setData, setLoading);
  };

  useEffect(() => {
    getDesignationSalesData(setData, setLoading);
  }, []);

  console.log("designation data", data);
  return (
    <>
      {show?.modal && (
        <ViewDesignationModal
          show={show?.modal}
          onHandleClose={handleCloseModal}
          title={show?.name}
          id={show?.id}
        />
      )}
      {showAddModal && (
        <AddDesignationModal
          show={showAddModal?.modal}
          onHandleClose={handleCloseAddModal}
          title={showAddModal?.name}
          id={showAddModal?.id}
          empCount={showAddModal?.empCount}
          sequence={showAddModal?.sequence}
        />
      )}
      <Accordion
        name={t("Designation Employee Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <Accordion defaultValue={true} title={t("Designation Details")} />
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            {/* {loading ? (
                            <Loading />
                        ) : (
                            <> */}
            {loading ? (
              <Loading />
            ) : (
              <Tables>
                <thead className="cf">
                  <tr>
                    <th
                      style={{
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                      }}
                    >
                      {t("Sr. No")}
                    </th>
                    <th>{t("Designation")}</th>
                    <th>{t("No. of Employee")}</th>
                    <th>{t("Priority")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("View")}</th>
                    <th>{t("Add")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={item?.DesignationID || index}>
                        <td data-title={t("Sr. No")} style={{ width: "40px" }}>
                          {index + 1}
                        </td>

                        <td data-title={t("Designation")}>
                          {item?.DesignationName}
                        </td>

                        <td data-title={t("No. of Employee")}>
                          {item?.EmpCount}
                        </td>

                        <td data-title={t("Priority")}>
                          {item?.Priority || ""}
                        </td>

                        <td data-title={t("Status")}>
                          {item?.IsActive ? (
                            <span
                              className="badge bg-success"
                              style={{
                                backgroundColor: "#d4edda",
                                color: "#155724",
                                fontWeight: "400",
                              }}
                            >
                              {t("Active")}
                            </span>
                          ) : (
                            <span className="badge bg-danger" style={{ fontWeight: "400" }}>
                              {t("Inactive")}
                            </span>
                          )}
                        </td>

                        <td data-title={t("View")}>
                          <a
                            title="Designation"
                            className="fa fa-search coloricon"
                            style={{ color: "black", cursor: "pointer" }}
                            onClick={() =>
                              setShow({
                                modal: true,
                                id: item?.DesignationID,
                                name: item?.DesignationName,
                              })
                            }
                          />
                        </td>

                        <td data-title={t("Add")}>
                          <div
                            title="Add Employee"
                            onClick={() =>
                              setShowAddModal({
                                modal: true,
                                id: item?.DesignationID,
                                name: item?.DesignationName,
                                empCount: item?.EmpCount,
                                sequence: item?.Priority,
                              })
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <span
                              style={{
                                backgroundColor: "green",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                              }}
                            >
                              <FaPlus color="white" size={8} />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        {t("No Data Found")}
                      </td>
                    </tr>
                  )}

                </tbody>
              </Tables>
            )}
            {/* </>
                        )} */}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DesignationEmployeeMaster;
