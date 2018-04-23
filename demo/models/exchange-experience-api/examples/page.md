# Salesforce to Salesforce, Workday, SAP and Database Account Broadcast

_Real time synchronization of accounts from one Salesforce org to another as well as a Workday HCM instance, an SAP instance and a Database using a non-persistent JMS topic._

## Description

This Anypoint Template should serve as a foundation for setting an online sync of accounts from a Salesforce instance to many destination systems, using the Publish-subscribe pattern. Every time there is a new account or a change in an already existing one, the integration will poll for changes in the Salesforce source Org, publish the changes to a JMS topic and each subscriber will be responsible for updating the accounts in the target systems.

The application has two different batch jobs consuming this JMS topic, one for migrating the changes to the second Salesforce Org and the other one for migrating the changes to the Database. During the Process stage, each Salesforce account will be matched with an existing account in the Salesforce Org B or the Database by Name. The last step of the Process stage will group the accounts and create/update them in Salesforce Org B.

Finally during the On Complete stage the Anypoint Template will log output statistics data into the console.

Read more about the Publish-Subscribe pattern in [this](http://blogs.mulesoft.com/introducing-pubsub-pattern-anypoint-templates/) blog post
