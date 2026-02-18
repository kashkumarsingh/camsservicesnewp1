import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/components/features/booking/types';

interface RecentBlogPostsProps {
  recentPosts: BlogPost[];
}

const RecentBlogPosts: React.FC<RecentBlogPostsProps> = ({ recentPosts }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Posts</h2>
      <ul className="space-y-4">
        {recentPosts.map((recentPost) => (
          <li key={recentPost.slug}>
            <Link href={`/blog/${recentPost.slug}`} className="block text-gray-900 hover:text-blue-600 transition-colors duration-200 font-medium">
              {recentPost.title}
            </Link>
            <p className="text-sm text-gray-700 mt-1">{recentPost.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentBlogPosts;