import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CancelButton } from "../../components/UI/CustomButton";

const TestDetailViewModal = ({ data, show, onHide }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const getMemberShipCard = (id) => {
    setLoading(true);
    axiosInstance
      .post("MembershipCardIssue/ViewCardDetail", {
        FamilyMemberGroupId: id,
      })
      .then((res) => {
        if (res.status === 200) {
          setTableData(res.data.message);
          toast.success(res?.data?.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response.data.message);
      });
  };
  useEffect(() => {
    getMemberShipCard(data?.FamilyMemberGroupID);
  }, []);

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        {...{ show, onHide }}
        header={`Test Details           Card No.: ${data?.cardno}`}
        visible={show}
        onHide={() => {
          onHide();
        }}
        draggable={false}
        className={theme}
        style={{ width: "80vw" }}
      >
        {loading ? (
          <Loading />
        ) : (
          <>
            <Tables
            style={{
              maxHeight: "400px",
              overflowY: "auto",
            }}
            >
              <colgroup>
                <col style={{ width: "40px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "400px" }} />
                <col style={{ width: "80px" }} />
                <col style={{ width: "80px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "120px" }} />
              </colgroup>
              <thead className="cf" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th>S.N.</th>
                  <th>Dependent</th>
                  <th>Test Code</th>
                  <th>Test Name</th>
                  <th>SelfDisc</th>
                  <th>DeptDisc</th>
                  <th>SelfFreeCount</th>
                  <th>DeptFreeCount</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((ele, index) => (
                  <tr key={index}>
                    <td data-title="S.N.">{index + 1}</td>
                    <td data-title="Dependent" style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ele?.deptname}</td>
                    <td data-title="Test Code" style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ele?.TestCode}</td>
                    <td data-title="Test Name" style={{ maxWidth: "300px", wordBreak: "break-word", whiteSpace: "normal" }}>{ele?.ItemName}</td>
                    <td data-title="SelfDisc">{ele?.SelfDisc}</td>
                    <td data-title="DeptDisc">{ele?.DependentDisc}</td>
                    <td data-title="SelfFreeCount">{ele?.SelfFreeTestCount}</td>
                    <td data-title="DeptFreeCount">{ele?.DependentFreeTestCount}</td>
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

export default TestDetailViewModal;
