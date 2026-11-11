import { useState } from "react";
import {
  FaBell as IoNotifications,
  FaCheckDouble as IoCheckmarkDone,
  FaClock as IoTime,
  FaExclamationTriangle as IoWarning,
  FaEnvelope as IoMail,
  FaCog as IoCog,
} from "react-icons/fa";
import { StyledDropdown } from "@app/styles/common";

const NotificationDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Sample QC-234 rejected",
      time: "1 hour ago",
      read: false,
      type: "error",
      message: "The sample failed quality check due to contamination.",
      replies: [
        {
          id: 1,
          message: "Can you provide more details?",
          sender: "You",
          time: "45 min ago",
        },
      ],
      showReplyInput: false,
      replyText: "",
    },
    {
      id: 2,
      title: "Project approved successfully",
      time: "2 hours ago",
      read: true,
      type: "success",
      message: "Your project proposal has been approved by the committee.",
      replies: [],
      showReplyInput: false,
      replyText: "",
    },
    {
      id: 3,
      title: "System update available",
      time: "Yesterday",
      read: false,
      type: "warning",
      message: "New system update v2.3.1 is ready for installation.",
      replies: [],
      showReplyInput: false,
      replyText: "",
    },
  ]);

  const tabConfig = {
    1: {
      label: "History",
      icon: IoCheckmarkDone,
      color: "#10b981",
      badge: "3 new",
    },
    2: {
      label: "Rejected",
      icon: IoWarning,
      color: "#ef4444",
      badge: "2 items",
    },
    3: {
      label: "Approvals",
      icon: IoTime,
      color: "#f59e0b",
      badge: "1 pending",
    },
    4: {
      label: "Alerts",
      icon: IoWarning,
      color: "#8b5cf6",
      badge: "4 active",
    },
    5: { label: "Messages", icon: IoMail, color: "#3b82f6", badge: "2 unread" },
    6: { label: "System", icon: IoCog, color: "#6b7280", badge: "ok" },
  };

  const shakeStyle = `
    @keyframes shake {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      25% { transform: translateX(-2px) rotate(-4deg); }
      50% { transform: translateX(2px) rotate(4deg); }
      75% { transform: translateX(-1px) rotate(-2deg); }
    }
    .shake-animation { animation: shake 0.6s ease-in-out; }
  `;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "💬";
    }
  };

  const handleReplyClick = (notificationId, e) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, showReplyInput: true }
          : { ...notif, showReplyInput: false },
      ),
    );
  };

  const handleReplyTextChange = (notificationId, text) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, replyText: text } : notif,
      ),
    );
  };

  const handleSendReply = (notificationId, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((notif) => {
        if (notif.id === notificationId && notif.replyText?.trim()) {
          const newReply = {
            id: Date.now(),
            message: notif.replyText,
            sender: "You",
            time: "Just now",
          };
          return {
            ...notif,
            showReplyInput: false,
            replyText: "",
            replies: [...notif.replies, newReply],
          };
        }
        return notif;
      }),
    );
  };

  // Cancel reply
  const handleCancelReply = (notificationId, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, showReplyInput: false, replyText: "" }
          : notif,
      ),
    );
  };

  // Handle notification click without closing dropdown
  const handleNotificationClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <style>{shakeStyle}</style>

      <StyledDropdown
        isOpen={dropdownOpen}
        setIsOpen={setDropdownOpen}
        hideArrow
        placement="bottom-end"
      >
        {/* Bell Icon */}
        <div
          className="nav-link position-relative"
          slot="head"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "6px",
            transition: "0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <IoNotifications
            size={18}
            color="white"
            onMouseEnter={(e) =>
              e.currentTarget.classList.add("shake-animation")
            }
            onMouseLeave={(e) =>
              e.currentTarget.classList.remove("shake-animation")
            }
          />
          <span
            style={{
              position: "absolute",
              top: "3px",
              right: "3px",
              backgroundColor: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: "14px",
              height: "14px",
              fontSize: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              border: "1px solid #1f2937",
            }}
          >
            {notifications.filter((n) => !n.read).length}
          </span>
        </div>

        {/* Dropdown Body */}
        <div
          slot="body"
          style={{
            minWidth: "300px",
            maxHeight: "420px",
            display: "flex",
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Sidebar Tabs */}
          <div
            className="d-flex flex-column"
            style={{
              backgroundColor: "#f9fafb",
              minWidth: "100px",
              padding: "8px 4px",
              borderRight: "1px solid #f1f5f9",
            }}
          >
            {Object.entries(tabConfig).map(([key, tab]) => {
              const Icon = tab.icon;
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    padding: "8px 10px",
                    margin: "2px 4px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: active ? "600" : "500",
                    color: active ? tab.color : "#6b7280",
                    backgroundColor: active ? `${tab.color}10` : "transparent",
                    borderLeft: active
                      ? `3px solid ${tab.color}`
                      : "3px solid transparent",
                    transition: "0.2s",
                  }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <Icon size={14} color={active ? tab.color : "#9ca3af"} />
                    <span>{tab.label}</span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "#9ca3af",
                      marginLeft: "20px",
                    }}
                  >
                    {tab.badge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Notifications Panel */}
          <div
            style={{
              flex: 1,
              padding: "8px 10px",
              overflowY: "auto",
              maxHeight: "400px",
            }}
            onClick={handleNotificationClick}
          >
            <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
              <h6
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                {tabConfig[activeTab].label}
              </h6>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#9ca3af",
                  background: "#f3f4f6",
                  padding: "2px 6px",
                  borderRadius: "8px",
                }}
              >
                {notifications.length}
              </span>
            </div>

            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: item.read ? "#fff" : "#f8fafc",
                    border: "1px solid transparent",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    marginBottom: "6px",
                    fontSize: "0.75rem",
                    transition: "0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = item.read
                      ? "#fff"
                      : "#f8fafc";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div style={{ fontSize: "1rem" }}>
                      {getNotificationIcon(item.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "500", color: "#111827" }}>
                        {item.title}
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: "0.7rem" }}>
                        {item.time}
                      </div>

                      {item.message && (
                        <div
                          style={{
                            color: "#6b7280",
                            fontSize: "0.7rem",
                            marginTop: "4px",
                            padding: "6px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "4px",
                            borderLeft: "2px solid #e5e7eb",
                          }}
                        >
                          {item.message}
                        </div>
                      )}

                      {/* Replies section */}
                      {item.replies && item.replies.length > 0 && (
                        <div style={{ marginTop: "8px" }}>
                          <div
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: "600",
                              color: "#6b7280",
                              marginBottom: "4px",
                            }}
                          >
                            Replies ({item.replies.length})
                          </div>
                          {item.replies.slice(-2).map((reply, index) => (
                            <div
                              key={index}
                              style={{
                                fontSize: "0.65rem",
                                padding: "4px 6px",
                                marginBottom: "2px",
                                backgroundColor:
                                  reply.sender === "You"
                                    ? "#eff6ff"
                                    : "#f9fafb",
                                borderRadius: "4px",
                                borderLeft: `2px solid ${reply.sender === "You" ? "#3b82f6" : "#9ca3af"}`,
                              }}
                            >
                              <div
                                style={{ fontWeight: "500", color: "#374151" }}
                              >
                                {reply.sender}
                              </div>
                              <div style={{ color: "#6b7280" }}>
                                {reply.message}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.6rem",
                                  color: "#9ca3af",
                                  textAlign: "right",
                                }}
                              >
                                {reply.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reply Input Section */}
                  {item.showReplyInput ? (
                    <div style={{ marginTop: "8px", paddingLeft: "24px" }}>
                      <div className="d-flex gap-2 align-items-center">
                        <input
                          type="text"
                          value={item.replyText || ""}
                          onChange={(e) =>
                            handleReplyTextChange(item.id, e.target.value)
                          }
                          placeholder="Type your reply..."
                          style={{
                            flex: 1,
                            padding: "4px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            outline: "none",
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && item.replyText?.trim()) {
                              handleSendReply(item.id, e);
                            }
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => handleSendReply(item.id, e)}
                          disabled={!item.replyText?.trim()}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: item.replyText?.trim()
                              ? "#3b82f6"
                              : "#9ca3af",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: item.replyText?.trim()
                              ? "pointer"
                              : "not-allowed",
                            fontSize: "0.65rem",
                          }}
                        >
                          Send
                        </button>
                        <button
                          onClick={(e) => handleCancelReply(item.id, e)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.65rem",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Reply Button */
                    <div style={{ marginTop: "6px", paddingLeft: "24px" }}>
                      <button
                        onClick={(e) => handleReplyClick(item.id, e)}
                        style={{
                          padding: "2px 8px",
                          backgroundColor: "transparent",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          color: "#6b7280",
                          fontSize: "0.65rem",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#9ca3af";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                      >
                        Reply
                      </button>

                      {item.replies && item.replies.length > 2 && (
                        <button
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "2px 8px",
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#3b82f6",
                            fontSize: "0.65rem",
                            cursor: "pointer",
                            marginLeft: "8px",
                          }}
                        >
                          View all {item.replies.length} replies
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <div style={{ fontSize: "2rem", color: "#e5e7eb" }}>📭</div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    marginTop: "4px",
                  }}
                >
                  No notifications
                </p>
              </div>
            )}
          </div>
        </div>
      </StyledDropdown>
    </>
  );
};

export default NotificationDropdown;
