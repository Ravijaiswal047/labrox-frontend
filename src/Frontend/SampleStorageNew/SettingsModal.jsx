import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Modal from "@components/formComponent/Modal";
import Input from "@components/formComponent/Input";
import Tables from "@components/UI/customTable";
import {CustomButton, SaveButton, CancelButton, DeleteButton } from "@components/UI/CustomButton";
import CustomTabs from "@components/UI/CustomTabs";
import { axiosInstance } from "@app/utils/axiosInstance";

const SettingsModal = ({
  visible,
  setVisible,
  devices,
  trayTemplates,
  centreId,
  selectedDevice,
  setSelectedDevice,
  setSelectedTray,
  onRefresh,
}) => {
  const { t } = useTranslation();

  const [settingsTab, setSettingsTab] = useState("devices");

  const [newDevice, setNewDevice] = useState({
    DeviceCode: "",
    DeviceName: "",
    Temperature: "",
    NumRacks: 2,
  });

  const [newTemplate, setNewTemplate] = useState({
    TemplateName: "",
    Rows: 5,
    Cols: 5,
    IsDefault: false,
  });

  const [editDeviceId, setEditDeviceId] = useState(0);
const [editTemplateId, setEditTemplateId] = useState(0);

  const handleAddDevice = () => {
    if (!newDevice.DeviceName.trim()) {
      toast.warning(t("Enter device name"));
      return;
    }

    axiosInstance
      .post("SampleStorageNew/SaveDevice", {
        DeviceID: editDeviceId || 0,
        DeviceCode: newDevice.DeviceCode,
        DeviceName: newDevice.DeviceName,
        Temperature: newDevice.Temperature,
        CentreID: centreId,
        NumRacks: Number(newDevice.NumRacks) || 1,
      })
      .then((res) => {
        if(res.data?.success) {
          toast.success(res?.data?.message || editDeviceId ? t("Device updated") : t("Device added"));
          setNewDevice({ DeviceCode: "", DeviceName: "", Temperature: "", NumRacks: 2 });
          onRefresh();
        } else {
          toast.error(res?.data?.message || t("Failed to save device"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to save device")));
  };

  const handleRemoveDevice = (deviceId) => {
    axiosInstance
      .post("SampleStorageNew/DeleteDevice", { DeviceID: deviceId })
      .then((res) => {
        if(res.data?.success) {
          onRefresh();
          toast.success(res?.data?.message || t("Device removed"));
          if (selectedDevice?.DeviceID === deviceId) {
            setSelectedDevice(null);
            setSelectedTray(null);
          }
        } else {
          toast.error(res?.data?.message || t("Failed to delete device"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to delete device")));
  };

  const handleAddTemplate = () => {
    if (!newTemplate.TemplateName.trim()) {
      toast.warning(t("Enter template name"));
      return;
    }

    axiosInstance
      .post("SampleStorageNew/SaveTrayTemplate", {
        TemplateID: editTemplateId || 0,
        TemplateName: newTemplate.TemplateName,
        Rows: Number(newTemplate.Rows) || 5,
        Cols: Number(newTemplate.Cols) || 5,
        IsDefault: newTemplate.IsDefault,
      })
      .then((res) => {
        if(res.data?.success) {
          toast.success(res?.data?.message || editTemplateId ? t("Template updated") : t("Template added"));
          setNewTemplate({ TemplateName: "", Rows: 5, Cols: 5, IsDefault: false });
          setEditTemplateId(0);
          onRefresh();
        } else {
          toast.error(res?.data?.message || t("Failed to save template"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to save template")));
  };

  const handleToggleDefault = (tp) => {
    axiosInstance
      .post("SampleStorageNew/SaveTrayTemplate", {
        TemplateID: tp.TemplateID,
        TemplateName: tp.TemplateName,
        Rows: tp.Rows,
        Cols: tp.Cols,
        IsDefault: !tp.IsDefault,
      })
      .then((res) => {
        if (res.data?.success) {
          toast.success(res?.data?.message || t("Template updated"));
          onRefresh();
        } else {
          toast.error(res?.data?.message || t("Failed to update template"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to update template")));
  };

  const handleRemoveTemplate = (templateId) => {
    axiosInstance
      .post("SampleStorageNew/DeleteTrayTemplate", { TemplateID: templateId })
      .then((res) => {
        if(res.data?.success) {
          toast.success(res?.data?.message || t("Template removed"));
          onRefresh();
        } else {
          toast.error(res?.data?.message || t("Failed to delete template"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to delete template")));
  };

  const tabs = [
    {
      id: "devices",
      label: t("Devices"),
      content: (
        <>
          <div className="row g-2 mb-2 align-items-start mt-3">
            <div className="col-12 col-md-3">
              <Input
                type="text"
                name="DeviceCode"
                lable="Device Code"
                value={newDevice.DeviceCode}
                onChange={(e) => setNewDevice((p) => ({ ...p, DeviceCode: e.target.value }))}
                respclass=""
              />
            </div>
            <div className="col-12 col-md-3">
              <Input
                type="text"
                name="DeviceName"
                lable="Device Name"
                value={newDevice.DeviceName}
                onChange={(e) => setNewDevice((p) => ({ ...p, DeviceName: e.target.value }))}
                respclass=""
                required={true}
              />
            </div>
            <div className="col-12 col-md-2">
              <Input
                type="text"
                name="Temperature"
                lable="Temperature"
                value={newDevice.Temperature}
                onChange={(e) => setNewDevice((p) => ({ ...p, Temperature: e.target.value }))}
                respclass=""
              />
            </div>
            <div className="col-6 col-md-2">
              <Input
                type="number"
                name="NumRacks"
                lable="Racks"
                value={newDevice.NumRacks}
                onChange={(e) => setNewDevice((p) => ({ ...p, NumRacks: e.target.value }))}
                respclass=""
              />
            </div>
            <div className="col-auto">
              <CustomButton text={editDeviceId ? t("Update") : t("Add")} icon={editDeviceId ? "edit" : "save"} onClick={handleAddDevice} />
            </div>
          </div>

          <Tables style={{ maxHeight: "300px", minHeight: "150px", overflowY: "auto" }}>
            <thead>
              <tr>
                <th>{t("Sr No")}</th>
                <th>{t("Code")}</th>
                <th>{t("Name")}</th>
                <th>{t("Temp")}</th>
                <th>{t("Racks")}</th>
                <th>{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d, i) => (
                <tr key={d.DeviceID}>
                  <td data-title="Sr No">{i + 1}</td>
                  <td data-title="Code">{d.DeviceCode}</td>
                  <td data-title="Name">{d.DeviceName}</td>
                  <td data-title="Temperature">{d.Temperature}</td>
                  <td data-title="Racks">{d.NumRacks}</td>
                  <td data-title="Action">
                    <CustomButton
                      icon="delete"
                      onClick={() => handleRemoveDevice(d.DeviceID)}
                      style={{ marginRight: "5px" }}
                    />
                    <CustomButton
                      icon="edit"
                      onClick={() => {
                        setEditDeviceId(d.DeviceID);
                        setNewDevice({
                          DeviceCode: d.DeviceCode,
                          DeviceName: d.DeviceName,
                          Temperature: d.Temperature,
                          NumRacks: d.NumRacks,
                        });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </>
      ),
    },

    {
      id: "templates",
      label: t("Tray Templates"),
      content: (
        <>
          <div className="row g-2 mb-2 align-items-start mt-3">
            <div className="col-12 col-md-4">
              <Input
                type="text"
                name="TemplateName"
                lable="Template Name"
                value={newTemplate.TemplateName}
                onChange={(e) => setNewTemplate((p) => ({ ...p, TemplateName: e.target.value }))}
                respclass=""
                required={true}
              />
            </div>
            <div className="col-6 col-md-2">
              <Input
                type="number"
                name="Rows"
                lable="Rows"
                value={newTemplate.Rows}
                onChange={(e) => setNewTemplate((p) => ({ ...p, Rows: e.target.value }))}
                respclass=""
              />
            </div>
            <div className="col-6 col-md-2">
              <Input
                type="number"
                name="Cols"
                lable="Cols"
                value={newTemplate.Cols}
                onChange={(e) => setNewTemplate((p) => ({ ...p, Cols: e.target.value }))}
                respclass=""
              />
            </div>
            <div className="col-auto d-flex align-items-center">
              <Form.Check
                type="switch"
                id="tplIsDefault"
                name="IsDefault"
                label={t("Default")}
                checked={!!newTemplate.IsDefault}
                onChange={(e) => setNewTemplate((p) => ({ ...p, IsDefault: e.target.checked }))}
                className="d-flex align-items-center mb-1"
              />
            </div>
            <div className="col-auto">
              <CustomButton text={editTemplateId ? t("Update") : t("Add")} icon={editTemplateId ? "edit" : "save"} onClick={handleAddTemplate} />
            </div>
          </div>

          <Tables style={{ maxHeight: "300px", minHeight: "150px", overflowY: "auto" }}>
            <thead>
              <tr>
                <th>{t("Sr No")}</th>
                <th>{t("Name")}</th>
                <th>{t("Rows")}</th>
                <th>{t("Cols")}</th>
                <th>{t("Total Cells")}</th>
                <th>{t("Default")}</th>
                <th>{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {trayTemplates.map((tp, i) => (
                <tr key={tp.TemplateID}>
                  <td>{i + 1}</td>
                  <td>{tp.TemplateName}</td>
                  <td>{tp.Rows}</td>
                  <td>{tp.Cols}</td>
                  <td>{tp.Rows * tp.Cols}</td>
                  <td>
                    <Form.Check
                      type="switch"
                      id={`tplDefault-${tp.TemplateID}`}
                      checked={!!tp.IsDefault}
                      onChange={() => handleToggleDefault(tp)}
                      className="d-flex align-items-top mb-0"
                    />
                  </td>
                  <td>
                    <CustomButton
                      icon="edit"
                      style={{ marginRight: 4 }}
                      onClick={() => {
                        setEditTemplateId(tp.TemplateID);
                        setNewTemplate({
                          TemplateName: tp.TemplateName,
                          Rows: tp.Rows,
                          Cols: tp.Cols,
                          IsDefault: tp.IsDefault,
                        });
                      }}
                    />
                    {!tp.IsDefault && (
                      <CustomButton
                        icon="delete"
                        onClick={() => handleRemoveTemplate(tp.TemplateID)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </>
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={t("Settings")}
      modalWidth="800px"
      CancelbuttonName="Close"
    >
      <CustomTabs
        tabs={tabs}
        activeTab={settingsTab}
        onSelect={(k) => setSettingsTab(k)}
      />
    </Modal>
  );
};

export default SettingsModal;
