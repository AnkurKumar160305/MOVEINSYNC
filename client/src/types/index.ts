export type SentimentType = 'positive' | 'neutral' | 'negative';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type PriorityLevel = 'P0' | 'P1' | 'P2';
export type TaskStatus = 'backlog' | 'in_progress' | 'verification' | 'done';
export type IssueStatus = 'open' | 'investigating' | 'fix_in_progress' | 'resolved';

export interface IReview {
  _id?: string;
  reviewId: string;
  rating: number;
  reviewDate: string;
  platform: 'google_play' | 'app_store' | 'mixed';
  appVersion: string;
  sentiment: SentimentType;
  primaryCategory: string;
  secondaryCategories?: string[];
  severity: SeverityType;
  confidence: number;
  reviewText: string;
  isDemo?: boolean;
}

export interface IIssue {
  _id?: string;
  issueId: string;
  title: string;
  category: string;
  severity: SeverityType;
  status: IssueStatus;
  priorityScore: number;
  description: string;
  userJourneyStage?: string;
  reviewCount?: number;
  rootCauseHypotheses?: string[];
  recommendedFix?: string;
  acceptanceCriteria?: string[];
  monitoringMetrics?: string[];
  linkedTaskId?: string;
}

export interface ITask {
  _id?: string;
  taskId: string;
  linkedIssueId?: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: TaskStatus;
  effort: 'small' | 'medium' | 'large';
  acceptanceCriteria?: string[];
  proposedFix?: string;
  technicalInvestigation?: string;
  observabilityRequirements?: string[];
  assignee?: string;
}

export interface IExperiment {
  _id?: string;
  experimentId: string;
  title: string;
  hypothesis: string;
  metricTarget: string;
  baseline: string;
  target: string;
  status: 'planned' | 'running' | 'completed';
  sampleSize: string;
  projectedRatingImpact: number;
  description?: string;
}

export interface IDashboardSummary {
  averageRating: number;
  totalReviews: number;
  negativePercentage: number;
  positivePercentage: number;
  neutralPercentage: number;
  bookingComplaintShare: number;
  openHighPriorityIssues: number;
  ratingDistribution: Record<number, number>;
  recentReviews?: IReview[];
  isDemo?: boolean;
  dataSource?: string;
}

export interface IRatingTrendItem {
  month: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface ICategoryDistributionItem {
  category: string;
  count: number;
  percentage: number;
  averageRating: number;
  negativeCount: number;
}

export interface ISentimentTrendItem {
  month: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positiveShare: number;
  neutralShare: number;
  negativeShare: number;
}

export interface IAskResponse {
  question: string;
  answer: string;
  method: string;
  reviewCount: number;
  relevantReviews: Array<{
    reviewId: string;
    rating: number;
    excerpt: string;
    category: string;
  }>;
  dataSource: string;
}

export interface IExecutiveReport {
  generatedAt: string;
  period: { start: string; end: string };
  summary: {
    totalReviews: number;
    averageRating: number;
    negativePercentage: number;
    openIssues: number;
    criticalIssues: number;
  };
  topIssues: IIssue[];
  recommendations?: string[];
  dataSource: string;
  limitations?: string[];
}
