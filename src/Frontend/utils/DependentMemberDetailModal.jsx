import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import MemberShipViewModal from "./MemberShipViewModal";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { CancelButton } from "../../components/UI/CustomButton";

const DependentMemberDetailModal = ({ data, show, onHide }) => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [MemberShipViewData, setMemberShipViewData] = useState(false);
  const [ViewData, setViewData] = useState(false);
  console.log(data);
  const getMemberShipCard = (id) => {
    setLoading(true);
    axiosInstance
      .post("MembershipCardMaster/BindMembershipMember", {
        FamilyMemberGroupId: id,
      })
      .then((res) => {
        if (res.data.success && Array.isArray) {
          setTableData(res.data.message);
          toast.success(res?.data?.message);
          setLoading(false);
        } else {
          setTableData([]);
          toast.error(res?.data?.message || "Failed to fetch data");
          setLoading(false);
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        setLoading(false);
      });
  };
  useEffect(() => {
    getMemberShipCard(data?.FamilyMemberGroupID);
  }, []);

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      {MemberShipViewData && (
        <MemberShipViewModal
          show={MemberShipViewData}
          data={ViewData}
          onHide={() => {
            setMemberShipViewData(false);
          }}
        />
      )}
      <Dialog
        {...{ show, onHide }}
        header={t("Dependent Members Detail Modal")}
        visible={show}
        onHide={() => {
          onHide();
        }}
        draggable={false}
        className={theme}
        style={{ width: "1000px" }}
      >
        {loading ? (
          <Loading />
        ) : (
          <>
            <Tables>
              <thead className="cf">
                <tr>
                  <th>S.N.</th>
                  <th>Member Name</th>
                  <th>UHID</th>
                  <th>Mobile No.</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Relation</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((ele, index) => (
                  <tr key={index}>
                    <td data-title="S.N.">{index + 1}</td>
                    <td data-title="Member Name">{ele?.PName}</td>
                    <td data-title="UHID">{ele?.PatientCode}</td>
                    <td data-title="Mobile No.">{ele?.Mobile}</td>
                    <td data-title="Age">{ele?.Age}</td>
                    <td data-title="Gender">{ele?.Gender}</td>
                    <td data-title="Relation">{ele?.Relation}</td>
                    <td
                      data-title="View"
                      style={{ textAlign: "center", cursor: "pointer" }}
                      onClick={() => {
                        setMemberShipViewData(true);
                        setViewData(ele);
                      }}
                    >
                      <i className="fa fa-search" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
            <div className="row mt-2">
              <div className="col-sm-12 d-flex justify-content-end">
                <CancelButton
                  onClick={onHide}
                  text={t("Close")}
                />
              </div>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default DependentMemberDetailModal;
