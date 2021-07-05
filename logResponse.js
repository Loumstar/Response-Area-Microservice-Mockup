const logResponse = (students, studentResponseData, answer, isCorrect) => {
    studentResponseData.attempts++;

    studentResponseData.submissions.push({
        answer: answer,
        isCorrect: isCorrect
    });

    let studentsJson = JSON.stringify(students, null, 4);
    fs.writeFile('./students.json', studentsJson, err => {
        if(err) throw err;
    });
}

module.exports = logResponse;