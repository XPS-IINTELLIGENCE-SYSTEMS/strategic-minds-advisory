import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  StickyNote, Link2, Users, Plus, Trash2, RefreshCw,
  Loader2, Star, X, Check, ChevronDown, Layers
} from 'lucide-react';

const NOTE_COLORS = [
  { bg: 'bg-yellow-400/20', border: 'border-yellow-400/40', text: 'text-yellow-200', label: 'Gold' },
  { bg: 'bg-blue-400/20',   border: 'border-blue-400/40',   text: 'text-blue-200',   label: 'Blue' },
  { bg: 'bg-purple-400/20', border: 'border-purple-400/40', text: 'text-purple-200', label: 'Purple' },
  { bg: 'bg-green-400/20',  border: 'border-green-400/40',  text: 'text-green-200',  label: 'Green' },
  { bg: 'bg-pink-400/20',   border: 'border-pink-400/40',   text: 'text-pink-200',   label: 'Pink' },
  { bg: 'bg-orange-400/20', border: 'border-orange-400/40', text: 'text-orange-200', label: 'Orange' },
];

const AGENT_NAMES = ['Analyzer', 'Visionary', 'Strategist', 'Inventor', 'Predictor', 'Validator'];
const AGENT_EMOJIS = { Analyzer:'🔬', Visionary:'🌌', Strategist:'♟️', Inventor:'⚗️', Predictor:'📡', Validator:'✅' };

