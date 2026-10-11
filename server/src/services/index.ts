import Review from '../models/Review';
import { generateSeedReviews, generateSeedIssues, generateSeedTasks, generateSeedExperiments } from '../seed/seedData';
import Issue from '../models/Issue';
import Task from '../models/Task';
import Experiment from '../models/Experiment';

// Classification taxonomy
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  booking: ['book', 'booking', 'cancel', 'slot', 'schedule', 'reserve', 'confirmation', 'confirmed', 'reschedule'],
  gps_eta: ['gps', 'eta', 'location', 'tracking', 'map', 'live', 'position', 'navigate', 'distance', 'stale'],
  notifications: ['notification', 'notify', 'alert', 'push', 'sms', 'message', 'remind', 'buzz'],
  pickup_timing: ['pickup', 'late', 'early', 'delay', 'wait', 'time', 'arrive', 'arrival', 'on time', 'timing'],
  routing: ['route', 'road', 'path', 'direction', 'drop', 'pickup point', 'wrong way', 'traffic', 'detour'],
  check_in_no_show: ['check-in', 'checkin', 'no-show', 'noshow', 'board', 'otp', 'verify', 'boarded', 'missed'],
  support: ['support', 'help', 'customer care', 'complaint', 'response', 'ticket', 'resolve', 'agent'],
  usability: ['ui', 'design', 'interface', 'button', 'screen', 'confus', 'dark mode', 'font', 'menu', 'layout'],
  safety: ['safe', 'danger', 'sos', 'emergency', 'reckless', 'speed', 'overspeed', 'accident', 'panic', 'woman'],
  performance: ['crash', 'slow', 'lag', 'freeze', 'battery', 'load', 'error', 'bug', 'memory', 'hang'],
};

const SEVERITY_RULES: Record<string, string[]> = {
  critical: ['safety', 'dangerous', 'accident', 'stranded', 'emergency', 'reckless', 'wrong person'],
  high: ['failed', 'broken', 'never', 'always wrong', 'terrible', 'worst', 'unacceptable'],
  medium: ['sometimes', 'often', 'confusing', 'frustrating', 'annoying', 'difficult'],
  low: ['would be nice', 'wish', 'suggestion', 'could improve', 'minor'],
};

export class ClassificationService {
  /**
   * Rule-based classification fallback — works without any AI provider
   */
  static classifyReview(text: string, rating: number) {
    const lowerText = text.toLowerCase();

    // Determine sentiment from rating
    const sentiment: 'positive' | 'neutral' | 'negative' =
      rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';

    // Determine primary category by keyword matching
    let primaryCategory = 'other';
    let maxScore = 0;
    const secondaryCategories: string[] = [];

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          score += 1;
        }
      }
      if (score > maxScore) {
        if (primaryCategory !== 'other' && maxScore > 0) {
          secondaryCategories.push(primaryCategory);
        }
        maxScore = score;
        primaryCategory = category;
      } else if (score > 0 && score === maxScore) {
        secondaryCategories.push(category);
      }
    }

    // If positive and no strong category, assign general_positive
    if (sentiment === 'positive' && maxScore <= 1) {
      primaryCategory = 'general_positive';
    }

    // Determine severity
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    for (const [sev, keywords] of Object.entries(SEVERITY_RULES)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          severity = sev as any;
          break;
        }
      }
    }

    // Override severity based on rating
    if (rating === 1 && severity === 'low') severity = 'medium';
    if (rating === 1 && severity === 'medium') severity = 'high';

    // Confidence is lower for rule-based
    const confidence = Math.min(0.75, 0.5 + maxScore * 0.1);

    // Generate summary
    const summary = sentiment === 'negative'
      ? `User reports issues related to ${primaryCategory.replace(/_/g, ' ')}. Rating: ${rating}/5.`
      : sentiment === 'positive'
        ? `User shares positive experience. Rating: ${rating}/5.`
        : `User provides mixed feedback. Rating: ${rating}/5.`;

    return {
      sentiment,
      primaryCategory,
      secondaryCategories: secondaryCategories.slice(0, 3),
      severity,
      confidence: Math.round(confidence * 100) / 100,
      aiSummary: summary,
      rootCauseHypotheses: [],
      recommendedActions: [],
    };
  }

  /**
   * Batch classify multiple reviews using rule-based approach
   */
  static batchClassify(reviews: Array<{ text: string; rating: number }>) {
    return reviews.map(r => this.classifyReview(r.text, r.rating));
  }
}

