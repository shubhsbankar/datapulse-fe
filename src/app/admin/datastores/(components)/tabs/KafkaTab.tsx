'use client';

import { Datastore } from '@/types/datastore';
import { DATASTORE_TYPES } from '@/types/datastoreTabs';

interface KafkaTabProps {
  datastore: Datastore;
  onChange: (field: keyof Datastore, value: string) => void;
}

export function KafkaTab({ datastore, onChange }: KafkaTabProps) {
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
          {DATASTORE_TYPES.kafka.map(type => (
            <option key={type} value={type.toLowerCase()}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bootstrap_servers" className="block text-sm font-medium text-gray-700">
          Bootstrap Servers
        </label>
        <input
          type="text"
          id="bootstrap_servers"
          name="bootstrap_servers"
          value={datastore.bootstrap_servers || ''}
          onChange={(e) => onChange('bootstrap_servers', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
          Topic
        </label>
        <input
          type="text"
          id="topic"
          name="topic"
          value={datastore.topic || ''}
          onChange={(e) => onChange('topic', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="schemareg_url" className="block text-sm font-medium text-gray-700">
          Schema Registry URL
        </label>
        <input
          type="text"
          id="schemareg_url"
          name="schemareg_url"
          value={datastore.schemareg_url || ''}
          onChange={(e) => onChange('schemareg_url', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="schemaregapikey" className="block text-sm font-medium text-gray-700">
          Schema Registry API Key
        </label>
        <input
          type="text"
          id="schemaregapikey"
          name="schemaregapikey"
          value={datastore.schemaregapikey || ''}
          onChange={(e) => onChange('schemaregapikey', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="schemaregsecret" className="block text-sm font-medium text-gray-700">
          Schema Registry Secret
        </label>
        <input
          type="password"
          id="schemaregsecret"
          name="schemaregsecret"
          value={datastore.schemaregsecret || ''}
          onChange={(e) => onChange('schemaregsecret', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kkuser" className="block text-sm font-medium text-gray-700">
          Kafka User
        </label>
        <input
          type="text"
          id="kkuser"
          name="kkuser"
          value={datastore.kkuser || ''}
          onChange={(e) => onChange('kkuser', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kksecret" className="block text-sm font-medium text-gray-700">
          Kafka Secret
        </label>
        <input
          type="password"
          id="kksecret"
          name="kksecret"
          value={datastore.kksecret || ''}
          onChange={(e) => onChange('kksecret', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_sasl_mechanism" className="block text-sm font-medium text-gray-700">
          SASL Mechanism
        </label>
        <input
          type="text"
          id="kk_sasl_mechanism"
          name="kk_sasl_mechanism"
          value={datastore.kk_sasl_mechanism || ''}
          onChange={(e) => onChange('kk_sasl_mechanism', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_security_protocol" className="block text-sm font-medium text-gray-700">
          Security Protocol
        </label>
        <input
          type="text"
          id="kk_security_protocol"
          name="kk_security_protocol"
          value={datastore.kk_security_protocol || ''}
          onChange={(e) => onChange('kk_security_protocol', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_sasl_jaas_config" className="block text-sm font-medium text-gray-700">
          SASL JAAS Config
        </label>
        <input
          type="text"
          id="kk_sasl_jaas_config"
          name="kk_sasl_jaas_config"
          value={datastore.kk_sasl_jaas_config || ''}
          onChange={(e) => onChange('kk_sasl_jaas_config', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_ssl_endpoint_identification_algo" className="block text-sm font-medium text-gray-700">
          SSL Endpoint Identification Algorithm
        </label>
        <input
          type="text"
          id="kk_ssl_endpoint_identification_algo"
          name="kk_ssl_endpoint_identification_algo"
          value={datastore.kk_ssl_endpoint_identification_algo || ''}
          onChange={(e) => onChange('kk_ssl_endpoint_identification_algo', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_ssl_ts_type" className="block text-sm font-medium text-gray-700">
          SSL TS Type
        </label>
        <input
          type="text"
          id="kk_ssl_ts_type"
          name="kk_ssl_ts_type"
          value={datastore.kk_ssl_ts_type || ''}
          onChange={(e) => onChange('kk_ssl_ts_type', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_ssl_ts_location" className="block text-sm font-medium text-gray-700">
          SSL TS Location
        </label>
        <input
          type="text"
          id="kk_ssl_ts_location"
          name="kk_ssl_ts_location"
          value={datastore.kk_ssl_ts_location || ''}
          onChange={(e) => onChange('kk_ssl_ts_location', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_ssl_ts_password" className="block text-sm font-medium text-gray-700">
          SSL TS Password
        </label>
        <input
          type="password"
          id="kk_ssl_ts_password"
          name="kk_ssl_ts_password"
          value={datastore.kk_ssl_ts_password || ''}
          onChange={(e) => onChange('kk_ssl_ts_password', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_ssl_ks_type" className="block text-sm font-medium text-gray-700">
          SSL KS Type
        </label>
        <input
          type="text"
          id="kk_ssl_ks_type"
          name="kk_ssl_ks_type"
          value={datastore.kk_ssl_ks_type || ''}
          onChange={(e) => onChange('kk_ssl_ks_type', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_ssl_ks_location" className="block text-sm font-medium text-gray-700">
          SSL KS Location
        </label>
        <input
          type="text"
          id="kk_ssl_ks_location"
          name="kk_ssl_ks_location"
          value={datastore.kk_ssl_ks_location || ''}
          onChange={(e) => onChange('kk_ssl_ks_location', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_ssl_ks_password" className="block text-sm font-medium text-gray-700">
          SSL KS Password
        </label>
        <input
          type="password"
          id="kk_ssl_ks_password"
          name="kk_ssl_ks_password"
          value={datastore.kk_ssl_ks_password || ''}
          onChange={(e) => onChange('kk_ssl_ks_password', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="kk_ssl_ts_certificates" className="block text-sm font-medium text-gray-700">
          SSL TS Certificates
        </label>
        <input
          type="text"
          id="kk_ssl_ts_certificates"
          name="kk_ssl_ts_certificates"
          value={datastore.kk_ssl_ts_certificates || ''}
          onChange={(e) => onChange('kk_ssl_ts_certificates', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
  );
}