import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { ExamEvent } from "../types/examSchedule";

interface UseExamSchedulesResult {
  events: ExamEvent[];
  loading: boolean;
  error: string | null;
}

// DB 행 → ExamEvent 변환
function mapRow(row: Record<string, unknown>): ExamEvent {
  return {
    date: (row.date as string).substring(0, 10), // YYYY-MM-DD
    certificationId: row.certification_id as string,
    certificationName: row.certification_name as string,
    eventType: row.event_type as ExamEvent["eventType"],
    round: (row.round as string) ?? undefined,
    description: (row.description as string) ?? undefined,
  };
}

/**
 * 월별 시험 일정 조회 (ExamCalendar 용)
 */
export function useExamSchedulesByMonth(
  year: number,
  month: number,
): UseExamSchedulesResult {
  const [events, setEvents] = useState<ExamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endMonth = month === 12 ? 1 : month + 1;
      const endYear = month === 12 ? year + 1 : year;
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

      const { data, error: queryError } = await supabase
        .from("exam_schedules")
        .select("*")
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date");

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setEvents([]);
      } else {
        setEvents((data ?? []).map(mapRow));
      }
      setLoading(false);
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  return { events, loading, error };
}

/**
 * 자격증 ID별 시험 일정 조회 (CertDetailModal 용)
 */
export function useExamSchedulesByCertId(
  certId: string,
): UseExamSchedulesResult {
  const [events, setEvents] = useState<ExamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("exam_schedules")
        .select("*")
        .eq("certification_id", certId)
        .order("date");

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setEvents([]);
      } else {
        setEvents((data ?? []).map(mapRow));
      }
      setLoading(false);
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [certId]);

  return { events, loading, error };
}
