export interface TenantBkcc {
  tenantid: string;
  bkcarea: string;
  hubname: string;
  bkcc?: string;
  createdate?: string;
  user_email?: string;
}

export interface Str {
  srctgthashid?: number;
  projectshortname: string;
  srctgthash: string;
  srchash?: string;
  tgthash?: string;
  rtype?: string;
  rdata?: string;
  rfield?: string;
  hr_exec?: string;
  createdate?: string;
}

export interface Rt {
  tgthashid?: number;
  projectshortname: string;
  tgtdphash?: string;
  tgtdataset: string;
  tgttabfields?: string[];
  tgthashcol?: string;
  dpname: string;
  datastoreshortname?: string;
  tablename?: string;
  bkeys?: string;
  bkey1?: string;
  bkey2?: string;
  bkey3?: string;
  bkey4?: string;
  bkey5?: string;
  bkey6?: string;
  bkey7?: string;
  bkey8?: string;
  bkey9?: string;
  bkey10?: string;
  createdate?: string;
}
export interface Rs {
  srchashid?: number;
  projectshortname: string;
  srcdphash?: string;
  srcdataset: string;
  srctabfields?: string[];
  srchashcol?: string;
  dpname: string;
  datastoreshortname?: string;
  tablename?: string;
  bkeys?: string;
  bkey1?: string;
  bkey2?: string;
  bkey3?: string;
  bkey4?: string;
  bkey5?: string;
  bkey6?: string;
  bkey7?: string;
  bkey8?: string;
  bkey9?: string;
  bkey10?: string;
  createdate?: string;
}

export interface RdvBojDs {
  rdvid?: number;
  projectshortname: string;
  dpname?: string;
  dsname: string;
  comptype?: string;
  compname: string;
  satlnums?: number;
  satlnum?: number;
  satlname: string;
  satlversion?: number;
  tenantid?: string;
  bkcarea?: string;
  createdate?: string;
  compshortname?: string;
  user_email?: string;
  comments?: string;
  version?: number;
}

export interface RdvCompDh {
  rdvid?: number;
  projectshortname: string;
  dpname?: string;
  dsname: string;
  comptype?: string;
  compname: string;
  compkeyname: string;
  bkfields: string[];
  tenantid?: string;
  bkcarea?: string;
  createdate?: string;
  compshortname?: string;
  user_email?: string;
  version?: number;
}

export interface RdvCompDl {
  rdvid?: number;
  projectshortname: string;
  dpname: string;
  dsname: string;
  comptype: string;
  compname: string;
  compkeyname: string;
  degen: string;
  degenids: string[];
  tenantid: string;
  bkcarea: string;
  version: number;
  hubnums: number;
  hubname: string;
  hubversion: string;
  bkfields: string[];
  createdate?: string;
  user_email?: string;
  compshortname?: string;
}

export interface RdvCompDs {
  rdvid?: number;
  projectshortname: string;
  dpname?: string;
  dsname: string;
  comptype?: string;
  satlname: string;
  satlattr: string[];
  assoccomptype: string;
  assoccompname: string;
  tenantid?: string;
  bkcarea?: string;
  createdate?: string;
  user_email?: string;
  compshortname?: string;
  version?: number;
}

export interface DvCompSg1 {
  rdvid?: number;
  projectshortname: string;
  dpname?: string;
  dsname?: string;
  comptype: string;
  compname: string;
  compsubtype: string;
  sqltext?: string;
  tenantid?: string;
  bkcarea?: string;
  createdate?: string;
  compshortname?: string;
  user_email?: string;
  comments?: string;
  version?: number;
  processtype?: string;
  datefieldname?: string;
}

export interface DvCompSg2 {
  dvid?: number;
  projectshortname: string;
  comptype: string;
  compname: string;
  compsubtype: string;
  sqltext?: string;
  version?: number;
  createdate?: string;
  compshortname?: string;
  user_email?: string;
  comments?: string;
}


