import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import CloseButton from "../../components/formComponent/CloseButton";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";
import OutSourceLabSelect, {
  buildOutSourceLabOptions,
} from "./OutSourceLabSelect";

function PackageOutSourceLabModal({
  show,
  onHide,
  packageName,
  tests = [],
  outSourceLabOptions = [],
  onSave,
}) {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (show) {
      setRows(
        (tests || []).map((item) => ({
          ...item,
          LabOutsrcID: item?.LabOutsrcID || "",
          LabOutsrcName: item?.LabOutsrcName || "",
        })),
      );
    }
  }, [show, tests]);

  const handleLabChange = (index, selected) => {
    const value = selected?.value || "";
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              LabOutsrcID: value,
              LabOutsrcName: selected?.labName || "",
              isOutSource: value ? 1 : Number(row?.isOutSource) || 0,
            }
          : row,
      ),
    );
  };

  const handleSave = () => {
    onSave?.(rows);
    onHide?.();
  };

  return (
    <Dialog
      header={`${t("Outsource Lab")} ${packageName ? `- ${packageName}` : ""}`}
      style={{ width: isMobile ? "90vw" : "55vw" }}
      className={theme}
      visible={show}
      onHide={onHide}
    >
      {rows?.length > 0 ? (
        <>
          <Tables>
            <thead className="cf">
              <tr>
                <th>{t("#")}</th>
                <th>{t("Code")}</th>
                <th>{t("Test Name")}</th>
                <th>{t("Outsource Lab")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isOutsource = Number(row?.isOutSource) === 1;
                return (
                  <tr
                    key={`${row?.InvestigationID || index}`}
                    style={{ background: isOutsource ? "pink" : "" }}
                  >
                    <td>{index + 1}</td>
                    <td>{row?.TestCode}</td>
                    <td>{row?.TestName}</td>
                    <td>
                      <OutSourceLabSelect
                        options={buildOutSourceLabOptions(
                          outSourceLabOptions,
                          row?.InvestigationID || row?.InvestigationId,
                        )}
                        value={row?.LabOutsrcID || ""}
                        placeholder={t("Select Lab")}
                        onChange={(selected) =>
                          handleLabChange(index, selected)
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Tables>
          <div className="row mt-2 d-flex justify-content-end">
            <div className="col-sm-auto">
              <CancelButton
                onClick={onHide}
                text={"Close"}
              />
            </div>
            <div className="col-sm-auto">
              <SaveButton
                onClick={handleSave}
                text={t("Save")}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-3">
          <h6>{t("No Data Found")}</h6>
        </div>
      )}
    </Dialog>
  );
}

export default PackageOutSourceLabModal;
