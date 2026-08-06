import { Annotation } from '@langchain/langgraph';

export const ResearchState = Annotation.Root({
  companyName: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  ticker: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  profile: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  financialData: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  newsSummary: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  riskAnalysis: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  recommendation: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  error: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  failedNodes: Annotation({
    reducer: (x, y) => {
      const updated = { ...x };
      if (y && y.node) {
        updated[y.node] = y.error;
      }
      return updated;
    },
    default: () => ({}),
  }),
});
