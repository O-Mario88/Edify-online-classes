import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Badge } from '../components/ui/badge';
import { 
  ArrowRight,
  Target,
  Users,
  Lightbulb,
  MessageSquare,
  BarChart3,
  BookOpen
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // We keep the loading block brief
  useEffect(() => {
    // Simulate short load to ensure smooth entry
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaeb] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#e6dac3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-slate-900 font-sans selection:bg-[#ecd9c6] selection:text-slate-900">
      
      {/* Editorial Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-20 max-w-[1600px] mx-auto min-h-[90vh] flex flex-col justify-center">
        
        {/* Background Image wrapper - soft rounded massive canvas */}
        <div className="absolute inset-0 m-4 sm:m-8 lg:m-12 rounded-[2.5rem] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out hover:scale-105"
            style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
          />
          {/* Soft overlay to ensure readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-transparent backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Typography Block */}
          <div className="col-span-1 lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                 <span className="h-[1px] w-12 bg-slate-900 block" />
                 <span className="uppercase tracking-[0.2em] text-sm font-semibold">Premium Education</span>
              </div>
              
              <EditorialHeader level="h1" className="leading-[1.1] font-medium tracking-tight">
                Quiet Focus.<br/>
                <span className="text-slate-500 italic">Profound Results.</span>
              </EditorialHeader>

              <p className="text-xl md:text-2xl text-slate-700 font-light max-w-xl leading-relaxed">
                A serene, highly intentional digital campus designed for Uganda's most ambitious O'level and A'level students.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-4">
              <Link to="/register">
                <EditorialPill variant="primary" size="xl">
                  Begin Your Journey <ArrowRight className="w-5 h-5 ml-2" />
                </EditorialPill>
              </Link>
              <Link to="/classes">
                <EditorialPill variant="ghost" size="xl" className="bg-white/40 backdrop-blur-md">
                  Explore Curriculums
                </EditorialPill>
              </Link>
            </div>
          </div>

          {/* Floating Editorial Panels (Pinterest Reference Style) */}
          <div className="col-span-1 lg:col-span-5 relative h-[500px] hidden md:block">
            
            {/* Soft pink/peach floating card */}
            <EditorialPanel 
              variant="frosted-rose" 
              className="absolute top-10 right-0 w-[300px] z-20 shadow-xl shadow-rose-900/5 rotate-3 hover:rotate-0 transition-transform duration-500"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-semibold tracking-wide text-slate-800">Next Session</span>
                <Badge variant="outline" className="border-rose-300 text-rose-800 bg-rose-50/50">Live</Badge>
              </div>
              <h3 className="text-4xl font-light text-slate-900 mb-2">10:00</h3>
              <p className="text-slate-600 mb-6 font-medium">A-Level Organic Chemistry</p>
              
              <EditorialPill variant="primary" className="w-full justify-between pr-2">
                Join Studio
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </EditorialPill>
            </EditorialPanel>

            {/* Cream floating card underneath */}
            <EditorialPanel 
              variant="glass" 
              className="absolute bottom-10 left-0 w-[280px] z-10 shadow-lg shadow-amber-900/5 -rotate-3 hover:rotate-0 transition-transform duration-500 delay-100"
            >
              <div className="flex gap-4 items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#e8e6d9] flex justify-center items-center">
                  <Target className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Personalized</p>
                  <p className="text-xs text-slate-600">Adaptive AI Path</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-slate-800 rounded-full" />
                </div>
                <div className="h-2 w-5/6 bg-slate-200/50 rounded-full" />
              </div>
            </EditorialPanel>

          </div>
        </div>
      </section>

      {/* Editorial Feature Section (Soft asymmetrical split) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          <div className="lg:w-5/12 space-y-8">
            <EditorialHeader level="h2" weight="light" className="text-slate-800">
              A calmer space <br/>to <span className="font-medium italic">think clearly.</span>
            </EditorialHeader>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              We removed the noise. The Edify platform is stripped of visual clutter, offering a quiet, premium environment where absolute focus is the default state.
            </p>
            <ul className="space-y-4 pt-4">
               {[
                 { icon: Users, text: 'Makerere-certified educators' },
                 { icon: Lightbulb, text: 'Ugandan national curriculum' },
                 { icon: BookOpen, text: 'Immersive resource library' }
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4 text-slate-700 font-medium">
                   <div className="w-10 h-10 rounded-full bg-white shadow-sm flex justify-center items-center border border-slate-100">
                     <item.icon className="w-4 h-4 text-slate-600" />
                   </div>
                   {item.text}
                 </li>
               ))}
            </ul>
          </div>

          <div className="lg:w-7/12 grid grid-cols-2 gap-6 relative">
            <div className="absolute inset-0 bg-[#f4efe2]/40 rounded-[3rem] -inset-6 -z-10" />
            
            <EditorialPanel className="bg-white border-none shadow-sm gap-4 flex flex-col p-8 col-span-2 md:col-span-1 md:translate-y-12">
              <div className="w-12 h-12 rounded-full bg-[#f5eef1] flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-rose-900" />
              </div>
              <h4 className="text-xl font-medium text-slate-900">Peer Tutoring</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Match with top students in safe, moderated study sessions to master complex subjects quickly.</p>
            </EditorialPanel>
            
            <EditorialPanel className="bg-slate-900 text-white border-none shadow-xl gap-4 flex flex-col p-8 col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-slate-300" />
              </div>
              <h4 className="text-xl font-medium text-white">AI Assistant</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Your personal AI mentor tracks your weak points and generates precise interventions.</p>
            </EditorialPanel>
            
          </div>
        </div>
      </section>

      {/* Clean Call to Action */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <EditorialHeader level="h2" weight="light">
            Ready to shape your future?
          </EditorialHeader>
          <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">
            Join the platform that is redefining secondary education in Uganda. Elegance, intelligence, and proven results.
          </p>
          <div className="flex justify-center pt-6">
            <Link to="/register">
              <EditorialPill variant="primary" size="xl" className="px-12 bg-slate-900">
                Enroll Now
              </EditorialPill>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
