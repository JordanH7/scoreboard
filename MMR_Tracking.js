let matchData = {
    'teams' : [], // ["starting serve", ["team 1"], ["team 2"]]
    'in match inputs' : [], // ["input 1", "input 2", ...]
    'player sub' : ["", "", []] // ['subbed out', 'subbed in', ['left score', 'right score']]
}
const defaultMatchData = {
    'teams': [],
    "in match inputs": [],
    "player sub": ["", "", []]
};
const savedMatches = []; // [["Date", 'matchData']]

function saveMatchReplay() {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    let minutes = date.getMinutes();
    minutes = String(minutes).length == 2 ? minutes : `0${minutes}`;
    const formatted = `${month}/${day} - ${hours}:${minutes}`;
    
    if (JSON.stringify(matchData) !== JSON.stringify(defaultMatchData)) {
        savedMatches.push([formatted, structuredClone(matchData)]);
        const matchIndex = savedMatches.length - 1;
        console.log(matchData);
        addMatchData(formatted, matchIndex);
        clearMatchData();
        console.log(formatted, savedMatches);
    }
}

function clearMatchData() {
    matchData = structuredClone(defaultMatchData);
    console.log('Cleared Match Data');
}

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

            matchData['in match inputs'].push(data);
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
addPlayerData([{value:'Jordan'}, {value:1}]);
addPlayerData([{value:'Jaimeson'}, {value:1}]);
addPlayerData([{value:'Bryson'}, {value:1}]);
addPlayerData([{value:'Joshua'}, {value:1}]);
addPlayerData([{value:'Boston'}, {value:1}]);
addPlayerData([{value:'Emerson'}, {value:1}]);
addPlayerData([{value:'Staci'}, {value:1}]);
addPlayerData([{value:'Dave'}, {value:1}]);
addPlayerData([{value:'Caleb'}, {value:1}]);
addPlayerData([{value:'Malacki'}, {value:1}]);
addPlayerData([{value:'Alice'}, {value:1}]);
addPlayerData([{value:'Noah'}, {value:1}]);
function addPlayerData(manualData) {
    const form = manualData || document.getElementById('playerData-randomizer');
    const formData = manualData || form.querySelectorAll('input');
    const list = document.getElementById('players-list');
    const delete_btn = document.createElement("button");
    console.log(formData);

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

    for (let i = 0; manualData ? i < formData.length : i < formData.length - 1; i++) {
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

    let currentPlayerArray = [
        checkbox.checked,
        playerName,
        Number(formData[1].value)
    ];
    console.log(currentPlayerArray, playerData);

    playerData.push(currentPlayerArray);
    console.log(playerData);
}

var savedTeams = [];
function saveTeam() {
    const teamsData = [[], []];
    const list = document.getElementById('teams-list');
    const delete_btn = document.createElement("button");

    for (let i = 1; i <= numOfPlayers; i++) {
        const element = document.getElementById(`left-P${i}`);
        if (element) {
            teamsData[0].push(element.textContent);
        }
    }
    
    for (let i = 1; i <= numOfPlayers; i++) {
        const element = document.getElementById(`right-P${i}`);
        if (element) {
            teamsData[1].push(element.textContent);
        }
    }

    console.log('Teams to save:', teamsData);

    const li = document.createElement('li');
    li.className = "li-button-teams";
    li.setAttribute("tabindex", "0");

    li.onclick = () => {
        console.log("List item clicked:", teamsData);
        setupTeams(2, 5, teamsData);
        page_display(false, 'all');
        page_display(true, 'randomizer-page');
    };
    
    delete_btn.textContent = "X";
    delete_btn.classList = "delete-btn delete-teams";
    
    delete_btn.onclick = (event) => {
        event.stopPropagation();
        if (confirmEvent(`Are you sure you want to delete this team?`)) {
            list.removeChild(li);

            const savedIndex = savedTeams.findIndex(team => 
                JSON.stringify(team) === JSON.stringify(teamsData)
            );
            if (savedIndex !== -1) {
                savedTeams.splice(savedIndex, 1);
                console.log("Deleted team, Remaining:", savedTeams);
            }
        }
    };

    li.appendChild(delete_btn);

    // Display Team 1 (in a div for line break)
    const team1Div = document.createElement("div");
    team1Div.className = "team-line";
    
    const team1Label = document.createElement("strong");
    team1Label.textContent = "Team 1: ";
    team1Div.appendChild(team1Label);

    for (let i = 0; i < teamsData[0].length; i++) {
        const span = document.createElement("span");
        span.innerHTML = teamsData[0][i] + (i < teamsData[0].length - 1 ? "&nbsp;|&nbsp;" : "");
        team1Div.appendChild(span);
    }
    li.appendChild(team1Div);

    const team2Div = document.createElement("div");
    team2Div.className = "team-line";
    
    const team2Label = document.createElement("strong");
    team2Label.textContent = "Team 2: ";
    team2Div.appendChild(team2Label);

    for (let i = 0; i < teamsData[1].length; i++) {
        const span = document.createElement("span");
        span.innerHTML = teamsData[1][i] + (i < teamsData[1].length - 1 ? "&nbsp;|&nbsp;" : "");
        team2Div.appendChild(span);
    }
    li.appendChild(team2Div);

    list.appendChild(li);

    let currentTeamsArray = [
        teamsData[0],
        teamsData[1]
    ];

    savedTeams.push(currentTeamsArray);
    console.log('Saved teams:', savedTeams);
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
    updateQuestionNames(team == '' ? team = 'left' : team);
    team == 'left' ? team_Left += 1 : team_Right += 1;

    if (reset) {
        team_Left = 0;
        team_Right = 0;
        prevTeam = '';
        hasServedLeft = false;
        hasServedRight = false;
    }
    document.getElementById('score').textContent = `Score: ${team_Left} : ${team_Right}`;

    if ((team_Left == 1 && team_Right == 0) || (team_Left == 0 && team_Right == 1)) {
        element = document.getElementById('serving-right');
        initialServe = window.getComputedStyle(element).visibility == 'visible' ? 'right' : 'left';
        initialServe == 'right' ? hasServedRight = true : hasServedLeft = true;
        matchData['teams'][0] = initialServe;
        matchData['teams'][1] = teams[0];
        matchData['teams'][2] = teams[1];
        console.log('serving', initialServe);
    }

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
            rotatePositions_Forward(team);
        }
    }
}

