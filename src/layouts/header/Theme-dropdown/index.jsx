// import { Fragment, useEffect, useState } from "react";
// import { Dropdown } from "react-bootstrap";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPalette } from "@fortawesome/free-solid-svg-icons";
// import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
// import { axiosInstance } from "../../../utils/axiosInstance";
// import { toast } from "react-toastify";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   addWindowClass,
//   removeWindowClass,
//   setWindowClass,
// } from "@app/utils/helpers";
// import { setThemeMenuToggle } from "../../../store/reducers/loadingSlice/loadingSlice";

// const themes = [
//   { theme: "default_theme", icon: "default_icon", label: "Default" },
//   { theme: "peach_theme", icon: "peach_icon", label: "Peach" },
//   { theme: "pale_pink_theme", icon: "pale_pink_icon", label: "Pale Pink" },
//   { theme: "red_theme", icon: "red_icon", label: "Red" },
//   { theme: "sky_blue_theme", icon: "sky_blue_icon", label: "Sky Blue" },
//   { theme: "light_blue_theme", icon: "light_blue_icon", label: "Lite Blue" },
//   { theme: "pink_theme", icon: "pink_icon", label: "Pink" },
//   { theme: "purple_theme", icon: "purple_icon", label: "Purple" },
//   { theme: "gray_theme", icon: "gray_icon", label: "Gray" },
// ];

// const ThemeDropdown = () => {
//   const dispatch = useDispatch();
//   const { themeMenuToggle } = useSelector((data) => data?.loadingSlice);
//   const [activeIndex, setActiveIndex] = useState(null);
//   const [selectedValue, setSelectedValue] = useState(null);

//   const theme = useLocalStorage("theme", "get");

//   useEffect(() => {
//     addWindowClass(theme);
//   }, [theme]);

//   const themeApiCall = async (item) => {
//     try {
//       const userData = useLocalStorage("userData", "get");
//       await axiosInstance.post("CommonController/UpdateTheme", {
//         Theme: item,
//         EmployeeID: userData?.EmployeeID?.toString(),
//       });

//       setWindowClass(`hold-transition login-page ${item}`);
//       useLocalStorage("theme", "set", item);
//       addWindowClass(item);
//       if (item !== theme) removeWindowClass(theme);

//       const selectedTheme = themes.find((th) => th.theme === item);
//       setSelectedValue(selectedTheme);
//       toast.success("Theme Updated Successfully");
//       dispatch(setThemeMenuToggle(false)); // close Redux toggle
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || "Error occurred while updating theme",
//       );
//     }
//   };

//   const handleSelect = (eventKey) => {
//     themeApiCall(eventKey);
//   };

//   const handleContextClick = (event, theme, index) => {
//     event.preventDefault();
//     setActiveIndex(index);
//     setSelectedValue(theme);
//   };

//   // 🔄 Sync with Redux toggle
//   const [show, setShow] = useState(false);
//   useEffect(() => {
//     setShow(themeMenuToggle); // sync when Redux value changes
//   }, [themeMenuToggle]);

//   // Close dropdown manually
//   const handleClose = () => {
//     setShow(false);
//     dispatch(setThemeMenuToggle(false));
//   };

//   return (
//     <Dropdown
//       show={show}
//       onToggle={(isOpen) => {
//         setShow(isOpen);
//         if (!isOpen) dispatch(setThemeMenuToggle(false));
//       }}
//       onSelect={handleSelect}
//     >
//       <Dropdown.Toggle
//         id="dropdown-basic"
//         bsPrefix="custom-toggle"
//         className="p-0 mx-1 theme-class"
//         onClick={() => dispatch(setThemeMenuToggle(!themeMenuToggle))}
//       >
//         <FontAwesomeIcon icon={faPalette} />
//       </Dropdown.Toggle>

//       <Dropdown.Menu className="theme_popup_box">
//         {themes.map((themeItem, index) => (
//           <Fragment key={index}>
//             <Dropdown.Item
//               eventKey={themeItem.theme}
//               style={{ position: "relative" }}
//             >
//               <span className={themeItem.icon}></span>
//               <span
//                 className="ml-1"
//                 onContextMenu={(e) =>
//                   handleContextClick(e, themeItem.theme, index)
//                 }
//               >
//                 {themeItem.label}
//               </span>

//               {activeIndex === index && (
//                 <div className="theme-save">
//                   <button
//                     onClick={() => themeApiCall(selectedValue)}
//                     className="text-white rounded"
//                   >
//                     Save Theme
//                   </button>
//                 </div>
//               )}
//             </Dropdown.Item>
//           </Fragment>
//         ))}
//       </Dropdown.Menu>
//     </Dropdown>
//   );
// };

