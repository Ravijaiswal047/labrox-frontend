import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { number } from "../../utils/helpers";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
// import { Link } from "react-router-dom";
import UploadFile from "../utils/UploadFileModal/UploadFile";
// import Form from 'react-bootstrap/Form'
// import FormControl from "react-bootstrap/FormControl";
// import { FaEdit } from "react-icons/fa";
// import FilterInput from "../../components/Filter/FilterInput";
// import Heading from "../../components/UI/Heading";
// import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
// import CustomTable from "../../components/Table/CustomTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
// import DatePickerOnTable from "../../components/formComponent/DatePickerOnTable";
// import { string } from "yup";


const AddFamilyMember = () => {
  const { t } = useTranslation();
  const [load, setload] = useState({
    search: false,
    save: false,
  });
  const [title, setTitle] = useState()
 
   const [familyMembers, setFamilyMembers] = useState([]);

 
    const [show, setShow] = useState(false);

    const [modal, setModal] = useState({
      viewFileModal: {
        show: false,
        data: "",
      },
      viewLogomodal: {
        show: false,
        data: "",
      },
      testView: {
        show: false,
        data: "",
      },
      mobiledata: {
        show: false,
        show2: false,
        data: [],
        tempIndex: "",
      },
      carddetail: false,
    });


const [payload, setPayload] = useState({
    employee_ID: 0,
    patient_ID: "",
    pName: "",
    age: "",
    gender: "",
    houseNo: "",
    logobase64: "",
    relation: "",
    mobile: "",
    fileType: "",
    filePath: "",
    familyMemberIsPrimary: true,
    familyMemberGroupID: 0
  });

    const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  const guidNumber = () => {
    const guidNumber =
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4();

    return guidNumber;
  };

  const dateSelect = (date, name) => {
    setPayload({ ...payload, [name]: date });
  };


   const handleDeleteMember = (id) => {
    setFamilyMembers(prev => prev.filter(member => member.id !== id));
  };


  const cardOptions = [
    { value: "0", label: "Select" },
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Husband", label: "Husband" },
    { value: "Wife", label: "Wife" },
    { value: "Son", label: "Son" },
    { value: "Daughter", label: "Daughter" },
    { value: "Relative", label: "Relative" },
    { value: "Uncle", label: "Uncle" },
    { value: "Aunty", label: "Aunty" },
    { value: "Sister", label: "Sister" },
    { value: "Brother", label: "Brother" },
    { value: "Spouse", label: "Spouse" }
  ];


  const gender = [{ value: "Male", label: "Male" },
  { value: "Female", label: "Female" }
  ]


   const documents = [
    { value: "Patient", label: "Patient Image" },
    { value: "Consent", label: "Consent Form" },
    { value: "Citizenship", label: "Citizenship Card" },
    { value: "USG", label: "USG Report" },
    { value: "Past", label: "Past Reports" },
      { value: "Discharge", label: "Discharge Summary" },
        { value: "Appointment", label: "Appointment Letter" },
         { value: "OtherRecords", label: "Other Records" },
          { value: "EmployeeCard", label: "Employee Card" },
  ]


  const [DateData, setDateData] = useState({
    AgeYear: "",
    AgeDays: "",
    AgeMonth: "",
  });
  const handleCalculate = (e) => {
    const { name, value } = e.target;
    let diff = {};
    if (name === "ValidYear") {
      diff = moment().add(value, "years");
      setDateData({
        ...DateData,
        AgeYear: diff?._d,
      });
    }

    if (name === "ValidMonth") {
      diff = moment(DateData?.AgeYear || new Date().now).add(value, "months");
      setDateData({
        ...DateData,
        AgeMonth: diff?._d,
      });
    }

    if (name === "ValidDays") {
      diff = moment(DateData?.AgeMonth || new Date().now).add(value, "days");
      setDateData({
        ...DateData,
        AgeDays: diff?._d,
      });
    }

    setPayload({
      ...payload,
      [name]: value,
      ValidUpto: diff?._d,
    });
  };

  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        console.log(value);
        if (name == "Title") {
          setTitle(value);
        }
        if (name == "Specialization") {
          setSpecialization(value);
        }
        if (name == "Degree") {
          setDegree(value);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getDropDownData("Title");

  }, [])

  const handleChange = (e) => {
    const { value, name } = e.target;
    setPayload({ ...payload, [name]: value });
  };
  
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  

