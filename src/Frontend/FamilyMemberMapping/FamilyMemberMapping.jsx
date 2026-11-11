import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
// import { SelectBox } from "../../components/formComponent/SelectBox";
import { number } from "../../utils/helpers";
// import moment from "moment";
// import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
// import Tables from "../../components/UI/customTable";
// import { Link } from "react-router-dom";
// import UploadFile from "../utils/UploadFileModal/UploadFile";
// import Form from 'react-bootstrap/Form'
// import FormControl from "react-bootstrap/FormControl";
// import { FaEdit } from "react-icons/fa";
// import FilterInput from "../../components/Filter/FilterInput";
// import Heading from "../../components/UI/Heading";
// import ColorCodingSearch from '../../../components/ModalComponent/ColorCodingSearch';
// import CustomTable from "../../components/Table/CustomTable";


const FamilyMemberMapping=()=>{
      const { t } = useTranslation();
        const [load, setload] = useState({
          search: false,
          save: false,
        });
        const navigate =    useNavigate()
    return(
    <>
     <Accordion
        name={t("Search Member Detail")}
        defaultValue={true}
        isBreadcrumb={true}
      >
          <div className="row pt-2 pl-2 pr-2 mt-1">
      <div className="col-sm-2">
            <Input
              className="required-fields"
              type="number"
              placeholder=" "
              lable="Primary Member Mobile No"
              id="Mobile"
              name="Mobile"
              onInput={(e) => number(e, 10)}
            //   value={payload?.Mobile}
            //   onChange={handleChange}
            />
            {/* {errors?.Mobile && touched?.Mobile && (
              <div className="error-message">{errors?.Mobile}</div>
            )} */}
          </div>
             <div className="col-sm-2">
          
              <Input
                type="text"
                placeholder=" "
                lable="Employee Id"
                id="EmployeId"
                name="EmployeId"
                max={10}
                // value={payload?.ClinicName}
                // onChange={handleChange}
              />
          
          </div>
      <div className="col-sm-1">
            {!load.search && (
              <button
                className="btn btn-primary btn-sm btn-block"
                // onClick={() => handleSubmit(null, null)}
              >
                {t("Search")}
              </button>
            )}
            {load.search && <Loading />}
          </div>

                <div className="col-sm-1">
            {!load.search && (
              <button
                className="btn btn-primary btn-sm btn-block"
                 onClick={() => navigate("/AddFamilyMember")}
              >
                {t("Add New Member")}
            
              </button>
            )}
            {load.search && <Loading/>}
          </div>

</div>


      </Accordion>

    </>
    )
}
export default FamilyMemberMapping