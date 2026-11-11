import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import CampTestDetailModal from "../utils/CampTestDetailModal";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { Check, X } from "lucide-react";
import CampRejectModal from "../utils/CampRejectModal";

const CampCreationSearch = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false)
  // const [selectedData, setSelectedId] = useState(null);

  const [loading, setLoading] = useState({
    search: false,
    approve: false,
    reject: false
  });

  const [payload, setPayload] = useState({
    FromDate: new Date(),
    FromTime: "00:00",
    ToDate: new Date(),
    ToTime: "23:59",
    Status: "0",
    Type: "0",
  });

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };

  const StatusType = [
    {
      label: "All",
      value: "0",
    },
    {
      label: "Pending",
      value: "1",
    },
    {
      label: "Rejected",
      value: "2",
    },
  ];


  const handleChange = (event) => {
    const { name, value } = event?.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSearch = (data) => {
    setLoading({ ...loading, search: true });
    const updatedFormData = {
      fromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
      toDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
      searchType: data,
      status: Number(payload?.Status),
      TypeID: payload?.Type,
    };
    axiosInstance
      .post("Camp/getCampCreation", updatedFormData)
      .then((res) => {
        const datas = res?.data?.message;

        if (Array.isArray(datas) && datas.length > 0) {
          setTableData(datas || []);
          setLoading({ ...loading, search: false });
        } else {
          setLoading({ ...loading, search: false });
          toast.error("No Camp Request Found.");
          setTableData([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading({ ...loading, search: false });
      });
  };

  const prepareCampRequest = (ele) => {
    return {
      campName: ele?.CampName,
      campID: ele?.CampID,
      campCoordinator: ele?.Contact_Person,
      campAddress: ele?.Address,
      contactNo: ele?.Mobile,
      Email: ele?.Email || "",
      panel_ID: ele?.panel_id,
      centreID: ele?.panel_id,
      centreName: ele?.Company_Name,
      startDate: moment(ele?.StartDate).format("YYYY-MMM-DD"),
      endDate: moment(ele?.EndDate).format("YYYY-MMM-DD"),
      id: ele?.ID,
      campType: ele?.CampType,
      campTypeID: ele?.CampTypeID,
    };
  };

  const handleApprove = async (ele) => {
    setLoading({ ...loading, approve: true });

    try {
      const itemRes = await axiosInstance.post("Camp/GetCampItemDetails", {
        ID: ele.ID,
      });
      const items = itemRes?.data?.message || [];
      if (items.length === 0) {
        toast.error("No tests found for this camp to approve.");
        setLoading({ ...loading, approve: false });
        return;
      }
      const payloadtest = items.map((item) => {
        return {
          itemId: item?.ItemID,
          itemCode: item?.TestCode,
          itemName: item?.TestName,
          rate: String(item?.Rate),
          requestedRate: Number(item?.RequestedRate || 0),
        };
      });

      const finalPayload = {
        campRequest: prepareCampRequest(ele),
        campItemDetail: payloadtest,
      };

      const approveRes = await axiosInstance.post(
        "Camp/ApproveCampRequest",
        finalPayload
      );
      if (approveRes.status === 200) {
        toast.success(approveRes.data.message || "Camp Approved Successfully");
        handleSearch(0)
      } else {
        toast.error(approveRes.data.message);
      }
    } catch (error) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error during approval");
    } finally {
      setLoading(false);
    }
  }

  const handleCampCreate = (ele) => {
    navigate("/camprequest", {
      state: ele,
    });
  };

  const getColor = (ele) => {
    // 1. Rejected Status (IsActive is 0)
    if (ele?.IsActive === 0) {
      return "#FFFFFF";
    }

    // 2. Approved Status (IsApproved is 1)
    if (ele?.IsApproved === 1) {
      return "#ffe4e1";
    }

    // 3. Pending Status (Active but not yet approved)
    if (ele?.IsActive === 1 && ele?.IsApproved === 0) {
      return "#e6f2ff";
    }

    return "white";
  };

  return (
    <>
      {show && (
        <CampTestDetailModal
          selectedData={selectedData}
          show={show}
          onHide={() => {
            setShow(false);
          }}
        />
      )}
      {showRejectModal && (
        <CampRejectModal
          show={showRejectModal}
          onHide={() => setShowRejectModal(false)}
          selectedData={selectedData}
        />
      )}
      <Accordion
        name={t("Camp Creation Search")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2 ">
            <DatePicker
              name="FromDate"
              id="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              placeholder=""
              lable={t("From Date")}
            />
          </div>
          <div className="col-sm-2 ">
            <DatePicker
              name="ToDate"
              id="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              // maxDate={new Date()}
              minDate={new Date(payload?.FromDate)}
              placeholder=""
              lable={t("To Date")}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={[...StatusType]}
              name="Status"
              id="Status"
              selectedValue={payload?.Status}
              onChange={handleChange}
              placeholder=""
              lable={t("Status")}
            />
          </div>
          <div className="col-sm-3">
            <div style={{ display: "flex" }}>
              <div
                style={{
                  height: "20px",
                  width: "20px",
                  backgroundColor: "#b0c4de",
                  border: "1px solid black",
                  marginLeft: "20px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleSearch(1);
                }}
              ></div>
              <label style={{ marginRight: "25px", marginLeft: "5px" }}>
                {t("Pending")}
              </label>

              <div
                style={{
                  height: "20px",
                  width: "20px",
                  backgroundColor: "#FFC0CB",
                  border: "1px solid black",
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleSearch(2);
                }}
              ></div>

              <label style={{ marginLeft: "5px", marginRight: "25px" }}>
                {t("Created")}
              </label>

              <div
                style={{
                  height: "20px",
                  width: "20px",
                  backgroundColor: "white",
                  border: "1px solid black",
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleSearch(3);
                }}
              ></div>
              <label style={{ marginLeft: "5px" }}>{t("Rejected")}</label>
            </div>
          </div>
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => handleSearch(0)}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {loading.search ? (
          <Loading />
        ) : (
          <>
            {tableData?.length > 0 ? (
              <>
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("S.No.")}</th>
                      <th>{t("Camp Centre")}</th>
                      <th>{t("Camp Name")}</th>
                      <th>{t("Camp Type")}</th>
                      <th>{t("Camp Start Date")}</th>
                      <th>{t("Created By")}</th>
                      <th>{t("Created Date")}</th>
                      <th>{t("Approved Date")}</th>
                      <th>{t("Create")}</th>
                      <th>{t("View Test")}</th>
                      <th>{t("Approve/Reject")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((ele, index) => (
                      <tr
                        key={index}
                        style={{ backgroundColor: getColor(ele) }}
                      >
                        <td data-title={t("S.No.")}>{index + 1}</td>
                        <td data-title={t("Camp Centre")}>
                          {ele?.Company_Name}
                        </td>
                        <td data-title={t("Camp Name")}>{ele?.CampName}</td>
                        <td data-title={t("Camp Type")}>{ele?.CampType}</td>
                        <td data-title={t("Camp Start Date")}>
                          {ele?.StartDate}
                        </td>
                        <td data-title={t("Created By")}>{ele?.CreatedBy}</td>
                        <td data-title={t("Created Date")}>
                          {ele?.CreatedDate}
                        </td>
                        <td data-title={t("Approved Date")}>
                          {ele?.ApprovedDate}
                        </td>
                        <td
                          data-title={t("Create")}
                          style={{ textAlign: "center" }}
                        >
                          {ele.IsCreated == 0 && ele.IsActive == 1 ? (
                            <SaveButton
                              text={"Create"}
                              onClick={() => {
                                handleCampCreate(ele);
                              }}
                            />
                          ) : (
                            ""
                          )}
                        </td>
                        <td
                          data-title={t("View Test")}
                          style={{ textAlign: "center", fontWeight: "bold" }}
                        >
                          {
                            <i
                              className="fa fa-search"
                              onClick={() => {
                                setSelectedData(ele);
                                setShow("show");
                              }}
                            />
                          }
                        </td>
                        <td
                          data-title={t("Approve/Reject")}
                          style={{ textAlign: "center", fontWeight: "bold", gap: "5px" }}
                          className="d-flex"
                        >
                          {ele?.IsActive === 0 ? (
                            <span style={{
                              color: "black",
                              padding: "4px 0px",
                              borderRadius: "5px",
                              fontSize: "12px",
                            }}>
                              Rejected
                            </span>
                          ) : ele?.IsApproved === 1 ? (
                            <span style={{
                              color: "#FF007F",
                              padding: "4px 0px",
                              borderRadius: "5px",
                              fontSize: "12px",
                            }}>
                              Approved
                            </span>
                          ) : (
                            <>
                              <span
                                onClick={() => handleApprove(ele)}
                                className="px-2 py-1"
                                style={{ backgroundColor: "green", borderRadius: "5px", color: "white", cursor: "pointer" }}
                              >
                                <Check size={20} />
                              </span>
                              <span
                                onClick={() => {
                                  setSelectedData(ele);
                                  setShowRejectModal(true);
                                }}
                                className="px-2 py-1"
                                style={{ backgroundColor: "red", borderRadius: "5px", color: "white", cursor: "pointer" }}
                              >
                                <X size={20} />
                              </span>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </>
            ) : (
              <>
                <NoRecordFound />
              </>
            )}
          </>
        )}
      </Accordion>
    </>
  );
};

export default CampCreationSearch;
