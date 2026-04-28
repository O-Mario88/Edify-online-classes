import React, { useEffect, useState } from 'react';
import { HomePublicNavbar } from '../components/home/HomePublicNavbar';
import { HomeHero } from '../components/home/HomeHero';
import { JoinTeachersSection } from '../components/home/JoinTeachersSection';
import { PathwaysSection } from '../components/home/PathwaysSection';
import { ScheduledLessonsSection } from '../components/home/ScheduledLessonsSection';
import {
  WhyMapleWorksSection,
  RoleAudienceSection,
  InstitutionCTASection,
  HomeFinalCTA,
} from '../components/home/HomeSections';
import { loadCountry, saveCountry, type CountryCode } from '../components/home/types';

/**
 * Public Maple Africa homepage. Owns its own dark navbar (the global
 * TopNavbar is suppressed on `/` by Layout) and composes the marketing
 * funnel top-to-bottom:
 *
 *   1. Public navbar — country selector lives here
 *   2. Hero — serif headline + amber CTAs + photo with floating cards
 *   3. JoinTeachers strip — three-pillar feature cards
 *   4. PathwaysSection — Secondary + Primary, country-aware
 *   5. ScheduledLessonsSection — proof Maple is alive (live + upcoming)
 *   6. WhyMapleWorks — four pillars
 *   7. RoleAudience — students / parents / teachers / institutions
 *   8. InstitutionCTA — cream/peach band with dashboard mockup
 *   9. FinalCTA — dark navy close with app store badges
 */
export const HomePage: React.FC = () => {
  const [country, setCountry] = useState<CountryCode>(null);

  useEffect(() => {
    setCountry(loadCountry());
  }, []);

  const onCountryChange = (c: CountryCode) => {
    setCountry(c);
    saveCountry(c);
  };

  return (
    <div className="bg-white text-slate-900 font-serif antialiased">
      <HomePublicNavbar country={country} onCountryChange={onCountryChange} />
      <HomeHero country={country} onCountryChange={onCountryChange} />
      <JoinTeachersSection />
      <PathwaysSection country={country} />
      <ScheduledLessonsSection country={country} />
      <WhyMapleWorksSection />
      <RoleAudienceSection />
      <InstitutionCTASection />
      <HomeFinalCTA />
    </div>
  );
};

export default HomePage;
