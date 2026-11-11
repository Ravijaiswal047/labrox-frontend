import React, { useState } from "react";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";

const AddNewPackageModal = ({setIsOpen}) => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState({
    ItemName: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <div className="modal-body">
        <form>
          <div className="row">
            <Input
              type="text"
              placeholder=" "
              lable="Package"
              id="Package"
              name="Package"
              value={payload?.Package}
              onChange={handleChange}
              className={"required-fields"}
              respclass={"col-12"}
            />
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={setIsOpen}>Close</button>
        <button type="button" className="btn btn-primary">
          Save
        </button>
      </div>
    </>
  );
};

export default AddNewPackageModal;
