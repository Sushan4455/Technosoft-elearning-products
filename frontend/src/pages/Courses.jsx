import React, { useState, useEffect, useMemo, memo } from 'react';
import Navbar from '../components/Navbar';
import { getAllCourses } from '../services/courseService';
import { Link } from 'react-router-dom';
import { Star, Search } from 'lucide-react';

const CourseCard = memo(({ course }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
    <div className="relative h-48 overflow-hidden group">
        <img 
            src={course.image} 
            alt={course.title} 
            loading="lazy"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
    </div>
    
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wide">{course.category}</span>
          <div className="flex items-center text-yellow-500 gap-1 text-sm font-bold">
            <Star className="w-4 h-4 fill-current" />
            {course.rating}
          </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
      <p className="text-sm text-gray-500 mb-4">{course.instructor}</p>
      
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xl font-bold text-gray-900">{course.price}</span>
        <Link to={`/courses/${course.id}`} className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
          View Details
        </Link>
      </div>
    </div>
  </div>
));

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Development', 'Web Dev', 'Data Science', 'Design', 'Finance', 'Business', 'Marketing'];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const data = await getAllCourses();
      setCourses(data);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    let result = courses;

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(course => course.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(lowerQuery) || 
        course.instructor.toLowerCase().includes(lowerQuery)
      );
    }
    return result;
  }, [courses, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Courses</h1>
        
        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <button 
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border hover:bg-gray-50'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            
            <div className="relative w-full lg:w-72">
                <input 
                    type="text" 
                    placeholder="Search courses..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
           <div className="text-center py-20">
             <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
             <p className="text-gray-500">Try adjusting your search or filters.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
