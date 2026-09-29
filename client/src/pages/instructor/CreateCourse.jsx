import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    price: 0,
    discountPrice: 0,
    level: 'Beginner',
    language: 'English',
    learningObjectives: '',
    requirements: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0]._id }));
        }
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process comma separated lists
      const objectives = formData.learningObjectives
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

      const reqs = formData.requirements
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

      if (!formData.title || !formData.description || !formData.thumbnail || !formData.category || !formData.price) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const courseData = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        learningObjectives: objectives.length > 0 ? objectives : ['Learn core concepts'],
        requirements: reqs.length > 0 ? reqs : ['None'],
      };

      const { data } = await api.post('/courses', courseData);
      
      toast.success('Course created as draft! Now let\'s add content.');
      navigate(`/instructor/courses/${data._id}/edit`);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Course</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-md flex items-start">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
        <div>
          <h3 className="text-blue-800 font-medium">Draft Mode</h3>
          <p className="text-blue-700 text-sm mt-1">
            New courses are created as drafts. You will be able to add sections, lessons, and publish it from the course editor on the next screen.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="input-field mt-1"
                  placeholder="e.g. Master React in 30 Days"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  className="input-field mt-1"
                  placeholder="Briefly describe what this course is about..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Thumbnail Image URL *</label>
                <input
                  type="url"
                  name="thumbnail"
                  required
                  className="input-field mt-1"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnail}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">Provide a direct URL to a high-quality image (e.g., Unsplash).</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-8">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  name="category"
                  required
                  className="input-field mt-1 bg-white"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                <select
                  name="level"
                  className="input-field mt-1 bg-white"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price (USD) *</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  className="input-field mt-1"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Discount Price (Optional)</label>
                <input
                  type="number"
                  name="discountPrice"
                  min="0"
                  step="0.01"
                  className="input-field mt-1"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  name="language"
                  className="input-field mt-1 bg-white"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Objectives & Requirements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-8">Curriculum Preview</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Learning Objectives</label>
                <textarea
                  name="learningObjectives"
                  rows="3"
                  className="input-field mt-1"
                  placeholder="Enter comma separated values (e.g. Build an API, Master Hooks)"
                  value={formData.learningObjectives}
                  onChange={handleChange}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Separate each objective with a comma.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Requirements</label>
                <textarea
                  name="requirements"
                  rows="2"
                  className="input-field mt-1"
                  placeholder="Enter comma separated values (e.g. Basic HTML, Code Editor)"
                  value={formData.requirements}
                  onChange={handleChange}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Separate each requirement with a comma.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/instructor/courses')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;