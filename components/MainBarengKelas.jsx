"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Check, ChevronRight, CircleHelp, Crown, Dice5, Sparkles, UserPlus, Volume2, X } from "lucide-react";
import { DEFAULT_LADDERS, DEFAULT_SNAKES, PLAYER_COLORS, COLOR_LABEL, buildBoard, filterLinks } from "../lib/boardConfig";
import { QUESTION_BANK } from "../lib/questionBank";

const diceHistory = [
  { player: "Alya", value: 4, time: "10:30" },
  { player: "Bima", value: 2, time: "10:29" },
  { player: "Caca", value: 6, time: "10:28" },
];

const SCORE_CORRECT = 10;

/**
 * Halaman utama bermain dalam satu layar: papan ular tangga, panel dadu,
 * daftar pemain, dan popup soal. Konfigurasi (pemain, ukuran papan, soal per
 * kotak) datang dari halaman "Atur Permainan" lewat props; komponen ini
 * mengelola giliran, posisi pion, skor, dan kondisi menang.
 */
export default function MainBarengKelas({ players, setPlayers, boardSize, tileQuestions, onExit }) {
  const [turn, setTurn] = useState(0);
  const [die, setDie] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState(false);
  const [tile, setTile] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [essayAnswer, setEssayAnswer] = useState("");
  const [essayError, setEssayError] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(null);
  const [addError, setAddError] = useState("");
  const [lastLanding, setLastLanding] = useState(null);

  const { cells, cols, rows } = useMemo(() => buildBoard(boardSize), [boardSize]);
  const activeLadders = useMemo(() => filterLinks(DEFAULT_LADDERS, boardSize), [boardSize]);
  const activeSnakes = useMemo(() => filterLinks(DEFAULT_SNAKES, boardSize), [boardSize]);
  const questionMap = useMemo(() => {
    const map = {};
    for (const [tileKey, questionId] of Object.entries(tileQuestions ?? {})) {
      const found = QUESTION_BANK.find((item) => item.id === questionId);
      if (found) map[tileKey] = found;
    }
    return map;
  }, [tileQuestions]);
  const current = players[turn];
  const nextPlayer = players[(turn + 1) % players.length];
  const winner = players.find((player) => player.position >= boardSize);
  const question = tile ? questionMap[tile] ?? null : null;
  const usedColors = new Set(players.map((player) => player.color));
  const availableColors = PLAYER_COLORS.filter((color) => !usedColors.has(color));
  const previewColor = newColor ?? availableColors[0] ?? "coral";

  /**
   * Akhiri giliran sekarang juga: tutup soal, bersihkan dadu, lalu pindah ke
   * pemain berikutnya secara berurutan (melingkar).
   */
  const advanceTurn = useCallback(() => {
    setDie(null);
    setTile(null);
    setResult(null);
    setMessage("");
    setLastLanding(null);
    setTurn((index) => (index + 1) % players.length);
  }, [players.length]);

  /**
   * Rotasi giliran otomatis: sesudah pion selesai melangkah, giliran berpindah
   * sendiri ke pemain berikutnya. Bila petak yang ditempati punya soal, tunggu
   * sampai soal dijawab (atau dilewati) dulu baru lanjut.
   */
  useEffect(() => {
    if (winner || gameOver) return;
    if (rolling || moving || die === null) return;
    const hasQuestion = lastLanding != null && Boolean(questionMap[lastLanding]);
    if (hasQuestion && !result) return;
    const timer = window.setTimeout(advanceTurn, result ? 1700 : 1100);
    return () => window.clearTimeout(timer);
  }, [advanceTurn, die, rolling, moving, result, lastLanding, questionMap, winner, gameOver]);

  function addScore(playerIndex) {
    setPlayers((list) => list.map((player, index) => (index === playerIndex ? { ...player, score: player.score + SCORE_CORRECT } : player)));
  }

  /**
   * Tambah pemain baru ke sesi yang sedang berjalan. Data masih disimpan lokal
   * (data tiruan) sampai endpoint sesi tersedia; nama wajib diisi, warna
   * otomatis memakai warna bebas pertama bila belum dipilih.
   */
  function addPlayer(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setAddError("Nama pemain belum diisi.");
      return;
    }
    if (players.length >= PLAYER_COLORS.length) {
      setAddError(`Maksimal ${PLAYER_COLORS.length} pemain.`);
      return;
    }
    const color = (newColor && !usedColors.has(newColor) ? newColor : null) ?? availableColors[0] ?? PLAYER_COLORS[players.length % PLAYER_COLORS.length];
    setPlayers((list) => [...list, { name, color, position: 1, score: 0 }]);
    setNewName("");
    setNewColor(null);
    setAddError("");
  }

  function roll() {
    if (rolling || moving || die !== null || winner || gameOver) return;
    setRolling(true);
    setTile(null);
    setResult(null);
    setMessage("");
    setLastLanding(null);
    const value = Math.ceil(Math.random() * 6);
    window.setTimeout(() => {
      const startPos = players[turn].position;
      const landed = Math.min(boardSize, startPos + value);
      const destination = activeLadders[landed] ?? activeSnakes[landed] ?? landed;
      setDie(value);
      setRolling(false);
      setMoving(true);
      const steps = Array.from({ length: landed - startPos }, (_, index) => startPos + index + 1);
      steps.forEach((position, index) => {
        window.setTimeout(() => {
          setPlayers((list) => list.map((player, playerIndex) => (playerIndex === turn ? { ...player, position } : player)));
          if (index === steps.length - 1) {
            const pathMessage = activeLadders[landed]
              ? `Tangga! Naik ke kotak ${destination}.`
              : activeSnakes[landed] ? `Ular! Turun ke kotak ${destination}.` : "";
            setMessage(pathMessage);
            if (destination !== landed) {
              window.setTimeout(() => {
                setPlayers((list) => list.map((player, playerIndex) => (playerIndex === turn ? { ...player, position: destination } : player)));
                setLastLanding(destination);
                setMoving(false);
                if (destination >= boardSize) setGameOver(true);
              }, 380);
            } else {
              setLastLanding(destination);
              setMoving(false);
              if (destination >= boardSize) setGameOver(true);
            }
          }
        }, (index + 1) * 200);
      });
    }, 650);
  }

  function answer(index) {
    if (!question || result) return;
    const correct = index === question.correct;
    setResult(correct ? "correct" : "incorrect");
    if (correct) addScore(turn);
  }

  function submitEssay() {
    if (!question || result) return;
    if (!essayAnswer.trim()) {
      setEssayError("Jawaban tidak boleh kosong!");
      return;
    }
    setEssayError("");
    setResult("correct");
    addScore(turn);
  }

  function judgeOral(isCorrect) {
    if (!question || result) return;
    setResult(isCorrect ? "correct" : "incorrect");
    if (isCorrect) addScore(turn);
  }

  function restartGame() {
    setPlayers((list) => list.map((player) => ({ ...player, position: 1, score: 0 })));
    setTurn(0);
    setDie(null);
    setTile(null);
    setResult(null);
    setMessage("");
    setLastLanding(null);
    setGameOver(false);
  }

  if (winner) {
    return (
      <main className="shell">
        <div className="winner-banner" role="alert">
          <div className="winner-content">
            <Crown size={48} />
            <h2>{winner.name} Menang!</h2>
            <p>Selamat! Kamu berhasil mencapai kotak finis {boardSize}.</p>
            <button onClick={restartGame}>Main Lagi</button>
            <button className="ghost-button" onClick={onExit}>Atur Permainan</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Dice5 size={21} /></span>papan<span className="brand-dot">.</span>ceria</a><div className="class-label"><i /> KELAS 3A <b>/</b> SESI PAGI</div><button className="sound-button" aria-label="Suara aktif"><Volume2 size={18} /></button></header>
      <section className="heading"><div><p className="eyebrow"><Sparkles size={14} /> BELAJAR BARENG, MAIN BARENG</p><h1>Ular Tangga <span>Belajar!</span></h1></div><div className="finish-pill"><Crown size={16} /> FINIS DI KOTAK {boardSize}</div></section>
      <section className="layout" aria-label="Permainan ular tangga">
        <div className="board-wrap"><div className="board-topline"><div className="turn-indicator"><span className={`avatar ${current?.color}`}>{current?.name[0]}</span><div><small>GILIRAN SEKARANG</small><strong>{winner ? `${winner.name} menang!` : `${current?.name} yang jalan`}</strong>{!winner && nextPlayer && <em className="next-turn-hint">Berikutnya: {nextPlayer.name}</em>}</div></div><div className="key"><span><ArrowUpRight size={15} /> Tangga</span><span><ArrowDownRight size={15} /> Ular</span></div></div>
          <div className="board" role="grid" aria-label={`Papan permainan, kotak 1 sampai ${boardSize}`} style={{ "--cols": String(cols), "--rows": String(rows), gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>{cells.map((number, cellIndex) => {
            if (number === null) return <div className="tile tile-empty" key={`empty-${cellIndex}`} aria-hidden="true" />;
            const occupants = players.filter((player) => player.position === number);
            const hasQuestion = Boolean(questionMap[number]);
            const canOpen = hasQuestion && current.position === number;
            const special = number === 1 ? " start-tile" : number === boardSize ? " finish-tile" : "";
            const hasPawn = occupants.length > 0;
            return <button key={number} type="button" role="gridcell" aria-label={`Kotak ${number}${hasQuestion ? ", ada soal" : ""}${occupants.length ? `, pion ${occupants.map((player) => player.name).join(", ")}` : ""}`} className={`tile tone-${(number + Math.floor((number - 1) / cols)) % 4}${special}${canOpen ? " ready" : ""}${tile === number ? " selected" : ""}${hasPawn ? " has-pawn" : ""}`} onClick={() => { if (canOpen) { setTile(number); setResult(null); } }}>
              <span className="tile-number">{number}</span>{number === 1 && <span className="start-label">MULAI</span>}{number === boardSize && <span className="finish-label"><Crown size={12} /> FINIS</span>}
              {activeLadders[number] && <span className="marker ladder"><ArrowUpRight size={16} /></span>}{activeSnakes[number] && <span className="marker snake"><ArrowDownRight size={16} /></span>}
              {hasQuestion && <span className={`question-dot${canOpen ? " active" : ""}`} title="Klik untuk membuka soal"><CircleHelp size={12} /></span>}{occupants.length > 0 && <span className="pawns">{occupants.slice(0, 4).map((player) => <span className={`pawn ${player.color}${moving && player.name === current?.name ? " is-moving" : ""}`} key={`${player.name}-${player.color}`}>{player.name[0]}</span>)}{occupants.length > 4 && <span className="pawn pawn-more">+{occupants.length - 4}</span>}</span>}
            </button>;
          })}</div><div className="board-footer"><span>✳ &nbsp;LEMPAR DADU, LANGKAHKAN PIONMU</span><span>{boardSize} PETAK</span></div></div>
        <aside className="sidebar">
          <section className="dice-panel"><div className="panel-top"><span>LEMPAR DADU</span><b>{die ? `ANGKA ${die}` : "GILIRANMU"}</b></div><div className={`die${rolling ? " rolling" : ""}`} aria-live="polite">{die ?? <Dice5 size={58} />}</div><p className="hint">{rolling ? "Dadu sedang berputar..." : winner ? "Permainan selesai!" : message || `${current?.name}, siap melangkah?`}</p><button className="roll-button" onClick={roll} aria-label={`Lempar dadu untuk ${current?.name ?? "pemain"}`} disabled={rolling || moving || die !== null || Boolean(winner) || gameOver}><Dice5 size={19} /> {rolling ? "MENGOCOK..." : "LEMPAR DADU"} <ChevronRight size={17} /></button>{die !== null && !winner && !moving && !gameOver && lastLanding != null && Boolean(questionMap[lastLanding]) && !result && <button className="next-turn" onClick={advanceTurn}>Lewati giliran <ChevronRight size={15} /></button>}<div className="dice-history"><h3>Riwayat Lemparan</h3>{diceHistory.map((entry, index) => <div className="history-row" key={index}><span className={`avatar ${entry.player === "Alya" ? "coral" : entry.player === "Bima" ? "blue" : "green"}`}>{entry.player[0]}</span><span className="history-value">{entry.value}</span><span className="history-time">{entry.time}</span></div>)}</div></section>
          <section className="players-panel"><div className="section-heading"><h2>Pemain</h2><span>{players.length} anak</span></div>{players.map((player, index) => <div className={`player-row${index === turn ? " active" : ""}`} key={`${player.name}-${player.color}`}><span className={`avatar ${player.color}`} title={`${player.name} — pion ${COLOR_LABEL[player.color] ?? player.color}`} aria-label={`${player.name}, pion warna ${COLOR_LABEL[player.color] ?? player.color}`}>{player.name[0]}</span><div className="player-meta"><strong>{player.name}{index === turn && <small className="you-tag">JALAN</small>}</strong><span>Kotak {player.position} · pion {COLOR_LABEL[player.color] ?? player.color}</span></div><b className="score"><Sparkles size={12} /> {player.score}</b></div>)}
            {players.length < PLAYER_COLORS.length ? (
              <form className="add-player" onSubmit={addPlayer}>
                <div className="add-player-row">
                  <span className={`avatar ${previewColor}`}>{players.length + 1}</span>
                  <input
                    type="text"
                    value={newName}
                    onChange={(event) => { setNewName(event.target.value); if (addError) setAddError(""); }}
                    placeholder="Nama pemain baru"
                    aria-label="Nama pemain baru"
                  />
                </div>
                <div className="color-picker add-player-colors" role="radiogroup" aria-label="Warna pion pemain baru">
                  {PLAYER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-dot ${color}${newColor === color ? " active" : ""}`}
                      aria-label={`Warna ${color}`}
                      aria-pressed={newColor === color}
                      disabled={usedColors.has(color)}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
                {addError && <p className="add-player-error">{addError}</p>}
                <button type="submit" className="add-player-button"><UserPlus size={15} /> Tambah Pemain</button>
              </form>
            ) : (
              <p className="add-player-limit">Maksimal {PLAYER_COLORS.length} pemain sudah tercapai.</p>
            )}</section>
          {question ? <div className="modal-overlay" onClick={() => { setTile(null); setEssayAnswer(""); setEssayError(""); }}><div className={`question-modal${result ? ` ${result}` : ""}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={question.type === "essay" ? "Soal esai" : question.type === "oral" ? "Soal lisan" : "Soal pilihan ganda"}><div className="question-top"><span>{question.subject}</span><button onClick={() => { setTile(null); setEssayAnswer(""); setEssayError(""); }} aria-label="Tutup soal"><X size={16} /></button></div><small>SOAL PETAK {tile}</small><h2>{question.text}</h2>{question.type === "essay" ? <div className="essay-section"><textarea value={essayAnswer} onChange={(e) => setEssayAnswer(e.target.value)} placeholder="Tulis jawabanmu di sini..." disabled={Boolean(result)} />{essayError && <p className="essay-error">{essayError}</p>}{!result && <button className="submit-essay" onClick={submitEssay}>Jawab</button>}</div> : question.type === "oral" ? <div className="oral-section"><p className="oral-hint">Jawablah dengan suara, lalu guru menilai benar atau salah.</p>{!result && <div className="oral-buttons"><button className="oral-correct" onClick={() => judgeOral(true)}><Check size={16} /> Benar</button><button className="oral-incorrect" onClick={() => judgeOral(false)}><X size={16} /> Salah</button></div>}</div> : <div className="answers">{question.choices.map((choice, index) => <button key={choice} disabled={Boolean(result)} onClick={() => answer(index)}><b>{String.fromCharCode(65 + index)}</b>{choice}</button>)}</div>}{result && <p className="feedback">{result === "correct" ? <><Check size={16} /> Tepat sekali! +10 poin</> : "Belum tepat, coba lagi di soal berikutnya."}</p>}</div></div> : <section className="tip"><span><Sparkles size={17} /></span><p><strong>Petak penuh kejutan!</strong><br />Soal baru terbuka saat pionmu berhenti di sana.</p></section>}
        </aside>
      </section><footer className="footer"><span>Dibuat untuk belajar yang lebih seru <b>♥</b></span><span>Guru bisa bantu kalau ada soal lisan</span></footer>
    </main>
  );
}
