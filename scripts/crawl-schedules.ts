/**
 * 시험일정 수집 & SQL 생성 스크립트 (Playwright 크롤링 + 하드코딩 fallback)
 *
 * 사용법: npx tsx scripts/crawl-schedules.ts
 *
 * 결과: supabase/seed_exam_schedules.sql 파일 생성
 *       → Supabase SQL Editor에서 실행하면 데이터 적재 완료
 *
 * 크롤링 대상:
 *   🌐 Q-net (기사/산업기사, 기능사) — Playwright headless
 *   🌐 한국사능력검정시험 — Playwright headless
 *   📝 SQLD/SQLP, TOEIC, CPA, GTQ, 전산회계/세무 등 — 하드코딩 (사이트 크롤링 불가)
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { chromium, type Browser, type Page } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 타입 ─────────────────────────────────────────────────

interface Row {
  date: string;
  certification_id: string;
  certification_name: string;
  event_type: string;
  round: string | null;
  description: string | null;
}

// ─── 유틸리티 ─────────────────────────────────────────────

/** "2026.01.12" → "2026-01-12" */
function dotToIso(d: string): string {
  return d.trim().replace(/\./g, "-");
}

/** "2026년 1월 6일(Tue)" → "2026-01-06" */
function koreanDateToIso(d: string): string {
  const m = d.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!m) return "";
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

/**
 * "2026.01.12- 2026.01.15" 또는 "2026.01.12" 에서 날짜들 추출
 * 빈자리접수, 쉼표 구분 등은 무시하고 주요 날짜만 반환
 */
function extractDateRange(
  text: string,
): { start: string; end?: string } | null {
  // Remove 빈자리접수 부분
  const cleaned = text.split("※")[0].split(",")[0].trim();
  const dates = cleaned.match(/\d{4}\.\d{2}\.\d{2}/g);
  if (!dates || dates.length === 0) return null;
  if (dates.length === 1) return { start: dotToIso(dates[0]) };
  return { start: dotToIso(dates[0]), end: dotToIso(dates[1]) };
}

// ════════════════════════════════════════════════════════════
//  🌐 크롤링 소스들
// ════════════════════════════════════════════════════════════

// ─── Q-net 국가기술자격 크롤링 ────────────────────────────

