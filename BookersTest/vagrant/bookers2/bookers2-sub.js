// エラーメッセージファイル
const log = require('./log_message.js')
// エラーログ用
const enum_level = require('./enum.js')
// 待機時間
const wait_time = 2000;
// アクセス先のIPアドレス(ポートなど変更している方はここを変更してください)
const ip_addr = "http://192.168.33.10:3000/"


// 日時取得のモジュール
require('../../../home/vagrant/node_modules/date-utils');

// テスト実行中のスクショ 関数定義
async function screen_shot_image(page, test_name) {
  var dt = new Date();
  var time_formatted = dt.toFormat("YYYY-MM-DD-HH24-MI-SS");
  await page.screenshot({path: `bookers2-images/${time_formatted}-${test_name}.png`, fullPage: true})
}


// 初期設定
exports.init = async function(page){
      // ダイアログの処理を全てOKにする
      page.on('dialog', dialog => {
        dialog.accept();
      });

      // 実行したlogをルートディレクトリのresult.logファイルに吐き出す
      var fs = require('fs');
      var util = require('util');
      var log_file = fs.createWriteStream(__dirname + '/result.log', {flags : 'w'});
      var log_stdout = process.stdout;

      // console.infoをinfo.log,result.logに出力
      // 基本的にテストの詳細・メモをconsole.infoに吐き出す
      var info_file = fs.createWriteStream(__dirname + '/info.log', {flags : 'w'});
      var info_stdout = process.stdout;
      console.info = function(d) {
        info_file.write(util.format(d) + '\n');
        info_stdout.write(util.format(d) + '\n');
      };

      // console.logをすべてresult.logに出力している
      console.log = function(d) {
        log_file.write(util.format(d) + '\n');
        log_stdout.write(util.format(d) + '\n');
        info_file.write(util.format(d) + '\n');
      };

      // 引数が渡されれば引数のパスに飛ぶ/プライベートIPアドレスに遷移する
      var path = process.argv[2];
      var rootPath = function(path){
        if(path == null){
          return ip_addr
        }else{
          return ip_addr + path ;
        }
      }

      // rootパス定義
      var url = rootPath(path);
      console.log(url);
      if (url != ip_addr){
        console.log(log.root_path_error);
      }
      await page.goto(url);
      // httpリクエストヘッダのレスポンスステータスを取得
      // page.on('response', response => {
      //   // console.log(response.status(), response.url()) // 全リクエストのステータスコードとURLをlog
      //   if (400 < response.status()){
      //     console.log("ステータスエラー")
      //     console.log(response.status(), response.url())
      //   }
      //   // if (300 > response.status() && 200 <= response.status()) return;
      //   // console.warn('status error', response.status(), response.url()) // ステータスコード200番台以外をlog
      // });

}

// ##########################################################
// サクセスメッセージ
exports.success_message = async function(page){
      var message = await page.$eval('body', el =>{
          if (el.textContent.match(/successfully/) || el.textContent.match(/Successfully/)){
              return true
          }else{
              return false
          }
      });
      if (message == false){
        await enum_level.output(1, log.no_success_message)
      }
}

