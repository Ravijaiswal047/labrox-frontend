import React, { useEffect, useState } from "react";
import CustomTable from "../../../../components/Table/CustomTable";
import Heading from "../../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import ViewControlModal from "./ViewControlModal";
import Modal from "../../../../components/ModalComponent/Modal";
import FilterInput from "../../../../components/Filter/FilterInput";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { useDispatch } from "react-redux";
import { notify } from "../../../../utils/utils";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";

const ControlMasterSearchTable = ({ onEdit, refresh}) => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const dispatch = useDispatch();
  const [masterTableData, setMasterTableData] = useState([]);
  const [handleModelData, setHandleModelData] = useState({});
  const [modalData, setModalData] = useState({});

  const columns = [
    { header: "Sr. No", field: "hash" },
    { header: "View", field: "view" },
    { header: "Edit", field: "edit" },
    { header: "ControlID", field: "controlId" },
    { header: "Control Provider", field: "controlProvider" },
    { header: "Control Name", field: "controlName", width: "4%" },
    { header: "Lot Number", field: "lotNumber" },
    { header: "Department", field: "department" },
    { header: "Machine", field: "machine" },
    { header: "Start Date", field: "startDate" },
    { header: "Lot Expiry", field: "lotExpiry" },
    { header: "Status", field: "status" },
    { header: "Entry Date", field: "entryDate" },
    { header: "Entry BY", field: "entryBy" },
    { header: "DeActive", field: "deActive" },
  ];

  const handleEdit = (row) => {
    // console.log("Edit clicked for:", row);
    if (onEdit) onEdit(row.raw);
  };

  const handleModel = (
    label,
    width,
    type,
    isOpen,
    Component,
    handleInsertAPI,
    extrabutton,
  ) => {
    setHandleModelData({
      label: label,
      width: width,
      type: type,
      isOpen: isOpen,
      Component: Component,
      handleInsertAPI: handleInsertAPI,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
  };

  const getControlData = async (type = "1") => {
    // console.log("getControlData.............");
    const searchPayload = { type: type };
    const rowColor = type === "0" ? "#ffe58f" : "#90EE90";

    await axiosInstance
      .post(apiUrls.GetData, searchPayload)
      .then((res) => {
        console.log("res", res);
        const formattedData = res?.data?.message.map((item, index) => ({
          hash: index + 1,
          rowColor,
          view: (
            <i
              className="fa fa-eye"
              aria-hidden="true"
              onClick={() =>
                handleModel(
                  "Control data",
                  "95vw",
                  "Control data",
                  true,
                  <ViewControlModal
                    controlId={item.controlid}
                    controlData={{
                      // controlId: item.controlid,
                      controlProvider: item.ControlProvider,
                      controlName: item.controlname,
                      lotNumber: item.lotnumber,
                      department: item.SubCategoryName,
                      machine: item.machinename,
                      startDate: item.startdate,
                      lotExpiry: item.LotExpiry,
                      status: item.IsActive,
                      entryDate: item.dtEntry,
                      entryBy: item.CreatedByName,
                    }}
                    handleChangeModel={handleChangeModel}
                  />,
                )
              }
            ></i>
          ),
          edit: "Edit",
          controlId: item.controlid,
          controlProvider: item.ControlProvider,
          controlName: item.controlname,
          lotNumber: item.lotnumber,
          department: item.SubCategoryName,
          machine: item.machinename,
          startDate: item.startdate,
          lotExpiry: item.LotExpiry,
          status: item.IsActive,
          entryDate: item.dtEntry,
          entryBy: item.CreatedByName,
          deActive: (
            <span
              style={{ cursor: "pointer", color: "red", fontSize: "12px" }}
              title="Delete"
              onClick={() => handleDelete(item.controlid)}
            >
              ❌
            </span>
          ),
          raw: item,
        }));

        setTableData(formattedData);
        setMasterTableData(formattedData);
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {});
  };

  const handleDelete = async (controlId) => {
    if (!window.confirm("Are you sure you want to delete this control?"))
      return;

    try {
      dispatch(setLoading(true));
      const payload = { controlID: controlId };

      const res = await axiosInstance.post(apiUrls.DeleteControlData, payload);
      if(res?.data?.success){
        notify(res?.data?.message || "Control deleted successfully", "success");
      }
      // Refresh table data after deletion
      getControlData("1");
    } catch (err) {
      notify(
        err?.response?.data?.message || "Failed to delete control",
        "error",
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getControlData("1");
    setHandleModelData((val) => ({ ...val, modalData: modalData }));
  }, [modalData]);

  useEffect(() => {
    if (refresh) {
      getControlData("1");
    }
  }, [refresh]); 

  // useEffect(()=> {
  //   if (setChildFunction) {
  //     console.log("doneee")
  //     setChildFunction(getControlData);
  //   }
  // },[setChildFunction]);

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };
  const handleChangeModel = (data) => {
    setModalData(data);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setTableData(masterTableData);
      return;
    }

    const searchableKeys = [
      "controlName",
      "controlProvider",
      "controlId",
      "lotNumber",
      "department",
      "machine",
      "startDate",
      "lotExpiry",
      "entryBy",
    ];

    const filtered = masterTableData.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableData(filtered);
  };

  const colorsCodingData = [
    { color: "#ffe58f", id: "7", labelKey: "Deactive Or Expired" },
    { color: "#90EE90", id: "8", labelKey: "Active" },
  ];

  console.log("tableData....", tableData);

  return (
    <>
      <div className="card mt-2">
        <Heading
          title={t("Control List")}
          // isBreadcrumb={true}
          secondTitle={
            <>
              {colorsCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  onClick={() => {
                    if (id === "7") getControlData("0"); // Deactive
                    if (id === "8") getControlData("1"); // Active
                  }}
                />
              ))}
              <FilterInput
              value={searchTerm}
              onChange={handleChangeSearch}
              placeholder="Filter Table"
              className="ml-2"
            />
            </>
          }
        />{" "}
        {/* <div className="row p-2">
          <div className="col-sm-12 d-flex justify-content-end">
            <FilterInput
              value={searchTerm}
              onChange={handleChangeSearch}
              placeholder="Filter Table"
            />
          </div>
        </div> */}
        <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={columns}
              data={tableData}
              onEdit={(row) => handleEdit(row)}
            />
          </div>
        </div>
      </div>
      {handleModelData?.isOpen && (
        <Modal
          visible={handleModelData?.isOpen}
          setVisible={setIsOpen}
          modalWidth={handleModelData?.width}
          Header={t(handleModelData?.label)}
          buttonType={"submit"}
          buttons={handleModelData?.extrabutton}
          modalData={handleModelData?.modalData}
          setModalData={setModalData}
        >
          {handleModelData?.Component}
        </Modal>
      )}
    </>
  );
};

export default ControlMasterSearchTable;
