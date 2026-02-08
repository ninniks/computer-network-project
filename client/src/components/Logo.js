function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="48" height="42" rx="4" fill="#F9A51B"/>
      <rect x="8" y="14" width="48" height="12" rx="4" fill="#E08A00"/>
      <rect x="18" y="8" width="4" height="12" rx="2" fill="#F9A51B"/>
      <rect x="42" y="8" width="4" height="12" rx="2" fill="#F9A51B"/>
      <path d="M20 50V34l6 8 6-8v16M38 34v16M38 34c0-4 8-4 8 0v16"
            stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export default Logo;
