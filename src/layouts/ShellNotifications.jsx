import NotificationContent from "./NotificationContent";
import NotificationContentForMachine from "../modules/login/MachineBreakDownModal/NotificationContentForMachine";

// Machine-breakdown / general / scheduled-downtime banners shown above the shell.
const ShellNotifications = ({
  showMachineNotification,
  setShowMachineNotification,
  machineMessages,
  notification,
  setNotification,
  downtimeMessage,
  setDowntimeMessage,
  downTimeData,
}) => {
  return (
    <>
      {showMachineNotification && machineMessages.length > 0 && (
        <div className="text-notification">
          <span>
            <NotificationContentForMachine messages={machineMessages} />
          </span>
          <i
            className="pi pi-times"
            onClick={() => setShowMachineNotification(false)}
          />
        </div>
      )}
      {notification && (
        <div className="text-notification">
          <span>
            <NotificationContent setNotification={setNotification} />
          </span>
          <i className="pi pi-times" onClick={() => setNotification(false)} />
        </div>
      )}
      {downtimeMessage && (
        <div className="text-notification">
          <span style={{ color: "red" }}>
            ⚠️ **Alert:** There is a scheduled downtime between **
            {downTimeData[0]?.FromTime} - {downTimeData[0]?.ToTime}**. Please
            avoid using the system during this time.
          </span>
          <i
            className="pi pi-times"
            onClick={() => setDowntimeMessage(false)}
          />
        </div>
      )}
    </>
  );
};

export default ShellNotifications;
