package com.ect.service;

import static javax.naming.directory.SearchControls.SUBTREE_SCOPE;

import java.util.Hashtable;

import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import javax.naming.ldap.InitialLdapContext;
import javax.naming.ldap.LdapContext;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.springframework.stereotype.Service;


//*****************************************************************************/
/**
*   Provides static methods to authenticate users, change passwords, etc. 
*
******************************************************************************/
@Service
public class ActiveDirectory {

  private static String[] userAttributes = {
      "distinguishedName","cn","name","uid",
      "sn","givenname","memberOf","samaccountname",
      "userPrincipalName","mail"
  };

  private ActiveDirectory(){}


//**************************************************************************
//** getConnection
//*************************************************************************/
/**  Used to authenticate a user given a username/password. Domain name is
 *   derived from the fully qualified domain name of the host machine.
 */
  public static LdapContext getConnection(String username, String password) throws NamingException {
      return getConnection(username, password, null, null);
  }


//**************************************************************************
//** getConnection
//*************************************************************************/
/**  Used to authenticate a user given a username/password and domain name.
 */
  public static LdapContext getConnection(String username, String password, String domainName) throws NamingException {
      return getConnection(username, password, domainName, null);
  }


//**************************************************************************
//** getConnection
//*************************************************************************/
/** Used to authenticate a user given a username/password and domain name.
 *  Provides an option to identify a specific a Active Directory server.
 */
  public static LdapContext getConnection(String username, String password, String domainName, String serverName) throws NamingException {

      if (domainName==null){
          try{
              String fqdn = java.net.InetAddress.getLocalHost().getCanonicalHostName();
              if (fqdn.split("\\.").length>1) domainName = fqdn.substring(fqdn.indexOf(".")+1);
          }
          catch(java.net.UnknownHostException e){}
      }
       
      //System.out.println("Authenticating " + username + "@" + domainName + " through " + serverName);

      if (password!=null){
          password = password.trim();
          if (password.length()==0) password = null;
      }

      //bind by using the specified username/password
      Hashtable props = new Hashtable();
      String principalName = username + "@" + domainName;
      props.put(Context.SECURITY_PRINCIPAL, principalName);
      if (password!=null) props.put(Context.SECURITY_CREDENTIALS, password);


      String ldapURL = "ldap://" + ((serverName==null)? domainName : serverName + "." + domainName) + '/';
      props.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
      props.put(Context.PROVIDER_URL, ldapURL);
      try{
          return new InitialLdapContext(props, null);
      }
      catch(javax.naming.CommunicationException e){
          throw new NamingException("Failed to connect to " + domainName + ((serverName==null)? "" : " through " + serverName));
      }
      catch(NamingException e){
          throw new NamingException("Failed to authenticate " + username + "@" + domainName + ((serverName==null)? "" : " through " + serverName));
      }
  }


//**************************************************************************
//** getUser
//*************************************************************************/
/** Used to check whether a username is valid.
 *  @param username A username to validate (e.g. "peter", "peter@acme.com",
 *  or "ACME\peter").
 */
  public static User getUser(String username, LdapContext context) {
      try{
          String domainName = null;
          if (username.contains("@")){
              username = username.substring(0, username.indexOf("@"));
              domainName = username.substring(username.indexOf("@")+1);
          }
          else if(username.contains("\\")){
              username = username.substring(0, username.indexOf("\\"));
              domainName = username.substring(username.indexOf("\\")+1);
          }
          else{
              String authenticatedUser = (String) context.getEnvironment().get(Context.SECURITY_PRINCIPAL);
              if (authenticatedUser.contains("@")){
                  domainName = authenticatedUser.substring(authenticatedUser.indexOf("@")+1);
              }
          }

          if (domainName!=null){
              String principalName = username + "@" + domainName;
              SearchControls controls = new SearchControls();
              controls.setSearchScope(SUBTREE_SCOPE);
              controls.setReturningAttributes(userAttributes);
              NamingEnumeration<SearchResult> answer = context.search( toDC(domainName), "(& (userPrincipalName="+principalName+")(objectClass=user))", controls);
              if (answer.hasMore()) {
                  Attributes attr = answer.next().getAttributes();
                  Attribute user = attr.get("userPrincipalName");
                  if (user!=null) return new User(attr);
              }
          }
      }
      catch(NamingException e){
          //e.printStackTrace();
      }
      return null;
  }


//**************************************************************************
//** getUsers
//*************************************************************************/
/** Returns a list of users in the domain.
 */
  public static User[] getUsers(LdapContext context) throws NamingException {

      java.util.ArrayList<User> users = new java.util.ArrayList<User>();
      String authenticatedUser = (String) context.getEnvironment().get(Context.SECURITY_PRINCIPAL);
      if (authenticatedUser.contains("@")){
          String domainName = authenticatedUser.substring(authenticatedUser.indexOf("@")+1);
          SearchControls controls = new SearchControls();
          controls.setSearchScope(SUBTREE_SCOPE);
          controls.setReturningAttributes(userAttributes);
          NamingEnumeration answer = context.search( toDC(domainName), "(objectClass=user)", controls);
          try{
              while(answer.hasMore()) {
                  Attributes attr = ((SearchResult) answer.next()).getAttributes();
                  Attribute user = attr.get("userPrincipalName");
                  if (user!=null){
                      users.add(new User(attr));
                  }
              }
          }
          catch(Exception e){}
      }
      return users.toArray(new User[users.size()]);
  }


