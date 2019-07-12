

Historical Weather

Perhaps you are having a particularly bad winter where you live. Even though you live in a cold climate, snow has been melting on certain days in January during the last few years. Cross-country skiing and ice skating have been placed on hold. You start to wonder if it could be normal, and if there have been other years in the past when there have been warm days in January. Unfortunately, the Internet is not much help. Historical data websites do not return this kind of information exactly. It looks like we will have to do it ourselves. Let's build an app that will look up historical data for certain weather stations, such as: highs, lows, precipitation, and cloud cover. We could even graph it in 3D, with x being the day of the year, y being temerature highs, for example, and z being the year. Data for each year would be stacked along the z-axis so that we can look for year-to-year trends.

Code progress

The code so far has managed to get data from single ajax calls, for example the temperature high for a day. The trouble right now is that in order to get the temperature highs for each day over a year, the app has to send multiple AJAX calls to the server. This would be all right, but for some reason only the first AJAX call is getting a response, and the rest are getting property undefined errors. Attempting to send multiple AJAX calls with multiple versions of constructor object.