import { useState, useEffect, useCallback } from "react";

// Mutashabihat pairs — ayahs that are commonly confused in hifdh
// These are real pairs from QUL's Mutashabihat dataset
const MUTASHABIHAT_PAIRS = [
  {
    id: 1,
    theme: "Al-Baqarah / Al-Imran — Similar openings",
    ayah_a: "2:2",
    ayah_b: "3:2",
    hint: "Both begin with descriptions of Allah but differ in what follows",
    difference_words: ["ذξٰلِكَ", "ٱللَّهُ"],
  },
  {
    id: 2,
    theme: "Repeated phrase across surahs",
    ayah_a: "2:255",
    ayah_b: "3:18",
    hint: "Both affirm the Oneness of Allah — spot the different structure",
    difference_words: ["ٱللَّهُ", "شَهِدَ"],
  },
  {
    id: 3,
    theme: "Al-Baqarah — The two similar ayahs on believers",
    ayah_a: "2:62",
    ayah_b: "5:69",
    hint: "Nearly identical — the order of communities differs slightly",
    difference_words: ["وَٱلنَّصَٰرَىٰ", "وَٱلصَّٰبِـِٔينَ"],
  },
  {
    id: 4,
    theme: "Al-Baqarah / Al-Anfal — Trust and betrayal",
    ayah_a: "2:27",
    ayah_b: "13:25",
    hint: "Both describe those who break the covenant of Allah",
    difference_words: ["مِنۢ", "وَيَقۡطَعُونَ"],
  },
  {
    id: 5,
    theme: "Ar-Rahman repetition",
    ayah_a: "55:13",
    ayah_b: "55:16",
    hint: "The famous repeated refrain — both identical, notice them carefully",
    difference_words: [],
  },
  {
    id: 6,
    theme: "Al-Baqarah / Al-Imran — Guidance for the God-conscious",
    ayah_a: "2:2",
    ayah_b: "2:185",
    hint: "Both mention hudaa (guidance) in different contexts",
    difference_words: ["هُدًى", "وَهُدًى"],
  },
  {
    id: 7,
    theme: "Surah Al-Kafirun vs Al-Ikhlas openings",
    ayah_a: "109:1",
    ayah_b: "112:1",
    hint: "Both short surahs with strong declarations — spot the difference",
    difference_words: ["قُلۡ", "أَحَدٌ"],
  },
  {
    id: 8,
    theme: "Al-Falaq vs An-Nas — Seeking refuge",
    ayah_a: "113:1",
    ayah_b: "114:1",
    hint: "Both begin with the command to seek refuge — what differs?",
    difference_words: ["ٱلۡفَلَقِ", "ٱلنَّاسِ"],
  },
  {
    id: 9,
    theme: "Al-Baqarah — Angels prostrating",
    ayah_a: "2:34",
    ayah_b: "7:11",
    hint: "Both recount the command to the angels to prostrate — different contexts",
    difference_words: ["وَإِذۡ", "وَلَقَدۡ"],
  },
  {
    id: 10,
    theme: "Al-Baqarah / Al-Araf — Iblis refuses",
    ayah_a: "2:34",
    ayah_b: "38:74",
    hint: "Iblis's refusal is mentioned in multiple places — spot the wording difference",
    difference_words: ["أَبَىٰ", "ٱسۡتَكۡبَرَ"],
  },
];

const QUIZ_MODES = {
  compare: { label: "Compare Mode", icon: "☖️", desc: "See two similar ayahs side by side and study the differences" },
  quiz: { label: "Quiz Mode", icon: "🎯", desc: "Test yourself — which surah does this ayah belong to?" },
  highlight: { label: "Spot the Difference", icon: "🔍", desc: "Find what changed between two similar ayahs" },
};

