import React, { useEffect, useState } from "react";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";

const itemLabel = (item) => {
  if (!item) return "";
  const code = item.TestCode || "";
  const name = item.TestName || item.label || "";
  return code ? `${code} - ${name}` : name;
};

const DopdItemSearch = ({ value, label, placeholder = "Consultation Item", onSelect }) => {
  const [text, setText] = useState(label || "");
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setText(label || "");
  }, [label, value]);

  const search = (q) => {
    setText(q);
    if (!q || q.trim().length < 2) {
      setList([]);
      setOpen(false);
      return;
    }
    axiosInstance
      .post("DoctorOPDConsultation/SearchConsultationItems", { SearchText: q.trim() })
      .then((res) => {
        setList(res?.data?.message || []);
        setOpen(true);
      });
  };

  return (
    <div className="dopd-item-ac">
      <Input
        name="ConsultationItem"
        lable={placeholder}
        placeholder=" "
        value={text}
        onChange={(e) => search(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && list.length === 0 && text.trim().length >= 2 && (
        <ul className="suggestion-data">
          <li>No consultation item found</li>
        </ul>
      )}
      {open && list.length > 0 && (
        <ul className="suggestion-data">
          {list.map((item) => (
            <li
              key={item.InvestigationID}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(item);
                setText(itemLabel(item));
                setOpen(false);
                setList([]);
              }}
            >
              {itemLabel(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DopdItemSearch;
export { itemLabel };
