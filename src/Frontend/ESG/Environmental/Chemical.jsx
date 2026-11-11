import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import UploadFile from "../../utils/UploadFileModal/UploadFile"
import { guidNumber } from "../../../utils/generateGuid"

const Chemical = ({ editData, setEditData }) => {
  const [t] = useTranslation()
  const [centre, setCentre] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFileModal, setShowFileModal] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [payload, setPayload] = useState({
    CentreId: "",
    ChemicalName: "",
    Quantity: "",
    PurchaseDate: new Date(),
    FilePath: "",
    IsActive: 1
  })

  useEffect(() => {
    if (editData) {
        setPayload({
            Id: editData?.Id,
            CentreId: editData?.CentreId,
            ChemicalName: editData?.ChemicalName || "",
            Quantity: editData?.Quantity || "",
            PurchaseDate: editData?.PurchaseDate ? new Date(editData.PurchaseDate) : new Date(),
            FilePath: editData?.FilePath || "",
            IsActive: editData?.IsActive ?? 1,
        });
    }
}, [editData]);

  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      const data = res.data.message;
      const CentreDataValue = data.map((ele) => {
        return {
          value: ele.CentreID,
          label: ele.Centre,
        };
      });
      setCentre(CentreDataValue);
    } catch (error) {
      console.log("Error while fetching centres");
    }
  };

  useEffect(() => {
    getAccessCentres();
  }, [])

  const handleDateChange = (value, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReactSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value?.value
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name,value)
    setPayload({ ...payload, [name]: value });
  };

  const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

  const handleOpenUploadModal = () => {
    const currentGuid = payload.FilePath ? payload.FilePath : guidNumber();
    setPayload(prev => ({ ...prev, FilePath: currentGuid }));
    setShowFileModal({
      modal: true,
      data: currentGuid,
      index: -1,
    });
  };

  const handleCaptureUploadedFile = (name, count, isUploaded) => {
    if (count > 0) {
      toast.success(`${count} file(s) linked successfully.`);
    }
  };

  const handleSave = async () => {
    console.log("payload", payload)
    const { CentreId, ChemicalName, Quantity, PurchaseDate, FilePath, IsActive } = payload;
    if (!CentreId) {
      toast.error(t("Please select a Centre"));
      return
    }
    if (!ChemicalName) {
      toast.error(t("Please select Chemical Name"));
      return
    }
    if (!Quantity) {
      toast.error(t("Please select Quantity"));
      return
    }
    if (!PurchaseDate) {
      toast.error(t("Please select Purchase Date"));
      return
    }

    setLoading(true);
    const finalPayload = {
      id: payload.Id,
      centreId: CentreId,
      chemicalName: ChemicalName,
      quantity: Number(Quantity),
      purchaseDate: PurchaseDate,
      filePath: FilePath,
      isActive: IsActive
    }

    try {
            const res = await axiosInstance.post("ESG/AddOrUpdateChemicalInventory", finalPayload);
            const data = res?.data;
            if (data?.success) {
                toast.success(`Chemical data ${editData ? "updated" : "added"}.`)
                setEditData(null)

                setPayload({
                  CentreId: "",
                  ChemicalName: "",
                  Quantity: "",
                  PurchaseDate: new Date(),
                  FilePath: "",
                  IsActive: 1
                })
            } else {
                toast.error(data?.message || "Error while adding data")
            }
        } catch (error) {
            console.log("Error while adding data", error)
        } finally {
            setLoading(false)
        }
  }

  return (
    <>
      <div className="row px-2 py-2">
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <ReactSelect
            dynamicOptions={centre}
            name="CentreId"
            lable={t("Centre")}
            id="CentreId"
            removeIsClearable={true}
            placeholderName={t("Select Centre")}
            value={payload.CentreId}
            onChange={handleReactSelectChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <Input
            className="select-input-box form-control input-sm"
            type="text"
            name="ChemicalName"
            id="ChemicalName"
            lable={"Purchase Item"}
            value={payload.ChemicalName}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <Input
            className="select-input-box form-control input-sm"
            type="number"
            name="Quantity"
            id="Quantity"
            lable={"Quantity (in KG)"}
            value={payload.Quantity}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            name="date"
            id="WasteMonth"
            lable={t("Select Date")}
            value={payload.PurchaseDate}
            onChange={handleDateChange}
            className="custom-calendar"
          />
        </div>
        <div className="col-auto mb-3 d-flex align-items-end">
          <CustomButton
            text={payload.FilePath ? t("File Linked") : t("Upload file")}
            onClick={handleOpenUploadModal}
          />
        </div>
        <div className="col-auto mb-3 d-flex align-items-center" style={{ gap: "5px" }}>
          <label className="switch mb-0">
            <input
              type="checkbox"
              checked={payload.IsActive === 1}
              onChange={() => handleToggle("IsActive")}
            />
            <span className="slider"></span>
          </label>
          <strong>
            <span>{t("IsActive")}</span>
          </strong>
        </div>
        <div className="col-auto mb-3 d-flex align-items-end">
          <CustomButton
            text={editData ? "Update" : "Add to inventory"}
            icon={editData ? "edit" : "save"}
            onClick={handleSave}
            disabled={loading}
          />
        </div>
      </div>

      {showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => {
            setShowFileModal({ modal: false, data: "", index: -1 });
          }}
          // options={Identity}
          documentId={showFileModal?.data}
          pageName="Chemical"
          handleUploadCount={handleCaptureUploadedFile}
        />
      )}
    </>
  )
}

export default Chemical