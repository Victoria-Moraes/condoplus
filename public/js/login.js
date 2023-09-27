function validLoginForm() {
    let validated = true

    if( $('#txtLogin').val().trim() == '') {
        $('#txtLogin').removeClass('is-valid')
        $('#txtLogin').addClass('is-invalid')
        validated = false
    } else {
        $('#txtLogin').removeClass('is-invalid')
        $('#txtLogin').addClass('is-valid')
    }

    if( $('#txtPassword').val().trim() == '') {
        $('#txtPassword').removeClass('is-valid')
        $('#txtPassword').addClass('is-invalid')
        validated = false
    } else {
        $('#txtPassword').removeClass('is-invalid')
        $('#txtPassword').addClass('is-valid')
    }

    return validated
}

function initLogin() {
    $('#btnLogin').on('click', () => {
        if (validLoginForm()) {
            realizarLogin()
        } else {
            console.error('Login inválido!')
        }
    })
    
    $('#showPassword').on('click', () => {
        if( $('#txtPassword').attr('type') == 'password' ) {
            $('#txtPassword').attr('type', 'text')
        } else {
            $('#txtPassword').attr('type', 'password')
        }
    
        toggleClassesIconEye( $('#showPassword')[0] )
    })
    
    const toggleClassesIconEye = ( el ) => {
        $(el).toggleClass('fa-eye-slash')
        $(el).toggleClass('fa-eye')
    }
}

function realizarLogin() {
    let login = $('#txtLogin').val()
    let password = $('#txtPassword').val()

    const url = '/login';
    const data = {
        login,
        password
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then( (responseData, objResp) => {
        if( responseData.cod === 200 ) {
            console.log(responseData)
            sessionStorage.setItem('codSessao', responseData.codSessao)
            sessionStorage.setItem('codUsuario', responseData.codUsuario)
            sessionStorage.setItem('codGrupo', responseData.codGrupo)

            window.location.href = window.location.href + 'index'
        } else {
            console.log('Erro')
        }
    })
    .catch(error => {
        // Manipule os erros da chamada aqui
        console.error(error);
    });
}



$(document).ready( function () {
    initLogin()
});