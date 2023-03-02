# Cookbook for JavaScript / Typescript

## Prerequisites:

```
npm install axios
```

## Run the code

Replace `API_TOKEN` with your token and run:

```
node main.js
```

## Code

### 1. Set up required modules, baseURL, and your token

```js
const axios = require('axios');
const fs = require('fs');

const API_TOKEN = 'YOUR_API_TOKEN'
const baseURL =  'https://api.assemblyai.com/v2'
```

### 2. Upload a local file

If you already have an `audio_url` of a hosted file, you can skip this step.

```js
const uploadFile = async (file) => {
    try {
        const fileData = await fs.promises.readFile(file)

        const uploadURL = `${baseURL}/upload`

        const headers = {
            authorization: API_TOKEN,
            'transfer-encoding': 'chunked'
        }
        
        return await axios
            .post(uploadURL, fileData, { headers: headers })
            .then((res) => res.data)
            .catch((err) => console.error(err));
    }
    catch(err) {
        console.error(err)
    }
}
```

### 3. Start transcription and retrieve transcript

After making the request to the transcript endpoint, you will receive an ID for the transcription. Use it to poll the API every few seconds to check the status of the transcript job. Once the status is `completed`, you can retrieve the transcript from the API response.

```js
const transcribe = async (audio_url) => {

    const headers = {
        authorization: API_TOKEN,
        'content-type': 'application/json'
    }

    const transcriptURL = `${baseURL}/transcript`

    const payload = {
        audio_url: audio_url
      }

    const data = await axios
        .post(transcriptURL, payload, { headers: headers})
        .then((res) => res.data)
        .catch((err) => console.error(err));

    const transcriptId = data.id
    const pollingEndpoint = `${transcriptURL}/${transcriptId}`

    console.log(`Waiting for transcript: ${transcriptId} ...\n`)
    
    while (true) {
      const pollingResponse = await axios.get(pollingEndpoint, {
        headers: headers
      })
      const transcriptionResult = pollingResponse.data
    
      if (transcriptionResult.status === 'completed') {
        console.log('\nTranscription completed!\n')
        console.log(`Your transcribed text:\n\n${transcriptionResult.text}`)
        break
      } else if (transcriptionResult.status === 'error') {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }
}
```

### 4. Put everything together:

```js
const main = async () => {
    const response = await uploadFile('../audio.mp3')
    console.log(response)
    await transcribe(response.upload_url)
}

main()
```