"""Static audit: enumerate routes, endpoints, API call sites, and dead-button markers.

Emits a JSON report to docs/audit/static.json. Companion to AUDIT.md.

No dependencies beyond stdlib + the repo itself. Run from the repo root.
"""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, asdict, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
BACKEND = ROOT / "edify_backend"
APPS = BACKEND / "apps"
OUT = ROOT / "docs" / "audit" / "static.json"


# ── Frontend ────────────────────────────────────────────────────────────

ROUTE_RE = re.compile(r'<Route\s+path="([^"]+)"\s+element=\{<([A-Z][A-Za-z0-9]+)', re.M)
API_CALL_RE = re.compile(
    r"""apiClient\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(\s*['`"]([^'`"]+)""",
    re.M,
)
MOCK_ARRAY_RE = re.compile(r"^\s*const\s+(mock[A-Z][A-Za-z0-9]*)\s*[:=]", re.M)
COMING_SOON_RE = re.compile(
    r"""toast\.(?:info|warn|warning)\s*\(\s*['"`]([^'"`]*(?:coming soon|not yet|placeholder|TODO|WIP)[^'"`]*)""",
    re.I,
)
SETTIMEOUT_MOCK_RE = re.compile(
    r"setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{[^}]{0,200}set[A-Z]", re.M
)
WINDOW_ALERT_RE = re.compile(r"window\.alert\s*\(", re.M)
TODO_COMMENT_RE = re.compile(r"(?://|/\*|#)\s*(TODO|FIXME|HACK|XXX)\b", re.I)


def iter_frontend_files():
    for root, dirs, files in os.walk(SRC):
        # skip tests + node_modules
        dirs[:] = [d for d in dirs if d not in {"node_modules", "__tests__", ".vite"}]
        for f in files:
            if f.endswith((".tsx", ".ts")) and not f.endswith((".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx")):
                yield Path(root) / f


def scan_routes(app_tsx: Path) -> list[dict]:
    text = app_tsx.read_text(encoding="utf-8", errors="replace")
    return [
        {"path": m.group(1), "element": m.group(2), "line": text[: m.start()].count("\n") + 1}
        for m in ROUTE_RE.finditer(text)
    ]


def scan_api_calls() -> list[dict]:
    calls: list[dict] = []
    for f in iter_frontend_files():
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        for m in API_CALL_RE.finditer(text):
            endpoint = m.group(2)
            # Normalize: strip query strings and template placeholders
            clean = re.sub(r"\$\{[^}]*\}", ":var", endpoint).split("?", 1)[0]
            calls.append({
                "file": str(f.relative_to(ROOT)),
                "line": text[: m.start()].count("\n") + 1,
                "method": m.group(1).upper(),
                "endpoint": clean,
            })
    return calls


def scan_dead_buttons() -> list[dict]:
    hits: list[dict] = []
    for f in iter_frontend_files():
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        for m in COMING_SOON_RE.finditer(text):
            hits.append({
                "file": str(f.relative_to(ROOT)),
                "line": text[: m.start()].count("\n") + 1,
                "kind": "coming_soon_toast",
                "text": m.group(1)[:200],
            })
        for m in WINDOW_ALERT_RE.finditer(text):
            hits.append({
                "file": str(f.relative_to(ROOT)),
                "line": text[: m.start()].count("\n") + 1,
                "kind": "window_alert",
                "text": "",
            })
    return hits


def scan_mock_pages() -> list[dict]:
    result: list[dict] = []
    pages_dir = SRC / "pages"
    for f in iter_frontend_files():
        if pages_dir not in f.parents:
            continue
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        mocks = [m.group(1) for m in MOCK_ARRAY_RE.finditer(text)]
        settimeouts = len(SETTIMEOUT_MOCK_RE.findall(text))
        if mocks or settimeouts:
            result.append({
                "file": str(f.relative_to(ROOT)),
                "mock_arrays": mocks,
                "fake_loaders": settimeouts,
            })
    return result


# ── Backend ─────────────────────────────────────────────────────────────

