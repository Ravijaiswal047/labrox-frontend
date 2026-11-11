import React from "react";
import { Image } from "react-bootstrap";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
const PhelebotomistDetailModal = ({
  phelebotomistData,
  pheleboProfile,
  handlePheleboDetailClose,
}) => {
  const theme = useLocalStorage("theme", "get");
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;
  return (
    <>
      <Dialog
        visible={pheleboProfile}
        header={t("Phelebotomist Profile")}
        className={theme}
        style={{
          width: isMobile ? "80vw" : "75vw",
        }}
        onHide={handlePheleboDetailClose}
      >
        {phelebotomistData?.map((ele, index) => (
          <>
            <>
              {/* <div className="row">
                  <Image
                    src={ele?.ProfilePics}
                    style={{ width: "150px", height: "150px" }}
                  />
                </div> */}
              <Tables>
                <thead>
                  <tr>
                    {" "}
                    <th className="text-center">{t("NAME")}</th>{" "}
                    <th className="text-center">{t("Joining Date")}</th>{" "}
                    <th className="text-center">{t("Gender")}</th>{" "}
                    <th className="text-center">{t("DOB")}</th>{" "}
                    <th className="text-center">{t("Mobile")}</th>{" "}
                    <th className="text-center">{t("Email")}</th>{" "}
                    <th className="text-center">{t("Address")}</th>{" "}
                    <th className="text-center">{t("Blood Group")}</th>{" "}
                    <th className="text-center">{t("Qualification")}</th>{" "}
                    <th className="text-center">{t("Vehicle Number")}</th>{" "}
                    <th className="text-center">{t("Driving Licence")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-title="NAME" className="text-center">
                      {ele.NAME}
                    </td>
                    <td data-title="Joining Date" className="text-center">
                      {ele.joiningdate}
                    </td>
                    <td data-title="Gender" className="text-center">
                      {ele.gender}
                    </td>
                    <td data-title="DOB" className="text-center">
                      {ele.dob}
                    </td>
                    <td data-title="Mobile" className="text-center">
                      {ele.mobile}
                    </td>
                    <td data-title="Email" className="text-center">
                      {ele.email}
                    </td>
                    <td data-title="Address" className="text-center">
                      {ele.address}
                    </td>{" "}
                    <td data-title="Blood Group" className="text-center">
                      {ele.bloodgroup}
                    </td>{" "}
                    <td data-title="Qualification" className="text-center">
                      {ele.Qualification}
                    </td>{" "}
                    <td data-title="Vehicle Number" className="text-center">
                      {ele.Vehicle_num}
                    </td>{" "}
                    <td data-title="Driving Licence" className="text-center">
                      {ele.DrivingLicence}
                    </td>
                  </tr>
                </tbody>
              </Tables>
            </>
          </>
        ))}
      </Dialog>
    </>
  );
};

export default PhelebotomistDetailModal;
