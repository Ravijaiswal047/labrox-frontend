import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
const CampTestDetailModal = ({ selectedData, show, onHide }) => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  const GetCampTestDetailData = (ID) => {
    setLoading(true);
    axiosInstance
      .post("Camp/GetCampTestDetail", { ID: ID })
      .then((res) => {
        setTableData(res?.data?.message);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    GetCampTestDetailData(selectedData?.ID);
  }, []);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      <Dialog
        header={"Camp Test Detail"}
        visible={show}
        onHide={onHide}
        className={theme}
        // style={{
        //   width: isMobile ? "80vw" : "50vw",
        // }}
      >
        <div className="row">
          {loading ? (
            <Loading />
          ) : (
            <>
              <Tables>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Item</th>
                    <th>Request Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((ele, index) => (
                    <tr key={index}>
                      <td data-title="Code">{ele?.testCode}</td>
                      <td data-title="Item">{ele?.TestName}</td>
                      <td data-title="RequestDate">{ele?.requestedrate}</td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default CampTestDetailModal;
