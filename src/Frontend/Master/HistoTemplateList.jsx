import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import InvestigationCommentMasterModal from "../utils/InvestigationCommentMasterModal";
import parse from "html-react-parser";
import { CustomButton } from "../../components/UI/CustomButton";
const HistoTemplateList = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    data: "",
    modalShow: false,
  });
  const { t } = useTranslation();
  const getHistoData = () => {
    setLoading(true);
    axiosInstance
      .post("HistoTemplateMaster/GetHistoTemplate", {IsActive: 0})
      .then((res) => {
        let data = res?.data?.message;
        setLoading(false);
        setTableData(data);
      })
      .catch((err) => {
        setLoading(false);
        setTableData([]);
      });
  };
  const handleShow = () => {
    setShow({
      modalShow: false,
      data: "",
    });
  };

  useEffect(() => {
    getHistoData();
  }, []);

  return (
    <>
      {show?.modalShow && (
        <InvestigationCommentMasterModal show={show} handleShow={handleShow} />
      )}
      <Accordion
        name={t("Histo Template List")}
        isBreadcrumb={true}
        defaultValue={true}
        linkTo="/HistoTemplate"
        linkTitle={t("Create New")}
        state={{
          url: "HistoTemplateMaster/SaveHistoTemplate",
        }}
      >
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            {loading ? (
              <Loading />
            ) : (
              <Tables>
                <thead className="text-center cf" style={{ zIndex: 99 }}>
                  <tr>
                    <th>{t("ID")}</th>
                    <th>{t("Template Name")}</th>
                    <th>{t("Template Type")}</th>
                    <th>{t("Template Text")}</th>
                    <th>{t("Active")}</th>
                    <th>{t("Edit")}</th>
                  </tr>
                </thead>
                {tableData?.map((ele, index) => (
                  <tr key={index}>
                    <td data-title={"ID"}>{index + 1}</td>
                    <td data-title={t("Template Name")}>
                      {ele?.Template_Name}
                    </td>
                    <td data-title={t("Template Name")}>{ele?.fieldtype}</td>

                    <td data-title={t("Template Text")}>
                      {/* <Link
                        // className="btn btn-sm btn-primary w-5"
                        onClick={() => {
                          setShow({
                            modalShow: true,
                            data: parse(ele[ele?.fieldtype]),
                          });
                        }}
                      >
                        View
                      </Link> */}
                      <CustomButton
                        // text={t("View")}
                        icon={"eye"}
                        onClick={() => {
                          setShow({
                            modalShow: true,
                            data: parse(ele[ele?.fieldtype]),
                          });
                        }}
                      />
                    </td>
                    <td data-title={"Active"}>
                      {ele?.IsActive === 1 ? t("Active") : t("In Active")}
                    </td>
                    <td data-title={"Edit"}>
                      <Link
                        className="text-primary"
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        state={{
                          data: ele,
                          url: "HistoTemplateMaster/UpdateHistoTemplate",
                        }}
                        to="/HistoTemplate"
                      >
                        <CustomButton
                        icon={"edit"}
                      />
                      </Link>
                    </td>
                  </tr>
                ))}
              </Tables>
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default HistoTemplateList;
