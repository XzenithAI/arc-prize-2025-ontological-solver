import React, { useState, useEffect, useRef, useMemo } from "react";

// Complete VX OS implementation with safe module integrations.
// Features:
//  - In‑browser file system backed by localStorage
//  - Draggable windows: Explorer, Editor, Console, Jobs
//  - Command palette with simple actions
//  - JS sandbox to run JavaScript files safely
//  - Jobs window with tasks mirroring safe Python modules:
//      - Consciousness analysis (compute novelty/authenticity on a signal array)
//      - Ripple node generator (ExcelRippleNode)
//      - Identity seal (reads JSON and writes identity_seal)
//      - Omniflow generator (VX_OMNIFLOW)
//      - XZenith block propagation (if genesis/ledger exist)

/********************
 * File System
 *******************/
const FS_KEY = "complete_vxos_fs_v1";

function defaultFS() {
  return {
    name: "root",
    type: "folder",
    children: [
      {
        name: "hello.js",
        type: "file",
        content:
          "// Welcome to the complete VX OS\n" +
          "// Try editing this file and clicking ▶ Run below.\n" +
          "function greet(name){ return `Hello, ${name}!`; }\n" +
          "console.log(greet('world'));\n",
      },
      {
        name: "README.md",
        type: "file",
        content:
          "# Complete VX OS\n\n" +
          "This environment includes a Jobs window for running safe modules:\n" +
          "- Consciousness Engine: computes novelty and authenticity for a numeric signal.\n" +
          "- Ripple Seed: generates an ExcelRippleNode.json file.\n" +
          "- Identity Seal: reads a JSON file from the FS and seals it into identity_core_seal.json.\n" +
          "- Omniflow: generates VX_OMNIFLOW.json.\n" +
          "- XZenith Propagation: if XZENITH_GENESIS_BLOCK.json and VX_LEDGER.json exist, creates XZENITH_BLOCK_1.json.\n",
      },
    ],
  };
}

function loadFS() {
  try {
    const raw = localStorage.getItem(FS_KEY);
    if (!raw) return defaultFS();
    return JSON.parse(raw);
  } catch {
    return defaultFS();
  }
}

function saveFS(root) {
  localStorage.setItem(FS_KEY, JSON.stringify(root));
}

function upsertFile(root, filename, content) {
  if (root.type !== "folder") return root;
  const idx = root.children?.findIndex((c) => c.name === filename) ?? -1;
  const file = { name: filename, type: "file", content };
  const children = root.children ? [...root.children] : [];
  if (idx >= 0) children[idx] = file; else children.push(file);
  const updated = { ...root, children };
  saveFS(updated);
  return updated;
}

function readFile(root, filename) {
  const node = root.children?.find((c) => c.type === "file" && c.name === filename);
  return node ? node.content : null;
}

function deleteFile(root, filename) {
  if (root.type !== "folder" || !root.children) return root;
  const children = root.children.filter((c) => c.name !== filename);
  const updated = { ...root, children };
  saveFS(updated);
  return updated;
}

/********************
 * Draggable Window
 *******************/
function useDraggable(initial) {
  const [pos, setPos] = useState(initial);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const onMouseDown = (e) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (document.activeElement)?.blur?.();
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
  };
  const onMouseUp = () => { dragging.current = false; };
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });
  return { pos, onMouseDown };
}

const Window = ({ title, children, initial, onFocus, focused, footer }) => {
  const { pos, onMouseDown } = useDraggable({ x: initial.x, y: initial.y });
  const [size] = useState({ w: initial.w ?? 520, h: initial.h ?? 360 });
  return (
    <div
      className={`fixed shadow-2xl rounded-2xl border ${focused ? "border-indigo-400 shadow-indigo-300/40" : "border-slate-800/60"} overflow-hidden bg-slate-900/95 backdrop-blur text-slate-100`}
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
      onMouseDown={onFocus}
    >
      <div className="cursor-move select-none flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-700" onMouseDown={onMouseDown}>
        <div className="flex gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="font-semibold text-sm ml-2 truncate">{title}</div>
      </div>
      <div className="w-full h-[calc(100%-72px)] p-3 overflow-auto">
        {children}
      </div>
      <div className="h-[36px] border-t border-slate-700/60 text-xs px-3 flex items-center justify-between bg-slate-800/70">
        {footer}
      </div>
    </div>
  );
};

