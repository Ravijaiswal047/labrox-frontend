import React, { useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import SingleBulkPanelChange from "./SingleBulkPanelChange";
import MultiBulkPanelChange from "./MultiBulkPanelChange";

function BulkPanel() {
  const { t } = useTranslation();
  const [key, setKey] = useState({
    SingleBulkPanel: true,
    MultiBulkPanel: false,
  });

  const changeBulkPanel = (f1, f2) => {
    setKey({
      SingleBulkPanel: f1,
      MultiBulkPanel: f2,
    });
  };

  return (
    <div>
      <Accordion
        name={t("Manage Bulk Panel Change")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
          <button
            className="col-sm-2 btn btn-info h-100 ml-2 mr-2"
            // disabled={key?.SingleBulkPanel}
            onClick={() => changeBulkPanel(true, false)}
          >
            {t("Single Bulk Panel Change")}
          </button>
          <button
            className="col-sm-2 btn btn-info h-100 ml-2 mr-2 d-none"
            disabled={key?.MultiBulkPanel}
            onClick={() => changeBulkPanel(false, true)}
          >
            {t("Multi Bulk Panel Change")}
          </button>
        </div>
      </Accordion>
      {key?.SingleBulkPanel && <SingleBulkPanelChange />}
      {key?.MultiBulkPanel && <MultiBulkPanelChange />}
    </div>
  );
}

export default BulkPanel;
