// for storing the map instance
var map;
// for storing the info window instance
var myInfoWindow;
// for storing the markers
var markerList = [];

var mainResult = [];
// for setting the default lattitude and longitude
var latitude = 30.7333;
var longitude = 76.7794;
// getting the current location
function currentLocation() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (p) {
            latitude = p.coords.latitude;
            longitude = p.coords.longitude;
            initMap();
        });
    } else {
      // in case of any error

    var prevLat = latitude;
    var prevLong = longitude;
    }

}

// for new location
function newLocation() {
    GetLocation();
}

//Load latitude and longitude
function GetLocation() {
    var geocoder = new google.maps.Geocoder();
        var address = ViewModel.userAddress();
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                latitude = results[0].geometry.location.lat();
                longitude = results[0].geometry.location.lng();
                console.log(latitude);

                initMap();
            } else {
              // in case of error
                ViewModel.errorPresent(true);
                ViewModel.error('Cant fetch result from Geocode');
            }
    });
};

// initialising the map
function initMap(){
    // setting the styles
    var styles = [
          {
              "featureType": "all",
              "elementType": "labels.text.fill",
              "stylers": [
                  {
                      "color": "#ffffff"
                  }
              ]
          },
          {
              "featureType": "all",
              "elementType": "labels.text.stroke",
              "stylers": [
                  {
                      "color": "#000000"
                  },
                  {
                      "lightness": 13
                  }
              ]
          },
          {
              "featureType": "administrative",
              "elementType": "geometry.fill",
              "stylers": [
                  {
                      "color": "#000000"
                  }
              ]
          },
          {
              "featureType": "administrative",
              "elementType": "geometry.stroke",
              "stylers": [
                  {
                      "color": "#144b53"
                  },
                  {
                      "lightness": 14
                  },
                  {
                      "weight": 1.4
                  }
              ]
          },
          {
              "featureType": "landscape",
              "elementType": "all",
              "stylers": [
                  {
                      "color": "#08304b"
                  }
              ]
          },
          {
              "featureType": "poi",
              "elementType": "geometry",
              "stylers": [
                  {
                      "color": "#0c4152"
                  },
                  {
                      "lightness": 5
                  }
              ]
          },
          {
              "featureType": "road.highway",
              "elementType": "geometry.fill",
              "stylers": [
                  {
                      "color": "#000000"
                  }
              ]
          },
          {
              "featureType": "road.highway",
              "elementType": "geometry.stroke",
              "stylers": [
                  {
                      "color": "#0b434f"
                  },
                  {
                      "lightness": 25
                  }
              ]
          },
          {
              "featureType": "road.arterial",
              "elementType": "geometry.fill",
              "stylers": [
                  {
                      "color": "#000000"
                  }
              ]
          },
          {
              "featureType": "road.arterial",
              "elementType": "geometry.stroke",
              "stylers": [
                  {
                      "color": "#0b3d51"
                  },
                  {
                      "lightness": 16
                  }
              ]
          },
          {
              "featureType": "road.local",
              "elementType": "geometry",
              "stylers": [
                  {
                      "color": "#000000"
                  }
              ]
          },
          {
            "featureType": "administrative.locality" ,
            "elementType": "labels.text",
            "stylers": [
              { "visibility": "off" }
            ]
          },
          {
              "featureType": "transit",
              "elementType": "all",
              "stylers": [
                  {
                      "color": "#146474"
                  }
              ]
          },
          {
              "featureType": "water",
              "elementType": "all",
              "stylers": [
                  {
                      "color": "#021019"
                  }
              ]
          }
      ]

    // creating a new map instance
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
          // setting the lattitude longitude
            lat: latitude,
            lng: longitude
        },
        // applying styles
        styles: styles,
        // setting the zoom level
        //zoom: 14

    });
    // creating a new info window instance
    myInfoWindow = new google.maps.InfoWindow();
    var placeTypeSearch = ViewModel.placeType();
    placeTypeSearch = encodeURIComponent(placeTypeSearch.trim());
    // fetch the zomato data
    fourSquare(placeTypeSearch, ViewModel.radius());

}



// show marker
function showMarkers() {
    for (var i = 0; i < markerList.length; i++) {
        markerList[i].setVisible(true);
    }

}

// populating the info window
function populateInfoWindow(marker, myInfoWindow)
{
     //setting the marker
    if( myInfoWindow.marker !== marker && myInfoWindow.marker !== undefined )
    {
        myInfoWindow.marker.setAnimation( null );
    }

    myInfoWindow.marker = marker;

    myInfoWindow.marker.setAnimation( google.maps.Animation.BOUNCE );

    toggleBounce(marker);

    get_flickr(marker);

    myInfoWindow.open( map , marker );

    myInfoWindow.addListener('closeclick' , function() {
        myInfoWindow.marker.setAnimation( null );
    });
}

