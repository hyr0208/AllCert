# 🏆 AllCert - 모든 자격증 포털

> 다양한 자격증 정보를 한눈에 확인하고, 원하는 자격증을 쉽게 찾아보세요!

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)

## ✨ 주요 기능

- 📚 **다양한 자격증 정보** - IT, 어학, 전문자격, 기술, 금융, 디자인 등 다양한 분야의 자격증 정보 제공
- 🔍 **실시간 검색** - 자격증 이름, 기관, 키워드로 빠르게 검색
- 🏷️ **카테고리 필터링** - 원하는 분야의 자격증만 모아보기
- 🔗 **공식 사이트 연결** - 클릭 한 번으로 자격증 공식 사이트 바로가기
- 📱 **반응형 디자인** - PC, 태블릿, 모바일 모든 기기에서 최적화된 화면

## 🚀 시작하기

### 필수 조건

- Node.js 18.0 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/hyr0208/AllCert.git
cd AllCert

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:5173`으로 접속하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
AllCert/
├── src/
│   ├── components/      # React 컴포넌트
│   │   ├── Header.tsx       # 헤더 및 검색바
│   │   ├── FilterBar.tsx    # 카테고리 필터
│   │   ├── CertGrid.tsx     # 자격증 그리드
│   │   ├── CertCard.tsx     # 자격증 카드
│   │   └── Footer.tsx       # 푸터
│   ├── data/
│   │   └── certifications.ts   # 자격증 데이터
│   ├── types/
│   │   └── certification.ts    # TypeScript 타입 정의
│   ├── App.tsx          # 메인 앱 컴포넌트
│   ├── main.tsx         # 엔트리 포인트
│   └── index.css        # 전역 스타일
├── public/              # 정적 파일
├── index.html           # HTML 템플릿
└── package.json
```

## 🏷️ 자격증 카테고리

| 카테고리     | 설명                 | 예시                                  |
| ------------ | -------------------- | ------------------------------------- |
| **IT**       | 정보기술 관련 자격증 | 정보처리기사, SQLD, 컴퓨터활용능력 등 |
| **어학**     | 외국어 능력 자격증   | TOEIC, JLPT, HSK 등                   |
| **전문자격** | 전문직 자격증        | 공인회계사, 세무사, 변호사 등         |
| **기술**     | 기술 분야 자격증     | 전기기사, 건축기사, 소방설비기사 등   |
| **금융**     | 금융 관련 자격증     | CFA, 투자자산운용사, 전산회계 등      |
| **디자인**   | 디자인 관련 자격증   | GTQ, GTQi, GTQid 등                   |
| **기타**     | 기타 자격증          | 한국사능력검정, 바리스타, 운전면허 등 |

## 🛠️ 기술 스택

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Icons:** Lucide React

## 📝 자격증 추가하기

새로운 자격증을 추가하려면 `src/data/certifications.ts` 파일에 다음 형식으로 추가하세요:

```typescript
{
  id: "unique-id",
  name: "자격증 이름",
  category: "IT", // IT | 어학 | 전문자격 | 기술 | 금융 | 디자인 | 기타
  organization: "주관 기관",
  website: "https://example.com",
  description: "자격증 설명",
  tags: ["태그1", "태그2", "태그3"],
}
```

## 🚀 배포

현재 [allcert.yyyerin.co.kr](https://allcert.yyyerin.co.kr)에 배포되어 있습니다.

## 📄 라이선스

MIT License

---

Made with ❤️ for certification seekers
