import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, BookOpen, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-[#fbfaf8] min-h-screen text-slate-800 font-sans pb-20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
          Empowering the Future of <br className="hidden md:block"/> Education in East Africa
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Maple is a next-generation platform designed to bridge the gap between quality education and widespread accessibility. We partner with top educators to deliver structured, curriculum-aligned learning experiences.
        </p>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#fbfaf8] border border-slate-100 text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Structured Learning</h3>
              <p className="text-slate-600 leading-relaxed font-light">
                Our pathways are strictly aligned with national curricula, ensuring that students are always on track for their final examinations.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-[#fbfaf8] border border-slate-100 text-center">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Excellence</h3>
              <p className="text-slate-600 leading-relaxed font-light">
                Every resource and teacher on our platform undergoes rigorous verification to maintain the highest standard of academic integrity.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#fbfaf8] border border-slate-100 text-center">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Community Support</h3>
              <p className="text-slate-600 leading-relaxed font-light">
                Learning is a community effort. We connect students, teachers, and parents in a unified ecosystem for optimal support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Join the Maple Mission</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Whether you are a student hungry for knowledge, an educator with a passion to teach, or an institution ready to modernize, Maple is home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-14 font-semibold">
              Get Started Today
            </Button>
          </Link>
          <Link to="/classes">
            <Button variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 font-semibold">
              Explore Platform <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
