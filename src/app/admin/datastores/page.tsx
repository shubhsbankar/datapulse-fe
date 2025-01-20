'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatastoresAsync, createDatastoreAsync, updateDatastoreAsync, testDatastoreConnectionAsync } from '@/store/datastore/datastoreThunks';
import { DatastoreBase, Datastore } from '@/types/datastore';
import { toast } from 'react-hot-toast';
import { Search } from 'lucide-react';
import { DatastoresTable } from './(components)/datastores-table';
import { cn } from '@/lib/utils';
import { TabContainer } from './(components)/TabContainer';
import { DATASTORE_FORM_KEYS, DatastoreTabType } from '@/types/datastoreTabs';

export default function DatastoresPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [editedDatastores, setEditedDatastores] = useState<{ [key: number]: Datastore }>({});
  const [newDatastore, setNewDatastore] = useState<DatastoreBase>({
    dsshortname: '',
    datastorename: '',
    dstype: '',
    url: '',
    driver: '',
    username: '',
    passwrd: '',
    tablename: '',
    is_target: "NA",
  });
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  const [activeTab, setActiveTab] = useState<DatastoreTabType>('basic');

  useEffect(() => {
    dispatch(getAllDatastoresAsync());
  }, [dispatch]);

  const handleDatastoreChange = (
    dsid: number,
    field: keyof Datastore,
    value: string | boolean
  ) => {
    setEditedDatastores(prev => ({
      ...prev,
      [dsid]: {
        ...(prev[dsid] || {}),
        [field]: value,
      },
    }));
  };

  const formatShortName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '');
  };

  const formatSingleWord = (value: string) => {
    return value.toLowerCase().replace(/\s+/g, '');
  };

  const datastoreTypes = ['PostgreSQL', 'Mysql', 'MSSqlServer', 'Oracle', 'T', 'PRS'] as const;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setIsTestSuccessful(false);
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'dsshortname') {
      formattedValue = formatShortName(value);
    } else if (name === 'datastorename') {
      formattedValue = value.slice(0, 40);
    } else if (name !== 'passwrd') {
      formattedValue = formatSingleWord(value);
    }
    setNewDatastore(prev => ({
        ...prev,
        [name]: formattedValue
    }));
  };

  const handleCreateDatastore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTestSuccessful) {
      toast.error('Please test the connection first');
      return;
    }

    console.log({newDatastore})

    try {
      toast.promise(
        dispatch(createDatastoreAsync(newDatastore)).unwrap(),
        {
          loading: 'Creating datastore...',
          success: () => {
            setNewDatastore({
              dsshortname: '',
              datastorename: '',
              dstype: '',
              url: '',
              driver: '',
              username: '',
              passwrd: '',
              tablename: '',
              is_target: "NA",
            });
            setIsTestSuccessful(false);
            return 'Datastore created successfully';
          },
          error: (err) => err.message || 'Failed to create datastore'
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveChanges = async () => {
    if (Object.keys(editedDatastores).length === 0) {
      toast.error('No changes to save');
      return;
    }

    try {
      const updatePromises = Object.entries(editedDatastores).map(([dsid, datastoreData]) => {
        return dispatch(updateDatastoreAsync({
          dsid: Number(dsid),
          datastoreData
        })).unwrap();
      });

      toast.promise(
        Promise.all(updatePromises),
        {
          loading: 'Updating datastores...',
          success: () => {
            setEditedDatastores({});
            return 'Datastores updated successfully';
          },
          error: 'Failed to update datastores'
        }
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to update datastores');
    }
  };

  const getDatastoreValue = (datastore: Datastore, field: keyof Datastore) => {
    return editedDatastores[datastore.dsid ?? 0]?.[field] ?? datastore[field] ?? '';
  };


  const handleTestConnection = async () => {
    const formKeys = DATASTORE_FORM_KEYS[activeTab as DatastoreTabType];
    if (Object.keys(newDatastore).some(key => formKeys.includes(key) && !newDatastore[key as keyof DatastoreBase])) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const result = await toast.promise(
        dispatch(testDatastoreConnectionAsync(newDatastore)).unwrap(),
        {
          loading: 'Testing connection...',
          success: (data) => {
            setIsTestSuccessful(true);
            setNewDatastore(prev => ({
              ...prev,
              is_valid: true
            }));
            return data.message || 'Connection test successful';
          },
          error: (err) => {
            setIsTestSuccessful(false);
            setNewDatastore(prev => ({
              ...prev,
              is_valid: false
            }));
            return err.message || 'Connection test failed';
          }
        }
      );
    } catch (error) {
      console.error(error);
      setIsTestSuccessful(false);
      setNewDatastore(prev => ({
        ...prev,
        is_valid: false
      }));
    }
  };

  const handleTabChange = (tab: DatastoreTabType) => {
    setActiveTab(tab);
    setIsTestSuccessful(false);
    // Reset form data when changing tabs
    setNewDatastore({
      dsshortname: '',
      datastorename: '',
      dstype: '',
      url: '',
      driver: '',
      username: '',
      passwrd: '',
      tablename: '',
      is_target: "NA",
    });
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Data Stores</h1>
        {Object.keys(editedDatastores).length > 0 && (
          <button
            onClick={handleSaveChanges}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Create Datastore Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Data Store</h2>
        <form onSubmit={handleCreateDatastore} className="space-y-4">
          <TabContainer
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            datastore={newDatastore}
            onChange={(field, value) => handleInputChange({ target: { name: field, value }} as any)}
          />
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleTestConnection}
              className={cn(
                "inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                isTestSuccessful
                  ? "border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              )}
            >
              {isTestSuccessful ? '✓ Connection Tested' : 'Test Connection'}
            </button>
            <button
              type="submit"
              disabled={!isTestSuccessful}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Data Store
            </button>
          </div>
        </form>
      </div>

      {/* Search and Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search datastores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <DatastoresTable
            searchTerm={searchTerm}
            onDatastoreChange={handleDatastoreChange}
            getDatastoreValue={getDatastoreValue}
          />
        </div>
      </div>
    </div>
  );
} 