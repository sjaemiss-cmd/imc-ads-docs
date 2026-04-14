-- ============================================================
-- IMC 팀 과제 위키 — Supabase 초기 설정 SQL
-- Supabase Dashboard > SQL Editor 에서 이 파일 전체를 붙여넣고 실행
-- ============================================================

-- 1. topics 테이블: 10개 과제 문제
create table if not exists topics (
  id            serial primary key,
  question_num  smallint unique not null,
  chapter       text not null,
  title         text not null,
  description   text not null,
  concept_hint  text not null,
  assignees     text[] default '{}'
);

-- 2. submissions 테이블: 팀원들이 올리는 광고 사례
create table if not exists submissions (
  id              uuid default gen_random_uuid() primary key,
  topic_id        integer references topics(id) on delete cascade not null,
  author          text not null,
  brand           text not null,
  campaign        text not null,
  published_at    text not null,
  medium          text not null,
  watch_url       text default '',
  concept_summary text not null,
  case_analysis   text not null,
  created_at      timestamptz default now()
);

-- 3. 인덱스
create index if not exists idx_submissions_topic on submissions(topic_id);
create index if not exists idx_submissions_created on submissions(created_at desc);

-- 4. RLS (Row Level Security) — 누구나 읽기/쓰기 가능 (팀 과제용)
alter table topics enable row level security;
alter table submissions enable row level security;

create policy "topics_read" on topics for select using (true);
create policy "topics_update" on topics for update using (true);
create policy "submissions_read" on submissions for select using (true);
create policy "submissions_insert" on submissions for insert with check (true);
create policy "submissions_update" on submissions for update using (true);
create policy "submissions_delete" on submissions for delete using (true);

-- 5. 10개 과제 문제 초기 데이터
insert into topics (question_num, chapter, title, description, concept_hint) values
(1,  '1장', '해석주의적 관점',
     '사회와 소비자의 관계를 해석주의적 관점에서 바라본 광고 사례를 찾아서, 해석주의적 관점의 사회와 소비자에 대한 가정이 포함된 부분을 구체적으로 설명하시오.',
     '소비자를 의미 해석자로 봄. 기능 정보보다 상징·분위기·관계의 메시지가 설득의 중심.'),

(2,  '3장', '오감 자극: 청각',
     '광고물에서 소비자의 오감 중 청각을 집중 사용하도록 자극하는 광고 사례를 찾아서, 해당 감각을 어떤 방식으로 처리하고 있는지 구체적으로 설명하시오.',
     '청각 단서(탄산 소리, ASMR, 조리 소리 등)가 맛·온도·식감의 상상을 촉발하는 교차감각.'),

(3,  '3장', '차등적 식역 (JND)',
     '차등적 식역(differential threshold)의 개념을 설명하고, 소비자가 자극의 차이를 인식하기를 의도하는 메시지를 찾아서 구체적으로 서술하시오.',
     'JND = 차이를 인식할 수 있는 최소 변화량. Weber의 법칙. 광고에서 "X배 더", "전작 대비" 등 구체적 수치로 차이 인식 유도.'),

(4,  '3장', '자극물의 주의 요인 (2개+)',
     '광고자극물 자체에 소비자의 주의를 높일 것을 목적으로 처리된 요인을 2개 이상 찾아서, 어떤 요인이며, 왜 그런지 구체적으로 설명하시오.',
     '크기, 색 대비, 움직임, 독특함 등 자극의 물리적 특성이 선택적 주의를 유도.'),

(5,  '4장', '의미적 부호화',
     '단기기억의 증진을 위한 의미적 부호화를 설명하고, 이러한 기제를 사용한 광고를 찾아서 어떻게 부호화하고 있는지 구체적으로 설명하시오.',
     '의미 있는 맥락/범주에 연결하면 단기기억 처리 향상. 익숙한 스키마 활용.'),

(6,  '4장', '절차기억 (스크립트)',
     '장기기억 중 절차기억(스크립트)의 개념을 설명하고, 이러한 기억이 광고에서 브랜드나 제품과 어떻게 연관되고 있는지 구체적으로 설명하시오.',
     '순서화된 일상 행동 흐름의 기억. 광고가 행동 순서를 재현하면 서비스 사용법을 자연스럽게 학습.'),

(7,  '4장', '재인적 단서',
     '기억을 측정하는 개념으로 재인을 설명하고, 재인적 단서가 포함된 광고를 찾아서 어떤 부분인지 구체적으로 설명하시오.',
     '재인 = 단서를 보고 알아보는 기억. 패키지, 로고, 실루엣 같은 시각 단서가 핵심.'),

(8,  '5장', '고전적 조건화',
     '고전적 조건화 과정에서 무조건자극으로 모델이나 음악 이외의 자극이 사용된 사례를 찾아서, 조건화 과정을 그림으로 설명하시오.',
     'US(무조건자극)와 NS(중립자극=브랜드)를 반복 결합 → CS(조건자극)로 변화. 모델/음악 외 자극 필수.'),

(9,  '5장', '부정적 강화',
     '부정적 강화의 개념을 설명하고, 광고에 적용된 사례를 찾아서 그 내용을 구체적으로 설명하시오.',
     '부정적 강화 ≠ 처벌. 불쾌 자극 제거 → 행동 빈도 증가. 진통제, 탈취제, 보험 광고가 전형적.'),

(10, '5장', '고정비율 강화',
     '고정비율 강화를 광고의 주장에 사용한 사례를 찾아서 개념이 어떻게 광고내용에 포함되어 있는지 설명하시오.',
     '일정 반응 횟수 후 예측 가능한 보상. 적립, 쿠폰, 스탬프 같은 보상 언어.')
on conflict (question_num) do nothing;

-- 6. comments 테이블: 광고 사례에 대한 댓글
create table if not exists comments (
  id              uuid default gen_random_uuid() primary key,
  submission_id   uuid references submissions(id) on delete cascade not null,
  author          text not null,
  body            text not null,
  created_at      timestamptz default now()
);

create index if not exists idx_comments_submission on comments(submission_id);
create index if not exists idx_comments_created on comments(created_at);

alter table comments enable row level security;
create policy "comments_read" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (true);
create policy "comments_delete" on comments for delete using (true);

-- 7. Realtime 활성화
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table comments;
