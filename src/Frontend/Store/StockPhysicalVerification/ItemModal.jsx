
import React, { use, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../../../utils/hooks/useLocalStorage';
import Heading from '../../../components/UI/Heading';
import { Dialog } from "primereact/dialog";
import Tables from '../../../components/UI/customTable';
import Input from "../../../components/formComponent/Input";
import { CustomButton } from '../../../components/UI/CustomButton';
import { axiosInstance } from '../../../utils/axiosInstance';
import { toast } from 'react-toastify';

function ItemModal({ show, onHandleShow, locationid,onAddItems  }) {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    const [selectedItems, setSelectedItems] = useState([]);

    const [payload, setPayload] = useState({
        ItemCode: "",
        ItemName: "",
    });
    const [table, setTable] = useState([]);
    const handleCheckboxChange = (e, itemID) => {
        if (e.target.checked) {
            setSelectedItems((prev) => [...prev, itemID]);
        } else {
            setSelectedItems((prev) => prev.filter((id) => id !== itemID));
        }
    };

    const handleAdd = () => {
    if (selectedItems.length === 0) {
        toast.error("Please select at least one item");
        return;
    }

    console.log("Sending to parent:", selectedItems);

    onAddItems(selectedItems);   // ✅ yaha parent ko bhej diya

    onHandleShow(); // modal close
};
    useEffect(() => {
        if (locationid)
            getdata();
    }, [locationid])

    const getdata = () => {
        debugger
        axiosInstance.post(`StockPhysicalVerification/checkduplicatebatchno`, { LocationId: locationid })
            .then((res) => {
                const response = res?.data?.message;
                setTable(response);
                toast.success("Data fetched successfully");
            })
            .catch((err) => {
                console.log("Something went wrong", err);
                toast.error(err?.response?.data?.message || "Error fetching data");
            });
    };

    const filteredTable = payload.ItemName
        ? table?.filter((item) =>
            item.typeName
                ?.toLowerCase()
                .includes(payload.ItemName.toLowerCase())
        )
        : table;

    return (
        <>
            <Dialog
                header={t("Item Details")}
                visible={show}
                className={theme}
                onHide={onHandleShow}
                style={{ width: isMobile ? "30vw" : "100vw" }}>
                <div className="p-4">
                    <Heading title={t("Item Details")} />
                    <div className="row">
                        <div className="col-sm-12">
                            <Tables>
                                <thead>
                                    <tr>
                                        <th>{t("#")}</th>
                                        <th>{t("Check")}</th>
                                        <th>{t("Item Type")}</th>
                                        <th>
                                            <Input
                                                type="text"
                                                name="ItemName"
                                                lable={t("Item Name")}
                                                value={payload?.ItemName}

                                                onChange={(e) => setPayload({ ...payload, ItemName: e.target.value })}
                                            />
                                            {/* {t("Item Name")} */}
                                        </th>
                                        <th>{t("Item Id")}</th>
                                        <th>{t("Converter")}</th>
                                        <th>{t("Location State")}</th>
                                        <th>{t("Supplier State")}</th>
                                        <th>{t("Rate")}</th>
                                        <th>{t("Discount(%)")}</th>
                                        <th>{t("Discount Amount")}</th>
                                        <th>{t("IGST(%)")}</th>
                                        <th>{t("CGST(%)")}</th>
                                        <th>{t("SGST(%)")}</th>
                                        <th >{t("Tax Amt")}</th>
                                        <th>{t("Unit Price")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTable?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.itemID)}
                                                    onChange={(e) => handleCheckboxChange(e, item.itemID)}
                                                />
                                            </td>
                                            <td>{item.itemGroup}</td>
                                            <td>{item.typeName}</td>
                                            <td>{item.itemID}</td>
                                            <td>{item.converter}</td>
                                            <td>{item.deliveryStateName}</td>
                                            <td>{item.vendorStateName}</td>
                                            <td>{item.rate}</td>
                                            <td>{item.discountPer}</td>
                                            <td>{item.discountAmt}</td>
                                            <td>{item.igstPer}</td>
                                            <td>{item.cgstPer}</td>
                                            <td>{item.sgstPer}</td>
                                            <td>{item.taxAmount}</td>
                                            <td>{item.unitPrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-sm-2 d-flex">
                            <CustomButton
                                text="Add"
                                icon="Add"
                                className="btn btn-sm btn-success mr-2"
                                onClick={handleAdd}
                            />
                            <CustomButton
                                text="Close"
                                icon="Close"
                                className="btn btn-sm btn-success mr-2"
                                onClick={() => onHandleShow()}
                            >
                                {t("More Filters")}
                            </CustomButton>
                        </div>
                    </div>
                </div>

            </Dialog>
        </>
    )
}

export default ItemModal
