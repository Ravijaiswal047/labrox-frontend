import React from "react";

// Renders whatever the "Letterhead" section in Page & Branding is configured to — this
// was previously captured in `meta.staticHtml`/`meta.letterheadType`/`meta.letterheadImageSize`
// but never actually displayed anywhere on the page. Shared by the Designer canvas and
// Preview & Print so both show the same thing, at the top of the page, full width.
export default function LetterheadPreview({ meta, pageW }) {
  if (meta.letterheadType === "none") {
    // Nothing to render at all — the page is left entirely to the template's own
    // elements[] (Image/HTML/label/... placed directly on the canvas).
    return null;
  }

  if (meta.letterheadType === "image_centrewise") {
    // Per-centre header images live in Centre Master (pageName "attachmentHeader"), keyed
    // by that centre's own CentreIDHash — not something this designer resolves itself, so
    // there's nothing concrete to preview here beyond a placeholder note.
    return (
      <div className="rbn-letterhead-block rbn-letterhead-placeholder" style={{ width: pageW }}>
        Centre-wise header image — set per centre in Centre Master, not previewable here.
      </div>
    );
  }

  if (meta.letterheadType === "image_static") {
    // Not an upload managed by this module at all — the actual image lives in an existing
    // backend table/setting (company-wide, not per-centre), resolved entirely server-side
    // at real print/PDF time. All the Designer configures is the position/size it should
    // render at (meta.letterheadImageSize) — there's genuinely no image to fetch/preview
    // here, so this always shows a size-accurate placeholder box, never a real thumbnail.
    // Self-positioned (not pinned to the page's own 0,0 like the other letterhead types)
    // to match the Designer canvas's own draggable/resizable skeleton exactly
    // (LetterheadImageSkeleton.jsx) — same x/y/width/height, same field, same result.
    const x = Number(meta.letterheadImageSize?.x) || 0;
    const y = Number(meta.letterheadImageSize?.y) || 0;
    const w = Number(meta.letterheadImageSize?.width) || 300;
    const h = Number(meta.letterheadImageSize?.height) || 80;
    return (
      <div
        className="rbn-letterhead-block rbn-letterhead-placeholder"
        style={{ position: "absolute", left: x, top: y, width: w, height: h }}
      >
        Static header image (provided by the backend) — {w}×{h}px, not previewable here.
      </div>
    );
  }

  // html_static / html_centrewise — per-centre HTML override isn't built yet, staticHtml
  // is the single default for both, same as everywhere else this is documented.
  return (
    <div
      className="rbn-letterhead-block"
      style={{ width: pageW }}
      dangerouslySetInnerHTML={{ __html: meta.staticHtml || "" }}
    />
  );
}
