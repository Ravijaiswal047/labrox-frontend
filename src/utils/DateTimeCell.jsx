const DateTimeCell = ({ dateString }) => {
  const dateParts = (dateString || "").split(" ");
  return (
    <div>
      <p className="mb-0" style={{ fontWeight: "500" }}>{dateParts[0]}</p>
      <p className="mb-0" style={{ fontSize: "12px" }}>{dateParts.slice(1).join(" ")}</p>
    </div>
  );
};

export default DateTimeCell;