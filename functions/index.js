const Firestore = require('@google-cloud/firestore');
const functions = require('firebase-functions');

const admin = require('firebase-admin');
const serviceAccount = require("./anonymous-storage-dff29-firebase-adminsdk-z0dmp-32d509c0e6.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://anonymous-storage-dff29.firebaseio.com"
});

const Verifier = require('google-play-billing-validator');

const purchaseVerifierOptions = {
    email: "firebase-adminsdk-z0dmp@anonymous-storage-dff29.iam.gserviceaccount.com",
    key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDg6KXYcY7y2YjS\nRz5+ASEhPjdFCR55cpJobQFWR2t6jFZSNkNxkLl9sCODWZf5jBtOIQX7UH1+u9y6\n7crjhylxHwJmSEQqMhZSnriD6I1xtrhnT7z9qEip806KZ2FEH7/rVe4UdSm4CJko\nqfaiUrpNYPY+fhWBYO6YEKno1kr1mC2SF+q58EPECMA7LO+jG6lEi3bT351weMG0\nXbbeGYfFWuBn1xJBVMTaIbZKN8+cY0maH49r+wjEwBB88rsZAERbIJi0IOVR4VG8\nOyIcfa9JwxjCcfrSWrwlD/Kl9ojBXLQUBRMkibpTRNGK64kQ9J+tgV8vNsfRqOAu\nmhqnKEUZAgMBAAECggEARtiCBWAgC1eCxdozUTXB3drfRhvNQaxZehN8LFVrAbtb\nJaJ6NDfGdlUZmrKKMM11fHLik3uTTGyY5zkog+t7nmqKMvXoovIMHhJpRQPoKj3I\ncKKpga2U1hQSVX6jIPZvWg5DZKZTcekjda+0RQWSMfWtG5pT4+FIxxXYr8Nw8VNb\nKeGWyqI/i6/VWMRgGqiDpUnlNKsKpcC/B1QbJC+gWTgXfViWS5WZN/4jfneNcmTu\nJe480J+GdGTAIaQYfA7xhsUMC/0fvLgYW/7XgvfklqX1xm1lWXTFeLtVfa3hnmG7\nYWVkJgMGHBkaCNkSjAtEfTJh4sUb/jc2s0y+vKiUEQKBgQD3X5kRIr+/NnIVXrBI\nIrgVP9xNhWdhKPpnaA8aHOQhwPsZUbZ8nm2iHGWvx3T9BFNz1GBVgE4ph/XcaxVt\nA17FdEzSbjXvxLOZNSUGJOGcv19oX5cQ+tZ0yuub5OgR2R6wVwUjgYz66su/EA2O\nJ0K9zQ7HUIi2BYva6DqP5RACUwKBgQDowH+8Bklw4um9Qae/kiOck8Tn8qbe3gup\nUHwEkdprnJmBrJ8GxzajludJEfnh/w6v/T9qWNjILFTi49SMbuxG7bCrn6J+Ly7y\nj9OMZPEMKPAb+ETeJlvdoUMqDKiwMfXFZfykpQgBih0IVjjCv6imTExPrvl7KXnE\nNudtrG1FYwKBgQDURR9G+geKIEFDHy6rp8dIzLTRfLEaSZyeEUgsQzBr2npd3qV2\nSEiRfEax0LkNyKGH2m0T0XbA4p9SFj2bfvHbBBJL3DDCX4sx482yeQF0jS9kk+pA\nss5GCD6nVoThk+tmrDWHo0qDoelWOYM4QW5fClAtLmkxsI6zOOXPxmK3awKBgQCB\n2TLp4NAEDHO+Q+yj8ZGwfrfxduwlldcHpIErw3sJYho5v+YQT/9pkHyDxWWU8Uhu\nYmiImfyG4ESTN+uSVSe4Ak730F1E7GnSpO6uenoIAKbD0+QH03qY0Ki5wsoxUg39\nDILAD9nBkh3UUtXjwC0EabiBE+rXDTKDhuXhx7pGZQKBgC4b3hJddNJp4qeAnYyx\nnl0D4d8avvoO1Nu6Mxmt1nQAot8T4gk40xuIbrAmIKO4BwrS26mhhWIK6rgNyCjV\nRq6jW3U3loEL1h7EgDXzWXw5MyQkz8Zc57NGehTQwGbc8A2AFbD/pf65Rk1lDCAZ\n45ClPCpTCM60VOaHgDl+N7I9\n-----END PRIVATE KEY-----\n"
};
const purchaseVerifier = new Verifier(purchaseVerifierOptions);
const firestore = admin.firestore();


const DB_DOCUMENTS_FIELD_DATE_CREATION_TS = "date_creation_ts";
const DB_DOCUMENTS_FIELD_DOCUMENT_PURCHASING_TYPE = "document_purchasing_type";
const DB_DOCUMENTS_FIELD_RAW_DATA = "raw_data";
const DB_DOCUMENTS_FIELD_LIFE_TIME_IN_DAYS = "life_time_in_days";


