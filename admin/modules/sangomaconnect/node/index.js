import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import fetch from 'node-fetch';
import express from 'express';
import pkg from 'emojione';
const { shortnameToUnicode } = pkg;
import freepbx from 'freepbx';

let f = undefined;
let _astman = undefined;

const serverToken = process.env.SERVER_TOKEN;

const API_CONFIG = JSON.parse(process.env.PORTS);
const api_protocol = API_CONFIG.api.ssl ? "https" : "http";
const api_port = API_CONFIG.api.port || "80";
const protocol_lib = (api_protocol == "https") ? https : http;

async function handleUserEvent(evt) {
    switch (evt.userevent) {
        case "sms-outbound":
        case "sms-inbound":
            console.log(`New ${evt.userevent} SMS from ${evt.from} to ${evt.to}`);
            console.debug(evt);
            const body = {
                to: evt.to,
                from: evt.from,
                direction: evt.userevent == "sms-inbound" ? "in" : "out",
                verb: "NotifyTextMessage",
                Badge: 1,
                UserName: evt.from,
                UserDisplayName: evt.cnam ? evt.cnam : evt.from,
                Id: evt.id,
                ThreadId: evt.threadid,
            };
            try {
                const url = '/sms/cloud/notify';
                const response = await fetch(API_AJAX_URL + url, {
                    method: 'post',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-SERVER-TOKEN': serverToken
                    },
                    agent: new protocol_lib.Agent({ rejectUnauthorized: false })
                });
                const data = await response.json();
                if (response.status !== 200) {
                    console.log(
                        `Error in API request (${url})`,
                        `HTTP Error Response: ${response.status} ${response.statusText}`,
                        JSON.stringify(data),
                    );
                }
            } catch (error) {
                console.error(`ERROR in ${evt.userevent} sms handler: ${error}`);
            }
            break;
        default:
            break;
    }
}

async function handleManagerEvent(evt) {
    switch (evt.event) {
        case "MessageWaiting":
            if (!evt.calleridnum) {
                return;
            }

            let toNum = [];
            let toType = null;
            let toNumData = evt.mailbox.split('@');
            toNum = toNumData[0];
            toType = toNumData[1];
            let extenNum = evt.exten;

            if (toType !== 'device') {
                return;
            }

            if (extenNum.includes('*')) {
                return;
            }
            console.log(`New voicemail received from ${evt.calleridnum} to ${toNum}`);

            const body = {
                to: toNum,
                from: evt.calleridnum,
                verb: "NotifyGenericTextMessage"
            };
            try {
                const url = '/voicemail/cloud/notify';
                const response = await fetch(API_AJAX_URL + url, {
                    method: 'post',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-SERVER-TOKEN': serverToken
                    },
                    agent: new protocol_lib.Agent({ rejectUnauthorized: false })
                });
                const data = await response.json();
                if (response.status !== 200) {
                    console.log(
                        `Error in API request (${url})`,
                        `HTTP Error Response: ${response.status} ${response.statusText}`,
                        JSON.stringify(data),
                    );
                }
            } catch (error) {
                console.error(`ERROR in ${evt.event}: ${error}`);
            }
            break;
        default:
            break;
    }
}

