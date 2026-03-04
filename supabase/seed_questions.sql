-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id          text    PRIMARY KEY,
  label       text    NOT NULL,
  label_en    text    NOT NULL,
  icon        text    NOT NULL,
  description text    NOT NULL,
  color       text    NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.questions (
  id                text    PRIMARY KEY,
  category_id       text    NOT NULL REFERENCES public.categories(id),
  text              text    NOT NULL,
  hint              text,
  difficulty        text    NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags              text[]  NOT NULL DEFAULT '{}',
  estimated_seconds integer NOT NULL DEFAULT 120
);

-- ─── RLS — public read, no writes from client ─────────────────────────────────

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "public read questions"  ON public.questions  FOR SELECT USING (true);

-- ─── Seed: categories ─────────────────────────────────────────────────────────

INSERT INTO public.categories (id, label, label_en, icon, description, color, sort_order) VALUES
  ('software',  '소프트웨어 개발',     'Software Development', '💻', '프론트엔드, 백엔드, 풀스택 개발자', '#4F46E5', 1),
  ('product',   '프로덕트 매니지먼트', 'Product Management',   '📊', 'PM, PO 포지션',                   '#0891B2', 2),
  ('design',    'UX/UI 디자인',        'UX/UI Design',         '🎨', '프로덕트 디자이너, UX 리서처',      '#7C3AED', 3),
  ('data',      '데이터 사이언스',     'Data Science',         '📈', '데이터 분석가, ML 엔지니어',        '#059669', 4),
  ('marketing', '마케팅',              'Marketing',            '📣', '디지털 마케터, 그로스 해커',         '#DC2626', 5),
  ('hr',        '인사/조직',           'HR & People',          '👥', 'HR, 리크루터, 조직문화',            '#D97706', 6)
ON CONFLICT (id) DO NOTHING;

-- ─── Seed: questions ──────────────────────────────────────────────────────────

INSERT INTO public.questions (id, category_id, text, hint, difficulty, tags, estimated_seconds) VALUES

