# Title
Bookers1-test

## Overview
- 概要
	- 課題Bookers1の自動テスト用コードです。
	- 課題Bookers2の自動テスト用コードです。


#### Description
- Bookers1のコードを読み取り、chromeを裏で起動してビューのテストを行います。
- Bookers1のテスト内容の詳細
https://docs.google.com/spreadsheets/d/1lO8P4bfoP9xwZHhIbCYU3CDAxQEuSEuBqklsL1Ri9gI/edit#gid=0


- 追加要件
	- ルートパスの設定
	- 新規投稿したらshowページに移行すること
	- サクセスメッセージを作成する場合は以下のメッセージを表示して下さい(successfullyが入っていれば良い)
		- Book was successfully created.
		- Book was successfully updated.
	
  - 各画面に遷移するリンクに下記のクラス名を指定すること


- 追加要件
	- ルートパスの設定
	- 新規投稿したらshowページに移行すること
	- class名の指定
		- 一覧ページのshowボタンのclass名: show_#{id}
		- 一覧ページのeditボタンのclass名: edit_#{id}
		- 一覧ページのdestroyボタンのclass名: destroy_#{id}
		- 詳細ページのeditボタンのclass名: edit_#{id}
		- 編集ページのshowボタンのclass名: show_#{id}
		- タイトル投稿フォームのclass名: book_title
		- 内容投稿フォームのclass名: book_body
		- 戻る(back)ボタンにclass: back
	- サクセスメッセージを作成する場合は以下のメッセージを表示して下さい(successfullyが入っていれば良い)
		- Book was successfully created.
		- Book was successfully updated.



## Dependency
※ 必須
- 環境: Vagrant/ubuntu16.04 
- 言語: Node.js
- ライブラリ: puppeteer


## Setup
セットアップ方法、環境構築

今回はAWSのCode Commitに置いてあるBookersを使用して、テストが実行できる仮想環境でテストを行います。
https://console.aws.amazon.com/codecommit/home?region=us-east-1#/repository/Bookers/browse/HEAD/--/
上記のURLからリポジトリをクローンします。
まずは、クローンURLをコピーしてください。


ターミナルを開いて、以下の手順で設定していきます。

```
# sshでクローンする
$ git clone ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/Bookers

$ cd Bookers/vagrant
$ vagrant up
$ vagrant ssh

$ cd /vagrant
$ cd WCP/以下に生徒のアプリケーションをクローンする
$ アプリケーションに移動

$ bundle
$ rails db:migrate:reset
$ rails s

# 2つ目のターミナルで
$ vagrant ssh
$ cd /vagrant

# bookers1のテストの場合
$ sudo node bookers1.js
# ※/vagrant以下にimageディレクトリの中に、テスト実行中のスクショが保存されます。


# bookers2のテストの場合
$ sudo node bookers2.js
# ※/vagrant/bookers2-imagesディレクトリの中に、テスト実行中のスクショが保存されます。

```


## Usage
- Code Commitのリポジトリ
https://console.aws.amazon.com/codecommit/home?region=us-east-1#/repository/bookers1-test/browse/master/--/
bookers1のbookers1-test.jsファイルを
cloneしたアプリケーションのルートディレクトリに配置する

- サーバーを立ち上げておく(-dオプションはデーモンで処理させておく)
```
$ rails s
```

- bookers1テスト実行コマンド
```
$ sudo node bookers1-test.js
```
- ルートパスが設定されていない場合には、
`sudo node bookers1-test.js 引数`
`sudo node bookers1-test.js top`
のように引数を渡すことができる


- bookers2テスト実行コマンド
```
$ sudo node bookers2.js
```

- 正しくテストが実行できると/vagrant/bookers2-images/以下にテスト実行の画像が作成される
- アプリケーションディレクトリ配下にresult.logファイルが作成される(テスト実行結果)


#### Example
使用例があれば記入

#### Demo
デモがあればわかりやすくGIFなどつける

#### Install


## Author
記入者
18/5/20 Rina.Watanabe

## test