// fetching the flicker data
function get_flickr(marker) {
    var lati = marker.position.lat();
    var longi = marker.position.lng();
    var flickrUrl = ' https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e98f2c0ac159245584671338a9857397&lat='+lati+'&lon='+longi+'&radius=0.5&safe_search=1&content_type=1&format=json&nojsoncallback=1';
    var images = '';
    $.ajax({
        url: flickrUrl,
        data: 'lat=' + marker.position.lat() + '&lon=' + marker.position.lng(),
    }).done(function(response) {
        //console.log(response);
        var myPhotos = response.photos.photo;
        images = marker.finalTitle;
        images += '<h4>Nearby Images</h4>';
        for (var i = 0; i < 5; i++) {
            images += '<img src = "' + 'https://farm' + myPhotos[i].farm + '.staticflickr.com/' + myPhotos[i].server + '/' + myPhotos[i].id + '_' + myPhotos[i].secret + '.jpg" height="100px" width="100px">';
        }

        myInfoWindow.setContent(images);
    }).fail(function(response, status, error) {
        images += "Canit load images some error there";
        myInfoWindow.setContent(images);
    });

}


// shows weather
function showWeather() {
    $.ajax({
        url: 'http://api.wunderground.com/api/f2f52c5ecd1ac257/conditions/q/+' + latitude + ',' + longitude + '.json',
        dataType: 'json',
        async: true
    }).done(function(data) {
        if (data) {
            articles = data.current_observation;
            //console.log(articles);
            content = 'Weather for: ' + articles.display_location.full + '\n';
            content += 'Weather: ' + articles.weather + '\n';
            content += 'Temperature: ' + articles.temperature_string + '\n';
            content += articles.observation_time;
            //console.log(content);
            alert(content);
        } else {
            alert('Response not available!');
        }
    }).fail(function(response, status, data) {
        ViewModel.errorPresent(true);
        ViewModel.error('Cant fetch result from api');
    });

}


// functions to show or hide all the markers
function hideMarkers() {

    for (var i = 0; i < markerList.length; i++) {
        markerList[i].setVisible(false);
    }
}

// fetching the foursquare api
function fourSquare(query, radius) {
    markerList = [];
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data: 'client_id=FVRNLKZDCN45OVJVBTBGB3KKG3WONRYVQRN2XRFWJAU1X3Z5&client_secret=OUX5LTUMSATZKBUA5LWW3APUSKJT0AZPDHRT3VB3R1WLYPZ1&v=20130815%20&ll=+' + latitude + ',' + longitude + '&radius=' + radius + '&limit=15&query=' + query,
        async:true
    }).done(function(response){
        var result = '';
        var resList = response.response.venues;
        //console.log(resList);
        var newBounds = new google.maps.LatLngBounds();
        for (var i = 0; i < resList.length; i++) {
            result = '<h1>'+resList[i].name+'</h1>';
        mainResult[i] = result;
        var latLng = new google.maps.LatLng(parseFloat(resList[i].location.lat),parseFloat(resList[i].location.lng));
        if(latLng.lat()==0)continue;

        var marker = new google.maps.Marker({
            position: latLng,
            title: resList[i].name,
            animation: google.maps.Animation.DROP,
            finalTitle: mainResult[i],
            map:map

        });
        newBounds.extend(marker.position);

        marker.addListener('click', function(){
            populateInfoWindow(this, myInfoWindow);
        });
        markerList.push(marker);
    }

    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(newBounds); // `bounds` is a `LatLngBounds` object
    });
    map.fitBounds(newBounds);
    ViewModel.init();

    }).fail(function(response,status, error){
        ViewModel.errorPresent(true);
        ViewModel.error('Cant fetch result from api');
    });
}

// error handling
function callErrorMethod() {

    ViewModel.error('Cant load the Map');
    ViewModel.errorPresent(true);
}

// highlights the marker
function highlightMarker( markerTitle ) {

    for( var i = 0; i < markerList.length; i++ )
    {
        if( markerList[ i ].title == markerTitle )
        {
            populateInfoWindow( markerList[i] , myInfoWindow );
            return;
        }
    }
}

function placeTypeFunc(text){
    initMap();
}

// adds animation to marker
function toggleBounce(marker) {

    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 700);

}

// View model for knockout js
var ViewModel = {

    finalList : ko.observableArray(),
    testToSearch : ko.observable(''),
    radius : ko.observable('5000'),
    placeType : ko.observable('Hotel'),
    errorPresent : ko.observable( false ),
    userAddress : ko.observable('Chandigarh'),
    error : ko.observable(''),

    init : function() {
        ViewModel.finalList.removeAll();
        for( var i = 0; i < markerList.length; i++ )
        {
            //console.log( markerList[i] );
            ViewModel.finalList.push( markerList[i].title );
        }
    },

    findInList : function( text ){
        ViewModel.finalList.removeAll();
        for( var i = 0; i < markerList.length; i++ )
        {
            if( markerList[ i ].title.toLowerCase().indexOf( text.toLowerCase() ) > -1 )
            {
                ViewModel.finalList.push( markerList[ i ].title );
                markerList[ i ].setVisible( true );
            }
            else
            {
                markerList[ i ].setVisible( false );
            }
        }
    }

}
ko.applyBindings(ViewModel);
ViewModel.testToSearch.subscribe( ViewModel.findInList );
