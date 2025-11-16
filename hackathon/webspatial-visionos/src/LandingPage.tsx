import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import "./LandingPage.css";
import { initScene } from "@webspatial/react-sdk";

function LandingPage() {
  const handleOpenChatbot = () => {
    // Initialize the chatbot scene with custom size
    initScene("chatbotScene", (prevConfig) => {
      return {
        ...prevConfig,
        defaultSize: {
          width: 800,
          height: 600,
        },
      };
    });

    // Open backend chatbot in a new spatial window
    window.open("http://10.19.182.152:8791/", "chatbotScene");
  };

  return (
    <div
      className="tldraw-transparent"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "transparent",
      }}
    >
      <Tldraw />

      {/* Floating button to open chatbot */}
      <button
        className="chatbot-button"
        enable-xr
        onClick={handleOpenChatbot}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          padding: "16px 24px",
          fontSize: "16px",
          fontWeight: "600",
          color: "white",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }}
      >
        Open AI Chatbot
      </button>
    </div>
  );
}

export default LandingPage;
