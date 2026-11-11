// import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import ReactDOM from "react-dom";
// import { useDebounce } from "./useDebounce";
// import "./UltraFastSelect.css";

// const ITEM_HEIGHT = 30;
// const VISIBLE_COUNT = 25;

// // ✅ Move outside component — stable reference, never recreated
// const emptyArray = [];

// const UltraFastSelect = ({
//     options = emptyArray,  // ✅ stable default — avoids [] creating new ref each render
//     value,
//     onChange,
//     label,
//     placeholder = "",
//     searchable = true,
//     autoFocus = false,
//     tabIndex = 0,
//     isDisabled = false,
//     isClearable = true,
//     openMenuOnFocus = false,
//     id,
//     name,
//     className = "",
//     onKeyDown,
// }) => {
//     const wrapperRef = useRef(null);
//     const listRef = useRef(null);
//     const inputRef = useRef(null);
//     const isMouseClick = useRef(false);
//     const [open, setOpen] = useState(false);
//     const [search, setSearch] = useState("");
//     const [scrollTop, setScrollTop] = useState(0);
//     const [highlightedIndex, setHighlightedIndex] = useState(0);
//     const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 0 });

//     // ✅ Debounce search for filtering — was imported but never used for filtering
//     const debouncedSearch = useDebounce(search, 150);  // 150ms feels snappier than 300ms

//     // ✅ Memoize value as string once — avoids repeated String() calls in loops
//     const stringValue = useMemo(() => (value === null || value === undefined || value === "" ? null : String(value)), [value]);

//     // ✅ selected: O(1) lookup via Map instead of O(n) find — critical for large lists
//     const optionsMap = useMemo(() => {
//         const map = new Map();
//         const safeOptions = Array.isArray(options) ? options : emptyArray;
//         for (let i = 0; i < safeOptions.length; i++) {
//             map.set(String(safeOptions[i].value), safeOptions[i]);
//         }
//         return map;
//     }, [options]);

//     const selected = useMemo(() => {
//         if (!stringValue) return null;
//         return optionsMap.get(stringValue) || null;
//     }, [optionsMap, stringValue]);

//     // ✅ filtered: uses debouncedSearch instead of live search — stops re-filtering on every keystroke
//     const filtered = useMemo(() => {
//         const safeOptions = Array.isArray(options) ? options : emptyArray;
//         if (!searchable || !debouncedSearch) return safeOptions;
//         const s = debouncedSearch.toLowerCase().trim();
//         if (!s) return safeOptions;
//         const result = [];
//         for (let i = 0; i < safeOptions.length; i++) {
//             if (safeOptions[i]?.label?.toLowerCase().includes(s)) result.push(safeOptions[i]);
//         }
//         return result;
//     }, [options, debouncedSearch, searchable]);

//     const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT));
//     const endIndex = Math.min(startIndex + VISIBLE_COUNT, filtered.length);
//     const visibleItems = filtered.slice(startIndex, endIndex);

//     // ✅ formatSentence: useCallback — stable reference, not recreated every render
//     const formatSentence = useCallback((label = "") => {
//         if (!label.includes("~")) return label;
//         const [before, after] = label.split("~");
//         if (!after || !after.trim()) return label;
//         const formattedAfter = after
//             .trim()
//             .toLowerCase()
//             .replace(/\b\w/g, (c) => c.toUpperCase());
//         return `${before}~ ${formattedAfter}`;
//     }, []);

//     // ✅ handleClear: useCallback — stable ref, not recreated
//     const handleClear = useCallback((e) => {
//         e.stopPropagation();
//         if (onChange && typeof onChange === "function") onChange(name, null);
//         setOpen(false);
//         setSearch("");
//         setScrollTop(0);
//         setHighlightedIndex(0);
//     }, [onChange, name]);

//     // ✅ handleSelectOption: useCallback — stable ref
//     const handleSelectOption = useCallback((opt) => {
//         if (!opt || typeof onChange !== "function") return;
//         try {
//             onChange(name, opt);
//             setOpen(false);
//             setSearch("");
//             setScrollTop(0);
//             setHighlightedIndex(0);
//         } catch (error) {
//             console.error("Error selecting option:", error);
//         }
//     }, [onChange, name]);

//     useEffect(() => {
//         if (autoFocus && !isDisabled && open && inputRef.current) {
//             setTimeout(() => inputRef.current?.focus(), 0);
//         }
//     }, [autoFocus, isDisabled, open]);

