import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import FullTextEditor from "../../../../components/formComponent/TextEditor";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { CustomButton } from "../../../../components/UI/CustomButton";

const AddRemark = ({ type, onClose, itemId, existingRemark, qcType="QC", onEqasAdd, }) => {
  console.log(existingRemark, "existingRemark");
  console.log(itemId, "itemId");
  const [options, setOptions] = useState([]);
  const dispatch = useDispatch();

  const [payload, setPayload] = useState({
    QCType: "",
    Remarks: existingRemark || "",
    RemarkId: "",
  });
  const [Editor, setEditor] = useState("");
  const [Editable, setEditable] = useState(true);

  const handleSelectChange = (name, e) => {
    if (!e) return;
    const label = e.label;
    const value = e.value.toString();
    setPayload((prev) => ({ ...prev, [name]: label, RemarkId: value }));
    getRemarkDetail(value);
  };

  const getRemarks = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetRemarks, {
        type: type,
      })
      .then((res) => {
        console.log(res, "res");
        if (res?.data?.success) {
          // Assuming API returns something like: [{ id, name }]
          const optionList = res?.data?.data.map((item) => ({
            label: item.Remarks,
            value: item.ID,
          }));
          setOptions(optionList);
        }
      })
      .catch((err) => {
        console.log(err);
        notify(err?.respose?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getRemarkDetail = async (RemarkId) => {
    // dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetRemarkDetail, {
        id: RemarkId,
      })
      .then((res) => {
        console.log(res, "res");
        if (res?.data?.success) {
          const remark = res?.data?.data?.remark || "";
          setPayload((prev) => ({ ...prev, Remarks: remark }));
          setEditable(true);
          setEditor(remark);
        } else {
          notify(res?.data?.message || "Failed to fetch remark", "error");
        }
      })
      .catch((err) => {
        console.log(err);
        notify(err?.respose?.data?.message, "error");
      })
      .finally(() => {
        // dispatch(setLoading(false));
      });
  };

  const handleAddClick = () => {
    onEqasAdd?.(itemId, payload.Remarks, type);   // ✅ row-specific
  };

  const saveRemarks = async () => {
    const searchPayload = {
      macDataId: itemId.toString(),
      type: type,
      qcType: qcType || "QC",
      comment: payload.Remarks,
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.SaveRcaAndCapa, searchPayload)
      .then((res) => {
        console.log(res, "res");
        notify("Saved successfully!", "success");
        onClose();
      })
      .catch((err) => {
        console.log(err);
        notify(err?.respose?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const removeRemarks = async () => {

    let api = "";

    if(qcType === "QC"){
      api = "QCReport/RemoveRcaAndCapa";
    }
    else{
      api = "EQAS/RemoveRcaAndCaPa";
    }

    const searchPayload = {
      macDataId: itemId.toString(),
      type: type,
      qcType: qcType || "QC",
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(api, searchPayload)
      .then((res) => {
        console.log(res, "res");
        notify("Removed successfully!", "success");
        onClose();
      })
      .catch((err) => {
        console.log(err);
        notify(err?.respose?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    if (existingRemark) {
      setPayload((prev) => ({ ...prev, Remarks: existingRemark }));
    }
    getRemarks();
  }, [existingRemark]);

  console.log("payload", payload);
  

  return (
    <>
      <div className="container-fluid">
        <div className="row p-2">
          {/* Dropdown */}

          <ReactSelect
            name="QCType"
            id="QCType"
            removeIsClearable={true}
            dynamicOptions={options}
            value={payload?.QCType}
            placeholderName={`Select ${type}`}
            onChange={handleSelectChange}
            isShowBorder={true}
            respclass={"col-xl-4 col-sm-6 col-md-6 col-12"}
          />

          {/* Action buttons */}
        </div>
        <div className="row pt-2 pl-2 pr-2">
          {/* FullTextEditor */}
          <div className="col-sm-12">
            <FullTextEditor
              value={payload.Remarks}
              setValue={(newVal) => {
                setEditor(newVal);
                setPayload((prev) => ({
                  ...prev,
                  Remarks: newVal,
                }));
              }}
              EditTable={Editable}
              setEditTable={setEditable}
              height="50"
            />
          </div>
        </div>
        <div className="row d-flex justify-content-center mt-2">
          {/* <Button className="rounded py-0 mx-2" onClick={saveRemarks}>
            Save
          </Button>
          <Button className="rounded py-0 mx-2" onClick={onClose}>
            Close
          </Button>
          <Button className="rounded py-0 mx-2" onClick={removeRemarks}>
            Remove
          </Button> */}
          {
            qcType === "EQAS" &&

            (
              <>
                <CustomButton text="Add" className="mx-2 mb-1" icon="save" onClick={handleAddClick} />
                <CustomButton text="Remove" className="mx-2 mb-1" icon="delete" onClick={removeRemarks} />
              </>
            )

            
          }

          {
            qcType === "QC" && (
              <>
                  <CustomButton text="Save" className="mx-2 mb-1" icon="save" onClick={saveRemarks} />
            <CustomButton text="Remove" className="mx-2 mb-1" icon="delete" onClick={removeRemarks} />
              </>
            )
            
          }

          {
            qcType === "ILC" && (
              <>
                  <CustomButton text="Save" className="mx-2 mb-1" icon="save" onClick={handleAddClick} />
                  <CustomButton text="Remove" className="mx-2 mb-1" icon="delete" onClick={removeRemarks} />
              </>
            )
            
          }
          
          <CustomButton text="Close" className="mx-2 mb-1" icon="cancel" onClick={onClose} />
          {/* <CustomButton text="Remove" className="mx-2 mb-1" icon="delete" onClick={removeRemarks} /> */}
        </div>
      </div>
    </>
  );
};

export default AddRemark;
