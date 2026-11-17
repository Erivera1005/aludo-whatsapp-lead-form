import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Route } from "@/routes/index";

const Funnel = Route.options.component as React.ComponentType;

function startFromCover() {
  fireEvent.click(screen.getByRole("button", { name: /Quiero el collar para mi perro/ }));
}

function answerQuestions(name: string, breed: string) {
  fireEvent.change(screen.getByLabelText("Nombre de tu mascota"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));

  fireEvent.change(screen.getByLabelText("Raza de tu mascota"), {
    target: { value: breed },
  });
  fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
}

describe("ALUDO lead funnel", () => {
  it("opens on the cover and its button leads to question 1", () => {
    render(<Funnel />);

    expect(screen.getByRole("heading").textContent).toBe(
      "¿Te imaginas que tu mascota pudiera hablar?",
    );
    expect(screen.getByText("Unidades limitadas")).toBeInTheDocument();
    expect(screen.queryByLabelText("Nombre de tu mascota")).not.toBeInTheDocument();

    startFromCover();

    expect(screen.getByRole("heading").textContent).toBe("¿Cómo se llama tu Peludito?");
    expect(screen.getByText("Pregunta 1 de 2")).toBeInTheDocument();
  });

  it("sends the answers to WhatsApp number 573128642686", () => {
    render(<Funnel />);
    startFromCover();
    answerQuestions("Luna", "Golden Retriever");

    const href =
      screen.getByRole("link", { name: /Escribir por WhatsApp/ }).getAttribute("href") ?? "";

    expect(href).toContain("https://wa.me/573128642686");
    const message = decodeURIComponent(href.split("?text=")[1] ?? "");
    expect(message).toContain("Luna");
    expect(message).toContain("Golden Retriever");
  });

  it("lets the lead go back to the previous question without losing answers", () => {
    render(<Funnel />);
    startFromCover();
    answerQuestions("Luna", "Golden Retriever");

    fireEvent.click(screen.getByRole("button", { name: /Volver a la pregunta anterior/ }));

    expect(screen.getByRole("heading").textContent).toBe("¿Qué raza es Luna?");
    expect(screen.getByLabelText("Raza de tu mascota")).toHaveValue("Golden Retriever");

    fireEvent.click(screen.getByRole("button", { name: "Cambiar el nombre" }));

    expect(screen.getByRole("heading").textContent).toBe("¿Cómo se llama tu Peludito?");
    expect(screen.getByLabelText("Nombre de tu mascota")).toHaveValue("Luna");
  });
});
