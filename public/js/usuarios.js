function usuariosInit() {
    usuarios_getUsuarios( 'ALL', ( aData ) => {
        usuariosCreateGrid( aData )
    })
}

function usuarios_getUsuarios( codUsuario, callback ) {

    // Construindo a URL com os parâmetros
    var url = `/index/usuarios?codUsuario=${codUsuario}`;

    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
        if (request.status === 200) {
            console.log('Retorno chamada usuários')
            callback( JSON.parse(request.response) )
        } else {
            console.error('Erro na requisição:', request.status, request.statusText);
        }
    };

    request.onerror = function() {
        console.error('Erro na requisição.');
    };

    request.send();
}

function usuariosCreateGrid( aData ) {

// A00_BLOQ: "1"
// A00_CODIGO: "000001"
// A00_EMAIL: "adm@adm.com.br"
// A00_GRUPO: "000001"
// A00_LOGIN: "admin"
// A00_NOME: "Administrador"

    // fetch('/index/grupos_usuarios', {
    //     method: 'GET'
    // })
    // .then(response => response.json())
    // .then( ( dataGrupos ) => {

        let usuarios = []

        aData.forEach( data => {
            let btnEdit = `
                <div style="display: flex;justify-content: center;">
                    <a class="btn btn-primary" onclick="usuarios_openEdit('${data.A00_CODIGO}')">
                        <i class="fas fa-pen"></i>
                    </a>
                </div>
                `
            let btnExc = `
                <div style="display: flex;justify-content: center;">
                    <a class="btn btn-danger" onclick="usuarios_deleteUsuario('${data.A00_CODIGO}')">
                        <i class="fas fa-trash"></i>
                    </a>
                </div>
                `
            usuarios.push({
                "Código": data.A00_CODIGO,
                "Nome": data.A00_NOME,
                "Email": data.A00_EMAIL,
                "Grupo": data.A01_DESCRI,
                "Alterar": btnEdit,
                "Deletar": btnExc
            })
        });

        $("#gridUsuarios").jsGrid({
            width: "100%",
            height: "400px",
     
            inserting: false,
            sorting: true,
            paging: true,
            editing: false,
            deleting: false,
     
            data: usuarios,
     
            fields: [
                { name: "Código", type: "text", width: 50 },
                { name: "Nome", type: "text", width: 150 },
                { name: "Email", type: "text", width: 200 },
                { name: "Grupo", type: "text", width: 50},
                { name: "Alterar", type: "text", width: 30},
                { name: "Deletar", type: "text", width: 30},
                
            ]
        });
    // })
    // .catch(error => {
    //     // Manipule os erros da chamada aqui
    //     console.error(error);
    // });
}

function usuarios_getGrupos() {
    let params = `codUsuario=ALL`;

    var request = new XMLHttpRequest();
    request.open('GET', '/index/grupos_usuarios', false);
    request.send(params);

    console.log(request)

    if (request.status === 200) {
        return JSON.parse(request.response)
    } else {
        console.error('Erro na requisição:', request.status, request.statusText);
    }
}

function openIncluirUsuario() {
    let htmlPopUp = `
        <div>
            <div class="page-header">
                <h3>Novo usuário</h3>
            </div>
            <hr class="page-divider">
            <div class="row">
                <div class="col-md-12">      
                    <label class="control-label control-title" for="nomeUsuario">Nome</label>
                    <input type="text" id="nomeUsuario" class="form-control" required>
                </div>
                <div class="col-md-6">      
                    <label class="control-label control-title" for="emailUsuario">Email</label>
                    <input type="text" id="emailUsuario" class="form-control" required>
                </div>
                <div class="col-md-6">      
                    <label class="control-label control-title" for="grupoUsuario">Grupo</label>
                    <select id="grupoUsuario" class="form-control" required>
                    </select>
                </div>
                <div class="col-md-12 mt-4 container_buttons-form">      
                    <a class="btn btn-danger" onclick="closePopUp()"> 
                        <i class="fas fa-xmark"></i>
                        &nbsp;Cancelar
                    </a>
                    <a class="btn btn-success" onclick="usuarios_save('I')"> 
                        <i class="far fa-floppy-disk"></i>
                        &nbsp;Salvar
                    </a>
                </div>
            </div>
        </div>
    `

    openPopUp( htmlPopUp, '70%' )

    let gruposUsuarios = usuarios_getGrupos()

    gruposUsuarios.forEach( grupo => {
        $('#grupoUsuario').append(`
            <option value="${grupo.A01_CODIGO}">
                ${grupo.A01_DESCRI}
            </option>
        `)
    })
}

