import React, { useEffect, useRef, useState } from "react";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import TableFilterDot from "../../../components/TableFilter/TableFilterDot";
import { axiosInstance } from "../../../utils/axiosInstance";
import Input from "../../../components/formComponent/Input";
import Tables from "../../../components/UI/customTable";
import Heading from "../../../components/UI/Heading";
import { apiUrls } from "../../../utils/apiUrls";
import { useTranslation } from "react-i18next";
import { Button, Form } from "react-bootstrap";
import { notify } from "../../../utils/utils";
import { useDispatch } from "react-redux";
import "./ReferLabMaster.css";
import Pagination from "../../../Pagination/Pagination";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Accordion from "../../../components/UI/Accordion";

const ReferLabMaster = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refTableData, setRefTableData] = useState([]);
  const [filterTableData, setFilterTableData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [searchName, setSearchName] = useState("");
  const activeFilterRef = useRef("all");
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedData = filterTableData.slice(startIndex, endIndex);
  const initialState = {
    name: "",
    isActive: true,
    id: "",
  };
  const [payload, setPayload] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, checked } = e?.target;
    if (name === "isActive") {
      setPayload((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilter = (data, type, name = "") => {
    let result = type === "all" ? data : data.filter((d) => String(d?.IsActive) === String(type));
    if (name?.trim()) {
      result = result.filter((d) => d?.NAME?.toLowerCase().includes(name.trim().toLowerCase()));
    }
    return result;
  };

  const filterOnClick = (type) => {
    activeFilterRef.current = type;
    const filtered = applyFilter(refTableData, type, searchName);
    setFilterTableData(filtered);
    setTotalCount(filtered.length);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchName(val);
    const filtered = applyFilter(refTableData, activeFilterRef.current, val);
    setFilterTableData(filtered);
    setTotalCount(filtered.length);
    setCurrentPage(1);
  };

  const statusCount = (statuType) => {
    return refTableData?.filter((item) => item?.IsActive == statuType)?.length;
  };

  const saveReferLab = async () => {
    if (!payload?.name) {
      notify("Name is required.", "warn");
      return;
    }
    const refLabPayload = {
      name: payload?.name,
      isActive: payload?.isActive ? 1 : 0,
      type: isUpdate ? "Update" : "Insert",
      id: isUpdate ? payload?.id : 0,
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls?.InsertReferalLab, refLabPayload)
      .then((res) => {
        if (res?.data?.success) {
          notify(res?.data?.message, "success");
          getRrefLab();
          hanldeClear();
        } else {
          notify(res?.data?.message, "error");
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getRrefLab = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetReferalLab, { name: "" })
      .then((res) => {
        if (Array.isArray(res?.data?.message)) {
          const data = res?.data?.message || [];
          setRefTableData(data);
          const filtered = applyFilter(data, activeFilterRef.current, searchName);
          setFilterTableData(filtered);
          setTotalCount(filtered.length);
          setCurrentPage(1);
          return;
        }
        notify(res?.data?.message, "error");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleEdit = (tRow) => {
    setPayload((prev) => ({
      ...prev,
      name: tRow?.NAME,
      isActive: tRow?.IsActive ? true : false,
      id: tRow?.ID,
    }));
    setIsUpdate(true);
  };

  const hanldeClear = () => {
    setPayload(initialState);
    setIsUpdate(false);
  };

  useEffect(() => {
    getRrefLab();
  }, []);

  return (
    <>
      <div className="ReferLabMaster card">
        <Heading title={"Refer Lab Master"} />
        <div className="row px-2 py-2 d-flex align-items-center">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="text"
              name="name"
              id="name"
              value={payload?.name}
              lable={t("Name")}
              onChange={handleChange}
            />
          </div>
          <Form.Check
            type={"switch"}
            id={`isActive`}
            name="isActive"
            label={`IsActive`}
            checked={payload?.isActive}
            onChange={handleChange}
            className="cursor-pointer mx-2"
          />
          <Button
            onClick={saveReferLab}
            style={{ gap: "4px" }}
            className="p-0 mx-2 rounded px-3 d-flex align-items-center justify-content-between"
          >
            <i className="bi bi-bookmark mb-0 p-0"></i>
            <span>{isUpdate ? "Update" : "Save"}</span>
          </Button>
          <Button
            onClick={hanldeClear}
            style={{ gap: "4px" }}
            className="p-0 mx-2 rounded px-3 d-flex align-items-center justify-content-between"
          >
            <i className="bi bi-x-octagon mb-0 p-0"></i>
            <span>Clear</span>
          </Button>
        </div>

        <Accordion
            title="Search Details"
            defaultValue={true}
            notOpen={true}
            seconTitle={
              <div className="rlm-secontitle d-flex flex-wrap justify-content-end gap-2">
                {/* Desktop: dots inline in heading row */}
                <div className="d-none d-md-flex align-items-center gap-2">
                  <TableFilterDot
                    onClick={() => filterOnClick("1")}
                    color={"#c4f884"}
                    title={`Active (${statusCount("1") || "0"})`}
                    bgColor={"#ebebebbf"}
                  />
                  <TableFilterDot
                    onClick={() => filterOnClick("0")}
                    color={"#ffc4cc"}
                    title={`In-Active (${statusCount("0") || "0"})`}
                    bgColor={"#ebebebbf"}
                  />
                  <TableFilterDot
                    onClick={() => filterOnClick("all")}
                    color={"#FFFFFF"}
                    title={`Show All (${refTableData?.length})`}
                    bgColor={"#ebebebbf"}
                  />
                </div>
                {/* Search bar: always in heading row */}
                <div style={{ minWidth: "120px", maxWidth: "200px", flex: 1 }}>
                  <Input
                    type="text"
                    placeholder="Search by Name..."
                    value={searchName}
                    onChange={handleSearchChange}
                  />
                </div>
                {/* Mobile: dots wrap below search bar, inside same heading card */}
                <div className="d-flex d-md-none flex-wrap gap-1 w-100">
                  <TableFilterDot
                    onClick={() => filterOnClick("1")}
                    color={"#c4f884"}
                    title={`Active (${statusCount("1") || "0"})`}
                    bgColor={"#ebebebbf"}
                  />
                  <TableFilterDot
                    onClick={() => filterOnClick("0")}
                    color={"#ffc4cc"}
                    title={`In-Active (${statusCount("0") || "0"})`}
                    bgColor={"#ebebebbf"}
                  />
                  <TableFilterDot
                    onClick={() => filterOnClick("all")}
                    color={"#FFFFFF"}
                    title={`Show All (${refTableData?.length})`}
                    bgColor={"#ebebebbf"}
                  />
                </div>
              </div>
            }
          >
          </Accordion>
          <Tables>
            <thead className="cf">
              <tr>
                {[t("S.No."), t("Name"), t("Created By"), t("Created Date"), t("Updated By"), t("Updated Date"), t("Edit")].map((ele, index) => (
                  <th className="theaderThPadding" key={index}>
                    {ele}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((tRow, index) => (
                  <tr
                    key={tRow.ID}
                    className="tref_rable_row"
                    style={{
                      backgroundColor: tRow?.IsActive == 1 ? "#c4f884" : "#ffc4cc",
                    }}
                  >
                    <td data-title={t("S.No")} style={{ width: "60px" }}>
                      {startIndex + index + 1}
                    </td>
                    <td data-title={t("Name")}>{tRow?.NAME}</td>
                    <td data-title={t("Created By")}>{tRow?.CreatedByName}</td>
                    <td data-title={t("Created Date")}>{tRow?.dtEntry}</td>
                    <td data-title={t("Updated By")}>{tRow?.UpdatedByName}</td>
                    <td data-title={t("Updated Date")}>{tRow?.dtUpdate}</td>
                    <td data-title={t("Edit")} style={{ width: "60px" }}>
                      <Button
                        onClick={() => handleEdit(tRow)}
                        className="rounded"
                      >
                        <i className="fa fa-pencil" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
      </div>

      {refTableData.length > 0 && (
        <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
          <div style={{ minWidth: "150px" }}>
            <ReactSelect
              value={pageSize}
              dynamicOptions={[
                { label: "25", value: 25 },
                { label: "50", value: 50 },
                { label: "100", value: 100 },
                { label: "150", value: 150 },
              ]}
              name={"pageSize"}
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
        </div>
      )}
    </>
  );
};

export default ReferLabMaster;
