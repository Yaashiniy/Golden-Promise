const DATABASE_NAME = 'golden-promise-drafts'
const STORE_NAME = 'files'
const DATABASE_VERSION = 1

function openDraftDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function runFileTransaction(mode, action) {
  const database = await openDraftDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const request = action(store)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function saveDraftFile(key, file) {
  if (!key || !file) return
  await runFileTransaction('readwrite', (store) => store.put(file, key))
}

export async function loadDraftFile(key) {
  if (!key) return null
  const storedFile = await runFileTransaction('readonly', (store) => store.get(key))
  if (!storedFile) return null
  if (storedFile instanceof File) return storedFile

  return new File([storedFile], storedFile.name || 'saved-document', {
    type: storedFile.type || 'application/octet-stream',
    lastModified: storedFile.lastModified || Date.now(),
  })
}

export async function removeDraftFile(key) {
  if (!key) return
  await runFileTransaction('readwrite', (store) => store.delete(key))
}

export async function removeDraftFiles(keys) {
  await Promise.all(keys.filter(Boolean).map(removeDraftFile))
}
