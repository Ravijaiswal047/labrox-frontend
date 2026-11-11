import React, { useEffect, useState } from "react";
import { t } from "i18next";
import moment from "moment";
import Heading from "../../components/UI/Heading";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import {
  FormBuilderGetFormPreviewByFormId,
  FormBuilderGetFormsList,
  FormBuilderUpdateStatus,
} from "../../NetworkServices/Form-builder";
import { notify } from "../../utils/ustil2";
import { InputSwitch } from "primereact/inputswitch";
import { useNavigate } from "react-router-dom";

const ManageForms = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    fromDate: new Date(),
    toDate: new Date(),
    status: { label: "All", value: "2" },
  });

  const [tableData, setTableData] = useState([]);

  const statusOptions = [
    { label: "All", value: "2" },
    { label: "Active", value: "1" },
    { label: "Inactive", value: "0" },
    { label: "Published", value: "3" },
  ];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setValues((prev) => ({ ...prev, [name]: selectedOption }));
  };

  const getTableData = async (isNotify = true) => {
    try {
      debugger
      const startDate = moment(values.fromDate).format("YYYY-MM-DD");
      const endDate = moment(values.toDate).format("YYYY-MM-DD");
      const statusValue = Number(values.status?.value);

      const res = await FormBuilderGetFormsList(
        startDate,
        endDate,
        statusValue,
      );

      if (res?.success && res?.data?.length > 0) {
        setTableData(res?.data);
        isNotify && notify(res?.message, "success");
      } else {
        setTableData([]);
        notify(res?.message, "error");
      }
    } catch (error) {
      console.error(error);
      setTableData([]);
    }
  };

  const handleFormUpdate = async (form_id, type, status) => {
    try {
      const payload = {
        form_id: form_id,
        type: type,
        status: status,
      };
      const res = await FormBuilderUpdateStatus(payload);
      if (res?.success) {
        notify(res?.message, "success");
        getTableData(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusToggle = async (isChecked, item) => {
    const status = isChecked ? 1 : 0;
    const form_id = item.form_id;
    await handleFormUpdate(form_id, 0, status);
  };

  const handlePublishToggle = async (isChecked, item) => {
    const status = isChecked ? 1 : 0;
    const form_id = item.form_id;
    await handleFormUpdate(form_id, 1, status);
  };

  const fetchForm = async (item) => {
    try {
      const res = await FormBuilderGetFormPreviewByFormId(item?.form_id);
      if (res.success) {
        return res.data;
      } else {
        notify(res.message || "Failed to load form", "error");
        return null;
      }
    } catch (error) {
      console.error(error);
      notify("Error fetching form data", "error");
      return null;
    }
  };

  const handleEdit = async (item) => {
    const data = await fetchForm(item);
    if (data) {
      navigate("/FormBuilder", { state: { form_data: data } });
    }
  };

  const handleViewItem = async (item) => {
    const data = await fetchForm(item);
    if (data) {
      navigate("/FormPreview", { state: { form_data: data } });
    }
  };

  useEffect(() => {
    getTableData(false);
  }, []);

  return (
    <div className="card border">
      <Heading title={t("Manage Forms")} isBreadcrumb={true} />

      <div className="card-body p-2">
        <div className="row mb-3 align-items-end">
          <DatePicker
            className="custom-calendar"
            id="fromDate"
            name="fromDate"
            lable={t("From Date")}
            value={values.fromDate}
            handleChange={handleDateChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />
          <DatePicker
            className="custom-calendar"
            id="toDate"
            name="toDate"
            lable={t("To Date")}
            value={values.toDate}
            handleChange={handleDateChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />
          <ReactSelect
            placeholderName={t("Status")}
            id="status"
            name="status"
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            dynamicOptions={statusOptions}
            value={values.status?.value}
            handleChange={handleSelectChange}
          />
          <div className="col-xl-2 col-md-4 col-sm-6 col-12 mb-1">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => getTableData(true)}
            >
              {t("Search")}
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {tableData.length > 0 ? (
              <div className="table-responsive">
                <Tables
                  thead={[
                    { name: t("S.No"), width: "5%" },
                    { name: t("Form Name"), width: "20%" },
                    { name: t("Display Name"), width: "20%" },
                    {
                      name: t("Sections"),
                      width: "5%",
                      className: "text-center",
                    },
                    {
                      name: t("Fields"),
                      width: "5%",
                      className: "text-center",
                    },
                    { name: t("Created At"), width: "15%" },
                    {
                      name: t("Activate"),
                      width: "10%",
                      className: "text-center",
                    },
                    {
                      name: t("Publish"),
                      width: "10%",
                      className: "text-center",
                    },
                    { name: t("View"), width: "5%", className: "text-center" },
                    { name: t("Edit"), width: "5%", className: "text-center" },
                  ]}
                  tbody={tableData.map((item, index) => ({
                    "S.No": index + 1,
                    "Form Name": item.form_name,
                    "Display Name": item.form_display_name,
                    Sections: (
                      <div className="text-center">{item.section_count}</div>
                    ),
                    Fields: (
                      <div className="text-center">{item.field_count}</div>
                    ),
                    "Created At": moment(item.created_at).format(
                      "DD-MMM-YYYY HH:mm",
                    ),
                    Activate: (
                      <div className="text-center">
                        <InputSwitch
                          checked={item.is_active === 1}
                          onChange={(e) =>
                            handleStatusToggle(e.target.value, item)
                          }
                        />
                      </div>
                    ),
                    Publish: (
                      <div className="text-center">
                        <InputSwitch
                          checked={item.ispublished === 1}
                          onChange={(e) =>
                            handlePublishToggle(e.target.value, item)
                          }
                        />
                      </div>
                    ),
                    view: (
                      <div className="text-center">
                        <i
                          className="fa fa-eye text-primary"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleViewItem(item)}
                        ></i>
                      </div>
                    ),
                    edit: (
                      <div className="text-center">
                        <i
                          className="fa fa-edit text-info"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEdit(item)}
                        ></i>
                      </div>
                    ),
                  }))}
                />
              </div>
            ) : (
              <div className="text-center text-danger mt-3">
                {t("No Records Found")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageForms;
