function install {
      echo installing $1
          shift
              apt-get -y install "$@" >/dev/null 2>&1
}

     echo updating package information
     apt-add-repository -y ppa:brightbox/ruby-ng >/dev/null 2>&1
     apt-get -y update >/dev/null 2>&1
     sudo apt-get -y install imagemagick libmagick++-dev
     sudo apt-get -y install clang

     sudo apt-get install -y curl apt-transport-https ca-certificates &&
     curl --fail -ssL -o setup-nodejs https://deb.nodesource.com/setup_8.x &&
     sudo bash setup-nodejs &&

     echo ------------------------------------------------------
     echo ファイルの移動
     ls -a
     mv id_rsa /home/vagrant/.ssh/
     echo "host *
          StrictHostKeyChecking no" >> config
     mv config /home/vagrant/.ssh/

     echo ------------------------------------------------------
     echo 入れた方が良いパッケージ
     sudo apt-get install -y nodejs
     sudo apt-get install gcc g++ make

     echo ------------------------------------------------------
     echo npmインストール
     npm init -y
     sudo npm install npm@latest

     echo ------------------------------------------------------
     echo puppeteerインストール
     sudo npm i --save-dev puppeteer

     echo ------------------------------------------------------
     echo puppeteerパッケージ
     sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils

     echo ------------------------------------------------------
     echo chromeの日本語化パッケージ
     sudo apt-get -y install language-pack-ja-base language-pack-ja
     sudo update-locale LANG=ja_JP.UTF-8 LANGUAGE="ja_JP:ja"
     source /etc/default/locale
     sudo apt-get install fonts-ipafont-gothic fonts-ipafont-mincho

     echo ------------------------------------------------------
     echo Chromeインストール
     wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
     sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
     sudo apt-get install google-chrome-stable
     install 'development tools' build-essential

     echo ------------------------------------------------------
     echo nodejs時間取得ライブラリ
     sudo npm install date-utils

     echo ------------------------------------------------------
     echo Rubyインストール
     install Ruby ruby2.5 ruby2.5-dev
     update-alternatives --set ruby /usr/bin/ruby2.3 >/dev/null 2>&1
     update-alternatives --set gem /usr/bin/gem2.3 >/dev/null 2>&1
     echo installing Bundler
     echo "gem: --no-ri --no-rdoc" > ~/.gemrc
     gem install bundler -N >/dev/null 2>&1
     install Git git
     install SQLite sqlite3 libsqlite3-dev
     install 'Nokogiri dependencies' libxml2 libxml2-dev libxslt1-dev zlib1g-dev
     install 'ExecJS runtime' nodejs

     # echo ------------------------------------------------------
     # echo Bookers1テストのClone
     # git clone ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/bookers1-test

     echo 'Installing rails'
     gem install rails -v '5.1.5'
     gem install erubis -v '2.7.0'
     gem install railties -v '5.2.0' --source 'https://rubygems.org/'
     gem install listen -v '3.1.5' --source 'https://rubygems.org/'
     gem install rake -v '12.3.0' --source 'https://rubygems.org/'
     gem install nokogiri -v '1.7.0.1' --source 'https://rubygems.org/'
     gem install rest-client -v '2.0.2' --source 'https://rubygems.org/'
     gem install puma
     gem install sass
     gem install tilt
     gem install spring
     gem install byebug
     gem install chromedriver-helper
     gem install sqlite3
     update-locale LANG=en_US.UTF-8 LANGUAGE=en_US.UTF-8 LC_ALL=en_US.UTF-8
     echo 'You are now on Rails!'
     echo '        o o o o o o o . . .    ______________________________ _____=======_||____'
     echo '    o      _____            |                            | |                 |'
     echo '  .][__n_n_|DD[  ====_____  |                            | |                 |'
     echo ' >(________|__|_[_________]_|____________________________|_|_________________|'
     echo ' _/oo OOOOO oo`  ooo   ooo  `o!o!o                  o!o!o` `o!o         o!o`  '
     echo ' -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-'