import { v4 as uuidv4 } from 'uuid';

// Deterministic seed data generator for MoveInSync Pulse demo
// All data is synthetic and illustrative — not real customer reviews

const CATEGORIES = [
  'booking', 'gps_eta', 'notifications', 'pickup_timing',
  'routing', 'check_in_no_show', 'support', 'usability',
  'safety', 'performance', 'general_positive', 'other',
] as const;

const PLATFORMS = ['google_play', 'app_store'] as const;
const VERSIONS = ['4.2.1', '4.2.0', '4.1.9', '4.1.8', '4.1.7', '4.1.5', '4.1.3'];
const LANGUAGES = ['en', 'en', 'en', 'en', 'hi', 'te', 'kn', 'ta'];

// Seeded pseudo-random number generator for determinism
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface ReviewTemplate {
  text: string;
  rating: number;
  category: typeof CATEGORIES[number];
  secondary?: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const reviewTemplates: ReviewTemplate[] = [
  // === BOOKING ISSUES ===
  { text: "Tried to book my ride for morning shift but it kept saying 'booking failed'. Had to try 5 times before it went through. Very frustrating when you're rushing for work.", rating: 1, category: 'booking', sentiment: 'negative', severity: 'high' },
  { text: "The booking confirmation screen is very confusing. I can't tell if my ride is actually confirmed or still pending. The status keeps showing different things.", rating: 2, category: 'booking', secondary: ['usability'], sentiment: 'negative', severity: 'high' },
  { text: "Booking for overnight shift shows wrong date. I book for tonight but it shows tomorrow's date. Had to contact support to fix it.", rating: 1, category: 'booking', secondary: ['support'], sentiment: 'negative', severity: 'critical' },
  { text: "Cannot cancel my ride after booking. The cancel button does nothing when I tap it. I'm stuck with a booking I don't need.", rating: 1, category: 'booking', secondary: ['usability'], sentiment: 'negative', severity: 'high' },
  { text: "App doesn't show available time slots for my shift properly. Some slots appear greyed out even though they should be available.", rating: 2, category: 'booking', sentiment: 'negative', severity: 'medium' },
  { text: "Booked a ride for 9 AM but received confirmation for 9 PM. This is dangerous — I could be stranded at night.", rating: 1, category: 'booking', secondary: ['safety'], sentiment: 'negative', severity: 'critical' },
  { text: "The app logs me out every time I try to book. I have to login again and again. By the time I log in, my preferred slot is gone.", rating: 1, category: 'booking', secondary: ['performance'], sentiment: 'negative', severity: 'high' },
  { text: "Booking works fine most of the time but occasionally freezes on the confirmation screen. Restarting the app fixes it.", rating: 3, category: 'booking', secondary: ['performance'], sentiment: 'neutral', severity: 'medium' },
  { text: "Ride booking is smooth and I get immediate confirmation. The slot selection for my shift timing is very convenient.", rating: 5, category: 'general_positive', sentiment: 'positive', severity: 'low' },

  // === GPS / ETA ISSUES ===
  { text: "The GPS location shown in the app is completely wrong. It showed my cab 2km away when the driver called and said he was outside my gate.", rating: 1, category: 'gps_eta', sentiment: 'negative', severity: 'high' },
  { text: "ETA keeps jumping around — first it says 5 minutes, then 15, then 3. I never know when to go downstairs and end up waiting in the cold.", rating: 2, category: 'gps_eta', secondary: ['pickup_timing'], sentiment: 'negative', severity: 'high' },
  { text: "The live tracking shows the vehicle is stationary but I can hear it's moving. The location data seems stale or delayed by several minutes.", rating: 2, category: 'gps_eta', sentiment: 'negative', severity: 'high' },
  { text: "Vehicle location on map doesn't update in real time. The dot jumps every 30-40 seconds instead of showing smooth movement. Makes it hard to judge when to step out.", rating: 2, category: 'gps_eta', secondary: ['usability'], sentiment: 'negative', severity: 'medium' },
  { text: "Showed ETA as 10 min but driver arrived in 25 min. This happens regularly. The ETA calculation doesn't seem to account for traffic.", rating: 2, category: 'gps_eta', sentiment: 'negative', severity: 'high' },
  { text: "Sometimes the map shows the vehicle going in circles or on a completely different road. The GPS data quality is very poor.", rating: 1, category: 'gps_eta', secondary: ['routing'], sentiment: 'negative', severity: 'high' },
  { text: "After the latest update, the map doesn't even load half the time. I see a blank screen where the tracking map should be.", rating: 1, category: 'gps_eta', secondary: ['performance'], sentiment: 'negative', severity: 'critical' },

  // === NOTIFICATIONS ===
  { text: "Never received the notification that my ride was arriving. Missed the pickup because I was not aware the cab was at my location.", rating: 1, category: 'notifications', secondary: ['check_in_no_show'], sentiment: 'negative', severity: 'critical' },
  { text: "Notifications come too late. I get the 'your ride is arriving' notification after the vehicle has already left. What's the point?", rating: 1, category: 'notifications', secondary: ['pickup_timing'], sentiment: 'negative', severity: 'high' },
  { text: "I get duplicate notifications for every update. My phone buzzes 3-4 times for the same event. Very annoying during meetings.", rating: 2, category: 'notifications', secondary: ['usability'], sentiment: 'negative', severity: 'medium' },
  { text: "Push notifications stopped working after the latest update. I have to keep opening the app to check status.", rating: 2, category: 'notifications', secondary: ['performance'], sentiment: 'negative', severity: 'high' },
  { text: "Notification sounds can't be customized. The default sound is too quiet and I miss alerts, especially at night shifts.", rating: 3, category: 'notifications', secondary: ['usability'], sentiment: 'neutral', severity: 'low' },

  // === PICKUP TIMING ===
  { text: "My pickup time was changed without any notification. I was waiting at 7:30 AM but the cab came at 7:00 AM and left without me.", rating: 1, category: 'pickup_timing', secondary: ['notifications', 'check_in_no_show'], sentiment: 'negative', severity: 'critical' },
  { text: "The scheduled pickup time doesn't match my actual shift time. There's always a 30-minute gap that I have to waste at office.", rating: 2, category: 'pickup_timing', sentiment: 'negative', severity: 'medium' },
  { text: "Cab arrived 25 minutes late for morning pickup. No explanation, no updated ETA. I was late to work because of this.", rating: 1, category: 'pickup_timing', secondary: ['gps_eta'], sentiment: 'negative', severity: 'high' },
  { text: "The pickup window is too narrow. If I'm even 1 minute late, the cab leaves. But the cab can be 20 minutes late and there's no accountability.", rating: 2, category: 'pickup_timing', secondary: ['check_in_no_show'], sentiment: 'negative', severity: 'high' },
  { text: "Early morning pickup at 5 AM is always on time. Really appreciate the reliability for night shift workers.", rating: 5, category: 'general_positive', secondary: ['pickup_timing'], sentiment: 'positive', severity: 'low' },

  // === ROUTING ISSUES ===
  { text: "Driver took a completely wrong route and I was 45 minutes late to office. The app's navigation led him through heavy traffic areas.", rating: 1, category: 'routing', sentiment: 'negative', severity: 'high' },
  { text: "Pickup point shown in the app is at a location I can't access. It's on the other side of a highway with no crossing. Very unsafe to walk there.", rating: 1, category: 'routing', secondary: ['safety'], sentiment: 'negative', severity: 'critical' },
  { text: "The route optimization seems to have gotten worse. My commute used to be 30 min but now it's 50+ because of extra pickups added.", rating: 2, category: 'routing', sentiment: 'negative', severity: 'medium' },
  { text: "Drop-off point is 500 meters from my actual office gate. In rain, this is terrible. Can't the system figure out the correct drop point?", rating: 2, category: 'routing', secondary: ['usability'], sentiment: 'negative', severity: 'medium' },
  { text: "Route was efficient today. Only 3 stops and all were near my area. Good route planning.", rating: 4, category: 'general_positive', secondary: ['routing'], sentiment: 'positive', severity: 'low' },

  // === CHECK-IN / NO-SHOW ===
  { text: "Got marked as no-show even though I was standing right at the pickup point. The driver didn't wait even 2 minutes and left.", rating: 1, category: 'check_in_no_show', sentiment: 'negative', severity: 'critical' },
  { text: "The check-in process is broken. I press the check-in button but it shows an error. Then I get marked as no-show. This has happened 3 times now.", rating: 1, category: 'check_in_no_show', secondary: ['performance'], sentiment: 'negative', severity: 'critical' },
  { text: "OTP verification takes too long. By the time I verify, the driver is getting impatient and other passengers are waiting.", rating: 2, category: 'check_in_no_show', secondary: ['usability'], sentiment: 'negative', severity: 'medium' },
  { text: "Driver marked me as boarded before I even got in the vehicle. The system needs better verification.", rating: 2, category: 'check_in_no_show', secondary: ['safety'], sentiment: 'negative', severity: 'high' },
  { text: "No-show penalty applied even when the cab came 20 min late and I took alternative transport. No way to dispute this in the app.", rating: 1, category: 'check_in_no_show', secondary: ['support'], sentiment: 'negative', severity: 'high' },

  // === SUPPORT ===
  { text: "Raised a complaint 3 days ago about incorrect charges. No response from support. The in-app support is practically useless.", rating: 1, category: 'support', sentiment: 'negative', severity: 'high' },
  { text: "Support team keeps asking the same questions. I've explained my issue 4 times to different agents. No resolution.", rating: 1, category: 'support', sentiment: 'negative', severity: 'high' },
  { text: "The in-app chat support doesn't save conversation history. Every time I open it, I have to re-explain everything.", rating: 2, category: 'support', secondary: ['usability'], sentiment: 'negative', severity: 'medium' },
  { text: "There's no way to report a safety incident quickly through the app. The SOS button is buried in settings.", rating: 1, category: 'support', secondary: ['safety'], sentiment: 'negative', severity: 'critical' },
  { text: "Support was responsive and fixed my booking issue within an hour. Good experience this time.", rating: 4, category: 'support', sentiment: 'positive', severity: 'low' },

  // === USABILITY ===
  { text: "The app UI is very cluttered. Too many options on the home screen and I can never find what I'm looking for quickly.", rating: 2, category: 'usability', sentiment: 'negative', severity: 'medium' },
  { text: "Font size is too small and can't be changed. Hard to read in bright sunlight when waiting at pickup point.", rating: 2, category: 'usability', sentiment: 'negative', severity: 'low' },
  { text: "Dark mode would be really helpful for night shift employees. The bright white screen is blinding at 5 AM.", rating: 3, category: 'usability', sentiment: 'neutral', severity: 'low' },
  { text: "App design is clean and easy to use. I like the simple booking flow.", rating: 4, category: 'general_positive', secondary: ['usability'], sentiment: 'positive', severity: 'low' },
  { text: "The hamburger menu hides important features. I had no idea there was a trip history until someone told me.", rating: 2, category: 'usability', sentiment: 'negative', severity: 'medium' },

  // === SAFETY ===
  { text: "Driver was driving very recklessly — overspeeding and on phone. No way to report this easily in the app during the ride.", rating: 1, category: 'safety', secondary: ['support'], sentiment: 'negative', severity: 'critical' },
  { text: "The driver details don't match the person who arrived. Different name and photo. This is a serious safety concern.", rating: 1, category: 'safety', secondary: ['check_in_no_show'], sentiment: 'negative', severity: 'critical' },
  { text: "I feel safe using the app. Driver verification with OTP gives me confidence that I'm getting in the right vehicle.", rating: 5, category: 'general_positive', secondary: ['safety'], sentiment: 'positive', severity: 'low' },
  { text: "No emergency contact feature that I can find. What if something happens during the ride?", rating: 2, category: 'safety', secondary: ['usability'], sentiment: 'negative', severity: 'high' },

  // === PERFORMANCE ===
  { text: "App crashes every time I open the trip history. I'm on the latest version and have tried reinstalling.", rating: 1, category: 'performance', sentiment: 'negative', severity: 'high' },
  { text: "The app takes 10-15 seconds to load. By the time it opens, I've already missed seeing the driver details.", rating: 2, category: 'performance', sentiment: 'negative', severity: 'medium' },
  { text: "Battery drain is insane. This app uses more battery than any other app on my phone because of constant location tracking.", rating: 2, category: 'performance', secondary: ['gps_eta'], sentiment: 'negative', severity: 'medium' },
  { text: "App runs smoothly after the latest update. Loading times have improved significantly.", rating: 4, category: 'general_positive', secondary: ['performance'], sentiment: 'positive', severity: 'low' },
  { text: "Constant 'Something went wrong' errors. The app is barely usable during peak booking hours.", rating: 1, category: 'performance', secondary: ['booking'], sentiment: 'negative', severity: 'critical' },

  // === POSITIVE EXPERIENCES ===
  { text: "Great service! My daily commute has become so much easier. Pickup is always on time and the drivers are professional.", rating: 5, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "Best corporate transport app I've used. The booking process is simple and I always know when my ride is coming.", rating: 5, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "Love the live tracking feature. I can see exactly where my cab is and plan accordingly. No more guessing.", rating: 5, category: 'general_positive', secondary: ['gps_eta'], sentiment: 'positive', severity: 'low' },
  { text: "The app works well for basic booking. Nothing fancy but gets the job done reliably.", rating: 4, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "Good improvement in the latest version. The new UI is cleaner and the map loads faster.", rating: 4, category: 'general_positive', secondary: ['performance', 'usability'], sentiment: 'positive', severity: 'low' },
  { text: "Consistent and reliable service. Have been using for 2 years and it has improved a lot.", rating: 4, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "Appreciate the ride-sharing feature. It's cost effective and environmentally friendly. Keep it up!", rating: 5, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "Trip roster for the week is very helpful for planning. Wish more features were this thoughtful.", rating: 4, category: 'general_positive', secondary: ['usability'], sentiment: 'positive', severity: 'low' },

  // === ADDITIONAL VARIED REVIEWS ===
  { text: "My ride got cancelled without reason 10 minutes before pickup. Had to take an auto to office at my own expense.", rating: 1, category: 'booking', sentiment: 'negative', severity: 'critical' },
  { text: "The app shows different ETAs on the home screen vs the tracking screen. Which one is correct?", rating: 2, category: 'gps_eta', secondary: ['usability'], sentiment: 'negative', severity: 'medium' },
  { text: "Driver says he called me but I received no call or notification through the app. The in-app calling feature doesn't work.", rating: 2, category: 'notifications', secondary: ['usability'], sentiment: 'negative', severity: 'high' },
  { text: "Very convenient app. I can manage all my office commute bookings from one place.", rating: 5, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "Why is the app asking for camera permission? I don't want to give camera access for a transport app.", rating: 2, category: 'usability', secondary: ['safety'], sentiment: 'negative', severity: 'medium' },
  { text: "Location services drain my battery even when I'm not using the app. Please fix the background location usage.", rating: 2, category: 'performance', secondary: ['gps_eta'], sentiment: 'negative', severity: 'medium' },
  { text: "The app doesn't work offline at all. If my internet drops for a second, I lose my booking details.", rating: 2, category: 'performance', sentiment: 'negative', severity: 'medium' },
  { text: "Had a great experience today. Driver was polite, arrived on time, and the vehicle was clean.", rating: 5, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "The weekly schedule view is broken. It shows Monday twice and Saturday is missing.", rating: 2, category: 'usability', secondary: ['booking'], sentiment: 'negative', severity: 'medium' },
  { text: "Can the app add a feature to rate the driver? I want to appreciate good drivers.", rating: 3, category: 'other', sentiment: 'neutral', severity: 'low' },
  { text: "Ride was smooth and I reached office on time. Thank you MoveInSync team!", rating: 5, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "Vehicle assigned was different from what was shown in the app. The vehicle number didn't match.", rating: 1, category: 'check_in_no_show', secondary: ['safety'], sentiment: 'negative', severity: 'critical' },
  { text: "The estimated time of arrival was 7:30 but the cab arrived at 8:00. This happens at least twice a week.", rating: 2, category: 'pickup_timing', secondary: ['gps_eta'], sentiment: 'negative', severity: 'high' },
  { text: "Routing through very narrow streets that are not suitable for a 12-seater van. Dangerous for passengers.", rating: 1, category: 'routing', secondary: ['safety'], sentiment: 'negative', severity: 'critical' },
  { text: "Good app overall. A few bugs here and there but the core service is reliable. 4 stars for now.", rating: 4, category: 'general_positive', sentiment: 'positive', severity: 'low' },
  { text: "Tried updating my home address but the app says 'invalid location'. My address is perfectly valid on Google Maps.", rating: 2, category: 'usability', secondary: ['gps_eta'], sentiment: 'negative', severity: 'medium' },
  { text: "The trip summary doesn't show the actual route taken. Would help to know why the trip took longer.", rating: 3, category: 'usability', secondary: ['routing'], sentiment: 'neutral', severity: 'low' },
  { text: "Notification about ride cancellation came after I had already reached the pickup point. 20 minutes wasted.", rating: 1, category: 'notifications', secondary: ['booking'], sentiment: 'negative', severity: 'high' },
  { text: "Please add multi-language support. Hindi option would be great for many employees.", rating: 3, category: 'usability', sentiment: 'neutral', severity: 'low' },
  { text: "The panic/SOS button should be more visible. In an emergency, you don't have time to search through menus.", rating: 2, category: 'safety', secondary: ['usability'], sentiment: 'negative', severity: 'critical' },
];

// Additional negative templates for generating varied reviews
const additionalNegativeVariants = [
  { text: "ETA showed cab was 3 minutes away for over 20 minutes. The location tracker is clearly broken.", rating: 1, category: 'gps_eta' as const, sentiment: 'negative' as const, severity: 'high' as const },
  { text: "My booking got auto-cancelled because the app says I didn't confirm. I never got any confirmation prompt!", rating: 1, category: 'booking' as const, secondary: ['notifications'], sentiment: 'negative' as const, severity: 'high' as const },
  { text: "The driver said the app showed my pickup point at a completely different location. We wasted 10 minutes finding each other.", rating: 2, category: 'gps_eta' as const, secondary: ['routing'], sentiment: 'negative' as const, severity: 'high' as const },
  { text: "App shows 'ride in progress' but I was never picked up. Ghost rides shouldn't be possible in 2024.", rating: 1, category: 'check_in_no_show' as const, secondary: ['safety'], sentiment: 'negative' as const, severity: 'critical' as const },
  { text: "The pickup time was changed 3 times in the same morning. First 7:00, then 7:30, then back to 7:15. Make up your mind!", rating: 1, category: 'pickup_timing' as const, secondary: ['notifications'], sentiment: 'negative' as const, severity: 'high' as const },
  { text: "After system maintenance, all my saved locations are gone. Had to re-enter everything. Why don't you back up user data?", rating: 1, category: 'performance' as const, secondary: ['usability'], sentiment: 'negative' as const, severity: 'high' as const },
  { text: "Cannot view past trip details. The history section just shows a loading spinner forever.", rating: 2, category: 'performance' as const, secondary: ['usability'], sentiment: 'negative' as const, severity: 'medium' as const },
  { text: "Cab was overcrowded — 7 people in a vehicle meant for 5. This is unsafe and uncomfortable.", rating: 1, category: 'safety' as const, secondary: ['routing'], sentiment: 'negative' as const, severity: 'critical' as const },
  { text: "Notifications are inconsistent. Some days I get all updates, other days I get nothing. Can't rely on it.", rating: 2, category: 'notifications' as const, sentiment: 'negative' as const, severity: 'high' as const },
  { text: "The app's customer care number just rings and no one picks up. For emergencies, this is unacceptable.", rating: 1, category: 'support' as const, secondary: ['safety'], sentiment: 'negative' as const, severity: 'critical' as const },
  { text: "My ride booking for Saturday showed up as Friday. The date picker has a timezone issue.", rating: 1, category: 'booking' as const, secondary: ['usability'], sentiment: 'negative' as const, severity: 'high' as const },
  { text: "GPS shows the vehicle at my location but I can't see any vehicle around. The GPS accuracy is terrible.", rating: 1, category: 'gps_eta' as const, sentiment: 'negative' as const, severity: 'high' as const },
  { text: "No way to reschedule a booked ride. I have to cancel and rebook, which sometimes means no slots available.", rating: 2, category: 'booking' as const, secondary: ['usability'], sentiment: 'negative' as const, severity: 'medium' as const },
  { text: "The app UI freezes when I scroll through the trip list. Needs serious optimization.", rating: 2, category: 'performance' as const, sentiment: 'negative' as const, severity: 'medium' as const },
  { text: "Got a penalty for 'late cancellation' when my shift was cancelled by my employer. No option to link with shift system.", rating: 1, category: 'booking' as const, secondary: ['support'], sentiment: 'negative' as const, severity: 'high' as const },
  { text: "Vehicle tracking map loads very slowly on 4G. By the time it loads, the cab is already at my location.", rating: 2, category: 'gps_eta' as const, secondary: ['performance'], sentiment: 'negative' as const, severity: 'medium' as const },
  { text: "Support chatbot doesn't understand my queries. Always responds with generic FAQ links that don't help.", rating: 2, category: 'support' as const, secondary: ['usability'], sentiment: 'negative' as const, severity: 'medium' as const },
];

export function generateSeedReviews(count: number = 250): any[] {
  const rand = seededRandom(42);
  const reviews: any[] = [];
  const allTemplates = [...reviewTemplates, ...additionalNegativeVariants];

  // Generate dates spanning last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateRange = now.getTime() - sixMonthsAgo.getTime();

  for (let i = 0; i < count; i++) {
    const template = allTemplates[Math.floor(rand() * allTemplates.length)];
    const reviewDate = new Date(sixMonthsAgo.getTime() + rand() * dateRange);
    const platform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
    const version = VERSIONS[Math.floor(rand() * VERSIONS.length)];
    const language = LANGUAGES[Math.floor(rand() * LANGUAGES.length)];

    // Add slight variations to text
    const textVariations = [
      template.text,
      template.text + (rand() > 0.7 ? ' Please fix this issue.' : ''),
      (rand() > 0.8 ? 'Update: ' : '') + template.text,
    ];
    const text = textVariations[Math.floor(rand() * textVariations.length)];

    // Vary confidence slightly
    const baseConfidence = template.severity === 'critical' ? 0.85 : template.severity === 'high' ? 0.8 : 0.75;
    const confidence = Math.min(0.98, baseConfidence + (rand() * 0.15 - 0.05));

    const aiSummary = generateAiSummary(template);
    const rootCauseHypotheses = generateRootCauses(template.category);
    const recommendedActions = generateRecommendedActions(template.category);

    reviews.push({
      reviewId: `demo-${String(i + 1).padStart(4, '0')}`,
      reviewText: text,
      rating: template.rating,
      reviewDate,
      platform,
      appVersion: version,
      language,
      sourceUrl: '',
      developerResponse: rand() > 0.85 ? 'Thank you for your feedback. We are looking into this issue.' : '',
      sentiment: template.sentiment,
      primaryCategory: template.category,
      secondaryCategories: template.secondary || [],
      severity: template.severity,
      confidence: Math.round(confidence * 100) / 100,
      aiSummary,
      rootCauseHypotheses,
      recommendedActions,
      manualClassification: {},
      importBatchId: 'demo-seed',
      isDemo: true,
    });
  }

  return reviews;
}

function generateAiSummary(template: ReviewTemplate): string {
  const summaries: Record<string, string> = {
    booking: 'User reports difficulties with the booking process, including failures, confusion, or incorrect booking details.',
    gps_eta: 'User reports inaccurate GPS tracking or unreliable ETA estimates, causing uncertainty about vehicle arrival.',
    notifications: 'User reports missing, delayed, or duplicate notifications affecting their ability to catch rides.',
    pickup_timing: 'User reports pickup time discrepancies or schedule changes without adequate notice.',
    routing: 'User reports inefficient or incorrect routes, including unsafe pickup/drop locations.',
    check_in_no_show: 'User reports issues with check-in process or disputes about no-show status.',
    support: 'User reports poor customer support experience including slow response or unresolved issues.',
    usability: 'User reports UI/UX issues that make the app difficult or frustrating to use.',
    safety: 'User reports safety concerns related to driver behavior, vehicle conditions, or verification.',
    performance: 'User reports app crashes, slow loading, or technical issues affecting usability.',
    general_positive: 'User shares a positive experience with the service, noting reliability or ease of use.',
    other: 'User provides general feedback about the service.',
  };
  return summaries[template.category] || summaries.other;
}

function generateRootCauses(category: string): string[] {
  const causes: Record<string, string[]> = {
    booking: ['Booking API timeout under high load', 'Ambiguous booking state transitions', 'Timezone handling error for overnight shifts'],
    gps_eta: ['GPS location data staleness > 30s', 'ETA calculation not incorporating real-time traffic', 'Client-side location caching too aggressive'],
    notifications: ['Push notification delivery failure', 'Notification timing not aligned with actual events', 'FCM token refresh issues'],
    pickup_timing: ['Schedule change propagation delay', 'Insufficient notification lead time for changes', 'Mismatch between planned and actual pickup window'],
    routing: ['Route optimization not considering road accessibility', 'Pickup point geocoding error', 'Route recalculation not triggered on delays'],
    check_in_no_show: ['Check-in geofence too small or misplaced', 'OTP verification timeout too short', 'No-show status set before grace period expires'],
    support: ['Support ticket routing inefficiency', 'No context preservation across support interactions', 'Limited self-service resolution options'],
    usability: ['Information hierarchy unclear', 'Critical actions not easily discoverable', 'Inconsistent UI patterns across screens'],
    safety: ['Driver verification gaps', 'Emergency features not prominently accessible', 'Insufficient vehicle capacity enforcement'],
    performance: ['Memory leak in tracking view', 'Unoptimized API calls on app startup', 'Background location processing too aggressive'],
    general_positive: [],
    other: [],
  };
  return causes[category] || [];
}

function generateRecommendedActions(category: string): string[] {
  const actions: Record<string, string[]> = {
    booking: ['Implement optimistic booking with confirmation fallback', 'Add clear booking state indicators', 'Fix timezone handling for cross-day bookings'],
    gps_eta: ['Reduce GPS update interval to ≤10s', 'Integrate real-time traffic data into ETA', 'Show GPS data freshness indicator to users'],
    notifications: ['Implement notification delivery confirmation', 'Add configurable notification lead times', 'Audit FCM token lifecycle management'],
    pickup_timing: ['Implement proactive schedule change notifications ≥15 min before', 'Add grace period buffer for early arrivals', 'Show updated ETA when schedule changes'],
    routing: ['Validate pickup/drop points against road network accessibility', 'Add user feedback loop for location corrections', 'Implement dynamic route recalculation'],
    check_in_no_show: ['Expand check-in geofence radius', 'Add dispute mechanism for no-show status', 'Implement driver-side confirmation requirement'],
    support: ['Implement support conversation persistence', 'Add in-app issue tracking with status updates', 'Create escalation path for safety-critical issues'],
    usability: ['Conduct usability audit with real users', 'Implement progressive disclosure for complex features', 'Add accessibility features'],
    safety: ['Promote SOS/emergency button to main screen', 'Implement real-time driver verification alerts', 'Add occupancy monitoring'],
    performance: ['Profile and fix memory leaks', 'Implement lazy loading for non-critical screens', 'Optimize background location processing'],
    general_positive: [],
    other: [],
  };
  return actions[category] || [];
}

export function generateSeedIssues(): any[] {
  return [
    {
      issueId: 'ISS-001',
      title: 'Stale GPS location displayed as live vehicle position',
      category: 'gps_eta',
      description: 'Multiple users report that the vehicle tracking map shows outdated locations. The displayed position can lag behind actual vehicle position by 30-120 seconds, causing users to misjudge when to go to their pickup point.',
      severity: 'high',
      frequencyScore: 78,
      impactScore: 82,
      trendScore: 65,
      confidenceScore: 75,
      priorityScore: 0,
      evidenceReviewIds: ['demo-0010', 'demo-0011', 'demo-0012', 'demo-0013', 'demo-0014'],
      rootCauseHypotheses: [
        'GPS data from vehicle devices is batched and sent at intervals > 30s',
        'Client-side location cache not invalidated on stale data',
        'WebSocket connection drops silently, falling back to polling',
      ],
      evidenceGaps: [
        'Actual GPS update frequency from vehicle hardware is unknown',
        'Server-side location processing latency not measured',
        'No A/B data on acceptable staleness thresholds',
      ],
      recommendedFix: 'Implement client-side GPS data freshness indicator. Show "Location updated X seconds ago" when data is older than 15 seconds. Investigate server-side batching intervals.',
      acceptanceCriteria: [
        'GPS position updates at least every 10 seconds when vehicle is moving',
        'Stale location (>30s) shows visual indicator to user',
        'Smooth interpolation between GPS points on map',
      ],
      monitoringMetrics: ['p95_gps_update_latency', 'gps_staleness_incidents', 'user_tracking_complaints'],
      owner: '',
      status: 'open',
    },
    {
      issueId: 'ISS-002',
      title: 'Pickup ETA does not reflect real-time traffic conditions',
      category: 'gps_eta',
      description: 'ETA calculations appear to use static routing estimates without real-time traffic data. Users report ETA errors of 10-25 minutes regularly, especially during peak commute hours.',
      severity: 'high',
      frequencyScore: 72,
      impactScore: 78,
      trendScore: 58,
      confidenceScore: 70,
      priorityScore: 0,
      evidenceReviewIds: ['demo-0014', 'demo-0015', 'demo-0060'],
      rootCauseHypotheses: [
        'ETA calculation uses historical average speed, not live traffic',
        'Traffic data provider integration may have latency or coverage gaps',
        'No re-estimation when vehicle deviates from planned route',
      ],
      evidenceGaps: [
        'Current ETA calculation algorithm not inspected',
        'Traffic data provider and refresh rate unknown',
        'Actual ETA error distribution not measured systematically',
      ],
      recommendedFix: 'Integrate real-time traffic data into ETA recalculation. Implement progressive ETA updates as vehicle approaches pickup.',
      acceptanceCriteria: [
        'ETA error < 5 minutes for 80% of trips',
        'ETA recalculates when traffic conditions change significantly',
        'Users see ETA confidence indicator',
      ],
      monitoringMetrics: ['p50_eta_error', 'p95_eta_error', 'eta_accuracy_by_route'],
      owner: '',
      status: 'open',
    },
    {
      issueId: 'ISS-003',
      title: 'Booking confirmation state is ambiguous',
      category: 'booking',
      description: 'Users cannot clearly determine whether their booking is confirmed, pending, or failed. The confirmation UI uses inconsistent status indicators and language.',
      severity: 'high',
      frequencyScore: 65,
      impactScore: 70,
      trendScore: 50,
      confidenceScore: 72,
      priorityScore: 0,
      evidenceReviewIds: ['demo-0002', 'demo-0005'],
      rootCauseHypotheses: [
        'Multiple booking states (pending, confirming, confirmed, allocated) shown with same UI',
        'Optimistic UI update without server confirmation',
        'Race condition between booking creation and vehicle allocation',
      ],
      evidenceGaps: [
        'Full booking state machine not documented',
        'User research on booking confirmation expectations not conducted',
      ],
      recommendedFix: 'Redesign booking confirmation flow with clear state transitions. Use distinct visual treatments for each booking state.',
      acceptanceCriteria: [
        'Each booking state has unique visual indicator and copy',
        'Users can distinguish pending from confirmed bookings',
        'Failed bookings show clear error message with retry option',
      ],
      monitoringMetrics: ['booking_state_confusion_tickets', 'booking_retry_rate', 'booking_abandonment_rate'],
      owner: '',
      status: 'investigating',
    },
    {
      issueId: 'ISS-004',
      title: 'Overnight shift booking displays incorrect date',
      category: 'booking',
      description: 'When booking for overnight shifts that cross midnight, the app displays the wrong date. Users booking for "tonight" see "tomorrow" in the confirmation.',
      severity: 'critical',
      frequencyScore: 45,
      impactScore: 85,
      trendScore: 40,
      confidenceScore: 68,
      priorityScore: 0,
      evidenceReviewIds: ['demo-0003', 'demo-0069'],
      rootCauseHypotheses: [
        'Date calculation uses local timezone but shift times stored in UTC',
        'Day boundary logic not handling cross-midnight shifts',
        'Calendar widget and backend use different date reference points',
      ],
      evidenceGaps: [
        'Timezone handling in booking API not inspected',
        'Cross-midnight booking volume not measured',
      ],
      recommendedFix: 'Implement timezone-aware date handling for cross-midnight bookings. Show departure date and shift label rather than calendar date.',
      acceptanceCriteria: [
        'Cross-midnight bookings show correct pickup date/time',
        'Shift label (e.g., "Night Shift - Oct 15") shown instead of ambiguous date',
        'Timezone tested for all supported regions',
      ],
      monitoringMetrics: ['cross_midnight_booking_errors', 'date_mismatch_complaints'],
      owner: '',
      status: 'open',
    },
    {
      issueId: 'ISS-005',
      title: 'Pickup notifications delayed or missing entirely',
      category: 'notifications',
      description: 'Users frequently report that ride arrival notifications come after the vehicle has arrived or not at all, causing missed pickups.',
      severity: 'critical',
      frequencyScore: 70,
      impactScore: 88,
      trendScore: 72,
      confidenceScore: 80,
      priorityScore: 0,
      evidenceReviewIds: ['demo-0018', 'demo-0019', 'demo-0021'],
      rootCauseHypotheses: [
        'Push notification service has delivery latency spikes',
        'Notification triggered on geofence entry but geofence radius too small',
        'FCM/APNS token rotation not handled, causing silent delivery failures',
      ],
      evidenceGaps: [
        'Push notification delivery success rate not measured',
        'End-to-end notification latency not tracked',
        'FCM token validity audit not performed',
      ],
      recommendedFix: 'Implement notification delivery confirmation. Add fallback SMS for critical notifications. Track end-to-end notification latency.',
      acceptanceCriteria: [
        'Pickup notification arrives ≥ 5 minutes before vehicle',
        'Failed push notifications trigger SMS fallback within 60 seconds',
        'Notification delivery rate > 99%',
      ],
      monitoringMetrics: ['notification_delivery_rate', 'notification_latency_p95', 'missed_notification_incidents'],
      owner: '',
      status: 'open',
    },
    {
      issueId: 'ISS-006',
      title: 'No-show status applied despite user presence at pickup point',
      category: 'check_in_no_show',
      description: 'Users are marked as no-show and penalized even when they were physically present at the pickup location. The check-in geofence may be too small or misaligned.',
      severity: 'critical',
      frequencyScore: 55,
      impactScore: 90,
      trendScore: 60,
      confidenceScore: 72,
      priorityScore: 0,
      evidenceReviewIds: ['demo-0035', 'demo-0036', 'demo-0039'],
      rootCauseHypotheses: [
        'Check-in geofence radius too small (< 50m)',
        'GPS accuracy on user device insufficient for geofence matching',
        'No-show timer starts before grace period communication',
      ],
      evidenceGaps: [
        'Current geofence radius not confirmed',
        'No-show dispute rate not tracked',
        'User GPS accuracy at check-in time not measured',
      ],
      recommendedFix: 'Increase check-in geofence radius. Implement manual check-in confirmation. Add no-show dispute flow in-app.',
      acceptanceCriteria: [
        'Check-in succeeds within 100m of pickup point',
        'Users can dispute no-show within 30 minutes',
        'Driver-side confirmation required before no-show penalty',
      ],
      monitoringMetrics: ['false_noshow_rate', 'noshow_dispute_rate', 'checkin_success_rate'],
      owner: '',
      status: 'investigating',
    },
    {
      issueId: 'ISS-007',
      title: 'Driver assignment details not clearly visible',
      category: 'usability',
      description: 'Users report difficulty finding driver name, photo, and vehicle details before pickup. This information is critical for safety verification.',
      severity: 'high',
      frequencyScore: 42,
      impactScore: 65,
      trendScore: 35,
      confidenceScore: 65,
      priorityScore: 0,
      evidenceReviewIds: ['demo-0038', 'demo-0070'],
      rootCauseHypotheses: [
        'Driver details shown only after tap into trip details',
        'Vehicle assignment notification does not include driver info',
        'Driver photo not updated or placeholder used',
      ],
      evidenceGaps: [
        'Driver detail visibility heuristic evaluation not done',
        'User task completion rate for finding driver info not measured',
      ],
      recommendedFix: 'Surface driver name, photo, and vehicle number prominently on the tracking screen. Include driver details in pickup notification.',
      acceptanceCriteria: [
        'Driver details visible without additional taps from tracking screen',
        'Vehicle number displayed in pickup notification',
        'Photo shows actual driver, not placeholder',
      ],
      monitoringMetrics: ['driver_info_view_rate', 'safety_verification_completion'],
      owner: '',
      status: 'open',
    },
    {
      issueId: 'ISS-008',
      title: 'Safety/SOS features not easily accessible during ride',
      category: 'safety',
      description: 'The emergency SOS button is buried in settings or requires multiple taps to access. In safety-critical situations, users need immediate access.',
      severity: 'critical',
      frequencyScore: 38,
      impactScore: 95,
      trendScore: 45,
      confidenceScore: 78,
      priorityScore: 0,
      evidenceReviewIds: ['demo-0042', 'demo-0044', 'demo-0078'],
      rootCauseHypotheses: [
        'SOS feature deprioritized in UI hierarchy',
        'Emergency workflow not designed for stressed user state',
        'No persistent emergency access during active ride',
      ],
      evidenceGaps: [
        'Current SOS button location and tap count not documented',
        'SOS activation rate not measured',
        'Regulatory requirements for emergency features not reviewed',
      ],
      recommendedFix: 'Move SOS button to persistent floating action button during active ride. Implement one-tap emergency activation with automatic location sharing.',
      acceptanceCriteria: [
        'SOS accessible with single tap during active ride',
        'Emergency activation shares live location with configured contacts',
        'SOS confirmation to prevent accidental triggers',
      ],
      monitoringMetrics: ['sos_activation_rate', 'sos_time_to_activate', 'safety_incident_resolution_time'],
      owner: '',
      status: 'open',
    },
  ];
}

export function generateSeedTasks(): any[] {
  return [
    {
      taskId: 'TASK-001',
      linkedIssueId: 'ISS-001',
      title: 'Implement GPS data freshness indicator on tracking screen',
      description: 'Add a visual indicator showing how fresh the GPS data is. When location data is older than 15 seconds, show "Location updated X seconds ago" badge.',
      priority: 'P1',
      assignee: '',
      status: 'ready',
      effort: 'medium',
      acceptanceCriteria: [
        'Freshness indicator appears when GPS data > 15s old',
        'Indicator shows elapsed time since last update',
        'Visual warning at > 30s, error state at > 60s',
        'Smooth transition when fresh data arrives',
      ],
      testCases: [
        'Test freshness display with 10s, 20s, 45s, 90s old data',
        'Test transition from stale to fresh state',
        'Test display when WebSocket connection drops',
        'Test on slow network connections',
      ],
      releaseVersion: '',
      rollbackPlan: 'Feature flag to hide freshness indicator. No data model changes required for rollback.',
      successMetrics: ['Reduction in GPS-related complaints by 30%', 'User trust score improvement in tracking feature'],
      dueDate: null,
      stepsToReproduce: [
        'Open app and navigate to active ride tracking',
        'Observe vehicle position on map',
        'Note that position may appear frozen or jump suddenly',
      ],
      expectedBehavior: 'Vehicle position updates smoothly every few seconds with indication of data freshness',
      actualBehavior: 'Vehicle position shows stale data without any indication of staleness, jumps to new position on update',
      technicalInvestigation: 'Investigate WebSocket connection reliability and GPS data pipeline latency. Check if location data batching on vehicle devices is configurable.',
      proposedFix: 'Add timestamp comparison in location render component. Create FreshnessIndicator component. Add staleness threshold to configuration.',
      observabilityRequirements: ['Log GPS update intervals per vehicle', 'Track staleness events in analytics', 'Alert on p95 staleness > 60s'],
    },
  ];
}

export function generateSeedExperiments(): any[] {
  return [
    {
      experimentId: 'EXP-001',
      title: 'GPS Freshness Indicator Impact on User Trust',
      hypothesis: 'Showing GPS data freshness will reduce tracking-related complaints by setting accurate expectations, even before fixing underlying GPS latency.',
      linkedIssueIds: ['ISS-001', 'ISS-002'],
      problemCategory: 'gps_eta',
      targetUsers: 'All users with active ride tracking',
      startDate: null,
      endDate: null,
      baselineMetrics: { tracking_complaints_per_1000_rides: 12.5, tracking_satisfaction_score: 3.2 },
      targetMetrics: { tracking_complaints_per_1000_rides: 8.75, tracking_satisfaction_score: 3.8 },
      observedMetrics: {},
      guardrailMetrics: { app_crash_rate: 0.5, tracking_screen_load_time_ms: 2000 },
      rolloutPercentage: 0,
      status: 'draft',
      result: 'pending',
      interpretation: '',
      limitations: ['Requires sufficient sample size for statistical significance', 'Seasonal variation in commute patterns may affect results'],
      successCriteria: '≥30% reduction in tracking-related complaints with no increase in app crashes or tracking screen load time',
    },
    {
      experimentId: 'EXP-002',
      title: 'Clearer Booking Confirmation Flow',
      hypothesis: 'Redesigning the booking confirmation to show explicit state transitions (Pending → Confirmed → Vehicle Assigned) will reduce booking confusion complaints.',
      linkedIssueIds: ['ISS-003'],
      problemCategory: 'booking',
      targetUsers: 'New users in first 30 days',
      startDate: null,
      endDate: null,
      baselineMetrics: { booking_confusion_complaints_per_1000: 8.2, booking_retry_rate: 0.15 },
      targetMetrics: { booking_confusion_complaints_per_1000: 4.1, booking_retry_rate: 0.08 },
      observedMetrics: {},
      guardrailMetrics: { booking_completion_rate: 0.95, booking_time_seconds: 30 },
      rolloutPercentage: 0,
      status: 'draft',
      result: 'pending',
      interpretation: '',
      limitations: ['New users may have different baseline behavior than existing users', 'Results may not generalize to power users'],
      successCriteria: '≥50% reduction in booking confusion complaints with no decrease in booking completion rate',
    },
    {
      experimentId: 'EXP-003',
      title: 'Proactive Pickup Delay Notifications',
      hypothesis: 'Sending proactive notifications when pickup is expected to be delayed by > 5 minutes will reduce missed-pickup incidents and improve user satisfaction.',
      linkedIssueIds: ['ISS-005'],
      problemCategory: 'notifications',
      targetUsers: 'Users on routes with historical delay patterns',
      startDate: null,
      endDate: null,
      baselineMetrics: { missed_pickup_rate: 0.08, notification_satisfaction: 2.8 },
      targetMetrics: { missed_pickup_rate: 0.04, notification_satisfaction: 3.5 },
      observedMetrics: {},
      guardrailMetrics: { notification_fatigue_unsub_rate: 0.02, false_delay_alert_rate: 0.1 },
      rolloutPercentage: 0,
      status: 'draft',
      result: 'pending',
      interpretation: '',
      limitations: ['Delay prediction accuracy depends on real-time traffic data quality', 'User notification preferences vary significantly'],
      successCriteria: '≥50% reduction in missed pickup rate without increasing notification unsubscribe rate above 3%',
    },
  ];
}
