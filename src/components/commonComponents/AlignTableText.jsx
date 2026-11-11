import react from "react";
import { formatAmount } from "../../utils/ustil2";
import { ROUNDOFF_VALUE } from "../../utils/constant";
 const AlignTableText = ({value, isAmount=false, side="right",isbold=false,color}) => {
    // debugger
   
  if (isAmount) {
    return (
      <div className={`text-${side}`} style={{fontWeight:isbold?"bold":"normal" ,color:color}}>
        {formatAmount(Number(value || 0)?.toFixed(ROUNDOFF_VALUE))}
      </div>
    );
  } else {
   return <div className={`text-${side}`} style={{fontWeight:isbold?"bold":"normal",color:color}}>{value}</div>;
  }
};

export default AlignTableText