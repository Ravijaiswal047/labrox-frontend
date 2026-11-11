import React, { useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import { ViewMenu } from "../../../../components/SvgIcons";
import QCFrameMenu from "../QCFrameMenu";

const SyncQCtoOfflineServer = () => {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const initialState = {
    Centre: "",
  };
  const [payload, setPayload] = useState(initialState);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  return (
    <>
      {showMore && <QCFrameMenu />}
      <Accordion
        name={t("Sync QC to Offline Server")}
        defaultValue={true}
        isBreadcrumb={true}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      >
        <div className="row p-2">
          <MultiSelctItems
            placeholderName="Centre"
            name="Centre"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownApis?.citybind}
            labelKey="city"
            valueKey="id"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            <Button className="rounded py-0">Search</Button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default SyncQCtoOfflineServer;
