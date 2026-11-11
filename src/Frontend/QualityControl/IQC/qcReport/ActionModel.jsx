import React, { useState } from "react";
import Modal from "../../../../components/ModalComponent/Modal";
import { Button } from "react-bootstrap";
import RadioInput from "../../../../components/formComponent/RadioInput";
import { CustomButton } from "../../../../components/UI/CustomButton";

const ActionModal = ({ type, onClose, onContinue }) => {
  const [selectedOption, setSelectedOption] = useState("comment");
  console.log("selectedOption",selectedOption);

  return (
    <Modal visible={true} setVisible={onClose} modalWidth="40vw" Header={type}>
      <div className="container-fluid">
        <div className=" row mb-3">
          {/* Radio buttons */}
          <div className="">
            <RadioInput
              type="radio"
              label="Comment"
              name="option"
              value="comment"
              checked={selectedOption === "comment"}
              onChange={(e) => {
                console.log("value",e);
                setSelectedOption("comment")
              }}
              respclass={"mr-3"}
            />
          </div>
          <div className="">
            <RadioInput
              type="radio"
              label="Checklist"
              name="option"
              value="checklist"
              checked={selectedOption === "checklist"}
              onChange={(e) => {
                console.log("value",e);
                setSelectedOption("checklist")
              }}
              respclass={"mr-3"}
            />
          </div>

          {/* Action buttons */}
        </div>
        <div className="row mb-3 d-flex justify-content-center">
          {/* <Button
            className="rounded py-0 mx-2"
            onClick={() => onContinue(selectedOption)}
          >
            Continue
          </Button>
          <Button className="rounded py-0 mx-2" onClick={onClose}>
            Close
          </Button> */}
          <CustomButton text="Continue" className="mx-2 mb-1" icon="forword" onClick={() => onContinue(selectedOption)} />
            <CustomButton text="Close" className="mx-2 mb-1" icon="cancel" onClick={onClose} />
        </div>
      </div>
    </Modal>
  );

  
};

export default ActionModal;
