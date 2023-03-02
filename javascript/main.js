const axios = require('axios');
const fs = require('fs');

const API_TOKEN = 'YOUR_API_TOKEN'
const baseURL =  'https://api.assemblyai.com/v2'

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
            .catch((err) => console.error(err))
    }
    catch(err) {
        console.error(err)
    }
}


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


const main = async () => {
    const response = await uploadFile('../audio.mp3')
    console.log(response)
    await transcribe(response.upload_url)
}

main()
