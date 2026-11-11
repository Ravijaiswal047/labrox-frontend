import React from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { FaEye, FaSave } from "react-icons/fa";
import ReactSelect from "../../components/formComponent/ReactSelect";
import ShowTextEditors from "../Laboratory/ShowTextEditors";
import { SaveButton } from "../../components/UI/CustomButton";

function ShowTemplateModal({
  show,
  handleClose,
  item,
  payload,
  TEMPLATEDROPDOWN,
  handleTempChange,
  handleSaveTemplate,
  handleTextEditorChanges,
  showEye = true,
}) {
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();

  return (
    <>
      <Dialog
        header={t(item?.title)}
        visible={show}
        top={"25%"}
        className={theme}
        onHide={handleClose}
        style={{
          width: isMobile ? "90vw" : "60vw",
        }}
      >
        <div className="row">
          {TEMPLATEDROPDOWN?.filter((ele) => ele?.type === item?.type)?.map(
            (ele, index) => (
              <div className="col-12" key={index}>
                <div className="row align-items-center p-2">
                  {/* React Select */}
                  <div className="col-sm-6 px-1">
                    <ReactSelect
                      dynamicOptions={ele?.options}
                      searchable
                      removeIsClearable
                      placeholderName={ele?.type}
                      respclass="roll-off"
                      id={`SelectedValueOfTemplate_${ele?.type}`}
                      name={ele?.label}
                      value={ele?.value}
                      onChange={(label, value) =>
                        handleTempChange(label, value, ele)
                      }
                    />
                  </div>

                  {/* Save Icon */}
                  <div className="col-sm-1 pb-2">
                    <SaveButton
                      text={t("SaveAsTemplate")}
                      id="btnSave"
                      onClick={() => handleSaveTemplate(item)}
                      className="mx-2"
                      disabled={
                        item?.name === "GrossComment"
                          ? !payload.GrossComment
                          : item?.name === "MicroScopicComment"
                            ? !payload.MicroScopicComment
                            : item?.name === "ImpressionComment"
                              ? !payload.ImpressionComment
                              : true
                      }
                    />
                    {/* <FaSave
                      title="SaveAsTemplate"
                      className="mx-2"
                      style={{ color: "green", cursor: "pointer" }}
                      onClick={() => handleSaveTemplate(item)}
                      disabled={
                        item?.name === "GrossComment"
                          ? !payload.GrossComment
                          : item?.name === "MicroScopicComment"
                            ? !payload.MicroScopicComment
                            : item?.name === "ImpressionComment"
                              ? !payload.ImpressionComment
                              : true
                      }
                    /> */}
                  </div>

                  {/* Eye Icon */}
                  {showEye && (
                    <div className="col-sm-1">
                      <FaEye
                        className="mr-2"
                        style={{ color: "black", cursor: "pointer" }}
                        title="Maximize"
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* Text Editor */}
          <div className="col-12 mt-2">
            <ShowTextEditors
              id={item?.name}
              value={payload[item?.name]}
              onChange={handleTextEditorChanges}
              name={item?.name}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default ShowTemplateModal;
