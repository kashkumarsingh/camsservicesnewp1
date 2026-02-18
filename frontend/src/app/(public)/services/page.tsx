import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { ServiceList } from '@/interfaces/web/components/services';




import { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  const imageUrl = '/og-images/og-image.jpg'; // Assuming a default OG image for services page

  return {
    title: 'Our Services - CAMS Services',
    description: 'Discover our comprehensive range of trauma-informed services designed to help every child thrive.',
    openGraph: {
      title: 'Our Services - CAMS Services',
      description: 'Discover our comprehensive range of trauma-informed services designed to help every child thrive.',
      url: `${baseUrl}/services`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: 'CAMS Services',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Our Services - CAMS Services',
      description: 'Discover our comprehensive range of trauma-informed services designed to help every child thrive.',
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/services`,
    },
  };
}

export default function Services() {


  return (
    <div>
      {/* Hero Section */}
      <Section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-screen flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/space-bg-2.mp4"
          loop
          autoPlay
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0080FF]/30 to-[#00D4FF]/20 z-10"></div>
        <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: "url('/svgs/dots-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "40px 40px" }}></div>
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
            Tailored Support, Lasting Impact
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">
            Discover our comprehensive range of trauma-informed services designed to help every child thrive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Button href="/contact" variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              Request a Callback
            </Button>
            <Button href="/packages" variant="outline" size="lg" className="shadow-lg" withArrow>
              Explore Our Packages
            </Button>
          </div>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section title="What We Offer" subtitle="Comprehensive support for your child's growth and development." titleClassName="heading-text-shadow">
          <div className="mb-10">
            <ServiceList />
          </div>
          <div className="text-center">
            <Button href="/packages" variant="secondary" size="lg" withArrow>
              View Our Packages
            </Button>
          </div>
        </Section>
      </div>

      {/* CTA Section */}
      <CTASection
        title="Ready to Explore Our Services?"
        subtitle="Contact us for a free consultation or learn more about how we can support your child."
        primaryCTA={{ text: "Contact Our Team", href: "/contact" }}
        secondaryCTA={{ text: "View Our Packages", href: "/packages" }}
        variant="default"
      />
    </div>
  );
}
