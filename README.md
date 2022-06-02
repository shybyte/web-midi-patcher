# Web Midi Patcher
Control one midi instrument effects with another one.

Just playing around...

## How to run

    pnpm install
    pnpm start

Open [http://localhost:3000/src/index.html](http://localhost:3000/src/index.html) in a chrome based browser for live reload.

## Linux Sound Bugfixing

https://askubuntu.com/questions/8425/how-to-temporarily-disable-pulseaudio-while-running-a-game-under-wine


    systemctl --user stop pulseaudio.socket
    systemctl --user stop pulseaudio.service

To start it again, you can use:

    systemctl --user start pulseaudio.socket
    systemctl --user start pulseaudio.service


## License

GNU Affero General Public License v3.0

## Copyright

Copyright 2020-2022 Marco Stahl
