import { useContext, useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import logo from "../assets/Logo_Upahaar_AI.png";
import { motion } from "framer-motion";


import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import { socket } from "../services/socket";

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

    const progressEndRef = useRef(null);
    const progressLogRef = useRef(null);

    const STEP = 6;
    const [visibleCount, setVisibleCount] = useState(STEP);

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

        return () => {
            socket.off("connect");
            socket.off("progress");
            socket.off("completed");
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
        console.log("🧷 Frontend requestId:", requestId);

        // ✅ ALWAYS register immediately
        socket.emit("register", requestId);
        console.log("🧲 Registered with requestId:", requestId);

        fetch(
            `http://localhost:3000/api/insta?username=${formData.instagram}&requestId=${requestId}`
        )
            .then(res => res.json())
            .then(result => {
                console.log("🎁 Gifts received:", result);

                if (result.success && Array.isArray(result.data)) {
                    setGifts(result.data);
                    localStorage.setItem("cached_gifts", JSON.stringify(result.data));
                }
            })
            .catch(err => {
                console.error("❌ Gift fetch failed:", err);
            })
            .finally(() => {
                setLoading(false);
            });
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


                <div className="input-glass-card">
                    <div className="input-grid">
                        <GlassInput
                            icon="📸"
                            label="Instagram bio / username"
                            placeholder="Enter your details"
                            value={formData.instagram}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    instagram: e.target.value
                                })
                            }
                        />

                        <GlassInput
                            icon="🐦"
                            label="Twitter/X bio / username"
                            placeholder="Enter your details"
                            value={formData.twitter}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    twitter: e.target.value
                                })
                            }
                        />
                    </div>

                    <GlassButton onClick={handleGenerate} loading={loading}>
                        Generate Gifts
                    </GlassButton>
                </div>


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
                                .map((gift, index) => (
                                    <div key={index} className="gift-card">
                                        <img
                                            src={gift.image?.thumbnail}
                                            alt={gift.name}
                                        />

                                        <h4>
                                            {gift.name?.length > 85
                                                ? gift.name.slice(0, 85) + "..."
                                                : gift.name}
                                        </h4>

                                        <p>{gift.price}</p>

                                        <button
                                            onClick={() =>
                                                navigate(`/product`, { state: gift })
                                            }
                                        >
                                            View Product
                                        </button>
                                    </div>
                                ))}
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
        </>
    )
}