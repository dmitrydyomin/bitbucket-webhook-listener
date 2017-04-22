Simple Bitbucket webhook server with Telegram notifications.

## Installation

1. Clone the repo.
1. Run ```npm install``` or ```yarn install```.
1. Create Telegram bot (https://core.telegram.org/bots) and get chat ID (http://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id-ruby-gem-telegram-bot).
1. If you're using an OS with systemd like Debian,
you can copy provided ```deployer.service``` file to ```/etc/systemd/system``` folder, edit it to change
script path (ExecStart), User, Group and environment variables (Environment). After that run:
```
sudo systemctl daemon-reload
sudo systemctl enable deployer
sudo service deployer start
```
5. Create ```/etc/sudoers.d/deploy``` file:
```
username ALL = NOPASSWD: /opt/deploy/*.sh
```
Where /opt/deploy/*.sh is your deploy scripts location. Script names should match repo name.

When something is pushed to your repo, web server will try to run the script and send message via Telegram bot
when deploy process starts, completes and fails, or where no script is found.
