import { useState } from "react";
import NextGenHeading from "@components/nextgen/NextGenHeading";
import NextGenAccordion from "@components/nextgen/NextGenAccordion";
import NextGenInput from "@components/nextgen/NextGenInput";
import NextGenSelect from "@components/nextgen/NextGenSelect";
import NextGenMultiSelect from "@components/nextgen/NextGenMultiSelect";
import NextGenModal from "@components/nextgen/NextGenModal";
import { NextGenButton, NextGenSaveButton, NextGenCancelButton } from "@components/nextgen/NextGenButton";
import { useNgModeClass } from "@app/utils/hooks/useNgModeClass";
import "./ComponentPreview.css";

const SAMPLE_OPTIONS = [
  { label: "Cardiology", value: "cardiology" },
  { label: "Radiology", value: "radiology" },
  { label: "Pathology", value: "pathology" },
  { label: "Neurology", value: "neurology" },
];

export default function ComponentPreview() {
  const [textValue, setTextValue] = useState("");
  const [selectValue, setSelectValue] = useState(null);
  const [multiValue, setMultiValue] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const ngModeClass = useNgModeClass();

  return (
    <div className={`${ngModeClass} ng-preview`}>
      <NextGenHeading title="NextGen Component Preview" />

      <NextGenAccordion title="Form controls" defaultValue={true} className="ng-preview__section">
        <div className="ng-preview__grid">
          <NextGenInput
            id="preview-input"
            name="preview-input"
            lable="Patient Name"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />

          <NextGenSelect
            id="preview-select"
            name="department"
            placeholderName="Department"
            dynamicOptions={SAMPLE_OPTIONS}
            value={selectValue}
            onChange={(_, option) => setSelectValue(option?.value ?? null)}
          />

          <NextGenMultiSelect
            id="preview-multiselect"
            name="departments"
            label="Departments"
            options={SAMPLE_OPTIONS}
            value={multiValue}
            onChange={(_, value) => setMultiValue(value)}
          />
        </div>
      </NextGenAccordion>

      <NextGenAccordion title="Buttons" defaultValue={true} className="ng-preview__section">
        <div className="ng-preview__row">
          <NextGenButton text="Primary" variant="primary" />
          <NextGenButton text="Ghost" variant="ghost" />
          <NextGenButton text="Danger" variant="danger" />
          <NextGenButton text="Loading" loading />
          <NextGenSaveButton onClick={() => setModalVisible(true)} text="Open Modal" />
        </div>
      </NextGenAccordion>

      <NextGenModal
        visible={modalVisible}
        setVisible={setModalVisible}
        Header="Sample NextGen Modal"
        modalWidth="480px"
        modalData={{ textValue, selectValue, multiValue }}
        handleAPI={(data) => {
          console.log("NextGen modal save:", data);
          setModalVisible(false);
        }}
      >
        <p>This modal is the unified NextGen replacement for both legacy Modal.jsx variants.</p>
      </NextGenModal>
    </div>
  );
}
