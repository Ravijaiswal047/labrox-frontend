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
const ShowItemDetailsPOModal = ({
    show,
    handleClose,
    state,
}) => {
    const { t } = useTranslation();
    const [tableData, setTableData] = useState([]);
    const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;


    const ShowItemDetailsPOModalAPI = async (id) => {
        await axiosInstance
            .get(`/POSearch/bindPODetail?purchaseOrderId=${state?.PurchaseOrderID}`)
            .then((res) => {
                let data = res?.data?.message;
                let success = res?.data?.success;
                if (success) {
                    setTableData(data);
                } else {
                    toast.error(data ? data : "No data found")
                }
            })
            .catch((err) => console.log("No Data Found"));
    };

    useEffect(() => {
        ShowItemDetailsPOModalAPI();
    }, []);
    return (
        <>
            <Dialog
                header={t("Item Detail")}
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
                                        <th>{t("Item Name")}</th>
                                        <th>{t("Manufacture Name")}</th>
                                        <th>{t("Machine Name")}</th>
                                        <th>{t("Ord. Qty.")}</th>
                                        <th>{t("Ord. Free Qty.")}</th>
                                        <th>{t("Chk. Qty.")}</th>
                                        <th>{t("Chk. Free Qty.")}</th>
                                        <th>{t("App. Qty.")}</th>
                                        <th>{t("App. Free Qty.")}</th>
                                        <th>{t("UnitPrice")}</th>
                                        <th>{t("Disc.(%)")}</th>
                                        <th>{t("Net Amt.")}</th>
                                        <th>{t("Vendor Comment")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData?.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row?.ItemName}</td>
                                            <td>{row?.ManufactureName}</td>
                                            <td>{row?.MachineName}</td>
                                            <td>{row?.OrderedQty}</td>
                                            <td>{row?.OrderedFreeQty}</td>
                                            <td>{row?.CheckedQty}</td>
                                            <td>{row?.CheckedFreeQty}</td>
                                            <td>{row?.ApprovedQty}</td>
                                            <td>{row?.ApprovedFreeQty}</td>
                                            <td>{row?.UnitPrice}</td>
                                            <td>{row?.DiscountPercentage}</td>
                                            <td>{row?.NetAmount}</td>
                                            <td>{row?.VendorCommentItem}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default ShowItemDetailsPOModal;
