'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { useTrainers } from '@/interfaces/web/hooks/trainers';
import TrainerCard from '@/interfaces/web/components/trainers/TrainerCard';
import { TrainerSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { Users, Star, Shield, Heart, Briefcase, GraduationCap, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';

export default function TrainersPage() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0080FF]/50 to-[#00D4FF]/30 z-10" />
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
            Meet Our Dedicated Team
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">
            Our passionate mentors and specialists are committed to empowering every child to thrive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Button href="/contact" variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              Get in Touch
            </Button>
            <Button href="/services" variant="outline" size="lg" className="shadow-lg border-white/30 text-white hover:bg-white/10" withArrow>
              Explore Our Services
            </Button>
          </div>
        </div>
      </Section>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white py-8">
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
          title="Our Expert Mentors & Specialists"
          subtitle="Meet the compassionate professionals dedicated to your child's growth."
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
              <Users className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-600 text-lg">No trainers available at the moment.</p>
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
            <div className="bg-white rounded-[30px] border-2 border-gray-200 p-8 md:p-12 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0080FF] to-[#00D4FF] rounded-full mb-6">
                  <Sparkles className="text-white" size={40} />
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#1E3A5F] mb-4 heading-text-shadow">
                  Interested in Joining Our Team?
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Are you passionate about helping children thrive? We're always looking for dedicated, 
                  qualified trainers to join our growing team of specialists.
                </p>
              </div>

              {/* Why Join Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0080FF] to-[#00D4FF] rounded-xl flex items-center justify-center mb-4">
                    <Heart className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">Make an Impact</h3>
                  <p className="text-sm text-gray-600">Help children grow and thrive</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <Briefcase className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">Flexible Schedule</h3>
                  <p className="text-sm text-gray-600">Work around your commitments</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">Professional Growth</h3>
                  <p className="text-sm text-gray-600">Ongoing training & development</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                    <Users className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">Supportive Team</h3>
                  <p className="text-sm text-gray-600">Work with experienced professionals</p>
                </div>
              </div>

              {/* Quick Benefits */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-10 border-2 border-blue-200">
                <h3 className="text-2xl font-semibold text-[#1E3A5F] mb-4 text-center">What You Get</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Star className="text-[#FFD700] flex-shrink-0 mt-1" size={20} fill="currentColor" />
                    <div>
                      <p className="font-semibold text-[#1E3A5F]">Families Ready to Book</p>
                      <p className="text-sm text-gray-600">Prepaid hours, no payment chasing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="text-[#0080FF] flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-[#1E3A5F]">Fast-Track Assignments</p>
                      <p className="text-sm text-gray-600">Smart matching based on your profile</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="text-[#00D4FF] flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-[#1E3A5F]">Supportive Community</p>
                      <p className="text-sm text-gray-600">Network of experienced trainers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  href="/become-a-trainer" 
                  variant="superPlayful" 
                  size="lg" 
                  className="shadow-lg flex items-center justify-center gap-2" 
                  withArrow
                >
                  Become a Trainer
                </Button>
                <Button 
                  href="/become-a-trainer#application-form" 
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
                <p className="text-sm text-gray-600">
                  Questions? Email us at{' '}
                  <a href="mailto:coaches@camsservices.co.uk" className="text-[#0080FF] font-semibold hover:underline">
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
        primaryCTA={{ text: 'Book a Free Consultation', href: '/contact' }}
        secondaryCTA={{ text: 'Email Our Team', href: 'mailto:info@camsservices.co.uk' }}
        variant="default"
      />
    </div>
  );
}
