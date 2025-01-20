export interface LDAPConfig {
  ldap_url: string;
  ldap_password: string;
  admin_dn: string;
}

export interface LDAPResponse {
  status: number;
  message: string;
} 