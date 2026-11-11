import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import FunnelDetailsModal from "./FunnelModal/FunnelDetailsModal";
import Loading from "../../components/loader/Loading";

const FunnelList = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fromDate: new Date(),
    toDate: new Date(),
    taggedWith: "",
    businessProfession: "",
  });

  const [BusinessProfession, setBusinessProfession] = useState([]);
  const [TaggedWith, setTaggedWith] = useState([]);
  const [load, setLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelect = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
  };

  const getBusinessProfession = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("SalesFunnel/BusinessProfession");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.BusinessProfessionName,
          value: item?.BusinessProfessionId,
        })) || [];
      setBusinessProfession(resList || []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getCentreType1 = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("SalesFunnel/CentreType1");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.type,
          value: item?.Id,
        })) || [];
      setTaggedWith(resList || []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.post("SalesFunnel/Search", {
        fromDate: moment(formData.fromDate).format("YYYY-MM-DD"),
        toDate: moment(formData.toDate).format("YYYY-MM-DD"),
        taggedWith: formData.taggedWith || null,
        businessProfession: formData.businessProfession || null,
      });
      console.log(res);

      setTableData(res?.data?.success ? res.data.message : []);
      setLoad(false);
    } catch (err) {
      console.log(err);
      setTableData([]);
      setLoad(false);
    }
  };

  const handleViewRow = async (id) => {
    try {
      setLoad(true);
      const res = await axiosInstance.post("SalesFunnel/Detail", {
        funnelId: String(id),
      });
      const resList = res?.data?.message;
      setSelectedRow(resList);
      setShow(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getBusinessProfession();
    getCentreType1();
    handleSearch();
  }, []);

  return (
    <>
      {show && (
        <FunnelDetailsModal
          show={show}
          onHide={() => setShow(false)}
          data={selectedRow}
        />
      )}

      <Accordion
        name={`${t("Funnel Master")}  `}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo={"/funnel-createfunnel"}
        linkTitle={t("Create New")}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="fromDate"
              lable="FromDate"
              name="fromDate"
              value={formData?.fromDate}
              onChange={dateSelect}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              name="toDate"
              value={formData?.toDate}
              className="custom-calendar"
              placeholder=" "
              id="toDate"
              lable="ToDate"
              onChange={dateSelect}
              minDate={formData?.fromDate}
            />
          </div>
          <div className="col-sm-2 ">
            <ReactSelect
              dynamicOptions={BusinessProfession}
              name="businessProfession"
              lable={t("Business Profession")}
              id="businessProfession"
              placeholderName={t("Business Profession")}
              value={formData?.businessProfession}
              onChange={handleSelect}
            />
          </div>
          <div className="col-sm-2 ">
            <ReactSelect
              dynamicOptions={TaggedWith}
              name="taggedWith"
              lable={t("Tagged With")}
              id="taggedWith"
              placeholderName={t("Tagged With")}
              value={formData?.taggedWith}
              onChange={handleSelect}
            />
          </div>
          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-sm btn-info"
                onClick={handleSearch}
              >
                {t("Search")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion defaultValue={true} title={t("Funnel List")}>
        <Tables>
          <thead>
            <tr>
              <th style={{ width: "2%" }}>{t("Sr.No.")}</th>
              <th>{t("Employee Name")}</th>
              <th>{t("State")}</th>
              <th>{t("Centre")}</th>
              <th>{t("Contact")}</th>
              <th>{t("Mobile")}</th>
              <th>{t("Email")}</th>
              <th>{t("Meeting Days")}</th>
              <th>{t("Meeting Time")}</th>
              <th>{t("ProspectType")}</th>
              <th>{t("ExpectedBusinessForecast")}</th>
              <th>{t("No.OfEcpectedCalls")}</th>
              <th>{t("Details")}</th>
              <th style={{ width: "4%" }}>{t("Action")}</th>
            </tr>
          </thead>

          {tableData?.length > 0 ? (
            tableData.map((row, index) => (
              <tbody key={index}>
                <tr>
                  <td data-title={t("Sr.No.")}>{index + 1}</td>
                  <td data-title={t("Employee Name")}>{row?.EmployeeName}</td>
                  <td data-title={t("State")}>{row?.StateName}</td>
                  <td data-title={t("Centre")}>{row?.CentreName}</td>
                  <td data-title={t("Contact")}>{row?.ContactPersonName}</td>
                  <td data-title={t("Mobile")}>{row?.MobileNumber}</td>
                  <td data-title={t("Email")}>{row?.EmailId}</td>
                  <td data-title={t("Meeting Days")}>{row?.MeetingDays}</td>
                  <td data-title={t("Meeting Time")}>{row?.MeetingTime}</td>
                  <td data-title={t("ProspectType")}>
                    {row?.ProspectTypeName}
                  </td>
                  <td data-title={t("ExpectedBusinessForecast")}>
                    {row?.ExpectedBusinessForecast}
                  </td>
                  <td data-title={t("No.OfEcpectedCalls")}>
                    {row?.NoOfExpectedCalls}
                  </td>
                  <td data-title={t("Details")}>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleViewRow(row?.FunnelId)}
                    >
                      {t("View")}
                    </button>
                  </td>
                  <td data-title={t("Action")}>
                    <Link
                      state={{
                        data: row?.FunnelId,
                        other: { button: "Update", pageName: "Edit" },
                      }}
                      to={"/funnel-createfunnel"}
                    >
                      {t("Edit")}
                    </Link>
                  </td>
                </tr>
              </tbody>
            ))
          ) : (
            <tbody>
              <tr>
                <td colSpan={16} className="text-center">
                  <NoRecordFound />
                </td>
              </tr>
            </tbody>
          )}
        </Tables>
      </Accordion>
    </>
  );
};

export default FunnelList;
