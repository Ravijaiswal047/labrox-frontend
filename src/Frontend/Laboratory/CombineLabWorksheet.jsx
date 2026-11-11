import { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import '../../Frontend/Master/RateListAllPage/RateListAllPage.css'
import LabWorksheetReport from "./LabWorksheetReport";
import HistoWorksheet from "./HistoWorkSheet";
import Heading from "../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import DepartmentWisePendingList from "./DepartmentWisePendingList";

function CombineLabWorksheet() {
  const { t } = useTranslation();
  const [key, setKey] = useState("LabWorksheet");
  return (
    <div className="card">
       <Heading
                isBreadcrumb={true}
                name={t("Combine Worksheet")}
            />
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-1"
      >
        <Tab eventKey="LabWorksheet" title="Lab WorkSheet">
          <LabWorksheetReport />
        </Tab>
        <Tab eventKey="HistoWorksheet" title="Histo Worksheet">
          <HistoWorksheet />
        </Tab>
        <Tab eventKey="TechnicianPendingList" title="Technician Pending List">
          <DepartmentWisePendingList />
        </Tab>
        
        
      </Tabs>
    </div>
  );
}

export default CombineLabWorksheet;