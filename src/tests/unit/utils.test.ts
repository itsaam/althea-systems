// @vitest-environment node
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("combine des classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignore les valeurs falsy", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("gère les classes conditionnelles", () => {
    const active = true;
    const disabled = false;
    expect(cn("base", active && "active", disabled && "disabled")).toBe("base active");
  });

  it("fusionne les classes Tailwind en conflit (tailwind-merge)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("mt-2", "mt-4")).toBe("mt-4");
  });

  it("retourne une string vide si aucune classe", () => {
    expect(cn()).toBe("");
  });

  it("gère les objets de classes", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });

  it("gère les arrays de classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});