import React from "react";
import { FaCog, FaThLarge, FaTable, FaColumns, FaEye, FaUndo, FaRedo, FaSearchMinus, FaSearchPlus } from "react-icons/fa";
import { Expand, Minimize2 } from "lucide-react";
import { CustomButton } from "@components/UI/CustomButton";

const TAB_ICONS = {
  page: FaCog,
  design: FaThLarge,
  body: FaTable,
  settle: FaColumns,
  preview: FaEye,
};

// Unified tab strip + (when the Designer tab is active) inline canvas controls, in one
// bar — replaces the generic house CustomTabs for this tool specifically, since the
// desired pill/icon look and the inline undo-redo/snap/grid/zoom slot don't fit
// CustomTabs' bootstrap Nav.Tabs shape.
export default function TopTabsBar({ tabs, activeTab, onSelect, designerControls, isFullscreen, onToggleFullscreen }) {
  return (
    <div className="rbn-tabsbar">
      <div className="rbn-tabsbar-tabs">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              className={`rbn-tab-pill ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => onSelect(tab.id)}
            >
              {Icon && <Icon size={13} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rbn-tabsbar-controls">
        {designerControls && (
          <>
            <button type="button" className="rbn-icon-btn" disabled={!designerControls.canUndo} onClick={designerControls.undo} title="Undo">
              <FaUndo size={13} />
            </button>
            <button type="button" className="rbn-icon-btn" disabled={!designerControls.canRedo} onClick={designerControls.redo} title="Redo">
              <FaRedo size={13} />
            </button>
            <span className="rbn-toolbar-sep" />
            <CustomButton
              text="Snap"
              variant={designerControls.snapEnabled ? "primary" : "outline"}
              onClick={() => designerControls.setSnapEnabled((v) => !v)}
            />
            <CustomButton
              text="Grid"
              variant={designerControls.showGrid ? "primary" : "outline"}
              onClick={() => designerControls.setShowGrid((v) => !v)}
            />
            <span className="rbn-toolbar-sep" />
            <button
              type="button"
              className="rbn-icon-btn"
              onClick={() => designerControls.setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
              title="Zoom out"
            >
              <FaSearchMinus size={12} />
            </button>
            <span className="rbn-zoom-label">{Math.round(designerControls.zoom * 100)}%</span>
            <button
              type="button"
              className="rbn-icon-btn"
              onClick={() => designerControls.setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}
              title="Zoom in"
            >
              <FaSearchPlus size={12} />
            </button>
            <span className="rbn-toolbar-sep" />
          </>
        )}
        <button type="button" className="rbn-icon-btn" onClick={onToggleFullscreen} title={isFullscreen ? "Exit full screen" : "Full screen"}>
          {isFullscreen ? <Minimize2 size={13} /> : <Expand size={13} />}
        </button>
      </div>
    </div>
  );
}
