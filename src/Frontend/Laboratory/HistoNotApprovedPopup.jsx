import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";


import Input from "../../components/formComponent/Input";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const HistoNotApprovedPopup = ({ tempSave, setTempSave, getTemplateHisto }) => {
const [tempSaveData, setTempSaveData] = useState({
    TempType: tempSave?.TempType,
    TempText: tempSave?.TempText,
    TempName: ""
  })

const [tempErr, setTempErr] = useState("")

    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const handleSubmit = () => {
        if(!tempSaveData.TempName){
            setTempErr("This field is required");
            return;
        }
        setTempErr("")
        axiosInstance
            .post("HistoCyto/SaveDataAsTemplate", {
                TemplateData:tempSaveData.TempText ,
                Type: String(tempSaveData.TempType),
                TemplateName: tempSaveData.TempName,
            })
            .then((res) => {
                console.log(res.data)
                getTemplateHisto()
                handleClose()
                setTempSaveData({
                    ...tempSaveData,
                    TempText:""
                })
            })
            .catch((err) => {
                console.log(err)
            })
    }
    const handleClose = () => {
        setTempSave({ ...tempSave, flag: false });
    }

    const handleTempName =(e)=>{
        setTempSaveData({
            ...tempSaveData,
            TempName: e.target.value,
        })
    }
    return (
        <>
            <Dialog
                visible={tempSave?.flag}
                header="Save Data as Template"
                onHide={handleClose}
                top={"25%"}
                className={theme}
            >
                <>
                <div className="mx-4 my-3">
                    <div className="row">
                        <label className="mr-4">Template Type </label>
                        <Input
                        type="text"
                        name="Template Type"
                        // lable="Template Type"
                        placeholder=""
                        value={tempSave.TempType}
                        disabled                      
                        // onChange={}
                        />                
                    </div>
                    <div className="row">
                        <label className="mr-3">Template Name </label>
                        <Input
                        type="text"
                        name="Template Name"
                        // id="VisitNo"
                        // lable="Template Name"
                        placeholder=""
                        className="required-fields"
                        onChange={handleTempName}

                        />                
                    </div>
                    {tempErr && (
                        <div className="error-message" style={{ color: "red" }}>
                            {tempErr}
                        </div>
                    )}

                </div>
                    <div className="row w-100">
                        <div className="col-sm-6">
                            <button
                                type="submit"
                                className="btn btn-success btn-block btn-sm"
                                onClick={handleSubmit}
                            >
                                {t("Save")}
                            </button>
                        </div>
                        <div className="col-sm-6">
                            <button
                                className="btn btn-danger btn-block btn-sm"
                                onClick={handleClose}
                            >
                                {t("Close")}
                            </button>
                        </div>
                    </div>
                </>
            </Dialog>
        </>
    );
};

export default HistoNotApprovedPopup;
