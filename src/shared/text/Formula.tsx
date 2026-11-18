// Dependency-free math rendering in one consistent style (serif, italic variables).
//   <Formula tex="S = G·e^{−2G}" />        superscripts with ^{…}, subscripts with _{…}
// Single-letter variables (G, S, t, k, λ, n, x) are italicised automatically; "e" stays upright.
import React from "react";
import { COLORS, FONT } from "../theme";

const ITALIC = new Set(["G", "S", "t", "k", "λ", "n", "x"]);
const isLetter = (c: string | undefined) => !!c && /[A-Za-zλ]/.test(c);

type Node = string | { kind: "i"; text: string } | { kind: "sup" | "sub"; children: Node[] };

function parse(s: string, i = 0, nested = false): [Node[], number] {
  const out: Node[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push(buf);
    buf = "";
  };
  while (i < s.length) {
    const c = s[i];
    if (c === "}" && nested) {
      flush();
      return [out, i + 1];
    }
    if ((c === "^" || c === "_") && s[i + 1] === "{") {
      flush();
      const [children, next] = parse(s, i + 2, true);
      out.push({ kind: c === "^" ? "sup" : "sub", children });
      i = next;
      continue;
    }
    if (ITALIC.has(c) && !isLetter(s[i - 1]) && !isLetter(s[i + 1])) {
      flush();
      out.push({ kind: "i", text: c });
      i++;
      continue;
    }
    buf += c;
    i++;
  }
  flush();
  return [out, i];
}

const render = (nodes: Node[], key = ""): React.ReactNode[] =>
  nodes.map((n, idx) => {
    const k = `${key}-${idx}`;
    if (typeof n === "string") return <span key={k}>{n}</span>;
    if (n.kind === "i")
      return (
        <i key={k} style={{ fontStyle: "italic", paddingRight: "0.04em" }}>
          {n.text}
        </i>
      );
    return (
      <span key={k} style={n.kind === "sup" ? SUP : SUB}>
        {render(n.children, k)}
      </span>
    );
  });

export const SUP: React.CSSProperties = {
  fontSize: "0.68em",
  verticalAlign: "0.62em",
  lineHeight: 0,
  marginLeft: "0.04em",
};
export const SUB: React.CSSProperties = { fontSize: "0.68em", verticalAlign: "-0.3em", lineHeight: 0 };

export type FormulaProps = {
  tex: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

/** Inline formula. Position it yourself (or wrap in <Label>/<Card>). */
export const Formula: React.FC<FormulaProps> = ({ tex, size = 48, color = COLORS.ink, style }) => (
  <span style={{ fontFamily: FONT.math, fontSize: size, color, whiteSpace: "nowrap", lineHeight: 1.2, ...style }}>
    {render(parse(tex)[0])}
  </span>
);
