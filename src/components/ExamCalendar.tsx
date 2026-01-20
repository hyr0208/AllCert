import { useState, useMemo } from "react";
import { CalendarEventBadge } from "./CalendarEventBadge";
import { EventDetailModal } from "./EventDetailModal";
import { getEventsByMonth } from "../data/examSchedules";
import { ExamEvent, EVENT_COLORS, EventType } from "../types/examSchedule";

const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export function ExamCalendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 0, 1)); // 2026년 1월
  const [selectedEventType, setSelectedEventType] = useState<
    EventType | "전체"
  >("전체");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 해당 월의 이벤트 가져오기
  const monthEvents = useMemo(() => {
    const events = getEventsByMonth(year, month + 1);
    if (selectedEventType === "전체") return events;
    return events.filter((e) => e.eventType === selectedEventType);
  }, [year, month, selectedEventType]);

  // 날짜별 이벤트 맵
  const eventsByDate = useMemo(() => {
    const map: Record<string, ExamEvent[]> = {};
    monthEvents.forEach((event) => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  }, [monthEvents]);

  // 달력 그리드 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // 이전 달의 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [year, month]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 0, 1)); // 2026년 1월로 고정
  };

  const formatDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const handleCellClick = (dateStr: string, events: ExamEvent[]) => {
    // 모바일에서만 모달 열기 (768px 이하)
    if (window.innerWidth <= 768 && events.length > 0) {
      setSelectedDate(dateStr);
    }
  };

  const eventTypes: (EventType | "전체")[] = [
    "전체",
    "접수시작",
    "접수마감",
    "필기시험",
    "실기시험",
    "시험",
    "합격발표",
  ];

  return (
    <div className="exam-calendar">
      {/* 헤더 */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={goToPrevMonth} className="nav-button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="calendar-title">
            {year}년 {MONTHS[month]}
          </h2>
          <button onClick={goToNextMonth} className="nav-button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button onClick={goToToday} className="today-button">
            오늘
          </button>
        </div>

        {/* 월 탭 */}
        <div className="month-tabs">
          {MONTHS.map((m, idx) => (
            <button
              key={m}
              className={`month-tab ${idx === month ? "active" : ""}`}
              onClick={() => setCurrentDate(new Date(year, idx, 1))}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 필터 */}
      <div className="calendar-filters">
        <div className="filter-label">일정 유형:</div>
        <div className="filter-buttons">
          {eventTypes.map((type) => (
            <button
              key={type}
              className={`filter-button ${
                selectedEventType === type ? "active" : ""
              }`}
              onClick={() => setSelectedEventType(type)}
              style={
                type !== "전체" && selectedEventType === type
                  ? {
                      backgroundColor: EVENT_COLORS[type as EventType],
                      color: "white",
                    }
                  : {}
              }
            >
              {type}
            </button>
          ))}
        </div>
        <div className="event-legend">
          {Object.entries(EVENT_COLORS).map(([type, color]) => (
            <div key={type} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: color }} />
              <span className="legend-text">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="calendar-grid-container">
        {/* 요일 헤더 */}
        <div className="calendar-weekdays">
          {DAYS_OF_WEEK.map((day, idx) => (
            <div
              key={day}
              className={`weekday ${idx === 0 ? "sunday" : ""} ${
                idx === 6 ? "saturday" : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="calendar-grid">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return (
                <div key={`empty-${idx}`} className="calendar-cell empty" />
              );
            }

            const dateStr = formatDateString(day);
            const dayEvents = eventsByDate[dateStr] || [];
            const dayOfWeek = idx % 7;
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={dateStr}
                className={`calendar-cell ${isSunday ? "sunday" : ""} ${
                  isSaturday ? "saturday" : ""
                } ${hasEvents ? "has-events" : ""}`}
                onClick={() => handleCellClick(dateStr, dayEvents)}
              >
                <div className="cell-date">
                  {day}
                  {/* 모바일에서 이벤트 개수 표시 */}
                  {hasEvents && (
                    <span className="mobile-event-count">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="cell-events">
                  {dayEvents.slice(0, 3).map((event, eventIdx) => (
                    <CalendarEventBadge
                      key={`${event.certificationId}-${eventIdx}`}
                      event={event}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div
                      className="more-events"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(dateStr);
                      }}
                    >
                      +{dayEvents.length - 3}개 더보기
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 모바일 이벤트 상세 모달 */}
      {selectedDate && (
        <EventDetailModal
          date={selectedDate}
          events={eventsByDate[selectedDate] || []}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
