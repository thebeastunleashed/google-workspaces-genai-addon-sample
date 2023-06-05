const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const Base64 = require('js-base64').Base64;

async function getGmailMessage(event) {
    //Code from https://developers.google.com/workspace/add-ons/guides/alternate-runtimes#extract_the_information
    const currentMessageId = event.gmail.messageId;
    const accessToken = event.authorizationEventObject.userOAuthToken;
    const messageToken = event.gmail.accessToken;
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const gmailResponse = await gmail.users.messages.get({
        id: currentMessageId,
        userId: "me",
        oauth2Client,
        headers: { "X-Goog-Gmail-Access-Token": messageToken },
    });

    const message = gmailResponse.data;

    console.log("Message data is " + JSON.stringify(message));

    return message;
}

function decodeGmailBodyPayload(base64EncodedText) {
    console.log("Encoded message body is " + base64EncodedText);
    let decodedBodyText = Buffer.from(base64EncodedText, "base64").toString(
        "utf8"
    );
    console.log("Decoded message body is " + decodedBodyText);
    return decodedBodyText;
}

async function createDraft(event, draftContent) {
    //TODO add a try catch
    const currentMessageId = event.gmail.messageId;
    const threadId = event.gmail.threadId;
    const oauthToken = event.authorizationEventObject.userOAuthToken;
    const accessToken = event.gmail.accessToken;
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: oauthToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const gmailResponse = await gmail.users.messages.get({
        id: currentMessageId,
        userId: "me",
        oauth2Client,
        headers: { "X-Goog-Gmail-Access-Token": accessToken },
    });

    const message = gmailResponse.data;

    let messageContent = "";
    let subject = "";
    let body = "";

    // We are creating a draft reply, we could modify the values below
    // to create a brand new message (if we add functionality for this)
    // in the add-on

    const sender = message.payload.headers.find(
        (header) => header.name === "From"
    ).value;

    const originalSubject = message.payload.headers.find(
        (header) => header.name === "Subject"
    ).value;

    if (!originalSubject.startsWith("Re: ")) {
        subject = "Re: " + originalSubject;
    } else {
        subject = originalSubject;
    }

    messageContent += "To: " + sender + "\n";

    // Reply to the original sender.
    messageContent += "To: " + sender + "\n";

    // Preserve other To and CC addresses (reply-all).
    let originalTo = message.payload.headers.find(
        h => h.name == "To");
    let cc = "";
    if (originalTo) {
        cc += originalTo.value;
    }
    let originalCc = message.payload.headers.find(
        h => h.name == "Cc")
    if (originalCc) {
        if (originalTo) {
            cc += ", "
        }
        cc += originalCc.value;
    }
    if (cc) {
        messageContent += "CC: " + cc + "\n";
    }

    body = draftContent;

    messageContent += "Subject: " + subject + "\n";
    messageContent += "\n" + body;
    console.log("messageContent: " + messageContent);

    const newDraft = await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
            message: {
                raw: Base64.encodeURI(messageContent),
                threadId: threadId
            }
        },
        oauth2Client,
        headers: { 'X-Goog-Gmail-Access-Token': accessToken }
    });
    console.log("newDraft: " + JSON.stringify(newDraft.data));
    return newDraft.data;
}

exports.getGmailMessage = getGmailMessage;
exports.decodeGmailBodyPayload = decodeGmailBodyPayload;
exports.createDraft = createDraft;