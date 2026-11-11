import moment from "moment";
import { parseRemarks } from "../../utils/helpers";
import { Tooltip as ReactTooltip } from "react-tooltip";

const LastRemarkCell = ({ remarks }) => {
  const parsed = parseRemarks(remarks);

  if (!Array.isArray(parsed) || parsed?.length === 0) return null;

  const sortedRemarks = [...parsed].sort((a, b) => {
    const dateDiff =
      moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") -
      moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A");

    if (dateDiff !== 0) return dateDiff;

    return parsed.indexOf(b) - parsed.indexOf(a);
  });

  return (
    <div style={{ maxWidth: "150px" }}>
      <ul style={{ paddingLeft: "2px", margin: 0, listStyleType: "none" }}>
        {sortedRemarks?.map((item, index) => {
          const remarkText = item?.LabRemarks || "";

          return (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "4px",
                fontWeight: index === 0 ? "bold" : "normal",
                marginBottom: "4px",
                cursor: "pointer",
              }}
            >
              <span>•</span>
              <span
                data-tooltip-id={`last-remark-tooltip-${index}`}
                data-tooltip-content={remarkText}
                className="remark-item"
              >
                {remarkText}
              </span>

              <ReactTooltip
                id={`last-remark-tooltip-${index}`}
                positionStrategy="fixed"
                style={{
                  backgroundColor: "#2d3748",
                  color: "#fff",
                  fontSize: "12px",
                  borderRadius: "4px",
                  padding: "6px 10px",
                  maxWidth: "250px",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  zIndex: 9999,
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LastRemarkCell;