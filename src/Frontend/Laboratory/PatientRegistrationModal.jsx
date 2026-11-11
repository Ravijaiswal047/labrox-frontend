import { Dialog } from "primereact/dialog";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { useDispatch } from "react-redux";
import { setLoading, setRefLabModalData } from "../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../utils/utils";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";

const PatientRegistrationModal = ({ onHide, show }) => {
  const dispatch = useDispatch();
  const theme = useLocalStorage("theme", "get");
  const [payload, setPayload] = useState({
    refLabName: "",
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, checked } = e?.target;
    if (name == "isActive") {
      setPayload((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const saveReferLab = async () => {
    if (!payload?.refLabName) {
      notify("Name is required.", "warn");
      return;
    }
    const refLabPayload = {
      name: payload?.refLabName,
      isActive: payload?.isActive ? 1 : 0,
      type: "Insert",
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls?.InsertReferalLab, refLabPayload)
      .then((res) => {
        console.log('res::::', res);
        if (res?.data?.success) {
          notify(res?.data?.message, "success");
          dispatch(setRefLabModalData(res?.data?.data))
          handleReset("", true);
          onHide();
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleReset = (labName='', isAct=false) => {
    setPayload((prev) => ({ ...prev, refLabName: "", isActive: isAct }));
  };

  return (
    <>
      <Dialog
        header={`Add new Referred Lab Name`}
        visible={show}
        onHide={onHide}
        className={`${theme}`}
        style={{ width: "375px" }}
        breakpoints={{ "475px": "95vw" }}
      >
        <div className="d-flex w-100 justify-content-start">
          <div className="col-md-8 col-sm-5 col-12">
            <Input
              lable="RefLabe Name"
              id="refLabName"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={payload?.refLabName}
              name="refLabName"
              className={"w-100"}
            />
          </div>
          <div style={{ fontWeight: 600 }} className="col-2 mb-0 d-none">
            <Form.Check
              type="checkbox"
              itemID="isActive"
              name="isActive"
              id="isActive"
              checked={payload?.isActive}
              onChange={handleChange}
              label={"IsActive"}
              className="fw-bold cursor-pointer"
            />
          </div>
        </div>
        <div
          style={{ gap: "8px" }}
          className="d-flex justify-content-center mt-2"
        >
          <SaveButton
            text={"Save"}
             onClick={saveReferLab}
            style={{ gap: "3px" }}
          />  
          <CancelButton
              text={"Close"}
              onClick={onHide}
            style={{ gap: "3px" }}
          />
        </div>
      </Dialog>
    </>
  );
};

export default PatientRegistrationModal;
