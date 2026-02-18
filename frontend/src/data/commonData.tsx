import { Star, Users, CheckCircle, UserCheck } from 'lucide-react';

export const stats = [
  { number: '500+', label: 'Children Supported', icon: Users },
  { number: '98%', label: 'Satisfaction Rate', icon: CheckCircle },
  { number: '50+', label: 'Trained Staff', icon: UserCheck },
  { number: '4.9', label: 'Average Rating', icon: Star },
];

export const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Parent',
    rating: 5,
    avatar: 'https://placehold.co/96x96?text=SM', // Remote placeholder avatar
    text: 'CAMS Services has been incredible for my son. The staff are patient, understanding, and really know how to engage children with additional needs.',
  },
  {
    name: 'James T.',
    role: 'Social Worker',
    rating: 5,
    avatar: 'https://placehold.co/96x96?text=JT', // Remote placeholder avatar
    text: 'As a social worker, I regularly refer young people to CAMS. Their trauma-informed approach and professionalism are outstanding.',
  },
  {
    name: 'Linda K.',
    role: 'School SENCO',
    rating: 5,
    avatar: 'https://placehold.co/96x96?text=LK', // Remote placeholder avatar
    text: 'Working with CAMS has made a real difference for our students. Their detailed reports help us track progress effectively.',
  },
  {
    name: 'David L.',
    role: 'Parent',
    rating: 5,
    avatar: 'https://placehold.co/96x96?text=DL', // Remote placeholder avatar
    text: 'My daughter absolutely loves her sessions with CAMS. She has grown so much in confidence and looks forward to every activity.',
  },
];