async function _loadPBX() {
    try {
        console.log("### Connecting to PBX");
        f = await freepbx.connect();
        _astman = f.astman;
        console.log("### Connected to PBX");

        console.log(`Adding Asterisk Manager listener for sms userevent`);
        _astman.on("userevent", handleUserEvent);
        console.log(`Adding Asterisk Manager listener for voicemail managerevent`);
        _astman.on("managerevent", handleManagerEvent);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

_loadPBX();

console.log("### SangomaConnect Daemon running on port", process.env.NODE_PORT);

const privateKey = process.env.KEYFILE ? fs.readFileSync(process.env.KEYFILE, "utf8") : undefined;
const certificate = process.env.CERTFILE
    ? fs.readFileSync(process.env.CERTFILE, "utf8")
    : undefined;

const port = process.env.NODE_PORT || 8443;

const credentials = privateKey && certificate ? { key: privateKey, cert: certificate } : undefined;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let httpsServer = credentials ? https.createServer(credentials, app) : http.createServer(app);

httpsServer.listen(port, "127.0.0.1");


const API_AJAX_URL =
    api_protocol +
    "://127.0.0.1:" +
    api_port +
    "/admin/ajax.php?module=sangomaconnect&command=api&query=";

app.get("/mobile/sip/credentials", async function (req, res) {
    console.debug("params /mobile/sip/credentials", req.params);
    console.debug("query /mobile/sip/credentials", req.query);

    const body = {
        email: req.query.cloud_username,
        password: req.query.cloud_password,
    };
    try {
        const url = '/user/credentials';
        const response = await fetch(API_AJAX_URL + url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'X-SERVER-TOKEN': serverToken
            },
            agent: new protocol_lib.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.log(
                `Error in API request ('/mobile/sip/credentials')`,
                `HTTP Error Response: ${response.status} ${response.statusText}`,
                JSON.stringify(data),
            );
            res.status(response.status).send("Failed to get user credentials");
            return false;
        }
        if (!("username" in data)) {
            res.status(400).send("Your account has expired. Please contact your system administrator");
            return;
        }
        res.setHeader("Content-Type", "application/xml");

        let smsXml = "";
        let networkXML = "";
        let secureCallsXML = "";
        if (data.sms_send_url && data.sms_fetch_url) {
            let fetchPostData = {
                cloud_username: "%account[cloud_username]%",
                cloud_password: "%account[cloud_password]%",
                last_id: "%last_known_sms_id%",
                last_sent_id: "%last_known_sent_sms_id%",
                device: "%installid%",
            };

            let sendPostData = {
                cloud_username: "%account[cloud_username]%",
                cloud_password: "%account[cloud_password]%",
                sms_to: "%sms_to%",
                sms_body: "%sms_body%",
            };

            smsXml =
                "\t<genericSmsSendUrl>" +
                data.sms_send_url +
                "</genericSmsSendUrl>\n" +
                "\t<genericSmsSendPostData>" +
                JSON.stringify(sendPostData) +
                "</genericSmsSendPostData>\n" +
                "\t<genericSmsPostData>" +
                JSON.stringify(sendPostData) +
                "</genericSmsPostData>\n" +
                "\t<genericSmsContentType>application/json</genericSmsContentType>\n" +
                "\t<genericSmsFetchUrl>" +
                data.sms_fetch_url +
                "</genericSmsFetchUrl>\n" +
                "\t<genericSmsFetchPostData>" +
                JSON.stringify(fetchPostData) +
                "</genericSmsFetchPostData>\n" +
                "\t<genericSmsFetchContentType>application/json</genericSmsFetchContentType>\n";
        }

        if (data.stunServer) {
            networkXML += "\t<STUN>" + data.stunServer + "</STUN>\n";
        }

        if (data.stunServer && data.stunUsername) {
            networkXML += "\t<STUNUsername>" + data.stunUsername + "</STUNUsername>\n";
        }

        if (data.stunServer && data.stunPassword) {
            networkXML += "\t<STUNPassword>" + data.stunPassword + "</STUNPassword>\n";
        }

        if (data.contactIP) {
            networkXML += "\t<contactIP>" + data.contactIP + "</contactIP>\n";
        }

        if (data.natTraversal) {
            networkXML += "\t<natTraversal>" + data.natTraversal + "</natTraversal>\n";
        }

        if (data.ignoreSymmetricNat) {
            networkXML +=
                "\t<ignoreSymmetricNat>" + data.ignoreSymmetricNat + "</ignoreSymmetricNat>\n";
        }

        if (data.forcedContact) {
            networkXML += "\t<forcedContact>" + data.forcedContact + "</forcedContact>\n";
        }
        if (data.secureCallType !== "no" && (data.transport === 'tls' || data.transport === 'tls+sip:')) {
            // possibles values of secureCallType are: no, sdes, dtls
            // possibles values of secureCallIncomingOption are "", "required", "enabled"
            // possibles values of secureCallOutgoingOption are "", "required", "enabled"
            secureCallsXML +=
                "\t<" +
                data.secureCallType +
                "Incoming>" + data.secureCallIncomingOption + "</" +
                data.secureCallType +
                "Incoming>\n\t<" +
                data.secureCallType +
                "Outgoing>" + data.secureCallOutgoingOption + "</" +
                data.secureCallType +
                "Outgoing>\n";
        }

        let endcalltone = "periodic(sine(250ms,2000,480Hz,620Hz),silence(250ms))";
        if (data.endCallTone) {
            endcalltone = data.endCallTone;
        }

        let xml =
            "<account>\n\t<title>Initializing</title>\n\t<username>" +
            data.username +
            "</username>\n" +
            "\t<password>" +
            data.password +
            "</password>\n" +
            "\t<host>" +
            data.host +
            "</host>\n" +
            "\t<extProvUrl>" +
            data.extProvUrl +
            "</extProvUrl>\n" +
            "\t<transport>" +
            data.transport +
            "</transport>\n" +
            "\t<expires>60</expires>\n" +
            "\t<subscribeForVoicemail>1</subscribeForVoicemail>\n" +
            "\t<voiceMailNumber>" +
            data.voiceMailNumber +
            "</voiceMailNumber>\n" +
            "\t<busyTone>periodic(sine(500ms,2000,480Hz,620Hz),silence(500ms))</busyTone>\n" +
            "\t<endCallTone>" + endcalltone + "</endCallTone>\n" +
            "\t<callWaitingTone>periodic(sine(300ms,2000,440Hz),silence(10000ms))</callWaitingTone>\n" +
            "\t<ringingTone>periodic(sine(2000ms,2000,440Hz,480Hz),silence(4000ms))</ringingTone>\n" +
            "\t<extProvInterval>60</extProvInterval>\n" +
            smsXml +
            secureCallsXML +
            networkXML +
            "\t<X-install-id>FPBX</X-install-id>\n" +
            "</account>\n";
        res.send(xml);
    } catch (error) {
        console.error(`ERROR in /mobile/sip/credentials endpoint: ${error}`);
    }
});

app.get("/mobile/sip/provision", async function (req, res) {
    console.debug("GET /mobile/sip/provision query", req.query);
    console.debug("GET /mobile/sip/provision params", req.params);

    const body = {
        email: req.query.cloud_username,
        password: req.query.cloud_password,
        build: req.query.build,
        platform: req.query.platform,
        platformversion: req.query.platformversion,
        version: req.query.version,
        locale: req.query.locale,
        cpu: req.query.cpu,
        device: req.query.device,
    };
    try {
        const url = '/user/provision';
        const response = await fetch(API_AJAX_URL + url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'X-SERVER-TOKEN': serverToken
            },
            agent: new protocol_lib.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.log(
                `Error in API request ('/mobile/sip/provision')`,
                `HTTP Error Response: ${response.status} ${response.statusText}`,
                JSON.stringify(data),
            );
            let xml = '<account>\n\t<title>Logged out.</title>\n\t<username>invalid-user</username>\n\t<password>invalid-pass</password>\n\t<host>invalid-pbx.sangoma.com:9999</host>\n</account>';
            res.send(xml);
            return false;
        }
        res.setHeader("Content-Type", "application/xml");
        let endcalltone = "periodic(sine(250ms,2000,480Hz,620Hz),silence(250ms))";
        if (data.endCallTone) {
            endcalltone = data.endCallTone;
        }
        let tonesXml =
            "\t<busyTone>periodic(sine(500ms,2000,480Hz,620Hz),silence(500ms))</busyTone>\n" +
            "\t<endCallTone>" + endcalltone + "</endCallTone>\n" +
            "\t<callWaitingTone>periodic(sine(300ms,2000,440Hz),silence(10000ms))</callWaitingTone>\n" +
            "\t<ringingTone>periodic(sine(2000ms,2000,440Hz,480Hz),silence(4000ms))</ringingTone>\n";
        let smsXml = "";
        let networkXML = "";
        let rewritingXML = "";
        let credentialsXML = "";
        if (data.sms_send_url && data.sms_fetch_url) {
            let fetchPostData = {
                cloud_username: "%account[cloud_username]%",
                cloud_password: "%account[cloud_password]%",
                last_id: "%last_known_sms_id%",
                last_sent_id: "%last_known_sent_sms_id%",
                device: "%installid%",
            };

            let sendPostData = {
                cloud_username: "%account[cloud_username]%",
                cloud_password: "%account[cloud_password]%",
                sms_to: "%sms_to%",
                sms_body: "%sms_body%",
            };

            smsXml =
                "\t<genericSmsSendUrl>" +
                data.sms_send_url +
                "</genericSmsSendUrl>\n" +
                "\t<genericSmsSendPostData>" +
                JSON.stringify(sendPostData) +
                "</genericSmsSendPostData>\n" +
                "\t<genericSmsPostData>" +
                JSON.stringify(sendPostData) +
                "</genericSmsPostData>\n" +
                "\t<genericSmsContentType>application/json</genericSmsContentType>\n" +
                "\t<genericSmsFetchUrl>" +
                data.sms_fetch_url +
                "</genericSmsFetchUrl>\n" +
                "\t<genericSmsFetchPostData>" +
                JSON.stringify(fetchPostData) +
                "</genericSmsFetchPostData>\n" +
                "\t<genericSmsFetchContentType>application/json</genericSmsFetchContentType>\n";
        }
        if (data.stunServer) {
            networkXML += "\t<STUN>" + data.stunServer + "</STUN>\n";
        }

        if (data.stunServer && data.stunUsername) {
            networkXML += "\t<STUNUsername>" + data.stunUsername + "</STUNUsername>\n";
        }

        if (data.stunServer && data.stunPassword) {
            networkXML += "\t<STUNPassword>" + data.stunPassword + "</STUNPassword>\n";
        }

        if (data.contactIP) {
            networkXML += "\t<contactIP>" + data.contactIP + "</contactIP>\n";
        }

        if (data.natTraversal) {
            networkXML += "\t<natTraversal>" + data.natTraversal + "</natTraversal>\n";
        }

        if (data.ignoreSymmetricNat) {
            networkXML +=
                "\t<ignoreSymmetricNat>" + data.ignoreSymmetricNat + "</ignoreSymmetricNat>\n";
        }

        if (data.forcedContact) {
            networkXML += "\t<forcedContact>" + data.forcedContact + "</forcedContact>\n";
        }

        let title = data.ext;
        if (!("ext" in data)) {
            credentialsXML = "<host>127.0.0.1</host><username>expired-license</username><password>expired-license</password>";
            title = 'expired-license';
        } else if (data.username) {
            credentialsXML = "<host>" + data.host + "</host><username>" + data.username + "</username><password>" + data.password + "</password>";
        }

        if (data.emgNumbers) {
            let conditions = "";
            let callRoute = "'" + data.ecallRoute + "'";
            data.emgNumbers.forEach(element => {
                let con_str = "'" + element + "'";
                conditions +=
                    "\t<rule>\n" +
                    "\t<conditions>\n" +
                    "\t<condition type='equals' param=" + con_str + "/>\n" +
                    "\t</conditions>\n" +
                    "\t<actions>\n" +
                    "\t<action type='overrideDialAction' param=" + callRoute + "/>\n" +
                    "\t</actions>\n" +
                    "\t</rule>\n";
            });
            rewritingXML =
                "\t<rewriting>\n" +
                conditions +
                "\t</rewriting>\n";
        } else {
            rewritingXML =
                "\t<rewriting>\n" +
                "\t</rewriting>\n";
        }

        if (data.presence && data.presence != "not_set") {
            let presence = data.presence;
            title = title + " | " + presence.replace(/^./, presence[0].toUpperCase())
        }

        let voicemailXML =
            "\t<subscribeForVoicemail>1</subscribeForVoicemail>\n" +
            "\t<voiceMailNumber>" + data.voiceMailNumber + "</voiceMailNumber>\n";
        let xml =
            "<account>\n\t<title>" +
            title +
            "</title>\n" +
            tonesXml +
            smsXml +
            networkXML +
            voicemailXML +
            rewritingXML +
            credentialsXML +
            "\t<X-install-id>FPBX</X-install-id>\n" +
            "</account>";
        res.send(xml);
    } catch (error) {
        console.error(`ERROR in /mobile/sip/provision endpoint: ${error}`);
    }
});

