export type DatastoreTabType = 'basic' | 'filestore' | 'redshift' | 'bigquery' | 'snowflake' | 'kafka';

export const DATASTORE_TYPES = {
  basic: ['PostgreSQL', 'Mysql', 'MSSqlServer', 'Oracle', 'T', 'PRS'],
  filestore: ['AWS', 'GCS', 'AZ', 'AL'],
  redshift: ['RS'],
  bigquery: ['BK'],
  snowflake: ['SK'],
  kafka: ['KK'],
} as const;

export interface TabConfig {
  id: DatastoreTabType;
  label: string;
  description: string;
}

export const TABS: TabConfig[] = [
  {
    id: 'basic',
    label: 'Basic Connection',
    description: 'Configure basic database connections like PostgreSQL, MySQL, etc.'
  },
  {
    id: 'filestore',
    label: 'File Store',
    description: 'Configure filestores like Amazon S3, etc.'
  },
  {
    id: 'redshift',
    label: 'Amazon Redshift',
    description: 'Configure Amazon Redshift connection with AWS IAM'
  },
  {
    id: 'bigquery',
    label: 'Google BigQuery',
    description: 'Configure Google BigQuery connection'
  },
  {
    id: 'snowflake',
    label: 'Snowflake',
    description: 'Configure Snowflake data warehouse connection'
  },
  {
    id: 'kafka',
    label: 'Kafka',
    description: 'Configure Kafka streaming connection'
  },
];



export const DATASTORE_FORM_KEYS = {
  basic: [
    'dsshortname',
    'datastorename',
    'dstype',
    'url',
    'driver',
    'username',
    'passwrd',
    'tablename'
  ],
  filestore: [
    'dsshortname',
    'datastorename',
    'dstype',
    'bucketname',
    'subdirectory',
    'tablename',
    'is_target'
  ],
  redshift: [
    'dsshortname',
    'datastorename',
    'dstype',
    'url',
    'driver',
    'username',
    'passwrd',
    'tablename',
    'aws_iam_role',
    'tempdir',
  ],
  bigquery: [
    'dsshortname',
    'datastorename',
    'dstype',
    'url',
    'driver',
    'username',
    'passwrd',
    'tablename',
    'gcp_projectid',
    'gcp_datasetid',
    'gcp_tableid',
    'upload_json_file',
    'credentials_file'
  ],
  snowflake: [
    'dsshortname',
    'datastorename',
    'dstype',
    'username',
    'passwrd',
    'sfaccount',
    'sfdb',
    'sfschema',
    'sfwarehouse',
    'sfRole'
  ],

  kafka: [
    'dsshortname',
    'datastorename',
    'dstype',
    'bootstrap_servers',
    'topic',
    'schemareg_url',
    'kkuser',
    'kksecret',
    'kk_sasl_mechanism',
    'kk_security_protocol',
    'kk_sasl_jaas_config',
    'kk_ssl_endpoint_identification_algo',
    'kk_ssl_ts_type',
    'kk_ssl_ts_certificates',
    'kk_ssl_ts_location',
    'kk_ssl_ts_password',
    'kk_ssl_ks_type',
    'kk_ssl_ks_location',
    'kk_ssl_ks_password',
    'schemaregapikey',
    'schemaregsecret'
  ],
}
