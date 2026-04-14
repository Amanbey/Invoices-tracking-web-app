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
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
