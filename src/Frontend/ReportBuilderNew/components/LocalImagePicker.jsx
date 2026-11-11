import React, { useRef } from "react";
import { CustomButton } from "@components/UI/CustomButton";

// Phase 1 has no backend/upload endpoint yet — this just previews the picked file
// client-side (base64 data URL) so it can be stored inline in the template doc /
// localStorage. Swapping to a real CommonController/UploadDocument call later only
// touches this one component.
export default function LocalImagePicker({ value, onChange, label = "Upload image" }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="rbn-image-picker">
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {value ? (
        <div className="rbn-image-preview">
          <img src={value} alt="" />
          <div className="rbn-image-actions">
            <CustomButton text="Replace" size="sm" variant="secondary" onClick={() => inputRef.current?.click()} />
            <CustomButton text="Remove" size="sm" variant="secondary" onClick={() => onChange(null)} />
          </div>
        </div>
      ) : (
        <CustomButton text={label} size="sm" variant="secondary" onClick={() => inputRef.current?.click()} />
      )}
    </div>
  );
}
