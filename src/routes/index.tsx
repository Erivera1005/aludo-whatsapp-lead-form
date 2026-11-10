import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import logoAsset from "../assets/aludo-logo.webp.asset.json";

const WHATSAPP_NUMBER = "573128642686";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALUDO — Descubre cómo tu peludito podría hablar" },
      { name: "description", content: "Cuéntanos sobre tu peludito y descubre cómo el collar ALUDO le da voz." },
      { property: "og:title", content: "ALUDO — Dale voz a tu peludito" },
      { property: "og:description", content: "Responde 2 preguntas y descubre cómo tu mascota podría hablar con el collar ALUDO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Step = 0 | 1 | 2;

function clean(v: string) {
  return v.replace(/[<>]/g, "").trim().slice(0, 40);
}

function Index() {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step < 2) {
      const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 450);
      return () => clearTimeout(t);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 2600);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const n = clean(name) || "tu peludito";
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `¡Hola ALUDO! Mi peludito se llama ${n} y es ${clean(breed)}. Quiero saber cómo podría hablar con el collar ALUDO 🐾`,
  )}`;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (step === 0 && clean(name)) setStep(1);
    else if (step === 1 && clean(breed)) setStep(2);
  }

  return (
    <main className="funnel">
      <div className="blob blob-a" aria-hidden />
      <div className="blob blob-b" aria-hidden />

      <header className="brand fade-down">
        <img
          className="brand-logo"
          src={logoAsset.url}
          alt="ALUDO"
          width={800}
          height={177}
          fetchPriority="high"
          decoding="async"
        />
      </header>

      <div className="dots" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={i <= step ? "dot on" : "dot"} />
        ))}
      </div>

      <section key={step} className="card enter">
        {step < 2 ? (
          <form onSubmit={submit} className="stack">
            <span className="paw bob" aria-hidden>🐾</span>
            <p className="eyebrow">Pregunta {step + 1} de 2</p>
            <h1 className="title">
              {step === 0 ? (
                <>¿Cómo se llama tu <em>Peludito</em>?</>
              ) : (
                <>¿Qué raza es <em>{n}</em>?</>
              )}
            </h1>
            <input
              ref={inputRef}
              className="field"
              value={step === 0 ? name : breed}
              onChange={(e) => (step === 0 ? setName(e.target.value) : setBreed(e.target.value))}
              placeholder={step === 0 ? "Ej: Luna" : "Ej: Golden Retriever, criollo…"}
              maxLength={40}
              autoComplete="off"
              enterKeyHint="next"
              aria-label={step === 0 ? "Nombre de tu mascota" : "Raza de tu mascota"}
            />
            <button
              type="submit"
              className="cta"
              disabled={step === 0 ? !clean(name) : !clean(breed)}
            >
              Continuar <span className="arrow">→</span>
            </button>
          </form>
        ) : (
          <div className="stack center">
            <div className="loader" aria-hidden>
              <span className="ring" />
              <span className="ring r2" />
              <span className="loader-paw">🐾</span>
            </div>
            <h1 className="title">
              Ahora escríbenos por WhatsApp para ver cómo <em>{n}</em> podría hablar gracias al collar de ALUDO
            </h1>
            <div className="bar"><span style={{ transform: `scaleX(${progress})` }} /></div>
            <a href={waUrl} className={progress >= 1 ? "cta wa pulse" : "cta wa"} rel="noopener">
              Escribir por WhatsApp
            </a>
          </div>
        )}
      </section>

      {step > 0 && (
        <button
          className="back"
          onClick={() => setStep(step === 2 ? 1 : 0)}
          aria-label={step === 2 ? "Volver a la pregunta anterior" : "Cambiar el nombre"}
        >
          ← {step === 2 ? "Volver a la pregunta anterior" : "Cambiar nombre"}
        </button>
      )}
    </main>
  );
}
