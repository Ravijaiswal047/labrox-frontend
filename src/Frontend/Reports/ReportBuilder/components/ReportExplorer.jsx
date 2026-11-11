import React, { useMemo, useState } from "react";
import Input from "../../../../components/formComponent/Input";

const ReportExplorer = ({
  treeData,
  setTreeData,
  selectedId,
  onSelectLeaf,
  onAddNew,
  title = "REPORT EXPLORER",
  allowedStatuses,
}) => {
  const [search, setSearch] = useState("");

  const toggleGroup = (groupId) => {
    setTreeData((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, open: !g.open } : g))
    );
  };

  const isLocked = (leaf) => allowedStatuses && !allowedStatuses.includes(leaf.status);

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return treeData;
    return treeData
      .map((g) => ({
        ...g,
        open: true,
        items: g.items.filter(
          (it) =>
            it.name.toLowerCase().includes(term) ||
            it.code.toLowerCase().includes(term)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [treeData, search]);

  return (
    <div className="rb-side">
      <div className="rb-side-hd">
        {title}
        {onAddNew && (
          <button type="button" className="rb-add" title="New Report" onClick={onAddNew}>
            ＋
          </button>
        )}
      </div>
      <div className="rb-side-search">
        <Input
          id="rbExplorerSearch"
          name="rbExplorerSearch"
          type="text"
          placeholder="🔍  Search report name / code…"
          removeFormGroupClass
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="rb-tree">
        {filteredGroups.length === 0 && (
          <div className="rb-tree-empty">No reports match your search.</div>
        )}
        {filteredGroups.map((g) => (
          <React.Fragment key={g.id}>
            <div className={`rb-grp${g.open ? " open" : ""}`} onClick={() => toggleGroup(g.id)}>
              {g.group}
            </div>
            {g.open &&
              g.items.map((leaf) => {
                const locked = isLocked(leaf);
                return (
                  <div
                    key={leaf.id}
                    className={`rb-leaf${selectedId === leaf.id ? " active" : ""}${locked ? " locked" : ""}`}
                    title={locked ? "Not published yet — ask a developer to publish this report" : undefined}
                    onClick={() => !locked && onSelectLeaf(leaf)}
                  >
                    {locked ? "🔒" : "📄"} {leaf.name}
                    <span className={`rb-st ${leaf.status === "LIVE" ? "pub" : "drf"}`}>{leaf.status}</span>
                  </div>
                );
              })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ReportExplorer;
