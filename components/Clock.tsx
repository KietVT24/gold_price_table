// components/Clock.tsx
'use client';

import { useEffect, useState } from 'react';
import { getLunarDate } from '@/lib/utils';
/* =====================
   TYPES
===================== */
export type ClockMode = 'time' | 'date' | 'inline';

export interface ClockProps {
  mode?: ClockMode;
}

/* =====================
   COMPONENT
===================== */
export default function Clock({ mode = 'inline' }: ClockProps) {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* =====================
     FORMAT VALUES
  ===================== */
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');

  const d = time.getDate().toString().padStart(2, '0');
  const mo = (time.getMonth() + 1).toString().padStart(2, '0');
  const y = time.getFullYear();

  const lunarDate = getLunarDate(time);

  /* =====================
     INLINE MODE
     Giống: "29/11/2025 19:19:43"
  ===================== */
  if (mode === 'inline') {
    return (
      <span className="font-bold text-yellow-300 tabular-nums">
        {d}/{mo}/{y} {h}:{m}:{s}
      </span>
    );
  }

  /* =====================
     TIME MODE
     Chỉ hiển thị GIỜ
  ===================== */
  if (mode === 'time') {
    return (
      <span className="text-yellow-300 font-bold tabular-nums">
        {h}:{m}:{s}
      </span>
    );
  }

  /* =====================
     DATE MODE
     Ngày + Âm lịch
  ===================== */
  return (
    <div className="text-right leading-tight">
      <div className="text-white font-semibold">
        {d}/{mo}/{y}
      </div>
      <div className="text-yellow-200 text-sm">
        Âm lịch: {lunarDate}
      </div>
    </div>
  );
}
