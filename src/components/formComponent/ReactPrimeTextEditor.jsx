
import React, { useState, useEffect } from "react";
import { Editor } from "primereact/editor";

export default function ReactPrimeTextEditor({ value, setValue, EditTable, setEditTable }) {
    const [text, setText] = useState(value || '');

    useEffect(() => {
        if (EditTable) {
            setText(value || '');
        }
    }, [value, EditTable]);

    const handleTextChange = (e) => {
        setEditTable(false);
        const newContent = e.htmlValue;
        setText(newContent);
        setValue(newContent);
    };

    return (
        <div className="card">
            <Editor value={text} onTextChange={handleTextChange} style={{ height: '320px' }} />
        </div>
    )
}
        