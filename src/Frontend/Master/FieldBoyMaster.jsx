import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Heading from "../../components/UI/Heading";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Pagination from "../../Pagination/Pagination";
import Input from "../../components/formComponent/Input";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { CustomButton } from "../../components/UI/CustomButton";
import { PlaceholderImage } from "../../assets";

const FieldBoyMaster = () => {
  const { t } = useTranslation();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

   const colorCodingData = [
    { color: "#FFFFFF", id: "1", labelKey: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "In Active" },
  ];

  const getFieldBoyMasterData = () => {
    axiosInstance
      .post("FieldBoyMaster/getFieldBoy", {
        FieldBoyID: 0
      })
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.message)) {
          setData(res.data.message);
          setLoading(false);
          setTotalCount(res?.data?.message.length || 0)
        }else{
          setData([]);
          setLoading(false);
          setTotalCount(0)
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getFieldBoyMasterData();
  }, []);

  const filteredData = data?.filter((item) => {
    return (
      item?.NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.Mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.State?.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
  });

  const indexOfLastRecord = currentPage * pageSize;
  const indexOfFirstRecord = indexOfLastRecord - pageSize;
  const currentTableData = filteredData?.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <>
      <Accordion
        name={t("Field Boy Master")}
        defaultValue={true}
        isBreadcrumb={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div
            className="d-none d-md-flex align-items-center justify-content-between"
            id="pr_id_11"
            style={{
              gap:"5px"
            }}
          >
            {colorCodingData.map(({ color, labelKey, id }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={t(labelKey)}
              />
            ))}
            <div className="mt-2">
              <Input
                className=""
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
              <Link to={"/CreateFieldBoyMaster"}>
                <CustomButton
                  icon={"add"}
                  text={t("Create New")}
                />
              </Link>
          </div>
        }
      >
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            {loading ? (
              <Loading />
            ) : (
              <>
                <Tables>
                  <>
                    <thead className="cf">
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("Name")}</th>
                        <th>{t("Age")}</th>
                        <th>{t("Mobile")}</th>
                        <th>{t("City")}</th>
                        <th>{t("State")}</th>
                        <th>{t("PinCode")}</th>
                        <th>{t("Home Collection")}</th>
                        <th>{t("Created By")}</th>
                        <th>{t("Created Date")}</th>
                        <th>{t("Updated By")}</th>
                        <th>{t("Updated Date")}</th>
                        <th>{t("Action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData?.map((ele, index) => {
                        const rowColor = ele?.IsActive ?  "#FFFFFF" : "#f5c6cb";
                        return (
                          <tr key={index} style={{ backgroundColor: rowColor }}>
                          <td data-title={t("S.No")}>{(currentPage - 1) * pageSize + index + 1}&nbsp;</td>
                          <td 
                            data-title={t("Name")} 
                            className="d-flex align-items-center" 
                            style={{gap: "5px", textTransform: "capitalize"}}
                          >
                            <div>
                              <img 
                                src={ele?.ImagePath ? ele?.ImagePath : PlaceholderImage} 
                                alt={ele?.Name || "-"} 
                                width={25} 
                                height={25} 
                                style={{
                                  borderRadius: "50%"
                                }} 
                                onError={(e) => {
                                  e.target.src = PlaceholderImage;
                                }}
                              />
                            </div>
                            {ele?.Name || "- "}
                          </td>
                          <td data-title={t("Age")}>{ele?.Age || "-"}</td>
                          <td data-title={t("Contact No")}>{ele?.Mobile || "-"}</td>
                          <td data-title={t("City")}>{ele?.City || "-"}</td>
                          <td data-title={t("State")}>{ele?.State || "-"}</td>
                          <td data-title={t("PinCode")}>{ele?.Pincode || "-"}</td>
                          <td data-title={t("Home Collection")}>
                            {ele?.HomeCollection ? t("Yes") : t("No")}
                          </td>
                          <td data-title={t("Created By")}>{ele?.CreatedByName || "-"}</td>
                          <td data-title={t("Created Date")}>{ele?.dtEntry || "-"}</td>
                          <td data-title={t("Updated By")}>{ele?.UpdatedByName || "-"}</td>
                          <td data-title={t("Updated Date")}>{ele?.dtUpdate || "-"}</td>
                          <td data-title={t("Action")}>
                            <Link
                              state={{
                                data: ele?.FieldBoyID,
                                other: { button: "Update" },
                                url: "FieldBoyMaster/getFieldBoy",
                              }}
                              to="/CreateFieldBoyMaster"
                            >
                              <CustomButton
                                icon={"edit"}
                              />
                            </Link>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </>
                </Tables>
                <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
                  {totalCount > 25 && (
                    <>
                      <div style={{ minWidth: '150px' }}>
                        <ReactSelect
                          value={pageSize}
                          dynamicOptions={[
                            { label: '25', value: 25 },
                            { label: '50', value: 50 },
                            { label: '100', value: 100 },
                            { label: '150', value: 150 },
                          ]}
                          name={'pageSize'}
                          label={t("pageSize")}
                          removeIsClearable={true}
                          onChange={(name, value) => {
                            setPageSize(value?.value);
                            setCurrentPage(1);
                          }}
                        />
                      </div>

                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                        }}
                      />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default FieldBoyMaster;
