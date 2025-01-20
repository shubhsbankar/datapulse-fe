export function formatDate(date: Date | string): string {
  if (date === null || date === undefined || date === 'None')
    return '';
  const d = new Date(date);
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
} 