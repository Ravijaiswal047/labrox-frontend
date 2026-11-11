import { useTranslation } from "react-i18next";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { useEffect, useState } from "react";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { Form } from "react-bootstrap";
import { CustomButton, EditButton } from "../../components/UI/CustomButton";

const AllergyGroupMapping = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [allergyData, setAllergyData] = useState([]);

    const { state } = location;

    const getAllergyGroupMapping = async () => {
        await axiosInstance
            .post(apiUrls.SearchInvestigationAllergy, {
                investigationID: state?.InvestigationID || 0,
            })
            .then((res) => {
                console.log("res get", res);
                if (res?.data?.success) {
                    setAllergyData(res?.data?.data || []);
                }
                else {
                    setAllergyData([]);
                }
            })
            .catch((err) => {
                console.log("err", err);
                setAllergyData([]);
            });
    };

    const handleToggleChange = (allergyGroupID, field) => {
        setAllergyData(prevData =>
            prevData?.map(item =>
                item?.AllergyGroupID === allergyGroupID
                    ? {
                        ...item,
                        [field]: item[field] === 1 ? 0 : 1
                    }
                    : item
            )
        );
    };

    const handleUpdate = async () => {

        const payload = {
            investigationID: state?.InvestigationID,
            allergyGroups: allergyData?.map(item => ({
                allergyGroupID: item?.AllergyGroupID || 0,
                isShow: item?.IsShow,
                isMandatory: item?.IsMandatory
            }))
        };

        console.log("Payload:", payload);

        try {
            const res = await axiosInstance.post(
                apiUrls.SaveInvestigationAllergyGroups,
                payload
            );
            if (res?.data?.success) {
                toast.success(res?.data?.message || "Updated successfully");
                getAllergyGroupMapping();
            } else {
                toast.error(res?.data?.message || "Update failed");
            }
        } catch (err) {
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        getAllergyGroupMapping();
    }, []);

    return (
        <div>
            <Accordion
                name={t("Allergy Group Mapping")}
                defaultValue={true}
                isBreadcrumb={true}
                linkTo={'#'}
                linkTitle={
                state?.InvestigationID && (
                <div style={{marginRight:'auto'}} id="pr_id_11" className="link-title-container d-none d-md-flex mx-3">
                    <p className="mb-0"><strong>TestName</strong>: {state?.TestName || state?.data || ""}</p> | 
                    <p className="mb-0"><strong>TestCode</strong>: {state?.TestCode || ""}</p> | 
                    <p className="mb-0"><strong>ID</strong> : {state?.InvestigationID || ""}</p> 
                    {/* <p className="mb-0"><strong>DataType</strong> : {invDetails?.DataType}</p> |
                    <p className="mb-0"><strong>Created By</strong> : {invDetails?.CreatedByName}</p> |
                    <p className="mb-0"><strong>Created on</strong> : {invDetails?.dtEntry}</p> */}
                </div>
                )}
            >
                <div className="row pt-2 pl-2 pr-2 mb-2 d-flex align-items-center">

                    <div className="mx-2">
                        <EditButton text="Update" onClick={handleUpdate} className="rounded-15"/>
                        {/* <button className="btn btn-block btn-primary"
                            onClick={handleUpdate}
                        >
                            {t("Update")}
                        </button> */}
                    </div>

                    {/* Back Button */}
                    <div className="">
                        {state?.flag ? (
                            <Link
                                to="/Investigations"
                                state={{
                                    other: {
                                        button: "Update",
                                        pageName: "Edit",
                                        showButton: true,
                                    },
                                    url1: `Investigations/EditInvestigation?id=${state?.InvestigationID}&DataType=${state?.dataType}`,
                                    url: "Investigations/UpdateInvestigation",
                                }}
                            >
                                <CustomButton text="Back" icon="back" className="rounded-15"/>
                                {/* <span className="btn btn-block btn-primary btn-sm">
                                    {t("Back")}
                                </span> */}
                            </Link>
                        ) : (
                            // <button
                            //     className="btn btn-block btn-primary btn-sm"
                            //     onClick={() => navigate(-1)}
                            // >
                            //     {t("Back")}
                            // </button>
                            <CustomButton text="Back" icon="back" onClick={() => navigate(-1)}
                            className="rounded-15"
                            />
                        )}
                    </div>

                </div>
                <div className="">
                    {allergyData?.length > 0 ? (
                        <Tables>
                            <thead className="cf">
                                <tr>
                                    <th>{t("S.No")}</th>
                                    <th>{t("Allergy Group")}</th>
                                    <th>{t("Show")}</th>
                                    <th>{t("Mandatory")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {allergyData?.map((item, index) => (
                                    <tr key={item?.AllergyGroupID}>
                                        <td data-title={t("S.No")}>{index + 1}</td>

                                        <td data-title={t("Allergy Group")}>
                                            {item?.AllergyGroupName}
                                        </td>

                                        {/* SHOW TOGGLE */}
                                        <td data-title={t("Show")}>
                                            <Form.Check
                                                type="switch"
                                                name="IsShow"
                                                id={`IsShow-${item?.AllergyGroupID}`}
                                                checked={item?.IsShow === 1}
                                                // onChange={handleChange}
                                                onChange={() =>
                                                    handleToggleChange(item?.AllergyGroupID, "IsShow")
                                                }
                                            />
                                        </td>

                                        {/* MANDATORY TOGGLE */}
                                        <td data-title={t("Mandatory")}>
                                            <Form.Check
                                                type="switch"
                                                name="IsMandatory"
                                                id={`IsMandatory-${item?.AllergyGroupID}`}
                                                checked={item?.IsMandatory === 1}
                                                // onChange={handleChange}
                                                onChange={() =>
                                                    handleToggleChange(item?.AllergyGroupID, "IsMandatory")
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    ) : (
                        <NoRecordFound />
                    )}
                </div>

            </Accordion>
            {/* <Accordion
                title={t("Allergy Group Mapping Data")}
                defaultValue={true}
                isBreadcrumb={false}
            > */}

                {/* Placeholder for future Rate Type Mapping content */}

                
                <div className="row mt-2">

                </div>
            {/* </Accordion> */}

        </div>
    );
};

export default AllergyGroupMapping;
