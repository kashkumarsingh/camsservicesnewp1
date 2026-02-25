import React from 'react';
import Link from 'next/link';
import { blogPosts } from '@/data/blogData';

const Blog = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {blogPosts.map((post, index) => (
        <div key={index} className="bg-white rounded-card p-6 hover:shadow-card-hover transition">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
          <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
            Read More
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Blog;