-- software (20)
('sw-001', 'software', '자신의 가장 큰 기술적 성과에 대해 설명해 주세요.', 'STAR 방법론(상황-과제-행동-결과)을 활용하면 효과적입니다.', 'medium', ARRAY['경험','성과'], 120),
('sw-002', 'software', '팀에서 기술적 의견 충돌이 생겼을 때 어떻게 해결했나요?', '구체적인 상황과 본인의 역할을 중심으로 설명하세요.', 'medium', ARRAY['협업','갈등해결'], 90),
('sw-003', 'software', '시스템 장애가 발생했을 때 어떻게 대응하셨는지 경험을 말씀해 주세요.', '문제 인식 → 원인 파악 → 해결 → 사후 조치 순서로 설명하면 좋습니다.', 'hard', ARRAY['온콜','문제해결','운영'], 150),
('sw-004', 'software', '코드 리뷰에서 본인이 가장 중요하게 생각하는 기준은 무엇인가요?', NULL, 'medium', ARRAY['코드품질','협업'], 100),
('sw-005', 'software', '시간 복잡도 O(n log n)과 O(n²)의 차이를 설명하고, 각각이 적합한 상황을 예시로 들어 주세요.', '정렬 알고리즘을 예시로 들면 답변하기 쉽습니다.', 'medium', ARRAY['알고리즘','복잡도','CS기초'], 120),
('sw-006', 'software', '동시성(Concurrency)과 병렬성(Parallelism)의 차이를 설명하고, 각각 어떤 문제를 해결하는지 말씀해 주세요.', NULL, 'hard', ARRAY['동시성','병렬처리','CS기초'], 130),
('sw-007', 'software', '재귀(Recursion)와 반복문(Iteration)의 차이점은 무엇이고, 재귀 사용 시 스택 오버플로우를 어떻게 방지하나요?', '꼬리 재귀 최적화(Tail Call Optimization)를 언급하면 좋습니다.', 'medium', ARRAY['알고리즘','CS기초'], 110),
('sw-008', 'software', '마이크로서비스와 모놀리식 아키텍처의 장단점을 비교하고, 어떤 상황에서 각각을 선택하시겠나요?', NULL, 'hard', ARRAY['아키텍처','시스템설계'], 150),
('sw-009', 'software', '대용량 트래픽을 처리하는 시스템을 설계할 때 고려해야 할 요소들을 설명해 주세요.', '로드 밸런싱, 캐싱, 데이터베이스 샤딩, CDN 등을 언급해 보세요.', 'hard', ARRAY['시스템설계','확장성','성능'], 180),
('sw-010', 'software', '캐싱 전략(LRU, write-through, write-back 등)에 대해 설명하고 실제 적용 경험을 말씀해 주세요.', NULL, 'hard', ARRAY['캐싱','성능','시스템설계'], 140),
('sw-011', 'software', '데이터베이스 인덱스가 무엇이고, 언제 인덱스를 추가하거나 제거해야 하는지 설명해 주세요.', '인덱스의 읽기 성능 향상과 쓰기 성능 저하 트레이드오프를 언급하세요.', 'medium', ARRAY['데이터베이스','성능','인덱스'], 130),
('sw-012', 'software', '트랜잭션의 ACID 속성(원자성, 일관성, 격리성, 지속성)에 대해 각각 설명해 주세요.', NULL, 'medium', ARRAY['데이터베이스','ACID','CS기초'], 130),
('sw-013', 'software', 'SQL의 INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN의 차이를 설명해 주세요.', '벤 다이어그램을 머릿속으로 떠올리며 설명하면 명확합니다.', 'easy', ARRAY['데이터베이스','SQL'], 100),
('sw-014', 'software', 'RESTful API와 GraphQL의 장단점을 비교하고, 어떤 상황에 각각을 선택하시겠나요?', NULL, 'medium', ARRAY['API설계','백엔드','아키텍처'], 130),
('sw-015', 'software', '웹 애플리케이션에서 XSS와 CSRF 공격이 무엇이고, 각각 어떻게 방어하나요?', NULL, 'medium', ARRAY['보안','웹','XSS','CSRF'], 130),
('sw-016', 'software', 'TCP와 UDP의 차이점과 각각의 대표적인 사용 사례를 설명해 주세요.', NULL, 'medium', ARRAY['네트워크','CS기초'], 110),
('sw-017', 'software', 'React의 가상 DOM(Virtual DOM)이 무엇이고, 실제 DOM과 비교했을 때 어떤 이점이 있나요?', NULL, 'medium', ARRAY['React','프론트엔드','성능'], 120),
('sw-018', 'software', 'Git에서 merge와 rebase의 차이점을 설명하고, 팀 협업 시 어떤 전략을 선호하시나요?', NULL, 'medium', ARRAY['Git','협업','버전관리'], 110),
('sw-019', 'software', '객체지향 프로그래밍의 SOLID 원칙에 대해 설명하고, 실제 코드에서 적용해 본 경험을 말씀해 주세요.', NULL, 'hard', ARRAY['OOP','설계원칙','아키텍처'], 150),
('sw-020', 'software', '새로운 기술을 도입하기 전에 어떤 기준으로 검토하고 팀을 어떻게 설득하시나요?', NULL, 'medium', ARRAY['기술선택','의사결정','리더십'], 120),