export interface DvCompSg1b {
  rdvid?: number;
  projectshortname: string;
  comptype: string;
  compname: string;
  compsubtype: string;
  sqltext?: string;
  createdate?: string;
  compshortname?: string;
  user_email?: string;
  comments?: string;
}

export interface DvCompPt {
  dvid?: number;
  projectshortname: string;
  comptype?: string;
  compname: string;
  compsubtype: string;
  satlnums?: number;
  satlnum?: number;
  satlname: string;
  satlversion?: number;
  createdate?: string;
  compshortname:string;
  dhname?: string;
  comments?: string;
  version?: number;
}

export interface DvCompBrg {
  dvid?: number;
  projectshortname: string;
  comptype: string;
  compname: string;
  compsubtype: string;
  sqltext?: string;
  createdate?: string;
  compshortname?: string;
  comments?: string;
  version?: number;
  processtype?: string;
  datefieldname?: string;
}

export interface DvCompDd {
  dvid?: number;
  projectshortname: string;
  comptype?: string;
  compname: string;
  compsubtype: string;
  bkfields: string[];
  sqltext?: string;
  comments?: string;
  createdate?: string;
  compshortname?: string;
  version?: number;
  datefieldname?: string;
}

export interface DvCompFt {
  dvid?: number;
  projectshortname: string;
  comptype?: string;
  compname: string;
  compsubtype: string;
  sqltext?: string;
  comments?: string;
  createdate?: string;
  compshortname?: string;
  version?: number;
  datefieldname?: string;
}

export interface DvBojSg1 {
  rdvid?: number;
  projectshortname: string;
  dpname?: string;
  dsname?: string;
  comptype: string;
  compname: string;
  compsubtype: string;
  sqltext?: string;
  tenantid?: string;
  bkcarea?: string;
  createdate?: string;
  compshortname?: string;
  user_email?: string;
  comments?: string;
  version?: number;
  processtype?: string;
  datefieldname?: string;
}

export interface DtgBase {
  dtshortname: string;
  chkfilename?: string;
  datasettype?: string;
  datasrcnum?: string;
  projectshortname: string;
  datasetshortname: string;
  dataproductshortname: string;
  testcoverageversion?: string;
  comments?: string;
}

export interface Dtg {
  dtid?: number;
  dtshortname: string;
  chkfilename?: string;
  datasettype?: string;
  datasrcnum?: string;
  projectshortname: string;
  datasetshortname: string;
  dataproductshortname: string;
  createdate?: string;
  useremailid?: string;
  testcoverageversion?: string;
  comments?: string;
}

export interface Dping {
  dpid?: number;
  dpshortname?: string;
  htmlfilename?: string;
  datasettype?: string;
  projectshortname?: string;
  datasetshortname?: string;
  dataproductshortname?: string;
  createdate?: string;
  useremailid?: string;
}

export interface DatasetBase {
  projectshortname: string;
  dataproductshortname: string;
  datasetshortname: string;
  domainshortname: string;
  datastoreshortname: string; // Reference to datastore.dsshortname
  tablename: string;
  dsdatatype: "NA" | "Daily";
  fieldname?: string;
  sourcename: string;
  tenantid: string;
  bkcarea: string;
  is_valid: boolean;
  csvname?: string;
  // CSV specific fields
  csvdailysuffix?: "YES" | "NO";
  separator?: string;
  filessource?: "local" | "AWS S3" | "GCS";
  filesbucketpath?: string;
  s3_accesskey?: string;
  s3_secretkey?: string;
  gcs_jsonfile?: string;
}

export interface Dataset extends DatasetBase {
  datasetid?: number;
  createdate?: string;
  useremailid?: string;
  datasettype?: string;
}

export interface LandingDataset {
  dlid?: number;
  projectshortname: string;
  srcdataproductshortname: string;
  srcdatasetshortname: string;
  lnddataproductshortname: string;
  lnddatasetshortname: string;
  lnddsshortname: string;
  createdate?: string;
  useremailid?: string;
  comments?: string;
}
