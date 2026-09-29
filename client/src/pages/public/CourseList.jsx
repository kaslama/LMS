import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/ui/Spinner';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    // Fetch Categories
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch Courses
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let url = `/courses?`;
        if (searchTerm) url += `search=${searchTerm}&`;
        if (selectedCategory) url += `category=${selectedCategory}&`;
        
        const { data } = await api.get(url);
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Error fetching courses', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce for search
    const delayDebounce = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Courses</h1>
      
      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="input-field pl-10 bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <Spinner size="lg" />
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link to={`/courses/${course._id}`} key={course._id} className="card flex flex-col hover:shadow-lg transition-shadow">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  {course.category?.name || 'Uncategorized'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{course.instructor?.name}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {course.discountPrice ? (
                      <>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(course.discountPrice)}</span>
                        <span className="text-sm text-gray-400 line-through">{formatCurrency(course.price)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(course.price)}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {course.level}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;