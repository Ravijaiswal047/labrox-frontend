import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const TOOLBAR = [
  [{ header: [false, 2, 3] }],
  ["bold", "italic", "underline"],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"],
];

// The toolbar's "image" button (Quill's default behavior, no custom upload handler wired
// up) reads the picked file and inserts it as a base64 data: URI directly into the HTML —
// nothing to upload/host, and it's exactly the self-contained form a PDF-rendering
// pipeline wants (no external image URL to fetch at render time). Good enough for "one
// image, roughly here" edits.
//
// It can't do an arbitrary layout, though — side-by-side image+text, multiple images
// positioned independently, etc. only exist within the actual HTML markup, which the
// Quill WYSIWYG view doesn't expose. The "HTML source" toggle below switches to a plain
// textarea over the exact same `value`, so a multi-image/flex/table layout — including
// hand-authored `<img src="data:...">` tags, same as any image the toolbar button would
// have produced — can be pasted or written directly.
export default function RbnHtmlEditor({ value, onChange }) {
  const [sourceMode, setSourceMode] = useState(false);

  return (
    <div className="rbn-html-editor">
      <div className="rbn-html-editor-toggle">
        <button type="button" className={`rbn-source-toggle-btn ${!sourceMode ? "active" : ""}`} onClick={() => setSourceMode(false)}>
          Rich text
        </button>
        <button type="button" className={`rbn-source-toggle-btn ${sourceMode ? "active" : ""}`} onClick={() => setSourceMode(true)}>
          HTML source
        </button>
      </div>
      {sourceMode ? (
        <textarea
          className="rbn-html-editor-source"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<div>...</div> — write or paste raw HTML, including <img src='data:image/...;base64,...'> for a self-contained (no external URL) image."
        />
      ) : (
        <ReactQuill theme="snow" modules={{ toolbar: TOOLBAR }} value={value || ""} onChange={onChange} />
      )}
    </div>
  );
}
