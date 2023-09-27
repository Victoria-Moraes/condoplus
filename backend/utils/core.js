const crypto = require('crypto');
const moment = require('moment');

const matchObj = ( stdObjRef={}, newObjRef={} ) => {
    let stdObjCopy = {...stdObjRef}
    let newObjCopy = {...newObjRef}

    let keysNewObj = Object.keys( newObjCopy );

    keysNewObj.forEach( key => {
        stdObjCopy[key] = newObjCopy[key];
    })

    return stdObjCopy;
}


function criptografarSenha(senha) {
    const hash = crypto.createHash('sha256');
    hash.update(senha);
    const senhaCriptografada = hash.digest('hex');
    return senhaCriptografada;
}

function padZero( txt,  tam ) {
    return txt.length < tam ? padZero('0'+txt, tam) : txt
}

module.exports = {
    matchObj,
    criptografarSenha,
    padZero
}