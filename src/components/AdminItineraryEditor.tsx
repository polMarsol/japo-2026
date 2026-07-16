import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FlatOutlineNode } from "../lib/outline";
import { Icon } from "./Icon";

function EditableRow({
  node,
  override,
  onSave,
  onRestore,
}: {
  node: FlatOutlineNode;
  override: string | undefined;
  onSave: (text: string) => void;
  onRestore: () => void;
}) {
  const { t } = useTranslation();
  const displayed = override ?? node.text;
  const [value, setValue] = useState(displayed);
  const dirty = value !== displayed;

  return (
    <div className="flex flex-col gap-1" style={{ marginLeft: node.depth * 12 }}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={1}
        className={`resize-y rounded-lg border px-2 py-1 text-xs leading-relaxed ${
          override
            ? "border-accent/50 bg-accent-soft text-text"
            : "border-line bg-app-bg text-text"
        }`}
      />
      {(dirty || override) && (
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => onSave(value)}
              className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] text-white active:opacity-80"
            >
              <Icon name="save" className="h-3 w-3" />
              {t("admin.save")}
            </button>
          )}
          {override && !dirty && (
            <button
              type="button"
              onClick={() => {
                onRestore();
                setValue(node.text);
              }}
              className="flex items-center gap-1 rounded-full bg-chip px-2 py-0.5 text-[11px] text-chip-text active:opacity-80"
            >
              <Icon name="close" className="h-3 w-3" />
              {t("admin.restoreOriginal")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminItineraryEditor({
  nodes,
  overrides,
  onSave,
  onRestore,
}: {
  nodes: FlatOutlineNode[];
  overrides: Record<string, string>;
  onSave: (path: string, text: string) => void;
  onRestore: (path: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <details
      className="rounded-xl border border-dashed border-accent/40 bg-accent-soft/30 p-3"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-accent">
        <Icon name="edit" className="h-4 w-4" />
        {t("admin.editText")}
      </summary>
      {open && (
        <div className="mt-3 flex flex-col gap-2.5">
          {nodes.map((node) => (
            <EditableRow
              key={node.path}
              node={node}
              override={overrides[node.path]}
              onSave={(text) => onSave(node.path, text)}
              onRestore={() => onRestore(node.path)}
            />
          ))}
        </div>
      )}
    </details>
  );
}
