import { useState } from "react";
import { Card } from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import '../../Frontend/Master/RateListAllPage/RateListAllPage.css'
import VehicleMaster from "./AmbulanceMaster/VehicleMaster";
import ReadingMaster from "./AmbulanceMaster/ReadingMaster";
import DriverMaster from "./AmbulanceMaster/DriverMaster";

function AmbulanceMaster() {
  const [key, setKey] = useState("VehicleMaster");

  return (
    <div className="card">
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-1"
      >
        <Tab eventKey="VehicleMaster" title="Vehicle Master">
          <VehicleMaster/>
        </Tab>
        <Tab eventKey="ReadingMaster" title="Reading Master">
          <ReadingMaster/>
        </Tab>
        <Tab eventKey="DriverMaster" title="Driver Master">
          <DriverMaster/>
        </Tab>
      </Tabs>
    </div>
  );
}

export default AmbulanceMaster;