import { useContext, useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AppContext } from "./context/AppContext";
import ProductPage from "./ProductPage";
import logo from "./assets/Logo_Upahaar_AI.png"; // adjust extension if jpg/svg

const MOCK_GIFTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "₹2,999",
    image:
      "https://m.media-amazon.com/images/I/61RahTQtAqL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: 2,
    name: "Anime Hoodie",
    price: "₹1,499",
    image:
      "https://m.media-amazon.com/images/I/71WTHxq4yPL._AC_UY1100_.jpg"
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    price: "₹4,999",
    image:
      "https://m.media-amazon.com/images/I/61P7MvyRbUL.jpg"
  }
];

const STEPS = [
  "🔗 Connecting to social platforms",
  "📸 Fetching Instagram profile metadata",
  "🐦 Fetching Twitter/X public signals",
  "🧾 Reading bio descriptions",
  "🖼️ Analyzing profile visuals",
  "🧠 Extracting interests & keywords",
  "📊 Building behavioral interest graph",
  "🎯 Detecting dominant personality traits",
  "🧩 Mapping interests to gift categories",
  "🛍️ Searching curated gift catalog",
  "⭐ Ranking items by relevance",
  "🧪 Filtering low-confidence matches",
  "💰 Adjusting for price sensitivity",
  "✨ Finalizing recommendations",
  "✅ Preparing personalized gift list"
];

export default function App() {
  const { formData, setFormData, gifts, setGifts } =
    useContext(AppContext);

  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [animate, setAnimate] = useState(false);
  const progressEndRef = useRef(null);

  // useEffect(() => {
  //   setAnimate(true);
  // }, []);

  useEffect(() => {
    setAnimate(true);
    if (progressEndRef.current) {
      progressEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
  }, [step]);
  


  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!formData.instagram.trim() && !formData.twitter.trim()) return;

    setHasGenerated(true);
    setLoading(true);
    setGifts([]);
    setStep(0);
    setProgress(0);

    const total = STEPS.length;

    STEPS.forEach((_, index) => {
      setTimeout(() => {
        setStep(index + 1);
        setProgress(((index + 1) / total) * 100);

        if (index === total - 1) {
          setTimeout(() => {
            setGifts(MOCK_GIFTS);
            setLoading(false);
          }, 600);
        }
      }, 700 * (index + 1));
    });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
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
                <div className="input-box">
                  <label>📸 Instagram bio / username</label>
                  <input
                    type="text"
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

                <div className="input-box">
                  <label>🐦 Twitter/X bio / username</label>
                  <input
                    type="text"
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
              </div>

              <button
                className="generate-btn"
                onClick={handleGenerate}
              >
                Generate Gifts
              </button>

              <p className="subtitle">
                Discover personalized gift ideas with AI.
              </p>
            </div>

            {/* PROGRESS BOX (STAYS EVEN AFTER GIFTS LOAD) */}
            {hasGenerated && (
              <section
                className="progress-box"
                onClick={() => setShowLogs(true)}
              >
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="progress-steps scrollable">
                  {STEPS.slice(0, step).map((msg, i) => (
                    <p key={i} className="progress-msg">
                      {msg}
                    </p>
                  ))}
                  {/* invisible anchor for auto-scroll */}
                  <div ref={progressEndRef} />
                </div>
              </section>
            )}

            {/* LOG MODAL */}
            {showLogs && (
              <div className="log-modal">
                <div className="log-content">
                  <h3>AI Analysis Logs</h3>

                  <div className="log-list">
                    {STEPS.map((msg, i) => (
                      <p key={i}>{msg}</p>
                    ))}
                  </div>

                  <button onClick={() => setShowLogs(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
            {gifts.length > 0 && (
              <section className="gifts">
                <h3>Top Gift Recommendations</h3>

                <div className="gift-grid">
                  {gifts.map(gift => (
                    <div key={gift.id} className="gift-card">
                      <img
                        src={gift.image}
                        alt={gift.name}
                      />
                      <h4>{gift.name}</h4>
                      <p>{gift.price}</p>

                      <button
                        onClick={() =>
                          navigate(`/product/${gift.id}`)
                        }
                      >
                        View Product
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        }
      />

      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  );
}

