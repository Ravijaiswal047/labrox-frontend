import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import { toast } from "react-toastify";

import CustomTable from "../../components/Table/CustomTable";
import Input from "../../components/formComponent/Input";
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";


const Blockbuilding = () => {
  const { t } = useTranslation();

  const initialState = {
    shortKey: "",
    description: "",
  };
  

  const [payload, setPayload] = useState(initialState);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [update, setUpdate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 GET LIST
  const fetchData = async () => {
    setLoading(true);
    try {
      // Adjusted to common project pattern, using axiosInstance
      const res = await axiosInstance.get("BuildingBlock/GetList/0");
      
      const result = res?.data?.message || res?.data?.data || res?.data;

      const formatted = Array.isArray(result)
        ? result.map((item, index) => ({
            sNo: index + 1,
            id: item.Id,
            shortKey: item.ShortKey,
            description: item.Description,
            createdBy: item.CreatedByName,
            date: item.dtEntry || "",
          }))
        : [];

      setData(formatted);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 SAVE / UPDATE
  const handleSave = async () => {
    if (!payload.shortKey || !payload.description) {
        toast.error("Please fill all required fields");
        return;
    }

    setLoading(true);
    try {
      const url = update
        ? `BuildingBlock/UpdateBuildingBlock`
        : `BuildingBlock/SaveBuildingBlock`;

      const body = {
        id: update ? editId : null,
        companyID: 101, // Using the provided companyID
        shortKey: payload.shortKey,
        description: payload.description,
        isActive: 1,
      };

      const res = await axiosInstance.post(url, body);

      if (res?.data?.success || res?.data?.status) {
        toast.success(res?.data?.message || (update ? "Updated successfully" : "Saved successfully"));
        await fetchData();
        setPayload(initialState);
        setUpdate(false);
        setEditId(null);
      } else {
        toast.error(res?.data?.message || "Operation failed");
      }
    } catch (err) {
      console.error("Save Error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 EDIT
  const handleEdit = (row) => {
    setPayload({
      shortKey: row.shortKey,
      description: row.description,
    });
    setEditId(row.id);
    setUpdate(true);
    window.scrollTo(0, 0);
  };

  // 🔹 SEARCH FILTER
  const filteredData = useMemo(() => {
    if (!searchText) return data;

    const search = searchText.toLowerCase();

    return data.filter(
      (item) =>
        item.shortKey?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
    );
  }, [data, searchText]);

  // 🔹 TABLE CONFIG
  const columns = [
    { header: "S.No", field: "sNo" },
    { header: "Short Key", field: "shortKey" },
    { header: "Description", field: "description" },
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "date" },
    { header: "Action", field: "action" },
  ];

  const tableData = filteredData.map((row) => ({
    ...row,
    action: (
      <button
        className="btn btn-sm btn-info text-white p-1"
        onClick={() => handleEdit(row)}
      >
        <i className="fa fa-edit"></i> {t("Edit")}
      </button>
    ),
  }));

  return (
    <>
      <Accordion
        name={t("Block Building")}
        isBreadcrumb
        defaultValue={true}
        notOpen={true}
        linkTo="#"
      />

      {loading && <Loading />}

      {/* 🔹 FORM ROW */}
      <div className="card pt-2 pl-2 pr-2 mb-1">
        <div className="row px-2">
            <div className="col-sm-2 mb-1">
            <Input
                lable="Short Key"
                name="shortKey"
                value={payload.shortKey}
                onChange={handleChange}
                required
            />
            </div>

            <div className="col-sm-3 mb-1">
            <Input
                type="textarea"
                lable="Description"
                name="description"
                value={payload.description}
                onChange={handleChange}
                required
            />
            </div>

            <div className="col-sm-1 d-flex align-items-end mb-3">
            <CustomButton
                className="btn btn-success btn-sm btn-block"
                text={update ? "Update" : "Save"}
                icon="save"
                onClick={handleSave}
                disabled={loading}
            />
            </div>

            <div className="col-sm-1 d-flex align-items-end mb-3">
            <CustomButton
                className="btn btn-danger btn-sm btn-block"
                text="Reset"
                icon="refresh"
                onClick={() => {
                setPayload(initialState);
                setUpdate(false);
                }}
            />
            </div>
        </div>
      </div>

      {/* 🔹 SEARCH + TABLE */}
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div style={{ width: "250px" }}>
            <Input
              type="text"
              placeholder="Search..."
              value={searchText}
              removeFormGroupClass={true}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        }
      >
        <div className="row">
          <div className="col-12">
            <CustomTable
              columns={columns}
              data={tableData}
              isStickyHeader={true}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default Blockbuilding;

