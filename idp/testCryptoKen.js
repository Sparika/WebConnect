//Both key obtained through URSA then JWKed by PEM2JWK
//PUBLIC
var Key = { kty: 'RSA',
            n: 'xZcpN2o9-qxEhEvtJBQyZw0r2U8MWfg0r_41QRopDyAwyMFQoXO2_oAaB-80iq7XkNy78SkS-gJfaAmTcSLModP65EV2mrVidQa5QIzj_oVmocBcv0IaHvHvBqhZ5Txt0VvdcgGdDNLiaxREgK3yrVw7nPtzWcQ9q-6zy_Df-pE',
            e: 'AQAB' }

//SECRET
var Secret = { kty: 'RSA',
               n: 'xZcpN2o9-qxEhEvtJBQyZw0r2U8MWfg0r_41QRopDyAwyMFQoXO2_oAaB-80iq7XkNy78SkS-gJfaAmTcSLModP65EV2mrVidQa5QIzj_oVmocBcv0IaHvHvBqhZ5Txt0VvdcgGdDNLiaxREgK3yrVw7nPtzWcQ9q-6zy_Df-pE',
               e: 'AQAB',
               d: 'voIkRz20TIDT_wqFtoeSoTFd2cQRkJ1zj0x2ZDKo6-CJqMZay5AaG_-_GW9VJXG2fgGVY8vKdCrdeh3hfu-ig6Lt_JNL25x553croALGHOvaxvZlpvPrfxwcC3wxU4fy8r3u2COisr8bQkXZvXzWSY5ownDSiqUj_ie296kt2AE',
               p: '7MBoMlAXB88e56DUNDt3dE64aZ4Qfjt6q0fKKZuoazlqF9oceP6rymG4O7b2e5S_9HWVy2hHqkairxmNLTmPcQ',
               q: '1aeuGKiZ6ShMcT7NKkTt3f-TUJFqOaiI_MJVbz9M1uIAz2xnI50jRC4LX2ZTLzlTTaxSkds3u21OuRuNYIfNIQ',
               dp: 'sI6EphDIPBCgMYjk99bpLJmQOWOhVSIyRw2QnBrzLJNypTsJRMpXfuQFKrM1ec_inwIZpcmsuDVZGU_q0rE8YQ',
               dq: 'ENXBlhfS6NhQDaxRJj-ALrnwtax_nkN1Z9U4PifSuivcvHtiNSAwozKtmrrJWzM9KSWm6-9GGPKn_VX6cdzBgQ',
               qi: '4CKNYzY_mAI-aBA98esujBCciOEBXihLmXa-R_vo2QFOvflBq1l_RI9GHzeuDIwWDF-9hXhLhr4OMtQPgaRrFA' }

// Problem
// jwk2pem(pem2jwk(key)) != key

 function str2ab(str) {
   var buf = new ArrayBuffer(str.length); // 2 bytes for each char
   var bufView = new Uint8Array(buf);
   for (var i=0, strLen=str.length; i < strLen; i++) {
     bufView[i] = str.charCodeAt(i);
   }
   return buf;
 }

 function ab2str(buf) {
   return String.fromCharCode.apply(null, new Uint8Array(buf));
 }

//Token 2 signed by server and verified correctly by server
//Is rejected here ...
//Token 2 is signed with RS256 i.e. RSASSA-PKCS-v1_5 using SHA-256 hash
var signature2 = "QSA7eN0R9v3R9qi5EagrCe6HBRlRm2ouKl2CHjy_htg9Qtg6XeREgQbh0YNDKIAjN-N7gyiWaEJPGodmjY73ANlSTn0OOn6HBS8swfmDB9A_xKmE078GGX_AKEjMm3WASobjNoBLwqUZUo_xLv9QnD7zmrr3O8amjGGouxyw24A"
//var header2 = {typ: "JWT", alg: "RS256"}
//var payload2 = {
//              foo: "bar",
//              iat: 1455037314,
//              exp: 1455040914
//            }
//var data2 = btoa(JSON.stringify(header2))+"."+btoa(JSON.stringify(payload2))
var data2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE0NTUwOTU2MDR9"
//console.log(data2)

// Token
var payload = {foo: 'bar', iat: 1455095604}
var header = {typ: "JWT", alg: "RS256"}
var data = btoa(JSON.stringify(header))+"."+btoa(JSON.stringify(payload))

console.log("Header.Payload: "+data)
console.log("Test AB2STR: "+ab2str(str2ab(data)))
//Verified: Data and Data2 have same 64bit representation
//However: Signature and Signature2 do not match

crypto.subtle.importKey('jwk',Secret,{ name: 'RSASSA-PKCS1-v1_5',hash: {name: "SHA-256"}},true, ['sign'])
    .then(JWKS =>
        crypto.subtle.importKey('jwk',Key,{ name: 'RSASSA-PKCS1-v1_5',hash: {name: "SHA-256"}},true, ['verify'])
    .then(JWKP =>
        crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5'}, JWKS, str2ab(data))
    .then(signature => {
        console.log("Signature: "+btoa(ab2str(signature)))
        crypto.subtle.verify({name: "RSASSA-PKCS1-v1_5"},
            JWKP, //from generateKey or importKey above
            str2ab(ab2str(signature)), //ArrayBuffer of the signature
            str2ab(data)) //ArrayBuffer of the data)
    .then(valid => console.log("Token 1 validated: "+valid))
    .then(signature => {
        console.log("Header.Payload: "+data2)
        console.log("Signature: "+signature2)
        crypto.subtle.verify({name: "RSASSA-PKCS1-v1_5"},
            JWKP, //from generateKey or importKey above
            str2ab(atob(signature2)), //ArrayBuffer of the signature
            str2ab(data2)) //ArrayBuffer of the data)
    .then(valid => console.log("Token 2 validated: "+valid))
    .catch(err => console.error(err))
})})))
