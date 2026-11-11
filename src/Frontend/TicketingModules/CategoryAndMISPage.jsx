import React from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import CategoryMaster from "./components/CategoryMaster";
import MISReport from "./components/MISReport";
import "./ticketing.css";

const CategoryAndMISPage = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");

  return (
    <div className={theme}>
      <CategoryMaster />
      <MISReport />
    </div>
  );
};

export default CategoryAndMISPage;
