# IMC 팀 과제 위키 — 설정 가이드

## 1단계: Supabase 프로젝트 만들기 (5분)

1. [supabase.com](https://supabase.com) 접속 → **Start your project** (GitHub 계정으로 로그인)
2. **New Project** 클릭
3. 프로젝트 이름: `imc-wiki` (아무거나 OK)
4. 비밀번호 설정 (기억할 필요 없음)
5. Region: **Northeast Asia (Seoul)** 선택
6. **Create new project** 클릭 → 2분 대기

## 2단계: 테이블 생성 (2분)

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. `supabase-setup.sql` 파일 내용을 **전체 복사** 후 에디터에 붙여넣기
3. **Run** 클릭 → "Success" 확인

## 3단계: API 키 복사 (1분)

1. 좌측 메뉴 **Project Settings** → **API**
2. 두 가지 값을 복사:
   - **Project URL**: `https://xxxxx.supabase.co` 형태
   - **anon/public key**: `eyJhbGciOi...` 형태 (길다)

## 4단계: 위키에 키 연결 (1분)

`wiki.html` 파일 상단의 아래 부분을 수정:

```js
const SUPABASE_URL = '';   // ← Project URL 붙여넣기
const SUPABASE_KEY = '';   // ← anon/public key 붙여넣기
```

예시:
```js
const SUPABASE_URL = 'https://abcdefg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 5단계: GitHub Pages 배포 (2분)

1. 변경사항 커밋 & 푸시
2. GitHub 레포 → **Settings** → **Pages**
3. Source: **Deploy from a branch** → **main** → **/ (root)**
4. Save → 1분 후 `https://사용자명.github.io/imc-ads-docs/wiki.html` 에서 접속 가능

## 6단계: 팀원에게 링크 공유

팀원들에게 위 URL만 보내면 끝. 로그인 필요 없음.

---

## Supabase 없이 테스트하기

`SUPABASE_URL`과 `SUPABASE_KEY`를 비워두면 **localStorage 모드**로 작동합니다.
이 경우 데이터는 자기 브라우저에만 저장되며 팀원 간 공유는 안 됩니다.

## 문제 해결

| 증상 | 해결 |
|------|------|
| "접근 권한 없음" 에러 | SQL Editor에서 RLS 정책이 생성되었는지 확인 |
| 데이터가 안 보임 | SQL Editor에서 `select * from topics;` 실행해서 10개 행 있는지 확인 |
| 제출 후 반영 안 됨 | Realtime이 활성화되었는지 확인 (SQL 마지막 줄) |