//     useEffect(() => {
//         if (!openMenuOnFocus || isDisabled) return;
//         const handleFocus = () => setOpen((prev) => !prev);
//         const controlElement = wrapperRef.current?.querySelector('.ufs-control');
//         if (controlElement) {
//             controlElement.addEventListener('focus', handleFocus);
//             return () => controlElement.removeEventListener('focus', handleFocus);
//         }
//     }, [openMenuOnFocus, isDisabled]);  // ✅ removed `open` from deps — was causing effect to re-run on every open/close

//     useEffect(() => {
//         const h = (e) => {
//             if (!wrapperRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) {
//                 setOpen(false);
//                 setSearch("");
//                 setScrollTop(0);
//             }
//         };
//         document.addEventListener("mousedown", h);
//         return () => document.removeEventListener("mousedown", h);
//     }, []);

//     useEffect(() => {
//         if (open && listRef.current) {
//             const selectedIndex = filtered.findIndex((o) => String(o.value) === stringValue);
//             const highlightIndex = selectedIndex !== -1 ? selectedIndex : 0;
//             setHighlightedIndex(highlightIndex);
//             const scrollPos = highlightIndex * ITEM_HEIGHT;
//             listRef.current.scrollTop = scrollPos;
//             setScrollTop(scrollPos);
//         }
//     }, [open]);  // ✅ only run when `open` changes — not on every filtered/value change

//     useEffect(() => {
//         if (!open) return;
//         const updatePosition = () => {
//             if (wrapperRef.current) {
//                 const rect = wrapperRef.current.getBoundingClientRect();
//                 setMenuRect({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
//             }
//         };
//         updatePosition();
//         window.addEventListener("scroll", updatePosition, true);
//         window.addEventListener("resize", updatePosition);
//         return () => {
//             window.removeEventListener("scroll", updatePosition, true);
//             window.removeEventListener("resize", updatePosition);
//         };
//     }, [open]);

//     useEffect(() => {
//         setHighlightedIndex(0);
//         setScrollTop(0);
//     }, [debouncedSearch]);  // ✅ reset on debounced search, not live search

//     useEffect(() => {
//         const handleKeyDown = (e) => {
//             if (onKeyDown && typeof onKeyDown === "function") {
//                 onKeyDown(e);
//                 if (e.defaultPrevented) return;
//             }
//             if (e.key !== "Tab" && e.key !== "Escape") e.stopPropagation();

//             if (e.key === "Backspace" && open && searchable && inputRef.current) {
//                 const input = inputRef.current;
//                 if (input.selectionStart === 0 && input.selectionEnd === 0 && !search) {
//                     e.preventDefault();
//                     return;
//                 }
//             }

//             if (e.key === "Tab") {
//                 if (open) {
//                     if (filtered.length > 0 && filtered[highlightedIndex]) handleSelectOption(filtered[highlightedIndex]);
//                     setOpen(false);
//                     setSearch("");
//                     setScrollTop(0);
//                 }
//                 return;
//             }

//             if (!open) {
//                 if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
//                     e.preventDefault();
//                     setOpen(true);
//                 }
//                 return;
//             }

//             switch (e.key) {
//                 case "ArrowDown":
//                     e.preventDefault();
//                     setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
//                     break;
//                 case "ArrowUp":
//                     e.preventDefault();
//                     setHighlightedIndex((prev) => Math.max(prev - 1, 0));
//                     break;
//                 case "Enter":
//                     e.preventDefault();
//                     if (filtered.length > 0 && filtered[highlightedIndex]) handleSelectOption(filtered[highlightedIndex]);
//                     break;
//                 case "Escape":
//                     e.preventDefault();
//                     setOpen(false);
//                     setSearch("");
//                     setScrollTop(0);
//                     setHighlightedIndex(0);
//                     break;
//                 default:
//                     break;
//             }
//         };

//         const inputElement = inputRef.current;
//         const controlElement = wrapperRef.current?.querySelector('.ufs-control, input');
//         if (open && inputElement) {
//             inputElement.addEventListener("keydown", handleKeyDown);
//             return () => inputElement.removeEventListener("keydown", handleKeyDown);
//         } else if (!open && controlElement) {
//             controlElement.addEventListener("keydown", handleKeyDown);
//             return () => controlElement.removeEventListener("keydown", handleKeyDown);
//         }
//     }, [open, highlightedIndex, filtered, isDisabled, onKeyDown, search, searchable, handleSelectOption]);

