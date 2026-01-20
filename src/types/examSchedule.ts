export type EventType =
  | "접수시작"
  | "접수마감"
  | "필기시험"
  | "실기시험"
  | "합격발표"
  | "시험";

export interface ExamEvent {
  date: string; // YYYY-MM-DD format
  certificationId: string;
  certificationName: string;
  eventType: EventType;
  round?: string; // 예: "1회", "2회"
  description?: string;
}

export const EVENT_COLORS: Record<EventType, string> = {
  접수시작: "#10b981", // green
  접수마감: "#f59e0b", // amber
  필기시험: "#3b82f6", // blue
  실기시험: "#8b5cf6", // purple
  합격발표: "#ec4899", // pink
  시험: "#06b6d4", // cyan
};
