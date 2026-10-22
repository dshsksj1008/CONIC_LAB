# CONIC LAB V6 · 노트북 시연 + GitHub Pages + iPad AR

## 가장 먼저: 압축 풀기
이 프로젝트는 ZIP **안에서 실행하는 프로그램이 아닙니다**. 전체 ZIP 파일을 압축 해제한 다음 생성된 폴더 안의 `index.html`을 실행하세요.

### 지금: 노트북으로 수업 시연
1. ZIP 압축을 풀고 프로젝트 폴더를 열기
2. `START_LAPTOP_WINDOWS.bat`을 더블클릭하거나 `index.html`을 Chrome/Edge로 열기
3. `04 · 종합 원뿔 절단`에서 `원 0°` → `타원 30°` → `포물선 γ` → `쌍곡선 70°` 클릭
4. 절단 각도 슬라이더를 천천히 움직여 3D 교선과 2D 그래프가 동시에 변하는 모습 시연
5. 01~03 개별 곡선에서 a, b, p를 변경하여 초점, 꼭짓점, 접선, 격자와 방정식이 변하는 모습 시연
6. 노트북에서는 `발표 모드`로 3D를 크게 표시하거나 `이미지` 버튼으로 화면 캡처 저장

**이 새로운 `index.html`은 카메라·서버·인터넷·A-Frame/Three.js 없이 동작하는 직접 만든 Canvas 3D 시각화 페이지입니다.** `conic-core.js`, `desktop-app.js`, `desktop.css` 파일을 지우면 안 됩니다. 별도 폴더에서 index만 꺼내 열어도 동작하지 않습니다.

### 조작 단축키
- `1` 타원, `2` 포물선, `3` 쌍곡선, `4` 종합 원뿔
- 마우스로 드래그: 3D 회전, 휠: 확대/축소, 더블클릭: 시점 초기화
- `스페이스바`: 절단각 자동 변화 실행/중지
- 발표 모드에서 `Esc`: 기본 화면으로 돌아가기

### 나중: GitHub Pages에 배포
1. GitHub에 빈 저장소 만들기. 예: `conic-lab`
2. 프로젝트 폴더 **내부의 모든 파일과 하위 폴더**를 GitHub 저장소 루트에 업로드. ZIP 자체만 올리면 사이트가 되지 않습니다.
3. 저장소 `Settings → Pages → Build and deployment → Source: Deploy from a branch → main / (root) → Save`.
4. 게시 주소 예시: `https://GITHUB_USERNAME.github.io/conic-lab/` (사용자 이름은 실제 값으로 바꾸기)
5. iPad Safari로 해당 주소를 열어 노트북과 같은 웹 3D 실험실과 터치 제스처 테스트
6. `https://GITHUB_USERNAME.github.io/conic-lab/markers.html`에서 마커 인쇄 후 `.../ar.html`에서 마커 기반 AR 테스트
7. iPad Safari 카메라 권한 허용. HTTPS/외부 CDN/카메라 지원이 필요하며 실제 기기 인식은 아직 검증하지 않음

GitHub Pages 배포 전에는 `ar.html` 카메라가 로컬 파일 보안 정책으로 제한될 수 있습니다. **노트북 수업 시연은 반드시 `index.html`을 이용하세요.**

### 파일 설명
- `index.html` : 새 노트북 최적화 메인·3D 수학 실험실 (외부 CDN 불필요)
- `desktop.css`, `desktop-app.js`, `conic-core.js`: 노트북 수학 시연 엔진
- `ar.html`, `ar-app.js`, `conic-geometry.js`, `ui.js`: 배포 후 사용 예정인 기존 4종 마커 AR
- `markers.html`, `markers/`: 마커 인쇄 카드 및 `.patt` 인식 데이터
- `fusion/*.step`: Fusion 360에서 가져올 수 있는 참고 CAD 솔리드 (파일 연결 아이콘이 SolidWorks여도 STEP은 공통 교환 형식)
- `models/*.glb`: 별도 모델 자산. `index.html`의 실시간 수학곡선은 GLB 파일을 단순히 교체하는 방식이 아니라 식에서 계산됨
- `lab.html`: 이전 3D 엔진 실험실 (외부 라이브러리 필요)
- `offline-demo.html`: 기존 2D 그래프 백업 페이지
- `math-board.html`, `qr.html`, `diagnostics.html`: 인쇄 학습판·배포용 QR·AR 점검

### 검증과 한계
- 4개 모드 전환, 파라미터 슬라이더, 수학식 갱신, 시점/발표 모드를 Chromium 브라우저에서 테스트함. 브라우저 테스트는 분리된 HTML/CSS/JS를 하나의 문서로 조립하여 수행했으며, 브라우저 실행 환경이 로컬 `file://` 탐색을 차단하여 실제 `file://` 클릭 실행 테스트는 하지 못함.
- 웹 모델은 정밀 CAD 부품을 회전하는 방식이 아니라, 수학식으로 그리는 학습용 3D 시각화임.
- 종합 교선은 유한한 원뿔 높이에 의해 잘릴 수 있음. 2D 그래프는 가독성을 위해 자동 확대되므로 각도 변경 전후 화면상 크기만으로 실제 곡선 길이를 비교하지 말 것.
- iPad Safari AR 카메라, QR 연결, 실제 마커 4종 인식은 아직 기기 검증 전임.
- 물리적 산출물 평가에서 AR 마커가 실물 교구 요건을 충족한다고 단정할 수 없음. 담당 교사의 확인이 필요함.
- 수행평가에 활용 시 AI 지원을 받은 코드·설계 부분을 교사 안내에 맞춰 기록해야 함.
