import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CashFlowFrameMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const seeMoreData = [
    { name: "Cash Transfer Master", url: "/CashTransferMaster" },
    { name: "Cash Transfer", url: "/CashTransfer" },
    { name: "Cash Receive", url: "/CashReceive" },
    { name: "Cash Balance Report Date Wise", url: "/CashBalanceReportDateWise" },
    { name: "Cashflow Dashboard", url: "/Dashboard#cashflowdashboard" },
  ];

  const filteredData = seeMoreData.filter(
    (item) => item.url !== location.pathname
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

export default CashFlowFrameMenu;
