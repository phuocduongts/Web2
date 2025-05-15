import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit, FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaUserTag, FaToggleOn } from 'react-icons/fa';
import UserService from '../../../services/UserService';

function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        address: '',
        gender: '',
        role: '',
        status: true,
        createdAt: '',
        updatedAt: ''
    });
    
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const user = await UserService.getById(id);
                setUserData({
                    username: user.username || '',
                    email: user.email || '',
                    fullName: user.fullName || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    gender: user.gender || '',
                    role: user.role || '',
                    status: user.status !== false,
                    createdAt: user.createdAt || '',
                    updatedAt: user.updatedAt || ''
                });
                
                // If the user has an image, fetch and display it
                if (user.image) {
                    fetchProfileImage(user.image);
                }
                
                setError(null);
            } catch (error) {
                console.error('Error fetching user:', error);
                setError(`Failed to fetch user data: ${error.message || 'Unknown error'}`);
                toast.error(`Failed to fetch user data: ${error.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [id]);

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
                setImageUrl(URL.createObjectURL(blob));
            } else {
                console.error('Failed to load image');
                setImageUrl(null);
            }
        } catch (error) {
            console.error('Error loading image:', error);
            setImageUrl(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => navigate('/admin/user')}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <FaArrowLeft className="mr-2" /> Back to User List
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Details</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => navigate('/admin/user')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                    <button
                        onClick={() => navigate(`/admin/user/update/${id}`)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        <FaEdit className="mr-2" /> Edit
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
                <div className="flex flex-col md:flex-row">
                    {/* User Image and Status */}
                    <div className="md:w-1/3 flex flex-col items-center p-4 border-r border-gray-200">
                        <div className="w-48 h-48 relative mb-4">
                            {imageUrl ? (
                                <img 
                                    src={imageUrl} 
                                    alt={userData.fullName} 
                                    className="w-full h-full object-cover rounded-full border-4 border-blue-100" 
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                                    <span className="text-gray-500 text-4xl font-bold">
                                        {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                </div>
                            )}
                            <div className={`absolute bottom-2 right-2 h-6 w-6 rounded-full ${userData.status ? 'bg-green-500' : 'bg-red-500'} border-2 border-white`}></div>
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-1">{userData.fullName || 'N/A'}</h2>
                        <p className="text-gray-600 text-center mb-4">@{userData.username}</p>
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${userData.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {userData.role || 'N/A'}
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="md:w-2/3 p-4">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">User Information</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="w-10 text-gray-500 flex-shrink-0">
                                    <FaEnvelope className="mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{userData.email || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="w-10 text-gray-500 flex-shrink-0">
                                    <FaPhone className="mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{userData.phone || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="w-10 text-gray-500 flex-shrink-0">
                                    <FaMapMarkerAlt className="mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium">{userData.address || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="w-10 text-gray-500 flex-shrink-0">
                                    <FaVenusMars className="mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="font-medium capitalize">{userData.gender || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="w-10 text-gray-500 flex-shrink-0">
                                    <FaUserTag className="mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium">{userData.role || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="w-10 text-gray-500 flex-shrink-0">
                                    <FaToggleOn className="mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className={`font-medium ${userData.status ? 'text-green-600' : 'text-red-600'}`}>
                                        {userData.status ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Created At</p>
                                    <p className="font-medium">{formatDate(userData.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-medium">{formatDate(userData.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserDetail;