
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
} from "lucide-react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const validExtension = /\.(mp3|wav)$/i.test(selectedFile.name);
    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
    ];

    if (!validExtension || !allowedTypes.includes(selectedFile.type)) {
      setError("Please select a valid MP3 or WAV audio file.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be below 20 MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

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

            <h3>
              {file ? file.name : "Drop your audio here"}
            </h3>

            <p>or click to browse files</p>
            <span>Supported formats: WAV, MP3 · Maximum size: 20 MB</span>

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

          <button className="analyze-button" disabled={!file}>
            Analyze Audio <Sparkles size={17} />
          </button>
        </section>

        <footer>
          © 2026 AURALIS · Intelligent Audio Restoration
        </footer>
      </main>
    </div>
  );
}

export default App;
