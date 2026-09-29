import { Loader2 } from 'lucide-react';

export function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl text-sm font-medium max-w-md text-center">
        {message}
      </div>
    </div>
  );
}

export function EmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      {Icon && <Icon className="w-12 h-12 mb-3" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}
