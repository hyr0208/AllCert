import { ExamEvent, EVENT_COLORS } from "../types/examSchedule";

interface CalendarEventBadgeProps {
  event: ExamEvent;
}

export function CalendarEventBadge({ event }: CalendarEventBadgeProps) {
  const bgColor = EVENT_COLORS[event.eventType];

  return (
    <div
      className="calendar-event-badge"
      style={{ backgroundColor: bgColor }}
      title={`${event.certificationName}${
        event.round ? ` ${event.round}` : ""
      } - ${event.eventType}${
        event.description ? `: ${event.description}` : ""
      }`}
    >
      <span className="event-badge-text">
        {event.certificationName}
        {event.round && <span className="event-round"> {event.round}</span>}
      </span>
    </div>
  );
}