-- product (8)
('pm-001', 'product', '프로덕트 로드맵을 결정할 때 어떤 기준으로 우선순위를 정하시나요?', 'RICE, ICE 등 프레임워크를 언급하면 구체적으로 보입니다.', 'medium', ARRAY['우선순위','전략','의사결정'], 120),
('pm-002', 'product', '데이터 없이 제품 결정을 내려야 했던 경험이 있으신가요?', NULL, 'hard', ARRAY['의사결정','불확실성'], 120),
('pm-003', 'product', 'A/B 테스트를 설계할 때 중요하게 고려해야 할 통계적 요소는 무엇인가요?', '표본 크기, 통계적 유의성, 검정력(Power)을 언급해 보세요.', 'hard', ARRAY['A/B테스트','데이터','통계'], 130),
('pm-004', 'product', '사용자 리텐션이 낮을 때 원인을 어떻게 진단하고 어떤 액션을 취하시겠나요?', NULL, 'hard', ARRAY['리텐션','분석','성장'], 140),
('pm-005', 'product', '개발팀과 비즈니스팀 사이에서 요구사항이 충돌할 때 어떻게 중재하시나요?', NULL, 'medium', ARRAY['커뮤니케이션','협업','이해관계자'], 110),
('pm-006', 'product', '출시 후 핵심 지표(DAU, 전환율 등)가 목표 대비 낮을 때 어떻게 접근하시겠나요?', NULL, 'hard', ARRAY['지표','분석','의사결정'], 140),
('pm-007', 'product', '기술 부채(Technical Debt)를 PM 관점에서 어떻게 바라보고 로드맵에 어떻게 반영하시나요?', NULL, 'hard', ARRAY['기술부채','로드맵','개발협업'], 130),
('pm-008', 'product', '경쟁사 제품과 차별화 포인트를 찾기 위해 어떤 분석 방법을 사용하시나요?', NULL, 'medium', ARRAY['경쟁분석','전략','리서치'], 110),

-- design (6)
('ux-001', 'design', '사용자 리서치 결과가 이해관계자의 기대와 다를 때 어떻게 설득하시나요?', NULL, 'hard', ARRAY['리서치','커뮤니케이션','설득'], 120),
('ux-002', 'design', '접근성(Accessibility)을 고려한 디자인이 왜 중요하고, 실제로 어떻게 반영하시나요?', 'WCAG 기준, 색상 대비, 스크린 리더 지원 등을 언급해 보세요.', 'medium', ARRAY['접근성','a11y','포용디자인'], 110),
('ux-003', 'design', '디자인 시스템을 구축하거나 운영한 경험이 있으신가요? 어떤 점이 가장 어려웠나요?', NULL, 'hard', ARRAY['디자인시스템','협업','확장성'], 130),
('ux-004', 'design', '사용성 테스트에서 예상치 못한 결과가 나왔을 때 어떻게 대응하셨나요?', NULL, 'medium', ARRAY['사용성테스트','리서치','반복설계'], 110),
('ux-005', 'design', '모바일 퍼스트 디자인과 데스크탑 퍼스트 디자인의 차이점과 각각의 적합한 상황을 설명해 주세요.', NULL, 'medium', ARRAY['반응형','모바일','UX'], 100),
('ux-006', 'design', '개발자와 협업할 때 디자인 의도가 잘못 구현되는 상황을 어떻게 줄이시나요?', NULL, 'medium', ARRAY['개발협업','핸드오프','커뮤니케이션'], 110),

