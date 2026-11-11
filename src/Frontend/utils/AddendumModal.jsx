import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import FullTextEditor from "../../components/formComponent/TextEditor";
import ShowAddendumListModal from "./ShowAddendumListModal";

function AddendumModal({ show, handleShow, data, TableData, AddendumComment }) {
  const { t } = useTranslation();
  const [EditTable, setEditTable] = useState(true);
  const [EditData, setEditData] = useState(null);
  const [showList,setShowList] = useState({
    modal: false,
    data:"",
  })
  const handleChange = (data) => {
    setEditData({ ...EditData, Comment: data });
  };

  useEffect(() => {
    if (AddendumComment && AddendumComment.length > 0) {
      setEditData(AddendumComment[0]);
    }
  }, [AddendumComment]);

  const handleSubmit = () => {
    axiosInstance
      .post("Re/SaveAddendum", {
        Comments: EditData?.Comment,
        TestID: data?.TestID,
        InvestigationID: String(data?.InvestigationID)
      })
      .then((res) => {
        handleShow();
        toast.success(res.data?.message);
        TableData("");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Error Occurred"),
        );
      });
  };

  const getAddendumList = async () => {
      try {
        const res = await axiosInstance.post("Re/GetAddendum", {
          TestID: data?.TestID,
          ShowAddendumList:1,
        });
  
        if (res?.data?.success && res?.data?.message?.length > 0) {
          setShowList({
          modal: true,
          data: res?.data?.message,
        });
        } else {
          toast.error("No data found")
          setShowList({
          modal: false,
          data: "",
        });
        }

      } catch (err) {
        toast.error(
          err?.response?.data?.message || t("Error Occurred")
        );
      }
    };

  const theme = useLocalStorage("theme", "get");
  return (
    <>
      {showList.modal && (
        <ShowAddendumListModal 
          show={showList?.modal}
          handleShow={()=>setShowList({modal:false, data:""})}
          data = {showList?.data}
        />
      )}
      <Dialog
        visible={show && EditData}
        header={t("Addendum Comment")}
        top={"10%"}
        onHide={handleShow}
        className={theme}
      >
        <div className="">
          <FullTextEditor
            value={EditData?.Comment || ""}
            EditTable={EditTable}
            setEditTable={setEditTable}
            setValue={handleChange}
          />
        </div>

        <div className="row mt-2">
          <div className="col-sm-4 p-1">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={getAddendumList}
            >
              {t("Addendum List")}
            </button>
          </div>
          <div className="col-sm-4 p-1">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={handleSubmit}
            >
              {t("Save")}
            </button>
          </div>
          <div className="col-sm-4 p-1">
            <button
              type="button"
              className="btn btn-block btn-secondary btn-sm"
              onClick={handleShow}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </Dialog>
    </>

  );
}

export default AddendumModal;
