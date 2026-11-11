import React, { useEffect } from "react";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";

export default function RemainingAuthorizationModal({
  setModalHandlerState,
  dropDownState,
  selected,
  selectedEmp,
}) {
  const [payload, setPayload] = React.useState({
    TypeOfAutheriZion: [
      { name: selected?.TextField, code: selected?.ValueField, disabled: true },
    ],
    Employee: [],
  });


  useEffect(() => {
      setModalHandlerState((val) => ({ ...val, modalData: { ...val.modalData, TypeOfAutheriZion: [{ name: selected?.TextField, code: selected?.ValueField, disabled: true }] } }));
  },[])
  const handleMultiSelectChange = (name, selectedOptions) => {
    setPayload({ ...payload, [name]: selectedOptions });
    setModalHandlerState((val) => ({ ...val, modalData: { ...val.modalData, [name]: selectedOptions } }));
  };
  return (
    <div className="row">
      <MultiSelectComp
        className="col-xl-6 col-md-6  col-12"
        name="TypeOfAutheriZion"
        id="TypeOfAutheriZion"
        placeholder="Type Of AutheriZion"
        label="Type Of AutheriZion"
        options={dropDownState?.usertypeApprovalList?.map((item) => ({
          name: item?.TextField,
          code: item?.ValueField,
          disabled: item?.ValueField === selected?.ValueField ? true : false,
        }))}
        onChange={handleMultiSelectChange}
        value={payload?.TypeOfAutheriZion}
      />
      <MultiSelectComp
        className="col-xl-6 col-md-6 col-12"
        name="Employee"
        id="Employee"
        placeholder="Employee"
        // label="Employee"
        options={dropDownState?.BindEmplyee?.filter((val)=>(val?.ValueField !== selectedEmp?.value))?.map((item) => ({
          name: item?.TextField,
          code: item?.ValueField,
          disabled: item?.ValueField === selected?.ValueField ? true : false,
        }))}
        onChange={handleMultiSelectChange}
        value={payload?.Employee}
      />
    </div>
  );
}