// ##########################################################
// エラーメッセージ
exports.error_message_check = async function(page){
    var data = await page.$eval('body', el =>{
        if (el.textContent.match(/error/) || el.textContent.match(/Error/) || el.textContent.match(/ERROR/) || el.textContent.match(/エラー/) || el.textContent.match(/Email can't be blank/) || el.textContent.match(/メール/) && el.textContent.match(/Password can't be blank/) || el.textContent.match(/パスワードが空欄です/) && el.textContent.match(/Name can't be blank/) || el.textContent.match(/名前が空欄です/) && el.textContent.match(/Name is too short/) || el.textContent.match(/2文字/) || el.textContent.match(/too long/) || el.textContent.match(/long/)){
            return true
        }else{
            return false
        }
    });
    if (data == false){
      await enum_level.output(1, log.error_message)
    }else{
      await enum_level.output(2, log.success_error_message)
    }
}


// ##########################################################
// check: authenticate_user
exports.users_controller_autenticate_user_check = async function(page){
  var authenticate = await page.$eval('body', el =>{
    return (el.textContent.match(/undefined/) || el.textContent.match(/Error/) ? true : false);
  });
  if (authenticate == true){
    await enum_level.output(1, log.fail_to_authenticate_user)
    // エラー画面のため、テスト終了
    process.exit(1)
  }
}


// ##########################################################
// ユーザー登録
exports.new_user = async function(page, name, email, password){
  await page.waitForSelector('form');
  // 各入力フォームを待機する事(処理が早すぎる入力漏れを防ぐ)
  await page.waitFor(wait_time)
  await page.type('input.name', name);
  await page.waitFor(wait_time)
  await page.type('input.email', email);
  await page.type('input.password', password);
  await page.type('input.password_confirm', password);
  await page.waitFor(wait_time)
  await screen_shot_image(page, 'before-new-user')
  await page.click('input[type="submit"]');
  await enum_level.output(2, log.new_user_form)
  await screen_shot_image(page, "new_user")

}


// ログイン
exports.login = async function(page, name, password){
    await page.click('.sign_in');
    await page.waitForSelector('form');
    await page.waitFor(wait_time)
    await page.type('input.name', name);
    await page.waitFor(wait_time)
    await page.type('input.password', password)
    await screen_shot_image(page, "login")

    await page.click('input[type="submit"]');

    // ログイン後のサクセスメッセージ内容のチェック
    await page.waitFor(wait_time)
    await screen_shot_image(page, "after-login-message")

    var message = await page.$eval('body', el =>{
        if (el.textContent.match(/successfully/) || el.textContent.match(/Successfully/)){
            return true
        }else{
            return false
        }
    });
   if (message == false){
      await enum_level.output(1, log.login_success_message)
   }else if (message == true){
      await enum_level.output(2, log.success_message)
   }
}

// ログアウト
exports.logout = async function(page){
  await page.click('.logout');
  await page.waitFor(wait_time);
  var top = await page.$eval('body', el =>{
    // 修正案件
      if (el.textContent.match(/welcome/) || el.textContent.match(/Welcome/) || el.textContent.match(/Sign up/) || el.textContent.match(/sign up/)){
          return true
      }else{
          return false
      }
  });
  if (top == false){
    await enum_level.output(1, log.after_logout_redirect)
  }else if (top == true){
    await enum_level.output(2, log.success_after_logout_redirect)
  }
  await page.reload();
  await screen_shot_image(page, "logout")

}

// ユーザー情報編集
exports.edit_user = async function(page, num, introduction){
    await page.waitFor(wait_time);
    await page.click(`.edit_user_${num}`);
    await page.waitFor(wait_time);
    await screen_shot_image(page, `edit_user_${num}`)

    await page.waitFor(wait_time);

    if (await page.$('input.name') && await page.$('.introduction') && await page.$('input[type="file"]') && await page.$('input[type="submit"]')){
        await enum_level.output(2, log.edit_user_form)

        // ユーザー情報の編集
        await page.type('input.name', "");
        await screen_shot_image(page, `edit_user_${num}_form`)
        await page.waitFor(wait_time)

        // labelにclass="introduction"をつけていると自己紹介文が入力できない
        if (await page.$('input.introduction')){
          await page.type('input.introduction', introduction);
        } else if (await page.$('textarea.introduction')) {
          await page.type('textarea.introduction', introduction);
        } else {
          await page.type('.introduction', introduction);
          // 自己紹介文を入力するフォーム以外で同じクラスが指定されている可能性がある(例：labelタグやdivタグなど)
          await enum_level.output(2, log.used_class)
        }

        const fileEle = await page.$('input[type="file"]');
        await fileEle.uploadFile(__dirname + '/bookers2-images/1-top.png');
        await page.waitFor(wait_time)

        await screen_shot_image(page, "edit_user_introduction")

        // railsのformを使用してsubmitを作成していなければクリックできないエラーさせる
        await page.click('input[type="submit"]');
        await page.waitFor(wait_time)
        await screen_shot_image(page, "edit_user_submit")

        await enum_level.output(2, log.edit_user_form_submit)

      // ユーザー編集画面のフォームが間違えている場合
    }else{
        await enum_level.output(1, log.user_form_class_name)
        await page.goBack();
    }
}


// ユーザー情報編集
exports.edit_user2 = async function(page, num, introduction){
    await page.click(`.edit_user_${num}`);
    await page.waitFor(wait_time);
    await screen_shot_image(page, `edit_user_${num}`)
    await page.type('input.name', "");

    if (await page.$('input.introduction')){
          await page.type('input.introduction', introduction);
        } else if (await page.$('textarea.introduction')) {
          await page.type('textarea.introduction', introduction);
        } else {
          await page.type('.introduction', introduction);
          // 自己紹介文を入力するフォーム以外で同じクラスが指定されている可能性がある(例：labelタグやdivタグなど)
          await enum_level.output(2, log.used_class)
        }

    const fileEle = await page.$('input[type="file"]');
    await fileEle.uploadFile(__dirname + '/bookers2-images/1-top.png');
    await page.waitFor(wait_time)
    await screen_shot_image(page, `edit_user_${num}_check`)
    // railsのformを使用してsubmitを作成していなければクリックできないエラーさせる
    await page.click('input[type="submit"]');
    await page.waitFor(wait_time)
    await enum_level.output(2, log.edit_user_form_submit)
    await page.waitFor(wait_time)
    await screen_shot_image(page, `edit_user_${num}_submit`)
}


// ##########################################################
// 本の新規投稿
exports.new_book = async function(page){
    console.info("本の空欄投稿")
    await page.waitFor(wait_time);
    await page.type('input.book_title', "");
    await page.type('textarea.book_body', "");
    // <button>タグの実装は好ましくないため、本の投稿ができてもエラーになる
    // railsのformを使用してsubmitフォームを作成してもらうこと
      if (await page.$('input[type="submit"]')){
        await page.click('input[type="submit"]');
        console.info("input[type='submit']をクリック")
      }else{
        await enum_level.output(1, log.book_submit_button)
        process.exit(1)
      }
    await page.waitFor(wait_time);

    // バリデーションのメッセージチェック
    var empty = await page.$eval('body', el =>{
        if (el.textContent.match(/error/) || el.textContent.match(/Error/) || el.textContent.match(/ERROR/) ||el.textContent.match(/blank/) || el.textContent.match(/空欄/) || el.textContent.match(/short/) || el.textContent.match(/minimum/)){
          return true
        } else{
          return false
        }
    });

    if (empty == false){
      await enum_level.output(1, log.empty_error_message)
    }else if (empty == true){
      await enum_level.output(2, log.success_error_message)
    }
    await page.reload();

    console.info("本の新規投稿")
    await screen_shot_image(page, "new_book")

    await page.type('input.book_title', "100文字投稿");
    await page.waitFor(wait_time)
    await page.type('textarea.book_body', "テキストボックスに入力された文字の数をカウントします。 Twitter投稿やレポート作成など、文字数制限のある文章を作成するときに便利です。入力するとすぐに文字数がカウントされます。これで100文字。");
    await page.click('input[type="submit"]');

    await page.waitFor(wait_time);
    var book_after = await page.$eval('body', el =>{
        if (el.textContent.match(/100文字投稿/) || el.textContent.match(/テキストボックスに入力された文字の数をカウントします。/)){
            return true
        }else{
            return false
        }
    });
    if (book_after == false){
      await enum_level.output(1, log.book_create)
    } else if (book_after == true){
      await enum_level.output(2, log.success_book_create)
    }

    await page.waitFor(wait_time);
    console.log('本の詳細画面に移動')
      var show = await page.$eval('body', el => {
          if (el.textContent.match(/Edit/) ||　el.textContent.match(/EDIT/) || el.textContent.match(/編集/) || el.textContent.match(/edit/) && el.textContent.match(/Destroy/) ||  el.textContent.match(/DESTROY/) || el.textContent.match(/削除/) || el.textContent.match(/destroy/)){
              return true
          }else{
              return false
          }
      });

      if (show == false){
        await enum_level.output(1, log.after_book_create_links)
      }
}


// 本の詳細画面の表示確認
exports.book_show = async function(page, num){
  await page.waitFor(wait_time)
  await screen_shot_image(page, "book_show")

    if (await page.$(`.book_${num}`)){
      await page.click(`.book_${num}`);
      await page.waitFor(wait_time);
      var show = await page.$eval('body', el =>{
          if (el.textContent.match(/Edit/) || el.textContent.match(/編集/) || el.textContent.match(/edit/) && el.textContent.match(/Destroy/) || el.textContent.match(/削除/) || el.textContent.match(/destroy/)){
              return true
          }else{
              return false
          }
      });
      if (show == false){
        await enum_level.output(1, log.not_found_action_links)
      }else{
        await enum_level.output(2, log.success_book_show)
      }
    }else{
      await enum_level.output(1, log.book_index_show_link)
      // 詳細画面に遷移できないと編集・削除のテストがエラーになってしまうため、テスト終了
      // process.exit(1);
    }
}


// 本の編集のテスト
exports.edit_book = async function(page, num){
        await page.waitFor(wait_time)
        if (await page.$(`.edit_book_${num}`)){
          await page.click(`.edit_book_${num}`);
          await page.waitFor(wait_time);

            if (await page.$('input.book_title') && await page.$('textarea.book_body') && await page.$('input[type="submit"]')){
                  console.info("200文字の投稿")
                  await page.type('input.book_title', "から200文字投稿のテスト");
                  await page.type('textarea.book_body', "テキストボックスに入力された文字の数をカウントします。 Twitter投稿やレポート作成など、文字数制限のある文章を作成するときに便利です。入力するとすぐに文字数がカウントされます。これで200文字。");
                  await page.click('input[type="submit"]');
                  await page.waitFor(wait_time)

                  var edit = await page.$eval('body', el =>{
                      if (el.textContent.match(/から200文字投稿のテスト/) || el.textContent.match(/テキストボックスに入力された文字の数をカウントします。/)){
                          return true
                      }else{
                          return false
                      }
                  });
                  if (edit == false){
                    await enum_level.output(1, log.book_edit)
                  }else{
                    await enum_level.output(2, log.success_book_create)
                  }
                  await screen_shot_image(page, `edit_book_${num}`)


                  await page.waitFor(wait_time)
                  await page.click('.books');

                  await page.waitFor(wait_time)
                  await page.click(`.book_${num}`);

                  await page.waitFor(wait_time)
                  await page.click(`.edit_book_${num}`);
                  await page.waitFor(wait_time)

                  console.info("本のバリデーションのテスト")
                  await page.type('input.book_title', "バリデーションテスト");
                  await page.type('textarea.book_body', "バリデーションのテストです");
                  await screen_shot_image(page, `edit_book_${num}_validates`)

                  await page.click('input[type="submit"]');

                  // バリデーションのエラーメッセージチェック
                  await page.waitFor(wait_time);
                  var edit_message = await page.$eval('body', el =>{
                      if (el.textContent.match(/too long/) || el.textContent.match(/long/) || el.textContent.match(/長/) || el.textContent.match(/error/) || el.textContent.match(/Error/) || el.textContent.match(/エラー/) || el.textContent.match(/maximum/) || el.textContent.match(/200/) || el.textContent.match(/50/) || el.textContent.match(/maximum/)){
                          return true
                      }else{
                          return false
                      }
                  });

                  if (edit_message == false){
                    await enum_level.output(1, log.error_message)
                  }else{
                    await enum_level.output(2, log.success_error_message)
                  }

                  await page.waitFor(wait_time);
                  await screen_shot_image(page, `edit_book_${num}_message`)

                  await page.waitFor(wait_time);
                  await page.type('input.book_title', "");
                  await page.focus('textarea.book_body');
                  await page.keyboard.press('Backspace');
                  await page.click('input[type="submit"]');
            }else{
              await enum_level.output(1, log.book_edit_form)
            }
        }else{
          await enum_level.output(2, log.fail_test)
          await enum_level.output(1, log.book_edit_link)
        }
}


// 本の繰り返し投稿のテスト
exports.repeate_book_new = async function(page){
  await page.waitFor(wait_time);

  for (var i = 2; i <= 5; i++) {
    await page.waitForSelector('body');
    await page.waitFor(wait_time);
    await page.reload();
    await page.type('input.book_title', `こんにちは${i}`);
    await page.waitFor(wait_time);
    await page.type('textarea.book_body', `${i}回目の投稿`);
    await screen_shot_image(page, `repeat_book_new_${i}`)

    await page.click('input[type="submit"]');
    // 内容が反映されるまで待機
    await page.waitForSelector('body');
    await page.waitFor(wait_time);
    await screen_shot_image(page, `repeat_book_new_${i}_submit`)

    await page.waitFor(wait_time);
    // 投稿の内容が反映されているか
    var sub_data = await page.$eval('html', sub_el => {
        if (sub_el.textContent.match(/こんにちは/) && sub_el.textContent.match(/回目の投稿/)){
            return true
        }else if (sub_el.textContent.match(/こんにちは/)){
            return "book_form_body"
        }else if (sub_el.textContent.match(/回目の投稿/)){
            return "book_form_title"
        }else{
            return "book_save"
        }
    });
    if (sub_data == "book_form_body"){
      await enum_level.output(1, log.book_form_body)
    }else if(sub_data == "book_form_title"){
      await enum_level.output(1, log.book_form_title)
    }else if(sub_data == "book_save"){
      await enum_level.output(1, log.book_save)
    }else if(sub_data == true){
      await enum_level.output(2, `${i}` + log.success_repeat_book_create)
    }
    // 一覧画面に遷移
    await page.click('.books')
  }
}


// 本の削除のテスト
exports.destroy_book = async function(page, num){
  await page.waitFor(wait_time);
  await page.reload();
  if (await page.$(`.destroy_book_${num}`)){
    await page.click(`.destroy_book_${num}`);
    await page.waitForSelector('body');
    await page.waitFor(wait_time);
    await page.reload();

    if (await page.$(`.destroy_book_${num}`)){
      await enum_level.output(1, log.book_destroy)
    }else{
      await enum_level.output(2, `${num}` + log.success_book_destroy)
    }

    await page.waitFor(wait_time);
    await screen_shot_image(page, `destroy_book_${num}`)

  }else{
    await enum_level.output(2, log.fail_test)
    await enum_level.output(1, log.book_show_destroy_link)
    await screen_shot_image(page, `destroy_${num}_link`)

  }
}


// 本の編集・削除のバリデーションテスト
exports.book_collect_user = async function(page, url){
  await page.goto(url);
  await page.waitFor(wait_time);

    var correct_user = await page.$eval('body', el =>{
      //  if response.url() == ""
      // console.log(response.header)
      // console.log(response.header.data)
      // console.log(response.status())
      // console.log(response.url())
        if (el.textContent.match(/戻る/) || el.textContent.match(/back/) || el.textContent.match(/Back/)){
            return false
        }else{
            return true
        }
    });
    if (correct_user == false){
      await enum_level.output(1, log.book_correct_user)
    }else{
      await enum_level.output(2, log.success_correct_user)
    }
    await screen_shot_image(page, "book_collect_user")

}

// ##########################################################
// 他のユーザー画面の確認
exports.user_page = async function(page, num){
  await page.waitFor(wait_time);
  await page.click(`.user_${num}`);
    await page.waitFor(wait_time);
    var user_show = await page.$eval('body', el =>{
        if (el.textContent.match(/user1/) && el.textContent.match(/テキストボックスに入力された文字の数をカウントします。/)){
            return true
        }else{
            return false
        }
    });
    if (user_show == false){
      await enum_level.output(1, log.user_show)
    }else{
      await enum_level.output(2, log.success_user_show)
    }
    await screen_shot_image(page, `user_page_${num}`)

}


// 指定したリンクのクリック
exports.button_click = async function(page, link){
  await page.click(link);
  await page.waitFor(wait_time)
  await screen_shot_image(page, `click-${link}`)
}


// テーブルタグが使用されている
exports.table = async function(page){
  if (await page.$('table td')){
    await enum_level.output(2, log.table_tag)
  }else{
    await enum_level.output(1, log.no_table_tag)
  }
}


// エラー画面か判断する関数
// exports.error_page = async function(page){
//   var return_error_page = await page.$eval('body', el =>{
//     if (el.textContent.match(/NotFound/) || el.textContent.match(/undefind/)){
//       return true
//     }
//   })

//   if (return_error_page == true){
//     console.log(page.headers);
//     console.log(page.headers.date.status);
//     console.info('×遷移先でエラー画面になりました。もう一度要件とアプリケーションの挙動をご確認ください。')
//      // エラー画面のため、テスト終了
//      process.exit(1)
//   }
// }