async function crawlQnetSchedules(page: Page): Promise<Row[]> {
  const scheduleTypes = [
    {
      scheType: "03",
      label: "기사/산업기사",
      certs: [
        { id: "engineer-info-processing", name: "정보처리기사" },
        { id: "engineer-info-processing-industrial", name: "정보처리산업기사" },
        { id: "engineer-electrical", name: "전기기사" },
        { id: "engineer-electrical-industrial", name: "전기산업기사" },
        { id: "engineer-architecture", name: "건축기사" },
        { id: "engineer-civil", name: "토목기사" },
        { id: "engineer-mechanical", name: "일반기계기사" },
        { id: "engineer-fire", name: "소방설비기사" },
        { id: "engineer-safety", name: "산업안전기사" },
        { id: "engineer-environmental", name: "환경기사" },
        { id: "engineer-info-security", name: "정보보안기사" },
      ],
      // 헤더: 년도별/회별, 필기접수, 필기시험, 필기합격발표, 서류제출, 실기접수, 실기시험, 합격자발표
      hasDocSubmit: true,
    },
    {
      scheType: "04",
      label: "기능사(정기)",
      certs: [
        { id: "craftsman-info-processing", name: "정보처리기능사" },
        { id: "craftsman-electrical", name: "전기기능사" },
        { id: "cooking-korean", name: "한식조리기능사" },
      ],
      // 헤더: 년도별/회별, 필기접수, 필기시험, 필기합격발표, 실기접수, 실기시험, 합격자발표
      hasDocSubmit: false,
    },
  ];

  const rows: Row[] = [];

  for (const st of scheduleTypes) {
    console.log(`   → Q-net ${st.label} 크롤링 중...`);

    await page.goto(
      `https://www.q-net.or.kr/crf021.do?id=crf02101&gSite=Q&gId=&scheType=${st.scheType}`,
      { waitUntil: "networkidle", timeout: 30000 },
    );

    const tableData = await page.evaluate(() => {
      const table = document.querySelectorAll("table")[0];
      if (!table) return [];
      const result: string[][] = [];
      table.querySelectorAll("tbody tr").forEach((tr) => {
        const cells: string[] = [];
        tr.querySelectorAll("td").forEach((td) => {
          cells.push(td.textContent?.trim().replace(/\s+/g, " ") || "");
        });
        if (cells.length >= 6) result.push(cells);
      });
      return result;
    });

    for (const row of tableData) {
      // 첫 번째 컬럼: "2026년/기사제1회" 또는 "2026년/제1회"
      const roundMatch = row[0].match(/제?(\d+)회/);
      if (!roundMatch) continue; // 특수행(산업수요맞춤형 등) 스킵

      const round = `${roundMatch[1]}회`;

      // 컬럼 매핑 (기사/산업기사 vs 기능사에서 약간 다름)
      let colIdx = {
        필기접수: 1,
        필기시험: 2,
        필기합격: 3,
        실기접수: st.hasDocSubmit ? 5 : 4,
        실기시험: st.hasDocSubmit ? 6 : 5,
        합격발표: st.hasDocSubmit ? 7 : 6,
      };

      const 필기접수 = extractDateRange(row[colIdx.필기접수]);
      const 필기시험 = extractDateRange(row[colIdx.필기시험]);
      const 필기합격 = extractDateRange(row[colIdx.필기합격]);
      const 실기접수 = extractDateRange(row[colIdx.실기접수]);
      const 실기시험 = extractDateRange(row[colIdx.실기시험]);

      // 합격자발표는 "2026.06.05 2026.06.12" 형태 (두 날짜가 공백으로 구분)
      const 합격발표dates = row[colIdx.합격발표]?.match(/\d{4}\.\d{2}\.\d{2}/g);
      const 최종합격 = 합격발표dates?.[합격발표dates.length - 1];

      for (const c of st.certs) {
        if (필기접수) {
          rows.push({
            date: 필기접수.start,
            certification_id: c.id,
            certification_name: c.name,
            event_type: "접수시작",
            round,
            description: "필기 원서접수 시작",
          });
          if (필기접수.end) {
            rows.push({
              date: 필기접수.end,
              certification_id: c.id,
              certification_name: c.name,
              event_type: "접수마감",
              round,
              description: "필기 원서접수 마감",
            });
          }
        }
        if (필기시험) {
          rows.push({
            date: 필기시험.start,
            certification_id: c.id,
            certification_name: c.name,
            event_type: "필기시험",
            round,
            description: 필기시험.end
              ? `필기시험 (~${필기시험.end.slice(5)})`
              : null,
          });
        }
        if (필기합격) {
          rows.push({
            date: 필기합격.start,
            certification_id: c.id,
            certification_name: c.name,
            event_type: "합격발표",
            round,
            description: "필기 합격자 발표",
          });
        }
        if (실기접수) {
          rows.push({
            date: 실기접수.start,
            certification_id: c.id,
            certification_name: c.name,
            event_type: "접수시작",
            round,
            description: "실기 원서접수 시작",
          });
          if (실기접수.end) {
            rows.push({
              date: 실기접수.end,
              certification_id: c.id,
              certification_name: c.name,
              event_type: "접수마감",
              round,
              description: "실기 원서접수 마감",
            });
          }
        }
        if (실기시험) {
          rows.push({
            date: 실기시험.start,
            certification_id: c.id,
            certification_name: c.name,
            event_type: "실기시험",
            round,
            description: 실기시험.end
              ? `실기시험 (~${실기시험.end.slice(5)})`
              : null,
          });
        }
        if (최종합격) {
          rows.push({
            date: dotToIso(최종합격),
            certification_id: c.id,
            certification_name: c.name,
            event_type: "합격발표",
            round,
            description: "최종 합격자 발표",
          });
        }
      }
    }
  }

  return rows;
}

// ─── 한국사능력검정시험 크롤링 ─────────────────────────────

