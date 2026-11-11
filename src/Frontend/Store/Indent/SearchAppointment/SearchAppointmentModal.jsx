
import React, { use, useEffect, useState } from 'react'
import Heading from '../../../../components/UI/Heading';
import { Dialog } from "primereact/dialog";
import Tables from '../../../../components/UI/customTable';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../../../../utils/hooks/useLocalStorage';

function SearchAppointmentModal({ show, handleClose, filteredTable }) {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
   // const [filteredTable, setFilteredTable] = useState([]);

    return (
        <>
            <Dialog
                header={t("Item Details")}
                visible={show}
                className={theme}
                onHide={handleClose}
                style={{ width: isMobile ? "30vw" : "70vw" }}>
                <div className="p-4">
                    <Heading title={t("Item Details")} />
                    <div className="row">
                        <div className="col-sm-12">
                            <Tables>
                                <thead>
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("App ID")}</th>
                                        <th>{t("App Book From")}</th>
                                        <th>{t("App Book By")}</th>
                                        <th>{t("Pro Assign Date")}</th>
                                        <th>{t("Status")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTable?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.id}</td>
                                            <td>{item.AppFrom}</td>
                                            <td>{item.AppBookByName}</td>
                                            <td>{item.AssignDate}</td>
                                            <td>{item.STATUS}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    </div>
                </div>

            </Dialog>
        </>
    )
}

export default SearchAppointmentModal;
