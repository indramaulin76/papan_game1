"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Dice5,
  Flag,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { DEFAULT_LADDERS, DEFAULT_SNAKES, PLAYER_COLORS, buildBoard, filterLinks } from "../lib/boardConfig";
import {
  DEFAULT_TILE_QUESTIONS,
  QUESTION_BANK,
  QUESTION_TYPE_LABEL,
  loadCustomQuestions,
  saveCustomQuestions,
} from "../lib/questionBank";

const BOARD_PRESETS = [25, 36, 49, 64, 81, 100];
const MIN_TILES = 2;
const MAX_TILES = 200;
const TYPE_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "multiple_choice", label: "Pilihan Ganda" },
  { value: "essay", label: "Esai" },
  { value: "oral", label: "Lisan" },
];

/**
 * Halaman utama pengaturan permainan: jumlah pemain, nama & warna pion,
 * kotak finis, dan pratinjau papan. Memanggil `onStart({ names, colors,
 * boardSize })` saat guru menekan Mulai.
 */
export default function AturPermainan({ onStart, initialBoardSize = 64, initialTileQuestions = DEFAULT_TILE_QUESTIONS, initialPlayers = null }) {
  const startCount = initialPlayers && initialPlayers.length >= 2 ? initialPlayers.length : 3;
  const [playerCount, setPlayerCount] = useState(startCount);
  const [names, setNames] = useState(() =>
    Array.from({ length: startCount }, (_, index) => initialPlayers?.[index]?.name ?? ""),
  );
  const [colors, setColors] = useState(() => {
    const used = new Set();
    return Array.from({ length: startCount }, (_, index) => {
      const candidate = initialPlayers?.[index]?.color;
      if (candidate && PLAYER_COLORS.includes(candidate) && !used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
      const fallback =
        PLAYER_COLORS.find((color) => !used.has(color)) ?? PLAYER_COLORS[index % PLAYER_COLORS.length];
      used.add(fallback);
      return fallback;
    });
  });
  const [boardSize, setBoardSize] = useState(initialBoardSize);
  const [customTile, setCustomTile] = useState("");
  const [tileQuestions, setTileQuestions] = useState(initialTileQuestions);
  const [selectedTile, setSelectedTile] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [error, setError] = useState("");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [draft, setDraft] = useState({
    subject: "",
    type: "multiple_choice",
    text: "",
    choices: ["", "", "", ""],
    correct: 0,
  });
  const [draftError, setDraftError] = useState("");

  // Soal buatan guru dimuat setelah mount agar tidak bentrok saat SSR.
  useEffect(() => {
    setCustomQuestions(loadCustomQuestions());
  }, []);

  const questionBank = useMemo(() => [...QUESTION_BANK, ...customQuestions], [customQuestions]);

  const finishTile = customTile.trim() === "" ? boardSize : Number(customTile);
  const validFinish =
    Number.isInteger(finishTile) && finishTile >= MIN_TILES && finishTile <= MAX_TILES;
  const previewSize = validFinish ? finishTile : boardSize;
  const preview = useMemo(() => buildBoard(previewSize), [previewSize]);
  const previewLadders = useMemo(() => filterLinks(DEFAULT_LADDERS, previewSize), [previewSize]);
  const previewSnakes = useMemo(() => filterLinks(DEFAULT_SNAKES, previewSize), [previewSize]);

  const selectedQuestionId = tileQuestions[selectedTile] ?? "";
  const selectedQuestion = questionBank.find((item) => item.id === selectedQuestionId) ?? null;
  const questionCount = Object.keys(tileQuestions).filter((tileKey) => Number(tileKey) <= previewSize).length;
  const visibleBank = useMemo(
    () => questionBank.filter((item) => typeFilter === "all" || item.type === typeFilter),
    [questionBank, typeFilter],
  );
  const bankBySubject = useMemo(() => {
    const groups = {};
    for (const item of visibleBank) {
      if (!groups[item.subject]) groups[item.subject] = [];
      groups[item.subject].push(item);
    }
    return groups;
  }, [visibleBank]);
  const typeCounts = useMemo(() => {
    const counts = { all: questionBank.length };
    for (const item of questionBank) counts[item.type] = (counts[item.type] ?? 0) + 1;
    return counts;
  }, [questionBank]);
  const bankTypes = useMemo(() => {
    const counts = { multiple_choice: 0, essay: 0, oral: 0 };
    for (const item of questionBank) {
      if (counts[item.type] !== undefined) counts[item.type] += 1;
    }
    return counts;
  }, [questionBank]);
  const selectedHidden =
    Boolean(selectedQuestion) && !visibleBank.some((item) => item.id === selectedQuestion.id);
  const problems = [];
  if (!validFinish) problems.push(`Jumlah kotak finis harus antara ${MIN_TILES} dan ${MAX_TILES}.`);
  const ready = problems.length === 0;

  function changeCount(count) {
    setPlayerCount(count);
    setNames((prev) => Array.from({ length: count }, (_, index) => prev[index] ?? ""));
    setColors((prev) => {
      const used = new Set();
      return Array.from({ length: count }, (_, index) => {
        let color = prev[index];
        if (!color || used.has(color)) {
          color =
            PLAYER_COLORS.find((candidate) => !used.has(candidate)) ??
            PLAYER_COLORS[index % PLAYER_COLORS.length];
        }
        used.add(color);
        return color;
      });
    });
  }

  function pickColor(index, color) {
    setColors((prev) => {
      const next = [...prev];
      const existing = next.indexOf(color);
      if (existing !== -1 && existing !== index) next[existing] = next[index];
      next[index] = color;
      return next;
    });
  }

  function setQuestionForTile(tileNumber, questionId) {
    setTileQuestions((prev) => {
      const next = { ...prev };
      if (questionId) next[tileNumber] = questionId;
      else delete next[tileNumber];
      return next;
    });
  }

  function distributeQuestions() {
    const map = {};
    const step = Math.max(1, Math.floor(previewSize / questionBank.length));
    let bankIndex = 0;
    for (let number = 3; number < previewSize && bankIndex < questionBank.length; number += step) {
      map[number] = questionBank[bankIndex].id;
      bankIndex += 1;
    }
    setTileQuestions(map);
  }

  function clearQuestions() {
    setTileQuestions({});
  }

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (draftError) setDraftError("");
  }

  function updateChoice(index, value) {
    setDraft((prev) => {
      const choices = [...prev.choices];
      choices[index] = value;
      return { ...prev, choices };
    });
    if (draftError) setDraftError("");
  }

  /** Tambahkan soal buatan guru ke bank lokal (localStorage). */
  function addCustomQuestion() {
    const subject = draft.subject.trim();
    const text = draft.text.trim();
    if (!subject) {
      setDraftError("Mata pelajaran belum diisi.");
      return;
    }
    if (!text) {
      setDraftError("Pertanyaan belum diisi.");
      return;
    }
    const item = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      subject,
      type: draft.type,
      text,
    };
    if (draft.type === "multiple_choice") {
      const choices = draft.choices.map((choice) => choice.trim());
      if (choices.some((choice) => !choice)) {
        setDraftError("Isi keempat pilihan jawaban dulu ya.");
        return;
      }
      item.choices = choices;
      item.correct = draft.correct;
    }
    const next = [...customQuestions, item];
    setCustomQuestions(next);
    saveCustomQuestions(next);
    setDraft({ subject: "", type: "multiple_choice", text: "", choices: ["", "", "", ""], correct: 0 });
    setDraftError("");
  }

  /** Hapus soal buatan guru dan lepaskan dari kotak yang memakainya. */
  function removeCustomQuestion(id) {
    const next = customQuestions.filter((item) => item.id !== id);
    setCustomQuestions(next);
    saveCustomQuestions(next);
    setTileQuestions((prev) => {
      const cleaned = { ...prev };
      for (const [tileKey, questionId] of Object.entries(cleaned)) {
        if (questionId === id) delete cleaned[tileKey];
      }
      return cleaned;
    });
  }

  function choosePreset(preset) {
    setBoardSize(preset);
    setCustomTile("");
    setError("");
  }

  function handleStart() {
    if (problems.length > 0) {
      setError(problems.join(" "));
      return;
    }
    setError("");
    const sanitized = Object.fromEntries(
      Object.entries(tileQuestions).filter(([tileKey]) => Number(tileKey) <= finishTile),
    );
    onStart({
      names: names.slice(0, playerCount),
      colors: colors.slice(0, playerCount),
      boardSize: finishTile,
      tileQuestions: sanitized,
      questionPool: questionBank,
    });
  }

  return (
    <main className="shell settings-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">
            <Dice5 size={21} />
          </span>
          papan<span className="brand-dot">.</span>ceria
        </a>
        <div className="class-label">
          <i /> ATUR PERMAINAN
        </div>
      </header>

      <section className="settings-hero">
        <p className="eyebrow">
          <Sparkles size={14} /> SIAPKAN DULU, BARU BERMAIN
        </p>
        <h1>
          Atur <span>Permainan</span>
        </h1>
        <p className="settings-lead">
          Pilih berapa pemain, tentukan kotak finis, lalu mulai bermain bersama.
        </p>
      </section>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <Users size={18} />
            </span>
            <div>
              <h2>Pemain</h2>
              <p>Jumlah dan nama anak yang ikut bermain.</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="player-count">Jumlah Pemain</label>
            <select
              id="player-count"
              value={playerCount}
              onChange={(event) => changeCount(Number(event.target.value))}
            >
              {Array.from({ length: 19 }, (_, index) => index + 2).map((count) => (
                <option key={count} value={count}>
                  {count} Pemain
                </option>
              ))}
            </select>
          </div>

          <div className="name-list">
            {Array.from({ length: playerCount }, (_, index) => (
              <div className="player-config" key={index}>
                <div className="name-row">
                  <span className={`avatar ${colors[index]}`}>{index + 1}</span>
                  <input
                    type="text"
                    placeholder={`Nama Pemain ${index + 1}`}
                    value={names[index] ?? ""}
                    onChange={(event) => {
                      const next = [...names];
                      next[index] = event.target.value;
                      setNames(next);
                    }}
                  />
                </div>
                <div
                  className="color-picker"
                  role="radiogroup"
                  aria-label={`Warna pion pemain ${index + 1}`}
                >
                  {PLAYER_COLORS.map((color) => {
                    const takenByOther = colors.some(
                      (value, colorIndex) => colorIndex !== index && value === color,
                    );
                    return (
                      <button
                        key={color}
                        type="button"
                        className={`color-dot ${color}${colors[index] === color ? " active" : ""}`}
                        aria-label={`Warna ${color}`}
                        aria-pressed={colors[index] === color}
                        disabled={takenByOther}
                        onClick={() => pickColor(index, color)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <Flag size={18} />
            </span>
            <div>
              <h2>Papan &amp; Finis</h2>
              <p>Mau sampai kotak berapa permainan selesai?</p>
            </div>
          </div>

          <div className="preset-row">
            {BOARD_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset${
                  customTile.trim() === "" && boardSize === preset ? " active" : ""
                }`}
                onClick={() => choosePreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="custom-tile">Atau tulis sendiri</label>
            <input
              id="custom-tile"
              type="number"
              min={MIN_TILES}
              max={MAX_TILES}
              placeholder={`mis. ${boardSize}`}
              value={customTile}
              onChange={(event) => {
                setCustomTile(event.target.value);
                setError("");
              }}
            />
          </div>

          <div className="board-summary">
            <Flag size={15} /> Finis di kotak <b>{finishTile}</b>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <ArrowUpRight size={18} />
            </span>
            <div>
              <h2>Pratinjau Papan</h2>
              <p>Begini papan dengan kotak finis {previewSize}.</p>
            </div>
          </div>

          <div
            className="board-preview"
            style={{ gridTemplateColumns: `repeat(${preview.cols}, minmax(0, 1fr))` }}
            role="img"
            aria-label={`Pratinjau papan ${previewSize} kotak`}
          >
            {preview.cells.map((number, index) => {
              if (number === null) {
                return <span className="preview-tile empty" key={`empty-${index}`} />;
              }
              const classes = ["preview-tile"];
              if (number === 1) classes.push("start");
              if (number === previewSize) classes.push("finish");
              if (previewLadders[number]) classes.push("ladder");
              if (previewSnakes[number]) classes.push("snake");
              return (
                <span className={classes.join(" ")} key={number}>
                  <small>{number}</small>
                  {previewLadders[number] && <ArrowUpRight size={10} />}
                  {previewSnakes[number] && <ArrowDownRight size={10} />}
                </span>
              );
            })}
          </div>

          <div className="obstacle-row">
            <span className="obstacle-chip ladder">
              <ArrowUpRight size={15} /> {Object.keys(previewLadders).length} tangga
            </span>
            <span className="obstacle-chip snake">
              <ArrowDownRight size={15} /> {Object.keys(previewSnakes).length} ular
            </span>
          </div>
          <p className="obstacle-note">
            Rintangan menyesuaikan otomatis dengan ukuran papan yang kamu pilih.
          </p>
        </section>

        <section className="settings-card summary-card">
          <div className="settings-card-head">
            <span className="settings-icon">
              <Check size={18} />
            </span>
            <div>
              <h2>Ringkasan</h2>
              <p>Cek dulu sebelum mulai bermain.</p>
            </div>
          </div>

          <ul className="summary-list">
            <li><span>Pemain</span><b>{playerCount} anak</b></li>
            <li><span>Kotak finis</span><b>{validFinish ? finishTile : "—"}</b></li>
            <li><span>Bank soal</span><b>{questionBank.length} soal</b></li>
            <li><span>Soal khusus</span><b>{questionCount} kotak</b></li>
            <li>
              <span>Jenis soal</span>
              <b>{bankTypes.multiple_choice} PG · {bankTypes.essay} esai · {bankTypes.oral} lisan</b>
            </li>
            <li><span>Cara keluar soal</span><b>Acak per kotak</b></li>
            <li>
              <span>Tangga &amp; ular</span>
              <b>{Object.keys(previewLadders).length} &amp; {Object.keys(previewSnakes).length}</b>
            </li>
          </ul>

          {problems.length > 0 ? (
            <ul className="summary-problems">
              {problems.map((problem) => (
                <li key={problem}><X size={14} /> {problem}</li>
              ))}
            </ul>
          ) : (
            <p className="summary-ok"><Check size={15} /> Pengaturan sudah lengkap, siap dimulai!</p>
          )}
        </section>
      </div>

      <section className="settings-card question-section">
        <div className="settings-card-head">
          <span className="settings-icon">
            <CircleHelp size={18} />
          </span>
          <div>
            <h2>Soal per Kotak</h2>
            <p>
              Tempelkan soal khusus ke kotak tertentu (opsional). Kotak lain otomatis
              diberi soal acak dari bank. {questionCount} kotak punya soal khusus.
            </p>
          </div>
        </div>

        <div className="question-layout">
          <div className="question-board">
            <div
              className="board-preview selectable"
              style={{ gridTemplateColumns: `repeat(${preview.cols}, minmax(0, 1fr))` }}
            >
              {preview.cells.map((number, index) => {
                if (number === null) {
                  return <span className="preview-tile empty" key={`empty-${index}`} />;
                }
                const classes = ["preview-tile"];
                if (number === 1) classes.push("start");
                if (number === previewSize) classes.push("finish");
                if (previewLadders[number]) classes.push("ladder");
                if (previewSnakes[number]) classes.push("snake");
                if (tileQuestions[number]) classes.push("has-question");
                if (selectedTile === number) classes.push("selected");
                return (
                  <button
                    type="button"
                    className={classes.join(" ")}
                    key={number}
                    aria-pressed={selectedTile === number}
                    aria-label={`Kotak ${number}${tileQuestions[number] ? ", ada soal" : ""}`}
                    onClick={() => setSelectedTile(number)}
                  >
                    <small>{number}</small>
                    {previewLadders[number] && <ArrowUpRight size={10} />}
                    {previewSnakes[number] && <ArrowDownRight size={10} />}
                  </button>
                );
              })}
            </div>
            <div className="question-toolbar">
              <button type="button" onClick={distributeQuestions}>Bagikan otomatis</button>
              <button type="button" onClick={clearQuestions}>Kosongkan semua</button>
            </div>
          </div>

          <div className="question-editor">
            <div className="form-group">
              <label htmlFor="tile-select">Pilih kotak</label>
              <input
                id="tile-select"
                type="number"
                min={1}
                max={previewSize}
                value={selectedTile}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isInteger(value) && value >= 1 && value <= previewSize) {
                    setSelectedTile(value);
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label>Jenis soal</label>
              <div className="type-filter" role="tablist" aria-label="Jenis soal">
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={typeFilter === option.value}
                    className={`type-chip${typeFilter === option.value ? " active" : ""}`}
                    onClick={() => setTypeFilter(option.value)}
                  >
                    {option.label} <b>{typeCounts[option.value] ?? 0}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="question-select">Soal untuk kotak {selectedTile}</label>
              <select
                id="question-select"
                value={selectedQuestionId}
                onChange={(event) => setQuestionForTile(selectedTile, event.target.value)}
              >
                <option value="">— Tidak ada soal —</option>
                {selectedHidden && (
                  <option value={selectedQuestion.id}>
                    [{QUESTION_TYPE_LABEL[selectedQuestion.type]}] {selectedQuestion.text}
                  </option>
                )}
                {Object.entries(bankBySubject).map(([subject, items]) => (
                  <optgroup key={subject} label={subject}>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{QUESTION_TYPE_LABEL[item.type]}] {item.text}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedQuestion ? (
              <div className="question-preview">
                <div className="qp-meta">
                  <span className="qp-type">{QUESTION_TYPE_LABEL[selectedQuestion.type]}</span>
                  <span className="qp-subject">{selectedQuestion.subject}</span>
                </div>
                <p>{selectedQuestion.text}</p>
                {selectedQuestion.choices && (
                  <ol className="qp-choices">
                    {selectedQuestion.choices.map((choice) => (
                      <li key={choice}>{choice}</li>
                    ))}
                  </ol>
                )}
              </div>
            ) : (
              <p className="question-empty">
                Belum ada soal khusus untuk kotak ini. Saat dimainkan, kotak ini tetap
                mendapat soal acak dari bank.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="settings-card custom-section">
        <div className="settings-card-head">
          <span className="settings-icon">
            <Plus size={18} />
          </span>
          <div>
            <h2>Buat Soal Sendiri</h2>
            <p>Soal buatanmu masuk ke bank dan ikut muncul acak saat bermain.</p>
          </div>
        </div>

        <div className="custom-form">
          <div className="custom-form-row">
            <div className="form-group">
              <label htmlFor="cq-subject">Mata pelajaran</label>
              <input
                id="cq-subject"
                type="text"
                placeholder="mis. Tajwid"
                value={draft.subject}
                onChange={(event) => updateDraft("subject", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cq-type">Jenis soal</label>
              <select
                id="cq-type"
                value={draft.type}
                onChange={(event) => updateDraft("type", event.target.value)}
              >
                {TYPE_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cq-text">Pertanyaan</label>
            <textarea
              id="cq-text"
              rows={3}
              placeholder="Tulis pertanyaan di sini..."
              value={draft.text}
              onChange={(event) => updateDraft("text", event.target.value)}
            />
          </div>

          {draft.type === "multiple_choice" && (
            <div className="form-group">
              <label>Pilihan jawaban — klik huruf untuk menandai jawaban benar</label>
              <div className="choice-list">
                {draft.choices.map((choice, index) => {
                  const letter = String.fromCharCode(65 + index);
                  return (
                    <div className={`choice-row${draft.correct === index ? " correct" : ""}`} key={letter}>
                      <button
                        type="button"
                        className="choice-mark"
                        aria-label={`Tandai pilihan ${letter} sebagai jawaban benar`}
                        aria-pressed={draft.correct === index}
                        onClick={() => updateDraft("correct", index)}
                      >
                        {letter}
                      </button>
                      <input
                        type="text"
                        placeholder={`Pilihan ${letter}`}
                        value={choice}
                        onChange={(event) => updateChoice(index, event.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {draftError && <p className="settings-error custom-error" role="alert">{draftError}</p>}

          <button type="button" className="custom-add-button" onClick={addCustomQuestion}>
            <Plus size={15} /> Tambah ke Bank Soal
          </button>
        </div>

        {customQuestions.length > 0 && (
          <div className="custom-list">
            <h3>Soal buatanmu ({customQuestions.length})</h3>
            <ul>
              {customQuestions.map((item) => (
                <li key={item.id}>
                  <div>
                    <span className="custom-meta">
                      [{QUESTION_TYPE_LABEL[item.type]}] {item.subject}
                    </span>
                    <p>{item.text}</p>
                  </div>
                  <button
                    type="button"
                    className="custom-remove"
                    aria-label={`Hapus soal ${item.text}`}
                    onClick={() => removeCustomQuestion(item.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="settings-actions">
        {error && (
          <p className="settings-error" role="alert">
            {error}
          </p>
        )}
        <button className="start-button" onClick={handleStart} disabled={!ready}>
          <Play size={17} /> Mulai Permainan
        </button>
      </div>
    </main>
  );
}
