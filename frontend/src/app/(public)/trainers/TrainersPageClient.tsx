'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { useTrainers } from '@/interfaces/web/hooks/trainers';
import TrainerCard from '@/interfaces/web/components/trainers/TrainerCard';
import { TrainerSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { Users, Star, Shield, Heart, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import { ROUTES } from '@/utils/routes';
import { TRAINERS_PAGE } from '@/app/(public)/constants/trainersPageConstants';

export default function TrainersPageClient() {
  const { trainers, loading, error } = useTrainers({ sortBy: 'rating', sortOrder: 'desc', available: true });

  const totalTrainers = trainers.length;
  const averageRating = trainers.length
    ? Math.round((trainers.reduce((sum, trainer) => sum + trainer.rating, 0) / trainers.length) * 10) / 10
    : 0;

  return (
    <div>
      {/* Hero Section - For Parents to Meet the Team */}
      <Section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-[40vh] flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/space-bg-2.webm"
          loop
          autoPlay
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/50 to-light-blue-cyan/30 z-10" />
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
            {TRAINERS_PAGE.HERO_TITLE}
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">
            {TRAINERS_PAGE.HERO_SUBTITLE}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Button href={ROUTES.CONTACT} variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              Get in Touch
            </Button>
            <Button href={ROUTES.SERVICES} variant="outline" size="lg" className="shadow-lg border-white/30 text-white hover:bg-white/10" withArrow>
              Explore Our Services
            </Button>
          </div>
        </div>
      </Section>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">{totalTrainers}</p>
              <p className="text-sm opacity-90">Expert Mentors</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30"></div>
            <div>
              <p className="text-4xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : '4.9'}/5</p>
              <p className="text-sm opacity-90">Average Rating</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30"></div>
            <div>
              <p className="text-4xl font-bold">100%</p>
              <p className="text-sm opacity-90">DBS Checked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trainers Grid Section - PRIMARY CONTENT FOR PARENTS */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section
          title={TRAINERS_PAGE.SECTION_TITLE}
          subtitle={TRAINERS_PAGE.SECTION_SUBTITLE}
          titleClassName="heading-text-shadow"
        >
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <TrainerSkeleton count={SKELETON_COUNTS.TRAINERS} />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error.message}</div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-primary-blue/30 mb-4" size={64} />
              <p className="text-navy-blue/80 text-lg">No trainers available at the moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {trainers.map((trainer) => (
                <TrainerCard key={trainer.id} trainer={trainer} />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Become a Trainer Section - Secondary, at Bottom */}
      <div className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Section>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-card border-2 border-primary-blue/20 p-8 md:p-12 shadow-card">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-blue to-light-blue-cyan rounded-full mb-6">
                  <Sparkles className="text-white" size={40} />
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-navy-blue mb-4 heading-text-shadow">
                  Interested in Joining Our Team?
                </h2>
                <p className="text-xl text-navy-blue/80 max-w-3xl mx-auto leading-relaxed">
                  Are you passionate about helping children thrive? We're always looking for dedicated,
                  qualified trainers to join our growing team of specialists.
                </p>
              </div>

              {/* Why Join Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-card p-6 border-2 border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-light-blue-cyan rounded-xl flex items-center justify-center mb-4">
                    <Heart className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-blue mb-2">Make an Impact</h3>
                  <p className="text-sm text-navy-blue/80">Help children grow and thrive</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-card p-6 border-2 border-primary-blue/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <Briefcase className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-blue mb-2">Flexible Schedule</h3>
                  <p className="text-sm text-navy-blue/80">Work around your commitments</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-card p-6 border-2 border-primary-blue/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-blue mb-2">Professional Growth</h3>
                  <p className="text-sm text-navy-blue/80">Ongoing training & development</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-card p-6 border-2 border-primary-blue/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                    <Users className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-blue mb-2">Supportive Team</h3>
                  <p className="text-sm text-navy-blue/80">Work with experienced professionals</p>
                </div>
              </div>

              {/* Quick Benefits */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-card p-6 mb-10 border-2 border-primary-blue/30">
                <h3 className="text-2xl font-semibold text-navy-blue mb-4 text-center">What You Get</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Star className="text-star-gold flex-shrink-0 mt-1" size={20} fill="currentColor" />
                    <div>
                      <p className="font-semibold text-navy-blue">Families Ready to Book</p>
                      <p className="text-sm text-navy-blue/80">Prepaid hours, no payment chasing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="text-primary-blue flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-navy-blue">Fast-Track Assignments</p>
                      <p className="text-sm text-navy-blue/80">Smart matching based on your profile</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="text-light-blue-cyan flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-navy-blue">Supportive Community</p>
                      <p className="text-sm text-navy-blue/80">Network of experienced trainers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  href={ROUTES.BECOME_A_TRAINER}
                  variant="superPlayful"
                  size="lg"
                  className="shadow-lg flex items-center justify-center gap-2"
                  withArrow
                >
                  Become a Trainer
                </Button>
                <Button
                  href={`${ROUTES.BECOME_A_TRAINER}#application-form`}
                  variant="primary"
                  size="lg"
                  className="shadow-lg flex items-center justify-center gap-2"
                  withArrow
                >
                  Start Application
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center">
                <p className="text-sm text-navy-blue/80">
                  Questions? Email us at{' '}
                  <a href="mailto:coaches@camsservices.co.uk" className="text-primary-blue font-semibold hover:underline">
                    coaches@camsservices.co.uk
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* CTA Section */}
      <CTASection
        title="Ready to Connect with Our Team?"
        subtitle="Contact us today to discuss how our dedicated mentors can support your child."
        primaryCTA={{ text: 'Book a Free Consultation', href: ROUTES.CONTACT }}
        secondaryCTA={{ text: 'Email Our Team', href: 'mailto:info@camsservices.co.uk' }}
        variant="default"
      />
    </div>
  );
}
