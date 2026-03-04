export type FeedbackDimension =
  | 'structure'
  | 'logic'
  | 'tone'
  | 'confidence'
  | 'relevance';

export const DIMENSION_LABELS: Record<FeedbackDimension, string> = {
  structure: '구조',
  logic: '논리성',
  tone: '어조',
  confidence: '자신감',
  relevance: '적합성',
};

export type DimensionScore = {
  dimension: FeedbackDimension;
  /** 0–100 */
  score: number;
  /** Short Korean comment on this dimension */
  comment: string;
};

export type AIFeedback = {
  id: string;
  sessionId: string;
  /** 0–100 */
  overallScore: number;
  /** 2–3 sentence Korean summary */
  summary: string;
  dimensions: DimensionScore[];
  /** 2–3 bullet points: what worked well */
  strengths: string[];
  /** 2–3 bullet points: what to improve */
  improvements: string[];
  /** AI-rewritten model answer in Korean */
  rewrittenAnswer?: string;
  generatedAt: string;
  /** e.g. 'gpt-4o', 'claude-3-5-sonnet', 'mock' */
  model: string;
};

export const MOCK_FEEDBACK: AIFeedback = {
  id: 'feedback-mock-001',
  sessionId: 'session-mock-001',
  overallScore: 78,
  summary:
    '답변의 구조는 명확하고 STAR 방법론을 잘 활용했습니다. 다만 구체적인 수치와 결과를 더 강조한다면 설득력이 높아질 것입니다. 자신감 있는 어조로 전달하는 연습을 추천드립니다.',
  dimensions: [
    { dimension: 'structure', score: 82, comment: 'STAR 구조를 잘 따랐습니다.' },
    { dimension: 'logic', score: 75, comment: '논리 흐름이 대체로 명확합니다.' },
    { dimension: 'tone', score: 70, comment: '좀 더 자신감 있게 말하면 좋겠습니다.' },
    { dimension: 'confidence', score: 72, comment: '목소리 톤을 일정하게 유지하세요.' },
    { dimension: 'relevance', score: 88, comment: '질문에 매우 적합한 답변입니다.' },
  ],
  strengths: [
    '구체적인 사례를 들어 설명한 점이 인상적입니다.',
    '기술적 용어를 적절하게 사용했습니다.',
    '답변 길이가 적절합니다 (약 2분).',
  ],
  improvements: [
    '결과를 수치로 표현하면 더 설득력이 높아집니다. (예: "성능을 30% 향상")',
    '말 끝을 흐리지 말고 마무리를 명확히 하세요.',
    '팀 기여도와 개인 역할을 더 명확하게 구분해서 설명하세요.',
  ],
  rewrittenAnswer:
    '안녕하세요. 제가 가장 자랑스러운 기술적 성과는 이전 회사에서 진행한 결제 시스템 성능 개선 프로젝트입니다. 당시 결제 처리 시간이 평균 3.2초로 사용자 이탈률이 높은 상황이었습니다. 저는 팀 리드로서 병목 구간을 분석하고, 데이터베이스 쿼리 최적화와 캐싱 레이어 도입을 주도했습니다. 그 결과 처리 시간을 0.8초로 75% 단축했고, 결제 완료율이 12% 향상되어 월 매출 약 2억 원 증가에 기여했습니다.',
  generatedAt: new Date().toISOString(),
  model: 'mock',
};
