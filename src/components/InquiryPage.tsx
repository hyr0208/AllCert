import { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Send,
  CheckCircle,
  MessageSquarePlus,
  FileText,
  Link2,
  User,
  Mail,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

type InquiryType = "certification" | "bug" | "suggestion" | "other";

interface InquiryForm {
  type: InquiryType;
  name: string;
  email: string;
  subject: string;
  // 자격증 추가 요청 전용 필드
  certName: string;
  organization: string;
  officialUrl: string;
  // 공통 필드
  description: string;
}

const initialForm: InquiryForm = {
  type: "certification",
  name: "",
  email: "",
  subject: "",
  certName: "",
  organization: "",
  officialUrl: "",
  description: "",
};

const inquiryTypes: { value: InquiryType; label: string; icon: string }[] = [
  { value: "certification", label: "자격증 추가 요청", icon: "📜" },
  { value: "bug", label: "오류 신고", icon: "🐛" },
  { value: "suggestion", label: "기능 제안", icon: "💡" },
  { value: "other", label: "기타 문의", icon: "💬" },
];

const typeLabels: Record<InquiryType, string> = {
  certification: "자격증 추가 요청",
  bug: "오류 신고",
  suggestion: "기능 제안",
  other: "기타 문의",
};

// EmailJS 설정
const EMAILJS_SERVICE_ID = "yyyerin";
const EMAILJS_TEMPLATE_ID = "template_zzlk84r";
const EMAILJS_PUBLIC_KEY = "wo6_CWIVgABiDVOTU";

export function InquiryPage() {
  const [form, setForm] = useState<InquiryForm>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: InquiryType) => {
    setForm((prev) => ({ ...prev, type }));
  };

  const buildEmailContent = () => {
    let content = `[문의 유형] ${typeLabels[form.type]}\n\n`;

    if (form.name) content += `[이름] ${form.name}\n`;
    if (form.email) content += `[이메일] ${form.email}\n`;
    content += "\n";

    if (form.type === "certification") {
      content += `[자격증 이름] ${form.certName}\n`;
      if (form.organization) content += `[주관 기관] ${form.organization}\n`;
      if (form.officialUrl) content += `[공식 사이트] ${form.officialUrl}\n`;
      if (form.description) content += `\n[추가 설명]\n${form.description}`;
    } else {
      content += `[제목] ${form.subject}\n`;
      content += `\n[상세 내용]\n${form.description}`;
    }

    return content;
  };

  const getEmailSubject = () => {
    const prefix = `[AllCert 문의] `;
    if (form.type === "certification") {
      return prefix + `자격증 추가 요청: ${form.certName}`;
    }
    return prefix + `${typeLabels[form.type]}: ${form.subject}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const templateParams = {
        subject: getEmailSubject(),
        message: buildEmailContent(),
        from_name: form.name || "익명",
        from_email: form.email || "미입력",
        inquiry_type: typeLabels[form.type],
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setIsSubmitted(true);
      console.log("문의 전송 완료:", templateParams);
    } catch (err) {
      console.error("이메일 전송 실패:", err);
      setError("문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setIsSubmitted(false);
    setError(null);
  };

  const isFormValid = () => {
    if (form.type === "certification") {
      return form.certName.trim() !== "";
    }
    return form.subject.trim() !== "" && form.description.trim() !== "";
  };

  if (isSubmitted) {
    return (
      <div className="inquiry-page">
        <div className="inquiry-success">
          <div className="success-icon">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="success-title">문의가 접수되었습니다!</h2>
          <p className="success-message">
            소중한 의견 감사합니다. 빠른 시일 내에 검토하겠습니다.
          </p>
          <button onClick={handleReset} className="submit-button">
            새로운 문의하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inquiry-page">
      <div className="inquiry-header">
        <div className="inquiry-icon">
          <MessageSquarePlus className="w-8 h-8" />
        </div>
        <h1 className="inquiry-title">문의하기</h1>
        <p className="inquiry-subtitle">
          자격증 추가 요청, 오류 신고, 기능 제안 등 자유롭게 문의해 주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="inquiry-form">
        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* 문의 유형 선택 */}
        <div className="form-section">
          <h3 className="section-title">문의 유형</h3>
          <div className="type-buttons">
            {inquiryTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`type-button ${form.type === type.value ? "active" : ""}`}
              >
                <span className="type-icon">{type.icon}</span>
                <span className="type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 기본 정보 섹션 */}
        <div className="form-section">
          <h3 className="section-title">연락처 정보 (선택)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <User className="w-4 h-4" />
                이름
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="홍길동"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Mail className="w-4 h-4" />
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* 자격증 추가 요청 폼 */}
        {form.type === "certification" && (
          <div className="form-section">
            <h3 className="section-title">자격증 정보</h3>
            <div className="form-group">
              <label className="form-label required">
                <FileText className="w-4 h-4" />
                자격증 이름
              </label>
              <input
                type="text"
                name="certName"
                value={form.certName}
                onChange={handleChange}
                placeholder="예: AWS Solutions Architect"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <User className="w-4 h-4" />
                주관 기관
              </label>
              <input
                type="text"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                placeholder="예: Amazon Web Services"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Link2 className="w-4 h-4" />
                공식 사이트 URL
              </label>
              <input
                type="url"
                name="officialUrl"
                value={form.officialUrl}
                onChange={handleChange}
                placeholder="https://www.example.com"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <HelpCircle className="w-4 h-4" />
                추가 설명
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="자격증에 대한 추가 정보가 있다면 작성해 주세요."
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* 일반 문의 폼 */}
        {form.type !== "certification" && (
          <div className="form-section">
            <h3 className="section-title">문의 내용</h3>
            <div className="form-group">
              <label className="form-label required">
                <FileText className="w-4 h-4" />
                제목
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="문의 제목을 입력해 주세요"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label required">
                <MessageSquarePlus className="w-4 h-4" />
                상세 내용
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={
                  form.type === "bug"
                    ? "발견한 오류를 자세히 설명해 주세요. (어떤 상황에서 발생했는지, 어떤 브라우저를 사용했는지 등)"
                    : form.type === "suggestion"
                      ? "제안하고 싶은 기능을 설명해 주세요."
                      : "문의 내용을 자세히 작성해 주세요."
                }
                className="form-textarea"
                rows={5}
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" />
              제출 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              문의 제출하기
            </>
          )}
        </button>

        <p className="form-note">
          * 필수 항목만 입력하시면 됩니다. 연락처는 선택사항입니다.
        </p>
      </form>
    </div>
  );
}
