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
    li.setAttribute("tabindex", "0");

    li.onclick = () => {
        console.log("List item clicked:", li.textContent);
    };

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("player-checkbox");
    checkbox.checked = true;

    // Store player name for lookup
    const playerName = formData[0].value;

    checkbox.onclick = (event) => {
        event.stopPropagation();
        const isChecked = event.target.checked;
        console.log("Checkbox toggled for:", playerName, "Checked:", isChecked);

        // Update playerData array
        const playerIndex = playerData.findIndex(player => player[1] === playerName);
        if (playerIndex !== -1) {
            playerData[playerIndex][0] = isChecked;
            console.log("Updated playerData:", playerData);
        }
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
        if (confirmEvent(`Are you sure you want to delete ${playerName}?`)) {
            list.removeChild(li);

            const playerIndex = playerData.findIndex(player => player[1] === playerName);
            if (playerIndex !== -1) {
                playerData.splice(playerIndex, 1);
                console.log("Deleted player:", playerName, "Remaining:", playerData);
            }
        }
    };

    li.appendChild(delete_btn);
    list.appendChild(li);

    /* Stores all data for later use */
    let currentPlayerArray = [
        checkbox.checked,
        playerName,
        Number(formData[1].value)
    ];

    playerData.push(currentPlayerArray);
    console.log(playerData);
}

function confirmEvent(text = 'Confirm Action') {
    let userConfirmed = confirm(text);
    return userConfirmed;
}

var activePlayers = [];
function generateTeams(numOfTeams, pointTolerance) {
    activePlayers = []
    for (let [bool, player, stat] of playerData) {
        if (bool) {
            activePlayers.push([player, stat]);
        }
    }
    
    // Check if valid distribution is possible
    const totalPlayers = activePlayers.length;
    const minPlayersPerTeam = Math.floor(totalPlayers / numOfTeams);
    const maxPlayersPerTeam = Math.ceil(totalPlayers / numOfTeams);
    
    if (maxPlayersPerTeam - minPlayersPerTeam > 1) {
        console.error(`Cannot create balanced teams: ${totalPlayers} players into ${numOfTeams} teams would require teams of ${minPlayersPerTeam} and ${maxPlayersPerTeam} players.`);
        return null;
    }
    
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

        // Distribute players
        for (let [name, stat] of shuffled) {
            // Sort teams by total stat, then by player count (prefer teams with fewer players)
            let sortedTeams = teams
                .map((t, idx) => ({ ...t, idx }))
                .sort((a, b) => {
                    if (a.players.length !== b.players.length) {
                        return a.players.length - b.players.length; // Fewer players first
                    }
                    return a.total - b.total; // Then lower stats
                });

            // Pick team - bias towards lower stat totals among teams with fewest players
            let chosenIndex =
                Math.random() < 0.6
                ? sortedTeams[0].idx
                : sortedTeams[Math.floor(Math.random() * Math.min(3, numOfTeams))].idx;

            teams[chosenIndex].players.push(name);
            teams[chosenIndex].total = Number(teams[chosenIndex].total) + Number(stat);
        }

        // Check player count tolerance (max difference of 1)
        let playerCounts = teams.map(t => t.players.length);
        let maxPlayers = Math.max(...playerCounts);
        let minPlayers = Math.min(...playerCounts);
        
        if (maxPlayers - minPlayers > 1) {
            continue; // Skip this attempt if player difference is more than 1
        }

        // Check stat tolerance
        let totals = teams.map(t => t.total);
        let maxTotal = Math.max(...totals);
        let minTotal = Math.min(...totals);

        if (maxTotal - minTotal <= pointTolerance) {
            // Format teams as required
            console.log('Valid teams found:', teams);
            return teams.map(t => [...t.players, t.total]);
        }
    }

    console.log('No valid teams found within tolerance after', MAX_ATTEMPTS, 'attempts');
    return null; // No valid team found in attempts   
}

let team_Left = 0;
let team_Right = 0;
let serving = 'right';
let hasServedLeft = false;
let hasServedRight = true;
function updateScore(team, reset = false) {
    team == 'left' ? team_Left += 1 : team_Right += 1;

    if (reset) {
        team_Left = 0;
        team_Right = 0;
        prevTeam = '';
        hasServedLeft = false;
        hasServedRight = false;
    }
    document.getElementById('score').textContent = `Score: ${team_Left} : ${team_Right}`;

    if (team === serving || reset) {
        return;
    } else {
        serving = team;
        changeServeSide(team, 'auto');

        console.log(team, hasServedLeft, hasServedRight);
        if (team === 'left' && !hasServedLeft) {
            hasServedLeft = true;
        } else if (team === 'right' && !hasServedRight) {
            hasServedRight = true;
        } else {
            console.log('rotate positions', team);
            rotatePositions(team);
        }
    }
}

