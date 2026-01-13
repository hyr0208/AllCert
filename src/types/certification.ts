export interface Certification {
  id: string;
  name: string;
  category: CategoryType;
  organization: string;
  website: string;
  description: string;
  tags: string[];
}

export type CategoryType =
  | "IT"
  | "어학"
  | "전문자격"
  | "기술"
  | "금융"
  | "디자인"
  | "기타";

export const CATEGORIES: { key: CategoryType | "전체"; label: string }[] = [
  { key: "전체", label: "전체" },
  { key: "IT", label: "IT" },
  { key: "어학", label: "어학" },
  { key: "전문자격", label: "전문자격" },
  { key: "기술", label: "기술" },
  { key: "금융", label: "금융" },
  { key: "디자인", label: "디자인" },
  { key: "기타", label: "기타" },
];
