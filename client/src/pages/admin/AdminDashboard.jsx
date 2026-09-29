import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, CreditCard, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/ui/Spinner';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalPayments: 0,
    totalRevenue: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [coursesRes, paymentsRes] = await Promise.all([
          api.get('/courses?limit=100'),
          api.get('/payments')
        ]);

        const courses = coursesRes.data.courses || [];
        const payments = paymentsRes.data || [];

        const totalRevenue = payments
          .filter(p => p.status === 'success')
          .reduce((acc, curr) => acc + curr.amount, 0);

        setStats({
          totalCourses: courses.length,
          totalPayments: payments.length,
          totalRevenue: totalRevenue
        });

        setRecentPayments(payments.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Platform overview and statistics.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Platform Courses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Enrollments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Platform Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">System Status</p>
            <p className="text-xl font-bold text-green-600">Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/courses" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <span className="font-medium text-gray-900">Manage Courses</span>
            </Link>
           <Link to="/admin/users" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
  <span className="font-medium text-gray-900">Manage Users</span>
</Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions (Mock)</h2>
          </div>
          {recentPayments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No recent transactions.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.student?.name || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;