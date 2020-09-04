

Weather history

Perhaps you are having a particularly bad winter where you live. Even though you live in a cold climate, snow has been melting on certain days in January during the last few years. Cross-country skiing and ice skating have been placed on hold. You start to wonder if it could be normal, and if there have been other years in the past when there have been warm days in January. Unfortunately, the Internet is not much help. Historical data websites do not return this kind of information exactly. It looks like we will have to do it ourselves. Let's build an app that will look up historical data for certain weather stations, such as: highs, lows, precipitation, and cloud cover. We could even graph it in 3D, with x being the day of the year, y being temerature highs, for example, and z being the year. Data for each year would be stacked along the z-axis so that we can look for year-to-year trends.

Development progress

This web app for local climate history allows you to choose weather stations from a map and create charts of the temperature highs. One chart shows the temperatures for one weather station, but for each day of the year, in comparison with adjacent years. It shows, for example, what winters where mild, and which were not. If you remember a certain white Christmas from your childhood, you can get a chart comparing it with days preceding and following, as well as and with the same days from surrounding years.

It needs work still. The process isn't that obvious from a user experience perspective, and it relies on an external API, which produces only one year of daily records per server request. It also relies on data from ground stations, which tend to be spotty. You can't, for example, get a temperature profile for Helsinki earlier than 1959.

The great thing is that you can compare actual data with what you remember about the weather from decades ago. This tool will be useful not only for agriculture, but also for winter sports. Is it a good plan to have the winter Olympics near Vancouver BC? Make a chart here and you will get a better idea of how reliably you can expect snow and freezing temperatures there in the winter time.

Demos

Seville
http://weatherhistory.netlify.app/?metric=false&station=Seville&firstyear=2010&lastyear=2019

Portland
http://weatherhistory.netlify.app/?metric=false&station=Seville&firstyear=2010&lastyear=2019

Kauhajoki
http://weatherhistory.netlify.app/?metric=true&station=Kauhava&firstyear=2010&lastyear=2019