ROUTER_REGISTER_RE = re.compile(
    r"router\.register\(\s*r?['\"]([^'\"]+)['\"]\s*,\s*([A-Za-z_][A-Za-z0-9_]*)",
    re.M,
)
PATH_RE = re.compile(
    r"path\(\s*['\"]([^'\"]*api/[^'\"]*)['\"]\s*,\s*([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)",
    re.M,
)
ALLOWANY_RE = re.compile(
    r"^(class\s+([A-Z][A-Za-z0-9_]*)\s*\([^)]*\):[\s\S]{0,1200}?permission_classes\s*=\s*\[AllowAny\])",
    re.M,
)
# crude: find classes whose get_queryset returns .objects.all()
OPEN_QUERYSET_RE = re.compile(
    r"class\s+([A-Z][A-Za-z0-9_]*)\s*\([^)]*ViewSet[^)]*\):[\s\S]{0,4000}?return\s+([A-Z][A-Za-z0-9_]*)\.objects\.all\(\)",
    re.M,
)


def scan_backend_urls() -> dict:
    urls_py = BACKEND / "edify_core" / "urls.py"
    text = urls_py.read_text(encoding="utf-8", errors="replace")
    router_endpoints = [
        {"url": f"/api/v1/{m.group(1).rstrip('/')}/", "viewset": m.group(2)}
        for m in ROUTER_REGISTER_RE.finditer(text)
    ]
    path_endpoints = [
        {"url": "/" + m.group(1).lstrip("/"), "view": m.group(2)}
        for m in PATH_RE.finditer(text)
    ]
    return {"router": router_endpoints, "paths": path_endpoints}


def scan_backend_permissions() -> list[dict]:
    hits: list[dict] = []
    for root, dirs, files in os.walk(APPS):
        dirs[:] = [d for d in dirs if d not in {"__pycache__", "migrations", "venv"}]
        for f in files:
            if not f.endswith(".py"):
                continue
            p = Path(root) / f
            text = p.read_text(encoding="utf-8", errors="replace")
            for m in ALLOWANY_RE.finditer(text):
                hits.append({
                    "file": str(p.relative_to(ROOT)),
                    "line": text[: m.start()].count("\n") + 1,
                    "class": m.group(2),
                    "kind": "AllowAny",
                })
            for m in OPEN_QUERYSET_RE.finditer(text):
                hits.append({
                    "file": str(p.relative_to(ROOT)),
                    "line": text[: m.start()].count("\n") + 1,
                    "class": m.group(1),
                    "model": m.group(2),
                    "kind": "open_queryset",
                })
    return hits


# ── Main ────────────────────────────────────────────────────────────────

def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    app_tsx = SRC / "App.tsx"

    routes = scan_routes(app_tsx)
    api_calls = scan_api_calls()
    dead_buttons = scan_dead_buttons()
    mock_pages = scan_mock_pages()
    backend_urls = scan_backend_urls()
    backend_perms = scan_backend_permissions()

    # Distinct endpoint set
    frontend_endpoints = sorted({c["endpoint"] for c in api_calls})
    backend_router_urls = sorted({e["url"] for e in backend_urls["router"]})

    summary = {
        "counts": {
            "frontend_routes": len(routes),
            "frontend_api_call_sites": len(api_calls),
            "frontend_distinct_endpoints": len(frontend_endpoints),
            "backend_router_endpoints": len(backend_urls["router"]),
            "backend_path_endpoints": len(backend_urls["paths"]),
            "allow_any_views": sum(1 for h in backend_perms if h["kind"] == "AllowAny"),
            "open_queryset_views": sum(1 for h in backend_perms if h["kind"] == "open_queryset"),
            "coming_soon_buttons": sum(1 for h in dead_buttons if h["kind"] == "coming_soon_toast"),
            "window_alerts": sum(1 for h in dead_buttons if h["kind"] == "window_alert"),
            "pages_with_mock_data": len(mock_pages),
        },
        "routes": routes,
        "api_calls": api_calls,
        "frontend_distinct_endpoints": frontend_endpoints,
        "backend_router_urls": backend_router_urls,
        "backend_paths": backend_urls["paths"],
        "permission_findings": backend_perms,
        "dead_buttons": dead_buttons,
        "mock_pages": mock_pages,
    }

    OUT.write_text(json.dumps(summary, indent=2))
    print(f"Static audit written to {OUT}")
    for k, v in summary["counts"].items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
