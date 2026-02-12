/**
 * 시험일정 수집 & SQL 생성 스크립트
 *
 * 사용법: npx tsx scripts/crawl-schedules.ts
 *
 * 결과: supabase/seed_exam_schedules.sql 파일 생성
 *       → Supabase SQL Editor에서 실행하면 데이터 적재 완료
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

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

// ─── Q-net 국가기술자격 (공식 발표 2026 일정) ──────────────

function getQnetSchedules(): Row[] {
  const certs = [
    { id: "engineer-info-processing", name: "정보처리기사" },
    { id: "engineer-info-processing-industrial", name: "정보처리산업기사" },
    { id: "engineer-electrical", name: "전기기사" },
    { id: "engineer-electrical-industrial", name: "전기산업기사" },
    { id: "engineer-electronic", name: "전자기사" },
    { id: "craftsman-info-processing", name: "정보처리기능사" },
    { id: "craftsman-electrical", name: "전기기능사" },
  ];

  const rounds = [
    {
      round: "1회",
      필기접수시작: "2026-01-12",
      필기접수마감: "2026-01-15",
      필기시험시작: "2026-01-30",
      필기시험종료: "2026-03-03",
      필기합격발표: "2026-03-11",
      실기접수시작: "2026-03-23",
      실기접수마감: "2026-03-26",
      실기시험시작: "2026-04-18",
      실기시험종료: "2026-05-06",
      최종합격발표: "2026-06-12",
    },
    {
      round: "2회",
      필기접수시작: "2026-04-20",
      필기접수마감: "2026-04-23",
      필기시험시작: "2026-05-09",
      필기시험종료: "2026-05-29",
      필기합격발표: "2026-06-10",
      실기접수시작: "2026-06-22",
      실기접수마감: "2026-06-25",
      실기시험시작: "2026-07-18",
      실기시험종료: "2026-08-05",
      최종합격발표: "2026-09-11",
    },
    {
      round: "3회",
      필기접수시작: "2026-07-20",
      필기접수마감: "2026-07-23",
      필기시험시작: "2026-08-07",
      필기시험종료: "2026-09-01",
      필기합격발표: "2026-09-09",
      실기접수시작: "2026-09-21",
      실기접수마감: "2026-09-28",
      실기시험시작: "2026-10-24",
      실기시험종료: "2026-11-13",
      최종합격발표: "2026-12-18",
    },
  ];

  const rows: Row[] = [];
  for (const c of certs) {
    for (const r of rounds) {
      rows.push(
        {
          date: r.필기접수시작,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "접수시작",
          round: r.round,
          description: "필기 원서접수 시작",
        },
        {
          date: r.필기접수마감,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "접수마감",
          round: r.round,
          description: "필기 원서접수 마감",
        },
        {
          date: r.필기시험시작,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "필기시험",
          round: r.round,
          description: `필기시험 (~${r.필기시험종료.slice(5)})`,
        },
        {
          date: r.필기합격발표,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "합격발표",
          round: r.round,
          description: "필기 합격자 발표",
        },
        {
          date: r.실기접수시작,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "접수시작",
          round: r.round,
          description: "실기 원서접수 시작",
        },
        {
          date: r.실기접수마감,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "접수마감",
          round: r.round,
          description: "실기 원서접수 마감",
        },
        {
          date: r.실기시험시작,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "실기시험",
          round: r.round,
          description: `실기시험 (~${r.실기시험종료.slice(5)})`,
        },
        {
          date: r.최종합격발표,
          certification_id: c.id,
          certification_name: c.name,
          event_type: "합격발표",
          round: r.round,
          description: "최종 합격자 발표",
        },
      );
    }
  }
  return rows;
}

// ─── SQLD / SQLP (dataq.or.kr 공식 2026) ─────────────────

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

// ─── 한국사능력검정 (2026 공식 5회) ─────────────────────────

function getKoreanHistorySchedules(): Row[] {
  const id = "korean-history-1",
    name = "한국사능력검정";
  const rounds = [
    {
      round: "77회",
      접수시작: "2026-01-06",
      접수마감: "2026-01-13",
      시험: "2026-02-07",
      desc: "기본/심화",
    },
    {
      round: "78회",
      접수시작: "2026-04-28",
      접수마감: "2026-05-05",
      시험: "2026-05-23",
      desc: "심화",
    },
    {
      round: "79회",
      접수시작: "2026-07-14",
      접수마감: "2026-07-21",
      시험: "2026-08-09",
      desc: "기본/심화 (일요일)",
    },
    {
      round: "80회",
      접수시작: "2026-09-22",
      접수마감: "2026-09-29",
      시험: "2026-10-17",
      desc: "심화",
    },
    {
      round: "81회",
      접수시작: "2026-11-03",
      접수마감: "2026-11-10",
      시험: "2026-11-28",
      desc: "심화",
    },
  ];

  const rows: Row[] = [];
  for (const r of rounds) {
    rows.push(
      {
        date: r.접수시작,
        certification_id: id,
        certification_name: name,
        event_type: "접수시작",
        round: r.round,
        description: null,
      },
      {
        date: r.접수마감,
        certification_id: id,
        certification_name: name,
        event_type: "접수마감",
        round: r.round,
        description: null,
      },
      {
        date: r.시험,
        certification_id: id,
        certification_name: name,
        event_type: "시험",
        round: r.round,
        description: r.desc,
      },
    );
  }
  return rows;
}

// ─── TOEIC (2026 공식 26회) ───────────────────────────────

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

// ─── CPA 공인회계사 (2026 제61회) ──────────────────────────

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

// ─── GTQ 그래픽기술자격 (2026 공식 12회) ─────────────────

function getGtqSchedules(): Row[] {
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
  return dates.map((d) => ({
    date: d,
    certification_id: "gtq",
    certification_name: "GTQ(그래픽기술자격)",
    event_type: "시험",
    round: null,
    description: "정기시험",
  }));
}

// ─── 전산회계 / 전산세무 (2026 공식 6회, 124~129회) ────────

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
    { id: "computer-accounting-1", name: "전산회계 1급" },
    { id: "computer-accounting-2", name: "전산회계 2급" },
    { id: "computer-tax-1", name: "전산세무 1급" },
    { id: "computer-tax-2", name: "전산세무 2급" },
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

// ─── ADsP 데이터분석 준전문가 (2026 공식 4회) ─────────────

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

// ─── 빅데이터분석기사 (2026 공식 2회) ──────────────────────

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

// ─── 리눅스마스터 1급 (2026 공식 1회) ──────────────────────

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

// ─── SQL 생성 ─────────────────────────────────────────────

function esc(v: string | null): string {
  if (v === null) return "NULL";
  return `'${v.replace(/'/g, "''")}'`;
}

function toSQL(rows: Row[]): string {
  const header = [
    "-- ==============================================",
    "-- 시험일정 시드 데이터 (공식 발표 기준, 자동 생성)",
    `-- 생성일: ${new Date().toISOString().slice(0, 10)}`,
    `-- 총 ${rows.length}건`,
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

// ─── 메인 ─────────────────────────────────────────────────

function main() {
  console.log("🔍 시험일정 수집 시작...\n");

  const all: Row[] = [];

  const sources = [
    { label: "Q-net 국가기술자격", fn: getQnetSchedules },
    { label: "SQLD/SQLP", fn: getSqldSchedules },
    { label: "한국사능력검정", fn: getKoreanHistorySchedules },
    { label: "TOEIC", fn: getToeicSchedules },
    { label: "CPA", fn: getCpaSchedules },
    { label: "GTQ", fn: getGtqSchedules },
    { label: "전산회계/전산세무", fn: getAccountingSchedules },
    { label: "ADsP", fn: getAdspSchedules },
    { label: "빅데이터분석기사", fn: getBigdataSchedules },
    { label: "리눅스마스터", fn: getLinuxMasterSchedules },
  ];

  for (const s of sources) {
    const rows = s.fn();
    all.push(...rows);
    console.log(`📋 ${s.label}: ${rows.length}건`);
  }

  console.log(`\n📊 총 ${all.length}건 수집 완료`);

  const outPath = path.resolve(
    __dirname,
    "../supabase/seed_exam_schedules.sql",
  );
  fs.writeFileSync(outPath, toSQL(all), "utf-8");

  console.log(`\n✅ SQL 파일 생성 완료: supabase/seed_exam_schedules.sql`);
  console.log(`   → Supabase SQL Editor에서 이 파일을 실행하세요!`);
}

main();
