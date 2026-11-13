export const CATEGORIES = ['Design','Cultura','Team','Strategia','Logistica','Altro'];

export const getCurrentUserName = () => localStorage.getItem('adminName')?.trim() || 'Tu';

export interface TimeRemaining {
  text: string;
  status: 'active' | 'warning' | 'expired';
  diffMs: number;
}

export function getTimeRemaining(deadlineStr: string): TimeRemaining {
  const now = new Date().getTime();
  const deadline = new Date(deadlineStr).getTime();
  const diff = deadline - now;

  if (diff <= 0) {
    return { text: 'Scaduta (Conclusa)', status: 'expired', diffMs: diff };
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return {
      text: `${days} ${days === 1 ? 'giorno' : 'giorni'} rimasti`,
      status: days <= 1 ? 'warning' : 'active',
      diffMs: diff
    };
  }

  if (hours > 0) {
    const mins = minutes % 60;
    return {
      text: `${hours}h ${mins}m rimasti`,
      status: 'warning',
      diffMs: diff
    };
  }

  if (minutes > 0) {
    return {
      text: `${minutes}m rimasti`,
      status: 'warning',
      diffMs: diff
    };
  }

  return {
    text: 'Meno di un minuto!',
    status: 'warning',
    diffMs: diff
  };
}

export function getCategoryStyles(category: string): { bg: string; text: string; border: string } {
  return { bg: 'bg-slate-50/70', text: 'text-slate-600', border: 'border-slate-100' };
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}
