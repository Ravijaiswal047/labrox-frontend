import { useState } from "react";
import { Card } from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ClientWiseRateList from "./ClientWiseRateList";
import './RateListAllPage.css'
import ItemWiseRateList from "./ItemWiseRateList";
import { useTranslation } from "react-i18next";


function RateListTabs() {
  const [key, setKey] = useState("ItemWiseRateList");
  const [t]  = useTranslation();

  return (
    <div className="px-1 py-1 card">
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-2"
      >
        <Tab eventKey="ItemWiseRateList" title={t("Item Wise Rate List")}>
          <ItemWiseRateList/>
        </Tab>
        <Tab eventKey="ClientWiseRateList" title={t("Client Wise Rate List")}>
          <ClientWiseRateList/>
        </Tab>
        <Tab eventKey="TransferRateTypeWise" title="Transfer RateType Wise">
          Tab content for Contact
        </Tab>
      </Tabs>
    </div>
  );
}

export default RateListTabs;