import React, { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import { Button } from "react-bootstrap";
import { CiCirclePlus } from "react-icons/ci";
import "./TargetSheet.css";
import CustomTable from "../../components/Table/CustomTable";
import Modal from "../../components/ModalComponent/Modal";
import FinancialYearPopUpModal from "./FinancialYearPopUpModal";
import { useSelector } from "react-redux";
import { setModalOpen } from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiEndpoints";
import { notify } from "../../utils/utils";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Input from "../../components/formComponent/Input";

const MachineTab = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { modalOpen } = useSelector((state) => state?.ticketing);

  const [payload, setPayload] = useState({
    centre: "",
    machine: [],
    fy: "",
  });

  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    machineList: [],
    FyList: [],
  });

    const GetFinancialYear = (name) => {
      const generateFYFallback = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const month = today.getMonth();
        const fyStart = month >= 3 ? currentYear : currentYear - 1;
        return [
          {
            label: `${fyStart - 1}-${fyStart}`,
            value: `${fyStart - 1}-${fyStart}`,
          },
          {
            label: `${fyStart}-${fyStart + 1}`,
            value: `${fyStart}-${fyStart + 1}`,
          },
          {
            label: `${fyStart + 1}-${fyStart + 2}`,
            value: `${fyStart + 1}-${fyStart + 2}`,
          },
        ];
      };

      axiosInstance
        .post("Global/GetGlobalData", {
          Type: name,
        })
        .then((res) => {
          let data = res.data.message;
          if (Array.isArray(data) && data.length > 0) {
            let SampleContainer = data.map((ele) => {
              return {
                value: ele.FieldDisplay,
                label: ele.FieldDisplay,
              };
            });
            setDropdownlist((prev) => ({ ...prev, FyList: SampleContainer }));
          } else {
            setDropdownlist((prev) => ({
              ...prev,
              FyList: generateFYFallback(),
            }));
          }
        })
        .catch((err) => {
          console.log(err);
          setDropdownlist((prev) => ({
            ...prev,
            FyList: generateFYFallback(),
          }));
        });
    };

    useEffect(() => {
      GetFinancialYear("FinancialYear");
    }, []);

  const [doctorShareData, setDoctorShareData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  console.log('doctorShareData',doctorShareData);

  const months = [
    "April", "May", "Jun", "July", "Aug",
    "Sept", "Oct", "Nov", "Dec", "Jan", "Feb", "March"
  ];

  const handleSelectAll = () => {
    const newValue = !selectAll;
    const updated = doctorShareData?.map((row) => ({
      ...row,
      checked: newValue,
    }));
    setDoctorShareData(updated);
    setSelectAll(newValue);
  };

  const tableHeaders = [
    { header: "S.No", field: "SrNo", width: "4%" },
    { header: "Centre", field: "centre", width: "10%" },
    { header: "Machine", field: "machine", width: "10%" },
    { header: "April", field: "April", width: "6%" },
    { header: "May", field: "May", width: "6%" },
    { header: "Jun", field: "Jun", width: "6%" },
    { header: "July", field: "July", width: "6%" },
    { header: "Aug", field: "Aug", width: "6%" },
    { header: "Sept", field: "Sept", width: "6%" },
    { header: "Oct", field: "Oct", width: "6%" },
    { header: "Nov", field: "Nov", width: "6%" },
    { header: "Dec", field: "Dec", width: "6%" },
    { header: "Jan", field: "Jan", width: "6%" },
    { header: "Feb", field: "Feb", width: "6%" },
    { header: "March", field: "March", width: "6%" },
    { header: "Total", field: "Total", width: "6%" },
    {
      header: (
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      ),
      field: "checkbox",
      width: "5%",
    },
  ];

  const handleReactChange = (name, e) => {
    if (name === "centre") {
      getMachineList(e?.value)
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
      return;
    }
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleSelectMultiChange = (select, name) => {
    const val = select?.map((ele) => ({
      MACHINENAME: ele.MACHINENAME,
      value: ele.value,
    }));
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  const handleOpenFinancialYModal = (visible) => {
    dispatch(setModalOpen(visible));
  };

  const getMachineList = async (centreId) => {
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetMachinesByCenter, { centerID: centreId })
      .then((res) => {
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.MACHINENAME,
          value: item?.MACHINEID,
        }));
        setDropdownlist((prev) => ({ ...prev, machineList: resList }));
        setPayload((prev) => ({ ...prev, machine: [resList?.[0]?.label] }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  }

  const getAllCentre = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.BindCentre)
      .then((res) => {

        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.centre,
          value: item?.centreid,
        }));
        setDropdownlist((prev) => ({ ...prev, centreList: resList }));
        setPayload((prev) => ({ ...prev, centre: resList?.[0]?.value }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      }).finally(() => {
        dispatch(setLoading(false));
      })

  };

  const getMachineRevenueTarget = async () => {
    const searchPayload = {
      "centreIDs": [
        payload?.centre
      ],
      "machineName": payload?.machine?.map(item => item.MACHINENAME) || [],
      "financialYear": (payload?.fy)?.toString() || ""
    }
    
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetTargetRevenue, searchPayload)
      .then((res) => {
        // console.log('res', res);
        const formattedData = res?.data?.data?.map((item, index) => ({
          SrNo: index + 1,
          centre: payload?.centre,
          machine: item.machineName,
          April: item.apr,
          May: item.may,
          Jun: item.jun,
          July: item.jul,
          Aug: item.aug,
          Sept: item.sep,
          Oct: item.oct,
          Nov: item.nov,
          Dec: item.dec,
          Jan: item.jan,
          Feb: item.feb,
          March: item.mar,
          checked: false, 
        }));      
        setDoctorShareData(formattedData);
      })
      .catch((err) => {
        console.log(err);
        notify(err?.respose?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const saveMachineRevenueTarget = async () => { 
    const savePayload = doctorShareData
      ?.filter(item => item.checked === true)
      ?.map(item => ({
        machineID: item.machine,
        fy: payload.fy,
        apr: item.April,
        may: item.May,
        jun: item.Jun,
        jul: item.July,
        aug: item.Aug,
        sep: item.Sept,
        oct: item.Oct,
        nov: item.Nov,
        dec: item.Dec,
        jan: item.Jan,
        feb: item.Feb,
        mar: item.March,
      }));

      // console.log('savePayload', savePayload);

    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls?.MachineRevenueTarget, savePayload)
      .then((res) => {
         const updatedData = doctorShareData?.map((row) => ({
        ...row,
        checked: false,
      }));
      setDoctorShareData(updatedData);
      })
      .catch((err) => {
        console.log(err);
        notify(err?.respose?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleCheckboxChange = (index) => {
    const updated = [...doctorShareData];
    updated[index].checked = !updated[index].checked;
    setDoctorShareData(updated);
    setSelectAll(updated.every((row) => row.checked));
  };

  const handleMonthValueChange = (index, val, name) => {
    setDoctorShareData((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index][name] = Number(val);
      }
      return updated;
    });
  };

  useEffect(() => {
    getAllCentre();
  }, [])

  return (
    <div className="machineTab">
      <Heading title={"Machine"} />
      <div className="card px-2 py-2 h-100">
        <div className="row mb-2 mt-1">
          <div className="col-sm-3 col-md-2">
            <ReactSelect
              dynamicOptions={dropdownlist?.centreList}
              name="centre"
              isShowBorder={true}
              lable={t("Centre")}
              id="centre"
              removeIsClearable={false}
              placeholderName={t("Centre")}
              value={payload?.centre}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <SelectBoxWithCheckbox
              name="machine"
              className="required-fields"
              placeholder={t("Machine")}
              lable={t("Machine")}
              id="machine"
              onChange={handleSelectMultiChange}
              options={dropdownlist?.machineList || []}
              value={payload?.machine?.value}
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <ReactSelect
              dynamicOptions={dropdownlist?.FyList}
              name="fy"
              isShowBorder={true}
              lable={t("Finacial Year")}
              id="fy"
              removeIsClearable={false}
              placeholderName={t("Finacial Year")}
              value={payload?.fy}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
          <Button className="rounded px-4 mx-2" onClick={getMachineRevenueTarget}>Search</Button>
          <Button className="rounded px-4" onClick={saveMachineRevenueTarget}>Save</Button>
          <div className="flex-grow-1 px-2">
            <Button
              onClick={() => handleOpenFinancialYModal(true)}
              style={{ float: "right" }}
              className="inertBtn"
            >
              <CiCirclePlus className="inserFyIcon" color="#fff" />
            </Button>
          </div>
        </div>
        
        <CustomTable
          columns={tableHeaders}
          data={(() => {
            if (!doctorShareData || doctorShareData.length === 0) return [];

            // Prepare month inputs and row totals
            const rowsWithTotal = doctorShareData?.map((row, index) => {
              const monthInputs = months.reduce((acc, month) => {
                acc[month] = row.checked ? (
                  <Input
                    type="text"
                    name={month}
                    value={row[month] || 0}
                    onChange={(e) => handleMonthValueChange(index, e.target.value, month)}
                  />
                ) : (
                  row[month] || 0
                );
                return acc;
              }, {});

              const rowTotal = months.reduce(
                (sum, month) => sum + Number(row[month] || 0),
                0
              );

              return {
                ...row,
                SrNo: index + 1,
                checkbox: (
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={() => handleCheckboxChange(index)}
                  />
                ),
                ...monthInputs,
                Total: rowTotal,
              };
            });

            // Calculate column totals for all month columns and Total
            const totalRow = {
              SrNo: "Total",
              centre: "",
              machine: "",
              checkbox: "",
            };

            months.forEach((month) => {
              totalRow[month] = doctorShareData.reduce(
                (sum, row) => sum + Number(row[month] || 0),
                0
              );
            });

            // Total column sum
            totalRow.Total = doctorShareData.reduce((sum, row) => {
              const rowSum = months.reduce(
                (s, month) => s + Number(row[month] || 0),
                0
              );
              return sum + rowSum;
            }, 0);

            return [...rowsWithTotal, totalRow];
          })()}
        />

      </div>
      <Modal
        Header={"Add Financial Year"}
        setVisible={handleOpenFinancialYModal}
        visible={modalOpen}
        children={<FinancialYearPopUpModal />}
        modalWidth={"40%"}
      />
    </div>
  );
};

export default MachineTab;
