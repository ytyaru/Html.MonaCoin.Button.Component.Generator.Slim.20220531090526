class MpurseSendButton extends HTMLElement {
    constructor() {
        super();
        try {
            window.mpurse.updateEmitter.removeAllListeners()
              .on('stateChanged', isUnlocked => this.stateChanged(isUnlocked))
              .on('addressChanged', address => this.addressChanged(address));
        } catch(e) { console.debug(e) }
        this.title = '投げモナする'
        this.img = null
        this.imgSrc = null
        this.imgSize = '64'
        this.to = null
        this.asset = 'MONA'
        this.amount = '0.11411400'
        this.memo = null
        this.okMsg = '投げモナしました！\nありがとうございます！（ ´∀｀）'
        this.ngMsg = 'キャンセルしました(´・ω・｀)'
        this.icon = new MonacoinIconBase64()
    }
    static get observedAttributes() {
        return ['to', 'asset', 'amount', 'memo', 'img', 'img-src', 'img-size', 'title', 'ok-msg', 'ng-msg'];
    }
    async connectedCallback() {
        //const shadow = this.attachShadow({ mode: 'closed' });
        const shadow = this.attachShadow({ mode: 'open' }); // マウスイベント登録に必要だった。CSS的にはclosedにしたいのに。
        const button = await this.#make()
        await this.#makeClickEvent()
        console.debug(button.innerHTML)
        shadow.innerHTML = `<style>${this.#cssBase()}${this.#cssAnimation()}</style>${button.innerHTML}` 
        // pointer系 = mouse系 + touch系 + pen系
        this.shadowRoot.querySelector('img').addEventListener('pointerdown', (e)=>{ e.target.classList.add('jump'); }, false);
        //this.shadowRoot.querySelector('img').addEventListener('pointerover', (e)=>{ e.target.classList.add('flip'); }, false);
        //this.shadowRoot.querySelector('img').addEventListener('mouseover', (e)=>{ e.target.classList.add('flip'); }, false);
        this.shadowRoot.querySelector('img').addEventListener('animationend', (e)=>{ e.target.classList.remove('jump'); e.target.classList.remove('flip'); }, false);
    }
    #cssBase() { return `img{cursor:pointer; text-align:center; vertical-align:middle; user-select:none;}` }
    #cssAnimation() { return `
@keyframes jump {
  from {
    position:relative;
    bottom:0;
    transform: rotateY(0);
  }
  45% {
    position:relative;
    bottom: ${this.imgSize*2}px;
  }
  55% {
    position:relative;
    bottom: ${this.imgSize*2}px;
  }
  to {
    position:relative;
    bottom: 0;
    transform: rotateY(720deg);
  }
}
.jump {
  transform-origin: 50% 50%;
  animation: jump .5s linear alternate;
}
@keyframes flip {
  from {
    transform: rotateY(0);
  }
  to {
    transform: rotateY(180deg);
  }
}
.flip {
  transform-origin: 50% 50%;
  animation: flip .20s linear alternate;
}`; }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) { return; }
        if ('img-src' === property) { this.imgSrc = newValue}
        else if ('img-size' === property) { this.imgSize = newValue}
        else if ('ok-msg' === property) { this.okMsg = newValue}
        else if ('ng-msg' === property) { this.ngMsg = newValue}
        else { this[property] = newValue; }
    }
    stateChanged(isUnlocked) {
        console.debug(`Mpurseのロック状態が変更されました：${isUnlocked}`)
    }
    addressChanged(address) {
        console.debug(`Mpurseのログイン中アドレスが変更されました：${address}`)
        this.to = address
        this.#make().then(
            result=>{this.innerHTML = ''; this.appendChild(result); }, 
            error=>{console.debug('アドレス変更に伴いボタン更新を試みましたが失敗しました。', e);})
    }
    async #make() {
        const a = await this.#makeSendButtonA()
        const img = this.#makeSendButtonImg()
        a.appendChild(img)
        return a
    }
    async #makeClickEvent() {
        const to = this.to || await window.mpurse.getAddress()
        const asset = this.asset || 'MONA'
        const amount = Number(this.amount) || 0.11411400
        const memoType = (this.memo) ? 'plain' : 'no' // 'no', 'hex', 'plain'
        const memo = this.memo
        this.addEventListener('click', async(event) => {
            console.debug(`クリックしました。\n宛先：${to}\n金額：${amount} ${asset}\nメモ：${memo}`)
            const txHash = await window.mpurse.sendAsset(to, asset, amount, memoType, memo).catch((e) => this.ngMsg);
            if (txHash === this.ngMsg) { console.debug(this.ngMsg); alert(this.ngMsg); }
            else {
                console.debug(txHash)
                console.debug(`送金しました。\ntxHash: ${txHash}\n宛先：${to}\n金額：${amount} ${asset}\nメモ：${memo}`)
                alert(this.okMsg)
            }
        });
    }
    #makeSendButtonA() {
        const a = document.createElement('a')
        a.setAttribute('title', this.title)
        a.setAttribute('class', `vov swivel-horizontal-double`) // アニメーション用
        return a
    }
    #makeSendButtonImg() {
        const img = document.createElement('img')
        const size = this.#parseImgSize()
        const [width, height] = this.#parseImgSize()
        img.setAttribute('width', `${width}`)
        img.setAttribute('height', `${height}`)
        img.setAttribute('src', `${this.#getImgSrc()}`)
        //img.classList.add('flip'); // 初回アニメーション用
        return img
    }
    #getImgWidth() { return parseInt( (0 <= this.imgSize.indexOf('x')) ? this.imgSize.split('x')[0] : this.imgSize) }
    #getImgHeight() { return parseInt( (0 <= this.imgSize.indexOf('x')) ? this.imgSize.split('x')[1] : this.imgSize) }
    #parseImgSize() {
        if (0 <= this.imgSize.indexOf('x')) { return this.imgSize.split('x').map(v=>(parseInt(v)) ? parseInt(v) : 64) }
        else { return (parseInt(this.imgSize)) ? [parseInt(this.imgSize), parseInt(this.imgSize)] : [64, 64] }
    }
    #getImgSrc() {
        if (this.imgSrc) { return this.imgSrc }
        if (this.img) {
            const num = parseInt(this.img)
            if (isNaN(num)) {
                const key = this.icon.getKey(this.img, this.imgSize)
                return (this.icon.Base64.has(key)) ? this.icon.Base64.get(key) : this.icon.Default }
            else {
                if (this.icon.Base64.size <= num) { return this.icon.Default }
                if (num < this.icon.Base64.size) { return [...this.icon.Base64.values()][num] }
                return this.icon.get(this.img, this.imgSize)
            }
        }
        return this.icon.Default
    }
}
window.addEventListener('DOMContentLoaded', (event) => {
    customElements.define('mpurse-send-button', MpurseSendButton);
});

