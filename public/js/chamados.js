function chamados_init() {
    let usuarioLogado = sessionStorage.codUsuario
    let usuarioGrupo = sessionStorage.codGrupo

    $('.datepicker').datepicker({
        dateFormat: "dd/mm/yyyy"
    })

    $('#dataDe').val(moment().startOf('week').format('DD/MM/YYYY'))
    $('#dataAte').val(moment().format('DD/MM/YYYY'))

    let aUsuarios = chamados_getUsuarios()

    aUsuarios.forEach( oUsuario => {
        $('#usuarioFiltro').append(`
            <option value="${oUsuario.A00_CODIGO}">
                ${oUsuario.A00_NOME}
            </option>
        `)
    })

    if( !['000001', '000002'].includes(usuarioGrupo) ) {
        $('#usuarioFiltro').val(usuarioLogado)
        $('#usuarioFiltro').attr('disabled', true)
    }

    chamados_createGrid()
}

function chamados_createGrid() {

    let codChamado = isEmpty($('#idChamado').val())     ? 'ALL' : $('#idChamado').val()
    let dataDe     = isEmpty($('#dataDe').val())        ? 'ALL' : moment($('#dataDe').val(), 'DD/MM/YYYY').format('YYYY-MM-DD')
    let dataAte    = isEmpty($('#dataAte').val())       ? 'ALL' : moment($('#dataAte').val(), 'DD/MM/YYYY').format('YYYY-MM-DD')
    let status     = isEmpty($('#statusFiltro').val())  ? 'ALL' : $('#statusFiltro').val()
    let usuario    = isEmpty($('#usuarioFiltro').val()) ? 'ALL' : $('#usuarioFiltro').val()

    if( status == 'OPEN' ) {
        status = "P', 'E', 'R"
    }

    chamados_get( codChamado, dataDe, dataAte, status, usuario, ( aData ) => {
        let aChamados = []
        let usuarioLogado = sessionStorage.codUsuario
        let usuarioGrupo = sessionStorage.codGrupo

        aData.forEach( data => {
            let btnAcoes = `
                <div class="dropdown">
                    <button
                        class="btn btn-primary dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-mdb-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Ações
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        ${ 
                            chamados_formatAcoesChamado( data, usuarioLogado, usuarioGrupo )
                        }
                    </ul>
                </div>
                `
           
                aChamados.push({
                "Código" : data.A03_CODIGO,
                "Título" : data.A03_TITULO,
                "Status" : chamados_formatColStatus( data.A03_STATUS ),
                "Usuário": data.A00_NOME,
                "Ações"  : btnAcoes
            })
        });

        console.log( aData )
        console.log( aChamados )

        $("#gridChamados").jsGrid({
            width: "100%",
            height: "400px",
        
            inserting: false,
            sorting: true,
            paging: true,
            editing: false,
            deleting: false,
        
            data: aChamados,
        
            fields: [
                { name: "Código" , type: "text" },
                { name: "Título" , type: "text" },
                { name: "Status" , type: "text" },
                { name: "Usuário", type: "text" },
                { name: "Ações"  , type: "text" }                
            ]
        });
    })
}

