import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import FilterInput from "../../components/Filter/FilterInput";
import Pagination from "../../Pagination/Pagination";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { Record } from "../../utils/Constants";

const CardDetailViewModal = ({ data, show, onHide }) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentData, setCurrentData] = useState([]);

  const [search, setSearch] = useState("");
  const theme = useLocalStorage("theme", "get");

  const [PageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const getMemberShipCard = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("MembershipCardIssue/GetCardDetail", {
        MemberShipId: id,
      });
      if (res.status === 200) {
        setTableData(res.data.message);
        setFilteredData(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (data) {
      getMemberShipCard(data);
    }
  }, [data]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setCurrentPage(1); // reset to page 1 on new search

    const filtered = tableData.filter(
      (ele) =>
        ele?.ItemName?.toLowerCase().includes(value) ||
        ele?.TestCode?.toLowerCase().includes(value) ||
        ele?.deptname?.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    const firstIndex = (currentPage - 1) * PageSize;
    const lastIndex = firstIndex + PageSize;

    if (PageSize === tableData.length) {
      // "All" case
      setCurrentData(filteredData);
    } else {
      setCurrentData(filteredData.slice(firstIndex, lastIndex));
    }
  }, [filteredData, currentPage, PageSize, tableData.length]);

  return (
    <>
      <Dialog
        {...{ show, onHide }}
        header={
          <div className="d-flex align-items-center justify-content-between w-full">
            <div className="m-0">Card Test Details</div>
            <FilterInput
              placeholder="Search test..."
              value={search}
              onChange={handleSearch}
              width="200px"
              className="ml-auto"
            />
          </div>
        }
        visible={show}
        onHide={onHide}
        draggable={false}
        className={theme}
        style={{ width: "1000px" }}
      >
        <div className="">
          {loading ? (
            <Loading />
          ) : (
            <Tables>
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>Dependent</th>
                  <th>Test Code</th>
                  <th>Test Name</th>
                  <th>SelfDisc</th>
                  <th>DeptDisc</th>
                  <th>SelfFreeTestCount</th>
                  <th>DeptFreeTestCount</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((ele, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * PageSize + index + 1}</td>
                      <td>{ele?.deptname}</td>
                      <td>{ele?.TestCode}</td>
                      <td>{ele?.ItemName}</td>
                      <td>{ele?.SelfDisc}</td>
                      <td>{ele?.DependentDisc}</td>
                      <td>{ele?.SelfFreeTestCount}</td>
                      <td>{ele?.DependentFreeTestCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>
          )}
        </div>

        {/*  Pagination + Page Size Selector */}
        {filteredData.length > 0 && (
          <div className="d-flex justify-content-end">
            <label className="mt-4 mx-2">No Of Record/Page</label>
            <SelectBox
              className="mt-3 p-1 RecordSize mr-2"
              options={[{ label: "All", value: tableData?.length }, ...Record]}
              selectedValue={PageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            />
            <Pagination
              className="pagination-bar mb-2"
              currentPage={currentPage}
              totalCount={filteredData?.length} 
              pageSize={PageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </Dialog>
    </>
  );
};

export default CardDetailViewModal;
