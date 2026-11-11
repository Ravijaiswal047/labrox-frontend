import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
const MembershipModal = ({
  data,
  show7,
  handleclosemembership,
  handleSelectedData,
}) => {
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      <Dialog
        style={{
          width: isMobile ? "80vw" : "60vw",
        }}
        visible={show7}
        onHide={handleclosemembership}
        width="50vw"
        header={t("Membership Card Detail")}
        className={theme}
      >
        <Tables>
          <thead className="cf text-center" style={{ zIndex: 99 }}>
            <tr>
              <th className="text-center">{t("Select")}</th>
              <th className="text-center">{t("Name")}</th>
              <th className="text-center">{t("Age")}</th>
              <th className="text-center">{t("Primary")}</th>
              <th className="text-center">{t("MembershipCard")}</th>
              <th className="text-center">{t("PatientCode")}</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((ele, index) => (
              <tr key={index} style={{ color: "black" }}>
                <td data-title="Select" className="text-center">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={() => {
                      handleSelectedData(ele);
                    }}
                  >
                    {t("Select")}
                  </button>
                </td>
                <td data-title="Name" className="text-center">
                  {` ${ele?.Title}${ele?.FirstName} ${ele?.MiddleName} ${ele?.LastName}`}
                  &nbsp;
                </td>
                <td data-title="Age" className="text-center">
                  {ele.Age}&nbsp;
                </td>

                <td data-title="Primary" className="text-center">
                  {ele.FamilyMemberIsPrimary == 1 ? "Self" : "Dependent"}
                  &nbsp;
                </td>
                <td data-title="MembershipCard" className="text-center">
                  {ele.MembershipCardName}&nbsp;
                </td>
                <td data-title="PatientCode" className="text-center">
                  {ele.PatientCode}&nbsp;
                </td>
              </tr>
            ))}
          </tbody>
        </Tables>
      </Dialog>
    </>
  );
};

export default MembershipModal;
