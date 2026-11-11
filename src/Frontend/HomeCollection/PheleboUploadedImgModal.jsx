import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import Heading from "../../components/UI/Heading";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import Loading from "../../components/loader/Loading";
import { useEffect } from "react";



const PheleboUploadedImgModal = ({
    show,
    id,
    onHide,
}) => {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");

    const [formdata, setFormData] = useState({
        fromDate: new Date(),
        toDate: new Date(),
    });

    const [imageData, setImageData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const dateSelect = (value, name) => {
        setFormData({ ...formdata, [name]: value });
    };

    const handleModalClose = () => {
        setImageData([]);
        setSearched(false);
        onHide(false);
        setFormData({
            fromDate: new Date(),
            toDate: new Date(),
        })
    };

    const handlesearch = () => {
        setLoading(true);
        setSearched(true);
        axiosInstance
            .post("PhelebotomistMaster/ShowPhleboImages", {
                id: id,
                fromDate: moment(formdata?.fromDate).format("YYYY-MM-DD"),
                toDate: moment(formdata?.fromDate).format("YYYY-MM-DD"),
            })
            .then((res) => {
                setImageData(res.data?.data ?? []);
            })
            .catch((err) => {
                console.log(err);
                setImageData([]);
            })
            .finally(() => setLoading(false));
    };

    // build the 4-cell list for a single record
    const buildImageList = (record) => [
        { label: t("Selfie"), url: record.SelfieImage },
        { label: t("Bike"), url: record.BikeImage },
        { label: t("Bag"), url: record.BagImage },
        { label: t("Temp Image"), url: record.TempImage },
    ];

    useEffect(() => {
        handlesearch();
    }, [id]);

    return (
        <Dialog
            header={t("Uploaded Images")}
            visible={show}
            onHide={handleModalClose}
            className={theme}
            style={{ width: isMobile ? "95vw" : "70vw" }}
            modal
        >
            <style>{`
                .phlebo-img-wrap { --pi-line: rgba(128,128,128,.25); }
                .phlebo-search-bar {
                    display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
                    padding: 16px; border: 1px solid var(--pi-line); border-radius: 12px;
                    background: rgba(128,128,128,.04); margin-bottom: 20px;
                }
                .phlebo-date-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 8px 16px; border-radius: 999px; font-size: 14px;
                    background: rgba(13,110,253,.10); color: #0d6efd; font-weight: 600;
                    margin-bottom: 14px;
                }
                .phlebo-card {
                    border: 1px solid var(--pi-line); border-radius: 14px; overflow: hidden;
                    transition: transform .2s ease, box-shadow .2s ease; height: 100%;
                    background: rgba(128,128,128,.03);
                }
                .phlebo-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 24px rgba(0,0,0,.18);
                }
                .phlebo-card-head {
                    display: flex; align-items: center; gap: 6px;
                    padding: 10px 14px; font-size: 13px; font-weight: 600;
                    letter-spacing: .3px; border-bottom: 1px solid var(--pi-line);
                }
                .phlebo-card-head .dot {
                    width: 8px; height: 8px; border-radius: 50%; background: #0d6efd;
                }
                .phlebo-thumb {
                    height: 180px; width: 100%; object-fit: cover; display: block;
                    cursor: zoom-in; transition: opacity .2s ease;
                }
                .phlebo-thumb:hover { opacity: .9; }
                .phlebo-empty {
                    height: 180px; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; gap: 6px;
                    color: rgba(128,128,128,.7); font-size: 13px;
                }
                .phlebo-empty-state {
                    text-align: center; padding: 48px 16px; color: rgba(128,128,128,.7);
                }
                .phlebo-record {
                    padding-bottom: 20px; margin-bottom: 20px;
                    border-bottom: 1px solid var(--pi-line);
                }
                .phlebo-record:last-child { border-bottom: none; margin-bottom: 0; }
            `}</style>

            <div className="phlebo-img-wrap">
                {/* Search bar */}
                <div className="phlebo-search-bar">
                    <div style={{ flex: "0 0 180px" }}>
                        <DatePicker
                            className="custom-calendar required-fields"
                            name="fromDate"
                            id="fromDate"
                            lable="fromDate"
                            placeholder=" "
                            value={formdata?.fromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                        />
                    </div>

                    <CustomButton text="Search" icons="search" className="mb-2" onClick={handlesearch} />
                </div>

                {/* Loading */}
                {loading && <Loading />}

                {/* Results — one block per record */}
                {!loading && imageData?.length > 0 && (
                    <>
                        {imageData.map((record, recIndex) => (
                            <div key={recIndex} className="phlebo-record">
                                <span className="phlebo-date-badge">

                                    {t("Date")}:{" "}
                                    {record.EntryDate
                                        ? moment(record.EntryDate).format("DD MMM YYYY")
                                        : "-"}
                                </span>

                                <div className="row g-3">
                                    {buildImageList(record).map((item, index) => (
                                        <div className="col-sm-3 col-6" key={index}>
                                            <div className="phlebo-card">
                                                <div className="phlebo-card-head">
                                                    <span className="dot" />
                                                    {item.label}
                                                </div>
                                                {item.url ? (
                                                    <img
                                                        src={item.url}
                                                        alt={item.label}
                                                        className="phlebo-thumb"
                                                        onClick={() => window.open(item.url, "_blank")}
                                                    />
                                                ) : (
                                                    <div className="phlebo-empty">
                                                        <i className="material-icons">image_not_supported</i>
                                                        {t("No Image")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* No results after search */}
                {!loading && searched && imageData?.length === 0 && (
                    <div className="phlebo-empty-state">
                        <div className="mt-2">{t("No images found for the selected dates")}</div>
                    </div>
                )}

                {/* Initial state before any search */}
                {!loading && !searched && (
                    <div className="phlebo-empty-state">
                        <i className="material-icons" style={{ fontSize: 40, opacity: .5 }}>
                            photo_library
                        </i>

                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default PheleboUploadedImgModal;

