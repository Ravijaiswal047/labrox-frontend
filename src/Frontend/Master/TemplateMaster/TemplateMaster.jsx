import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../../components/formComponent/Input";
import { SelectBox } from "../../../components/formComponent/SelectBox";
import FullTextEditor from "../../../components/formComponent/TextEditor";
import Loading from "../../../components/loader/Loading";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { CustomButton } from "../../../components/UI/CustomButton";
import { Form } from "react-bootstrap";

const TemplateMaster = () => {
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();
    const [HistoData, setHistoData] = useState([]);
    const [load, setLoad] = useState(false);
    const [Editable, setEditable] = useState(false);
    const [Editor, setEditor] = useState("");
    const [isUpdateExist, setIsUpdateExist] = useState(false);
    const [editorKey, setEditorKey] = useState(0);
    const { ShowDefaultLoginCentre, DefaultCentre } = useLocalStorage("userData", "get");
    const [payload, setPayload] = useState({
        HistoTemplate: "",
        Interpretation: "",
        id: 0,
        Name: "",
        isActive: 0
    });
    const { t } = useTranslation();


    const urlApi = !payload?.HistoTemplate
        ? "HistoCyto/SaveTemplate"
        : "HistoCyto/UpdateTemplate";

    const SaveInterpretion = () => {
        const data = {
            template_Name: payload?.Name,
            gross: Editor,
            id: payload?.id,
            isActive: payload?.isActive
        };
        axiosInstance
            .post(urlApi, data)
            .then((res) => {
                if (res.data.message) {
                    toast.success(res.data.message);
                    setEditable(false);
                    setEditor("");
                    setPayload({
                        HistoTemplate: "",
                        Interpretation: "",
                        id: 0,
                        Name: "",
                        isActive: 0
                    });
                    setEditorKey(prev => prev + 1);
                    getTemplate();

                } else {
                    toast.error(res.data.message || "Something went wrong");
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Error occurred");
            });
    };


    const handleSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setPayload({
            ...payload,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        });
    };

    // useEffect(() => {
    //     setPayload({ ...payload, Interpretation: Editor });
    // }, [Editor]);

    useEffect(() => {
        setPayload((prev) => ({
            ...prev,
            Interpretation: Editor
        }));
    }, [Editor]);

    const getTemplate = (isGrossing) => {
        axiosInstance
            .post(`HistoCyto/UseTemplateHisto?isGrossing=${isGrossing}`)
            .then((res) => {
                const data = res?.data?.message || [];
                const HistoData = data.map((ele) => ({
                    value: ele.Template_ID,
                    label: ele.Template_Name,
                }));
                setHistoData(HistoData);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        getTemplate(false);
    }, []);

    const getTemplateData = () => {
        axiosInstance
            .post(`HistoCyto/GetTemplateDetail?TemplateId=${payload?.HistoTemplate}`)
            .then((res) => {
                const data = res?.data?.message || {};
                setPayload((prev) => ({
                    ...prev,
                    Name: data?.Template_Name,
                    id: data?.Template_ID,
                    isActive: data?.IsActive
                }));
                setEditor(data?.Gross);
                setEditable(true);
            })
            .catch((err) => {
                console.log(err);
            });
    };
    useEffect(() => {
        if (payload?.HistoTemplate) {
            getTemplateData();
        }
    }, [payload?.HistoTemplate]);


    const Reset = () => {
        setPayload({
            HistoTemplate: "",
            Interpretation: "",
            id: 0,
            Name: "",
            isActive: 0
        });
        setEditor("");
        setEditable(false);
        setEditorKey(prev => prev + 1);

    };

    return (
        <>
            <Accordion
                name={"Histo Template"}
                defaultValue={true}
                isBreadcrumb={true}
                notOpen={true}
            >
                <div className="row pt-2 pl-2 pr-2">
                    <div className="col-sm-2">
                        <ReactSelect
                            name="HistoTemplate"
                            id="HistoTemplate"
                            removeIsClearable={true}
                            dynamicOptions={HistoData}
                            placeholderName={t("Histo Template")}
                            value={payload?.HistoTemplate}
                            onChange={handleSelectChange}

                        />
                    </div>

                </div>
                <Accordion
                    name={"Template Name and Header"}
                    defaultValue={true}
                    isBreadcrumb={true}
                ></Accordion>
                <div className="row pt-2 pl-2 pr-2">
                    <div className="col-sm-2">
                        <Input
                            placeholder=" "
                            lable="Template"
                            id="Name"
                            value={payload?.Name}
                            name="Name"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-xs-1 col-sm-1 mt-1">
                        <Form.Check
                            type="switch"
                            id="isActive"
                            name="isActive"
                            label={t("Active")}
                            onChange={handleChange}
                            checked={payload?.isActive}
                        />
                    </div>
                    <div className="col-sm-12">
                        <FullTextEditor
                            key={editorKey}
                            value={Editor}
                            setValue={setEditor}
                            EditTable={Editable}
                            setEditTable={setEditable}
                        />
                    </div>
                </div>
                <div className="row pt-2 pl-2 pr-2 pb-2">
                    <div className="col-sm-1">
                        {load && payload?.HistoTemplate ? (
                            <Loading />
                        ) : (
                            <CustomButton
                                text={payload?.HistoTemplate ? t("Update") : t("Save")}
                                icon={payload?.HistoTemplate ? "Edit" : "Save"}
                                className="btn btn-block btn-success btn-sm "
                                onClick={SaveInterpretion}
                            />
                        )}
                    </div>
                    <div className="col-sm-1">
                        <CustomButton
                            text={t("Reset")}
                            icon="Refresh"
                            className="btn btn-block btn-success btn-sm "
                            onClick={Reset}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default TemplateMaster;
