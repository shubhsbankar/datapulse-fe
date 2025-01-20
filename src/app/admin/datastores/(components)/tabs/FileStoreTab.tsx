'use client';

import { Datastore } from '@/types/datastore';
import { DATASTORE_TYPES } from '@/types/datastoreTabs';
import { useEffect } from 'react';

interface FileStoreTabProps {
  datastore: Datastore;
  onChange: (field: keyof Datastore, value: string) => void;
}

export function FileStoreTab({ datastore, onChange }: FileStoreTabProps) {
  useEffect(() => {
    onChange('dstype', 'aws');
    onChange('tablename', 'file.csv');
    onChange('bucketname', '');
  }, [])

  console.log(datastore.is_target)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="dsshortname" className="block text-sm font-medium text-gray-700">
          Short Name
          <span className="text-xs text-gray-500 ml-1">(single word, lowercase)</span>
        </label>
        <input
          type="text"
          id="dsshortname"
          name="dsshortname"
          value={datastore.dsshortname}
          onChange={(e) => onChange('dsshortname', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
          pattern="^[a-z0-9]+$"
          title="Only lowercase letters and numbers, no spaces"
        />
      </div>
      <div>
        <label htmlFor="datastorename" className="block text-sm font-medium text-gray-700">
          Name
          <span className="text-xs text-gray-500 ml-1">
            ({40 - datastore.datastorename.length} characters remaining)
          </span>
        </label>
        <input
          type="text"
          id="datastorename"
          name="datastorename"
          value={datastore.datastorename}
          onChange={(e) => onChange('datastorename', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
          maxLength={40}
        />
      </div>
      <div>
      <div>
        <label htmlFor="is_target" className="block text-sm font-medium text-gray-700">
          Is Target
        </label>
        <select
          id="is_target"
          name="is_target"
          value={datastore.is_target}
          onChange={(e) => { onChange('is_target', e.target.value); console.log(e.target.value) }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          {/* <option value="">Select Type</option> */}
          <option value="Yes">Yes</option>
          <option value="NA">NA</option>
        </select>
      </div>
        <label htmlFor="dstype" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="dstype"
          name="dstype"
          value={datastore.dstype}
          onChange={(e) => { onChange('dstype', e.target.value) }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Type</option>
          {DATASTORE_TYPES.filestore.map(type => (
            <option key={type} value={type.toLowerCase()}>
              {type}
            </option>
          ))}
        </select>
      </div>
      {/* add fileds table name, username, password, url, driver */}
      <div>
        <label htmlFor="tablename" className="block text-sm font-medium text-gray-700">
          File Name
        </label>
        <input
          type="text"
          id="tablename"
          name="tablename"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={datastore.tablename.endsWith('.csv') ? datastore.tablename.slice(0, datastore.tablename.length - 4) : datastore.tablename}
          onChange={(e) => onChange('tablename', e.target.value + '.csv')}
        />
      </div>
      <div>
        <label htmlFor="subdirectory" className="block text-sm font-medium text-gray-700">
          Subdirectory
        </label>
        <input
          type="text"
          id="subdirectory"
          name="subdirectory"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={datastore.subdirectory}
          onChange={(e) => onChange('subdirectory', e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="bucketname" className="block text-sm font-medium text-gray-700">
          Bucketname
        </label>
        <input
          type="text"
          id="bucketname"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          name="bucketname"
          value={datastore.bucketname}
          onChange={(e) => onChange('bucketname', e.target.value)}
        />
      </div>
    </div>
  );
} 