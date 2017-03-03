#Connect Addon
Identity Module extension for Firefox.

The latest published version is available at:
https://addons.mozilla.org/fr/firefox/addon/web-identity-management/
(v0.2.2 awaiting review by Mozilla, v0.1.2 is unstable)

### Installation
``` bash
npm install
```

### Run
``` bash
npm run start
```

### Usage
Firstly it is necessary to register one or more identity card in the extension.
This can be done on your Identity Provider profile's page. For instance, our demonstration IdP offer a register button:

https://energyq.idp.rethink.orange-labs.fr/

![capture d ecran 2017-03-03 a 14 06 06](https://cloud.githubusercontent.com/assets/1267701/23552231/12e4706c-001b-11e7-8e14-35b072371df6.png)

To verify that the identity card was added to the extension, click on the connect button extension in the browser task bar.
This should open a pop-up displaying registered identities.

### Login
Navigate to a (compatible) web site you want to login with, for instance:

https://acor-webrtc.rethink2.orange-labs.fr/

Following the login instructions, click on the connect button. 

![capture d ecran 2017-03-03 a 14 05 53](https://cloud.githubusercontent.com/assets/1267701/23552229/1025c2c2-001b-11e7-9caa-758768259c7c.png)

This will open a popup requesting to select an identity. Click on the identity of your choice. The extension will then instantiate an IdP-Proxy to communicate with your IdP. The process may redirect to a page requiring you to authenticate on your IdP.

![capture d ecran 2017-03-03 a 14 06 47](https://cloud.githubusercontent.com/assets/1267701/23552233/156b6908-001b-11e7-969f-6c134c2c59f8.png)
