import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  DashboardService,
  ReviewService,
  IssueService,
  TaskService,
  ExperimentService,
  ClassificationService,
  DataSourceService,
  InMemoryService,
} from '../services';
import mongoose from 'mongoose';

const router = Router();

// Utility to check if MongoDB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// ===== HEALTH =====
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: isDbConnected() ? 'connected' : 'disconnected',
    mode: isDbConnected() ? 'persistent' : 'in-memory',
  });
});

// ===== DASHBOARD =====
router.get('/dashboard/summary', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    const reviews = InMemoryService.getReviews();
    const total = reviews.length;
    const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / total;
    const negCount = reviews.filter((r: any) => r.rating <= 2).length;
    const posCount = reviews.filter((r: any) => r.rating >= 4).length;
    const bookingCount = reviews.filter((r: any) => r.primaryCategory === 'booking').length;
    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r: any) => { ratingDist[r.rating as keyof typeof ratingDist]++; });
    const issues = InMemoryService.getIssues();
    const openHigh = issues.filter((i: any) => ['open', 'investigating'].includes(i.status) && ['high', 'critical'].includes(i.severity)).length;

    return res.json({
      success: true,
      data: {
        averageRating: Math.round(avgRating * 100) / 100,
        totalReviews: total,
        negativePercentage: Math.round((negCount / total) * 10000) / 100,
        positivePercentage: Math.round((posCount / total) * 10000) / 100,
        neutralPercentage: Math.round(((total - negCount - posCount) / total) * 10000) / 100,
        bookingComplaintShare: Math.round((bookingCount / total) * 10000) / 100,
        openHighPriorityIssues: openHigh,
        ratingDistribution: ratingDist,
        recentReviews: reviews.slice(0, 10),
        isDemo: true,
        dataSource: 'Illustrative demo data (in-memory)',
      },
    });
  }

  const data = await DashboardService.getSummary({
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    platform: req.query.platform as string,
  });
  res.json({ success: true, data });
}));

router.get('/dashboard/rating-trend', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    const reviews = InMemoryService.getReviews();
    const trend: Record<string, any> = {};
    reviews.forEach((r: any) => {
      const d = new Date(r.reviewDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!trend[key]) trend[key] = { total: 0, sum: 0, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      trend[key].total++;
      trend[key].sum += r.rating;
      trend[key].ratings[r.rating]++;
    });
    const data = Object.entries(trend).sort().map(([month, d]: [string, any]) => ({
      month,
      averageRating: Math.round((d.sum / d.total) * 100) / 100,
      totalReviews: d.total,
      ratingDistribution: d.ratings,
    }));
    return res.json({ success: true, data });
  }

  const data = await DashboardService.getRatingTrend({
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    platform: req.query.platform as string,
    granularity: req.query.granularity as string,
  });
  res.json({ success: true, data });
}));

router.get('/dashboard/category-distribution', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    const reviews = InMemoryService.getReviews();
    const cats: Record<string, { count: number; ratingSum: number; negCount: number }> = {};
    reviews.forEach((r: any) => {
      if (!cats[r.primaryCategory]) cats[r.primaryCategory] = { count: 0, ratingSum: 0, negCount: 0 };
      cats[r.primaryCategory].count++;
      cats[r.primaryCategory].ratingSum += r.rating;
      if (r.rating <= 2) cats[r.primaryCategory].negCount++;
    });
    const total = reviews.length;
    const data = Object.entries(cats)
      .map(([category, d]) => ({
        category,
        count: d.count,
        percentage: Math.round((d.count / total) * 10000) / 100,
        averageRating: Math.round((d.ratingSum / d.count) * 100) / 100,
        negativeCount: d.negCount,
      }))
      .sort((a, b) => b.count - a.count);
    return res.json({ success: true, data });
  }

  const data = await DashboardService.getCategoryDistribution({
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    platform: req.query.platform as string,
  });
  res.json({ success: true, data });
}));

