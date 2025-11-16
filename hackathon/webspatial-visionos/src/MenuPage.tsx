import { useNavigate } from "react-router-dom";
import "./MenuPage.css";

function MenuPage() {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate("/whiteboard");
  };

  const handleExisting = () => {
    navigate("/whiteboard");
  };

  const handleJoin = () => {
    navigate("/whiteboard");
  };

  return (
    <div className="menu-page">
      <div className="menu-container">
        <h1 className="menu-title">Welcome to Your Workspace</h1>
        <p className="menu-subtitle">Choose an option to get started</p>

        <div className="menu-options">
          <button className="menu-option create" onClick={handleCreateNew}>
            <div className="option-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h2 className="option-title">Create New Workspace</h2>
            <p className="option-description">Start fresh with a blank canvas</p>
          </button>

          <button className="menu-option existing" onClick={handleExisting}>
            <div className="option-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM9 9h6v6H9z" />
              </svg>
            </div>
            <h2 className="option-title">Open Existing Workspace</h2>
            <p className="option-description">Continue working on your projects</p>
          </button>

          <button className="menu-option join" onClick={handleJoin}>
            <div className="option-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="option-title">Join Workspace</h2>
            <p className="option-description">Collaborate with your team</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
