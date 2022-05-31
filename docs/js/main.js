window.addEventListener('DOMContentLoaded', async(event) => {
    console.debug('DOMContentLoaded!!');
    const mention = new WebMention(30) 
    await mention.make() 
    try {
        window.mpurse.updateEmitter.removeAllListeners()
          .on('stateChanged', isUnlocked => console.log(isUnlocked))
          .on('addressChanged', address => console.log(address));
        document.getElementById('address').value = await window.mpurse.getAddress()
    } catch(e) { console.debug(e) }
    const zip = new ZipDownloader()
    const gen = new MpurseSendButtonGenerator() 
    console.log(new MonacoinIconBase64Generator() )
    gen.setImage()
    async function generate() {
        const selectedImgId = (document.getElementById('img-src').value) ? null : [...document.querySelectorAll(`input[type="radio"][name="img"]`)].filter(input=>input.checked)[0].id
        console.log(selectedImgId)
        await gen.generate(selectedImgId)
    }
    generate()
    document.getElementById('get-address').addEventListener('click', async(event) => {
        document.getElementById('to').value = await window.mpurse.getAddress()
        await generate()
    })
    document.getElementById('to').addEventListener('input', async(event) => { await generate() })
    document.getElementById('amount').addEventListener('input', async(event) => { await generate() })
    document.getElementById('asset').addEventListener('input', async(event) => { await generate() })
    document.getElementById('memo').addEventListener('input', async(event) => { await generate() })
    for (const radio of document.querySelectorAll('input[name="img"]')) {
        radio.addEventListener('change', async(event) => {
            await gen.generate((document.getElementById('img-src').value) ? null : event.target.id)
        })
    }
    document.getElementById('img-src').addEventListener('change', async(event) => {
        console.log(event)
        console.log(event.target.value)
        document.getElementById('img-src-img').src = event.target.value
        document.getElementById('img-src-img').style.display = (event.target.value) ? 'inline' : 'none'
        await gen.generate() 
    })
    document.getElementById('img-size').addEventListener('change', async(event) => { await generate() })
    document.getElementById('title').addEventListener('change', async(event) => { await generate() })
    document.getElementById('ok-msg').addEventListener('input', async(event) => { await generate() })
    document.getElementById('ng-msg').addEventListener('input', async(event) => { await generate() })
    document.getElementById('copy-to-clipboard').addEventListener('click', async(event) => { await gen.copy() })
    document.getElementById('download-zip').addEventListener('click', async(event) => {
        const selectedImgId = (document.getElementById('img-src').value) ? null : [...document.querySelectorAll(`input[type="radio"][name="img"]`)].filter(input=>input.checked)[0].id
        await zip.download(selectedImgId)
    })
});
window.addEventListener('load', async(event) => {
    console.debug('load!!');
});
window.addEventListener('beforeunload', async(event) => {
    console.debug('beforeunload!!');
});

