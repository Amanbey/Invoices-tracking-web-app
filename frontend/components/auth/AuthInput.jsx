export default function AuthInput({
  id,
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  rightElement,
}) {
  return (
    <label className="flex flex-col gap-2 text-sm" htmlFor={id}>
      <span className="font-semibold text-slate-700">{label}</span>
      <div className="relative">
        <input
          id={id}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
    </label>
  );
}
