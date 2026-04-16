// pages/Blog.tsx
import React, { useState } from 'react';
import { Clock, Tag, ArrowRight, Search } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Renting Tips', 'Buying Guide', 'Market News', 'Landlord Advice', 'Nairobi', 'Investment'];

const POSTS = [
  {
    id: 1,
    category: 'Renting Tips',
    title: '10 Things to Check Before Signing a Lease in Nairobi',
    excerpt: 'Avoid costly surprises. Before you put pen to paper, run through this checklist with your landlord or agent.',
    date: 'April 10, 2025',
    readTime: '5 min read',
    cover: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 2,
    category: 'Market News',
    title: "Nairobi Rental Market Update: Q1 2025 Prices & Trends",
    excerpt: "Westlands up 8%, South B steady — here's what moved in the first quarter and what to expect through mid-year.",
    date: 'April 3, 2025',
    readTime: '7 min read',
    cover: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 3,
    category: 'Buying Guide',
    title: 'First-Time Homebuyer in Kenya? Read This First',
    excerpt: 'From title deeds to stamp duty — a plain-language guide to buying your first property in Kenya without the headaches.',
    date: 'March 28, 2025',
    readTime: '9 min read',
    cover: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 4,
    category: 'Landlord Advice',
    title: 'How to Screen Tenants Properly (And Stay Within the Law)',
    excerpt: 'Good tenants don\'t find you — you find them. Here\'s a fair, thorough screening process that respects everyone\'s rights.',
    date: 'March 20, 2025',
    readTime: '6 min read',
    cover: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 5,
    category: 'Investment',
    title: '5 Nairobi Neighborhoods With the Highest Rental Yields in 2025',
    excerpt: 'Investors, take note. These suburbs are delivering above-market returns and showing strong long-term fundamentals.',
    date: 'March 14, 2025',
    readTime: '8 min read',
    cover: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 6,
    category: 'Renting Tips',
    title: 'The Hidden Costs of Renting That Nobody Warns You About',
    excerpt: "Service charges, water deposits, caretaker fees... your actual cost is often 20–30% above the listed rent. Here's what to budget for.",
    date: 'March 7, 2025',
    readTime: '4 min read',
    cover: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&auto=format&fit=crop',
    featured: false,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Renting Tips':    'bg-blue-100 text-blue-700',
  'Buying Guide':    'bg-emerald-100 text-emerald-700',
  'Market News':     'bg-amber-100 text-amber-700',
  'Landlord Advice': 'bg-purple-100 text-purple-700',
  'Nairobi':         'bg-orange-100 text-orange-700',
  'Investment':      'bg-pink-100 text-pink-700',
};

const Blog: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = POSTS.filter((p) => {
    const matchCat   = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.filter((p) => p.featured).slice(0, 2);
  const rest     = filtered.filter((p) => !p.featured);

  return (
    <Layout showSearch={false}>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
              Blog &amp; Insights
            </span>
            <h1 className="text-4xl lg:text-5xl font-black mb-4">Real estate knowledge for real Kenyans</h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
              Tips, market news, and guides from the Getkeja team — free, honest, and always up to date.
            </p>
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A373]/50"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Category pills ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === c
                  ? 'bg-[#ff385c] border-[#ff385c] text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── Featured posts ── */}
        {featured.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {featured.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-black text-lg text-[#222] mb-2 leading-snug group-hover:text-[#ff385c] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{post.date}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#ff385c] group-hover:gap-2 transition-all">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* ── Post grid ── */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#222] text-sm leading-snug mb-2 group-hover:text-[#ff385c] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No articles found.</p>
            <p className="text-sm mt-1">Try a different category or search term.</p>
          </div>
        )}
      </div>

    </Layout>
  );
};

export default Blog;
