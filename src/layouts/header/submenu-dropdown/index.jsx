import { useEffect, useState } from "react";
import ReactSelectHead from "../../../components/formComponent/ReactSelectHead";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { useDispatch, useSelector } from "react-redux";
import { setSubmenu } from "../../../store/reducers/submenuSlice";
import { resetSidebarMenu } from "../../../store/reducers/ui";

const SubmenuDropdown = () => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const dispatch = useDispatch();
  const submenu = useSelector((state) => state.submenuSlice.type);

  const [isInitialized, setIsInitialized] = useState(false);

  const subMenuOptions = [
    // { label: "Default", value: "default" },
    { label: "Horizontal", value: "horizontal" },
    { label: "Vertical", value: "vertical" },
  ];

  useEffect(() => {
    const stored = useLocalStorage("submenu", "get");
    const initial = stored || "default";

    setSelectedMenu(initial);
    dispatch(setSubmenu(initial));

    if (!stored) {
      useLocalStorage("submenu", "set", initial);
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || !submenu) return;

    useLocalStorage("submenu", "set", selectedMenu);
    dispatch(setSubmenu(selectedMenu));
  }, [selectedMenu, dispatch]);

  const selectedOption =
    subMenuOptions.find((o) => o.value === submenu) ?? subMenuOptions[0];

  const handleChange = (e) => {
    // dispatch(resetSidebarMenu());
    setSelectedMenu(e.value);
  };

  if (!submenu) return null;

  return (
    <div type="button" className="" style={{ width: "100%" }}>
      <ReactSelectHead
        placeholderName="Select type"
        dynamicOptions={subMenuOptions}
        searchable={true}
        respclass="col-12 roll-off"
        value={selectedOption.value}
        handleChange={handleChange}
      />
    </div>
  );
};

export default SubmenuDropdown;
