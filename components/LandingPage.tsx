import React, { useState, useEffect, useRef } from 'react';
import { SummarizeIcon, ImageIcon, TextExtractorIcon, BackgroundRemoverIcon, ImageConverterIcon, ImageMergerIcon, ImageCompressorIcon, ImageEditorIcon, SmartConverterIcon, DocumentTranslatorIcon, PdfOcrIcon, PdfSplitMergeIcon, PdfEditorToolIcon } from './icons';

const features = [
  {
    title: 'AI-Powered Tools',
    description: 'Leverage cutting-edge AI to summarize documents, extract text, and translate content with incredible accuracy.',
    icon: <SummarizeIcon />,
    color: 'from-purple-500 to-indigo-600'
  },
  {
    title: 'PDF Management',
    description: 'Edit, split, merge, and organize your PDF documents with our intuitive tools.',
    icon: <PdfEditorToolIcon />,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    title: 'Image Processing',
    description: 'Convert, compress, merge, and edit images with professional-grade tools.',
    icon: <ImageEditorIcon />,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Privacy Focused',
    description: 'Your documents never leave your device. All processing happens locally in your browser.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: 'from-rose-500 to-pink-600'
  },
];

const stats = [
  { value: '10M+', label: 'Documents Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '150+', label: 'Countries' },
  { value: '24/7', label: 'Support' },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    content: 'PDF Master has transformed how our team handles documents. The AI summarizer saves us hours every week!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Michael Chen',
    role: 'Freelance Designer',
    content: 'The image editing tools are incredibly powerful. I can do in minutes what used to take hours in other apps.',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Legal Assistant',
    content: 'PDF editing has never been easier. The tools are intuitive and the results are always perfect.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

const toolCategories = [
  {
    name: 'PDF Tools',
    icon: <PdfEditorToolIcon />,
    tools: [
      { id: 'pdf-editor', name: 'PDF Editor', description: 'Edit PDF files with text, shapes, highlights' },
      { id: 'pdf-ocr', name: 'PDF OCR', description: 'Extract all text content from any PDF file' },
      { id: 'pdf-split-merge', name: 'PDF Split & Merge', description: 'Split a PDF into multiple files or combine several PDFs' }
    ],
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'Image Tools',
    icon: <ImageEditorIcon />,
    tools: [
      { id: 'background-remover', name: 'Background Remover', description: 'Instantly remove the background from any image' },
      { id: 'image-editor', name: 'Image Editor', description: 'Edit images with tools like crop, text, shapes' },
      { id: 'image-converter', name: 'Image Converter', description: 'Convert images between popular formats' },
      { id: 'image-compressor', name: 'Image Compressor', description: 'Reduce image file size with quality slider' }
    ],
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    name: 'AI Tools',
    icon: <SummarizeIcon />,
    tools: [
      { id: 'summarizer', name: 'AI Summarizer', description: 'Quickly summarize long documents or articles' },
      { id: 'text-extractor', name: 'AI Text Extractor', description: 'Extract written content from any image' },
      { id: 'document-translator', name: 'Document Translator', description: 'Extract text and translate it instantly' }
    ],
    gradient: 'from-purple-500 to-indigo-600'
  }
];

const FloatingShape = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <div 
    className={`absolute ${className} opacity-20 dark:opacity-10 animate-float`}
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: '8s'
    }}
  />
);

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Add floating animation to CSS
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse-custom {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle the email submission here
    alert(`Thank you! We'll notify you when we launch: ${email}`);
    setEmail('');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    // Navigate to tools page
    window.location.hash = '/tools';
  };

  const handleLearnMore = () => {
    // Scroll to features section
    scrollToSection('features');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set the uploaded file in the parent component and show the modal
      window.dispatchEvent(new CustomEvent('fileUploaded', { detail: file }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Floating background shapes */}
      <FloatingShape className="top-20 left-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl" delay={0} />
      <FloatingShape className="top-1/3 right-10 w-48 h-48 bg-secondary-500 rounded-full blur-3xl" delay={2} />
      <FloatingShape className="bottom-20 left-1/4 w-40 h-40 bg-accent-500 rounded-full blur-3xl" delay={4} />
      <FloatingShape className="bottom-1/3 right-1/3 w-36 h-36 bg-primary-500 rounded-full blur-3xl" delay={1} />
      <FloatingShape className="top-1/4 left-1/3 w-24 h-24 bg-secondary-500 rounded-full blur-3xl" delay={3} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center relative z-10">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-800 dark:text-primary-200 text-sm font-medium mb-6 animate-pulse-custom">
            <span className="h-2 w-2 bg-primary-500 rounded-full mr-2"></span>
            Introducing AI-powered document tools
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
            All-in-One PDF & AI Toolkit
          </h1>
          
          <p className="mt-6 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Transform your documents with powerful AI tools. Edit, convert, and enhance PDFs and images with ease.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
            >
              Get Started
              <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button 
              onClick={handleLearnMore}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
          
          {/* Visual Demo Section */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
            </div>
            
            <div className="relative mx-auto max-w-4xl">
              {/* Browser mockup */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-700/50">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-slate-500 dark:text-slate-400">
                    pdfmaster.app
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* PDF Preview */}
                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-xl p-4">
                      <div className="bg-white dark:bg-slate-700 rounded-lg shadow p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-sm text-slate-900 dark:text-white">document.pdf</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">2.4 MB</div>
                          </div>
                        </div>
                        <div className="bg-slate-200 dark:bg-slate-600 border-2 border-dashed rounded w-full h-32 flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-8 h-8 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <div className="text-xs mt-1 text-slate-500">PDF Preview</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Processing */}
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-600 flex items-center justify-center animate-pulse">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Result */}
                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-xl p-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg shadow p-4 border border-green-200 dark:border-green-900/50">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-sm text-slate-900 dark:text-white">summary.txt</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">0.8 KB</div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 p-3">
                          <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4">
                            This is a sample summary of the document. The AI has extracted the key points and created a concise overview...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                      <span className="h-2 w-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
                      AI Processing Complete
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 group-hover:text-secondary-600 transition-colors">
                  {stat.value}
                </div>
                <div className="mt-2 text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Powerful Features</h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Everything you need to manage, edit, and enhance your documents and images.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card-hover p-6 text-center group hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Preview */}
      <div id="tools" className="py-12 bg-slate-50 dark:bg-slate-900/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Essential Tools</h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              A comprehensive suite of tools for all your document and image needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {toolCategories.map((category, index) => (
              <div 
                key={index} 
                className="card p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${category.gradient}`}>
                    {category.icon}
                  </div>
                  <h3 className="ml-4 text-xl font-bold text-slate-900 dark:text-white">{category.name}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.tools.map((tool, toolIndex) => (
                    <div 
                      key={toolIndex}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      onClick={() => window.location.hash = `#/tool/${tool.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {tool.name}
                          </h4>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {tool.description}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button 
              onClick={handleGetStarted}
              className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all group"
            >
              View All Tools
              <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Trusted by Professionals</h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Join thousands of users who transform their workflow with our tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="card p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center">
                  <img 
                    className="h-12 w-12 rounded-full" 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                  />
                  <div className="ml-4">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
                <div className="mt-6 text-slate-600 dark:text-slate-300 italic">
                  "{testimonial.content}"
                </div>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className="h-5 w-5 text-yellow-400" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Transform Your Workflow?</h2>
            <p className="mt-4 text-xl text-primary-100">
              Join thousands of professionals who save hours every day with our tools.
            </p>
            
            <form onSubmit={handleSubmit} className="mt-8 sm:flex max-w-md mx-auto">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 placeholder-slate-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700 rounded-md border-0"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="mt-3 sm:mt-0 sm:ml-3 flex-shrink-0 px-5 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700 transition-colors"
              >
                Get Started
              </button>
            </form>
            
            <p className="mt-4 text-sm text-primary-200">
              Free to use. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;