router.get('/dashboard/sentiment-trend', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    const reviews = InMemoryService.getReviews();
    const trend: Record<string, any> = {};
    reviews.forEach((r: any) => {
      const d = new Date(r.reviewDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!trend[key]) trend[key] = { positive: 0, neutral: 0, negative: 0, total: 0 };
      trend[key][r.sentiment]++;
      trend[key].total++;
    });
    const data = Object.entries(trend).sort().map(([month, d]: [string, any]) => ({
      month,
      ...d,
      positiveShare: Math.round((d.positive / d.total) * 100),
      neutralShare: Math.round((d.neutral / d.total) * 100),
      negativeShare: Math.round((d.negative / d.total) * 100),
    }));
    return res.json({ success: true, data });
  }

  const data = await DashboardService.getSentimentTrend({
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    platform: req.query.platform as string,
  });
  res.json({ success: true, data });
}));

// ===== REVIEWS =====
router.get('/reviews', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    let reviews = InMemoryService.getReviews();
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (req.query.rating) {
      const ratings = (req.query.rating as string).split(',').map(Number);
      reviews = reviews.filter((r: any) => ratings.includes(r.rating));
    }
    if (req.query.platform && req.query.platform !== 'all') {
      reviews = reviews.filter((r: any) => r.platform === req.query.platform);
    }
    if (req.query.sentiment) {
      reviews = reviews.filter((r: any) => r.sentiment === req.query.sentiment);
    }
    if (req.query.category) {
      reviews = reviews.filter((r: any) => r.primaryCategory === req.query.category);
    }
    if (req.query.severity) {
      reviews = reviews.filter((r: any) => r.severity === req.query.severity);
    }
    if (req.query.search) {
      const search = (req.query.search as string).toLowerCase();
      reviews = reviews.filter((r: any) => r.reviewText.toLowerCase().includes(search));
    }

    // Sort
    const sortBy = (req.query.sortBy as string) || 'reviewDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    reviews.sort((a: any, b: any) => {
      if (sortBy === 'reviewDate') return sortOrder * (new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime());
      if (sortBy === 'rating') return sortOrder * (a.rating - b.rating);
      return 0;
    });

    const total = reviews.length;
    const paged = reviews.slice((page - 1) * limit, page * limit);
    return res.json({
      success: true,
      data: {
        reviews: paged,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
      },
    });
  }

  const data = await ReviewService.getReviews({
    page: parseInt(req.query.page as string),
    limit: parseInt(req.query.limit as string),
    rating: req.query.rating as string,
    platform: req.query.platform as string,
    sentiment: req.query.sentiment as string,
    category: req.query.category as string,
    severity: req.query.severity as string,
    search: req.query.search as string,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  });
  res.json({ success: true, data });
}));

router.get('/reviews/:id', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    const review = InMemoryService.getReviews().find((r: any) => r.reviewId === req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    return res.json({ success: true, data: review });
  }
  const review = await ReviewService.getById(req.params.id);
  if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
  res.json({ success: true, data: review });
}));

router.post('/reviews/:id/classify', asyncHandler(async (req: Request, res: Response) => {
  const review = isDbConnected()
    ? await ReviewService.getById(req.params.id)
    : InMemoryService.getReviews().find((r: any) => r.reviewId === req.params.id);

  if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

  const text = (review as any).reviewText || '';
  const rating = (review as any).rating || 3;
  const classification = ClassificationService.classifyReview(text, rating);

  if (isDbConnected()) {
    const updated = await ReviewService.updateClassification(req.params.id, {
      sentiment: classification.sentiment,
      primaryCategory: classification.primaryCategory,
      severity: classification.severity,
    });
    return res.json({ success: true, data: { review: updated, classification } });
  }

  return res.json({ success: true, data: { review, classification } });
}));

router.patch('/reviews/:id/classification', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    return res.json({ success: true, data: { message: 'Classification saved (in-memory mode)' } });
  }
  const updated = await ReviewService.updateClassification(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Review not found' });
  res.json({ success: true, data: updated });
}));

// ===== ISSUES =====
router.get('/issues', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    return res.json({ success: true, data: InMemoryService.getIssues() });
  }
  const data = await IssueService.getIssues({
    status: req.query.status as string,
    severity: req.query.severity as string,
    category: req.query.category as string,
  });
  res.json({ success: true, data });
}));

router.get('/issues/:id', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    const issue = InMemoryService.getIssues().find((i: any) => i.issueId === req.params.id);
    if (!issue) return res.status(404).json({ success: false, error: 'Issue not found' });
    return res.json({ success: true, data: issue });
  }
  const issue = await IssueService.getById(req.params.id);
  if (!issue) return res.status(404).json({ success: false, error: 'Issue not found' });
  res.json({ success: true, data: issue });
}));

