import React, { useState, useEffect, useRef } from "react";
import { CKEditor } from "ckeditor4-react";

// Cycles the current selection through UPPERCASE / lowercase / Capitalize
// Each Word on repeated presses, same as Microsoft Word's Shift+F3. State is
// stashed on the editor instance itself (one per open report) so pressing
// the shortcut again continues the cycle instead of restarting it.
const CASE_CYCLE_PROP = "__capsCycleIndex";

const cycleSelectionCase = (editor) => {
  const CKEDITOR = window.CKEDITOR;
  if (!CKEDITOR) return;
  const selection = editor.getSelection();
  const ranges = selection && selection.getRanges();
  if (!ranges || !ranges.length) return;
  const range = ranges[0];
  const text = selection.getSelectedText();
  if (!text) return;

  const step = editor[CASE_CYCLE_PROP] || 0;
  let transformed;
  if (step === 0) {
    transformed = text.toUpperCase();
  } else if (step === 1) {
    transformed = text.toLowerCase();
  } else {
    transformed = text.replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
  }
  editor[CASE_CYCLE_PROP] = (step + 1) % 3;

  editor.fire("saveSnapshot");
  range.deleteContents();
  const textNode = new CKEDITOR.dom.text(transformed, editor.document);
  range.insertNode(textNode);
  range.selectNodeContents(textNode);
  selection.selectRanges([range]);
  editor.fire("saveSnapshot");
  editor.fire("change");
};

const setupWordLikeShortcuts = (editor) => {
  const CKEDITOR = window.CKEDITOR;
  if (!CKEDITOR) return;

  // Ctrl+U -> Underline. The basicstyles plugin normally registers this on
  // its own, but keep it explicit so the shortcut is guaranteed to work.
  editor.setKeystroke(CKEDITOR.CTRL + 85 /* U */, "underline");

  // Shift+F3 -> cycle the selected text's case, like Word.
  editor.on("key", (evt) => {
    if (evt.data.keyCode === CKEDITOR.SHIFT + 114 /* F3 */) {
      evt.cancel();
      cycleSelectionCase(editor);
    }
  });
};