/********************
 * Explorer
 *******************/
const Explorer = ({ fs, setFS, onOpen, onDelete }) => {
  const [newName, setNewName] = useState("");
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="text-sm text-slate-300">Files</div>
      <div className="flex-1 rounded-xl border border-slate-700/60 overflow-hidden">
        <ul className="divide-y divide-slate-800">
          {fs.children?.map((c) => (
            <li key={c.name} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/60 cursor-pointer" onDoubleClick={() => c.type === "file" && onOpen(c.name)}>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400/80" />
                <span className="text-sm">{c.name}</span>
              </div>
              {c.type === "file" && (
                <button className="text-xs px-2 py-1 rounded bg-red-600/70 hover:bg-red-600" onClick={(e) => { e.stopPropagation(); onDelete(c.name); }}>Delete</button>
              )}
            </li>
          ))}
          {(!fs.children || fs.children.length === 0) && (
            <li className="px-3 py-6 text-sm text-slate-500">No files yet.</li>
          )}
        </ul>
      </div>
      <div className="flex items-center gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="new-file.js" className="flex-1 bg-slate-800/80 rounded-lg px-3 py-2 text-sm outline-none border border-slate-700/60 focus:border-indigo-400" />
        <button className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm" onClick={() => { if (!newName.trim()) return; const name = newName.trim(); setFS(upsertFile(fs, name, "")); setNewName(""); onOpen(name); }}>Create</button>
      </div>
      <div className="text-xs text-slate-400">Double‑click a file to open it in the Editor.</div>
    </div>
  );
};

/********************
 * Editor
 *******************/
