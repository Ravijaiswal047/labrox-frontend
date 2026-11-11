import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Heading from "../../../../components/UI/Heading";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Input from "../../../../components/formComponent/Input";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { exportToExcel } from "../../../../utils/helpers";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../../../components/UI/CustomButton";
const POQuantityEditModal = ({
    show,
    handleClose,
    state,
}) => {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState([]);
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;


    const POQuantityEditModalAPI = async (id) => {
        await axiosInstance
            .post(`/POSearch/bindPOEditDetail`, {
                purchaseOrderID: state?.PurchaseOrderID,
            })
            .then((res) => {
                let data = res?.data?.message;
                let success = res?.data?.success;
                if (success) {
                    setTableData(data);
                } else {
                    toast.error(data ? data : "Something went wrong")
                }
            })
            .catch((err) => console.log("No Data Found"));
    };

    useEffect(() => {
        POQuantityEditModalAPI();
    }, []);

    const handleInputChange = (index, fieldName, value, UnitPrice) => {
        const updatedTableData = [...tableData];
        // updatedTableData[index] = {
        //     ...updatedTableData[index],
        //     [fieldName]: value,
        //     Amount: value*UnitPrice,

        // };
        updatedTableData[index][fieldName] = value;
        updatedTableData[index].NetAmount = value * UnitPrice;
        setTableData(updatedTableData);
    };

    const handleCheckboxSingle = (e, index) => {
        const { name, checked } = e.target;
        const datas = [...tableData];
        datas[index][name] = checked ? 1 : 0;
        setTableData(datas);

    };

    const SaveEditdata = () => {
        const items = tableData
            ?.filter((ele) => ele?.Print === 1)
            ?.map((item) => ({
                itemID: String(item?.ItemID),
                approvedQty: Number(item?.ApprovedQty),
                detailID: String(item?.PurchaseOrderDetailID),
                unitPrice: Number(item?.UnitPrice),
                indentNo: String(item?.IndentNo || ""),
                rowID: String(item?.RowID || "")
            }));
        if (!items.length) {
            toast.error("Please select at least one row");
            return;
        }
        axiosInstance
            .post(`/POSearch/POEdit`, {
                items,
                purchaseOrderID: String(state?.PurchaseOrderID)

            })
            .then((res) => {
                let data = res?.data?.message;
                let success = res?.data?.success;
                if (success) {
                    toast.success(data);
                    handleClose()
                } else {
                    toast.error(data ? data : "Something went wrong")
                }
            })
            .catch((err) => console.log("No Data Found"));
    }

    return (
        <>
            <Dialog
                header={t("Purchase Order Edit")}
                visible={show}
                top={"25%"}
                className={theme}
                onHide={handleClose}
                style={{
                    width: isMobile ? "30vw" : "80vw",
                }}
            >
                <div className="card mt-2">
                    <div className="row">
                        <div className="col-sm-12">

                            <Tables>
                                <thead>
                                    <tr>
                                        <th>{t("Sr. No")}</th>
                                        <th>{t("Item Name")}</th>
                                        <th>{t("Machine Name")}</th>
                                        <th>{t("Manufacture Name")}</th>
                                        <th>{t("PackSize")}</th>
                                        <th>{t("CatalogNo")}</th>
                                        <th>{t("Purchase Unit")}</th>
                                        <th>{t("Qty.")}</th>
                                        <th>{t("UnitPrice")}</th>
                                        <th>{t("Amount")}</th>
                                        <th>{t("GRN Qty.")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData?.map((row, index) => (
                                        <tr key={index}>
                                            <td data-title={t("Sr. No")}>

                                                {index + 1}
                                                <input
                                                    type="checkbox"
                                                    checked={row?.Print == 1 ? true : false}
                                                    name="Print"
                                                    onChange={(e) =>
                                                        handleCheckboxSingle(e, index)
                                                    }
                                                />
                                            </td>
                                            <td data-title={t("Item Name")}>{row?.ItemName}</td>
                                            <td data-title={t("Machine Name")}>{row?.MachineName}</td>
                                            <td data-title={t("Manufacture Name")}>{row?.ManufactureName}</td>
                                            <td data-title={t("PackSize")}>{row?.PackSize}</td>
                                            <td data-title={t("CatalogNo")}>{row?.CatalogNo}</td>
                                            <td data-title={t("Purchase Unit")}>{row?.MajorUnitName}</td>
                                            <td data-title={t("Qty.")}>
                                                <input
                                                    placeholder="Qty"
                                                    type="number"
                                                    className="form-control"
                                                    value={row?.ApprovedQty || 0}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, "");
                                                        handleInputChange(
                                                            index,
                                                            "ApprovedQty",
                                                            value,
                                                            row?.UnitPrice
                                                        );
                                                    }}
                                                />
                                            </td>
                                            <td data-title={t("UnitPrice")}>{row?.UnitPrice}</td>
                                            <td data-title={t("Amount")}>{row?.NetAmount}</td>
                                            <td data-title={t("GRN Qty.")}>{row?.GRNQty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    </div>
                    <div className="center">
                        <CustomButton
                            text={"Save"}
                            onClick={SaveEditdata}
                        />

                    </div>

                </div>
            </Dialog>
        </>
    );
};

export default POQuantityEditModal;
