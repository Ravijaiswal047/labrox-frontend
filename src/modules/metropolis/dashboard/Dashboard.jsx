import "./dashboard.css"
import ImportantUpdatesCard from "./ImportantUpdatesCard";
import RateCard from "./RateCard";
import ServiceConsoleCard from "./ServiceConsoleCard";
import TestsRevenueCard from "./TestsRevenueCard";
import TotalOSCard from "./TotalOSCard";
import VisitSummaryCard from "./VisitSummaryCard";

const Dashboard = () => {
  return (
      <div className="dashboard-container">
        <div className="dashboard-row">
          <VisitSummaryCard />
          <RateCard />
          <TotalOSCard />
        </div>
        
        <div className="dashboard-row">
          <ImportantUpdatesCard />
          <ServiceConsoleCard />
          <TestsRevenueCard />
        </div>
      </div>
  );
};

export default Dashboard;