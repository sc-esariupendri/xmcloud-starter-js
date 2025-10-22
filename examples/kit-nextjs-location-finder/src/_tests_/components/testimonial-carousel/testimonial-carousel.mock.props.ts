import {
  TestimonialCarouselProps,
  TestimonialCarouselItemProps,
} from '@/components/testimonial-carousel/testimonial-carousel.props';

export const mockTestimonialItems: TestimonialCarouselItemProps[] = [
  {
    testimonialAttribution: {
      jsonValue: {
        value: 'City Fire Department, Los Angeles',
      },
    },
    testimonialQuote: {
      jsonValue: {
        value:
          'The Alaris Type I Ambulance has revolutionized our emergency response capabilities. The spacious patient compartment and advanced medical equipment allow our paramedics to deliver critical care en route to the hospital.',
      },
    },
  },
  {
    testimonialAttribution: {
      jsonValue: {
        value: 'County EMS Director, Miami-Dade',
      },
    },
    testimonialQuote: {
      jsonValue: {
        value:
          'We upgraded our entire fleet to Alaris vehicles last year. The reliability, fuel efficiency, and patient care features have exceeded our expectations. Our response times have improved by 15%.',
      },
    },
  },
  {
    testimonialAttribution: {
      jsonValue: {
        value: 'Chief Medical Officer, Metro Health System',
      },
    },
    testimonialQuote: {
      jsonValue: {
        value:
          'The Alaris Mobile Command Center has transformed how we coordinate large-scale emergency responses. The integrated communication systems and workspace design enable seamless multi-agency collaboration.',
      },
    },
  },
];

export const mockTestimonialCarouselProps: TestimonialCarouselProps = {
  rendering: {
    componentName: 'TestimonialCarousel',
    dataSource: 'mock-datasource',
  },
  params: {
    styles: 'bg-gray-50',
  },
  fields: {
    data: {
      datasource: {
        children: {
          results: mockTestimonialItems,
        },
      },
    },
  },
  name: 'TestimonialCarousel',
  Testimonials: [],
};

export const mockTestimonialCarouselPropsEmpty: TestimonialCarouselProps = {
  rendering: {
    componentName: 'TestimonialCarousel',
    dataSource: 'mock-datasource',
  },
  params: {},
  fields: {
    data: {
      datasource: {
        children: {
          results: [],
        },
      },
    },
  },
  name: 'TestimonialCarousel',
  Testimonials: [],
};

export const mockSingleTestimonialItem: TestimonialCarouselItemProps = {
  testimonialAttribution: {
    jsonValue: {
      value: 'Fire Chief, Chicago Fire Department',
    },
  },
  testimonialQuote: {
    jsonValue: {
      value:
        'Our Alaris fire trucks are built to handle the most demanding situations. The durability and performance are unmatched in the industry.',
    },
  },
};
