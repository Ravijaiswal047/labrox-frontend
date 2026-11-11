export const RemarkTooltip = ({ remarks }) => {
  console.log("remarks",remarks);
  // const onlineRemarks = remarks?.filter(r => r?.ShowOnline === 1);
  return (
    <div>
      <h2 className="mb-1 border-bottom">Remarks</h2>
      <div>
        {remarks?.map((r, i) => (
          <div key={i} className="mb-1">
            <span>{i + 1}. </span>{r?.LabRemarks}
          </div>
        ))}
      </div>
    </div>
  );
};