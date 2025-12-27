import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, MessageSquare, Tag, Calendar, User } from 'lucide-react';
import axiosInstance from '../lib/axios';

const HeaderMessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    type: 'announcement',
    priority: 1,
    discountId: '',
    endDate: ''
  });

  useEffect(() => {
    fetchMessages();
    fetchDiscounts();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get('/api/header-messages');
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/api/discounts');
      if (response.data.success) {
        setDiscounts(response.data.discounts.filter(d => d.isActive));
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        endDate: formData.endDate || undefined,
        discountId: formData.discountId || undefined
      };

      if (editingMessage) {
        await axiosInstance.put(`/api/header-messages/${editingMessage._id}`, payload);
      } else {
        await axiosInstance.post('/api/header-messages', payload);
      }

      fetchMessages();
      resetForm();
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Error saving message. Please try again.');
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setFormData({
      message: message.message,
      type: message.type,
      priority: message.priority,
      discountId: message.discountId?._id || '',
      endDate: message.endDate ? new Date(message.endDate).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axiosInstance.delete(`/api/header-messages/${id}`);
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Error deleting message. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/api/header-messages/${id}/toggle`);
      fetchMessages();
    } catch (error) {
      console.error('Error toggling message status:', error);
      alert('Error updating message status. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      message: '',
      type: 'announcement',
      priority: 1,
      discountId: '',
      endDate: ''
    });
    setEditingMessage(null);
    setShowForm(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'discount': return 'bg-red-100 text-red-800';
      case 'promotion': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'discount': return <Tag className="h-4 w-4" />;
      case 'promotion': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Header Messages</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Message
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingMessage ? 'Edit Message' : 'Create New Message'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Text *
              </label>
              <input
                type="text"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter your message..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="announcement">Announcement</option>
                  <option value="discount">Discount</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {formData.type === 'discount' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link to Discount (Optional)
                </label>
                <select
                  value={formData.discountId}
                  onChange={(e) => setFormData({ ...formData, discountId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a discount...</option>
                  {discounts.map(discount => (
                    <option key={discount._id} value={discount._id}>
                      {discount.name} - {discount.discountType === 'percentage' ? `${discount.value}%` : `₹${discount.value}`} OFF
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700"
              >
                {editingMessage ? 'Update Message' : 'Create Message'}
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No header messages found.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`border rounded-lg p-4 ${message.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                      {getTypeIcon(message.type)}
                      {message.type}
                    </span>
                    <span className="text-sm text-gray-500">Priority: {message.priority}</span>
                    {message.endDate && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {new Date(message.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-800 mb-2">{message.message}</p>
                  
                  {message.discountId && (
                    <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      <strong>Linked Discount:</strong> {message.discountId.name}
                      {!message.discountId.isActive && (
                        <span className="text-red-600 ml-2">(Inactive)</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {message.createdBy?.name || 'Unknown'}
                    </span>
                    <span>Created: {new Date(message.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(message._id)}
                    className={`p-2 rounded-md ${
                      message.isActive 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={message.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleEdit(message)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(message._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HeaderMessageManagement;