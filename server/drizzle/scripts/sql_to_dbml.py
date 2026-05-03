#!/usr/bin/env python3
"""Convert cleaned Postgres DDL (drizzle export) to DBML for dbdiagram.io."""
import re
import sys
from pathlib import Path
from typing import List, Optional, Tuple


def strip_block_comment(s: str) -> str:
    return re.sub(r"/\*.*?\*/", "", s, flags=re.DOTALL)


def split_statements(sql: str) -> List[str]:
    out = []
    buf = []
    in_str = False
    quote = ""
    i = 0
    while i < len(sql):
        c = sql[i]
        if not in_str:
            if c in ("'", '"'):
                in_str = True
                quote = c
            elif c == ";" and (i == len(sql) - 1 or sql[i + 1] in "\n\r"):
                stmt = "".join(buf).strip()
                if stmt:
                    out.append(stmt)
                buf = []
                i += 1
                continue
        else:
            if c == quote and (quote != "'" or (i > 0 and sql[i - 1] != "\\")):
                in_str = False
                quote = ""
        buf.append(c)
        i += 1
    tail = "".join(buf).strip()
    if tail:
        out.append(tail)
    return out


def parse_enum(stmt: str) -> Optional[Tuple[str, List[str]]]:
    m = re.match(
        r'CREATE TYPE "autoservice"\."(?P<name>[^"]+)" AS ENUM\s*\(\s*(?P<body>.*?)\s*\)',
        stmt,
        re.I | re.S,
    )
    if not m:
        return None
    vals = re.findall(r"'([^']*)'", m.group("body"))
    return m.group("name"), vals


def unquote_ident(s: str) -> str:
    s = s.strip()
    if s.startswith('"') and s.endswith('"'):
        return s[1:-1].replace('""', '"')
    return s


def pq_type_to_dbml(raw: str) -> str:
    raw = raw.strip()
    mq = re.match(r'^"autoservice"\."([^"]+)"$', raw)
    if mq:
        return mq.group(1)
    quoted_enum = re.match(r'^"?autoservice"?\.?"?([a-zA-Z0-9_]+)"?$', raw)
    if quoted_enum:
        return quoted_enum.group(1)
    if "jsonb" in raw.lower():
        return "jsonb"
    m = re.match(r"^varchar\s*\(\s*(\d+)\s*\)$", raw, re.I)
    if m:
        return f"varchar({m.group(1)})"
    m = re.match(r"^numeric\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$", raw, re.I)
    if m:
        return f"decimal({m.group(1)},{m.group(2)})"
    base = raw.split()[0].lower()
    if base in ("uuid", "text", "bigint", "boolean", "integer", "timestamp", "numeric", "varchar"):
        return raw if base != "varchar" else "varchar"
    return raw.split()[0]


_RESERVED_DBML_COLUMN = frozenset(
    {
        "table",
        "group",
        "index",
        "indexes",
        "note",
        "ref",
        "enum",
        "project",
        "date",
        "time",
        "type",
        "name",
        "login",
        "user",
        "order",
        "status",
        "year",
    }
)


def _dbml_quote_ident(n: str) -> str:
    return '"' + n.replace("\\", "\\\\").replace('"', '""') + '"'


def normalize_col_name(name: str) -> str:
    n = unquote_ident(name)
    if n.lower() in _RESERVED_DBML_COLUMN:
        return _dbml_quote_ident(n)
    # dbdiagram: только unquoted snake_case или quoted identifier; backticks не поддерживаются
    if re.match(r"^[a-z_][a-z0-9_]*$", n):
        return n
    return _dbml_quote_ident(n)


