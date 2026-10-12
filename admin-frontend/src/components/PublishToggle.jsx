const HANDLE_BG =
  'repeating-radial-gradient(circle at 50% 50%, rgba(200,200,200,.2) 0%, rgba(200,200,200,.2) 2%, transparent 2%, transparent 3%, rgba(200,200,200,.2) 3%, transparent 3%), conic-gradient(white 0%, silver 10%, white 35%, silver 45%, white 60%, silver 70%, white 80%, silver 95%, white 100%)'

export function PublishToggle({ checked, onChange, disabled, title }) {
  return (
    <label
      title={title}
      className={`inline-flex items-center rounded-full border-2 border-[#f0ebeb] p-[1px] px-0.5 shadow-[0_0_0_2px_#fbfbfb] ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
      style={{ background: 'linear-gradient(to bottom right, white, rgba(220,220,220,.5)), white' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
      <div
        className="relative w-[65px] h-[20px] rounded-full shadow-[inset_0_0_16px_rgba(0,0,0,0.3)] transition-colors duration-500"
        style={{ background: checked ? '#13d162' : '#d13613' }}
      >
        <div
          className="absolute -top-2 w-[35px] h-[35px] rounded-full border border-neutral-200 shadow-[3px_5px_10px_0_rgba(0,0,0,0.4)] transition-[left] duration-400"
          style={{ left: checked ? 'calc(100% - 35px + 10px)' : '-10px', background: HANDLE_BG }}
        />
      </div>
    </label>
  )
}