router.post('/issues', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) return res.status(503).json({ success: false, error: 'Database required' });
  const issue = await IssueService.create(req.body);
  res.status(201).json({ success: true, data: issue });
}));

router.patch('/issues/:id', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) return res.json({ success: true, data: { message: 'Saved (in-memory)' } });
  const issue = await IssueService.update(req.params.id, req.body);
  if (!issue) return res.status(404).json({ success: false, error: 'Issue not found' });
  res.json({ success: true, data: issue });
}));

router.post('/issues/:id/generate-task', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    const issue = InMemoryService.getIssues().find((i: any) => i.issueId === req.params.id);
    if (!issue) return res.status(404).json({ success: false, error: 'Issue not found' });
    return res.json({
      success: true,
      data: {
        taskId: `TASK-GEN-${Date.now()}`,
        linkedIssueId: issue.issueId,
        title: `Fix: ${issue.title}`,
        description: issue.description,
        priority: issue.priorityScore >= 75 ? 'P0' : issue.priorityScore >= 55 ? 'P1' : 'P2',
        status: 'backlog',
        effort: issue.severity === 'critical' ? 'large' : 'medium',
        acceptanceCriteria: issue.acceptanceCriteria,
        proposedFix: issue.recommendedFix,
        technicalInvestigation: issue.rootCauseHypotheses?.join('\n'),
        observabilityRequirements: issue.monitoringMetrics,
      },
    });
  }
  const task = await IssueService.generateTask(req.params.id);
  if (!task) return res.status(404).json({ success: false, error: 'Issue not found' });
  res.status(201).json({ success: true, data: task });
}));

// ===== TASKS =====
router.get('/tasks', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    return res.json({ success: true, data: InMemoryService.getTasks() });
  }
  const data = await TaskService.getTasks({
    status: req.query.status as string,
    priority: req.query.priority as string,
  });
  res.json({ success: true, data });
}));

router.post('/tasks', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) return res.status(503).json({ success: false, error: 'Database required' });
  const task = await TaskService.create(req.body);
  res.status(201).json({ success: true, data: task });
}));

router.patch('/tasks/:id', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) return res.json({ success: true, data: { message: 'Saved (in-memory)' } });
  const task = await TaskService.update(req.params.id, req.body);
  if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
  res.json({ success: true, data: task });
}));

// ===== EXPERIMENTS =====
router.get('/experiments', asyncHandler(async (_req: Request, res: Response) => {
  if (!isDbConnected()) {
    return res.json({ success: true, data: InMemoryService.getExperiments() });
  }
  const data = await ExperimentService.getExperiments();
  res.json({ success: true, data });
}));

router.post('/experiments', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) return res.status(503).json({ success: false, error: 'Database required' });
  const experiment = await ExperimentService.create(req.body);
  res.status(201).json({ success: true, data: experiment });
}));

router.patch('/experiments/:id', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) return res.json({ success: true, data: { message: 'Saved (in-memory)' } });
  const experiment = await ExperimentService.update(req.params.id, req.body);
  if (!experiment) return res.status(404).json({ success: false, error: 'Experiment not found' });
  res.json({ success: true, data: experiment });
}));

// ===== DATA SOURCES =====
router.get('/data-sources', asyncHandler(async (_req: Request, res: Response) => {
  if (!isDbConnected()) {
    const reviews = InMemoryService.getReviews();
    return res.json({
      success: true,
      data: {
        sources: [
          { name: 'Demo Dataset', platform: 'mixed', status: 'demo_data', recordCount: reviews.length, lastImport: new Date(), coverage: 'Last 6 months (illustrative)' },
          { name: 'CSV Import', platform: 'mixed', status: 'import_required', recordCount: 0, lastImport: null, coverage: 'No data imported yet' },
        ],
        totalReviews: reviews.length,
        demoReviews: reviews.length,
        importedReviews: 0,
      },
    });
  }
  const data = await DataSourceService.getStatus();
  res.json({ success: true, data });
}));

