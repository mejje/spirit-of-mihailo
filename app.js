#!/usr/bin/env node

const { App } = require('@slack/bolt');
const schedule = require('node-schedule');

const ChannelId = process.env.CHANNEL_ID;
const Users = new Map([
  ['U0RG22XRV', ':dragana:'],
  ['U0RELM4CU', ':jocke:'],
  ['U0REZJ3GB', ':lars:'],
  ['UR29QEMCJ', ':tangui:'],
  ['U02JWHNFCP5', ':zarko:'],
  ['U032BELHP38', ':filip:']
]);
const Reaction = 'postal_horn';
const MaxDuration = 60;

const _messageBlock = {
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: `Reminder: Standup ${Array.from(Users.keys()).map(u => '<@' + u + '>').join('')}`
  }
};

let _messageTs, _messageTime;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

app.event('reaction_added', async ({ event }) => {
  let eventTime = new Date().getTime();
  if (event.reaction == Reaction && event.item.ts == _messageTs && Users.has(event.user)) {
    _messageTs = undefined;
    console.log(event);
    console.log(`Event latency: ${eventTime - Number(event.event_ts) * 1000} ms.`);
    let serverDuration = Number(event.event_ts) - Number(event.item.ts);
    let clientDuration = (eventTime - _messageTime) / 1000;
    console.log(`Server duration: ${serverDuration * 1000} ms, client duration: ${clientDuration * 1000} ms.`);
    let duration = clientDuration; //TODO: adjust for latency?

    if (duration < MaxDuration) {
      let durationText = duration < 1 ?
        `${(duration * 1000).toFixed(0)} milliseconds` :
        `${duration.toFixed(2)} seconds`;

      let contextBlock = {
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `${Users.get(event.user)} wins in ${durationText}!`
        }]
      };

      const result = await app.client.chat.update({
        channel: ChannelId,
        ts: event.item.ts,
        text: contextBlock.elements[0].text,
        blocks: [
          _messageBlock,
          contextBlock
        ]
      });
      console.log(result);
    }
  }
});

async function PostMessage() {
  const result = await app.client.chat.postMessage({
    channel: ChannelId,
    text: _messageBlock.text.text,
    blocks: [
      _messageBlock
    ]
  });
  _messageTs = result.ts;
  _messageTime = new Date().getTime();
  console.log(result);
  console.log(`Message latency: ${_messageTime - Number(_messageTs) * 1000} ms.`);
}

(async () => {
  await app.start(process.env.PORT || 3000);

  if (process.env.NODE_ENV == 'production') {
    schedule.scheduleJob('0 10 * * 1-5', PostMessage);
  } else {
    await PostMessage();
  }

  console.log('Spirit of Mihailo is running!');
})();
