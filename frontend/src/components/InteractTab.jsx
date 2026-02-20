import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import ForumMessageCard from "./ForumMessageCard";
import ForumMessageInput from "./ForumMessageInput";

const InteractTab = ({ eventId, socket, isOrganizer }) => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const uniqueById = (items) => {
    const seen = new Set();
    const unique = [];

    for (const item of items) {
      if (!item || !item._id) {
        continue;
      }

      if (!seen.has(item._id)) {
        seen.add(item._id);
        unique.push(item);
      }
    }

    return unique;
  };

  useEffect(() => {
    fetchMessages();
  }, [eventId, page]);

  useEffect(() => {
    // Socket.IO listener for new messages
    if (socket) {
      socket.on("new-message", (newMessage) => {
        if (newMessage.eventId !== eventId) {
          return;
        }

        if (!newMessage.parentMessageId) {
          setMessages(prev => {
            if (prev.some(m => m._id === newMessage._id)) {
              return prev;
            }

            return [newMessage, ...prev];
          });
          return;
        }

        setMessages(prev =>
          prev.map(msg => {
            if (msg._id !== newMessage.parentMessageId) {
              return msg;
            }

            const replies = msg.replies || [];
            if (replies.some(reply => reply._id === newMessage._id)) {
              return msg;
            }

            return {
              ...msg,
              replies: [...replies, newMessage]
            };
          })
        );
      });

      socket.on("message-deleted", (data) => {
        if (data.eventId === eventId) {
          setMessages(prev =>
            prev.map(msg =>
              msg._id === data.messageId
                ? { ...msg, isDeleted: true }
                : {
                    ...msg,
                    replies: msg.replies
                      ? msg.replies.map(reply =>
                          reply._id === data.messageId
                            ? { ...reply, isDeleted: true }
                            : reply
                        )
                      : msg.replies
                  }
            )
          );
          
          // Also mark as deleted in pinned messages
          setPinnedMessages(prev =>
            prev.map(msg =>
              msg._id === data.messageId
                ? { ...msg, isDeleted: true }
                : msg
            )
          );
        }
      });

      socket.on("reaction-updated", (data) => {
        if (data.eventId === eventId) {
          setMessages(prev =>
            prev.map(msg =>
              msg._id === data.messageId
                ? { ...msg, reactions: data.reactions }
                : {
                    ...msg,
                    replies: msg.replies
                      ? msg.replies.map(reply =>
                          reply._id === data.messageId
                            ? { ...reply, reactions: data.reactions }
                            : reply
                        )
                      : msg.replies
                  }
            )
          );
        }
      });

      socket.on("message-pinned", (data) => {
        if (data.eventId !== eventId) return;

        if (data.isPinned) {
          setMessages(prev => {
            const msgToPin = prev.find(m => m._id === data.messageId);

            if (msgToPin) {
              setPinnedMessages(prevPinned => {
                const nextPinned = prevPinned.some(m => m._id === data.messageId)
                  ? prevPinned.map(m =>
                      m._id === data.messageId ? { ...m, isPinned: true } : m
                    )
                  : [{ ...msgToPin, isPinned: true }, ...prevPinned];

                return uniqueById(nextPinned);
              });
            }

            return prev.filter(msg => msg._id !== data.messageId);
          });
        } else {
          setPinnedMessages(prev => {
            const msgToUnpin = prev.find(m => m._id === data.messageId);

            if (msgToUnpin) {
              setMessages(prevMsgs => {
                const nextMessages = prevMsgs.some(m => m._id === data.messageId)
                  ? prevMsgs.map(m =>
                      m._id === data.messageId ? { ...m, isPinned: false } : m
                    )
                  : [{ ...msgToUnpin, isPinned: false }, ...prevMsgs];

                return uniqueById(nextMessages);
              });
            }

            return prev.filter(msg => msg._id !== data.messageId);
          });
        }
      });

      return () => {
        socket.off("new-message");
        socket.off("message-deleted");
        socket.off("reaction-updated");
        socket.off("message-pinned");
      };
    }
  }, [eventId, socket]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/events/${eventId}/forum/interact?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (page === 1) {
        setPinnedMessages(uniqueById(response.data.pinnedMessages || []));
        setMessages(uniqueById(response.data.messages || []));
      } else {
        setMessages(prev => uniqueById([...prev, ...(response.data.messages || [])]));
      }
      setHasMore(response.data.hasMore);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handlePostMessage = async (content, parentId = null) => {
    try {
      const response = await api.post(
        `/events/${eventId}/forum/messages`,
        {
          content,
          messageType: "message",
          parentMessageId: parentId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const useRealtime = Boolean(socket && socket.connected);

      if (!parentId) {
        // New top-level message
        if (!useRealtime) {
          setMessages(prev => [response.data.data, ...prev]);
        }
      } else {
        // Reply to a message - reload replies
        if (!useRealtime) {
          handleToggleReplies(parentId);
        }
      }

      setReplyingTo(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await api.delete(
          `/events/${eventId}/forum/messages/${messageId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update in regular messages
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? { ...msg, isDeleted: true } : msg
          )
        );

        // Also update in pinned messages if it exists there
        setPinnedMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? { ...msg, isDeleted: true } : msg
          )
        );

      } catch (err) {
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            "Only organizers and admins can delete messages";
        setError(errorMessage);
        console.error("Delete error:", err);
      }
    }
  };

  const handleToggleReplies = async (messageId) => {
    if (repliesOpen[messageId]) {
      setRepliesOpen(prev => ({
        ...prev,
        [messageId]: false
      }));
    } else {
      try {
        const response = await api.get(
          `/events/${eventId}/forum/messages/${messageId}/replies`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId
              ? { ...msg, replies: response.data.replies }
              : msg
          )
        );

        setRepliesOpen(prev => ({
          ...prev,
          [messageId]: true
        }));
      } catch (err) {
        setError("Failed to load replies");
      }
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      const response = await api.post(
        `/events/${eventId}/forum/messages/${messageId}/reaction`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, reactions: response.data.data.reactions }
            : {
                ...msg,
                replies: msg.replies
                  ? msg.replies.map(reply =>
                      reply._id === messageId
                        ? { ...reply, reactions: response.data.data.reactions }
                        : reply
                    )
                  : msg.replies
              }
        )
      );

    } catch (err) {
      setError("Failed to add reaction");
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      const response = await api.patch(
        `/events/${eventId}/forum/messages/${messageId}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const useRealtime = Boolean(socket && socket.connected);
      if (useRealtime) {
        return;
      }

      const isPinned = response.data.data.isPinned;
      const messageToMove = messages.find(m => m._id === messageId);

      if (isPinned && messageToMove) {
        // Moving from messages to pinnedMessages
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        setPinnedMessages(prev => {
          const nextPinned = prev.some(m => m._id === messageId)
            ? prev.map(m =>
                m._id === messageId ? { ...m, isPinned: true } : m
              )
            : [{ ...messageToMove, isPinned: true }, ...prev];

          return uniqueById(nextPinned);
        });
      } else if (!isPinned) {
        // Moving from pinnedMessages back to messages
        const pinnedMsg = pinnedMessages.find(m => m._id === messageId);
        if (pinnedMsg) {
          setPinnedMessages(prev => prev.filter(msg => msg._id !== messageId));
          setMessages(prev => {
            const nextMessages = prev.some(m => m._id === messageId)
              ? prev.map(m =>
                  m._id === messageId ? { ...m, isPinned: false } : m
                )
              : [{ ...pinnedMsg, isPinned: false }, ...prev];

            return uniqueById(nextMessages);
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to pin/unpin message");
    }
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    gap: "15px"
  };

  const messagesContainerStyle = {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column-reverse",
    gap: "10px",
    paddingRight: "5px"
  };

  const loadMoreStyle = {
    padding: "10px",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#666"
  };

  const inputContainerStyle = {
    borderTop: "1px solid #e0e0e0",
    paddingTop: "10px",
    flexShrink: 0
  };

  return (
    <div style={containerStyle}>
      {error && (
        <div style={{ color: "red", fontSize: "12px", backgroundColor: "#ffe0e0", padding: "10px", borderRadius: "5px" }}>
          {error}
        </div>
      )}

      <div style={messagesContainerStyle}>
        {loading && <p style={{ textAlign: "center", color: "#999" }}>Loading messages...</p>}

        {/* Display pinned messages */}
        {pinnedMessages.length > 0 && (
          <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "2px solid #ffc107" }}>
            <p style={{ fontSize: "11px", color: "#ffc107", fontWeight: "bold", margin: "0 0 10px 0" }}>📌 PINNED</p>
            {pinnedMessages.map(message => (
              <div key={message._id} style={{ marginBottom: "10px" }}>
                <ForumMessageCard
                  message={message}
                  onDelete={() => handleDeleteMessage(message._id)}
                  onAddReaction={(emoji) => handleAddReaction(message._id, emoji)}
                  onPin={() => handlePinMessage(message._id)}
                  onReply={() => setReplyingTo(message._id)}
                  isOrganizer={isOrganizer}
                  eventId={eventId}
                />
              </div>
            ))}
          </div>
        )}

        {messages.map(message => (
          <div key={message._id}>
            <ForumMessageCard
              message={message}
              onDelete={() => handleDeleteMessage(message._id)}
              onAddReaction={(emoji) => handleAddReaction(message._id, emoji)}
              onPin={() => handlePinMessage(message._id)}
              onReply={() => setReplyingTo(message._id)}
              isOrganizer={isOrganizer}
              eventId={eventId}
            />

            {/* Thread replies */}
            {repliesOpen[message._id] && message.replies && (
              <div style={{ marginLeft: "20px", marginTop: "10px", borderLeft: "2px solid #ddd", paddingLeft: "10px" }}>
                {message.replies.map(reply => (
                  <ForumMessageCard
                    key={reply._id}
                    message={reply}
                    onDelete={() => handleDeleteMessage(reply._id)}
                    onAddReaction={(emoji) => handleAddReaction(reply._id, emoji)}
                    isReply={true}
                    isOrganizer={isOrganizer}
                    eventId={eventId}
                  />
                ))}

                {replyingTo === message._id && (
                  <div style={{ marginTop: "10px" }}>
                    <ForumMessageInput
                      onSubmit={(content) => {
                        handlePostMessage(content, message._id);
                        setReplyingTo(null);
                      }}
                      onCancel={() => setReplyingTo(null)}
                      placeholder="Write a reply..."
                    />
                  </div>
                )}

                {replyingTo !== message._id && (
                  <button
                    onClick={() => setReplyingTo(message._id)}
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Reply
                  </button>
                )}
              </div>
            )}

            {!repliesOpen[message._id] && !message.isDeleted && (
              <button
                onClick={() => handleToggleReplies(message._id)}
                style={{
                  marginLeft: "20px",
                  marginTop: "5px",
                  padding: "5px 10px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#666"
                }}
              >
                Show replies
              </button>
            )}
          </div>
        ))}

        {hasMore && (
          <button onClick={() => setPage(prev => prev + 1)} style={loadMoreStyle}>
            Load more messages
          </button>
        )}
      </div>

      <div style={inputContainerStyle}>
        {replyingTo === null ? (
          <ForumMessageInput onSubmit={(content) => handlePostMessage(content)} />
        ) : (
          <p style={{ fontSize: "12px", color: "#666" }}>
            Replying to a message... <button onClick={() => setReplyingTo(null)}>Cancel</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default InteractTab;
