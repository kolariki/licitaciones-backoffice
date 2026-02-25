import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={`${s} text-green-500 animate-spin`} />
    </div>
  );
}
