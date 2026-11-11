import { useState } from "react";
import Input from "../../../components/formComponent/Input";
import { CustomButton } from "../../../components/UI/CustomButton";

const RateCard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="dashboard-card">
      <div className="header-row">

      <h5 className="card-title">Rate Card</h5>
      </div>
      
      <div className="search-group">
        <Input
          type="text"
          name="Rate"
          lable="Rate"
          className="form-control w-full" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CustomButton text={"Get RNI Rate"} />
      </div>
    </div>
  );
};

export default RateCard;