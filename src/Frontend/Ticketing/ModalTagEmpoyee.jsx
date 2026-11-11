import React, { useEffect, useState } from "react";
import Input from "../../components/formComponent/Input";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import "./CategoryMaster.css";
import { Button } from "react-bootstrap";
import CustomTable from "../../components/Table/CustomTable";
import { useLocation } from "react-router-dom";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import { apiUrls } from "../../utils/apiUrls";
import { axiosInstance } from "../../utils/axiosInstance";
import { emailValidate } from "../../utils/Schema";
import { AutoComplete } from "primereact/autocomplete";
import { setModalData } from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";

const ModalTagEmployee = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { modalData } = useSelector((data) => data?.ticketing);

  const [isUpdate, setIsUpdate] = useState(false);
  const [emplyeList, setEmployeeList] = useState([]);
  const [items, setItems] = useState([]);

  const initialPayload = {
    name: "",
    mobile: "",
    email: "",
    // centre: modalData?.centreID ? [String(modalData?.centreID)] : [],
    centre: [],
    empID: null,
    categoryEmployeeID: "",
  };
  const [payload, setPayload] = useState(initialPayload);

  const [dropdownList, setDropdownList] = useState({
    centreList: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let regex  = new RegExp('^[0-9]')
   if(name == 'mobile' && !regex.test(value)){
    return
   }
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMultiChange = (select, name) => {
    const val = select.map((ele) => ele?.value);
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  // Get centres
  const getCentre = async () => {
    try {
      const res = await axiosInstance.get(apiUrls.BindCentre);
      setDropdownList((prev) => ({
        ...prev,
        centreList: res?.data?.message?.map((data) => ({
          label: data?.centre,
          value: String(data?.centreid),
        })),
      }));
    } catch (err) {
      console.log(err);
      notify(err?.data?.message, "error");
    }
  };

  // Save or Update API + Local state update
  const saveDefaultTagEmployee = async () => {
    if (!payload?.name) return notify("Kindly enter name.", "error");
    if (payload?.mobile?.length !== 10)
      return notify("Enter 10 digit mobile number.", "error");
    if (!emailValidate(payload.email))
      return notify("Kindly enter valid email.", "error");
    // if (payload?.centre?.length === 0 && modalData?.hideCentre)
    //   return notify("Kindly select centre.", "error");

    const apiPayload = {
      transactionType: "Insert",
      categoryEmployeeID: isUpdate ? payload?.categoryEmployeeID : 0,
      categoryID: location?.state?.data?.ID,
      empID: payload.empID,
      level: `level${modalData?.level}`,
      email: payload?.email,
      mobile: payload?.mobile,
      // center: modalData?.hideCentre ? payload?.centre?.length > 0 ? payload?.centre : ["0"],
      center: modalData?.centerType === 'default' ? [0, ...payload?.centre]:payload?.centre,
    };

    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(
        apiUrls.CategoryEmoloyeeDefaultSave,
        apiPayload
      );
      if(!res?.data?.success){
        notify(res?.data?.message, "error");
        return
      }
      notify(res?.data?.message, "success");

      if (isUpdate) {
        // Update locally
        const updatedList = modalData[`level${modalData.level}`].map((emp) =>
          emp.categoryEmployeeId === payload.categoryEmployeeID
            ? {
                ...emp,
                empName: payload.name,
                empMobile: payload.mobile,
                empEmail: payload.email,
                employeeID: payload.empID,
              }
            : emp
        );
        dispatch(
          setModalData({
            ...modalData,
            [`level${modalData.level}`]: updatedList,
          })
        );
      } else {
        // 🔹 Insert locally (take values from API response if available)
        const newEmp = {
          categoryEmployeeId: res?.data?.insertedId || 0, // backend should give id
          empName: payload.name,
          empMobile: payload.mobile,
          empEmail: payload.email,
          employeeID: payload.empID,
        };
        dispatch(
          setModalData({
            ...modalData,
            [`level${modalData.level}`]: [
              ...(modalData[`level${modalData.level}`] || []),
              newEmp,
            ],
          })
        );
      }

      handleClear();
    } catch (err) {
      console.log(err);
      notify(err?.data?.message, "error");
    }finally{
      dispatch(setLoading(false));
    }
    
  };

  console.log('xxxx:::',modalData);

  // Get employee list from API with query
  const getEmployeeList = async (query) => {
    if (!query) {
      setItems([]);
      return;
    }

    const emplPayload = {
      query,
      empList: "",
    };

    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(apiUrls.BindUser, emplPayload);
      if (!Array.isArray(res?.data?.message)) {
        notify(res?.data?.message, "info");
        return;
      }
      let resList = res?.data?.message?.map((emp) => ({
        ...emp,
        value: String(emp?.VALUE),
        label: emp?.label,
      }));
      setEmployeeList(resList);
      setItems(resList);
    } catch (err) {
      console.log(err);
      notify(err?.data?.message, "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getCentre();
    if(modalData?.catID){
      // setPayload(prev=>({...prev, categoryEmployeeID: modalData?.catID}))
    }
  }, [modalData]);

  console.log('payloadxxModalOpen', payload);
  console.log('payloadxxmodalData', modalData);

  const tableHeader = [
    { header: "Employee Name", field: "empName" },
    { header: "Mobile Number", field: "empMobile", width: "15%" },
    { header: "Email", field: "empEmail" },
    { header: "Action", field: "Action", width: "8%" },
  ];

  const handleEdit = (rowData) => {
    setPayload({
      name: rowData?.empName,
      mobile: rowData?.empMobile,
      email: rowData?.empEmail,
      categoryEmployeeID: rowData?.categoryEmployeeId,
      empID: rowData?.employeeID,
      centre: [`${modalData?.centreID}`] || ['0'],
    });
    setIsUpdate(true);
  };

  const handleClear = () => {
    setPayload(initialPayload);
    setIsUpdate(false);
  };

  const handleDelete = async (tRow) => {
    const apiPayload = {
      transactionType: "Delete",
      categoryEmployeeID: tRow?.categoryEmployeeId,
      categoryID: location?.state?.data?.ID,
      empID: tRow.employeeID,
      level: `level${modalData?.level}`,
      email: tRow?.empEmail,
      mobile: tRow?.empMobile,
      center: [Number(modalData?.centreID || 0)],
    };

    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(
        apiUrls.CategoryEmoloyeeDefaultSave,
        apiPayload
      );
      if(!res?.data?.success){
        notify(res?.data?.message, "error");
        return;
      }
      notify(res?.data?.message, "success");
      dispatch(
        setModalData({
          ...modalData,
          [`level${modalData.level}`]: modalData[
            `level${modalData.level}`
          ].filter(
            (e) => e.categoryEmployeeId !== tRow.categoryEmployeeId
          ),
        })
      );
    } catch (err) {
      notify(err?.data?.message, "error");
    }
    dispatch(setLoading(false));
  };

  console.log('modalDataxxx',modalData);
  useEffect(()=>{
    if(modalData?.centerType !=='default'){
      setPayload(prev=>({...prev, centre: [modalData?.centreID]}))
    }
  },[])

  return (
    <div className="row kslak">
      {/* Autocomplete for employee name */}
      <div className="col-sm-3 col-md card shadow-none flex justify-content-center">
        <AutoComplete
          value={payload.name}
          suggestions={items}
          field="label"
          placeholder="Enter employee name"
          completeMethod={(e) => getEmployeeList(e.query)}
          onChange={(e) =>
            setPayload((prev) => ({ ...prev, name: e.value || "" }))
          }
          onSelect={(e) => {
            const emp = e.value;
            setPayload((prev) => ({
              ...prev,
              empID: emp?.VALUE,
              name: emp.label,
              mobile: emp.Mobile || "",
              email: emp.Email || "",
            }));
          }}
        />
      </div>

      <div className="col-sm-3 col-md">
        <Input
          type="text"
          name="mobile"
          lable="Enter mobile number"
          id="mobile"
          value={payload.mobile}
          max={10}
          maxLength={10}
          placeholder=" "
          onChange={handleChange}
        />
      </div>
      <div className="col-sm-3 col-md">
        <Input
          type="email"
          name="email"
          lable="Enter email"
          id="email"
          value={payload.email}
          placeholder=" "
          onChange={handleChange}
        />
      </div>
      {!modalData?.hideCentre && (
        <div className="col-sm-3 col-md">
          <SelectBoxWithCheckbox
            name="centre"
            className="required-fields"
            placeholder=" "
            lable="Centre"
            id="centre"
            onChange={handleSelectMultiChange}
            options={dropdownList?.centreList}
            value={payload?.centre}
          />
        </div>
      )}

      <div
        style={{ gap: "4px" }}
        className="mt-2 d-flex justify-content-center w-100 gap-2"
      >
        <Button
          className="px-4"
          variant="primary"
          onClick={saveDefaultTagEmployee}
        >
          {isUpdate ? "Update" : "Save"}
        </Button>
        <Button onClick={handleClear} className="px-4" variant="secondary">
          Clear
        </Button>
      </div>

      <div className="w-100 mt-2 edit_modal_tag">
        <CustomTable
          columns={tableHeader}
          data={modalData[`level${modalData?.level}`]?.map((tRow) => ({
            ...tRow,
            Action: (
              <>
                <button
                  onClick={() => handleEdit(tRow)}
                  className="btn btn-sm text-danger mx-2"
                >
                  <i className="bi bi-pencil-fill text-white mb-0 fs-2"></i>
                </button>
                <button
                  onClick={() => handleDelete(tRow)}
                  className="btn btn-sm text-danger"
                >
                  <i className="bi bi-trash-fill text-white mb-0"></i>
                </button>
              </>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default ModalTagEmployee;
