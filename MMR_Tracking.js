function menu_display(show) {
    const display = show ? "block" : "none";
    document.getElementById('menu-overlay').style.display = display
}

function page_display(show, ...elementId) {
    const display = show ? "flex" : "none";
    if (elementId[0] == "all") {
        elementId = ['match-page', 'randomizer-page', 'saves-page', 'stats-page', 'replay-page']
        menu_display(show);
    }
    elementId.forEach(
        function(element) {
            document.getElementById(element).style.display = display
        }
    );
}

document.querySelectorAll('.question').forEach(question => {
    question.addEventListener('click', function(e) {
        if (e.target.classList.contains('answer')) {
            const questionNum = this.id.match(/\d+/)[0];
            displayQuestion(Number(questionNum)+1);

            const dataType = this.dataset.dataType;
            const data = e.target.textContent;
            console.log(dataType, data);
            sendData(dataType, data);
        }
    });
});

function displayQuestion(questionNum) {
    const numOfQuestions = document.querySelectorAll('[id^="question"][id$="-match"]').length;
    questionNum = questionNum > numOfQuestions ? 1 : questionNum;
    var id = '';
    for (let i = 1; i <= numOfQuestions; i++) {
        id = `question${i}-match`;
        document.getElementById(id).style.display = 'none';
    }

    id = `question${questionNum}-match`;
    document.getElementById(id).style.display = 'flex';
}

function sendData(dataType, data) {
    switch(dataType) {
        case 'Team Score':
            // Send data to ESP32
            // Send data to server
            break;
        case 'Player Score':
            // Send data to server
            break;
        case 'Score Type':
            // Send data to server
            break;
        case 'Player Error':
            // Send data to server
            break;
        default:
            console.log('dataType not found, data recorder but not used');
            // Send data to server
            break;
    }
}