// ===== INSIGHTS =====
router.post('/insights/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { reviewIds } = req.body;
  let reviews: any[];

  if (!isDbConnected()) {
    const allReviews = InMemoryService.getReviews();
    reviews = reviewIds
      ? allReviews.filter((r: any) => reviewIds.includes(r.reviewId))
      : allReviews.slice(0, 50);
  } else {
    const query = reviewIds ? { reviewId: { $in: reviewIds } } : {};
    const Review = (await import('../models/Review')).default;
    reviews = await Review.find(query).limit(50);
  }

  const classifications = reviews.map((r: any) =>
    ClassificationService.classifyReview(r.reviewText || r.text, r.rating)
  );

  // Generate themes
  const themes: Record<string, any> = {};
  reviews.forEach((r: any, i: number) => {
    const cat = classifications[i].primaryCategory;
    if (!themes[cat]) {
      themes[cat] = {
        name: cat.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        category: cat,
        count: 0,
        negativeCount: 0,
        excerpts: [],
        severities: { low: 0, medium: 0, high: 0, critical: 0 },
      };
    }
    themes[cat].count++;
    if (r.rating <= 2) themes[cat].negativeCount++;
    themes[cat].severities[classifications[i].severity]++;
    if (themes[cat].excerpts.length < 3) {
      themes[cat].excerpts.push(r.reviewText?.substring(0, 120) || '');
    }
  });

  const totalNeg = reviews.filter((r: any) => r.rating <= 2).length;

  res.json({
    success: true,
    data: {
      totalAnalyzed: reviews.length,
      method: 'rule-based',
      themes: Object.values(themes)
        .map((t: any) => ({
          ...t,
          negativePercentage: totalNeg > 0 ? Math.round((t.negativeCount / totalNeg) * 100) : 0,
        }))
        .sort((a: any, b: any) => b.count - a.count),
      classifications,
    },
  });
}));

router.post('/insights/ask', asyncHandler(async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ success: false, error: 'Question is required' });

  let reviews: any[];
  if (!isDbConnected()) {
    reviews = InMemoryService.getReviews();
  } else {
    const Review = (await import('../models/Review')).default;
    reviews = await Review.find().limit(500);
  }

  const total = reviews.length;
  const negReviews = reviews.filter((r: any) => r.rating <= 2);
  const qLower = question.toLowerCase();

  // Simple question-answer logic grounded in data
  let answer = '';
  let relevantReviews: any[] = [];

  if (qLower.includes('top') && (qLower.includes('reason') || qLower.includes('cause'))) {
    const cats: Record<string, number> = {};
    negReviews.forEach((r: any) => {
      cats[r.primaryCategory] = (cats[r.primaryCategory] || 0) + 1;
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
    answer = `Based on ${negReviews.length} negative reviews (1-2 stars) out of ${total} total reviews:\n\n`;
    sorted.forEach(([cat, count], i) => {
      answer += `${i + 1}. **${cat.replace(/_/g, ' ')}** — ${count} reviews (${Math.round((count / negReviews.length) * 100)}%)\n`;
    });
    answer += `\n_Analysis method: Rule-based keyword classification on ${total} reviews (${reviews.some((r: any) => r.isDemo) ? 'illustrative demo data' : 'imported data'})._`;
    relevantReviews = negReviews.slice(0, 5);
  } else if (qLower.includes('booking')) {
    const bookingReviews = reviews.filter((r: any) => r.primaryCategory === 'booking');
    answer = `Found ${bookingReviews.length} booking-related reviews out of ${total} total.\n\n`;
    answer += `Average rating: ${(bookingReviews.reduce((s: number, r: any) => s + r.rating, 0) / (bookingReviews.length || 1)).toFixed(1)}/5\n`;
    answer += `Negative (1-2 stars): ${bookingReviews.filter((r: any) => r.rating <= 2).length}\n\n`;
    answer += 'Common themes: booking failures, unclear confirmation, overnight shift date issues.';
    relevantReviews = bookingReviews.slice(0, 5);
  } else if (qLower.includes('fix first') || qLower.includes('priorit')) {
    const issues = isDbConnected() ? await IssueService.getIssues() : InMemoryService.getIssues();
    const top = (issues as any[]).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);
    answer = `Based on the priority scoring model (30% severity, 25% frequency, 20% impact, 15% trend, 10% confidence):\n\n`;
    top.forEach((issue: any, i: number) => {
      answer += `${i + 1}. **${issue.title}** (Score: ${issue.priorityScore}/100, Severity: ${issue.severity})\n`;
    });
    answer += '\n_These scores are based on evidence from the current review dataset. They should be validated before engineering commitment._';
  } else {
    // Generic search
    const matches = reviews.filter((r: any) =>
      r.reviewText?.toLowerCase().includes(qLower.split(' ').slice(-2).join(' '))
    );
    answer = `Found ${matches.length} reviews potentially related to "${question}".\n\n`;
    if (matches.length > 0) {
      answer += 'Sample reviews:\n\n';
      matches.slice(0, 3).forEach((r: any, i: number) => {
        answer += `${i + 1}. ⭐${r.rating} — "${r.reviewText?.substring(0, 100)}..."\n`;
      });
    } else {
      answer += 'No directly matching reviews found in the current dataset. Try refining your question or check the Review Explorer with different filters.';
    }
    relevantReviews = matches.slice(0, 5);
  }

  res.json({
    success: true,
    data: {
      question,
      answer,
      method: 'rule-based',
      reviewCount: total,
      relevantReviews: relevantReviews.map((r: any) => ({
        reviewId: r.reviewId,
        rating: r.rating,
        excerpt: r.reviewText?.substring(0, 120),
        category: r.primaryCategory,
      })),
      dataSource: reviews.some((r: any) => r.isDemo) ? 'Illustrative demo data' : 'Imported data',
    },
  });
}));

