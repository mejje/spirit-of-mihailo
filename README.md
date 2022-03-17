# Spirit of Mihailo

A Slack bot in the spirit of former colleague Mihailo, who introduced us to a little game on standup!

## Features

At 10 every weekday, it will remind users in a channel of standup. The first one to react with a 📯 emoji wins!

## Installation
Create a Slack app, upload [manifest.yaml](manifest.yaml) for scopes.
Modify `ChannelId` and `Users` in [app.js](app.js).
Set Slack tokens in [spirit-of-mihailo.service](spirit-of-mihailo.service) and copy & enable in systemd.
