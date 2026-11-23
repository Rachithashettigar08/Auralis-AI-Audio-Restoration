
import { useState } from "react";
import {
  AudioWaveform,
  Upload,
  Music2,
  Waves,
  History,
  Settings,
  Headphones,
  Sparkles,
  Activity,
  Volume2,
  Radio,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validExtension = /\.(mp3|wav)$/i.test(selectedFile.name);
    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/mp3",
    ];

    if (!validExtension || !allowedTypes.includes(selectedFile.type)) {
      setError("Please select a valid MP3 or WAV audio file.");
      setFile(null);
      setShowResults(false);
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be below 20 MB.");
      setFile(null);
      setShowResults(false);
      return;
    }

    setError("");
    setFile(selectedFile);
    setShowResults(false);
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    setShowResults(false);
  };

  const analyzeAudio = () => {
    if (file) {
      setShowResults(true);
    }
  };

  const issues = [
    {
      name: "Background Noise",
      description: "Unwanted environmental noise detected",
      level: "High",
      value: "78%",
      icon: Volume2,
      color: "#f87171",
    },
    {
      name: "Echo",
      description: "Noticeable audio reflections detected",
      level: "Medium",
      value: "52%",
      icon: Radio,
      color: "#fbbf24",
    },
    {
      name: "Reverberation",
      description: "Room reflections detected",
      level: "Low",
      value: "24%",
      icon: Waves,
      color: "#34d399",
    },
    {
      name: "Audio Clipping",
      description: "Possible signal distortion detected",
      level: "Medium",
      value: "46%",
      icon: Activity,
      color: "#fbbf24",
    },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>
          <AudioWaveform /> AURALIS
        </h2>

        <p className="tagline">Intelligent Audio Restoration</p>

        <nav>
          <a className="active"><Music2 /> Dashboard</a>
          <a><Waves /> Audio Restoration</a>
          <a><History /> History</a>
          <a><Settings /> Settings</a>
        </nav>

        <div className="sidebar-bottom">
          <Headphones />
          <span>Restore your sound.</span>
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <p className="eyebrow">AUDIO WORKSPACE</p>
            <h1>Dashboard</h1>
            <p>Bring your audio back to life.</p>
          </div>
          <div className="profile">A</div>
        </header>

        <section className="welcome">
          <div>
            <span className="welcome-label">
              <Sparkles size={16} /> AI-POWERED AUDIO
            </span>
            <h2>
              Every sound deserves
              <br />
              to be heard clearly.
            </h2>
            <p>
              Upload your audio and let AURALIS analyze and restore it.
            </p>
          </div>
          <AudioWaveform className="hero-icon" />
        </section>

        <section className="upload-section">
          <h2>Upload your audio</h2>
          <p>Start by selecting an audio file to analyze.</p>

          <label className="upload-box">
            <Upload size={36} />
            <h3>{file ? file.name : "Drop your audio here"}</h3>
            <p>or click to browse files</p>
            <span>
              Supported formats: WAV, MP3 · Maximum size: 20 MB
            </span>
            <input
              type="file"
              accept=".wav,.mp3,audio/wav,audio/mpeg"
              onChange={handleFileChange}
              hidden
            />
          </label>

          {error && (
            <p style={{ color: "#fca5a5", marginTop: "12px" }}>
              {error}
            </p>
          )}

          {file && (
            <div className="selected-file">
              <Music2 />
              <span>{file.name}</span>
              <button onClick={removeFile}>Remove</button>
            </div>
          )}

          <button
            className="analyze-button"
            disabled={!file}
            onClick={analyzeAudio}
          >
            Analyze Audio <Sparkles size={17} />
          </button>
        </section>

        {showResults && (
          <section className="analysis-section">
            <div className="analysis-heading">
              <div>
                <p className="eyebrow">AUDIO DIAGNOSTICS</p>
                <h2>Analysis Results</h2>
                <p>Audio degradation overview for {file.name}</p>
              </div>
              <span className="sample-label">DEMO DATA</span>
            </div>

            <div className="quality-card">
              <div className="quality-icon">
                <Activity size={25} />
              </div>
              <div>
                <p>Overall Audio Quality</p>
                <h3>62<span>/100</span></h3>
                <span className="quality-status">
                  <AlertTriangle size={14} /> Needs Improvement
                </span>
              </div>
            </div>

            <h3 className="issues-title">Detected Audio Issues</h3>

            <div className="issues-grid">
              {issues.map((issue) => {
                const Icon = issue.icon;
                return (
                  <div className="issue-card" key={issue.name}>
                    <div className="issue-top">
                      <div className="issue-icon">
                        <Icon size={21} />
                      </div>
                      <span style={{ color: issue.color }}>
                        {issue.level}
                      </span>
                    </div>
                    <h3>{issue.name}</h3>
                    <p>{issue.description}</p>
                    <div className="issue-progress">
                      <div
                        style={{
                          width: issue.value,
                          background: issue.color,
                        }}
                      />
                    </div>
                    <span className="issue-value">
                      Detection level: {issue.value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="recommendation-card">
              <Sparkles size={22} />
              <div>
                <h3>Recommended Next Step</h3>
                <p>
                  Apply noise reduction and echo cancellation to improve
                  the overall audio quality.
                </p>
              </div>
              <CheckCircle2 size={22} />
            </div>

            <p className="demo-note">
              <AlertTriangle size={14} />
              These are demonstration values for frontend testing.
              Actual analysis will be provided by the backend.
            </p>
          </section>
        )}

        <footer>
          © 2026 AURALIS · Intelligent Audio Restoration
        </footer>
      </main>
    </div>
  );
}

export default App;
