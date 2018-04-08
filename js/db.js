if (window.indexedDB) {
    var request = indexedDB.open("headline", 1);

    request.onerror = function(e) {
        console.log(e);
    }

    request.onupgradeneeded = function(e) {
        var db = e.target.result;
        var objectStore = db.createObjectStore("headline", { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex("author", "author", { unique: false });
        objectStore.createIndex("title", "title", { unique: false });
        objectStore.createIndex("source", "source", { unique: false });
        objectStore.createIndex("description", "description", { unique: false });
        objectStore.transaction.oncomplete = function(e) {
            var store = db.transaction(["headline"], "readwrite").objectStore("headline");

            for (var i = 0; i < results.length; i++) {
                store.add(results[i]);
            }

        }

    }

    request.onsuccess = function(e) {
        console.log("success");
    }
};


function createDB(result) {
    var results = [];
    results = result;
    dbPromise.then(db => {
        const tx = db.transaction('headline', 'readwrite');
        var store = tx.objectStore('headline');
        for (var i = 0; i < results.length; i++) {
            store.put(results[i]);
        }

        return tx.complete;
    });
};

const dbPromise = idb.open('headline-db', 1, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore('keyVal');
        case 1:
            var objectStore = upgradeDb.createObjectStore('headline', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex("author", "author", { unique: false });
            objectStore.createIndex("title", "title", { unique: false });
            objectStore.createIndex("source", "source", { unique: false });
            objectStore.createIndex("description", "description", { unique: false });
    };


});