function changeServeSide(newSide, type = 'manual') {
    if (document.getElementById('score').textContent == 'Score: 0 : 0' || type != 'manual') {
        document.getElementById(`serving-${newSide}`).style.display = 'block';
        let side = newSide == 'left' ? 'right' : 'left';
        document.getElementById(`serving-${side}`).style.display = 'none';
        serving = newSide;
    } else {
        console.log("Can't change serve in a match");
    }
    if (type == 'manual') {
        if (newSide == 'left') {
            hasServedLeft = true;
            hasServedRight = false;
        } else if (newSide == 'right') {
            hasServedLeft = false;
            hasServedRight = true;
        }
    }
}

function rotatePositions(team) {
    if (team == 'left') {
        const temp = document.getElementById('left-P6').textContent;
        for (let i = numOfPlayers; i > 1; i--) {
            document.getElementById(`left-P${i}`).textContent = document.getElementById(`left-P${i-1}`).textContent;
        }
        document.getElementById('left-P1').textContent = temp;
    } else if (team == 'right') {
        const temp = document.getElementById('right-P6').textContent;
        for (let i = numOfPlayers; i > 1; i--) {
            document.getElementById(`right-P${i}`).textContent = document.getElementById(`right-P${i-1}`).textContent;
        }
        document.getElementById('right-P1').textContent = temp;
    }
}

function resetScore() {
    updateScore('', true);
}

function setupTeams(numOfTeams = 2, tolerance = 5, manualTeams = []) {
    /* Format: [player1, player2, ..., totalStatScore] */
    const teams = (manualTeams > 0) ? manualTeams : generateTeams(numOfTeams, tolerance);

    displayCourtPlayers(teams);
    updateTotalElo();
}

function resetCourt() {
    resetScore();
    setupTeams(2, 5, [['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 0], ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']]);
}

function displayCourtPlayers(teams) {
    const left = teams[0];
    const right = teams[1];

    for (let i = 1; i < left.length; i++) {
        document.getElementById(`left-P${i}`).textContent = left[i-1];
    }
    for (let i = 1; i < right.length; i++) {
        document.getElementById(`right-P${i}`).textContent = right[i-1];
    }
}

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
                box.querySelector('.player-name').textContent =
                selectedPlayerBox.querySelector('.player-name').textContent;
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
            const originalValue = span.textContent;
            const originalId = span.id;
            const input = document.createElement('input');
            input.value = originalValue;

            span.replaceWith(input);
            input.focus();

            let saved = false; // flag to prevent double execution

            const save = () => {
                if (saved) return;
                saved = true;

                const newValue = input.value.trim() || 'P?';

                // Only replace if value actually changed
                if (newValue !== originalValue) {
                    const newSpan = document.createElement('span');
                    newSpan.className = 'player-name';
                    newSpan.id = originalId;
                    newSpan.textContent = newValue;
                    input.replaceWith(newSpan);

                    updateTotalElo();
                    console.log(`Player name changed from "${originalValue}" to "${newValue}"`);
                } else {
                    // Restore original span if unchanged
                    input.replaceWith(span);
                }
            };

            input.addEventListener('blur', save);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    save();
                }
            });
        });
    }
});

const numOfPlayers = 6;
function updateTotalElo() {
    let leftElo = 0;
    let rightElo = 0;

    for (let i = 1; i <= numOfPlayers; i++) {
        currentPlayer = document.getElementById(`left-P${i}`).textContent;
        const playerIndex = playerData.findIndex(player => player[1] === currentPlayer);
        leftElo += (playerIndex != -1) ? Number(playerData[playerIndex][2]) : 0;
    }
    for (let i = 1; i <= numOfPlayers; i++) {
        currentPlayer = document.getElementById(`right-P${i}`).textContent;
        const playerIndex = playerData.findIndex(player => player[1] === currentPlayer);
        rightElo += (playerIndex != -1) ? Number(playerData[playerIndex][2]) : 0;
    }

    document.getElementById('elos').textContent = `Elos: ${leftElo} : ${rightElo}`;
}

function getAllPlayerNames() {
    const names = [];
    document.querySelectorAll('.player-box').forEach(box => {
        const nameEl = box.querySelector('.player-name');
        if (nameEl) {
            names.push(nameEl.textContent.trim());
        }
    });
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
