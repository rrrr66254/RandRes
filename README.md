# RandRes – Random Restaurant Explorer

RandRes는 네이버 지도 API와 지역 검색 API 연동을 위한 React 기반 SPA 템플릿입니다. 지도에서 위치를 선택하거나 검색하여 랜덤 맛집을 추천받고, 음식 성향 검사 결과와 저장한 맛집을 연동할 수 있습니다. 한국어/영어 UI를 지원하며 로컬스토리지로 사용자 설정과 데이터를 유지합니다.

## 주요 기능

- 🗺️ **네이버 지도 연동 템플릿** – 지도 클릭, 현재 위치, 검색 결과로 위치 지정
- 🎯 **랜덤 맛집 추천** – 프랜차이즈 필터 적용, 카테고리/반경 필터 제공, 룰렛 애니메이션
- 🍽️ **음식 성향 검사** – MBTI 스타일 10문항, 8가지 이상 결과 타입, 결과 기반 자동 필터 적용
- 📒 **저장한 맛집 관리** – 그리드/리스트 보기, 별점 및 메모, JSON 내보내기/가져오기
- 🌐 **다국어 지원** – 한국어/영어 토글, UI 전체 번역 및 로컬스토리지에 언어 저장
- 📱 **반응형 UI** – 데스크톱, 태블릿, 모바일 환경에서 최적화된 레이아웃

## 시작하기

```bash
# 저장소 클론
git clone <repository-url>
cd RandRes

# 패키지 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경 변수 설정

`.env` 파일을 생성하여 네이버 API 키를 설정하세요. 예시:

```env
VITE_NAVER_CLIENT_ID=your_client_id_here
VITE_NAVER_CLIENT_SECRET=your_client_secret_here
VITE_NAVER_MAP_CLIENT_ID=your_map_client_id_here
```

- `VITE_NAVER_MAP_CLIENT_ID`: 네이버 지도 JavaScript API용 Client ID
- `VITE_NAVER_CLIENT_ID` & `VITE_NAVER_CLIENT_SECRET`: 지역 검색 Open API 인증 정보

> 로컬 개발 시 API 키를 지정하지 않으면 샘플 데이터와 지도 플레이스홀더가 표시됩니다.

## 네이버 API 키 발급 가이드

1. [네이버 개발자 센터](https://developers.naver.com/) 회원가입 및 로그인
2. **Application 등록** 후 Web 서비스 도메인 추가
3. **Maps JavaScript API**와 **지역 검색(OpenAPI)** 사용 설정
4. Client ID / Client Secret을 `.env` 파일에 입력

## 프로젝트 구조

```
RandRes/
├── index.html
├── package.json
├── public/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── MainTab.jsx
│   │   ├── Map.jsx
│   │   ├── RestaurantCard.jsx
│   │   ├── SavedTab.jsx
│   │   └── TestTab.jsx
│   ├── styles/
│   │   └── App.css
│   └── utils/
│       ├── api.js
│       ├── franchise-filter.js
│       ├── localStorage.js
│       ├── mockData.js
│       └── translations.js
├── vite.config.js
├── .env.example
└── README.md
```

## 데이터 & 스토리지

- 저장한 맛집, 성향 검사 결과, 언어 설정을 `localStorage`에 보관합니다.
- `Saved` 탭에서 JSON으로 내보내기/가져오기 기능을 제공해 데이터를 백업할 수 있습니다.
- `src/utils/mockData.js`의 샘플 데이터를 활용해 API가 없어도 기능을 체험할 수 있습니다.

## 개발 메모

- 지도 기능을 사용하려면 실제 API 키를 설정해야 하며, CORS 정책에 따라 백엔드 프록시가 필요할 수 있습니다.
- npm 감사 결과 일부 의존성에 중간 수준(moderate)의 취약성이 보고되었습니다. 필요 시 `npm audit`을 통해 최신 정보를 확인하세요.

## 라이선스

MIT License