async function crawlKoreanHistorySchedules(page: Page): Promise<Row[]> {
  console.log("   → 한국사능력검정시험 크롤링 중...");

  await page.goto(
    "https://www.historyexam.go.kr/pageLink.do?link=examSchedule",
    { waitUntil: "networkidle", timeout: 30000 },
  );

  // 첫 번째 테이블: 구분, 원서접수, 취소좌석접수, 시험일시, 합격자발표
  const tableData = await page.evaluate(() => {
    const table = document.querySelectorAll("table")[0];
    if (!table) return [];
    const result: string[][] = [];
    table.querySelectorAll("tbody tr, tr").forEach((tr) => {
      const cells: string[] = [];
      tr.querySelectorAll("td").forEach((td) => {
        cells.push(td.textContent?.trim() || "");
      });
      if (cells.length >= 4) result.push(cells);
    });
    return result;
  });

  const rows: Row[] = [];
  const ids = ["korean-history-1", "korean-history-2"];

  for (const row of tableData) {
    const roundMatch = row[0].match(/제(\d+)회/);
    if (!roundMatch) continue;

    const round = `${roundMatch[1]}회`;

    // 원서접수: "2026년 1월 6일(Tue) 10:00 ~ 2026년 1월 13일(Tue) 17:00"
    const 접수시작 = koreanDateToIso(row[1].split("~")[0]);
    const 접수마감 = koreanDateToIso(row[1].split("~")[1] || "");

    // 시험일시: "2026년 2월 7일(Sat)"
    const 시험일 = koreanDateToIso(row[3]);

    // 합격자발표: "2026년 2월 20일(Fri)"
    const 합격발표 = koreanDateToIso(row[4]);

    for (const id of ids) {
      if (접수시작) {
        rows.push({
          date: 접수시작,
          certification_id: id,
          certification_name: "한국사능력검정",
          event_type: "접수시작",
          round,
          description: null,
        });
      }
      if (접수마감) {
        rows.push({
          date: 접수마감,
          certification_id: id,
          certification_name: "한국사능력검정",
          event_type: "접수마감",
          round,
          description: null,
        });
      }
      if (시험일) {
        rows.push({
          date: 시험일,
          certification_id: id,
          certification_name: "한국사능력검정",
          event_type: "시험",
          round,
          description: null,
        });
      }
      if (합격발표) {
        rows.push({
          date: 합격발표,
          certification_id: id,
          certification_name: "한국사능력검정",
          event_type: "합격발표",
          round,
          description: "합격자 발표",
        });
      }
    }
  }

  return rows;
}

// ════════════════════════════════════════════════════════════
//  📝 하드코딩 소스들 (크롤링 불가 사이트)
// ════════════════════════════════════════════════════════════

// ─── SQLD / SQLP (dataq.or.kr — 개발자도구 감지로 크롤링 불가) ──

function getSqldSchedules(): Row[] {
  const sqldRounds = [
    {
      round: "60회",
      접수시작: "2026-02-02",
      접수마감: "2026-02-06",
      시험: "2026-03-07",
      합격발표: "2026-03-27",
    },
    {
      round: "61회",
      접수시작: "2026-04-27",
      접수마감: "2026-05-01",
      시험: "2026-05-31",
      합격발표: "2026-06-19",
    },
    {
      round: "62회",
      접수시작: "2026-07-20",
      접수마감: "2026-07-24",
      시험: "2026-08-22",
      합격발표: "2026-09-11",
    },
    {
      round: "63회",
      접수시작: "2026-10-12",
      접수마감: "2026-10-16",
      시험: "2026-11-14",
      합격발표: "2026-12-04",
    },
  ];

  const rows: Row[] = [];
  for (const r of sqldRounds) {
    rows.push(
      {
        date: r.접수시작,
        certification_id: "sqld",
        certification_name: "SQLD",
        event_type: "접수시작",
        round: r.round,
        description: "원서접수 시작",
      },
      {
        date: r.접수마감,
        certification_id: "sqld",
        certification_name: "SQLD",
        event_type: "접수마감",
        round: r.round,
        description: "원서접수 마감",
      },
      {
        date: r.시험,
        certification_id: "sqld",
        certification_name: "SQLD",
        event_type: "시험",
        round: r.round,
        description: null,
      },
      {
        date: r.합격발표,
        certification_id: "sqld",
        certification_name: "SQLD",
        event_type: "합격발표",
        round: r.round,
        description: "합격자 발표",
      },
    );
  }

  // SQLP 연 2회 (SQLD 61회, 63회와 동시)
  for (const r of [sqldRounds[1], sqldRounds[3]]) {
    rows.push(
      {
        date: r.접수시작,
        certification_id: "sqlp",
        certification_name: "SQLP",
        event_type: "접수시작",
        round: r.round,
        description: "원서접수 시작",
      },
      {
        date: r.접수마감,
        certification_id: "sqlp",
        certification_name: "SQLP",
        event_type: "접수마감",
        round: r.round,
        description: "원서접수 마감",
      },
      {
        date: r.시험,
        certification_id: "sqlp",
        certification_name: "SQLP",
        event_type: "시험",
        round: r.round,
        description: null,
      },
      {
        date: r.합격발표,
        certification_id: "sqlp",
        certification_name: "SQLP",
        event_type: "합격발표",
        round: r.round,
        description: "합격자 발표",
      },
    );
  }
  return rows;
}

// ─── TOEIC (공식 사이트 JS SPA — 크롤링 불가) ────────────

function getToeicSchedules(): Row[] {
  const dates = [
    "2026-01-11",
    "2026-01-25",
    "2026-02-01",
    "2026-02-08",
    "2026-02-28",
    "2026-03-15",
    "2026-03-29",
    "2026-04-12",
    "2026-04-26",
    "2026-05-10",
    "2026-05-31",
    "2026-06-13",
    "2026-06-28",
    "2026-07-12",
    "2026-07-26",
    "2026-08-09",
    "2026-08-16",
    "2026-08-23",
    "2026-09-13",
    "2026-09-27",
    "2026-10-11",
    "2026-10-25",
    "2026-11-08",
    "2026-11-22",
    "2026-12-13",
    "2026-12-27",
  ];
  return dates.map((d) => ({
    date: d,
    certification_id: "toeic",
    certification_name: "TOEIC",
    event_type: "시험",
    round: null,
    description: "정기시험",
  }));
}

// ─── CPA 공인회계사 ───────────────────────────────────────

function getCpaSchedules(): Row[] {
  const id = "cpa",
    name = "공인회계사";
  return [
    {
      date: "2026-01-08",
      certification_id: id,
      certification_name: name,
      event_type: "접수시작",
      round: "61회",
      description: "1차 원서접수 시작",
    },
    {
      date: "2026-01-20",
      certification_id: id,
      certification_name: name,
      event_type: "접수마감",
      round: "61회",
      description: "1차 원서접수 마감",
    },
    {
      date: "2026-03-02",
      certification_id: id,
      certification_name: name,
      event_type: "시험",
      round: "61회",
      description: "1차 시험",
    },
    {
      date: "2026-04-10",
      certification_id: id,
      certification_name: name,
      event_type: "합격발표",
      round: "61회",
      description: "1차 합격자 발표",
    },
    {
      date: "2026-05-07",
      certification_id: id,
      certification_name: name,
      event_type: "접수시작",
      round: "61회",
      description: "2차 원서접수 시작",
    },
    {
      date: "2026-05-19",
      certification_id: id,
      certification_name: name,
      event_type: "접수마감",
      round: "61회",
      description: "2차 원서접수 마감",
    },
    {
      date: "2026-06-27",
      certification_id: id,
      certification_name: name,
      event_type: "시험",
      round: "61회",
      description: "2차 시험 (6/27~6/28, 2일간)",
    },
    {
      date: "2026-09-04",
      certification_id: id,
      certification_name: name,
      event_type: "합격발표",
      round: "61회",
      description: "2차 합격자 발표",
    },
  ];
}

// ─── GTQ 그래픽기술자격 (한국생산성본부 — 동적 페이지) ────

