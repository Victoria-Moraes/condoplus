const core = require('../../../utils/core.js');
const connectionDB = require(`../services/connectionDB.js`)
const moment = require('moment');

function gruposUsuarios_getGrupos( codGrupo, callback ) {
    connectionDB.runQuery({ 
        sqlStatement: `
            SELECT A01_CODIGO
                 , A01_DESCRI
              FROM A01

             WHERE ( ('ALL' = @COD_GRUPO) OR (A01_CODIGO = @COD_GRUPO) )
        `,
        queryParams: [
            {name: 'COD_GRUPO', value: codGrupo}
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            callback( aRows )
        }
    })
}

function gruposUsuarios_save( oDados, callback ) {
    const {acao, codGrupo, descricaoGrupo} = oDados

    let queryDesc = ''

    if( acao == 'A' ) {
        queryDesc = `
            SELECT A01_CODIGO
              FROM A01 
             WHERE UPPER(A01_DESCRI) = UPPER(@A01_DESCRI)
               AND A01_CODIGO <> @A01_CODIGO
        `
    } else {
        queryDesc = `
            SELECT A01_CODIGO
              FROM A01 
             WHERE UPPER(A01_DESCRI) = UPPER(@A01_DESCRI)
        `
    }

    connectionDB.runQuery({ 
        sqlStatement: queryDesc,
        queryParams: [
            { name: "A01_DESCRI" , value: descricaoGrupo },
            { name: "A01_CODIGO" , value: codGrupo }
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            if( aRows.length > 0 ) {
                if( acao == 'A' ) {
                    callback({
                        errorcode: '01',
                        message: 'Já existe um grupo com a descrição informada! Não foi possível alterar!'
                    })
                } else {
                    callback({
                        errorcode: '01',
                        message: 'Já existe um grupo com a descrição informada! Não foi possível incluir!'
                    })
                }
            } else {
                let sql = '' 
                
                if( acao == 'A' ) {
                    sql = `
                        UPDATE A01
                           SET A01_DESCRI = @A01_DESCRI
                         WHERE A01_CODIGO = @A01_CODIGO 
                    `
                } else {
                    sql = `
                        INSERT INTO A01 (
                               A01_CODIGO
                             , A01_DESCRI
                         )    
                         VALUES (
                               (SELECT REPLACE(STR(MAX(A01_CODIGO) + 1, 6), SPACE(1), '0') FROM A01)
                             , @A01_DESCRI
                         );
                    `
                }
                
                connectionDB.runQuery({ 
                    sqlStatement: sql, 
                    queryParams: [
                        { name: "A01_DESCRI" , value: descricaoGrupo },
                        { name: "A01_CODIGO" , value: codGrupo }
                    ],
                    callbackSuccess: ( aRows, queryParams ) => {
                        if( acao == 'A' ) {
                            callback({
                                errorcode: '00',
                                message: 'Grupo alterado com sucesso!'
                            })
                        } else {
                            callback({
                                errorcode: '00',
                                message: 'Grupo cadastrado com sucesso!'
                            })
                        }
                    }
                })
            }
        }
    })
}

function gruposUsuarios_delete( codGrupo, callback ) {
    connectionDB.runQuery({ 
        sqlStatement: `
           SELECT A01_CODIGO
                , A01_DESCRI
             FROM A01

             INNER JOIN A00
                     ON A00_GRUPO = A01_CODIGO
     
            WHERE ( ('ALL' = @A01_CODIGO) OR (A01_CODIGO = @A01_CODIGO) )
           `,
        queryParams: [
            { name: "A01_CODIGO" , value: codGrupo }
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            console.log(aRows)
            if( aRows.length > 0 ) {
                callback({
                    errorcode: '01',
                    message: 'Existem um ou mais usuários atrelados a este grupo! Não foi possível alterar!'
                })
            } else {
                connectionDB.runQuery({ 
                    sqlStatement: `
                        DELETE FROM A01 WHERE A01_CODIGO = @A01_CODIGO
                    `,
                    queryParams: [
                        { name: "A01_CODIGO", value: codGrupo }
                    ],
                    callbackSuccess: ( aRows, queryParams ) => {
                        callback({
                            errorcode: '00',
                            message: 'Grupo excluído com sucesso!'
                        })
                    }
                })
            }
        }
    })
}

module.exports = {
    gruposUsuarios_delete,
    gruposUsuarios_getGrupos,
    gruposUsuarios_save
}