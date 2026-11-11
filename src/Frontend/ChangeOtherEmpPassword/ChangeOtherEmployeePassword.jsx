import { useEffect, useState } from "react";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { GetAccessRightMaster } from "../../utils/NetworkApi/commonApi";
import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";

const ChangeOtherEmployeePassword = () => {
  const { t } = useTranslation();
  const [AccessRight, setAccessRight] = useState([]);
  const [EmployeeMaster, setEmployeeMaster] = useState({
    AccessRight: "",
  });

  const handleChanges = (name, value) => {
    // const val = select?.map((ele) => ele?.value);
    setEmployeeMaster({ ...EmployeeMaster, [name]: value });
  };
  useEffect(() => {
    GetAccessRightMaster(setAccessRight);
  }, []);

  return (
    <div>
      <Accordion
        name={t("Change Employee Password")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row  pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <MultiSelectComp
              label="AccessRight"
              id="AccessRight"
              // className="required-fields"
              placeholder=" "
              name="AccessRight"
              options={AccessRight}
              value={EmployeeMaster?.AccessRight}
              onChange={handleChanges}
            />
            {/* {(!EmployeeMaster?.AccessRight ||
                EmployeeMaster?.AccessRight?.length == 0) && (
                <span className="error-message">{error?.AccessRight}</span>
              )} */}
          </div>
        </div>
      </Accordion>
    </div>
  );
};
export default ChangeOtherEmployeePassword;
