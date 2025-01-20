'use client';

import { Datastore } from '@/types/datastore';
import { DATASTORE_TYPES } from '@/types/datastoreTabs';

interface SnowflakeTabProps {
  datastore: Datastore;
  onChange: (field: keyof Datastore, value: string) => void;
}

export function SnowflakeTab({ datastore, onChange }: SnowflakeTabProps) {
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
          onChange={(e) => onChange('dstype', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Type</option>
          {DATASTORE_TYPES.snowflake.map(type => (
            <option key={type} value={type.toLowerCase()}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sfaccount" className="block text-sm font-medium text-gray-700">
          Account
        </label>
        <input
          type="text"
          id="sfaccount"
          name="sfaccount"
          value={datastore.sfaccount || ''}
          onChange={(e) => onChange('sfaccount', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
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
        <label htmlFor="sfdb" className="block text-sm font-medium text-gray-700">
          Database
        </label>
        <input
          type="text"
          id="sfdb"
          name="sfdb"
          value={datastore.sfdb || ''}
          onChange={(e) => onChange('sfdb', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="sfschema" className="block text-sm font-medium text-gray-700">
          Schema
        </label>
        <input
          type="text"
          id="sfschema"
          name="sfschema"
          value={datastore.sfschema || ''}
          onChange={(e) => onChange('sfschema', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="sfwarehouse" className="block text-sm font-medium text-gray-700">
          Warehouse
        </label>
        <input
          type="text"
          id="sfwarehouse"
          name="sfwarehouse"
          value={datastore.sfwarehouse || ''}
          onChange={(e) => onChange('sfwarehouse', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="sfRole" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <input
          type="text"
          id="sfRole"
          name="sfRole"
          value={datastore.sfRole || ''}
          onChange={(e) => onChange('sfRole', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
  );
}