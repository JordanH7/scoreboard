function menu_display(show) {
    const display = show ? "block" : "none";
    document.getElementById('menu-overlay').style.display = display
}

function page_display(show, ...elementId) {
    const display = show ? "flex" : "none";
    if (elementId[0] == "all") {
        elementId = ['match-page', 'randomizer-page', 'saves-page', 'players-page', 'stats-page', 'replay-page']
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

document.getElementById('playerData-randomizer').addEventListener('submit', function(e) {
    e.preventDefault();
})

var playerData = [];
function addPlayerData() {
    const form = document.getElementById('playerData-randomizer');
    const formData = form.querySelectorAll('input');
    const list = document.getElementById('players-list');
    const delete_btn = document.createElement("button");

    /* Adds the data to the list */
    const li = document.createElement('li');
    li.className = "bullet_points li-button";
    li.setAttribute("tabindex", "0"); // Make the li act as a button

    li.onclick = () => {
        console.log("List item clicked:", li.textContent);
    };

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("player-checkbox");
    checkbox.checked = true;

    checkbox.onclick = (event) => {
        event.stopPropagation();
        console.log("Checkbox toggled for:", li.textContent, "Checked:", event.target.checked);
    };

    li.appendChild(checkbox);

    for (let i = 0; i < formData.length - 1; i++) {
        const span = document.createElement("span");
        span.innerHTML = formData[i].value + "&nbsp;";
        li.appendChild(span);
    }

    /* Deletes a player */
    delete_btn.textContent = "X";
    delete_btn.classList = "delete-btn";
    delete_btn.onclick = (event) => {
        event.stopPropagation();
        list.removeChild(li);

        const playerName = formData[0].value;
        const playerIndex = playerData.findIndex(player => player[1] === playerName);
        if (playerIndex !== -1) {
            playerData.splice(playerIndex, 1);
        }
    };

    li.appendChild(delete_btn);
    list.appendChild(li);

    /* Stores all data for later use */
    let currentPlayerArray = [
        checkbox.checked,
        formData[0].value,
        Number(formData[1].value)
    ];
    
    playerData.push(currentPlayerArray);
    console.log(playerData);
}

function generateTeams(numOfTeams, pointTolerance) {
    const activePlayers = [];
    // Shuffle array (Fisher–Yates)
    function shuffle(arr) {
        let a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // Try generating many random combinations until one fits tolerance
    const MAX_ATTEMPTS = 5000;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        let shuffled = shuffle(activePlayers);

        // Initialize empty teams
        let teams = Array.from({ length: numOfTeams }, () => ({
            players: [],
            total: 0
        }));

        // Random distribution with stat balancing
        for (let [name, stat] of shuffled) {
            // Randomly pick a team but biased towards lower stat totals
            let sortedTeams = teams.sort((a, b) => a.total - b.total);
            let chosenIndex =
                Math.random() < 0.6   // 60% chance to pick a lower-stat team
                ? 0
                : Math.floor(Math.random() * numOfTeams);

            teams[chosenIndex].players.push(name);
            teams[chosenIndex].total = Number(teams[chosenIndex].total) + Number(stat);
        }

        // Check tolerance
        let totals = teams.map(t => t.total);
        let maxTotal = Math.max(...totals);
        let minTotal = Math.min(...totals);

        if (maxTotal - minTotal <= pointTolerance) {
            // Format teams as required
            return teams.map(t => [...t.players, t.total]);
        }
        console.log(teams);
    }

    return null; // No valid team found in attempts   
}

function getGeneratedTeams() {
    console.log(generateTeams(2, 20));
}

let selected = null;

// Add this to your MMR_Tracking.js file
let selectedPlayerBox = null;

document.querySelectorAll('.player-box').forEach(box => {
    // Click to swap
    box.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-player')) return;
        
        if (!selectedPlayerBox) {
            selectedPlayerBox = box;
            box.classList.add('selected');
        } else if (selectedPlayerBox === box) {
            box.classList.remove('selected');
            selectedPlayerBox = null;
        } else {
            // Check same side
            if (selectedPlayerBox.closest('.court-side') === box.closest('.court-side')) {
                const temp = box.querySelector('.player-name').textContent;
                box.querySelector('.player-name').textContent = selectedPlayerBox.querySelector('.player-name').textContent;
                selectedPlayerBox.querySelector('.player-name').textContent = temp;
            }
            selectedPlayerBox.classList.remove('selected');
            selectedPlayerBox = null;
        }
    });

    // Click pencil to edit
    const editBtn = box.querySelector('.edit-player');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const span = box.querySelector('.player-name');
            const input = document.createElement('input');
            input.value = span.textContent;
            span.replaceWith(input);
            input.focus();
            
            const save = () => {
                const newSpan = document.createElement('span');
                newSpan.className = 'player-name';
                newSpan.textContent = input.value || 'P?';
                input.replaceWith(newSpan);
            };
            
            input.addEventListener('blur', save);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') save();
            });
        });
    }
});

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