exports.putDocumentContent = functions.https.onCall((data, context) => {

    try {
        const documentKey = data.documentKey;
        const documentContent = data.documentContent;

        // check is document exists
        const documentRef = firestore.doc(`documents/${documentKey}`);

        documentRef.get().then(documentSnapshot => {
            if (documentSnapshot.exists) {
                console.log(`Document (${documentKey}) exists`);
                // check is document valid
                // if document is exist update content
                return documentRef.update({raw_data: documentContent}).then(writeResult => {
                    return console.log(`Document (${documentKey}) update: ${writeResult}`);
                }).catch(error => {
                    return console.log(`Document (${documentKey} update error: ${error})`);
                });

            } else {
                // if document is't exist create new document
                console.log(`Document (${documentKey}) isn't exists`);

                if (isBlank(documentContent)) {
                    return;
                }

                const currentTs = Date.now();
                const documentDataMap = getDocumentDataMap(currentTs, 0, documentContent, 30);

                return documentRef.create(documentDataMap).then((res) => {
                    return console.log(`Document (${documentKey}) created at ${res.updateTime}`);
                }).catch(error => {
                    return console.log(`Document (${documentKey}) create error: ${err}`);
                });
            }
        }).catch(error => {
            console.log(error);
        });

        // send result to client
    } catch (error) {
        console.error(error);
    }
});


exports.buyDocumentLifetime = functions.https.onCall((data, context) => {
    const sku = data.sku;
    const documentKey = data.documentKey;
    const purchaseToken = data.purchaseToken;

    if (isBlank(sku)) {
        throwHttpsError('invalid-argument', "sku can't be blank");
    }

    if (isBlank(documentKey)) {
        throwHttpsError('invalid-argument', "documentKey can't be blank");
    }

    if (isBlank(purchaseToken)) {
        throwHttpsError('invalid-argument', "purchaseToken can't be blank");
    }

    const documentRef = firestore.doc(`documents/${documentKey}`);

    return documentRef.get().then(documentSnapshot => {
        if (!documentSnapshot.exists) {
            throwHttpsError('not-found', "Document not found");
            return "error";
        } else {

            let receipt = {
                packageName: "io.anonymous.storage",
                productId: sku,
                purchaseToken: "purchaseToken"
            };

            return purchaseVerifier.verifyINAPP(receipt)
                .then(function (response) {
                    // Here for example you can chain your work if purchase is valid
                    // eg. add coins to the user profile, etc
                    // If you are new to promises API
                    // Awesome docs: https://developers.google.com/web/fundamentals/primers/promises

                    // TODO: extend document lifetime
                    return documentRef.update({DB_DOCUMENTS_FIELD_DOCUMENT_PURCHASING_TYPE: 1024}).then(writeResult => {
                        return console.log(`Document (${documentKey}) update: ${writeResult}`);
                    }).catch(error => {
                        return console.log(`Document (${documentKey} update error: ${error})`);
                    });
                })
                .catch(function (error) {
                    // Purchase is not valid or API error
                    // See possible error messages below
                    throwHttpsError(functions.https.errorCodeMap.aborted, "purchase is not valid");
                    return "error";
                });
        }
    })
        .catch(function (error) {
            throwHttpsError(unknown, "Unknown error");
        });
});


// exports.removeLifeEndedDocuments = functions.pubsub.schedule('every day 00:00').onRun(async context => {
//   const deletingDocuments = await getDocumentsForDeleting();
//
//   if (deletingDocuments.length <= 0) {
//     return null;
//   }
//
//   return firestore.runTransaction(transaction => {
//     for (let document of deletingDocuments) {
//       transaction.delete(document.ref());
//     }
//     return Promise.resolve();
//   });
// });


function getDocumentDataMap(creationTs, documentPurchasingType, documentContent, lifeTimeInDays) {
    return {
        date_creation_ts: creationTs,
        document_purchasing_type: 0,
        raw_data: documentContent,
        life_time_in_days: lifeTimeInDays
    };
}


async function getDocumentsForDeleting(documents = []) {
    firestore.collection("documents").listDocuments().then(documentRefs => {
        return firestore.getAll(decumentRefs);
    }).then(documentSnapshots => {
        const tsNow = Date.now();

        const documentsForDeleting = documentSnapshots.filter(documentSnapshot => {
            if (!documentSnapshot.exists) {
                return false;
            }

            const dateCreation = documentSnapshot.get(DB_DOCUMENTS_FIELD_DATE_CREATION_TS);
            const lifeTimeInDays = documentSnapshot.get(DB_DOCUMENTS_FIELD_LIFE_TIME_IN_DAYS);
            const tsLifeEnd = dateCreation + lifeTimeInDays * 1000 * 60 * 60 * 24;

            return tsNow >= tsLifeEnd;
        });

        return documents = documents.concat(documentsForDeleting);
    }).catch(error => {
        return console.log(error);
    });

    return documents;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function throwHttpsError(code, message, details) {
    throw new functions.https.HttpsError(code, message, details);
}
