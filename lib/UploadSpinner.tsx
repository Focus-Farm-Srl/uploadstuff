export function UploadSpinner() {
  return (
    <svg
      className="h-7 w-7 animate-spin text-primary"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="origin-center">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          d="M12 3C7.02944 3 3 7.02944 3 12"
        />
      </g>
    </svg>
  );
}
