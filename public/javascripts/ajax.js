function signUp() {

    var serializeData = $('#regform').serialize();
    $.ajax({
        type: 'POST',
        url: 'http://localhost:8000/signup',
        data: serializeData,
        success: function(data) {
            alert(data);
        },
        error: function(xhr, str){
            alert('Возникла ошибка: ' + xhr.responseCode);
        }
    });
}

function signIn() {

    var serializeData = $('#loginform').serialize();

    $.ajax({
        type: 'POST',
        url: 'http://localhost:8000/signin',
        data: serializeData,
        success: function(data) {
           alert(data);
        },
        error: function(xhr, str){
            alert('Возникла ошибка: ' + xhr.responseCode);
        }
    });
}