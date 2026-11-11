import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import CustomTable from "../../components/Table/CustomTable";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

function MachineModal({ show, onHide, machineData }) {
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const machineList = machineData?.MachineInfo
    ? JSON.parse(machineData.MachineInfo)
    : [];
  console.log("machineData in modal:", machineData);
  return (
    <Dialog
      header={`Machine Information : ${machineData?.Name}`}
      visible={show}
      onHide={onHide}
      top="100px"
      className={theme}
      style={{
        width: isMobile ? "80vw" : "50vw",
      }}
    >
      {/* ===== Modal Body ===== */}
      <div className="">
        <Tables>
        <thead className="cf">
          <tr>
            <th>{t("Sr. No")}</th>
            <th>{t("Centre Name")}</th>
            <th>{t("Machine Name")}</th>
          </tr>
        </thead>

        {/* <tbody>
          {machineList.length > 0 ? (
            machineList?.map((item, index) => (
              <tr key={index}>
                <td data-title={t("Sr. No")} style={{width: "60px"}}>{index + 1}</td>
                <td data-title={t("Centre Name")}>
                  {item?.Centre || "-"}
                </td>
                <td data-title={t("Machine Name")}>
                  {item?.MachineName || "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>
                {t("No Records Found")}
              </td>
            </tr>
          )}
        </tbody> */}
          <tbody>
            {machineList?.length > 0 ? (
              Object.entries(
                machineList.reduce((acc, item) => {
                  acc[item.Centre] = acc[item.Centre] || [];
                  acc[item.Centre].push(item);
                  return acc;
                }, {})
              ).map(([centre, machines], centreIndex) =>
                machines.map((machine, machineIndex) => (
                  <tr key={`${centreIndex}-${machineIndex}`}>
                    {/* Sr No only on first row of centre */}
                    {machineIndex === 0 && (
                      <td
                        rowSpan={machines.length}
                        data-title={t("Sr. No")}
                        style={{ width: "60px", verticalAlign: "top" }}
                      >
                        {centreIndex + 1}
                      </td>
                    )}

                    {/* Centre only once */}
                    {machineIndex === 0 && (
                      <td
                        rowSpan={machines.length}
                        data-title={t("Centre Name")}
                        style={{ verticalAlign: "top" }}
                      >
                        {centre}
                      </td>
                    )}

                    {/* Machine Name always */}
                    <td data-title={t("Machine Name")}>
                      {machine.MachineName || "-"}
                    </td>
                  </tr>
                ))
              )
            ) : (
                <tr style={{ height: "20px" }}>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      padding: "10px",
                      fontWeight: "500",
                    }}
                  >
                    {t("No Records Found")}
                  </td>
                </tr>
            )}
          </tbody>
      </Tables>
      </div>

     
    </Dialog>
  );
}

export default MachineModal;