import React, { useEffect, useState } from "react";
import {
  FaTh,
  FaList,
  FaTable,
} from "react-icons/fa";
import { LuFolderTree } from "react-icons/lu";
import { GrDocumentPdf } from "react-icons/gr";
import { RiFileExcel2Fill } from "react-icons/ri";
import Tables from "../../components/UI/customTable";
import "./salesTree.css"
import Tree from "react-d3-tree";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import { FaPhone } from "react-icons/fa6";
import Heading from "../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import {CustomButton} from "../../components/UI/CustomButton";

const CustomNode = ({ nodeDatum, toggleNode }) => {
  const width = 220;
  const height = 100;

  return (
    <g>
      <foreignObject
        width={width}
        height={height}
        x={-width / 2}
        y={-height / 2}
      >
        <div
          onClick={toggleNode}
          style={{
            width: "100%",
            height: "100%",
            background: "white",
            border: `1px solid ${nodeDatum.Priority === 1 ? "#6366f1" : "#e2e8f0"}`,
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif"
          }}
        >
          <div
            style={{
              height: "5px",
              width: "100%",
              background: nodeDatum.Priority === 1 ? "#6366f1" : "#06b6d4"
            }}
          />

          <div style={{ padding: "10px", textAlign: "center", position: "relative" }}>
            <h6
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "700",
                color: "#1e293b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {nodeDatum.name}
            </h6>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "11px",
                fontWeight: "500",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {nodeDatum.attributes?.designation || "No Designation"}
            </p>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: "11px",
                color: "#595d63ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px"
              }}
            >
              <span><FaPhone /></span>
              {nodeDatum.attributes?.mobile || "N/A"}
            </p>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

const HorizontalD3Tree = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{ width: "100%", height: "600px", background: "#f8fafc", borderRadius: "12px" }}>
      <Tree
        data={data}
        orientation="horizontal"
        renderCustomNodeElement={(rd3tProps) => <CustomNode {...rd3tProps} />}
        pathFunc="diagonal"
        translate={{ x: 200, y: 300 }}
        nodeSize={{ x: 250, y: 120 }}
        separation={{ siblings: 1.2, nonSiblings: 2 }}
      />
    </div>
  );
};

const VerticalD3Tree = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{ width: "100%", height: "800px", background: "#f8fafc", borderRadius: "12px" }}>
      <Tree
        data={data}
        orientation="vertical"
        renderCustomNodeElement={(rd3tProps) => <CustomNode {...rd3tProps} />}
        pathFunc="step"
        translate={{ x: 600, y: 100 }}
        nodeSize={{ x: 220, y: 150 }}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
      />
    </div>
  );
};


