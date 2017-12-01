Task details

## User Stories

-	I can see whether the Free Code Camp is currently streaming on Twitch.tv

-	I can click the status output and be sent directly to the Free Code Camp's Twitch.tv channel

-	If a Twitch user is currently streaming, I can see additional details about what they are streaming



Minimum features:

-- Include a list of streamers
-- You can sort them based on some criteria (such as wheter they are online or offline)
-- If they are online, show some additional details




//--- ALGORITHMIC STEPS --//

1. Store a list of users in an array
2. Have the ability to get a list of top streaming users (say top 10)
3. Translate a list of user's names to user's ids
4. Get streaming info fort those users ids
5. Display the streaming details for those users ids
	a. If the current streamer is live, display additional details and have a visual indicator of such a thing
	b. Otherwise, just show that he is offline and also a visual indicator of their inactivity
	c. In either case you should have a link to their twitch channel
6. Have the ability to filter out the users based on their streaming status ("live" vs "offline")
