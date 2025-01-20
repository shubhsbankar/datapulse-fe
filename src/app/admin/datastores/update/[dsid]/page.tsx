'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatastoresAsync, testDatastoreConnectionAsync, updateDatastoreAsync } from '@/store/datastore/datastoreThunks';
import { Datastore } from '@/types/datastore';
import { toast } from 'react-hot-toast';
import { TabContainer } from '../../(components)/TabContainer';
import { DATASTORE_TYPES, DatastoreTabType } from '@/types/datastoreTabs';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
interface UpdateDatastorePageProps {
  params: Promise<{ dsid: string }>; // Type params as a Promise here
}
export default function UpdateDatastorePage({ params }: UpdateDatastorePageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [dsidNumber, setDsid] = useState<number | null>(null);

  useEffect(() => {
    // Resolve the `params` Promise and update `dsid`
    const fetchParams = async () => {
      const resolvedParams = await params;
      setDsid(parseInt(resolvedParams.dsid as string));
    };
    dispatch(getAllDatastoresAsync())
    fetchParams();
  }, [params, dispatch]);

  const ds = useAppSelector(state => state.datastore.datastores.find(ds => ds.dsid == dsidNumber)) || null;
  const [datastore, setDatastore] = useState<Datastore | null>(ds ?? null);

  useEffect(() => {
    setDatastore(ds)
  }
  , [ds]
  )

  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  // const initialActiveTab = ds?.dstype === 'rs' ? 'redshift' :
  //   ds?.dstype === 'bk' ? 'bigquery' :
  //   ds?.dstype === 'sk' ? 'snowflake' :
  //   ds?.dstype === 'kk' ? 'kafka' : 'basic';
  // console.log(dsidNumber, ds);
  const initialActiveTab = Object.keys(DATASTORE_TYPES).find(key => DATASTORE_TYPES[key as DatastoreTabType].map(x => x.toLowerCase()).includes(ds?.dstype.toLowerCase())) as DatastoreTabType;
  console.log(DATASTORE_TYPES, initialActiveTab, ds?.dstype);
  
  const [activeTab, setActiveTab] = useState<DatastoreTabType>(initialActiveTab);
  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);
  
  const handleInputChange = (field: keyof Datastore, value: string) => {
    setIsTestSuccessful(false);
    if (!datastore) return;

    let formattedValue = value;
    if (field === 'dsshortname') {
      formattedValue = value.toLowerCase().replace(/\s+/g, '');
    } else if (field === 'datastorename') {
      formattedValue = value.slice(0, 40);
    } else if (field !== 'passwrd') {
      formattedValue = value.toLowerCase().replace(/\s+/g, '');
    }

    setDatastore(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: formattedValue
      };
    });
  };

  const handleTestConnection = async () => {
    if (!datastore) return;

    try {
      const result = await toast.promise(
        dispatch(testDatastoreConnectionAsync(datastore)).unwrap(),
        {
          loading: 'Testing connection...',
          success: (data) => {
            setIsTestSuccessful(true);
            setDatastore(prev => {
              if (!prev) return null;
              return {
                ...prev,
                is_valid: true
              };
            });
            return data.message || 'Connection test successful';
          },
          error: (err) => {
            setIsTestSuccessful(false);
            setDatastore(prev => {
              if (!prev) return null;
              return {
                ...prev,
                is_valid: false
              };
            });
            return err.message || 'Connection test failed';
          }
        }
      );
    } catch (error) {
      console.error(error);
      setIsTestSuccessful(false);
      setDatastore(prev => {
        if (!prev) return null;
        return {
          ...prev,
          is_valid: false
        };
      });
    }
  };

  const handleUpdate = async () => {
    if (!datastore) return;
    if (!isTestSuccessful) {
      toast.error('Please test the connection first');
      return;
    }

    try {
      await toast.promise(
        dispatch(updateDatastoreAsync({ dsid: dsidNumber as number, datastoreData: datastore })).unwrap(),
        {
          loading: 'Updating datastore...',
          success: () => {
            router.push('/admin/datastores');
            return 'Datastore updated successfully';
          },
          error: (err) => err.message || 'Failed to update datastore'
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!datastore) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Update Data Store</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <TabContainer
          activeTab={activeTab}
          setActiveTab={() => {}}
          datastore={datastore}
          onChange={handleInputChange}
        />
        
        <div className="flex justify-end space-x-4 mt-4">
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
            onClick={handleUpdate}
            disabled={!isTestSuccessful}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Data Store
          </button>
        </div>
      </div>
    </div>
  );
} 