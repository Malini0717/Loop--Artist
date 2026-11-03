import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Code, Download, Eye, Loader2, Upload, Wand2 } from "lucide-react";
import { recreateScreenshot } from "@/lib/recreate.functions";

export const Route = createFileRoute("/recreate")({
  head: () => ({
    meta: [
      { title: "Screenshot Recreator – Loop Artist" },
      { name: "description", content: "Upload a screenshot and let AI rebuild its layout and styling for review." },
      { property: "og:title", content: "Screenshot Recreator – Loop Artist" },
      { property: "og:description", content: "Upload a screenshot and let AI rebuild its layout and styling for review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recreate,
});

function Recreate() {
  const run = useServerFn(recreateScreenshot);
  const [image, setImage] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setImage(r.result as string); setHtml(""); setError(null); };
    r.readAsDataURL(f);
  };

  const generate = async () => {
    if (!image) return;
    setLoading(true); setError(null);
    try {
      const res = await run({ data: { image, notes } });
      if (res.error) setError(res.error); else { setHtml(res.html); setTab("preview"); }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setLoading(false); }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = "recreated.html"; a.click();
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="flex h-[52px] items-center gap-3 bg-header px-5 text-header-foreground">
        <Link to="/" aria-label="Back to game"><ArrowLeft className="h-4 w-4" /></Link>
        <span className="text-lg font-extrabold">Screenshot Recreator</span>
      </header>
      <div className="mx-auto grid max-w-6xl gap-5 p-5 lg:grid-cols-2">
        <section className="rounded-3xl bg-card p-5 shadow-lg">
          <h2 className="text-xl font-extrabold">1. Supply a screenshot</h2>
          <label className="mt-3 flex min-h-[260px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-seq-border bg-seq-bg"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            {image ? <img src={image} alt="Supplied screenshot" className="max-h-[420px] w-full object-contain" /> : (
              <span className="flex flex-col items-center gap-2 text-sm font-bold text-muted-foreground"><Upload className="h-6 w-6" />Click or drop an image</span>
            )}
          </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={3}
            placeholder="Optional notes (e.g. 'keep the dark header')"
            className="mt-3 w-full rounded-xl border border-seq-border bg-background p-3 text-sm" />
          <button onClick={generate} disabled={!image || loading}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-2.5 font-extrabold text-primary-foreground disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Analyzing…" : "Recreate layout"}
          </button>
          {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}
        </section>

        <section className="flex flex-col rounded-3xl bg-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">2. Review result</h2>
            {html && (
              <div className="flex gap-2">
                <button onClick={() => setTab("preview")} className={`rounded-lg px-3 py-1 text-xs font-bold ${tab === "preview" ? "bg-repeat text-primary-foreground" : "bg-secondary"}`}><Eye className="mr-1 inline h-3 w-3" />Preview</button>
                <button onClick={() => setTab("code")} className={`rounded-lg px-3 py-1 text-xs font-bold ${tab === "code" ? "bg-repeat text-primary-foreground" : "bg-secondary"}`}><Code className="mr-1 inline h-3 w-3" />Code</button>
                <button onClick={download} className="rounded-lg bg-secondary px-3 py-1 text-xs font-bold"><Download className="mr-1 inline h-3 w-3" />Download</button>
              </div>
            )}
          </div>
          <div className="mt-3 min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-seq-border bg-background">
            {!html ? (
              <p className="flex h-full min-h-[420px] items-center justify-center p-6 text-center text-sm font-semibold text-muted-foreground">
                {loading ? "The AI is studying your screenshot…" : "The recreated layout will appear here."}
              </p>
            ) : tab === "preview" ? (
              <iframe title="Recreated layout" srcDoc={html} sandbox="" className="h-[560px] w-full bg-card" />
            ) : (
              <pre className="h-[560px] overflow-auto p-3 text-[11px]"><code>{html}</code></pre>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
