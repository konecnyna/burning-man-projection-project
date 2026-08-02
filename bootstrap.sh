#!/bin/bash

# sudo nano /Library/LaunchDaemons/com.atlantis.burningman2024.plist

# To load the service immediately and ensure it starts at boot:
# sudo launchctl load /Library/LaunchDaemons/com.atlantis.burningman2024.plist

# You can verify that the service is running with:
# sudo launchctl list | grep com.atlantis.burningman2024

# If you ever want to stop the service, you can unload it with:
# sudo launchctl unload /Library/LaunchDaemons/com.atlantis.burningman2024.plist


sleep 10
cd /Users/atlantis/code/burning-man-2024/
#/opt/homebrew/bin/pm2 start /Users/atlantis/code/burning-man-2024/bootstrap.js --name atlantis


#/opt/homebrew/bin/node bootstrap.js
