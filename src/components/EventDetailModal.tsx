import { ExamEvent, EVENT_COLORS } from "../types/examSchedule";

interface EventDetailModalProps {
  date: string;
  events: ExamEvent[];
  onClose: () => void;
}

export function EventDetailModal({
  date,
  events,
  onClose,
}: EventDetailModalProps) {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${year}.${month}.${day}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="event-detail-modal">
        <div className="modal-header">
          <h3 className="modal-title">{formatDate(date)} 일정</h3>
          <button className="modal-close" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {events.length === 0 ? (
            <div className="no-events">이 날짜에 등록된 일정이 없습니다.</div>
          ) : (
            <div className="event-list">
              {events.map((event, idx) => (
                <div
                  key={`${event.certificationId}-${idx}`}
                  className="event-item"
                >
                  <div
                    className="event-type-badge"
                    style={{ backgroundColor: EVENT_COLORS[event.eventType] }}
                  >
                    {event.eventType}
                  </div>
                  <div className="event-info">
                    <div className="event-name">
                      {event.certificationName}
                      {event.round && (
                        <span className="event-round"> {event.round}</span>
                      )}
                    </div>
                    {event.description && (
                      <div className="event-description">
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
