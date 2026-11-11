import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setNgFontFamily } from "@store/reducers/loadingSlice/loadingSlice";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { NG_FONT_FAMILIES } from "@app/utils/ngFontFamilies";
import { updateFontAndTheme } from "@app/utils/updateFontAndTheme";
import NextGenSelect from "./NextGenSelect";

const optionLabel = (option) => (
  <span style={{ fontFamily: option.value }}>{option.label}</span>
);

export default function NgFontFamilySelect() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { ngFontFamily, uiMode } = useSelector((state) => state?.loadingSlice);

  const handleChange = (_, option) => {
    if (!option?.value) return;
    useLocalStorage("ngFontFamily", "set", option.value);
    dispatch(setNgFontFamily(option.value));
    updateFontAndTheme({ theme: uiMode, fontFamily: option.label || "" });
  };

  return (
    <NextGenSelect
      id="ng-fontfamily-select"
      name="fontFamily"
      placeholderName={t("Select Font")}
      dynamicOptions={NG_FONT_FAMILIES}
      value={ngFontFamily}
      removeIsClearable
      formatOptionLabel={optionLabel}
      onChange={handleChange}
    />
  );
}
