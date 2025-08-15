import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PdfFileIcon, DocumentTranslatorIcon, PdfOcrIcon, PdfSplitMergeIcon } from './icons';

const PdfEditorLanding: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Advanced Editing Tools",
      description: "Add text, shapes, highlights, and drawings with precision controls and customization options.",
      icon: <PdfFileIcon />
    },
    {
      title: "AI-Powered OCR",
      description: "Extract and edit text from scanned documents with industry-leading accuracy.",
      icon: <PdfOcrIcon />
    },
    {
      title: "Document Translation",
      description: "Translate your PDFs into 100+ languages while preserving formatting.",
      icon: <DocumentTranslatorIcon />
    },
    {
      title: "Split & Merge",
      description: "Combine multiple PDFs or split large documents into smaller sections.",
      icon: <PdfSplitMergeIcon />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Legal Professional",
      content: "This PDF editor has transformed how I work with legal documents. The annotation tools are incredibly precise.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      content: "The AI features save me hours every week. Extracting data from PDFs is now effortless.",
      avatar: "MC"
    },
    {
      name: "Emma Rodriguez",
      role: "Academic Researcher",
      content: "Perfect for annotating research papers. The collaboration features make peer review seamless.",
      avatar: "ER"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <PdfFileIcon />
                </div>
                <span className="ml-2 text-xl font-bold text-slate-900 dark:text-white">PDF<span className="text-indigo-600">Master</span></span>
              </div>
            </div>
            <div className="hidden md:block">
              <nav className="flex space-x-8">
                <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
                <a href="#testimonials" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Testimonials</a>
                <a href="#pricing" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.hash = ''}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Back to Tools
              </button>
              <button 
                onClick={() => window.location.hash = '/pdf-editor'}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Start Editing
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">
              Professional <span className="text-indigo-600">PDF Editing</span> Made Simple
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              The most powerful and intuitive PDF editor with AI capabilities. Edit, annotate, and transform your documents with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.hash = '/pdf-editor'}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl text-lg"
              >
                Edit PDF Now - Free
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-lg">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Edit PDFs
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Powerful tools designed to make PDF editing simple and efficient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Powerful Editing Tools
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Our intuitive interface makes complex PDF editing tasks simple. Add text, draw shapes, highlight content, and more with precision tools.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mt-1">
                    <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Text Tools</span> - Add, edit, and format text with full control
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mt-1">
                    <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Drawing Tools</span> - Freehand drawing, shapes, and arrows
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mt-1">
                    <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Annotation Tools</span> - Highlight, underline, and strikethrough
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mt-1">
                    <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Page Management</span> - Insert, delete, rotate, and reorder pages
                  </p>
                </li>
              </ul>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="bg-slate-800 py-3 px-4 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-8">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Document.pdf</div>
                      <div className="flex space-x-2">
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      <div className="pt-4">
                        <div className="h-32 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-700 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-indigo-600 dark:text-indigo-400 font-medium">PDF Preview</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Document content with annotations</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by Professionals
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their PDF workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your PDF Workflow?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who save hours every week with our PDF editor
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.hash = '/pdf-editor'}
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg hover:shadow-xl text-lg"
            >
              Start Editing Now - Free
            </button>
            <button className="px-8 py-4 bg-indigo-800 text-white font-bold rounded-xl hover:bg-indigo-900 transition-colors text-lg">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <PdfFileIcon />
                </div>
                <span className="ml-2 text-xl font-bold text-white">PDF<span className="text-indigo-400">Master</span></span>
              </div>
              <p className="mt-4 text-sm">
                The most powerful and intuitive PDF editor with AI capabilities.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} PDFMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PdfEditorLanding;