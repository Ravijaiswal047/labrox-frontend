
import ConsumptionChart from "./ESGComponents/ConsumptionChart";
import GrievianceChart from "./ESGComponents/GrievianceChart";
import IncidentChart from "./ESGComponents/IncidentChart";
import WasteManagementChart from "./ESGComponents/WasteManagementChart";

const ESGDashboard = ({ filters, accessCentre }) => {
  return (
    <>
      <div className="container-fluid ">
      <div className="row">
        <div className="col-md-6">
          <ConsumptionChart 
            filters={filters}
          />
        </div>
        <div className="col-md-6">
          <WasteManagementChart 
            filters={filters}
          />
        </div>
        <div className="col-md-6" style={{marginTop: "30px"}}>
          <IncidentChart 
            filters={filters}
          />
        </div>
        <div className="col-md-6" style={{marginTop: "30px"}}>
          <GrievianceChart 
            filters={filters}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default ESGDashboard;