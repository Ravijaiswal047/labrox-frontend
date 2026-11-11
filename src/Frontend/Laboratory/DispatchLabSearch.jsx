import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Heading from '../../components/UI/Heading';
import { ExportToExcel, shouldIncludeAIIMSID } from '../../utils/helpers';
import { SearchBy } from '../../utils/Constants';
import ReactSelect from '../../components/formComponent/ReactSelect';
import DatePicker from '../../components/formComponent/DatePicker';
import Accordion from "@app/components/UI/Accordion";
import { axiosInstance } from '../../utils/axiosInstance';
import { SearchButton } from '../../components/UI/CustomButton';
import { SelectBox } from '../../components/formComponent/SelectBox';
import Input from '../../components/formComponent/Input';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import NoRecordFound from '../../components/formComponent/NoRecordFound';
import Tables from '../../components/UI/customTable';
import excelIcon from "../../assets/image/excelIcon.png";

const DispatchLabSearch = () => {
    const { t } = useTranslation()
    const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
    const [centreOptions, setCentreOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [formData, setFormData] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        CentreID: "",
        SelectTypes: "",
        ItemValue: "",
        Datatype: "",
    });

    const getCentreOptions = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            if (res?.data?.success) {
                const mapped = res?.data?.message?.map((item) => ({
                    label: item?.Centre,
                    value: item?.CentreID,
                }))
                setCentreOptions(mapped);
            } else {
                setCentreOptions([]);
            }
        } catch (error) {

        }
    }

    useEffect(() => {
        getCentreOptions();
    }, []);


    const handleSelectChange = (event) => {
        const { name, value, checked, type } = event?.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearchSelectChange = (label, value) => {
        setFormData({ ...formData, [label]: value?.value });
    };

    const handleDateChange = (value, name) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleKeyDown = (e) => {
        if (e?.key === "Enter") {
            handleSearch();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };



    const datatypeOptions = [
        { label: "Dispatch Date", value: "DispatchDate" },
        { label: "Approved Date", value: "ApprovedDate" },
        { label: "Registration Date", value: "RegistrationDate" },
    ]

    const handleSearch = async () => {
        const finalPayload = {
            selectTypes: formData.SelectTypes,
            itemValue: formData.ItemValue,
            fromDate: formData.FromDate,
            toDate: formData.ToDate,
            dataType: formData.Datatype,
            centreID: formData.CentreID,
            testIds: []
        }

        try {
            setLoading(true)
            const res = await axiosInstance.post("Dispatch/GetDispatchLogReport", finalPayload);
            if (res?.data?.success && Array.isArray(res?.data?.message)) {
                setTableData(res?.data?.message)
            } else {
                setTableData([])
            }
            setLoading(false)
        } catch (error) {
            console.log("Error while searching dispatch lab", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Heading
                name={t("Dispatch Log Search")}
                defaultValue={true}
                linkTo="#"
                isBreadcrumb={true}
                linkTitle={
                    <div className="link-title-container" id="pr_id_11">
                        <div className="link-title-item">
                            {t("Total Patient") + " : " + ""}
                        </div>
                        <div className="link-title-item">
                            {/* {t("Total Test Count") + " : " + totalCount || testCount} */}
                            {t("Total Test Count") + " : " + ""}
                        </div>
                    </div>
                }
            />
            <Accordion className={'remove_bgShadow'} title={t("Dispatch Report Details")} defaultValue={"true"}>
                <div className="row pt-2 pl-2 pr-2">
                    <div className="col-sm-2">
                        <div className="d-flex" style={{ display: "flex" }}>
                            <div style={{ width: "40%" }}>
                                <SelectBox
                                    options={[
                                        ...SearchBy,
                                        ...(shouldIncludeAIIMSID()
                                            ? [
                                                { label: "AIIMSID", value: "AIIMSID" },
                                                { label: "CrNo", value: "CrNo" },
                                            ]
                                            : []),
                                    ]}
                                    id="SelectTypes"
                                    lable="SelectTypes"
                                    selectedValue={formData.SelectTypes}
                                    name="SelectTypes"
                                    onChange={handleSelectChange}
                                    // isDisabled={User}
                                    className={`${CompanyID == 369 ? "required-fields" : ""}`}
                                />
                            </div>
                            {/* {ShowAllCheckBarcodeOption == 1 && formData.SelectTypes === "BarcodeNo" &&
                                <>
                                    <Tooltip target="#ShowAllCheckBarcodeOption" content={t("ShowAllCheckBarcodeOption")} position="top" />
                                    <Form.Check
                                        type="checkbox"
                                        label=""
                                        id="ShowAllCheckBarcodeOption"
                                        checked={!!checkBarcodeOption}
                                        onChange={handleToggleChange}
                                        className="cursor-pointer"
                                    />
                                </>} */}
                            <div style={{ width: "50%" }}>
                                {formData?.SelectTypes === "Mobile" ? (
                                    <div style={{ width: "100%" }}>
                                        <Input
                                            type="number"
                                            name="ItemValue"
                                            max={10}
                                            value={formData.ItemValue}
                                            onKeyDown={handleKeyDown}
                                            onChange={handleChange}
                                            onInput={(e) => number(e, 10)}
                                            // disabled={User}
                                            autocomplete="off"
                                            className={`${CompanyID == 369 ? "required-fields" : ""}`}
                                        />
                                        {/* {errors?.ItemValue && (
                                            <div className="error-message">{errors?.ItemValue}</div>
                                        )} */}
                                    </div>
                                ) : (
                                    <div style={{ width: "100%" }}>
                                        <Input
                                            type="text"
                                            name="ItemValue"
                                            max={20}
                                            onKeyDown={handleKeyDown}
                                            value={formData.ItemValue}
                                            onChange={handleChange}
                                            // disabled={User}
                                            autocomplete="off"
                                            className={`${CompanyID == 369 ? "required-fields" : ""}`}
                                        />
                                        {/* {errors?.ItemValue && (
                                            <div className="error-message">{errors?.ItemValue}</div>
                                        )} */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-2 col-12">
                        <ReactSelect
                            dynamicOptions={datatypeOptions}
                            name="Datatype"
                            lable={t("Data Type")}
                            id="Datatype"
                            removeIsClearable={true}
                            placeholderName={t("Data Type")}
                            value={formData?.Datatype}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-sm-2 col-12">
                        <ReactSelect
                            dynamicOptions={centreOptions}
                            name="CentreID"
                            lable={t("Centre")}
                            id="CentreID"
                            removeIsClearable={true}
                            placeholderName={t("Centre")}
                            value={formData?.CentreID}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={formData?.FromDate}
                            onChange={handleDateChange}
                            placeholder=" "
                            id="FromDate"
                            lable="FromDate"
                            maxDate={new Date(formData?.ToDate)}
                            // disabled={User}
                        />
                    </div>
                    <div className="col-sm-2">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={formData?.ToDate}
                            onChange={handleDateChange}
                            placeholder=" "
                            id="ToDate"
                            lable="ToDate"
                            maxDate={new Date(formData?.FromDate)}
                            // disabled={User}
                        />
                    </div>
                    <div className='col-sm-auto'>
                        <SearchButton
                            text={"Search"}
                            onClick={handleSearch} />
                    </div>
                    <div className="icon_wrapper mb-2" aria-disabled={tableData.length === 0}>
                        <img
                            onClick={() => tableData.length > 0 && ExportToExcel(tableData, "Dispatch_Lab_Search.xlsx")}
                            width={24}
                            height={24}
                            src={excelIcon}
                            alt="excel_icon"
                            style={{
                            cursor: tableData.length > 0 ? "pointer" : "not-allowed",
                            }}
                        />
                        </div>

                </div>
            </Accordion>
            <Accordion
               className={'remove_bgShadow'} 
               title={t("Search Data")}
                defaultValue={"true"}  
            >
                {tableData.length > 0 ? (
                    <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("VisitNo")}</th>
                    <th>{t("BarcodeNo")}</th>
                    <th>{t("DepartmentName")}</th>
                    <th>{t("TestName")}</th>
                    <th>{t("Dispatched")}</th>
                    <th>{t("Dispatch Info")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.VisitNo}</td>
                      <td>{item.BarcodeNo}</td>
                      <td>{item.DepartmentName}</td>
                      <td>{item.ItemName}</td>
                      <td>{item.IsDispatch === 1 ? "Yes" : "No"}</td>
                      <td>{`${item.DispatchByName} | ${item.dtDispatch || ""}`}</td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
                ) : (
                    <NoRecordFound />
                )}
            </Accordion>
        </>
    )
}

export default DispatchLabSearch