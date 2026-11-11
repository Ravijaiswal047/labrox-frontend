import React from "react";

function AutoComplete({ selects, test, handleListSearch, indexMatch }) {
  const getBgColor = (isMatch, active) => {
    if (!isMatch) return "transparent";

    return active === 1 || active === undefined ? "#0066ff" : "lightpink";
  };

  const getHoverColor = (active) => {
    return active === 1 || active === undefined ? "#0066ff" : "lightpink";
  };

  console.log("test");

  return (
    <div>
      {/* {selects && ( */}
      <ul className="suggestion-data">
        {test?.map((data, index) => {
          const isMatch = index === indexMatch;
          return (
            <li
              onClick={() => handleListSearch(data, "TestName")}
              // className={`${index === indexMatch && "matchIndex"}`}
              style={{
                background: getBgColor(isMatch, data.active),
                color: isMatch ? "white" : "black",
              }}
              key={index}
              // className={`
              //   ${index === indexMatch ? "matchIndex" : ""}
              //   ${data.active === 1 ? "item-active" : "item-inactive"}
              // `}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = getHoverColor(data.active);
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = getBgColor(isMatch, data.active);
                e.currentTarget.style.color = isMatch ? "white" : "black";
              }}
            >
              {data?.TestName}
            </li>
          )

        })}
      </ul>
      {/* )} */}
    </div>
  );
}

export default AutoComplete;