// Pasted content (from Word, browsers, etc.) wraps every line in its own
// <p>/<div> carrying that source's margin/padding, which shows up as a
// visible gap between lines that were only a single Enter apart originally.
// Strip that spacing on the way in so pasted lines sit as close together as
// lines typed directly in the editor.
const setupPasteSpacingFix = (editor) => {
  editor.on("paste", (evt) => {
    let html = evt.data.dataValue;
    if (!html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const tables = doc.querySelectorAll("table");
    tables.forEach((table) => {
      const rawStyle = table.getAttribute("style") || "";
      const rawAttrs = table.outerHTML;

      // 1. Check if this is a side/floating table (like "Extended Biometry")
      const isFloatingOrRight =
        /align\s*=\s*["']?right["']?/i.test(rawAttrs) ||
        /mso-element:\s*frame/i.test(rawStyle) ||
        /float\s*:\s*right/i.test(rawStyle);

      table.style.border = "4px double #000";
      table.style.borderCollapse = "collapse";
      table.style.boxSizing = "border-box";

      if (isFloatingOrRight) {
        // Keep it floated to the right so the bulleted text flows on its left
        table.style.float = "right";
        table.style.clear = "none";
        table.style.marginLeft = "16px";
        table.style.marginBottom = "10px";
        // Do NOT force 100% width on side tables; preserve Word's compact width
        if (!table.style.width) {
          table.style.width = "35%";
        }
      } else {
        // Only full-width tables (like the top Obstetric USG table) expand to 100%
        table.style.width = "100%";
      }

      // 2. Format Header Rows and Cells
      const rows = table.querySelectorAll("tr");
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll("td, th");

        if (rowIndex === 0) {
          cells.forEach((cell, idx) => {
            cell.style.backgroundColor = "#e0e0e0";
            cell.style.fontWeight = "bold";
            cell.style.textAlign = "center";
            cell.style.borderBottom = "2px solid #000";

            // If it's a 2-column header (Survey & Data), draw divider between them
            if (cells.length === 2) {
              if (idx === 0) cell.style.borderRight = "3px double #000";
              if (idx === 1) cell.style.borderLeft = "3px double #000";
            }
          });
        } else {
          cells.forEach((cell) => {
            if (cell.cellIndex === 1 && cells.length > 2) {
              cell.style.borderRight = "3px double #000";
            } else if (cell.cellIndex === 2 && cells.length > 2) {
              cell.style.borderLeft = "3px double #000";
            }
          });
        }
      });
    });

    // 3. Normalize paragraph line heights and margins
    const blocks = doc.querySelectorAll("p, div");
    blocks.forEach((el) => {
      el.style.margin = "0";
      el.style.padding = "0";
    });

    evt.data.dataValue = doc.body.innerHTML;
  });
};
const FullTextEditor = ({
  value,
  setValue,
  EditTable,
  setEditTable,
  editorHeight = 150,
  autoResize = false,
  isCollapsed = true,
  isDefaultCollapsed = false,
  buildingBlocks = [],
}) => {
  const [editor, setEditor] = useState(null);
  const [timer, setTimer] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const isReadyRef = useRef(false);
  const retryCountRef = useRef(0);

  const onBeforeLoad = (e) => {
    try {
      if (e?.editor) {
        setEditor(e.editor);
      }
    } catch (error) {
      console.error("Editor load error:", error);
    }
  };

  // ckeditor4-react occasionally fails to initialize (e.g. its CKEditor
  // script/plugin load races with fast navigation) and never calls
  // onInstanceReady, leaving the editor blank with no visible error. If that
  // happens, force a clean remount by bumping the CKEditor element's key.
  useEffect(() => {
    isReadyRef.current = false;
    const watchdog = setTimeout(() => {
      if (!isReadyRef.current && retryCountRef.current < 2) {
        retryCountRef.current += 1;
        setEditor(null);
        setRetryKey((k) => k + 1);
      }
    }, 4000);
    return () => clearTimeout(watchdog);
  }, [retryKey]);

  useEffect(() => {
    if (editor && editor.status === "ready") {
      const currentData = editor.getData();
      if (currentData !== (value || "")) {
        editor.setData(value || "");
      }
    }
  }, [value, editor]);

  const onInstanceReady = (evt) => {
    isReadyRef.current = true;
    retryCountRef.current = 0;
    const readyEditor = evt.editor;
    setEditor(readyEditor);
    readyEditor.setData(value || "");
    setupWordLikeShortcuts(readyEditor);
    setupPasteSpacingFix(readyEditor);
  };

  const handleShortKeyReplacement = (currentEditor) => {
    if (buildingBlocks && buildingBlocks.length > 0 && currentEditor.focusManager.hasFocus) {
      let content = currentEditor.getData();
      let modified = false;

      buildingBlocks.forEach((block) => {
        // Handle both ShortKey and shortKey to be safe
        const key = block.ShortKey || block.shortKey;
        const description = block.Description || block.description;

        if (!key || !description) return;

        const escapedKey = key.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        // Regex to match @shortKey followed by a space or space-like character (capturing the space)
        const regex = new RegExp(
          `(^|\\s|&nbsp;|>)(@${escapedKey})(\\s|&nbsp;)`,
          "gi"
        );

        if (regex.test(content)) {
          const newText = content.replace(regex, (match, p1, p2, p3) => {
            modified = true;
            return `${p1}${description}${p3}<span id="cke-cursor-marker"></span>`;
          });
          content = newText;
        }
      });

      if (modified) {
        console.log("Auto-filled short key. New content:", content);
        
        currentEditor.setData(content, {
            callback: () => {
                const document = currentEditor.document;
                const marker = document.getById('cke-cursor-marker');
                if (marker) {
                    const range = currentEditor.createRange();
                    range.setStartAfter(marker);
                    range.collapse(true);
                    marker.remove();
                    range.select();
                } else {
                    // Fallback to end of content if marker is missing for some reason
                    const range = currentEditor.createRange();
                    range.moveToElementEditEnd(currentEditor.editable());
                    range.select();
                }
            }
        });
        setValue(content);
      }
    }
  };

  const onChange = (evt) => {
    if (evt?.editor?.focusManager?.hasFocus) {
      setEditTable(false);
    }
    const newContent = evt?.editor?.getData();
    setValue(newContent);

    // Auto-grow: expand if content overflows the visible area
    try {
      const editable = evt?.editor?.editable().$;
      if (editable) {
        const overflow = editable.scrollHeight - editable.clientHeight;
        if (overflow > 0) {
          const totalHeight = evt.editor.container.$.offsetHeight;
          evt.editor.resize("100%", totalHeight + overflow + 10);
        }
      }
    } catch (_) {}

    // Auto-fill logic with debounce
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      handleShortKeyReplacement(evt.editor);
    }, 1000);
    setTimer(newTimer);
  };

 const editorConfig = {
  customConfig: "",
  // Completely disable CKEditor's built-in tag/style stripping
  allowedContent: true,
  disallowedContent: "",
  pasteFilter: null,
  pasteFromWordRemoveFontStyles: false,
  pasteFromWordRemoveStyles: false,
  pasteFromWord_inlineImages: true,
  // Add CSS rules to make Word borders render reliably
  extraCss: `
    table { 
      border-collapse: collapse !important; 
      box-sizing: border-box !important;
    }
    td, th { 
      box-sizing: border-box !important; 
      vertical-align: top;
    }
  `,
  extraPlugins:
    "basicstyles,image2,widget,clipboard,lineutils,dialog,dialogui,scayt,notification,toolbar,justify,colorbutton,find,templates,colordialog,newpage,save,print,preview,pastefromword,pagebreak,font,stylescombo,uploadimage",
  removePlugins: "forms,embed,autoembed,image",
  toolbar: [
    {
      name: "document",
      items: ["Source", "Save", "NewPage", "Preview", "Print", "Templates"],
    },
    {
      name: "clipboard",
      items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "Undo", "Redo"],
    },
    { name: "editing", items: ["Find", "Replace", "SelectAll", "Scayt"] },
    "/",
    {
      name: "basicstyles",
      items: ["Bold", "Italic", "Underline"],
    },
    {
      name: "paragraph",
      items: [
        "NumberedList",
        "BulletedList",
        "Outdent",
        "Indent",
        "Blockquote",
        "CreateDiv",
        "JustifyLeft",
        "JustifyCenter",
        "JustifyRight",
        "JustifyBlock",
        "BidiLtr",
        "BidiRtl",
        "Language",
      ],
    },
    { name: "links", items: ["Link", "Unlink", "Anchor"] },
    { name: "colors", items: ["TextColor", "BGColor"] },
    {
      name: "insert",
      items: [
        "Image",
        "Table",
        "HorizontalRule",
        "Smiley",
        "SpecialChar",
        "PageBreak",
        "Iframe",
      ],
    },
    "/",
    { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
    { name: "tools", items: ["Maximize", "ShowBlocks"] },
    { name: "others", items: ["-"] },
  ],
  pasteFilter: null,
  pasteFromWordRemoveStyles: false,
  pasteFromWordRemoveFontStyles: false,
  allowedContent: true,
  extraCss: `
    table { border-collapse: collapse !important; }
    table, td, th { box-sizing: border-box; }
  `,
  colorButton_colors:
    "000,800000,8B0000,FF0000,FFA500,FFD700,008000,00FF00,000080,0000FF,800080,FF00FF",
  colorButton_enableMore: true,
  colorButton_backColors:
    "FFFFCC,FFCC99,FF9999,99CCFF,CCFFFF,CCFFCC,FFFF99,CC99FF",
  height: editorHeight,
  enterMode: 2,
  toolbarCanCollapse: isDefaultCollapsed,
  toolbarStartupExpanded: isCollapsed,
  resize_enabled: false,
};


  // const editorConfig = {
  //   extraPlugins: "basicstyles,clipboard,lineutils,dialog,dialogui,notification,toolbar,resize,justify,colorbutton,find,colordialog,newpage,save,print,preview,pastefromword,pagebreak,font,stylescombo",
  //   removePlugins: "forms,image,embed,autoembed,scayt,templates,uploadimage,widget", // Remove ALL conflicting plugins
  //   toolbar: [
  //     {
  //       name: "document",
  //       items: ["Source", "Save", "NewPage", "Preview", "Print"],
  //     },
  //     {
  //       name: "clipboard",
  //       items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "Undo", "Redo"],
  //     },
  //     { name: "editing", items: ["Find", "Replace", "SelectAll"] },
  //     "/",
  //     {
  //       name: "basicstyles",
  //       items: ["Bold", "Italic", "Underline"],
  //     },
  //     {
  //       name: "paragraph",
  //       items: ["NumberedList", "BulletedList", "Outdent", "Indent", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock"],
  //     },
  //     { name: "links", items: ["Link", "Unlink"] },
  //     { name: "colors", items: ["TextColor", "BGColor"] },
  //     {
  //       name: "insert",
  //       items: ["Table", "HorizontalRule", "SpecialChar"],
  //     },
  //     "/",
  //     { name: "styles", items: ["Format", "Font", "FontSize"] },
  //     { name: "tools", items: ["Maximize"] },
  //   ],
  //   colorButton_colors: "000,800000,8B0000,FF0000,FFA500,FFD700,008000,00FF00,000080,0000FF,800080,FF00FF",
  //   colorButton_enableMore: true,
  //   height: 250,
  //   enterMode: 2,
  // };

  const handleDragMouseDown = (e) => {
    if (!editor) return;
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = editor.container.$.offsetHeight;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current || !editor) return;
      const delta = e.clientY - dragStartY.current;
      const newHeight = Math.max(150, dragStartHeight.current + delta);
      editor.resize("100%", newHeight);
    };
    const onMouseUp = () => { isDragging.current = false; };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [editor]);

  return (
    <div>
      <CKEditor
        key={retryKey}
        initData={value || ""}
        onChange={onChange}
        onInstanceReady={onInstanceReady}
        config={editorConfig}
      />
      <div
        onMouseDown={handleDragMouseDown}
        style={{
          width: "100%",
          height: 8,
          background: "#dee2e6",
          cursor: "ns-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
        }}
      >
        <div style={{ width: 40, height: 3, background: "#aaa", borderRadius: 2 }} />
      </div>
    </div>
  );
};

export default FullTextEditor;