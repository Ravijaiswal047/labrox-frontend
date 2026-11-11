import React from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const SearchAppointmentTestNameModal = ({
    visible,
    editTestRow,
    editTestSearch,
    oldEditTests,
    selectedEditTests,
    testSuggestion,
    indexMatch,
    onClose,
    onChange,
    onKeyDown,
    onSuggestionBlur,
    onSelectTest,
    onRemoveTest,
    onCancelOldTest,
    onSave,
}) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;

    return (
        <Dialog
            header={t("Edit Test")}
            visible={visible}
            className={theme}
            onHide={onClose}
            style={{ width: isMobile ? "90vw" : "50vw" }}
        >
            <div className="p-4">
                <Heading title={t("Edit Test")} />
                <div className="row">
                    {oldEditTests && oldEditTests.length > 0 && (
                        <div className="col-sm-12 mb-3">
                            <label className="text-primary font-weight-bold">{t("Current Saved Tests")}</label>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "40px" }}>#</th>
                                            <th>{t("Test Name")}</th>
                                            <th style={{ width: "50px" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {oldEditTests.map((item, index) => (
                                            <tr key={item?.InvestigationID || index}>
                                                <td>{index + 1}</td>
                                                <td>{item?.TestName}</td>
                                                <td className="text-center">
                                                    <CustomButton
                                                        icon="cancel"
                                                        text={""}
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => onCancelOldTest(item)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="col-sm-12 position-relative">
                        <Input
                            name="TestName"
                            className="required-fields custome_little"
                            lable={t("Type TestName For Add Test")}
                            type="text"
                            value={editTestSearch}
                            placeholder=" "
                            max={30}
                            id="editTestSearch"
                            onChange={(e) => onChange(e, editTestRow)}
                            onBlur={() => {
                                setTimeout(onSuggestionBlur, 200);
                            }}
                            onKeyDown={(e) => onKeyDown(e, editTestRow)}
                        />
                        {testSuggestion.length > 0 && (
                            <ul className="suggestion-data" style={{ zIndex: 99 }}>
                                {testSuggestion.map((item, suggestionIndex) => (
                                    <li
                                        key={suggestionIndex}
                                        ref={(el) => {
                                            if (suggestionIndex === indexMatch && el) {
                                                el.scrollIntoView({ block: "nearest" });
                                            }
                                        }}
                                        onMouseDown={() => onSelectTest(item)}
                                        className={`${suggestionIndex === indexMatch && "matchIndex"}`}
                                    >
                                        {item?.TestName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="col-sm-12 mt-2">
                        <div className="table-responsive">
                            <table className="table table-bordered table-sm mb-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: "40px" }}>#</th>
                                        <th>{t("Test Name")}</th>
                                        <th style={{ width: "50px" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedEditTests.length > 0 ? (
                                        selectedEditTests.map((item, index) => (
                                            <tr key={item?.InvestigationID || index}>
                                                <td>{index + 1}</td>
                                                <td>{item?.TestName}</td>
                                                <td>
                                                    <CustomButton
                                                        icon="delete"
                                                        text={""}
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => onRemoveTest(item?.InvestigationID)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center">
                                                {t("No Record Found")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-12 mt-3">
                        <CustomButton
                            text="Save"
                            icon="save"
                            className="btn btn-primary btn-sm px-3"
                            onClick={onSave}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default SearchAppointmentTestNameModal;
