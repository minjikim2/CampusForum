import { useState, useMemo, useEffect, FormEvent, ChangeEvent } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  ArrowLeft, 
  Folder, 
  BookOpen, 
  Calendar,
  Bell,
  Hash,
  Info,
  Clock,
  Send,
  Eye,
  User,
  LogOut,
  Lock,
  Edit,
  Trash2,
  Check,
  X,
  MoreVertical,
  Mail,
  Flag,
  MessageCircle,
  Camera,
  Heart,
  Image as ImageIcon,
  ArrowUpDown,
  ListFilter,
  Sun,
  Moon,
  Sparkles,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Thread, FilterType, Reply, UserAccount, ForumNotification, Conversation, ChatMessage } from './types';
import { AuthModal } from './components/AuthModals';
import { getCampusAssistantResponse } from './services/geminiService';

// ==========================================
// UTILS
// ==========================================
const getLocalStorage = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};

const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ==========================================
// MOCK DATA
// ==========================================
const INITIAL_THREADS: Thread[] = [
  {
    id: 'fw1',
    category: 'Freedom Wall',
    time: '5m ago',
    timestamp: Date.now() - 300000,
    author: '@anonymous',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon1',
    title: 'Secretly in love with someone from block A!',
    preview: "I've been wanting to say this for a while but I'm too shy. You always sit in the third row...",
    content: "I've been wanting to say this for a while but I'm too shy. You always sit in the third row in our Psychology class and your smile literally makes my day. Maybe one day I'll have the courage to say hi!",
    replies: [],
    views: 89,
    catColor: '#ec4899',
  },
  {
    id: '1',
    category: 'IT Department',
    time: '2h ago',
    timestamp: Date.now() - 7200000,
    author: '@lexi_dev',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lexi',
    title: 'Best Study Tips for Database Systems?',
    preview: 'Looking for advice on how to prepare for the midterm exam. I struggle with normalization and SQL optimization.',
    content: "I'm currently struggling with normalization and SQL optimization for the upcoming exam. Does anyone have a concise cheat sheet or specific YouTube tutorials that helped them pass CS302? I specifically find BCNF and 4NF confusing when applied to real-world scenarios.",
    replies: [
      { id: 'r1', author: '@prof_k', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=prof_k', content: 'Focus on the dependency diagrams. Once you can draw the functional dependencies, the normal forms follow logically.', time: '1h ago', timestamp: Date.now() - 3600000 },
      { id: 'r2', author: '@it_wiz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=it_wiz', content: 'Check out the "Database Lessons" playlist by Caleb Curry on YouTube. It made everything click for me.', time: '45m ago', timestamp: Date.now() - 2700000 }
    ],
    views: 145,
    catColor: '#3b82f6',
  },
  {
    id: '2',
    category: 'Events',
    time: '5h ago',
    timestamp: Date.now() - 18000000,
    author: '@campus_life',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=life',
    title: 'Tech Week 2026 - Event Schedule',
    preview: "Here's the complete schedule for the upcoming tech week. We have workshops on AI, Cloud, and Web3...",
    content: "We are excited to announce our lineup for this year. Keynote speakers from Google and AWS will be attending. Check out the full workshop schedule inside and register for the hackathon early!\n\nMonday: Intro to AI Agents\nTuesday: Cloud Infrastructure Scalability\nWednesday: The Hackathon Kickoff\nThursday: Networking & Careers\nFriday: Awards Ceremony",
    replies: [
      { id: 'r3', author: '@student_a', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student_a', content: 'Is the hackathon open to freshmen?', time: '2h ago', timestamp: Date.now() - 7200000 },
      { id: 'r4', author: '@campus_life', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=life', content: 'Yes! All years are welcome.', time: '1h ago', timestamp: Date.now() - 3600000 }
    ],
    views: 289,
    catColor: '#f97316',
  },
  {
    id: '3',
    category: 'Academic',
    time: '1d ago',
    timestamp: Date.now() - 86400000,
    author: '@mark_wilson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mark',
    title: 'Group Project Partners',
    preview: 'Anyone still looking for a partner for the final IS project? I have a topic idea about microservices.',
    content: 'Looking for two more team members for the final capstone project. Preference for students who are familiar with React or Flutter. We plan to meet every Tuesday in the library to coordinate our microservices architecture.',
    replies: [],
    views: 30,
    catColor: '#22c55e',
  },
  {
    id: '4',
    category: 'IT Department',
    time: '3h ago',
    timestamp: Date.now() - 10800000,
    author: '@code_master',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master',
    title: 'React vs Vue for Senior Project?',
    preview: "I'm starting my senior project and I'm torn between React and Vue. Which one is better for a fast-paced development?",
    content: "I'm starting my senior project and I'm torn between React and Vue. Which one is better for a fast-paced development? I have some experience with both, but I want to make sure I choose the right one for a large-scale application with a lot of real-time features.",
    replies: [
      { id: 'r5', author: '@lexi_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lexi', content: 'React has a larger ecosystem, which might be helpful if you run into any issues.', time: '2h ago', timestamp: Date.now() - 7200000 },
      { id: 'r6', author: '@vue_fan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vue', content: 'Vue is more intuitive and easier to set up for smaller teams.', time: '1h ago', timestamp: Date.now() - 3600000 }
    ],
    views: 56,
    catColor: '#3b82f6',
  },
  {
    id: '5',
    category: 'Events',
    time: '12h ago',
    timestamp: Date.now() - 43200000,
    author: '@music_club',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=music',
    title: 'Battle of the Bands - Auditions',
    preview: 'Auditions for the annual Battle of the Bands are now open! Sign up your band today.',
    content: 'Auditions for the annual Battle of the Bands are now open! Sign up your band today to participate in the biggest music event on campus. All genres are welcome, and the winner gets a chance to perform at the summer festival!',
    replies: [],
    views: 120,
    catColor: '#f97316',
  },
  {
    id: '6',
    category: 'Academic',
    time: '2d ago',
    timestamp: Date.now() - 172800000,
    author: '@library_news',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=library',
    title: 'New Research Databases Available',
    preview: 'We have added several new research databases to the library collection. Check them out for your next project.',
    content: 'We are pleased to announce that several new research databases have been added to the library collection, including IEEE Xplore and ACM Digital Library. These resources are invaluable for students in STEM and other fields.',
    replies: [
      { id: 'r7', author: '@mark_wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mark', content: 'This is great! I needed access to IEEE for my research.', time: '1d ago', timestamp: Date.now() - 86400000 }
    ],
    views: 85,
    catColor: '#22c55e',
  },
  {
    id: '7',
    category: 'Freedom Wall',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    author: '@anonymous',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon2',
    title: 'Missing my dog back home',
    preview: "It's my first year away from home and I really miss my golden retriever, Max.",
    content: "It's my first year away from home and I really miss my golden retriever, Max. The campus is great, but it's not the same without him to greet me at the door. Anyone else feeling homesick?",
    replies: [
      { id: 'r8', author: '@student_b', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student_b', content: 'I feel you. I miss my cat every single day.', time: '30m ago', timestamp: Date.now() - 1800000 }
    ],
    views: 42,
    catColor: '#ec4899',
  },
  {
    id: '8',
    category: 'IT Department',
    time: '6h ago',
    timestamp: Date.now() - 21600000,
    author: '@security_expert',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=secure',
    title: 'PSA: Phishing Emails Targeting Students',
    preview: 'Watch out for emails asking for your campus login info. These are phishing attempts.',
    content: 'We have received reports of phishing emails targeting students. These emails often appear to come from the IT help desk and ask for your login credentials. Please remember that IT will never ask for your password via email.',
    replies: [],
    views: 210,
    catColor: '#3b82f6',
  },
  {
    id: '9',
    category: 'IT Department',
    time: '8h ago',
    timestamp: Date.now() - 28800000,
    author: '@linux_ninja',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ninja',
    title: 'How to install Arch Linux without breaking your mental health?',
    preview: 'I am on my 4th attempt today. The wiki is great but my brain is fried.',
    content: "I've been trying to install Arch for the last 5 hours. I keep getting stuck at the bootloader configuration. Is there a specific guide for UEFI systems that actually works, or should I just stick to Fedora?",
    replies: [
      { id: 'r9', author: '@it_wiz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=it_wiz', content: 'Try using archinstall if you are in a hurry, it is much safer for your sanity.', time: '2h ago', timestamp: Date.now() - 7200000 }
    ],
    views: 312,
    catColor: '#3b82f6',
  },
  {
    id: '10',
    category: 'Events',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    author: '@sports_council',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sports',
    title: 'Inter-College Basketball Finals!',
    preview: 'Tomorrow at the Main Gym. Bring your energy and support your team!',
    content: "The day we've all been waiting for is here. Engineering vs Business in the basketball finals! Kickoff is at 3 PM. First 100 students get free campus Merch!",
    replies: [],
    views: 450,
    catColor: '#f97316',
  },
  {
    id: '11',
    category: 'Academic',
    time: '3h ago',
    timestamp: Date.now() - 10800000,
    author: '@dean_office',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dean',
    title: 'Summer Internship Recognition Program',
    preview: 'Apply now to get academic credits for your summer industry experience.',
    content: 'Students who completed internships over the summer can now apply for academic credit. Please submit your completion certificate and supervisor report to the office by Friday.',
    replies: [],
    views: 125,
    catColor: '#22c55e',
  },
  {
    id: '12',
    category: 'Freedom Wall',
    time: '15m ago',
    timestamp: Date.now() - 900000,
    author: '@anonymous',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon3',
    title: 'To the guy who helped me pick up my books today...',
    preview: 'I was so embarrassed dropping my bag in front of the gate. Thank you for being so kind!',
    content: 'I was literally about to cry because I was so late and my coffee spilled too. Thank you for stopping to help me pick up my stuff. You have really kind eyes!',
    replies: [],
    views: 215,
    catColor: '#ec4899',
  },
  {
    id: '13',
    category: 'IT Department',
    time: '1d ago',
    timestamp: Date.now() - 86400000,
    author: '@startup_guy',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=startup',
    title: 'Looking for a Backend Developer (Node.js)',
    preview: 'Building a campus delivery app. Need someone who knows Express and MongoDB.',
    content: "We're a small team building 'CampusDash'. We need a backend expert to help us finish our API. This is a great portfolio piece!",
    replies: [
        { id: 'r10', author: '@code_master', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master', content: 'DM me your project details!', time: '10h ago', timestamp: Date.now() - 36000000 }
    ],
    views: 95,
    catColor: '#3b82f6',
  },
  {
    id: '14',
    category: 'Academic',
    time: '4h ago',
    timestamp: Date.now() - 14400000,
    author: '@study_habits',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=study',
    title: 'How do you guys stay motivated during finals week?',
    preview: 'I feel like I am burned out already. Any tips for staying productive?',
    content: "Finals week is approaching and I'm already feeling the pressure. For those who consistently get high grades, what is your secret? Do you use Pomodoro, or just power through it?",
    replies: [
        { id: 'r11', author: '@lexi_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lexi', content: 'Pomodoro actually works wonders for me. 25 mins study, 5 mins break.', time: '2h ago', timestamp: Date.now() - 7200000 }
    ],
    views: 180,
    catColor: '#22c55e',
  },
  {
    id: '15',
    category: 'Events',
    time: '20m ago',
    timestamp: Date.now() - 1200000,
    author: '@cultural_org',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=culture',
    title: 'International Food Festival - Volunteers Needed!',
    preview: 'Help us set up the stalls and represent your culture! Free snacks for volunteers.',
    content: "We're hosting the International Food Festival next Friday and we need volunteers to help with the stalls and logistics. It's a great way to meet new people and try amazing food from around the world!",
    replies: [],
    views: 64,
    catColor: '#f97316',
  },
  {
    id: '16',
    category: 'Academic',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    author: '@registrar_info',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=registrar',
    title: 'Registration for Fall 2026 is LIVE',
    preview: 'Secure your slots before they disappear! The portal is now open for all senior students.',
    content: 'Registration for next semester has officially started. Seniors have priority this week, followed by Juniors on Wednesday. Make sure to clear any hold on your account before attempting to enroll.',
    replies: [
      { id: 'r12', author: '@sophomore_sid', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sid', content: 'When do sophomores get to register? The portal says I am restricted.', time: '30m ago', timestamp: Date.now() - 1800000 }
    ],
    views: 1240,
    catColor: '#22c55e',
  },
  {
    id: '17',
    category: 'Academic',
    time: '4h ago',
    timestamp: Date.now() - 14400000,
    author: '@lib_manager',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lib',
    title: 'Extended Library Hours for Midterms',
    preview: 'The library will be open 24/7 starting this Monday. Coffee will be provided at the entrance.',
    content: 'To support your study efforts, the main library will be operating 24 hours a day for the next two weeks. Please remember to bring your student ID for entry after 10 PM. Silent zones are strictly enforced!',
    replies: [],
    views: 856,
    catColor: '#22c55e',
  },
  {
    id: '18',
    category: 'Events',
    time: '2h ago',
    timestamp: Date.now() - 7200000,
    author: '@career_center',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=career',
    title: 'Internship Fair 2026',
    preview: 'Over 50 companies are coming to campus! Bring your resume and dress professionally.',
    content: 'Join us at the Great Hall this Friday. Companies like Google, Meta, and several local startups will be scouting for summer interns. Workshops for resume building will be held every afternoon this week.',
    replies: [
      { id: 'r13', author: '@job_hunter', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hunter', content: 'Is there a dress code? Can I wear business casual?', time: '1h ago', timestamp: Date.now() - 3600000 }
    ],
    views: 1500,
    catColor: '#f97316',
  },
  {
    id: '19',
    category: 'Academic',
    time: '6h ago',
    timestamp: Date.now() - 21600000,
    author: '@project_lead',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lead',
    title: 'Looking for Project Partners (App Dev)',
    preview: 'Need two more members for a Full-stack React Native project. Aiming for an A!',
    content: 'We are building a campus navigation app with real-time room booking. Looking for someone experienced in Firebase or Node.js. We take our grades seriously but keep it fun!',
    replies: [],
    views: 112,
    catColor: '#22c55e',
  },
  {
    id: '20',
    category: 'Freedom Wall',
    time: '30m ago',
    timestamp: Date.now() - 1800000,
    author: '@safe_campus',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=safety',
    title: 'Stay Safe: Well-lit paths for night study',
    preview: 'Sharing a map of the safest paths to take when leaving the library after midnight.',
    content: 'With finals season coming up, many of us will be walking home late. Please stick to the main paths shown on the library exit map. Safety officers are also available for escorts if you call the hotline.',
    replies: [],
    views: 432,
    catColor: '#ec4899',
  },
  {
    id: '21',
    category: 'Events',
    time: '3h ago',
    timestamp: Date.now() - 10800000,
    author: '@music_dept',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=piano',
    title: 'Spring Concert Auditions',
    preview: 'Looking for soloists and chamber groups. All instruments welcome!',
    content: 'Auditions for the annual Spring Showcase will be held in the Music Hall next Tuesday. Please prepare two contrasting pieces (max 5 mins total). Accompanists provided upon request.',
    replies: [],
    views: 245,
    catColor: '#f97316',
  },
  {
    id: '22',
    category: 'Events',
    time: '1d ago',
    timestamp: Date.now() - 86400000,
    author: '@grad_committee',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cap',
    title: 'Graduation Cap and Gown Orders',
    preview: 'Deadline for early bird orders is tonight! Don’t miss the discount.',
    content: 'Class of 2026, make sure to order your official graduation gear through the university portal. Early bird pricing ends at midnight. We’ve added a new "Sustainable Gown" option this year!',
    replies: [],
    views: 2100,
    catColor: '#f97316',
  },
  {
    id: '23',
    category: 'Events',
    time: '5h ago',
    timestamp: Date.now() - 18000000,
    author: '@chess_wizard',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chess',
    title: 'Weekly Chess Blitz Tournament',
    preview: 'Join us at the Student Center. All skill levels welcome, free pizza included.',
    content: 'Whether you are a Grandmaster or just learned how the horsie moves, come join our weekly blitz. 5+0 time control. Top 3 wins custom chess pins!',
    replies: [],
    views: 189,
    catColor: '#f97316',
  },
  {
    id: '24',
    category: 'Freedom Wall',
    time: '2h ago',
    timestamp: Date.now() - 7200000,
    author: '@housing_hunter',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=house',
    title: 'Dorm or Apartment? Pros and Cons',
    preview: 'Help me decide where to live next year. Is the commute worth the extra space?',
    content: 'I am debating moving to an off-campus apartment. I love the freedom but I am worried about missing out on dorm life. For those who moved out, do you regret it?',
    replies: [
      { id: 'r14', author: '@senior_steve', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=steve', content: 'Apartments give you peace of mind, but dorms are unbeatable for socializing.', time: '1h ago', timestamp: Date.now() - 3600000 }
    ],
    views: 567,
    catColor: '#ec4899',
  },
  {
    id: '25',
    category: 'Freedom Wall',
    time: '45m ago',
    timestamp: Date.now() - 2700000,
    author: '@foodie_fan',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=food',
    title: 'New Ramen Stall in Food Court!',
    preview: 'Just tried the spicy miso ramen. 10/10 would recommend.',
    content: 'The new stall near the South entrance is finally open. The prices are student-friendly and the broth is actually authentic. Lines are long during lunch so go early!',
    replies: [],
    views: 890,
    catColor: '#ec4899',
  },
  {
    id: '26',
    category: 'Academic',
    time: '3h ago',
    timestamp: Date.now() - 10800000,
    author: '@study_buddy',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buddy',
    title: 'Physics 101 Study Group',
    preview: 'Meeting at the library cafe every Thursday. Let’s tackle these labs together.',
    content: 'Struggling with quantum mechanics? You aren’t alone. We have a small group meeting weekly to review lecture notes and help each other with problem sets. Join us!',
    replies: [],
    views: 156,
    catColor: '#22c55e',
  },
  {
    id: '27',
    category: 'Freedom Wall',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    author: '@lost_stuff',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lost',
    title: 'Found: Blue hydroflask near Gen Ed building',
    preview: 'Left it at the lost and found counter in the Student Union. Claim it there!',
    content: 'I found a blue hydroflask with a lot of anime stickers. I handed it over to the security desk in Building B. Hope it finds its owner!',
    replies: [],
    views: 321,
    catColor: '#ec4899',
  },
  {
    id: '28',
    category: 'IT Department',
    time: '5h ago',
    timestamp: Date.now() - 18000000,
    author: '@it_help',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=help',
    title: 'Wi-Fi Maintenance Schedule',
    preview: 'Expect intermittent outages in the East Wing this weekend.',
    content: 'We are upgrading the access points in the East Wing to support Wi-Fi 7. Work will start Saturday at 8 AM. Please use the library or the North lounge for uninterrupted internet.',
    replies: [],
    views: 1100,
    catColor: '#3b82f6',
  },
  {
    id: '29',
    category: 'Academic',
    time: '2h ago',
    timestamp: Date.now() - 7200000,
    author: '@scholarship_alert',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=money',
    title: 'Merit Scholarship Applications Open',
    preview: 'Check your eligibility via the student portal. Deadline: End of the month.',
    content: 'If you have a GPA above 3.8, you might be eligible for our annual merit scholarship. The application requires a one-page essay on your community contribution. Good luck!',
    replies: [],
    views: 2400,
    catColor: '#22c55e',
  },
  {
    id: '30',
    category: 'IT Department',
    time: '45m ago',
    timestamp: Date.now() - 2700000,
    author: '@gdg_campus',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gdg',
    title: 'Free AI Workshop by Google Developers Group',
    preview: 'Learn how to build your first AI agent with Gemini! No prior experience needed.',
    content: "We're hosting a hands-on workshop this Saturday in Room 402. We'll be walking through the basics of LLM prompts and building a simple chatbot. Bring your laptop and your curiosity!",
    replies: [
        { id: 'r15', author: '@lexi_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lexi', content: 'Count me in! Will there be pizza?', time: '10m ago', timestamp: Date.now() - 600000 }
    ],
    views: 89,
    catColor: '#3b82f6',
  },
  {
    id: '31',
    category: 'Academic',
    time: '2h ago',
    timestamp: Date.now() - 7200000,
    author: '@prof_bio',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bio',
    title: 'Research Assistant Position in Biology Lab',
    preview: 'Looking for a diligent student to help with plant genetics research.',
    content: "The Green Lab is seeking a part-time research assistant. Responsibilities include sample preparation and data entry. Ideal for Biology or Biotech majors. Send your CV to my campus email.",
    replies: [],
    views: 145,
    catColor: '#22c55e',
  },
  {
    id: '32',
    category: 'Events',
    time: '6h ago',
    timestamp: Date.now() - 21600000,
    author: '@art_club',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=art',
    title: 'Campus Art Gallery: Student Showcase',
    preview: 'Celebrating the creativity of our visual arts students. Opening night is this Friday.',
    content: "Come support our local artists! The gallery will feature paintings, digital art, and sculptures from across all blocks. Refreshments will be served at 6 PM.",
    replies: [],
    views: 210,
    catColor: '#f97316',
  },
  {
    id: '33',
    category: 'Freedom Wall',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    author: '@math_tutor',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=math',
    title: 'Calculus II Final Exam Prep Session',
    preview: 'Hosting a free online review session for Block B students.',
    content: "I'll be going over integration techniques and series convergence this Sunday on Discord. If you're struggling with Taylor series, this is for you!",
    replies: [],
    views: 78,
    catColor: '#ec4899',
  },
  {
    id: '34',
    category: 'Academic',
    time: '4d ago',
    timestamp: Date.now() - 345600000,
    author: '@campus_admin',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    title: 'Update on Campus Parking Fees',
    preview: 'Effective next semester, there will be a small adjustment to parking rates.',
    content: "Please check the university website for the updated fee schedule. We are investing the additional funds into better lighting and more security cameras in the parking structures.",
    replies: [
        { id: 'r16', author: '@commuter_joe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joe', content: 'Will there be more motorcycle slots too?', time: '2d ago', timestamp: Date.now() - 172800000 }
    ],
    views: 1100,
    catColor: '#22c55e',
  },
];

// ==========================================
// COMPONENTS
// ==========================================

function NotificationToast({ 
  notification, 
  onClose, 
  onView,
  index 
}: { 
  notification: ForumNotification, 
  onClose: () => void, 
  onView?: () => void,
  index: number 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-navy text-white'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ bottom: `${2 + index * 4}rem` }}
      className={`fixed right-8 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 font-black text-xs uppercase tracking-widest ${bgStyles[notification.type]}`}
    >
      <div className="flex items-center gap-3">
        {notification.type === 'success' && <Check size={18} />}
        {notification.type === 'error' && <X size={18} />}
        {notification.type === 'info' && <Bell size={18} />}
        <span className="max-w-[200px] truncate">{notification.message}</span>
      </div>
      
      {notification.link && (
        <button 
          onClick={() => {
            onView?.();
            onClose();
          }}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors cursor-pointer"
        >
          View
        </button>
      )}

      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </motion.div>
  );
}

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  confirmVariant = "navy" 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string, 
  confirmText?: string,
  confirmVariant?: 'navy' | 'red'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-navy/60 dark:bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-background-card rounded-[32px] p-8 shadow-2xl border border-border"
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${confirmVariant === 'red' ? 'bg-red-50 text-red-500 shadow-red-500/20' : 'bg-navy/5 text-navy shadow-navy/20'}`}>
          <Flag size={32} />
        </div>
        
        <h2 className="text-2xl font-black text-navy mb-3 tracking-tight">{title}</h2>
        <p className="text-text-secondary text-sm font-medium leading-relaxed mb-8">
          {message}
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={onConfirm}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg cursor-pointer ${
              confirmVariant === 'red' 
                ? 'bg-red-500 text-white shadow-red-500/30 hover:scale-105 active:scale-95' 
                : 'bg-navy text-white shadow-navy/30 hover:scale-105 active:scale-95'
            }`}
          >
            {confirmText}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-search-bg text-text-muted text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function NotificationCenter({ 
  notifications, 
  onClose, 
  onMarkRead, 
  onNavigate,
  onClearAll
}: { 
  notifications: ForumNotification[], 
  onClose: () => void,
  onMarkRead: (id: string) => void,
  onNavigate: (link: any) => void,
  onClearAll: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="absolute top-16 right-0 w-[360px] bg-background-card rounded-[32px] shadow-2xl shadow-navy/20 border border-border z-[110] overflow-hidden flex flex-col max-h-[500px]"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-search-bg/50">
          <h3 className="text-sm font-black text-navy uppercase tracking-widest">Alert Center</h3>
          <button 
            onClick={onClearAll}
            className="text-[10px] font-black text-text-muted hover:text-navy uppercase tracking-widest transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => {
                  onMarkRead(n.id);
                  if (n.link) onNavigate(n.link);
                }}
                className={`px-6 py-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-blue-50/30' : ''}`}
              >
                {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-border">
                  {n.avatar ? (
                    <img src={n.avatar} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Bell size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${!n.isRead ? 'font-black text-navy' : 'font-medium text-text-secondary'} leading-snug mb-1`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-text-muted">
                <Bell size={24} />
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">All caught up!</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function WelcomeScreen({ onStart, theme, setTheme }: { onStart: () => void, theme: 'light' | 'dark', setTheme: (theme: 'light' | 'dark') => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-card transition-colors duration-300"
    >
      <div className="absolute top-8 right-8">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-3 rounded-2xl bg-search-bg dark:bg-search-bg hover:scale-110 transition-all text-text-secondary cursor-pointer shadow-lg shadow-navy/5"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-navy w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-navy/20">
            <span className="text-white font-black text-4xl">C</span>
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-extrabold text-navy tracking-tight">CampusForum</h1>
          <p className="mt-2 text-text-secondary font-medium">
            Organized threaded discussions<br />for modern campus life
          </p>
        </div>

        <div className="space-y-3">
          {[
            { icon: BookOpen, label: 'Academic Discussions' },
            { icon: Calendar, label: 'Event Coordination' },
            { icon: Search, label: 'Searchable Archive' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-search-bg border border-border"
            >
              <item.icon size={20} className="text-navy" />
              <span className="font-bold text-text-main text-sm">{item.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="pt-8 space-y-6">
          <button 
            id="browse-forums-btn"
            onClick={onStart}
            className="w-full py-4 text-white font-bold bg-navy rounded-full shadow-2xl shadow-navy/30 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest cursor-pointer"
          >
            Enter Campus
          </button>
          
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-[0.2em]">
            Interactive Prototype
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MessageScreen({ 
  currentUser, 
  onBack,
  conversations,
  onSendMessage,
  activeConvId,
  onConvSelect,
  theme,
  setTheme
}: { 
  currentUser: UserAccount, 
  onBack: () => void,
  conversations: Conversation[],
  onSendMessage: (convId: string, content: string) => void,
  activeConvId?: string | null,
  onConvSelect?: (id: string | null) => void,
  theme: 'light' | 'dark',
  setTheme: (theme: 'light' | 'dark') => void
}) {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(activeConvId || null);
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    if (activeConvId) {
      setSelectedConvId(activeConvId);
    }
  }, [activeConvId]);

  const handleConvSelect = (id: string | null) => {
    setSelectedConvId(id);
    if (onConvSelect) onConvSelect(id);
  };

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="min-h-screen bg-campus-bg flex flex-col"
    >
      <header className="bg-background-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-[60] h-[70px] flex-shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onBack}
        >
          <div className="bg-navy w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-navy tracking-tight hidden sm:block">CampusForum</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary transition-all cursor-pointer group"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
            ) : (
              <Sun size={20} className="group-hover:rotate-12 transition-transform" />
            )}
          </button>
          
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black text-navy leading-none">@{currentUser.username}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-border overflow-hidden">
            <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <div className="w-full h-full max-w-5xl bg-background-card border border-border shadow-2xl shadow-navy/5 overflow-hidden flex flex-col md:flex-row">
          {/* List */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-black text-navy">Messages</h2>
          <button onClick={onBack} className="md:hidden p-2 bg-slate-50 rounded-xl">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map(conv => {
            const partner = conv.participants.find(p => p.id !== currentUser.id);
            return (
              <button 
                key={conv.id}
                onClick={() => handleConvSelect(conv.id)}
                className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all ${selectedConvId === conv.id ? 'bg-navy text-white shadow-xl shadow-navy/20' : 'hover:bg-slate-50'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-border/10">
                  <img src={partner?.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className={`font-black text-sm truncate ${selectedConvId === conv.id ? 'text-white' : 'text-navy'}`}>
                    @{partner?.username}
                  </div>
                  <div className={`text-xs truncate opacity-70 ${selectedConvId === conv.id ? 'text-white' : 'text-text-muted'}`}>
                    {conv.lastMessage || 'Start a conversation'}
                  </div>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="text-center py-20 px-6">
              <p className="text-xs font-black text-text-muted uppercase tracking-widest">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 flex flex-col bg-campus-bg/20 ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            <div className="p-6 bg-background-card border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => handleConvSelect(null)} className="md:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-border/10">
                    <img src={selectedConv.participants.find(p => p.id !== currentUser.id)?.avatar} alt="partner" className="w-full h-full object-cover" />
                  </div>
                  <div className="font-black text-navy">@{selectedConv.participants.find(p => p.id !== currentUser.id)?.username}</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {selectedConv.messages.map(m => {
                const isMine = m.senderId === currentUser.id;
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-5 py-3 rounded-3xl text-sm font-medium shadow-sm ${isMine ? 'bg-navy text-white rounded-br-sm' : 'bg-white text-navy border border-border rounded-bl-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-background-card border-t border-border">
              <div className="flex gap-4">
                <input 
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && msgText.trim()) {
                      onSendMessage(selectedConv.id, msgText);
                      setMsgText('');
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-search-bg rounded-2xl px-6 py-3 border border-transparent focus:bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all font-bold text-navy"
                />
                <button 
                  onClick={() => {
                    if (msgText.trim()) {
                      onSendMessage(selectedConv.id, msgText);
                      setMsgText('');
                    }
                  }}
                  className="p-4 bg-navy text-white rounded-2xl shadow-xl shadow-navy/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-white rounded-[40px] shadow-xl flex items-center justify-center text-navy mb-6">
              <MessageCircle size={40} />
            </div>
            <h3 className="text-2xl font-black text-navy mb-2">Your Inbox</h3>
            <p className="text-text-secondary font-medium max-w-xs">Select a conversation from the left to start chatting with other students.</p>
          </div>
        )}
      </div>
          </div>
        </div>
    </motion.div>
  );
}

function ThreadDetailView({ 
  thread, 
  onBack, 
  onAddReply, 
  currentUser, 
  onAuthOpen, 
  onEdit,
  onEditReply,
  onDeleteReply,
  onDeleteThread,
  onProfileClick,
  onReport,
  onMessageUser
}: { 
  thread: Thread, 
  onBack: () => void, 
  onAddReply: (content: string) => void, 
  currentUser: UserAccount | null, 
  onAuthOpen: (mode: 'login' | 'signup') => void, 
  onEdit: () => void,
  onEditReply: (replyId: string, content: string) => void,
  onDeleteReply: (replyId: string) => void,
  onDeleteThread: () => void,
  onProfileClick: (username: string) => void,
  onReport: (id: string, type: 'thread' | 'reply') => void,
  onMessageUser?: (username: string) => void,
  key?: string 
}) {
  const [replyText, setReplyText] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState('');

  const isAuthor = currentUser && thread.author === `@${currentUser.username}`;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden h-full flex flex-col"
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors cursor-pointer text-text-muted hover:text-navy">
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-black text-text-muted uppercase tracking-widest">Thread Details</span>
        </div>
        
        {isAuthor && (
          <div className="flex items-center gap-2">
            <button 
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-navy hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <Edit size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
            </button>
            <button 
              onClick={onDeleteThread}
              className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 no-scrollbar scroll-smooth">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  onClick={() => onProfileClick(thread.author.replace('@', ''))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 border border-border overflow-hidden cursor-pointer hover:border-navy transition-all"
                >
                  <img src={thread.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.author.replace('@', '')}`} alt="author" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded tracking-wider bg-navy/5 text-navy`}>
                      {thread.category}
                    </span>
                    <span className="text-text-muted text-xs">Posted {thread.time}</span>
                  </div>
                  <div className="text-sm font-black text-navy">by {thread.author}</div>
                </div>
              </div>

              {!isAuthor && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onMessageUser?.(thread.author)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-navy/5 text-navy rounded-lg hover:bg-navy/10 transition-all cursor-pointer"
                  >
                    <MessageCircle size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Message</span>
                  </button>
                  <button 
                    onClick={() => onReport(thread.id, 'thread')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all cursor-pointer opacity-40 hover:opacity-100"
                  >
                    <Flag size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Report</span>
                  </button>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-black text-navy leading-tight">{thread.title}</h1>
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{thread.content}</p>
          </div>

          <div className="pt-8 border-t border-border">
            <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-6">Replies ({thread.replies.length})</h3>
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {thread.replies.map((reply) => {
                  const isReplyAuthor = currentUser && reply.author === `@${currentUser.username}`;
                  const isEditing = editingReplyId === reply.id;

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={reply.id} 
                      className="flex gap-4 group"
                    >
                      <div 
                        onClick={() => onProfileClick(reply.author.replace('@', ''))}
                        className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden cursor-pointer hover:border-navy transition-all"
                      >
                        <img src={reply.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author.replace('@', '')}`} alt="reply-author" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-navy text-sm">{reply.author}</span>
                            <span className="text-[10px] text-text-muted">{reply.time}</span>
                          </div>
                          
                          {isReplyAuthor && !isEditing && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingReplyId(reply.id);
                                  setEditReplyText(reply.content);
                                }}
                                title="Edit"
                                className="p-1.5 text-text-muted hover:text-navy bg-slate-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => onDeleteReply(reply.id)}
                                title="Delete"
                                className="p-1.5 text-text-muted hover:text-red-500 bg-slate-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          {!isReplyAuthor && (
                            <button 
                              onClick={() => onReport(reply.id, 'reply')}
                              className="p-1.5 text-text-muted hover:text-red-500 bg-slate-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Report"
                            >
                              <Flag size={14} />
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-2 mt-2">
                            <textarea 
                              value={editReplyText}
                              onChange={(e) => setEditReplyText(e.target.value)}
                              className="w-full p-3 bg-white border border-navy rounded-xl text-sm focus:ring-1 focus:ring-navy outline-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  onEditReply(reply.id, editReplyText);
                                  setEditingReplyId(null);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              >
                                <Check size={12} /> Save
                              </button>
                              <button 
                                onClick={() => setEditingReplyId(null)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-text-muted text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                              >
                                <X size={12} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-text-secondary text-sm leading-relaxed">{reply.content}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border bg-search-bg/50">
        <div className="max-w-2xl mx-auto">
          {currentUser ? (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-background-card border border-border overflow-hidden flex-shrink-0">
                <img src={currentUser.avatar} alt="me" className="w-full h-full object-cover" />
              </div>
              <input 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && replyText.trim()) {
                    onAddReply(replyText);
                    setReplyText('');
                  }
                }}
                placeholder="Write a reply..."
                className="flex-1 px-4 py-3 bg-background-card rounded-xl border border-border focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all text-sm font-medium"
              />
              <button 
                disabled={!replyText.trim()}
                onClick={() => {
                  onAddReply(replyText);
                  setReplyText('');
                }}
                className="p-3 bg-navy text-white rounded-xl shadow-lg shadow-navy/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                <Send size={20} />
              </button>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-border border-dashed text-center">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Login to participate in the discussion</p>
              <button 
                onClick={() => onAuthOpen('login')}
                className="px-6 py-2 bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-navy/20 hover:scale-105 transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ThreadCard({ thread, onClick, onReport }: { thread: Thread, onClick: () => void, onReport?: (id: string, type: 'thread') => void, key?: string }) {
  const getBadgeStyles = (cat: string) => {
    if (cat.includes('IT')) return 'bg-blue-100/10 text-blue-400 border border-blue-400/20';
    if (cat.includes('Events')) return 'bg-orange-100/10 text-orange-400 border border-orange-400/20';
    if (cat.includes('Academic')) return 'bg-emerald-100/10 text-emerald-400 border border-emerald-400/20';
    if (cat.includes('Freedom')) return 'bg-pink-100/10 text-pink-400 border border-pink-400/20';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-background-card p-6 rounded-3xl border border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-navy/5 hover:border-border transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded tracking-wider ${getBadgeStyles(thread.category)}`}>
              {thread.category}
            </span>
            <span className="text-text-muted text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} /> {thread.time}
            </span>
          </div>
          <h3 className="text-xl font-black text-navy leading-tight group-hover:text-blue-600 transition-colors">
            {thread.title}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-search-bg overflow-hidden flex-shrink-0 shadow-inner border border-border">
          <img src={thread.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.author.replace('@', '')}`} alt="author" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <p className="text-text-secondary line-clamp-2 text-sm leading-relaxed mb-6 font-medium">
        {thread.preview}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-navy">
            <MessageSquare size={14} className="opacity-60" />
            <span className="text-[10px] font-black uppercase tracking-widest">{thread.replies.length}</span>
          </div>
          <div className="flex items-center gap-2 text-navy">
            <Eye size={14} className="opacity-60" />
            <span className="text-[10px] font-black uppercase tracking-widest">{thread.views}</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-text-muted border-l border-slate-100 pl-4 ml-1">
            by {thread.author}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onReport && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onReport(thread.id, 'thread');
              }}
              className="p-2 transition-all text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100"
              title="Report Thread"
            >
              <Flag size={14} />
            </button>
          )}
          <div className="bg-navy p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 shadow-lg shadow-navy/20">
            <ArrowLeft className="rotate-180" size={14} strokeWidth={3} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreateThreadModal({ isOpen, onClose, onPost, initialData }: { isOpen: boolean, onClose: () => void, onPost: (title: string, desc: string, cat: string) => void, initialData?: { title: string, content: string, category: string } }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [desc, setDesc] = useState(initialData?.content || '');
  const [cat, setCat] = useState(initialData?.category || 'Academic');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDesc(initialData?.content || '');
      setCat(initialData?.category === 'IT Department' ? 'IT' : (initialData?.category || 'Academic'));
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 dark:bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-background-card rounded-[32px] p-8 shadow-2xl border border-white/10"
      >
        <h2 className="text-3xl font-black text-navy mb-8 tracking-tight">{initialData ? 'Edit Discussion' : 'Post Discussion'}</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-text-muted uppercase tracking-widest ml-1">Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 rounded-2xl bg-search-bg border border-transparent focus:bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all font-bold text-navy"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-black text-text-muted uppercase tracking-widest ml-1">Description</label>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Provide more context..."
              rows={4}
              className="w-full p-4 rounded-2xl bg-search-bg border border-transparent focus:bg-background-card focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all font-medium text-text-main resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-black text-text-muted uppercase tracking-widest ml-1">Category</label>
            <select 
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full p-4 rounded-2xl bg-search-bg border border-transparent focus:bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all font-bold text-navy"
            >
              <option value="IT">IT Department</option>
              <option value="Events">Campus Events</option>
              <option value="Academic">Academic Affairs</option>
              <option value="Freedom Wall">Freedom Wall</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-4 pt-10">
          <button 
            onClick={onClose}
            className="flex-1 py-4 font-black text-text-muted hover:bg-slate-50 text-sm uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
          >
            Discard
          </button>
          <button 
            disabled={!title.trim()}
            onClick={() => {
              if (title.trim()) {
                onPost(title, desc, cat);
                onClose();
                setTitle(''); setDesc('');
              }
            }}
            className="flex-1 py-4 font-black text-white bg-navy text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-navy/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {initialData ? 'Save Changes' : 'Post Now'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function HelpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-navy/60 dark:bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-background-card rounded-[40px] p-10 shadow-2xl border border-border overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Info size={160} className="text-navy" />
        </div>

        <div className="relative space-y-8">
          <div>
            <div className="bg-navy/5 w-12 h-12 rounded-2xl flex items-center justify-center text-navy mb-4">
              <Info size={24} />
            </div>
            <h2 className="text-3xl font-black text-navy tracking-tight">Campus Navigator</h2>
            <p className="text-text-secondary font-medium mt-2">Master the CampusForum interface in minutes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Threads', desc: 'Organized discussions for various campus topics.', icon: MessageSquare },
              { title: 'Freedom Wall', desc: 'Anonymous or identified posts for personal expression.', icon: Heart },
              { title: 'AI Helper', desc: 'Ask campus-related questions in the sidebar.', icon: Bot },
              { title: 'Messages', desc: 'Directly chat with other students securely.', icon: Mail }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2 text-navy">
                  <item.icon size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">{item.title}</span>
                </div>
                <p className="text-[11px] text-text-secondary font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-navy text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-navy/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ForumListScreen({ 
  onBack, 
  currentUser, 
  onLogOut, 
  onAuthOpen, 
  threads, 
  setThreads, 
  onProfileClick,
  notify,
  onMessagesClick,
  onReport,
  onMessageUser,
  notifications,
  conversations,
  isNotificationsOpen,
  setIsNotificationsOpen,
  markNotificationRead,
  clearAllNotifications,
  setScreen,
  setActiveConvId,
  selectedThreadId,
  setSelectedThreadId,
  theme,
  setTheme
}: { 
  onBack: () => void, 
  currentUser: UserAccount | null, 
  onLogOut: () => void, 
  onAuthOpen: (mode: 'login' | 'signup') => void, 
  threads: Thread[], 
  setThreads: (threads: Thread[] | ((prev: Thread[]) => Thread[])) => void,
  onProfileClick: (username: string) => void,
  notify: (
    msg: string, 
    type?: 'success' | 'error' | 'info', 
    link?: { type: 'thread' | 'message' | 'profile', id: string },
    avatar?: string
  ) => void,
  onMessagesClick: () => void,
  onReport: (id: string, type: 'thread' | 'reply') => void,
  onMessageUser: (username: string) => void,
  notifications: ForumNotification[],
  conversations: Conversation[],
  isNotificationsOpen: boolean,
  setIsNotificationsOpen: (open: boolean) => void,
  markNotificationRead: (id: string) => void,
  clearAllNotifications: () => void,
  setScreen: (screen: 'welcome' | 'forum' | 'profile' | 'messages') => void,
  setActiveConvId: (id: string | null) => void,
  selectedThreadId: string | null,
  setSelectedThreadId: (id: string | null) => void,
  theme: 'light' | 'dark',
  setTheme: (theme: 'light' | 'dark') => void,
  key?: string 
}) {
  const [filter, setFilter] = useState<FilterType>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const filteredThreads = useMemo(() => {
    let result = [...threads];
    // Filter
    if (filter !== 'All') {
      result = result.filter(t => {
        if (filter === 'IT' && t.category === 'IT Department') return true;
        return t.category === filter;
      });
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.preview.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'newest') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });
    return result;
  }, [filter, threads, searchQuery, sortOrder]);

  const trendingTopics = [
    { tag: '#Registration2026', count: '1.2k students', query: 'registration' },
    { tag: '#LibraryHours', count: '450 posts', query: 'library' },
    { tag: '#InternshipFair', count: 'New', query: 'internship' },
    { tag: '#ProjectPartners', count: '150 posts', query: 'partners' },
    { tag: '#CampusSafety', count: '600 students', query: 'safety' },
    { tag: '#MusicAuditions', count: '85 entries', query: 'auditions' }
  ];

  const addThread = (title: string, desc: string, category: string) => {
    const now = Date.now();
    const authorName = currentUser ? currentUser.username : 'anonymous';
    const finalCategory = category === 'IT' ? 'IT Department' : (category === 'Events' ? 'Events' : (category === 'Freedom Wall' ? 'Freedom Wall' : 'Academic'));
    const newThread: Thread = {
      id: now.toString(),
      category: finalCategory,
      time: 'Just now',
      timestamp: now,
      author: `@${authorName}`,
      authorId: currentUser?.id,
      authorAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`,
      title,
      preview: desc.substring(0, 100) + (desc.length > 100 ? '...' : ''),
      content: desc,
      replies: [],
      views: 0,
      catColor: category === 'IT' ? '#3b82f6' : (category === 'Events' ? '#f97316' : (category === 'Freedom Wall' ? '#ec4899' : '#22c55e')),
    };
    setThreads([newThread, ...threads]);
    notify('Discussion posted successfully!', 'success', { type: 'thread', id: now.toString() }, currentUser?.avatar);
  };

  const updateThread = (title: string, desc: string, category: string) => {
    if (!selectedThreadId) return;
    setThreads(prev => prev.map(t => {
      if (t.id === selectedThreadId) {
        const finalCategory = category === 'IT' ? 'IT Department' : (category === 'Events' ? 'Events' : (category === 'Freedom Wall' ? 'Freedom Wall' : 'Academic'));
        return {
          ...t,
          title,
          content: desc,
          category: finalCategory,
          catColor: category === 'IT' ? '#3b82f6' : (category === 'Events' ? '#f97316' : (category === 'Freedom Wall' ? '#ec4899' : '#22c55e')),
          preview: desc.substring(0, 100) + (desc.length > 100 ? '...' : ''),
        };
      }
      return t;
    }));
    notify('Discussion updated!', 'info');
  };

  const addReply = (threadId: string, content: string) => {
    const now = Date.now();
    const authorName = currentUser ? currentUser.username : 'anonymous';
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const newReply: Reply = {
          id: now.toString(),
          author: `@${authorName}`,
          authorId: currentUser?.id,
          avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`,
          content,
          time: 'Just now',
          timestamp: now
        };
        return { ...t, replies: [...t.replies, newReply] };
      }
      return t;
    }));
    notify('Reply added!', 'success', { type: 'thread', id: threadId }, currentUser?.avatar);
  };

  const editReply = (threadId: string, replyId: string, content: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies.map(r => r.id === replyId ? { ...r, content, time: 'Edited' } : r)
        };
      }
      return t;
    }));
    notify('Reply updated!', 'info');
  };

  const deleteReply = (threadId: string, replyId: string) => {
    // Note: removed window.confirm for iframe compatibility
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies.filter(r => r.id !== replyId)
        };
      }
      return t;
    }));
    notify('Reply deleted!', 'error');
  };

  const deleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    setSelectedThreadId(null);
    notify('Discussion deleted!', 'error');
  };

  const selectedThread = useMemo(() => 
    threads.find(t => t.id === selectedThreadId), 
  [threads, selectedThreadId]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr_280px] grid-rows-[70px_1fr] bg-campus-bg"
    >
      {/* Header */}
      <header className="md:col-span-3 bg-background-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-[60] h-[70px]">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => {
            if (selectedThreadId) {
              setSelectedThreadId(null);
            } else {
              setFilter('All');
              setSearchQuery('');
            }
          }}
        >
          <div className="bg-navy w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-navy/20">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-navy tracking-tight hidden sm:block group-hover:text-blue-600 transition-colors">CampusForum</h1>
        </div>
        
        <div className="flex-1 max-w-md mx-4 md:mx-12">
          <div className="bg-background-card border border-border rounded-xl px-4 py-2.5 text-text-secondary text-sm flex items-center gap-3 border border-transparent focus-within:border-navy focus-within:bg-background-card transition-all shadow-sm">
            <Search size={18} className="text-text-muted" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions, events..."
              className="bg-transparent outline-none flex-1 font-medium text-navy placeholder:text-text-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary transition-all cursor-pointer group"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
            ) : (
              <Sun size={20} className="group-hover:rotate-12 transition-transform" />
            )}
          </button>

          {currentUser ? (
            <>
              <button 
                onClick={onMessagesClick}
                className="text-text-secondary hover:text-navy transition-colors cursor-pointer flex items-center gap-2 group"
              >
                <div className="relative">
                  <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
                  {conversations.some(c => c.messages.some(m => m.senderId !== currentUser.id && m.timestamp > (c.updatedAt - 1000))) && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Messages</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`text-text-secondary hover:text-navy transition-colors cursor-pointer flex items-center gap-2 group ${isNotificationsOpen ? 'text-navy' : ''}`}
                >
                  <div className="relative">
                    <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                    {notifications.some(n => !n.isRead) && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="text-[6px] text-white font-black">{notifications.filter(n => !n.isRead).length}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest hidden md:block">Alerts</span>
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <NotificationCenter 
                      notifications={[...notifications].reverse()} 
                      onClose={() => setIsNotificationsOpen(false)}
                      onMarkRead={markNotificationRead}
                      onClearAll={clearAllNotifications}
                      onNavigate={(link) => {
                        if (link.type === 'thread') {
                          setSelectedThreadId(link.id);
                          setScreen('forum');
                        } else if (link.type === 'message') {
                          setActiveConvId(link.id);
                          setScreen('messages');
                        } else if (link.type === 'profile') {
                          onProfileClick(link.id);
                        }
                        setIsNotificationsOpen(false);
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-2">
                    {currentUser.id.startsWith('guest_') && (
                      <span className="text-[8px] font-black bg-slate-100 text-text-muted px-1.5 py-0.5 rounded uppercase tracking-tighter">Guest</span>
                    )}
                    <div className="text-xs font-black text-navy leading-none">@{currentUser.username}</div>
                  </div>
                  <button onClick={onLogOut} className="text-[10px] font-bold text-red-500 uppercase tracking-wider hover:underline cursor-pointer">Logout</button>
                </div>
                <div 
                  onClick={() => onProfileClick(currentUser.username)}
                  className="w-9 h-9 rounded-full bg-slate-100 border border-border overflow-hidden cursor-pointer hover:border-navy transition-colors"
                >
                  <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onAuthOpen('login')}
                className="px-4 py-2 text-xs font-black text-navy uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => onAuthOpen('signup')}
                className="px-4 py-2 text-xs font-black text-white bg-navy uppercase tracking-widest rounded-xl shadow-lg shadow-navy/20 hover:scale-105 transition-all cursor-pointer"
              >
                Join
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar Left */}
      <aside className="bg-background-card border-r border-border p-6 hidden md:flex flex-col gap-1 sticky top-[70px] h-[calc(100vh-70px)]">
        {(['All', 'IT', 'Events', 'Academic', 'Freedom Wall'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              if (f === 'All') setSearchQuery('');
              setSelectedThreadId(null);
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-3 ${
              filter === f 
                ? 'bg-navy text-white shadow-xl shadow-navy/20' 
                : 'text-text-secondary hover:bg-slate-50'
            }`}
          >
            {f === 'All' && <MessageSquare size={16} />}
            {f === 'IT' && <Hash size={16} />}
            {f === 'Events' && <Calendar size={16} />}
            {f === 'Academic' && <BookOpen size={16} />}
            {f === 'Freedom Wall' && <Heart size={16} className="text-pink-500" />}
            <span>{f === 'IT' ? 'IT Dept' : (f === 'All' ? 'Discussions' : f)}</span>
          </button>
        ))}
        
        <div className="mt-10 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-4 mb-3">
          Pinned
        </div>
        {[
          { icon: <Hash size={14} />, label: 'Graduation', query: 'graduation' },
          { icon: <Hash size={14} />, label: 'Chess Club', query: 'chess' },
          { icon: <Hash size={14} />, label: 'Library', query: 'library' },
          { icon: <Hash size={14} />, label: 'Housing', query: 'housing' },
          { icon: <Hash size={14} />, label: 'Internships', query: 'intern' },
          { icon: <Hash size={14} />, label: 'Food Court', query: 'food' },
          { icon: <Hash size={14} />, label: 'Study Groups', query: 'study' },
          { icon: <Hash size={14} />, label: 'Lost & Found', query: 'lost' }
        ].map((item) => (
          <button 
            key={item.label}
            onClick={() => {
              setSearchQuery(item.query);
              setFilter('All');
              setSelectedThreadId(null);
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-3 ${
              searchQuery.toLowerCase() === item.query.toLowerCase()
                ? 'bg-slate-100 text-navy'
                : 'text-text-secondary hover:bg-slate-50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      {/* Main Content Area */}
      <main className="p-4 md:p-8 overflow-y-auto no-scrollbar h-[calc(100vh-70px)] bg-campus-bg/50">
        <div className="max-w-3xl mx-auto h-full">
          <AnimatePresence mode="wait">
            {selectedThread ? (
              <ThreadDetailView 
                key="detail"
                thread={selectedThread} 
                onBack={() => setSelectedThreadId(null)}
                onAddReply={(content) => addReply(selectedThread.id, content)}
                currentUser={currentUser}
                onAuthOpen={onAuthOpen}
                onEdit={() => setIsEditModalOpen(true)}
                onEditReply={(replyId, content) => editReply(selectedThread.id, replyId, content)}
                onDeleteReply={(replyId) => deleteReply(selectedThread.id, replyId)}
                onDeleteThread={() => deleteThread(selectedThread.id)}
                onProfileClick={onProfileClick}
                onReport={onReport}
                onMessageUser={onMessageUser}
              />
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Mobile Filter */}
                <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {(['All', 'IT', 'Events', 'Academic', 'Freedom Wall'] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                        filter === f ? 'bg-navy text-white shadow-lg shadow-navy/20' : 'bg-white text-text-secondary border border-border'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-navy tracking-tight">{filter === 'All' ? 'Latest Feed' : `${filter} Feed`}</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Found {filteredThreads.length} conversations</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-border shadow-sm">
                    <div className="px-3 text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                      <ArrowUpDown size={12} />
                      <span className="hidden sm:inline">Order</span>
                    </div>
                    <div className="flex bg-slate-100 rounded-xl overflow-hidden p-1">
                      <button 
                        onClick={() => setSortOrder('newest')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortOrder === 'newest' ? 'bg-navy text-white shadow-md shadow-navy/20' : 'text-text-muted hover:text-navy hover:bg-white/50'}`}
                      >
                        Newest
                      </button>
                      <button 
                        onClick={() => setSortOrder('oldest')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortOrder === 'oldest' ? 'bg-navy text-white shadow-md shadow-navy/20' : 'text-text-muted hover:text-navy hover:bg-white/50'}`}
                      >
                        Oldest
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pb-24">
                  <AnimatePresence mode="popLayout">
                    {filteredThreads.map((thread) => (
                      <ThreadCard 
                        key={thread.id} 
                        thread={thread} 
                        onClick={() => setSelectedThreadId(thread.id)}
                        onReport={onReport}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {filteredThreads.length === 0 && (
                    <div className="text-center py-20 bg-white/40 rounded-[32px] border-2 border-dashed border-border">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted shadow-sm">
                        <Search size={32} />
                      </div>
                      <p className="text-text-secondary font-black uppercase text-xs tracking-widest">No matching threads</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Sidebar Right */}
      <aside className="bg-background-card border-l border-border p-6 hidden lg:flex flex-col gap-8 sticky top-[70px] h-[calc(100vh-70px)]">
        <div>
          <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">
            Trending Topics
          </div>
          <div className="space-y-6">
            {trendingTopics.map((topic, i) => (
              <div 
                key={i} 
                className="group cursor-pointer"
                onClick={() => {
                  setSearchQuery(topic.query);
                  setFilter('All');
                  setSelectedThreadId(null);
                }}
              >
                <div className="text-sm font-black text-navy group-hover:text-blue-600 transition-colors">{topic.tag}</div>
                <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-0.5">{topic.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-navy/5 p-6 rounded-3xl border border-navy/5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-navy" />
            <div className="text-[10px] font-black text-navy uppercase tracking-widest">Help Center</div>
          </div>
          <p className="text-xs text-text-secondary font-medium leading-relaxed">
            New to CampusForum? Check our quick guide to getting started.
          </p>
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="mt-4 text-[10px] font-black text-navy uppercase tracking-widest hover:underline transition-all cursor-pointer"
          >
            Read Guide →
          </button>
        </div>
      </aside>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* FAB */}
      {!selectedThreadId && (
        <div className="fixed bottom-8 right-6 md:right-[320px] z-[70]">
          <button 
            id="create-thread-btn"
            onClick={() => {
              if (currentUser) {
                setIsModalOpen(true);
              } else {
                onAuthOpen('signup');
              }
            }}
            className="flex items-center gap-3 bg-navy text-white px-8 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-navy/40 hover:scale-[1.05] active:scale-[0.95] transition-all cursor-pointer group"
          >
            <div className="bg-white text-navy p-1 rounded-lg group-hover:rotate-90 transition-transform">
              <Plus size={18} strokeWidth={3} />
            </div>
            <span className="hidden sm:inline">New Thread</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>
      )}

      <CreateThreadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPost={addThread} 
      />

      {selectedThread && (
        <CreateThreadModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          onPost={updateThread}
          initialData={{
            title: selectedThread.title,
            content: selectedThread.content,
            category: selectedThread.category
          }}
        />
      )}
    </motion.div>
  );
}

function ProfileScreen({ 
  user, 
  threads, 
  onBack, 
  onLogOut, 
  onAvatarChange, 
  onMessageUser, 
  currentUser,
  onUpdateProfile,
  theme,
  setTheme
}: { 
  user: any, 
  threads: Thread[], 
  onBack: () => void, 
  onLogOut: () => void, 
  onAvatarChange?: (url: string) => void, 
  onMessageUser?: (username: string) => void, 
  currentUser: UserAccount | null,
  onUpdateProfile?: (username: string, bio: string, displayName: string) => void,
  theme: 'light' | 'dark',
  setTheme: (theme: 'light' | 'dark') => void,
  key?: string 
}) {
  const [activeTab, setActiveTab] = useState<'threads' | 'replies'>('threads');
  const [isEditing, setIsEditing] = useState(false);
  
  // Look up full user info if possible to get stable data
  const profileOwner = useMemo(() => {
    const users = JSON.parse(localStorage.getItem('campus-users') || '[]');
    const found = users.find((u: any) => u.username === user.username);
    if (found) return found;

    // Fallback: search threads for a post by this user to find their avatar
    const userPost = threads.find(t => t.author === `@${user.username}`);
    if (userPost) return { ...user, avatar: userPost.authorAvatar, bio: 'Student at CampusForum' };

    // Fallback: search replies
    const userReply = threads.flatMap(t => t.replies).find(r => r.author === `@${user.username}`);
    if (userReply) return { ...user, avatar: userReply.avatar, bio: 'Student at CampusForum' };

    return user;
  }, [user.username, threads]);
  
  const [editUsername, setEditUsername] = useState(profileOwner.username);
  const [editDisplayName, setEditDisplayName] = useState(profileOwner.displayName || '');
  const [editBio, setEditBio] = useState(profileOwner.bio || '');

  useEffect(() => {
    setEditUsername(profileOwner.username);
    setEditDisplayName(profileOwner.displayName || '');
    setEditBio(profileOwner.bio || '');
  }, [profileOwner]);

  const avatar = profileOwner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileOwner.username}`;
  const email = profileOwner.email || `${profileOwner.username}@campus.edu`;
  const bio = profileOwner.bio || 'No bio yet.';
  
  const isOwnProfile = currentUser && currentUser.id === profileOwner.id;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const userThreads = threads.filter(t => t.author === `@${profileOwner.username}`);
  const userReplies = threads.flatMap(t => 
    t.replies
      .filter(r => r.author === `@${profileOwner.username}`)
      .map(r => ({ ...r, threadTitle: t.title, threadId: t.id }))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-campus-bg overflow-y-auto no-scrollbar"
    >
      <header className="bg-background-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-[60] h-[70px]">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onBack}
        >
          <div className="bg-navy w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-navy tracking-tight hidden sm:block">CampusForum</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary transition-all cursor-pointer group"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
            ) : (
              <Sun size={20} className="group-hover:rotate-12 transition-transform" />
            )}
          </button>
          
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black text-navy leading-none">@{currentUser?.username || profileOwner.username}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-border overflow-hidden">
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12 p-6 lg:p-12">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 bg-background-card rounded-2xl font-black text-navy text-[10px] uppercase tracking-widest shadow-sm hover:scale-105 transition-all cursor-pointer">
            <ArrowLeft size={16} /> Back to Forum
          </button>
          {user.id && (
            <button onClick={onLogOut} className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all cursor-pointer">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[40px] bg-background-card p-2 shadow-2xl shadow-navy/10 relative overflow-hidden">
              <img src={avatar} alt="profile" className="w-full h-full object-cover rounded-[32px]" />
              {isOwnProfile && currentUser && !currentUser.id.startsWith('guest_') && (
                <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer p-4 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-all">
                    <Camera className="text-white" size={24} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              )}
            </div>
            {isOwnProfile && currentUser && !currentUser.id.startsWith('guest_') && (
              <div className="absolute -bottom-2 -right-2 bg-navy w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-navy/20 border-4 border-campus-bg">
                <Camera size={18} />
              </div>
            )}
          </div>
          <div className="text-center md:text-left space-y-4 flex-1">
            {isEditing ? (
              <div className="space-y-4 w-full max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Display Name</label>
                  <input 
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-background-card border border-border focus:border-navy outline-none font-bold text-navy"
                    placeholder="Preferred Display Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Username</label>
                  <input 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className="w-full p-4 rounded-2xl bg-background-card border border-border focus:border-navy outline-none font-bold text-navy"
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-background-card border border-border focus:border-navy outline-none font-medium text-text-secondary resize-none"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      onUpdateProfile?.(editUsername, editBio, editDisplayName);
                      setIsEditing(false);
                    }}
                    className="px-6 py-3 bg-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all cursor-pointer"
                  >
                    Save Profile
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-slate-100 text-text-muted rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-4xl font-black text-navy leading-tight tracking-tight">
                      {profileOwner.displayName || profileOwner.username}
                    </h1>
                    <div className="text-text-muted font-bold -mt-1">@{profileOwner.username}</div>
                  </div>
                  {profileOwner.id?.startsWith('guest_') && (
                    <span className="px-3 py-1 bg-slate-100 text-text-muted text-[10px] font-black uppercase tracking-widest rounded-full">Anonymous Mode</span>
                  )}
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-slate-100 rounded-xl text-text-muted hover:text-navy transition-all cursor-pointer"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </div>
                <p className="text-text-secondary font-medium max-w-md">{bio}</p>
                {!profileOwner.id?.startsWith('guest_') && (
                  <p className="text-text-secondary font-bold flex items-center justify-center md:justify-start gap-2">
                    <Mail size={16} className="text-text-muted" /> {email}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                  {!isOwnProfile && (
                    <button 
                      onClick={() => onMessageUser?.(profileOwner.username)}
                      className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-navy/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <MessageCircle size={16} /> Send Message
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('threads')}
                    className={`px-5 py-3 rounded-2xl shadow-sm border transition-all ${activeTab === 'threads' ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-border hover:bg-slate-50'}`}
                  >
                    <div className="text-2xl font-black">{userThreads.length}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Discussions</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('replies')}
                    className={`px-5 py-3 rounded-2xl shadow-sm border transition-all ${activeTab === 'replies' ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-border hover:bg-slate-50'}`}
                  >
                    <div className="text-2xl font-black">{userReplies.length}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Replies</div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-black text-navy tracking-tight">
              {activeTab === 'threads' ? 'Discussions' : 'Replies'}
            </h2>
          </div>

          {activeTab === 'threads' ? (
            <div className="space-y-4 pb-12">
              {userThreads.length > 0 ? (
                userThreads.map(t => (
                  <div key={t.id} className="bg-white p-6 rounded-3xl border border-border flex items-center justify-between group hover:border-navy/20 transition-all">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-navy uppercase tracking-widest opacity-60">{t.category}</div>
                      <div className="text-lg font-black text-navy">{t.title}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t.time}</div>
                      <button className="p-2 bg-slate-50 text-text-muted rounded-xl hover:text-navy transition-colors">
                        <ArrowLeft className="rotate-180" size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white/40 rounded-[32px] border-2 border-dashed border-border">
                  <p className="text-text-secondary font-black uppercase text-xs tracking-widest">No discussions yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pb-12">
              {userReplies.length > 0 ? (
                userReplies.map(r => (
                  <div key={r.id} className="bg-white p-6 rounded-3xl border border-border space-y-3 hover:border-navy/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">
                        Replied to <span className="text-navy">{r.threadTitle}</span>
                      </div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{r.time}</div>
                    </div>
                    <p className="text-text-secondary font-medium leading-relaxed">{r.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white/40 rounded-[32px] border-2 border-dashed border-border">
                  <p className="text-text-secondary font-black uppercase text-xs tracking-widest">No replies yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// MAIN APP ENTRY
// ==========================================

export default function App() {
  const [screen, setScreen] = useState<'welcome' | 'forum' | 'profile' | 'messages'>(() => getLocalStorage('campus-view', 'welcome'));
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>(() => getLocalStorage('campus-threads', INITIAL_THREADS));
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getLocalStorage('campus-auth', null));
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const user = getLocalStorage('campus-auth', null);
    const userId = user?.id || 'anonymous';
    return getLocalStorage(`campus-convs-${userId}`, []);
  });
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [notifications, setNotifications] = useState<ForumNotification[]>(() => {
    const user = getLocalStorage('campus-auth', null);
    const userId = user?.id || 'anonymous';
    return getLocalStorage(`campus-notifs-${userId}`, []);
  });
  const [activeToasts, setActiveToasts] = useState<string[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getLocalStorage('campus-theme', 'light'));

  const [reportConfig, setReportConfig] = useState<{ id: string, type: 'thread' | 'reply' } | null>(null);

  // Theme Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setLocalStorage('campus-theme', theme);
  }, [theme]);

  // Sound Cues
  const playPing = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  // Migration: Clean up any old data with the forbidden name
  useEffect(() => {
    const forbidden = '@sarah_dev';
    const replacement = '@lexi_dev';
    
    // Clean threads
    let threadsChanged = false;
    const cleanedThreads = threads.map(t => {
      let threadUpdated = false;
      let newAuthor = t.author;
      let newAvatar = t.authorAvatar;
      
      if (t.author === forbidden) {
        newAuthor = replacement;
        newAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=lexi';
        threadUpdated = true;
      }
      
      const newReplies = t.replies.map(r => {
        if (r.author === forbidden) {
          threadUpdated = true;
          return { 
            ...r, 
            author: replacement, 
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lexi' 
          };
        }
        return r;
      });
      
      if (threadUpdated) {
        threadsChanged = true;
        return { ...t, author: newAuthor, authorAvatar: newAvatar, replies: newReplies };
      }
      return t;
    });
    
    if (threadsChanged) {
      setThreads(cleanedThreads);
    }

    // Clean stored users
    const storedUsers = JSON.parse(localStorage.getItem('campus-users') || '[]');
    let usersChanged = false;
    const cleanedUsers = storedUsers.map((u: any) => {
      if (u.username === 'sarah_dev' || u.username === 'sarah') {
        usersChanged = true;
        return { 
          ...u, 
          username: 'lexi_dev', 
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lexi' 
        };
      }
      return u;
    });
    if (usersChanged) {
      localStorage.setItem('campus-users', JSON.stringify(cleanedUsers));
    }
  }, []);

  // Re-sync logic for storage changes (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!currentUser) return;
      const userId = currentUser.id;
      
      if (e.key === `campus-convs-${userId}`) {
        setConversations(JSON.parse(e.newValue || '[]'));
        playPing(); // Notify for incoming message
      }
      if (e.key === `campus-notifs-${userId}`) {
        setNotifications(JSON.parse(e.newValue || '[]'));
        playPing(); // Notify for alert
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser?.id]);

  useEffect(() => {
    setLocalStorage('campus-view', screen);
  }, [screen]);

  useEffect(() => {
    setLocalStorage('campus-threads', threads);
  }, [threads]);

  useEffect(() => {
    setLocalStorage('campus-auth', currentUser);
    
    // When user changes, reload their specific conversations and notifications
    const userId = currentUser?.id || 'anonymous';
    setConversations(getLocalStorage(`campus-convs-${userId}`, []));
    setNotifications(getLocalStorage(`campus-notifs-${userId}`, []));
    setActiveConvId(null); // Clear selected chat on account swap
  }, [currentUser?.id]);

  useEffect(() => {
    const userId = currentUser?.id || 'anonymous';
    setLocalStorage(`campus-convs-${userId}`, conversations);
  }, [conversations, currentUser?.id]);

  useEffect(() => {
    const userId = currentUser?.id || 'anonymous';
    setLocalStorage(`campus-notifs-${userId}`, notifications);
  }, [notifications, currentUser?.id]);

  const addNotification = (
    message: string, 
    type: 'success' | 'error' | 'info' = 'info', 
    link?: { type: 'thread' | 'message' | 'profile', id: string },
    avatar?: string
  ) => {
    const id = Date.now().toString();
    const newNotif: ForumNotification = { 
      id, 
      message, 
      type, 
      isRead: false, 
      timestamp: Date.now(),
      link,
      avatar
    };
    setNotifications(prev => [...prev, newNotif]);
    setActiveToasts(prev => [...prev, id]);
    playPing();
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleAvatarChange = (url: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, avatar: url };
    setCurrentUser(updated);
    
    // Update in stored users too
    const users = JSON.parse(localStorage.getItem('campus-users') || '[]');
    const updatedUsers = users.map((u: any) => u.id === currentUser.id ? { ...u, avatar: url } : u);
    localStorage.setItem('campus-users', JSON.stringify(updatedUsers));
    
    // Update all threads/replies with new avatar
    setThreads(prev => prev.map(t => {
      const isAuthor = t.author === `@${currentUser.username}`;
      const updatedReplies = t.replies.map(r => 
        r.author === `@${currentUser.username}` ? { ...r, avatar: url } : r
      );
      return {
        ...t,
        authorAvatar: isAuthor ? url : t.authorAvatar,
        replies: updatedReplies
      };
    }));

    addNotification('Profile picture updated!', 'success');
  };

  const handleUpdateProfile = (newUsername: string, newBio: string, newDisplayName: string) => {
    if (!currentUser) return;
    const oldUsername = currentUser.username;
    const updated = { ...currentUser, username: newUsername, bio: newBio, displayName: newDisplayName };
    setCurrentUser(updated);

    // Update global users list
    const users = JSON.parse(localStorage.getItem('campus-users') || '[]');
    const updatedUsers = users.map((u: any) => u.id === currentUser.id ? { ...u, username: newUsername, bio: newBio, displayName: newDisplayName } : u);
    localStorage.setItem('campus-users', JSON.stringify(updatedUsers));

    // Update all threads/replies with new username if needed
    if (oldUsername !== newUsername) {
      setThreads(prev => prev.map(t => {
        const isAuthor = t.author === `@${oldUsername}`;
        const updatedReplies = t.replies.map(r => 
          r.author === `@${oldUsername}` ? { ...r, author: `@${newUsername}` } : r
        );
        return {
          ...t,
          author: isAuthor ? `@${newUsername}` : t.author,
          replies: updatedReplies
        };
      }));
      setConversations(prev => prev.map(c => {
        const updatedParticipants = c.participants.map(p => 
          p.username === oldUsername ? { ...p, username: newUsername } : p
        );
        const updatedMessages = c.messages.map(m => 
          m.senderName === oldUsername ? { ...m, senderName: newUsername } : m
        );
        return { ...c, participants: updatedParticipants, messages: updatedMessages };
      }));
      setProfileUsername(newUsername);
    }
    
    addNotification('Profile updated!', 'success');
  };

  const handleSendMessage = (convId: string, content: string) => {
    if (!currentUser) return;
    
    let recipientId: string | null = null;

    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          senderName: currentUser.username,
          content,
          timestamp: Date.now()
        };
        
        // Identify recipient
        const partner = c.participants.find(p => p.id !== currentUser.id);
        if (partner) recipientId = partner.id;

        const updatedConv = {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: content,
          updatedAt: Date.now()
        };

        // SYNC TO RECIPIENT'S STORAGE
        if (recipientId) {
          const recipientConvsKey = `campus-convs-${recipientId}`;
          const recipientNotifsKey = `campus-notifs-${recipientId}`;
          
          // Update Recipient Conversations
          const rConvs = JSON.parse(localStorage.getItem(recipientConvsKey) || '[]');
          const existingRConvIdx = rConvs.findIndex((rc: any) => rc.id === convId);
          
          if (existingRConvIdx > -1) {
            rConvs[existingRConvIdx].messages.push(newMsg);
            rConvs[existingRConvIdx].lastMessage = content;
            rConvs[existingRConvIdx].updatedAt = Date.now();
          } else {
            // Recipient doesn't have the conversation started yet
            rConvs.unshift(updatedConv);
          }
          localStorage.setItem(recipientConvsKey, JSON.stringify(rConvs));

          // Send a notification to recipient
          const rNotifs = JSON.parse(localStorage.getItem(recipientNotifsKey) || '[]');
          const newNotif: ForumNotification = {
            id: `msg_${Date.now()}`,
            message: `New message from @${currentUser.username}`,
            type: 'info',
            isRead: false,
            timestamp: Date.now(),
            link: { type: 'message', id: convId },
            avatar: currentUser.avatar
          };
          rNotifs.unshift(newNotif);
          localStorage.setItem(recipientNotifsKey, JSON.stringify(rNotifs));
        }

        return updatedConv;
      }
      return c;
    }));
    addNotification('Message sent!', 'success', { type: 'message', id: convId });
  };

  const handleReport = (id: string, type: 'thread' | 'reply') => {
    setReportConfig({ id, type });
  };

  const executeReport = (id: string, type: 'thread' | 'reply') => {
    // Find who we are reporting
    let reportedUserId: string | undefined = undefined;
    let threadId: string | null = null;

    if (type === 'thread') {
      const thread = threads.find(t => t.id === id);
      if (thread) {
        reportedUserId = thread.authorId;
        threadId = thread.id;
      }
    } else {
      // It's a reply. We need to find the thread first
      const thread = threads.find(t => t.replies.some(r => r.id === id));
      if (thread) {
        const reply = thread.replies.find(r => r.id === id);
        if (reply) {
          reportedUserId = reply.authorId;
          threadId = thread.id;
        }
      }
    }

    // Notify the reported user
    if (reportedUserId) {
      const recipientNotifsKey = `campus-notifs-${reportedUserId}`;
      const rNotifs = JSON.parse(localStorage.getItem(recipientNotifsKey) || '[]');
      
      const newNotif: ForumNotification = {
        id: `report_${Date.now()}`,
        message: `Your ${type} has been reported and is under review.`,
        type: 'error',
        isRead: false,
        timestamp: Date.now(),
        link: threadId ? { type: 'thread', id: threadId } : undefined,
        avatar: currentUser?.avatar
      };
      
      rNotifs.unshift(newNotif);
      localStorage.setItem(recipientNotifsKey, JSON.stringify(rNotifs));
    }

    addNotification('Report submitted. Thank you for keeping us safe!', 'info');
    setReportConfig(null);
  };

  const handleMessageUser = (partnerUsername: string) => {
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    
    const partnerClean = partnerUsername.replace('@', '');
    if (partnerClean === currentUser.username) {
      addNotification("You can't message yourself!", 'info');
      return;
    }

    const users = JSON.parse(localStorage.getItem('campus-users') || '[]');
    const partnerData = users.find((u: any) => u.username === partnerClean);
    const partnerId = partnerData?.id || `ext_${partnerClean}`;

    // Stable ID: sort participant IDs and join with underscore
    const stableConvId = [currentUser.id, partnerId].sort().join('_');

    const existingConv = conversations.find(c => c.id === stableConvId);

    if (!existingConv) {
      const newConv: Conversation = {
        id: stableConvId,
        participants: [
          { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar },
          { 
            id: partnerId, 
            username: partnerClean, 
            avatar: partnerData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerClean}` 
          }
        ],
        messages: [],
        updatedAt: Date.now()
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    } else {
      setActiveConvId(existingConv.id);
    }

    setScreen('messages');
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    addNotification('Logged out successfully', 'info');
    if (screen === 'profile' || screen === 'messages') setScreen('forum');
  };

  return (
    <div className="min-h-screen bg-campus-bg selection:bg-navy/10 selection:text-navy selection:rounded">
      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <WelcomeScreen 
            key="welcome" 
            onStart={() => setScreen('forum')} 
            theme={theme}
            setTheme={setTheme}
          />
        )}
        {screen === 'forum' && (
          <ForumListScreen 
            key="forum" 
            onBack={() => setScreen('welcome')} 
            currentUser={currentUser}
            onLogOut={handleLogOut}
            threads={threads}
            setThreads={setThreads}
            onProfileClick={(username) => {
              setProfileUsername(username);
              setScreen('profile');
            }}
            notify={addNotification}
            onMessagesClick={() => {
              setActiveConvId(null);
              setScreen('messages');
            }}
            onReport={handleReport}
            onMessageUser={handleMessageUser}
            onAuthOpen={(mode) => {
              setAuthMode(mode);
              setIsAuthOpen(true);
            }}
            notifications={notifications}
            conversations={conversations}
            isNotificationsOpen={isNotificationsOpen}
            setIsNotificationsOpen={setIsNotificationsOpen}
            markNotificationRead={markNotificationRead}
            clearAllNotifications={clearAllNotifications}
            setScreen={setScreen}
            setActiveConvId={setActiveConvId}
            selectedThreadId={selectedThreadId}
            setSelectedThreadId={setSelectedThreadId}
            theme={theme}
            setTheme={setTheme}
          />
        )}
        {screen === 'profile' && (
          <ProfileScreen 
            key="profile"
            user={profileUsername ? { username: profileUsername } as any : currentUser}
            threads={threads}
            onBack={() => setScreen('forum')}
            onLogOut={handleLogOut}
            onAvatarChange={handleAvatarChange}
            onUpdateProfile={handleUpdateProfile}
            onMessageUser={handleMessageUser}
            currentUser={currentUser}
            theme={theme}
            setTheme={setTheme}
          />
        )}
        {screen === 'messages' && currentUser && (
           <MessageScreen 
            currentUser={currentUser}
            onBack={() => setScreen('forum')}
            conversations={conversations}
            onSendMessage={handleSendMessage}
            activeConvId={activeConvId}
            onConvSelect={(id) => setActiveConvId(id)}
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        setMode={setAuthMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
          addNotification(
            `Welcome back, ${user.username}!`, 
            'success', 
            { type: 'profile', id: user.username },
            user.avatar
          );
        }}
      />

      <ConfirmationModal 
        isOpen={!!reportConfig}
        onClose={() => setReportConfig(null)}
        onConfirm={() => {
          if (reportConfig) {
            executeReport(reportConfig.id, reportConfig.type);
          }
        }}
        title={`Report ${reportConfig?.type === 'thread' ? 'Discussion' : 'Reply'}`}
        message={`Are you sure you want to report this ${reportConfig?.type}? Our moderators will review it to ensure it follows campus guidelines.`}
        confirmText="Submit Report"
        confirmVariant="red"
      />

      <div className="fixed bottom-0 right-0 p-8 z-[200] pointer-events-none flex flex-col items-end gap-4 overflow-hidden">
        <AnimatePresence>
          {activeToasts.map((toastId, idx) => {
            const notif = notifications.find(n => n.id === toastId);
            if (!notif) return null;
            return (
              <div key={toastId} className="pointer-events-auto">
                <NotificationToast 
                  index={idx}
                  notification={notif}
                  onClose={() => setActiveToasts(prev => prev.filter(tid => tid !== toastId))}
                  onView={() => {
                    if (notif.link) {
                      if (notif.link.type === 'thread') {
                        setSelectedThreadId(notif.link.id);
                        setScreen('forum');
                      } else if (notif.link.type === 'message') {
                        setActiveConvId(notif.link.id);
                        setScreen('messages');
                      } else if (notif.link.type === 'profile') {
                        setProfileUsername(notif.link.id);
                        setScreen('profile');
                      }
                    }
                    markNotificationRead(notif.id);
                  }}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
