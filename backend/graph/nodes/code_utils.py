import re


def extract_code_blocks(text: str) -> dict[str, str]:
    """Extract fenced code blocks from LLM output.

    Blocks labelled with a filename (containing '/' or '.') use that as the key.
    Generic language labels get a counter suffix to avoid overwrites when multiple
    blocks share the same language.
    """
    pattern = r"```(\S+)\s*\n(.*?)```"
    blocks: dict[str, str] = {}
    unnamed_counts: dict[str, int] = {}

    for m in re.finditer(pattern, text, re.DOTALL):
        label = m.group(1)
        code = m.group(2).strip()
        if "/" in label or "." in label:
            blocks[label] = code
        else:
            ext_map = {"python": ".py", "xml": ".xml", "yaml": ".yaml"}
            ext = ext_map.get(label, f".{label}")
            count = unnamed_counts.get(ext, 0)
            unnamed_counts[ext] = count + 1
            suffix = f"_{count}" if count > 0 else ""
            blocks[f"unnamed{suffix}{ext}"] = code

    return blocks
