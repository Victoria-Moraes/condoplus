//Conexão com o DB
const core = require('../../../utils/core')
const tedious = require('tedious')

const objConnectionDB = {
    connection: null
}

async function connect( callback ) {
    var Connection = tedious.Connection;  
    var config = {  
        server: '127.0.0.1',  //update me
        authentication: {
            type: 'default',
            options: {
                userName: 'SA', //update me
                password: 'admin123!'  //update me
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: true,
            database: 'CondoPlus',  //update me
            trustServerCertificate: true
        }
    };  
    var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        objConnectionDB.connection = connection

        // If no error, then good to proceed.
        if( err ) {
            objConnectionDB.connection = null
            console.log( err );  
            callback( connection )
            return 
        }

        callback( connection )
        console.log("Connected");  

        // let queryObj = { 
        //     sqlStatement: "SELECT * FROM A00;",
        //     callbackSuccess: ( aRows ) => {
        //         console.log( aRows )
        //     },
        //     callbackError: null
        // }
        
        // runQuery( queryObj, connection );
    });

    connection.connect();
}
  
function runQuery( objQuery ) {  
    const Request = tedious.Request
    const TYPES = tedious.TYPES
    let aRows = []

    let standardConfig = {
        sqlStatement: "",
        callbackSuccess: null,
        callbackError: null
    }

    let settings = core.matchObj( standardConfig, objQuery );

    var request = new Request(settings.sqlStatement, function(err, rowsCount, rows) {  
        if (err) {
            console.log(err);

            if( settings.callbackError!= null ) {
                if( typeof settings.callbackError == 'function' ) {
                    settings.callbackError( err )
                } else if( typeof settings.callbackError == 'string' ) {
                    eval(settings.callbackError)
                }
            }
            
            return
        }

        if( settings.callbackSuccess!= null ) {
            if( typeof settings.callbackSuccess == 'function' ) {
                settings.callbackSuccess( aRows, settings.queryParams )
            } else if( typeof settings.callbackSuccess == 'string' ) {
                eval(settings.callbackSuccess)
            }
        }
    }); 

    request.on('row', function(columns) {  
        let rowData = {}

        columns.forEach(function(column) {  
            rowData[column.metadata.colName] = column.value 
        });  

        aRows.push( rowData )
    });  

    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        // objConnectionDB.connection.close();
    });

    settings.queryParams.forEach( param => {
        let typeParam = null

        if( typeof param.value == 'string' ) {
            typeParam = TYPES.VarChar
        } else if( typeof param.value == 'number' ) {
            typeParam = TYPES.Float
        }

        request.addParameter( param.name, typeParam, param.value )
    })

    objConnectionDB.connection.execSql(request, err => {
        if (err) {
            console.log(err); // Rejeitar a promessa em caso de erro
        }
    });
}

module.exports = {
    connectDB: connect,
    runQuery,
    connectionStatus: objConnectionDB.connection
}
