import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Video, CheckCircle2, ShieldCheck, 
  MapPin, Clock, BookOpen, Users, Star, StarHalf, MonitorPlay, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiGet, API_ENDPOINTS } from '../lib/apiClient';

interface Listing {
  id: number;
  title: string;
  teacher: number;
  content_type: string;
  price_amount?: number;
  average_rating: number;
  review_count: number;
  student_count: number;
}

interface ClassCard {
  id: number;
  weeks: string;
  title: string;
  lessons: string;
  students: string;
  level: string;
  teacher: string;
  teacherImg: string;
  image: string;
  rating: number;
  priceStatus: string;
}

export const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('O-Level');
  const [popularClasses, setPopularClasses] = useState<ClassCard[]>([]);

  // Default mock data as fallback
  const DEFAULT_CLASSES: ClassCard[] = [
    {
      id: 1, weeks: '12 WEEKS', title: 'O-Level Mathematics: Algebra Mastery',
      lessons: '24', students: '1.2k', level: 'O-Level',
      teacher: 'Sarah K.', teacherImg: 'https://ui-avatars.com/api/?name=Sarah+K&background=0D8ABC&color=fff',
      image: 'https://images.unsplash.com/photo-1635317711438-e6fd425bfce3?q=80&w=2670&auto=format&fit=crop',
      rating: 4.8, priceStatus: 'FREE'
    },
    {
      id: 2, weeks: '08 WEEKS', title: 'A-Level Physics: Quantum & Mechanics',
      lessons: '16', students: '850', level: 'A-Level',
      teacher: 'David J.', teacherImg: 'https://ui-avatars.com/api/?name=David+J&background=10B981&color=fff',
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=2574&auto=format&fit=crop',
      rating: 4.9, priceStatus: 'PREMIUM'
    },
    {
      id: 3, weeks: '04 WEEKS', title: 'Literature in English: African Writers',
      lessons: '8', students: '2.1k', level: 'O-Level',
      teacher: 'Aisha M.', teacherImg: 'https://ui-avatars.com/api/?name=Aisha+M&background=F59E0B&color=fff',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2546&auto=format&fit=crop',
      rating: 4.7, priceStatus: 'FREE'
    },
    {
      id: 4, weeks: '16 WEEKS', title: 'Advanced Chemistry: Organic Synthesis',
      lessons: '32', students: '540', level: 'A-Level',
      teacher: 'Dr. Okello', teacherImg: 'https://ui-avatars.com/api/?name=Dr.+Okello&background=6366f1&color=fff',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2670&auto=format&fit=crop',
      rating: 5.0, priceStatus: 'PREMIUM'
    }
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        // Fetch marketplace listings
        const response = await apiGet<{ results: Listing[] }>(API_ENDPOINTS.LISTINGS);
        
        if (response.data?.results && response.data.results.length > 0) {
          // Transform API listings to ClassCard format
          const classes = response.data.results.slice(0, 4).map((listing, index) => ({
            id: listing.id,
            weeks: `${Math.ceil(Math.random() * 16)}  WEEKS`,
            title: listing.title || `Lesson ${index + 1}`,
            lessons: String(Math.ceil(Math.random() * 32)),
            students: (Math.random() * 1000 + 500).toLocaleString('en-US', { maximumFractionDigits: 0 }),
            level: activeTab,
            teacher: `Teacher ${index + 1}`,
            teacherImg: `https://ui-avatars.com/api/?name=Teacher+${index + 1}&background=${['0D8ABC', '10B981', 'F59E0B', '6366f1'][index % 4]}&color=fff`,
            image: [
              'https://images.unsplash.com/photo-1635317711438-e6fd425bfce3?q=80&w=2670&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=2574&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2546&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2670&auto=format&fit=crop'
            ][index % 4],
            rating: listing.average_rating || 4.5 + Math.random() * 0.5,
            priceStatus: listing.price_amount ? 'PREMIUM' : 'FREE'
          }));
          
          setPopularClasses(classes);
        } else {
          // Use default mock data if no listings
          setPopularClasses(DEFAULT_CLASSES);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        // Fall back to mock data on error
        setPopularClasses(DEFAULT_CLASSES);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-blue-100"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfaf8] text-slate-800 font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 pb-20">
      
      {/* =========================================
          SECTION 1: HERO (Structure based on reference)
          ========================================= */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto z-10">
         
         {/* Subtle background motif */}
         <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 opacity-40 mix-blend-multiply pointer-events-none">
            <svg width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#e0f2fe" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.1,-46.3C90.3,-33.4,95.8,-17.8,96.6,-2C97.4,13.8,93.4,29.9,84.5,43.4C75.6,56.9,61.7,67.8,46.8,75.1C31.8,82.4,15.9,86.1,1.1,84.1C-13.6,82.2,-27.3,74.7,-40.4,66.1C-53.5,57.5,-66,47.8,-75,34.9C-84,22,-89.5,5.9,-87.3,-9.4C-85.1,-24.8,-75.2,-39.4,-63,-50.2C-50.8,-61,-36.3,-68.1,-22.4,-73.4C-8.4,-78.7,4.9,-82.2,18.7,-81.1C32.4,-80,46.6,-74.3,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
         </div>

         <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="space-y-8 relative z-10 max-w-2xl">
               <div className="inline-flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-full py-1.5 pl-2 pr-4 text-xs font-semibold tracking-wide text-blue-700">
                  <span className="w-2 h-0.5 bg-blue-500 rounded-full" />
                  PREMIUM SEC. EDUCATION
               </div>
               
               <h1 className="text-[2.75rem] lg:text-[4rem] leading-[1.05] font-semibold text-slate-900 tracking-tight">
                  Structure, Support,<br className="hidden md:block"/>
                  And <span className="text-blue-600">Real Progress.</span>
               </h1>
               
               <p className="text-lg lg:text-xl text-slate-600 font-light leading-relaxed max-w-lg">
                 Learn with a modern online school that feels guided and personal. High-quality structured classes, active live sessions, and intelligent resources directly aligned with your syllabus.
               </p>
               
               <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link to="/register">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 px-8 text-base shadow-lg shadow-blue-600/20 font-medium">
                      Begin Your Journey
                    </Button>
                  </Link>
                  <Link to="/classes">
                    <Button variant="outline" className="w-full sm:w-auto bg-white hover:bg-slate-50 border-slate-200 text-slate-800 rounded-xl h-14 px-8 text-base shadow-sm font-medium">
                      Explore Classes
                    </Button>
                  </Link>
               </div>

               <div className="flex items-center gap-6 pt-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> NCDC Aligned</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Makerere Educators</div>
               </div>
            </div>

            {/* Hero Right Visuals (Reference logic: central human + floating cards) */}
            <div className="relative z-10 flex justify-center lg:justify-end mt-12 lg:mt-0 px-4 sm:px-0">
               {/* Main Soft Blob / Image Holder */}
               <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/10">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop" 
                    alt="Students collaborating online"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay" />
                  
                  {/* Internal floating accent element - styled for premium editorial */}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white max-w-[220px]">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                           <Video className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                           <div className="text-xs font-bold text-slate-400 tracking-wider">LIVE NOW</div>
                           <div className="text-sm font-semibold text-slate-800">Advanced Math</div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* External floating stat card #1 (Bottom Left) */}
               <div className="absolute -bottom-8 -left-4 sm:left-4 bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center gap-4 z-20 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                     <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                     <p className="text-xl font-bold text-slate-800 leading-none mb-1">16,500+</p>
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Active Learners</p>
                  </div>
               </div>

               {/* External floating stat card #2 (Top Right) */}
               <div className="absolute top-12 -right-4 sm:-right-8 bg-white rounded-2xl pb-4 px-4 pt-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 z-20 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#fde68a] flex items-center justify-center mb-2 shadow-inner border border-amber-200">
                     <Sparkles className="w-7 h-7 text-amber-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality Material</p>
               </div>
            </div>
         </div>
      </section>

      {/* =========================================
          SECTION 2: BENEFITS STRIP
          ========================================= */}
      <section className="relative z-20 -mt-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
         <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 py-8 px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4 divide-slate-100 lg:divide-x-0">
               
               {[
                 { icon: BookOpen, text: '20k+ Premium Resources' },
                 { icon: MonitorPlay, text: 'Active Live Sessions' },
                 { icon: ShieldCheck, text: 'Makerere Verified' },
                 { icon: MapPin, text: 'Syllabus Aligned' },
                 { icon: Users, text: 'Parent Visibility' }
               ].map((item, idx) => (
                  <div key={idx} className="flex flex-col lg:flex-row items-center lg:justify-center gap-3 text-center lg:text-left group cursor-default">
                     <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-blue-600" />
                     </div>
                     <span className="font-semibold text-slate-700 text-sm">{item.text}</span>
                  </div>
               ))}

            </div>
         </div>
      </section>

      {/* =========================================
          SECTION 3: ABOUT / DIVE IN (2 Columns)
          ========================================= */}
      <section className="py-24 lg:py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Visual Collage Left */}
            <div className="w-full lg:w-1/2 relative">
               <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3] w-11/12 shadow-sm border border-slate-100">
                  <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop" alt="Students studying" className="w-full h-full object-cover" />
               </div>
               
               <div className="absolute right-0 bottom-4 w-2/5 aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-[#fbfaf8]">
                  <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2622&auto=format&fit=crop" alt="Educator at desk" className="w-full h-full object-cover" />
               </div>

               {/* Experience Badge */}
               <div className="absolute top-1/4 -right-6 w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-50 rotate-12">
                  <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-blue-600 animate-[spin_30s_linear_infinite]">
                    <path id="curve" d="M 50 15 A 35 35 0 1 1 49.99 15" fill="transparent" />
                    <text className="text-[12px] font-bold tracking-[0.2em] font-sans fill-current uppercase">
                      <textPath href="#curve">Makerere Certified</textPath>
                    </text>
                  </svg>
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
               </div>
            </div>

            {/* Content Right */}
            <div className="w-full lg:w-1/2 space-y-8">
               <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">GET TO KNOW MAPLE OS</h4>
                  <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
                     Explore Edify Online School and ignite your learning with structured classes, expert support, and real progress
                  </h2>
                  <p className="text-slate-600 font-light leading-relaxed text-lg pt-2">
                     Maple Online School simplifies and structures learning for students across East Africa. Through curriculum-aligned class pathways, verified dedicated educators, live academic support, and real-time parent oversight, the platform helps every learner stay on track and reach their full potential.
                  </p>
               </div>

               <div className="space-y-4">
                  {[
                     'Structured class pathways aligned to national curricula such as NCDC, organized by Class → Subject → Topic → Lesson/Practice',
                     'Interactive learning tools including mock exams, notes, video lessons, assignments, and guided interventions',
                     'Real-time parent visibility into attendance, progress, performance, and support actions through the Parent Dashboard'
                  ].map((text, idx) => (
                     <div key={idx} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                           <CheckCircle2 className="w-4 h-4 text-blue-700" />
                        </div>
                        <p className="text-slate-700 font-medium text-sm leading-relaxed">{text}</p>
                     </div>
                  ))}
               </div>

               <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-medium mt-4 shadow-sm">
                  Learn More About Us <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
         </div>
      </section>

      {/* =========================================
          SECTION 4: POPULAR CLASSES / TABS / GRID
          ========================================= */}
      <section className="py-20 bg-white border-y border-slate-100">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center space-y-4 mb-16">
               <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">POPULAR CLASSES</h4>
               <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900">Our Premium Offerings</h2>
               
               {/* Pill Tabs */}
               <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                  {['O-Level', 'A-Level', 'Sciences', 'Arts', 'Revision'].map(tab => (
                     <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all border ${activeTab === tab ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>

            {/* Class Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {popularClasses.map(cls => (
                  <div key={cls.id} className="bg-[#fbfaf8] border border-slate-100 rounded-[1.5rem] overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col">
                     {/* Image Frame */}
                     <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={cls.image} alt={cls.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                           {cls.weeks}
                        </div>
                     </div>
                     
                     {/* Card Body */}
                     <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-1 mb-2">
                           <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                           <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                           <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                           <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                           <StarHalf className="w-3.5 h-3.5 text-amber-500 fill-current" />
                           <span className="text-xs text-slate-500 ml-1 font-semibold">({cls.rating})</span>
                        </div>
                        
                        <h3 className="font-semibold text-lg text-slate-900 leading-tight mb-4 flex-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                           {cls.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-6">
                           <span className="flex items-center gap-1.5"><PlayIcon /> {cls.lessons} Lessons</span>
                           <span className="flex items-center gap-1.5"><StudentIcon /> {cls.students} Students</span>
                        </div>
                        
                        {/* Footer Rule & Metadata */}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                           <div className="flex items-center gap-2.5">
                              <img src={cls.teacherImg} alt={cls.teacher} className="w-8 h-8 rounded-full border border-slate-200" />
                              <span className="text-xs font-bold text-slate-700">{cls.teacher}</span>
                           </div>
                           <span className={`text-[11px] font-extrabold uppercase tracking-wider ${cls.priceStatus === 'FREE' ? 'text-emerald-600' : 'text-blue-600'}`}>
                              {cls.priceStatus}
                           </span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="flex justify-center pt-16">
               <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-medium shadow-sm">
                  View All Classes <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
         </div>
      </section>

      {/* =========================================
          SECTION 5: BOTTOM CTA SECTION
          ========================================= */}
      <section className="pt-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
         <div className="bg-blue-900 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl shadow-blue-900/20">
            {/* Soft background shape */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-30" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
               <div className="max-w-2xl text-center lg:text-left">
                  <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">Ready to start learning online?</h2>
                  <p className="text-blue-200 text-lg max-w-xl">Join thousands of students and teachers on Uganda's most advanced learning platform. Enroll now to accelerate your success.</p>
               </div>
               <div className="flex shrink-0">
                  <Link to="/register">
                    <Button size="lg" className="bg-white hover:bg-slate-50 text-slate-900 rounded-2xl h-14 px-10 text-base font-bold shadow-lg">
                       Get Started Now
                    </Button>
                  </Link>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

// Tiny Helper Icons for the Class Cards
const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const StudentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
