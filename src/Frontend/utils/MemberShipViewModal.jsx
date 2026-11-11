import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CancelButton } from "../../components/UI/CustomButton";

const MemberShipViewModal = ({ data, show, onHide }) => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getViewTest = (id, key) => {
    setLoading(true);
    axiosInstance
      .post("MembershipCardMaster/GetAllCardDetail", {
        FamilyMemberIsPrimary: id === "Yes" ? 1 : 0,
        PatientId: String(key),
      })
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.message)) {
          setTableData(res.data.message);
          toast.success(res?.data?.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error();
      });
  };
  useEffect(() => {
    getViewTest(data?.FamilyMemberIsPrimary, data?.patient_id);
  }, []);

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        {...{ show, onHide }}
        header={t("Test Detail")}
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
              <thead>
                <tr>
                  <th style={{ width: "40px", minWidth: "40px" }}>S.N.</th>
                  <th style={{ width: "180px", minWidth: "150px", whiteSpace: "normal", wordBreak: "break-word" }}>Department</th>
                  <th style={{ width: "100px", minWidth: "80px" }}>Test Code</th>
                  <th style={{ width: "350px", minWidth: "350px", whiteSpace: "normal", wordBreak: "break-word" }}>Test Name</th>
                  <th style={{ width: "90px", minWidth: "90px" }}>
                    {data?.FamilyMemberIsPrimary === "Yes" ? "SelfDisc" : "DeptDisc"}
                  </th>
                  <th style={{ width: "120px", minWidth: "120px", whiteSpace: "normal", wordBreak: "break-word" }}>
                    {data?.FamilyMemberIsPrimary === "Yes" ? "SelfFreeTestCount" : "DeptFreeTestCount"}
                  </th>
                  <th style={{ width: "130px", minWidth: "130px", whiteSpace: "normal", wordBreak: "break-word" }}>
                    {data?.FamilyMemberIsPrimary === "Yes" ? "SelfFreeTestConsume" : "DeptFreeTestConsume"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((ele, index) => (
                  <tr key={index}>
                    <td data-title="S.N.">{index + 1}</td>
                    <td data-title="Department" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{ele?.deptname}</td>
                    <td data-title="Test Code">{ele?.TestCode}</td>
                    <td data-title="Test Name" style={{ width: "350px", minWidth: "350px", maxWidth: "350px", whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word" }}>{ele?.ItemName}</td>
                    <td data-title="SelfDisc">
                      {data?.FamilyMemberIsPrimary === "Yes" ? ele?.SelfDisc : ele?.DependentDisc}
                    </td>
                    <td data-title="SelfFreeTestCount">
                      {data?.FamilyMemberIsPrimary === "Yes" ? ele?.SelfFreeTestCount : ele?.DependentFreeTestCount}
                    </td>
                    <td data-title="DeptFreeTestCount">
                      {data?.FamilyMemberIsPrimary === "Yes" ? ele?.SelfFreeTestConsume : ele?.DependentFreeTestConsume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
            <div className="row mt-2">
              <div className="col-sm-12 d-flex justify-content-end">
                <CancelButton
                  text={"Close"}
                  onClick={onHide}
                />
              </div>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default MemberShipViewModal;
