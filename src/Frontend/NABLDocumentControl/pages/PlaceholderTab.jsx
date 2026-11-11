import { useTranslation } from "react-i18next";
import Accordion from "../../../components/UI/Accordion";
import { useNABLFilters } from "../context/NABLFilterContext";

const PlaceholderTab = ({ title }) => {
  const { t } = useTranslation();
  const { filters, filterOptions } = useNABLFilters();
  const centre =
    filterOptions.centres.find((item) => item.value === filters.centreId)?.label || t("All Centres");
  const year =
    filterOptions.auditYears.find((item) => item.value === filters.auditYearId)?.label || t("Audit Year");
  const department =
    filterOptions.departments.find((item) => item.value === filters.departmentId)?.label ||
    t("All Departments");

  return (
    <Accordion name={t(title)} isBreadcrumb={true} defaultValue={true}>
      <div className="text-center text-muted py-4 px-2">
        <p className="mb-2">
          {t(
            "This workspace uses the shared Centre, Audit Year and Department filters. Screen content will be added next."
          )}
        </p>
        <div>
          <span className="badge bg-light text-dark mr-1">{centre}</span>
          <span className="badge bg-light text-dark mr-1">{year}</span>
          <span className="badge bg-light text-dark">{department}</span>
        </div>
      </div>
    </Accordion>
  );
};

export default PlaceholderTab;
