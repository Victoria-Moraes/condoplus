const core = require('../../../utils/core.js');
const connectionDB = require(`../services/connectionDB.js`)
const moment = require('moment');

function chamados_get(codChamado, dataDe, dataAte, status, usuario, callback) {
    connectionDB.runQuery({ 
        sqlStatement: `
            SELECT A03.*
                , A00_NOME
                , @A03_CODIGO as TEste
             FROM A03 A03
   
             LEFT JOIN A00 A00
                    ON A00_CODIGO = A03_CODA00
   
            WHERE ( ('ALL' = @A03_CODIGO) OR (A03_CODIGO = @A03_CODIGO) )
              AND ( ('' = @A03_DATAINC_DE) OR (A03_DATAINC >= @A03_DATAINC_DE) )
              AND ( ('' = @A03_DATAINC_ATE) OR (A03_DATAINC <= @A03_DATAINC_ATE) )
              AND ( ('ALL' IN (@A03_STATUS)) OR (A03_STATUS IN (@A03_STATUS)) )
              AND ( ('ALL' = @A03_CODA00) OR (A03_CODA00 = @A03_CODA00) )
        `,
        queryParams: [
            {name: 'A03_CODIGO'     , value: codChamado},
            {name: 'A03_DATAINC_DE' , value: dataDe    },
            {name: 'A03_DATAINC_ATE', value: dataAte   },
            {name: 'A03_STATUS'     , value: status    },
            {name: 'A03_CODA00'     , value: usuario   }
        ],
        callbackSuccess: ( aRows, queryParams, b, c, d ) => {

            callback( aRows )
        }
    })
}

function chamados_save(oDados, callback) {
    const {
        acao, 
        codChamado, 
        codUsuario, 
        tituloChamado,
        descricaoChamado,
    } = oDados

    let sql = '' 
                
    if( acao == 'A' ) {
        sql = `
            UPDATE A03
                SET A03_TITULO = @A03_TITULO
                  , A03_DESCRICAO = @A03_DESCRICAO
                WHERE A03_CODIGO = @A03_CODIGO 
        `
    } else {
        sql = `
            INSERT INTO A03 (
                A03_CODIGO,
                A03_CODA00,
                A03_TITULO,
                A03_DATAINC,
                A03_HORAINC,
                A03_DESCRICAO,
                A03_STATUS
            )
            VALUES (
                (SELECT REPLACE(STR(MAX(A03_CODIGO) + 1, 10), SPACE(1), '0') FROM A03),
                @A03_CODA00,
                @A03_TITULO,
                @A03_DATAINC,
                @A03_HORAINC,
                @A03_DESCRICAO,
                @A03_STATUS
            );
        `
    }
    
    connectionDB.runQuery({ 
        sqlStatement: sql, 
        queryParams: [
            { name: "A03_CODIGO"    , value: codChamado },
            { name: "A03_CODA00"    , value: codUsuario },
            { name: "A03_TITULO"    , value: atob(tituloChamado) },
            { name: "A03_DATAINC"   , value: moment().format('YYYY-MM-DD') },
            { name: "A03_HORAINC"   , value: moment().format('HH:mm') },
            { name: "A03_DESCRICAO" , value: atob(descricaoChamado) },
            { name: "A03_STATUS"    , value: 'P' }
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            if( acao == 'A' ) {
                callback({
                    errorcode: '00',
                    message: 'Chamado alterado com sucesso!'
                })
            } else {
                callback({
                    errorcode: '00',
                    message: 'Chamado cadastrado com sucesso!'
                })
            }
        }
    })
}

function chamados_updateStatus(oDados, callback) {
    let {codChamado, status, motivoRej} = oDados

    let sql = `
        UPDATE A03 
        SET A03_STATUS = @A03_STATUS 
        WHERE A03_CODIGO = @A03_CODIGO
    `

    if( status == 'E' ) {
        sql = `
            UPDATE A03 
            SET A03_STATUS = @A03_STATUS
              , A03_DATAINI = @A03_DATAINI 
              , A03_HORAINI = @A03_HORAINI 
            WHERE A03_CODIGO = @A03_CODIGO
        `
    } else if( status == 'F' ) {
        sql = `
            UPDATE A03 
            SET A03_STATUS = @A03_STATUS
              , A03_DATAFIM = @A03_DATAFIM 
              , A03_HORAFIM = @A03_HORAFIM 
            WHERE A03_CODIGO = @A03_CODIGO
        `
    } else if( status == 'R' ) {
        sql = `
            UPDATE A03 
            SET A03_STATUS = @A03_STATUS
              , A03_MOTREJ = @A03_MOTREJ 
            WHERE A03_CODIGO = @A03_CODIGO
        `
    }

    let dataIni = moment().format('YYYY-MM-DD')
    let horaIni = moment().format('HH:mm:ss')
    let dataFim = moment().format('YYYY-MM-DD')
    let horaFim = moment().format('HH:mm:ss')

    motivoRej = atob(motivoRej)

    connectionDB.runQuery({ 
        sqlStatement: sql,
        queryParams: [
            { name: 'A03_CODIGO'    , value: codChamado },
            { name: 'A03_STATUS'    , value: status     },
            { name: "A03_DATAINI"   , value: dataIni    },
            { name: "A03_HORAINI"   , value: horaIni    },
            { name: "A03_DATAFIM"   , value: dataFim    },
            { name: "A03_HORAFIM"   , value: horaFim    },
            { name: "A03_MOTREJ"    , value: motivoRej  }
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            callback({
                errorcode: '00',
                message: 'Chamado alterado com sucesso!'
            })
        }
    })
}

function chamados_delete(codChamado, callback) {
    connectionDB.runQuery({ 
        sqlStatement: `
           SELECT A03_CODIGO
                , A03_STATUS
             FROM A03
            WHERE ( ('ALL' = @A03_CODIGO) OR (A03_CODIGO = @A03_CODIGO) )
           `,
        queryParams: [
            { name: "A03_CODIGO" , value: codChamado }
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            console.log(aRows)
            if( aRows[0]["A03_STATUS"] != 'P' ) {
                callback({
                    errorcode: '01',
                    message: 'O chamado já está em andamento, não é possóvel excluir!'
                })
            } else {
                connectionDB.runQuery({ 
                    sqlStatement: `
                        DELETE FROM A03 WHERE A03_CODIGO = @A03_CODIGO
                    `,
                    queryParams: [
                        { name: "A03_CODIGO", value: codChamado }
                    ],
                    callbackSuccess: ( aRows, queryParams ) => {
                        callback({
                            errorcode: '00',
                            message: 'Chamado excluído com sucesso!'
                        })
                    }
                })
            }
        }
    })
}

module.exports = {
    chamados_get,
    chamados_save,
    chamados_updateStatus,
    chamados_delete
}