app.get("/mobile/sip/contacts", async function (req, res) {
    console.debug("GET /mobile/sip/contacts", req.query);
    console.debug("GET /mobile/sip/contacts", req.params);

    const body = {
        email: req.query.cloud_username,
        password: req.query.cloud_password,
    };
    try {
        const url = '/user/contacts';
        const response = await fetch(API_AJAX_URL + url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'X-SERVER-TOKEN': serverToken
            },
            agent: new protocol_lib.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.log(
                `Error in API request ('/mobile/sip/contacts')`,
                `HTTP Error Response: ${response.status} ${response.statusText}`,
                JSON.stringify(data),
            );
            res.status(response.status).send("Failed to get user contacts");
            return false;
        }
        res.send(data);
    } catch (error) {
        console.error(`ERROR in /mobile/sip/contacts endpoint: ${error}`);
    }
});

app.post("/mobile/sip/setup", async function (req, res) {
    const body = {
        username: req.body.username,
        password: req.body.password,
        cloud_id: req.body.cloud_id,
        domain_access_token: req.body.auth_token,
    };
    try {
        const url = '/user/setup';
        const response = await fetch(API_AJAX_URL + url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'X-SERVER-TOKEN': serverToken
            },
            agent: new protocol_lib.Agent({ rejectUnauthorized: false, strictSSL: false })
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.log(
                `Error in API request ('/mobile/sip/setup')`,
                `HTTP Error Response: ${response.status} ${response.statusText}`,
                JSON.stringify(data)
            );
        }
        res.send("ok");
    } catch (error) {
        console.error(`ERROR in /mobile/sip/setup endpoint: ${error}`);
    }
});

