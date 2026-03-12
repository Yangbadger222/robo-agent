"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { python } from "@codemirror/lang-python";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeViewerProps {
  code: string;
  language?: "xml" | "python" | "json" | "yaml";
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function CodeViewer({
  code,
  language = "xml",
  onChange,
  readOnly = true,
  height = "400px",
}: CodeViewerProps) {
  const extensions = useMemo(() => {
    switch (language) {
      case "xml":
        return [xml()];
      case "python":
        return [python()];
      case "json":
        return [json()];
      default:
        return [];
    }
  }, [language]);

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <CodeMirror
        value={code}
        height={height}
        theme={oneDark}
        extensions={extensions}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: !readOnly,
        }}
      />
    </div>
  );
}
