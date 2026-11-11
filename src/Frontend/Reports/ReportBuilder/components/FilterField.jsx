import React, { useEffect, useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
import Input from "../../../../components/formComponent/Input";
import Checkbox from "../../../../components/formComponent/Checkbox";
import RadioInput from "../../../../components/formComponent/RadioInput";
import DatePicker from "../../../../components/formComponent/DatePicker";
import reportBuilderApi from "../reportBuilderApi";

const SINGLE_SELECT_TYPES = ["Dropdown", "Auto Complete", "Tree View", "Search Popup"];
const SELECT_TYPES = [...SINGLE_SELECT_TYPES, "Multi Select"];

// Whichever SQL / Stored Procedure / Static Values source a filter is configured
// with, GetFilterOptions resolves it server-side and always hands back plain
// {value,label} options — the frontend never needs to know or parse the source
// itself, it just asks "what are this filter's options right now".
const optionsCache = new Map();
const isUnsavedId = (id) => typeof id === "string" && id.startsWith("f-new-");

// Shared by the Filters tab's Live Preview, the Preview tab, and Report Viewer —
// one place that decides, from a filter's controlType, which control to render
// and whether it behaves as a single-select or multi-select.
export const useFilterOptions = (reportId, row) => {
  const cacheKey = `${reportId}-${row.id}`;
  const [options, setOptions] = useState(() => optionsCache.get(cacheKey) || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!SELECT_TYPES.includes(row.controlType)) return;
    if (!reportId || isUnsavedId(row.id)) return; // nothing persisted to fetch options for yet

    if (optionsCache.has(cacheKey)) {
      setOptions(optionsCache.get(cacheKey));
      return;
    }

    let cancelled = false;
    setLoading(true);
    reportBuilderApi
      .getFilterOptions(reportId, row.id)
      .then((res) => {
        if (cancelled) return;
        const opts = res.success ? (res.data || []).map((o) => ({ value: o.value, label: o.label })) : [];
        optionsCache.set(cacheKey, opts);
        setOptions(opts);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, row.id, row.controlType, cacheKey]);

  return { options, loading };
};

const FilterField = ({ reportId, row, value, onChange, style }) => {
  const { options, loading } = useFilterOptions(reportId, row);

  if (row.controlType === "Date" || row.controlType === "Date Range") {
    return <DatePicker id={`fld-${row.id}`} name={String(row.id)} value={value} onChange={(v) => onChange(row.id, v)} respclass="" />;
  }

  if (row.controlType === "Checkbox") {
    return (
      <Checkbox
        id={`fld-${row.id}`}
        name={String(row.id)}
        label="Yes"
        checked={!!value}
        onChange={(name, checked) => onChange(row.id, checked)}
        removeSpacing
      />
    );
  }

  if (row.controlType === "Radio") {
    const radioOptions = options.length ? options : [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    return (
      <div className="rb-src-row">
        {radioOptions.map((opt) => (
          <RadioInput
            key={opt.value}
            id={`fld-${row.id}-${opt.value}`}
            name={`fld-${row.id}`}
            label={opt.label}
            checked={String(value) === String(opt.value)}
            onChange={() => onChange(row.id, opt.value)}
          />
        ))}
      </div>
    );
  }

  if (row.controlType === "Number" || row.controlType === "Time") {
    return (
      <Input
        id={`fld-${row.id}`}
        name={String(row.id)}
        type={row.controlType === "Number" ? "number" : "text"}
        value={value ?? ""}
        onChange={(e) => onChange(row.id, e.target.value)}
        removeFormGroupClass
      />
    );
  }

  if (row.controlType === "Multi Select") {
    return (
      <div style={style}>
        <MultiSelectComp
          id={`fld-${row.id}`}
          name={row.id}
          options={options}
          value={Array.isArray(value) ? value : []}
          onChange={(name, v) => onChange(row.id, v || [])}
          placeholder={row.name}
        />
      </div>
    );
  }

  if (SINGLE_SELECT_TYPES.includes(row.controlType)) {
    return (
      <div style={style}>
        <ReactSelect
          id={`fld-${row.id}`}
          name={String(row.id)}
          placeholderName={row.name}
          dynamicOptions={options}
          value={value ?? ""}
          onChange={(name, opt) => onChange(row.id, opt?.value ?? "")}
          searchable={row.controlType === "Auto Complete"}
          isLoading={loading}
        />
      </div>
    );
  }

  return (
    <Input
      id={`fld-${row.id}`}
      name={String(row.id)}
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(row.id, e.target.value)}
      removeFormGroupClass
    />
  );
};

export default FilterField;
