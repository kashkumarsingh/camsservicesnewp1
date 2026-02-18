/**
 * Blog Data
 * 
 * Static data for blog posts.
 * This will be replaced by API data when Laravel backend is ready.
 */

import { BlogAuthor, BlogCategory, BlogTag } from '@/core/domain/blog/entities/BlogPost';

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  category?: BlogCategory;
  tags: BlogTag[];
  featuredImage?: string;
  published: boolean;
  publishedAt?: string;
  views: number;
  readingTime?: number;
}

export const blogPostsData: BlogPostData[] = [
  {
    id: '1',
    title: 'Understanding SEN Support: A Parent\'s Guide',
    slug: 'understanding-sen-support-parents-guide',
    excerpt: 'A comprehensive guide for parents navigating the SEN support system and understanding how to access the right resources for their child.',
    content: `
# Understanding SEN Support: A Parent's Guide

Navigating the Special Educational Needs (SEN) support system can be overwhelming for parents. This guide aims to demystify the process and help you understand your rights and options.

## What is SEN Support?

Special Educational Needs support is designed to help children who have learning difficulties or disabilities that make it harder for them to learn than most children of the same age.

## Types of Support Available

### 1. School-Based Support
Most children with SEN receive support within their mainstream school through:
- Differentiated teaching approaches
- Small group interventions
- Additional resources and equipment

### 2. Education, Health and Care Plans (EHCP)
For children who need more intensive support, an EHCP provides a legal document outlining:
- The child's needs
- Desired outcomes
- Support required
- Educational placement

## How to Access Support

1. **Speak to your child's school** - The SENCO (Special Educational Needs Coordinator) is your first point of contact
2. **Request an assessment** - If you feel your child needs more support
3. **Work with professionals** - Collaborate with teachers, therapists, and specialists

## Your Rights as a Parent

- Right to be consulted about your child's education
- Right to appeal decisions
- Right to request an EHC needs assessment
- Right to choose a school (subject to availability)

## Getting Help

If you're struggling to navigate the system, don't hesitate to reach out for support. CAMS Services offers guidance and can help you understand your options.

Remember: You know your child best, and your input is invaluable in creating the right support plan.
    `.trim(),
    author: {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah@camsservices.co.uk',
      bio: 'Educational psychologist with 15 years of experience in SEN support',
    },
    category: {
      id: '1',
      name: 'Parent Resources',
      slug: 'parent-resources',
    },
    tags: [
      { id: '1', name: 'SEN', slug: 'sen' },
      { id: '2', name: 'Parent Guide', slug: 'parent-guide' },
    ],
    published: true,
    publishedAt: new Date('2024-01-15').toISOString(),
    views: 245,
    readingTime: 5,
  },
  {
    id: '2',
    title: 'Trauma-Informed Care: What It Means for Your Child',
    slug: 'trauma-informed-care-what-it-means',
    excerpt: 'Learn about trauma-informed care approaches and how they can support children who have experienced trauma.',
    content: `
# Trauma-Informed Care: What It Means for Your Child

Trauma-informed care is an approach that recognizes the widespread impact of trauma and understands potential paths for recovery.

## Understanding Trauma

Trauma can result from:
- Abuse or neglect
- Witnessing violence
- Loss of a loved one
- Medical procedures
- Natural disasters

## Principles of Trauma-Informed Care

### 1. Safety
Creating physical and emotional safety for children is paramount.

### 2. Trustworthiness and Transparency
Building trust through consistent, transparent communication.

### 3. Peer Support
Connecting children with peers who have similar experiences.

### 4. Collaboration and Mutuality
Working together with families and professionals.

### 5. Empowerment
Focusing on strengths and building resilience.

### 6. Cultural Sensitivity
Recognizing and respecting cultural differences.

## How We Apply This

At CAMS Services, our trauma-informed approach means:
- Every interaction considers potential trauma history
- We create safe, predictable environments
- We focus on building relationships and trust
- We empower children and families

## Signs Your Child May Benefit

- Difficulty regulating emotions
- Avoidance of certain situations
- Hypervigilance or anxiety
- Difficulty forming relationships
- Behavioral challenges

## Getting Support

If you believe your child may have experienced trauma, professional support can make a significant difference. Our team is trained in trauma-informed approaches and can help.
    `.trim(),
    author: {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@camsservices.co.uk',
      bio: 'Trauma-informed care specialist',
    },
    category: {
      id: '2',
      name: 'Trauma Support',
      slug: 'trauma-support',
    },
    tags: [
      { id: '3', name: 'Trauma', slug: 'trauma' },
      { id: '4', name: 'Care Approaches', slug: 'care-approaches' },
    ],
    published: true,
    publishedAt: new Date('2024-02-01').toISOString(),
    views: 189,
    readingTime: 6,
  },
];

// Export as blogPosts for backward compatibility
export const blogPosts = blogPostsData;
