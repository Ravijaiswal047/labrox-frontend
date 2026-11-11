
import { useEffect, useState } from 'react'
import Heading from '../../../../components/UI/Heading'
import { BindReportControlsAPI, GetConfigurationFinance, UpdateConfiguration } from '../../../../NetworkServices/finance.js'
import { useTranslation } from 'react-i18next';
import Tables from '../../../../components/UI/customTable';
import CustomSelect from '../../../../components/formComponent/CustomSelect';
import { notify } from '../../../../utils/ustil2';
import { filterByTypes } from '../../../utils/Utils';
import HisTable from '../../../../components/UI/customTable/HisTable';

export default function FinanceMasterConfiguration() {
    const [t] = useTranslation();
    const [tableData, setTableData] = useState([]);
    const [dropDownState, setDropDownState] = useState({ cartOfGroup: [], chartOfAccount: [] });
    const thead = [
        { name: t("S.No."), width: "1%" },
        { name: t("Type Name"), width: "20%" },
        { name: t("Group Type"), width: "20%" },
        { name: t("Cart Of Group"), width: "20%" },
        { name: t("COA Req"), width: "2%" },
        { name: t("Chart Of Account"), width: "20%" },
        { name: t("Status"), width: "2%" },
    ]

    async function fetchData() {
        // debugger
        const [configurationData, reportControlData] = await Promise.all([GetConfigurationFinance(), BindReportControlsAPI()]);
        if (configurationData?.success) {
            setTableData(configurationData?.data)
        }
        if (reportControlData?.success) {
            setDropDownState((val) => ({ ...val, cartOfGroup: filterByTypes(reportControlData?.data, [3], ["TypeID"], "TextField", "ValueField", "PrintOrder"), chartOfAccount: filterByTypes(reportControlData?.data, [10], ["TypeID"], "TextField", "ValueField", "GroupCode") }))
        }
    }

    useEffect(() => {
        fetchData();
    }, [])
    const handleCustomSelect = (index, name, e) => {
        const data = [...tableData];
        data[index][name] = e?.value;
        setTableData(data);
    }

    const handleSave = async () => {
        let payload = []
        for (const [index, val] of tableData?.entries()) {
            if (!val?.COGCode) {
                notify(`Please select cart of group for ${val?.TypeName} In Row ${index + 1}`, "error");
                handleCustomSelect(index, "colorcode", { value: "#f44d4d" })
                return;
            } else if (!val?.COAID && val?.IsCOARequired === 1) {
                notify(`Please select chart of account for ${val?.TypeName} In Row ${index + 1}`, "error");
                handleCustomSelect(index, "colorcode", { value: "#f44d4d" })
                return
            }
            payload.push({
                "id": Number(val?.ID),
                "groupTypeID": String(val?.GroupTypeID||0),
                "isCOARequired": String(val?.IsCOARequired||0),
                "cogCode": String(val?.COGCode||0),
                "coaid": String(val?.COAID||0)
            })
        }
        
        const apiResp = await UpdateConfiguration(payload)
        if(apiResp?.success){
            notify(apiResp?.message, "success");
            fetchData();
        }else{
            notify(apiResp?.message, "error");
        }
    }

    return (
        <div className='card pt-2'>
            <Heading isBreadcrumb={true} 
                name={t("Finance Master Configuration")}/>
            <HisTable style={{ maxHeight: "60vh" }} thead={thead} tbody={tableData?.map((val, index) => ({
                "S.No.": index + 1,
                "Type": val?.TypeName,
                colorcode: val?.colorcode,
                "Group Type": val?.GroupName,
                "Cart Of Group": (<>
                    <CustomSelect
                        option={dropDownState?.cartOfGroup?.filter((item) => Number(item?.extraColomn[0]) === Number(val?.GroupTypeID))}
                        placeHolder={t("Cart Of Group")}
                        value={`${val?.COGCode}`}
                        name="COGCode"
                        onChange={(name, e) => handleCustomSelect(index, name, e)}
                    />
                </>),
                "COA Required": val?.IsCOARequired === 1 ? "Yes" : "No",
                "Chart Of Account": (<>
                    {val?.IsCOARequired === 1 && <CustomSelect
                        option={dropDownState?.chartOfAccount?.filter((item) => Number(item?.GroupCode) === Number(val?.COGCode))}
                        placeHolder={t("Chart Of Account")}
                        value={String(val?.COAID)}
                        name="COAID"
                        onChange={(name, e) => handleCustomSelect(index, name, e)}
                    />
                    }
                </>),
                "Status": (<>
                    <CustomSelect
                        option={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]}
                        placeHolder={t("Status")}
                        value={`${val?.IsActive}`}
                        name="IsActive"
                        onChange={(name, e) => handleCustomSelect(index, name, e)}
                    />
                </>),
            }))} />

            <div className='d-flex justify-content-end p-2'>
                <button className='btn btn-primary px-3' onClick={handleSave}>{t("Save")}</button>
            </div>

        </div>
    )
}
