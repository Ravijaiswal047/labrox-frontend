import React, { useState, useEffect }  from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../components/UI/customTable";
import BodyModal from "../utils/BodyModal";

const WelcomeModal = ({ show, handleClose, defaultEmail = "" }) => {
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const initialPayload = {
    mailTo: "",
    mailCC: "",
    mailBCC: "",
    isSent: 1,
    };
  const [payload, setPayload] = useState(initialPayload);
  const [showBodyModal, setShowBodyModal] = useState(false);
  const [selectedBody, setSelectedBody] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({...prev, [name]: type === "checkbox"
    ? checked ? 1 : 0 : value }));
  }

  const colorCodingData = [
    { color: "#28a745", id: "7", labelKey: "Sent" },   // Green
    { color: "#ffc107", id: "15", labelKey: "Req" },    // Yellow
    { color: "#dc3545", id: "15", labelKey: "Fail" },   // Red
];
  const dummyEmails = [
    {
      to: "user1@example.com",
      cc: "cc1@example.com",
      bcc: "bcc1@example.com",
      subject: "Welcome!",
      body: "Welcome to the system.",
      createdBy: "Admin",
      createdOn: "2025-11-15",
      sentDate: "2025-11-15",
      status: "Sent",
    },
]

  useEffect(() => {
    if (show) {
      setPayload(initialPayload);
    }
  }, [show]);
  useEffect(() => {
    if (show) {
        setPayload({
        ...initialPayload,
        mailTo: defaultEmail || "",  
        });
  }
  }, [show, defaultEmail]);
  console.log("payload", payload);
  return (
    <Dialog
      header="Welcome Email"
      visible={show}
      onHide={handleClose}
      className={theme}
      top="25%"
      style={{ width: isMobile ? "95vw" : "70vw" }}
    >
      <div>
        <BodyModal
        show={showBodyModal}
        handleClose={() => setShowBodyModal(false)}
        body={selectedBody}
        />
        <Accordion title={t("Enter Details")} defaultValue={true}
        >
        <div className="row px-2 mt-2">
            <div className="col-sm-4 col-md-3">
                <Input
                    type="text"
                    name="mailTo"
                    lable={t("To")}
                    value={payload?.mailTo || ""}
                    placeholder=" "
                    onChange={handleChange}
                />
            </div>
            <div className="col-sm-4 col-md-3">
                <Input
                    type="text"
                    name="mailCC"
                    lable={t("CC")}
                    value={payload?.mailCC || ""}
                    placeholder=" "
                    onChange={handleChange}
                />
            </div>
            <div className="col-sm-4 col-md-3">
                <Input
                    type="text"
                    name="mailBC"
                    lable={t("BCC")}
                    value={payload?.mailBCC || ""}
                    placeholder=" "
                    onChange={handleChange}
                />
            </div>
        </div>
        <div className="d-flex justify-content-end mt-3 mb-2">
            <button className="btn mr-2" style={{color: 'white'}} >
                Send
            </button>
            <button className="btn"  style={{color: 'white'}} onClick={handleClose}>
                Close
            </button>
        </div>
        </Accordion>
               
        
        <Accordion
            seconTitle={
            <>
                {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
                ))}
            </>
            }
        />

        <div className="p-2 mb-2" style={{ maxHeight: "370px", overflowY: "auto" }}>
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr No")}</th>
                <th>{t("To")}</th>
                <th>{t("CC")}</th>
                <th>{t("BCC")}</th>
                <th>{t("Subject")}</th>
                <th>{t("Body")}</th>
                <th>{t("Created By")}</th>
                <th>{t("Created On")}</th>
                <th>{t("Sent Date")}</th>
                <th>{t("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {dummyEmails.map((email, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{email.to}</td>
                  <td>{email.cc}</td>
                  <td>{email.bcc}</td>
                  <td>{email.subject}</td>
                  <td>
                    <i
                    className="fa fa-eye"
                    style={{
                        cursor: "pointer",
                        fontSize: "17px",
                        color: "#007bff",
                    }}
                    onClick={() => {
                        setSelectedBody("");
                        setShowBodyModal(true);
                    }}
                    ></i>
                  </td>
                  <td>{email.createdBy}</td>
                  <td>{email.createdOn}</td>
                  <td>{email.sentDate}</td>
                  <td>{email.status}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      </div>
    </Dialog>
  );
};

export default WelcomeModal;
