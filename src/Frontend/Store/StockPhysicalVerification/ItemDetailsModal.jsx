import React, { use, useEffect, useState } from 'react'
import { axiosInstance } from '../../../utils/axiosInstance';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../../../utils/hooks/useLocalStorage';
import { Dialog } from "primereact/dialog";
import Input from '../../../components/formComponent/Input';
import ReactSelect from '../../../components/formComponent/ReactSelect';
import { CustomButton } from '../../../components/UI/CustomButton';

const ItemDetailsModal = ({ show, onHandleShow, locationid,BarcodeNo }) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    
    const [payload, setPayload] = useState({
        ItemId: "",
        BarcodeNo: BarcodeNo
    });
    const [itemData, setItemData] = useState([]);
    const handleSelectChange = (name, value) => {
        console.log("value", value, name);
        setPayload((prev) => ({ ...prev, [name]: value?.value }));
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveBarcode = () => {
        axiosInstance
            .post(`StockPhysicalVerification/SaveBarcode`, payload)
            .then((res) => {
                toast.success(res?.data?.message);
                onHandleShow();
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message);
            });
    };

    useEffect(() => {
        if (locationid) {
            BindItem();
        }
    }, [locationid]);
    const BindItem = async () => {
        debugger
        try {
            const res = await axiosInstance.post(
                "StockPhysicalVerification/BindItem", {
                LocationId: String(locationid)
            }
            );
            const response = res?.data?.message || [];

            const status = response.map((ele) => ({
                label: ele?.typeName,
                value: ele?.itemId
            }));

            setItemData(status);

        } catch (err) {
            toast.error(err?.response?.data?.message || "Error Occurred");
        }
    };

    return (
        <>
            <Dialog
                header={t("Barcode Message")}
                visible={show}
                className={theme}
                onHide={onHandleShow}
                style={{ width: isMobile ? "30vw" : "30vw" }}
            >

                <div className="row px- py-2">
                    <span className="text-danger ml-2">* Only Self Genrated barcode Items(Not System Genrated)</span>
                    <div className="col-12 mb-3">
                        <ReactSelect
                            label="Select Item"
                            dynamicOptions={itemData}
                            value={payload?.ItemId}
                            name="ItemId"
                            id="ItemId"
                            onChange={handleSelectChange}
                            placeholderName={t("Current item")}
                        />
                    </div>

                    {/* Barcode Input - Full Width */}
                    <div className="col-12">
                        <Input
                            type="text"
                            placeholder=" "
                            label="Barcode No"
                            id="BarcodeNo"
                            name="BarcodeNo"
                            value={BarcodeNo}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="d-flex">
                    <CustomButton
                        text={t("Map")}
                        className="btn btn-sm btn-success mr-2"
                        onClick={handleSaveBarcode}
                    />

                    <CustomButton
                        text={t("Cancel")}
                        className="btn btn-sm btn-danger"
                        onClick={onHandleShow}
                    />
                </div>

            </Dialog>
        </>
    )
}

export default ItemDetailsModal
