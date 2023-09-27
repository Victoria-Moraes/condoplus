function gruposUsuarios_init() {
    gruposUsuarios_getGrupos( 'ALL', ( aData ) => {
        gruposUsuarios_createGrid( aData )
    })
}

function gruposUsuarios_getGrupos( codGrupo, callback ) {

    var url = `/index/grupos_usuarios?codGrupo=${codGrupo}`;

    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
        if (request.status === 200) {
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

function gruposUsuarios_createGrid( aData ) {
    let grupos = []

    aData.forEach( data => {
        let btnEdit = `
            <div style="display: flex;justify-content: center;">
                <a class="btn btn-primary" onclick="gruposUsuarios_openFicha('A', '${data.A01_CODIGO}')">
                    <i class="fas fa-pen"></i>
                </a>
            </div>
            `
        let btnExc = `
            <div style="display: flex;justify-content: center;">
                <a class="btn btn-danger" onclick="gruposUsuarios_deleteGrupo('${data.A01_CODIGO}')">
                    <i class="fas fa-trash"></i>
                </a>
            </div>
            `
            grupos.push({
            "Código": data.A01_CODIGO,
            "Descrição": data.A01_DESCRI,
            "Alterar": btnEdit,
            "Deletar": btnExc
        })
    });

    $("#gridGruposUsuarios").jsGrid({
        width: "100%",
        height: "400px",
    
        inserting: false,
        sorting: true,
        paging: true,
        editing: false,
        deleting: false,
    
        data: grupos,
    
        fields: [
            { name: "Código", type: "text", width: 50 },
            { name: "Descrição", type: "text" },
            { name: "Alterar", type: "text", width: 30},
            { name: "Deletar", type: "text", width: 30},
            
        ]
    });
}

function gruposUsuarios_openFicha( acao, codGrupo ) {
    let htmlPopUp = `
        <div>
            <div class="page-header">
                <h3>Novo usuário</h3>
            </div>
            <hr class="page-divider">
            <div class="row">
                <div class="col-md-12">      
                    <label class="control-label control-title" for="descricaoGrupo">Descrição</label>
                    <input type="text" id="descricaoGrupo" class="form-control" required>
                </div>
                <div class="col-md-12 mt-4 container_buttons-form">      
                    <a class="btn btn-danger" onclick="closePopUp()"> 
                        <i class="fas fa-xmark"></i>
                        &nbsp;Cancelar
                    </a>
                    <a class="btn btn-success" onclick="gruposUsuarios_save('${acao}', '${codGrupo}')"> 
                        <i class="far fa-floppy-disk"></i>
                        &nbsp;Salvar
                    </a>
                </div>
            </div>
        </div>
    `

    openPopUp( htmlPopUp, '70%' )

    if( acao == "A" ) {
        gruposUsuarios_getGrupos( codGrupo, ( aData ) => {
            let dataGroup = aData[0]
    
            $('#descricaoGrupo').val(dataGroup.A01_DESCRI)
        })
    } 
}

function gruposUsuarios_save( acao, codGrupo ) {
    if( validateRequired('#popUpContent') ) {
        let descricaoGrupo = $('#descricaoGrupo').val()

        let params = `acao=${acao}&codGrupo=${codGrupo}&descricaoGrupo=${descricaoGrupo}`; // Formato: param1=value1&param2=value2
        let request = new XMLHttpRequest();

        request.open('POST', '/index/grupos_usuarios', false);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send(params);

        if (request.status === 200) {
            let ret = JSON.parse(request.response)

            if( ret.errorcode == '00' ) {
                toastr.success( ret.message )
                closePopUp()

                gruposUsuarios_init()
            } else {
                toastr.warning( ret.message )
            }
            console.log('Resposta do servidor:', request);
        } else {
            console.error('Erro na requisição:', request.status, request.statusText);
        }
    }
}

function gruposUsuarios_deleteGrupo( codGrupo ) {
    bootbox.confirm('Deseja excluir o grupo?', result => {
        if( result ) {
            // Construindo a URL com os parâmetros
            let url = `/index/grupos_usuarios?codGrupo=${codGrupo}`;
            let params = `codGrupo=${codGrupo}`;
        
            let request = new XMLHttpRequest();
            request.open('DELETE', url, true);
        
            request.onload = function() {
                if (request.status === 200) {
                    let ret = JSON.parse(request.response)

                    if( ret.errorcode == '00' ) {
                        toastr.success( ret.message )

                        gruposUsuarios_init()
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