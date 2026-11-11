import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { getTrimmedData, IndexHandle } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { validateAlleryDrug } from "../../utils/Schema";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { Link } from "react-router-dom";
import file from ".././Images/file.png";
import { CustomButton } from "../../components/UI/CustomButton";
import Pagination from "../../Pagination/Pagination";
import { Form } from "react-bootstrap";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

function AllergyDrugMaster() {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [AllergyData, setAllergyData] = useState([]);
  const [err, setErr] = useState({});
  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [formData, setFormData] = useState({
    Name: "",
    Name_Hindi: "",
    AllergyTypeID: "",
    AllergyType: "",
    IsActive: 1,
    ID: 0,
  });

  console.log("form data", formData)

  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const localData = useLocalStorage("userData", "get");

  const getAllergyData = () => {
    axiosInstance
      .get("ResultentryAllergy/AllergyType")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.Name,
          };
        });
        setAllergyData(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearch = () => {
    setLoad(true);
    axiosInstance
      .post("ResultentryAllergy/GetAllAllergyDrugs", {
        pageNumber: currentPage,
        pageSize: pageSize,
        AllergyTypeID: formData?.AllergyTypeID ? formData?.AllergyTypeID : 0,
      })
      .then((res) => {
        if (Array.isArray(res?.data?.message)) {
          setTableData(res.data.message);
          setTotalCount(res?.data?.data?.totalRecords || 0)
          setLoad(false);
        } else {
          setTableData([]);
          setTotalCount(0)
          setLoad(false);
          // toast?.error(res?.data?.message ? res?.data?.message : "No Data found")
        }
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };

  useEffect(() => {
    getAllergyData();
  }, [])

  useEffect(() => {
    handleSearch();
  }, [currentPage, pageSize, formData.AllergyTypeID]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log({ name, value, type });
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const saveAlleryTypeData = () => {
    let generatedError = validateAlleryDrug(formData);
    console.log({ generatedError });
    if (generatedError === "") {
      //   setLoad(true);
      axiosInstance
        .post(
          "ResultentryAllergy/SaveOrUpdateAllergyDrug",
          getTrimmedData({
            ...formData,
          }),
        )
        .then((res) => {
          if (res?.data?.success) {
            setFormData({
              Name: "",
              Name_Hindi: "",
              AllergyTypeID: "",
              AllergyType: "",
              IsActive: 1,
              ID: 0,
            });
            toast.success(res?.data?.message);
            handleSearch();
            setLoad(false);
          } else {
            toast.error(res?.data?.message);
            setLoad(false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad(false);
        });
    } else {
      setErr(generatedError);
    }
  };
  const handleEdit = (data) => {
    console.log(data);
    setFormData({
      Name: data?.Name,
      Name_Hindi: data?.Name_Hindi,
      AllergyTypeID: data?.AllergyTypeID,
      AllergyType: data?.AllergyType,
      IsActive: data?.IsActive,
      ID: data?.ID,
    });
  };

  const handleSearchSelectChange = (label, value) => {
    setFormData({
      ...formData,
      [label]: value?.value,
      AllergyType: value?.label,
    });
  };
  console.log({ formData });
  return (
    <>
      {show?.modal && (
        <UploadFile
          show={show?.modal}
          handleClose={() => {
            setShow({ modal: false, data: "", index: -1 });
          }}
          documentId={show?.data}
          pageName="AlleryMaster"
        />
      )}
      <Accordion
        name={t("AllergyDrugMaster")}
        showDrop={true}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-2 col-6">
            <ReactSelect
              className="required-fields"
              dynamicOptions={AllergyData}
              removeIsClearable={false}
              name="AllergyTypeID"
              lable="AllergyTypeName"
              id="AllergyTypeID"
              placeholderName="AllergyTypeName"
              value={formData?.AllergyTypeID}
              onChange={handleSearchSelectChange}
            />
            {formData?.AllergyTypeID === "" && (
              <span className="error-message">{err?.AllergyTypeID}</span>
            )}
          </div>

          <div className="col-sm-2 col-6">
            <Input
              placeholder=" "
              className="required-fields"
              id="Name"
              type="text"
              lable="Drug Name"
              name="Name"
              value={formData?.Name}
              onChange={handleChange}
              maxLength={25}
            />
            {formData?.Name === "" && (
              <span className="error-message">{err?.Name}</span>
            )}
          </div>
          {localData.CompanyCode !== "PKL" && (
            <div className="col-sm-2 col-6">
              <Input
                placeholder=" "
                id="Name_Hindi"
                type="text"
                lable="Drug Name Hindi"
                name="Name_Hindi"
                value={formData?.Name_Hindi}
                onChange={handleChange}
                maxLength={25}
              />
            </div>
          )}
          {/* <div className="col-sm-2 d-flex col-6 mt-2">
            <div className="mt-1">
              <input
                name="IsActive"
                type="checkbox"
                className="mb-3"
                checked={formData?.IsActive}
                onChange={handleChange}
              />
            </div>
            <label htmlFor="IsActive" className="ml-2">
              {t("Active")}
            </label>
            &nbsp;
          </div> */}
          <div className="col-sm-2 d-flex col-6 mt-2">
            <Form.Check
              type="switch"
              id="IsActive"
              name="IsActive"
              label={t("Active")}
              onChange={handleChange}
              checked={formData?.IsActive}
            />
          </div>
          <div className="col-sm-1 mb-1">
            <CustomButton
              text={formData?.ID !== 0 ? t("Update") : t("Save")}
              icon={formData?.ID !== 0 ? t("edit") : t("save")}
              onClick={saveAlleryTypeData}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Result")} defaultValue={true}>
        {load ? (
          <Loading />
        ) : (
          <>
            {tableData?.length > 0 ? (
              <div className="row p-2">
                <div className="col-12">
                  <Tables>
                    <thead className="cf">
                      <tr>
                        {[
                          t("S.No."),
                          t("DrugName"),
                          t("DrugNameHindi"),
                          t("AllergyType"),
                          t("Upload Doc"),
                          t("IsActive"),
                          t("Edit"),
                        ].map((ele, index) => (
                          <th key={index}>{ele}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((ele, index) => (
                        <tr key={index}>
                          <td data-title={t("S.No")}>{index + 1 + IndexHandle(currentPage, pageSize)}&nbsp;</td>
                          <td data-title={t("DrugName")}>{ele?.NAME}&nbsp;</td>
                          {localData.CompanyCode !== "PKL" && (
                            <td data-title={t("DrugNameHindi")}>
                              {ele?.Name_Hindi}&nbsp;
                            </td>
                          )}
                          <td data-title={t("AllergyType")}>
                            {ele?.AllergyType}&nbsp;
                          </td>
                          <td data-title={t("Upload Doc")}>
                            <div className="col-sm-2">
                              <img
                                src={file}
                                className="sizeicon"
                                style={{
                                  cursor: "pointer",
                                  // color:
                                  //   data?.UploadDocumentCount > 0
                                  //     ? "#4ea30c"
                                  //     : "",
                                }}
                                // style={{ color: "#605ca8", cursor: "pointer" }}
                                onClick={() =>
                                  setShow({
                                    modal: true,
                                    data: ele?.AllergyTypeIDHash,
                                    index: index,
                                  })
                                }
                              ></img>
                            </div>
                            &nbsp;
                          </td>
                          <td data-title={t("IsActive")}>
                            {ele?.IsActive == 1 ? "Active" : "InActive"}&nbsp;
                          </td>
                          <td data-title="Select">
                            <div onClick={() => handleEdit(ele)}>
                              <Link> {t("Edit")}</Link>
                            </div>
                            {/* <button
                              className="btn btn-primary btn-sm btn-class"
                              onClick={() => {
                                handleEdit(ele);
                              }}
                            >
                              <i class="fa fa-edit"></i>
                            </button> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
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
                </div>{" "}
              </div>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}{" "}
      </Accordion>
    </>
  );
}

export default AllergyDrugMaster;
