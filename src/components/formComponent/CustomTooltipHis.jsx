import { Tooltip } from "primereact/tooltip";
import React from "react";
import { useTranslation } from "react-i18next";

export default function CustomTooltipHis({id,content,icon=""}) {
    const [t]=useTranslation();
  return (
    <>
      <Tooltip
        target={`#${id}`}
        position="top"
        content={t(`${content}`)}
        event="hover"
        className="ToolTipCustom"
      />
     {icon}
    </>
  );
}