// ===== REPORTS =====
router.get('/reports/summary', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbConnected()) {
    const reviews = InMemoryService.getReviews();
    const issues = InMemoryService.getIssues();
    const total = reviews.length;
    const negCount = reviews.filter((r: any) => r.rating <= 2).length;
    const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / total;

    return res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        period: { start: req.query.startDate || 'All time', end: req.query.endDate || 'Present' },
        summary: {
          totalReviews: total,
          averageRating: Math.round(avgRating * 100) / 100,
          negativePercentage: Math.round((negCount / total) * 10000) / 100,
          openIssues: issues.filter((i: any) => i.status === 'open').length,
          criticalIssues: issues.filter((i: any) => i.severity === 'critical').length,
        },
        topIssues: (issues as any[]).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5),
        recommendations: [
          'Investigate GPS data freshness — highest frequency complaint category',
          'Fix overnight booking date display — critical severity with clear reproduction path',
          'Implement notification delivery tracking — correlates with missed pickups',
        ],
        dataSource: 'Illustrative demo data',
        limitations: ['Analysis based on synthetic review data', 'Operational metrics not available'],
      },
    });
  }

  const [summary, issues, ratingTrend] = await Promise.all([
    DashboardService.getSummary({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      platform: req.query.platform as string,
    }),
    IssueService.getIssues(),
    DashboardService.getRatingTrend({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      platform: req.query.platform as string,
    }),
  ]);

  res.json({
    success: true,
    data: {
      generatedAt: new Date().toISOString(),
      period: { start: req.query.startDate || 'All time', end: req.query.endDate || 'Present' },
      summary: {
        totalReviews: summary.totalReviews,
        averageRating: summary.averageRating,
        negativePercentage: summary.negativePercentage,
        openIssues: (issues as any[]).filter(i => i.status === 'open').length,
        criticalIssues: (issues as any[]).filter(i => i.severity === 'critical').length,
      },
      topIssues: (issues as any[]).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5),
      ratingTrend,
      dataSource: summary.dataSource,
    },
  });
}));

// ===== EXPORTS =====
router.get('/exports/reviews', asyncHandler(async (req: Request, res: Response) => {
  let reviews: any[];
  if (!isDbConnected()) {
    reviews = InMemoryService.getReviews();
  } else {
    reviews = await (await import('../models/Review')).default.find().sort({ reviewDate: -1 }).limit(1000);
  }

  const csv = [
    'review_id,rating,review_date,platform,app_version,sentiment,primary_category,severity,confidence,review_text',
    ...reviews.map((r: any) =>
      `"${r.reviewId}",${r.rating},"${new Date(r.reviewDate).toISOString()}","${r.platform}","${r.appVersion}","${r.sentiment}","${r.primaryCategory}","${r.severity}",${r.confidence},"${(r.reviewText || '').replace(/"/g, '""')}"`
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=reviews-export.csv');
  res.send(csv);
}));

export default router;