  private static String toDC(String domainName) {
      StringBuilder buf = new StringBuilder();
      for (String token : domainName.split("\\.")) {
          if(token.length()==0)   continue;   // defensive check
          if(buf.length()>0)  buf.append(",");
          buf.append("DC=").append(token);
      }
      return buf.toString();
  }


//**************************************************************************
//** User Class
//*************************************************************************/
/** Used to represent a User in Active Directory
 */
  public static class User {
      private String distinguishedName;
      private String userPrincipal;
      private String commonName;
      private String givenName;
      private String surenName;
      private String email;
      public User(Attributes attr) throws javax.naming.NamingException {
      	NamingEnumeration<String> keys=attr.getIDs();
//      	while(keys.hasMore()){
//      		System.out.println(attr.get(keys.next()));
//      	}
          userPrincipal = (String) attr.get("userPrincipalName").get();
          commonName = (String) attr.get("cn").get();
          distinguishedName = (String) attr.get("distinguishedName").get();
          surenName=(String)attr.get("sn").get();
          givenName=(String)attr.get("givenName").get();
          email=(String)attr.get("mail").get();
      }

      public String getUserPrincipal(){
          return userPrincipal;
      }

      public String getCommonName(){
          return commonName;
      }

      public String getDistinguishedName(){
          return distinguishedName;
      }

      
      
      public String getGivenName() {
		return givenName;
      }

      public String getSurenName() {
		return surenName;
      }
      
      

	public String getEmail() {
		return email;
	}

	public String toString(){
          return getDistinguishedName();
      }


      private static final HostnameVerifier DO_NOT_VERIFY = new HostnameVerifier() {
          public boolean verify(String hostname, SSLSession session) {
              return true;
          }
      };

      private static TrustManager[] TRUST_ALL_CERTS = new TrustManager[]{
      new X509TrustManager() {
          public java.security.cert.X509Certificate[] getAcceptedIssuers() {
              return null;
          }
          public void checkClientTrusted(
              java.security.cert.X509Certificate[] certs, String authType) {
          }
          public void checkServerTrusted(
              java.security.cert.X509Certificate[] certs, String authType) {
          }
      }
      };
  }
  
  public static void main(String args[]) throws NamingException{
  	LdapContext context=ActiveDirectory.getConnection("matthew.zhu", "mickey#32","emrsn.org");
  	User user=ActiveDirectory.getUser("matthew.zhu", context);
  	System.out.println(user);
  	System.out.println(user.getCommonName());
  	System.out.println(user.getUserPrincipal());
  	System.out.println(user);
  	System.out.println(user);
  }
}