// Each sticky note / idea card on the board
function BoardCard({ item, onMove, onDelete, onVote, onEdit, isSelected, onSelect, canvasOffset }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text || item.title || '');
  const dragStartPos = useRef(null);
  const isDragging = useRef(false);

  const colorConfig = NOTE_COLORS[item.colorIndex || 0];
  const isIdea = item.type === 'idea';

  const handleMouseDown = (e) => {
    if (editing) return;
    e.preventDefault();
    dragStartPos.current = { x: e.clientX - item.x, y: e.clientY - item.y };
    isDragging.current = false;

    const handleMouseMove = (me) => {
      if (!dragStartPos.current) return;
      isDragging.current = true;
      onMove(item.id, me.clientX - dragStartPos.current.x, me.clientY - dragStartPos.current.y);
    };
    const handleMouseUp = () => {
      dragStartPos.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setTimeout(() => { isDragging.current = false; }, 10);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    if (!isDragging.current) onSelect(item.id);
  };

  const saveEdit = () => {
    onEdit(item.id, editText);
    setEditing(false);
  };

  const totalVotes = Object.values(item.votes || {}).reduce((a, b) => a + b, 0);

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{ position: 'absolute', left: item.x, top: item.y, zIndex: isSelected ? 100 : 10, cursor: 'grab', userSelect: 'none', minWidth: 180, maxWidth: 240 }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`rounded-2xl border ${colorConfig.border} ${colorConfig.bg} backdrop-blur-sm shadow-xl overflow-hidden ${isSelected ? 'ring-2 ring-accent' : ''}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-3 py-2 border-b ${colorConfig.border}`}>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{isIdea ? '💡' : '📝'}</span>
            {isIdea && item.status && (
              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full border ${colorConfig.border} ${colorConfig.text}`}>
                {item.status}
              </span>
            )}
            {item.score > 0 && (
              <span className={`text-[9px] font-medium ${colorConfig.text}`}>{item.score}/100</span>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="w-5 h-5 rounded-full hover:bg-black/20 flex items-center justify-center transition opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="px-3 py-2.5">
          {editing ? (
            <div onClick={e => e.stopPropagation()}>
              <textarea
                autoFocus value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full bg-transparent text-xs resize-none outline-none min-h-[60px]"
                rows={3}
              />
              <div className="flex gap-1 mt-1">
                <button onClick={saveEdit} className="flex-1 text-[10px] py-1 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition">Save</button>
                <button onClick={() => setEditing(false)} className="flex-1 text-[10px] py-1 rounded-lg bg-secondary/40 text-muted-foreground transition">Cancel</button>
              </div>
            </div>
          ) : (
            <p onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className={`text-xs leading-relaxed ${colorConfig.text} break-words`}>
              {editText || item.title || 'Double-click to edit'}
            </p>
          )}
        </div>

        {/* Votes */}
        <div className={`px-3 py-2 border-t ${colorConfig.border} space-y-1`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Agent Votes</span>
            <span className={`text-[10px] font-medium ${colorConfig.text}`}>
              <Star className="w-2.5 h-2.5 inline mr-0.5" />{totalVotes}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {AGENT_NAMES.map(agent => {
              const voted = (item.votes || {})[agent] > 0;
              return (
                <button key={agent} onClick={() => onVote(item.id, agent)}
                  className={`text-[9px] px-1.5 py-0.5 rounded-full border transition-all ${
                    voted ? `${colorConfig.border} ${colorConfig.bg} ${colorConfig.text}` : 'border-border text-muted-foreground opacity-50 hover:opacity-80'
                  }`}>
                  {AGENT_EMOJIS[agent]}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Connection line between two cards
function Connection({ from, to, label }) {
  if (!from || !to) return null;
  const x1 = from.x + 90, y1 = from.y + 40;
  const x2 = to.x + 90, y2 = to.y + 40;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6 4" />
      <circle cx={mx} cy={my} r={3} fill="hsl(var(--accent))" opacity={0.5} />
      {label && (
        <text x={mx + 6} y={my - 4} fill="hsl(var(--accent))" fontSize="9" opacity={0.7}>{label}</text>
      )}
    </g>
  );
}

export default function IdeaWhiteboard() {
  const [cards, setCards] = useState([]);
  const [connections, setConnections] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null);
  const [showIdeas, setShowIdeas] = useState(false);
  const [megaprojects, setMegaprojects] = useState([]);
  const [showMegaForm, setShowMegaForm] = useState(false);
  const [megaName, setMegaName] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => { loadIdeas(); }, []);

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    const data = await base44.entities.VisionIdea.list('-created_date', 50);
    setIdeas(data);
    setLoadingIdeas(false);
  };

  const addNote = () => {
    const id = `note_${Date.now()}`;
    setCards(prev => [...prev, {
      id, type: 'note', text: 'New note', x: 80 + Math.random() * 200, y: 80 + Math.random() * 200,
      colorIndex: Math.floor(Math.random() * NOTE_COLORS.length), votes: {}
    }]);
  };

  const addIdeaCard = (idea) => {
    const id = `idea_${idea.id}`;
    if (cards.find(c => c.id === id)) return;
    setCards(prev => [...prev, {
      id, type: 'idea', title: idea.title, text: idea.description?.substring(0, 120),
      status: idea.status, score: idea.validation_score,
      ideaId: idea.id, domain: idea.domain,
      x: 100 + Math.random() * 300, y: 100 + Math.random() * 300,
      colorIndex: Math.floor(Math.random() * NOTE_COLORS.length), votes: {}
    }]);
    setShowIdeas(false);
  };

  const moveCard = (id, x, y) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, x, y } : c));
  };

  const deleteCard = (id) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(con => con.from !== id && con.to !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const editCard = (id, text) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, text } : c));
  };

  const voteOnCard = (id, agent) => {
    setCards(prev => prev.map(c => {
      if (c.id !== id) return c;
      const votes = { ...(c.votes || {}) };
      votes[agent] = votes[agent] ? 0 : 1;
      return { ...c, votes };
    }));
  };

  const handleSelect = (id) => {
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(id);
      } else if (connectFrom !== id) {
        setConnections(prev => [...prev, { id: `conn_${Date.now()}`, from: connectFrom, to: id, label: 'linked' }]);
        setConnectFrom(null);
        setConnectMode(false);
      }
    } else {
      setSelectedId(prev => prev === id ? null : id);
    }
  };

  const createMegaproject = () => {
    if (!megaName.trim() || !selectedId) return;
    setMegaprojects(prev => [...prev, { id: `mega_${Date.now()}`, name: megaName, cardIds: [selectedId] }]);
    setMegaName('');
    setShowMegaForm(false);
  };

  // Ranking by votes
  const rankedCards = [...cards]
    .filter(c => c.type === 'idea')
    .map(c => ({ ...c, totalVotes: Object.values(c.votes || {}).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => (b.totalVotes + (b.score || 0) / 10) - (a.totalVotes + (a.score || 0) / 10));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-border bg-card/20 flex items-center gap-2 flex-wrap">
        <button onClick={addNote}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-secondary/30 hover:bg-secondary text-xs transition">
          <Plus className="w-3.5 h-3.5" /> Sticky Note
        </button>

        {/* Add idea from board */}
        <div className="relative">
          <button onClick={() => setShowIdeas(o => !o)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs transition hover:bg-accent/20">
            {loadingIdeas ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add Idea <ChevronDown className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {showIdeas && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 mt-1 z-30 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden min-w-[260px] max-h-64 overflow-y-auto">
                {ideas.map(idea => (
                  <button key={idea.id} onClick={() => addIdeaCard(idea)}
                    className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition border-b border-border/40 last:border-0">
                    <div className="text-xs font-medium truncate">{idea.title}</div>
                    <div className="text-[10px] text-muted-foreground">{idea.domain} · {idea.status}</div>
                  </button>
                ))}
                {ideas.length === 0 && <div className="px-4 py-3 text-xs text-muted-foreground">No ideas yet</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Connect mode */}
        <button onClick={() => { setConnectMode(o => !o); setConnectFrom(null); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition ${
            connectMode ? 'border-accent bg-accent/20 text-accent' : 'border-border bg-secondary/30 hover:bg-secondary'
          }`}>
          <Link2 className="w-3.5 h-3.5" />
          {connectMode ? (connectFrom ? 'Click target card…' : 'Click source card…') : 'Link Ideas'}
        </button>

        {/* Megaproject */}
        {selectedId && (
          <div className="flex items-center gap-1.5">
            {showMegaForm ? (
              <>
                <input value={megaName} onChange={e => setMegaName(e.target.value)}
                  placeholder="Megaproject name…"
                  className="px-3 py-2 rounded-xl border border-border bg-background text-xs outline-none focus:border-accent transition w-44" />
                <button onClick={createMegaproject} className="px-3 py-2 rounded-xl btn-ivory text-xs">Create</button>
                <button onClick={() => setShowMegaForm(false)} className="px-2 py-2 rounded-xl border border-border text-xs text-muted-foreground">Cancel</button>
              </>
            ) : (
              <button onClick={() => setShowMegaForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs hover:bg-purple-500/20 transition">
                <Layers className="w-3.5 h-3.5" /> Megaproject
              </button>
            )}
          </div>
        )}

        <button onClick={() => setCards([])} className="ml-auto flex items-center gap-1 text-xs px-2.5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition">
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div ref={canvasRef} className="flex-1 relative overflow-hidden bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] bg-[size:40px_40px]">
          {/* SVG connection layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            {connections.map(conn => {
              const from = cards.find(c => c.id === conn.from);
              const to = cards.find(c => c.id === conn.to);
              return <Connection key={conn.id} from={from} to={to} label={conn.label} />;
            })}
          </svg>

          {/* Cards */}
          {cards.map(card => (
            <BoardCard
              key={card.id}
              item={card}
              onMove={moveCard}
              onDelete={deleteCard}
              onVote={voteOnCard}
              onEdit={editCard}
              isSelected={selectedId === card.id}
              onSelect={handleSelect}
            />
          ))}

          {cards.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="text-muted-foreground">
                <StickyNote className="w-14 h-14 mx-auto mb-3 opacity-10" />
                <p className="text-sm font-medium">Vision Whiteboard</p>
                <p className="text-xs mt-1 opacity-60">Add sticky notes, drag ideas from the board, link them into Megaprojects</p>
              </div>
            </div>
          )}

          {/* Megaproject labels */}
          {megaprojects.map((mp, i) => (
            <div key={mp.id} className="absolute top-4 right-4 flex flex-col gap-1" style={{ zIndex: 20 }}>
              <div className="px-3 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> {mp.name}
              </div>
            </div>
          ))}
        </div>

        {/* Ranking sidebar */}
        {rankedCards.length > 0 && (
          <div className="w-56 flex-shrink-0 border-l border-border bg-card/30 flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium">Consensus Ranking</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {rankedCards.map((card, i) => {
                const totalVotes = card.totalVotes;
                const maxScore = Math.max(...rankedCards.map(c => c.totalVotes + (c.score || 0) / 10), 1);
                const composite = (totalVotes + (card.score || 0) / 10);
                const pct = Math.round((composite / maxScore) * 100);
                return (
                  <div key={card.id} className="rounded-xl border border-border bg-card/60 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`text-xs font-bold ${i === 0 ? 'text-accent' : 'text-muted-foreground'}`}>#{i + 1}</span>
                      <span className="text-xs truncate flex-1">{card.title || card.text}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-1.5">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span><Star className="w-2.5 h-2.5 inline" /> {totalVotes} votes</span>
                      {card.score > 0 && <span>{card.score}/100</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}