export class DashboardService {
  static async getSummary(filters: {
    startDate?: string;
    endDate?: string;
    platform?: string;
  }) {
    const query: any = {};
    if (filters.startDate || filters.endDate) {
      query.reviewDate = {};
      if (filters.startDate) query.reviewDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.reviewDate.$lte = new Date(filters.endDate);
    }
    if (filters.platform && filters.platform !== 'all') {
      query.platform = filters.platform;
    }

    const reviews = await Review.find(query).sort({ reviewDate: -1 });
    const total = reviews.length;

    if (total === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        negativePercentage: 0,
        positivePercentage: 0,
        neutralPercentage: 0,
        bookingComplaintShare: 0,
        openHighPriorityIssues: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        isDemo: true,
        dataSource: 'No data available',
      };
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const negativeCount = reviews.filter(r => r.rating <= 2).length;
    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const neutralCount = total - negativeCount - positiveCount;
    const bookingCount = reviews.filter(r => r.primaryCategory === 'booking').length;

    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      ratingDist[r.rating as keyof typeof ratingDist]++;
    });

    const openIssues = await Issue.countDocuments({
      status: { $in: ['open', 'investigating'] },
      severity: { $in: ['high', 'critical'] },
    });

    const isDemo = reviews.some(r => r.isDemo);

    return {
      averageRating: Math.round(avgRating * 100) / 100,
      totalReviews: total,
      negativePercentage: Math.round((negativeCount / total) * 10000) / 100,
      positivePercentage: Math.round((positiveCount / total) * 10000) / 100,
      neutralPercentage: Math.round((neutralCount / total) * 10000) / 100,
      bookingComplaintShare: Math.round((bookingCount / total) * 10000) / 100,
      openHighPriorityIssues: openIssues,
      ratingDistribution: ratingDist,
      recentReviews: reviews.slice(0, 10),
      isDemo,
      dataSource: isDemo ? 'Illustrative demo data' : 'Imported review data',
    };
  }

  static async getRatingTrend(filters: {
    startDate?: string;
    endDate?: string;
    platform?: string;
    granularity?: string;
  }) {
    const query: any = {};
    if (filters.startDate || filters.endDate) {
      query.reviewDate = {};
      if (filters.startDate) query.reviewDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.reviewDate.$lte = new Date(filters.endDate);
    }
    if (filters.platform && filters.platform !== 'all') {
      query.platform = filters.platform;
    }

    const reviews = await Review.find(query).sort({ reviewDate: 1 });

    // Group by month
    const trend: Record<string, { total: number; sum: number; count: number; ratings: Record<number, number> }> = {};

    reviews.forEach(r => {
      const date = new Date(r.reviewDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!trend[key]) {
        trend[key] = { total: 0, sum: 0, count: 0, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      }
      trend[key].total++;
      trend[key].sum += r.rating;
      trend[key].count++;
      trend[key].ratings[r.rating]++;
    });

    return Object.entries(trend).map(([month, data]) => ({
      month,
      averageRating: Math.round((data.sum / data.count) * 100) / 100,
      totalReviews: data.total,
      ratingDistribution: data.ratings,
    }));
  }

  static async getCategoryDistribution(filters: {
    startDate?: string;
    endDate?: string;
    platform?: string;
  }) {
    const query: any = {};
    if (filters.startDate || filters.endDate) {
      query.reviewDate = {};
      if (filters.startDate) query.reviewDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.reviewDate.$lte = new Date(filters.endDate);
    }
    if (filters.platform && filters.platform !== 'all') {
      query.platform = filters.platform;
    }

    const result = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$primaryCategory',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          negativeCount: {
            $sum: { $cond: [{ $lte: ['$rating', 2] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return result.map(r => ({
      category: r._id,
      count: r.count,
      percentage: Math.round((r.count / total) * 10000) / 100,
      averageRating: Math.round(r.avgRating * 100) / 100,
      negativeCount: r.negativeCount,
    }));
  }

  static async getSentimentTrend(filters: {
    startDate?: string;
    endDate?: string;
    platform?: string;
  }) {
    const query: any = {};
    if (filters.startDate || filters.endDate) {
      query.reviewDate = {};
      if (filters.startDate) query.reviewDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.reviewDate.$lte = new Date(filters.endDate);
    }
    if (filters.platform && filters.platform !== 'all') {
      query.platform = filters.platform;
    }

    const reviews = await Review.find(query).sort({ reviewDate: 1 });
    const trend: Record<string, { positive: number; neutral: number; negative: number; total: number }> = {};

    reviews.forEach(r => {
      const date = new Date(r.reviewDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!trend[key]) {
        trend[key] = { positive: 0, neutral: 0, negative: 0, total: 0 };
      }
      trend[key][r.sentiment]++;
      trend[key].total++;
    });

    return Object.entries(trend).map(([month, data]) => ({
      month,
      positive: data.positive,
      neutral: data.neutral,
      negative: data.negative,
      total: data.total,
      positiveShare: Math.round((data.positive / data.total) * 100),
      neutralShare: Math.round((data.neutral / data.total) * 100),
      negativeShare: Math.round((data.negative / data.total) * 100),
    }));
  }
}

export class ReviewService {
  static async getReviews(filters: {
    page?: number;
    limit?: number;
    rating?: string;
    platform?: string;
    sentiment?: string;
    category?: string;
    severity?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query: any = {};
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);

    if (filters.rating) {
      const ratings = filters.rating.split(',').map(Number);
      query.rating = { $in: ratings };
    }
    if (filters.platform && filters.platform !== 'all') {
      query.platform = filters.platform;
    }
    if (filters.sentiment) {
      query.sentiment = filters.sentiment;
    }
    if (filters.category) {
      query.primaryCategory = filters.category;
    }
    if (filters.severity) {
      query.severity = filters.severity;
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.startDate || filters.endDate) {
      query.reviewDate = {};
      if (filters.startDate) query.reviewDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.reviewDate.$lte = new Date(filters.endDate);
    }

    const sortField = filters.sortBy || 'reviewDate';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  static async getById(id: string) {
    return Review.findOne({ reviewId: id });
  }

  static async updateClassification(id: string, classification: {
    sentiment?: string;
    primaryCategory?: string;
    severity?: string;
    notes?: string;
  }) {
    return Review.findOneAndUpdate(
      { reviewId: id },
      {
        $set: {
          manualClassification: {
            ...classification,
            overriddenAt: new Date(),
          },
          ...(classification.sentiment && { sentiment: classification.sentiment }),
          ...(classification.primaryCategory && { primaryCategory: classification.primaryCategory }),
          ...(classification.severity && { severity: classification.severity }),
        },
      },
      { new: true }
    );
  }
}

export class IssueService {
  static async getIssues(filters?: { status?: string; severity?: string; category?: string }) {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.severity) query.severity = filters.severity;
    if (filters?.category) query.category = filters.category;

    return Issue.find(query).sort({ priorityScore: -1 });
  }

  static async getById(id: string) {
    return Issue.findOne({ issueId: id });
  }

  static async create(data: any) {
    // Calculate priority score
    data.priorityScore = Math.round(
      (data.frequencyScore || 50) * 0.25 +
      (data.impactScore || 50) * 0.30 +
      (data.trendScore || 50) * 0.20 +
      (data.confidenceScore || 50) * 0.15 +
      (data.severity === 'critical' ? 90 : data.severity === 'high' ? 70 : data.severity === 'medium' ? 50 : 30) * 0.10
    );
    return Issue.create(data);
  }

  static async update(id: string, data: any) {
    if (data.frequencyScore !== undefined || data.impactScore !== undefined ||
      data.trendScore !== undefined || data.confidenceScore !== undefined || data.severity !== undefined) {
      const existing = await Issue.findOne({ issueId: id });
      if (existing) {
        const freq = data.frequencyScore ?? existing.frequencyScore;
        const impact = data.impactScore ?? existing.impactScore;
        const trend = data.trendScore ?? existing.trendScore;
        const conf = data.confidenceScore ?? existing.confidenceScore;
        const sev = data.severity ?? existing.severity;
        data.priorityScore = Math.round(
          freq * 0.25 +
          impact * 0.30 +
          trend * 0.20 +
          conf * 0.15 +
          (sev === 'critical' ? 90 : sev === 'high' ? 70 : sev === 'medium' ? 50 : 30) * 0.10
        );
      }
    }
    return Issue.findOneAndUpdate({ issueId: id }, { $set: data }, { new: true });
  }

  static async generateTask(issueId: string) {
    const issue = await Issue.findOne({ issueId });
    if (!issue) return null;

    const taskCount = await Task.countDocuments();
    const taskId = `TASK-${String(taskCount + 1).padStart(3, '0')}`;

    const priority = issue.priorityScore >= 75 ? 'P0' :
      issue.priorityScore >= 55 ? 'P1' :
        issue.priorityScore >= 35 ? 'P2' : 'P3';

    const task = await Task.create({
      taskId,
      linkedIssueId: issueId,
      title: `Fix: ${issue.title}`,
      description: issue.description,
      priority,
      status: 'backlog',
      effort: issue.severity === 'critical' ? 'large' : issue.severity === 'high' ? 'medium' : 'small',
      acceptanceCriteria: issue.acceptanceCriteria,
      testCases: [],
      releaseVersion: '',
      rollbackPlan: '',
      successMetrics: issue.monitoringMetrics,
      stepsToReproduce: [],
      expectedBehavior: '',
      actualBehavior: '',
      technicalInvestigation: issue.rootCauseHypotheses.join('\n'),
      proposedFix: issue.recommendedFix,
      observabilityRequirements: issue.monitoringMetrics,
    });

    return task;
  }
}

export class TaskService {
  static async getTasks(filters?: { status?: string; priority?: string }) {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    return Task.find(query).sort({ createdAt: -1 });
  }

  static async create(data: any) {
    const count = await Task.countDocuments();
    data.taskId = data.taskId || `TASK-${String(count + 1).padStart(3, '0')}`;
    return Task.create(data);
  }

  static async update(id: string, data: any) {
    return Task.findOneAndUpdate({ taskId: id }, { $set: data }, { new: true });
  }
}

export class ExperimentService {
  static async getExperiments() {
    return Experiment.find().sort({ createdAt: -1 });
  }

  static async create(data: any) {
    const count = await Experiment.countDocuments();
    data.experimentId = data.experimentId || `EXP-${String(count + 1).padStart(3, '0')}`;
    return Experiment.create(data);
  }

  static async update(id: string, data: any) {
    return Experiment.findOneAndUpdate({ experimentId: id }, { $set: data }, { new: true });
  }
}

export class DataSourceService {
  static async getStatus() {
    const totalReviews = await Review.countDocuments();
    const demoReviews = await Review.countDocuments({ isDemo: true });
    const importedReviews = totalReviews - demoReviews;
    const latestReview = await Review.findOne().sort({ createdAt: -1 });

    return {
      sources: [
        {
          name: 'Demo Dataset',
          platform: 'mixed',
          status: demoReviews > 0 ? 'demo_data' : 'import_required',
          recordCount: demoReviews,
          lastImport: latestReview?.createdAt || null,
          coverage: 'Last 6 months (illustrative)',
        },
        {
          name: 'CSV Import',
          platform: 'mixed',
          status: importedReviews > 0 ? 'connected' : 'import_required',
          recordCount: importedReviews,
          lastImport: null,
          coverage: importedReviews > 0 ? 'User-imported data' : 'No data imported yet',
        },
      ],
      totalReviews,
      demoReviews,
      importedReviews,
    };
  }
}

/** Provides in-memory fallback data when MongoDB is unavailable */
export class InMemoryService {
  private static cachedReviews: any[] | null = null;
  private static cachedIssues: any[] | null = null;
  private static cachedTasks: any[] | null = null;
  private static cachedExperiments: any[] | null = null;

  static getReviews() {
    if (!this.cachedReviews) {
      this.cachedReviews = generateSeedReviews(250);
    }
    return this.cachedReviews;
  }

  static getIssues() {
    if (!this.cachedIssues) {
      const issues = generateSeedIssues();
      issues.forEach(issue => {
        issue.priorityScore = Math.round(
          issue.frequencyScore * 0.25 +
          issue.impactScore * 0.30 +
          issue.trendScore * 0.20 +
          issue.confidenceScore * 0.15 +
          (issue.severity === 'critical' ? 90 : issue.severity === 'high' ? 70 : issue.severity === 'medium' ? 50 : 30) * 0.10
        );
      });
      this.cachedIssues = issues;
    }
    return this.cachedIssues;
  }

  static getTasks() {
    if (!this.cachedTasks) {
      this.cachedTasks = generateSeedTasks();
    }
    return this.cachedTasks;
  }

  static getExperiments() {
    if (!this.cachedExperiments) {
      this.cachedExperiments = generateSeedExperiments();
    }
    return this.cachedExperiments;
  }
}
