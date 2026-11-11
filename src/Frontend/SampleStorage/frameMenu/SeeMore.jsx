import { useNavigate } from "react-router-dom";

const SeeMore = ({ seeMore = [], handleChangeComponent, setShowMore }) => {
  const navigate = useNavigate();
  const getChunkedOptions = (options) => {
    const response = options.map((item) => ({
      label: item?.name,
      value: item?.name,
      component: item?.component,
      ...item,
    }));

    const columns = [];
    for (let i = 0; i < response.length; i += 10) {
      columns.push(response.slice(i, i + 10));
    }
    return columns;
  };

  const columns = getChunkedOptions(seeMore);

  return (
    <>
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
                  onClick={() => {
                    handleChangeComponent?.(item);
                    navigate(item?.url);
                  }}
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
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SeeMore;