function getGtqSchedules(): Row[] {
  const certs = [
    { id: "gtq-1", name: "GTQ 1급" },
    { id: "gtq-2", name: "GTQ 2급" },
    { id: "gtqi-1", name: "GTQI 1급" },
    { id: "gtqi-2", name: "GTQI 2급" },
    { id: "gtqid-1", name: "GTQID 1급" },
    { id: "gtqid-2", name: "GTQID 2급" },
  ];
  const dates = [
    "2026-01-24",
    "2026-02-28",
    "2026-03-28",
    "2026-04-25",
    "2026-05-30",
    "2026-06-27",
    "2026-07-25",
    "2026-08-22",
    "2026-09-19",
    "2026-10-24",
    "2026-11-28",
    "2026-12-19",
  ];
  const rows: Row[] = [];
  for (const c of certs) {
    for (const d of dates) {
      rows.push({
        date: d,
        certification_id: c.id,
        certification_name: c.name,
        event_type: "시험",
        round: null,
        description: "정기시험",
      });
    }
  }
  return rows;
}

// ─── 전산회계 / 전산세무 (한국세무사회 — 크롤링 불가) ─────

function getAccountingSchedules(): Row[] {
  const rounds = [
    {
      round: "124회",
      접수시작: "2026-01-02",
      접수마감: "2026-01-08",
      시험: "2026-01-31",
      합격발표: "2026-02-26",
    },
    {
      round: "125회",
      접수시작: "2026-03-05",
      접수마감: "2026-03-11",
      시험: "2026-04-04",
      합격발표: "2026-04-23",
    },
    {
      round: "126회",
      접수시작: "2026-04-30",
      접수마감: "2026-05-06",
      시험: "2026-06-06",
      합격발표: "2026-06-25",
    },
    {
      round: "127회",
      접수시작: "2026-07-02",
      접수마감: "2026-07-08",
      시험: "2026-08-01",
      합격발표: "2026-08-20",
    },
    {
      round: "128회",
      접수시작: "2026-08-27",
      접수마감: "2026-09-02",
      시험: "2026-10-03",
      합격발표: "2026-10-29",
    },
    {
      round: "129회",
      접수시작: "2026-11-05",
      접수마감: "2026-11-11",
      시험: "2026-12-05",
      합격발표: "2026-12-24",
    },
  ];

  const certs = [
    { id: "computerized-accounting-1", name: "전산회계 1급" },
    { id: "computerized-accounting-2", name: "전산회계 2급" },
    { id: "computerized-tax-1", name: "전산세무 1급" },
    { id: "computerized-tax-2", name: "전산세무 2급" },
  ];

  const rows: Row[] = [];
  for (const c of certs) {
    for (const r of rounds) {
      rows.push(
        {
          date: r.접수시작,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "접수시작",
          round: r.round,
          description: "원서접수 시작",
        },
        {
          date: r.접수마감,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "접수마감",
          round: r.round,
          description: "원서접수 마감",
        },
        {
          date: r.시험,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "시험",
          round: r.round,
          description: null,
        },
        {
          date: r.합격발표,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "합격발표",
          round: r.round,
          description: "합격자 발표",
        },
      );
    }
  }
  return rows;
}

// ─── ADsP ─────────────────────────────────────────────────

function getAdspSchedules(): Row[] {
  const rounds = [
    {
      round: "48회",
      접수시작: "2026-01-05",
      접수마감: "2026-01-09",
      시험: "2026-02-07",
      합격발표: "2026-03-06",
    },
    {
      round: "49회",
      접수시작: "2026-04-13",
      접수마감: "2026-04-17",
      시험: "2026-05-17",
      합격발표: "2026-06-05",
    },
    {
      round: "50회",
      접수시작: "2026-07-06",
      접수마감: "2026-07-10",
      시험: "2026-08-08",
      합격발표: "2026-08-28",
    },
    {
      round: "51회",
      접수시작: "2026-09-28",
      접수마감: "2026-10-02",
      시험: "2026-10-31",
      합격발표: "2026-11-20",
    },
  ];

  const rows: Row[] = [];
  for (const r of rounds) {
    rows.push(
      {
        date: r.접수시작,
        certification_id: "adsp",
        certification_name: "ADsP",
        event_type: "접수시작",
        round: r.round,
        description: "원서접수 시작",
      },
      {
        date: r.접수마감,
        certification_id: "adsp",
        certification_name: "ADsP",
        event_type: "접수마감",
        round: r.round,
        description: "원서접수 마감",
      },
      {
        date: r.시험,
        certification_id: "adsp",
        certification_name: "ADsP",
        event_type: "시험",
        round: r.round,
        description: null,
      },
      {
        date: r.합격발표,
        certification_id: "adsp",
        certification_name: "ADsP",
        event_type: "합격발표",
        round: r.round,
        description: "합격자 발표",
      },
    );
  }
  return rows;
}

