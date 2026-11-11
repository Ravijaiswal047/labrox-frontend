import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { getTrimmedData } from "../../utils/helpers";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";

const ManageHoliday = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [update, setUpdate] = useState(false);
  const [AllCenter, setAllCenter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    CentreID: "",
    Holiday: new Date(),
    IsActive: "",
    ID: "",
  });
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name == "CentreID") {
      setPayload({
        ...payload,
        [name]: value,
      });
      value == ""
        ? getTableDataHandler(AllCenter?.map((ele) => ele?.value))
        : getTableDataHandler([Number(value)]);
    } else {
      setPayload({ ...payload, [name]: type === "checkbox" ? checked : value });
    }
  };

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };

  const EditTableDataHandler = (ele) => {
    setPayload({
      ...payload,
      CentreID: ele?.CentreID,
      Holiday: new Date(ele?.Holiday),
      ID: ele?.ID,
      IsActive: ele?.IsActive == 1 ? true : false,
    });
  };
  const getTableDataHandler = (id) => {
    setLoading(true);
    axiosInstance
      .post("ManageDeliveryDays/getHolidays", {
        CentreID: Array.isArray(id) ? id : [id],
      })
      .then((res) => {
        if (res?.data.success) {
          setTableData(res?.data?.message);
        } else {
          setTableData([]);
          toast.error(res?.data?.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setTableData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Wents Wrong",
        );
        setLoading(false);
      });
  };

  const handleSubmit = () => {
    if (payload?.CentreID) {
      setLoading(true);

      axiosInstance
        .post(
          `ManageDeliveryDays/${update ? "UpdateHolidays" : "saveHolidays"}`,
          getTrimmedData({
            ...payload,
            ID: payload?.ID?.toString(),
            CentreID: payload.CentreID,
            IsActive: payload.IsActive ? 1 : 0,
            Holiday: moment(payload?.Holiday).format("DD-MMM-YYYY"),
          }),
        )
        .then((res) => {
          setUpdate(false);
          toast.success(res?.data?.message);
          getTableDataHandler(payload.CentreID);
          setLoading(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data.message
              ? err?.response?.data.message
              : "Something Went wrong",
          );
          setLoading(false);
        });
    } else {
      toast.error("Please Select Centre");
    }
  };
  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        console.log(data);
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });

        getTableDataHandler(CentreDataValue?.map((ele) => ele?.value));
        setAllCenter(CentreDataValue);
      })
      .catch((err) => {
        getTableDataHandler([]);
        console.log(err);
      });
  };
  useEffect(() => {
    getAccessCentres();
  }, []);
  return (
    <>
      <Accordion
        name={t("Manage Holiday")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              options={[{ value: "", label: "Select Centre" }, ...AllCenter]}
              className="required-fields"
              name="CentreID"
              selectedValue={payload?.CentreID}
              onChange={handleChange}
              lable="Centre Name"
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="Holiday"
              id="ToDate"
              placeholder=" "
              value={payload?.Holiday}
              onChange={dateSelect}
              minDate={new Date()}
              lable="Holiday Date"
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                id="IsActive"
                type="checkbox"
                name="IsActive"
                checked={payload?.IsActive}
                onChange={handleChange}
                lable="isActive"
              />
            </div>
            <label className="col-sm-10">{t("IsActive")}</label>
          </div>
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <button
                className="btn btn-primary btn-sm btn-block"
                onClick={handleSubmit}
              >
                {update ? t("Update") : t("Add")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {tableData.length > 0 && (
          <div className="row p-2">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Centre Name</th>
                    <th>Holiday Date</th>
                    <th>IsActive</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((ele, index) => (
                    <tr key={index}>
                      <td data-title="Sr No.">{index + 1}</td>
                      <td data-title="Centre Name">{ele?.Centre}</td>
                      <td data-title="Holiday Date">{ele?.Holiday}</td>
                      <td data-title="IsActive">
                        {ele?.IsActive == 1 ? "Active" : "In Active"}
                      </td>
                      <td data-title="Edit">
                        {ele?.IsEdit == 1 ? (
                          <Link
                            onClick={() => {
                              window.scroll(0, 0);
                              EditTableDataHandler(ele);
                              setUpdate(true);
                            }}
                          >
                            <i
                              className="fa fa-edit"
                              style={{
                                color: "#605ca8",
                                cursor: "pointer",
                              }}
                            ></i>
                          </Link>
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        )}
      </Accordion>
    </>
  );
};

export default ManageHoliday;
