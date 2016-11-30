# OIDC-NODE.js server for reThink

This server is adapted from [agmoyano/OpenIDConnect](https://github.com/agmoyano/OpenIDConnect). This is an OAUTH2/OIDC server with added support for IdP Proxy.

## Install
Two installation mode are possible. Either running it through npm or using docker. In either case a [Redis](redis.io) DB is required. The configuration file *config.js* is used to set parameters such as server host, port and redis host and port. 

#### Configuration
The [IdP Proxy](https://github.com/reTHINK-project/dev-IdPServer/blob/master/public/javascripts/rethink-oidc.js) must be modified before installation. More precisely the variable **SOURCEURL** must be modified so that *host* and *port* match the available public interface to the server. 

#### Using Node
Because of modifications (bug fixes and support for RS256) not yet commited to the original OpenIDConnect module it is necessary to overwrite one of the components after installing dependencies. 
```
npm install
cp openid-connect/index.js node_modules/openid-connect/index.js
npm start
```

#### Using Docker
The server can be either dockerized manually or using docker-compose. Dockerfile and docker-compose.yml are provided at the root of the project.

```
docker-compose up -d
```
OR

```
docker build -t oidc-node .  
docker run --name redis -p 6379:6379 -d redis  
docker run --name oidc-node -p 8080:8080 --link redis:redis -d oidc-node
```

## Setup
The initial setup requires to configure a client for handling IdP Proxy requests.

#### Create user
On **/user/create** create an initial user.

#### Register client
After creating a user, register a client on **/client/register**. This client serving as the idp-proxy must have the following properties:
* Name: rethink-oidc
* Redirect URI: /proxy/done
* Method: implicit
* Signature: RS256 

#### IdP Proxy usage
To use the IdP Proxy the setIdentityProvider function should be called in the WebRTC client. The user must be logged beforehand as there is no way to make him log-in during the generateAssertion procedure (yet). 

## Test
The general state of the server can be tested on **/test/clear**

IdP Proxy mechanism can be tested using the **proxy/test** page provided on the github repository. If everything goes fine the Id_Token should be printed in the javascript console of the browser. Alternatively this page could be used to test other IdP Server. Note that it does not test the compatibility of the IdP Proxy with the WebRTC Identity mechanism but only that the assertion can be generated validated.


## Version note
An initial version of the server is published (accessible here: https://energyq.idp.rethink.orange-labs.fr/, see also testbed description). Lots of points still requires polish and some functionnalities have not been tested (multiple user declaring a proxy). 

Contribution to the original OpenIDConnect project should be made to ensure consistency.