// ─── 빅데이터분석기사 ─────────────────────────────────────

function getBigdataSchedules(): Row[] {
  const id = "bigdata-engineer",
    name = "빅데이터분석기사";
  return [
    // 12회
    {
      date: "2026-03-03",
      certification_id: id,
      certification_name: name,
      event_type: "접수시작",
      round: "12회",
      description: "필기 원서접수 시작",
    },
    {
      date: "2026-03-09",
      certification_id: id,
      certification_name: name,
      event_type: "접수마감",
      round: "12회",
      description: "필기 원서접수 마감",
    },
    {
      date: "2026-04-04",
      certification_id: id,
      certification_name: name,
      event_type: "필기시험",
      round: "12회",
      description: null,
    },
    {
      date: "2026-04-24",
      certification_id: id,
      certification_name: name,
      event_type: "합격발표",
      round: "12회",
      description: "필기 합격자 발표",
    },
    {
      date: "2026-05-18",
      certification_id: id,
      certification_name: name,
      event_type: "접수시작",
      round: "12회",
      description: "실기 원서접수 시작",
    },
    {
      date: "2026-05-22",
      certification_id: id,
      certification_name: name,
      event_type: "접수마감",
      round: "12회",
      description: "실기 원서접수 마감",
    },
    {
      date: "2026-06-20",
      certification_id: id,
      certification_name: name,
      event_type: "실기시험",
      round: "12회",
      description: null,
    },
    {
      date: "2026-07-10",
      certification_id: id,
      certification_name: name,
      event_type: "합격발표",
      round: "12회",
      description: "최종 합격자 발표",
    },
    // 13회
    {
      date: "2026-08-03",
      certification_id: id,
      certification_name: name,
      event_type: "접수시작",
      round: "13회",
      description: "필기 원서접수 시작",
    },
    {
      date: "2026-08-07",
      certification_id: id,
      certification_name: name,
      event_type: "접수마감",
      round: "13회",
      description: "필기 원서접수 마감",
    },
    {
      date: "2026-09-05",
      certification_id: id,
      certification_name: name,
      event_type: "필기시험",
      round: "13회",
      description: null,
    },
    {
      date: "2026-09-23",
      certification_id: id,
      certification_name: name,
      event_type: "합격발표",
      round: "13회",
      description: "필기 합격자 발표",
    },
    {
      date: "2026-10-26",
      certification_id: id,
      certification_name: name,
      event_type: "접수시작",
      round: "13회",
      description: "실기 원서접수 시작",
    },
    {
      date: "2026-10-30",
      certification_id: id,
      certification_name: name,
      event_type: "접수마감",
      round: "13회",
      description: "실기 원서접수 마감",
    },
    {
      date: "2026-11-28",
      certification_id: id,
      certification_name: name,
      event_type: "실기시험",
      round: "13회",
      description: null,
    },
    {
      date: "2026-12-18",
      certification_id: id,
      certification_name: name,
      event_type: "합격발표",
      round: "13회",
      description: "최종 합격자 발표",
    },
  ];
}

// ─── 리눅스마스터 1급 ─────────────────────────────────────

function getLinuxMasterSchedules(): Row[] {
  const id = "linux-master-1",
    name = "리눅스마스터 1급";
  return [
    {
      date: "2026-10-05",
      certification_id: id,
      certification_name: name,
      event_type: "접수시작",
      round: null,
      description: "원서접수 시작",
    },
    {
      date: "2026-10-16",
      certification_id: id,
      certification_name: name,
      event_type: "접수마감",
      round: null,
      description: "원서접수 마감",
    },
    {
      date: "2026-11-14",
      certification_id: id,
      certification_name: name,
      event_type: "시험",
      round: null,
      description: null,
    },
    {
      date: "2026-12-04",
      certification_id: id,
      certification_name: name,
      event_type: "합격발표",
      round: null,
      description: "합격자 발표",
    },
  ];
}