function updateQuestionNames(scoringTeam) {
    for (let i = 1; i <= numOfPlayers; i++) {
        document.getElementById(`answer${i}-question2`).textContent = document.getElementById(`${scoringTeam}-P${i}`).textContent;
    }
    scoringTeam == 'left' ? scoringTeam = 'right' : scoringTeam = 'left';
    for (let i = 1; i <= numOfPlayers; i++) {
        document.getElementById(`answer${i}-question4`).textContent = document.getElementById(`${scoringTeam}-P${i}`).textContent;
    }
}

function changeServeSide(newSide, type = 'manual', replay) {
    replay ? replay = 'replay-' : replay = '';
    if (document.getElementById(`${replay}score`).textContent == 'Score: 0 : 0' || type != 'manual') {
        document.getElementById(`${replay}serving-${newSide}`).style.visibility = 'visible';
        let side = newSide == 'left' ? 'right' : 'left';
        document.getElementById(`${replay}serving-${side}`).style.visibility = 'hidden';
        serving = newSide;
        console.log(`${replay}serving-${newSide}`);
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

function rotatePositions_Forward(team, replay) {
    replay ? replay = 'replay-' : replay = '';

    if (team == 'left') {
        const temp = document.getElementById(`${replay}left-P${numOfPlayers}`).textContent;
        for (let i = numOfPlayers; i > 1; i--) {
            document.getElementById(`${replay}left-P${i}`).textContent = document.getElementById(`${replay}left-P${i-1}`).textContent;
        }
        document.getElementById(`${replay}left-P1`).textContent = temp;
    } else if (team == 'right') {
        const temp = document.getElementById(`${replay}right-P${numOfPlayers}`).textContent;
        for (let i = numOfPlayers; i > 1; i--) {
            document.getElementById(`${replay}right-P${i}`).textContent = document.getElementById(`${replay}right-P${i-1}`).textContent;
        }
        document.getElementById(`${replay}right-P1`).textContent = temp;
    }
}

function resetScore() {
    updateScore('', true);
}

let teams = [];
function setupTeams(numOfTeams = 2, tolerance = 5, manualTeams = []) {
    /* Format: [player1, player2, ..., totalStatScore] */
    teams = (manualTeams.length > 0) ? manualTeams : generateTeams(numOfTeams, tolerance);

    displayCourtPlayers(teams);
    updateTotalElo();
}

function resetCourt() {
    resetScore();
    setupTeams(2, 5, [['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 0], ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']]);
}

function displayCourtPlayers(teams, replay) {
    const left = teams[0];
    const right = teams[1];

    replay ? replay = 'replay-' : replay = '';
    for (let i = 1; i < left.length; i++) {
        document.getElementById(`${replay}left-P${i}`).textContent = left[i-1];
    }
    for (let i = 1; i < right.length; i++) {
        document.getElementById(`${replay}right-P${i}`).textContent = right[i-1];
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
                    
                    scoreString = document.getElementById('score').textContent;
                    const parts = scoreString.split(":").map(s => s.trim());
                    const team_Left = parts[1];
                    const team_Right = parts[2];
                    matchData['player sub'].push([originalValue, newValue, [team_Left, team_Right]]);
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
function updateTotalElo(replay) {
    replay ? replay = 'replay-' : replay = '';
    let leftElo = 0;
    let rightElo = 0;

    for (let i = 1; i <= numOfPlayers; i++) {
        currentPlayer = document.getElementById(`${replay}left-P${i}`).textContent;
        const playerIndex = playerData.findIndex(player => player[1] === currentPlayer);
        leftElo += (playerIndex != -1) ? Number(playerData[playerIndex][2]) : 0;
    }
    for (let i = 1; i <= numOfPlayers; i++) {
        currentPlayer = document.getElementById(`${replay}right-P${i}`).textContent;
        const playerIndex = playerData.findIndex(player => player[1] === currentPlayer);
        rightElo += (playerIndex != -1) ? Number(playerData[playerIndex][2]) : 0;
    }

    document.getElementById(`${replay}elos`).textContent = `Elos: ${leftElo} : ${rightElo}`;
}

function addMatchData(date, index) {
    const list = document.getElementById('matches-list');
    const delete_btn = document.createElement("button");

    const li = document.createElement('li');
    li.className = "bullet_points li-button";
    li.setAttribute("tabindex", "0");

    li.onclick = () => {
        console.log("List item clicked:", li.textContent);
        setUpReplay(savedMatches[index]);
    };
    
    const span = document.createElement("span");
    span.innerHTML = date;
    li.appendChild(span);

    delete_btn.textContent = "X";
    delete_btn.classList = "delete-btn delete-match";
    
    delete_btn.onclick = (event) => {
        event.stopPropagation();
        if (confirmEvent("Are you sure you want to delete this match?")) {
            list.removeChild(li);
            savedMatches.splice(index, 1);
            console.log("Deleted match, Remaining:", savedMatches);
        }
    };

    li.appendChild(delete_btn);
    list.appendChild(li);
}

let currentLoadedMatch;
let servingSide;
function setUpReplay(savedMatch) {
    currentLoadedMatch = savedMatch;
    teams = [currentLoadedMatch[1]['teams'][1], currentLoadedMatch[1]['teams'][2]];
    displayCourtPlayers(teams, true);

    servingSide = currentLoadedMatch[1]['teams'][0];
    document.getElementById(`replay-serving-${servingSide}`).style.visibility = 'visible';
    servingSide == 'left' ? oppTeam = 'right' : oppTeam = 'left';
    document.getElementById(`replay-serving-${oppTeam}`).style.visibility = 'hidden';
    replayStep = -1;
    replayLeftScore = 0;
    replayRightScore = 0;
    document.getElementById("replay-score").textContent = `Score: ${replayLeftScore} : ${replayRightScore}`;
    updateTotalElo(true);
}

let replayStep = -1;
let replayLeftScore = 0;
let replayRightScore = 0;
let hasReplayServedLeft = false;
let hasReplayServedRight = false;
function processNextInput(forward) {
    const initialServingSide = currentLoadedMatch[1]['teams'][0];
    const inputs = structuredClone(currentLoadedMatch[1]['in match inputs']);
    inputs.unshift("");

    const pointGroups = [];
    for (let i = 1; i < inputs.length; i += 4) {
        pointGroups.push(inputs.slice(i, i + 4));
    }

    if (forward) replayStep++;
    else replayStep--;

    if (replayStep < -1) {
        replayStep = pointGroups.length - 1;
    }
    if (replayStep >= pointGroups.length) {
        replayStep = -1;
    }
    console.log(replayStep);

    servingSide = initialServingSide;
    replayLeftScore = 0;
    replayRightScore = 0;
    hasReplayServedLeft = false;
    hasReplayServedRight = false;
    initialServingSide == 'left' ? hasReplayServedLeft = true : hasReplayServedRight = true;

    console.log(initialServingSide);
    changeServeSide(initialServingSide, 'auto', true);
    displayCourtPlayers(teams, true);

    for (let i = 0; i <= replayStep; i++) {
        const scoringTeam = pointGroups[i][0] === "Team1" ? "left" : "right";

        console.log(scoringTeam, servingSide, hasReplayServedLeft, hasReplayServedRight);
        if (scoringTeam !== servingSide) {
            servingSide = scoringTeam;
    
            if (scoringTeam === 'left' && !hasReplayServedLeft) {
                hasReplayServedLeft = true;
            } else if (scoringTeam === 'right' && !hasReplayServedRight) {
                hasReplayServedRight = true;
            } else {
                rotatePositions_Forward(scoringTeam, true);
            }
        }

        scoringTeam === "left" ? replayLeftScore++ : replayRightScore++;
        changeServeSide(scoringTeam, 'auto', true);
    }

    document.getElementById("replay-score").textContent = `Score: ${replayLeftScore} : ${replayRightScore}`;

    updateTotalElo(true);
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