//     useEffect(() => {
//         if (open && listRef.current) {
//             const highlightedScrollTop = highlightedIndex * ITEM_HEIGHT;
//             const listHeight = listRef.current.clientHeight;
//             if (highlightedScrollTop < scrollTop) {
//                 listRef.current.scrollTop = highlightedScrollTop;
//                 setScrollTop(highlightedScrollTop);
//             } else if (highlightedScrollTop + ITEM_HEIGHT > scrollTop + listHeight) {
//                 const newScroll = highlightedScrollTop + ITEM_HEIGHT - listHeight;
//                 listRef.current.scrollTop = newScroll;
//                 setScrollTop(newScroll);
//             }
//         }
//     }, [highlightedIndex, open, scrollTop]);

//     return (
//         <div
//             className={`ufs-wrapper ${isDisabled ? "disabled" : ""} ${className}`}
//             ref={wrapperRef}
//             id={id}
//             onBlur={(e) => {
//                 if (!wrapperRef.current?.contains(e.relatedTarget) && !listRef.current?.contains(e.relatedTarget)) {
//                     setOpen(false);
//                     setSearch("");
//                     setScrollTop(0);
//                 }
//             }}
//         >
//             <div
//                 className="ufs-control"
//                 onClick={() => {
//                     if (isDisabled) return;
//                     setOpen(true);
//                     requestAnimationFrame(() => inputRef.current?.focus());
//                 }}
//                 tabIndex={isDisabled ? -1 : tabIndex}
//                 role="combobox"
//                 aria-expanded={open}
//                 aria-haspopup="listbox"
//                 aria-disabled={isDisabled}
//                 onMouseDown={() => {
//                     isMouseClick.current = true;
//                     setTimeout(() => { isMouseClick.current = false; }, 200);
//                 }}
//                 onFocus={() => {
//                     if (isDisabled) return;
//                     setOpen(true);
//                     setSearch(selected?.label || "");
//                     requestAnimationFrame(() => {
//                         const input = inputRef.current;
//                         if (input) { input.focus(); input.select(); }
//                     });
//                 }}
//             >
//                 {label && (
//                     <label className={`ufs-label ${open || selected ? "float" : ""}`}>{label}</label>
//                 )}

//                 {open && searchable ? (
//                     <input
//                         type="text"
//                         inputMode="text"
//                         ref={inputRef}
//                         className="ufs-input"
//                         value={search}
//                         onChange={(e) => {
//                             let val = e.target.value;
//                             if (selected && val === selected.label) val = "";
//                             setSearch(val);
//                             setScrollTop(0);
//                         }}
//                         placeholder={placeholder}
//                         autoFocus
//                         disabled={isDisabled}
//                         aria-label={label || placeholder}
//                         autoComplete="off"
//                     />
//                 ) : (
//                     <span title={selected?.label || ""} className={`ufs-value ${!selected ? "placeholder" : ""}`}>
//                         {selected?.label || placeholder}
//                     </span>
//                 )}

//                 {isClearable && selected && !isDisabled && (
//                     <button
//                         className="ufs-clear-btn"
//                         onClick={handleClear}
//                         aria-label="Clear selection"
//                         type="button"
//                         tabIndex={-1}
//                     >
//                         <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                             <line x1="18" y1="6" x2="6" y2="18"></line>
//                             <line x1="6" y1="6" x2="18" y2="18"></line>
//                         </svg>
//                     </button>
//                 )}
//             </div>

//             {open && !isDisabled && ReactDOM.createPortal(
//                 <div
//                     className="ufs-menu"
//                     ref={listRef}
//                     onScroll={(e) => setScrollTop(e.target.scrollTop)}
//                     role="listbox"
//                     style={{ position: "absolute", top: menuRect.top, left: menuRect.left, width: menuRect.width, zIndex: 99999 }}
//                 >
//                     {filtered.length === 0 ? (
//                         <div className="ufs-empty">No options available</div>
//                     ) : (
//                         <div style={{ height: filtered.length * ITEM_HEIGHT, position: "relative", width: "100%" }}>
//                             <div style={{ position: "absolute", top: startIndex * ITEM_HEIGHT, left: 0, right: 0, width: "100%", zIndex: 9999 }}>
//                                 {visibleItems.map((opt, index) => {
//                                     const actualIndex = startIndex + index;
//                                     return (
//                                         <div
//                                             key={`${opt.value}-${actualIndex}`}
//                                             className={`ufs-option border-bottom ${String(opt.value) === stringValue ? "selected" : ""} ${actualIndex === highlightedIndex ? "highlighted" : ""}`}
//                                             style={{ height: ITEM_HEIGHT, boxSizing: "border-box" }}
//                                             onMouseDown={(e) => { e.preventDefault(); handleSelectOption(opt); }}
//                                             onMouseEnter={() => setHighlightedIndex(actualIndex)}
//                                             role="option"
//                                             aria-selected={String(opt.value) === stringValue}
//                                         >
//                                             {formatSentence(opt?.label) || ""}
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     )}
//                 </div>,
//                 document.body
//             )}
//         </div>
//     );
// };

