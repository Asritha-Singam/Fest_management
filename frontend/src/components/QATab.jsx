import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import ForumMessageCard from "./ForumMessageCard";
import ForumMessageInput from "./ForumMessageInput";

const QATab = ({ eventId, socket, isOrganizer }) => {
  const { token, user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [answersOpen, setAnswersOpen] = useState({});
  const [answeringTo, setAnsweringTo] = useState(null);

  const canAnswer = isOrganizer || user?.role === "organizer" || user?.role === "admin";

  useEffect(() => {
    fetchQuestions();
  }, [eventId, page]);

  useEffect(() => {
    // Socket.IO listener for new questions and answers
    if (socket) {
      socket.on("new-question", (newQuestion) => {
        if (newQuestion.eventId === eventId) {
          setQuestions(prev => [newQuestion, ...prev]);
        }
      });

      socket.on("new-answer", (newAnswer) => {
        if (newAnswer.eventId === eventId) {
          setQuestions(prev =>
            prev.map(q =>
              q._id === newAnswer.parentMessageId
                ? {
                    ...q,
                    isAnswered: true,
                    answers: [...(q.answers || []), newAnswer]
                  }
                : q
            )
          );
        }
      });

      socket.on("message-deleted", (data) => {
        if (data.eventId === eventId) {
          setQuestions(prev =>
            prev.map(q =>
              q._id === data.messageId
                ? { ...q, isDeleted: true }
                : {
                    ...q,
                    answers: q.answers
                      ? q.answers.map(answer =>
                          answer._id === data.messageId
                            ? { ...answer, isDeleted: true }
                            : answer
                        )
                      : q.answers
                  }
            )
          );
        }
      });

      socket.on("reaction-updated", (data) => {
        if (data.eventId === eventId) {
          setQuestions(prev =>
            prev.map(q => {
              if (q._id === data.messageId) {
                return { ...q, reactions: data.reactions };
              }

              if (q.answers) {
                return {
                  ...q,
                  answers: q.answers.map(answer =>
                    answer._id === data.messageId
                      ? { ...answer, reactions: data.reactions }
                      : answer
                  )
                };
              }

              return q;
            })
          );
        }
      });

      return () => {
        socket.off("new-question");
        socket.off("new-answer");
        socket.off("message-deleted");
        socket.off("reaction-updated");
      };
    }
  }, [eventId, socket]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/events/${eventId}/forum/qa?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (page === 1) {
        setQuestions(response.data.questions);
      } else {
        setQuestions(prev => [...prev, ...response.data.questions]);
      }
      setHasMore(response.data.hasMore);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handlePostQuestion = async (content) => {
    try {
      const response = await api.post(
        `/events/${eventId}/forum/messages`,
        {
          content,
          messageType: "question"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const useRealtime = Boolean(socket && socket.connected);

      const newQuestion = {
        ...response.data.data,
        answers: [],
        isAnswered: false
      };

      if (!useRealtime) {
        setQuestions(prev => [newQuestion, ...prev]);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Failed to post question");
    }
  };

  const handlePostAnswer = async (content, questionId) => {
    try {
      const response = await api.post(
        `/events/${eventId}/forum/messages`,
        {
          content,
          messageType: "answer",
          parentMessageId: questionId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const useRealtime = Boolean(socket && socket.connected);

      // Mark question as answered
      await api.patch(
        `/events/${eventId}/forum/questions/${questionId}/answered`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!useRealtime) {
        setQuestions(prev =>
          prev.map(q =>
            q._id === questionId
              ? {
                  ...q,
                  isAnswered: true,
                  answers: [...(q.answers || []), response.data.data]
                }
              : q
          )
        );
      }

      setAnsweringTo(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post answer");
    }
  };

  const handleDeleteMessage = async (messageId, questionId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await api.delete(
          `/events/${eventId}/forum/messages/${messageId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setQuestions(prev =>
          prev.map(q =>
            q._id === questionId
              ? {
                  ...q,
                  answers: q.answers.map(a =>
                    a._id === messageId ? { ...a, isDeleted: true } : a
                  )
                }
              : q._id === messageId
              ? { ...q, isDeleted: true }
              : q
          )
        );

      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete message");
      }
    }
  };

  const handleToggleAnswers = async (questionId) => {
    if (answersOpen[questionId]) {
      setAnswersOpen(prev => ({
        ...prev,
        [questionId]: false
      }));
    } else {
      setAnswersOpen(prev => ({
        ...prev,
        [questionId]: true
      }));
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      const response = await api.post(
        `/events/${eventId}/forum/messages/${messageId}/reaction`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions(prev =>
        prev.map(q => {
          if (q._id === messageId) {
            return { ...q, reactions: response.data.data.reactions };
          }

          if (q.answers) {
            return {
              ...q,
              answers: q.answers.map(answer =>
                answer._id === messageId
                  ? { ...answer, reactions: response.data.data.reactions }
                  : answer
              )
            };
          }

          return q;
        })
      );

    } catch (err) {
      setError("Failed to add reaction");
    }
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    gap: "15px"
  };

  const questionsContainerStyle = {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column-reverse",
    gap: "10px",
    paddingRight: "5px"
  };

  const questionCardStyle = {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    borderLeft: "4px solid #007bff"
  };

  const answersContainerStyle = {
    marginTop: "10px",
    backgroundColor: "#ffffff",
    padding: "10px",
    borderRadius: "6px",
    borderLeft: "2px solid #28a745"
  };

  const inputContainerStyle = {
    borderTop: "1px solid #e0e0e0",
    paddingTop: "10px",
    flexShrink: 0
  };

  const noAnsweredStyle = {
    fontSize: "12px",
    color: "#dc3545",
    padding: "8px",
    backgroundColor: "#fff5f5",
    borderRadius: "4px",
    marginTop: "8px"
  };

  return (
    <div style={containerStyle}>
      {error && (
        <div style={{ color: "red", fontSize: "12px", backgroundColor: "#ffe0e0", padding: "10px", borderRadius: "5px" }}>
          {error}
        </div>
      )}

      <div style={questionsContainerStyle}>
        <p style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>
          🔴 Red = Unanswered | 🟢 Green = Answered
        </p>

        {loading && <p style={{ textAlign: "center", color: "#999" }}>Loading questions...</p>}

        {questions.map(question => (
          <div key={question._id} style={questionCardStyle}>
            <ForumMessageCard
              message={question}
              onAddReaction={(emoji) => handleAddReaction(question._id, emoji)}
              onDelete={canAnswer ? () => handleDeleteMessage(question._id, question._id) : undefined}
              eventId={eventId}
            />

            <div style={{ marginTop: "6px" }}>
              {question.isAnswered ? (
                <span style={{ fontSize: "11px", backgroundColor: "#d4edda", color: "#155724", padding: "4px 8px", borderRadius: "3px" }}>
                  ✓ Answered
                </span>
              ) : (
                <span style={noAnsweredStyle}>⚠ Needs answer</span>
              )}
            </div>

            <button
              onClick={() => handleToggleAnswers(question._id)}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                backgroundColor: question.isAnswered ? "#28a745" : "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              {answersOpen[question._id]
                ? "Hide Answers"
                : question.isAnswered
                ? `View Answers (${question.answers?.length || 0})`
                : "View & Reply"}
            </button>

            {answersOpen[question._id] && (
              <div style={answersContainerStyle}>
                <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "500", color: "#28a745" }}>
                  📝 Answers ({question.answers?.length || 0}):
                </p>

                {question.answers && question.answers.length > 0 ? (
                  question.answers.map(answer => (
                    <ForumMessageCard
                      key={answer._id}
                      message={answer}
                      onAddReaction={(emoji) => handleAddReaction(answer._id, emoji)}
                      onDelete={canAnswer ? () => handleDeleteMessage(answer._id, question._id) : undefined}
                      isReply={true}
                      eventId={eventId}
                    />
                  ))
                ) : (
                  <p style={{ fontSize: "12px", color: "#999", margin: "0" }}>No answers yet</p>
                )}

                {canAnswer && answeringTo !== question._id && (
                  <button
                    onClick={() => setAnsweringTo(question._id)}
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    + Add Answer
                  </button>
                )}

                {canAnswer && answeringTo === question._id && (
                  <div style={{ marginTop: "10px" }}>
                    <ForumMessageInput
                      onSubmit={(content) => handlePostAnswer(content, question._id)}
                      onCancel={() => setAnsweringTo(null)}
                      placeholder="Your answer..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {hasMore && (
          <button
            onClick={() => setPage(prev => prev + 1)}
            style={{
              padding: "10px",
              backgroundColor: "#f0f0f0",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#666"
            }}
          >
            Load more questions
          </button>
        )}
      </div>

      <div style={inputContainerStyle}>
        {!canAnswer ? (
          <>
            <p style={{ fontSize: "12px", color: "#666", margin: "0 0 10px 0" }}>
              Ask a question to the organizer:
            </p>
            <ForumMessageInput
              onSubmit={handlePostQuestion}
              placeholder="Type your question..."
            />
          </>
        ) : (
          <p style={{ fontSize: "12px", color: "#999", margin: "0" }}>
            As an organizer, you can view and answer participant questions above.
          </p>
        )}
      </div>
    </div>
  );
};

export default QATab;