function chamados_get( codChamado, dataDe, dataAte, status, usuario, callback ) {

    var url = `/index/chamados?codChamado=${codChamado}&dataDe=${dataDe}&dataAte=${dataAte}&status=${status}&usuario=${usuario}`;

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

function chamados_getUsuarios() {
    var request = new XMLHttpRequest();
    request.open('GET', '/index/usuarios?codUsuario=ALL', false);
    request.send();

    console.log(request)

    if (request.status === 200) {
        return JSON.parse(request.response)
    } else {
        console.error('Erro na requisição:', request.status, request.statusText);
    }
}

function chamados_formatAcoesChamado( oChamado, usuarioLogado, grupoUsuario ) {
    let htmlAcoes = ``

    if( usuarioLogado == oChamado['A03_CODA00'] || grupoUsuario == '000001' ) {
        
        if( oChamado["A03_STATUS"] == "P" ) {
            htmlAcoes += `
                <li>
                    <a onclick="chamado_openFicha('A', '${oChamado["A03_CODIGO"]}', '${oChamado["A03_DATAINC"]}')" class="dropdown-item" href="#">
                        <i class="fas fa-pen"></i>
                        Alterar
                    </a>
                </li>`
            htmlAcoes += `
                <li>
                    <a onclick="chamado_delete('${oChamado["A03_CODIGO"]}')" class="dropdown-item" href="#">
                        <i class="far fa-trash-can"></i>
                        Excluir
                    </a>
                </li>`
        }

        if( oChamado["A03_STATUS"] == "F" ) {
            htmlAcoes += `
                <li>
                    <a onclick="chamado_rejeitarChamado('${oChamado["A03_CODIGO"]}', 'R')" class="dropdown-item" href="#">
                        <i class="fas fa-ban"></i>
                        Rejeitar
                    </a>
                </li>`
        }
    }
    
    if( !['000003'].includes(grupoUsuario) ) {

        switch (oChamado["A03_STATUS"]) {
            case "P":
                htmlAcoes += `
                    <li>
                        <a onclick="chamado_alteraStatus('${oChamado["A03_CODIGO"]}', 'E')" class="dropdown-item" href="#">
                            <i class="far fa-circle-play"></i>
                            Iniciar Atendimento
                        </a>
                    </li>`
                break;
            case "E":
                htmlAcoes += `
                    <li>
                        <a onclick="chamado_alteraStatus('${oChamado["A03_CODIGO"]}', 'F')" class="dropdown-item" href="#">
                            <i class="fas fa-check-double"></i>
                            Finalizar
                        </a>
                    </li>`
                break;
            case "R":
                htmlAcoes += `
                    <li>
                        <a onclick="chamado_alteraStatus('${oChamado["A03_CODIGO"]}', 'F')" class="dropdown-item" href="#">
                            <i class="fas fa-check-double"></i>
                            Finalizar
                        </a>
                    </li>`
                break;
            default:
                break;
        }
    }

    return htmlAcoes
}

function chamados_formatColStatus( status ) {
    let htmlStatus = ''

    switch (status) {
        case "P": htmlStatus = `<span class="badge badge-secondary"> Pendente </span>`
            break;
        case "E": htmlStatus = `<span class="badge badge-primary"> Em Atendimento </span>`
            break;
        case "F": htmlStatus = `<span class="badge badge-success"> Finalizado </span>`
            break;
        case "R": htmlStatus = `<span class="badge badge-danger"> Rejeitado </span>`
            break;
        default: htmlStatus = `<span class="badge badge-default"> Sem Status </span>`
            break;
    }

    return htmlStatus
}

function chamado_rejeitarChamado( idChamado, status ) {
    bootbox.prompt({
        title: 'Insira o motivo da reijeição!',
        inputType: 'textarea',
        callback: function (result) {
            if( result !== null ) {
                if( isEmpty(result) ) {
                    toastr.warning('Rejeição não realizada! Insira um motivo para efetuar a rejeição!')
                    return
                }

                chamado_alteraStatus( idChamado, status, result )
            }
        }
    });
}

function chamado_alteraStatus( idChamado, status, motRej='' ) {
    let motivoRej = btoa(motRej)
    let params = `acao=U&codChamado=${idChamado}&status=${status}&motivoRej=${motivoRej}`;
    let request = new XMLHttpRequest();

    request.open('POST', '/index/chamados', false);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(params);

    if (request.status === 200) {
        let ret = JSON.parse(request.response)

        if( ret.errorcode == '00' ) {
            toastr.success( ret.message )

            chamados_createGrid()
        } else {
            toastr.warning( ret.message )
        }
        console.log('Resposta do servidor:', request);
    } else {
        console.error('Erro na requisição:', request.status, request.statusText);
    }
}

function chamado_delete( codChamado ) {
    bootbox.confirm('Deseja excluir o chamado?', result => {
        if( result ) {
            // Construindo a URL com os parâmetros
            let url = `/index/chamados?codChamado=${codChamado}`;
        
            let request = new XMLHttpRequest();
            request.open('DELETE', url, true);
        
            request.onload = function() {
                if (request.status === 200) {
                    let ret = JSON.parse(request.response)

                    if( ret.errorcode == '00' ) {
                        toastr.success( ret.message )

                        chamados_createGrid()
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

function chamado_openFicha( acao, codChamado, dataChamado ) {
    let htmlPopUp = `
        <div>
            <div class="page-header">
                <h3 id="tituloFichaChamados">Novo Chamado</h3>
            </div>
            <hr class="page-divider">
            <div class="row">
                <div class="col-md-12">      
                    <label class="control-label control-title" for="tituloChamado">Título</label>
                    <input type="text" id="tituloChamado" class="form-control" required>
                </div>
                <div class="col-md-12">
                    <label class="control-label control-title" for="descricaoChamado">Descrição</label>
                    <textarea type="text" id="descricaoChamado" class="form-control" required> </textarea>
                </div>
                <div class="col-md-12 mt-4 container_buttons-form">      
                    <a class="btn btn-danger" onclick="closePopUp()"> 
                        <i class="fas fa-xmark"></i>
                        &nbsp;Cancelar
                    </a>
                    <a class="btn btn-success" onclick="chamados_save('${acao}', '${codChamado}')"> 
                        <i class="far fa-floppy-disk"></i>
                        &nbsp;Salvar
                    </a>
                </div>
            </div>
        </div>
    `

    openPopUp( htmlPopUp, '70%' )

    if( acao == 'A' ) {
        $('#tituloFichaChamados').html(`Alteração do chamado ${codChamado}`)
        chamados_get( codChamado, dataChamado, dataChamado, 'ALL', 'ALL', 
            (aData) => {
                $('#tituloChamado').val(aData[0].A03_TITULO)
                $('#descricaoChamado').val(aData[0].A03_DESCRICAO)
            }
        )
    }
}

function chamados_save( acao, codChamado ) {
    if( validateRequired('#popUpContent') ) {
        let tituloChamado = btoa($('#tituloChamado').val())
        let descricaoChamado = btoa($('#descricaoChamado').val())
        let codUsuario = sessionStorage.codUsuario

        let params = `acao=${acao}&codChamado=${codChamado}&tituloChamado=${tituloChamado}&descricaoChamado=${descricaoChamado}&codUsuario=${codUsuario}`; // Formato: param1=value1&param2=value2
        let request = new XMLHttpRequest();

        request.open('POST', '/index/chamados', false);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send(params);

        if (request.status === 200) {
            let ret = JSON.parse(request.response)

            if( ret.errorcode == '00' ) {
                toastr.success( ret.message )
                closePopUp()

                chamados_createGrid()
            } else {
                toastr.warning( ret.message )
            }
            console.log('Resposta do servidor:', request);
        } else {
            console.error('Erro na requisição:', request.status, request.statusText);
        }
    }
}

function chamado_changeFiltroData( element ) {
    if( isEmpty(element.value) ) {

        if( element.id == 'dataDe' ) {
            element.value = moment().startOf('week').format('DD/MM/YYYY')
        }
        if( element.id == 'dataAte' ) {
            element.value = moment().format('DD/MM/YYYY')
        }
    }
}