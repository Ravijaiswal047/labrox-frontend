import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import ReactPrimeTextEditor from "../../components/formComponent/ReactPrimeTextEditor";
import FullTextEditor from "../../components/formComponent/TextEditor";
import { SelectBox } from "../../components/formComponent/SelectBox";

function ResultEditAddModal({ show, handleClose, handleSave, DepartmentData, resultData, getDignosticMasterData, DignosticMaster }) {
  const [EditTable, setEditTable] = useState(true);
  const [EditData, setEditData] = useState(show?.data);
  const [SelectedBox, setSelectedBox] = useState([]);

  const { t } = useTranslation();
  console.log({resultData, show, EditData})


  DepartmentData?.find((data)=>data?.value == resultData?.DepartmentID)
  // const [formdata, setFormData] = useState({
  //   DignosticMasterID: "",
  // });
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setEditData({ ...EditData, [name]: value });
  };
useEffect(() => {
      getDignosticMasterData();
    }, []);

  // i18n end
  const getInvestigationsListData = () => {
    axiosInstance
      .post("InvestigationCommentMaster/getInvestigationCommentData", {
        InvestigationID: Array.isArray(show?.data?.labObservationID)
          ? show?.data?.labObservationID
          : [show?.data?.labObservationID],
        Template: "",
        TemplateText: "",
      })
      .then((res) => {
        if (res.status === 200) {
          setSelectedBox(res.data.message);
        }
        if (res?.data?.message.length === 0) {
          toast.success(t("No Data Found"));
        }
      })
      .catch((err) => console.log(err));
  };

  const handleDropdown = (e) => {
    const { value } = e.target;
    console.log("valuexx", value);
    setEditTable(true);
    setEditData({ ...EditData, COMMENT: value });
  };

  useEffect(() => {
    getInvestigationsListData();
  }, []);
  const theme = useLocalStorage("theme", "get");
  const handleChange = (data) => {
    setEditData({ ...EditData, COMMENT: data });
  };

  console.log("showxxx",show);
  console.log("SelectedBox",SelectedBox);

  return (
    <Dialog visible={show} onHide={handleClose} className={theme}>
      <div className="">
        <div className="row mb-3">
          <label className="col-sm-2">{t("Select Comment")}:</label>
          <div className="col-sm-10 m-0 p-0 ">
            <select
              className="select-input-box form-control input-sm "
              onChange={handleDropdown}
            >
              <option>{t("Select")}</option>
              {SelectedBox?.map((ele) => (
                <option value={ele?.TemplateText}>{ele?.Template}</option>
              ))}
            </select>
          </div>
        </div>
        <FullTextEditor
          value={EditData?.COMMENT}
          EditTable={EditTable}
          setEditTable={setEditTable}
          setValue={handleChange}
        />
        {/* <ReactPrimeTextEditor
          value={EditData?.COMMENT}
          EditTable={EditTable}
          setEditTable={setEditTable}
          setValue={handleChange}
        /> */}
        {resultData[0]?.DepartmentID==39 && (

        <div className="row mt-2 mb-2">
          <div className="col-sm-4">
            <SelectBox
              className="required-fields"
              options={[{ label: "DignosticMaster...", value: "" }, ...DignosticMaster]}
              id="Dignomasterid"
              lable="Dignomasterid"
              selectedValue={EditData?.Dignomasterid}
              onChange={handleSelectChange}
              name="Dignomasterid"
            />
          </div>
        </div>
        )}

        <div className="row mt-2 mb-2">
          <div className="col-sm-6">
            <button
              type="button"
              className="btn btn-block btn-success btn-sm"
              onClick={() => handleSave(EditData, "AddComment")}
            >
              {t("Save")}
            </button>
          </div>
          <div className="col-sm-6">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={handleClose}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default ResultEditAddModal;
