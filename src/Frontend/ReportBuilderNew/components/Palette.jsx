import React, { useState } from "react";
import { FaSquare, FaSearch, FaTimes } from "react-icons/fa";
import { useDesigner } from "./DesignerTab";
import { PALETTE_ITEMS, SINGLETON_TYPES } from "../constants/elementDefaults";
import { TYPE_ICONS } from "../constants/typeIcons";

const SINGLETON_ITEMS = [
  { type: "bodytable", name: "Body Table" },
  { type: "settletable", name: "Settlement Table" },
  { type: "totalsblock", name: "Totals Block" },
];

// Shared by Header fields / Footer fields — a search icon toggles an inline search box so
// finding one token among 40+ doesn't mean scrolling the whole list every time.
function FieldTokenSection({ title, fields, loading, onAdd }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const q = query.trim().toLowerCase();
  const visibleFields = q
    ? fields.filter((f) => f.token.toLowerCase().includes(q) || (f.label || "").toLowerCase().includes(q))
    : fields;

  return (
    <>
      <div className="rbn-panel-title rbn-panel-title-row">
        <span>
          {title} · {fields.length}
        </span>
        <button
          type="button"
          className="rbn-title-search-btn"
          title={searchOpen ? "Close search" : "Search fields"}
          onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
        >
          {searchOpen ? <FaTimes size={13} /> : <FaSearch size={13} />}
        </button>
      </div>
      {searchOpen && (
        <input
          type="text"
          autoFocus
          className="rbn-token-search"
          placeholder={`Search ${title.toLowerCase()}…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="rbn-token-list">
        {visibleFields.map((f) => (
          <button key={f.token} type="button" className="rbn-token-row" onClick={() => onAdd(f)}>
            {f.token}
          </button>
        ))}
        {!loading && visibleFields.length === 0 && (
          <div className="rbn-empty-text">{q ? "No matching fields" : "No fields found"}</div>
        )}
      </div>
    </>
  );
}

export default function Palette() {
  const { elements, addElement, fieldTokens, fieldTokensLoading } = useDesigner();
  const headerFields = fieldTokens?.headerFields || [];
  const footerFields = fieldTokens?.footerFields || [];

  return (
    <div className="rbn-palette">
      <div className="rbn-panel-title">Components</div>
      <div className="rbn-palette-grid">
        {PALETTE_ITEMS.map((item) => {
          const Icon = TYPE_ICONS[item.type];
          return (
            <button key={item.type} type="button" className="rbn-palette-chip" onClick={() => addElement(item.type)}>
              <Icon size={14} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="rbn-panel-title">Table anchors</div>
      <div className="rbn-palette-grid">
        {SINGLETON_ITEMS.map((item) => {
          const already = elements.some((el) => el.type === item.type);
          const Icon = TYPE_ICONS[item.type] || FaSquare;
          return (
            <button
              key={item.type}
              type="button"
              className="rbn-palette-chip"
              disabled={already}
              title={already ? "Already on canvas" : ""}
              onClick={() => addElement(item.type)}
            >
              <Icon size={14} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      <FieldTokenSection
        title="Header fields"
        fields={headerFields}
        loading={fieldTokensLoading}
        onAdd={(f) => addElement("field", { token: f.token, label: f.label })}
      />

      <FieldTokenSection
        title="Footer fields"
        fields={footerFields}
        loading={fieldTokensLoading}
        onAdd={(f) => addElement("field", { token: f.token, label: f.label, fontSize: 7.5, h: 15 })}
      />
    </div>
  );
}
