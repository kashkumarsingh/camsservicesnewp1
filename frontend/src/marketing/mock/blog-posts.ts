import type { MarketingBlogPostDTO, SitePageDTO } from "@/marketing/types/blog";
import { CAMS_UNSPLASH_PHOTO } from "@/marketing/mock/cams-unsplash";

export const BLOG_POST_DTOS: ReadonlyArray<MarketingBlogPostDTO> = [
  {
    slug: "blog/cams-programmes-one-to-one-support-overview",
    metaTitle: "CAMS Programmes: One-to-One Support Overview | CAMS Services",
    title: "CAMS Programmes: One-to-One Support Overview",
    excerpt:
      "A practical overview of the seven CAMS programmes and how one-to-one mentoring adapts to each young person's needs.",
    category: "Programmes",
    publishedLabel: "April 14, 2026",
    readTimeLabel: "6 min read",
    icon: "bookOpen",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.mentoring,
    body: [
      "CAMS delivers one-to-one support through seven core programmes designed around safety, trust and measurable progress for young people and families.",
      "Sports Support Programme focuses on training, development and participation in sport, helping young people build discipline, confidence and positive routines through physical activity.",
      "Mentoring and Coaching provides consistent guidance to strengthen confidence, decision making and personal growth in everyday life.",
      "Community Access and Transport Services helps young people safely access appointments, activities and local opportunities while increasing independence over time.",
      "SEN and Education Support offers tailored support for additional needs, learning and school engagement, with close collaboration around practical barriers.",
      "Family Support Service strengthens communication at home and supports healthier relationship patterns between young people and their wider support network.",
      "Behavioural Management and Conflict Resolution introduces practical strategies to reduce conflict, manage behaviour and build better emotional responses under pressure.",
      "Fitness and Wellbeing develops physical health, routine and overall wellbeing so positive change is sustained beyond sessions."
    ]
  },
  {
    slug: "blog/power-of-consistency-youth-mentoring",
    metaTitle: "The Power of Consistency in Youth Mentoring | CAMS Services",
    title: "The Power of Consistency in Youth Mentoring",
    excerpt:
      "Why predictable sessions and steady adult presence unlock trust, and how to protect rhythm when life gets chaotic.",
    category: "Mentoring",
    publishedLabel: "March 15, 2026",
    readTimeLabel: "5 min read",
    icon: "bookOpen",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.routine,
    body: [
      "Young people often arrive at mentoring carrying disappointment from adults who disappeared when things got hard. Consistency is not rigidity, it is proof that someone reliable is in their corner.",
      "We protect session rhythm by agreeing realistic schedules with families and schools, communicating early when change is unavoidable, and always naming the next touchpoint before the young person leaves.",
      "When trust lands, behavioural change stops feeling like pressure and starts feeling like choice. That is when mentoring becomes transformational rather than transactional."
    ]
  },
  {
    slug: "blog/understanding-adhd-young-people-mentor-guide",
    metaTitle: "Understanding ADHD in Young People: A Mentor's Guide | CAMS",
    title: "Understanding ADHD in Young People: A Mentor's Guide",
    excerpt:
      "Practical framing for mentors: attention, motivation, sensory load, and how to partner with schools without shaming the young person.",
    category: "Development",
    publishedLabel: "March 10, 2026",
    readTimeLabel: "7 min read",
    icon: "brain",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.sen,
    body: [
      "ADHD is often misread as defiance when it is actually an executive-function load issue. Mentors focus on shorter tasks, visible progress, and movement breaks that regulate rather than distract.",
      "Language matters. We describe behaviour as ‘stuck’ or ‘overwhelmed’ before ‘refusing’, and we collaborate with families on sleep, medication timing, and sensory sensitivities where appropriate.",
      "The goal is not compliance at any cost, it is agency. When young people understand how their brains work, they can advocate for the support they deserve."
    ]
  },
  {
    slug: "blog/from-challenging-behaviour-to-real-change",
    metaTitle: "From Challenging Behaviour to Real Change | CAMS Services",
    title: "From Challenging Behaviour to Real Change",
    excerpt:
      "Moving beyond surface control: co-regulation, meaningful activities, and repair after conflict.",
    category: "Behaviour",
    publishedLabel: "March 5, 2026",
    readTimeLabel: "6 min read",
    icon: "activity",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.boxingFitness,
    body: [
      "Challenging behaviour usually signals an unmet need, such as safety, belonging, autonomy, or exhaustion. Mentors slow down, name what they see, and invite curiosity rather than immediate correction.",
      "Structured physical activity can be a powerful regulator when paired with reflection. The session ends with a clear emotional debrief so learning transfers beyond the gym or studio.",
      "Repair is a skill we model openly. When adults acknowledge mis-steps, young people learn that relationships can survive imperfection."
    ]
  },
  {
    slug: "blog/building-self-esteem-young-people",
    metaTitle: "Building Self-Esteem in Young People | CAMS Services",
    title: "Building Self-Esteem in Young People",
    excerpt:
      "Strength-based mentoring that celebrates effort, belonging, and brave small steps, not empty praise.",
    category: "Confidence",
    publishedLabel: "February 28, 2026",
    readTimeLabel: "5 min read",
    icon: "star",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.community,
    body: [
      "Self-esteem grows when young people see evidence of their own capability. We catalogue specific wins, including showing up, trying something new, or repairing after a hard day, as data points they can trust.",
      "Group and community experiences normalise struggle. No one is ‘the only one finding it hard’, and mentors spotlight inclusive leadership from peers whenever it appears.",
      "Praise ties to values: courage, kindness, persistence. That anchors identity in who they are becoming, not only what they produce."
    ]
  },
  {
    slug: "blog/goal-setting-young-people",
    metaTitle: "Goal-Setting That Actually Works With Young People | CAMS",
    title: "Goal-Setting That Actually Works With Young People",
    excerpt:
      "Co-design, visible milestones, and goals that fit their world, not generic adult spreadsheets.",
    category: "Goals",
    publishedLabel: "February 20, 2026",
    readTimeLabel: "6 min read",
    icon: "target",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.goals,
    body: [
      "Goals fail when they are imposed. We start with what already matters to the young person, even if it looks small, and stretch toward measurable steps they co-own.",
      "Visual trackers, photos, and simple check-ins make progress tangible. Ambiguity is what kills momentum; clarity is kindness.",
      "We revise without shame. If a goal no longer fits, we celebrate what we learned and redesign together."
    ]
  },
  {
    slug: "blog/parents-support-youth-mentoring-home",
    metaTitle: "How Parents Can Support Youth Mentoring at Home | CAMS Services",
    title: "How Parents Can Support Youth Mentoring at Home",
    excerpt:
      "Bridging session wins into home life: routines, curiosity over interrogation, and partnering with your mentor.",
    category: "Parenting",
    publishedLabel: "February 15, 2026",
    readTimeLabel: "5 min read",
    icon: "heartHandshake",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.inclusiveLearning,
    body: [
      "Mentoring works best when home becomes a safe rehearsal space, not an interrogation room. Short, curious questions beat lengthy debriefs right after collection.",
      "Consistency at home might mean protecting sleep, limiting screen spirals before sessions, or a single shared calendar visible to everyone.",
      "If tension spikes, loop the mentor early. Aligned adults prevent escalation and show the young person that grown-ups can coordinate kindly around their wellbeing."
    ]
  }
];

const blogPostBySlug: ReadonlyMap<string, MarketingBlogPostDTO> = new Map(
  BLOG_POST_DTOS.map((post) => [post.slug, post])
);

export function getBlogPostBySlug(slug: string): MarketingBlogPostDTO | null {
  return blogPostBySlug.get(slug) ?? null;
}

export function blogPostsAsSitePageDtos(): ReadonlyArray<SitePageDTO> {
  return BLOG_POST_DTOS.map((post) => ({
    slug: post.slug,
    title: post.metaTitle,
    heroHeading: post.title,
    summary: post.excerpt,
    sourceHtmlFile: "blog.html"
  }));
}
