const fs = require('fs');

const express = require('express');
const morgan = require('morgan');
const errorHandler = require('error-handler');
const { isUUID } = require('validator');

const renderResponse = require('./render/renderResponse.js');
const gradeResponse = require('./grade/gradeResponse.js');
const logResponse = require('./logResponse.js');
const getFeedback = require('./grade/feedback.js');

const problemSets = require('./problemSets.json');
const students = require('./students.json');

const responseAreaType = "Mock";

const getProblemSet = (req, res, next) => {
    let setId = req.query.setId;

    if(!isUUID(setId)){
        res.status(400).send("Invalid or no Problem Set ID.");
    } else if(!problemSets.hasOwnProperty(setId)){
        res.status(404).send("Problem set could not be found.");
    } else {
        req.setId = setId;
        req.problemSet = problemSets[setId];
        next();
    }
}

const getResponseArea = (req, res, next) => {
    let responseId = req.query.responseId;
    let responses = req.problemSet.responses;

    if(!isUUID(responseId)){
        res.status(400).send("Invalid or no Response Area ID.");
    } else if(!responses.hasOwnProperty(responseId)){
        res.status(404).send("Response Area could not be found.");
    } else if(responses[responseId].type != responseAreaType){
        res.status(400).send(
            `Response Area in ${responses[responseId].path} is ${responses[responseId].type} \
            but made a request to the ${responseAreaType} microservice.`
        );
    } else {
        req.responseId = responseId;
        req.responseArea = responses[responseId];
        next();
    }
}

const getStudent = (req, res, next) => {
    let studentId = req.query.studentId;

    if(!isUUID(studentId)){
        res.status(400).send("Invalid or no Student ID.");
    } else if(!students[studentId]){
        res.status(404).send("Student could not be found.");
    } else {
        req.studentId = studentId;
        req.student = students[studentId];
        next();
    }
}

const getStudentSetData = (req, res, next) => {
    if(!req.student[req.setId]){
        req.student[req.setId] = {};   
    }

    req.studentSetData = req.student[req.setId];

    next();
}

const getStudentResponseData = (req, res, next) => {
    if(!req.studentSetData[req.responseId]){
        req.studentSetData[req.responseId] = {};
    }

    req.studentResponseData = req.studentSetData[req.responseId];

    next();
}

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use(getProblemSet);
app.use(getResponseArea);

app.get('/render', (req, res, next) => {
    // Render the response area
    let renderedRespose = renderResponse(req.responseArea);

    if(renderedRespose.valid){
        res.send(renderedRespose.html);
    } else {
        // Extend and throw the error to the server if validation failed.
        let renderError = new Error(
            `Schema threw an error while validating \
            the response area in ${req.responseArea.path}.`
        );
        
        next(renderError);
    }
});

app.post('/grade', getStudent, getStudentSetData, getStudentResponseData, (req, res, next) => {
    let isCorrect = gradeResponse(req.responseArea, req.body);
    logResponse(req.studentResponseData, req.body, isCorrect);

    // return feedback
    res.status(204).send({
        isCorrect: isCorrect,
        feedback: getFeedback(req.body, req.responseArea)
    });
});

app.use(errorHandler());

let port = process.env.port || 8000;

app.listen(port, () => {
    console.log(`${responseAreaType} response area microservice running on port ${port}`);
});