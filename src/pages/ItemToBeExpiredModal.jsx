import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import Tables from "../components/UI/customTable";

const ItemToBeExpiredModal = ({ show, onHide, Data = [] }) => {
    const theme = useLocalStorage("theme", "get");
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;

    const handleModalClose = () => {
        onHide(false);
    };

    return (
        <Dialog
            header={t("Item To Be Expired")}
            visible={show}
            onHide={handleModalClose}
            className={theme}
            style={{ width: isMobile ? "95vw" : "60vw" }}
            modal
        >
            <div className="col-12">
                <Tables
                    style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                    }}
                >
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Item Name</th>
                            <th>Expiry Date</th>
                            <th>Qty</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Data?.length > 0 ? (
                            Data.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item?.ItemName}</td>
                                    <td>{item?.ExpiryDate}</td>
                                    <td>{item?.Qty}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center">
                                    No Data Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Tables>
            </div>
        </Dialog>
    );
};

export default ItemToBeExpiredModal;