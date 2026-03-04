import { Router, Request, Response } from 'express';
import type { JobCategory, InterviewQuestion } from '../types';

const router = Router();

// ─── Data (mirrors the React Native constants) ────────────────────────────────

const CATEGORIES: JobCategory[] = [
  { id: 'software', label: '소프트웨어 개발', labelEn: 'Software Development', icon: '💻', description: '프론트엔드, 백엔드, 풀스택 개발자', questionCount: 5, color: '#4F46E5' },
  { id: 'product',  label: '프로덕트 매니지먼트', labelEn: 'Product Management', icon: '📊', description: 'PM, PO 포지션', questionCount: 2, color: '#0891B2' },
  { id: 'design',   label: 'UX/UI 디자인', labelEn: 'UX/UI Design', icon: '🎨', description: '프로덕트 디자이너, UX 리서처', questionCount: 1, color: '#7C3AED' },
  { id: 'data',     label: '데이터 사이언스', labelEn: 'Data Science', icon: '📈', description: '데이터 분석가, ML 엔지니어', questionCount: 1, color: '#059669' },
  { id: 'marketing',label: '마케팅', labelEn: 'Marketing', icon: '📣', description: '디지털 마케터, 그로스 해커', questionCount: 0, color: '#DC2626' },
  { id: 'hr',       label: '인사/조직', labelEn: 'HR & People', icon: '👥', description: 'HR, 리크루터, 조직문화', questionCount: 0, color: '#D97706' },
];

const QUESTIONS: Record<string, InterviewQuestion[]> = {
  software: [
    { id: 'sw-001', categoryId: 'software', text: '자신의 가장 큰 기술적 성과에 대해 설명해 주세요.', hint: 'STAR 방법론(상황-과제-행동-결과)을 활용하면 효과적입니다.', difficulty: 'medium', tags: ['경험', '기술', '성과'], estimatedSeconds: 120 },
    { id: 'sw-002', categoryId: 'software', text: '팀에서 의견 충돌이 생겼을 때 어떻게 해결했나요?', hint: '구체적인 상황과 본인의 역할을 중심으로 설명하세요.', difficulty: 'medium', tags: ['협업', '커뮤니케이션'], estimatedSeconds: 90 },
    { id: 'sw-003', categoryId: 'software', text: '새로운 기술이나 언어를 배울 때 어떤 방식으로 접근하시나요?', difficulty: 'easy', tags: ['학습', '성장'], estimatedSeconds: 90 },
    { id: 'sw-004', categoryId: 'software', text: '코드 리뷰에서 본인이 중요하게 생각하는 기준은 무엇인가요?', difficulty: 'medium', tags: ['코드품질', '협업'], estimatedSeconds: 100 },
    { id: 'sw-005', categoryId: 'software', text: '시스템 장애가 발생했을 때 어떻게 대응하셨는지 경험을 말씀해 주세요.', hint: '문제 인식 → 원인 파악 → 해결 → 사후 조치 순서로 설명하면 좋습니다.', difficulty: 'hard', tags: ['온콜', '문제해결'], estimatedSeconds: 150 },
  ],
  product: [
    { id: 'pm-001', categoryId: 'product', text: '프로덕트 로드맵을 결정할 때 어떤 기준으로 우선순위를 정하시나요?', hint: 'RICE, ICE 등 프레임워크를 언급하면 구체적으로 보입니다.', difficulty: 'medium', tags: ['우선순위', '전략'], estimatedSeconds: 120 },
    { id: 'pm-002', categoryId: 'product', text: '데이터 없이 제품 결정을 내려야 했던 경험이 있으신가요?', difficulty: 'hard', tags: ['의사결정', '불확실성'], estimatedSeconds: 120 },
  ],
  design: [
    { id: 'ux-001', categoryId: 'design', text: '사용자 리서치 결과가 이해관계자의 기대와 다를 때 어떻게 설득하시나요?', difficulty: 'hard', tags: ['리서치', '커뮤니케이션'], estimatedSeconds: 120 },
  ],
  data: [
    { id: 'ds-001', categoryId: 'data', text: '모델의 정확도보다 중요한 비즈니스 지표가 있다고 생각하시나요? 예시를 들어 설명해 주세요.', difficulty: 'hard', tags: ['비즈니스', '모델링'], estimatedSeconds: 130 },
  ],
  marketing: [],
  hr: [],
};

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/', (_req: Request, res: Response) => {
  res.json(CATEGORIES);
});

router.get('/:categoryId/questions', (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const questions = QUESTIONS[categoryId];
  if (questions === undefined) {
    res.status(404).json({ error: `Category '${categoryId}' not found` });
    return;
  }
  res.json(questions);
});

export { router as categoriesRouter };
