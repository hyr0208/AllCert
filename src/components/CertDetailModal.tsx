import { X, ExternalLink, Building2, Calendar, Award } from "lucide-react";
import { Certification } from "../types/certification";
import { useExamSchedulesByCertId } from "../hooks/useExamSchedules";
import { EVENT_COLORS } from "../types/examSchedule";

interface CertDetailModalProps {
  certification: Certification;
  onClose: () => void;
}

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${year}.${month}.${day}`;
};

export function CertDetailModal({
  certification,
  onClose,
}: CertDetailModalProps) {
  // Supabase에서 해당 자격증의 시험 일정 가져오기
  const { events: examEvents, loading: scheduleLoading } =
    useExamSchedulesByCertId(certification.id);

  // 오늘 이후의 일정만 필터링
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const upcomingEvents = examEvents.filter((e) => e.date >= todayStr);

  const handleWebsiteClick = () => {
    window.open(certification.website, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="cert-detail-modal">
        {/* Header */}
        <div className="cert-modal-header">
          <div className="cert-modal-category">
            <Award className="w-5 h-5" />
            <span>{certification.category}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="cert-modal-content">
          {/* 기본 정보 */}
          <div className="cert-modal-info">
            <h2 className="cert-modal-title">{certification.name}</h2>
            <div className="cert-modal-org">
              <Building2 className="w-4 h-4" />
              <span>{certification.organization}</span>
            </div>
            <p className="cert-modal-desc">{certification.description}</p>

            {/* 태그 */}
            <div className="cert-modal-tags">
              {certification.tags.map((tag) => (
                <span key={tag} className="cert-tag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 시험 일정 */}
          <div className="cert-modal-schedule">
            <h3 className="schedule-title">
              <Calendar className="w-4 h-4" />
              <span>다가오는 시험 일정</span>
            </h3>

            {scheduleLoading ? (
              <p
                style={{ color: "#6b7280", fontSize: "14px", padding: "8px 0" }}
              >
                일정을 불러오는 중...
              </p>
            ) : upcomingEvents.length > 0 ? (
              <div className="schedule-list">
                {upcomingEvents.slice(0, 5).map((event, idx) => (
                  <div key={idx} className="schedule-item">
                    <span
                      className="schedule-type"
                      style={{ backgroundColor: EVENT_COLORS[event.eventType] }}
                    >
                      {event.eventType}
                    </span>
                    <div className="schedule-info">
                      <span className="schedule-date">
                        {formatDate(event.date)}
                      </span>
                      <span className="schedule-desc">
                        {event.round && `${event.round} `}
                        {event.description}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length > 5 && (
                  <p className="schedule-more">
                    +{upcomingEvents.length - 5}개의 일정이 더 있습니다
                  </p>
                )}
              </div>
            ) : (
              <p className="no-schedule">예정된 시험 일정이 없습니다</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="cert-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            닫기
          </button>
          <button className="btn-primary" onClick={handleWebsiteClick}>
            <ExternalLink className="w-4 h-4" />
            <span>공식 사이트 방문</span>
          </button>
        </div>
      </div>
    </>
  );
}
