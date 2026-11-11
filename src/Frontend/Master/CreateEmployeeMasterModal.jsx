import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { toast } from "react-toastify";
import {  SaveButton, CancelButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";

const AccessHeadModal = ({
  show,
  onClose,
  onSave,
  selectedRights: initialSelectedRights = [],
}) => {
  const [groupedData, setGroupedData] = useState({});
  const [selectedRights, setSelectedRights] = useState([]);

  const [activeHead, setActiveHead] = useState(null); 
  const [searchActiveHeads, setSearchActiveHeads] = useState([]);

  const [load, setLoad] = useState(false);
  const [searchText, setSearchText] = useState("");

  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const fetchAccessRights = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("Employee/GetAccessRightMaster");
      const data = res.data.message || [];

      const grouped = data.reduce((acc, curr) => {
        acc[curr.AccessHead] = acc[curr.AccessHead] || [];
        acc[curr.AccessHead].push(curr);
        return acc;
      }, {});

      setGroupedData(grouped);
    } catch (err) {
      toast.error("Failed to load Access Rights");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchAccessRights();

      setSelectedRights(
        Array.isArray(initialSelectedRights)
          ? initialSelectedRights
          : typeof initialSelectedRights === "string"
          ? initialSelectedRights.split(",").map(Number)
          : []
      );

      setActiveHead(null);
      setSearchActiveHeads([]);
      setSearchText("");
    }
  }, [show, initialSelectedRights]);

  const filteredGroupedData = Object.keys(groupedData).reduce((acc, head) => {
    const headMatch = head.toLowerCase().includes(searchText.toLowerCase());

    const filteredRights = groupedData[head].filter((r) =>
      r.accessby.toLowerCase().includes(searchText.toLowerCase())
    );

    if (headMatch || filteredRights.length > 0) {
      acc[head] = headMatch ? groupedData[head] : filteredRights;
    }

    return acc;
  }, {});

 
  useEffect(() => {
    // if (!searchText) {
    //   setSearchActiveHeads([]);
    //   return;
    // }

    setSearchActiveHeads(Object.keys(filteredGroupedData));
  }, []);

  const getHeadCount = (head) => {
    const rights = groupedData[head] || [];
    const total = rights.length;
    const selected = rights.filter((r) =>
      selectedRights.includes(r.AccessbyId)
    ).length;

    return { selected, total };
  };

  const handleAccessHeadToggle = (head) => {
    const headRights = groupedData[head].map((r) => r.AccessbyId);

    setSelectedRights((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const allSelected = headRights.every((id) => safePrev.includes(id));

      return allSelected
        ? safePrev.filter((id) => !headRights.includes(id))
        : [...new Set([...safePrev, ...headRights])];
    });
  };

  const handleRightToggle = (id) => {
    setSelectedRights((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.includes(id)
        ? safePrev.filter((r) => r !== id)
        : [...safePrev, id];
    });
  };

  const handleSubmit = () => {
    if (selectedRights.length === 0) {
      toast.error("Please select at least one Access Right");
      return;
    }
    onSave(selectedRights);
    onClose();
  };

  const handleSearchTextChange=(e)=>{
    const {name, value} = e.target;
    setSearchText(value)
    if(value){
      setSearchActiveHeads(Object.keys(filteredGroupedData));
    }else{
      // setSearchActiveHeads([]);
    }
  }

  return (
    <Dialog
      visible={show}
      onHide={onClose}
      className={theme}
      style={{
        width: isMobile ? "80vw" : "35vw",
        height: "100vw",
      }}
      header={
        <div className="d-flex justify-content-between align-items-center w-100">
          <span>Access Head</span>
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "200px" }}
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchTextChange}
          />
        </div>
      }
    >
      {load ? (
        <Loading />
      ) : (
        <div className="row mb-2">
          {Object.keys(filteredGroupedData).map((head) => {
            const headRights = filteredGroupedData[head];
            const { selected, total } = getHeadCount(head);
            const allChecked = total > 0 && selected === total;

            const isHeadOpen =
              activeHead === head || searchActiveHeads.includes(head);

            return (
              <div key={head} className="col-12 mb-2">
                <button
                  type="button"
                  className="btn btn-primary w-100 d-flex justify-content-between align-items-center"
                  onClick={() =>
                    setActiveHead(activeHead === head ? null : head)
                  }
                >
                  <span>
                    {head}
                    <small className="ms-2 ml-1 text-light">
                      ({selected}/{total})
                    </small>
                  </span>
                </button>

                {isHeadOpen && (
                  <div className="mt-2">
                    <Tables className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "90%" }}>Access Right</th>
                          <th style={{ width: "10%", textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() =>
                                handleAccessHeadToggle(head)
                              }
                            />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {headRights.map((r) => (
                          <tr key={r.AccessbyId}>
                            <td>{r.accessby}</td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={selectedRights.includes(
                                  r.AccessbyId
                                )}
                                onChange={() =>
                                  handleRightToggle(r.AccessbyId)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Tables>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="box-footer mt-3">
        <div className="row">
          <div className="col-sm-2">
            <SaveButton text="Save" onClick={handleSubmit} />
          </div>
          <div className="col-sm-1">
            <CancelButton
              text="Close"
              className="btn-danger"
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AccessHeadModal;
