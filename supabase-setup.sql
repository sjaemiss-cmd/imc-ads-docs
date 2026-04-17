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

-- 7. translations 테이블: AI 번역 캐시 (팀 공유)
create table if not exists translations (
  id          serial primary key,
  source_lang text not null,        -- 'ko' or 'my'
  target_lang text not null,        -- 'my' or 'ko'
  source_text text not null,
  translated  text not null,
  created_at  timestamptz default now()
);

-- 원문 기준 유니크 인덱스 (동일 번역 중복 방지)
create unique index if not exists idx_translations_unique
  on translations(source_lang, target_lang, md5(source_text));

create index if not exists idx_translations_lookup
  on translations(source_lang, target_lang, md5(source_text));

alter table translations enable row level security;
create policy "translations_read" on translations for select using (true);
create policy "translations_insert" on translations for insert with check (true);

-- 8. evaluations 테이블: AI 평가 결과 캐시 (제출물 수정 전까지 재평가 차단)
create table if not exists evaluations (
  id               uuid default gen_random_uuid() primary key,
  submission_id    uuid references submissions(id) on delete cascade not null unique,
  result           jsonb not null,
  content_snapshot text not null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_evaluations_submission on evaluations(submission_id);

alter table evaluations enable row level security;
create policy "evaluations_read" on evaluations for select using (true);
create policy "evaluations_insert" on evaluations for insert with check (true);
create policy "evaluations_update" on evaluations for update using (true);
create policy "evaluations_delete" on evaluations for delete using (true);

-- 9. votes 테이블: 문제별 광고 투표 (1인 1표)
create table if not exists votes (
  id            uuid default gen_random_uuid() primary key,
  topic_id      integer references topics(id) on delete cascade not null,
  submission_id uuid references submissions(id) on delete cascade not null,
  voter         text not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create unique index if not exists idx_votes_voter_topic on votes(voter, topic_id);
create index if not exists idx_votes_submission on votes(submission_id);
create index if not exists idx_votes_topic on votes(topic_id);

alter table votes enable row level security;
create policy "votes_read" on votes for select using (true);
create policy "votes_insert" on votes for insert with check (true);
create policy "votes_update" on votes for update using (true);
create policy "votes_delete" on votes for delete using (true);

-- 10. final_selections 테이블: 주제별 최종 확정 광고 (투표 1위 override)
create table if not exists final_selections (
  topic_id       integer primary key references topics(id) on delete cascade,
  submission_id  uuid references submissions(id) on delete cascade not null,
  pinned_by      text not null,
  updated_at     timestamptz default now()
);

create index if not exists idx_final_selections_submission on final_selections(submission_id);

alter table final_selections enable row level security;
create policy "final_selections_read"   on final_selections for select using (true);
create policy "final_selections_insert" on final_selections for insert with check (true);
create policy "final_selections_update" on final_selections for update using (true);
create policy "final_selections_delete" on final_selections for delete using (true);

-- 11. deep_analyses 테이블: 선정된 광고의 심화 분석 (주제당 1개, 팀 공유 편집)
create table if not exists deep_analyses (
  topic_id          integer primary key references topics(id) on delete cascade,
  concept_deep      text default '',
  analysis_deep     text default '',
  presentation_note text default '',
  updated_by        text,
  updated_at        timestamptz default now()
);

alter table deep_analyses enable row level security;
create policy "deep_analyses_read"   on deep_analyses for select using (true);
create policy "deep_analyses_insert" on deep_analyses for insert with check (true);
create policy "deep_analyses_update" on deep_analyses for update using (true);
create policy "deep_analyses_delete" on deep_analyses for delete using (true);

-- 12. ad_revisions 테이블: 선정된 광고의 내용 수정 제안 이력 (before/after/reason)
create table if not exists ad_revisions (
  id            uuid default gen_random_uuid() primary key,
  topic_id      integer references topics(id) on delete cascade not null,
  submission_id uuid references submissions(id) on delete cascade not null,
  field         text not null check (field in ('concept', 'analysis')),
  before_text   text not null,
  after_text    text not null,
  reason        text not null,
  editor        text not null,
  created_at    timestamptz default now()
);

create index if not exists idx_ad_revisions_lookup on ad_revisions(submission_id, field, created_at desc);
create index if not exists idx_ad_revisions_topic on ad_revisions(topic_id, created_at desc);

alter table ad_revisions enable row level security;
create policy "ad_revisions_read"   on ad_revisions for select using (true);
create policy "ad_revisions_insert" on ad_revisions for insert with check (true);
create policy "ad_revisions_update" on ad_revisions for update using (true);
create policy "ad_revisions_delete" on ad_revisions for delete using (true);

-- 13. Realtime 활성화
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table final_selections;
alter publication supabase_realtime add table deep_analyses;
alter publication supabase_realtime add table ad_revisions;