// export default UltraFastSelect;



import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useDebounce } from "./useDebounce";
import "./UltraFastSelect.css";

const ITEM_HEIGHT = 30;
const VISIBLE_COUNT = 25;

const UltraFastSelect = ({
    options = [],
    value,
    onChange,
    label,
    placeholder = "",
    searchable = true,
    autoFocus = false,
    tabIndex = 0,
    isDisabled = false,
    isClearable = true,
    openMenuOnFocus = false,
    id,
    name,
    className = "",
    onKeyDown,
}) => {
    const wrapperRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);
    const isMouseClick = useRef(false);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [scrollTop, setScrollTop] = useState(0);
    const debouncedSearch = useDebounce(search, 300);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 0 });

    const selected = useMemo(
        () => {
            if (value === null || value === undefined || value === "") {
                return null;
            }
            return options.find((o) => String(o.value) === String(value)) || null;
        },
        [options, value]
    );

    /** filtered (immediate) - safe handling with smart sorting */
    const filtered = useMemo(() => {
        const safeOptions = Array.isArray(options) ? options : [];
        if (!searchable || !search) {
            return safeOptions;
        }
        const s = search.toLowerCase().trim();
        const matches = safeOptions.filter((o) =>
            o?.label?.toLowerCase().includes(s)
        );

        return matches.sort((a, b) => {
            const labelA = (a?.label || "").toLowerCase();
            const labelB = (b?.label || "").toLowerCase();

            const getScore = (label) => {
                if (label === s) return 0;
                if (label.startsWith(s)) return 1;

                // Check numeric prefix of the numeric part
                const numMatch = label.match(/\d+/);
                if (numMatch) {
                    const firstNum = numMatch[0];
                    if (firstNum === s) return 2;
                    if (firstNum.startsWith(s)) return 3;
                    if (firstNum.includes(s)) return 4;
                }

                // Match starting at index
                const idx = label.indexOf(s);
                if (idx !== -1) {
                    return 5 + idx;
                }

                return 1000;
            };

            const scoreA = getScore(labelA);
            const scoreB = getScore(labelB);

            if (scoreA !== scoreB) {
                return scoreA - scoreB;
            }

            // Fallback to alphabetical sorting or length
            return labelA.localeCompare(labelB);
        });
    }, [options, search, searchable]);

    /** window calculation */
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT));
    const endIndex = Math.min(startIndex + VISIBLE_COUNT, filtered.length);
    const visibleItems = filtered.slice(startIndex, endIndex);

    /** auto focus on mount */
    useEffect(() => {
        if (autoFocus && !isDisabled && open && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [autoFocus, isDisabled, open]);

    useEffect(() => {
        if (!openMenuOnFocus || isDisabled) return;

        const handleFocus = () => {
            if (!open) {
                setOpen(true);
            } else {
                setOpen(false)
            }
        };

        const controlElement = wrapperRef.current?.querySelector('.ufs-control');
        if (controlElement) {
            controlElement.addEventListener('focus', handleFocus);
            return () => controlElement.removeEventListener('focus', handleFocus);
        }
    }, [openMenuOnFocus, isDisabled, open]);


    /** outside click */
    useEffect(() => {
        const h = (e) => {
            // Check if click is inside wrapper or inside the portal menu
            if (
                !wrapperRef.current?.contains(e.target) &&
                !listRef.current?.contains(e.target)
            ) {
                setOpen(false);
                setSearch("");
                setScrollTop(0);
            }
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    useEffect(() => {
        if (open && listRef.current) {
            // Find index of currently selected item
            const selectedIndex = filtered.findIndex((o) => o.value === value);
            const highlightIndex = selectedIndex !== -1 ? selectedIndex : 0;

            setHighlightedIndex(highlightIndex);

            const scrollPos = highlightIndex * ITEM_HEIGHT;
            listRef.current.scrollTop = scrollPos;
            setScrollTop(scrollPos);
        }
    }, [open, filtered, value]);

    /** calculate menu position */
    useEffect(() => {
        if (!open) return;

        const updatePosition = () => {
            if (wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect();
                setMenuRect({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            }
        };

        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open]);

    /** reset highlight on search - immediate */
    useEffect(() => {
        setHighlightedIndex(0);
        setScrollTop(0);
    }, [search]);

    /** keyboard navigation */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (onKeyDown && typeof onKeyDown === "function") {
                onKeyDown(e);
                if (e.defaultPrevented) return;
            }

            // Don't stop propagation on Tab/Escape to allow parent/browser handlers to work correctly
            if (e.key !== "Tab" && e.key !== "Escape") {
                e.stopPropagation();
            }

            if (e.key === "Backspace" && open && searchable && inputRef.current) {
                const input = inputRef.current;
                if (input.selectionStart === 0 && input.selectionEnd === 0 && !search) {
                    e.preventDefault();
                    return;
                }
            }

            // Tab key handling - Auto-select and move focus
            if (e.key === "Tab") {
                if (open) {
                    // Auto-select highlighted item on Tab
                    if (filtered.length > 0 && filtered[highlightedIndex]) {
                        handleSelectOption(filtered[highlightedIndex]);
                    }
                    setOpen(false);
                    setSearch("");
                    setScrollTop(0);
                }
                // Do NOT call e.preventDefault() here - we want native browser tab behavior to move focus
                return;
            }

            if (!open) {
                if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                    e.preventDefault();
                    setOpen(true);
                }
                return;
            }

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setHighlightedIndex((prev) =>
                        Math.min(prev + 1, filtered.length - 1)
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filtered.length > 0 && filtered[highlightedIndex]) {
                        handleSelectOption(filtered[highlightedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    setOpen(false);
                    setSearch("");
                    setScrollTop(0);
                    setHighlightedIndex(0);
                    break;
                default:
                    break;
            }
        };

        const inputElement = inputRef.current;
        const controlElement = wrapperRef.current?.querySelector('.ufs-control, input');

        if (open && inputElement) {
            inputElement.addEventListener("keydown", handleKeyDown);
            return () => inputElement.removeEventListener("keydown", handleKeyDown);
        } else if (!open && controlElement) {
            controlElement.addEventListener("keydown", handleKeyDown);
            return () => controlElement.removeEventListener("keydown", handleKeyDown);
        }

        return undefined;
    }, [open, highlightedIndex, filtered, onChange, isDisabled, onKeyDown, search, searchable]);

    /** auto-scroll to highlighted item */
    useEffect(() => {
        if (open && listRef.current) {
            const highlightedScrollTop = highlightedIndex * ITEM_HEIGHT;
            const listHeight = listRef.current.clientHeight;

            if (highlightedScrollTop < scrollTop) {
                listRef.current.scrollTop = highlightedScrollTop;
                setScrollTop(highlightedScrollTop);
            } else if (highlightedScrollTop + ITEM_HEIGHT > scrollTop + listHeight) {
                const newScroll = highlightedScrollTop + ITEM_HEIGHT - listHeight;
                listRef.current.scrollTop = newScroll;
                setScrollTop(newScroll);
            }
        }
    }, [highlightedIndex, open, scrollTop]);

    /** handle clear value */
    const handleClear = (e) => {
        e.stopPropagation();
        if (onChange && typeof onChange === "function") {
            onChange(name, null);
        }
        setOpen(false);
        setSearch("");
        setScrollTop(0);
        setHighlightedIndex(0);
    };

    /** safe option selection handler */
    const handleSelectOption = (opt) => {
        if (!opt || typeof onChange !== "function") return;

        try {
            onChange(name, opt);
            setOpen(false);
            setSearch("");
            setScrollTop(0);
            setHighlightedIndex(0);
        } catch (error) {
            console.error("Error selecting option:", error);
        }
    };

    const formatSentence = (label = "") => {
        if (!label.includes("~")) return label;

        if (label?.includes('~')) {
            const [before, after] = label.split("~");
            if (!after || !after.trim()) return label;

            const formattedAfter = after
                .trim()
                .toLowerCase()
                .split(" ")
                .map(
                    (word) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ");

            return `${ before }~ ${ formattedAfter }`;
        }
        const formattedAfter = label
            .trim()
            .toLowerCase()
            .split(" ")
            .map(
                (word) => word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join(" ");
        return formattedAfter
    };


    return (
        <div
            className={`ufs-wrapper ${ isDisabled ? "disabled" : "" } ${ className }`}
            ref={wrapperRef}
            id={id}
            onBlur={(e) => {
                    // Close only if focus leaves both wrapper and portal menu
                    if (
                        !wrapperRef.current?.contains(e.relatedTarget) &&
                        !listRef.current?.contains(e.relatedTarget)
                    ) {
                        setOpen(false);
                        setSearch("");
                        setScrollTop(0);
                    }
                }}
        >
            <div
                className="ufs-control"
                onClick={() => {
                    if (isDisabled) return;

                    // ✅ Always open instead of toggle
                    setOpen(true);

                    requestAnimationFrame(() => {
                        inputRef.current?.focus();
                    });
                    }}
                tabIndex={isDisabled ? -1 : tabIndex}
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-disabled={isDisabled}
                onMouseDown={() => {
                    isMouseClick.current = true;
                    setTimeout(() => { isMouseClick.current = false; }, 200);
                }}
                onFocus={() => {
                    if (isDisabled) return;

                    setOpen(true);

                    setSearch(selected?.label || "");

                    requestAnimationFrame(() => {
                        const input = inputRef.current;

                        if (input) {
                        input.focus();
                        input.select();
                        // const len = selected?.label?.length || 0;
                        // input.setSelectionRange(len, len);
                        }
                    });
                    }}
            >
                {label && (
                    <label className={`ufs-label ${ open || selected ? "float" : "" }`}>
                        {label}
                    </label>
                )}

                {open && searchable ? (
                    <input
                        type="text"
                        inputMode="text" 
                        ref={inputRef}
                        className="ufs-input"
                        value={search}
                        onChange={(e) => {
                        let value = e.target.value;
                        if (selected && value === selected.label) {
                            value = "";
                        }
                        setSearch(value);
                        setScrollTop(0);
                        }}
                        placeholder={placeholder}
                        autoFocus
                        disabled={isDisabled}
                        aria-label={label || placeholder}
                        autoComplete="off"
                    />
                ) : (
                    <span title={selected?.label || ""} className={`ufs-value ${ !selected ? "placeholder" : "" }`}>
                        {selected?.label || placeholder}
                    </span>
                )}

                {isClearable && selected && !isDisabled && (
                    <button
                        className="ufs-clear-btn"
                        onClick={handleClear}
                        aria-label="Clear selection"
                        type="button"
                        tabIndex={-1}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>

            {open && !isDisabled && ReactDOM.createPortal(
                <div
                    className="ufs-menu"
                    ref={listRef}
                    onScroll={(e) => setScrollTop(e.target.scrollTop)}
                    role="listbox"
                    style={{
                        position: "absolute",
                        top: menuRect.top,
                        left: menuRect.left,
                        width: menuRect.width,
                        zIndex: 99999,
                    }}
                >
                    {filtered.length === 0 ? (
                        <div className="ufs-empty">No options available</div>
                    ) : (
                        <div
                            style={{
                                height: filtered.length * ITEM_HEIGHT,
                                position: "relative",
                                width: "100%"
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: startIndex * ITEM_HEIGHT,
                                    left: 0,
                                    right: 0,
                                    width: "100%",
                                    zIndex: 9999
                                }}
                            >
                                {visibleItems.map((opt, index) => {
                                    const actualIndex = startIndex + index;
                                    return (
                                        <div
                                            key={`${ opt.value }-${ actualIndex }`}
                                            className={`ufs-option border-bottom ${ opt.value === value ? "selected" : ""
                                                } ${ actualIndex === highlightedIndex ? "highlighted" : ""
                                                }`}
                                            style={{ height: ITEM_HEIGHT, boxSizing: "border-box" }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSelectOption(opt);
                                            }}
                                            onMouseEnter={() => setHighlightedIndex(actualIndex)}
                                            role="option"
                                            aria-selected={opt.value === value}
                                        >
                                            {formatSentence(opt?.label) || ""}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default UltraFastSelect;

