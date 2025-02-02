export interface ProjectBase {
  projectshortname: string;
  projectname: string;
  coname: string;
  datastoreshortname: string;
  sourcetype: 'GCS' | 'AWS S3' | 'Local';
  credentials_file?: string;  // Optional for AWS
  accesskey?: string;        // Optional for GCS
  secretkey?: string;        // Optional for GCS
}

export interface ProjectAssignBase {
  useremail: string;
  projectshortname: string;
  is_active: boolean;
}

export interface ProjectAssign extends ProjectAssignBase {
  assignid: number;
  createdate: string;
  who_added: string;
}
export interface Project extends ProjectBase {
  projectid: number;
  createdate: string;
  user_email: string;
}