def parse_table(stmt: str) -> Optional[Tuple[str, List[str]]]:
    m = re.match(
        r'CREATE TABLE "autoservice"\."(?P<tn>[^"]+)"\s*\(\s*(?P<body>.*)\s*\)\s*$',
        stmt,
        re.S | re.I,
    )
    if not m:
        return None
    table = m.group("tn")
    body = m.group("body")
    lines = [ln.strip().rstrip(",") for ln in body.split("\n") if ln.strip()]
    cols_out: List[str] = []
    composite_pk_cols: Optional[List[str]] = None
    for line in lines:
        ucm = re.match(
            r'CONSTRAINT\s+"[^"]+"\s+UNIQUE\s*\(\s*"([^"]+)"\s*\)',
            line,
            re.I,
        )
        if ucm:
            cn = normalize_col_name(ucm.group(1))
            continue  # merged into column defs below is hard; append note line
        pkcm = re.match(
            r'CONSTRAINT\s+"[^"]+"\s+PRIMARY KEY\s*\(\s*([^\)]+)\)',
            line,
            re.I,
        )
        if pkcm:
            inner = pkcm.group(1)
            parts = [normalize_col_name(p.strip()) for p in inner.split(",")]
            composite_pk_cols = parts
            continue
        if line.upper().startswith("CONSTRAINT"):
            continue
        # column definition
        col_line = line
        cm = re.match(r'^"([^"]+)"\s+(.+)$', col_line)
        if not cm:
            continue
        col_name_raw = cm.group(1)
        rest = cm.group(2)
        cn = normalize_col_name(f'"{col_name_raw}"')
        rest_up = rest.upper()
        is_pk = "PRIMARY KEY" in rest_up
        is_uniq = "UNIQUE" in rest_up and "PRIMARY" not in rest_up
        not_null = "NOT NULL" in rest_up
        rest = re.sub(r"\s*PRIMARY KEY\s*", " ", rest, flags=re.I)
        rest = re.sub(r"\s*UNIQUE\s*", " ", rest, flags=re.I)
        rest = re.sub(r"\s*NOT NULL\s*", " ", rest, flags=re.I)
        rest = re.sub(r"\s*DEFAULT\s+[^,\s]+\s*", " ", rest, flags=re.I)
        rest = rest.strip().rstrip(",")
        typ = pq_type_to_dbml(rest.split("CHECK")[0].strip())
        bits: List[str] = []
        if is_pk and not composite_pk_cols:
            bits.append("pk")
        if is_uniq:
            bits.append("unique")
        if not_null and "pk" not in bits:
            bits.append("not null")
        attr = (" [" + ", ".join(bits) + "]") if bits else ""
        cols_out.append(f"  {cn} {typ}{attr}")
    if composite_pk_cols:
        idx_cols = ", ".join(composite_pk_cols)
        cols_out.append("")
        cols_out.append("  Indexes {")
        cols_out.append(f"    ({idx_cols}) [pk]")
        cols_out.append("  }")
    return table, cols_out


def parse_fk(stmt: str) -> Optional[Tuple[str, str, str, str]]:
    m = re.match(
        r'ALTER TABLE "autoservice"\."(?P<from_t>[^"]+)"\s+ADD CONSTRAINT\s+"[^"]+"\s+'
        r'FOREIGN KEY\s*\(\s*"(?P<from_c>[^"]+)"\s*\)\s+REFERENCES\s+'
        r'"autoservice"\."(?P<to_t>[^"]+)"\s*\(\s*"(?P<to_c>[^"]+)"\s*\)',
        stmt,
        re.I | re.S,
    )
    if not m:
        return None
    ft, fc = m.group("from_t"), m.group("from_c")
    tt, tc = m.group("to_t"), m.group("to_c")
    fcol = normalize_col_name(f'"{fc}"')
    return ft, fcol, tt, normalize_col_name(f'"{tc}"')


def table_name_dbml(name: str) -> str:
    if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", name):
        return name
    return f'"{name}"'


def convert(sql_text: str) -> str:
    sql_text = strip_block_comment(sql_text)
    stmts = split_statements(sql_text)
    enums: List[Tuple[str, List[str]]] = []
    tables: List[Tuple[str, List[str]]] = []
    refs: List[Tuple[str, str, str, str]] = []

    for st in stmts:
        up = st.upper().strip()
        if up.startswith("CREATE SCHEMA"):
            continue
        if up.startswith("CREATE TYPE"):
            e = parse_enum(st)
            if e:
                enums.append(e)
            continue
        if up.startswith("CREATE TABLE"):
            t = parse_table(st)
            if t:
                tables.append(t)
            continue
        if up.startswith("ALTER TABLE"):
            fk = parse_fk(st)
            if fk:
                refs.append(fk)

    blocks: List[str] = []

    blocks.append("// autoservice (логически) — все имена без префикса схемы: dbdiagram.io не поддерживает nested schema.")
    blocks.append("// Сгенерировано scripts/sql_to_dbml.py из dbdiagram_autoservice.sql")

    for en, vals in enums:
        blocks.append("")
        blocks.append(f"Enum {en} {{")
        for v in vals:
            vv = v.replace("-", "_")
            blocks.append(f"  {vv}")
        blocks.append("}")

    for tn, lines in tables:
        tnm = table_name_dbml(tn)
        blocks.append("")
        blocks.append(f"Table {tnm} {{")
        blocks.extend(lines)
        blocks.append("}")

    blocks.append("")
    for ft, fc, tt, tc in refs:
        ftn, ttn = table_name_dbml(ft), table_name_dbml(tt)
        blocks.append(f"Ref: {ftn}.{fc} > {ttn}.{tc}")

    return "\n".join(blocks) + "\n"


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    src = root / "dbdiagram_autoservice.sql"
    dst = root / "dbdiagram_autoservice.dbml"
    if len(sys.argv) >= 2:
        src = Path(sys.argv[1])
    if len(sys.argv) >= 3:
        dst = Path(sys.argv[2])
    text = src.read_text(encoding="utf-8")
    dbml = convert(text)
    dst.write_text(dbml, encoding="utf-8")
    print(f"Wrote {dst}")


if __name__ == "__main__":
    main()
