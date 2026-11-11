import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import Tables from "../../../components/UI/customTable";

const MachineBreakDownModal = ({ show, onHide, Data = [] }) => {
    console.log(Data);
    const theme = useLocalStorage("theme", "get");
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;

    const handleModalClose = () => {
        onHide(false);
    };

    return (
        <>
            <Dialog
                header={t("Machine Breakdown's")}
                visible={show}
                onHide={handleModalClose}
                className={theme}
                style={{ width: isMobile ? "95vw" : "50vw" }}
                modal
            > {Data.length === 0 ? (
                <p className="text-center">{t("No Machine Breakdown Found")}</p>
            ) : (
                <div className="col-12 mt-0">
                    <Tables style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                    }}>
                        <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                            <tr>
                                <th style={{ width: "2%" }}>S.No</th>
                                <th>{t("Machine Details")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Data.map((msg, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{msg}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Tables>
                </div>
            )}
            </Dialog>
        </>
    );
};

export default MachineBreakDownModal;
