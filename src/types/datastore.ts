export interface DatastoreBase {
    dsshortname: string;
    datastorename: string;
    dstype: string;
    url: string;
    driver: string;
    username: string;
    passwrd: string;
    tablename: string;
    is_target: "Yes" | "NA";
}

export interface Datastore extends DatastoreBase {
    dsid?: number;
    is_valid?: boolean;
    createdate?: string;

    //filestore
    bucketname?: string;
    subdirectory?: string;

    // Redshift
    aws_iam_role?: string;
    tempdir?: string;
    
    // GCP
    credentials_file?: string;
    gcp_projectid?: string;
    gcp_datasetid?: string;
    gcp_tableid?: string;

    // Snowflake
    sfaccount?: string;
    sfdb?: string;
    sfschema?: string;
    sfwarehouse?: string;
    sfRole?: string;

    // Kafka
    bootstrap_servers?: string;
    topic?: string;
    schemareg_url?: string;
    kkuser?: string;
    kksecret?: string;
    kk_sasl_mechanism?: string;
    kk_security_protocol?: string;
    kk_sasl_jaas_config?: string;
    kk_ssl_endpoint_identification_algo?: string;
    kk_ssl_ts_type?: string;
    kk_ssl_ts_certificates?: string;
    kk_ssl_ts_location?: string;
    kk_ssl_ts_password?: string;
    kk_ssl_ks_type?: string;
    kk_ssl_ks_location?: string;
    kk_ssl_ks_password?: string;
    schemaregapikey?: string;
    schemaregsecret?: string;

}

export enum DatastoreColumn {
    // Basic Fields
    ShortName = 'dsshortname',
    Name = 'datastorename',
    Type = 'dstype',
    URL = 'url',
    Driver = 'driver',
    Username = 'username',
    TableName = 'tablename',
    Status = 'is_valid',
    CreatedAt = 'createdate',

    // Redshift Fields
    AwsIamRole = 'aws_iam_role',
    TempDir = 'tempdir',
    CredentialsFile = 'credentials_file',

    // GCP Fields
    GcpProjectId = 'gcp_projectid',
    GcpDatasetId = 'gcp_datasetid',
    GcpTableId = 'gcp_tableid',

    // Snowflake Fields
    SfAccount = 'sfaccount',
    SfDb = 'sfdb',
    SfSchema = 'sfschema',
    SfWarehouse = 'sfwarehouse',
    SfRole = 'sfRole',

    // Kafka Fields
    BootstrapServers = 'bootstrap_servers',
    Topic = 'topic',
    SchemaRegUrl = 'schemareg_url',
    KafkaUser = 'kkuser',
    KafkaSecret = 'kksecret',
    KafkaSaslMechanism = 'kk_sasl_mechanism',
    KafkaSecurityProtocol = 'kk_security_protocol',
    KafkaSaslJaasConfig = 'kk_sasl_jaas_config',
    KafkaSslEndpointIdentificationAlgo = 'kk_ssl_endpoint_identification_algo',
    KafkaSslTsType = 'kk_ssl_ts_type',
    KafkaSslTsCertificates = 'kk_ssl_ts_certificates'
}

export const defaultVisibleColumns: DatastoreColumn[] = [
    DatastoreColumn.ShortName,
    DatastoreColumn.Name,
    DatastoreColumn.Type,
    DatastoreColumn.Status,
    DatastoreColumn.CreatedAt
];
