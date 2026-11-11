import React from "react";

// A plain, always-visible section: a small caption label, its content, and a divider
// below (via CSS on `.rbn-section` except the last one). Not collapsible, not boxed —
// just a category separator. Replaces an earlier collapsible/boxed "accordion" look
// that was cluttered and, on the shared house Accordion, rendered blank headers anyway.
export default function RbnSection({ title, children, last = false }) {
  return (
    <div className={`rbn-section ${last ? "rbn-section-last" : ""}`}>
      {title && <div className="rbn-section-title">{title}</div>}
      <div className="rbn-section-body">{children}</div>
    </div>
  );
}
