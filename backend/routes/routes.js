'use strict';

const core = require('../utils/core.js');
const connectionDB = require(`../src/api/services/connectionDB.js`)
const {usuarios_deleteUsuario, usuarios_getUsuarios, usuarios_save} = require(`../src/api/controllers/usuarios.js`)
const {gruposUsuarios_delete, gruposUsuarios_getGrupos, gruposUsuarios_save} = require(`../src/api/controllers/grupos_usuarios.js`)
const {chamados_get, chamados_save, chamados_updateStatus, chamados_delete} = require(`../src/api/controllers/chamados.js`)
const {portalAvisos_get, portalAvisos_save, portalAvisos_delete} = require(`../src/api/controllers/portal_avisos.js`)
const moment = require('moment');

module.exports = function(app) {
    app.route('/')
        .get( (req, res) => {
            res.render("login", {
                page_title: 'login',
                layout: 'login'
            })
        })
    
    app.route('/login')
        .post( (req, res) => {
            const { login, password } = req.body;

            let encryptedPassword = core.criptografarSenha( password );

            connectionDB.runQuery({ 
                sqlStatement: "SELECT * FROM A00 WHERE A00_LOGIN = @A00_LOGIN AND A00_SENHA = @A00_SENHA;",
                queryParams: [
                    { name: "A00_LOGIN", value: login }, 
                    { name: "A00_SENHA", value: encryptedPassword.toString()}
                ],
                callbackSuccess: ( aRows ) => {
                    let contentResp = {}

                    if( aRows.length > 0 ) {
                        contentResp = {
                            cod: 200,
                            mensagem: "Usuário logado com sucesso!"
                        }
                    } else {
                        contentResp = {
                            cod: 401,
                            mensagem: "Não foi possível realizar o login!"
                        }
                    }

                    if( contentResp.cod === 200 ) {
                        connectionDB.runQuery({ 
                            sqlStatement: `
                                SELECT *
                                  FROM A02 A02
                                 WHERE A02.A02_CODIGO = (
                                    SELECT MAX(SUB_A02.A02_CODIGO) AS MAX_A02_CODIGO
                                      FROM A02 SUB_A02
                                     WHERE SUB_A02.A02_CODA00 = @A02_CODA00
                                 )
                            `,
                            queryParams: [
                                { name: "A02_CODA00" , value: aRows[0].A00_CODIGO }
                            ],
                            callbackSuccess: ( aRowsCheckSessao ) => {
                                if( aRowsCheckSessao.length > 0 && aRowsCheckSessao[0]["A02_ISACTIVE"] == 1 ) {
                                    contentResp.codSessao = aRowsCheckSessao[0]["A02_CODIGO"]
                                    contentResp.codUsuario = aRowsCheckSessao[0]["A02_CODA00"]
                                    contentResp.codGrupo = aRows[0].A00_CODIGO

                                    res.json( contentResp )
                                } else {
                                    connectionDB.runQuery({ 
                                        sqlStatement: `
                                            INSERT INTO A02 (
                                                   A02_CODIGO
                                                 , A02_CODA00
                                                 , A02_DATAINI
                                                 , A02_HORAINI
                                                 , A02_ISACTIVE
                                             )    
                                            VALUES (
                                                   @A02_CODIGO
                                                 , @A02_CODA00
                                                 , @A02_DATAINI
                                                 , @A02_HORAINI
                                                 , 1
                                            );
                                        `,
                                        queryParams: [
                                            { name: "A02_CODA00" , value: aRows[0].A00_CODIGO },
                                            { name: "A02_CODIGO" , value: aRows[0].A00_CODIGO + Date.now().toString() },
                                            { name: "A02_DATAINI", value: moment().format('YYYY-MM-DD') },
                                            { name: "A02_HORAINI", value: moment().format('HH:mm:ss') }
                                        ],
                                        callbackSuccess: ( aRowsUPD, queryParams ) => {
                                            contentResp.codSessao = queryParams.find( param => param.name == "A02_CODIGO" ).value
                                            contentResp.codUsuario = queryParams.find( param => param.name == "A02_CODA00" ).value
                                            contentResp.codGrupo = aRows[0].A00_CODIGO

                                            res.json( contentResp )
                                        }
                                    })
                                }
                            }
                        })
                    } else {
                        res.json( contentResp )
                    }
                },
                callbackError: null
            })
        })

    app.route('/index')
        .get( (req, res) => {
            res.render("index", {
                page_title: 'index',
                layout: 'index'
            })
        })
    
    app.route('/index/page_usuarios')
        .get( (req, res) => {
            res.render("usuarios", {
                page_title: 'Usuários',
                layout: 'index'
            })
        })
    app.route('/index/page_grupos_usuarios')
        .get( (req, res) => {
            res.render("grupos_usuarios", {
                page_title: 'Grupos de Usuários',
                layout: 'index'
            })
        })
    app.route('/index/page_chamados')
        .get( (req, res) => {
            res.render("chamados", {
                page_title: 'Chamados',
                layout: 'index'
            })
        })
    app.route('/index/page_portal_avisos')
        .get( (req, res) => {
            res.render("portal_avisos", {
                page_title: 'Portal Avisos',
                layout: 'index'
            })
        })
    
    app.route('/index/usuarios')
        .get( (req, res) => {
            const codUsuario = req.query.codUsuario;

            usuarios_getUsuarios( codUsuario, ( aRows ) => {
                res.json( aRows )
            })
        })
        .post( (req, res) => {
            usuarios_save( req.body, ( objRet ) => {
                res.json(objRet)
            })
        })
        .delete( (req, res) => {
            const codUsuario = req.query.codUsuario;

            usuarios_deleteUsuario( codUsuario, ( objRet ) => {
                res.json(objRet)
            })
        })
    
    app.route('/index/grupos_usuarios')
        .get( (req, res) => {      
            const codGrupo = req.query.codGrupo; 
            
            gruposUsuarios_getGrupos( codGrupo, ( aRows ) => {
                res.json( aRows )
            })
        })
        .post( (req, res) => {
            gruposUsuarios_save( req.body, ( objRet ) => {
                res.json(objRet)
            })
        })
        .delete( (req, res) => {
            const codGrupo = req.query.codGrupo;

            gruposUsuarios_delete( codGrupo, ( objRet ) => {
                res.json(objRet)
            })
        })

    app.route('/index/chamados')
        .get( (req, res) => {      
            const codChamado = req.query.codChamado; 
            const dataDe = req.query.dataDe; 
            const dataAte = req.query.dataAte; 
            const status = req.query.status; 
            const usuario = req.query.usuario; 

            chamados_get( codChamado, dataDe, dataAte, status, usuario, ( aRows ) => {
                res.json( aRows )
            })
        })
        .post( (req, res) => {
            const acao = req.body.acao;
    
            if( acao == "I" || acao == "A" ) {
                chamados_save( req.body, ( objRet ) => {
                    res.json(objRet)
                })
            } else if( acao == "U" ) {
                chamados_updateStatus( req.body, ( objRet ) => {
                    res.json(objRet)
                })
            }
        })
        .delete( (req, res) => {
            const codChamado = req.query.codChamado;

            chamados_delete( codChamado, ( objRet ) => {
                res.json(objRet)
            })
        })
    
    app.route('/index/portal_avisos')
        .get( (req, res) => {
            const codAviso = req.query.codAviso; 
            const dataDe = req.query.dataDe; 
            const dataAte = req.query.dataAte; 
            const tipo = req.query.tipo; 

            portalAvisos_get( codAviso, dataDe, dataAte, tipo, ( aRows ) => {
                res.json( aRows )
            })
        })
        .post( (req, res) => {    
            portalAvisos_save( req.body, ( objRet ) => {
                res.json(objRet)
            })
        })
        .delete( (req, res) => {
            const codAviso = req.query.codAviso;

            portalAvisos_delete( codAviso, ( objRet ) => {
                res.json(objRet)
            })
        })
}