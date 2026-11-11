import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import FullTextEditor from "../../components/formComponent/TextEditor";
import Tables from "../../components/UI/customTable";
import { dateConfig } from "../../utils/helpers";
import Tooltip from "../../components/formComponent/Tooltip";
import Loading from "../../components/loader/Loading";
import ViewAddendumModal from "./ViewAddendumModal";

function ShowAddendumListModal({ show, handleShow, data }) {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");
    const [showComment, setShowComment] = useState({
        modal: false,
        data: ""
    })

    return (
        <>
            {showComment &&
                <ViewAddendumModal
                    show={showComment?.modal}
                    handleShow={() => setShowComment({ modal: false, data: "" })}
                    data={showComment?.data}
                />
            }
            <Dialog
                visible={show}
                header={t("Addendum Comment List")}
                top={"10%"}
                onHide={handleShow}
                className={theme}
                style={{
                    width: isMobile ? "56vw" : "40vw",
                }}
            >
                {data?.length > 0 ? (
                    <div className="row px-2 mt-2">
                        <div className="col-12">
                            <Tables>
                                <thead style={{ width: "auto" }}>
                                    <tr style={{
                                        wordWrap: "break-word",
                                        whiteSpace: "normal",
                                    }}>
                                        <th>{t("S.No")}</th>
                                        <th>{t("CreatedDate")}</th>
                                        <th>{t("CreatedBy")}</th>
                                        <th>{t("Comment")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")} style={{ width: "40px" }}>
                                                <div>{index + 1}</div>
                                            </td>
                                            <td data-title={t("CreatedDate")}>
                                                {dateConfig(data.dtEntry)}&nbsp;
                                            </td>
                                            <td>{data?.CreatedByName}</td>
                                            <td data-title={t("Comment")}>

                                                <i
                                                    className="fa fa-eye"
                                                    style={{ cursor: "pointer", color:"blue" }}
                                                    title="View Comment"
                                                    onClick={() =>
                                                        setShowComment({ modal: true, data: data?.Comment })
                                                    }
                                                ></i>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    </div>
                ) : (
                    <Loading />
                )}
            </Dialog>
        </>

    );
}

export default ShowAddendumListModal;
