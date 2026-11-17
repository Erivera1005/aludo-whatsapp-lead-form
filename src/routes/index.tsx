import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import logoUrl from "../assets/aludo-logo.webp";
import coverVideoUrl from "../assets/portada-collar.mp4";
import coverPosterUrl from "../assets/portada-poster.webp";
import whatsappGlyphUrl from "../assets/whatsapp-glyph.png";

declare const __SITE_URL__: string;
const OG_IMAGE = `${__SITE_URL__}/og-image.jpg`;

const WHATSAPP_NUMBER = "573128642686";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALUDO — Descubre cómo tu peludito podría hablar" },
      {
        name: "description",
        content: "Cuéntanos sobre tu peludito y descubre cómo el collar ALUDO le da voz.",
      },
      { property: "og:title", content: "ALUDO — Dale voz a tu peludito" },
      {
        property: "og:description",
        content:
          "Responde 2 preguntas y descubre cómo tu mascota podría hablar con el collar ALUDO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      // First frame of the cover video (~13 KB): fetched first so the collar paints
      // immediately; the 500 KB video streams in behind it.
      { rel: "preload", as: "image", href: coverPosterUrl, fetchPriority: "high" },
    ],
  }),
  component: Index,
});

// -1 = portada (cover), 0 = pregunta 1, 1 = pregunta 2, 2 = WhatsApp
type Step = -1 | 0 | 1 | 2;

// WhatsApp glyph drawn as a mask, so it takes the button's text color
const waGlyph = { "--wa-glyph": `url(${whatsappGlyphUrl})` } as CSSProperties;

function clean(v: string) {
  return v.replace(/[<>]/g, "").trim().slice(0, 40);
}

function Index() {
  const [step, setStep] = useState<Step>(-1);
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

  // One shell for every step: the collar video and logo stay mounted (the video keeps
  // playing), only the centered block changes.
  return (
    <main className="cover">
      <video
        className="cover-video"
        src={coverVideoUrl}
        poster={coverPosterUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
      />

      <header className="cover-brand fade-down">
        <img
          className="brand-logo"
          src={logoUrl}
          alt="ALUDO"
          width={400}
          height={89}
          decoding="async"
        />
      </header>

      {step === -1 ? (
        <div className="cover-center">
          <div className="cover-head">
            <h1 className="cover-title">¿Te imaginas que tu mascota pudiera hablar?</h1>
            <span className="cover-limited">Unidades limitadas</span>
          </div>

          <button type="button" className="cover-cta" onClick={() => setStep(0)}>
            <span className="cover-wa" aria-hidden style={waGlyph} />
            Quiero el collar para mi perro
          </button>
        </div>
      ) : step < 2 ? (
        <form key={step} onSubmit={submit} className="cover-center step">
          <div className="cover-head">
            <span className="cover-limited">Pregunta {step + 1} de 2</span>
            <h1 className="cover-title">
              {step === 0 ? (
                <>
                  ¿Cómo se llama tu <em>Peludito</em>?
                </>
              ) : (
                <>
                  ¿Qué raza es <em>{n}</em>?
                </>
              )}
            </h1>
          </div>

          <input
            ref={inputRef}
            className="step-field"
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
            className="cover-cta"
            disabled={step === 0 ? !clean(name) : !clean(breed)}
          >
            Continuar <span className="step-arrow">→</span>
          </button>

          {step === 1 && (
            <button
              type="button"
              className="step-back"
              onClick={() => setStep(0)}
              aria-label="Cambiar el nombre"
            >
              ← Cambiar nombre
            </button>
          )}
        </form>
      ) : (
        <div key={step} className="cover-center step">
          <div className="cover-head">
            <span className="cover-limited">¡Listo!</span>
            <h1 className="cover-title step-title-long">
              ¡Escríbenos y descubre cómo <em>{n}</em> podría hablar gracias a este collar!
            </h1>
          </div>

          <div className="step-bar" aria-hidden>
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>

          <a
            href={waUrl}
            className={progress >= 1 ? "cover-cta is-ready" : "cover-cta"}
            rel="noopener"
          >
            <span className="cover-wa" aria-hidden style={waGlyph} />
            Escribir por WhatsApp
          </a>

          <button
            type="button"
            className="step-back"
            onClick={() => setStep(1)}
            aria-label="Volver a la pregunta anterior"
          >
            ← Volver a la pregunta anterior
          </button>
        </div>
      )}
    </main>
  );
}