-- data (8)
('ds-001', 'data', '과적합(Overfitting)이란 무엇이고, 어떻게 방지하나요?', '정규화, 드롭아웃, 교차검증, 데이터 증강 등을 언급해 보세요.', 'medium', ARRAY['머신러닝','과적합','모델링'], 120),
('ds-002', 'data', '분류 모델의 평가 지표인 정확도, 정밀도, 재현율, F1 스코어의 차이를 설명해 주세요.', '불균형 데이터셋에서 정확도만으로 평가하면 왜 위험한지 언급하면 좋습니다.', 'medium', ARRAY['분류','평가지표','머신러닝'], 130),
('ds-003', 'data', '지도학습과 비지도학습의 차이점을 실제 비즈니스 예시와 함께 설명해 주세요.', NULL, 'easy', ARRAY['머신러닝','지도학습','비지도학습'], 110),
('ds-004', 'data', '결측값(Missing Value)을 처리하는 다양한 방법과 각각의 장단점을 설명해 주세요.', '삭제, 평균/중앙값 대체, KNN 대체, 모델 기반 대체 등을 비교해 보세요.', 'medium', ARRAY['데이터전처리','결측값','피처엔지니어링'], 120),
('ds-005', 'data', '모델의 정확도보다 중요한 비즈니스 지표가 있다고 생각하시나요? 예시를 들어 설명해 주세요.', NULL, 'hard', ARRAY['비즈니스','모델링','지표'], 130),
('ds-006', 'data', 'SQL과 Python(pandas) 중 데이터 분석에 어느 쪽을 선호하시나요? 각각 어떤 상황에서 사용하시나요?', NULL, 'easy', ARRAY['SQL','Python','데이터분석'], 100),
('ds-007', 'data', '인과관계(Causation)와 상관관계(Correlation)의 차이를 예시를 들어 설명하고, 데이터 분석에서 왜 중요한지 말씀해 주세요.', NULL, 'medium', ARRAY['통계','인과관계','분석'], 130),
('ds-008', 'data', '대용량 데이터셋(수억 건 이상)을 처리할 때 어떤 기술과 전략을 사용하시나요?', '분산처리(Spark), 파티셔닝, 청크 처리, 열 지향 스토리지(Parquet) 등을 언급해 보세요.', 'hard', ARRAY['빅데이터','분산처리','성능'], 140),

-- marketing (5)
('mkt-001', 'marketing', '마케팅 캠페인의 성과를 측정할 때 어떤 지표를 가장 중요하게 보시나요? 그 이유는 무엇인가요?', NULL, 'medium', ARRAY['지표','KPI','성과측정'], 110),
('mkt-002', 'marketing', '제한된 예산으로 최대 효과를 낼 수 있는 디지털 마케팅 채널을 어떻게 선택하시나요?', '타겟 오디언스, CAC, ROAS 등의 개념을 언급하면 좋습니다.', 'hard', ARRAY['예산최적화','채널전략','그로스'], 130),
('mkt-003', 'marketing', '퍼포먼스 마케팅과 브랜드 마케팅의 차이점을 설명하고, 두 가지를 어떻게 균형 있게 운영하시나요?', NULL, 'medium', ARRAY['브랜드','퍼포먼스','전략'], 120),
('mkt-004', 'marketing', '고객 획득 비용(CAC)이 증가하고 있을 때 어떤 방식으로 원인을 분석하고 개선하시겠나요?', NULL, 'hard', ARRAY['CAC','그로스','분석'], 130),
('mkt-005', 'marketing', '콘텐츠 마케팅 전략을 수립할 때 타겟 오디언스를 어떻게 정의하고 메시지를 설계하시나요?', NULL, 'medium', ARRAY['콘텐츠','타겟팅','전략'], 120),

-- hr (5)
('hr-001', 'hr', '채용 과정에서 후보자의 문화적 적합성(Cultural Fit)을 어떻게 평가하시나요?', NULL, 'medium', ARRAY['채용','문화','평가'], 110),
('hr-002', 'hr', '직원 이직률이 높을 때 원인을 어떻게 진단하고 어떤 방식으로 개선하시겠나요?', NULL, 'hard', ARRAY['리텐션','조직문화','분석'], 130),
('hr-003', 'hr', '성과 관리 시스템을 설계할 때 가장 중요하게 고려하는 요소는 무엇인가요?', 'OKR, KPI, 360도 피드백 등의 프레임워크를 언급해 보세요.', 'medium', ARRAY['성과관리','OKR','조직설계'], 120),
('hr-004', 'hr', '다양성과 포용성(D&I)을 채용 및 조직 문화에서 실질적으로 구현하기 위해 어떤 활동을 하셨나요?', NULL, 'hard', ARRAY['다양성','포용성','조직문화'], 130),
('hr-005', 'hr', '직원이 번아웃 징후를 보일 때 리더나 HR 담당자로서 어떻게 접근하시나요?', NULL, 'medium', ARRAY['번아웃','웰빙','리더십'], 110)

ON CONFLICT (id) DO NOTHING;
