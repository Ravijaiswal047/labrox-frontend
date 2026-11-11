import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { axiosInstance } from "../axiosInstance";
import { fetchPageControls } from "../../store/reducers/pageControls/pageControlsSlice";
import { apiUrls } from "../apiUrls";

function normalizePath(p = "") {
  if (!p) return "";
  return p.replace(/\/+$/, "").toLowerCase();
}

export const usePageControls = (pathname) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pathnameNorm = normalizePath(pathname);
  const pageID = page?.PageID;

  const controls =
    useSelector((state) => state.pageControlsSlice.controlsByPage?.[pageID]) ||
    [];

  const fetchPage = useCallback(async () => {
    if (!pathname) {
      setPage(null);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get(apiUrls.MainMenuPageData);
      const pageData = Array.isArray(res?.data?.message?.pageData)
        ? res.data.message.pageData
        : [];

      let found = pageData.find((p) => {
        const url = (p?.PageUrl ?? p?.pageUrl ?? "").toString();
        return normalizePath(url) === pathnameNorm;
      });

      setPage(found ?? null);
    } catch (error) {
      console.error("usePageData fetch error:", error);
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, [pathname, pathnameNorm]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  useEffect(() => {
    if (pageID && controls.length === 0) {
      dispatch(fetchPageControls(pageID));
    }
  }, [pageID, dispatch, controls.length]);

  const isActive = useCallback(
    (inputID) => {
      const control = controls.find((c) => c.ControlDisplayID === inputID);
      return control ? !!control.IsActive : true;
    },
    [controls]
  );

  return {
    page,
    controlsLoading: loading,
    controls,
    isActive,
    refetch: fetchPage,
  };
};
