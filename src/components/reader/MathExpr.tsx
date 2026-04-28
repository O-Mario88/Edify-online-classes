import React from 'react';

/**
 * A small math renderer that handles the patterns used across Maple
 * content without pulling in KaTeX. Supported tokens:
 *
 *   x^2          → superscript           x²
 *   x_1          → subscript             x₁
 *   x^{n+1}      → grouped superscript
 *   sqrt(...)    → √ overlined radicand
 *   a/b          → stacked fraction (when wrapped in parentheses)
 *   ±, ≠, ≤, ≥, Δ, π, …  → passed through
 *
 * Anything not matching the patterns is rendered verbatim. This is
 * deliberately forgiving so authors can write expressions in plain
 * text and still get a typeset feel.
 */
export const MathExpr: React.FC<{ tex: string; className?: string }> = ({ tex, className }) => {
  const nodes = parse(tex);
  return (
    <span
      className={['inline-flex items-center align-middle text-[15px]', className || ''].join(' ')}
      style={{ fontFamily: 'Fraunces, ui-serif, Georgia, serif', fontStyle: 'italic', whiteSpace: 'nowrap' }}
    >
      {nodes.map((n, i) => <React.Fragment key={i}>{n}</React.Fragment>)}
    </span>
  );
};

/* ────── Parser ────── */
function parse(input: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < input.length) {
    // sqrt(...)
    if (input.slice(i, i + 5) === 'sqrt(') {
      const inner = readBalanced(input, i + 5);
      out.push(
        <span key={key++} className="inline-flex items-baseline">
          <span className="text-[1.05em]">√</span>
          <span className="border-t border-current ml-0.5 px-0.5" style={{ borderTopWidth: '1.2px' }}>
            {parse(inner.body)}
          </span>
        </span>,
      );
      i = inner.next;
      continue;
    }

    // (a)/(b) or (a)/b — fraction.
    if (input[i] === '(') {
      const num = readBalanced(input, i + 1);
      // Look ahead for a slash followed by a numerator/group.
      if (input[num.next] === '/' && (input[num.next + 1] === '(' || /\w/.test(input[num.next + 1] || ''))) {
        let den: { body: string; next: number };
        if (input[num.next + 1] === '(') {
          den = readBalanced(input, num.next + 2);
        } else {
          // Read a single token (alphanum + sup/sub fragments).
          let j = num.next + 1;
          let body = '';
          while (j < input.length && /[A-Za-z0-9]/.test(input[j])) body += input[j++];
          den = { body, next: j };
        }
        out.push(
          <span key={key++} className="inline-flex flex-col text-center align-middle leading-tight" style={{ verticalAlign: 'middle' }}>
            <span className="px-1">{parse(num.body)}</span>
            <span className="border-t border-current px-1" style={{ borderTopWidth: '1.2px' }}>{parse(den.body)}</span>
          </span>,
        );
        i = den.next;
        continue;
      }
      // Not a fraction — render the parens around the parsed body.
      out.push(<span key={key++}>(</span>);
      out.push(<span key={key++}>{parse(num.body)}</span>);
      out.push(<span key={key++}>)</span>);
      i = num.next;
      continue;
    }

    // ^{...} or ^x  → superscript
    if (input[i] === '^') {
      const sup = readToken(input, i + 1);
      out.push(<sup key={key++} className="text-[0.75em] not-italic mx-0.5">{parse(sup.body)}</sup>);
      i = sup.next;
      continue;
    }

    // _{...} or _x → subscript
    if (input[i] === '_') {
      const sub = readToken(input, i + 1);
      out.push(<sub key={key++} className="text-[0.75em] not-italic mx-0.5">{parse(sub.body)}</sub>);
      i = sub.next;
      continue;
    }

    // Read a contiguous chunk of plain text up to the next special.
    let j = i;
    let chunk = '';
    while (
      j < input.length &&
      input[j] !== '^' &&
      input[j] !== '_' &&
      input[j] !== '(' &&
      input.slice(j, j + 5) !== 'sqrt('
    ) {
      chunk += input[j++];
    }
    if (chunk) {
      out.push(<span key={key++}>{chunk}</span>);
    }
    i = j;
  }
  return out;
}

/** Read until the matching close paren (inclusive of nested groups). */
function readBalanced(input: string, start: number): { body: string; next: number } {
  let depth = 1;
  let j = start;
  let body = '';
  while (j < input.length && depth > 0) {
    if (input[j] === '(') depth++;
    else if (input[j] === ')') {
      depth--;
      if (depth === 0) {
        j++;
        break;
      }
    }
    body += input[j++];
  }
  return { body, next: j };
}

/** Read a single token after `^` or `_`: either a {group} or one char. */
function readToken(input: string, start: number): { body: string; next: number } {
  if (input[start] === '{') {
    let depth = 1;
    let j = start + 1;
    let body = '';
    while (j < input.length && depth > 0) {
      if (input[j] === '{') depth++;
      else if (input[j] === '}') {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
      body += input[j++];
    }
    return { body, next: j };
  }
  // Read greedy alnum block (so x^12 picks up "12").
  let j = start;
  let body = '';
  while (j < input.length && /[A-Za-z0-9]/.test(input[j])) body += input[j++];
  if (body === '') {
    // Single non-alnum char (e.g. minus sign).
    body = input[j] || '';
    j++;
  }
  return { body, next: j };
}
