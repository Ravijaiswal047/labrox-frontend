import React, { useState, useEffect } from "react";

import { toast } from "react-toastify";
import { FiEdit } from "react-icons/fi";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Tables from "../../components/UI/customTable";

const FTPmaster = () => {
  const [formData, setFormData] = useState({
    Port: "",
    Username: "",
    Password: "",
    RemoteDirectory: "",
    CompanyID: "",
    Host: "",
  });

  const [companyOptions, setCompanyOptions] = useState([]);
  const [ftpData, setFtpData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});

  const CompanyID = useLocalStorage("userData", "get").CompanyID;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get("/CompanyMaster/getCompanyName");
        const companies = res.data.message;
        setCompanyOptions(companies);

        if (CompanyID) {
          const matchedCompany = companies.find(
            (company) => company.CompanyId === CompanyID,
          );
          if (matchedCompany) {
            setFormData((prev) => ({
              ...prev,
              CompanyID: matchedCompany.CompanyId,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
    fetchFtpData();
  }, []);
  const validateForm = () => {
    let newErrors = {};

    if (!formData.Port) {
      newErrors.Port = "Port is required";
    } else if (isNaN(formData.Port)) {
      newErrors.Port = "Port must be a number";
    }

    if (!formData.Host) {
      newErrors.Host = "Host is required";
    }

    if (!formData.Username) {
      newErrors.Username = "Username is required";
    }

    if (!formData.RemoteDirectory) {
      newErrors.RemoteDirectory = " RemoteDirectory is required";
    }

    // if (!formData.CompanyId) {
    //   newErrors.CompanyId = "Company ID is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchFtpData = async () => {
    try {
      const res = await axiosInstance.get("/CRMIntegration/GetFtpConfig");
      const message = res.data.message;

      if (Array.isArray(message)) {
        setFtpData(message);
      } else {
        setFtpData([message]);
      }
    } catch (err) {
      console.error("Error fetching FTP config:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let response;

      if (editIndex !== null) {
        response = await axiosInstance.post(
          "/CRMIntegration/UpdateFtpConfig",
          formData,
        );
      } else {
        response = await axiosInstance.post(
          "/CRMIntegration/SaveFtpConfig",
          formData,
        );
      }

      if (response?.data?.success) {
        toast.success(
          editIndex !== null
            ? "Data updated successfully!"
            : "Data saved successfully!",
        );

        setFormData({
          Port: "",
          Username: "",
          Password: "",
          RemoteDirectory: "",
          CompanyID: "",
          Host: "",
        });
        setEditIndex(null);
        fetchFtpData();
      } else {
        toast.error(response?.data?.message || "Already saved!");
      }
    } catch (error) {
      console.error("Error saving/updating data:", error);
      toast.error("Error saving/updating data!");
    }
  };

  const handleEdit = (index) => {
    const item = ftpData[index];
    setFormData({
      Port: item.Port,
      Username: item.Username,
      Password: item.Password,
      RemoteDirectory: item.RemoteDirectory,
      CompanyID: item.CompanyID,
      Host: item.Host,
    });
    setEditIndex(index);
  };

  return (
    <>
      <Accordion name="FTP master" isBreadcrumb={true} defaultValue={true}>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-sm-2">
            <Input
              type="text"
              name="Port"
              id="Port"
              className="required-fields"
              placeholder=""
              lable="Port"
              value={formData.Port}
              onChange={handleChange}
            />
            {errors.Port && <div className="error-message">{errors.Port}</div>}
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              name="Username"
              placeholder=""
              className="required-fields"
              id="Username"
              lable="Username"
              value={formData.Username}
              onChange={handleChange}
            />
            {errors.Username && (
              <div className="error-message">{errors.Username}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              type="password"
              name="Password"
              className="required-fields"
              placeholder=""
              id="password"
              lable="Password"
              value={formData.Password}
              onChange={handleChange}
            />
            {errors.Password && (
              <div className="error-message">{errors.Password}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              name="RemoteDirectory"
              className="required-fields"
              id="RemoteDirectory"
              placeholder=""
              lable="Remote Directory"
              value={formData.RemoteDirectory}
              onChange={handleChange}
            />
            {errors.RemoteDirectory && (
              <div className="error-message">{errors.RemoteDirectory}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              name="Host"
              id="Host"
              placeholder=""
              lable="Host"
              value={formData.Host}
              onChange={handleChange}
            />
            {errors.Host && <div className="error-message">{errors.Host}</div>}
          </div>
          <div className="col-sm-2">
            <select
              name="CompanyID"
              disabled
              value={formData.CompanyID}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Company</option>
              {companyOptions.map((company) => (
                <option key={company.CompanyId} value={company.CompanyId}>
                  {company.CompanyName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-sm-1 mt-2">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleSubmit}
            >
              {editIndex !== null ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </Accordion>

      {ftpData.length > 0 && (
        <Tables>
          <thead>
            <tr>
              <th>Sno.</th>
              <th>Port</th>
              <th>Username</th>
              <th>Remote Directory</th>
              <th>Host</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ftpData.map((item, index) => (
              <tr key={index}>
                <td data-title="Sno.">{index + 1}</td>
                <td data-title="Port">{item.Port}</td>
                <td data-title="Username">{item.Username}</td>
                <td data-title="Remote Directory">{item.RemoteDirectory}</td>
                <td data-title="Host">{item.Host}</td>
                <td data-title="Action">
                  <FiEdit
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEdit(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Tables>
      )}
    </>
  );
};

export default FTPmaster;
