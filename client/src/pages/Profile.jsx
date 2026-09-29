import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Camera, Save, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // State to hold form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    // You can add more fields here as needed by your database
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // TODO: Add your API call here to update the user in the database
      // Example: await axios.put('/api/users/profile', formData);
      
      console.log('Updated Profile Data:', formData);
      alert('Profile updated successfully!');
      setIsEditing(false);
      
      // Optionally update the context user state here if your API returns the updated user
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile.');
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4 md:w-1/3">
          <div className="relative">
            <img 
              src={user?.profileImage || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
            />
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
          <span className="px-3 py-1 bg-gray-100 text-sm font-medium text-gray-600 rounded-full capitalize border border-gray-200">
            Role: {user.role}
          </span>
        </div>

        {/* User Details Form Section */}
        <div className="md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio / About Me
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="4"
                placeholder={isEditing ? "Write something about yourself..." : "No bio provided."}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
              />
            </div>

            {isEditing && (
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;