
import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
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
  CheckCircle2,
  AlertTriangle,
  Zap,
  Download,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "./App.css";

// ----------------------------------
// AUDIO WAVEFORM PLAYER
// ----------------------------------

function AudioWaveformPlayer({ audioUrl, label, color }) {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: color,
      progressColor: "#a78bfa",
      height: 75,
      barWidth: 2,
      barGap: 2,
      barRadius: 3,
      cursorColor: "#ffffff",
    });

    wavesurferRef.current = wavesurfer;
    wavesurfer.load(audioUrl);

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl, color]);

  return (
    <div className="audio-player-card">
      <h3>{label}</h3>

      <div ref={waveformRef} className="waveform" />

      <button
        type="button"
        className="play-button"
        onClick={() => wavesurferRef.current?.playPause()}
        disabled={!audioUrl}
      >
        Play / Pause
      </button>
    </div>
  );
}

// ----------------------------------
// MAIN APP
// ----------------------------------

function App() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [restoredAudioUrl, setRestoredAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [restoreMessage, setRestoreMessage] = useState("");

  // Release temporary original audio URL when it changes or component unmounts.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // ----------------------------------
  // FILE UPLOAD
  // ----------------------------------

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
    setAudioUrl(URL.createObjectURL(selectedFile));
    setRestoredAudioUrl("");
    setShowResults(false);
    setSelectedMethods([]);
    setRestoreMessage("");
  };

  const removeFile = () => {
    setFile(null);
    setAudioUrl("");
    setRestoredAudioUrl("");
    setError("");
    setShowResults(false);
    setSelectedMethods([]);
    setRestoreMessage("");
  };

  const analyzeAudio = () => {
    if (file) {
      setShowResults(true);
    }
  };

  // ----------------------------------
  // RESTORATION METHODS
  // ----------------------------------

  const methods = [
    {
      id: "noise",
      name: "Noise Reduction",
      description: "Remove unwanted background noise.",
      icon: Volume2,
      tag: "DSP Processing",
    },
    {
      id: "echo",
      name: "Echo Cancellation",
      description: "Reduce unwanted echo and reflections.",
      icon: Radio,
      tag: "Echo Control",
    },
    {
      id: "reverb",
      name: "Reverb Reduction",
      description: "Reduce excessive room reverberation.",
      icon: Waves,
      tag: "Acoustic Repair",
    },
    {
      id: "clipping",
      name: "Clipping Repair",
      description: "Repair distorted audio peaks where possible.",
      icon: Activity,
      tag: "Signal Repair",
    },
    {
      id: "ai",
      name: "AI Speech Enhancement",
      description: "Improve speech clarity using AI processing.",
      icon: Sparkles,
      tag: "AI Powered",
    },
  ];

  const toggleMethod = (id) => {
    setSelectedMethods((current) =>
      current.includes(id)
        ? current.filter((method) => method !== id)
        : [...current, id]
    );

    setRestoreMessage("");
  };

  const handleRestore = () => {
    setRestoreMessage(
      "Your restoration preferences are selected! Backend integration will enable actual audio restoration."
    );
  };

  // ----------------------------------
  // DEMONSTRATION ANALYSIS DATA
  // ----------------------------------

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

  // Feature 5: chart data.
  // Replace these demonstration values with backend results later.

  const degradationData = issues.map((issue) => ({
    name: issue.name,
    level: Number.parseInt(issue.value, 10),
  }));

  const qualityComparison = [
    { name: "Original Audio", score: 62 },
    { name: "Restored Audio", score: 88 },
  ];

  // ----------------------------------
  // DASHBOARD
  // ----------------------------------

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <h2>
          <AudioWaveform /> AURALIS
        </h2>

        <p className="tagline">Intelligent Audio Restoration</p>

        <nav>
          <a className="active">
            <Music2 /> Dashboard
          </a>

          <a>
            <Waves /> Audio Restoration
          </a>

          <a>
            <History /> History
          </a>

          <a>
            <Settings /> Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <Headphones />
          <span>Restore your sound.</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main">

        {/* HEADER */}

        <header>
          <div>
            <p className="eyebrow">AUDIO WORKSPACE</p>
            <h1>Dashboard</h1>
            <p>Bring your audio back to life.</p>
          </div>

          <div className="profile">A</div>
        </header>

        {/* WELCOME SECTION */}

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

        {/* UPLOAD SECTION */}

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
            <p className="error-message">{error}</p>
          )}

          {file && (
            <div className="selected-file">
              <Music2 />
              <span>{file.name}</span>

              <button type="button" onClick={removeFile}>
                Remove
              </button>
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

        {/* ANALYSIS RESULTS */}

        {showResults && (
          <>
            <section className="analysis-section">

              <div className="analysis-heading">
                <div>
                  <p className="eyebrow">AUDIO DIAGNOSTICS</p>
                  <h2>Analysis Results</h2>
                  <p>Audio degradation overview for {file.name}</p>
                </div>

                <span className="sample-label">DEMO DATA</span>
              </div>

              {/* QUALITY SCORE */}

              <div className="quality-card">
                <div className="quality-icon">
                  <Activity size={25} />
                </div>

                <div>
                  <p>Overall Audio Quality</p>

                  <h3>
                    62<span>/100</span>
                  </h3>

                  <span className="quality-status">
                    <AlertTriangle size={14} />
                    Needs Improvement
                  </span>
                </div>
              </div>

              {/* DETECTED ISSUES */}

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

              {/* FEATURE 5: DEGRADATION CHART */}

              <div className="quality-visualization">
                <div className="chart-heading">
                  <div>
                    <h3>Audio Degradation Analysis</h3>
                    <p>
                      Detected degradation levels across audio categories
                    </p>
                  </div>

                  <span className="sample-label">DEMO DATA</span>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={degradationData}
                      margin={{
                        top: 15,
                        right: 15,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        stroke="#292d3c"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                        stroke="#9294a7"
                        tick={{
                          fill: "#9294a7",
                          fontSize: 11,
                        }}
                        angle={-12}
                        textAnchor="end"
                        height={65}
                      />

                      <YAxis
                        domain={[0, 100]}
                        stroke="#9294a7"
                        tick={{
                          fill: "#9294a7",
                          fontSize: 11,
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#171b2a",
                          border: "1px solid #393052",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />

                      <Bar
                        dataKey="level"
                        name="Degradation level (%)"
                        fill="#9b7aff"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* FEATURE 5: QUALITY COMPARISON CHART */}

              <div className="quality-visualization">
                <div className="chart-heading">
                  <div>
                    <h3>Quality Score Comparison</h3>
                    <p>
                      Illustrative quality improvement after restoration
                    </p>
                  </div>

                  <span className="sample-label">DEMO DATA</span>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={qualityComparison}>
                      <CartesianGrid
                        stroke="#292d3c"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                        stroke="#9294a7"
                        tick={{
                          fill: "#9294a7",
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        domain={[0, 100]}
                        stroke="#9294a7"
                        tick={{
                          fill: "#9294a7",
                          fontSize: 11,
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#171b2a",
                          border: "1px solid #393052",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />

                      <Bar
                        dataKey="score"
                        name="Quality score"
                        fill="#34d399"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RECOMMENDATION */}

              <div className="recommendation-card">
                <Sparkles size={22} />

                <div>
                  <h3>Recommended Next Step</h3>

                  <p>
                    Apply noise reduction and echo cancellation to improve
                    overall audio quality.
                  </p>
                </div>

                <CheckCircle2 size={22} />
              </div>

              <p className="demo-note">
                <AlertTriangle size={14} />
                These are demonstration values. Actual analysis will come
                from the backend.
              </p>
            </section>

            {/* RESTORATION METHODS */}

            <section className="restoration-section">

              <div className="restoration-heading">
                <div>
                  <p className="eyebrow">CUSTOMIZE YOUR AUDIO</p>
                  <h2>Choose Restoration Methods</h2>

                  <p>
                    Select one or more techniques to improve your audio.
                  </p>
                </div>

                <div className="restoration-heading-icon">
                  <Zap size={24} />
                </div>
              </div>

              <div className="method-grid">
                {methods.map((method) => {
                  const Icon = method.icon;
                  const selected = selectedMethods.includes(method.id);

                  return (
                    <button
                      type="button"
                      key={method.id}
                      className={`method-card ${
                        selected ? "method-selected" : ""
                      }`}
                      onClick={() => toggleMethod(method.id)}
                    >
                      <div className="method-card-top">
                        <div className="method-icon">
                          <Icon size={23} />
                        </div>

                        <span className="method-check">
                          {selected && <CheckCircle2 size={20} />}
                        </span>
                      </div>

                      <h3>{method.name}</h3>
                      <p>{method.description}</p>
                      <span className="method-tag">{method.tag}</span>
                    </button>
                  );
                })}
              </div>

              <div className="restoration-actions">
                <div>
                  <p>{selectedMethods.length} method(s) selected</p>

                  <span>
                    Choose your preferred restoration techniques.
                  </span>
                </div>

                <button
                  className="restore-button"
                  disabled={selectedMethods.length === 0}
                  onClick={handleRestore}
                >
                  <Sparkles size={17} /> Restore Audio
                </button>
              </div>

              {restoreMessage && (
                <div className="restore-message">
                  <CheckCircle2 size={19} />
                  <span>{restoreMessage}</span>
                </div>
              )}

              <p className="demo-note">
                <AlertTriangle size={14} />
                Method selection is interactive. Actual restoration will
                be connected to the backend.
              </p>
            </section>

            {/* BEFORE AND AFTER COMPARISON */}

            <section className="comparison-section">

              <div className="restoration-heading">
                <div>
                  <p className="eyebrow">AUDIO PLAYBACK</p>
                  <h2>Before &amp; After Comparison</h2>

                  <p>
                    Compare your original audio with the restored output.
                  </p>
                </div>

                <div className="restoration-heading-icon">
                  <AudioWaveform size={24} />
                </div>
              </div>

              <div className="comparison-grid">

                {/* ORIGINAL AUDIO */}

                <AudioWaveformPlayer
                  audioUrl={audioUrl}
                  label="Original Audio"
                  color="#8b5cf6"
                />

                {/* FEATURE 4: RESTORED AUDIO AND DOWNLOAD */}

                <div className="audio-player-card restored-placeholder">

                  <span className="pending-label">
                    {restoredAudioUrl
                      ? "RESTORATION COMPLETE"
                      : "AWAITING BACKEND"}
                  </span>

                  <h3>Restored Audio</h3>

                  {restoredAudioUrl ? (
                    <>
                      <AudioWaveformPlayer
                        audioUrl={restoredAudioUrl}
                        label="Restored Audio"
                        color="#34d399"
                      />

                      <a
                        href={restoredAudioUrl}
                        download={`restored-${file?.name || "audio.wav"}`}
                        className="download-button"
                      >
                        <Download size={17} />
                        Download Restored Audio
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="restored-wave-placeholder">
                        <AudioWaveform size={42} />
                      </div>

                      <p>
                        Your restored audio will appear here after
                        processing.
                      </p>

                      <button
                        type="button"
                        className="play-button"
                        disabled
                      >
                        Play Restored Audio
                      </button>

                      <button
                        type="button"
                        className="download-button"
                        disabled
                      >
                        <Download size={17} />
                        Download Restored Audio
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="demo-note">
                <AlertTriangle size={14} />
                Restored playback and download will be enabled when
                backend integration is complete.
              </p>
            </section>
          </>
        )}

        {/* FOOTER */}

        <footer>
          © 2026 AURALIS · Intelligent Audio Restoration
        </footer>

      </main>
    </div>
  );
}

export default App;
