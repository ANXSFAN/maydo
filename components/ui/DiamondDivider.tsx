export default function DiamondDivider({
  className = "text-camel",
}: {
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-4 my-5 ${className}`}>
      <div className="w-10 h-px bg-current opacity-50" />
      <div className="w-2 h-2 bg-current rotate-45 opacity-70" />
      <div className="w-10 h-px bg-current opacity-50" />
    </div>
  );
}
