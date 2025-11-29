import { Solar } from "lunar-javascript";

export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatDateTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

export function getLunarDate(date: Date): string {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const day = lunar.getDay();
  const month = lunar.getMonth();
  const leap = lunar.isLeap ? " (Nhuận)" : "";

  return `${day}/${month}${leap}`;
}



