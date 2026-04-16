export default function Spinner({ size = 'md', center = false }) {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-4', lg: 'h-12 w-12 border-4' };
  const el = <div className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizes[size]}`} />;
  if (center) return <div className="flex justify-center items-center py-16">{el}</div>;
  return el;
}
