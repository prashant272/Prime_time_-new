import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, Tag, ChevronRight, Home } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import BlogSidebar from '../components/blog/BlogSidebar';
import BlogComments from '../components/blog/BlogComments';
import { useGetBlogByIdQuery } from '../store/apiSlice';
import SEO from '../components/common/SEO';

const BlogDetailsPage = () => {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: response, isLoading: loading } = useGetBlogByIdQuery(id);
  const blog = response?.data;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-800 space-y-4">
        <h1 className="text-4xl font-black">Blog Not Found</h1>
        <Link to="/blog" className="text-sky-500 font-bold hover:underline">Back to Blogs</Link>
      </div>
    );
  }

  const blogSchema = blog ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.image ? `https://www.primetimemedia.in${blog.image}` : "https://www.primetimemedia.in/og-image.jpg",
    "author": {
      "@type": "Person",
      "name": blog.author || "Prime Time Research Media"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Prime Time Research Media",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.primetimemedia.in/favicon.svg"
      }
    },
    "datePublished": new Date(blog.createdAt).toISOString()
  } : undefined;

  return (
    <main className="bg-slate-50 min-h-screen pb-20">
      <SEO 
        title={`${blog.title} | Blog`}
        description={blog.excerpt || "Read this insightful article on Prime Time Research Media."}
        image={blog.image ? `https://www.primetimemedia.in${blog.image}` : undefined}
        type="article"
        schema={blogSchema}
      />

      {/* Breadcrumb Header */}
      <div className="bg-slate-900 py-12 md:py-16 px-4">
        <PageContainer>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
              <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><Home size={14} /> Home</Link>
              <ChevronRight size={14} />
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <ChevronRight size={14} />
              <span className="text-sky-400">{blog.category}</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl">
              {blog.title}
            </h1>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="-mt-8 relative z-10">

        {/* 70:30 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Main Content (70%) */}
          <div className="lg:col-span-8">

            {/* Article Container */}
            <article className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">

              {/* Hero Image */}
              {blog.image && (
                <figure className="w-full h-[40vh] md:h-[60vh] bg-slate-100 relative m-0">
                  <img src={blog.image} alt={blog.title} loading="lazy" className="w-full h-full object-cover" />
                  <figcaption className="sr-only">{blog.title}</figcaption>
                </figure>
              )}

              <div className="p-8 md:p-12 lg:p-16">

                {/* Meta Data */}
                <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-slate-100 text-sm font-bold uppercase tracking-wider text-slate-500">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-sky-500" />
                    By {blog.author || 'Admin'}
                  </div>
                  <time dateTime={blog.createdAt} className="flex items-center gap-2">
                    <Calendar size={16} className="text-sky-500" />
                    {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </time>
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-sky-500" />
                    {blog.category}
                  </div>
                </div>

                {/* HTML Content Rendered via Typography Plugin */}
                <div
                  className="prose prose-lg prose-slate prose-headings:font-black prose-a:text-sky-500 prose-img:rounded-2xl max-w-none w-full"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Tags Bottom */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-4">
                    <span className="font-bold text-slate-800">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map(tag => (
                        <Link
                          key={tag}
                          to={`/blog?tag=${tag}`}
                          className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* Comments Section */}
            <BlogComments blogId={blog._id} />

          </div>

          {/* Sidebar (30%) */}
          <div className="lg:col-span-4 mt-12 lg:mt-0">
            <div className="sticky top-24">
              <BlogSidebar />
            </div>
          </div>

        </div>
      </PageContainer>
    </main>
  );
};

export default BlogDetailsPage;
