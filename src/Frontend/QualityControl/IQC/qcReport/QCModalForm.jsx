import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { notify } from "../../../../utils/utils";
import { CustomButton } from "../../../../components/UI/CustomButton";

const QCModalForm = ({ labelText, confirmText, onCancel, onConfirm, icon="" }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      notify(`Please provide a ${labelText}`, "error");
      return;
    }
    onConfirm(inputValue); // pass comment/reason upwards
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-sm-12">
            <Input
              type="text"
              lable={t(labelText)}
              name={labelText}
              respclass="w-100"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-12 d-flex justify-content-center">
          {/* <Button
            onClick={handleSubmit}
            className="rounded py-0 mx-2"
            variant="success"
          >
            {confirmText}
          </Button>
          <Button
            onClick={onCancel}
            className="rounded py-0 mx-2"
            variant="secondary"
          >
            Cancel
          </Button> */}
          <CustomButton text={confirmText} className="mx-2 mb-1" icon={icon}
                                onClick={handleSubmit} />
                                <CustomButton text="Cancel" className="mx-2 mb-1" icon="cancel"
                                onClick={onCancel} />
        </div>
      </div>
    </>
  );
};

export default QCModalForm;