// Add this function inside your component
const handleAddMember = () => {
  // basic validation
  if (!payload?.mobile || !payload?.relation || !payload?.pName) {
    toast.error("Please fill all required fields (Mobile, Relation, Name)");
    return;
  }

  const newMember = {
 
        id: Date.now(), 
        mobile: payload.mobile,
        relation: payload.relation,
        patient_ID: payload.patient_ID,
        Title: payload.Title,
        pName: payload.pName,
        ValidYear: payload.ValidYear,
        ValidMonth: payload.ValidMonth,
        ValidDays: payload.ValidDays,
        FromDate: payload.FromDate,
        gender: payload.gender,
        houseNo: payload.houseNo,
        fileType: payload.fileType,
        filePath: payload.filePath,
        familyMemberIsPrimary: payload.familyMemberIsPrimary,
        familyMemberGroupID: payload.familyMemberGroupID,
          patientCode: payload.patientCode || guidNumber(),
    };

  setFamilyMembers(prev => [...prev, newMember]);

  setPayload({

    patient_ID: "",
    pName: "",
    age: "",
    gender: "",
    houseNo: "",
    logobase64: "",
    relation: "",
    mobile: "",
    fileType: "",
    filePath: "",
    familyMemberIsPrimary: true,
    familyMemberGroupID: 0,
    ValidYear:"",
    ValidMonth:"",
    ValidDays:""
  });

  setDateData({
    AgeYear: "",
    AgeDays: "",
    AgeMonth: "",
  });
};




  
const handleSaveMember = () => {
   if (familyMembers.length === 0) {
      toast.error("Please add at least one family member");
      return;
    }
    setload({ ...load, save: true });
    const apiPayload = {
       familyMembers: familyMembers.map(member => ({
        patient_ID: member.patient_ID || "",
        pName: String(member.pName),
        gender: String(member.gender),
        houseNo: String(member.houseNo),
        relation: String(member.relation),
        mobile: member.mobile,
        fileType: String(member.fileType || ""),
        filePath: String(member.filePath || ""),
        familyMemberIsPrimary: member.familyMemberIsPrimary !== false,
        familyMemberGroupID: member.familyMemberGroupID || 0,
        dob: member.FromDate || "",
         patientCode: String(member.patientCode || guidNumber()),
      }))
    };

    console.log("API Payload:", apiPayload);

    // Make API call to add family member
    axiosInstance
      .post("EmployeeMember/InsertFamilyMember", apiPayload)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Family member added successfully");
          // Reset form
          setPayload({
            employee_ID: 0,
            patient_ID: "",
            pName: "",
            age: "",
            gender: "",
            houseNo: "",
            relation: "",
            mobile: "",
            fileType: "",
            filePath: "",
            familyMemberIsPrimary: true,
            familyMemberGroupID: 0
          });
          setDateData({
            AgeYear: "",
            AgeDays: "",
            AgeMonth: "",
          });
        }
        setload({ ...load, save: false });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error adding family member");
        setload({ ...load, save: false });
      });
  };


  return (
    <>

         {show && (
        <UploadFile
          show={show}
          pageName={"MembershipCardLogo"}
          documentId={payload?.logobase64}
          handleClose={() => setShow(false)}
        />
      )}
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
              id="mobile"
              name="mobile"
              onInput={(e) => number(e, 10)}
              value={payload?.mobile}
              onChange={handleChange}
            />
            {/* {errors?.Mobile && touched?.Mobile && (
              <div className="error-message">{errors?.Mobile}</div>
            )} */}
          </div>
 <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={cardOptions}
              name="relation"
              lable="Relation"
              id="relation"
              removeIsClearable={true}
              placeholderName="Relation"
              value={payload.relation}
              onChange={handleSelectChange}
            />
          </div>
           <div className="col-sm-2">
            <Input
              type="text"
              placeholder=" "
              lable="UHID"
              id="patient_ID"
              name="patient_ID"
              max={40}
              value={payload?.patient_ID}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="Title"
              id="Title"
              removeIsClearable={true}
              dynamicOptions={title}
              placeholderName="Title"
               value={payload?.Title}
              onChange={ handleSelectChange}
              respclass={"w-100"}
            />
          </div>
      <div className="col-sm-2">
            <Input
              type="text"
              className="required-fields"
              placeholder=" "
              lable="Member Name"
              id="pName"
              name="pName"
              max={75}
              value={payload?.pName}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <div className="d-flex">
              <div className="row">
                <div className="col-sm-3">
                  <label className="col-sm-14">{t("Age:")}</label>
                </div>
                <div className="col-sm-3">
                  <Input
                    style={{ width: "10px" }}
                    id="ValidYear"
                    name="ValidYear"
                    className="required-fields"
                    value={payload?.ValidYear}
                    onChange={handleCalculate}
                    type="number"
                    placeholder="Years"
                    onInput={(e) => number(e, 2, 20)}
                  />
                </div>
                <div className="col-sm-3">
                  <Input
                    id="ValidMonth"
                    name="ValidMonth"
                    className="required-fields"
                    value={payload?.ValidMonth}
                    disabled={!payload?.ValidYear}
                    onChange={handleCalculate}
                    type="number"
                    placeholder="Months"
                    onInput={(e) => number(e, 2, 12)}
                  />
                </div>
                <div className="col-sm-3">
                  <Input
                    id="ValidDays"
                    name="ValidDays"
                    className="required-fields"
                    type="number"
                    value={payload?.ValidDays}
                    onChange={handleCalculate}
                    disabled={!payload?.ValidMonth}
                    placeholder="Days"
                    onInput={(e) => number(e, 2, 31)}
                  />
                </div>
              </div>
            </div>
          </div>

  
        </div>
        <div className="row pt-1 pl-2 pr-2">
             <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              id="FromDate"
                   value={payload?.FromDate}
              onChange={dateSelect}
              maxDate={payload?.ToDate}
              lable="DOB"
            />
          </div>
     

          <div className="col-sm-2">
            <ReactSelect
              name="gender"
              id="Title"
                     removeIsClearable={true}
              dynamicOptions={gender}
              placeholderName="Gender"
              value={payload?.gender}
              onChange={handleSelectChange}
              respclass={"w-100"}
            />
          </div>


          <div className="col-sm-2">
            <Input
              type="text"
              className="required-fields"
              placeholder=" "
              lable="House No"
              id="HouseNo"
              name="houseNo"
              max={75}
         value={payload?.houseNo}
              onChange={handleChange}
            />
            {/* {errors?.Name && touched?.Name && (
              <div className="error-message">{errors?.Name}</div>
            )} */}
          </div>
            <div className="col-sm-2">
            <ReactSelect
              name="fileType"
              id="fileType"
              removeIsClearable={true}
              dynamicOptions={documents}
              placeholderName="Document Type"
              value={payload?.fileType}
              onChange={handleSelectChange}
              respclass={"w-100"}
            />
          </div>

                <div className="col-sm-1">
            <button
              type="Submit"
              className="btn btn-block btn-success btn-sm"
                 onClick={() => {
                if (payload?.logobase64 == "" || payload?.logobase64 == null) {
                  setPayload({ ...payload, logobase64: guidNumber() });
                }
                console.log(payload);
                setShow(true);
              }}
      
            >
              {t("Upload Image")}
            </button>
          </div>


          <div className="col-sm-1">
            {!load.search && (
              <button
                className="btn btn-primary btn-sm btn-block"
                 onClick={handleAddMember}
              >
                {t("Add Member")}

              </button>
            )}
            {load.search && <Loading />}
          </div>
        </div>



      </Accordion>
          <Accordion title={t("Added Member")} defaultValue={true}>
   {familyMembers.length > 0 && (
        <div className="mt-4">
          <Tables>
            <thead>
              <tr>
                <th>{t("S.N.")}</th>
                <th>{t("Mobile")}</th>
                <th>{t("Relation")}</th>
                <th>{t("UHID")}</th>
                <th>{t("Title")}</th>
                <th>{t("Name")}</th>
                <th>{t("Age(Y)")}</th>
                <th>{t("Age(M)")}</th>
                <th>{t("Age(D)")}</th>
                <th>{t("DOB")}</th>
                <th>{t("Gender")}</th>
                <th>{t("House No")}</th>
                <th>{t("Delete")}</th>
              </tr>
            </thead>
            <tbody>
              {familyMembers.map((member, index) => (
                <tr key={member.id}>
                  <td>{index + 1}</td>
                  <td>{member.mobile}</td>
                  <td>{member.relation}</td>
                  <td>{member.patient_ID}</td>
                  <td>{member.Title}</td>
                  <td>{member.pName}</td>
                  <td>{member.ValidYear}</td>
                  <td>{member.ValidMonth}</td>
                  <td>{member.ValidDays}</td>
                  <td>{member.FromDate ? moment(member.FromDate).format('DD/MM/YYYY') : ''}</td>
                  <td>{member.gender}</td>
                  <td>{member.houseNo}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      {t("Delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>

          {/* Save Button */}
          <div className="row mt-3">
            <div className="col-sm-1">
              {!load.save && (
                <button
                  className="btn btn-success btn-sm btn-block"
                  onClick={handleSaveMember}
                >
                  {t("Save")}
                </button>
              )}
              {load.save && <Loading />}
            </div>
          </div>
        </div>
      )}
      </Accordion>

    </>
  )
}
export default AddFamilyMember