// export default ThemeDropdown;
import { Fragment, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { FaPalette } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { addWindowClass } from "@app/utils/helpers";
import { applyTheme } from "@app/utils/applyTheme";
import { setThemeMenuToggle } from "../../../store/reducers/loadingSlice/loadingSlice";

export const themes = [
  { theme: "default_theme", icon: "default_icon", label: "Default" },
  { theme: "peach_theme", icon: "peach_icon", label: "Peach" },
  { theme: "pale_pink_theme", icon: "pale_pink_icon", label: "Pale Pink" },
  { theme: "red_theme", icon: "red_icon", label: "Red" },
  { theme: "sky_blue_theme", icon: "sky_blue_icon", label: "Sky Blue" },
  { theme: "light_blue_theme", icon: "light_blue_icon", label: "Lite Blue" },
  { theme: "pink_theme", icon: "pink_icon", label: "Pink" },
  { theme: "purple_theme", icon: "purple_icon", label: "Purple" },
  { theme: "gray_theme", icon: "gray_icon", label: "Gray" },
  { theme: "pastel_pink_theme", icon: "pastel_pink_icon", label: "Pastel Pink" },
  { theme: "light_peach_theme", icon: "light_peach_icon", label: "Lite Peach" },
  { theme: "pale_peach_theme", icon: "pale_peach_icon", label: "Pale Peach" },
  { theme: "pale_yellow_theme", icon: "pale_yellow_icon", label: "Pale Yellow" },
  { theme: "pale_green_theme", icon: "pale_green_icon", label: "Pale Green" },
  { theme: "light_celadon_theme", icon: "light_celadon_icon", label: "Lite Celadon" },
  { theme: "pale_mint_theme", icon: "pale_mint_icon", label: "Pale Mint" },
  { theme: "pale_aqua_theme", icon: "pale_aqua_icon", label: "Pale Aqua" },
  { theme: "pale_lavender_blue_theme", icon: "pale_lavender_blue_icon", label: "Pale Lavender Blue" },
  { theme: "pale_gray_theme", icon: "pale_gray_icon", label: "Pale Gray" },
  { theme: "pale_mauve_theme", icon: "pale_mauve_icon", label: "Pale Mauve" },
  { theme: "lavender_blush_theme", icon: "lavender_blush_icon", label: "Lavender Blush" },
  { theme: "pale_rose_theme", icon: "pale_rose_icon", label: "Pale Rose" },
  { theme: "lite_pale_theme", icon: "lite_pale_icon", label: "Lite Pale Pink" },
  { theme: "blush_pink_theme", icon: "blush_pink_Icon", label: "Blush Pink" },
  { theme: "light_pink_theme", icon: "light_pink_Icon", label: "Lite Pink" },
  // new themes added 
  { theme: "bright_aqua_theme", icon: "bright_aqua_icon", label: "Bright Aqua" },
  { theme: "coral_orange_theme", icon: "coral_orange_icon", label: "Coral Orange" },
  { theme: "royal_purple_theme", icon: "royal_purple_icon", label: "Royal Purple" },
  { theme: "vivid_rose_theme", icon: "vivid_rose_icon", label: "Vivid Rose" },
  { theme: "dusty_rose_theme", icon: "dusty_rose_icon", label: "Dusty Rose" },
  { theme: "rust_blue_theme", icon: "rust_blue_icon", label: "Rust Blue" },
  // { theme: "tropical_teal_theme", icon: "tropical_teal_icon", label: "Tropical Teal" },

];

const ThemeDropdown = () => {
  const dispatch = useDispatch();
  const { themeMenuToggle, currentTheme } = useSelector(
    (data) => data?.loadingSlice
  );
  
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    addWindowClass(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    setShow(themeMenuToggle);
  }, [themeMenuToggle]);

  const themeApiCall = async (item) => {
    await applyTheme(item, currentTheme, dispatch);
    const selectedTheme = themes.find((th) => th.theme === item);
    setSelectedValue(selectedTheme);
    dispatch(setThemeMenuToggle(false));
  };

  const handleSelect = (eventKey) => {
    themeApiCall(eventKey);
  };

  const handleContextClick = (event, theme, index) => {
    event.preventDefault();
    setActiveIndex(index);
    setSelectedValue(theme);
  };

  return (
    <Dropdown
      show={show}
      onToggle={(isOpen) => {
        setShow(isOpen);
        if (!isOpen) dispatch(setThemeMenuToggle(false));
      }}
      onSelect={handleSelect}
    >
      <Dropdown.Toggle
        // id="dropdown-basic"
        bsPrefix="custom-toggle"
        className="p-0 mx-1 theme-class"
        onClick={() => dispatch(setThemeMenuToggle(!themeMenuToggle))}
      >
        <FaPalette />
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="theme_popup_box"
        popperConfig={{ strategy: "fixed" }}
      >
        {themes.map((themeItem, index) => (
          <Fragment key={index}>
            <Dropdown.Item
              eventKey={themeItem.theme}
              style={{ position: "relative" }}
            >
              <span className={themeItem.icon}></span>
              <span
                className="ml-1"
                onContextMenu={(e) =>
                  handleContextClick(e, themeItem.theme, index)
                }
              >
                {themeItem.label}
              </span>

              {activeIndex === index && (
                <div className="theme-save">
                  <button
                    onClick={() => themeApiCall(selectedValue)}
                    className="text-white rounded"
                  >
                    Save Theme
                  </button>
                </div>
              )}
            </Dropdown.Item>
          </Fragment>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ThemeDropdown;