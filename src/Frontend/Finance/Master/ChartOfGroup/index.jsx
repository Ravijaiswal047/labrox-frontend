import React, { useEffect, useState } from "react";
import TreeViewTable from "../../../../components/UI/customTable/TreeViewTable";
import { useTranslation } from "react-i18next";
import {
  BindChartOfAccount,
  BindGroupTable,
  bindMainGroupAPI,
  ChartOfGroupExcel,
  ChartOfUpdateGroupName,
  SaveNewGroupAPI,
  UpdateGroupCodeDisplay,
} from "../../../../NetworkServices/finance.js";
import { buildHierarchyTree } from "../../../../utils/ustil2";
// import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import {
  // handleReactSelectDropDownOptions,
  notify,
} from "../../../../utils/utils";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
// import Modal from "../../../../components/modalComponent/Modal";
import CentreWiseRecordModal from "./CentreWiseRecordModal";
import ChartOfAccountModal from "./ChartOfAccountModal";
import { exportToExcel } from "../../../../utils/exportLibrary";
import moment from "moment";
import { transformDataInTranslate } from "../../../../components/WrapTranslate";
import { ExcelIconSVG } from "../../../../components/SvgIcons";
import UpdateGroupNameModal from "./UpdateGroupNameModal";
import { handleReactSelectDropDownOptions } from "../../../utils/Utils";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal";
import Heading from "../../../../components/UI/Heading";