// ════════════════════════════════════════════════════════════
//  SQL 생성
// ════════════════════════════════════════════════════════════

function esc(v: string | null): string {
  if (v === null) return "NULL";
  return `'${v.replace(/'/g, "''")}'`;
}

function toSQL(
  rows: Row[],
  crawledCount: number,
  hardcodedCount: number,
): string {
  const header = [
    "-- ==============================================",
    "-- 시험일정 시드 데이터 (크롤링 + 하드코딩 하이브리드)",
    `-- 생성일: ${new Date().toISOString().slice(0, 10)}`,
    `-- 총 ${rows.length}건 (🌐 크롤링: ${crawledCount}건, 📝 하드코딩: ${hardcodedCount}건)`,
    "-- ==============================================",
    "",
    "DELETE FROM exam_schedules;",
    "",
    "INSERT INTO exam_schedules (date, certification_id, certification_name, event_type, round, description) VALUES",
  ];

  const values = rows.map(
    (r, i) =>
      `(${esc(r.date)}, ${esc(r.certification_id)}, ${esc(r.certification_name)}, ${esc(r.event_type)}, ${esc(r.round)}, ${esc(r.description)})${i < rows.length - 1 ? "," : ";"}`,
  );

  return [...header, ...values].join("\n");
}

// ════════════════════════════════════════════════════════════
//  메인
// ════════════════════════════════════════════════════════════

async function main() {
  console.log("🔍 시험일정 수집 시작...\n");

  let browser: Browser | null = null;
  const all: Row[] = [];
  let crawledCount = 0;
  let hardcodedCount = 0;

  try {
    // ── 🌐 크롤링 소스 ──
    console.log("🌐 Playwright 브라우저 시작...");
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Q-net
    try {
      const qnetRows = await crawlQnetSchedules(page);
      all.push(...qnetRows);
      crawledCount += qnetRows.length;
      console.log(`🌐 Q-net 국가기술자격: ${qnetRows.length}건 크롤링 완료`);
    } catch (e: any) {
      console.error(`❌ Q-net 크롤링 실패: ${e.message}`);
      console.log(
        "   → 크롤링 실패 시 하드코딩 데이터는 별도로 준비해야 합니다.",
      );
    }

    // 한국사능력검정
    try {
      const historyRows = await crawlKoreanHistorySchedules(page);
      all.push(...historyRows);
      crawledCount += historyRows.length;
      console.log(`🌐 한국사능력검정시험: ${historyRows.length}건 크롤링 완료`);
    } catch (e: any) {
      console.error(`❌ 한국사능력검정 크롤링 실패: ${e.message}`);
    }

    await browser.close();
    browser = null;
    console.log("🌐 브라우저 종료\n");

    // ── 📝 하드코딩 소스 ──
    const hardcodedSources = [
      { label: "SQLD/SQLP", fn: getSqldSchedules },
      { label: "TOEIC", fn: getToeicSchedules },
      { label: "CPA", fn: getCpaSchedules },
      { label: "GTQ", fn: getGtqSchedules },
      { label: "전산회계/전산세무", fn: getAccountingSchedules },
      { label: "ADsP", fn: getAdspSchedules },
      { label: "빅데이터분석기사", fn: getBigdataSchedules },
      { label: "리눅스마스터", fn: getLinuxMasterSchedules },
    ];

    for (const s of hardcodedSources) {
      const rows = s.fn();
      all.push(...rows);
      hardcodedCount += rows.length;
      console.log(`📝 ${s.label}: ${rows.length}건 (하드코딩)`);
    }
  } finally {
    if (browser) await browser.close();
  }

  console.log(
    `\n📊 총 ${all.length}건 수집 완료 (🌐 ${crawledCount}건 / 📝 ${hardcodedCount}건)`,
  );

  const outPath = path.resolve(
    __dirname,
    "../supabase/seed_exam_schedules.sql",
  );
  fs.writeFileSync(outPath, toSQL(all, crawledCount, hardcodedCount), "utf-8");

  console.log(`\n✅ SQL 파일 생성 완료: supabase/seed_exam_schedules.sql`);
  console.log(`   → Supabase SQL Editor에서 이 파일을 실행하세요!`);
}

main().catch(console.error);
