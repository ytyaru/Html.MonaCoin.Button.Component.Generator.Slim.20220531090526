# 投げモナボタンジェネレータ（WebComponent版）のコードを作るジェネレータ

　過去のジェネレータを改良する。

* ボタン用に使う画像をユーザが選ぶことで可能な限り軽量化する

## 過去のジェネレータ

* [投げモナボタンジェネレータ][]
* [投げモナボタンジェネレータ（WebComponent版）][]
* [投げモナボタンジェネレータ（WebComponent版）＋アニメ][]

[投げモナボタンジェネレータ]:https://ytyaru.github.io/Html.MonaCoin.Button.Generator.20220519194201/
[投げモナボタンジェネレータ（WebComponent版）]:https://ytyaru.github.io/Html.MonaCoin.Button.Component.Generator.20220526192239/
[投げモナボタンジェネレータ（WebComponent版）＋アニメ]:https://ytyaru.github.io/Html.MonaCoin.Button.Component.Generator.Animation.20220531091850/

## やりたいこと

* 独自URLだけを使えばBase64データ不要
* Base64データは必要最小限のみ付与する
* JSコードをminifyしたい（JS自身でできるライブラリがみつからない。ES6対応のも少ない。）

```
mpurse
  アドレス
  金額
  メモ
  成功メッセージ
  失敗メッセージ
画像
　URL[xxxxxxxxxxxxxx]
  ☑ 埋め込み（Base64）
    ☑ coin-mark  ☑ 64 ☑ 256
    ☑ coin-monar ☑ 64 ☑ 256
    ☑ monar-mark ☑ 64 ☑ 256
  size [64 ▼]
  alt,title属性[xxxxxxxxxxxxxx]
アニメ
  初回時     [flip ▼]
  クリック時 [flip-jump ▼]
```

　アニメーションについてはデバイス特性も考慮せねばならない。

　本当はマウスホバーでのアニメもしたかった。けれど様々な不都合があり却下になった。

* スマホはホバーがない
* マウスでホバーすると、その間にクリックしてもジャンプアニメが作動しない

　よってアニメはクリック時のジャンプのみになった。

　条件によって最適値が異なる。だが、あまりに膨大すぎる。

* アニメーションの有無により`attachShadow`の引数`open`/`closed`を決める
* 画像ソース取得分岐
    * URL／Base64
        * Base64
            * 6パターン（type 3 * size 2）

　今回はファイル容量を減らすのが目的である。容量が大きい原因はBase64。つまりそのコード部分だけ変えるようにすればいい。場合によっては存在しないBase64画像を指定することもできてしまうが、仕方ない。

　あるいはMonacoinIconBase64コードを作成するアルゴリズムを作る。それができて、指定したBase64だけがセットされているとき、画像ソース取得アルゴリズムも以下のように変更する。と思ったが、同じままでよさそう。番号はソースコード次第で共通化できなくなってしまうが、まあいい。

```javascript
    #getImgSrc() {
        if (this.imgSrc) { return this.imgSrc }
        if (this.img) {
            const key = this.icon.getKey(this.img, this.imgSize)
            return (this.icon.Base64.has(key)) ? this.icon.Base64.get(key) : this.icon.Default }
        }
        else {
            if (this.icon.Base64.size <= num) { return this.icon.Default }
            if (num < this.icon.Base64.size) { return [...this.icon.Base64.values()][num] }
            return this.icon.get(this.img, this.imgSize)
        }
        return this.icon.Default
    }
```

