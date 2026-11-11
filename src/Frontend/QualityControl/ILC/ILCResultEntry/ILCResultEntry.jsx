import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import { ViewMenu } from "../../../../components/SvgIcons";
import ILCFrameMenu from "../ILCFrameMenu";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { CustomButton, SearchButton } from "../../../../components/UI/CustomButton";
import Input from "../../../../components/formComponent/Input";
import { apiUrls } from "../../../../utils/apiUrls";
import { months, years } from "../../../../utils/Constants";
import CustomTable from "../../../../components/Table/CustomTable";
import { FaPlus } from "react-icons/fa";
import Modal from "../../../../components/ModalComponent/Modal";
import AddRemark from "../../IQC/qcReport/AddRemark";

const ILCResultEntry = () => {
    const { t } = useTranslation();
    const date = new Date();
    const [showMore, setShowMore] = useState(false);
    const [centreData, setCentreData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [labOptions, setLabOptions] = useState([]);

    //Remarks 

    const [actionType, setActionType] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [existingRemark, setExistingRemark] = useState("");
    const [remark, setRemark] = useState("");
    const [remarkText, setRemarkText] = useState({});
    
    const [formData, setFormData] = useState({
        CentreId: "",
        CentreName: "",
        LabType: "",
        LabTypeName: "",
        SinNo: "",
        VisitId: "",
        month: date.getMonth() + 1,
        year: date.getFullYear().toString(),
    });

     const isAllSelected =
        tableData.length > 0 &&
        tableData?.every((row) => row.isSelected);


    const columns = [
        { header: "Sr. No", field: "srNo", width: "60px" },
        {
            header: (
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                />
            ),
            field: "select",
            width: "70px",
        },
        { header: "Parameter / Test Name", field: "LabObservationName", width: "250px" },
        { header: "Lab Result Value", field: "OLDValue", width: "150px" },
        { header: "Method", field: "oldmethod", width: "150px" },
        { header: "Reference Range", field: "olddisplayreading" },
        { header: "Result Value 1", field: "newValue" },
        { header: "Result Value 2", field: "newValue1" },
        { header: "Method", field: "newmethod" },
        { header: "Reference Range", field: "newdisplayreading" },
        { header: "Acceptable %", field: "AcceptablePer" },
        { header: "Status", field: "status" },
        { header: "Remarks", field: "Remarks" },
        { header: "RCA", field: "RCA" },
        { header: "Corrective Action", field: "CorrectiveAction" },
        { header: "Preventive Action", field: "PreventiveAction" },
        { header: "DOC", field: "UploadFileName" },
    ];

    /* ---------- API ---------- */
    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("CommonController/GetAccessProcessingLab");
            if (res?.data?.success && Array.isArray(res?.data?.message)) {
                setCentreData(
                    res?.data?.message?.map((c) => ({
                        value: c.centreid,
                        label: c.centre,
                    }))
                );
                console.log("res?.data?.message[0]?.centerid", res?.data?.message[0]?.centerid);
                getILCLab(res?.data?.message[0]?.centreid);
            }
        } catch {
            toast.error("Failed to load centres");
        }
    };

    const getILCLab = async (CentreId) => {
        console.log("Centre", CentreId);
        axiosInstance
            .get(apiUrls?.BindILCRegisteration,
                {
                    params: {
                        ProcessingCentre: CentreId?.toString() || "", // or string value
                    },
                }
            )
            .then((res) => {
                console.log("Bind ILC", res);
                if (res?.data?.success) {
                    const val = res?.data?.message?.map((c) => ({
                        value: c.labid,
                        label: c.labname,
                    }))
                    setLabOptions(val);
                }
                else {
                    setLabOptions([]);
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message
                        ? err?.data?.message
                        : "Error Occured",
                );
            })
            .finally(() => {

            });
    }

    const fetchILCResults = async () => {
        if (!formData.CentreId || !formData.LabType) {
            toast.warn("Please select Centre and Lab Type");
            return;
        }

        const payload = {
            processingCentre: formData?.CentreId?.toString() || "",
            searchValue: formData?.SinNo || "",
            searchValue1: formData.VisitId || "",
            regisYearAndMonth: `${formData.year}#${formData.month}` || "",
            ilcLab: formData.LabType || "",
        };

        try {
            setLoading(true);
            const res = await axiosInstance.post(apiUrls?.GetILCResultEntry,
                payload
            );
            const updatedData = (res.data.message || []).map((item) => ({
                ...item,
                isSelected: false,
            }));

            setTableData(updatedData);
        } catch {
            toast.error("Failed to fetch ILC results");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const selectedRows = tableData?.filter(row => row.isSelected);

  if (selectedRows.length === 0) {
    toast.warning("Please select at least one row");
    return;
  }

  const payload = selectedRows?.map((row) => {

    // 🔹 Extract LabType split
    // const [ilcLabTypeId, ilcLabID] = formData.LabType.split("#");

    // 🔹 Extract remark from remarkText
    let rca = "";
    let correctiveAction = "";
    let preventiveAction = "";

    const remarkData = remarkText?.[row.LabObservationID];

    if (remarkData) {
      const [remarkValue, remarkType] = remarkData;

      if (remarkType === "RCA") rca = remarkValue;
      if (remarkType === "CorrectiveAction") correctiveAction = remarkValue;
      if (remarkType === "PreventiveAction") preventiveAction = remarkValue;
    }

    return {
    //   ilcRegistrationID: row.savedid?.toString() || "0",
      entryMonth: formData.month?.toString(),
      entryYear: formData.year?.toString(),

      processingLabID: row.ProcessingLabID?.toString(),
      processingLabName: row.ProcessingLabName || "",

      ilcLabTypeId: "",
      ilcLabType: "",

      ilcLabID: formData.LabType?.toString(),
      ilcLabName: formData.LabTypeName || "",

      reportType: row.reporttype?.toString(),
      mapType: row.MapType || "",

      oldTest_id: row.OLDTest_id?.toString(),

      labItemID: row.LabObservationID?.toString(),
      labItemName: row.LabObservationName || "",

      test_id: row.Testid?.toString(),

      oldValue: row.OLDValue || "",
      oldMethod: row.oldmethod || "",
      oldDisplayReading: row.olddisplayreading || "",

      newValue: row.newValue || "",
      newValue1: row.newValue1 || "",
      newMethod: row.newmethod || "",
      newDisplayReading: row.newdisplayreading || "",

      acceptable: row.AcceptablePer?.toString() || "0",
      variation: "0", // If you calculate variation, bind here

      status: row.status || "",
      remarks: row.Remarks || "",

      rca: rca || row.RCA || "",
      correctiveAction: correctiveAction || row.CorrectiveAction || "",
      preventiveAction: preventiveAction || row.PreventiveAction || "",

      uploadFileName: "",
      ilcid: "",
    };
  });

        try {
            setLoading(true);
            const res = await axiosInstance.post(apiUrls?.ILCSaveResult,
                payload
            );
           
        } catch {
            toast.error("Failed to fetch ILC results");
        } finally {
            setLoading(false);
        }
    };

    /* ---------- HANDLERS ---------- */
    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value?.value,
        }));
        if (name === "CentreId") {
            getILCLab(value?.value);
            setFormData((prev) => ({
                ...prev,
                LabType: "",
                LabTypeName: "",
                CentreName: value?.label,
            }));
        }
        else if (name === "LabType"){
            setFormData((prev) => ({...prev,
                LabTypeName : value?.label,
            }))
        }
    };

    const openAddRemark = ({ type, item }) => {
    setActionType(type || "");
    setSelectedItemId(item?.LabObservationID || "");
    const remark =
      type === "RCA"
        ? item.RCA
        : type === "CorrectiveAction"
          ? item.CorrectiveAction ?? item.correctiveAction
          : item.PreventiveAction ?? item.preventiveAction;

    setExistingRemark(remark ?? "");
    setRemark(true);
  };

  const handlePreventiveRemark = (itemId, remark, type) => {
    setRemarkText(prev => ({
      ...prev,
      [itemId]: [type,remark],
    }));
    setRemark(false);
  };

    const handleReset = () => {
        setFormData({
            CentreId: "",
            CentreName: "",
            LabType: "",
            LabTypeName: "",
            SinNo: "",
            VisitId: "",
            month: date.getMonth() + 1,
            year: date.getFullYear().toString(),
        });
        setTableData([]);
        setActionType("");
        setSelectedItemId("");
        setExistingRemark("");
        setRemark(false);
        setRemarkText({});
    }

    const handleRowChange = (index, field, value) => {
        setTableData((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        );
    };

    const handleSelectAll = (checked) => {
        setTableData((prev) =>
            prev.map((row) => ({
                ...row,
                isSelected: checked,
            }))
        );
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
        }));
    };

    useEffect(() => {
        getAccessCentres();
    }, []);

    console.log("formData", formData);
    console.log("tableData",tableData);
    console.log("remarkText", remarkText);

    return (
        <>
            {showMore && <ILCFrameMenu />}

            <div className="card">
                <Heading
                    name="ILC Result Entry"
                    isBreadcrumb
                    secondTitle={
                        <label
                            className="cursor-pointer"
                            onClick={() => setShowMore((p) => !p)}
                        >
                            <ViewMenu />
                        </label>
                    }
                />

                <div className="row p-2">
                    <ReactSelect
                        respclass="col-xl-2 col-md-4 col-12"
                        dynamicOptions={centreData}
                        name="CentreId"
                        value={formData.CentreId}
                        placeholderName="All Centre"
                        removeIsClearable
                        onChange={handleSelectChange}
                    />

                    <ReactSelect
                        respclass="col-xl-2 col-md-4 col-12"
                        dynamicOptions={labOptions}
                        name="LabType"
                        value={formData.LabType}
                        placeholderName="Select Lab"
                        removeIsClearable
                        onChange={handleSelectChange}
                    />
                    {/* SIN NO */}
                    <div className="col-xl-2 col-md-4 col-12">
                        <Input
                            type="text"
                            // placeholder="Sin No"
                            lable={t("Sin No")}
                            id="SinNo"
                            name="SinNo"
                            value={formData.SinNo}
                            onChange={handleChange}
                        />
                    </div>


                    <div className="col-xl-2 col-md-4 col-12">
                        <Input
                            type="text"
                            lable={t("Visit Id")}
                            id="VisitId"
                            name="VisitId"
                            value={formData.VisitId}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-sm-2 col-md-1 col-6">
                        <ReactSelect
                            dynamicOptions={months}
                            name="month"
                            id="month"
                            removeIsClearable={false}
                            placeholderName={t("Current Month")}
                            value={formData?.month}
                            onChange={handleSelectChange}
                            className="required-fields"
                        />
                    </div>
                    <div className="col-sm-2 col-md-1 col-6">
                        <ReactSelect
                            dynamicOptions={years}
                            name="year"
                            id="year"
                            removeIsClearable={false}
                            placeholderName={t("Current year")}
                            value={formData?.year}
                            onChange={handleSelectChange}
                            className="required-fields"
                        />
                    </div>
                    <SearchButton
                        text="Search"
                        loading={loading}
                        onClick={fetchILCResults}
                        className="mx-2"
                    />
                    <CustomButton text="Reset" icon="refresh" onClick={handleReset} />
                </div>
                <Heading
                    title="ILC Result Entry Details"
                />
                <CustomTable
                    // loading={loading}
                    columns={columns}
                    data={tableData?.map((row, i) => ({
                        srNo: i + 1,
                        ...row,

                        select: (
                            <input
                                type="checkbox"
                                checked={row?.isSelected}
                                onChange={(e) =>
                                    handleRowChange(i, "isSelected", e.target.checked)
                                }
                                onClick={(e) => e.stopPropagation()}
                            />
                        ),

                        newValue: (
                            <input
                                className="form-control"
                                value={row.newValue || ""}
                                onChange={(e) =>
                                    handleRowChange(i, "newValue", e.target.value)
                                }
                            />
                        ),

                        newValue1: (
                            <input
                                className="form-control"
                                value={row.newValue1 || ""}
                                onChange={(e) =>
                                    handleRowChange(i, "newValue1", e.target.value)
                                }
                            />
                        ),

                        newdisplayreading: (
                            <input
                                className="form-control"
                                value={row.newdisplayreading || ""}
                                onChange={(e) =>
                                    handleRowChange(i, "newdisplayreading", e.target.value)
                                }
                            />
                        ),

                        newmethod: (
                            <input
                                className="form-control"
                                value={row.newmethod || ""}
                                onChange={(e) =>
                                    handleRowChange(i, "newmethod", e.target.value)
                                }
                            />
                        ),

                        status: (
                            <select
                                className="form-control"
                                value={row.status || ""}
                                onChange={(e) =>
                                    handleRowChange(i, "status", e.target.value)
                                }
                            >
                                <option value="">Select</option>
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                            </select>
                        ),

                        Remarks: (
                            <input
                                className="form-control"
                                value={row.Remarks || ""}
                                onChange={(e) =>
                                    handleRowChange(i, "Remarks", e.target.value)
                                }
                            />
                        ),

                        RCA: (<div className="remark-btn"
                            onClick={() =>
                                openAddRemark({
                                    type: "RCA",
                                    item: row,
                                })
                            }
                            style={{
                                backgroundColor: row.RCAType ? "green" : "darkred",
                                color: "white",
                            }}
                        >
                            <FaPlus color="white" size={8} />
                        </div>),

                        CorrectiveAction: (<div className="remark-btn"
                            onClick={() =>
                                openAddRemark({
                                    type: "CorrectiveAction",
                                    item: row,
                                })
                            }
                            style={{
                                backgroundColor: row.CAType ? "green" : "darkred",
                                color: "white",
                            }}
                        >
                            <FaPlus color="white" size={8} />
                        </div>),

                        PreventiveAction: (<div className="remark-btn"
                            onClick={() =>
                                openAddRemark({
                                    type: "PreventiveAction",
                                    item: row,
                                })
                            }
                            style={{
                                backgroundColor: row.PAType ? "green" : "darkred",
                                color: "white",
                            }}
                        >
                            <FaPlus color="white" size={8} />
                        </div>),

                        UploadFileName:  (<div className="remark-btn"
                            // onClick={() =>
                            //     openAddRemark({
                            //         type: "PreventiveAction",
                            //         item: row,
                            //     })
                            // }
                            style={{
                                backgroundColor: row.UploadFileName ? "green" : "darkred",
                                color: "white",
                            }}
                        >
                            <FaPlus color="white" size={8} />
                        </div>),
                    }))}
                />
                <CustomButton text="Save" icon="save" onClick={handleSave} />

                <Modal
                        Header={`${actionType} Remarks`}
                        setVisible={() => {
                          setRemark(false)
                          setActionType("");
                          setSelectedItemId('');
                        }
                        }
                        visible={remark}
                        children={<AddRemark
                          type={actionType}
                          qcType="ILC"
                          itemId={selectedItemId}
                          existingRemark={existingRemark}
                          onEqasAdd={handlePreventiveRemark}
                          onClose={() => {
                            setRemark(false)
                            // handleSearch();
                          }
                          }
                        />}
                        modalWidth={"45%"}
                      />
            </div>
        </>
    );
};

export default ILCResultEntry;