const TableView = ({ data }) => (
  <div className="table-responsive bg-white rounded shadow-sm p-3">
    <Tables>
      <thead className="table-light">
        <tr>
          <th>S No.</th>
          <th>Employee ID</th>
          <th>Employee Name</th>
          <th>Employee Code</th>
          <th>Designation</th>
          <th>Mobile</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data?.map((emp, index) => (
            <tr key={emp?.EmployeeID || index}>
              <td data-title="S No.">{index + 1}</td>
              <td data-title="Employee ID">{emp?.EmployeeID || "-"}</td>
              <td data-title="Employee Name">{emp?.EmployeeName || "-"}</td>
              <td data-title="Employee Code">{emp?.EmployeeCode || "-"}</td>
              <td data-title="Designation">{emp?.SalesDesignationName || "-"}</td>
              <td data-title="Mobile">{emp?.Mobile || "-"}</td>
              <td>{emp?.Email || "-"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center py-4">No data available</td>
          </tr>
        )}
      </tbody>
    </Tables>
  </div>
);

const INDENT = 24; 
const ROW_HEIGHT = 27; 
const LINE_COLOR = "#000";
const LINE_WIDTH = 2;

const TreeNode = ({ node, isLast, parentLines = [] }) => {
  const [open, setOpen] = React.useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const depth = parentLines.length;

  return (
    <div style={{ position: "relative", minWidth: "max-content" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: ROW_HEIGHT,
          position: "relative",
        }}
      >
        {/* 1. Vertical Pass-through Lines from Parents */}
        {parentLines.map((showLine, i) => (
          showLine && (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * INDENT + 9, // Centered with the +/- box
                top: 0,
                bottom: 0,
                width: LINE_WIDTH,
                background: LINE_COLOR,
              }}
            />
          )
        ))}

        {/* 2. The Elbow (L-Shape) */}
        {depth > 0 && (
          <>
            {/* Vertical part: stops at the middle of the current row */}
            <div
              style={{
                position: "absolute",
                left: (depth - 1) * INDENT + 9,
                top: 0,
                height: "50%", 
                width: LINE_WIDTH,
                background: LINE_COLOR,
              }}
            />
            {/* Horizontal part: connects vertical line to the node */}
            <div
              style={{
                position: "absolute",
                left: (depth - 1) * INDENT + 10,
                top: "50%",
                width: 14, 
                height: LINE_WIDTH,
                background: LINE_COLOR,
                transform: "translateY(-50%)",
              }}
            />
          </>
        )}

        {/* 3. Node Content */}
        <div
          style={{
            marginLeft: depth * INDENT,
            display: "flex",
            alignItems: "center",
            cursor: hasChildren ? "pointer" : "default",
            zIndex: 2,
            height: "100%"
          }}
          onClick={() => hasChildren && setOpen(!open)}
        >
          {/* The +/- Box */}
          {hasChildren ? (
            <div
              style={{
                width: 18,
                height: 18,
                border: `1px solid ${LINE_COLOR}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                background: "#fff",
                marginRight: "6px",
                flexShrink: 0,
                lineHeight: 0,
                paddingBottom: "2px"
              }}
            >
              {open ? "−" : "+"}
            </div>
          ) : (
            /* Horizontal line extension for leaf nodes */
            <div style={{
              width: 20, 
              height: LINE_WIDTH, 
              background: LINE_COLOR, 
              marginRight: "6px",
              marginTop: "0px"
            }} />
          )}

          {/* Label: No clipping here because we use flex and max-content */}
          <span style={{ fontSize: "13px", color: "#000", whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: "bold" }}>{node.name}</span>
            {node.attributes?.designation && (
              <span style={{ color: "#333" }}> ({node.attributes.designation})</span>
            )}
          </span>
        </div>
      </div>

      {/* 4. Children Rendering */}
      {hasChildren && open && (
        <div style={{ position: "relative" }}>
          {node.children.map((child, i) => (
            <TreeNode
              key={child.EmployeeID || i}
              node={child}
              isLast={i === node.children.length - 1}
              parentLines={[...parentLines, i !== node.children.length - 1]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SimpleSalesTree = ({ data }) => {
  if (!data) return null;

  return (
    <div
      style={{
        padding: "20px",
        background: "#eaf4ff", // Matching your image background
        minHeight: "500px",
        overflowX: "auto",
        fontFamily: 'Tahoma, sans-serif',
      }}
    >
      <TreeNode node={data} isLast={true} parentLines={[]} />
    </div>
  );
};

// ---------- Main Component ----------
const SalesTreeBootstrap = () => {
  const [currentView, setCurrentView] = useState("horizontalNew");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [t] = useTranslation();

  const fetchDesignationWithEmployee = async (isActive = 1) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get(
        `SalesHierarchy/GetDesignationwithEmployee?IsActive=${isActive}`
      );

      if (res?.status === 200 && res?.data?.success) {
        const fetchedData = res.data.message || [];
        const validData = Array.isArray(fetchedData) ? fetchedData : [];
        setData(validData);
        console.log("Designation with Employee Data:", validData);
      } else {
        console.error("Unexpected response:", res);
        setError("Unexpected response from server");
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching designation with employee data:", error);
      setError(error.message || "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignationWithEmployee();
  }, []);

  const getD3FormattedData = (flatData) => {
    if (!flatData || flatData.length === 0) {
      return {
        name: "No Data",
        attributes: {
          designation: "No employees found",
          mobile: "",
        },
        children: [],
      };
    }

    const nodeMap = {};
    const roots = [];

    // Step 1: Create all nodes and store them in a map
    flatData.forEach((emp) => {
      nodeMap[emp.EmployeeID] = {
        ...emp, // Keep all properties
        name: emp.EmployeeName || "Unknown",
        Priority: emp.Priority,
        attributes: {
          designation: emp.SalesDesignationName || "",
          mobile: emp.Mobile || "",
          employeeCode: emp.EmployeeCode || "",
          email: emp.Email || "",
        },
        children: [],
      };
    });

    // Step 2: Build hierarchy and identify roots
    flatData.forEach((emp) => {
      const node = nodeMap[emp.EmployeeID];
      const parentID = emp.ReportingEmployeeID;

      // A node is a root if:
      // - ReportingEmployeeID is 0
      // - OR ReportingEmployeeID points to itself (prevents circularity)
      // - OR ReportingEmployeeID parent does not exist in our data set
      if (
        parentID === 0 ||
        parentID === emp.EmployeeID ||
        !nodeMap[parentID]
      ) {
        roots.push(node);
      } else {
        // Only add as child if it's not already there to be safe
        if (!nodeMap[parentID].children.includes(node)) {
          nodeMap[parentID].children.push(node);
        }
      }
    });

    // Step 3: Handle the result
    if (roots.length === 1) {
      return roots[0];
    } else if (roots.length > 1) {
      // If multiple roots exist (disconnected Trees), wrap them in a virtual root
      return {
        name: "Sales Hierarchy",
        Priority: 0,
        attributes: {
          designation: "Organization Root",
        },
        children: roots,
      };
    } else if (flatData.length > 0) {
      // Fallback: if somehow no roots were identified but data exists
      return nodeMap[flatData[0].EmployeeID];
    }

    return null;
  };

  const sortedData = data.length > 0 ? [...data].sort((a, b) => a.Priority - b.Priority) : [];
  const formattedHierarchy = getD3FormattedData(data);

  const renderView = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <Loading />
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger text-center" role="alert">
          <h5>Error Loading Data</h5>
          <p>{error}</p>
          <button
            className="btn btn-primary mt-2"
            onClick={() => fetchDesignationWithEmployee()}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="alert alert-info text-center" role="alert">
          <h5>No Data Available</h5>
          <p>There are no employees to display in the organizational hierarchy.</p>
        </div>
      );
    }

    switch (currentView) {
      case "horizontal":
        return <HorizontalD3Tree data={formattedHierarchy} />;
      case "vertical":
        return <VerticalD3Tree data={formattedHierarchy} />;
      case "horizontalNew":
        return <SimpleSalesTree data={formattedHierarchy} />;
      case "table":
        return <TableView data={sortedData} />;
      default:
        return <VerticalD3Tree data={formattedHierarchy} />;
    }
  };

  return (
    <div className="sales-tree-page">
      <Heading
        title={t("Sales Tree")}
        secondTitle={
          <>
            <div className="d-flex align-items-center gap-3 flex-grow-1 justify-content-end" style={{ gap: "10px" }}>
              <div className="d-flex gap-2 pe-3 border-end">
                <CustomButton
                  icon={"excel"}
                  style={{ cursor: "pointer" }}
                  title="Export to Excel"
                  onClick={() => alert("Excel export feature coming soon!")}
                  className="mr-2"
                />
                <CustomButton
                icon={"pdf"}
                  style={{ cursor: "pointer" }}
                  title="Export to PDF"
                  onClick={() => alert("PDF export feature coming soon!")}
                />
              </div>

              <div className="btn-group shadow-sm" style={{ gap: "5px" }}>
                <CustomButton
                  className={`btn ${currentView === "horizontalNew" ? "btn-primary" : "btn-light text-white"}`}
                  onClick={() => setCurrentView("horizontalNew")}
                  disabled={loading}
                  icon={"tree"}
                  text={t("Tree")}
                />
                
                <CustomButton
                  className={`btn ${currentView === "table" ? "btn-primary" : "btn-light text-white"}`}
                  onClick={() => setCurrentView("table")}
                  icon={"table"}
                  text={t("Table")}
                  disabled={loading}
                />
              </div>
            </div>
          </>
        }
      />

      <div className="row">
        <div className="col-12">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default SalesTreeBootstrap;