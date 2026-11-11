import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";

const DesignationModal = ({ show, onHandleClose }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  
  const [allData, setAllData] = useState([]); 
  const [menus, setMenus] = useState([]); 
  const [activeMenu, setActiveMenu] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (show?.id) {
      fetchPageAccessRights(show.id);
       resetFilters();
    }
  }, [show]);

  const fetchPageAccessRights = (designationId) => {
    axiosInstance
      .post("Menu/PageAccessRightsData", { DesignationID: designationId })
      .then((res) => {
        const data = res?.data?.message || [];
        setAllData(data);
        
       
        const uniqueMenus = data
          .filter((item, index, self) => 
            index === self.findIndex(t => t.MenuID === item.MenuID)
          )
          .map(item => ({
            MenuID: item.MenuID,
            MenuName: item.MenuName
          }));
        
        setMenus(uniqueMenus);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to load data");
      });
  };

  const resetFilters = () => {
    setGlobalSearch("");
    setMenuSearch("");
    setActiveMenu(null);
  };

  
  const getFilteredData = () => {
    let filtered = [...allData];

    
    if (globalSearch) {
      filtered = filtered.filter(item =>
        item.MenuName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.PageName?.toLowerCase().includes(globalSearch.toLowerCase())
      );
    }

   
    if (activeMenu && !globalSearch) {
      filtered = filtered.filter(item => item.MenuID === activeMenu.MenuID);
    }

    if (menuSearch && activeMenu) {
      filtered = filtered.filter(item =>
        item.MenuID === activeMenu.MenuID &&
        item.PageName?.toLowerCase().includes(menuSearch.toLowerCase())
      );
    }

    return filtered;
  };

  const getMenuItems = (menuId) => {
    return allData.filter(item => item.MenuID === menuId);
  };

  const isMenuFullySelected = (menuName) => {
    const menuItems = allData.filter(item => item.MenuName === menuName);
    return menuItems.length > 0 && menuItems.every(item => item.Allow === 1);
  };

  const handleMenuToggle = (menu) => {
    if (activeMenu?.MenuID === menu.MenuID) {
      setActiveMenu(null);
      setMenuSearch("");
    } else {
      setActiveMenu(menu);
      setMenuSearch("");
    }
  };

  const handleCheckboxChange = (pageIndex, checked) => {
    const updatedData = [...allData];
    updatedData[pageIndex].Allow = checked ? 1 : 0;
    setAllData(updatedData);
  };

  const handleSelectAllForMenu = (menuName, checked) => {

    const updatedData = allData.map(item =>
      item.MenuName === menuName
        ? { ...item, Allow: checked ? 1 : 0 }
        : item
    );
    setAllData(updatedData);
  };

  const handleSubmit = () => {
    const selectedItems = allData.filter(item => item.Allow === 1);

    if (selectedItems.length === 0) {
      toast.error("Please select at least one page");
      return;
    }

    setLoading(true);
    const payload = selectedItems.map(item => ({
      ...item,
      DesignationID: show?.id,
    }));

    axiosInstance
      .post("Menu/AddPageRightsData", payload)
      .then((res) => {
        toast.success(res?.data?.message || "Rights updated successfully");
        setLoading(false);
        onHandleClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to save data");
        setLoading(false);
      });
  };

  const filteredData = getFilteredData();
  const menusToShow = globalSearch
    ? menus.filter(menu =>
        allData.some(item =>
          item.MenuID === menu.MenuID &&
          (item.MenuName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
           item.PageName?.toLowerCase().includes(globalSearch.toLowerCase()))
        )
      )
    : menus;

  return (
    <Dialog
      visible={show}
      onHide={onHandleClose}
      className={theme}
      style={{ width: isMobile ? "80vw" : "30vw" }}
      header={
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <strong>{t("Page Rights")}</strong>
            {show?.name && (
              <span className="ms-2"> – {t(show.name)}</span>
            )}
          </div>
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "200px" }}
            placeholder={t("Search...")}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
      }
    >
      <div className="row mb-2">
        {menusToShow.map((menu) => {
          const isOpen = activeMenu?.MenuID === menu.MenuID || globalSearch;
          const menuItems = filteredData.filter(item => item.MenuID === menu.MenuID);

          return (
            <div key={menu.MenuID} className="col-12 mb-2">
              <button
                className="btn btn-primary w-100"
                onClick={() => handleMenuToggle(menu)}
              >
                {t(menu.MenuName)}
                {" "}
                ({menuItems.filter(item => item.Allow === 1).length}/{menuItems.length})
              </button>

              {isOpen && menuItems.length > 0 && (
                <div className="mt-2">
                  <Tables>
                    <thead>
                      <tr>
                        <th style={{ width: "45%" }}>{t(menu.MenuName)}</th>
                        <th style={{ width: "45%" }}>
                          {!globalSearch && (
                            <Input
                              className="mt-1"
                              placeholder={t("Search pages...")}
                              value={menuSearch}
                              onChange={(e) => setMenuSearch(e.target.value)}
                            />
                          )}
                        </th>
                        <th style={{ width: "10%", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isMenuFullySelected(menu.MenuName)}
                            onChange={(e) =>
                              handleSelectAllForMenu(menu.MenuName, e.target.checked)
                            }
                            title={t("Select/Deselect All")}
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => {
                        const itemIndex = allData.findIndex(
                          d => d.MenuID === item.MenuID && d.PageName === item.PageName
                        );
                        
                        return (
                          <tr key={`${item.MenuID}-${item.PageName}`}>
                            <td colSpan={2}>{t(item.PageName)}</td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={item.Allow === 1}
                                onChange={(e) =>
                                  handleCheckboxChange(itemIndex, e.target.checked)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tables>
                </div>
              )}

              {isOpen && menuItems.length === 0 && (
                <div className="mt-2 text-center text-muted">
                  {t("No items found")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="box-footer">
        <div className="row">
          <div className="col-sm-2">
            {loading ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={handleSubmit}
              >
                {t("Save")}
              </button>
            )}
          </div>
          <div className="col-sm-2">
            <button
              className="btn btn-block btn-danger btn-sm"
              onClick={onHandleClose}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default DesignationModal;