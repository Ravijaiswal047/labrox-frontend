import React, { useEffect, useReducer, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TopBar from "./components/TopBar";
import TopTabsBar from "./components/TopTabsBar";
import LayoutJsonModal from "./components/LayoutJsonModal";
import PageBrandingTab from "./components/PageBrandingTab";
import DesignerTab from "./components/DesignerTab";
import BodyTableTab from "./components/BodyTableTab";
import SettlementTotalsTab from "./components/SettlementTotalsTab";
import PreviewPrintTab from "./components/PreviewPrintTab";
import useHistory from "./hooks/useHistory";
import { makeElement } from "./constants/elementDefaults";
import { DEFAULT_REPORT_TYPE } from "./constants/reportTypes";
import { toLayoutJson, fromLayoutJson, DEFAULT_TABLE_BORDER, DEFAULT_LETTERHEAD_IMAGE_SIZE } from "./utils/layoutJson";
import {
  saveTemplate as saveTemplateLocal,
  publishTemplate as publishTemplateLocal,
} from "./utils/localPersistence";
import {
  getFieldTokens,
  getColumnCatalog,
  getTemplateList,
  getTemplateById,
  saveTemplate as saveTemplateApi,
  publishTemplate as publishTemplateApi,
  deleteTemplate as deleteTemplateApi,
} from "@app/NetworkServices/ReportBuilderNew";
import "./ReportBuilderNew.css";

const DEFAULT_ELEMENTS = [
  makeElement("bodytable", { x: 24, y: 240, z: 1 }),
  makeElement("settletable", { x: 24, y: 552, z: 2 }),
  makeElement("totalsblock", { x: 470, y: 552, z: 3 }),
];

const initialState = {
  templateId: null,
  reportType: DEFAULT_REPORT_TYPE,
  meta: {
    code: "RCPT-NEW-01",
    name: "New Receipt Template",
    pageSize: "A4",
    orientation: "Portrait",
    // Only actually used when pageSize === "Custom" — for every preset these are ignored
    // in favor of PAGE_SIZES, but toLayoutJson always emits the resolved px pair (see
    // getPageDimensions) so the backend/PDF renderer never has to re-derive page size from
    // just the "A4"/"Portrait" strings.
    pageWidth: 874,
    pageHeight: 1123,
    font: "Arial",
    fontSize: 10,
    bg: "#ffffff",
    letterheadType: "html_static",
    staticHtml:
      "<h2 style='margin:0'>Company Name</h2><p style='margin:2px 0;font-size:11px'>Address line &middot; Phone &middot; Email</p>",
    letterheadImageSize: { ...DEFAULT_LETTERHEAD_IMAGE_SIZE },
    stampImage: null,
    inclusionStyle: "brackets",
    showSettlement: true,
    // Body/Settlement/Totals each start with the same look but are independently
    // editable from here on (Page & Branding → separate "... table borders" sections).
    tableBorder: { ...DEFAULT_TABLE_BORDER },
    settlementTableBorder: { ...DEFAULT_TABLE_BORDER },
    totalsTableBorder: { ...DEFAULT_TABLE_BORDER },
    fieldLabelWidth: 90,
    pageMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    pageBorder: { top: false, right: false, bottom: false, left: false, borderWidth: 1, borderColor: "#1B2E5E" },
    status: "Draft",
    version: 1,
  },
  settings: { LOCK_CREDIT_PANEL: false, LOCK_RATETYPE: false, ONLY_ACTIVE_ITEM: false },
  elements: DEFAULT_ELEMENTS,
  bodyColumns: [],
  settlementColumns: [],
  totals: [],
};

const EMPTY_FIELD_TOKENS = { headerFields: [], footerFields: [] };

function reducer(state, action) {
  switch (action.type) {
    case "SET_REPORT_TYPE":
      return { ...state, reportType: action.payload };
    case "SET_META":
      return { ...state, meta: { ...state.meta, ...action.payload } };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "SET_ELEMENTS":
      return { ...state, elements: action.payload };
    case "SET_BODY_COLUMNS":
      return { ...state, bodyColumns: action.payload };
    case "SET_SETTLEMENT_COLUMNS":
      return { ...state, settlementColumns: action.payload };
    case "SET_TOTALS":
      return { ...state, totals: action.payload };
    case "LOAD_DOC":
      return action.payload;
    default:
      return state;
  }
}

const TABS = [
  { id: "page", label: "Page & Branding" },
  { id: "design", label: "Designer" },
  { id: "body", label: "Body Table" },
  { id: "settle", label: "Settlement & Totals" },
  { id: "preview", label: "Preview & Print" },
];

export default function ReportBuilderNew() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState("design");
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [fieldTokens, setFieldTokens] = useState(EMPTY_FIELD_TOKENS);
  const [fieldTokensLoading, setFieldTokensLoading] = useState(true);
  const [columnCatalogLoading, setColumnCatalogLoading] = useState(true);
  const [templateList, setTemplateList] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Exactly one template in the list is ever flagged isDefault: true — that's the only
  // one Save/Publish are allowed to write into. You can load any template (default or
  // not) into the canvas to view/edit it, but the write always targets whichever id is
  // currently the default, not necessarily the one you loaded.
  const defaultTemplateId = templateList.find((t) => t.isDefault)?.templateId ?? null;

  const refreshTemplateList = async (reportType = state.reportType) => {
    const res = await getTemplateList({ reportType });
    if (res.success) setTemplateList(res.data || []);
  };

  // GetFieldTokens/GetColumnCatalog for a brand-new (unsaved) template of the given
  // report type — shared by mount, the report-type selector, and "+ New template".
  const loadNewTemplateCatalog = async (reportType) => {
    setFieldTokensLoading(true);
    setColumnCatalogLoading(true);
    const tokensRes = await getFieldTokens(reportType);
    if (tokensRes.success && tokensRes.data) {
      setFieldTokens(tokensRes.data);
    } else {
      setFieldTokens(EMPTY_FIELD_TOKENS);
      showToast(tokensRes.message || "Could not load field tokens");
    }
    setFieldTokensLoading(false);

    const catalogRes = await getColumnCatalog(reportType);
    if (catalogRes.success && catalogRes.data) {
      dispatch({ type: "SET_BODY_COLUMNS", payload: catalogRes.data.bodyColumns || [] });
      dispatch({ type: "SET_SETTLEMENT_COLUMNS", payload: catalogRes.data.settlementColumns || [] });
      dispatch({ type: "SET_TOTALS", payload: catalogRes.data.totals || [] });
    } else {
      showToast(catalogRes.message || "Could not load column catalog");
    }
    setColumnCatalogLoading(false);
  };

  // Canvas view state (zoom/grid/snap) + the undo/redo history stack live here, not
  // inside DesignerTab, so the tab bar's inline controls (see TopTabsBar) can read and
  // drive the same state without prop-drilling through a sibling.
  const [zoom, setZoom] = useState(0.8);
  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const snapSize = 8;
  const setElements = (elements) => dispatch({ type: "SET_ELEMENTS", payload: elements });
  const history = useHistory(state.elements, setElements);

  // Fullscreen toggle (native Fullscreen API on the whole tool, not just the canvas) —
  // works regardless of the surrounding app chrome (header/sidebar) since the fullscreen
  // element visually covers the entire screen.
  const rootRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      rootRef.current?.requestFullscreen();
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // On mount: either load an existing template (?templateId= in the URL) or seed a new
  // one from the backend catalogs for the default report type. GetColumnCatalog is only
  // fetched for a brand-new template — an existing template's bodyColumns/
  // settlementColumns/totals already come back fully customized from GetTemplateById.
  useEffect(() => {
    let cancelled = false;
    const urlTemplateId = searchParams.get("templateId");

    (async () => {
      if (urlTemplateId) {
        const docRes = await getTemplateById(urlTemplateId);
        if (cancelled) return;
        if (!docRes.success) {
          showToast(docRes.message || "Could not load template");
          setFieldTokensLoading(false);
          setColumnCatalogLoading(false);
          refreshTemplateList(DEFAULT_REPORT_TYPE);
          return;
        }
        const doc = fromLayoutJson(docRes.data);
        dispatch({ type: "LOAD_DOC", payload: doc });
        setColumnCatalogLoading(false);
        refreshTemplateList(doc.reportType);

        // GetFieldTokens is scoped by report type — a loaded template may not be
        // "Receipt", so fetch tokens for whatever type it actually turned out to be,
        // not the default.
        const tokensRes = await getFieldTokens(doc.reportType);
        if (cancelled) return;
        if (tokensRes.success && tokensRes.data) {
          setFieldTokens(tokensRes.data);
        } else {
          setFieldTokens(EMPTY_FIELD_TOKENS);
          showToast(tokensRes.message || "Could not load field tokens");
        }
        setFieldTokensLoading(false);
        return;
      }

      refreshTemplateList(DEFAULT_REPORT_TYPE);
      await loadNewTemplateCatalog(DEFAULT_REPORT_TYPE);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A loaded template (state.templateId truthy) always writes to the current default
  // template's id, regardless of which one was loaded/edited. A brand-new, never-saved
  // template (state.templateId null, via "+ New template") still creates a new row.
  const resolveSaveTemplateId = () => (state.templateId ? defaultTemplateId ?? state.templateId : null);

  const handleSave = async () => {
    if (!state.meta.code || !state.meta.name) {
      showToast("Template code and name are required before saving");
      return;
    }
    setSaving(true);
    try {
      const res = await saveTemplateApi({ ...toLayoutJson(state), templateId: resolveSaveTemplateId() });
      if (res.success) {
        dispatch({ type: "LOAD_DOC", payload: fromLayoutJson(res.data) });
        if (res.data?.templateId) setSearchParams({ templateId: res.data.templateId });
        showToast("Template saved");
        refreshTemplateList();
      } else if (res.networkError) {
        // Backend unreachable — fall back to localStorage so work isn't lost, same as
        // before the backend existed.
        const saved = saveTemplateLocal(state);
        dispatch({ type: "LOAD_DOC", payload: fromLayoutJson(saved) });
        showToast("Backend unreachable — saved locally instead");
      } else {
        showToast(res.message || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!state.meta.code || !state.meta.name) {
      showToast("Template code and name are required before publishing");
      return;
    }
    setPublishing(true);
    try {
      const saveRes = await saveTemplateApi({ ...toLayoutJson(state), templateId: resolveSaveTemplateId() });
      if (saveRes.networkError) {
        const saved = saveTemplateLocal(state);
        const published = publishTemplateLocal(saved.templateId);
        if (published) {
          dispatch({ type: "LOAD_DOC", payload: fromLayoutJson(published) });
          showToast(`Backend unreachable — published v${published.template?.version ?? state.meta.version} locally`);
        }
        return;
      }
      if (!saveRes.success) {
        showToast(saveRes.message || "Save (before publish) failed");
        return;
      }
      const templateId = saveRes.data.templateId;
      const publishRes = await publishTemplateApi(templateId);
      if (publishRes.success) {
        const docRes = await getTemplateById(templateId);
        if (docRes.success) {
          dispatch({ type: "LOAD_DOC", payload: fromLayoutJson(docRes.data) });
        } else {
          dispatch({ type: "SET_META", payload: { status: publishRes.data.status, version: publishRes.data.version } });
        }
        if (templateId) setSearchParams({ templateId });
        showToast(`Published v${publishRes.data.version}`);
        refreshTemplateList();
      } else {
        showToast(publishRes.message || "Publish failed");
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!state.templateId) return;
    if (!window.confirm(`Delete "${state.meta.name}"? This can't be undone from here.`)) return;
    setDeleting(true);
    try {
      const res = await deleteTemplateApi(state.templateId);
      if (res.success || res.networkError) {
        showToast(res.success ? "Template deleted" : "Backend unreachable — cleared locally");
        dispatch({ type: "LOAD_DOC", payload: initialState });
        setSearchParams({});
        refreshTemplateList(DEFAULT_REPORT_TYPE);
        loadNewTemplateCatalog(DEFAULT_REPORT_TYPE);
      } else {
        showToast(res.message || "Delete failed");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectTemplate = async (templateId) => {
    if (!templateId) {
      dispatch({ type: "LOAD_DOC", payload: initialState });
      setSearchParams({});
      refreshTemplateList(DEFAULT_REPORT_TYPE);
      loadNewTemplateCatalog(DEFAULT_REPORT_TYPE);
      return;
    }
    const res = await getTemplateById(templateId);
    if (res.success) {
      const doc = fromLayoutJson(res.data);
      dispatch({ type: "LOAD_DOC", payload: doc });
      setSearchParams({ templateId });
      // Switching to a template of a different report type than what's currently loaded
      // needs its own field-token set — GetFieldTokens is scoped by report type.
      if (doc.reportType !== state.reportType) {
        setFieldTokensLoading(true);
        const tokensRes = await getFieldTokens(doc.reportType);
        if (tokensRes.success && tokensRes.data) {
          setFieldTokens(tokensRes.data);
        } else {
          setFieldTokens(EMPTY_FIELD_TOKENS);
          showToast(tokensRes.message || "Could not load field tokens");
        }
        setFieldTokensLoading(false);
      }
    } else {
      showToast(res.message || "Could not load template");
    }
  };

  // Only meaningful before a template's first save (the selector is disabled once
  // state.templateId is set) — switching type re-seeds field tokens/columns for the new
  // type, same as starting a brand-new template of that type.
  const handleReportTypeChange = async (newType) => {
    dispatch({ type: "SET_REPORT_TYPE", payload: newType });
    refreshTemplateList(newType);
    await loadNewTemplateCatalog(newType);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "page":
        return (
          <PageBrandingTab
            meta={state.meta}
            settings={state.settings}
            onMetaChange={(patch) => dispatch({ type: "SET_META", payload: patch })}
            onSettingsChange={(patch) => dispatch({ type: "SET_SETTINGS", payload: patch })}
            reportType={state.reportType}
            onReportTypeChange={handleReportTypeChange}
            reportTypeLocked={!!state.templateId}
          />
        );
      case "design":
        return (
          <DesignerTab
            meta={state.meta}
            onMetaChange={(patch) => dispatch({ type: "SET_META", payload: patch })}
            elements={state.elements}
            onElementsChange={setElements}
            zoom={zoom}
            showGrid={showGrid}
            snapEnabled={snapEnabled}
            snapSize={snapSize}
            history={history}
            fieldTokens={fieldTokens}
            fieldTokensLoading={fieldTokensLoading}
            bodyColumns={state.bodyColumns}
            settlementColumns={state.settlementColumns}
            totals={state.totals}
          />
        );
      case "body":
        return (
          <BodyTableTab
            bodyColumns={state.bodyColumns}
            onBodyColumnsChange={(cols) => dispatch({ type: "SET_BODY_COLUMNS", payload: cols })}
            inclusionStyle={state.meta.inclusionStyle}
            onInclusionStyleChange={(style) => dispatch({ type: "SET_META", payload: { inclusionStyle: style } })}
            loading={columnCatalogLoading}
          />
        );
      case "settle":
        return (
          <SettlementTotalsTab
            settlementColumns={state.settlementColumns}
            onSettlementColumnsChange={(cols) => dispatch({ type: "SET_SETTLEMENT_COLUMNS", payload: cols })}
            totals={state.totals}
            onTotalsChange={(totals) => dispatch({ type: "SET_TOTALS", payload: totals })}
            showSettlement={state.meta.showSettlement}
            onShowSettlementChange={(v) => dispatch({ type: "SET_META", payload: { showSettlement: v } })}
            loading={columnCatalogLoading}
          />
        );
      default:
        return (
          <PreviewPrintTab
            meta={state.meta}
            elements={state.elements}
            bodyColumns={state.bodyColumns}
            settlementColumns={state.settlementColumns}
            totals={state.totals}
          />
        );
    }
  };

  const designerControls =
    activeTab === "design"
      ? {
          zoom,
          setZoom,
          showGrid,
          setShowGrid,
          snapEnabled,
          setSnapEnabled,
          undo: history.undo,
          redo: history.redo,
          canUndo: history.canUndo,
          canRedo: history.canRedo,
        }
      : null;

  return (
    <div className="rbn-root" ref={rootRef}>
      <TopBar
        meta={state.meta}
        templateId={state.templateId}
        templateList={templateList}
        defaultTemplateId={defaultTemplateId}
        onSelectTemplate={handleSelectTemplate}
        onMetaChange={(patch) => dispatch({ type: "SET_META", payload: patch })}
        onSave={handleSave}
        onPublish={handlePublish}
        onDelete={handleDelete}
        onViewJson={() => setJsonModalVisible(true)}
        saving={saving}
        publishing={publishing}
        deleting={deleting}
      />
      <TopTabsBar
        tabs={TABS}
        activeTab={activeTab}
        onSelect={setActiveTab}
        designerControls={designerControls}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <div className="rbn-tab-content">{renderActiveTab()}</div>
      <LayoutJsonModal visible={jsonModalVisible} setVisible={setJsonModalVisible} state={state} />
      {toast && <div className="rbn-toast">{toast}</div>}
    </div>
  );
}
