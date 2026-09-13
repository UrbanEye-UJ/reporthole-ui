export default function PinIcon({ size = 17, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
      <path
        fill={color}
        fillRule="evenodd"
        d="M12 2.5c-3.9 0-7 3.1-7 7 0 5 5.6 10.6 6.4 11.4.3.3.9.3 1.2 0 .8-.8 6.4-6.4 6.4-11.4 0-3.9-3.1-7-7-7zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"
      />
    </svg>
  );
}
