import { useEffect, useState } from "react"
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next"
import DatePicker from "../../../components/formComponent/DatePicker"
import Input from "../../../components/formComponent/Input"
import { SearchButton } from "../../../components/UI/CustomButton"
import { axiosInstance } from "../../../utils/axiosInstance"
import moment from "moment"
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"
import Tables from "../../../components/UI/customTable";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";

const ChemicalSearch = ({onEdit}) => {
  const [t] = useTranslation()
  const [centre, setCentre] = useState([])
  const [payload, setPayload] = useState({
    CentreId: [],
    ChemicalName: "",
    FromDate: new Date(),
    ToDate: new Date(),
  })
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])


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
    getAccessCentres()
  }, [])

  const handleMultiSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  const handleDateChange = (value, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSearch = async () => {
    const finalPayload = {
      CentreId: payload.CentreId,
      ChemicalName: payload.ChemicalName,
      FromDate: payload.FromDate,
      ToDate: payload.ToDate,
    }

    try {
      const res = await axiosInstance.post("ESG/GetChemicalInventoryReport", finalPayload);
      const data = res?.data;
      if (data?.success) {
        setTableData(data?.message || []);
      }
    } catch (error) {
      console.log("Error while fetching data", error)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="row px-2 py-2">
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <MultiSelectComp
            label="All Centre"
            options={centre}
            value={payload?.CentreId}
            name="CentreId"
            id="CentreId"
            onChange={handleMultiSelectChange}
            lable={t("Select Centre")}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <Input
            className="select-input-box form-control input-sm"
            type="text"
            name="ChemicalName"
            id="ChemicalName"
            lable={"Chemical Name"}
            value={payload.ChemicalName}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            name="FromDate"
            id="FromDate"
            lable={t("FromDate")}
            value={payload.FromDate}
            className="custom-calendar"
            onChange={handleDateChange}
            maxDate={payload?.ToDate}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            name="ToDate"
            id="ToDate"
            lable={t("ToDate")}
            value={payload.ToDate}
            className="custom-calendar"
            onChange={handleDateChange}
            maxDate={new Date()}
            minDate={payload.FromDate}
          />
        </div>

        <div className="col-12 col-sm-6 col-md-2 my-1">
          <SearchButton
            text={"Search"}
            onClick={handleSearch}
          />
        </div>
      </div>

      <Accordion title={t("Search Data")} defaultValue={true}>
        {tableData.length > 0 ? (
          <div className="row px-1">
            <div className="col-12">
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Centre")}</th>
                    <th>{t("Chemical Name")}</th>
                    <th>{t("Quantity(Kgs)")}</th>
                    <th>{t("Purchase Date")}</th>
                    <th>{t("Created At")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData && tableData.map((data, index) => (
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}</td>
                      <td data-title={t("Centre")}>{data?.Centre}</td>
                      <td data-title={t("Chemical Name")}>{data?.ChemicalName}</td>
                      <td data-title={t("Quantity")}>
                        {data?.Quantity} {t("Units")}
                      </td>
                      <td data-title={t("Purchase Date")}>
                        {data?.PurchaseDate?.split(" ")[0]}
                      </td>
                      <td data-title={t("Created At")}>{data?.dtEntry}</td>
                      <td data-title={t("Action")}>
                          <button 
                              className="btn btn-xs btn-primary" 
                              onClick={() => onEdit(data)}
                          >
                              <i className="fa fa-edit"></i>
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  )
}

export default ChemicalSearch;