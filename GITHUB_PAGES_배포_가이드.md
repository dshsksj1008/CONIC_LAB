# GitHub Pages · iPad 사용 가이드

프로젝트 루트 폴더의 `index.html` 및 `desktop.css`, `desktop-app.js`, `conic-core.js`를 비롯한 전체 파일을 **그대로** 업로드하세요. 깃허브에 ZIP 한 개만 넣는 것은 동작하지 않습니다.

- Repository `Settings > Pages > Build and deployment`
- `Source`: `Deploy from a branch`
- Branch: `main`, Folder: `/(root)`
- Save 후 Pages에서 실제 배포 주소 확인

하위 프로젝트 URL에서도 작동하도록 내부 리소스는 상대 경로로 연결되어 있습니다.
- 주소 `/` 또는 `/index.html` = 노트북·iPad용 수학 3D 실험실
- `/ar.html` = 인식 마커 카메라 AR (HTTPS와 기기 카메라 허용 필요)
- `/markers.html` = 네 가지 마커를 A4 인쇄하는 페이지
- `/qr.html` = 접속용 QR 생성 페이지 (인터넷 CDN 필요)

iPad Safari에서 `index.html`은 AR 마커 없이 모델을 터치로 회전/핀치 확대하며 사용할 수 있습니다. `ar.html`은 실기기 테스트를 해야 합니다.

참고: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