function usuarios_openEdit( codUsuario ) {
    usuarios_getUsuarios( codUsuario, ( aData ) => {
        let htmlPopUp = `
            <div>
                <div class="page-header">
                    <h3>Novo usuário</h3>
                </div>
                <hr class="page-divider">
                <div class="row">
                    <div class="col-md-12">      
                        <label class="control-label control-title" for="nomeUsuario">Nome</label>
                        <input type="text" id="nomeUsuario" class="form-control" required>
                    </div>
                    <div class="col-md-6">      
                        <label class="control-label control-title" for="emailUsuario">Email</label>
                        <input type="text" id="emailUsuario" class="form-control" required>
                    </div>
                    <div class="col-md-6">      
                        <label class="control-label control-title" for="grupoUsuario">Grupo</label>
                        <select id="grupoUsuario" class="form-control" required>
                        </select>
                    </div>
                    <div class="col-md-12 mt-4 container_buttons-form">      
                        <a class="btn btn-danger" onclick="closePopUp()"> 
                            <i class="fas fa-xmark"></i>
                            &nbsp;Cancelar
                        </a>
                        <a class="btn btn-success" onclick="usuarios_save('A', '${codUsuario}')"> 
                            <i class="far fa-floppy-disk"></i>
                            &nbsp;Salvar
                        </a>
                    </div>
                </div>
            </div>
        `
    
        openPopUp( htmlPopUp, '70%' )
    
        let gruposUsuarios = usuarios_getGrupos()
    
        gruposUsuarios.forEach( grupo => {
            $('#grupoUsuario').append(`
                <option value="${grupo.A01_CODIGO}">
                    ${grupo.A01_DESCRI}
                </option>
            `)
        })

        let dataUser = aData[0]

        $('#nomeUsuario').val(dataUser.A00_NOME)
        $('#emailUsuario').val(dataUser.A00_EMAIL)
        $('#grupoUsuario').val(dataUser.A00_GRUPO)
    })
}

function usuarios_save( acao, codUsuario ) {
    if( validateRequired('#popUpContent') ) {
        let nomeUsuario = $('#nomeUsuario').val()
        let emailUsuario = $('#emailUsuario').val()
        let grupoUsuario = $('#grupoUsuario').val()
        
        let params = `acao=${acao}&codUsuario=${codUsuario}&nomeUsuario=${nomeUsuario}&emailUsuario=${emailUsuario}&grupoUsuario=${grupoUsuario}`; // Formato: param1=value1&param2=value2
        let request = new XMLHttpRequest();

        request.open('POST', '/index/usuarios', false);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send(params);

        if (request.status === 200) {
            let ret = JSON.parse(request.response)

            if( ret.errorcode == '00' ) {
                toastr.success( ret.message )
                closePopUp()

                usuariosInit()
            } else {
                toastr.warning( ret.message )
            }
            console.log('Resposta do servidor:', request);
        } else {
            console.error('Erro na requisição:', request.status, request.statusText);
        }
    }
}

function usuarios_deleteUsuario( codUsuario ) {
    bootbox.confirm('Deseja excluir o usuário?', result => {
        if( result ) {
            // Construindo a URL com os parâmetros
            let url = `/index/usuarios?codUsuario=${codUsuario}`;
            let params = `codUsuario=${codUsuario}`;
        
            let request = new XMLHttpRequest();
            request.open('DELETE', url, true);
        
            request.onload = function() {
                if (request.status === 200) {
                    let ret = JSON.parse(request.response)

                    if( ret.errorcode == '00' ) {
                        toastr.success( ret.message )

                        usuariosInit()
                    } else {
                        toastr.warning( ret.message )
                    }
                } else {
                    console.error('Erro na requisição:', request.status, request.statusText);
                }
            };
        
            request.onerror = function() {
                console.error('Erro na requisição.');
            };
        
            request.send();
        }
    })
}