'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pullLDAPUsersAsync, createBulkUsersAsync } from '@/store/user/userThunks';
import type { LDAPConfig } from '@/types/ldap';
import { toast } from 'react-hot-toast';
import { UserBase } from '@/types/user';
import { AlertTriangle } from 'lucide-react';

export default function LDAPImportPage() {
  const dispatch = useAppDispatch();
  const currentUserGroup = useAppSelector((state) => state.user.currentUser.useremail.split('@')[1]);

  const [config, setConfig] = useState<LDAPConfig>({
    ldap_url: '',
    ldap_password: '',
    admin_dn: '',
  });
  const [users, setUsers] = useState<UserBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isValidOrganizationEmail = (email: string) => {
    if (!currentUserGroup) return true;
    return email?.includes(`@${currentUserGroup}`);
  };

  const getValidUsers = () => users.filter(user => isValidOrganizationEmail(user.useremail));

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserChange = (index: number, field: keyof UserBase, value: string) => {
    setUsers(prev => prev.map((user, i) => 
      i === index ? { ...user, [field]: value } : user
    ));
  };

  const handlePullUsers = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(pullLDAPUsersAsync(config)).unwrap();
      const usersWithDefaults = result.data.map((user: UserBase) => ({
        ...user,
        last_name: user.last_name || '',
        password: user.first_name // Default password is first name
      }));
      setUsers(usersWithDefaults);
      toast.success('LDAP users retrieved successfully');
    } catch (error) {
      console.log(error)
      toast.error('Failed to retrieve LDAP users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportUsers = async () => {
    const validUsers = getValidUsers();
    if (validUsers.length === 0) {
      toast.error('No valid users to import');
      return;
    }

    try {
      await dispatch(createBulkUsersAsync(validUsers)).unwrap();
      toast.success('Users imported successfully');
      setUsers([]); // Clear the table after successful import
    } catch (error) {
      console.log(error)
      toast.error('Failed to import users');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">LDAP Configuration</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="ldap_url" className="block text-sm font-medium text-gray-700">
              LDAP URL
            </label>
            <input
              type="text"
              name="ldap_url"
              id="ldap_url"
              value={config.ldap_url}
              onChange={handleConfigChange}
              placeholder="ldap://localhost:389"
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="ldap_password" className="block text-sm font-medium text-gray-700">
              LDAP Password
            </label>
            <input
              type="password"
              name="ldap_password"
              id="ldap_password"
              value={config.ldap_password}
              onChange={handleConfigChange}
              placeholder="adminpassword"
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin_dn" className="block text-sm font-medium text-gray-700">
              Admin DN
            </label>
            <input
              type="text"
              name="admin_dn"
              id="admin_dn"
              value={config.admin_dn}
              onChange={handleConfigChange}
              placeholder="cn=admin,dc=example,dc=com"
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handlePullUsers}
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Pulling Users...' : 'Pull LDAP Users'}
          </button>
        </div>
      </div>

      {users.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">LDAP Users</h2>
              {currentUserGroup && (
                <p className="text-sm text-gray-500">
                  Only users with @{currentUserGroup} email addresses will be imported
                </p>
              )}
            </div>
            <button
              onClick={handleImportUsers}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Import Valid Users
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => {
                  const isValidEmail = isValidOrganizationEmail(user.useremail);
                  return (
                    <tr key={user.useremail} className={!isValidEmail ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!isValidEmail && (
                          <div className="relative group">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            <div className="absolute left-0 top-0 mt-8 text-wrap w-48 p-2 bg-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-sm text-gray-700 border border-gray-200">
                              User email domain doesn&apos;t match organization domain (@{currentUserGroup})
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={user.useremail}
                          onChange={(e) => handleUserChange(index, 'useremail', e.target.value)}
                          className={`block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-sm ${!isValidEmail ? 'text-gray-500' : ''}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={user.first_name}
                          onChange={(e) => handleUserChange(index, 'first_name', e.target.value)}
                          className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={user.last_name}
                          onChange={(e) => handleUserChange(index, 'last_name', e.target.value)}
                          className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={user.password}
                          onChange={(e) => handleUserChange(index, 'password', e.target.value)}
                          className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 