import React, { useState, useRef } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("uid.txt");
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFilename(f.name);
    try {
      const data = await f.text();
      setText(data);
      setMessage(`Loaded ${f.name}`);
    } catch (err) {
      setMessage("File read error: " + err.message);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "uid.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage("File downloaded");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied to clipboard");
    } catch (err) {
      setMessage("Copy failed: " + err.message);
    }
  };

  const validate = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return { ok: false, reason: "Empty" };
    if (/^[0-9]{1,20}$/i.test(trimmed)) return { ok: true };
    return { ok: false, reason: "UID should be 1–20 digits (example rule)" };
  };

  const insertTemplate = () => {
    const sample = `123456789
# multiple UIDs allowed line by line
`;
    setText(sample);
  };

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const uid = params.get("uid");
      if (uid) {
        setText(decodeURIComponent(uid));
        setMessage("Loaded UID from URL parameter");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const exportAsJson = () => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const payload = { uids: lines };
    setText(JSON.stringify(payload, null, 2));
    setFilename("uids.json");
    setMessage("Converted to JSON format");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">My UID Tool</h1>
          <div className="text-sm text-slate-500">Simple editor to read, edit, validate, and download UID files</div>
        </header>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Editor</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="w-full border rounded-lg p-3 text-sm font-mono resize-y"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={insertTemplate} className="px-3 py-1 rounded-lg border">Insert sample</button>
              <button onClick={exportAsJson} className="px-3 py-1 rounded-lg border">Export as JSON</button>
              <button onClick={copyToClipboard} className="px-3 py-1 rounded-lg border">Copy</button>
              <button onClick={downloadFile} className="px-3 py-1 rounded-lg border">Download</button>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              <strong>Note:</strong> This starter uses simple validation rules. Modify <code>validate()</code> as needed for your app.
            </div>
          </div>

          <aside className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept=".txt,.json" onChange={handleFileUpload} />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Filename</label>
              <input value={filename} onChange={(e) => setFilename(e.target.value)} className="w-full border rounded p-2 text-sm" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Quick validate</label>
              <button
                onClick={() => {
                  const res = validate(text);
                  setMessage(res.ok ? "Validation OK" : `Invalid: ${res.reason}`);
                }}
                className="px-3 py-1 rounded-lg border"
              >
                Run validation
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Preview</label>
              <div className="border rounded p-2 h-32 overflow-auto text-sm font-mono bg-slate-50">{text || <span className="text-slate-400">(empty)</span>}</div>
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-600">{message || "Ready"}</div>
          <div className="text-xs text-slate-500">Made with React • Deploy on Vercel / Netlify / GitHub Pages</div>
        </footer>
      </div>
    </div>
  );
}
