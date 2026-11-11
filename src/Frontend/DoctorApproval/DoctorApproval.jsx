import React, { useState } from "react";

import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Pagination from "../../Pagination/Pagination";
import Accordion from "../../components/UI/Accordion";
import { axiosInstance } from "../../utils/axiosInstance";

const DoctorApproval = () => {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState([]);
    const [currentData, setCurrentData] = useState([]);
    const [payload, setPayload] = useState({
        Centre: "",
        FromDate: new Date(),
        ToDate: new Date(),

    });
    const handleSelectChange = (name, value) => {
        console.log("value", value, name);
        setPayload((prev) => ({ ...prev, [name]: value?.value }));
    };
    const dateSelect = (date, name) => {
        setPayload({
            ...payload,
            [name]: date,
        });
    };
    return (
        <>
            <div className="card">
                <Heading name={"Temp Doctor Registration"} isBreadcrumb={true} />
                <div className="row px-2 py-2">

                    <DatePicker
                        name="FromDate"
                        id="FromDate"
                        value={payload?.FromDate}
                        onChange={dateSelect}
                        maxDate={new Date()}
                        placeholder=""
                        lable={t("From Date")}
                        className="custom-calendar"
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <DatePicker
                        name="ToDate"
                        id="ToDate"
                        value={payload?.ToDate}
                        onChange={dateSelect}
                        maxDate={new Date()}
                        placeholder=""
                        lable={t("TO Date")}
                        className="custom-calendar"
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />

                    <ReactSelect
                        name="Centre"
                        id="Centre"
                        removeIsClearable={true}
                        // dynamicOptions={}
                        placeholderName=" Centre"
                        value={payload?.Centre}
                        onChange={handleSelectChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />

                    {/* <Input
                        type="text"
                        placeholder=" "
                        lable="Batch No"
                        id="BatchNo"
                        name="BatchNo"
                        value={payload?.BatchNo}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    /> */}
                    <div className="col-sm-2 d-flex">
                        <button className="btn btn-sm btn-success">{t("Search")}</button>

                    </div>

                </div>
            </div>


            <div className="mt-2">
          <Accordion title={t("Doctor Approval")} defaultValue={true}>
            {tableData.length > 0 ? (
              <div className="row px-1">
                <div className="col-12">
                  <Tables style={{
                    height: "300px",
                    minHeight: "300px",
                    overflowY: "scroll"
                  }}
                  >
                    <thead className="cf">
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("Keyword")}</th>
                        <th>{t("Keyword")}</th>
                        <th>{t("Keyword")}</th>
                        <th>{t("Keyword")}</th>
                        <th>{t("Keyword")}</th>
                        <th>{t("Keyword")}</th>

                        {allKeys
                          .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
                          .map((langKey) => (
                            <th key={langKey}>{langKey}</th>
                          ))}
                      </tr>
                    </thead>

                    <tbody>
                      {currentData.map((data, index) => (
                        <tr key={index}>
                          <td>{indexOfFirstRow + index + 1}</td>

                          <td>{data?.DictionaryKeyword}</td>

                          {allKeys
                            .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
                            .map((langKey) => (
                              <td key={langKey}>{data[langKey] || "-"}</td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>

                  {/* PAGINATION */}
                  <div className="d-flex justify-content-end align-items-center mt-2">
                    <Pagination
                      className="pagination-bar"
                      currentPage={currentPage}
                      totalCount={activeData.length}
                      pageSize={rowsPerPage}
                    //   onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </Accordion>
        </div>
        </>
    )
}

export default DoctorApproval