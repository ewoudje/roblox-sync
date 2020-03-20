# Roblox-Sync

WARNING! is in early development make a backup of your roblox place or you might lose all your scripts. \
AND I AM NOT RESPONSIBLE IF YOU LOSE IMPORTANT STUFF

## How do i install this thing?
This uses the atom editor, so you need that. \
Then simply run the command `apm install https://github.com/ewoudje/roblox-sync` \
If you've done that you need to open `plugin.lua` in this repository and put it in your roblox plugin folder! \

And youre done!

## How to use?
If everything is installed you can now see in atom on the packages tab a roblox entry and that drops out on \

* Setup Sync (You use this at the start when you have an project open)
* RESync (This you use to sync from roblox to your files)

But before you use al this you need to open a folder as a project in atom and put the file `roblox.json` in it \
Then you paste this in that config file;
```
{
  "script-folder": "src"
}
```
And if you've done that you can make an new folder called `src` \
Then you click on the `Setup Sync` button \
You open roblox studio, where you go to plugins and click on `Start Sync`
