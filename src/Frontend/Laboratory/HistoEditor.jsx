import React, { useEffect, useRef } from "react";
import { CKEditor } from "ckeditor4-react";

const HistoEditor = ({ id, name, value, setValue, height = 150 }) => {
  const editorRef = useRef(null);
  const valueRef = useRef(value);

  const onChange = (evt) => {
    const newContent = evt.editor.getData();
    if (newContent !== valueRef.current) {
      setValue(name, newContent);
    }
  };

  useEffect(() => {
    valueRef.current = value;
    if (editorRef.current) {
      const current = editorRef.current.getData();
      if (current !== (value || "")) {
        editorRef.current.setData(value || "");
      }
    }
  }, [value]);

  const editorConfig = {
    extraPlugins: "basicstyles,justify,toolbar",
    disableNativeSpellChecker: false,
    height: height,
    toolbar: [
      {
        name: "basicstyles",
        items: ["Source", "Save", "NewPage", "Preview", "Print", "Templates"],
      },
      {
        name: "paragraph",
        items: [
          "JustifyLeft",
          "JustifyCenter",
          "JustifyRight",
          "JustifyBlock",
          "NumberedList",
          "BulletedList",
          "Language",
        ],
      },
      { name: "styles", items: ["FontSize"] },
    ],
    removePlugins: "contextmenu,tabletools,tableselection",
    autoGrow_onStartup: false,
    resize_enabled: true,
    resize_dir: "vertical",
    resize_minHeight: height,
  };

  return (
    <div id={id || "histo-editor-container"}>
      <CKEditor
        data={value}
        onChange={onChange}
        onInstanceReady={(evt) => {
          editorRef.current = evt.editor;
          evt.editor.setData(valueRef.current || "");
          evt.editor.editable().$.setAttribute("spellcheck", "true");
        }}
        config={editorConfig}
      />
    </div>
  );
};

export default HistoEditor;
