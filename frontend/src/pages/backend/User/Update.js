import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import UserService from '../../../services/UserService';

function UserUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        address: '',
        gender: 'male',
        role: 'USER',
        status: true
    });
    
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [changePassword, setChangePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await UserService.getById(id);
                setFormData({
                    username: userData.username || '',
                    email: userData.email || '',
                    fullName: userData.fullName || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    gender: userData.gender || 'male',
                    role: userData.role || 'USER',
                    status: userData.status !== false
                });
                
                // If the user has an image, set the image preview
                if (userData.image) {
                    // Use the authenticated method to fetch the image
                    fetchProfileImage(userData.image);
                }
                
                setInitialLoading(false);
            } catch (error) {
                console.error('Error fetching user:', error);
                toast.error(`Failed to fetch user data: ${error.message || 'Unknown error'}`);
                navigate('/admin/user');
            }
        };
        
        fetchUser();
    }, [id, navigate]);

    // Function to fetch the profile image with authentication
    const fetchProfileImage = async (imageName) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8080/uploads/users/${imageName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                setImagePreview(URL.createObjectURL(blob));
            } else {
                console.error('Failed to load image');
                setImagePreview(null);
            }
        } catch (error) {
            console.error('Error loading image:', error);
            setImagePreview(null);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        
        // Password validation if changing password
        if (changePassword && !password) {
            newErrors.password = 'Password is required when changing password';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setErrors({});
        setSuccess(false);
        
        try {
            // Create update payload
            const updateData = {
                ...formData
            };
            
            // Only include password if changing it
            if (changePassword) {
                updateData.password = password;
            }
            
            await UserService.update(id, updateData, profileImage);
            setSuccess(true);
            toast.success('User updated successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
                navigate('/admin/user');
            }, 3000);
        } catch (error) {
            console.error('Error updating user:', error);
            setErrors({ form: error.message || 'Failed to update user' });
            toast.error(`Failed to update user: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        setImagePreview(null);
    };

    const handleCancel = () => {
        navigate('/admin/user');
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-mono font-medium text-gray-800">
                    <span>Update User</span>
                </h1>
                <button
                    onClick={() => navigate('/admin/user')}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md inline-flex items-center text-sm font-mono shadow-md transition duration-150"
                >
                    <FaArrowLeft className="mr-2" /> Back
                </button>
            </div>

            {errors.form && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md font-mono text-sm">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <p>{errors.form}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded-md font-mono text-sm">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p>User updated successfully!</p>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <form onSubmit={handleSubmit} className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">Username cannot be changed</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center mb-1">
                                <input
                                    type="checkbox"
                                    id="changePassword"
                                    checked={changePassword}
                                    onChange={() => setChangePassword(!changePassword)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="changePassword" className="ml-2 block text-sm font-mono font-medium text-gray-700">
                                    Change Password
                                </label>
                            </div>
                            {changePassword && (
                                <>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm`}
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm`}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm`}
                                required
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="block text-sm font-mono font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                            placeholder="Enter address"
                        ></textarea>
                    </div>

                    <div className="mt-5">
                        <label className="block text-sm font-mono font-medium text-gray-700 mb-1">
                            Gender
                        </label>
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700 font-mono">Male</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700 font-mono">Female</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="block text-sm font-mono font-medium text-gray-700 mb-1">
                            Profile Image
                        </label>
                        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                            <input
                                type="file"
                                name="image"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="w-full text-sm font-mono"
                            />
                            {imagePreview && (
                                <div className="flex items-center">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-20 object-contain border rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 flex items-center">
                        <input
                            type="checkbox"
                            id="status"
                            name="status"
                            checked={formData.status}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="status" className="ml-2 text-sm text-gray-700 font-mono">
                            Active user account
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 inline-flex items-center transition duration-150 text-sm font-mono"
                        >
                            <FaTimes className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center transition duration-150 text-sm font-mono"
                        >
                            <FaSave className="mr-2" />
                            {loading ? 'Processing...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserUpdate;