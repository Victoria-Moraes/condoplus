const core = require('../../../utils/core.js');
const connectionDB = require(`../services/connectionDB.js`)
const moment = require('moment');

function usuarios_getUsuarios( codUsuario, callback ) {
    connectionDB.runQuery({ 
        sqlStatement: `
            SELECT A00_CODIGO
                 , A00_EMAIL
                 , A00_GRUPO
                 , A00_NOME
                 , A01_DESCRI
              FROM A00 

             INNER JOIN A01
                     ON A01_CODIGO = A00_GRUPO

             WHERE A00_BLOQ = '1'
               AND ( ('ALL' = @COD_USUARIO) OR (A00_CODIGO = @COD_USUARIO) )
        `,
        queryParams: [
            {name: 'COD_USUARIO', value: codUsuario}
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            callback( aRows )
        }
    })
}

function usuarios_save( oDados, callback ) {
    const {acao, codUsuario, nomeUsuario, emailUsuario, grupoUsuario} = oDados

    let queryEmail = ''

    if( acao == 'A' ) {
        queryEmail = `
            SELECT A00_CODIGO
              FROM A00 
             WHERE UPPER(A00_EMAIL) = UPPER(@A00_EMAIL)
               AND A00_CODIGO <> @A00_CODIGO
        `
    } else {
        queryEmail = `
            SELECT A00_CODIGO
              FROM A00 
             WHERE UPPER(A00_EMAIL) = UPPER(@A00_EMAIL)
        `
    }

    connectionDB.runQuery({ 
        sqlStatement: queryEmail,
        queryParams: [
            { name: "A00_EMAIL" , value: emailUsuario },
            { name: "A00_CODIGO" , value: codUsuario }
        ],
        callbackSuccess: ( aRowsUPD, queryParams ) => {
            if( aRowsUPD.length > 0 ) {
                if( acao == 'A' ) {
                    callback({
                        errorcode: '01',
                        message: 'Email já cadastrado! Não foi possível alterar!'
                    })
                } else {
                    callback({
                        errorcode: '01',
                        message: 'Email já cadastrado! Não foi possível incluir!'
                    })
                }
            } else {
                let sql = '' 
                
                if( acao == 'A' ) {
                    sql = `
                        UPDATE A00
                        SET A00_NOME = @A00_NOME
                            , A00_EMAIL = @A00_EMAIL 
                            , A00_GRUPO = @A00_GRUPO 
                        WHERE A00_CODIGO = @A00_CODIGO 
                    `
                } else {
                    sql = `
                        INSERT INTO A00 (
                               A00_CODIGO
                             , A00_NOME
                             , A00_EMAIL
                             , A00_BLOQ
                             , A00_SENHA
                             , A00_GRUPO
                             , A00_LOGIN
                         )    
                         VALUES (
                               (SELECT REPLACE(STR(MAX(A00_CODIGO) + 1, 6), SPACE(1), '0') FROM A00)
                             , @A00_NOME
                             , @A00_EMAIL
                             , @A00_BLOQ
                             , @A00_SENHA
                             , @A00_GRUPO
                             , @A00_LOGIN
                         );
                    `
                }
                
                connectionDB.runQuery({ 
                    sqlStatement: sql, 
                    queryParams: [
                        { name: "A00_CODIGO" , value: codUsuario },
                        { name: "A00_NOME"   , value: nomeUsuario },
                        { name: "A00_EMAIL"  , value: emailUsuario },
                        { name: "A00_BLOQ"   , value: `1` },
                        { name: "A00_SENHA"  , value: core.criptografarSenha(`novo`) },
                        { name: "A00_GRUPO"  , value: grupoUsuario },
                        { name: "A00_LOGIN"  , value: emailUsuario },
                    ],
                    callbackSuccess: ( aRowsUPD, queryParams ) => {
                        if( acao == 'A' ) {
                            callback({
                                errorcode: '00',
                                message: 'Usuário alterado com sucesso!'
                            })
                        } else {
                            callback({
                                errorcode: '00',
                                message: 'Usuário cadastrado com sucesso!'
                            })
                        }
                    }
                })
            }
        }
    })
}

function usuarios_deleteUsuario( codUsuario, callback ) {
    connectionDB.runQuery({ 
        sqlStatement: `
            DELETE FROM A00 WHERE A00_CODIGO = @A00_CODIGO
        `,
        queryParams: [
            { name: "A00_CODIGO", value: codUsuario }
        ],
        callbackSuccess: ( aRowsUPD, queryParams ) => {
            callback({
                errorcode: '00',
                message: 'Usuário excluído com sucesso!'
            })
        }
    })
}

module.exports = {
    usuarios_deleteUsuario,
    usuarios_getUsuarios,
    usuarios_save
}