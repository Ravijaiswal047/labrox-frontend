import { useEffect, useState } from "react";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { validationForMachineMaster } from "../../utils/Schema";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { IoIosArrowForward } from "react-icons/io";
import Tables from "../../components/UI/customTable";
import { FaArrowLeft, FaEdit, FaPlus } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MachineParamModal from "../utils/MachineParamModal";
import { Dialog } from "primereact/dialog";
import { CancelButton, CustomButton, EditButton, SaveButton } from "../../components/UI/CustomButton";
import { PlusIcon } from "../../components/SvgIcons";
import FilterInput from "../../components/Filter/FilterInput";
import { apiUrls } from "../../utils/apiUrls";

const MachineMappingMaster = () => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    const [machines, setMachines] = useState([]);
    const [filteredMachines, setFilteredMachines] = useState([]);
    const [centreId, setCentreId] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchFilterTerm, setSearchFilterTerm] = useState("");
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [machineParams, setMachineParams] = useState([]);
    const [showParameterModal, setShowParameterModal] = useState(false);
    const [machineInfo, setMachineInfo] = useState([])
    const [masterMachineInfo, setMasterMachineInfo] = useState([])
    const [showMappingUI, setShowMappingUI] = useState(false);
    const [mappedTests, setMappedTests] = useState([]);
    const [selectedAvailable, setSelectedAvailable] = useState([]);
    const [selectedMapped, setSelectedMapped] = useState([]);
    const [searchAvailableTest,setSearchAvailabletest]=useState([])
    const [show, setShow] = useState({
        modal: false,
        type: "Add",
    });
    const [selectedMachineParamID, setSelectedMachineParamID] = useState("");
    const [FieldValue, setFieldValue] = useState({ Machine_ParamID: "", LabObservation_ID: "" });
    const [selectedMachineParamName, setSelectedMachineParamName] = useState("");
    
    const [active, setActive] = useState({});
    const [dropdownlist, setDropdownlist] = useState({
        machineList: [],
      });

    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [payload, setPayload] = useState({
        MachineID: "",
        Machinename: "",
        CentreID: 0,
        GlobalMachineID: "",
        BatchRequest: "",
        ITDKEY: "",
    });
    const [parameterPayload, setParameterPayload] = useState({
        machineParam: "",
        paramAlias: "",
        suffix: "",
        assayNo: "",
        isOrderable: false,
        isMultiple: false,
        isRound: false,
        roundUpTo: 0
    });
    const [err, setErr] = useState({});
    const [loading, setLoading] = useState(false);


    // Fetch machines data
    const fetchMachines = () => {
        setLoading(true);
        axiosInstance
            .get("MachineGroup/getMachineName")
            .then((res) => {
                setMachines(res?.data?.message || []);
                setFilteredMachines(res?.data?.message || []);
                setLoading(false);
            })
            .catch((err) => {
                setMachines([]);
                setFilteredMachines([]);
                toast.error(err?.response?.data?.message || "Something Went Wrong");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchMachines();
        

    }, []);


    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const getAccessCentres = (state, centre, setCentre) => {
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
                CentreDataValue.unshift({ label: "Select Centre", value: "" });
                state(CentreDataValue);
                if (centre) {
                    setCentre({ ...centre, CentreID: CentreDataValue[0]?.value });
                }
            })
            .catch((err) => {
                if (err.response.status === 401) {
                    window.sessionStorage.clear();
                    window.localStorage.clear();
                    window.location.href = "/login";
                }
            });
    };
    
    useEffect(() => {
        getAccessCentres(setCentreId);

    }, []);

    

    ////////getMachineInfo api ///////////////
    const getMachineInfo = () => {

        axiosInstance.get("MachineGroup/getMachineinfo")

            .then((res) => {
                const normalizedData = (res?.data?.message || []).map(item => ({
                    ...item,
                    NAME: item.NAME || item.Name || 'No Name',
                    Name: item.Name || item.NAME || 'No Name'

                }));
                setMachineInfo(normalizedData);
                setMasterMachineInfo(normalizedData);
            }).catch((err) => {

                setMachineInfo([]);
                setMasterMachineInfo([]);
                toast.error("already test exist")
                toast.error(err?.response?.data?.message || "Something Went Wrong");
            })
    }


    const handleOpenMapping = (Machine_ParamID) => {
        const selectedParam = machineParams.find(item => item.Machine_ParamID === Machine_ParamID);
        console.log("selectedParam",selectedParam)
        setSelectedMachineParamName(selectedParam?.MachineParam || "");
        setSelectedMachineParamID(selectedParam?.Machine_ParamID || "");
        setFieldValue(prev => ({ ...prev, Machine_ParamID }));
        getMachineInfo();
        bindLabobservationData(Machine_ParamID);
        setShowMappingUI(true);
        setSearchFilterTerm("");
    };

    // Filter machines based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredMachines(machines);
        } else {
            const filtered = machines.filter(
                (machine) =>
                    machine.Machinename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    machine.GLobalMachineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    machine.Centre?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredMachines(filtered);
        }
    }, [searchTerm, machines]);

    const handleSelectMachine = (machine) => {
        setSelectedMachine(machine);
        setIsCreatingNew(false);
        setMachineParams([]);
        setPayload({
            MachineID: machine.MachineID || "",
            Machinename: machine.Machinename || "",
            CentreID: machine.CentreID || "",
            Centre: machine.Centre || "",
            ITDKEY: machine.ITDKEY || "",
            GlobalMachineID: machine.GlobalMachineID || "",
            GLobalMachineName: machine.GLobalMachineName || "",
            BatchRequest: machine.BatchRequest || 0,
        });
        onClickMachineData(machine.MachineID);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
        setErr({ ...err, [name]: "" });
    };

    const handleParameterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setParameterPayload(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    useEffect(() => {
        console.log("machineInfo updated:", machineInfo);
    }, [machineInfo]);

    useEffect(() => {
        console.log("mappedTests updated:", mappedTests);
    }, [mappedTests]);

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
        setErr({});
    };

    const handleReactSelectChange = (name, option) => {

        if (name === "GlobalMachineID") {
            setPayload((prev) => ({
                ...prev,
                [name]: option.value,
            }));
        }
    };

    const handleRoundSelectChange = (name, value) => {
        setParameterPayload((prev) => ({
            ...prev,
            [name]: value ? value.value : "",
        }));
    };

    const handleSave = () => {
        let generatedError = validationForMachineMaster(payload);
        console.log(generatedError);
        if (generatedError === "") {
            setLoading(true);
            axiosInstance
                .post("MachineGroup/InsertMachineData", payload)
                .then((res) => {
                    toast.success(res?.data?.message);
                    setPayload({
                        MachineID: "",
                        Machinename: "",
                        CentreID: "",
                        GlobalMachineID: "",
                        BatchRequest: 0,
                        ITDKEY: "",
                        Centre: ""
                    });
                    setLoading(false);
                    fetchMachines();
                    setIsUpdate(false);
                    setIsCreatingNew(false);
                    setSelectedMachine(null);
                })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.message
                            ? err?.response?.data?.message
                            : "Something Went Wrong"
                    );
                    setLoading(false);
                });
        } else {
            setErr(generatedError);
        }
    };

    const handleSaveParameter = () => {

        if (!parameterPayload.machineParam || !parameterPayload.machineParam.trim()) {
            toast.error("Machine Param is required");
            return;
        }
        let machineId = "";

        if (machineParams && machineParams.length > 0 && machineParams[0].MACHINEID) {

            machineId = machineParams[0].MACHINEID;
        } else if (selectedMachine && selectedMachine.MachineID) {
            machineId = selectedMachine.MachineID;
        } else {
            toast.error("No machine ID found. Please select a machine first.");
            return;
        }
        const apiPayload = {
            machine_ParamID: parameterPayload?.machineParam || "",
            machineid: machineId,
            machineParam: parameterPayload.machineParam,
            suffix: parameterPayload.suffix || "",
            assayNo: parameterPayload.assayNo || "",
            roundUpTo: parseInt(parameterPayload.roundUpTo) || 0,
            isOrderable: parameterPayload.isOrderable ? 1 : 0,
            decimalcalc: parameterPayload.paramAlias || "",
            isRound: parameterPayload.isRound ? 1 : 0
        };
        console.log("Saving parameter with machine ID:", machineId);
        console.log("API Payload:", apiPayload);
        axiosInstance.post("MachineGroup/AddParam", apiPayload)
            .then((res) => {
                toast.success(res?.data?.message || "Parameter saved successfully");
                setShowParameterModal(false);

                setParameterPayload({
                    machineParam: "",
                    paramAlias: "",
                    suffix: "",
                    assayNo: "",
                    isOrderable: false,
                    isMultiple: false,
                    isRound: false,
                    roundUpTo: 0
                });
                if (machineId) {
                    onClickMachineData(machineId);
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to save parameter");
                console.error("Error saving parameter:", err);
            });
    };

    const bindLabobservationData = (Machine_ParamID) => {
        console.log("Machine_ParamID",Machine_ParamID);
        if (!Machine_ParamID) {
            toast.error("No Machine Parameter ID found");
            return;
        }
        axiosInstance.post("MachineGroup/bindlabobservationdata", {
            Machine_ParamID: Machine_ParamID
        })
            .then((res) => {
                setMappedTests(res?.data?.message || []);
                toast.success("Test mapping data loaded successfully");
                console.log("Test Mapping Data:", res.data);
            })
            .catch((err) => {
                setMappedTests([]);
                toast.error(err?.response?.data?.message || "Failed to load test mapping data");
            });
    };

    const onClickMachineData = (machineId) => {
        axiosInstance
            .post("MachineGroup/onclickmachinedata", { machineId })
            .then((res) => {
                const machineData = res?.data?.message || [];
                setMachineParams(machineData);


                if (machineData.length > 0) {
                    const paramID = machineData[0].Machine_ParamID;
                    setSelectedMachineParamID(paramID);
                    // bindLabobservationData(paramID);
                }

                toast.success("Machine data loaded successfully");
                console.log("Machine Data:", machineData);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to fetch machine data");
            });
    };


    const handleAddNewMachine = () => {
        setSelectedMachine(null);
        setIsCreatingNew(true);
        setPayload({
            MachineID: "",
            Machinename: "",
            CentreID: "",
            Centre: "",
            ITDKEY: "",
            GlobalMachineID: "",
            GLobalMachineName: "",
            BatchRequest: 0,
        });
        setErr({});
    };

    console.log("machine",machineParams);

    const handleCancelCreate = () => {
        setIsCreatingNew(false);
        setSelectedMachine(null);
        setPayload({
            MachineID: "",
            Machinename: "",
            CentreID: "",
            GlobalMachineID: "",
            BatchRequest: 0,
            ITDKEY: "",
        });
        setErr({});
    };

    const handleCancelParameter = () => {
        setShowParameterModal(false);
        setParameterPayload({
            machineParam: "",
            paramAlias: "",
            suffix: "",
            assayNo: "",
            isOrderable: false,
            isMultiple: false,
            isRound: false,
            roundUpTo: 0
        });
    };

    // Available Tests selection
    const toggleAvailable = (test) => {
        setSelectedAvailable(prev =>
            prev.some(item => item.LabObservation_ID === test.LabObservation_ID)
                ? prev.filter(item => item.LabObservation_ID !== test.LabObservation_ID)
                : [...prev, test]
        );
    };

    // Mapped Tests selection
    const toggleMapped = (test) => {
        setSelectedMapped(prev =>
            prev.some(item => item.LabObservation_ID === test.LabObservation_ID)
                ? prev.filter(item => item.LabObservation_ID !== test.LabObservation_ID)
                : [...prev, test]
        );
    };

    // Right arrow: Available → Mapped (Save API)
    // Right arrow: Available → Mapped (Save API)
    const handleAvailableTestAdd = async () => {
        try {
            for (const test of selectedAvailable) {
                await axiosInstance.post("MachineGroup/SaveObservationData", {
                    Machine_ParamID: FieldValue.Machine_ParamID,
                    LabObservation_ID: test.LabObservation_ID
                });
            }
            setMappedTests(prev => [...prev, ...selectedAvailable]);
            setMachineInfo(prev => prev.filter(test => !selectedAvailable.includes(test)));
            setMasterMachineInfo(prev => prev.filter(test => !selectedAvailable.includes(test)))
            setSelectedAvailable([]);

            toast.success("Tests added successfully!");
        } catch (err) {
            console.error("Failed to save observation data:", err);
            toast.error(
                err?.response?.data?.message || "Something went wrong while adding tests"
            );
        }
    };


    // Left arrow: Mapped → Available (Delete API)
    const handleMappedTestDelete = async () => {
        try {
            for (const test of selectedMapped) {
                await axiosInstance.post("MachineGroup/DeleteLabobservationData", {
                    Machine_ParamID: FieldValue.Machine_ParamID, // use the selected machine
                    LabObservation_ID: test.LabObservation_ID
                });
            }

            setMachineInfo(prev => [...prev, ...selectedMapped]);
            setMasterMachineInfo(prev => [...prev, ...selectedMapped])
            setMappedTests(prev => prev.filter(test => !selectedMapped.includes(test)));
            setSelectedMapped([]);
            toast.success("Deleted  successfully!");
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Something went wrong while adding tests"
            );

        }
    };

    const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchFilterTerm(e.target.value);

    if (!value) {
      setMachineInfo(masterMachineInfo);
      return;
    }

    const searchableKeys = [
      "Name",
    ];

    const filtered = masterMachineInfo?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setMachineInfo(filtered);
  };

  const getAllDepartmentAndMachine = async () => {
    //   dispatch(setLoading(true));
      await axiosInstance
        .get(apiUrls.GetMachineGroup)
        .then((res) => {
          const machineList = res?.data?.message?.machines.map((item) => ({
            ...item,
            label: item?.MachineName,
            value: item?.MachineID,
          }));
          setDropdownlist((prev) => ({ ...prev, machineList }));
        })
        .catch((err) => {
          notify(err?.data?.message, "error");
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    };


    const handleUpdateParam = () => {
        const updatePayload = {
            Machine_ParamID: FieldValue?.Machine_ParamID || "",
            MACHINEID: FieldValue?.MACHINEID || "",
            MachineParam: FieldValue?.MachineParam || "",
            Suffix: FieldValue?.Suffix || "",
            AssayNo: FieldValue?.AssayNo || "",
            RoundUpTo: FieldValue?.RoundUpTo || "0",
            IsOrderable: FieldValue?.IsOrderable === "TRUE" ? 1 : (FieldValue?.IsOrderable == 1 ? 1 : 0),
            Decimalcalc: FieldValue?.Decimalcalc || "0",
            IsRound: FieldValue?.IsRound ? 1 : 0,
        };

        axiosInstance
            .post("MachineGroup/UpdateParam", updatePayload)
            .then((res) => {
                toast.success("Parameter updated successfully");
                setShow({ modal: false, type: "" });
                onClickMachineData(FieldValue?.MACHINEID); // refresh table
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to update parameter");
            });
    };

    useEffect(()=>{
        getAllDepartmentAndMachine();
    },[]);

    console.log("FieldValue",FieldValue);
    console.log("machineParamas",machineParams);
    console.log("payload",payload);


    return (
        <div className="container-fluid p-0">
            <Accordion name={t("Machine Mapping Master")} defaultValue={true} isBreadcrumb={true}>
                <div className="row">
                    {/* Left Side - Machine List */}
                    <div className="col-md-2">
                        <div className="card">
                            <div className="card-body">
                                {/* Search Bar */}
                                <div className="mb-1">
                                    <Input
                                        type="text"
                                        placeholder={t("Search machines...")}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-control"
                                    />
                                </div>

                                {/* Machine List */}
                                <div className="machine-list" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                    {loading ? (
                                        <div className="text-center">{t("Loading machines...")}</div>
                                    ) : filteredMachines.length === 0 ? (
                                        <div className="text-center text-muted">{t("No machines found")}</div>
                                    ) : (
                                        filteredMachines.map((machine, index) => (
                                            <div
                                                key={machine.MachineID || index}
                                                className={`machine-item px-1 mb-2 border rounded cursor-pointer ${selectedMachine?.MachineID === machine.MachineID ? "bg-light-blue" : "bg-light"
                                                    }`}
                                                onClick={() => handleSelectMachine(machine)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="fw-bold">{machine.Machinename}</div>
                                                <div className="small">
                                                    <strong>{machine.GLobalMachineName}</strong>
                                                </div>
                                                <div className="small text-muted">{machine.Centre}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="mt-3">
                                    <CustomButton
                                        text={"Add New Machine"}
                                        icon={"add"}
                                        onClick={handleAddNewMachine}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Machine Details */}
                    <div className="col-md-10">
                        <div className="card">
                            {/* <div className="card-header bg-light">
                                <h5 className="mb-0 ml-2">
                                    <strong>
                                        {isCreatingNew
                                            ? t("Create New Machine")
                                            : selectedMachine
                                                ? `Updating details for ${selectedMachine.Machinename}`
                                                : t("Machine Information")}
                                    </strong>
                                </h5>
                            </div> */}
                            <div className="card-body">
                                {isCreatingNew ? (
                                    /* Create New Machine Form - WITHOUT Machine Parameters */
                                    <div>
                                        <div className="mb-4">
                                            <h6 className="border-bottom pb-2">
                                                {t("Fill in the details for the new machine")}
                                            </h6>

                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <Input
                                                        placeholder=""
                                                        name="Machinename"
                                                        id="Machinename"
                                                        className="required-fields"
                                                        value={payload?.Machinename}
                                                        onChange={handleChange}
                                                        maxLength={30}
                                                        required
                                                        lable={t("Machine Name")}
                                                    />
                                                    {err?.Machinename && (
                                                        <div className="error-message text-danger small">
                                                            Machine name is required
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-sm-6">
                                                    <SelectBox
                                                        name="CentreID"
                                                        id="CentreID"
                                                        options={centreId}
                                                        className="required-fields"
                                                        selectedValue={payload?.CentreID}
                                                        onChange={handleSelectChange}
                                                        lable={t("Centre")}
                                                    />
                                                    {payload.CentreID === "" && (
                                                        <div className="error-message">{err?.CentreID}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="row mt-3">
                                                <div className="col-sm-6">
                                                    {/* <Input
                                                        placeholder=""
                                                        name="GlobalMachineID"
                                                        id="GlobalMachineID"
                                                        className="required-fields"
                                                        value={payload?.GlobalMachineID}
                                                        onChange={handleChange}
                                                        maxLength={30}
                                                        required
                                                        lable={t("Global Machine ID")}
                                                    /> */}
                                                    <ReactSelect
                                                        name="GlobalMachineID"
                                                        id="GlobalMachineID"
                                                        removeIsClearable={true}
                                                        dynamicOptions={dropdownlist?.machineList}
                                                        placeholderName={t("Global Machine ID")}
                                                        value={payload?.GlobalMachineID}
                                                        onChange={handleReactSelectChange}
                                                        // isDisabled={isEditMode}
                                                    />
                                                    {err?.GlobalMachineID && (
                                                        <div className="error-message text-danger small">
                                                            Global Machine ID is required
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-sm-6">
                                                    <Input
                                                        placeholder=""
                                                        name="ITDKEY"
                                                        id="ITDKEY"
                                                        className="required-fields"
                                                        value={payload?.ITDKEY}
                                                        onChange={handleChange}
                                                        maxLength={30}
                                                        required
                                                        lable={t("ITD Key")}
                                                    />
                                                    {err?.ITDKEY && (
                                                        <div className="error-message text-danger small">
                                                            ITD Key is required
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="row mt-3">
                                                <div className="col-sm-6">
                                                    <Input
                                                        placeholder=""
                                                        name="MachineID"
                                                        id="MachineID"
                                                        className="required-fields"
                                                        value={payload?.MachineID}
                                                        onChange={handleChange}
                                                        maxLength={30}
                                                        required
                                                        lable={t("Machine ID")}
                                                    />
                                                    {err?.MachineID && (
                                                        <div className="error-message text-danger small">
                                                            Machine ID is required
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-sm-6">
                                                    <Input
                                                        type="number"
                                                        placeholder=""
                                                        name="BatchRequest"
                                                        id="BatchRequest"
                                                        className="required-fields"
                                                        value={payload?.BatchRequest}
                                                        onChange={handleChange}
                                                        lable={t("Batch Request")}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons for Create Mode */}
                                        <div className="d-flex gap-2">
                                            
                                            <SaveButton
                                                text={"Create Machine"}
                                                onClick={handleSave}
                                                className="mr-2"
                                            />
                                            <CancelButton
                                                text={"Cancel"}
                                                onClick={handleCancelCreate}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* Default Machine Information and Parameters (when editing existing machine) */
                                    <div>
                                        {/* Machine Information Section */}
                                        <div className="mb-2">
                                            
                                            {/* <h6 className="border-bottom pb-2"><strong>{t("Machine Information")}</strong></h6> */}
                                            <div className="d-flex justify-content-between mb-1">
                                                <div>
                                                    <h6 className="pb-2 mb-0"><strong>{t("Machine Information")}</strong></h6>
                                                </div>
                                                    <button
                                                        title="Add Parameter"
                                                        className="d-flex align-items-center justify-content-center ml-2 rounded text-white border-0 p-1"
                                                        style={{ height: "24px", width: "24px" }}
                                                        onClick={() => setShowParameterModal(true)}
                                                    >
                                                        <PlusIcon />
                                                    </button>
                                                {/* <CustomButton
                                                    text={"Add"}
                                                    icon={"add"}
                                                    onClick={() => setShowParameterModal(true)}
                                                /> */}
                                            </div>

                                            <div className="row">
                                                <div className="col-sm-2">
                                                    <Input
                                                        placeholder=""
                                                        name="Machinename"
                                                        id="Machinename"
                                                        className="required-fields"
                                                        value={payload?.Machinename}
                                                        onChange={handleChange}
                                                        maxLength={30}
                                                        required    
                                                        lable={t("Machine Name")}
                                                        disabled
                                                        readOnly
                                                    />

                                                </div>

                                                <div className="col-sm-2">
                                                    <Input
                                                        placeholder=""
                                                        name="Centre"
                                                        id="Centre"
                                                        className="required-fields"
                                                        value={payload?.Centre}
                                                        onChange={handleChange}
                                                        maxLength={50}
                                                        required
                                                        lable={t("Centre")}
                                                        disabled
                                                        readOnly
                                                    />
                                                    {/* {err?.Centre && (
                                                        <div className="error-message">{err?.Centre}</div>
                                                    )} */}
                                                </div>

                                                <div className="col-sm-2">
                                                    <Input
                                                        placeholder=""
                                                        name="MachineID"
                                                        id="MachineID"
                                                        className="required-fields"
                                                        value={payload?.MachineID}
                                                        onChange={handleChange}
                                                        maxLength={30}
                                                        required
                                                        // disabled={isUpdate}
                                                        lable={t("Machine ID")}
                                                        disabled
                                                        readOnly
                                                    />

                                                </div>


                                                <div className="col-sm-2">
                                                    <Input
                                                        type="text"
                                                        placeholder=""
                                                        name="ITDKEY"
                                                        id="ITDKEY"
                                                        className="required-fields"
                                                        value={payload?.ITDKEY}
                                                        onChange={handleChange}
                                                        lable={t("ITD KEY")}
                                                    />
                                                </div>

                                                <div className="col-auto d-flex align-items-center  ">
                                                    <strong><span >{t("Batch Request")}</span></strong>
                                                    <label class="switch ml-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={payload.BatchRequest}
                                                            onChange={() => handleToggle("BatchRequest")}
                                                        />
                                                        <span class="slider"></span>
                                                    </label>

                                                </div>
                                                <div className="col-sm-1">
                                                        <SaveButton
                                                            text={"Save"}
                                                            onClick={handleSave}
                                                        />
                                                </div>
                                            </div>
                                            {/* <div className="col-auto d-flex p-2">
                                                    <label className="me-2">{t("Batch Request")}</label>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            type="switch"
                                                            className="form-check-input"
                                                            checked={payload.BatchRequest}
                                                            onChange={() => handleToggle("BatchRequest")}
                                                        />
                                                    </div>
                                                </div> */}


                                        </div>

                                        {/* Action Buttons */}
                                        {/* <div className="d-flex gap-2 mb-4">
                                            
                                            <SaveButton
                                                text={"Save Changes"}
                                                onClick={handleSave}
                                            />
                                        </div> */}
                                        {/* <div className="mb-3">
                                            <div className="d-flex justify-content-end">
                                                <CustomButton
                                                    text={"Add Parameter"}
                                                    icon={"add"}
                                                    onClick={() => setShowParameterModal(true)}
                                                />
                                            </div>
                                        </div> */}
                                        {/* Machine Parameters Section - ONLY visible when editing existing machine */}

                                        <div>


                                            {!showMappingUI ? (
                                                <>

                                                    {selectedMachine && (
                                                        <div className="table-responsive mt-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                                            <h6 className="border-bottom pb-2"><strong>Machine Parameters</strong></h6>
                                                            <Tables>
                                                                <thead className="bg-light">
                                                                    <tr>
                                                                        <th></th>
                                                                        {/* <th>Machine ID</th> */}
                                                                        <th>Machine Param ID</th>
                                                                        <th>Alias</th>
                                                                        <th>AssayNo</th>     
                                                                        <th>IsOrderable</th>
                                                                        <th>IsRound</th>
                                                                        <th>Test</th>                                                                       
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {machineParams?.length > 0 ? (
                                                                        machineParams?.map((item, index) => (
                                                                            <tr key={index}>
                                                                                <td>
                                                                                    <IoIosArrowForward
                                                                                        style={{ cursor: "pointer" }}
                                                                                        onClick={() => handleOpenMapping(item.Machine_ParamID)}
                                                                                        title="Click to view test mapping"
                                                                                    />
                                                                                </td>
                                                                                {/* <td>{item?.MACHINEID || "-"}</td> */}
                                                                                <td>{item?.Machine_ParamID||"-"}</td>
                                                                                <td>{item?.MachineParam || "-"}</td>
                                                                                <td>{item?.AssayNo || "-"}</td>
                                                                                <td>{(item?.IsOrderable == "TRUE" ? "Yes" : "No") || "-"}</td>
                                                                                <td>{item?.IsRound === 1 ? "Yes" : "No"}</td>
                                                                                {/* <td>{item?.Decimalcalc || "-"}</td>
                                                                                
                                                                                <td>{item.Multiple || "-"}</td> */}
                                                                                <td title={item.Test || "-"}>
                                                                                    {item.Test
                                                                                        ? item.Test.length > 30
                                                                                            ? item.Test.substring(0, 30) + "..."
                                                                                            : item.Test
                                                                                        : "-"}
                                                                                </td>         
                                                                                <td>
                                                                                    {/* <EditButton
                                                                                        text={"Edit"}
                                                                                        onClick={() => {
                                                                                            console.log("Edit clicked itemmmmm:", item);
                                                                                            setShow({
                                                                                                modal: true,
                                                                                                type: "Edit",
                                                                                            });
                                                                                            setFieldValue(item); 
                                                                                            setActive(item?.MACHINEID); 
                                                                                        }}
                                                                                    /> */}
                                                                                    <FaEdit
                                                                                        style={{ cursor: "pointer", color: "#1677ff" }}
                                                                                        onClick={() => {
                                                                                            console.log("Edit clicked item:", item);
                                                                                            setShow({ modal: true, type: "Edit" });
                                                                                            setFieldValue(item);
                                                                                            setActive(item?.MACHINEID);
                                                                                        }}
                                                                                    />
                                                                                </td>

                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="9" className="text-center text-muted">
                                                                                No parameters added yet
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Tables>
                                                        </div>
                                                    )}


                                                </>
                                            ) : (
                                                // ---------- MAPPING VIEW ----------

                                                <div className="mt-1  position-relative" style={{ maxHeight: "350px" }}>
                                                    <div className="align-items-center justify-content-between mb-2">
                                                        {/* Left side */}
                                                        <div className=" align-items-center">
                                                            <span
                                                                className="btn  me-2 p-0"
                                                                onClick={() => {setShowMappingUI(false)
                                                                    setSelectedMachineParamName("");
                                                                    setSelectedMachineParamID("");
                                                                }}
                                                            >
                                                                <strong style={{color: "#1677ff"}}>  Machine Parameters <span className=""> &gt;</span> </strong>
                                                            </span>

                                                            <span className="fs-5 fw-bold"><strong>Test Mapping</strong></span>
                                                        </div>
                                                    </div>


                                                    {/* <h3> <strong>Machine Param : {selectedMachineParamName}</strong></h3> */}
                                                    <div className="d-flex gap-2">
                                                        <div className="mr-3"><strong>Machine Param : {selectedMachineParamName}</strong></div>
                                                        <div><strong>Machine Param ID: {selectedMachineParamID}</strong></div>
                                                    </div>
                                                    <div className="d-flex position-relative">


                                                        {/* Available Tests */}
                                                        <div
                                                            className="w-50 border p-2 rounded "
                                                            style={{ maxHeight: "300px", overflowY: "auto" }}
                                                        >
                                                            {/* <h6>

                                                                <strong>Available Tests</strong>
                                                            </h6> */}
                                                            <div className="col-sm-12 d-flex justify-content-end">
                                                                        <Input
                                                                          type="text"
                                                                          value={searchFilterTerm}
                                                                          onChange={handleChangeSearch}
                                                                          placeholder="Search Available Test"
                                                                        />
                                                                      </div>
                                                                    
                                                            <ul>
                                                                {machineInfo.map((test) => (
                                                                    <li key={test.LabObservation_ID} className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedAvailable.some(
                                                                                (item) => item.LabObservation_ID === test.LabObservation_ID
                                                                            )}
                                                                            onChange={() => toggleAvailable(test)}
                                                                        />
                                                                        <label className="ml-2">{test.Name}</label>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Arrows in Center */}
                                                        <div
                                                            className="d-flex flex-column justify-content-center align-items-center position-absolute"
                                                            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                                                        >
                                                            {/* Right Arrow → (move Available → Mapped) */}
                                                            <button
                                                                className="btn btn-primary mb-2"
                                                                onClick={handleAvailableTestAdd}
                                                                disabled={selectedAvailable.length === 0}
                                                            >
                                                                <FaArrowRight />
                                                            </button>

                                                            {/* Left Arrow ← (move Mapped → Available) */}
                                                            <button
                                                                className="btn btn-primary mt-2"
                                                                onClick={handleMappedTestDelete}
                                                                disabled={selectedMapped.length === 0}
                                                            >
                                                                <FaArrowLeft />
                                                            </button>
                                                        </div>

                                                        {/* Mapped Tests */}
                                                        <div
                                                            className="w-50 border p-3 rounded"
                                                            style={{ maxHeight: "300px", overflowY: "auto" }}
                                                        >
                                                            <h6>
                                                                <strong>Mapped Tests</strong>
                                                            </h6>
                                                            <ul>
                                                                {mappedTests.map((test) => (
                                                                    <li key={test.LabObservation_ID} className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedMapped.some(
                                                                                (item) => item.LabObservation_ID === test.LabObservation_ID
                                                                            )}
                                                                            onChange={() => toggleMapped(test)}
                                                                        />
                                                                        <label className="ml-2">{test.NAME}</label>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Accordion>
            {show?.modal && (
                <MachineParamModal
                    show={show?.modal}
                    data={{
                        ...FieldValue,
                        MachineParam: FieldValue?.MachineParam,
                        Machine_ParamID:
                            show?.type === "Add" ? "" : FieldValue?.Machine_ParamID,
                        ID: active,
                        isEnable: show?.type === "Add" ? false : true,
                        isId: true,
                    }}
                    active={{ value: active }}
                    onclickmachinedata={onClickMachineData}
                    bindlabobservationdata={bindLabobservationData}
                    handleClose={() =>
                        setShow({
                            modal: false,
                            type: "",
                        })
                    }
                />
            )}

            {/* Add Parameter Modal */}
            {showParameterModal && (
                <Dialog
                    header={t("Add New Machine Parameter")}
                 onHide={handleCancelParameter} 

                    className={theme}
                    visible={show}
                    style={{
                        width: isMobile ? "80vw" : "50vw"
                    }}
                >
                    {/* <div className="modal-dialog modal-lg"> */}
                    {/* <div className="modal-content"> */}
                    {/* <div className={`modal-`}>
                        <h5 className="modal-title ml-2" ><strong>Add New Machine Parameter</strong></h5>
                    </div> */}
                    <div className="modal-body">
                        {/* <strong><p>Configure the machine parameter details. Click save when you're done.</p></strong> */}

                        <div className="row">
                            <div className="col-md-6">
                                <Input
                                    lable="Machine Param"
                                    name="machineParam"
                                    placeholder=""
                                    value={parameterPayload.machineParam}
                                    onChange={handleParameterChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <Input
                                    lable="Param Alias"
                                    name="paramAlias"
                                    placeholder=""
                                    value={parameterPayload.paramAlias}
                                    onChange={handleParameterChange}
                                />
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-6">
                                <Input
                                    lable="Suffix"
                                    name="suffix"
                                    placeholder=""
                                    value={parameterPayload.suffix}
                                    onChange={handleParameterChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <Input
                                    lable="Assay No."
                                    name="assayNo"
                                    placeholder=""
                                    value={parameterPayload.assayNo}
                                    onChange={handleParameterChange}
                                />
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-4">
                                <ReactSelect
                                    dynamicOptions={[
                                        { label: t("-1"), value: "-1" },
                                        { label: t("0"), value: "0" },
                                        { label: t("1"), value: "1" },
                                        { label: t("2"), value: "2" },
                                        { label: t("3"), value: "3" },
                                    ]}
                                    name="roundUpTo"
                                    lable={t("Round Up to")}
                                    id="roundUpTo"
                                    removeIsClearable={true}
                                    placeholderName={t("Select Rounds")}
                                    value={parameterPayload?.roundUpTo}
                                    onChange={handleRoundSelectChange}
                                    isDisabled={!parameterPayload.isRound}
                                />
                            </div>
                            <div className="col-md-4 d-flex align-items-start">
                                {/* <div className="form-check mb-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="isOrderable"
                                                checked={parameterPayload.isOrderable}
                                                onChange={handleParameterChange}
                                            />
                                            <label className="form-check-label">Orderable</label>
                                        </div> */}


                                {/* <div className="col-auto d-flex p-2 align-items-center"> */}
                                    <strong className="me-2 mr-2">{t("Orderable")}</strong>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={parameterPayload.isOrderable}
                                            onChange={() =>
                                                setParameterPayload((prev) => ({
                                                    ...prev,
                                                    isOrderable: !prev.isOrderable,
                                                }))
                                            }
                                        />
                                        <span className="slider "></span>
                                    </label>
                                {/* </div> */}
                                {/* <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="isMultiple"
                                                checked={parameterPayload.isMultiple}
                                                onChange={handleParameterChange}
                                            />
                                            <label className="form-check-label">Multiple</label>
                                        </div> */}


                                {/* <div className="col-auto d-flex p-2">
                                    <strong className="me-2 mr-2">{t("Multiple")}</strong>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={parameterPayload.isMultiple}
                                            onChange={() =>
                                                setParameterPayload((prev) => ({
                                                    ...prev,
                                                    isMultiple: !prev.isMultiple, // toggle ON/OFF
                                                }))
                                            }
                                        />
                                        <span className="slider "></span>
                                    </label>
                                </div> */}



                            </div>
                            {/* <div className="col-md-6"> */}


                                {/* <div className="col-auto d-flex p-2 align-items-center"> */}
                                    {/* <strong className="me-2 mr-2">{t("Is Round")}</strong>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={parameterPayload.isRound}
                                            onChange={() =>
                                                setParameterPayload((prev) => ({
                                                    ...prev,
                                                    isRound: !prev.isRound, // toggle ON/OFF
                                                }))
                                            }
                                        />
                                        <span className="slider"></span>
                                    </label> */}
                                    {/* <div className="col-sm-6 ml-4 ">


                                        <ReactSelect
                                            dynamicOptions={[
                                                { label: t("-1"), value: "-1" },
                                                { label: t("0"), value: "0" },
                                                { label: t("1"), value: "1" },
                                                { label: t("2"), value: "2" },
                                                { label: t("3"), value: "3" },
                                            ]}
                                            name="roundUpTo"
                                            lable={t("Round Up to")}
                                            id="roundUpTo"
                                            removeIsClearable={true}
                                            placeholderName={t("Select Rounds")}
                                            value={parameterPayload?.roundUpTo}
                                            onChange={handleRoundSelectChange}
                                            isDisabled={!parameterPayload.isRound}
                                        />
                                    </div> */}
                                {/* </div> */}
                                {/* <Input
                                            type="number"
                                            lable=""
                                            name="roundUpTo"
                                            placeholder=""
                                            value={parameterPayload.roundUpTo}
                                            onChange={handleParameterChange}
                                            disabled={!parameterPayload.isRound}
                                        /> */}




                                {/* <div className="col-sm-2">
                                    <SelectBox
                                      lable="Round Up To"
                                      options={[
                                        { label: t("-1"), value: "-1" },
                                        { label: t("0"), value: "0" },
                                        { label: t("1"), value: "1" },
                                        { label: t("2"), value: "2" },
                                         { label: t("3"), value: "3" },
                
                                      ]}
                
                                      selectedValue={parameterPayload.roundUpTo}
                                      name="roundUpTo"
                                      onChange={handleSelectChange}
                                    //   disabled={!parameterPayload.isRound}
                                    />
                                  </div> */}



                            {/* </div> */}
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <CancelButton
                            text={"Cancel"}
                            onClick={handleCancelParameter}
                            className="mr-2"
                        />
                        <SaveButton
                            text={"Save Parameter"}
                            onClick={handleSaveParameter}
                        />
                    </div>
                    {/* </div> */}
                    {/* </div> */}
                </Dialog>

            )}


        </div>
    );
};

export default MachineMappingMaster;