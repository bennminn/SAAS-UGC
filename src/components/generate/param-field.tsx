"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ParamSchemaField } from "@/lib/video-providers";

interface ParamFieldProps {
  field: ParamSchemaField;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function ParamField({ field, value, onChange }: ParamFieldProps) {
  const v = value ?? field.default;

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(v)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-foreground">{field.label}</span>
        {field.help && (
          <span className="text-xs text-muted-foreground">({field.help})</span>
        )}
      </label>
    );
  }

  if (field.type === "enum") {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">{field.label}</label>
        <Select
          value={String(v)}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.enum?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">{field.label}</label>
        <Input
          type="number"
          value={Number(v)}
          min={field.min}
          max={field.max}
          step={field.step || 1}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
    );
  }

  // string | url
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{field.label}</label>
      <Input
        type={field.type === "url" ? "url" : "text"}
        value={String(v ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}

export function groupParams(schema: ParamSchemaField[]): Record<string, ParamSchemaField[]> {
  const groups: Record<string, ParamSchemaField[]> = {};
  for (const f of schema) {
    const g = f.group || "General";
    if (!groups[g]) groups[g] = [];
    groups[g].push(f);
  }
  return groups;
}
