import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Input from "../../../components/formComponent/Input";
import { axiosInstance } from "../../../utils/axiosInstance";
import { Button } from "react-bootstrap";
import Tables from "../../../components/UI/customTable";
import { FaTags } from "react-icons/fa6";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";

const TagDoctorModal = ({
  show,
  onHide,
  States,
  Cities: InitialCities = [],
  onDoctorSelect,
  mode = "doctor", // "doctor" | "hospital"
}) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const isHospital = mode === "hospital";

  const [load, setLoad] = useState(false);
  const [Cities, setCities] = useState(InitialCities);
  const [tableData, setTableData] = useState([]);

  const [modalData, setModalData] = useState({
    DoctorName: "",
    hospitalName: "",
    StateId: "",
    CityId: "",
  });

  /* -------------------- handlers -------------------- */

  const handleClose = () => {
    setModalData({
      DoctorName: "",
      hospitalName: "",
      StateId: "",
      CityId: "",
    });
    setCities([]);
    setTableData([]);
    onHide(false);
  };

  const handleReactChange = (name, option) => {
    setModalData((prev) => ({
      ...prev,
      [name]: option?.value ?? "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModalData((prev) => ({ ...prev, [name]: value }));
  };

  /* -------------------- API -------------------- */

  const getCityDropDown = async (stateId) => {
    try {
      const res = await axiosInstance.post("SalesFunnel/BindCity", {
        StateId: stateId,
      });

      const data = res?.data?.message || [];
      const cityOptions = data.map((c) => ({
        value: c.Id,
        label: c.City,
      }));

      setCities(cityOptions);
    } catch (err) {
      console.error(err);
      setCities([]);
    }
  };

  const getSearchData = async (mode) => {
    setLoad(true);

    let apiUrl = "";
    let payload = {};

    if (mode === "hospital") {
      apiUrl = "SalesFunnel/SearchTEH";
      payload = {
        HospName: modalData.hospitalName || "",
        StateId: String(modalData.StateId || ""),
        CityId: String(modalData.CityId || ""),
      };
    } else {
      apiUrl = "SalesFunnel/SearchTED";
      payload = {
        DoctorName: modalData.DoctorName || "",
        StateId: String(modalData.StateId || ""),
        CityId: String(modalData.CityId || ""),
      };
    }

    try {
      const res = await axiosInstance.post(apiUrl, payload);

      // ✅ ONLY FIX IS HERE
      setTableData(
        mode === "hospital"
          ? res?.data?.message || []
          : res?.data?.data || []
      );
    } catch (err) {
      console.error(err);
      setTableData([]);
    } finally {
      setLoad(false);
    }
  };
  /* -------------------- effects -------------------- */

  useEffect(() => {
    if (modalData.StateId) {
      getCityDropDown(String(modalData.StateId));
    }
  }, [modalData.StateId]);

  /* -------------------- UI -------------------- */

  return (
    <Dialog
      header={t(
        isHospital ? "Tag Existing Hospital" : "Tag Existing Doctor"
      )}
      visible={show}
      onHide={handleClose}
      className={theme}
      style={{ width: isMobile ? "85vw" : "60vw" }}
    >
      {/* Search Filters */}
      <div className="row g-2 p-2 align-items-end">
        <div className="col-sm-3">
          <ReactSelect
            dynamicOptions={[{ label: "Select", value: "" }, ...States]}
            name="StateId"
            lable={t("State")}
            placeholderName={"State"}
            value={modalData.StateId}
            onChange={handleReactChange}
          />
        </div>

        <div className="col-sm-3">
          <ReactSelect
            dynamicOptions={[{ label: "Select", value: "" }, ...Cities]}
            name="CityId"
            lable={t("City")}
            placeholderName={"City"}
            value={modalData.CityId}
            onChange={handleReactChange}
          />
        </div>

        {isHospital ? (
          <div className="col-sm-3">
            <Input
              type="text"
              name="hospitalName"
              lable={t("HospitalName")}
              value={modalData.hospitalName}
              onChange={handleChange}
            />
          </div>
        ) : (
          <div className="col-sm-3">
            <Input
              type="text"
              name="DoctorName"
              lable={t("DoctorName")}
              value={modalData.DoctorName}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="col-sm-1">
          <Button
            className="btn btn-primary btn-sm w-100"
            onClick={() => getSearchData(mode)}
            disabled={load}
          >
            {load ? t("Searching...") : t("Search")}
          </Button>
        </div>
      </div>

      {/* Result Table */}
      <Tables>
        <thead className="text-center">
          <tr>
            <th className="text-center">Tag</th>
            <th>{t(isHospital ? "Hospital" : "Doctor")}</th>

            {!isHospital && (
              <>
                <th>{t("Specilization")}</th>
                <th>{t("Mobile")}</th>
                <th>{t("Address")}</th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={isHospital ? 2 : 5} className="text-center">
                {t("No Data Found")}
              </td>
            </tr>
          ) : (
            tableData.map((item, index) => (
              <tr key={index}>
                <td className="text-center">
                  <FaTags
                    role="button"
                    title={t("Tag")}
                    onClick={() => onDoctorSelect(item)}
                  />
                </td>

                <td>
                  {isHospital
                    ? item.OrganizationName
                    : item.DoctorName}
                </td>

                {!isHospital && (
                  <>
                    <td>{item.Specialization}</td>
                    <td>{item.Mobile}</td>
                    <td>{item.Address}</td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Tables>
    </Dialog>
  );
};

export default TagDoctorModal;