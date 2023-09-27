function portalAvisos_init() {
    let grupoUsuario = sessionStorage.codGrupo

    if( ['000003'].includes(grupoUsuario) ) {
        $('#btnAdcAviso').css({ "display": "none" })
    }

    portalAvisos_createGrid()
}

function portalAvisos_publicar( acao="I", codAviso="ALL" ) {
    if( validateRequired('#formPubliAviso') ) {
        let titulo = btoa($('#tituloAviso').val())
        let descricao = btoa($('#descricaoAviso').val())
        let tipo = $('#tipoAviso').val()
        let codUsuario = sessionStorage.codUsuario

        let params = `acao=${acao}&codAviso=${codAviso}&titulo=${titulo}&descricao=${descricao}&tipo=${tipo}&codUsuario=${codUsuario}`; // Formato: param1=value1&param2=value2
        let request = new XMLHttpRequest();

        request.open('POST', '/index/portal_avisos', false);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send(params);

        if (request.status === 200) {
            let ret = JSON.parse(request.response)

            if( ret.errorcode == '00' ) {
                toastr.success( ret.message )
                closePopUp()

                $('#tituloAviso').val('')
                $('#descricaoAviso').val('')
                
                portalAvisos_createGrid()
            } else {
                toastr.warning( ret.message )
            }
            console.log('Resposta do servidor:', request);
        } else {
            console.error('Erro na requisição:', request.status, request.statusText);
        }
    }
}

function portalAvisos_get( codAviso, dataDe, dataAte, tipo, callback ) {
    var url = `/index/portal_avisos?codAviso=${codAviso}&dataDe=${dataDe}&dataAte=${dataAte}&tipo=${tipo}`;

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

function portalAvisos_createGrid() {
    portalAvisos_get('ALL', '2023-09-01', '2023-09-11', 'ALL', ( aData ) => {
        let grupoUsuario = sessionStorage.codGrupo

        console.log(aData)

        let htmlFeed = ''

        aData.forEach( data => {
            let titulo = atob(data.A04_TITULO)
            let descricao = atob(data.A04_DESCRICAO)
            htmlFeed += `
                <div class="card" style="width: 65%;background-color: ${ data.A04_TIPO == 'U' ? '#ffcaca;' : '#efefef;' }">
                    <small style="position: absolute;top: .4rem;right: .5rem;">${moment(data.A04_DATA, 'YYYY-MM-DDTHH:mm:sss').format('DD/MM/YYYY')} ${moment(data.A04_HORA, 'YYYY-MM-DDTHH:mm:sss').format('HH:mm')}</small>
                    <div class="card-body">
                        <h5 class="card-title">
                            ${ data.A04_TIPO == 'U' ? '<i class="fas fa-triangle-exclamation"></i>' : '' }
                            ${titulo}
                        </h5>
                        
                        <p class="card-text">
                            ${descricao}
                        </p>
                    </div>
                    <div class="dropdown">
                        <a
                            data-mdb-toggle="dropdown"
                            aria-expanded="false"
                            style="position: absolute;bottom: .5rem;right: .6rem;cursor: pointer;${ ['000003'].includes(grupoUsuario) ? 'display:none;' : '' }"
                        >
                            <i class="fas fa-ellipsis-vertical"></i>
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li><a class="dropdown-item" style="cursor: pointer;" onclick="portalAvisos_openFicha('A', '${data.A04_CODIGO}')">Alterar</a></li>
                            <li><a class="dropdown-item" style="cursor: pointer;" onclick="portalAvisos_excluir('${data.A04_CODIGO}')">Excluir</a></li>
                        </ul>
                    </div>
                </div>
            `
        })

        //class="btn btn-primary dropdown-toggle"

        $('#feedAvisos').html( htmlFeed )
    })
}

function portalAvisos_openFicha( acao, codAviso ) {
    let htmlPopUp = `
        <div class="col-md-12">
            <label class="control-label control-title" for="tituloAviso">Título</label>
            <input type="text" id="tituloAviso" class="form-control">
        </div>
        <div class="col-md-12">      
            <label class="control-label control-title" for="descricaoAviso">Descrição</label>
            <textarea type="text" class="form-control" id="descricaoAviso"></textarea>
        </div>
        <div class="col-md-2">
            <label class="control-label control-title" for="tipoAviso">Tipo</label>
            <select type="text" id="tipoAviso" class="form-control">
                <option value="N" selected> Normal </option>
                <option value="U"> Urgente </option>
            </select>
        </div>
        <div>      
            <label class="control-label control-title" for="btnPublicar" style="display: block;">&nbsp;</label>
            <a type="text" class="btn btn-primary" id="btnPublicar" onclick="portalAvisos_publicar('${acao}', '${codAviso}')">
                <i class="fas fa-paper-plane"></i>
                &nbsp;Publicar
            </a>
        </div>
    `

    openPopUp( htmlPopUp, '70%' )

    if( acao == 'A' ) {
        portalAvisos_get(codAviso, '2023-09-01', '2023-09-11', 'ALL', ( aData ) => {
            $('#tituloAviso').val(atob(aData[0].A04_TITULO))
            $('#descricaoAviso').val(atob(aData[0].A04_DESCRICAO))
            $('#tipoAviso').val(aData[0].A04_TIPO)
        })
    }
}

function portalAvisos_excluir( codAviso ) {
    bootbox.confirm(`Deseja excluir o aviso?`, result => {
        if( result ) {
            var url = `/index/portal_avisos?codAviso=${codAviso}`;

            var request = new XMLHttpRequest();
            request.open('DELETE', url, true);

            request.onload = function() {
                if (request.status === 200) {
                    toastr.success(request.response.message)

                    portalAvisos_createGrid()
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