const index = () => {
  const [t] = useTranslation();
  const thead = [
    t("S.No."),
    { name: t("Code") },
    { name: t("Group Name"), width: "70%" },
  ];
  const [bodyData, setBodyData] = useState([]);
  const [bodyDataCache, setBodyDataCache] = useState([]);
  const [mainGroupList, setMainGroupList] = useState([]);
  const [values, setValues] = useState({});
  const ip = useLocalStorage("ip", "get");
  const [modalData, setModalData] = useState({ visible: false });

  const data = [
    {
      id: 1,
      groupName: "Group A",
      children: [
        {
          id: 2,
          groupName: "Group A.1",
          children: [
            {
              id: 3,
              groupName: "Group A.1.1",
              children: [
                {
                  id: 4,
                  groupName: "Group A.1.1.1",
                  children: [
                    {
                      id: 5,
                      groupName: "Group A.1.1.1.1",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 122,
          groupName: "Group A.1",
          children: [
            {
              id: 222,
              groupName: "Group A.1.1",
              children: [
                {
                  id: 44444,
                  groupName: "Group A.1.1.1",
                  children: [
                    {
                      id: 22323,
                      groupName: "Group A.1.1.1.1",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      groupName: "Group A",
      children: [
        {
          id: 22,
          groupName: "Group A.1",
          children: [
            {
              id: 33,
              groupName: "Group A.1.1",
              children: [
                {
                  id: 42,
                  groupName: "Group A.1.1.1",
                  children: [
                    {
                      id: 52,
                      groupName: "Group A.1.1.1.1",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const handleReactSelect = (name, value) => {
   // debugger
    setValues((val) => ({ ...val, [name]: value }));
  };
  const handleClick = async (val, type) => {
    if (type === "groupName") {
      let apiResp = await BindChartOfAccount(val?.id);
      if (apiResp?.success) {
        setModalData({
          visible: true,
          width: "75vw",
          label: t("Chart Of Account List"),
          // buttonName: buttonName,
          CallAPI: () => {},
          footer: <></>,
          Component: <ChartOfAccountModal bodyData={apiResp?.data} />,
        });
      } else {
        notify(apiResp?.message, "error");
      }
    }
  };

  const handleUpdateName = async (data) => {
    let payload = {
      name: String(data?.GroupName),
      gid: String(data?.MainGroup),
    };
    let apiResp = await ChartOfUpdateGroupName(payload);
    if (apiResp?.success) {
      notify(apiResp?.message);
      getBindGroupTable();
      setModalData((val) => ({ ...val, visible: false }));
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const handleEdit = (e, val) => {
    e.stopPropagation();
    setModalData({
      visible: true,
      width: "20vw",
      modalData: val,
      label: t("Update Name"),
      buttonName: t("Update"),
      CallAPI: handleUpdateName,
      // footer: <></>,
      Component: (
        <UpdateGroupNameModal inputData={val} setModalData={setModalData} />
      ),
    });
  };

  const getBindGroupTable = async () => {
    const apiResp = await BindGroupTable();
    if (apiResp?.success) {
      setBodyDataCache(apiResp?.data);
      const newResp = apiResp?.data?.map((val) => ({
        ...val,
        GroupName: (
          <span
            className={`${val?.ISEditable === 1 && "text-primary font-weight-bold"}`}
          >
            {val?.GroupName}{" "}
            {val?.ISEditable === 1 && (
              <i
                className="fa fa-edit"
                aria-hidden="true"
                onClick={(e) => {
                  handleEdit(e, val);
                }}
              ></i>
            )}{" "}
          </span>
        ),
      }));
      let data = buildHierarchyTree(newResp, []);
      setBodyData(data);
    }
  };

  const bindMainGroup = async () => {
    let apiResp = await bindMainGroupAPI();
    if (apiResp?.success) {
      setMainGroupList(
        handleReactSelectDropDownOptions(
          apiResp?.data,
          "GroupName",
          "GroupCode",
        ),
      );
    } else {
      setMainGroupList([]);
    }
  };

  useEffect(() => {
    getBindGroupTable();
    bindMainGroup();
  }, []);

  // const handelSaveGroup = async () => {
  //   debugger;
  //   console.log("values?.GroupName", values?.GroupName);
  //   if (!values?.GroupName) {
  //     notify("Group Name Field is Required", "error");
  //     return 0;
  //   }
  //   if (!values?.MainGroup?.value) {
  //     notify("Please Select Main Group Field", "error");
  //     return 0;
  //   }
  //   let payload = {
  //     name: values?.GroupName,
  //     // gid: values?.GroupCode?.value ? values?.GroupCode?.value : "",
  //     gid: values?.MainGroup?.value,
  //     ipAddress: ip,
  //   };
  //   const apiResp = await SaveNewGroupAPI(payload);
  //   if (apiResp?.success) {
  //     setValues({});
  //     notify(apiResp?.message);
  //     getBindGroupTable();
  //   } else {
  //     notify(apiResp?.message, "error");
  //   }
  // };

  const handelSaveGroup = async () => {
    // debugger;
    if (!values?.GroupName) {
      notify("Group Name Field is Required", "error");
      return;
    }

    if (!values?.MainGroup?.value) {
      notify("Please Select Main Group Field", "error");
      return;
    }

    let payload = {
      name: values.GroupName,
      gid: values.MainGroup.value,
      ipAddress: ip,
    };

    const apiResp = await SaveNewGroupAPI(payload);

    if (apiResp?.success) {
      setValues({});
      notify(apiResp?.message);
      getBindGroupTable();
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const centreWiseRecord = () => {
    setModalData({
      visible: true,
      width: "75vw",
      label: t("Centre Wise Record"),
      // buttonName: buttonName,
      CallAPI: () => {},
      footer: <></>,
      Component: <CentreWiseRecordModal />,
    });
  };

  const handleExportExcel = async () => {
    let apiResp = await ChartOfGroupExcel();
    if (apiResp?.success) {
      exportToExcel(
        transformDataInTranslate(apiResp?.data?.data, t),
        t(apiResp?.data?.reportName),
        t(apiResp?.data?.period),
      );
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const handleReorder = async (start, end) => {
    if (start === end) {
      notify("Please Select Different Group", "error");
      return;
    } else if (start?.length === 1) {
      notify(
        "Please Select Different Group Outer Parent Group Cannot Be Moved",
        "error",
      );
      return;
    }
    console.log("bodyDataCache", bodyDataCache);
    const removeItems = JSON.parse(JSON.stringify(bodyDataCache))?.filter(
      (item) => item?.GroupCodeDisplay?.startsWith(start),
    );
    const remainItems = JSON.parse(JSON.stringify(bodyDataCache))
      ?.filter((item) => !item?.GroupCodeDisplay?.startsWith(start))
      ?.map((item) => {
        if (
          item?.GroupCodeDisplay?.length === start?.length &&
          Number(item?.GroupCodeDisplay) > Number(start)
        ) {
          item.GroupCodeDisplay = String(Number(item?.GroupCodeDisplay) - 1);
        }
        return item;
      });

    // debugger

    const addIndex = remainItems?.findIndex(
      (item) => item?.GroupCodeDisplay === end,
    );
    const singleItem = remainItems[addIndex];

    const newPrefix = removeItems[0]?.GroupCodeDisplay;

    const updatedRemoveItems = removeItems?.map((item) => {
      // debugger
      return {
        ...item,
        GroupCodeDisplay:
          item?.GroupCodeDisplay?.length > newPrefix?.length
            ? String(singleItem?.NextGroupCodeDisplay) +
              item?.GroupCodeDisplay?.slice(newPrefix?.length)
            : String(singleItem?.NextGroupCodeDisplay),
        ParentID: singleItem?.GroupCode,
      };
    });
    remainItems?.splice(addIndex, 0, ...updatedRemoveItems);

    let payload = [];
    remainItems?.map((val) => {
      payload.push({
        groupCode: val?.GroupCode,
        groupCodeDisplay: val?.GroupCodeDisplay,
        parentID: Number(val?.ParentID),
      });
    });
    //     debugger
    // return
    const apiResp = await UpdateGroupCodeDisplay(payload);
    if (apiResp?.success) {
      notify(apiResp?.message);
      getBindGroupTable();
    } else {
      notify(apiResp?.message, "error");
    }

    // const newResp = remainItems?.map((val) => ({ ...val, GroupName: <span className={`${val?.ISEditable === 1 && "text-primary font-weight-bold"}`} >{val?.GroupName} {val?.ISEditable === 1 && <i className="fa fa-edit" aria-hidden="true" onClick={(e) => { handleEdit(e, val) }}></i>} </span> }))
    // let data = buildHierarchyTree(newResp, [])
    // setBodyData(data)
    // debugger
  };

  return (
    <>
      <div className="mt-2 spatient_registration_card">
        <div className="patient_registration card">
          <Heading
            isBreadcrumb={true}
            name={"Chart Of Group"}
            secondTitle={
              <span onClick={handleExportExcel}>
                <ExcelIconSVG />{" "}
              </span>
            }
          />
          {console.log("values?.MainGroup?.value",values?.MainGroup)}
          <div className="row p-2">
            <Input
              type="text"
              className="form-control required-fields"
              id="GroupName"
              name="GroupName"
              value={values?.GroupName ? values?.GroupName : ""}
              onChange={(e) => handleReactSelect("GroupName", e.target.value)}
              lable={t("Group Name")}
              placeholder=" "
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            />
            <ReactSelect
              placeholderName={t("Main Group")}
              id="MainGroup"
              name="MainGroup"
              requiredClassName={"required-fields"}
              value={values?.MainGroup?.value}
              onChange={(name, e) => handleReactSelect(name, e)}
              removeIsClearable={true}
              dynamicOptions={mainGroupList}
              searchable={true}
              respclass="col-xl-2 col-md-4 col-sm-4 col-12"
            />

            <div className="col-xl-1 col-md-2 col-sm-2 col-4">
              <button
                className="btn btn-sm btn-success px-4"
                type="button"
                onClick={handelSaveGroup}
              >
                {t("Save")}
              </button>
            </div>
            {/* <div className="col-xl-2 col-md-2 col-sm-2 col-4">
            <button className="btn btn-sm btn-success" type='button' onClick={centreWiseRecord}>{t("View Centre Wise Record")}</button>
          </div> */}
          </div>
          <TreeViewTable
            thead={thead}
            tbody={bodyData}
            isSNo={true}
            isTreeOpen={true}
            handleClick={handleClick}
            style={{ maxHeight: "63vh" }}
            onReorder={handleReorder}
          />
        </div>
      </div>

      {modalData?.visible && (
        <FinanceModal
          visible={modalData?.visible}
          setVisible={() => {
            setModalData((val) => ({ ...val, visible: false }));
          }}
          modalData={modalData?.modalData}
          modalWidth={modalData?.width}
          Header={modalData?.label}
          buttonType="button"
          buttonName={modalData?.buttonName}
          footer={modalData?.footer}
          handleAPI={modalData?.CallAPI}
        >
          {modalData?.Component}
        </FinanceModal>
      )}
    </>
  );
};

export default index;
