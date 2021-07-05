const fs = require('fs');

const ejs = require('ejs');
const jsonSchema = require('jsonschema');

const schema = require('./schema.json');
const template = ejs.compile(fs.readFile('./template.ejs'));

const render = (responseData) => {
    // validate
    const v = new jsonSchema.Validator();
    const schemaResult = v.validate(responseData, schema);

    let renderResult = {
        valid: schemaResult.valid,
        errors: schemaResult.errors,
        html: ''
    };

    // render
    if(schemaResult.valid){
        renderResult.html = template(responseData);
    }

    return renderResult;
}

module.exports = render;