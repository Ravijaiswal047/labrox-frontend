import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import RadioInput from "../../../../components/formComponent/RadioInput";
import FullTextEditor from "../../../../components/formComponent/TextEditor";
import { Button } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import { ViewMenu } from "../../../../components/SvgIcons";
import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../../../utils/apiUrls";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import Heading from "../../../../components/UI/Heading";
import { Form } from "react-bootstrap";
import { CustomButton } from "../../../../components/UI/CustomButton";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../../../components/Filter/FilterInput";

const QCRemarksMaster = () => {
  const { t } = useTranslation();
  const initialState = {
    Type: "",
    RemarkTitle: "",
    IsActive: "1",
    TemplateText: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [Editor, setEditor] = useState("");
  const [Editing, setEditing] = useState(true);
  const [Editable, setEditable] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [masterTableData, setMasterTableData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();

  const colorsCodingData = [
    { color: "#ffe58f", id: "7", labelKey: "Deactive Or Expired" },
    { color: "#90EE90", id: "8", labelKey: "Active" },
  ];

  const TypeOptions = [
    { value: "0", label: "Select" },
    { value: "RCA", label: "RCA" },
    { value: "Corrective Action", label: "Corrective Action" },
    { value: "Preventive Action", label: "Preventive Action" },
  ];

  const columns = [
    { header: "Sr No.", field: "srNo", width: "3%" },
    { header: "Remark Type", field: "remarkType" },
    { header: "Remark Title", field: "remarkTitle" },
    { header: "Remark", field: "remark" },
    // { header: "Status", field: "status" },
    { header: "Entry Date", field: "entryDate" },
    { header: "Entry By", field: "entryBy" },
    { header: "Update Date", field: "updateDate" },
    { header: "Update By", field: "updateBy" },
    { header: "Edit", field: "edit", width: "3%" },
  ];

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setTableData(masterTableData);
      return;
    }

    const searchableKeys = [
      "remarkType",
      "remark",
    ];

    const filtered = masterTableData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableData(filtered);
  };

  const handleSelectChange = (name, value) => {
    console.log(value);
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const handleSaveRemark = async () => {
    const searchPayload = {
      remarkType: payload?.Type || "",
      remark: payload?.RemarkTitle || "",
      isActive: payload?.IsActive || "",
      remarkText: payload?.TemplateText || "",
    };
    console.log("searchpayload", searchPayload);
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.SaveRemark, searchPayload)
      .then((res) => {
        setPayload(initialState);
        setEditor("");
        setEditable(true);
        getAllRemarks();
        notify(res?.data?.message || "Remark saved successfully!", "success");
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleUpdateRemark = async () => {
    console.log("updated");
    if (!editingId) return;

    const updatePayload = {
      id: editingId.toString(),
      remarkType: payload.Type,
      remark: payload.RemarkTitle,
      remarkText: payload.TemplateText,
      isActive: payload.IsActive,
    };

    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(apiUrls.UpdateRemark, updatePayload);
      setTableData((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
              ...item,
              remarkType: payload.Type,
              remarkTitle: payload.RemarkTitle,
              remark: payload.TemplateText,
              status: payload.IsActive === "1" ? "Active" : "Inactive",
            }
            : item,
        ),
      );
      setPayload(initialState);
      setEditor("");
      setEditable(true);
      setEditing(true);
      getAllRemarks();
      notify(res?.data?.message || "Remark updated successfully!", "success");
    } catch (err) {
      notify(err?.data?.message || "Update failed", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleReset = () => {
        setPayload(initialState);
        setEditor("");
        setEditable(true);
        setEditing(true);
        // getAllRemarks();

  }

  const getAllRemarks = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetAllRemarks)
      .then((res) => {
        const formatted = res?.data?.message?.map((item, index) => (
          {
          id: item.id,
          srNo: index + 1,
          remarkType: item.RemarksType || "",
          remarkTitle: item.RemarksTitle || "",
          remark: item.Remarks || "",
          status: item.IsActive || "",
          entryDate: item.EntryDateTime || "",
          entryBy: item.CreatedByName || "",
          updateDate: item.UpdateDateTime || "",
          updateBy: item.UpdateByName || "",
          edit: (
            <i
              className="fa fa-edit"
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() =>
                handleEdit({
                  id: item.id,
                  remarkType: item.RemarksType,
                  remarkTitle: item.RemarksTitle,
                  remark: item.Remarks,
                  status: item.IsActive,
                })
              }
            ></i>
          ),
          rowColor: item.IsActive === "Active" ? "#90EE90" : "#ffe58f",
        }));

        setTableData(formatted); // ✅ Save into state
        setMasterTableData(formatted); // ✅ Save into state
      })
      .catch((err) => {
        console.log(err);
        notify(err?.respose?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleEdit = (row) => {
    console.log("working", row);
    setPayload({
      Type: row.remarkType,
      RemarkTitle: row.remarkTitle,
      IsActive: row.status === "Active" ? "1" : "0",
      TemplateText: row.remark,
    });
    setEditable(true);
    setEditor(row.remark);
    setEditing(false);
    setEditingId(row.id);
  };

  useEffect(() => {
    getAllRemarks();
  }, []);

  console.log("payload", payload);

  return (
    <>
      {showMore && <QCFrameMenu />}
      <Heading
        name={"QC Remark Master"}
        isBreadcrumb={"true"}
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
          name="Type"
          id="Type"
          removeIsClearable={true}
          dynamicOptions={TypeOptions}
          placeholderName="Type"
          value={payload?.Type}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-4 col-md-3 col-lg-2 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Remark Title"
          id="RemarkTitle"
          name="RemarkTitle"
          value={payload?.RemarkTitle}
          onChange={handleChange}
          respclass={"col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12"}
        />
        <Form.Check
          type="switch"
          id="IsActive"
          name="IsActive"
          label={t("Active")}
          checked={payload.IsActive === "1"}
          onChange={handleChange}
          className="mx-2"
        />
      </div>
      <div className="row pt-1 pl-2 pr-2">
        <div className="col-sm-12">
          <FullTextEditor
            value={Editor}
            setValue={(newVal) => {
              setEditor(newVal);
              setPayload((prev) => ({
                ...prev,
                TemplateText: newVal,
              }));
            }}
            EditTable={Editable}
            setEditTable={setEditable}
            height="5"
          />
        </div>
      </div>
      <div className="row py-2">
        <div className="col-sm-12 d-flex justify-content-end">
          {Editing ? (
            <CustomButton text="Save" onClick={handleSaveRemark} className="py-0 mr-2" icon="save" />
          ) : (
            <>
              <CustomButton text="Update" onClick={handleUpdateRemark} className="py-0 mr-2" icon="save" />
            </>
          )}
          <CustomButton text="reset" 
          onClick={handleReset} 
          className="py-0" icon="refresh" />
        </div>

      </div>
        <Heading title={t("Remark Details")} defaultValue={true}
        secondTitle={
            <>
              {colorsCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                />
              ))}
              <FilterInput
              value={searchTerm}
              onChange={handleChangeSearch}
              placeholder="Filter Table"
              className="ml-2"
            />
            </>
          }
        />
        <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={columns}
              data={tableData}
              onEdit={handleEdit}
            />
          </div>
        </div>
    </>
  );
};

export default QCRemarksMaster;
