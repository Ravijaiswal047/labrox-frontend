import React, { useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Tables from "../../../../components/UI/customTable";

const AutoConusmeStoreData = () => {
  const { t } = useTranslation();
  const initialState = {
    FromDate: new Date(),
    ToDate: new Date(),
    LocationId: "",
    MachineId: "",
    IsExpirable: "",
  };
  const [payload, setPayload] = useState(initialState);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <div className="card">
        <Heading name={"Auto Consume Store Data"} isBreadcrumb={true} />
        <div className="row p-2">
          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("TO Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="LocationId"
            id="LocationId"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="Location"
            value={payload?.LocationId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="MachineId"
            id="MachineId"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="Machine"
            value={payload?.MachineId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <RadioInput
            inputType="checkbox"
            label="IsExpirable"
            id="IsExpirable"
            name="IsExpirable"
            checked={payload.IsExpirable}
            onChange={handleChange}
            respclass={"col-xl-1 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-3 d-flex">
            <button className="btn btn-sm btn-success">Search</button>
            <button className="btn btn-sm btn-success ml-2">Reset</button>
            <button className="btn btn-sm btn-success ml-2">
              Summary Report
            </button>
            <button className="btn btn-sm btn-success ml-2">
              Detail Report
            </button>
          </div>
        </div>
        <div className="row px-2">
          <div className="col-sm-12">
            <p
              className="text-danger text-center"
              style={{ fontStyle: "italic" }}
            >
              NOTE : "The stock value of the report is not the exact amount,
              amount will be differ as per the last stock id."
            </p>
          </div>
        </div>
      </div>
      <div className="card">
        <Heading name={"Item Detail"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th style={{width:"3%" ,textAlign:"center"}}>Sr. No.</th>
                  <th>View Stock</th>
                  <th>Item Name</th>
                  <th>Current Stock Qty.</th>
                  <th>Event Name</th>
                  <th>BarcodeNo.</th>
                  <th>Calculated Qty.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Example row, replace with dynamic .map() as needed */}
                <tr>
                  <td data-title="S.No" style={{width:"3%" ,marginLeft:"center"}}>1</td>
                  <td data-title="View Stock">
                  <i class="fa fa-eye" aria-hidden="true"></i>
                  </td>
                  <td data-title="Item Name">Sample Item</td>
                  <td data-title="Current Stock Qty.">10</td>
                  <td data-title="Event Name">Sample Event</td>
                  <td data-title="BarcodeNo.">1234567890</td>
                  <td data-title="Calculated Qty.">
                    <input type="number" defaultValue={0}   className="form-control" />
                  </td>
                  <td data-title="Status">
                    <input type="checkbox" />
                  </td>
                </tr>
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
    </>
  );
};

export default AutoConusmeStoreData;
