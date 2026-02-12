import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Certification } from "../types/certification";

interface UseCertificationsResult {
  certifications: Certification[];
  loading: boolean;
  error: string | null;
}

/**
 * 전체 자격증 목록 조회 (앱 초기 로드 시 1회)
 */
export function useCertifications(): UseCertificationsResult {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("certifications")
        .select("*")
        .order("name");

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setCertifications([]);
      } else {
        setCertifications(
          (data ?? []).map((row) => ({
            id: row.id as string,
            name: row.name as string,
            category: row.category as Certification["category"],
            organization: row.organization as string,
            website: row.website as string,
            description: row.description as string,
            tags: row.tags as string[],
          })),
        );
      }
      setLoading(false);
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { certifications, loading, error };
}
