import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/button";
import { SendHorizontal, Image, Mic } from "lucide-react";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";

const USER_ID = "pk"; // Static for now, can be dynamic

const ChatBox: React.FC = () => {
  const router = useRouter();
  const { qtype } = router.query;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [medicalCenters, setMedicalCenters] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);
  

  useEffect(() => {
    initializeFirstChat(qtype as string);
}, [qtype]);

const initializeFirstChat = async (qtype: string) => {
  try {
      const response = await fetch("http://localhost:5000/doctor/firsttime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: USER_ID, qtype: qtype }),
      });

      if (response.ok) {
        const data = await response.json();
        handleBotResponse(data);
      }
  } catch (error) {
      console.error("Error initializing chat:", error);
  }
};

const sendMessage = async (message: string) => {
  if (!message.trim() && !image) return;
  
  if (image) {
    setMessages((prev) => [...prev, { sender: "user", text: message, image: URL.createObjectURL(image) }]);
    setInput("");
    setImage(null);
    
    const formData = new FormData();
    formData.append("email", USER_ID);
    formData.append("message", message);
    formData.append("image", image);
    
    try {
      const response = await fetch("http://localhost:5000/doctor/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      handleBotResponse(data);
    } catch (error) {
      console.error("Error sending message with image:", error);
    }
  } else {
    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setInput("");
    
    try {
      const response = await fetch("http://localhost:5000/doctor/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: USER_ID, message }),
      });
      
      const data = await response.json();
      handleBotResponse(data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
};


  const handleBotResponse = (data: any) => {
    setMessages((prev) => [...prev, {
      sender: "bot",
      text: data.textMessage,
      question: data.question,
      suggestedReplys: data.suggestedReplys || [],
      map: data.map,
      image: data.imageUrl
    }]);
    
    if (data.map && data.map.query) {
      fetchMedicalCenters(data.map.query);
    }
  };

  const fetchMedicalCenters = async (query: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setMedicalCenters(data);
    } catch (error) {
      console.error("Error fetching medical centers:", error);
    }
  };

  // Function to handle MCQ selection
  const handleMcqSelection = (option: string) => {
    sendMessage(option);
  };

  // Function to handle MSQ selection
  const handleMsqSelection = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  // Function to submit MSQ answers
  const submitMsq = () => {
    if (selectedOptions.length > 0) {
      sendMessage(selectedOptions.join(", "));
      setSelectedOptions([]); // Reset selection
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImage(acceptedFiles[0]);
        setIsDropzoneOpen(false);
      }
    },
  });

  return (
    <Layout>
      <div style={styles.chatContainer}>
        {/* Chat messages */}
        <div style={styles.chatMessages}>
          {messages.map((msg, index) => (
            <div key={index} style={msg.sender === "user" ? styles.userMessage : styles.botMessage}>
              {/* Display plain text messages */}
              {msg.image && <img src={msg.image} alt="Uploaded" style={{ width: "400px", borderRadius: "8px" }} />}
              {msg.text && <p>{msg.text}</p>}

              {/* Display Text Type Question */}
              {msg.question?.type === "text" && <p>{msg.question.question}</p>}

              {/* Display MCQ Question */}
              {msg.question?.type === "mcq" && (
                <div>
                  <p>{msg.question.question}</p>
                  {msg.question.options.map((option: string, i: number) => (
                    <Button key={i} style={styles.optionButton} onClick={() => handleMcqSelection(option)}>
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {/* Display MSQ Question */}
              {msg.question?.type === "msq" && (
                <div>
                  <p>{msg.question.question}</p>
                  {msg.question.options.map((option: string, i: number) => (
                    <Button
                      key={i}
                      style={{
                        ...styles.optionButton,
                        backgroundColor: selectedOptions.includes(option) ? "#90caf9" : "#e3f2fd",
                      }}
                      onClick={() => handleMsqSelection(option)}
                    >
                      {option}
                    </Button>
                  ))}
                  <Button style={styles.submitButton} onClick={submitMsq}>
                    Submit
                  </Button>
                </div>
              )}

              {/* Display Suggested Replies */}
              {msg.suggestedReplys && msg.suggestedReplys.length > 0 && (
                <div style={styles.suggestedRepliesContainer}>
                  {msg.suggestedReplys.map((reply: string, i: number) => (
                    <Button key={i} style={styles.suggestedReplyButton} onClick={() => sendMessage(reply)}>
                      {reply}
                    </Button>
                  ))}
                </div>
              )}

              {/* Display Map Description */}
              {msg.map && (
                <div>
                  <p>{msg.map.description}</p>
                </div>
              )}
            </div>
          ))}

          {/* Display Medical Centers */}
          {medicalCenters.length > 0 && (
            <div style={styles.medicalCentersContainer}>
              {medicalCenters.map((center, index) => (
                <div key={index} style={styles.medicalCenterCard}>
                  <h3>{center.name}</h3>
                  <p>Rating: {center.rating}</p>
                  <p>Reviews: {center.reviews}</p>
                  <p>Specialization: {center.specialization}</p>
                  <p>Address: {center.address}</p>
                  <a href={center.profileLink} target="_blank" rel="noopener noreferrer" style={styles.mapLink}>
                    View on Map
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={styles.inputContainer}>
        <Button variant="ghost" style={styles.iconButton} onClick={() => setIsDropzoneOpen(true)}>
            <Image size={20} />
          </Button>
          <Input
            type="text"
            placeholder="Type your message..."
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <Button variant="ghost" style={styles.iconButton}>
            <Mic size={20} />
          </Button>
          <Button variant="ghost" style={styles.sendButton} onClick={() => sendMessage(input)}>
            <SendHorizontal size={20} />
          </Button>
        </div>
        {isDropzoneOpen && (
          <div {...getRootProps()} style={{ border: "2px dashed #ccc", padding: "20px", marginTop: "10px", textAlign: "center" }}>
            <input {...getInputProps()} />
            <p>Drag & drop an image here, or click to select one</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChatBox;

const styles: { [key: string]: React.CSSProperties } = {
  chatContainer: {
    width: "90%",
    margin: "auto",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    paddingBottom: "80px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    padding: "5px 16px",
    borderRadius: "15px",
    minWidth: "10%",
    maxWidth: "60%",
    textAlign: "right",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EAEAEA",
    padding: "12px 16px",
    borderRadius: "15px",
    maxWidth: "60%",
    textAlign: "left",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
  },
  optionButton: {
    borderRadius: "20px",
    padding: "10px 15px",
    margin: "5px",
    cursor: "pointer",
  },
  submitButton: {
    backgroundColor: "#b2dfdb",
    borderRadius: "20px",
    padding: "10px 15px",
    margin: "10px 0",
    cursor: "pointer",
  },
  suggestedRepliesContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "5px",
    flexWrap: "wrap",
  },
  suggestedReplyButton: {
    backgroundColor: "#e3f2fd",
    borderRadius: "20px",
    padding: "8px 12px",
    cursor: "pointer",
  },
  inputContainer: {
    width: "80%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px",
    borderTop: "1px solid #ddd",
    position: "fixed",
    bottom: 0,
    backgroundColor: "#FFFCF8",
  },
  input: {
    flex: 1,
    borderRadius: "20px",
    padding: "10px",
    border: "1px solid #ddd",
  },
  iconButton: {
    background: "transparent",
    borderRadius: "50%",
    padding: "10px",
  },
  sendButton: {
    background: "#ffccbc",
    borderRadius: "50%",
    padding: "10px",
  },
  medicalCentersContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },
  medicalCenterCard: {
    backgroundColor: "#f5f5f5",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  mapLink: {
    color: "#1976d2",
    textDecoration: "none",
    fontWeight: "bold",
  },
};