const { App } = require('@slack/bolt');

const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
const USER_ID = 'U0RELM4CU';
const REACTION = 'postal_horn';

let _messageTs, _messageText;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

app.event('reaction_added', async ({ event }) => {
  console.log(event);
  if (event.reaction == REACTION && event.item.ts == _messageTs && event.user == USER_ID) {
    let duration = event.event_ts - _messageTs;

    let durationText;
    if (duration < 1)
      durationText = `${(duration * 1000).toFixed(0)} milliseconds`;
    else
      durationText = `${duration.toFixed(2)} seconds`;

    const result = await app.client.chat.update({
      channel: CHANNEL_ID,
      ts: _messageTs,
      text: `${_messageText}\n<@${event.user}> wins in ${durationText}!`
    });
    console.log(result);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);

  _messageText = `Standup <@${USER_ID}>`;

  const result = await app.client.chat.postMessage({
    channel: CHANNEL_ID,
    text: _messageText
  });
  _messageTs = result.ts;
  console.log(result);

  console.log('⚡️ Bolt app is running!');
})();