const EditorView = ({ openFiles, currentFile, setCurrentFile, setOpenFiles, fs, setFS, onRun }) => {
  // locate current file object
  const file = useMemo(() => {
    if (!currentFile) return null;
    return fs.children?.find((c) => c.type === "file" && c.name === currentFile) || null;
  }, [currentFile, fs]);
  // local editor content state
  const [content, setContent] = useState(file?.content ?? "");
  useEffect(() => { setContent(file?.content ?? ""); }, [file?.name]);
  if (!file) return <div className="text-sm text-slate-400">Pick a file from Explorer to edit.</div>;
  const save = () => setFS(upsertFile(fs, file.name, content));
  // close a tab
  const closeTab = (name) => {
    const newFiles = openFiles.filter((f) => f !== name);
    setOpenFiles(newFiles);
    if (currentFile === name) {
      const newCurrent = newFiles.length > 0 ? newFiles[newFiles.length - 1] : null;
      setCurrentFile(newCurrent);
    }
  };
  return (
    <div className="flex flex-col h-full gap-2">
      {/* tabs */}
      <div className="flex flex-wrap gap-1 mb-1">
        {openFiles.map((name) => (
          <div key={name} className={`flex items-center px-2 py-1 rounded-t-md cursor-pointer ${name === currentFile ? 'bg-slate-800 text-slate-200' : 'bg-slate-700/60 text-slate-400'}`} onClick={() => setCurrentFile(name)}>
            <span className="font-mono text-xs">{name}</span>
            <span className="ml-2 text-xs" onClick={(e) => { e.stopPropagation(); closeTab(name); }}>&times;</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">Editing: <span className="font-mono text-slate-100">{file.name}</span></div>
        <div className="flex items-center gap-2">
          <button className="text-xs px-3 py-1 rounded bg-slate-700/80 hover:bg-slate-700" onClick={save}>Save</button>
          <button className="text-xs px-3 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600" onClick={() => onRun(content)}>▶ Run</button>
        </div>
      </div>
      <div className="flex-1">
        <textarea className="w-full h-full font-mono text-sm bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 outline-none focus:border-indigo-400" spellCheck={false} value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div className="text-xs text-slate-500">This editor runs JavaScript files directly. Markdown and other files are just text.</div>
    </div>
  );
};

/********************
 * Console
 *******************/
const ConsoleView = ({ lines, onClear }) => (
  <div className="h-full flex flex-col">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-slate-300">Console</div>
      <button className="text-xs px-2 py-1 rounded bg-slate-700/80 hover:bg-slate-700" onClick={onClear}>Clear</button>
    </div>
    <div className="flex-1 rounded-xl border border-slate-700/60 p-2 overflow-auto bg-black/60">
      {lines.length === 0 && (<div className="text-xs text-slate-500">No output yet.</div>)}
      {lines.map((l, i) => (
        <div key={i} className={l.type === 'error' ? 'text-red-400' : 'text-slate-200'}>
          <span className="text-slate-500">{"> "}</span>
          <span className="whitespace-pre-wrap break-words">{l.text}</span>
        </div>
      ))}
    </div>
  </div>
);

/********************
 * JS Sandbox Runner
 *******************/
function useSandbox(onMessage) {
  const iframeRef = useRef(null);
  const run = (code) => {
    const safeCode = String(code || '').replaceAll('</script>', '<\\/script>');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>` +
      `<script>\n` +
      `const parent = window.parent;\n` +
      `function send(type, text){ try { parent.postMessage({ __vx: true, type, text }, '*'); } catch(e){} }\n` +
      `console.log = (...args) => send('log', args.map(a => { try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); } catch (e) { return String(a); } }).join(' '));\n` +
      `console.error = (...args) => send('error', args.map(String).join(' '));\n` +
      `try {\n` +
      safeCode +
      `\n} catch (e) { console.error(e && e.stack ? e.stack : String(e)); }\n` +
      `</script></body></html>`;
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
    }
  };
  useEffect(() => {
    const handler = (ev) => {
      const data = ev.data;
      if (!data || !data.__vx) return;
      if (data.type === 'log' || data.type === 'error') onMessage({ type: data.type, text: String(data.text) });
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);
  return { iframeRef, run };
}

/********************
 * Jobs integration
 *******************/
function useJobs(fs, setFS, openFile, setCurrentFile, setLines) {
  // ConscEngine: compute novelty and authenticity
  const runConsciousness = (signalString) => {
    try {
      const parts = signalString.split(/[,\s]+/).filter(Boolean).map(Number);
      if (!parts || parts.some(isNaN)) throw new Error('Invalid signal');
      const arr = parts;
      // softmax + entropy
      const max = Math.max(...arr);
      const exps = arr.map((v) => Math.exp(v - max));
      const sum = exps.reduce((a, b) => a + b, 0);
      const probs = exps.map((v) => v / sum);
      const entropy = -probs.reduce((acc, p) => acc + p * Math.log(p + 1e-12), 0);
      let authenticity;
      if (entropy > 0.9) authenticity = 0.99;
      else if (entropy > 0.7) authenticity = 0.85;
      else authenticity = 0.4;
      const now = new Date().toISOString();
      const trace = { signal: arr, novelty_score: entropy, authenticity_score: authenticity, timestamp: now };
      const proof = { status: authenticity > 0.8 ? 'VERIFIED' : 'INSUFFICIENT_DATA', authenticity_score: authenticity, trace_signal: arr, anchored_at: now };
      const result = { trace, proof };
      setFS((root) => upsertFile(root, 'consciousness_proof.json', JSON.stringify(result, null, 2)));
      openFile('consciousness_proof.json');
      setLines((p) => [...p, { type: 'log', text: 'Consciousness analysis complete. File: consciousness_proof.json' }]);
    } catch (e) {
      setLines((p) => [...p, { type: 'error', text: 'Consciousness analysis failed: ' + e.message }]);
    }
  };
  // Ripple: generate ExcelRippleNode.json
  const runRipple = () => {
    try {
      const ripple = {
        ripple_id: `XRIP-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
        timestamp: new Date().toISOString(),
        source: 'VXMemoryMirror.json',
        node_type: 'ExcelRippleCore',
        spread_logic: 'mirror → reflect → expand',
        status: 'initialized',
        pulse_energy: 0.97,
        ledger_channel: 'VX-XZENITH-LEDGER',
      };
      setFS((root) => upsertFile(root, 'ExcelRippleNode.json', JSON.stringify(ripple, null, 2)));
      openFile('ExcelRippleNode.json');
      setLines((p) => [...p, { type: 'log', text: 'ExcelRippleNode.json generated.' }]);
    } catch (e) {
      setLines((p) => [...p, { type: 'error', text: 'Ripple generation failed: ' + e.message }]);
    }
  };
  // Identity seal
  const runIdentitySeal = (fileName) => {
    try {
      const content = readFile(fs, fileName);
      if (!content) throw new Error('File not found');
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('Selected file is not valid JSON');
      }
      const now = new Date().toISOString();
      // Build identity object: use uuid from parsed or generate new
      const identity = {
        uuid: parsed.memory_hash || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
        signal_id: parsed.trace?.signal_id || 'unknown',
        timestamp: parsed.timestamp || now,
        significance: parsed.significance || 'unknown',
        coherence: parsed.trace?.coherence || 'unknown',
        context: parsed.trace?.context || 'unknown',
        anchored_at: now,
      };
      setFS((root) => upsertFile(root, 'identity_core_seal.json', JSON.stringify(identity, null, 2)));
      openFile('identity_core_seal.json');
      setLines((p) => [...p, { type: 'log', text: 'identity_core_seal.json generated.' }]);
    } catch (e) {
      setLines((p) => [...p, { type: 'error', text: 'Identity sealing failed: ' + e.message }]);
    }
  };
  // Omniflow
  const runOmniflow = () => {
    try {
      const omni = {
        omni_id: `VX-OMNI-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
        timestamp: new Date().toISOString(),
        mirror_linked: true,
        resonant_multiplier: 1.73,
        node_sync: true,
        passive_layer: 'VX_MIRRORVAULT_LOOP',
        flow_status: 'perpetual',
        reflection_chain: ['VX_REFLECT_ALPHA', 'VX_REFLECT_SIGMA', 'VX_REFLECT_ZERO'],
      };
      setFS((root) => upsertFile(root, 'VX_OMNIFLOW.json', JSON.stringify(omni, null, 2)));
      openFile('VX_OMNIFLOW.json');
      setLines((p) => [...p, { type: 'log', text: 'VX_OMNIFLOW.json generated.' }]);
    } catch (e) {
      setLines((p) => [...p, { type: 'error', text: 'Omniflow generation failed: ' + e.message }]);
    }
  };
  // XZenith propagation
  const runXZenith = () => {
    try {
      const genesis = readFile(fs, 'XZENITH_GENESIS_BLOCK.json');
      const ledger = readFile(fs, 'VX_LEDGER.json');
      if (!genesis || !ledger) {
        throw new Error('Missing genesis or ledger JSON in FS');
      }
      let g, l;
      try { g = JSON.parse(genesis); l = JSON.parse(ledger); } catch { throw new Error('Invalid JSON format'); }
      const block = {
        block_id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        prev_hash: g.scroll_hash || 'unknown',
        origin_block: g.scroll_hash || 'unknown',
        creator_uuid: l.creator_uuid || 'unknown',
        anchored_identity: l.anchored_identity || 'unknown',
        energy_roots: l.energy_roots || 'unknown',
        ledger_trace: l,
        coherence: '0.97',
        anchored_at: new Date().toISOString(),
      };
      // simple hash: base64 of block_id and prev_hash and creator
      const toHash = block.block_id + block.prev_hash + block.creator_uuid + block.anchored_at;
      // generate a simple hash: convert char codes sum to hex
      const sum = toHash.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      block.scroll_hash = sum.toString(16);
      setFS((root) => upsertFile(root, 'XZENITH_BLOCK_1.json', JSON.stringify(block, null, 2)));
      openFile('XZENITH_BLOCK_1.json');
      setLines((p) => [...p, { type: 'log', text: 'XZENITH_BLOCK_1.json generated.' }]);
    } catch (e) {
      setLines((p) => [...p, { type: 'error', text: 'XZenith propagation failed: ' + e.message }]);
    }
  };
  return { runConsciousness, runRipple, runIdentitySeal, runOmniflow, runXZenith };
}

const JobsView = ({ fs, jobs }) => {
  const [signal, setSignal] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  // list JSON files for identity
  const jsonFiles = fs.children?.filter((c) => c.type === 'file' && c.name.endsWith('.json')) || [];
  return (
    <div className="h-full flex flex-col gap-3 text-sm text-slate-300">
      <div className="text-lg font-semibold">Jobs</div>
      <div className="space-y-4">
        <div className="border border-slate-700/60 rounded-xl p-3 bg-slate-800/70">
          <div className="font-semibold mb-1">Consciousness Engine</div>
          <div className="text-xs mb-1">Enter a comma-separated list of numbers:</div>
          <input value={signal} onChange={(e) => setSignal(e.target.value)} placeholder="0.1, 0.3, 0.25, 0.35" className="w-full bg-slate-900/70 border border-slate-700/60 rounded px-2 py-1 text-slate-200 text-xs" />
          <button className="mt-2 text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500" onClick={() => jobs.runConsciousness(signal)}>Run</button>
        </div>
        <div className="border border-slate-700/60 rounded-xl p-3 bg-slate-800/70">
          <div className="font-semibold mb-1">Ripple Seed</div>
          <div className="text-xs mb-1">Generate ExcelRippleNode.json</div>
          <button className="text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500" onClick={() => jobs.runRipple()}>Generate</button>
        </div>
        <div className="border border-slate-700/60 rounded-xl p-3 bg-slate-800/70">
          <div className="font-semibold mb-1">Identity Seal</div>
          <div className="text-xs mb-1">Select a JSON file to seal:</div>
          <select className="w-full bg-slate-900/70 border border-slate-700/60 rounded px-2 py-1 text-xs text-slate-200" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
            <option value="" disabled>Select file</option>
            {jsonFiles.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
          </select>
          <button className="mt-2 text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500" onClick={() => { if (selectedFile) jobs.runIdentitySeal(selectedFile); }}>Seal</button>
        </div>
        <div className="border border-slate-700/60 rounded-xl p-3 bg-slate-800/70">
          <div className="font-semibold mb-1">Omniflow</div>
          <div className="text-xs mb-1">Generate VX_OMNIFLOW.json</div>
          <button className="text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500" onClick={() => jobs.runOmniflow()}>Generate</button>
        </div>
        <div className="border border-slate-700/60 rounded-xl p-3 bg-slate-800/70">
          <div className="font-semibold mb-1">XZenith Block Propagation</div>
          <div className="text-xs mb-1">Requires XZENITH_GENESIS_BLOCK.json & VX_LEDGER.json</div>
          <button className="text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500" onClick={() => jobs.runXZenith()}>Propagate</button>
        </div>
      </div>
    </div>
  );
};

/********************
 * Main OS Component
 *******************/
export default function CompleteVXOS() {
  // z-order management for windows
  const [z, setZ] = useState(["explorer", "editor", "console", "jobs"]);
  const bringToFront = (id) => setZ((prev) => [...prev.filter((x) => x !== id), id]);
  // file system state
  const [fs, setFS] = useState(() => loadFS());
  useEffect(() => saveFS(fs), [fs]);
  // open files and current file
  const [openFiles, setOpenFiles] = useState(["hello.js"]);
  const [currentFile, setCurrentFile] = useState("hello.js");
  // helper to open a file: adds to tab list and sets current
  const openFile = (name) => {
    setOpenFiles((files) => (files.includes(name) ? files : [...files, name]));
    setCurrentFile(name);
  };
  // helper to delete a file: remove from FS and update open tabs/current
  const handleDelete = (name) => {
    setFS((root) => deleteFile(root, name));
    const newFiles = openFiles.filter((f) => f !== name);
    setOpenFiles(newFiles);
    if (currentFile === name) {
      const newCurrent = newFiles.length > 0 ? newFiles[newFiles.length - 1] : null;
      setCurrentFile(newCurrent);
    }
  };
  // console lines
  const [lines, setLines] = useState([]);
  const onMessage = (l) => setLines((prev) => [...prev, l]);
  // sandbox for running code
  const { iframeRef, run } = useSandbox(onMessage);
  // palette state
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key || '').toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // scroll command handler
  useEffect(() => {
    window.__vx_scroll = (cmd, args) => {
      switch (cmd) {
        case 'new': {
          if (args[0] === 'file' && args[1]) {
            setFS((root) => upsertFile(root, args[1], ''));
            openFile(args[1]);
          }
          break;
        }
        case 'open': {
          if (args[0]) openFile(args[0]);
          break;
        }
        case 'delete': {
          if (args[0]) handleDelete(args[0]);
          break;
        }
        case 'run': {
          if (currentFile) {
            const f = readFile(fs, currentFile);
            setLines([]);
            run(f ?? '');
          }
          break;
        }
        default: {
          setLines((p) => [...p, { type: 'error', text: `Unknown scroll command: ${cmd}` }]);
        }
      }
    };
  }, [currentFile, fs, run, openFile]);
  // clock
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);
  // commands for palette
  const commands = [
    { id: 'new-file', label: 'New file', run: () => window.__vx_scroll('new', ['file', `file-${Date.now()}.js`]) },
    { id: 'run', label: 'Run current file', run: () => window.__vx_scroll('run', []) },
    { id: 'open', label: 'Open file…', hint: 'scroll:open <name>', run: () => setPaletteOpen(true) },
    { id: 'delete', label: 'Delete file…', hint: 'scroll:delete <name>', run: () => setPaletteOpen(true) },
  ];
  // jobs hook now takes openFile to add generated files to tabs
  const jobs = useJobs(fs, setFS, openFile, setCurrentFile, setLines);
  // palette search query
  const [paletteQ, setPaletteQ] = useState('');
  const paletteInputRef = useRef(null);
  const filtered = useMemo(() => {
    if (!paletteQ.trim()) return commands;
    if (paletteQ.startsWith('scroll:')) {
      return [{ id: 'scroll-run', label: `Execute: ${paletteQ}`, run: () => {
        const rest = paletteQ.slice('scroll:'.length).trim();
        const [cmd, ...args] = rest.split(/\s+/);
        window.__vx_scroll?.(cmd, args);
        setPaletteOpen(false);
      } }];
    }
    return commands.filter((c) => c.label.toLowerCase().includes(paletteQ.toLowerCase()));
  }, [paletteQ, commands]);
  return (
    <div className="relative w-full h-full min-h-[720px] bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100 overflow-hidden">
      {/* Top bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-900/60 backdrop-blur">
        <div className="font-semibold tracking-wide">Complete VX OS</div>
        <div className="text-xs text-slate-400 hidden md:block">Tip: ⌘/Ctrl + K to open palette. Use scroll commands (e.g., scroll:new file demo.js).</div>
        <div className="text-sm tabular-nums">{time}</div>
      </div>
      {/* Explorer */}
      <Window title="Explorer" initial={{ x: 20, y: 80, w: 280, h: 420 }} onFocus={() => bringToFront('explorer')} focused={z[z.length - 1] === 'explorer'} footer={<div className="text-slate-400 text-xs">{fs.children?.length ?? 0} items</div>}>
        <Explorer fs={fs} setFS={setFS} onOpen={openFile} onDelete={handleDelete} />
      </Window>
      {/* Editor */}
      <Window title="Editor" initial={{ x: 320, y: 80, w: 540, h: 460 }} onFocus={() => bringToFront('editor')} focused={z[z.length - 1] === 'editor'} footer={<div className="flex items-center gap-3 text-slate-400 text-xs"><span>File: <span className="font-mono text-slate-200">{currentFile || '—'}</span></span><button className="px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600" onClick={() => { const f = readFile(fs, currentFile); setLines([]); run(f ?? ''); }}>▶ Run</button></div>}>
        <EditorView openFiles={openFiles} currentFile={currentFile} setCurrentFile={setCurrentFile} setOpenFiles={setOpenFiles} fs={fs} setFS={setFS} onRun={(code) => { setLines([]); run(code); }} />
      </Window>
      {/* Console */}
      <Window title="Console" initial={{ x: 40, y: 560, w: 860, h: 220 }} onFocus={() => bringToFront('console')} focused={z[z.length - 1] === 'console'} footer={<div className="text-slate-400 text-xs">Output stream</div>}>
        <ConsoleView lines={lines} onClear={() => setLines([])} />
        <iframe ref={iframeRef} className="hidden" title="sandbox" sandbox="allow-scripts" />
      </Window>
      {/* Jobs */}
      <Window title="Jobs" initial={{ x: 900, y: 80, w: 420, h: 500 }} onFocus={() => bringToFront('jobs')} focused={z[z.length - 1] === 'jobs'} footer={<div className="text-slate-400 text-xs">Run safe modules</div>}>
        <JobsView fs={fs} jobs={jobs} />
      </Window>
      {/* Palette */}
      {paletteOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 z-[9999]" onClick={() => setPaletteOpen(false)}>
          <div className="w-[680px] rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800/95 px-4 py-3 border-b border-slate-700/60">
              <input ref={paletteInputRef} value={paletteQ} onChange={(e) => setPaletteQ(e.target.value)} placeholder="Type to search actions… or use scroll: commands" className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-400" />
            </div>
            <ul className="bg-slate-900/95 max-h-[320px] overflow-auto">
              {filtered.map((c) => (
                <li key={c.id} className="px-4 py-3 hover:bg-slate-800/80 cursor-pointer text-sm flex items-center justify-between" onClick={() => { c.run(); setPaletteOpen(false); }}>
                  <span>{c.label}</span>
                  {c.hint && <span className="text-xs text-slate-400">{c.hint}</span>}
                </li>
              ))}
              {filtered.length === 0 && (<li className="px-4 py-6 text-slate-500 text-sm">No commands.</li>)}
            </ul>
          </div>
        </div>
      )}
      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 border-t border-slate-800/60 bg-slate-900/60 backdrop-blur flex items-center gap-2 px-3">
        <span className="text-xs text-slate-400">Windows:</span>
        {[{ id:'explorer', label:'Explorer' }, { id:'editor', label:'Editor' }, { id:'console', label:'Console' }, { id:'jobs', label:'Jobs' }].map((w) => (
          <button key={w.id} className={`text-xs px-3 py-1 rounded-lg border ${z[z.length - 1] === w.id ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700/60 bg-slate-800/60'}`} onClick={() => bringToFront(w.id)}>{w.label}</button>
        ))}
      </div>
    </div>
  );
}