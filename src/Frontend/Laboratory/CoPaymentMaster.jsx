import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import CustomTabs from "../../components/UI/CustomTabs";
import { axiosInstance } from "../../utils/axiosInstance";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { toast } from "react-toastify";

const CoPaymentMaster = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("3");
  const [rateType, setRateType] = useState([]);
  const [deparment, setDeparment] = useState([]);
  const [CoPaymentMaster, setCoPaymentMaster] = useState({
    rateType: "",
    deparment: "",
    defaultpercentage: "",
  });

  const [headerPercentage, setHeaderPercentage] = useState("");

  console.log(CoPaymentMaster, "CoPaymentMaster");

  const [testWiseData, setTestWiseData] = useState([]);
  const [deparmentwiseData, setdeparmentwiseData] = useState([]);

  const tabs = [
    { id: "3", label: t("Test wise Percentage"), content: "" },
    {
      id: "2",
      label: t("Department wise Percentage"),
      content: "",
    },
    { id: "1", label: t("Default Percentage"), content: "" },
  ];

  const handleReactSelect = (name, value) => {
    const updatedState = {
      ...CoPaymentMaster,
      [name]: value?.value,
    };
    setCoPaymentMaster(updatedState);
    if (updatedState?.deparment && activeTab === "3") {
      bindTestWiseData(updatedState.deparment);
    }
    if (updatedState?.rateType && activeTab === "2") {
      bindDepartmentWiseData(updatedState.rateType);
    }
    if (updatedState?.rateType && activeTab === "1") {
      bindDefaultData(updatedState.rateType);
    }
  };

  const handlePercentageChange = (value, index) => {
    let val = Number(value);

    if (val > 100) val = 100;
    if (val < 0) val = 0;

    const updated = [...testWiseData];
    updated[index].CoPaymentPercentage = val;

    updated[index].isChecked = val > 0;

    setTestWiseData(updated);
  };

  const handleDeptPercentageChange = (value, index) => {
    let val = Number(value);

    if (val > 100) val = 100;
    if (val < 0) val = 0;

    const updated = [...deparmentwiseData];

    updated[index].CoPaymentPercentage = val;
    updated[index].isChecked = val > 0;

    setdeparmentwiseData(updated);
  };

  const handleHeaderPercentage = (e) => {
    let val = e.target.value;
    setHeaderPercentage(
      val === "" ? "" : Math.min(100, Math.max(0, Number(val))),
    );
    const updated = testWiseData.map((item) => ({
      ...item,
      CoPaymentPercentage:
        val === "" ? "" : Math.min(100, Math.max(0, Number(val))),
      isChecked: val !== "" && Number(val) > 0,
    }));
    setTestWiseData(updated);
  };

  const handleDeptHeaderPercentage = (e) => {
    let val = e.target.value;
    setHeaderPercentage(
      val === "" ? "" : Math.min(100, Math.max(0, Number(val))),
    );
    const updated = deparmentwiseData.map((item) => ({
      ...item,
      CoPaymentPercentage:
        val === "" ? "" : Math.min(100, Math.max(0, Number(val))),
      isChecked: val !== "" && Number(val) > 0,
    }));
    setdeparmentwiseData(updated);
  };

  const handleDefaultPercentage = (e) => {
    let value = e.target.value;
    if (value === "") {
      setCoPaymentMaster((prev) => ({ ...prev, defaultpercentage: "" }));
      return;
    }

    let val = Number(value);
    if (val > 100) val = 100;
    if (val < 0) val = 0;

    setCoPaymentMaster((prev) => ({ ...prev, defaultpercentage: val }));
  };

  const handleDeleteRow = async (id) => {
    try {
      if (!id) return;
      const response = await axiosInstance.post(`CoPayment/DeleteData?Id=${id}`);
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        if (activeTab === "3") {
          bindTestWiseData(CoPaymentMaster?.deparment);
        } else if (activeTab === "2") {
          bindDepartmentWiseData(CoPaymentMaster?.rateType);
        }
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const bindRateType = async () => {
    try {
      const response = await axiosInstance.get("CoPayment/BindRateType");

      const formattedData = response?.data?.message?.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateType(formattedData);
    } catch (error) {
      console.error("Error fetching Rate Type:", error);
    }
  };
  const bindDepartment = async () => {
    try {
      const response = await axiosInstance.get("CoPayment/BindDepartments");
      console.log(response, "respomse");
      const formattedData = response?.data?.message?.map((item) => ({
        label: item?.Department,
        value: item?.DepartmentID,
      }));
      setDeparment(formattedData);
    } catch (error) {
      console.error("Error fetching Rate Type:", error);
    }
  };

  const bindTestWiseData = async (departmentId) => {
    try {
      const response = await axiosInstance.get(
        `CoPayment/BindTestData?Ratetypeid=${CoPaymentMaster?.rateType || 0}&DepartmentID=${departmentId}`,
      );
      if (response?.data?.success) {
        setTestWiseData(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
        setTestWiseData([]);
      }
    } catch (error) {
      console.error("Error fetching Test Wise Data:", error);
    }
  };

  const bindDepartmentWiseData = async (rateTypeId) => {
    try {
      const response = await axiosInstance.get(
        `CoPayment/BindDepartmentsData?Ratetypeid=${rateTypeId ?? 0}`,
      );

      if (response?.data?.success) {
        setdeparmentwiseData(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
        setdeparmentwiseData([]);
      }
    } catch (error) {
      console.error("DepartmentWise Error:", error);
    }
  };

  const bindDefaultData = async (rateTypeId) => {
    try {
      const response = await axiosInstance.get(
        `CoPayment/BindDefaultData?Ratetypeid=${rateTypeId ?? 0}`
      );
      if (response?.data?.success) {
        setCoPaymentMaster((prev) => ({
          ...prev,
          defaultpercentage: response?.data?.message[0]?.CoPaymentPercentage || "",
        }));
      } else {
        toast.error(response?.data?.message);
        setCoPaymentMaster((prev) => ({ ...prev, defaultpercentage: "" }));
      }
    } catch (error) {
      console.error("Default Data Error:", error);
    }
  };

  useEffect(() => {
    bindRateType(), bindDepartment();
  }, []);

  useEffect(() => {
    setCoPaymentMaster({
      ...CoPaymentMaster,
      deparment: "",
      defaultpercentage: "",
    });
    setHeaderPercentage("");
    setTestWiseData([]);
    setdeparmentwiseData([]);
  }, [activeTab]);

  useEffect(() => {
    (activeTab === "2" && bindDepartmentWiseData(CoPaymentMaster?.rateType || 0))
  }, [activeTab === "2"]);

  useEffect(() => {
    (activeTab === "1" && bindDefaultData(CoPaymentMaster?.rateType || 0));
  }, [activeTab === "1"]);

  const handleSave = async () => {
    if (CoPaymentMaster?.rateType == "" || CoPaymentMaster?.rateType == "0") {
      toast.error("Please Select Rate Type");
      return
    }

    if (activeTab === "3") {
      const checkedRows = testWiseData.filter((item) => item.isChecked);
      if (checkedRows.length === 0) {
        toast.error("Please select at least one test");
        return;
      }
      // const hasEmptyPercentage = checkedRows.some(
      //   (item) => item.CoPaymentPercentage === "" || item.CoPaymentPercentage === 0 || item.CoPaymentPercentage === null
      // );
      // if (hasEmptyPercentage) {
      //   toast.error("Please enter CoPayment % for all selected tests");
      //   return;
      // }
    }

    if (activeTab === "2") {
      const checkedRows = deparmentwiseData.filter((item) => item.isChecked);
      if (checkedRows.length === 0) {
        toast.error("Please select at least one department");
        return;
      }
      // const hasEmptyPercentage = checkedRows.some(
      //   (item) => item.CoPaymentPercentage === "" || item.CoPaymentPercentage === 0 || item.CoPaymentPercentage === null
      // );
      // if (hasEmptyPercentage) {
      //   toast.error("Please enter CoPayment % for all selected departments");
      //   return;
      // }
    }
    if (activeTab === "1") {
      if (CoPaymentMaster?.defaultpercentage === "") {
        toast.error("Please enter Default CoPayment %");
        return;
      }
    }
    try {
      let payload = {
        ratetypeid: CoPaymentMaster?.rateType,
        type: Number(activeTab),
        defaultShare: activeTab === "1" ? Number(CoPaymentMaster?.defaultpercentage) || 0 : 0,
        tests: activeTab === "3"
          ? testWiseData
            .filter((item) => item.isChecked)
            .map((item) => ({
              ratetypeid: CoPaymentMaster?.rateType,
              departmentID: item?.DepartmentID,
              testID: item?.InvestigationID,
              rate: item?.CoPaymentPercentage || 0,
            }))
          : [],
        departments: activeTab === "2"
          ? deparmentwiseData
            .filter((item) => item.isChecked)
            .map((item) => ({
              ratetypeid: CoPaymentMaster?.rateType,
              departmentID: item?.DepartmentID,
              rate: item?.CoPaymentPercentage || 0,
            }))
          : [],
      };
      const response = await axiosInstance.post("CoPayment/SaveDataAll", payload);
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        if (activeTab === "3") {
          bindTestWiseData(CoPaymentMaster?.deparment);
        } else if (activeTab === "2") {
          bindDepartmentWiseData(CoPaymentMaster?.rateType || 0);
        } else if (activeTab === "1") {
          bindDefaultData(CoPaymentMaster?.rateType || 0);
        }
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const handleReset = () => {
    setCoPaymentMaster({
      rateType: "",
      deparment: "",
      defaultpercentage: "",
    });
    setHeaderPercentage("");
    setTestWiseData([]);
    setdeparmentwiseData([]);
  };

  // changing 
  // const TestWiseTable = () => {
  //   return (
  //     <>
  //       <div className="col-sm-3 col-md-3 col-lg-2">
  //         <ReactSelect
  //           dynamicOptions={[{ label: "Select", value: "" }, ...deparment]}
  //           name="deparment"
  //           lable={t("Department")}
  //           id="deparment"
  //           removeIsClearable={true}
  //           placeholderName={t("Select")}
  //           value={CoPaymentMaster?.deparment}
  //           onChange={handleReactSelect}
  //         />
  //       </div>
  //       <div className="row p-2">
  //         <div className="col-12">
  //           <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
  //             <thead style={{ position: "sticky", top: "0", zIndex: 999 }} >
  //               <tr>
  //                 <th style={{ width: "6%" }}>S.No.</th>
  //                 <th>Department</th>
  //                 <th>Item Code</th>
  //                 <th>Item Name</th>
  //                 <th>
  //                   <div className="d-flex align-items-center gap-2">
  //                     <span style={{ paddingRight: "10px" }}>
  //                       {t("CoPayment(%)")}
  //                     </span>
  //                     <Input
  //                       type="number"
  //                       id="percentage"
  //                       name="percentage"
  //                       placeholder={t("Enter Percent(%)")}
  //                       value={headerPercentage}
  //                       onChange={handleHeaderPercentage}
  //                       style={{ width: "150px" }}
  //                     />
  //                   </div>
  //                 </th>
  //                 <th className="text-center" style={{ width: "6%" }}>
  //                   <input
  //                     type="checkbox"
  //                     checked={testWiseData.length > 0 && testWiseData.every((item) => item.isChecked)}
  //                     onChange={(e) => {
  //                       const checked = e.target.checked;
  //                       const updated = testWiseData.map((item) => ({
  //                         ...item,
  //                         isChecked: checked,
  //                         CoPaymentPercentage: checked
  //                           ? item.CoPaymentPercentage || 0
  //                           : "",
  //                       }));

  //                       setTestWiseData(updated);
  //                     }}
  //                   />
  //                 </th>
  //                 <th style={{ width: "6%" }}>Remove</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {testWiseData?.map((item, index) => (
  //                 <tr key={index}>
  //                   <td>{index + 1}</td>
  //                   <td>{item?.DepartmentName}</td>
  //                   <td>{item?.TestCode}</td>
  //                   <td>{item?.TestName}</td>
  //                   <td>
  //                     <Input
  //                       type="number"
  //                       value={item?.CoPaymentPercentage || ""}
  //                       onChange={(e) =>
  //                         handlePercentageChange(e.target.value, index)
  //                       }
  //                     />
  //                   </td>
  //                   <td className="text-center">
  //                     <input
  //                       type="checkbox"
  //                       checked={item?.isChecked || false}
  //                       onChange={(e) => {
  //                         const updated = [...testWiseData];
  //                         updated[index].isChecked = e.target.checked;
  //                         // optional: clear % if unchecked
  //                         if (!e.target.checked) {
  //                           updated[index].CoPaymentPercentage = "";
  //                         }
  //                         setTestWiseData(updated);
  //                       }}
  //                     />
  //                   </td>
  //                   <td className="text-center">
  //                     {item?.Id > 0 ? (
  //                       <span
  //                         style={{
  //                           cursor: "pointer",
  //                           color: "red",
  //                           fontWeight: "bold",
  //                           fontSize: "16px",
  //                         }}
  //                         onClick={() => handleDeleteRow(item.Id, index)}
  //                       >
  //                         ❌
  //                       </span>
  //                     ) : null}
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </Tables>
  //         </div>
  //       </div>
  //     </>
  //   );
  // };

  // const DepartmentWiseTable = () => {
  //   return (
  //     <>
  //       <div className="row p-2">
  //         <div className="col-12">
  //           <Tables style={{ maxHeight: "400px" }}>
  //             <thead>
  //               <tr>
  //                 <th>S.No.</th>
  //                 <th>Department</th>
  //                 <th>
  //                   <div className="d-flex align-items-center gap-2">
  //                     <span style={{ paddingRight: "10px" }}>
  //                       {t("CoPayment(%)")}
  //                     </span>
  //                     <Input
  //                       type="number"
  //                       value={headerPercentage}
  //                       placeholder={t("Enter Percent(%)")}
  //                       onChange={handleDeptHeaderPercentage}
  //                       style={{ width: "150px" }}
  //                     />
  //                   </div>
  //                 </th>

  //                 <th className="text-center" style={{ width: "10%" }}>
  //                   <input
  //                     type="checkbox"
  //                     checked={deparmentwiseData.every(
  //                       (item) => item.isChecked,
  //                     )}
  //                     onChange={(e) => {
  //                       const checked = e.target.checked;

  //                       const updated = deparmentwiseData.map((item) => ({
  //                         ...item,
  //                         isChecked: checked,
  //                         CoPaymentPercentage: checked
  //                           ? item.CoPaymentPercentage || 0
  //                           : "",
  //                       }));

  //                       setdeparmentwiseData(updated);
  //                     }}
  //                   />
  //                 </th>

  //                 <th style={{ width: "10%" }}>Remove</th>
  //               </tr>
  //             </thead>

  //             <tbody>
  //               {deparmentwiseData?.map((item, index) => (
  //                 <tr key={index}>
  //                   <td>{index + 1}</td>
  //                   <td>{item?.Department}</td>

  //                   <td>
  //                     <Input
  //                       type="number"
  //                       value={item?.CoPaymentPercentage || ""}
  //                       onChange={(e) =>
  //                         handleDeptPercentageChange(e.target.value, index)
  //                       }
  //                     />
  //                   </td>

  //                   {/* ✅ Row Checkbox */}
  //                   <td className="text-center">
  //                     <input
  //                       type="checkbox"
  //                       checked={item?.isChecked || false}
  //                       onChange={(e) => {
  //                         const updated = [...deparmentwiseData];

  //                         updated[index].isChecked = e.target.checked;

  //                         if (!e.target.checked) {
  //                           updated[index].CoPaymentPercentage = "";
  //                         }

  //                         setdeparmentwiseData(updated);
  //                       }}
  //                     />
  //                   </td>

  //                   {/* ✅ Delete */}
  //                   <td className="text-center">
  //                     {item?.Id > 0 ? (
  //                       <span
  //                         style={{
  //                           cursor: "pointer",
  //                           color: "red",
  //                           fontWeight: "bold",
  //                           fontSize: "16px",
  //                         }}
  //                         onClick={() => handleDeleteRow(item.Id, index)}
  //                       >
  //                         ❌
  //                       </span>
  //                     ) : null}
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </Tables>
  //         </div>
  //       </div>
  //     </>
  //   );
  // };

  // const DefaultTable = () => {
  //   return (
  //     <>
  //       <div className="row px-2 mt-2 mb-2">
  //         <div className="col-sm-2">
  //           <Input
  //             type="number"
  //             lable="Default %"
  //             name="defaultpercentage"
  //             id="defaultpercentage"
  //             placeholder=""
  //             value={CoPaymentMaster?.defaultpercentage}
  //             onChange={handleDefaultPercentage}
  //           />
  //         </div>
  //       </div>
  //     </>
  //   );
  // };

  // return (
  //   <>
  //     <Accordion
  //       name="CoPayment Master"
  //       isBreadcrumb={true}
  //       defaultValue={true}
  //     >
  //       <div className="row px-2 mt-2 mb-2">
  //         <div className="col-sm-3 col-md-3 col-lg-2">
  //           <ReactSelect
  //             dynamicOptions={[{ label: "Select", value: 0 }, ...rateType]}
  //             name="rateType"
  //             lable={t("Rate Type")}
  //             id="rateType"
  //             removeIsClearable={true}
  //             placeholderName={t("Select")}
  //             value={CoPaymentMaster?.rateType}
  //             onChange={handleReactSelect}
  //           />
  //         </div>
  //         <CustomTabs
  //           tabs={tabs}
  //           activeTab={activeTab}
  //           onSelect={(k) => setActiveTab(k)}
  //         />
  //       </div>
  //     </Accordion>

  //     <Accordion defaultValue={true}>
  //       {activeTab === "3" && <TestWiseTable />}
  //       {activeTab === "2" && <DepartmentWiseTable />}
  //       {activeTab === "1" && <DefaultTable />}
  //       <CustomButton text="Save" icon="save" className="mb-1 mx-2" onClick={handleSave} />
  //       <CustomButton text="Reset" icon="refresh" className="mb-1 mx-2" onClick={handleReset} />
  //     </Accordion>
  //   </>
  // );


  return (
    <>
      <Accordion name="CoPayment Master" isBreadcrumb={true} defaultValue={true}>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-sm-3 col-md-3 col-lg-2">
            <ReactSelect
              dynamicOptions={[{ label: "Select", value: 0 }, ...rateType]}
              name="rateType"
              lable={t("Rate Type")}
              id="rateType"
              removeIsClearable={true}
              placeholderName={t("Select")}
              value={CoPaymentMaster?.rateType}
              onChange={handleReactSelect}
            />
          </div>
          <CustomTabs tabs={tabs} activeTab={activeTab} onSelect={(k) => setActiveTab(k)} />
        </div>
      </Accordion>

      <Accordion defaultValue={true}>

        {activeTab === "3" && (
          <>
            <div className="col-sm-3 col-md-3 col-lg-2">
              <ReactSelect
                dynamicOptions={[{ label: "Select", value: "" }, ...deparment]}
                name="deparment"
                lable={t("Department")}
                id="deparment"
                removeIsClearable={true}
                placeholderName={t("Select")}
                value={CoPaymentMaster?.deparment}
                onChange={handleReactSelect}
              />
            </div>
            <div className="row p-2">
              <div className="col-12">
                <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <thead style={{ position: "sticky", top: "0", zIndex: 999 }}>
                    <tr>
                      <th style={{ width: "6%" }}>S.No.</th>
                      <th>Department</th>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ paddingRight: "10px" }}>{t("CoPayment(%)")}</span>
                          <Input
                            type="number"
                            id="percentage"
                            name="percentage"
                            placeholder={t("Enter Percent(%)")}
                            value={headerPercentage}
                            onChange={handleHeaderPercentage}
                            style={{ width: "150px" }}
                          />
                        </div>
                      </th>
                      <th className="text-center" style={{ width: "6%" }}>
                        <input
                          type="checkbox"
                          checked={testWiseData.length > 0 && testWiseData.every((item) => item.isChecked)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const updated = testWiseData.map((item) => ({
                              ...item,
                              isChecked: checked,
                              CoPaymentPercentage: checked ? item.CoPaymentPercentage || 0 : "",
                            }));
                            setTestWiseData(updated);
                          }}
                        />
                      </th>
                      <th style={{ width: "6%" }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testWiseData?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item?.DepartmentName}</td>
                        <td>{item?.TestCode}</td>
                        <td>{item?.TestName}</td>
                        <td>
                          <Input
                            type="number"
                            value={item?.CoPaymentPercentage || ""}
                            onChange={(e) => handlePercentageChange(e.target.value, index)}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={item?.isChecked || false}
                            onChange={(e) => {
                              const updated = [...testWiseData];
                              updated[index].isChecked = e.target.checked;
                              if (!e.target.checked) updated[index].CoPaymentPercentage = "";
                              setTestWiseData(updated);
                            }}
                          />
                        </td>
                        <td className="text-center">
                          {item?.Id > 0 ? (
                            <span
                              style={{ cursor: "pointer", color: "red", fontWeight: "bold", fontSize: "16px" }}
                              onClick={() => handleDeleteRow(item.Id)}
                            >❌</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
          </>
        )}

        {activeTab === "2" && (
          <div className="row p-2">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px" }}>
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Department</th>
                    <th>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ paddingRight: "10px" }}>{t("CoPayment(%)")}</span>
                        <Input
                          type="number"
                          value={headerPercentage}
                          placeholder={t("Enter Percent(%)")}
                          onChange={handleDeptHeaderPercentage}
                          style={{ width: "150px" }}
                        />
                      </div>
                    </th>
                    <th className="text-center" style={{ width: "10%" }}>
                      <input
                        type="checkbox"
                        checked={deparmentwiseData.length > 0 && deparmentwiseData.every((item) => item.isChecked)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const updated = deparmentwiseData.map((item) => ({
                            ...item,
                            isChecked: checked,
                            CoPaymentPercentage: checked ? item.CoPaymentPercentage || 0 : "",
                          }));
                          setdeparmentwiseData(updated);
                        }}
                      />
                    </th>
                    <th style={{ width: "10%" }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {deparmentwiseData?.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item?.Department}</td>
                      <td>
                        <Input
                          type="number"
                          value={item?.CoPaymentPercentage || ""}
                          onChange={(e) => handleDeptPercentageChange(e.target.value, index)}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={item?.isChecked || false}
                          onChange={(e) => {
                            const updated = [...deparmentwiseData];
                            updated[index].isChecked = e.target.checked;
                            if (!e.target.checked) updated[index].CoPaymentPercentage = "";
                            setdeparmentwiseData(updated);
                          }}
                        />
                      </td>
                      <td className="text-center">
                        {item?.Id > 0 ? (
                          <span
                            style={{ cursor: "pointer", color: "red", fontWeight: "bold", fontSize: "16px" }}
                            onClick={() => handleDeleteRow(item.Id)}
                          >❌</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        )}

        {activeTab === "1" && (
          <div className="row px-2 mt-2 mb-2">
            <div className="col-sm-2">
              <Input
                type="number"
                lable="Default %"
                name="defaultpercentage"
                id="defaultpercentage"
                placeholder=""
                value={CoPaymentMaster?.defaultpercentage}
                onChange={handleDefaultPercentage}
              />
            </div>
          </div>
        )}

        <CustomButton text="Save" icon="save" className="mb-1 mx-2" onClick={handleSave} />
        <CustomButton text="Reset" icon="refresh" className="mb-1 mx-2" onClick={handleReset} />
      </Accordion>
    </>
  );
};

export default CoPaymentMaster;
