export default function AuthInput({ label, type, name, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="rounded-lg border border-slate-200 px-3 py-2 text-base outline-none transition focus:border-slate-400"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </label>
  );
}
