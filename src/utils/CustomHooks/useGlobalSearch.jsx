import { useState, useMemo } from "react";

const useGlobalSearch = (data = [], searchableKeys = []) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const lowerValue = searchTerm.toLowerCase();

    return data.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(lowerValue)
      )
    );
  }, [data, searchTerm, searchableKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
};

export default useGlobalSearch;