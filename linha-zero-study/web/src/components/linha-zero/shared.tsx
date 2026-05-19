import { COLORS } from "@/lib/case-model";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  span = 1,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  span?: number;
  readOnly?: boolean;
}) {
  return (
    <div className={"col-span-" + span}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
      />
      {hint ? <p className="text-xs text-slate-400 mt-0.5">{hint}</p> : null}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <option value="">— selecione —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {hint ? <p className="text-xs text-slate-400 mt-0.5">{hint}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
      />
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 mt-2">
      {children}
    </h3>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3
        className="text-sm font-bold uppercase tracking-wider mb-3 pb-2 border-b border-slate-200"
        style={{ color: COLORS.navy }}
      >
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={multiline ? "" : "flex gap-3 items-baseline"}>
      <div
        className={
          "text-xs font-medium text-slate-500 " +
          (multiline ? "mb-1" : "min-w-[180px]")
        }
      >
        {label}
      </div>
      <div
        className={
          "text-sm text-slate-700 " + (multiline ? "whitespace-pre-wrap" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
