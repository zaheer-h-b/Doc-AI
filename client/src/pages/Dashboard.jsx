import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Plus,
  MessageSquare,
  FileText,
  UploadCloud,
  Send,
  Trash2,
  Sun,
  Moon,
  LogOut,
  MoreVertical,
  Menu,
  X,
  Copy,
  Check,
  Search,
  Bot,
  FileCheck,
  ArrowRight,
  Loader2,
  FileCode,
  BookOpen,
  Scale
} from "lucide-react";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

let msgCounter = 0;
const createTempId = (prefix) => `${prefix}-${++msgCounter}-${Math.random().toString(36).substring(2, 7)}`;

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || { name: "User", email: "" };
  const token = localStorage.getItem("token");

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteChatId, setDeleteChatId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const loadChats = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChats(response.data.chats || []);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  }, [token]);

  // Sync theme with document class and localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    let ignore = false;
    const fetchInitial = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!ignore) {
          setChats(response.data.chats || []);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    };

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, chatLoading]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [question]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Browser back button handler to confirm logout
  useEffect(() => {
    window.history.pushState(
      { dashboard: true },
      "",
      window.location.href
    );

    const handleBrowserBack = () => {
      setShowLogoutConfirm(true);
      window.history.pushState(
        { dashboard: true },
        "",
        window.location.href
      );
    };

    window.addEventListener("popstate", handleBrowserBack);
    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  const handleNewChat = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/chats`,
        {},
        config
      );

      const newChat = response.data.chat;

      setChats((previousChats) => [newChat, ...previousChats]);
      setActiveChat(newChat);
      setMessages([]);
      setSelectedFile(null);
      setQuestion("");
      setOpenMenuId(null);
      setDeleteChatId(null);
      setSidebarOpen(false); // Close mobile drawer if open
    } catch (error) {
      console.error("Create chat error:", error);
      toast.error("Failed to create a new chat");
    }
  };

  const handleOpenChat = async (chatId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chats/${chatId}`,
        config
      );

      setActiveChat(response.data.chat);
      setMessages(response.data.messages || []);
      setSelectedFile(null);
      setQuestion("");
      setOpenMenuId(null);
      setDeleteChatId(null);
      setSidebarOpen(false); // Close mobile drawer
    } catch (error) {
      console.error("Failed to load chat:", error);
      toast.error("Failed to load chat");
    }
  };

  const openDeleteConfirmation = (e, chatId) => {
    e.stopPropagation();
    setDeleteChatId(chatId);
    setOpenMenuId(null);
  };

  const cancelDeleteChat = (e) => {
    e?.stopPropagation();
    setDeleteChatId(null);
  };

  const handleDeleteChat = async (e, chatId) => {
    e?.stopPropagation();
    try {
      await axios.delete(
        `${API_URL}/api/chats/${chatId}`,
        config
      );

      setChats((previousChats) =>
        previousChats.filter((chat) => chat._id !== chatId)
      );

      if (activeChat?._id === chatId) {
        setActiveChat(null);
        setMessages([]);
        setSelectedFile(null);
        setQuestion("");
      }

      setDeleteChatId(null);
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Delete chat error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete chat"
      );
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const isExtensionValid = /\.(pdf|docx|txt)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isExtensionValid) {
      toast.error("Please select a valid document (.PDF, .DOCX, or .TXT)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10 MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!activeChat) {
      toast.error("Please create or select a chat first");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a document first");
      return;
    }

    try {
      setUploadLoading(true);

      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("chatId", activeChat._id);

      const response = await axios.post(
        `${API_URL}/api/documents/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Document processed successfully!");

      const updatedChat = {
        ...activeChat,
        document: response.data.document,
        title: response.data.chat?.title || selectedFile.name,
      };

      setActiveChat(updatedChat);
      await loadChats();
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || "Document upload and embedding failed"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAskQuestion = async (prefilledText) => {
    const queryText = (typeof prefilledText === "string" ? prefilledText : question).trim();

    if (!activeChat) {
      toast.error("Please create a new chat first");
      return;
    }

    if (!activeChat.document) {
      toast.error("Please upload a document first");
      return;
    }

    if (!queryText) {
      return;
    }

    const temporaryUserMessage = {
      _id: createTempId("user"),
      role: "user",
      content: queryText,
    };

    setMessages((previousMessages) => [...previousMessages, temporaryUserMessage]);
    setQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      setChatLoading(true);

      const documentId =
        activeChat.document._id ||
        activeChat.document.id ||
        activeChat.document;

      const response = await axios.post(
        `${API_URL}/api/chats/ask`,
        {
          question: queryText,
          documentId,
          chatId: activeChat._id,
        },
        config
      );

      const answer = response.data.answer;

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          _id: createTempId("assistant"),
          role: "assistant",
          content: answer,
        },
      ]);

      await loadChats();
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(
        error.response?.data?.message || "Failed to get an answer"
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          _id: createTempId("error"),
          role: "assistant",
          content: "Sorry, I was unable to process your question. Please try asking again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!chatLoading) {
        handleAskQuestion();
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    toast.success("Answer copied to clipboard!");
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  // Filtered chats based on search
  const filteredChats = chats.filter((chat) =>
    (chat.title || "New Chat").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // User initials helper
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper for document file format badge
  const getDocBadge = (title) => {
    if (!title) return "DOC";
    if (title.endsWith(".pdf")) return "PDF";
    if (title.endsWith(".docx")) return "DOCX";
    if (title.endsWith(".txt")) return "TXT";
    return "DOC";
  };

  const suggestedPrompts = [
    { label: "Summarize Key Points", prompt: "Provide a comprehensive summary of the main points covered in this document." },
    { label: "Important Takeaways", prompt: "What are the 5 most important takeaways from this document?" },
    { label: "Explain Simply", prompt: "Explain the core concepts of this document in simple terms." },
    { label: "Key Definitions", prompt: "List and define the key terms and concepts introduced in this document." },
  ];

  return (
    <div className={`dashboard-shell ${theme}`}>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ----------------------------------------------------------------------
          SIDEBAR
         ---------------------------------------------------------------------- */}
      <aside className={`sidebar-panel ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Top: Brand & User Profile */}
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-logo-cluster">
              <div className="brand-icon-box">
                <Sparkles size={18} />
              </div>
              <div className="brand-text-col">
                <span className="brand-name">Doc-AI</span>
                <span className="brand-sub">Workspace</span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="user-profile-badge">
            <div className="user-avatar-circle">
              {getUserInitials(user?.name)}
              <span className="user-status-dot" />
            </div>
            <div className="user-info-text">
              <div className="user-display-name">{user?.name || "User"}</div>
              <div className="user-email-text">{user?.email || "Signed In"}</div>
            </div>
          </div>

          {/* New Chat Button */}
          <button className="new-chat-btn" onClick={handleNewChat}>
            <div className="new-chat-btn-content">
              <Plus size={18} />
              <span>New Conversation</span>
            </div>
            <span className="shortcut-pill">⌘K</span>
          </button>

          {/* Search Chats Input */}
          <div className="sidebar-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Middle: Chat History List */}
        <div className="sidebar-history-section">
          <div className="history-section-header">
            <span>RECENT CONVERSATIONS</span>
            <span className="chat-count-badge">{filteredChats.length}</span>
          </div>

          <div className="chat-history-scrollable">
            {filteredChats.length === 0 ? (
              <div className="empty-history-box">
                <MessageSquare size={24} className="empty-history-icon" />
                <p>
                  {searchQuery ? "No matching chats found" : "No conversations yet"}
                </p>
                <small>Create a new chat to begin</small>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = activeChat?._id === chat._id;
                const isMenuOpen = openMenuId === chat._id;
                const isDeleting = deleteChatId === chat._id;

                return (
                  <div
                    key={chat._id}
                    className={`chat-item-wrapper ${isActive ? "active-item" : ""}`}
                  >
                    <button
                      className="chat-select-btn"
                      onClick={() => handleOpenChat(chat._id)}
                      title={chat.title || "New Chat"}
                    >
                      <div className="chat-item-icon">
                        {chat.document ? (
                          <FileText size={16} />
                        ) : (
                          <MessageSquare size={16} />
                        )}
                      </div>
                      <span className="chat-item-title">
                        {chat.title || "New Conversation"}
                      </span>
                    </button>

                    {/* Chat Item Options Dropdown */}
                    <div className="chat-menu-wrapper">
                      <button
                        className="chat-menu-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : chat._id);
                          setDeleteChatId(null);
                        }}
                        aria-label="Options"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="chat-menu-dropdown animate-scale-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="chat-menu-action delete-action"
                            onClick={(e) => openDeleteConfirmation(e, chat._id)}
                          >
                            <Trash2 size={14} />
                            <span>Delete Chat</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline Delete Confirmation */}
                    {isDeleting && (
                      <div
                        className="delete-confirmation-banner animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p>Delete this chat?</p>
                        <div className="confirm-btn-group">
                          <button
                            className="confirm-btn cancel"
                            onClick={(e) => cancelDeleteChat(e)}
                          >
                            Cancel
                          </button>
                          <button
                            className="confirm-btn danger"
                            onClick={(e) => handleDeleteChat(e, chat._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom: Settings, Theme & Logout */}
        <div className="sidebar-footer">
          {/* Theme Switcher */}
          <button className="footer-action-btn" onClick={toggleTheme}>
            <div className="btn-content-left">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
            </div>
            <span className="theme-indicator-pill">
              {theme === "light" ? "Off" : "On"}
            </span>
          </button>

          {/* Logout Action */}
          <button className="footer-action-btn logout-btn" onClick={handleLogout}>
            <div className="btn-content-left">
              <LogOut size={18} />
              <span>Log out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* ----------------------------------------------------------------------
          MAIN CHAT & CONTENT AREA
         ---------------------------------------------------------------------- */}
      <main className="main-viewport">
        {/* Top Navbar */}
        <header className="viewport-navbar">
          <div className="navbar-left">
            {/* Hamburger trigger for mobile */}
            <button
              className="navbar-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            {activeChat ? (
              <div className="active-doc-indicator">
                <span className="doc-type-badge">
                  {getDocBadge(activeChat.title)}
                </span>
                <div className="active-doc-text">
                  <h1 className="active-doc-name">
                    {activeChat.title || "New Conversation"}
                  </h1>
                  <span className="active-doc-status">
                    {activeChat.document ? "Document indexed & ready" : "Awaiting document upload"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="navbar-brand-mobile">
                <Sparkles size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: 700, fontSize: 16 }}>Doc-AI</span>
              </div>
            )}
          </div>

          <div className="navbar-right">
            <button className="navbar-action-btn" onClick={handleNewChat}>
              <Plus size={16} />
              <span className="hide-mobile">New Chat</span>
            </button>
          </div>
        </header>

        {/* Viewport Content States */}
        <div className="viewport-body">
          {/* 1. WELCOME SCREEN (No chat selected) */}
          {!activeChat && (
            <div className="welcome-screen-container animate-fade-in">
              <div className="welcome-hero-card">
                <div className="welcome-badge">
                  <Sparkles size={15} />
                  <span>Next-Gen Document Intelligence</span>
                </div>

                <h2 className="welcome-hero-title">
                  Chat with any document <br />
                  <span className="gradient-text">using conversational AI.</span>
                </h2>

                <p className="welcome-hero-desc">
                  Upload complex PDFs, lecture notes, legal documents, or research papers.
                  Doc-AI breaks down content into semantic vectors and delivers instant, factual answers.
                </p>

                <div className="welcome-cta-row">
                  <button className="primary-cta-btn" onClick={handleNewChat}>
                    <Plus size={18} />
                    <span>Start New Conversation</span>
                  </button>
                </div>
              </div>

              {/* Feature Showcase Grid */}
              <div className="feature-cards-grid">
                <div className="feature-card" onClick={handleNewChat}>
                  <div className="feature-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>
                    <BookOpen size={22} />
                  </div>
                  <h3>Research & Study Notes</h3>
                  <p>Extract core concepts, formula explanations, and chapter summaries in seconds.</p>
                </div>

                <div className="feature-card" onClick={handleNewChat}>
                  <div className="feature-card-icon" style={{ background: "rgba(236, 72, 153, 0.12)", color: "#f472b6" }}>
                    <Scale size={22} />
                  </div>
                  <h3>Contracts & Legal Docs</h3>
                  <p>Quickly locate clauses, terms, payment obligations, and key liabilities without manual reading.</p>
                </div>

                <div className="feature-card" onClick={handleNewChat}>
                  <div className="feature-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399" }}>
                    <FileCode size={22} />
                  </div>
                  <h3>Technical Specs & Manuals</h3>
                  <p>Ask technical questions and get precise references with contextual paragraph citations.</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. UPLOAD SCREEN (Chat active, but no document uploaded yet) */}
          {activeChat && !activeChat.document && (
            <div className="upload-view-container animate-fade-in">
              <div className="upload-box-wrapper">
                <div className="upload-box-header">
                  <div className="upload-brand-badge">
                    <Sparkles size={16} /> STEP 1: UPLOAD DOCUMENT
                  </div>
                  <h2>Upload your document to begin</h2>
                  <p>Select or drag a file to index and start chatting with it.</p>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  className={`dropzone-area ${isDragging ? "dropzone-active" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden-file-input"
                  />

                  <div className="dropzone-icon-circle">
                    <UploadCloud size={32} />
                  </div>

                  <div className="dropzone-text-group">
                    <span className="dropzone-primary-text">
                      Drag & drop your file here, or <span className="browse-link">browse</span>
                    </span>
                    <span className="dropzone-subtext">
                      Supports PDF, DOCX, and TXT files up to 10 MB
                    </span>
                  </div>

                  {/* Formats Pills */}
                  <div className="format-pills-row">
                    <span className="format-pill pdf">.PDF</span>
                    <span className="format-pill docx">.DOCX</span>
                    <span className="format-pill txt">.TXT</span>
                  </div>
                </div>

                {/* Selected File Card Preview */}
                {selectedFile && (
                  <div className="selected-file-card animate-scale-in">
                    <div className="selected-file-left">
                      <div className="file-preview-icon">
                        <FileText size={20} />
                      </div>
                      <div className="file-meta">
                        <span className="file-name">{selectedFile.name}</span>
                        <span className="file-size">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                        </span>
                      </div>
                    </div>

                    <button
                      className="remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      title="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  className="upload-submit-btn"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadLoading}
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      <span>Processing & Embedding Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Upload & Index Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 3. ACTIVE CHAT CONVERSATION (Document uploaded) */}
          {activeChat && activeChat.document && (
            <div className="conversation-layout">
              {/* Messages Scroll Area */}
              <div className="messages-stream">
                {messages.length === 0 ? (
                  <div className="empty-conversation-state animate-fade-in">
                    <div className="empty-state-card">
                      <div className="ready-badge">
                        <FileCheck size={18} />
                        <span>Document Indexed & Ready</span>
                      </div>

                      <h3>Ask anything about your document</h3>
                      <p>
                        Doc-AI has processed <strong>{activeChat.title}</strong>. Choose a suggested prompt below or type your own question.
                      </p>

                      {/* Suggested Starter Prompts */}
                      <div className="suggested-prompts-grid">
                        {suggestedPrompts.map((item, idx) => (
                          <button
                            key={idx}
                            className="prompt-chip-btn"
                            onClick={() => handleAskQuestion(item.prompt)}
                          >
                            <span className="chip-title">{item.label}</span>
                            <span className="chip-desc">{item.prompt}</span>
                            <ArrowRight size={14} className="chip-arrow" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isUser = message.role === "user";
                    const isCopied = copiedMessageId === message._id;

                    return (
                      <div
                        key={message._id}
                        className={`message-bubble-row ${isUser ? "user-row" : "assistant-row"} animate-fade-in`}
                      >
                        {/* Avatar */}
                        <div className={`message-avatar ${isUser ? "user-avatar" : "assistant-avatar"}`}>
                          {isUser ? (
                            <span>{getUserInitials(user?.name)}</span>
                          ) : (
                            <Bot size={18} />
                          )}
                        </div>

                        {/* Content Container */}
                        <div className="message-bubble-content">
                          <div className="message-header-meta">
                            <span className="message-sender-name">
                              {isUser ? (user?.name || "You") : "Doc-AI"}
                            </span>
                            {!isUser && (
                              <button
                                className="copy-message-btn"
                                onClick={() => copyToClipboard(message.content, message._id)}
                                title="Copy answer"
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={13} color="#10b981" />
                                    <span style={{ color: "#10b981" }}>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Message Body */}
                          <div className="message-body-text">
                            {isUser ? (
                              <p>{message.content}</p>
                            ) : (
                              <ReactMarkdown
                                components={{
                                  code({ children, ...props }) {
                                    return (
                                      <code className="markdown-inline-code" {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* AI Thinking Animation */}
                {chatLoading && (
                  <div className="message-bubble-row assistant-row animate-fade-in">
                    <div className="message-avatar assistant-avatar thinking-avatar">
                      <Bot size={18} />
                    </div>
                    <div className="message-bubble-content thinking-bubble">
                      <div className="message-header-meta">
                        <span className="message-sender-name">Doc-AI</span>
                        <span className="thinking-pill">Searching Document...</span>
                      </div>
                      <div className="thinking-dots-row">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Question Input Bar */}
              <div className="question-input-bar">
                <div className="input-bar-inner">
                  <div className="input-context-banner">
                    <span className="context-label">
                      <FileText size={13} /> Active: <strong>{activeChat.title}</strong>
                    </span>
                  </div>

                  <div className="input-controls-wrapper">
                    <textarea
                      ref={textareaRef}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask a question about this document..."
                      rows={1}
                      disabled={chatLoading}
                      className="chat-textarea"
                    />

                    <button
                      className="send-query-btn"
                      onClick={() => handleAskQuestion()}
                      disabled={chatLoading || !question.trim()}
                      aria-label="Send query"
                    >
                      {chatLoading ? (
                        <Loader2 size={18} className="spinner" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>

                  <div className="input-shortcut-hint">
                    <span>Press <strong>Enter</strong> to send · <strong>Shift + Enter</strong> for a new line</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ----------------------------------------------------------------------
          LOGOUT CONFIRMATION MODAL
         ---------------------------------------------------------------------- */}
      {showLogoutConfirm && (
        <div className="modal-overlay animate-fade-in" onClick={cancelLogout}>
          <div
            className="modal-dialog-card animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon-badge">
              <LogOut size={24} />
            </div>
            <h3>Confirm Sign Out</h3>
            <p>Are you sure you want to end your session? Your conversations and uploaded documents will be safely saved.</p>

            <div className="modal-actions-row">
              <button className="modal-btn secondary" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="modal-btn danger" onClick={confirmLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;