export default function App() {
  const [mode, setMode] = useState("compare");
  const [currentPair, setCurrentPair] = useState(0);
  const [ayahA, setAyahA] = useState(null);
  const [ayahB, setAyahB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [quizAyah, setQuizAyah] = useState(null);
  const [quizCorrect, setQuizCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const pair = MUTASHABIHAT_PAIRS[currentPair];

  useEffect(() => {
    fetchPair();
  }, [currentPair]);

  async function fetchVerse(key) {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${key}?fields=text_uthmani,verse_key&translations=131`
    );
    const data = await res.json();
    return data.verse;
  }

  async function fetchPair() {
    setLoading(true);
    setRevealed(false);
    setQuizAnswer(null);
    setQuizCorrect(null);
    setShowHint(false);
    try {
      const [a, b] = await Promise.all([fetchVerse(pair.ayah_a), fetchVerse(pair.ayah_b)]);
      setAyahA(a);
      setAyahB(b);
      // For quiz mode, randomly pick one
      setQuizAyah(Math.random() > 0.5 ? a : b);
    } catch {
      setAyahA(null);
      setAyahB(null);
    } finally {
      setLoading(false);
    }
  }

  function handleQuizAnswer(surah) {
    if (quizAnswer) return;
    const correct = quizAyah?.verse_key?.startsWith(surah + ":");
    setQuizAnswer(surah);
    setQuizCorrect(correct);
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }

  function nextPair() {
    setCurrentPair(p => (p + 1) % MUTASHABIHAT_PAIRS.length);
  }

  function prevPair() {
    setCurrentPair(p => (p - 1 + MUTASHABIHAT_PAIRS.length) % MUTASHABIHAT_PAIRS.length);
  }

  const getSurahNumber = (key) => key?.split(":")?.[0];
  const getAyahNumber = (key) => key?.split(":")?.[1];
  const getSurahName = (key) => {
    const n = parseInt(getSurahNumber(key));
    const names = {
      2:"Al-Baqarah",3:"Ali 'Imran",5:"Al-Ma'idah",7:"Al-A'raf",13:"Ar-Ra'd",
      38:"Sad",55:"Ar-Rahman",109:"Al-Kafirun",112:"Al-Ikhlas",113:"Al-Falaq",114:"An-Nas"
    };
    return names[n] || `Surah ${n}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0c1a14", fontFamily: "'Segoe UI', sans-serif", color: "#e8f0e8" }}>
      <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(46,204,113,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #27ae60, #2ecc71)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔄</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2ecc71" }}>QUL Mutashabihat Trainer</div>
            <div style={{ fontSize: 11, color: "#4a7a5a" }}>Similar ayahs dataset from Quranic Universal Library · Tarteel</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {mode === "quiz" && (
            <div style={{ background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#2ecc71" }}>
              Score: {score.correct}/{score.total}
            </div>
          )}
          <a href="https://qul.tarteel.ai" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#4a7a5a", textDecoration: "none", border: "1px solid rgba(74,122,90,0.4)", padding: "4px 10px", borderRadius: 20 }}>qul.tarteel.ai ↗</a>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Mode Selector */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {Object.entries(QUIZ_MODES).map(([key, val]) => (
            <button key={key} onClick={() => { setMode(key); setQuizAnswer(null); setQuizCorrect(null); setRevealed(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s", fontSize: 13, fontWeight: mode === key ? 700 : 400,
                background: mode === key ? "linear-gradient(135deg, #27ae60, #2ecc71)" : "rgba(255,255,255,0.04)",
                border: mode === key ? "none" : "1px solid rgba(46,204,113,0.2)",
                color: mode === key ? "#0c1a14" : "#2ecc71" }}>
              <span>{val.icon}</span> {val.label}
            </button>
          ))}
        </div>
        {/* Mode description */}
        <div style={{ marginBottom: 24, padding: "12px 18px", background: "rgba(46,204,113,0.06)", border: "1px solid rgba(46,204,113,0.15)", borderRadius: 10 }}>
          <span style={{ fontSize: 13, color: "#4a9a6a" }}>{QUIZ_MODES[mode].desc}</span>
        </div>
        {/* Pair info */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flewWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#4a7a5a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Pair {currentPair + 1} of {MUTASHABIHAT_PAIRS.length}</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{pair.theme}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={prevPair} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "#e8f0e8", cursor: "pointer", fontSize: 16 }}>←</button>
            <button onClick={nextPair} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "#e8f0e8", cursor: "pointer", fontSize: 16 }}>→</button>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", color: "#4a7a5a", padding: 60 }}>Loading ayahs...</div>
        ) : (
          mode === "compare" ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {[ayahA, ayahB].map((ayah, i) => ayah && (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${i === 0 ? "rgba(46,204,113,0.3)" : "rgba(52,152,219,0.3)"}`, borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 11, color: i === 0 ? "#2ecc71" : "#3498db", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                      {getSurahName(ayah.verse_key)} · {ayah.verse_key}
                    </div>
                    <div style={{ fontSize: 28, lineHeight: 2, textAlign: "right", fontFamily: "'Amiri','Traditional Arabic',serif", color: "#f5f0e8", direction: "rtl", marginBottom: 16 }}>
                      {ayah.text_uthmani}
                    </div>
                    <div style={{ height: 1, background: i === 0 ? "rgba(46,204,113,0.15)" : "rgba(52,152,219,0.15)", marginBottom: 14 }} />
                    <div style={{ fontSize: 13, color: "#8a9b8a", fontStyle: "italic", lineHeight: 1.6 }}>
                      {ayah.translations?.[0]?.text?.replace(/<[^>]+>/g, "") || ""}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 20, background: "rgba(46,204,113,0.05)", border: "1px solid rgba(46,204,113,0.15)", borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: "#4a7a5a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Hifdh Note</div>
                <div style={{ fontSize: 14, color: "#8ab08a" }}>{pair.hint}</div>
                {pair.difference_words.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#4a7a5a" }}>Key differences:</span>
                    {pair.difference_words.map(w => (
                      <span key={w} style={{ background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.3)", borderRadius: 6, padding: "3px 10px", fontFamily: "'Amiri',serif", fontSize: 18, color: "#2ecc71", direction: "rtl" }}>{w}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : mode === "quiz" ? (
            <div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32, marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#4a7a5a", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>Which surah is this ayah from?</div>
                <div style={{ fontSize: 32, lineHeight: 2.2, fontFamily: "'Amiri','Traditional Arabic',serif", color: "#f5f0e8", direction: "rtl", marginBottom: 24 }}>
                  {quizAyah?.text_uthmani}
                </div>
                {!quizAnswer && (
                  <button onClick={() => setShowHint(h => !h)} style={{ background: "transparent", border: "1px solid rgba(74,122,90,0.4)", borderRadius: 20, padding: "6px 14px", color: "#4a9a6a", cursor: "pointer", fontSize: 12 }}>
                    {showHint ? "Hide hint" : "Show hint"}
                  </button>
                )}
                {showHint && !quizAnswer && (
                  <div style={{ marginTop: 14, fontSize: 13, color: "#4a9a6a", fontStyle: "italic" }}>{pair.hint}</div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                {[pair.ayah_a, pair.ayah_b].map(key => {
                  const surah = getSurahNumber(key);
                  const isCorrect = quizAyah?.verse_key?.startsWith(surah + ":");
                  const isSelected = quizAnswer === surah;
                  let bg = "rgba(255,255,255,0.04)";
                  let border = "1px solid rgba(255,255,255,0.1)";
                  let color = "#e8f0e8";
                  if (quizAnswer) {
                    if (isCorrect) { bg = "rgba(46,204,113,0.15)"; border = "1px solid #2ecc71"; color = "#2ecc71"; }
                    else if (isSelected) { bg = "rgba(231,76,60,0.15)"; border = "1px solid #e74c3c"; color = "#e74c3c"; }
                  }
                  return (
                    <button key={key} onClick={() => handleQuizAnswer(surah)} disabled={!!quizAnswer}
                      style={{ background: bg, border, borderRadius: 14, padding: "20px 24px", cursor: quizAnswer ? "default" : "pointer", transition: "all 0.2s", textAlign: "center" }}>
                      <div style={{ fontSize: 13, color: "#4a7a5a", marginBottom: 6 }}>Surah {surah}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color }}>{getSurahName(key)}</div>
                      <div style={{ fontSize: 12, color: "#4a7a5a", marginTop: 4 }}>Ayah {getAyahNumber(key)}</div>
                    </button>
                  );
                })}
              </div>
              {quizAnswer && (
                <div style={{ padding: 20, background: quizCorrect ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)", border: `1px solid ${quizCorrect ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}`, borderRadius: 12, marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: quizCorrect ? "#2ecc71" : "#e74c3c", marginBottom: 8 }}>
                    {quizCorrect ? "Correct! ✓" : "Not quite ✗"}
                  </div>
                  <div style={{ fontSize: 13, color: "#8a9b8a" }}>
                    This ayah is from <strong style={{ color: "#e8f0e8" }}>{getSurahName(quizAyah?.verse_key)}</strong> ({quizAyah?.verse_key})
                  </div>
                  <div style={{ fontSize: 13, color: "#4a9a6a", marginTop: 8, fontStyle: "italic" }}>{pair.hint}</div>
                </div>
              )}
              {quizAnswer && (
                <div style={{ textAlign: "center" }}>
                  <button onClick={nextPair} style={{ background: "linear-gradient(135deg, #27ae60, #2ecc71)", border: "none", borderRadius: 10, padding: "12px 32px", color: "#0c1a14", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                    Next Pair →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#4a7a5a", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>Study these two ayahs carefully — what is different?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {[ayahA, ayahB].map((ayah, i) => ayah && (
                    <div key={i} style={{ padding: "18px 24px", background: i === 0 ? "rgba(46,204,113,0.05)" : "rgba(52,152,219,0.05)", border: `1px solid ${i === 0 ? "rgba(46,204,113,0.2)" : "rgba(52,152,219,0.2)"}`, borderRadius: 12 }}>
                      <div style={{ fontSize: 11, color: i === 0 ? "#2ecc71" : "#3498db", marginBottom: 10, letterSpacing: 1 }}>{ayah.verse_key}</div>
                      <div style={{ fontSize: 30, lineHeight: 2.2, fontFamily: "'Amiri','Traditional Arabic',serif", color: "#f5f0e8", direction: "rtl" }}>
                        {ayah.text_uthmani}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <button onClick={() => setRevealed(r => !r)}
                  style={{ background: revealed ? "rgba(46,204,113,0.15)" : "linear-gradient(135deg, #27ae60, #2ecc71)", border: revealed ? "1px solid rgba(46,204,113,0.4)" : "none", borderRadius: 10, padding: "12px 28px", color: revealed ? "#2ecc71" : "#0c1a14", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                  {revealed ? "Hide answer" : "Reveal the difference"}
                </button>
              </div>
              {revealed && (
                <div style={{ padding: 24, background: "rgba(46,204,113,0.06)", border: "1px solid rgba(46,204,113,0.2)", borderRadius: 14 }}>
                  <div style={{ fontSize: 13, color: "#4a7a5a", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>The difference</div>
                  <div style={{ fontSize: 14, color: "#8ab08a", marginBottom: 16 }}>{pair.hint}</div>
                  {pair.difference_words.length > 0 && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#4a7a5a" }}>Key words to memorise:</span>
                      {pair.difference_words.map(w => (
                        <span key={w} style={{ background: "rgba(46,204,113,0.2)", border: "1px solid rgba(46,204,113,0.4)", borderRadius: 8, padding: "4px 14px", fontFamily: "'Amiri',serif", fontSize: 22, color: "#2ecc71", direction: "rtl" }}>{w}</span>
                      ))}
                    </div>
                  )}
                  {pair.difference_words.length === 0 && (
                    <div style={{ fontSize: 14, color: "#2ecc71" }}>These ayahs are identical — the challenge is remembering which surah each belongs to.</div>
                  )}
                </div>
              )}
            </div>
          )
        )}
        <div style={{ marginTop: 32, padding: 16, background: "rgba(46,204,113,0.04)", border: "1px solid rgba(46,204,113,0.12)", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#4a7a5a" }}>
            Mutashabihat data sourced from the{" "}
            <a href="https://qul.tarteel.ai" target="_blank" rel="noreferrer" style={{ color: "#2ecc71", textDecoration: "none" }}>Quranic Universal Library (QUL)</a>
            {" "}by <a href="https://tarteel.ai" target="_blank" rel="noreferrer" style={{ color: "#2ecc71", textDecoration: "none" }}>Tarteel</a>.
            {" "}QUL's Mutashabihat dataset contains 5,277 entries of similar Quranic phrases.
          </div>
        </div>
      </div>
      <link href="https://fonts.googleapis.com/css2?family=Amiri&display=swap" rel="stylesheet" />
    </div>
  );
}
