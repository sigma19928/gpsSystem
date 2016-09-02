/**
 * Created by fraem on 9/2/16.
 */
/******************************     MAP  ****************************/
var myMap,
    myPlacemark;

window.onload = function () {
    ymaps.ready(init);

    var socket = io.connect('http://localhost:8000');
    var userID = document.getElementById("userid").value;
    socket.emit('userCon', {userid: userID})
    //alert(userID)
    socket.on('take', function (options) {
        console.log('location:' + options);
        updateMap(options);

    });
}


function init() {
    myMap = new ymaps.Map("map", {
        center: [43.25, 76.95],
        zoom: 10
    });

    //myMap.behaviors.disable('scrollZoom');

    //myMap.controls.add("zoomControl", {
    //	position: {top: 15, left: 15}
    // 	});
}

function updateMap(options) {
    myMap.geoObjects.remove(myPlacemark);

    myPlacemark = new ymaps.Placemark(options, {
            hintContent: 'Собственный значок метки',
            balloonContent: 'Это красивая метка'
        },
        {
            iconLayout: 'default#image',
            iconImageHref: '/images/boy.gif',

            iconImageSize: [30, 42],

            iconImageOffset: [-3, -42]
        });

    myMap.geoObjects.add(myPlacemark);
}
/******************************     Nav Bar  ****************************/
$(document).ready(function () {
    var bar_hide = false;
    if (window.screen.width < 520) {
        $('#bar').hide();
        $('#map_div').css({
            'top': '33px',
            'left': '-15px'
        });
    }
    else {
        $('#hidden_toggle').hide();
    }
    $("#sidebar-toggle").click(function () {
        if (!bar_hide) {
            $('#map_div').css('left', '50%');
            $('#bar').show();
            bar_hide = true;
        }
        else{
            $('#bar').hide();
            $('#map_div').css('left', '-15px');
            bar_hide = false;
        }

    });
    $('#device_div').hide();
    $("#device").click(function () {
        $('#device_div').show();
        $('#map').hide();
    });
    $("#main").click(function () {
        $('#device_div').hide();
        $('#map').show();
    });
});

/******************************     Device Settings  ****************************/
angular.module('app', [])
    .controller('appController', function ($scope) {
        $scope.devices = [
            {id: '1234654', name: 'asdasd'},
            {id: '8888888', name: 'dftyert'}
        ];
        $scope.Add=function(){
            if($scope.id && $scope.name)
                $scope.devices.push({id:$scope.id,name:$scope.name});
            else
                alert('Заполните все поля')
        }
    });