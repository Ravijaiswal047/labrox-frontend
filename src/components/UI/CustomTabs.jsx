import React, { useRef, useState, useEffect } from "react";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import { Theme } from "../../utils/Constants";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CustomTabs = ({ tabs, activeTab, onSelect, className = "mb-0", id = "custom-tabs-component" }) => {
    const theme = useLocalStorage("theme", "get") || "default_theme";
    const tabsContainerRef = useRef(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

    const handleScroll = (direction) => {
        if (tabsContainerRef.current) {
            const navTabs = tabsContainerRef.current;
            if (navTabs) {
                const scrollAmount = 200; // Adjust as needed
                if (direction === "left") {
                    navTabs.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                } else {
                    navTabs.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }
    };

    const checkScrollButtons = () => {
        if (tabsContainerRef.current) {
            const navTabs = tabsContainerRef.current;
            if (navTabs) {
                const { scrollLeft, scrollWidth, clientWidth } = navTabs;
                setShowLeftScroll(scrollLeft > 0);
                // We use Math.ceil to prevent fractional pixel discrepancies
                setShowRightScroll(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
            }
        }
    };

    useEffect(() => {
        // Run initially, and slightly delay to ensure render is complete for width calculation
        checkScrollButtons();
        const timeout = setTimeout(checkScrollButtons, 100);

        const navTabs = tabsContainerRef.current;
        if (navTabs) {
            navTabs.addEventListener('scroll', checkScrollButtons);
            window.addEventListener('resize', checkScrollButtons);
            return () => {
                clearTimeout(timeout);
                navTabs.removeEventListener('scroll', checkScrollButtons);
                window.removeEventListener('resize', checkScrollButtons);
            };
        }
        return () => clearTimeout(timeout);
    }, [tabs, activeTab]);

    return (
        <div className={theme}>
            <style>
                {`
                .nav-wrapper {
                    display: flex;
                    align-items: flex-end;
                    border-bottom: 1px solid #dee2e6;
                    position: relative;
                }

                .nav-tabs-scrollable {
                    display: flex;
                    flex-wrap: nowrap !important;
                    overflow-x: auto !important;
                    overflow-y: hidden !important;
                    gap: 5px;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    margin-bottom: 0px !important;
                    border: none !important;
                    scroll-behavior: smooth; /* For smooth scrolling compatibility */
                    flex-grow: 1; /* take up remaining space */
                }
                
                .nav-tabs-scrollable::-webkit-scrollbar {
                    display: none;
                }

                /* Ensure we hit the Nav.Link even if react-bootstrap adds its classes */
                .nav-tabs-scrollable .nav-link {
                    border: 1px solid #dee2e6 !important;
                    border-bottom: none !important;
                    border-top-left-radius: 10px !important;
                    border-top-right-radius: 10px !important;
                    color: #495057 !important;
                    background: #f8f9fa !important;
                    font-weight: 500 !important;
                    font-size: 13px !important;
                    padding: 5px 15px !important;
                    white-space: nowrap !important;
                    transition: all 0.2s ease-in-out !important;
                    cursor: pointer;
                    margin-bottom: 0; /* Override nav-tabs.nav-link default */
                }

               .nav-tabs-scrollable .nav-link:not(.active):hover {
                    background: #e9ecef !important;
                    border-color: #ced4da !important;
                }

                .nav-tabs-scrollable .nav-link.active {
                    color: #fff !important;
                }

                .scroll-btn {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    color: #495057;
                    transition: all 0.2s ease-in-out;
                    z-index: 10;
                    margin-bottom: 3px; /* Slightly lift them from the bottom border */
                    opacity: 0.8;
                }
                .scroll-btn:hover {
                    background: #e9ecef;
                    opacity: 1;
                }
                .scroll-btn-left {
                    border-radius: 6px;
                    margin-right: 6px;
                }
                .scroll-btn-right {
                    border-radius: 6px;
                    margin-left: 6px;
                }
                `}
            </style>

            <Tab.Container
                id={id}
                activeKey={activeTab}
                onSelect={onSelect}
                unmountOnExit={true}
            >
                <div className="nav-wrapper">
                    {showLeftScroll && (
                        <button
                            className="scroll-btn scroll-btn-left"
                            onClick={() => handleScroll("left")}
                            type="button"
                        >
                            <FaChevronLeft size={10} />
                        </button>
                    )}

                    <Nav variant="tabs" className="nav-tabs-scrollable" ref={tabsContainerRef}>
                        {tabs.map((tab) => (
                            <Nav.Item key={tab.id}>
                                <Nav.Link eventKey={tab.id} disabled={tab.disabled} className={activeTab === tab.id ? "active-tab-menu" : ""}>
                                    {tab.label}
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>

                    {showRightScroll && (
                        <button
                            className="scroll-btn scroll-btn-right"
                            onClick={() => handleScroll("right")}
                            type="button"
                        >
                            <FaChevronRight size={10} />
                        </button>
                    )}
                </div>

                <Tab.Content className={className}>
                    {tabs.map((tab) => (
                        <Tab.Pane eventKey={tab.id} key={tab.id} unmountOnExit={true}>
                            <div className="">
                                {tab.content}
                            </div>
                        </Tab.Pane>
                    ))}
                </Tab.Content>
            </Tab.Container>
        </div>
    );
};

export default CustomTabs;