import React, { useRef } from "react";
import { Tooltip } from "primereact/tooltip";
import { FaInfoCircle } from "react-icons/fa";

// A small "i" button that shows explanatory copy in a PrimeReact tooltip (the app's
// existing tooltip component — see Header.jsx for the same pattern) on hover, instead of a
// permanently-visible paragraph of hint text — so a page with many sections (Page &
// Branding) doesn't read as a wall of grey explainer text. Only for genuinely static,
// section-level "what does this do" copy — conditional/contextual state messages (a
// warning, a note tied to whichever radio option is currently selected) should stay as
// plain visible text, not hidden behind a hover.
//
// `text` is either one short string, or an array of strings for a longer explanation —
// each array entry renders as its own line (real <br/> breaks, not just relying on the
// tooltip wrapping wherever it happens to run out of width). `.rbn-info-tooltip` (CSS)
// caps the tooltip's width so it reads as a short paragraph, not one wide single-line bar.
//
// `target` is this instance's own button ref (not a shared class selector) so multiple
// InfoTooltip instances on the same page never bind to each other's DOM nodes.
export default function InfoTooltip({ text }) {
  const btnRef = useRef(null);
  const lines = Array.isArray(text) ? text : [text];

  return (
    <>
      <button ref={btnRef} type="button" className="rbn-info-btn" onClick={(e) => e.preventDefault()}>
        <FaInfoCircle size={12} />
      </button>
      <Tooltip target={btnRef} position="top" className="rbn-info-tooltip">
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </Tooltip>
    </>
  );
}
