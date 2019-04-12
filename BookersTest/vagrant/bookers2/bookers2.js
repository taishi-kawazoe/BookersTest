// エラーメッセージファイル
const log_message = require('./log_message.js')
// 各アクションの定義されているファイル
const bookers2_sub = require('./bookers2-sub.js')
// エラーレベルの定義ファイル
const enum_level = require('./enum.js')

// コードチェック
'use strict';

// ヘッドレスブラウザ読み込み(読込先のパスが/home/vagrant/node_modules以下のpuppeteerのため相対パスで指定)
const puppeteer = require('../../../home/vagrant/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true, //trueにするとchromeが裏で立ち上がる
    timeout: 3000, //タイムアウトの時間変更
    slowMo: 30, //少し遅めに設定
    args: [
        //プロトコルエラー解消のため、不正に操作させないオプション
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // Chromeウィンドウのサイズ
        '--window-size=1600,950',
        // Chromeウィンドウのポジション
        '--window-position=100,50',
    ]
  });

  // 日時取得のモジュール
  require('../../../home/vagrant/node_modules/date-utils');

  // テスト実行中のスクショ 関数定義
  async function screen_shot_image(page, test_name) {
      var dt = new Date();
      var time_formatted = dt.toFormat("YYYY-MM-DD-HH24-MI-SS");
      await page.screenshot({path: `bookers2-images/${time_formatted}-${test_name}.png`, fullPage: true})
  }


  // アクセス先のIPアドレス(ポートを変更している人はここを修正)
  const url =  "http://192.168.33.10:3000"

  // pageはページ全体を示すメソッド
  const page = await browser.newPage();

  // 画面の大きさ設定
  await page.setViewport({width: 1600, height: 950});

  // 待機時間2秒に設定
  const wait_time = await page.waitFor(2000);

    // 例外処理の場合け
    try {
        await bookers2_sub.init(page);
        // #########################################################
        // ルートページ(トップページ)
        await wait_time
        if (await page.$('a')){
            await page.waitForSelector('body');
            // ユーザーのプロフィール編集テストの際にこのスクショをプロフィール画像に使用するため名前をつけておく
            await page.screenshot({path: `bookers2-images/1-top.png`, fullPage: true})
            // 時系列でスクショ作成
            await screen_shot_image(page, "top")

            // トップページがあるか確認
            var start_button = await page.$eval('a', element =>{
                 // Railsのトップページの場合
                if (element.textContent.match('\n')){
                    return false
                // トップページにリンクが作成されている場合
                }else{
                    return false
                }
            })

            console.log("=====================")
            console.log("【トップページのテスト】")
            if (start_button == true){
                if (await enum_level.output(1, log_message.root_path_error)){
                }
            }else if (start_button == false){
                // #########################################################
                // ヘッダーの各リンクのクラス名チェック
                if (await page.$('.home')){
                    await bookers2_sub.button_click(page, '.home');
                    await enum_level.output(2, log_message.home)
                } else {
                    await enum_level.output(1, log_message.home_button)
                }

                if (await page.$('.about')){
                    await bookers2_sub.button_click(page, '.about');
                    await enum_level.output(2, log_message.about)
                } else {
                    await enum_level.output(1, log_message.about_button)
                }

                if (await page.$('.sign_in')){
                    await bookers2_sub.button_click(page, '.sign_in');
                    await enum_level.output(2, log_message.sign_in)
                } else {
                    await enum_level.output(1, log_message.sign_in_button)
                }

                if (await page.$('.sign_up')){
                    await bookers2_sub.button_click(page, '.sign_up');
                    await enum_level.output(2, log_message.sign_up)
                } else {
                    await enum_level.output(1, log_message.sign_up_button && log_message.user_page)
                    process.exit(1);
                }

                await page.click('.sign_up');
                await wait_time
                await screen_shot_image(page, "after-sign_up")


                // ユーザー新規登録用のフォームのクラス名確認
                if (await page.$('.name') && await page.$('.email') && await page.$('.password') && await page.$('.password_confirm')){
                    await enum_level.output(2, log_message.top_header)
                } else{
                    await enum_level.output(1, log_message.user_form_class_name)
                    // ユーザーの新規登録ができないと以降のテストはできないため、テスト終了
                    process.exit(1);
                }

                console.log("=====================")
                console.log("【ユーザーの新規登録】")
                // #############################################################
                // 空欄登録
                console.info("空欄チェック")
                await bookers2_sub.new_user(page, "", "", "");
                await bookers2_sub.error_message_check(page);

                // ユーザーの文字数が少ない(バリデーションのテスト)
                console.info("文字数チェック")
                await bookers2_sub.new_user(page, "a", "a@a", "aaaaaa");
                await wait_time
                // エラーメッセージのテスト
                await bookers2_sub.error_message_check(page);

                // バリデーション設定がなかった場合の場合分け
                if (await page.$('.books') || await page.$('.users') || await page.$('.logout') || await page.$('.edit_user_1')){
                    // バリデーションの設定がない
                    await enum_level.output(1, log_message.user_validates_error)
                    process.exit(1);
                }else{
                    await enum_level.output(2, log_message.success_user_validates)
                }


                // 新規投稿
                console.info("サインアップ画面に遷移")
                // 更新しないとボタンがクリックできない
                await page.reload();
                await bookers2_sub.users_controller_autenticate_user_check(page);
                await wait_time
                // サインアップのバリデーションのエラー画面をチェックし、ページの更新
                await page.click('.sign_up');
                // 更新しないとボタンがクリックできない
                await page.reload();
                await wait_time
                await screen_shot_image(page, "before_create_user2")

                console.info("ユーザー新規登録")
                await bookers2_sub.new_user(page, "user1", "user1@user1", "user1user1");
                // 新規登録サクセスメッセージのテスト
                await wait_time
                await bookers2_sub.success_message(page);

                // ヘッダーの各種リンクのテスト
                if (await page.$('.books') && await page.$('.users') && await page.$('.home') && await page.$('.logout')){
                }else{
                    await enum_level.output(1, log_message.after_sign_in_message)
                    // リンク名が正しくないと以降のテストが通らなくなる
                }
                await screen_shot_image(page, "header-links")

                // デフォルト画像設定テスト
                var no_image = await page.evaluate(() => {
                    if(document.getElementsByTagName('html')[0].innerHTML.match(/no_image/) || document.getElementsByTagName('html')[0].innerHTML.match(/no/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO image/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO'\n'image/) || document.getElementsByTagName('html')[0].innerHTML.match(/noimage/) || document.getElementsByTagName('html')[0].innerHTML.match(/image/)){
                        return true
                    }else{
                        return false
                    }
                });
                if (no_image == false){
                    await enum_level.output(1, log_message.no_image)
                }


                if (await page.$('.edit_user_1')){
                    console.log("=====================")
                    console.log("【ユーザーのプロフィール編集テスト】")
                    await page.reload();
                    console.info("自己紹介文51文字投稿")
                    await bookers2_sub.edit_user(page, 1, "Bookersの自己紹介文を記述しています。テストなのでとりあえず51文字投稿して、自分を紹介します。");
                    await wait_time
                    await screen_shot_image(page, "after_edit_user1")
                    await screen_shot_image(page, "before_edit_user1_error_message")
                    await bookers2_sub.error_message_check(page);
                    await screen_shot_image(page, "after_edit_user1_error_message")
                    if (await page.$('.home')){
                        await page.click('.home');
                        await screen_shot_image(page, "edit_user1_home")
                        await wait_time

                        // ユーザー1編集
                        console.info("ユーザーの編集")
                        await bookers2_sub.edit_user(page, 1, "こんにちは自己紹介文の登録。");

                        // ユーザー情報登録
                        await wait_time
                        if (await page.$('.edit_user_1')){
                            await wait_time
                            // ユーザー情報が表示されているかチェック
                            var user_info = await page.$eval('body', el => {
                              if (el.textContent.match(/こんにちは自己紹介文の登録。/)){
                                  return true
                              }else{
                                  return false
                              }
                            });
                            await screen_shot_image(page, "check_edit_user1")
                            if (user_info == false){
                              await enum_level.output(1, log_message.user_edit)
                            }else if(user_info == true){
                              await enum_level.output(2, log_message.success_user_edit)
                            }
                        }

                        await bookers2_sub.success_message(page);
                        await screen_shot_image(page, "check_edit_user1_success_message")
                    }else{
                        await enum_level.output(1, log_message.login_header_home)
                    }
                }else{
                    await enum_level.output(1, log_message.user_edit_class_name)
                }

                console.log("=====================")
                console.log("【ログアウトのテスト】")
                if (await page.$('.logout')){
                }else{
                    await enum_level.output(1, log_message.logout_class_name)
                    // ログイアウトのテストができないので、ここまででテスト終了にする
                    process.exit(1);
                }

                await bookers2_sub.logout(page);
                await wait_time

                if (await page.$('.sign_in')){
                }else{
                    await enum_level.output(1, log_message.after_logout_link)
                    // リンクがないのでURLから直接、ユーザーの新規登録画面に遷移する
                    await page.goto(url + "/users/sign_up");
                }

                console.log("=====================")
                console.log("【ログインのテスト】")
                // ログインテスト
                await wait_time
                await screen_shot_image(page, "before_login")
                await bookers2_sub.login(page, "user1", "user1user1");

                if (await page.$('.users') && await page.$('.books')){
                }else{
                    await enum_level.output(1, log_message.after_logout_headers)
                    // リンクがないのでURLから直接、本の一覧画面に遷移する
                    // URLが/booksではない可能性は考えられるので、その場合は本の新規投稿フォームが見つからずテスト終了
                    await page.goto(url + "/books")
                }

                // 本の投稿フォームのクラス名確認
                await wait_time
                await screen_shot_image(page, "check_book_new_form")
                if (await page.$('.book_title') && await page.$('.book_body')){
                        console.log("=====================")
                        console.log("【本の新規投稿のテスト】")
                        // 新規投稿のテスト
                        await bookers2_sub.new_book(page);
                        await bookers2_sub.success_message(page);
                        await screen_shot_image(page, "after_edit_user1")

                        console.log("=====================")
                        console.log("【本の詳細画面のテスト】")
                        await page.click('.books');
                        await wait_time
                        await bookers2_sub.table(page);
                        await screen_shot_image(page, "check_book_show")

                        // 本の詳細画面のデフォルト画像設定テスト
                        await wait_time
                        var no_image = await page.evaluate(() => {
                            if(document.getElementsByTagName('html')[0].innerHTML.match(/no_image/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO image/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO'\n'image/) || document.getElementsByTagName('html')[0].innerHTML.match(/no/)){
                                return true
                            }else{
                                return false
                            }
                        });

                        if (no_image == false){
                            // 本の詳細画面にプロフィールが見つからない場合は、エラー文を返す
                            await enum_level.output(1, log_message.no_image)
                        }

                        // 本の詳細(id=1)に遷移
                        await bookers2_sub.book_show(page, 1);
                        await screen_shot_image(page, "check_book_show_1")

                        console.log("=====================")
                        console.log("【本の編集のテスト】")
                        // 編集のテスト
                        if (await bookers2_sub.edit_book(page, 1)){
                             await wait_time
                             await bookers2_sub.success_message(page);
                        }

                        console.log("=====================")
                        console.log("【連続投稿のテスト】")
                        // 繰り返し投稿のテスト
                        await wait_time
                        await screen_shot_image(page, "before_repeat_book_new")
                        await page.click('.books');
                        await bookers2_sub.repeate_book_new(page);

                        console.log("=====================")
                        console.log("【削除のテスト】")
                        // 更新しないとうまくいかない場合があるため、一旦リロードする
                        await page.reload();
                        await screen_shot_image(page, "before_book_destroy")
                        await page.click('.books');
                        await page.reload();
                        await wait_time
                        await screen_shot_image(page, "check_books_index")

                            if (await page.$('.book_5')){
                                // 削除のテスト
                                await page.click('.books');
                                // 処理時間の調整のため待機
                                await wait_time
                                await screen_shot_image(page, "check_book_5_link")
                                await bookers2_sub.button_click(page, '.book_5')
                                // 処理時間の調整のため待機
                                await wait_time
                                await bookers2_sub.destroy_book(page, 5);

                                console.log("=====================")
                                console.log("【連続削除のテスト】")
                                for (var i = 4; i >= 3; i--) {
                                    await bookers2_sub.button_click(page, '.books')
                                    await bookers2_sub.button_click(page, `.book_${i}`)
                                    await wait_time
                                    await bookers2_sub.destroy_book(page, i);
                                }
                            }else{
                                await enum_level.output(1, log_message.book_index_show_link)
                        }

                        console.log("=====================")
                        console.log("【ログアウト】")
                        // user1をログアウト
                        await bookers2_sub.logout(page);
                        await screen_shot_image(page, "after_logout")

                        console.log("=====================")
                        console.log("【ユーザー2人目作成】")
                        // user2作成
                        await wait_time
                        await page.click('.sign_up');
                        await bookers2_sub.new_user(page, "user2", "user2@user2", "user2user2")
                        await screen_shot_image(page, "before_user_2_create")

                        if (await page.$('.edit_user_2')){
                            await bookers2_sub.edit_user2(page, 2, "こんにちは");
                            // 処理時間の調整のため待機
                            await page.reload();
                            await wait_time
                            await screen_shot_image(page, "after_edit_user_2")
                            await bookers2_sub.button_click(page, '.books')
                        }else{
                            await wait_time
                            await page.reload();
                            await bookers2_sub.button_click(page, '.books')
                            console.log(log_message.user_edit_class_name)
                        }

                        console.log("=====================")
                        console.log("【本の投稿のテスト】")
                        // ユーザー2で本の新規登録
                        await bookers2_sub.new_book(page);
                        await bookers2_sub.success_message(page);

                        console.log("=====================")
                        console.log("【本の編集・削除のユーザー制限のテスト】")
                        // 本の編集・削除のユーザー制限のテスト
                        await bookers2_sub.book_collect_user(page, url + "/books/1/edit")

                        console.log("=====================")
                        console.log("【ユーザー画面のテスト】")
                        // 他のユーザーの詳細画面
                        await wait_time
                        await bookers2_sub.button_click(page, '.users')
                        await wait_time

                        console.info('ユーザー一覧画面にuser_1クラスがあるか確認')
                        if (await page.$('.user_1')){
                            await wait_time
                            await screen_shot_image(page, "check_link_user_1")
                            // デフォルト画像設定テスト
                            var no_image = await page.evaluate(() => {
                                if(document.getElementsByTagName('html')[0].innerHTML.match(/no_image/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO image/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO/) || document.getElementsByTagName('html')[0].innerHTML.match(/NO'\n'image/) || document.getElementsByTagName('html')[0].innerHTML.match(/no/)){
                                    return true
                                }else{
                                    return false
                                }
                            });

                            if (no_image == false){
                                await enum_level.output(1, log_message.no_image)
                            } else {
                                await enum_level.output(2, log_message.default_image)
                            }

                            await bookers2_sub.table(page);

                            console.info(".user_1クリック")
                            await bookers2_sub.user_page(page, 1);
                        }else{
                            await enum_level.output(1, log_message.user_index)
                        }
                }else{
                    await enum_level.output(1, log_message.book_form_class)
                }
            }
        }else{
            // トップページのリンクが見つからないエラーのためテスト狩猟
            await enum_level.output(1, log_message.top_page_links)
        }


        // #########################################################
        // テスト終了・閉じる
        await page.close();
        await browser.close();
    } catch (error) {
          console.log(log_message.test_stop_message);
          console.log(error);
          // 例外エラーのため500番のスクショを作成
          await page.screenshot({path: `bookers2-images/500-error.png`, fullPage: true})
          page.reload();
          await page.screenshot({path: `bookers2-images/500-error-reload.png`, fullPage: true})
          await screen_shot_image(page, "error")
          process.exit(1) //サーバーの停止
        }
})();