import { useState } from "react";

import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import Input from "../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
const SpecializationModal = ({ show, onHide, refresh }) => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [AddSpecialization, setAddSpecialization] = useState({
    Specialization: "",
  });

  const handleChangeAddSpecialization = (e) => {
    const { name, value } = e.target;
    setAddSpecialization({
      ...AddSpecialization,
      [name]: value,
    });
  };
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const SaveNewSpecializationRequest = async () => {
    try {
      setLoad(true);

      const res = await axiosInstance.post(
        "SalesFunnel/SaveNewSpecialization",
        {
          Specialization: AddSpecialization?.Specialization || "",
        }
      );

      if (res?.data?.success) {
        toast.success(res?.data?.message);
        onHide(false);
        refresh?.();
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoad(false);
    }
  };

  const handleModalClose = () => {
    refresh?.();
    setAddSpecialization({ Specialization: "" });
    onHide(false);
  };

  return (
    <>
      <Dialog
        header={"Funnel Detail"}
        visible={show}
        onHide={handleModalClose}
        className={theme}
        style={{
          width: isMobile ? "80vw" : "50vw",
        }}
      >
        <div className="row">
          <div className="col-sm-6">
            <Input
              className="required-fields"
              type="text"
              name="Specialization"
              id="Specialization"
              lable={t("New Specialization")}
              placeholder=""
              onChange={handleChangeAddSpecialization}
              value={AddSpecialization?.Specialization}
            />
          </div>
        </div>

        <div className="mt-3 d-flex ">
          <button
            className="btn btn-success btn-sm me-2 mr-2"
            onClick={SaveNewSpecializationRequest}
          >
            {load ? "Saving..." : t("Save")}
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleModalClose}>
            {t("Close")}
          </button>
        </div>
      </Dialog>
    </>
  );
};

export default SpecializationModal;
