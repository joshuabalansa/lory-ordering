const targetCollectionRef = db.collection("orders").doc("QiQgHzK5ejJONcqySnGg").collection("queue");

async function duplicateDocument(sourceDocId, targetCollectionRef) {
    const sourceDocRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue").doc(sourceDocId);

    try {
        // Get data of the source document
        const sourceDocSnapshot = await sourceDocRef.get();
        const sourceData = sourceDocSnapshot.data();

        // Check if any document in the target collection has matching customerId and tableId with sourceData
        const matchingDocsSnapshot = await targetCollectionRef.get();
        let matchingDocumentExists = false;
        matchingDocsSnapshot.forEach(doc => {
            const data = doc.data();
            // console.log("target: ",data.customerid,"| source: ",sourceData.customerid)
            if (data.customerid === sourceData.customerid && data.tableid === sourceData.tableid) {
                matchingDocumentExists = true;
            }
        });

        // If matching documents exist, don't create a new document
        if (matchingDocumentExists) {
            console.log("Document with matching customerId and tableId already exists in the target collection.");
            return; // Exit function or handle accordingly
        }

        // Create a new document in the target collection with the same data
        const newDocRef = await targetCollectionRef.add(sourceData);
        console.log("Document copied successfully:", newDocRef.id);

        // Copy subcollections of the source document
        await copySubcollections(sourceDocRef, newDocRef);

    } catch (error) {
        console.error("Error copying document:", error);
    }
}

async function copySubcollections(sourceDocRef, targetDocRef) {
    // Define subcollections and their documents
    const subcollections = ["checklist", "details"];

    // Copy each subcollection and its documents
    await Promise.all(subcollections.map(async (subcollection) => {
        const sourceSubcollectionRef = sourceDocRef.collection(subcollection);
        const targetSubcollectionRef = targetDocRef.collection(subcollection);
        const documents = await sourceSubcollectionRef.get();
        
        // Copy each document to the target subcollection
        await Promise.all(documents.docs.map(async (doc) => {
            const docData = doc.data();
            await targetSubcollectionRef.doc(doc.id).set(docData);
        }));
    }));
}

// Function to loop through documents with status "completed" and duplicate them
async function duplicateCompletedDocuments() {
    const sourceCollectionRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue");

    try {
        const completedDocsSnapshot = await sourceCollectionRef.where("status", "==", "completed").get();

        completedDocsSnapshot.forEach(async (doc) => {
            console.log(doc.id);
            const sourceDocId = doc.id;
            await duplicateDocument(sourceDocId, targetCollectionRef);
        });

    } catch (error) {
        console.error("Error duplicating completed documents:", error);
    }
}
async function deleteMatchingDocuments() {
    const sourceCollectionRef = db.collection("orders").doc("d716BHinTx1rHwR96KOV").collection("queue");
    const targetCollectionRef = db.collection("orders").doc("QiQgHzK5ejJONcqySnGg").collection("queue");

    try {
        // Query source collection for documents with status "pending"
        const pendingDocsSnapshot = await sourceCollectionRef.where("status", "==", "pending").get();

        // Loop through pending documents
        pendingDocsSnapshot.forEach(async (doc) => {
            const sourceData = doc.data();

            // Check if there is a matching document in the target collection
            const matchingDocSnapshot = await targetCollectionRef.where("customerid", "==", sourceData.customerid)
                                                                  .where("tableid", "==", sourceData.tableid)
                                                                  .get();
            // If matching document found, delete it from target collection
            if (!matchingDocSnapshot.empty) {
                console.log("Matching document found in target collection. Deleting document and subcollections.");
                const matchingDocId = matchingDocSnapshot.docs[0].id;
                console.log("TARGET",matchingDocId);
                await deleteDocumentAndSubcollections(targetCollectionRef.doc(matchingDocId));
            }
        });

    } catch (error) {
        console.error("Error deleting matching documents:", error);
    }
}

async function deleteDocumentAndSubcollections(docRef) {
    // Delete the document
    await docRef.delete();

    // Define subcollections
    const subcollections = ['checklist', 'details']; // Update with your actual subcollection names

    // Delete subcollections
    await Promise.all(subcollections.map(async (subcollection) => {
        const subcollectionRef = docRef.collection(subcollection);
        await deleteCollection(subcollectionRef);
    }));
}

async function deleteCollection(collectionRef) {
    // Get all documents in the collection
    const querySnapshot = await collectionRef.get();

    // Delete each document in the collection
    querySnapshot.forEach(async (doc) => {
        await doc.ref.delete();
    });
}

duplicateCompletedDocuments();
deleteMatchingDocuments();