app.post("/mobile/checkCredentials", async function (req, res) {
    console.debug("POST /mobile/checkCredentials query", req.query);
    console.debug("POST /mobile/checkCredentials params", req.params);
    console.debug("POST /mobile/checkCredentials body", req.body);

    const body = {
        email: req.body.email,
        password: req.body.password,
    };
    try {
        const url = '/user/checkCredentials';
        const response = await fetch(API_AJAX_URL + url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'X-SERVER-TOKEN': serverToken
            },
            agent: new protocol_lib.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.log(
                `Error in API request ('/mobile/checkCredentials')`,
                `HTTP Error Response: ${response.status} ${response.statusText}`,
                JSON.stringify(data),
            );
            res.status(response.status).send("Failed to validate user credentials");
            return false;
        }
        res.status(response.status).send({ status: data.status });
    } catch (error) {
        console.error(`ERROR in /mobile/checkCredentials endpoint: ${error}`);
    }
});

app.post("/api/v1/mobile/sms/fetch", async function (req, res) {
    console.debug("POST /mobile/sms/fetch query", req.query);
    console.debug("POST /mobile/sms/fetch params", req.params);
    console.debug("POST /mobile/sms/fetch body", req.body);

    const body = {
        email: req.body.email,
        password: req.body.password,
        last_id: req.body.last_id ? parseInt(req.body.last_id) : 0,
        last_sent_id: req.body.last_sent_id ? parseInt(req.body.last_sent_id) : 0,
    };
    try {
        const url = '/sms/fetch';
        const response = await fetch(API_AJAX_URL + url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'X-SERVER-TOKEN': serverToken
            },
            agent: new protocol_lib.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.log(
                `Error in API request ('/mobile/sms/fetch')`,
                `HTTP Error Response: ${response.status} ${response.statusText}`,
                JSON.stringify(data),
            );
            res.status(response.status).send(data);
            return false;
        }
        if (!data.status) {
            res.status(response.status).send(data);
        }
        let unread_smss = [];
        let sent_smss = [];
        let messages = [];

        if (!Array.isArray(data.message)) {
            messages.push(data.message);
        } else {
            messages = data.message;
        }

        let attachments = [];
        messages.forEach(msg => {
            attachments = [];
            let sDate = new Date(msg.tx_rx_datetime);

            if (msg.contentLength) {
                // MMS here => add attachment 
                attachments.push({
                    'content-type': msg.contentType,
                    'content-url': msg.contentUrl,
                    'content-size': msg.contentLength,
                    'encryption-key': msg.contentKey
                });
            }

            if (msg.direction == "in") {
                unread_smss.push({
                    sms_id: msg.id,
                    sending_date: sDate.toISOString(),
                    sender: msg.cnam ? msg.cnam : msg.from,
                    sms_text: msg.contentLength ? JSON.stringify({ attachments: attachments }) : shortnameToUnicode(msg.body),
                    content_type: msg.contentLength ? 'application/x-acro-filetransfer+json' : 'text/plain'
                });
            } else {
                sent_smss.push({
                    sms_id: msg.id,
                    sending_date: sDate.toISOString(),
                    recipient: msg.cnam ? msg.cnam : msg.to,
                    sms_text: msg.contentLength ? JSON.stringify({ attachments: attachments }) : shortnameToUnicode(msg.body),
                    content_type: msg.contentLength ? 'application/x-acro-filetransfer+json' : 'text/plain'
                });
            }
        });
        const date = new Date();
        let respBody = { date: date.toISOString() };
        respBody.unread_smss = unread_smss;
        respBody.sent_smss = sent_smss;

        res.send(respBody);
    } catch (error) {
        console.error(`ERROR in /mobile/sms/fetch endpoint: ${error}`);
    }
});

