'use client';

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  helperText?: string;
};

export default function LlmTextAreaCard({
  label,
  placeholder,
  value,
  onChange,
  helperText,
}: Props) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">{label}</h2>

      <textarea
        className="mt-3 min-h-[140px] w-full resize-none rounded-xl border bg-neutral-50 px-3 py-3 text-sm outline-none focus:border-neutral-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {helperText ? (
        <p className="mt-2 text-xs text-neutral-500">{helperText}</p>
      ) : null}
    </section>
  );
}
