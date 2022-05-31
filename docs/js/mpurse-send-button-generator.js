class MpurseSendButtonGenerator {
    constructor() {
        this.iconGen = new MonacoinIconBase64Generator()
    }
    async copy() {
        try {
            this.#toast('クリップボードにコピーしました！')
            await navigator.clipboard.writeText(document.getElementById('export-code').value) 
        }
        catch(e) { console.debug('クリップボードのコピーに失敗しました……。', e) }
    }
    #toast(message) {
        if (Toastify) {
            Toastify({
                text: message,
                position: 'center',
                //duration: 3000,
                //destination: "https://github.com/apvarun/toastify-js",
                //newWindow: true,
                //close: true,
                //gravity: "top", // `top` or `bottom`
                //position: "left", // `left`, `center` or `right`
                //stopOnFocus: true, // Prevents dismissing of toast on hover
                //style: {
                //    background: "linear-gradient(to right, #00b09b, #96c93d)",
                //},
                //onClick: function(){} // Callback after click
            }).showToast();
        } else { alert(message) }
    }
    setImage() {
        const icon = new MonacoinIconBase64()
        document.getElementById('img-src-img').style.display = (document.getElementById('img-src').value) ? 'inline' : 'none'
        console.log(icon.get('coin-mark', 64))
        document.getElementById('coin-mark-img').src = icon.get('coin-mark', 64)
        document.getElementById('coin-monar-img').src = icon.get('coin-monar', 64)
        document.getElementById('monar-mark-img').src = icon.get('monar-mark', 64)
    }
    async generate(selectedImgId=null) {
        this.selectedImgId = selectedImgId
        await this.#export(this.#makeMpurseSendButton())
    }
    async #export(button) {
        document.getElementById('export').innerHTML = button
        const js = await this.#getScript()
        document.getElementById('export-code').value = js + button
    }
    #makeMpurseSendButton() {
        const attrs = []       
        for (const id of ['to', 'asset', 'amount', 'memo', 'img-src', 'img-size', 'title', 'ok-msg', 'ng-msg']) {
            const value = document.getElementById(id).value
            if (value) { attrs.push(`${id}="${value}"`) }
        }
        if (this.selectedImgId) {
            const img = document.querySelector(`input[name="img"][checked]`)
            attrs.push(`img="${this.selectedImgId.split('-').slice(0,-1).join('-')}"`)
        }
        return `<mpurse-send-button ${attrs.join(' ')}></mpurse-send-button>`
    }
    async #getScript() {
        const res = await fetch('./js/mpurse-send-button.js')
        const js = await res.text()
        return `<script>${js}${this.#getMonacoinIconBase64Code()}</script>`
    }
    #getMonacoinIconBase64Code() {
        return this.iconGen.generate(this.selectedImgId)
    }
}

