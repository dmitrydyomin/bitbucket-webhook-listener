const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const R = require('ramda');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const ipRangeCheck = require("ip-range-check");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const botChatID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(botToken);
const sendMessage = message => bot.sendMessage(botChatID, message);

const scriptsDir = process.env.SCRIPTS_DIR;
const scriptsExt = process.env.SCRIPTS_EXT;

const ipRange = process.env.IP_RANGE;

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/', function (req, res) {
  if (ipRange && !ipRangeCheck(req.connection.remoteAddress, ipRange)) {
    res.status(403).send('Forbidden');
    return;
  }

  const repo = R.path(['repository', 'name'], req.body);
  const changes = R.path(['push', 'changes'], req.body);

  if (changes && changes.length > 0) {
    const commits = changes[changes.length - 1].commits;
    if (commits && commits.length > 0) {
      const last = commits[commits.length - 1];
      if (last && last.message) {
        sendMessage(`Deploying ${repo} ${last.hash.substr(0, 7)}: ${last.message}`);
        const scriptFileName = path.join(scriptsDir, repo + scriptsExt);
        if (fs.existsSync(scriptFileName)) {
          exec(`sudo ${scriptFileName}`, (error, stdout) => {
            if (error) {
              sendMessage(`Deploy failed: ${error}`);
            } else {
              const messages = stdout.split('\n').filter(s => s.trim() !== '');
              if (messages.length === 0) {
                messages.push('[no output]');
              }
              sendMessage(`Completed: ${messages.pop()}`);
            }
          });
        } else {
          sendMessage(`Script ${scriptFileName} not found`);
        }
      }
    }
  }
  res.send('OK');
});

app.listen(port, function () {
  console.log(`Listening on port ${port}!`);
});
