import React, { useEffect, useState, useMemo } from "react";
import Nav from "react-bootstrap/Nav";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MachineTab from "./MachineTab";
import HomeTab from "./HomeTab";
import SalesTab from "./SalesTab";
import CampTab from "./CampTab";

const TargetSheet = () => {
  const location = useLocation();
  const [t] = useTranslation();
  const [activeKey, setActiveKey] = useState("#machine");
  const [search, setSearch] = useState("");

  // All dashboards central list
  const dashboards = [
    // comment out tabs that are not ready to be shown
    // { id: "#machine", title: "Machine", component: <MachineTab /> },
    // { id: "#home", title: "Home", component: <HomeTab/> },
    // { id: "#camp", title: "Camp", component: <CampTab/> },
    { id: "#sales", title: "Sales", component: <SalesTab /> },
  ];

  // Filter dashboards by search
  const filteredDashboards = useMemo(() => {
    return dashboards.filter(
      (d) =>
        d.id === activeKey || // always keep active tab visible
        d.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, dashboards, activeKey]);

  const handleChangeSearch = (event) => {
    setSearch(event.target.value);
  };

  

  // set active tab from URL hash
  useEffect(() => {
    if (location?.hash) {
      setActiveKey(location.hash);
      setSearch("");
    } else {
      setActiveKey("#machine"); // default tab
    }
  }, [location?.hash]);

  // Ensure active tab is always valid
  useEffect(() => {
    const exists = filteredDashboards.some((d) => d.id === activeKey);
    if (!exists && filteredDashboards.length > 0) {
      setActiveKey(filteredDashboards[0].id);
    }
  }, [filteredDashboards, activeKey]);

  return (
    <>
      <div
        style={{ gap: "4px" }}
        className="card px-2 py-1 d-flex flex-row justify-content-between align-items-center"
      >
        <div className="flex-grow-1 dashboard_menulist">
          <Nav
            className="flex-nowrap"
            variant="pills"
            activeKey={activeKey}
            onSelect={(selectedKey) => setActiveKey(selectedKey)}
          >
            {filteredDashboards.map((d) => (
              <Nav.Item className="text-black" key={d.id}>
                <Nav.Link href={d.id}>{d.title}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
        <div className="search-container box-shadow border col-3 col-sm-2 col-md-1">
          <input
            className="search-menu-container"
            type="text"
            placeholder={t("Search Dashboard")}
            value={search}
            onChange={handleChangeSearch}
          />
          <i className="fa fa-search"></i>
        </div>
         
      </div>

      <div className="mt-3">
        {dashboards.map(
          (d) =>
            d.id === activeKey && (
              <React.Fragment key={d.id}>{d.component}</React.Fragment>
            )
        )}
      </div>
    </>
  );
};

export default TargetSheet;
