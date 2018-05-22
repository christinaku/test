$(document).ready(function() {

	var map;
	var CLIENT_ID = "WYBMTXKPUW5PJOEJJWJYKWXQ3SPIX253KXUVU43R4WEG0RRF";
	var CLIENT_SECRET = "HAKG5VV5T0AFLUZPP1X2TCZWVIQZ5NSCOJXERGMAUPDMA0OF";
	var userLocLatitude;
	var userLocLongitude;
	var findGoal;

	var Utils = {
		getListInfoHtml: function(venue, iconNum) {
			var venueHtml = '<li data-id=' + venue.venueId;
			var liColor;
			switch(iconNum) {
				case 1:
					liColor = 'tourquoise';
					break;
				case 2:
					liColor = 'pink';
					break;
				case 3:
					liColor = 'blue';
					break;
				case 4:
					liColor = 'yellow';
					break;
				case 5:
					liColor = 'orange';
					break;
			}
			venueHtml += ' class = "' + liColor + '"><h3>' + venue.venueName + '</h3> <b>Rating:</b> ';
			if (venue.venueRating === -1) {
				venue.venueRating = "None";
			}
			venueHtml += venue.venueRating + ' <b>Address:</b> ' + venue.venueAddress;
			if (venue.venuePhone !== undefined) {
				venueHtml = venueHtml + ' <b>Phone:</b> ' + venue.venuePhone;
			}
			if (venue.venueURL !== undefined) {
				venueHtml += ' <b>Site:</b> <a href="' + venue.venueURL + '">' + venue.venueURL + '</a>';
			}
			if (venue.venueTip !== undefined) {
				venueHtml += '<p><i>"' + venue.venueTip + '"</i></p>';
			}
			venueHtml += '</li>';

			return venueHtml;
		},

	};

	var App = {

		init: function() {
			App.initMap();
			App.bindEvents();
		},

		initMap: function() {
			map = new GMaps({
			el: '#map',
			lat: 40.754932,
			lng: -73.984016,
			zoom: 12
			});
		},

		bindEvents: function() {
			//set listeners for all the buttons
			$(".get-location-button").on("click", App.getLocation);
			$(".get-data-button").on("click", App.getLocationViaInput);
			$("#findCafeButton").on("click", App.findCafe);
			$("#findArtButton").on("click", App.findArt);
			$("#findMoviesButton").on("click", App.findMovies);
			$("#findGamesButton").on("click", App.findGames);
			$("#findMusicButton").on("click", App.findMusic);
			$("#findSitesButton").on("click", App.findSites);
			//set button mouse events
			$('.buttons').on('mouseenter', App.hoverOnButton);
			$('.buttons').on('mouseleave', App.hoverOffButton);
			$('.buttons').on('mousedown', App.mouseDownButton);
			$('.buttons').on('mouseup', App.mouseUpButton);
		},

		//get location using geolocation
		getLocation: function() {

			navigator.geolocation.getCurrentPosition(function(position) {
				//store returned info in variables
				userLocLatitude = position.coords.latitude;
				userLocLongitude = position.coords.longitude;
				console.log('naviagtor, ' + userLocLatitude + ',' + userLocLongitude);
				App.centerUserOnMap();
			});

		},

		//get location with user input
		getLocationViaInput: function() {
			// var temp = $('#address-input').val();
			// debugger;
			if ($('#address-input').val() !== '') {
				GMaps.geocode({
					address: $('#address-input').val().trim(),
					callback: function(results, status){
						if(status === 'OK'){
							var latlng = results[0].geometry.location;
							userLocLatitude = latlng.lat();
							userLocLongitude = latlng.lng();
							App.centerUserOnMap();
						}
						else {
							$('#listInfo').empty();
							$('#listInfo').append('<li class="error">Cannot find your address!</li>');
						}
					}
				});
			}
			else {
				$('#listInfo').empty();
				$('#listInfo').append('<li class="error">No address entered!</li>');
			}

		},

		//reset map and list, center user on map
		centerUserOnMap: function() {
			map.setCenter(userLocLatitude, userLocLongitude);
			map.setZoom(15);
			map.removeMarkers();
			map.addMarker({
			  lat: userLocLatitude,
			  lng: userLocLongitude,
			  title: 'current'
			});
			$('#listInfo').empty();
		},

		//set search paramaters for which button is clicked
		findCafe: function() {
			var param = {
				section: 'coffee'
			};
			findGoal = 1;
			App.getLocations(param);
		},
		findArt: function() {
			var param = {
				query: 'museums, zoo, aquarium, art gallery',
				categoryId: '4bf58dd8d48988d181941735,4bf58dd8d48988d17b941735,4fceea171983d5d06c3e9823,4bf58dd8d48988d1e2931735'
			};
			findGoal = 2;
			App.getLocations(param);
		},
		findMovies: function() {
			var param = {
				query: 'movies',
				categoryId: '4bf58dd8d48988d180941735'
			};
			findGoal = 3;
			App.getLocations(param);
		},
		findGames: function() {
			var param = {
				query: 'billiards, bowling alley, arcade games, mini golf, comedy club',
				categoryId:'4bf58dd8d48988d1e3931735,4bf58dd8d48988d1e4931735,4bf58dd8d48988d1e1931735,52e81612bcbc57f1066b79eb,4bf58dd8d48988d18e941735'
			};
			findGoal = 4;
			App.getLocations(param);
		},
		findMusic: function() {
			var param = {
				query: 'music, karaoke',
				categoryId: '4bf58dd8d48988d1e5931735,5744ccdfe4b0c0459246b4bb'
			};
			findGoal = 5;
			App.getLocations(param);
		},
		findSites: function() {
			var param = {
				query: 'outdoor, statue, monument, street art, historic',
				categoryId: '507c8c4091d498d9fc8c67a9,5642206c498e4bfca532186c,4deefb944765f83613cdba6e'
			};
			findGoal = 6;
			App.getLocations(param);
		},

		getLocations: function(locationParam) {
			if (userLocLatitude === undefined || userLocLongitude === undefined)
			{
				$('#listInfo').empty();
				$('#listInfo').append('<li class="error">Please enter location first!</li>');
			}
			else {
				//set up default paramaters
				var userLL = userLocLatitude + ',' + userLocLongitude;
				var defaultParam = {
					ll: userLL,
					radius: 750,
					limit: 25,
					client_id: CLIENT_ID,
					client_secret: CLIENT_SECRET,
					v: 20160101
				};

				//combine location search parameters with the default parameters
				var params = _.extend(locationParam, defaultParam);

				//ajax request to foursquare
				var response = $.ajax({
					url:'https://api.foursquare.com/v2/venues/explore',
					dataType: 'json',
					data: params
				});

				response.done(App.renderMapLocations);
				response.fail(function() {
					//console.log("error");
					App.centerUserOnMap();
					$('#listInfo').append('<li class="error">Unable to get data!</li>');
				});
			}
		},

		renderMapLocations: function(data) {
			//pull out data for venues from response
			var venues = data['response']['groups'][0]['items'];
			//var to create unique venue id for each venue
			var venueCounter = 0;
			//array to store the up to 25 results sorted by rating
			var sortedVenues = [];
			//array to store the top venues to be displayed
			var topVenues = [];

			//console.log(venues);

			if(venues.length === 0) {
				//console.log("no locations found!");
				App.centerUserOnMap();
				$('#listInfo').append('<li class="error">No locations found!</li>');
			}
			else {
				venues.forEach(function(elem) {
					//pull out data to put into a venue objects for each venue
					//if venue rating does not exist, set to -1, will sort into the bottom
					var elemRating = (elem.venue.rating === undefined) ? -1 : elem.venue.rating;
					var elemAddress = elem['venue']['location']['formattedAddress'][0] + ' ' + elem['venue']['location']['formattedAddress'][1];
					var elemTip = (elem.tips !== undefined) ? elem['tips'][0]['text'] : undefined;

					var venueData = {
						venueId: venueCounter,
						venueLat: elem.venue.location.lat,
						venueLong: elem.venue.location.lng,
						venueName: elem.venue.name,
						venueAddress: elemAddress,
						venuePhone: elem.venue.contact.formattedPhone,
						venueRating: elemRating,
						venueURL: elem.venue.url,
						venueTip: elemTip
					};
					venueCounter++;
					sortedVenues.push(venueData);
				});

				//sort venues by rating and reverse so it goes from highest to lowest rating
				sortedVenues = _.sortBy(sortedVenues, 'venueRating');
				sortedVenues = sortedVenues.reverse();

				//console.log('sortedVenues', sortedVenues);

				//if 5 or less venues in list, just show the list, even if no ratings
				if(sortedVenues.length<5) {
					topVenues = sortedVenues;
				}
				//else if the top 5th venue has only okay rating, just show the top 5 rated
				else if (sortedVenues[4].venueRating < 6) {
					topVenues = sortedVenues.slice(0,5);
				}
				//take out the venues with ratings lower than 6
				else {
					topVenues = _.filter(sortedVenues, function(elem){
						return elem.venueRating >= 6;
					});
					//select 5 random venues from the sorted list with higher ratings
					topVenues = _.sample(topVenues, 5);
				}

				//console.log('sortedVenues', sortedVenues);
				//console.log('topVenues', topVenues);

				//reset map, in case previous results are visible
				App.centerUserOnMap();

				//set up variables to determine icon image and color to be displayed in list
				var iconNum = 1;
				var iconType;
				var iconColor;
				switch(findGoal) {
					case 1:
						iconType = 'cup';
						break;
					case 2:
						iconType = 'art';
						break;
					case 3:
						iconType = 'movie';
						break;
					case 4:
						iconType = 'star';
						break;
					case 5:
						iconType = 'music';
						break;
					case 6:
						iconType = 'historic';
						break;
				}

				//for each venue to be displayed--
				topVenues.forEach(function(elem) {
					//add marker for venue
					map.addMarker({
						lat: elem.venueLat,
						lng: elem.venueLong,
						venueId: elem.venueId,
						iconId: iconNum,
						icon: 'icons/' + iconType + '_' + iconNum + '.png',
						//when venue marker is clicked, find li in list of venues and move to top of list
						click: function(e) {
							//id of clicked venue is stored in the marker
							var clickedId = this.venueId;
							//for each item in list, compare venueId
							$('#listInfo li').each(function() {
								var currListId = parseInt($(this).attr('data-id'));
								//if matching
								if (currListId === clickedId) {
									//remove highlight from first item in list
									$('#listInfo li').first().removeClass('highlight');
									//remove and move clicked venue to top of list
									//add highlight class to list item
									$(this).remove();
									$(this).addClass('highlight');
									$('#listInfo').prepend($(this));
								}
							});
						}
					});
					//after adding marker, create html for venue to append to listInfo
					var venueHTML = Utils.getListInfoHtml(elem, iconNum);
					$('#listInfo').append(venueHTML);
					iconNum++;
				});
			}
		},

		//button hover and click events - change color
		hoverOnButton: function() {
			$(this).css('background-color', 'lightgrey');
		},
		hoverOffButton: function() {
			$(this).css('background-color', 'darkgrey');
		},
		mouseDownButton: function() {
			$(this).css('background-color', 'honeydew');
		},
		mouseUpButton: function() {
			$(this).css('background-color', 'lightgrey');
		}

	};

	App.init();

});
