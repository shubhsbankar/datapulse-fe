'use client';

import { Datastore } from '@/types/datastore';
import { DATASTORE_TYPES } from '@/types/datastoreTabs';

interface BasicConnectionTabProps {
  datastore: Datastore;
  onChange: (field: keyof Datastore, value: string) => void;
}

export function BasicConnectionTab({ datastore, onChange }: BasicConnectionTabProps) {
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
        <label htmlFor="is_target" className="block text-sm font-medium text-gray-700">
          Is Target
        </label>
        <select
          id="is_target"
          name="is_target"
          value={datastore.is_target}
          onChange={(e) => { onChange('is_target', e.target.value) }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          {/* <option value="">Select Type</option> */}
          <option value="Yes">Yes</option>
          <option value="NA">NA</option>
        </select>
      </div>
      <div>
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
          {DATASTORE_TYPES.basic.map(type => (
            <option key={type} value={type.toLowerCase()}>
              {type}
            </option>
          ))}
        </select>
      </div>
      {/* add fileds table name, username, password, url, driver */}
      <div>
        <label htmlFor="tablename" className="block text-sm font-medium text-gray-700">
          Table Name
        </label>
        <input
          type="text"
          id="tablename"
          name="tablename"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={datastore.tablename}
          onChange={(e) => onChange('tablename', e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={datastore.username}
          onChange={(e) => onChange('username', e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="passwrd" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="passwrd"
          name="passwrd"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={datastore.passwrd}
          onChange={(e) => onChange('passwrd', e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          URL
        </label>
        <input
          type="text"
          id="url"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          name="url"
          value={datastore.url}
          onChange={(e) => onChange('url', e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="driver" className="block text-sm font-medium text-gray-700">
          Driver
        </label>
        <input
          type="text"
          id="driver"
          name="driver"
          value={datastore.driver}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          onChange={(e) => onChange('driver', e.target.value)}
        />
      </div>
    </div>
  );
} 