app.post("/api/v1/mobile/sms/send", async function (req, res) {
    console.debug("POST /mobile/sms/send query", req.query);
    console.debug("POST /mobile/sms/send params", req.params);
    console.debug("POST /mobile/sms/send body", req.body);

    const body = {
        email: req.body.email,
        password: req.body.password,
        from: req.body.from,
        to: req.body.to,
        body: req.body.body,
    };
    try {
        const url = '/sms/send';
        const response = await fetch(API_AJAX_URL + url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'X-SERVER-TOKEN': serverToken
            },
            agent: new protocol_lib.Agent({ rejectUnauthorized: false })
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.log(
                `Error in API request ('/mobile/sms/send')`,
                `HTTP Error Response: ${response.status} ${response.statusText}`,
                JSON.stringify(data),
            );
            res.status(response.status).send(data);
            return false;
        }
        if (!data.status) {
            res.status(response.status).send(data);
        }
        res.send({ sms_id: data.id });
    } catch (error) {
        console.error(`ERROR in /mobile/sms/send endpoint: ${error}`);
    }
});

app.post("/api/v1/webview/proxy/request", async function (req, res) {
    console.debug("POST /api/v1/webview/proxy/request query:", req.query);
    console.debug("POST /api/v1/webview/proxy/request params:", req.params);
    console.debug("POST /api/v1/webview/proxy/request body:", req.body);

    let headers = [];
    headers["X-SERVER-TOKEN"] = serverToken;

    if (req.body.module_name) {
        const body = {
            email: req.body.email,
            password: req.body.password,
            method_name: req.body.method_name,
            module_name: req.body.module_name,
            extension: req.body.extension,
            key: req.body.key,
            value: req.body.value,
            type: req.body.type
        };
        try {
            const response = await fetch(API_AJAX_URL + req.body.method_name, {
                method: req.body.method,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'X-SERVER-TOKEN': serverToken
                },
                agent: new protocol_lib.Agent({ rejectUnauthorized: false })
            });
            const data = await response.json();
            if (response.status !== 200) {
                console.log(
                    `Error in API request`,
                    `HTTP Error Response: ${response.status} ${response.statusText}`,
                    JSON.stringify(data),
                );
                res.status(response.status).send(data);
                return false;
            }
            res.status(response.status).send(data);
        } catch (error) {
            console.error(`ERROR in /webview/proxy/request endpoint: ${error}`);
        }
    } else {
        const body = {
            email: req.body.email,
            password: req.body.password,
            method_name: req.body.method_name,
            message_id: req.body.message_id,
            account_id: req.body.account_id,
            extension: req.body.extension,
            presence_option_id: req.body.presence_option_id,
            update_provision: req.body.update_provision,
            message_ids: req.body.message_ids,
            folder: req.body.folder,
            items_per_page: req.body.items_per_page
        };
        try {
            let url = '/user/voicemail';
            const response = await fetch(API_AJAX_URL + url, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'X-SERVER-TOKEN': serverToken
                },
                agent: new protocol_lib.Agent({ rejectUnauthorized: false })
            });
            const data = await response.json();
            if (response.status !== 200) {
                console.log(
                    `Error in API request ${url}`,
                    `HTTP Error Response: ${response.status} ${response.statusText}`,
                    JSON.stringify(data),
                );
                res.status(response.status).send(data);
                return false;
            }
            res.status(response.status).send(data);
        } catch (error) {
            console.error(`ERROR in /webview/proxy/request endpoint: ${error}`);
        }
    }
});
