import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "../../components/UI/Accordion";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";

export default function TitleGenderMapping() {
    const [TitleOptions, setTitleOptions] = useState([]);
    const [GenderOptions, setGenderOptions] = useState([]);
    const [tableData, setTableData] = useState([]);

    const { t } = useTranslation();

    const [payload, setPayload] = useState({
        Id: 0,
        Title: "",
        Gender: "Other",
        isActive: 1,
        IsVetCanine: 0,
    });

    const handleTitleChange = (e) => {
        const { value } = e.target;
        setPayload((prev) => ({ ...prev, Title: value }));
    };

    const handleGenderChange = (e) => {
        const { value } = e.target;
        setPayload((prev) => ({ ...prev, Gender: value }));
    };

    const handleToggle = () => {
        setPayload((prev) => ({
            ...prev,
            isActive: prev.isActive === 1 ? 0 : 1,
        }));
    };

    const handleToggleVetCanine = () => {
        setPayload((prev) => ({
            ...prev,
            IsVetCanine: prev.IsVetCanine === 1 ? 0 : 1,
        }));
    };

    const handleEdit = (row) => {
        setPayload({
            Id: row.ID,
            Title: row.Title || "",
            Gender: row.Gender || "",
            isActive: row.IsActive !== undefined ? row.IsActive : (row.isActive !== undefined ? row.isActive : 1),
            IsVetCanine: row.IsVetCanine !== undefined ? row.IsVetCanine : 0,
        });
    };

    const getDropdownData = () => {
        // Fetch Title
        axiosInstance
            .post("Global/getGlobalData", { Type: "Title" })
            .then((res) => {
                let data = res.data.message;
                let value = data.map((ele) => ({
                    value: ele.FieldDisplay,
                    label: ele.FieldDisplay,
                }));
                setTitleOptions(value);
            })
            .catch((err) => console.log(err));

        // Fetch Gender
        axiosInstance
            .post("Global/getGlobalData", { Type: "Gender" })
            .then((res) => {
                let data = res.data.message;
                let value = data
                    .filter((ele) => ele.FieldDisplay !== "Both")
                    .map((ele) => ({
                        value: ele.FieldDisplay,
                        label: ele.FieldDisplay,
                    }));
                setGenderOptions(value);
            })
            .catch((err) => console.log(err));
    };

    const handleSubmit = () => {
        axiosInstance.post("CommonController/SaveCompanyGenderTitleMapping", payload)
            .then((res) => {
                if (res.data.success) {
                    toast.success(res.data.message);
                    getData(); // Refresh table after save
                    setPayload({ Id: 0, Title: "", Gender: "", isActive: 1, IsVetCanine: 0 }); // Reset form
                } else {
                    toast.error(res.data.message);
                }
            })
            .catch((err) => console.log(err));
    };

    const getData = () => {
        axiosInstance.post("CommonController/GetCompanyGenderTitleMapping", { Id: 0 })
            .then((res) => {
                if (res.data.success) {
                    setTableData(res.data.message);
                }
            })
            .catch((err) => console.log(err));
    };

    const handleUpdate = () => {
        axiosInstance.post("CommonController/UpdateCompanyGenderTitleMapping", payload)
            .then((res) => {
                if (res.data.success) {
                    toast.success(res.data.message);
                    getData(); // Refresh table after save
                    setPayload({ Id: 0, Title: "", Gender: "", isActive: 1, IsVetCanine: 0 }); // Reset form
                } else {
                    toast.error(res.data.message);
                }
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        getDropdownData();
        getData();
    }, []);

    return (
        <>
        <Accordion title={"Title Gender Mapping"} defaultValue={true}>
            <div className="row px-2 mt-2 mb-3 align-items-end">
                <div className="col-sm-2 col-12">
                    <SelectBox
                        lable={t("Title")}
                        id="Title"
                        name="Title"
                        options={TitleOptions}
                        selectedValue={payload.Title}
                        onChange={handleTitleChange}
                    />
                </div>

                <div className="col-sm-2 col-12">
                    <SelectBox
                        lable={t("Gender")}
                        id="Gender"
                        name="Gender"
                        options={GenderOptions}
                        selectedValue={payload.Gender}
                        onChange={handleGenderChange}
                    />
                </div>

                <div className="col-sm-auto d-flex align-items-center">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={payload.isActive === 1}
                            onChange={handleToggle}
                        />
                        <span className="slider"></span>
                    </label>
                    <strong className="ml-2 mb-2">{t("IsActive")}</strong>
                </div>

                <div className="col-sm-auto d-flex align-items-center">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={payload.IsVetCanine === 1}
                            onChange={handleToggleVetCanine}
                        />
                        <span className="slider"></span>
                    </label>
                    <strong className="ml-2 mb-2">{t("IsVetCanine")}</strong>
                </div>

                <div className="col-sm-auto">
                    <SaveButton
                        text={payload.Id === 0 ? t("Save") : t("Update")}
                        icon={"save"}
                        onClick={payload.Id === 0 ? handleSubmit : handleUpdate}
                    />
                </div>
            </div>

            <Accordion title={"Title Gender Mapping"} defaultValue={true}>
            <div className="table-responsive">
                <Tables>
                    <thead className="table-light">
                        <tr>
                            <th>{t("S.No")}</th>
                            <th>{t("Title")}</th>
                            <th>{t("Gender")}</th>
                            <th>{t("IsVetCanine")}</th>
                            <th>{t("IsActive")}</th>
                            <th>{t("Created By")}</th>
                            <th>{t("Created Date")}</th>
                           <th>{t("Action")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-muted py-3">
                                    {t("No data found")}
                                </td>
                            </tr>
                        ) : (
                            tableData.map((row, idx) => (
                                <tr key={row.ID}>
                                    
                                    <td>{idx + 1}</td>
                                    <td>{row.Title}</td>
                                    <td>{row.Gender || "-"}</td>
                                    <td>
                                        <span
                                        //  className={`badge ${row.IsVetCanine === 1 ? "bg-success" : "bg-secondary"}`}
                                         >
                                            {row.IsVetCanine === 1 ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                        //  className={`badge ${row.IsActive === 1 ? "bg-success" : "bg-danger"}`}
                                         >
                                            {row.IsActive === 1 ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>{row.CreatedByName || "-"}</td>
                                    <td>{row.DtEntry?.value ? row.DtEntry.value.replace("T", " ") : "-"}</td>
                                    <td>
                                        <button 
                                            className="btn btn-sm text-primary" 
                                            onClick={() => handleEdit(row)}
                                            style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
                                        >
                                            <i className="fa fa-edit"></i> 
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Tables>
                
            </div>
            </Accordion>
        </Accordion>
        </>
    );
}
