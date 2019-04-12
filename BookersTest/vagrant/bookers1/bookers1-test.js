// ヘッドレスブラウザ読み込み(読込先のパスが/home/vagrant/node_modules以下のpuppeteerのため)
// const puppeteer = require('puppeteer');
const puppeteer = require('../../home/vagrant/node_modules/puppeteer');


(async () => {
  const browser = await puppeteer.launch({
    headless: true, //trueにするとchromeが裏で立ち上がる
    // devtools: true, //デバッグ用
    timeout: 3000, //タイムアウトの時間変更
    // slowMo: 20, //少し遅めに設定
    args: [
        //プロトコルエラー解消のため、不正に操作させない
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // プロキシ使う場合はここ
        //'--proxy-server=192.168.100.252:8080',
        // Chromeウィンドウのサイズ
        '--window-size=1600,950',
        // Chromeウィンドウのポジション
        '--window-position=100,50',
    ]
  });

  // pageはページ全体を示すメソッド
  const page = await browser.newPage();

  // 画面の大きさ設定
  // Chromeのウィンドウ自体の大きさの調整ではないです
  await page.setViewport({width: 1600, height: 950});

    // 例外処理の場合け
    try {
        // #########################################################
        // ダイアログの処理を全てOKにする
        page.on('dialog', dialog => {
          console.log('◯削除リンクのダイアログの設定があります');
          dialog.accept();
        });

         // #########################################################
        // 実行したlogをルートディレクトリのdebug.logファイルに吐き出す
        var fs = require('fs');
        var util = require('util');
        var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
        var log_stdout = process.stdout;

        console.log = function(d) {
          log_file.write(util.format(d) + '\n');
          log_stdout.write(util.format(d) + '\n');
        };

        // #########################################################
        // 引数が渡されれば引数のパスに飛ぶ
        // プライベートIPアドレスに飛ぶ
        var path = process.argv[2];
        var rootPath = function(path){
          if(path == null){
            return "http://192.168.33.10:3000"
          }else{
            return "http://192.168.33.10:3000/" + path ;
          }
        }

        // #########################################################
        // rootパス定義
        var url = rootPath(path);
        console.log(url);
        if (url == "http://192.168.33.10:3000"){
          console.log("============================")
          // console.log("◯ルートパスが設定してあります");
        }else{
          console.log("============================")
          console.log("△ルートパスの設定をしましょう")
        }

        // #########################################################
        // ルートページ
        await page.goto(url);
        await page.waitFor(2000);
        if (await page.$('a')){
            await page.waitForSelector('a');
            await page.screenshot({path: 'image/top.png'});


            // トップページがあるか確認
            var start_button = await page.$eval('a', element =>{
                 // Railsのトップページの場合
                if (element.textContent.match('\n')){
                    return true
                // トップページにリンクが作成されている場合
                }else{
                    return false
                }
            })

            if (start_button == true){
                console.log('×トップページが作成されていません');
            }else if (start_button == false){
                console.log('◯トップページが作成されています');
                await page.click('a');
            }

            await page.screenshot({path: 'image/bookers1.png'});

        }else{
            console.log('×トップページに"start"リンクがありません')
            // process.exit(1)
        }


        // 遷移したページに投稿フォームがあるかどうか
        console.log("===========================")
            //　投稿用のフォームがある場合
            await page.waitFor(4000);
            if (await page.$('.book_title') && await page.$('.book_body') && await page.$('input[type="submit"]')) {
                console.log("◯新規投稿フォームが一覧ページに作成されています")
                await page.waitForSelector('form');

                // #########################################################
                // 投稿のテスト
                console.log("============================")
                console.log('新規投稿のテスト');
                await page.type('.book_title', "50文字投稿");
                await page.type('.book_body', "口頭で伝える際には、多少正確さが欠けていたとしても、相手が足らず分を推測してくれることはよくあります。これが、文章になると、とたんに整合性がないものになってしまいます。普段、文章をあまり書かない人にとって、文字で伝えるのは非常にハードルの高いことです。文章は、書くことを通じてしか、上達の方法はありませんので、従業員のみなさんがトレーニングできる環境を整備することが大切なのです。");
                await page.click('input[type="submit"]');
                await page.waitForSelector('body');
                await page.screenshot({path: 'image/book1.png'})

                // 投稿の内容が反映されているか
                var data = await page.$eval('html', el => {
                    if (el.textContent.match(/50文字投稿/) && el.textContent.match(/口頭で伝える際には、多少正確さが欠けていたとしても/) && el.textContent.match(/successfully/)){
                        return "◎新規投稿が正しく表示され、サクセスメッセージが表示されています"
                    }else if (el.textContent.match(/50文字投稿/) && el.textContent.match(/口頭で伝える際には、多少正確さが欠けていたとしても/)){
                        return "△新規投稿は正しく表示されますが、サクセスメッセージが表示されません"
                    }else if (el.textContent.match(/50文字投稿/)){
                        return "×感想フォームに入力した内容が保存されていません"
                    }else if (el.textContent.match(/口頭で伝える際には、多少正確さが欠けていたとしても/)){
                        return "×投稿タイトルが保存されていません"
                    }else{
                        return "×ビュー・コントローラの記述を確認して下さい"
                    }
                });
                console.log(data);

                    // 投稿が成功した時
                    if (data == "◎新規投稿が正しく表示され、サクセスメッセージが表示されています" || data == "△新規投稿は正しく表示されますが、サクセスメッセージが表示されません"){
                        // 詳細ページに戻るリンクがあるか(遷移しているか確認)
                        if (await page.$('a.back')){
                                await page.click('a.back')
                                console.log('◯新規投稿から詳細ページに遷移しています');
                                await page.waitForSelector('form');
                                    // 一覧画面がテーブルタグを使用しているか確認
                                    if (await page.$('table td')){
                                        await page.waitForSelector('td a');
                                        console.log("◯一覧ページにテーブルタグが使用されています")
                                    }else{
                                        console.log("×一覧ページの表は、テーブルタグを使用して作成しましょう")
                                        await page.waitForSelector('a');
                                    }
                                    // #########################################################
                                    // 連続投稿
                                    console.log("============================")
                                    console.log('連続投稿のテスト');

                                    // 5回繰り返す
                                    for (var i = 2; i < 7; i++) {
                                        await page.waitForSelector('body');
                                        await page.waitFor(2000);
                                        console.log(i + "回目");
                                        await page.type('.book_title', `こんにちは${i}`);
                                        await page.type('.book_body', `${i}回目の投稿`);
                                        await page.click('input[type="submit"]');
                                        // 内容が反映されるまで待機
                                        await page.waitForSelector('body');
                                        await page.waitFor(1000);
                                        await page.screenshot({path: `image/book${i}.png`})
                                        // 投稿の内容が反映されているか
                                        var sub_data = await page.$eval('html', sub_el => {
                                            if (sub_el.textContent.match(/こんにちは/) && sub_el.textContent.match(/回目の投稿/)){
                                                return "◯連続投稿が成功し、正しく表示されています"
                                            }else if (sub_el.textContent.match(/こんにちは/)){
                                                return "×感想フォームに入力した内容が保存されていません"
                                            }else if (sub_el.textContent.match(/回目の投稿/)){
                                                return "×タイトル用のテキストボックスがありません。formやclass名を確認して下さい。"
                                            }else{
                                                return "×投稿内容が保存できません。"
                                            }
                                        });

                                        console.log(sub_data);
                                        await page.click('a.back');
                                        await page.waitForSelector('a');
                                    }

                                // #########################################################
                                // 空欄投稿
                                // console.log("============================")
                                // console.log('空欄投稿のテスト');
                                // await page.waitForSelector('form');
                                // await page.type('.book_title', "");
                                // await page.type('.book_body', "");
                                // await page.click('input[type="submit"]');

                                // // 空欄投稿できたか分岐する
                                // await page.waitFor(3000);
                                // if (await page.$('.back')) {
                                //   console.log('△空欄で投稿できてしまいます');
                                //   await page.waitForSelector('a');
                                //   await page.click('a.back');
                                //  }else{
                                //   console.log('◎空欄投稿できないように、バリデーションがかかっています');
                                //   await page.goBack();
                                //  }

                                await page.waitForSelector('body');
                                await page.screenshot({path: 'image/new-empty.png'})
                        // 詳細ページに遷移していないまたは、戻るリンクがない場合
                        }else{
                            // console.log('△新規投稿後に詳細ページに遷移していません')

                            // 詳細ページに遷移していない場合
                            if (await page.$('.show_1')){
                                console.log('△新規投稿後に詳細ページに遷移していません')
                                await page.click('.show_1');
                                await page.waitForSelector('body');

                                if (await page.$('a.back')){
                                    await page.click('a.back');
                                }else{
                                    console.log("△詳細ページの戻るリンクのclass名やリンクを確認して下さい")
                                    await page.goBack();
                                }
                            }else{
                                // 一度ページを読み直す
                                await page.reload();


                                if (await page.$('a')){
                                    console.log("○新規投稿後詳細ページに遷移してます")
                                    console.log("×詳細ページのリンクのclass名が間違えています")
                                    await page.goBack();
                                    await page.reload();
                                    // await page.click('a');
                                    await page.screenshot({path: 'image/show-after.png'})
                                }else{
                                // await page.goto(url, { waitForSelector: 'a' });
                                // await page.click('a');
                                    console.log("×新規投稿後のリダイレクトが正しく設定されていません")
                                    if (await page.$('.show_1')){
                                        await page.click('.show_1');
                                        await page.waitForSelector('body');

                                        if (await page.$('a.back')){
                                            await page.click('a.back');
                                        }else{
                                            console.log("△詳細ページの戻るリンクのclass名やリンクを確認して下さい")
                                            await page.goBack();
                                        }
                                    }else{
                                        // console.log("×一覧ページにある詳細ページに遷移するリンクのclass名が間違えています")
                                        console.log("×1件目の投稿の詳細ページに遷移できません")
                                    }
                                }
                            }
                            // 一覧ページに戻っている状況
                            // #########################################################
                                // 連続投稿
                                // console.log("============================")
                                // console.log('連続投稿のテスト');
                                // console.log('※連続投稿のテストは実行しないため、2件目の削除からエラーになります');
                            //     for (var i = 2; i < 7; i++) {
                            //         await page.type('.book_title', `こんにちは${i}`);
                            //         await page.type('.book_body', `${i}回目の投稿`);
                            //         await page.click('input[type="submit"]');
                            //         // 内容が反映されるまで待機
                            //         await page.waitForSelector('body');
                            //         await page.screenshot({path: `image/book${i}.png`})
                            //         await page.waitForSelector('form');
                            //     }
                            //     console.log('◯連続投稿ができます');

                            //     // #########################################################
                                // 空欄投稿
                                // console.log("============================")
                                // console.log('空欄投稿のテスト');
                                // console.log('※空欄投稿のテストは実行しません、まずは新規投稿の処理を見なおして下さい');
                                // await page.waitForSelector('form');
                                // await page.type('.book_title', "");
                                // await page.type('.book_body', "");
                                // await page.click('input[type="submit"]');

                                // // 空欄投稿できたか分岐する
                                // if (await page.$('.back')) {
                                //   console.log('△空欄で投稿できてしまいます');
                                //   await page.waitForSelector('a');
                                //   await page.click('a.back');
                                //  }else{
                                //     await page.reload();
                                //     console.log('×保存はできていない');
                                //     await page.goBack();
                                //  }

                                // await page.waitForSelector('body');
                                // await page.screenshot({path: 'image/new-empty.png'})

                        }

                    // 投稿が成功しなかった時
                    }else{
                        // 分岐前にログを表示しているため、プロセスのみexitする
                        process.exit(1)
                    }
                await page.screenshot({path: 'image/books.png'})
                await page.waitForSelector('html');
                await page.waitFor(2000);


                // #########################################################
                // 編集ページ
                console.log("============================")
                console.log('編集のテスト');
                // 編集リンクが存在するか
                await page.waitFor(2000);
                if (await page.$('.edit_1')){
                     await page.click('.edit_1');

                     await page.waitFor(2000);

                    // 編集用のフォームが存在するか
                    if (await page.$('.book_title') && await page.$('.book_body') && await page.$('input[type="submit"]')) {
                        await page.waitForSelector('form');
                        await page.waitFor(2000);
                        await page.type('.book_title', "福沢諭吉");
                        await page.type('.book_body', "「天は人の上に人を造らず人の下に人を造らず」と言えり。されば天より人を生ずるには、万人は万人みな同じ位にして、生まれながら貴賤きせん上下の差別なく、万物の霊たる身と心との働きをもって天地の間にあるよろずの物を資とり、もって衣食住の用を達し、自由自在、互いに人の妨げをなさずしておのおの安楽にこの世を渡らしめ給うの趣意なり。");
                        await page.screenshot({path: 'image/edit1.png'})
                        await page.click('input[type="submit"]');
                        await page.waitForSelector('body');
                        await page.screenshot({path: 'image/update1.png'})

                        // 編集の内容が反映されているか
                        await page.waitFor(2000);
                        var data = await page.$eval('body', el => {
                            if (el.textContent.match(/福沢諭吉/) && el.textContent.match(/天は人の上に人を造らず人の下に人を造らず」と言えり。/) && el.textContent.match(/successfully/)){
                                return "◎編集内容が正しく表示され、サクセスメッセージが表示されています"
                            }else if (el.textContent.match(/福沢諭吉/) && el.textContent.match(/天は人の上に人を造らず人の下に人を造らず」と言えり。/)){
                                return "◯編集内容が正しく表示されています"
                            }else if (el.textContent.match(/福沢諭吉/)){
                                return "×編集画面で入力した感想文が保存されていません"
                            }else if (el.textContent.match(/天は人の上に人を造らず人の下に人を造らず」と言えり。/)){
                                return "編集画面で入力したタイトルが保存されていません"
                            }else{
                                return "×編集後のリダイレクト先が設定されていません。コントローラの記述等を確認して下さい"
                            }
                        });
                        console.log(data);
                            if (data == "◎編集内容が正しく表示され、サクセスメッセージが表示されています" ||  data == "◯編集内容が正しく表示されています"){
                                // 編集後に戻るボタンがあるか
                                if (await page.$('a.back')){
                                    await page.click('a.back');
                                }else{
                                    console.log("×編集後の詳細画面に戻るリンクがありません。またはclass名が間違えています")
                                    // 一覧ページに遷移する
                                    await page.goto(url, { waitForSelector: 'a' });
                                    await page.click('a');
                                    await page.reload();
                                }
                            }else if(data == "×編集後のリダイレクト先が設定されていません。コントローラの記述等を確認して下さい"){
                                if (await page.$('.show_1')){
                                    await page.click('.show_1');
                                        // 詳細画面に編集の内容が反映されているか
                                        var edit = await page.$eval('body', edit_el => {
                                            if (edit_el.textContent.match(/福沢諭吉/) && edit_el.textContent.match(/天は人の上に人を造らず人の下に人を造らず」と言えり。/)){
                                                return "◯編集内容が正しく表示されています"
                                            }else if (edit_el.textContent.match(/福沢諭吉/)){
                                                return "×編集画面で入力した感想文が保存されていません"
                                            }else if (edit_el.textContent.match(/天は人の上に人を造らず人の下に人を造らず」と言えり。/)){
                                                return "編集画面で入力したタイトルが保存されていません"
                                            }else{
                                                return "×編集内容が保存できていません。"
                                            }
                                        });
                                        console.log(edit);
                                }else{
                                    console.log("×編集画面の詳細リンクのclass名が間違えています");
                                    console.log("×編集ができているか確認できません");
                                }
                            }else{
                                console.log("編集処理を見直しましょう！");
                            }
                    // 編集フォームにタイトル用のフォームがない場合
                    }else if (await page.$('.book_body') && await page.$('input[type="submit"]')){
                        console.log("×編集フォームにタイトル用のテキストボックスがありません")
                        console.log("formやclass名を確認して下さい")
                        await page.goBack();
                    // 本の感想用のフォームがない場合
                    }else if (await page.$('.book_title') && await page.$('input[type="submit"]')){
                        console.log("×編集フォームに本の感想文用のテキストエリアがありません")
                        console.log("formやclass名を確認して下さい")
                        await page.goBack();
                    // #########################################################
                    // 送信ボタンがない場合
                    }else if (await page.$('.book_title') && await page.$('.book_body')){
                        console.log("×編集フォームの送信ボタンがありません")
                        console.log("submitやclass名を確認して下さい")
                        await page.goBack();
                    // #########################################################
                    // その他
                    }else{
                        console.log("×編集フォームが見つかりません、class名やformを確認して下さい")
                        await page.goBack();
                    }

                    await page.waitForSelector('a');

                    // #########################################################
                    // 連続削除
                    console.log("============================")
                    console.log('削除のテスト');
                    // 削除リンクがあるかどうか
                    await page.waitFor(2000);
                    if (await page.$('.destroy_1')){
                        // 1件目を削除しよう・・・
                        await page.click('.destroy_1');
                        await page.waitForSelector('body');

                        if (await page.$('.destroy_1')){
                            console.log("×1件目の削除ができません");
                            console.log("クラス名や、コントローラの処理を見直しましょう");
                        }else{
                            console.log("◯1件目の削除ができます")
                            for (var i = 2; i < 6; i++) {
                                console.log(i + "件目");
                                await page.waitFor(1000)

                                // 2件目以降の削除を検証する
                                if (await page.$(`.destroy_${i}`)){
                                    if (await page.$(`.destroy_${i-1}`)){
                                        console.log("×削除できません。コントローラの記述を確認して下さい");
                                        process.exit(1);
                                    }else{
                                        await page.click(`.destroy_${i}`);
                                        console.log(`◯${i}件目の削除ができます`);
                                        await page.waitForSelector('a');
                                    }
                                }else{
                                    console.log("×" + i +"件目の削除リンクが見つかりません。")
                                    await page.screenshot({path: 'image/destroy1.png'})
                                    process.exit(1)
                                }
                            }
                        // #########################################################
                        // 削除後のページをスクショ
                        await page.screenshot({path: 'image/destroy1.png'})
                        }

                    // 削除リンクがない場合
                    }else{
                        console.log('×削除のclass名が間違えています');
                    }
                // 編集のリンクが編集ページの間違えている場合
                }else{
                    console.log('×編集のclass名が間違えています');

                    // #########################################################
                    // 連続削除
                    await page.waitFor(2000);
                    console.log("============================")
                    console.log('削除のテスト');
                    // 削除リンクがあるかどうか
                    if (await page.$('.destroy_1')){
                        // 1件目を削除しよう・・・
                        console.log("1件目の削除リンクをクリックします");
                        await page.click('.destroy_1');
                        // await page.waitForSelector('tbody td a');
                            for (var i = 2; i < 6; i++){
                                console.log(i + "件目");
                                if (await page.$(`.destroy_${i}`)){
                                    if (await page.$(`.destroy_${i-1}`)){
                                        console.log("×削除できません。コントローラの記述を確認して下さい");
                                        process.exit(1);
                                    }else{
                                        await page.click(`.destroy_${i}`);
                                        console.log(`◯${i}件目の削除ができます`);
                                        await page.waitForSelector('a');
                                    }
                                }
                            }
                        // #########################################################
                        // 削除後のページをスクショ
                        await page.screenshot({path: 'image/destroy1.png'})
                    // 削除リンクがない場合
                    }else{
                        console.log('×削除のclass名が間違えています');
                    }
                }

            // タイトル用のフォームがない場合
            }else if (await page.$('.book_body') && await page.$('input[type="submit"]')){
                console.log("×タイトル用のテキストボックスがありません。formやclass名を確認して下さい")
                process.exit(1);
            // 本の感想用のフォームがない場合
            }else if (await page.$('.book_title') && await page.$('input[type="submit"]')){
                console.log("×本の感想文用のテキストエリアがありません。formやclass名を確認して下さ")
                process.exit(1);
            // #########################################################
            // 送信ボタンがない場合
            }else if (await page.$('.book_title') && await page.$('.book_body')){
                console.log("×フォームの送信ボタンがありません。submitやclass名を確認して下さい")
                process.exit(1);
            // #########################################################
            // class名がついていない
            }else if (await page.$('input[type="submit"]')){
                console.log("×投稿フォームのclass名が間違えています。")
                process.exit(1);
            // #########################################################
            // その他
            }else{
                console.log("×一覧ページが表示できません。class名やform、一覧表示ができるか等を確認して下さい")
                process.exit(1);
            }

        // #########################################################
        // 閉じる
        await page.close();
        await browser.close();
    } catch (error) {
          console.log("×テストの途中でエラーになりました。該当するテストの処理やclass名の誤り・スペルミス等がないかもう一度確認してください。");
          console.log(error);
          process.exit(1) //サーバーの停止
        }
})();

