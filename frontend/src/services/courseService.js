import { db } from '../firebase';
import { mentorDb } from '../firebaseMentor'; // Fetch courses from Mentor DB
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Mock Data Fallback
const MOCK_COURSES = [
  {
    id: "1",
    title: "Complete Python Bootcamp",
    instructor: "Jose Portilla",
    rating: 4.8,
    reviews: "15k",
    price: "$14.99",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Development",
    students: "12k",
    description: "Learn Python like a Professional! Start from the basics and go all the way to creating your own applications and games.",
    whatYouWillLearn: ["Python 3", "Advanced Features", "Game Development"],
    liveClassLink: "https://meet.google.com/xsp-didx-hev",
    content: [
        { 
            section: "Introduction", 
            lectures: 3, 
            duration: "15m",
            videos: [
                { id: "1-1", title: "Course Overview", duration: "5:00", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
                { id: "1-2", title: "Installation", duration: "10:00", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" }
            ]
        },
        { 
            section: "Setup", 
            lectures: 5, 
            duration: "45m",
            videos: [
                { id: "2-1", title: "IDE Setup", duration: "15:00", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" }
            ]
        }
    ]
  },
  {
    id: "2",
    title: "The Web Developer Bootcamp 2024",
    instructor: "Colt Steele",
    rating: 4.9,
    reviews: "22k",
    price: "$19.99",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Web Dev",
    students: "24k",
    description: "The only course you need to learn web development - HTML, CSS, JS, Node, and more!",
    liveClassLink: "https://meet.google.com/xsp-didx-hev",
    whatYouWillLearn: ["HTML & CSS", "JavaScript", "Node.js", "MongoDB"],
    content: [
        { section: "HTML Basics", lectures: 10, duration: "1h", videos: [{ id: "2-1", title: "HTML Intro", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" }] },
        { section: "CSS Styling", lectures: 12, duration: "1h 30m", videos: [] }
    ]
  },
  {
    id: "3",
    title: "Machine Learning A-Z",
    instructor: "Kirill Eremenko",
    rating: 4.7,
    reviews: "18k",
    price: "$12.99",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Data Science",
    students: "18k",
    description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.",
    whatYouWillLearn: ["Data Preprocessing", "Regression", "Classification"],
    liveClassLink: "https://meet.google.com/xsp-didx-hev",
    content: [
        { section: "Data Preprocessing", lectures: 6, duration: "45m", videos: [] },
        { section: "Regression", lectures: 8, duration: "1h", videos: [] }
    ]
  },
  {
    id: "4",
    title: "React - The Complete Guide",
    instructor: "Maximilian Schwarzmüller",
    rating: 4.8,
    reviews: "12k",
    price: "$16.99",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Web Dev",
    students: "12k",
    description: "Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Routing, Animations, Next.js and way more!",
    whatYouWillLearn: ["React Basics", "React Hooks", "Redux", "Next.js"],
    liveClassLink: "https://meet.google.com/xsp-didx-hev",
    content: [
        { section: "Getting Started", lectures: 4, duration: "30m", videos: [] },
        { section: "React Basics", lectures: 15, duration: "2h", videos: [] }
    ]
  },
  {
    id: "5",
    title: "UX/UI Design Masterclass",
    instructor: "Gary Simon",
    rating: 4.9,
    reviews: "8k",
    price: "$24.99",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Design",
    students: "8k",
    description: "Learn UI/UX design from scratch with Figma. Build a portfolio and get hired.",
    whatYouWillLearn: ["Figma", "Prototyping", "Wireframing"],
    liveClassLink: "https://meet.google.com/xsp-didx-hev",
    content: [
        { section: "Introduction to Design", lectures: 5, duration: "40m", videos: [] },
        { section: "Figma Basics", lectures: 10, duration: "1h 20m", videos: [] }
    ]
  },
  {
    id: "6",
    title: "Financial Analysis & Modeling",
    instructor: "365 Careers",
    rating: 4.6,
    reviews: "5k",
    price: "$11.99",
    image: "https://images.unsplash.com/photo-1554224155-984067941747?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Finance",
    students: "5k",
    description: "The complete financial analyst course. Excel, Accounting, Financial Statement Analysis, Business Analysis, Financial Math.",
    whatYouWillLearn: ["Excel", "Financial Modeling", "Accounting"],
    liveClassLink: "https://meet.google.com/xsp-didx-hev",
    content: [
        { section: "Excel Basics", lectures: 8, duration: "1h", videos: [] },
        { section: "Accounting Fundamentals", lectures: 12, duration: "2h", videos: [] }
    ]
  }
];

// Simple in-memory cache to avoid redundant network/mock calls
let coursesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getAllCourses = async () => {
  // Return cached data if available and fresh
  const now = Date.now();
  if (coursesCache && (now - lastFetchTime < CACHE_DURATION)) {
    return coursesCache;
  }

  try {
    // Race fetch from Mentor DB
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore timeout')), 2000)
    );

    const fetchPromise = async () => {
      // Use mentorDb because courses are created there
      const coursesCol = collection(mentorDb, 'courses');
      const courseSnapshot = await getDocs(coursesCol);
      const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return courseList;
    };

    const courseList = await Promise.race([fetchPromise(), timeoutPromise]);

    // Prioritize Real Data. Only return mock if specifically needed for dev without DB.
    // User requested "only courses upload by mentor not other one" and "if no any courses available then tell no courses available".
    // So we will NOT fallback to MOCK_COURSES if the DB connection works but is empty.
    
    coursesCache = courseList; // Even if empty
    
    lastFetchTime = Date.now();
    return coursesCache;

  } catch (error) {
    console.error("Error fetching courses:", error);
    // If error (e.g. offline), we might return empty or cached.
    // For now, return empty to avoid showing "other courses" (mock ones).
    return [];
  }
};

export const getCourseById = async (id) => {
  if (coursesCache) {
    const cached = coursesCache.find(c => c.id === id);
    if (cached) return cached;
  }

  try {
    const docRef = doc(mentorDb, 'courses', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
};


export const getPopularCourses = async () => {
    const courses = await getAllCourses();
    return courses.slice(0, 3);
};
