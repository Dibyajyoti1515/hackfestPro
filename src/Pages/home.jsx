import { useContext, useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import logo from "../assets/Logo_Upahaar_AI.png";
import { motion } from "framer-motion";
import { Box, Typography, Button, TextField } from "@mui/material";




import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import { socket } from "../services/socket";
import ManualGiftBuilder from "../components/ManualGiftBuilder";


export default function HomePage() {

    const { formData, setFormData, gifts, setGifts } =
        useContext(AppContext);

    const navigate = useNavigate();

    let savedProgress = null;

    try {
        savedProgress = JSON.parse(
            localStorage.getItem("generation_progress")
        );
    } catch (err) {
        console.warn("Corrupted progress cache cleared");
        localStorage.removeItem("generation_progress");
    }

    const [hasGenerated, setHasGenerated] = useState(
        savedProgress?.hasGenerated || false
    );

    const [progress, setProgress] = useState(
        savedProgress?.progress || 0
    );

    const [step, setStep] = useState(
        savedProgress?.step || 0
    );

    const [showLogs, setShowLogs] = useState(false);
    const [loading, setLoading] = useState(false);
    const [animate, setAnimate] = useState(true);
    const [logs, setLogs] = useState([]);
    const [signal, setSignal] = useState(null);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const [activeRequestId, setActiveRequestId] = useState(null);
    const [mode, setMode] = useState("auto");   // auto | professional | romantic
    const [userHints, setUserHints] = useState({
        interests: "",
        occasion: "",
        budget: ""
    });


    const progressEndRef = useRef(null);
    const progressLogRef = useRef(null);

    const STEP = 6;
    const [visibleCount, setVisibleCount] = useState(STEP);
    const [describeText, setDescribeText] = useState("");


    useEffect(() => {
        if (!hasGenerated) return;

        localStorage.setItem(
            "generation_progress",
            JSON.stringify({
                hasGenerated,
                progress,
                step
            })
        );
    }, [hasGenerated, progress, step]);

    useEffect(() => {
        try {
            const cached = localStorage.getItem("cached_gifts");
            if (cached) {
                setGifts(JSON.parse(cached));
            }
        } catch (err) {
            console.warn("⚠️ Corrupted gifts cache cleared");
            localStorage.removeItem("cached_gifts");
        }
    }, [setGifts]);

    useEffect(() => {
        if (!hasGenerated) return;

        const logEl = progressLogRef.current;
        if (!logEl) return;

        requestAnimationFrame(() => {
            logEl.scrollTo({
                top: logEl.scrollHeight,
                behavior: logs.length < 3 ? "auto" : "smooth"
            });
        });
    }, [logs.length, hasGenerated]);

    useEffect(() => {
        if (logs.length === 0) return;

        localStorage.setItem(
            "ui_progress_logs",
            JSON.stringify(logs)
        );
    }, [logs]);

    useEffect(() => {
        try {
            const savedLogs = localStorage.getItem("ui_progress_logs");
            if (!savedLogs) return;

            const parsed = JSON.parse(savedLogs);

            const hydratedLogs = parsed.map(log => ({
                ...log,
                time: new Date(log.time)
            }));

            console.log("♻️ Restored logs:", hydratedLogs.length);

            setLogs(hydratedLogs);

            // ✅ IMPORTANT: Force UI visible when logs exist
            if (hydratedLogs.length > 0) {
                setHasGenerated(true);
            }

        } catch (err) {
            console.warn("⚠️ Failed to restore logs", err);
            localStorage.removeItem("ui_progress_logs");
        }
    }, []);





    // useEffect(() => {
    //     console.log("🧹 Clearing previous session cache");

    //     localStorage.removeItem("generation_progress");
    //     localStorage.removeItem("generation_logs");
    //     localStorage.removeItem("cached_gifts");

    //     setLogs([]);
    //     setGifts([]);
    //     setProgress(0);
    //     setHasGenerated(false);
    // }, []);



    // useEffect(() => {
    //     localStorage.setItem("generation_logs", JSON.stringify(logs));
    // }, [logs]);

    // useEffect(() => {
    //     const cached = localStorage.getItem("generation_logs");
    //     if (cached) setLogs(JSON.parse(cached));
    // }, []);


    useEffect(() => {
        return () => {
            socket.off("progress");
            socket.disconnect();
            console.log("🔌 Socket disconnected");
        };
    }, []);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        console.log("🟢 Socket init");

        socket.on("connect", () => {
            console.log("🔌 Connected:", socket.id);
        });

        socket.on("progress", data => {
            setProgress(data.progress);
            setLogs(prev => [
                ...prev,
                {
                    message: data.message,
                    time: new Date(data.timestamp || Date.now())
                }
            ]);
        });

        socket.on("completed", data => {
            console.log("✅ Completed:", data);
            setProgress(100);
            setLoading(false);
        });

        socket.on("signal", data => {
            console.log("📡 Signal received:", data.signal);
            setSignal(data.signal);
        });

        socket.on("signal_ok", data => {
            console.log("✅ Signal OK:", data);
            setLogs(prev => [
                ...prev,
                {
                    message: `Signal strength: ${data.signal.level} (${Math.round(
                        data.signal.confidence * 100
                    )}%)`,
                    time: new Date()
                }
            ]);
        });

        socket.on("need_user_input", data => {
            console.log("⚠️ Need user input:", data);
            setSignal(data.signal);
            setShowUserPopup(true);
        });


        return () => {
            socket.off("connect");
            socket.off("progress");
            socket.off("completed");
            socket.off("signal");
            socket.off("signal_ok");
            socket.off("need_user_input");
        };

    }, []);



    const handleSeeMore = () => {
        if (visibleCount + STEP >= gifts.length) {
            setVisibleCount(gifts.length);
        } else {
            setVisibleCount(prev => prev + STEP);
        }
    };

    const handleGenerate = () => {
        if (!formData.instagram.trim()) return;

        setHasGenerated(true);
        setLoading(true);
        setLogs([]);
        setGifts([]);
        setProgress(0);

        localStorage.removeItem("ui_progress_logs");
        localStorage.removeItem("generation_logs");
        localStorage.removeItem("cached_gifts");

        const requestId = `req-${crypto.randomUUID().slice(0, 8)}`;
        setActiveRequestId(requestId);
        console.log("🧷 Frontend requestId:", requestId);

        // ✅ ALWAYS register immediately
        socket.emit("register", requestId);
        console.log("🧲 Registered with requestId:", requestId);

        const MODE_API = {
            auto: "http://localhost:3000/api/gift/auto",
            professional: "http://localhost:3000/api/gift/professional",
            romantic: "http://localhost:3000/api/gift/romantic"
        };

        const apiUrl = MODE_API[mode] || MODE_API.auto;

        fetch(
            `${apiUrl}?username=${formData.instagram}&requestId=${requestId}`
        ).then(res => res.json())
            .then(result => {
                console.log("API Response:", result);

                if (result.success && Array.isArray(result.data)) {
                    setGifts(result.data);
                    console.log(result.data);
                    localStorage.setItem("cached_gifts", JSON.stringify(result.data));
                    return;
                }

                if (result.status === "WAITING_FOR_USER_INPUT") {
                    console.log("Waiting for user enrichment");

                    setSignal({
                        ...result.signal,
                        rawData: result.data
                    });

                    setShowUserPopup(true);
                    return;
                }

                console.warn("Unknown response:", result);
            })

            .catch(err => {
                console.error("Gift fetch failed:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const runEnrich = async (requestId, userHints) => {
        try {
            setLoading(true);
            setProgress(50);

            console.log(signal?.rawData);

            const res = await fetch("http://localhost:3000/api/insta/enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    data: signal?.rawData,
                    userHints
                })
            });

            const result = await res.json();
            console.log("🎁 Enrich result:", result);

            if (result.success) {
                setGifts(result.data);
                localStorage.setItem("cached_gifts", JSON.stringify(result.data));
                setProgress(100);
            }

        } catch (err) {
            console.error("Enrich failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleManualGenerate = async (manualPayload) => {
        try {
            setHasGenerated(true);
            setLoading(true);
            setLogs([]);
            setGifts([]);
            setProgress(0);

            localStorage.removeItem("ui_progress_logs");
            localStorage.removeItem("cached_gifts");

            const requestId = `manual-${crypto.randomUUID().slice(0, 8)}`;
            setActiveRequestId(requestId);

            console.log("🧷 Manual requestId:", requestId);

            // ✅ Register socket FIRST
            socket.emit("register", requestId);
            console.log("🧲 Socket registered:", requestId);

            const res = await fetch("http://localhost:3000/api/gift/manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    payload: manualPayload
                })
            });

            const result = await res.json();
            console.log("🎁 Manual API Result:", result);

            if (result.success && Array.isArray(result.data)) {
                setGifts(result.data);
                localStorage.setItem("cached_gifts", JSON.stringify(result.data));
                setProgress(100);
                return;
            }

            console.warn("⚠️ Unexpected manual result:", result);

        } catch (err) {
            console.error("❌ Manual generation failed:", err);
        } finally {
            setLoading(false);
        }
    };




    const handleSubmitHints = async () => {
        setShowUserPopup(false);
        await runEnrich(activeRequestId, userHints);
    };


    const handleSkipHints = async () => {
        setShowUserPopup(false);
        await runEnrich(activeRequestId, null);
    };

    const handleDescribeGenerate = async () => {
        if (!describeText.trim()) return;

        try {
            setHasGenerated(true);
            setLoading(true);
            setLogs([]);
            setGifts([]);
            setProgress(0);

            const requestId = `desc-${crypto.randomUUID().slice(0, 8)}`;
            setActiveRequestId(requestId);

            console.log("🧷 Describe requestId:", requestId);

            // ✅ Register socket
            socket.emit("register", requestId);

            const res = await fetch("http://localhost:3000/api/gift/describe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    prompt: describeText
                })
            });

            const result = await res.json();
            console.log("🎁 Describe result:", result);

            if (result.success && Array.isArray(result.data)) {
                setGifts(result.data);
                localStorage.setItem("cached_gifts", JSON.stringify(result.data));
                setProgress(100);
            }

        } catch (err) {
            console.error("Describe generate failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={`app hero-center ${animate ? "animate-page" : "preload-hidden"}`}>
                <h1 className="hero-title">
                    <img
                        src={logo}
                        alt="Upahaar AI Logo"
                        className="hero-logo"
                    />
                </h1>
                <p className="hero-tagline animate-tagline">
                    Intelligence Behind Every Gift.
                </p>
                <br></br>
                <br></br>

                <div className="mode-selector">

                    <div
                        className={`mode-pill ${mode === "auto" ? "active" : ""}`}
                        onClick={() => setMode("auto")}
                    >
                        Casual
                    </div>

                    <div
                        className={`mode-pill ${mode === "professional" ? "active" : ""}`}
                        onClick={() => setMode("professional")}
                    >
                        Professional
                    </div>

                    <div
                        className={`mode-pill ${mode === "romantic" ? "active" : ""}`}
                        onClick={() => setMode("romantic")}
                    >
                        Romantic
                    </div>

                    <div
                        className={`mode-pill ${mode === "manual" ? "active" : ""}`}
                        onClick={() => setMode("manual")}
                    >
                        Manual
                    </div>
                    <div
                        className={`mode-pill ${mode === "describe" ? "active" : ""}`}
                        onClick={() => setMode("describe")}
                    >
                        Describe
                    </div>

                </div>

                {mode === "manual" ? (
                    <ManualGiftBuilder
                        onGenerate={handleManualGenerate}
                    />
                ) : mode === "describe" ? (

                    <Box
                        sx={{
                            p: 3,
                            borderRadius: "18px",
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                            backdropFilter: "blur(18px)",
                            border: "1px solid rgba(255,255,255,0.18)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        }}
                    >
                        <Typography color="#fff" fontWeight={700}>
                            📝 Describe the person & occasion
                        </Typography>

                        <TextField
                            multiline
                            minRows={5}
                            placeholder="Example: He is a gym lover, cycles every weekend, loves coffee and tech gadgets. Budget around ₹4000. Birthday gift."
                            value={describeText}
                            onChange={e => setDescribeText(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    "& fieldset": {
                                        borderColor: "rgba(255,255,255,0.35)"
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#7dd3fc"
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#38bdf8",
                                        boxShadow: "0 0 12px rgba(56,189,248,0.6)"
                                    }
                                }
                            }}
                        />

                        <GlassButton
                            onClick={handleDescribeGenerate}
                            loading={loading}
                        >
                            Generate From Description ✨
                        </GlassButton>

                    </Box>

                ) : (
                    <>
                        <div className="input-glass-card">
                            <div className="input-grid">
                                <GlassInput
                                    label="Instagram username"
                                    placeholder="Enter your details"
                                    value={formData.instagram}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            instagram: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <GlassButton onClick={handleGenerate} loading={loading}>
                                Generate Gifts
                            </GlassButton>
                        </div>

                    </>
                )}


                {hasGenerated && (
                    <section
                        className="glass-progress-panel"
                        onClick={() => setShowLogs(true)}
                    >
                        {/* 🔋 Progress Track */}
                        <div className="glass-progress-track">
                            <div
                                className="glass-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>


                        {console.log("Render OK", { hasGenerated, step })}

                        <div className="glass-progress-log" ref={progressLogRef}>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="log-row"
                                >
                                    <span className="log-time">
                                        {log.time
                                            ? new Date(log.time).toLocaleTimeString()
                                            : "--:--"}

                                    </span>

                                    <span className="log-dot">●</span>

                                    <span className="log-message">
                                        {log.message?.length > 60
                                            ? log.message.slice(0, 60) + "........"
                                            : log.message}
                                    </span>
                                </motion.div>
                            ))}
                            <div ref={progressEndRef} />
                        </div>


                    </section>
                )}

                {signal && (
                    <div className="signal-badge">
                        Signal: {signal.level} ({Math.round(signal.confidence * 100)}%)
                    </div>
                )}


                {showLogs && (
                    <motion.div
                        className="glass-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLogs(false)}
                    >
                        <motion.div
                            className="glass-modal"
                            initial={{ scale: 0.92, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* 🧠 Title Bar */}
                            <div className="glass-modal-header">
                                <h3 className="glass-modal-title">AI Analysis Logs</h3>

                                <button
                                    className="glass-modal-x"
                                    onClick={() => setShowLogs(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="glass-modal-log">
                                {logs.map((log, i) => (
                                    <motion.div
                                        key={i}
                                        className="glass-modal-row"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <span className="modal-time">
                                            {log.time
                                                ? new Date(log.time).toLocaleTimeString()
                                                : "--:--"}

                                        </span>
                                        <span className="modal-dot" />
                                        <span className="modal-message">
                                            {log.message?.length > 60
                                                ? log.message.slice(0, 60) + "........"
                                                : log.message}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                className="glass-modal-close"
                                onClick={() => setShowLogs(false)}
                            >
                                Close Panel
                            </button>
                        </motion.div>
                    </motion.div>
                )}


                {gifts.length > 0 && (
                    <section className="gifts">
                        <h3>Top Gift Recommendations</h3>

                        <div className="gift-grid">
                            {gifts
                                .slice(0, visibleCount)
                                .map((gift, index) => {

                                    const scorePercent = Math.min(
                                        94.34,
                                        Math.round(((gift.semanticScore) * 100) + 65)
                                    );


                                    const badgeColor =
                                        scorePercent >= 80
                                            ? "#22c55e"
                                            : scorePercent >= 50
                                                ? "#facc15" 
                                                : "#ef4444";

                                    return (
                                        <div key={index} className="gift-card" style={{ position: "relative" }}>

                                            {/* 🧠 Semantic Score Badge (MUI Circle) */}
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 11,
                                                    left: 10,
                                                    width: 54,
                                                    height: 54,
                                                    borderRadius: "50%",
                                                    backgroundColor: badgeColor,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    boxShadow: `0 4px 12px ${badgeColor}aa`,
                                                    zIndex: 2
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                        color: "#fff",
                                                        userSelect: "none",
                                                        margin: 0
                                                    }}
                                                >
                                                    {scorePercent.toFixed(1)}%
                                                </Typography>
                                            </Box>

                                            <img
                                                src={gift.image?.thumbnail}
                                                alt={gift.name}
                                            />

                                            <h4>
                                                {gift.name?.length > 85
                                                    ? gift.name.slice(0, 85) + "..."
                                                    : gift.name}
                                            </h4>

                                            <p id="giftcardP">{gift.price}</p>

                                            <button
                                                onClick={() =>
                                                    navigate(`/product`, { state: gift })
                                                }
                                            >
                                                View Product
                                            </button>

                                        </div>
                                    );
                                })}


                        </div>

                        {/* 🌊 See More Button */}
                        {visibleCount < gifts.length && (
                            <div className="see-more-wrapper">
                                <button
                                    className="see-more-btn"
                                    onClick={handleSeeMore}
                                >
                                    See More ✨
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </div>

            {showUserPopup && (
                <motion.div
                    className="glass-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowUserPopup(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 50
                    }}
                >
                    <motion.div
                        onClick={e => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 20 }}
                        style={{
                            width: 420,
                            maxWidth: "92vw"
                        }}
                    >
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: "22px",
                                color: "#fff",
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
                                backdropFilter: "blur(22px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                boxShadow: "0 25px 80px rgba(0,0,0,0.6)"
                            }}
                        >
                            {/* 🎯 Title */}
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                textAlign="center"
                                mb={2}
                            >
                                🎯 Help Us Improve Gift Accuracy
                            </Typography>

                            {/* ✍️ Inputs */}
                            {[
                                {
                                    label: "Interests",
                                    value: userHints.interests,
                                    field: "interests",
                                    placeholder: "gym, travel, gadgets"
                                },
                                {
                                    label: "Occasion",
                                    value: userHints.occasion,
                                    field: "occasion",
                                    placeholder: "birthday, anniversary"
                                },
                                {
                                    label: "Budget",
                                    value: userHints.budget,
                                    field: "budget",
                                    placeholder: "₹1000 - ₹3000"
                                }
                            ].map(input => (
                                <TextField
                                    key={input.field}
                                    fullWidth
                                    label={input.label}
                                    placeholder={input.placeholder}
                                    value={input.value}
                                    onChange={e =>
                                        setUserHints({
                                            ...userHints,
                                            [input.field]: e.target.value
                                        })
                                    }
                                    sx={{
                                        mb: 2,
                                        "& .MuiOutlinedInput-root": {
                                            color: "#fff",
                                            "& fieldset": {
                                                borderColor: "rgba(255,255,255,0.35)"
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#7dd3fc"
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#38bdf8",
                                                boxShadow: "0 0 12px rgba(56,189,248,0.6)"
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#fff"
                                        }
                                    }}
                                />
                            ))}

                            {/* 🚀 Actions */}
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    mt: 2
                                }}
                            >
                                <Button
                                    fullWidth
                                    onClick={handleSubmitHints}
                                    sx={{
                                        color: "#fff",
                                        fontWeight: 700,
                                        borderRadius: "12px",
                                        background:
                                            "linear-gradient(135deg, #22c55e, #16a34a)",
                                        boxShadow: "0 10px 30px rgba(34,197,94,0.6)",
                                        textTransform: "none",
                                        "&:hover": {
                                            filter: "brightness(1.1)"
                                        }
                                    }}
                                >
                                    Submit
                                </Button>

                                <Button
                                    fullWidth
                                    onClick={handleSkipHints}
                                    sx={{
                                        color: "#fff",
                                        fontWeight: 600,
                                        borderRadius: "12px",
                                        background: "rgba(255,255,255,0.12)",
                                        border: "1px solid rgba(255,255,255,0.25)",
                                        backdropFilter: "blur(8px)",
                                        textTransform: "none",
                                        "&:hover": {
                                            background: "rgba(255,255,255,0.18)"
                                        }
                                    }}
                                >
                                    Skip
                                </Button>
                            </Box>

                        </Box>
                    </motion.div>
                </motion.div>
            )}


        </>
    )
}