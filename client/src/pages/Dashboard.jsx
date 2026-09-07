import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  // Inline delete confirmation
  const [deleteChatId, setDeleteChatId] = useState(null);

  // Inline logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const cleanMarkdown = (text) => {
    if (!text) return "";

    return text
      .replace(/\\\*/g, "*")
      .replace(/\\#/g, "#")
      .replace(/\\_/g, "_")
      .replace(/\*\*(.*?)\*\*/gs, "$1")
      .replace(/__(.*?)__/gs, "$1")
      .replace(/\*(.*?)\*/gs, "$1")
      .replace(/_(.*?)_/gs, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*---+\s*$/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*/g, "")
      .replace(/##/g, "")
      .replace(/\*/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, chatLoading]);

  // Handle browser back button
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
      window.removeEventListener(
        "popstate",
        handleBrowserBack
      );
    };
  }, []);

  const loadChats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/chats",
        config
      );

      setChats(response.data.chats || []);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  const handleNewChat = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/chats",
        {},
        config
      );

      const newChat = response.data.chat;

      setChats((previousChats) => [
        newChat,
        ...previousChats,
      ]);

      setActiveChat(newChat);
      setMessages([]);
      setSelectedFile(null);
      setQuestion("");
      setOpenMenuId(null);
      setDeleteChatId(null);
    } catch (error) {
      console.error("Create chat error:", error);

      toast.error("Failed to create a new chat");
    }
  };

  const handleOpenChat = async (chatId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/chats/${chatId}`,
        config
      );

      setActiveChat(response.data.chat);
      setMessages(response.data.messages || []);

      setSelectedFile(null);
      setQuestion("");
      setOpenMenuId(null);
      setDeleteChatId(null);
    } catch (error) {
      console.error("Failed to open chat:", error);

      toast.error("Failed to load chat");
    }
  };

  const openDeleteConfirmation = (chatId) => {
    setDeleteChatId(chatId);
    setOpenMenuId(null);
  };

  const cancelDeleteChat = () => {
    setDeleteChatId(null);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/chats/${chatId}`,
        config
      );

      setChats((previousChats) =>
        previousChats.filter(
          (chat) => chat._id !== chatId
        )
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
        error.response?.data?.message ||
          "Failed to delete chat"
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        "File size must be less than 10 MB"
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!activeChat) {
      toast.error(
        "Please create a new chat first"
      );
      return;
    }

    if (!selectedFile) {
      toast.error(
        "Please select a document first"
      );
      return;
    }

    try {
      setUploadLoading(true);

      const formData = new FormData();

      formData.append(
        "document",
        selectedFile
      );

      formData.append(
        "chatId",
        activeChat._id
      );

      const response = await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        response.data.message
      );

      const updatedChat = {
        ...activeChat,
        document: response.data.document,
        title: response.data.chat.title,
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
        error.response?.data?.message ||
          "Document upload failed"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!activeChat) {
      toast.error(
        "Please create a new chat first"
      );
      return;
    }

    if (!activeChat.document) {
      toast.error(
        "Please upload a document first"
      );
      return;
    }

    if (!question.trim()) {
      return;
    }

    const userQuestion = question.trim();

    const temporaryUserMessage = {
      _id: `user-${Date.now()}`,
      role: "user",
      content: userQuestion,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      temporaryUserMessage,
    ]);

    setQuestion("");

    try {
      setChatLoading(true);

      const documentId =
        activeChat.document._id ||
        activeChat.document.id ||
        activeChat.document;

      const response = await axios.post(
        "http://localhost:5000/api/chats/ask",
        {
          question: userQuestion,
          documentId,
          chatId: activeChat._id,
        },
        config
      );

      const cleanedAnswer = cleanMarkdown(
        response.data.answer
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          _id: `assistant-${Date.now()}`,
          role: "assistant",
          content: cleanedAnswer,
        },
      ]);

      await loadChats();
    } catch (error) {
      console.error("Chat error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to get an answer"
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          _id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I was unable to process your question.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      if (!chatLoading) {
        handleAskQuestion();
      }
    }
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

    toast.success(
      "Logged out successfully"
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className={`dashboard ${theme}`}>
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <h1>Doc-AI</h1>

            <p>
              {user?.name || "User"}
            </p>
          </div>

          <button
            className="new-chat-button"
            onClick={handleNewChat}
          >
            <span>+</span>
            New Chat
          </button>

          <div className="history-header">
            <span>CHAT HISTORY</span>
          </div>

          <div className="chat-history">
            {chats.length === 0 && (
              <p className="empty-history">
                No conversations yet
              </p>
            )}

            {chats.map((chat) => (
              <div
                key={chat._id}
                className="chat-wrapper"
              >
                <div className="chat-history-item">
                  <button
                    className="chat-open-button"
                    onClick={() =>
                      handleOpenChat(chat._id)
                    }
                  >
                    <span className="chat-title">
                      {chat.title || "New Chat"}
                    </span>
                  </button>

                  <div className="chat-menu-container">
                    <button
                      className="chat-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setOpenMenuId(
                          openMenuId === chat._id
                            ? null
                            : chat._id
                        );

                        setDeleteChatId(null);
                      }}
                      aria-label="Chat options"
                    >
                      ⋮
                    </button>

                    {openMenuId === chat._id && (
                      <div className="chat-menu">
                        <button
                          className="delete-chat-button"
                          onClick={(e) => {
                            e.stopPropagation();

                            openDeleteConfirmation(
                              chat._id
                            );
                          }}
                        >
                          Delete Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Delete Confirmation */}
                {deleteChatId === chat._id && (
                  <div className="inline-confirmation">
                    <p>
                      Delete this chat?
                    </p>

                    <div className="inline-confirmation-actions">
                      <button
                        className="inline-cancel-button"
                        onClick={cancelDeleteChat}
                      >
                        Cancel
                      </button>

                      <button
                        className="inline-delete-button"
                        onClick={() =>
                          handleDeleteChat(chat._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom">
          <button
            className="theme-button"
            onClick={toggleTheme}
          >
            {theme === "light"
              ? "Dark mode"
              : "Light mode"}
          </button>

          {/* Inline Logout Confirmation */}
          {showLogoutConfirm && (
            <div className="inline-logout-confirmation">
              <p>
                Are you sure you want to log out?
              </p>

              <div className="inline-confirmation-actions">
                <button
                  className="inline-cancel-button"
                  onClick={cancelLogout}
                >
                  No
                </button>

                <button
                  className="inline-logout-button"
                  onClick={confirmLogout}
                >
                  Yes
                </button>
              </div>
            </div>
          )}

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {!activeChat && (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-label">
                DOCUMENT INTELLIGENCE
              </div>

              <h2>
                Ask questions about your
                documents.
              </h2>

              <p>
                Upload a PDF, DOCX, or TXT
                file and interact with your
                document using AI.
              </p>
            </div>
          </div>
        )}

        {activeChat && (
          <div className="chat-layout">
            <header className="chat-header">
              <div>
                <p className="chat-header-label">
                  CURRENT DOCUMENT
                </p>

                <h2>
                  {activeChat.title ||
                    "New Chat"}
                </h2>
              </div>

              <div className="header-logo">
                Doc-AI
              </div>
            </header>

            {!activeChat.document && (
              <div className="upload-screen">
                <div className="upload-card">
                  <div className="upload-icon">
                    ↑
                  </div>

                  <h2>
                    Upload your document
                  </h2>

                  <p>
                    Select a PDF, DOCX, or
                    TXT file. You can then
                    ask questions about its
                    contents.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="file-input"
                  />

                  {selectedFile && (
                    <div className="selected-file">
                      <div>
                        <span className="selected-file-label">
                          SELECTED FILE
                        </span>

                        <strong>
                          {selectedFile.name}
                        </strong>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedFile(null);

                          if (
                            fileInputRef.current
                          ) {
                            fileInputRef.current.value =
                              "";
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <button
                    className="upload-button"
                    onClick={handleUpload}
                    disabled={
                      !selectedFile ||
                      uploadLoading
                    }
                  >
                    {uploadLoading
                      ? "Processing document..."
                      : "Upload Document"}
                  </button>
                </div>
              </div>
            )}

            {activeChat.document && (
              <>
                <section className="messages-container">
                  {messages.length === 0 && (
                    <div className="empty-chat">
                      <h3>
                        Your document is ready.
                      </h3>

                      <p>
                        Ask anything about
                        its contents.
                      </p>
                    </div>
                  )}

                  {messages.map(
                    (message) => (
                      <div
                        key={message._id}
                        className={`message-row ${
                          message.role === "user"
                            ? "user-message-row"
                            : "assistant-message-row"
                        }`}
                      >
                        <div className="message-content">
                          <div className="message-label">
                            {message.role === "user"
                              ? "YOU"
                              : "DOC-AI"}
                          </div>

                          <div className="message-text">
                            {cleanMarkdown(
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {chatLoading && (
                    <div className="message-row assistant-message-row">
                      <div className="message-content">
                        <div className="message-label">
                          DOC-AI
                        </div>

                        <div className="thinking">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </section>

                <div className="question-area">
                  <div className="question-box">
                    <textarea
                      value={question}
                      onChange={(e) =>
                        setQuestion(e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="Ask something about your document..."
                      disabled={chatLoading}
                    />

                    <button
                      className="send-button"
                      onClick={handleAskQuestion}
                      disabled={
                        chatLoading ||
                        !question.trim()
                      }
                      aria-label="Send question"
                    >
                      →
                    </button>
                  </div>

                  <p className="input-help">
                    Enter to send · Shift + Enter
                    for a new line
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;