import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";

const PhleboTravelledDistanceViewModal = ({ show, handleClose, onSuccess,travelData, data }) => {
    const [t] = useTranslation();

    console.log("Data", data)

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
             <Modal.Header closeButton>
                <h5 style={{ width: "100%", textAlign: "center", margin: 0 }}>{t(`Phlebotomist Travel Details From ${travelData.TravalDate}`)}</h5>
            </Modal.Header>
             <Modal.Body>
                <div className="row gx-3 gy-3">
                    <div className="card w-100">
                        <div className="card-body p-2">
                            <div className="table-responsive" style={{ minHeight: "200px", maxHeight: "250px", overflowY: "auto" }}>
                                <Tables className="table table-sm mb-0 p-2">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>PreBooking ID</th>
                                            <th>Phlebotomist Name</th>
                                            <th>Latitude</th>
                                            <th>Longitude</th>
                                            <th>Status</th>
                                            <th>EntryDateTime</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, idx) => (
                                            <tr key={idx}>
                                                    <td data-title={t("#")} className="pr-2">{idx + 1}</td>
                                                    <td data-title={t("PreBooking ID")} className="px-2">{item.PreBookingID? item.PreBookingID : "-"}</td>
                                                    <td data-title={t("Phlebotomist Name")} className="pr-2">{travelData.Name}</td>
                                                    <td data-title={t("Latitude")} className="pr-2">{item.Latitude}</td>
                                                    <td data-title={t("Longitude")} className="pr-2">{item.LongiTude}</td>
                                                    <td data-title={t("Status")} className="pr-2">{item.STATUS}</td>
                                                    <td data-title={t("EntryDateTime")} className="pr-2">{item.TravalDate}</td>
                                                </tr>
                                        ))}
                                        {data.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-3">No data found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Tables>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    {t("Close")}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default PhleboTravelledDistanceViewModal;