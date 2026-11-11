// TicketMenuList.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TicketMenuList = () => {
  const navigate = useNavigate();
    const location  = useLocation()
  // Hardcoded menu data
  const seeMoreData = [
    { name: "Dashboard", url: "/dashboard#ticketing" },
    { name: "Category Master", url: "/ticketing/category-master" },
    // { name: "Tag Employee", url: "/ticketing/category-tagEmployee" },
    { name: "Manage Query", url: "/ticketing/manage-query" },
    { name: "Manage Response", url: "/ticketing/manage-response" },
    { name: "New Ticket", url: "/ticketing/new-ticket" },
    { name: "View Ticket", url: "/ticketing/view-ticket" },
  ];

  console.log('location.pathname',location.pathname);

    const filteredData = seeMoreData.filter(
    // (item) => (item.url !== location.pathname)
    (item) => (!item.url?.includes(location.pathname))
  );
  // Split into columns of 10
  const getChunkedOptions = (options) => {
    const columns = [];
    for (let i = 0; i < options.length; i += 10) {
      columns.push(options.slice(i, i + 10));
    }
    return columns;
  };

  const columns = getChunkedOptions(filteredData);

  return (
    <div
      className="p-2 mt-2"
      style={{
        border: "1px solid grey",
        borderRadius: 5,
        background: "white",
        maxWidth: 600,
        position: "absolute",
        top: "10px",
        right: "20px",
        zIndex: "99999999",
      }}
    >
      <div className="d-flex flex-wrap">
        {columns.map((column, colIdx) => (
          <div className="mx-2" key={colIdx}>
            {column.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.url)}
                style={{
                  cursor: "pointer",
                  padding: "2px 4px",
                  margin: "2px 0",
                  display: "flex",
                  alignItems: "center",
                  zIndex: "99999999",
                }}
              >
                <i className="fas fa-tachometer-alt nav-icon mr-2" />
                {item.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketMenuList;
