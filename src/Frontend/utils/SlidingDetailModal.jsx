import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { getTrimmedData } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";
const SlidingDetailModal = ({ show, handleClose }) => {
  const isMobile = window.innerWidth <= 768;
  const [payload, setPayload] = useState({
    SlideType: "",
    Block: "",
    NoOfSlide: 1,
  });
  const [tableData, setTableData] = useState([]);
  const theme = useLocalStorage("theme", "get");
  const handleSelectChange = (event) => {
    const { name, value } = event.target;

    setPayload({ ...payload, [name]: value });
  };
  const handleMake = () => {};
  return (
    <Dialog
      header="SlidingDetail"
      visible={show}
      className={theme}
      onHide={handleClose}
      style={{
        width: isMobile ? "80vw" : "40vw",
      }}
    >
      <div className="row">
        {" "}
        <div className="col-sm-4">
          <SelectBox
            className="required-fields"
            options={[{ label: "Select", value: "" }, ...[]]}
            name="SlideType"
            lable="SlideType"
            id="SlideType"
            selectedValue={payload?.SlideType}
            onChange={handleSelectChange}
          />
        </div>
        <div className="col-sm-3">
          <SelectBox
            className="required-fields"
            options={[{ label: "Select", value: "" }, ...[]]}
            name="Block"
            lable="Block"
            id="Block"
            selectedValue={payload?.Block}
            onChange={handleSelectChange}
          />
        </div>
        <div className="col-sm-3">
          <SelectBox
            options={[{ label: "Select", value: "" }, ...[]]}
            name="NoOfSlide"
            className="required-fields"
            lable="Number Of Slide"
            id="NoOfSlide"
            selectedValue={payload?.NoOfSlide}
            onChange={handleSelectChange}
          />
        </div>
        <div className="col-sm-2">
          <button
            className="btn btn-block btn-success btn-sm"
            onClick={handleMake}
          >
            Make
          </button>
        </div>
      </div>

      <Tables>
        <thead className="text-center cf" style={{ zIndex: 99 }}>
          <tr>
            <th>S.No</th>
            <th>Sec.No</th>
            <th>Block ID</th>
            <th>Slide No.</th>
            <th>Comment</th>
            <th>Remove</th>
          </tr>
        </thead>
        {/* <tbody>
                {tableData?.map((ele, index) => (
                  <tr key={index}>
                    <td data-title="View">
                      
                    </td>
                    <td data-title="S.No">{index + 1}&nbsp;</td>
                    <td data-title="Code">{ele.ClientCode}&nbsp;</td>
                    <td data-title="Client Name">{ele.ClientName}&nbsp;</td>
                    <td data-title="Share Amt." className="amount">
                      {ele.ShareAmt}&nbsp;
                    </td>
                    <td data-title="Net Amount." className="amount">
                      {ele.Amount}&nbsp;
                    </td>
                    
                  </tr>
                ))}
              </tbody> */}
      </Tables>
    </Dialog>
  );
};

export default SlidingDetailModal;
