import { Dialog } from "primereact/dialog";
import Input from "../../../components/formComponent/Input";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Accordion from "../../../components/UI/Accordion";
import Tables from "../../../components/UI/customTable";
import "./partnerStaff.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CancelButton, CustomButton, DeleteButton, EditButton, SaveButton, SearchButton } from "../../../components/UI/CustomButton";
import { Form } from "react-bootstrap";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../../utils/axiosInstance";

const PartnerStaffList = () => {
    const [showDialog, setShowDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState([])

    console.log("Page data:: ", page)

    const theme = useLocalStorage("theme", "get");

    const [t] = useTranslation();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        empCode: '',
        role: 'Partner-User',
        page: ''
    });

    const [staffList, setStaffList] = useState([
        { id: 1, firstName: 'Prashant',  lastName: 'Singhal', email: 'prashant.oops@gmail.com', mobile: '9599265429', role: 'Partner-User', empCode: "4848", active: true },
        { id: 2, firstName: 'Amritsa', lastName: 'Accounts', email: 'amritsadiagnostics@gmail.com', mobile: '7780235538', role: 'Partner-Finance', empCode: "4848", active: true },
        { id: 3, firstName: 'Gangadhar', lastName: 'Y', email: 'gangadhary1986@gmail.com', mobile: '7013786789', role: 'Partner-User', empCode: "4848", active: true },
        { id: 4, firstName: 'Yugala', lastName: 'Bhanu', email: 'yuga0402pk@gmail.com', mobile: '9603761960', role: 'Partner-User', empCode: "4848", active: true }
    ]);

    useEffect(() => {
        const fetchMainMenu = async () => {
          try {
            const res = await axiosInstance.get("Menu/MainMenuPageData");
            const data = res?.data?.message;
            const pageData = Array.isArray(data?.pageData) ? data?.pageData : [];
    
            const mappedPages = pageData.map((p) => ({
              label: p?.PageName,
              value: String(p?.PageID),
            }));
            setPage(mappedPages);
          } catch (error) {
            console.log("Error while fetching page data", error);
          }
        };
    
        fetchMainMenu();
      }, []);

    const handleAddStaff = () => {
        setEditMode(false);
        setCurrentStaff(null);
        setFormData({ firstName: '', lastName: '', email: '', mobile: '', role: 'Partner-User' });
        setShowDialog(true);
    };

    const handleEditStaff = (staff) => {
        setEditMode(true);
        setCurrentStaff(staff);
        setFormData({
            firstName: staff.firstName,
            lastName: staff.lastNme,
            email: staff.email,
            mobile: staff.mobile,
            role: staff.role
        });
        setShowDialog(true);
    };

    const handleSave = () => {
        if (editMode) {
            setStaffList(staffList.map(staff =>
                staff.id === currentStaff.id
                    ? { ...staff, ...formData }
                    : staff
            ));
        } else {
            const newStaff = {
                id: staffList.length + 1,
                ...formData,
                active: true
            };
            setStaffList([...staffList, newStaff]);
        }
        setShowDialog(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleReactSelectChange = (name, option) => {
    setFormData(option?.value);
  };

    const toggleActive = (id) => {
        setStaffList(staffList.map(staff =>
            staff.id === id ? { ...staff, active: !staff.active } : staff
        ));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            setStaffList(staffList.filter(staff => staff.id !== id));
        }
    };

    const filteredStaff = staffList.filter(staff =>
        staff.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.mobile?.includes(searchTerm)
    );

    const roleOptions = [
        { label: "Partner-User", value: "Partner-User" },
        { label: "Partner-Finance", value: "Partner-Finance" },
        { label: "Partner-Admin", value: "Partner-Admin" },
    ]

    return (
        <>
            <Accordion
                name={t("Partner Staff List")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="header-section">
                    <div className="search-section">
                        <Input
                            type="text"
                            lable={"Search"}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchButton
                            text={"Search"}
                        />
                    </div>
                    <div style={{marginBottom: "0.4rem"}}>

                    <CustomButton
                        icon={"add"}
                        text={"Add Partner Staff"}
                        onClick={handleAddStaff}
                        />
                        </div>
                </div>

                <Tables className="staff-table">
                    <thead>
                        <tr>
                            <th>Partner Staff Name</th>
                            <th>Email Id</th>
                            <th>Mobile No</th>
                            <th>Role Name</th>
                            <th>Active</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map((staff) => (
                            <tr key={staff.id}>
                                <td data-title={t("Partner Staff Name")}>{`${staff.firstName} ${staff.lastName}`}</td>
                                <td data-title={t("Email Id")}>{staff.email}</td>
                                <td data-title={t("Mobile No")}>{staff.mobile}</td>
                                <td data-title={t("Role Name")}>{staff.role}</td>
                                <td data-title={t("Active")}>
                                    <Form.Check
                                        type="switch"
                                        id="custom-switch"
                                        name="IsActive"
                                        checked={staff.active}
                                        onChange={() => toggleActive(staff.id)}
                                        label="Active"
                                    />
                                </td>
                                <td data-title={t("Action")}>
                                    <div className="action-buttons">
                                        <EditButton
                                            onClick={() => handleEditStaff(staff)}
                                        />
                                        <DeleteButton
                                            onClick={() => handleDelete(staff.id)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Tables>
            </Accordion>

            <Dialog
                header={editMode ? "Edit Partner Staff" : "Add Partner Staff"}
                onHide={() => setShowDialog(false)} 
                className={theme}
                visible={showDialog}
                style={{width:'60vw'}}
            >
                <div className="row pt-2 px-2 py-3 align-items-center justify-content-center">
                    <div className="col-12 col-sm-6 mb-2">
                        <Input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            lable={"Staff name"}
                        />
                    </div>
                    <div className="col-12 col-sm-6 mb-2">
                        <Input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            lable={"Staff name"}
                        />
                    </div>
                    <div className="col-12 col-sm-6 mb-2">
                        <Input
                            type="tel"
                            className="form-control"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength="10"
                            lable={"Mobile"}
                        />
                    </div>
                    <div className="col-12 col-sm-6 mb-2">
                        <Input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            lable={"Email"}
                        />
                    </div>
                    <div className="col-12 col-sm-6 mb-2">
                        <ReactSelect
                            dynamicOptions={roleOptions}
                            name="role"
                            lable={t("Select Role")}
                            id="role"
                            removeIsClearable={true}
                            placeholderName={t("Select Role")}
                            value={formData.role}
                            onChange={handleReactSelectChange}
                            isDisabled={loading || roleOptions.length === 0}
                        />
                    </div>
                    <div className="col-12 col-sm-6 mb-2">
                        <Input
                            type="text"
                            className="form-control"
                            name="empCode"
                            value={formData.empCode}
                            onChange={handleChange}
                            lable={"Emp Code"}
                        />
                    </div>
                    <div className="col-12 col-sm-6 mb-2">
                        <ReactSelect
                            dynamicOptions={page}
                            name="access"
                            lable={t("User Access")}
                            id="access"
                            removeIsClearable={true}
                            placeholderName={t("Select Access")}
                            value={formData.page}
                            onChange={handleReactSelectChange}
                            isDisabled={loading || page.length === 0}
                        />
                    </div>
                    <div className="col-12 col-sm-6 mb-2">
                        <input
                            name="isOTP"
                            id="isOTP"
                            type="checkbox"
                            checked={formData?.isOTP}
                            onChange={handleChange}
                        />
                        <label className="col-sm-10">{t("Active")}</label>
                    </div>
                </div>
                <div className="dialog-footer">
                    <CustomButton
                        onClick={handleSave}
                        text={editMode ? 'Update' : 'Save'}
                        icon={editMode ? 'edit' : 'save'}
                    />
                    <CancelButton
                        text="Cancel"
                        onClick={() => setShowDialog(false)}
                    />
                </div>
            </Dialog>
        </>
    );
};

export default PartnerStaffList;