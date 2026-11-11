import React, { useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import AllergyTypeMaster from "./AllergyTypeMaster";
import AllergyDrugMaster from "./AllergyDrugMaster";
import { CustomButton } from "../../components/UI/CustomButton";

function AllergyMaster() {
  const { t } = useTranslation();
  const [key, setKey] = useState({
    AllergyType: false,
    AllergyDrug: true,
  });

  const changeAllergy = (f1, f2) => {
    setKey({
      AllergyType: f1,
      AllergyDrug: f2,
    });
  };

  console.log({ key });
  return (
    <div>
      <Accordion
        name={t("Allergy Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
          <CustomButton
            text={"Allergy Drug Master"}
            className="col-lg-2 col-md-3 col-sm-3 col-5 btn btn-info ml-2 mr-2"
            disabled={key?.AllergyDrug}
            //  style={{
            //   backgroundColor: !key?.AllergyDrug && "transparent",
            //   color: !key?.AllergyDrug ? "#6c757d" : "#fff",
            // }}
            onClick={() => changeAllergy(false, true)}
          />
          <CustomButton
            text={"Allergy Type Master"}
            disabled={key?.AllergyType}
            // style={{
            //   backgroundColor: !key?.AllergyType && "transparent",
            //   color: !key?.AllergyType ? "#6c757d" : "#fff",
            // }}
            onClick={() => changeAllergy(true, false)}
            className="col-lg-2 col-md-3 col-sm-3 col-5 btn btn-info ml-2 mr-2"
          />
        </div>
      </Accordion>
      {key?.AllergyType && <AllergyTypeMaster />}
      {key?.AllergyDrug && <AllergyDrugMaster />}
    </div>
  );
}

export default AllergyMaster;
