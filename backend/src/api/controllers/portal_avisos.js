const core = require('../../../utils/core.js');
const connectionDB = require(`../services/connectionDB.js`)
const moment = require('moment');

function portalAvisos_get( codAviso, dataDe, dataAte, tipo, callback ) {
    connectionDB.runQuery({ 
        sqlStatement: `
            SELECT A04.*
                , A00_NOME
             FROM A04 A04
   
             LEFT JOIN A00 A00
                    ON A00_CODIGO = A04_CODA00
            
             ORDER BY A04_DATA DESC
                    , A04_HORA DESC
        `,
        queryParams: [
            { name: "A04_CODIGO"   , value: codAviso },
            { name: "A04_DATA_DE"  , value: dataDe },
            { name: "A04_DATA_ATE" , value: dataAte },
            { name: "A04_TIPO"     , value: tipo },
        ],
        callbackSuccess: ( aRows ) => {
            callback( aRows )
        }
    })

    // WHERE A04_DATA BETWEEN @A04_DATA_DE AND @A04_DATA_ATE
//     ( ('ALL' = @A04_CODIGO) OR (A04_CODIGO = @A04_CODIGO) )
// AND ( ('ALL' = @A04_TIPO) OR (A04_TIPO = @A04_TIPO) ) 
}

function portalAvisos_save( oDados, callback ) {
    const {
        acao, 
        titulo, 
        descricao, 
        tipo,
        codUsuario,
        codAviso
    } = oDados

    let sql = '' 

    console.log(`Ação: ${acao}`)
                
    if( acao == 'A' ) {
        sql = `
            UPDATE A04
                SET A04_TITULO = @A04_TITULO
                  , A04_DESCRICAO = @A04_DESCRICAO
                  , A04_TIPO = @A04_TIPO
                  , A04_DATA = @A04_DATA
                  , A04_HORA = @A04_HORA
                WHERE A04_CODIGO = @A04_CODIGO 
        `
    } else {
        sql = `
            INSERT INTO A04 (
                A04_CODIGO,
                A04_CODA00,
                A04_TITULO,
                A04_DESCRICAO,
                A04_TIPO,
                A04_DATA,
                A04_HORA
            )
            VALUES (
                (SELECT REPLACE(STR(MAX(A04_CODIGO) + 1, 10), SPACE(1), '0') FROM A04),
                @A04_CODA00,
                @A04_TITULO,
                @A04_DESCRICAO,
                @A04_TIPO,
                @A04_DATA,
                @A04_HORA
            );
        `
    }
    
    connectionDB.runQuery({ 
        sqlStatement: sql, 
        queryParams: [
            { name: "A04_CODIGO"    , value: codAviso },
            { name: "A04_CODA00"    , value: codUsuario },
            { name: "A04_TITULO"    , value: titulo },
            { name: "A04_DESCRICAO" , value: descricao },
            { name: "A04_TIPO"      , value: tipo },
            { name: "A04_DATA"      , value: moment().format('YYYY-MM-DD') },
            { name: "A04_HORA"      , value: moment().format('HH:mm') }
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            if( acao == 'A' ) {
                callback({
                    errorcode: '00',
                    message: 'Aviso alterado com sucesso!'
                })
            } else {
                callback({
                    errorcode: '00',
                    message: 'Aviso publicado com sucesso!'
                })
            }
        }
    })
}

function portalAvisos_delete( codAviso, callback ) {
    connectionDB.runQuery({ 
        sqlStatement: `
            DELETE FROM A04 WHERE A04_CODIGO = @A04_CODIGO
        `,
        queryParams: [
            { name: "A04_CODIGO", value: codAviso }
        ],
        callbackSuccess: ( aRows, queryParams ) => {
            callback({
                errorcode: '00',
                message: 'Aviso excluído com sucesso!'
            })
        }
    })
}

module.exports = {
    portalAvisos_get,
    portalAvisos_save,
    portalAvisos_delete
}